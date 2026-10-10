const CACHE_NAME='harz-browser-v16';
const SUBRES='harz-subres-v1';
const RES_LIMIT=2*1024*1024;
const SEALS_NAME='harz-saved-seals-v1';
const SHELL=['/','/manifest.json','/icon.svg','/icon.png','/doc'];
const MAXP=60;
const OFFLINE_HTML='<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font-family:system-ui,sans-serif;background:#f0f2f5;color:#1c1e21;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;text-align:center}button{margin-top:14px;background:#1877f2;border:none;color:#fff;padding:10px 18px;border-radius:8px;font-size:14px;cursor:pointer}</style></head><body><div><div style="font-size:44px">&#128251;</div><h2>Offline</h2><p style="color:#65676b;font-size:14px">This page is not saved on this phone yet.<br>Open a page online and tap Save (💾) to keep it offline forever — saved pages are protected and never auto-deleted.</p><button onclick="parent.postMessage({harzSaved:1},\'*\')">Open saved pages</button></div></body></html>';
let SIM_OFFLINE=false;
async function sha256Hex(buf){
  const h=await crypto.subtle.digest('SHA-256',buf);
  return [...new Uint8Array(h)].map(b=>b.toString(16).padStart(2,'0')).join('');
}
async function sealKey(url){ return '/__seal/'+url; }
async function getSeal(url){
  try{
    const c=await caches.open(SEALS_NAME);
    const r=await c.match(await sealKey(url));
    return r?await r.json():null;
  }catch(e){ return null; }
}
async function putSeal(url,manifest){
  const c=await caches.open(SEALS_NAME);
  await c.put(await sealKey(url),new Response(JSON.stringify(manifest),{headers:{'Content-Type':'application/json'}}));
}
async function listRefs(html,baseUrl){
  const tags=html.match(/<(?:img|script|iframe|source|video|audio|link)\b[^>]*>/gi)||[];
  const out=[]; const seen=new Set();
  for(const tag of tags){
    if(/^<link/i.test(tag)&&!/\brel\s*=\s*["'](?:stylesheet|icon|preload|apple-touch-icon)["']/i.test(tag))continue;
    const mm=tag.match(/\b(?:src|href)\s*=\s*["']([^"']+)["']/i);
    if(!mm)continue;
    const before=tag.slice(Math.max(0,mm.index-2),mm.index);
    if(/[:@]$/.test(before)||before.endsWith('x-'))continue;
    const raw=mm[1];
    if(!raw||raw.startsWith('data:')||raw.startsWith('#'))continue;
    if(/^([a-z]+):/i.test(raw)&&!/^(https?):/i.test(raw))continue;
    let abs; try{abs=new URL(raw,baseUrl).toString()}catch(e){continue}
    if(!/^https?:/i.test(abs))continue;
    if(/\.harz\.workers\.dev/.test(abs))continue;
    if(seen.has(abs))continue; seen.add(abs);
    out.push({raw,abs});
  }
  return out;
}
async function countExternalRefs(html){
  return (await listRefs(html,'https://harz.invalid/')).length;
}
async function fetchRes(absUrl){
  let lastErr='unknown';
  for(let attempt=0;attempt<3;attempt++){
    try{
      const ac=new AbortController();const tm=setTimeout(function(){try{ac.abort()}catch(e){}},45000);
      const r=await fetch('/res?url='+encodeURIComponent(absUrl),{credentials:'omit',signal:ac.signal});
      clearTimeout(tm);
      if(!r.ok){lastErr='HTTP '+r.status;}
      else{
        const buf=await r.arrayBuffer();
        if(buf.byteLength>RES_LIMIT){return {ok:false,status:'too-large'};}
        const ct=r.headers.get('content-type')||'application/octet-stream';
        return {ok:true,buf,ct};
      }
    }catch(e){lastErr=(e&&(e.name==='TimeoutError'||e.name==='AbortError'))?'timeout 45s':String(e&&e.message||e).slice(0,80);}
    if(attempt<2)await new Promise(rs=>setTimeout(rs,1500+attempt*2500));
  }
  return {ok:false,status:lastErr};
}
async function sealPage(reqUrl){
  try{
    const c=await caches.open(CACHE_NAME);
    const pageReq=new Request('/page?url='+encodeURIComponent(reqUrl));
    let hit=await c.match(pageReq);
    if(!hit){
      const fr=await fetch(pageReq);
      if(fr&&fr.ok){ await c.put(pageReq,fr.clone()); hit=await c.match(pageReq); }
    }
    if(!hit) return {ok:false,error:'page not loaded yet — open it first, then Save'};
    const html=await hit.text();
    const buf=new TextEncoder().encode(html);
    const sha=await sha256Hex(buf);
    const sub=await caches.open(SUBRES);
    const refs=await listRefs(html,reqUrl);
    const resources=[];
    let htmlOut=html;
    let progDone=0;
    const progPost=async function(){
      try{const cs=await self.clients.matchAll();
      cs.forEach(cl=>cl.postMessage({harzCaptureProgress:{url:reqUrl,done:progDone,total:refs.length,captured:resources.filter(r=>r.status==='captured').length}}));}catch(e){}
    };
    // capture top-level refs, 4 at a time
    const chunks=[]; for(let i=0;i<refs.length;i+=4)chunks.push(refs.slice(i,i+4));
    for(const chunk of chunks){
      await Promise.all(chunk.map(async ref=>{
        try{
          const fr=await fetchRes(ref.abs);
          progDone++;progPost();
          if(!fr.ok){resources.push({url:ref.abs,status:'failed',detail:'fetch failed: '+String(fr.status)+' (3 attempts)'});return;}
          if(/text\/html/i.test(fr.ct)){resources.push({url:ref.abs,status:'wrong-type',detail:'returned HTML, not a resource'});return;}
          const rsha=await sha256Hex(fr.buf);
          let bodyOut=fr.buf;
          if(/text\/css/i.test(fr.ct)){
            const cssText=new TextDecoder().decode(fr.buf);
            const urls=[...new Set((cssText.match(/url\(\s*["']?[^)"']+?["']?\s*\)/gi)||[]).map(u=>u.replace(/^url\(\s*["']?/,'').replace(/["']?\s*\)$/,'')))];
            let cssOut=cssText;
            for(const ru of urls){
              if(!ru||ru.startsWith('data:'))continue;
              let rabs; try{rabs=new URL(ru,ref.abs).toString()}catch(e){continue}
              if(!/^https?:/i.test(rabs))continue;
              try{
                const fr2=await fetchRes(rabs);
                if(!fr2.ok||/text\/html/i.test(fr2.ct)){resources.push({url:rabs,status:'failed',detail:(fr2.ok?'returned HTML, not a resource':'fetch failed: '+String(fr2.status)+' (3 attempts)')});continue;}
                const sha2=await sha256Hex(fr2.buf);
                await sub.put(new Request('/res?url='+encodeURIComponent(rabs)),new Response(fr2.buf,{headers:{'Content-Type':fr2.ct}}));
                resources.push({url:rabs,sha256:sha2,bytes:fr2.buf.byteLength,ct:fr2.ct,status:'captured'});
                cssOut=cssOut.split(ru).join('/res?url='+encodeURIComponent(rabs));
              }catch(e){resources.push({url:rabs,status:'failed',detail:String(e)});}
            }
            bodyOut=new TextEncoder().encode(cssOut);
          }
          await sub.put(new Request('/res?url='+encodeURIComponent(ref.abs)),new Response(bodyOut,{headers:{'Content-Type':fr.ct}}));
          resources.push({url:ref.abs,sha256:await sha256Hex(bodyOut),bytes:bodyOut.length,ct:fr.ct,status:'captured'});
          const proxy=self.location.origin+'/res?url='+encodeURIComponent(ref.abs);
          htmlOut=htmlOut.split('"'+ref.raw+'"').join('"'+proxy+'"').split("'"+ref.raw+"'").join("'"+proxy+"'");
        }catch(e){progDone++;progPost();resources.push({url:ref.abs,status:'failed',detail:'error: '+String(e&&e.message||e).slice(0,80)});}
      }));
    }
    const captured=resources.filter(r=>r.status==='captured').length;
    // store offline-optimized copy (original /page entry and its seal hash stay untouched)
    const offBuf=new TextEncoder().encode(htmlOut);
    const offSha=await sha256Hex(offBuf);
    const offHeaders={};
    try{const h=hit.headers;h.forEach((v,k)=>{if(!/content-encoding|content-length/i.test(k))offHeaders[k]=v});}catch(e){}
    if(!offHeaders['Content-Type'])offHeaders['Content-Type']='text/html; charset=utf-8';
    await c.put(new Request('/offline?url='+encodeURIComponent(reqUrl)),new Response(offBuf,{headers:offHeaders}));
    const manifest={harz:'G2',version:2,url:reqUrl,saved_at:new Date().toISOString(),sha256:sha,bytes:buf.length,protected:true,ext_refs:refs.length,resources:resources,resources_captured:captured,resources_total:resources.length,rewritten_sha256:offSha,rewritten_bytes:offBuf.length};
    await putSeal(reqUrl,manifest);
    return {ok:true,sha256:sha,bytes:buf.length,saved_at:manifest.saved_at,ext_refs:refs.length,captured:captured,resources_total:resources.length};
  }catch(e){ return {ok:false,error:String(e)}; }
}async function sealStatus(reqUrl){
  const seal=await getSeal(reqUrl);
  if(!seal) return {saved:false};
  try{
    const c=await caches.open(CACHE_NAME);
    if(seal.rewritten_sha256){
      // v2 seal: the artifact under protection is the rewritten offline copy
      const off=await c.match(new Request('/offline?url='+encodeURIComponent(reqUrl)));
      if(!off) return {saved:true,verified:false,reason:'sealed offline copy missing — reopen online and Save again',seal};
      const offHtml=await off.text();
      const offSha=await sha256Hex(new TextEncoder().encode(offHtml));
      const verified=(offSha===seal.rewritten_sha256);
      if(!verified) return {saved:true,verified:false,reason:'sealed offline copy differs from its seal — possible corruption or tampering; Save again to re-seal',seal,resources_total:seal.resources_total||0};
    }else{
      const hit=await c.match(new Request('/page?url='+encodeURIComponent(reqUrl)));
      if(!hit) return {saved:true,verified:false,reason:'cached copy gone — reopen online and Save again',seal};
      const html=await hit.text();
      const sha=await sha256Hex(new TextEncoder().encode(html));
      const verified=(sha===seal.sha256);
      if(!seal.resources){
        return {saved:true,verified,sha256:seal.sha256,bytes:seal.bytes,saved_at:seal.saved_at,capture:1,note:'pre-G1 seal: no resource capture — open online and Save again to capture'};
      }
    }
    const verified=true;
    // verify captured resources against their seals
    const sub=await caches.open(SUBRES);
    let verifiedRes=0; const missing=[];
    for(const r of seal.resources){
      if(r.status!=='captured'){missing.push(r.url);continue;}
      const rh=await sub.match(new Request('/res?url='+encodeURIComponent(r.url)));
      if(!rh){missing.push(r.url);continue;}
      const rb=await rh.arrayBuffer();
      const rs=await sha256Hex(rb);
      if(rs===r.sha256)verifiedRes++;else missing.push(r.url);
    }
    return {saved:true,verified,sha256:seal.sha256,bytes:seal.bytes,saved_at:seal.saved_at,
      captured:seal.resources_captured,total:seal.resources_total,
      verifiedRes,missing:missing.slice(0,5),missingCount:missing.length,
      reason:(verified?null:'cached page HTML differs from seal — the site changed or the copy was refreshed after Save; Save again to re-seal'),
      complete:(missing.length===0),note:(missing.length===0?'complete capture: all resources captured and verified':missing.length+' resource(s) not available offline')};
  }catch(e){ return {saved:true,verified:false,reason:String(e),seal}; }
}async function sealList(){
  try{
    const c=await caches.open(SEALS_NAME);
    const keys=await c.keys();
    const out=[];
    for(const k of keys){
      const r=await c.match(k);
      if(r){ try{ out.push(await r.json()); }catch(e){} }
    }
    return out;
  }catch(e){ return []; }
}
async function unseal(reqUrl){
  try{
    const c=await caches.open(SEALS_NAME);
    await c.delete(await sealKey(reqUrl));
    return {ok:true};
  }catch(e){ return {ok:false,error:String(e)}; }
}
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(names=>Promise.all(names.filter(n=>n!==CACHE_NAME&&n!==SEALS_NAME&&n!==SUBRES).map(n=>caches.delete(n)))).then(()=>self.clients.claim()))});
async function noteSave(c,reqUrl){
  try{
    const idxR=await c.match('/__page-index');
    let idx=idxR?await idxR.json():[];
    const seals=await sealList();
    const protectedUrls=new Set(seals.map(s=>s.url));
    idx=idx.filter(u=>u!==reqUrl);
    idx.push(reqUrl);
    while(idx.length>MAXP){
      const evict=idx.shift();
      if(protectedUrls.has(evict))continue;
      await c.delete(new Request('/page?url='+encodeURIComponent(evict)));
      try{const q=new URL(evict,self.location.origin).searchParams.get('url');if(q)await c.delete(new Request(q));}catch(e){}
    }
    await c.put('/__page-index',new Response(JSON.stringify(idx),{headers:{'Content-Type':'application/json'}}));
  }catch(e){}
}
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(u.pathname==='/doc'){
    e.respondWith((async()=>{
      const c=await caches.open(CACHE_NAME);
      try{
        const r=await fetch(e.request);
        if(r&&r.ok){try{await c.put(new Request(e.request.url),r.clone())}catch(err){}}
        return r;
      }catch(err){
        const hit=(await c.match(e.request.url))||(await c.match('/doc'));
        if(hit)return hit;
        return new Response(OFFLINE_HTML,{headers:{'Content-Type':'text/html; charset=utf-8'}});
      }
    })());
    return;
  }
  if(u.pathname==='/res'){
    e.respondWith((async()=>{
      try{
        if(SIM_OFFLINE)throw new Error('sim-offline');
        const r=await fetch(e.request);
        return r;
      }catch(err){
        try{
          const sub=await caches.open(SUBRES);
          const hit=await sub.match(e.request.url)||await sub.match(e.request);
          if(hit)return hit;
        }catch(e2){}
        return new Response('',{status:404});
      }
    })());
    return;
  }
  if(u.pathname==='/page'){
    e.respondWith((async()=>{
      try{
        if(SIM_OFFLINE)throw new Error('sim-offline');
        const r=await fetch(e.request);
        if(r&&r.ok){
          try{const c=await caches.open(CACHE_NAME);const key=new Request(e.request.url);await c.put(key,r.clone());await noteSave(c,'/page?url='+u.searchParams.get('url'));}catch(err){}
        }
        return r;
      }catch(err){
        try{
          const c=await caches.open(CACHE_NAME);
          const target=u.searchParams.get('url');
          if(target){
            const off=await c.match(new Request('/offline?url='+encodeURIComponent(target)));
            if(off)return off;
          }
          const hit=await c.match(e.request);
          if(hit)return hit;
        }catch(err2){}
        return new Response(OFFLINE_HTML,{headers:{'Content-Type':'text/html; charset=utf-8'}});
      }
    })());
    return;
  }
  if(u.origin!==self.location.origin&&/\.(workers|pages)\.dev$/.test(u.hostname)&&e.request.method==='GET'){
    e.respondWith((async()=>{
      const c=await caches.open(CACHE_NAME);
      const key=new Request(e.request.url);
      try{
        const r=await fetch(e.request);
        if(r&&(r.ok||r.type==='opaque')){
          try{await c.put(key,r.clone());if(e.request.mode==='navigate'||e.request.destination==='document'||e.request.destination==='iframe'){await noteSave(c,'/page?url='+encodeURIComponent(e.request.url));}}catch(err){}
          return r;
        }
      }catch(err){
        const hit=await c.match(key);
        if(hit)return hit;
        if(e.request.destination==='document'||e.request.destination==='iframe'||e.request.mode==='navigate')return new Response(OFFLINE_HTML,{headers:{'Content-Type':'text/html; charset=utf-8'}});
        return Response.error();
      }
    })());
    return;
  }
  e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)).then(r=>r||caches.match('/')));
});
self.addEventListener('message',e=>{
  if(e.data&&e.data.type==='sim-offline'){
    SIM_OFFLINE=!!e.data.on;
    if(e.ports&&e.ports[0]){try{e.ports[0].postMessage({sim:SIM_OFFLINE})}catch(err){}}
    return;
  }
  if(e.data&&e.data.type==='save-page'&&e.data.url){
    e.waitUntil((async()=>{
      const res=await sealPage(e.data.url);
      if(e.ports&&e.ports[0])e.ports[0].postMessage(res);
      const cs=await self.clients.matchAll();
      cs.forEach(cl=>cl.postMessage({harzSealSaved:res,url:e.data.url}));
    })());
    return;
  }
  if(e.data&&e.data.type==='saved-status'&&e.data.url&&e.ports&&e.ports[0]){
    e.waitUntil(sealStatus(e.data.url).then(st=>e.ports[0].postMessage(st)));
    return;
  }
  if(e.data&&e.data.type==='unseal'&&e.data.url&&e.ports&&e.ports[0]){
    e.waitUntil(unseal(e.data.url).then(st=>e.ports[0].postMessage(st)));
    return;
  }
  if(e.data&&e.data.type==='seal-list'&&e.ports&&e.ports[0]){
    e.waitUntil((async()=>{
      const seals=await sealList();
      const withStatus=[];
      for(const s of seals){ withStatus.push(Object.assign({},s,{status:await sealStatus(s.url)})); }
      e.ports[0].postMessage({seals:withStatus});
    })());
    return;
  }
  if(e.data&&e.data.type==='add-saved'&&e.data.url){
    (async()=>{
      try{
        const c=await caches.open(CACHE_NAME);
        const idxR=await c.match('/__page-index');
        let idx=idxR?await idxR.json():[];
        idx=idx.filter(x=>x!==e.data.url);
        idx.push(e.data.url);
        await c.put('/__page-index',new Response(JSON.stringify(idx),{headers:{'Content-Type':'application/json'}}));
      }catch(err){}
    })();
    return;
  }
  if(e.data&&e.data.type==='list'&&e.ports&&e.ports[0]){
    (async()=>{
      try{
        const c=await caches.open(CACHE_NAME);
        const idxR=await c.match('/__page-index');
        let idx=idxR?await idxR.json():[];
        const urls=idx.map(x=>{try{return new URL(x,self.location.origin).searchParams.get('url')||x}catch(err){return x}});
        e.ports[0].postMessage({urls:urls});
      }catch(err){e.ports[0].postMessage({urls:[]});}
    })();
    return;
  }
});

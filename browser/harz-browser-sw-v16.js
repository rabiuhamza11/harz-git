const CACHE_NAME='harz-browser-v16';
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
async function countExternalRefs(html){
  try{
    const tags=html.match(/<(?:img|script|iframe|source|video|audio)\b[^>]*\bsrc\s*=\s*["'][^"']+["']|<link\b[^>]*\brel\s*=\s*["'](?:stylesheet|icon|preload|apple-touch-icon)["'][^>]*\bhref\s*=\s*["'][^"']+["']|<link\b[^>]*\bhref\s*=\s*["'][^"']+["'][^>]*\brel\s*=\s*["'](?:stylesheet|icon|preload|apple-touch-icon)["']/gi)||[];
    let n=0;
    tags.forEach(tag=>{
      const v=(tag.match(/\b(?:src|href)\s*=\s*["']([^"']+)["']/i)||[])[1]||'';
      if(!v||v.startsWith('data:'))return;
      if(/\.harz\.workers\.dev/.test(v))return;
      if(/^#|^(mailto|tel|javascript):/i.test(v))return;
      n++;
    });
    return n;
  }catch(e){ return 0; }
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
    const extRefs=await countExternalRefs(html);
    const manifest={harz:'G2',version:16,url:reqUrl,saved_at:new Date().toISOString(),sha256:sha,bytes:buf.length,protected:true,ext_refs:extRefs,resources_captured:0};
    await putSeal(reqUrl,manifest);
    return {ok:true,sha256:sha,bytes:buf.length,saved_at:manifest.saved_at,ext_refs:extRefs};
  }catch(e){ return {ok:false,error:String(e)}; }
}
async function sealStatus(reqUrl){
  const seal=await getSeal(reqUrl);
  if(!seal) return {saved:false};
  try{
    const c=await caches.open(CACHE_NAME);
    const hit=await c.match(new Request('/page?url='+encodeURIComponent(reqUrl)));
    if(!hit) return {saved:true,verified:false,reason:'cached copy gone — reopen online and Save again',seal};
    const html=await hit.text();
    const sha=await sha256Hex(new TextEncoder().encode(html));
    const verified=(sha===seal.sha256);
    return {saved:true,verified,sha256:seal.sha256,bytes:seal.bytes,saved_at:seal.saved_at,ext_refs:seal.ext_refs||0,resources_captured:seal.resources_captured||0,reason:verified?null:'hash mismatch — cached copy differs from seal'};
  }catch(e){ return {saved:true,verified:false,reason:String(e),seal}; }
}
async function sealList(){
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
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(names=>Promise.all(names.filter(n=>n!==CACHE_NAME&&n!==SEALS_NAME).map(n=>caches.delete(n)))).then(()=>self.clients.claim()))});
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

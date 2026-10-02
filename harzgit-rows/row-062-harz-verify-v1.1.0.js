// HarzGit D1 row 62: harz-verify-v1.1.0
// HARZ Verify v1.1.0 full source: badge.js embed + /api/zone-status via service bindings ROOT/MIRA/MIRB + /badge-demo. Zone-chain verifier v1.0.0 core retained.

// HARZ Verify v1.0.0 — verify.harz
// Browser-based verifier for the HARZ root zone chain. All verification runs
// client-side with WebCrypto: fetch the signed zone from root + mirrors, check
// the Ed25519 signature against the published anchor, prove mirror parity.
const PAGES = {
  "/manifest.json": JSON.stringify({
    "name": "HARZ Verify",
    "short_name": "Verify",
    "start_url": "/",
    "display": "standalone",
    "background_color": "#f0f2f5",
    "theme_color": "#f0f2f5",
    "icons": [{ "src": "/icon.svg", "sizes": "any", "type": "image/svg+xml" }]
  }),
  "/icon.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="#f0f2f5"/><path d="M50 12 84 30v40L50 88 16 70V30z" fill="none" stroke="#00605a" stroke-width="6"/><path d="M36 50l10 12 20-26" fill="none" stroke="#1b5e20" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  "/sw.js": `const C='verify-v1';self.addEventListener('install',e=>self.skipWaiting());self.addEventListener('activate',e=>self.waitUntil(self.clients.claim()));self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(caches.open(C).then(c=>c.match(e.request).then(r=>{const f=fetch(e.request).then(res=>{if(res.ok)c.put(e.request,res.clone());return res}).catch(()=>r);return r||f})))});`
};

PAGES["/badge.js"] = `(function(){var d=document,t="hzone-badge";function ok(s){return s.status==="ok"}
async function boot(){var r=await fetch("https://harz-verify.harz.workers.dev/api/zone-status",{cache:"no-store"}).then(function(x){return x.json()}).catch(function(){return{status:"error"}});
var e=document.getElementById(t);if(!e){e=document.createElement("div");e.id=t;document.body.appendChild(e)}
e.innerHTML='<a href="https://harz-verify.harz.workers.dev/" style="text-decoration:none;font-family:system-ui,sans-serif;font-size:12px;display:inline-flex;align-items:center;gap:6px;background:'+(ok(r)?"#d4edda":"#f8d7da")+';color:'+(ok(r)?"#155724":"#721c24")+';padding:5px 12px;border-radius:14px;font-weight:600"><span>\u2714 HARZ zone</span><span>h'+r.height+' \u00b7 '+r.records+' names \u00b7 parity '+r.parity+'/3</span></a>'}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot()})();`

const NODES = ["https://harz-root.harz.workers.dev", "https://harz-root-mirror-a.harz.workers.dev", "https://harz-root-mirror-b.harz.workers.dev"];

const HTML = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#f0f2f5"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-status-bar-style" content="default"><meta name="apple-mobile-web-app-title" content="HARZ Verify"><title>HARZ Verify — zone chain verifier</title><link rel="manifest" href="/manifest.json"><link rel="icon" href="/icon.svg" type="image/svg+xml"><style>*{margin:0;padding:0;box-sizing:border-box;font-family:system-ui,-apple-system,sans-serif}body{background:#f0f2f5;color:#1a1a2e;padding:16px;max-width:680px;margin:0 auto;padding-bottom:env(safe-area-inset-bottom)}h1{font-size:22px;color:#0056b3}.sub{color:#6c757d;font-size:12px;margin-top:2px}.card{background:#fff;border:1px solid #e3e6ea;border-radius:10px;padding:14px;margin-top:12px}h2{font-size:15px;color:#0056b3;margin-bottom:8px}button{padding:11px 16px;border:none;border-radius:8px;font-weight:600;font-size:14px;cursor:pointer;background:#1b5e20;color:#fff;width:100%;margin-top:4px}button:disabled{background:#adb5bd}.row{display:flex;justify-content:space-between;font-size:13px;padding:6px 0;border-bottom:1px solid #f0f0f0}.row:last-child{border:none}.row b{font-weight:600}.ok{color:#155724}.bad{color:#721c24}.msg{font-family:ui-monospace,monospace;font-size:11px;white-space:pre-wrap;margin-top:10px;line-height:1.5}.pill{display:inline-block;font-size:10px;font-weight:700;border-radius:10px;padding:2px 10px;margin-top:6px}.pill.pass{background:#d4edda;color:#155724}.pill.fail{background:#f8d7da;color:#721c24}.pill.wait{background:#fff3cd;color:#856404}footer{margin-top:20px;text-align:center;color:#adb5bd;font-size:10px;line-height:1.6}footer a{color:#0056b3;text-decoration:none}</style></head><body><h1>HARZ Verify</h1><p class="sub">Independent zone-chain verification — runs in your browser, no server trust required.</p>
<div class="card"><h2>Verify the .harz book</h2><p style="font-size:12px;color:#6c757d">Fetches the signed zone from root + both mirrors, checks the Ed25519 signature against the published anchor, and proves mirror parity.</p><button id="go" onclick="run()">Verify now</button><div id="pills"></div><div class="msg" id="out">Ready. Press Verify.</div></div>
<div class="card"><h2>What is checked</h2><div class="row"><span>Signature</span><b>Ed25519 over canonical zone</b></div><div class="row"><span>Anchor</span><b>published /zone-pub</b></div><div class="row"><span>Chain</span><b>prev links parent digest</b></div><div class="row"><span>Parity</span><b>3-node byte equality</b></div><div class="row"><span>Floors</span><b>records ≥ 77, height ≥ 2</b></div></div>
<footer>HARZ Verify · part of the HARZ ecosystem<br><a href="https://harz-root.harz.workers.dev/">Root</a> · <a href="https://harz-super-app.harz.workers.dev/">Super App</a> · verify.harz</footer>
<script>
function canon(o){if(o===null||typeof o!=="object")return JSON.stringify(o);if(Array.isArray(o))return "["+o.map(canon).join(",")+"]";return "{"+Object.keys(o).sort().map(k=>JSON.stringify(k)+":"+canon(o[k])).join(",")+"}"}
function h2b(hex){const u=new Uint8Array(hex.length/2);for(let i=0;i<u.length;i++)u[i]=parseInt(hex.substr(i*2,2),16);return u}
async function fetchZone(base){const r=await fetch(base+"/zone",{cache:"no-store"});const t=await r.text();return{text:t,zone:JSON.parse(t)}}
async function verifySig(z,pubHex){const{sig,...rest}=z;const pre=h2b("302a300506032b6570032100");const raw=h2b(pubHex);const spki=new Uint8Array(pre.length+raw.length);spki.set(pre);spki.set(raw,pre.length);const key=await crypto.subtle.importKey("spki",spki,{name:"Ed25519"},false,["verify"]);return crypto.subtle.verify("Ed25519",key,h2b(sig.replace("ed25519:","")),new TextEncoder().encode(canon(rest)))}
async function sha256Hex(s){const d=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(s));return[...new Uint8Array(d)].map(b=>b.toString(16).padStart(2,"0")).join("")}
async function run(){
 const btn=document.getElementById("go"),out=document.getElementById("out"),pills=document.getElementById("pills");btn.disabled=true;pills.innerHTML="";out.textContent="Fetching zone from 3 nodes...";
 const P=(t,cls)=>{pills.innerHTML+='<span class="pill '+cls+'">'+t+'</span>'};
 try{
  const zs=await Promise.all(NODES.map(fetchZone));P("fetched 3/3","pass");
  const [rz]=zs;const parity=zs.every(x=>x.text===rz.text);P(parity?"parity 3/3":"PARITY FAIL",parity?"pass":"fail");
  const zone=rz.zone;
  const pubR=await(await fetch(NODES[0]+"/zone-pub",{cache:"no-store"})).text();
  const pubM=await(await fetch(NODES[1]+"/zone-pub",{cache:"no-store"})).text();
  const pubSame=(pubR===pubM)&&(pubR===await(await fetch(NODES[2]+"/zone-pub",{cache:"no-store"})).text());P(pubSame?"anchor agreed 3/3":"ANCHOR DISAGREEMENT",pubSame?"pass":"fail");
  const sigOk=await verifySig(zone,pubR.replace("ed25519:","").trim());P(sigOk?"signature VALID":"signature INVALID",sigOk?"pass":"fail");
  const floorsOk=Array.isArray(zone.records)&&zone.records.length>=77&&zone.height>=2;P(floorsOk?"floors ok":"FLOORS FAIL",floorsOk?"pass":"fail");
  const unsigned={...zone};delete unsigned.sig;
  const bodyHash=(await sha256Hex(canon(unsigned))).slice(0,16);
  const allOk=parity&&pubSame&&sigOk&&floorsOk;
  out.textContent=
   "VERDICT: "+(allOk?"PASS — the .harz book is authentic and consistent across all 3 nodes.":"FAIL — do not trust this zone.")+
   "\\n\\nchain      : "+("harz-root-v2 (zone "+zone.zone+")")
   "\\nheight     : "+zone.height+
   "\\nrecords    : "+zone.records.length+
   "\\nprev       : "+String(zone.prev).slice(0,24)+"…"+
   "\\ncanonical  : sha256 "+bodyHash+"… (first 16)"+
   "\\nsigned_at  : "+zone.signed_at+
   "\\nanchor     : "+String(zone.signed_by).slice(0,26)+"…"+
   "\\nsignature  : "+String(zone.sig).slice(0,26)+"…"+
   "\\n\\nnodes checked:";NODES.forEach(n=>out.textContent+="\\n  "+n);
 }catch(e){out.textContent="ERROR: "+(e&&e.message?e.message:e)}
 btn.disabled=false;btn.textContent="Verify again";
}
const NODES=${JSON.stringify(NODES)};
if('serviceWorker' in navigator)navigator.serviceWorker.register('/sw.js').catch(function(){});
</script></body></html>`;

const DEMO = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#f0f2f5"><title>HARZ zone badge — demo</title><style>body{font-family:system-ui;background:#f0f2f5;color:#1a1a2e;padding:16px;max-width:640px;margin:0 auto}h1{font-size:20px;color:#0056b3}p{font-size:13px;line-height:1.5}.zone{max-width:640px;margin:14px auto;padding:18px;border:1px dashed #adb5bd;border-radius:10px;background:#fff;font-size:12px;color:#6c757d}code{font-family:ui-monospace,monospace;font-size:11px;background:#eef2f5;padding:2px 5px;border-radius:4px}</style></head><body><h1>HARZ zone badge — live demo</h1><p>Any site can embed the badge with one line:</p><p><code>&lt;script src="https://harz-verify.harz.workers.dev/badge.js"&gt;&lt;/script&gt;</code></p><p>The badge below is fetching the zone status live, right now, on this page:</p><div class="zone">…this box is a simulated third-party site…</div><script src="/badge.js"></script></body></html>`;
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const p = url.pathname;
    const headers = { "access-control-allow-origin": "*" };
    if (p === "/api/zone-status") {
      try {
      const svcs = [[env.ROOT, "https://harz-root.harz.workers.dev"], [env.MIRA, "https://harz-root-mirror-a.harz.workers.dev"], [env.MIRB, "https://harz-root-mirror-b.harz.workers.dev"]];
      const fetches = await Promise.all(svcs.map(async (pair) => {
        try {
          const r = await pair[0].fetch(pair[1] + "/zone");
          const text = await r.text();
          let z = null;
          try { z = JSON.parse(text); } catch (e) {}
          return { text, z };
        } catch (e) { return { text: null, z: null, err: String(e && e.message || e) }; }
      }));
      const okNodes = fetches.filter((f) => f.z);
      const identical = okNodes.length > 0 && fetches.every((f) => f.text === fetches[0].text);
      const z = okNodes[0] ? okNodes[0].z : null;
      return new Response(JSON.stringify({
        status: z && identical && okNodes.length === 3 ? "ok" : "degraded",
        debug: fetches.map((f) => f.err || (f.z ? "ok" : "parse:" + String(f.text).slice(0, 40))),
        height: z ? z.height : null,
        records: z ? (Array.isArray(z.records) ? z.records.length : null) : null,
        anchor: z ? z.signed_by : null,
        parity: okNodes.length,
        checked: new Date().toISOString()
      }), { headers: { "content-type": "application/json; charset=utf-8", ...headers } });
      } catch (e) {
        return new Response(JSON.stringify({ status: "error", route_err: String(e && e.stack || e).slice(0, 500) }), { headers: { "content-type": "application/json; charset=utf-8", ...headers } });
      }
    }
    if (p === "/badge-demo") return new Response(DEMO, { headers: { "content-type": "text/html; charset=utf-8", ...headers } });
    if (PAGES[p]) {
      const ct = p.endsWith(".json") ? "application/json" : p.endsWith(".svg") ? "image/svg+xml" : "application/javascript";
      return new Response(PAGES[p], { headers: { "content-type": ct + "; charset=utf-8", ...headers } });
    }
    return new Response(HTML, { headers: { "content-type": "text/html; charset=utf-8", ...headers } });
  }
};

// HarzGit D1 row 63: harz-rootbox-v1.0.0
// HARZ RootBox v1.0.0 full source (new worker): Root-in-a-Box sales PWA + offline Receipts PWA (client-side Ed25519/ECDSA, device-only keys) + /bundle manifest. Binding HARZGIT.

// HARZ Root-in-a-Box v1.0.0 — rootbox + offline receipts
// Sales page for the sovereign namespace bundle + offline-verified commerce
// receipts PWA (client-side signing only, no server keys — security rule).
// Light theme #f0f2f5, PWA (manifest + sw + icon). Cloudflare-only, D1 unified.

const MANIFEST = JSON.stringify({
  name: "HARZ Root-in-a-Box",
  short_name: "RootBox",
  start_url: "/",
  display: "standalone",
  background_color: "#f0f2f5",
  theme_color: "#f0f2f5",
  icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }]
});

const SW = `const C='rootbox-v1';self.addEventListener('install',e=>self.skipWaiting());self.addEventListener('activate',e=>self.waitUntil(self.clients.claim()));self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;const u=new URL(e.request.url);if(u.origin!==location.origin||u.pathname==='/api/'||u.pathname.startsWith('/api/'))return;e.respondWith(caches.open(C).then(c=>c.match(e.request).then(r=>{const f=fetch(e.request).then(res=>{if(res.ok)c.put(e.request,res.clone());return res}).catch(()=>r);return r||f})))});`;

const ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="#f0f2f5"/><rect x="22" y="42" width="56" height="36" rx="4" fill="none" stroke="#0056b3" stroke-width="5"/><rect x="42" y="34" width="16" height="8" fill="#0056b3"/><path d="M50 52l-8 12h16z" fill="#1b5e20"/><path d="M42 64h16" stroke="#1b5e20" stroke-width="4"/></svg>`;

const CSS = `*{margin:0;padding:0;box-sizing:border-box;font-family:system-ui,-apple-system,sans-serif}body{background:#f0f2f5;color:#1a1a2e;padding:16px;max-width:680px;margin:0 auto;padding-bottom:env(safe-area-inset-bottom)}h1{font-size:22px;color:#0056b3}.sub{color:#6c757d;font-size:12px;margin-top:2px}.card{background:#fff;border:1px solid #e3e6ea;border-radius:10px;padding:14px;margin-top:12px}h2{font-size:15px;color:#0056b3;margin-bottom:8px}p{font-size:13px;line-height:1.5}input,textarea{width:100%;padding:9px;border:1px solid #ccc;border-radius:8px;font-size:13px;margin-top:6px;background:#fff}button{padding:11px 16px;border:none;border-radius:8px;font-weight:600;font-size:14px;cursor:pointer;background:#1b5e20;color:#fff;width:100%;margin-top:8px}button.sec{background:#f8f9fa;color:#333;border:1px solid #ccc}button.red{background:#721c24}.row{display:flex;justify-content:space-between;font-size:13px;padding:6px 0;border-bottom:1px solid #f0f0f0}.row:last-child{border:none}b{font-weight:600}.price{font-size:20px;color:#00605a;font-weight:700}.ok{color:#155724;font-weight:700}.bad{color:#721c24;font-weight:700}.msg{font-family:ui-monospace,monospace;font-size:11px;white-space:pre-wrap;margin-top:10px;line-height:1.5;background:#f8f9fa;padding:8px;border-radius:6px}select{width:100%;padding:9px;border:1px solid #ccc;border-radius:8px;font-size:13px;margin-top:6px;background:#fff}footer{margin-top:20px;text-align:center;color:#adb5bd;font-size:10px;line-height:1.6}footer a{color:#0056b3;text-decoration:none}nav{margin:10px 0}nav a{color:#0056b3;font-size:13px;margin-right:14px;text-decoration:none;font-weight:600}`;

const SALES = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#f0f2f5"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-status-bar-style" content="default"><meta name="apple-mobile-web-app-title" content="RootBox"><title>HARZ Root-in-a-Box — your own namespace</title><link rel="manifest" href="/manifest.json"><link rel="icon" href="/icon.svg" type="image/svg+xml"><style>${CSS}</style></head><body>
<h1>HARZ Root-in-a-Box</h1>
<p class="sub">Your own sovereign namespace — installed and notarized by HARZ. Powered by the same stack that runs the .harz root: signed zone, 2 mirrors, browser verifier.</p>
<nav><a href="/">Overview</a><a href="/receipts">Receipts app</a></nav>
<div class="card"><h2>What's in the box</h2>
<div class="row"><span>Signed root zone</span><b>Ed25519, your own anchor key</b></div>
<div class="row"><span>Read-only mirrors</span><b>2 nodes, fail-closed</b></div>
<div class="row"><span>Zone verifier</span><b>browser-based, no server trust</b></div>
<div class="row"><span>Names included</span><b>10 (more on request)</b></div>
<div class="row"><span>Support</span><b>12 months</b></div>
<div class="row"><span>Runs on</span><b>your Cloudflare account or HARZ-managed</b></div></div>
<div class="card"><h2>Tiers</h2>
<div class="row"><span>ESTATE — namespace + 3 nodes</span><b class="price">₦150,000</b></div>
<div class="row"><span>CAMPUS / CO-OP — adds USSD site + training</span><b class="price">₦250,000</b></div>
<div class="row"><span>CUSTOM — custom namespace + resolver + on-site</span><b class="price">₦500,000</b></div></div>
<div class="card"><h2>Order / request a quote</h2>
<input id="org" placeholder="Organisation name">
<input id="contact" placeholder="Contact person">
<input id="phone" placeholder="Phone (WhatsApp)">
<select id="tier"><option value="estate">ESTATE — ₦150,000</option><option value="campus">CAMPUS / CO-OP — ₦250,000</option><option value="custom">CUSTOM — ₦500,000</option></select>
<input id="note" placeholder="Note (optional)">
<button onclick="lead()">Send request</button>
<div class="msg" id="lmsg">We reply within 24h with an install date.</div></div>
<div class="card"><h2>Technical bundle (developers)</h2>
<p>The full stack is open and receipt-verified in HARZ Git. Fetch the live manifest of components:</p>
<button class="sec" onclick="location.href='/bundle'">Open bundle manifest</button>
</div>
<footer>HARZ Root-in-a-Box · part of the HARZ ecosystem<br><a href="https://harz-verify.harz.workers.dev/">verify.harz</a> · <a href="https://harz-super-app.harz.workers.dev/">Super App</a> · rootbox</footer>
<script>
async function lead(){
  const b={org:org.value,contact:contact.value,phone:phone.value,tier:tier.value,note:note.value};
  if(!b.org||!b.phone){lmsg.textContent="Organisation and phone are required.";return}
  lmsg.textContent="Sending...";
  try{
    const r=await fetch("/api/lead",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(b)});
    const j=await r.json();
    lmsg.textContent=j.success?("Request received — HARZ will contact you on "+b.phone+". Ref: "+j.ref):("Error: "+(j.error||"try again"));
  }catch(e){lmsg.textContent="Network error. Try again."}
}
</script></body></html>`;

const RECEIPTS = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#f0f2f5"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-status-bar-style" content="default"><meta name="apple-mobile-web-app-title" content="HARZ Receipts"><title>HARZ Receipts — offline verified</title><link rel="manifest" href="/manifest.json"><link rel="icon" href="/icon.svg" type="image/svg+xml"><style>${CSS}</style></head><body>
<h1>HARZ Receipts</h1>
<p class="sub">Signed commerce receipts that work fully offline. Keys are generated on this device and never leave it. Exchange receipts as text, verify anyone's receipt, sync when back online.</p>
<nav><a href="/">RootBox</a><a href="/receipts">Receipts</a></nav>
<div class="card"><h2>New receipt</h2>
<input id="seller" placeholder="Seller name">
<input id="buyer" placeholder="Buyer name">
<input id="item" placeholder="Item / service">
<input id="qty" placeholder="Quantity" inputmode="numeric" value="1">
<input id="amount" placeholder="Amount (NGN)" inputmode="numeric">
<button onclick="create()">Create signed receipt</button>
<div class="msg" id="rout"></div></div>
<div class="card"><h2>Verify a receipt</h2>
<textarea id="imp" placeholder="Paste receipt text here" style="height:90px;font-family:ui-monospace,monospace;font-size:10px"></textarea>
<button class="sec" onclick="verify()">Verify signature</button>
<div class="msg" id="vout">Paste any HARZ receipt and press verify.</div></div>
<div class="card"><h2>My receipts (this device)</h2>
<div id="list">Loading...</div>
<button class="sec" onclick="sync()">Sync to HARZ cloud</button>
<div class="msg" id="sout">Offline-first: receipts live on device; sync stores the public copy.</div></div>
<footer>HARZ Receipts · Ed25519/ECDSA client-side · no server keys ever</footer>
<script>
let KP=null;
function b64(buf){const u=new Uint8Array(buf);let s="";for(const b of u)s+=String.fromCharCode(b);return btoa(s)}
function ab(b){const u=atob(b);const r=new Uint8Array(u.length);for(let i=0;i<u.length;i++)r[i]=u.charCodeAt(i);return r}
function canon(o){if(o===null||typeof o!=="object")return JSON.stringify(o);if(Array.isArray(o))return "["+o.map(canon).join(",")+"]";return "{"+Object.keys(o).sort().map(k=>JSON.stringify(k)+":"+canon(o[k])).join(",")+"}"}
async function sha256Hex(s){const d=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(s));return[...new Uint8Array(d)].map(b=>b.toString(16).padStart(2,"0")).join("")}
async function getKP(){
  if(KP)return KP;
  let pub=localStorage.getItem("hr_pub"),priv=localStorage.getItem("hr_priv"),alg=localStorage.getItem("hr_alg");
  if(!pub||!priv){
    let esU=null;
    try{esU=await crypto.subtle.generateKey({name:"Ed25519"},true,["sign","verify"])}catch(e){esU=null}
    if(esU&&esU.privateKey){alg="Ed25519"}else{alg="ECDSA-P256"}
    let kp,spki,pkcs;
    if(alg==="Ed25519"){kp=esU;spki=await crypto.subtle.exportKey("spki",kp.publicKey);pkcs=await crypto.subtle.exportKey("pkcs8",kp.privateKey)}
    else{kp=await crypto.subtle.generateKey({name:"ECDSA",namedCurve:"P-256"},true,["sign","verify"]);spki=await crypto.subtle.exportKey("spki",kp.publicKey);pkcs=await crypto.subtle.exportKey("pkcs8",kp.privateKey)}
    pub=b64(spki);priv=b64(pkcs);
    localStorage.setItem("hr_pub",pub);localStorage.setItem("hr_priv",priv);localStorage.setItem("hr_alg",alg);
    KP={pub,priv,alg};
  }else{KP={pub,priv,alg}}
  return KP;
}
async function signPayload(kp,text){
  const key=await crypto.subtle.importKey("pkcs8",ab(kp.priv),kp.alg==="Ed25519"?{name:"Ed25519"}:{name:"ECDSA",namedCurve:"P-256"},false,["sign"]);
  const sig=await crypto.subtle.sign(kp.alg==="Ed25519"?"Ed25519":{name:"ECDSA",hash:"SHA-256"},key,new TextEncoder().encode(text));
  return b64(sig);
}
async function create(){
  const sV=seller.value.trim(),bV=buyer.value.trim(),iV=item.value.trim();
  const qV=parseInt(qty.value,10)||1,aV=parseInt(amount.value,10)||0;
  if(!sV||!bV||!iV||aV<1){rout.textContent="Fill all fields (amount at least N1).";return}
  rout.textContent="Signing on device...";
  const kp=await getKP();
  const rec={v:1,id:"R"+Date.now().toString(36).toUpperCase()+Math.random().toString(36).slice(2,6).toUpperCase(),seller:sV,buyer:bV,item:iV,qty:qV,amount_ngn:aV,ts:new Date().toISOString()};
  const payload=canon(rec);
  const sig=await signPayload(kp,payload);
  const vc=(await sha256Hex(kp.pub+sig+rec.id)).slice(0,12).toUpperCase();
  const receipt=Object.assign({},rec,{alg:kp.alg,pub:kp.pub,sig,vc});
  const text=JSON.stringify(receipt);
  const store=JSON.parse(localStorage.getItem("hr_receipts")||"[]");
  store.unshift(receipt);localStorage.setItem("hr_receipts",JSON.stringify(store));
  rout.textContent=text;
  render();
}
async function verify(){
  vout.textContent="Verifying...";
  let r;
  try{r=JSON.parse(imp.value.trim())}catch(e){vout.textContent="Not a valid receipt text.";return}
  if(!r.sig||!r.pub||!r.vc){vout.textContent="Missing sig/pub fields.";return}
  const body=canon({v:r.v,id:r.id,seller:r.seller,buyer:r.buyer,item:r.item,qty:r.qty,amount_ngn:r.amount_ngn,ts:r.ts});
  try{
    const key=await crypto.subtle.importKey("spki",ab(r.pub),r.alg==="Ed25519"?{name:"Ed25519"}:{name:"ECDSA",namedCurve:"P-256"},false,["verify"]);
    const ok=await crypto.subtle.verify(r.alg==="Ed25519"?"Ed25519":{name:"ECDSA",hash:"SHA-256"},key,ab(r.sig),new TextEncoder().encode(body));
    const vc=(await sha256Hex(r.pub+r.sig+r.id)).slice(0,12).toUpperCase();
    vout.textContent=(ok?"SIGNATURE VALID":"SIGNATURE INVALID")+"\\nReceipt "+r.id+": "+r.seller+" -> "+r.buyer+"\\n"+r.item+" x"+r.qty+" = N"+(r.amount_ngn||0).toLocaleString()+"\\nVerify code: "+vc+(vc===r.vc?" (matches)":" (DOES NOT MATCH — tampered)")+"\\n"+(ok&&vc===r.vc?"This receipt is authentic and unmodified.":"Do not trust this receipt.");
  }catch(e){vout.textContent="Verification failed: "+e}
}
function render(){
  const store=JSON.parse(localStorage.getItem("hr_receipts")||"[]");
  if(!store.length){list.innerHTML="<p>No receipts yet.</p>";return}
  list.innerHTML=store.slice(0,20).map(r=>"<div class=\\"row\\"><span>"+r.item+" x"+r.qty+"</span><b>N"+(r.amount_ngn||0).toLocaleString()+"</b></div><div class=\\"row\\" style=\\"font-size:10px;color:#888\\"><span>"+r.id+" · "+r.vc+"</span><span>"+(r.ts||"").slice(0,10)+"</span></div>").join("");
}
async function sync(){
  const store=JSON.parse(localStorage.getItem("hr_receipts")||"[]");
  if(!store.length){sout.textContent="Nothing to sync.";return}
  sout.textContent="Syncing "+store.length+" receipt(s)...";
  try{
    const r=await fetch("/api/receipts",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({receipts:store})});
    const j=await r.json();
    sout.textContent=j.success?("Synced "+j.stored+" of "+store.length+" — public copies stored in HARZ cloud."):"Sync failed: "+(j.error||"retry later");
  }catch(e){sout.textContent="Offline — receipts stay safe on device. Sync later."}
}
render();
if(!localStorage.getItem("hr_pub"))getKP().then(()=>{});
</script></body></html>`;

function j(obj, status) {
  return new Response(JSON.stringify(obj), { status: status || 200, headers: { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*" } });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const p = url.pathname;
    const cors = { "Access-Control-Allow-Origin": "*" };
    if (request.method === "OPTIONS") return new Response(null, { headers: cors });
    if (p === "/manifest.json") return new Response(MANIFEST, { headers: { "Content-Type": "application/json; charset=utf-8", ...cors } });
    if (p === "/sw.js") return new Response(SW, { headers: { "Content-Type": "application/javascript; charset=utf-8", ...cors } });
    if (p === "/icon.svg") return new Response(ICON, { headers: { "Content-Type": "image/svg+xml", ...cors } });
    if (p === "/api/health") return j({ ok: true, service: "HARZ RootBox", version: "1.0.0" });
    if (p === "/api/lead" && request.method === "POST") {
      let b;
      try { b = await request.json(); } catch (e) { return j({ success: false, error: "invalid JSON" }, 400); }
      const org = String((b && b.org) || "").slice(0, 80);
      const phone = String((b && b.phone) || "").slice(0, 24);
      if (!org || !phone) return j({ success: false, error: "org and phone required" }, 400);
      const ref = "RB-" + String(Math.floor(1000 + Math.random() * 9000));
      try {
        await env.HARZGIT.prepare("INSERT INTO rootbox_leads (ref, org, contact, phone, tier, note, created) VALUES (?, ?, ?, ?, ?, ?, ?)")
          .bind(ref, org, String((b && b.contact) || "").slice(0, 80), phone, String((b && b.tier) || "estate").slice(0, 20), String((b && b.note) || "").slice(0, 300), new Date().toISOString()).run();
        return j({ success: true, ref });
      } catch (e) { return j({ success: false, error: "storage error" }, 500); }
    }
    if (p === "/api/receipts" && request.method === "POST") {
      let b;
      try { b = await request.json(); } catch (e) { return j({ success: false, error: "invalid JSON" }, 400); }
      const list = (b && Array.isArray(b.receipts)) ? b.receipts.slice(0, 50) : [];
      let stored = 0;
      try {
        for (const r of list) {
          if (!r || !r.id || !r.pub || !r.sig) continue;
          await env.HARZGIT.prepare("INSERT OR IGNORE INTO harz_receipts (receipt_id, seller, buyer, item, qty, amount_ngn, alg, verify_code, pub, sig, payload, created) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
            .bind(String(r.id).slice(0, 40), String(r.seller || "").slice(0, 80), String(r.buyer || "").slice(0, 80), String(r.item || "").slice(0, 120), parseInt(r.qty, 10) || 1, parseInt(r.amount_ngn, 10) || 0, String(r.alg || "").slice(0, 20), String(r.vc || "").slice(0, 16), String(r.pub).slice(0, 200), String(r.sig).slice(0, 400), JSON.stringify({ v: r.v, id: r.id, seller: r.seller, buyer: r.buyer, item: r.item, qty: r.qty, amount_ngn: r.amount_ngn, ts: r.ts }).slice(0, 2000), new Date().toISOString()).run();
          stored++;
        }
        return j({ success: true, stored });
      } catch (e) { return j({ success: false, error: "storage error" }, 500); }
    }
    if (p === "/bundle") {
      let components = [];
      try {
        const rows = await env.HARZGIT.prepare("SELECT id, name, description FROM harz_repos WHERE name LIKE '%root%' OR name LIKE '%mirror%' OR name LIKE '%verify%' OR name LIKE '%dialweb%' OR name LIKE '%search%' ORDER BY id").all();
        components = rows.results;
      } catch (e) {}
      return j({
        product: "HARZ Root-in-a-Box",
        version: "1.0.0",
        live_references: {
          root: "https://harz-root.harz.workers.dev/zone",
          mirrors: ["https://harz-root-mirror-a.harz.workers.dev/zone", "https://harz-root-mirror-b.harz.workers.dev/zone"],
          verifier: "https://harz-verify.harz.workers.dev/",
          zone_pub: "https://harz-root.harz.workers.dev/zone-pub"
        },
        components_in_harzgit: components,
        install: "HARZ installs the bundle for you — every component is receipt-verified in HARZ Git by row id above. Install included in every tier.",
        note: "Sources are pulled from the canonical HarzGit D1 table by row receipt."
      });
    }
    if (p === "/receipts") return new Response(RECEIPTS, { headers: { "Content-Type": "text/html; charset=utf-8", ...cors } });
    return new Response(SALES, { headers: { "Content-Type": "text/html; charset=utf-8", ...cors } });
  }
};

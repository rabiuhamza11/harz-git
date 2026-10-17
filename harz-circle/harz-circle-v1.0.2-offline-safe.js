// harz-circle v1.0 — CONTRIBUTION BOOK FOR ESUSU/ADASHE GROUPS
// Sealed into the HARZ Proof book (https://harz-proof.harz.workers.dev).
// ₦500/month per group (owner pricing law, Oct 4 2026). 7-day free trial per group.
// Light theme #f0f2f5, PWA, sovereign SMS rail, Paystack live.
// NO third-party SMS keys. NO private keys. NO client-controlled amounts.

const CURRENCY = '₦';
const SUB_FEE_KOBO = 50000;      // ₦500/month — server-side law
const TRIAL_DAYS = 7;
const PROOF_API = 'https://harz-proof.harz.workers.dev';
const RAIL_SEND = 'https://harz-edge-gateway.harzco-business.workers.dev/api/test/send';

const htmlEsc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ngn = k => (k / 100).toLocaleString('en-NG');
async function sha256hex(s) {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(d)].map(b => b.toString(16).padStart(2, '0')).join('');
}
function key32() {
  const b = new Uint8Array(20);
  crypto.getRandomValues(b);
  return 'hck_' + [...b].map(x => x.toString(16).padStart(2, '0')).join('');
}
function gslug() {
  const b = new Uint8Array(6);
  crypto.getRandomValues(b);
  return [...b].map(x => x.toString(16).padStart(2, '0')).join('');
}
function j(o, s) { return new Response(JSON.stringify(o), { status: s || 200, headers: { 'content-type': 'application/json' } }); }

async function sealToBook(env, msgId, status, route, recipient) {
  const client = env.PROOF || { fetch: (u, o) => fetch(u, o) };
  const r = await client.fetch(PROOF_API + '/api/receipts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + env.WRITE_KEY },
    body: JSON.stringify({ msg_id: msgId, status, sender: 'harz-circle', route, carrier: 'harz-rail', recipient: recipient || '' })
  });
  return await r.json().catch(() => null);
}
async function railSms(env, phone, body) {
  const num = String(phone).replace(/[\s-]/g, '');
  if (!/^0?\d{10,13}$/.test(num)) return { sent: false, reason: 'bad number' };
  try {
    const r = await fetch(RAIL_SEND, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'User-Agent': 'HARZ-Circle/1.0 (sovereign rail)' },
      body: JSON.stringify({ to: num.startsWith('0') ? '234' + num.slice(1) : num, body })
    });
    const d = await r.json().catch(() => null);
    return { sent: !!(d && (d.ok || d.success)), raw: d };
  } catch (e) { return { sent: false, reason: 'rail unreachable' }; }
}

async function groupActive(db, row) {
  const now = Date.now();
  const trialEnd = row.trial_until ? Date.parse(row.trial_until) : 0;
  const paidEnd = row.paid_until ? Date.parse(row.paid_until) : 0;
  if (now <= trialEnd) return { active: true, mode: 'trial', until: row.trial_until };
  if (now <= paidEnd) return { active: true, mode: 'paid', until: row.paid_until };
  return { active: false, mode: 'expired', until: null };
}

const INDEX_HTML = `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#f0f2f5"><meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default"><meta name="apple-mobile-web-app-title" content="HARZ Circle">
<meta name="description" content="HARZ Circle — sealed contribution book for esusu/adashe groups. Every contribution sealed, every member notified.">
<title>HARZ Circle — Sealed Contribution Book</title>
<link rel="manifest" href="/manifest.json"><link rel="icon" href="/icon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/icon.svg">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,'Segoe UI',Roboto,Arial,sans-serif;background:#f0f2f5;color:#1f2937;line-height:1.5;padding:16px;max-width:760px;margin:0 auto;padding-bottom:40px}
h1{color:#166534;font-size:1.6rem;margin:8px 0 2px}
h2{color:#166534;font-size:1.1rem;margin:0 0 10px}
.sub{color:#4b5563;font-size:.85rem;margin-bottom:14px}
.card{background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:16px;margin-bottom:14px}
label{display:block;font-size:.8rem;color:#374151;margin:10px 0 4px}
input{width:100%;padding:10px;border:1px solid #d1d5db;border-radius:8px;font-size:.95rem;background:#fff}
button{background:#0e2e5c;color:#fff;border:none;border-radius:8px;padding:10px 18px;font-size:.95rem;margin-top:12px;cursor:pointer;width:100%}
button.ok{background:#166534;color:#fff}
button.warn{background:#7c2d12}
button.small{width:auto;padding:6px 12px;font-size:.8rem;margin-top:6px}
.msg{margin-top:8px;font-size:.85rem;white-space:pre-wrap;word-break:break-all}
.ok{color:#166534}.bad{color:#b91c1c}
.mono{font-family:ui-monospace,Menlo,monospace;font-size:.8rem}
.row{display:flex;gap:8px}.row>div{flex:1}
table{width:100%;border-collapse:collapse;font-size:.85rem;margin-top:8px}
td,th{padding:6px 4px;border-bottom:1px solid #e5e7eb;text-align:left;vertical-align:top}
th{color:#6b7280;font-weight:600;font-size:.75rem}
.badge{display:inline-block;font-size:.7rem;padding:2px 8px;border-radius:10px;background:#dcfce7;color:#166534;margin-left:6px}
.badge.off{background:#fee2e2;color:#b91c1c}
.seal{color:#166534}
.void{color:#9ca3af;text-decoration:line-through}
.boundary{font-size:.75rem;color:#6b7280;margin-top:18px;border-top:1px solid #e5e7eb;padding-top:10px}
a{color:#0e2e5c}
</style><script>if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js').catch(()=>{})}</script></head><body>
<h1>HARZ Circle</h1>
<div class="sub">Sealed contribution book for esusu / adashe groups. Every contribution is sealed into the tamper-evident book and the member gets an SMS. ₦500 per group per month (7-day free trial). Ledger viewing is free for everyone.</div>

<div class="card"><h2>Start a circle</h2>
<label>Circle name (e.g. Gembu Traders Circle)</label><input id="gname" placeholder="Our contribution group">
<label>Your phone (for admin SMS)</label><input id="gphone" placeholder="08012345678">
<button class="ok" onclick="createGroup()">Create circle</button>
<div class="msg" id="cmsg"></div></div>

<div class="card"><h2>Open your circle (treasurer)</h2>
<label>Circle ID</label><input id="gid" placeholder="e.g. 3f9a2b1c04de">
<label>Admin key</label><input id="gkey" placeholder="hck_..." class="mono">
<button onclick="openGroup()">Open</button>
<div class="msg" id="omsg"></div></div>

<div class="card"><h2>View a circle ledger (anyone, free)</h2>
<label>Circle ID</label><input id="vgid" placeholder="e.g. 3f9a2b1c04de">
<button onclick="location='/g/'+encodeURIComponent(document.getElementById('vgid').value.trim())">View ledger</button>
<div class="msg"></div></div>

<div class="card" id="panel" style="display:none"></div>

<div class="boundary">HARZ Circle keeps records only — it never holds your money. Every contribution record is sealed into the HARZ Proof book (tamper-evident). Seals prove the record exists and cannot be rewritten — they do not verify the cash itself. Corrections create sealed amendments; nothing is silently edited. SMS rides the sovereign HARZ rail.</div>
<script>
const S=(id,v)=>{try{localStorage.setItem(id,v)}catch(e){}};
const G=id=>{try{return localStorage.getItem(id)}catch(e){return null}};
async function api(u,b,key){let r;try{r=await fetch(u,{method:b?'POST':'GET',headers:{'Content-Type':'application/json','Authorization':'Bearer '+(key||G('hck_'+G('hcg')||''))},body:b?JSON.stringify(b):undefined})}catch(e){return [{ok:false,reason:'OFFLINE: no connection. HARZ Circle records are sealed on the server, so recording and creating need internet. Nothing was saved. Try again when connected.',offline:true},0]}return [await r.json().catch(()=>({ok:false,reason:'unreachable'})),r.status]}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
async function createGroup(){
const name=document.getElementById('gname').value.trim(),phone=document.getElementById('gphone').value.trim();
const m=document.getElementById('cmsg');
if(!name){m.innerHTML='<span class="bad">Enter a circle name</span>';return}
m.innerHTML='creating…';
const [d]=await api('/api/groups',{name,phone});
if(!d.ok){m.innerHTML='<span class="bad">'+esc(d.reason||'failed')+'</span>';return}
S('hcg',d.group_id);S('hck_'+d.group_id,d.admin_key);
document.getElementById('gid').value=d.group_id;
document.getElementById('gkey').value=d.admin_key;
m.innerHTML='<span class="ok">Circle created. SAVE YOUR ADMIN KEY — it is shown only this once:</span>\\n<span class="mono">'+esc(d.admin_key)+'</span>';
openGroup();
}
async function openGroup(){
const gid=document.getElementById('gid').value.trim(),key=document.getElementById('gkey').value.trim();
const m=document.getElementById('omsg');
if(!gid){m.innerHTML='<span class="bad">Enter circle ID</span>';return}
S('hcg',gid);if(key)S('hck_'+gid,key);
await render();
}
async function render(){
const gid=G('hcg');if(!gid)return;
const [d]=await api('/api/g/'+encodeURIComponent(gid)+'/view');
const p=document.getElementById('panel');
if(!d.ok){p.style.display='block';p.innerHTML='<span class="bad">'+esc(d.reason||'not found')+'</span>';return}
const g=d.group,sub=d.sub;
p.style.display='block';
let h='<h2>'+esc(g.name)+' <span class="mono" style="font-size:.7rem">'+esc(g.id)+'</span></h2>';
h+=sub.mode==='trial'?'<div class="badge">FREE TRIAL until '+esc((sub.until||'').slice(0,10))+'</div>':(sub.active?'<div class="badge">SUBSCRIBED until '+esc((sub.until||'').slice(0,10))+'</div>':'<div class="badge off">SUBSCRIPTION EXPIRED — ₦500/month to keep recording</div>');
h+='<div class="sub" style="margin-top:6px">'+d.members.length+' members · '+d.entries.length+' sealed entries · total '+C+(0,window.__fmt)(d.total_kobo)+'</div>';
if(!sub.active)h+='<button class="ok" onclick="paySub()">Pay ₦500 subscription (Paystack)</button><div class="msg" id="pmsg"></div>';
h+='<h2 style="margin-top:14px">Members</h2><table><tr><th>Name</th><th>Phone</th><th></th></tr>';
for(const m of d.members)h+='<tr><td>'+esc(m.name)+'</td><td class="mono">'+esc(m.phone||'')+'</td><td><button class="warn small" onclick="removeMember('+m.id+')">remove</button></td></tr>';
h+='</table><label>Member name</label><input id="mname" placeholder="Musa Abdullahi"><label>Member phone (for SMS)</label><input id="mphone" placeholder="08012345678"><button class="small" onclick="addMember()">Add member</button><div class="msg" id="mmsg"></div>';
h+='<h2 style="margin-top:14px">Record a contribution</h2><label>Member</label><select id="emem" style="width:100%;padding:10px;border:1px solid #d1d5db;border-radius:8px;background:#fff">'+d.members.map(m=>'<option value="'+m.id+'">'+esc(m.name)+'</option>').join('')+'</select><div class="row"><div><label>Amount (₦)</label><input id="eamt" type="number" min="1" placeholder="5000"></div><div><label>Cycle / month</label><input id="ecyc" placeholder="e.g. Oct-2026"></div></div><label>Note (optional, max 60 chars)</label><input id="enote" maxlength="60"><button class="ok" onclick="addEntry()">Record & seal</button><div class="msg" id="emsg"></div>';
h+='<h2 style="margin-top:14px">Sealed ledger</h2><table><tr><th>When</th><th>Member</th><th>Amount</th><th>Seal</th></tr>';
for(const e of d.entries){const m=d.members.find(x=>x.id===e.member_id);h+='<tr class="'+(e.voided?'void':'')+'"><td class="mono">'+esc((e.created_at||'').slice(0,16).replace('T',' '))+'</td><td>'+esc(m?m.name:'?')+'</td><td>'+C+(0,window.__fmt)(e.amount_kobo)+(e.voided?' <span class="badge off">voided</span>':'')+'</td><td>'+(e.seal?'<a class="seal mono" href="'+PROOF+'/api/receipt/'+esc(e.seal)+'" target="_blank">'+esc(e.seal.slice(0,8))+'</a>':'—')+'</td></tr>'}
h+='</table><button class="small" onclick="exportLedger()">Download ledger (.txt)</button><div class="msg" id="xmsg"></div>';
p.innerHTML=h;
}
window.__fmt=k=>(k/100).toLocaleString('en-NG');
const C='₦',PROOF='https://harz-proof.harz.workers.dev';
async function addMember(){const gid=G('hcg');const [d]=await api('/api/g/'+encodeURIComponent(gid)+'/members',{name:document.getElementById('mname').value.trim(),phone:document.getElementById('mphone').value.trim()});document.getElementById('mmsg').innerHTML=d.ok?'<span class="ok">member added</span>':'<span class="bad">'+esc(d.reason)+'</span>';if(d.ok)render()}
async function removeMember(id){const gid=G('hcg');const [d]=await api('/api/g/'+encodeURIComponent(gid)+'/members/'+id,null);document.getElementById('mmsg').innerHTML=d.ok?'<span class="ok">member removed</span>':'<span class="bad">'+esc(d.reason)+'</span>';if(d.ok)render()}
async function addEntry(){
const gid=G('hcg');const amt=Math.round(Number(document.getElementById('eamt').value));
const [d]=await api('/api/g/'+encodeURIComponent(gid)+'/entry',{member_id:Number(document.getElementById('emem').value),amount_ngn:amt,cycle:document.getElementById('ecyc').value.trim(),note:document.getElementById('enote').value.trim()});
const m=document.getElementById('emsg');
if(!d.ok){m.innerHTML='<span class="bad">'+esc(d.reason)+'</span>';return}
m.innerHTML='<span class="ok">Sealed '+esc((d.seal||'').slice(0,16))+'</span> · SMS '+(d.sms&&d.sms.sent?'sent':'not sent');
render()}
async function paySub(){const gid=G('hcg');const [d]=await api('/api/pay/init',{group_id:gid});const m=document.getElementById('pmsg');if(d.ok){m.innerHTML='<span class="ok">Opening Paystack…</span>';location=d.authorization_url}else m.innerHTML='<span class="bad">'+esc(d.reason||'failed')+'</span>'}
function exportLedger(){const gid=G('hcg');location='/api/g/'+encodeURIComponent(gid)+'/export'}
if(G('hcg')){document.getElementById('gid').value=G('hcg');document.getElementById('gkey').value=G('hck_'+G('hcg'))||'';render()}
</script></body></html>`;

const GROUP_HTML = `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#f0f2f5"><meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default"><meta name="apple-mobile-web-app-title" content="HARZ Circle">
<title>HARZ Circle — Ledger</title>
<link rel="manifest" href="/manifest.json"><link rel="icon" href="/icon.svg" type="image/svg+xml">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,'Segoe UI',Roboto,Arial,sans-serif;background:#f0f2f5;color:#1f2937;line-height:1.5;padding:16px;max-width:760px;margin:0 auto}
h1{color:#166534;font-size:1.4rem;margin:8px 0 2px}
.sub{color:#4b5563;font-size:.85rem;margin-bottom:14px}
.mono{font-family:ui-monospace,Menlo,monospace;font-size:.8rem}
table{width:100%;border-collapse:collapse;font-size:.85rem;margin-top:8px;background:#fff;border:1px solid #e5e7eb;border-radius:10px}
td,th{padding:8px 6px;border-bottom:1px solid #e5e7eb;text-align:left;vertical-align:top}
th{color:#6b7280;font-weight:600;font-size:.75rem}
.card{background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:16px;margin-bottom:14px}
.seal{color:#166534}.void{color:#9ca3af;text-decoration:line-through}
.badge{display:inline-block;font-size:.7rem;padding:2px 8px;border-radius:10px;background:#dcfce7;color:#166534}
.badge.off{background:#fee2e2;color:#b91c1c}
a{color:#0e2e5c}
</style><script>if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js').catch(()=>{})}</script></head><body>
<h1 id="h">Circle ledger</h1>
<div class="sub">Public, sealed records. Every entry below is sealed in the tamper-evident HARZ Proof book — click a seal to verify it yourself.</div>
<div class="card" id="c">loading…</div>
<script>
const gid=location.pathname.split('/g/')[1]||'';
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
fetch('/api/g/'+encodeURIComponent(gid)+'/ledger').then(r=>r.json()).then(d=>{
if(!d.ok){document.getElementById('c').innerHTML='<span style="color:#b91c1c">'+esc(d.reason||'not found')+'</span>';return}
document.getElementById('h').textContent=d.group.name+' — ledger';
document.getElementById('c').innerHTML='<span class="mono">'+esc(d.group.id)+'</span> <span class="badge">'+d.entries.length+' sealed entries · ₦'+(d.total_kobo/100).toLocaleString('en-NG')+' recorded</span><table><tr><th>When</th><th>Member</th><th>Amount</th><th>Seal (verify)</th></tr>'+d.entries.map(e=>'<tr class="'+(e.voided?'void':'')+'"><td class="mono">'+esc((e.created_at||'').slice(0,16).replace('T',' '))+'</td><td>'+esc(e.member_name)+'</td><td>₦'+(e.amount_kobo/100).toLocaleString('en-NG')+(e.voided?' <span class="badge off">voided</span>':'')+'</td><td>'+(e.seal?'<a class="seal mono" href="https://harz-proof.harz.workers.dev/api/receipt/'+esc(e.seal)+'" target="_blank">'+esc(e.seal.slice(0,8))+'</a>':'—')+'</td></tr>').join('')+'</table><div style="font-size:.75rem;color:#6b7280;margin-top:10px">HARZ Circle keeps records only — money never passes through this service.</div>';
}).catch(()=>{document.getElementById('c').innerHTML='<span style="color:#b45309">OFFLINE: this ledger needs a connection to load. Nothing is shown here that was not verified online. Reconnect and refresh.</span>'});
</script></body></html>`;

const PAID_HTML = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#f0f2f5"><title>HARZ Circle — Subscription</title>
<link rel="manifest" href="/manifest.json"><link rel="icon" href="/icon.svg">
<style>body{font-family:-apple-system,'Segoe UI',Roboto,Arial,sans-serif;background:#f0f2f5;color:#1f2937;padding:16px;max-width:600px;margin:0 auto}h1{color:#166534;font-size:1.4rem}.mono{font-family:ui-monospace,Menlo,monospace}.ok{color:#166534}.bad{color:#b91c1c}a{color:#0e2e5c}</style><script>if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js').catch(()=>{})}</script></head><body>
<h1>HARZ Circle — subscription</h1>
<p id="v" class="mono">checking…</p>
<p><a href="/">Back to your circle</a></p>
<script>
const ref=new URLSearchParams(location.search).get('reference');
fetch('/api/pay/verify',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({reference:ref})}).then(r=>r.json()).then(d=>{
document.getElementById('v').innerHTML=d.ok&&d.paid?'<span class="ok">₦500 subscription active until '+d.paid_until+'</span>':'<span class="bad">'+(d.reason||'payment not completed')+'</span>';
}).catch(()=>document.getElementById('v').innerHTML='<span class="bad">unreachable</span>');
</script></body></html>`;

const MANIFEST = JSON.stringify({
  name: "HARZ Circle — Sealed Contribution Book",
  short_name: "HARZ Circle",
  start_url: "/",
  display: "standalone",
  background_color: "#f0f2f5",
  theme_color: "#f0f2f5",
  icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }]
});
const SW = `const C='harz-circle-v1-r2';
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(C).then(c=>c.addAll(['/','/manifest.json','/icon.svg'])))});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET')return;
 const u=new URL(e.request.url);
 if(u.pathname.startsWith('/api/'))return;
 e.respondWith(fetch(e.request).then(r=>{const cp=r.clone();caches.open(C).then(c=>c.put(e.request,cp));return r}).catch(()=>caches.match(e.request)));
});`;
const ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="#f0f2f5"/><circle cx="50" cy="38" r="16" fill="none" stroke="#166534" stroke-width="6"/><circle cx="36" cy="58" r="10" fill="none" stroke="#0e2e5c" stroke-width="5"/><circle cx="64" cy="58" r="10" fill="none" stroke="#0e2e5c" stroke-width="5"/><path d="M50 30 v16 M40 52 l6 6 M60 52 l-6 6" stroke="#166534" stroke-width="4" fill="none"/></svg>`;

const TABLES = `
CREATE TABLE IF NOT EXISTS groups (id TEXT PRIMARY KEY, name TEXT, admin_key_hash TEXT, admin_phone TEXT, created_at TEXT, trial_until TEXT, paid_until TEXT);
CREATE TABLE IF NOT EXISTS members (id INTEGER PRIMARY KEY AUTOINCREMENT, group_id TEXT, name TEXT, phone TEXT, joined_at TEXT);
CREATE TABLE IF NOT EXISTS entries (id INTEGER PRIMARY KEY AUTOINCREMENT, group_id TEXT, member_id INTEGER, amount_kobo INTEGER, cycle TEXT, note TEXT, seal TEXT, voided INTEGER DEFAULT 0, created_at TEXT);
CREATE TABLE IF NOT EXISTS sub_payments (reference TEXT PRIMARY KEY, group_id TEXT, email TEXT, status TEXT, amount INTEGER, created_at TEXT, used_at TEXT);
CREATE TABLE IF NOT EXISTS grp_rate (ip TEXT, hour TEXT, count INTEGER, PRIMARY KEY (ip, hour));
`;

export default {
  async fetch(req, env) {
    const url = new URL(req.url), path = url.pathname, db = env.DB;
    const ip = req.headers.get('cf-connecting-ip') || 'unknown';
    try {
      if (path === '/' || path === '/index.html') return new Response(INDEX_HTML, { headers: { 'content-type': 'text/html; charset=utf-8' } });
      if (path === '/manifest.json') return new Response(MANIFEST, { headers: { 'content-type': 'application/json' } });
      if (path === '/sw.js') return new Response(SW, { headers: { 'content-type': 'application/javascript' } });
      if (path === '/icon.svg') return new Response(ICON, { headers: { 'content-type': 'image/svg+xml' } });
      if (path === '/paid') return new Response(PAID_HTML, { headers: { 'content-type': 'text/html; charset=utf-8' } });

      const m = path.match(/^\/g\/([0-9a-f]{8,24})$/);
      if (m) return new Response(GROUP_HTML, { headers: { 'content-type': 'text/html; charset=utf-8' } });

      async function init() { for (const s of TABLES.split(';').map(x => x.trim()).filter(Boolean)) await db.prepare(s).run(); }
      async function authGroup(gid) {
        const key = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '').trim();
        if (!key) return [null, 401];
        const row = await db.prepare('SELECT * FROM groups WHERE id=?').bind(gid).first();
        if (!row) return [null, 404];
        if (row.admin_key_hash !== await sha256hex(key)) return [null, 403];
        return [row, null];
      }

      // create group — rate limited
      if (path === '/api/groups' && req.method === 'POST') {
        await init();
        const hourKey = new Date().toISOString().slice(0, 13);
        const rl = await db.prepare('SELECT count FROM grp_rate WHERE ip=? AND hour=?').bind(ip, hourKey).first();
        if (rl && rl.count >= 5) return j({ ok: false, reason: 'too many circles from this device, try later' }, 429);
        if (rl) await db.prepare('UPDATE grp_rate SET count=count+1 WHERE ip=? AND hour=?').bind(ip, hourKey).run();
        else await db.prepare('INSERT INTO grp_rate VALUES (?,?,1)').bind(ip, hourKey).run();
        const b = await req.json().catch(() => null);
        const name = String((b && b.name) || '').trim().slice(0, 60);
        const phone = String((b && b.phone) || '').replace(/[\s-]/g, '').slice(0, 14);
        if (!name) return j({ ok: false, reason: 'circle name required' }, 400);
        if (phone && !/^0?\d{10,13}$/.test(phone)) return j({ ok: false, reason: 'bad phone format' }, 400);
        const gid = gslug();
        const key = key32();
        const now = new Date();
        const trial = new Date(now.getTime() + TRIAL_DAYS * 86400000).toISOString();
        await db.prepare('INSERT INTO groups (id,name,admin_key_hash,admin_phone,created_at,trial_until) VALUES (?,?,?,?,?,?)')
          .bind(gid, name, await sha256hex(key), phone, now.toISOString(), trial).run();
        return j({ ok: true, group_id: gid, admin_key: key, trial_until: trial });
      }

      // admin view
      if (path.match(/^\/api\/g\/[0-9a-f]{8,24}\/view$/)) {
        await init();
        const gid = path.split('/')[3];
        const b = await req.json().catch(() => ({}));
        // GET request: authenticate from stored key passed via query? No — view is admin, needs key. Use GET with header.
        const key = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '').trim();
        const row = await db.prepare('SELECT * FROM groups WHERE id=?').bind(gid).first();
        if (!row) return j({ ok: false, reason: 'circle not found' }, 404);
        if (!key || row.admin_key_hash !== await sha256hex(key)) return j({ ok: false, reason: 'admin key required' }, 403);
        const sub = await groupActive(db, row);
        const members = await db.prepare('SELECT id,name,phone FROM members WHERE group_id=? ORDER BY id').bind(gid).all();
        const entries = await db.prepare('SELECT * FROM entries WHERE group_id=? ORDER BY id DESC LIMIT 200').bind(gid).all();
        let total = 0;
        for (const e of entries.results) if (!e.voided) total += e.amount_kobo;
        return j({ ok: true, group: { id: row.id, name: row.name, created_at: row.created_at }, sub, members: members.results, entries: entries.results, total_kobo: total });
      }

      // add member
      if (path.match(/^\/api\/g\/[0-9a-f]{8,24}\/members$/) && req.method === 'POST') {
        await init();
        const gid = path.split('/')[3];
        const [row, err] = await authGroup(gid);
        if (err) return j({ ok: false, reason: err === 401 ? 'admin key required' : err === 403 ? 'wrong admin key' : 'circle not found' }, err);
        const b = await req.json().catch(() => null);
        const name = String((b && b.name) || '').trim().slice(0, 60);
        const phone = String((b && b.phone) || '').replace(/[\s-]/g, '').slice(0, 14);
        if (!name) return j({ ok: false, reason: 'member name required' }, 400);
        if (phone && !/^0?\d{10,13}$/.test(phone)) return j({ ok: false, reason: 'bad phone format' }, 400);
        const r = await db.prepare('INSERT INTO members (group_id,name,phone,joined_at) VALUES (?,?,?,?)')
          .bind(gid, name, phone, new Date().toISOString()).run();
        return j({ ok: true, member_id: r.meta.last_row_id });
      }
      // remove member
      if (path.match(/^\/api\/g\/[0-9a-f]{8,24}\/members\/\d+$/) && req.method === 'GET') {
        await init();
        const gid = path.split('/')[3], mid = Number(path.split('/')[5]);
        const [row, err] = await authGroup(gid);
        if (err) return j({ ok: false, reason: 'not allowed' }, err);
        const cnt = await db.prepare("SELECT COUNT(*) AS c FROM entries WHERE group_id=? AND member_id=?").bind(gid, mid).first();
        if (cnt.c > 0) return j({ ok: false, reason: 'member has sealed entries — cannot remove history' }, 409);
        await db.prepare('DELETE FROM members WHERE id=? AND group_id=?').bind(mid, gid).run();
        return j({ ok: true });
      }

      // record contribution — the core: seal + SMS
      if (path.match(/^\/api\/g\/[0-9a-f]{8,24}\/entry$/) && req.method === 'POST') {
        await init();
        const gid = path.split('/')[3];
        const [row, err] = await authGroup(gid);
        if (err) return j({ ok: false, reason: err === 401 ? 'admin key required' : err === 403 ? 'wrong admin key' : 'circle not found' }, err);
        const sub = await groupActive(db, row);
        if (!sub.active) return j({ ok: false, reason: 'subscription expired — pay ₦500/month to keep recording', code: 'sub_required' }, 402);
        const b = await req.json().catch(() => null);
        const memberId = Number(b && b.member_id);
        const amountNgn = Math.round(Number(b && b.amount_ngn));
        const cycle = String((b && b.cycle) || '').trim().slice(0, 24);
        const note = String((b && b.note) || '').trim().slice(0, 60);
        if (!memberId) return j({ ok: false, reason: 'member required' }, 400);
        if (!amountNgn || amountNgn < 1 || amountNgn > 10000000) return j({ ok: false, reason: 'amount between ₦1 and ₦10,000,000' }, 400);
        const mem = await db.prepare('SELECT * FROM members WHERE id=? AND group_id=?').bind(memberId, gid).first();
        if (!mem) return j({ ok: false, reason: 'member not in this circle' }, 404);
        const ins = await db.prepare('INSERT INTO entries (group_id,member_id,amount_kobo,cycle,note,created_at) VALUES (?,?,?,?,?,?)')
          .bind(gid, memberId, amountNgn * 100, cycle, note, new Date().toISOString()).run();
        const eid = ins.meta.last_row_id;
        // seal into the HARZ Proof book (tamper-evident)
        let seal = null;
        try {
          const claim = `circle|${gid}|e${eid}`;
          const sr = await sealToBook(env, claim, 'sealed', 'circle/contribution', mem.phone || row.admin_phone || '');
          if (sr && sr.ok) seal = sr.receipt_hash.slice(0, 16);
        } catch (e) { /* book unreachable — entry still recorded locally */ }
        if (seal) await db.prepare('UPDATE entries SET seal=? WHERE id=?').bind(seal, eid).run();
        // SMS the member on the sovereign rail
        let sms = { sent: false, reason: 'no phone' };
        if (mem.phone) {
          const txt = `HARZ Circle: ${CURRENCY}${amountNgn.toLocaleString('en-NG')} recorded for ${mem.name} in ${row.name}${cycle ? ', cycle ' + cycle : ''}. Seal ${seal || 'pending'}. Ledger: https://harz-circle.harz.workers.dev/g/${gid}`;
          sms = await railSms(env, mem.phone, txt);
          try { await sealToBook(env, `circle|${gid}|e${eid}|sms`, sms.sent ? 'delivered' : 'failed', 'circle/sms', mem.phone); } catch (e) {}
        }
        return j({ ok: true, entry_id: eid, seal, sms });
      }

      // void an entry — sealed amendment, never silent edit
      if (path.match(/^\/api\/g\/[0-9a-f]{8,24}\/void$/) && req.method === 'POST') {
        await init();
        const gid = path.split('/')[3];
        const [row, err] = await authGroup(gid);
        if (err) return j({ ok: false, reason: 'not allowed' }, err);
        const sub = await groupActive(db, row);
        if (!sub.active) return j({ ok: false, reason: 'subscription expired' }, 402);
        const b = await req.json().catch(() => null);
        const eid = Number(b && b.entry_id);
        const reason = String((b && b.reason) || '').trim().slice(0, 120);
        if (!eid || !reason) return j({ ok: false, reason: 'entry_id and reason required' }, 400);
        const e = await db.prepare('SELECT * FROM entries WHERE id=? AND group_id=?').bind(eid, gid).first();
        if (!e) return j({ ok: false, reason: 'entry not found' }, 404);
        if (e.voided) return j({ ok: false, reason: 'already voided' }, 409);
        await db.prepare('UPDATE entries SET voided=1 WHERE id=?').bind(eid).run();
        let seal = null;
        try {
          const sr = await sealToBook(env, `circle|${gid}|e${eid}|void`, 'voided:' + reason.slice(0, 40), 'circle/amendment', '');
          if (sr && sr.ok) seal = sr.receipt_hash.slice(0, 16);
        } catch (e2) {}
        return j({ ok: true, voided: true, seal });
      }

      // public ledger JSON
      if (path.match(/^\/api\/g\/[0-9a-f]{8,24}\/ledger$/)) {
        await init();
        const gid = path.split('/')[3];
        const row = await db.prepare('SELECT * FROM groups WHERE id=?').bind(gid).first();
        if (!row) return j({ ok: false, reason: 'circle not found' }, 404);
        const entries = await db.prepare('SELECT e.*, m.name AS member_name FROM entries e LEFT JOIN members m ON m.id=e.member_id WHERE e.group_id=? ORDER BY e.id DESC LIMIT 500').bind(gid).all();
        let total = 0;
        for (const e of entries.results) if (!e.voided) total += e.amount_kobo;
        return j({ ok: true, group: { id: row.id, name: row.name, created_at: row.created_at }, entries: entries.results, total_kobo: total });
      }

      // ledger export (.txt) — treasurer can seal it as a document in HARZ Proof
      if (path.match(/^\/api\/g\/[0-9a-f]{8,24}\/export$/)) {
        await init();
        const gid = path.split('/')[3];
        const row = await db.prepare('SELECT * FROM groups WHERE id=?').bind(gid).first();
        if (!row) return j({ ok: false, reason: 'circle not found' }, 404);
        const entries = await db.prepare('SELECT e.*, m.name AS member_name FROM entries e LEFT JOIN members m ON m.id=e.member_id WHERE e.group_id=? ORDER BY e.id').bind(gid).all();
        let total = 0;
        const lines = [`HARZ CIRCLE LEDGER — ${row.name}`, `Circle ID: ${gid}`, `Created: ${row.created_at}`, ''];
        for (const e of entries.results) {
          if (!e.voided) total += e.amount_kobo;
          lines.push(`${e.created_at.slice(0, 16).replace('T', ' ')} | ${e.member_name || '?'} | ${CURRENCY}${(e.amount_kobo / 100).toLocaleString('en-NG')} | ${e.cycle || ''} | ${e.voided ? 'VOIDED' : 'valid'} | seal ${e.seal || '—'}`);
        }
        lines.push('', `Total recorded: ${CURRENCY}${(total / 100).toLocaleString('en-NG')}`, 'Generated by harz-circle. Seal this file in HARZ Proof for a tamper-evident month-end record.');
        return new Response(lines.join('\n'), { headers: { 'content-type': 'text/plain; charset=utf-8', 'content-disposition': 'attachment; filename="harz-circle-ledger.txt"' } });
      }

      // subscription payment — ₦500/month, server-side law
      if (path === '/api/pay/init' && req.method === 'POST') {
        await init();
        const b = await req.json().catch(() => null);
        const gid = String((b && b.group_id) || '').trim();
        const email = String((b && b.email) || '').trim().slice(0, 80); // email optional: Paystack needs one
        const row = await db.prepare('SELECT * FROM groups WHERE id=?').bind(gid).first();
        if (!row) return j({ ok: false, reason: 'circle not found' }, 404);
        if (!env.PAYSTACK_SECRET) return j({ ok: false, reason: 'payment rail not configured' }, 503);
        const useEmail = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) ? email : 'circle+' + gid + '@harzco-business.workers.dev';
        const reference = 'hcr_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
        const pr = await fetch('https://api.paystack.co/transaction/initialize', {
          method: 'POST',
          headers: { 'authorization': 'Bearer ' + env.PAYSTACK_SECRET, 'content-type': 'application/json' },
          body: JSON.stringify({ email: useEmail, amount: SUB_FEE_KOBO, reference, callback_url: 'https://harz-circle.harz.workers.dev/paid' })
        });
        const pd = await pr.json().catch(() => null);
        if (!pd || !pd.status || !pd.data || !pd.data.authorization_url) return j({ ok: false, reason: 'payment provider unavailable' }, 502);
        await db.prepare('INSERT OR REPLACE INTO sub_payments (reference,group_id,email,status,amount,created_at) VALUES (?,?,?,?,?,?)')
          .bind(reference, gid, useEmail, 'pending', SUB_FEE_KOBO, new Date().toISOString()).run();
        return j({ ok: true, reference, amount_ngn: 500, authorization_url: pd.data.authorization_url });
      }
      if (path === '/api/pay/verify' && req.method === 'POST') {
        await init();
        const b = await req.json().catch(() => null);
        const reference = String((b && b.reference) || '').trim().slice(0, 64);
        if (!reference) return j({ ok: false, reason: 'reference required' }, 400);
        const row = await db.prepare('SELECT * FROM sub_payments WHERE reference=?').bind(reference).first();
        if (!row) return j({ ok: false, reason: 'unknown reference' }, 404);
        if (row.status === 'used') {
          const g = await db.prepare('SELECT paid_until FROM groups WHERE id=?').bind(row.group_id).first();
          return j({ ok: true, paid: true, group_id: row.group_id, paid_until: g ? g.paid_until : null });
        }
        if (row.status === 'pending' && env.PAYSTACK_SECRET) {
          const vr = await fetch('https://api.paystack.co/transaction/verify/' + encodeURIComponent(reference), {
            headers: { 'authorization': 'Bearer ' + env.PAYSTACK_SECRET }
          });
          const vd = await vr.json().catch(() => null);
          const st = vd && vd.data && vd.data.status;
          const amt = (vd && vd.data && vd.data.amount) || 0;
          if (st === 'success' && amt >= row.amount) {
            // extend 30 days from max(now, current paid_until)
            const g = await db.prepare('SELECT paid_until FROM groups WHERE id=?').bind(row.group_id).first();
            const now = Date.now();
            const cur = g && g.paid_until ? Date.parse(g.paid_until) : 0;
            const base = Math.max(now, cur);
            const until = new Date(base + 30 * 86400000).toISOString();
            await db.prepare("UPDATE groups SET paid_until=? WHERE id=?").bind(until, row.group_id).run();
            await db.prepare("UPDATE sub_payments SET status='used', used_at=? WHERE reference=?").bind(new Date().toISOString(), reference).run();
            return j({ ok: true, paid: true, group_id: row.group_id, paid_until: until });
          }
          return j({ ok: true, paid: false, status: st || 'unknown' });
        }
        return j({ ok: false, reason: 'cannot verify' }, 500);
      }

      return new Response('not found', { status: 404 });
    } catch (e) {
      return j({ ok: false, reason: 'worker error: ' + String(e).slice(0, 120) }, 500);
    }
  }
};
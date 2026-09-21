// HARZ Broadcast Console — B2B Demonstrator #2 (bulk WhatsApp/SMS campaign manager)
// Zero-dependency Cloudflare Worker. SMS rides the LIVE HARZ Gateway (real SendChamp delivery).
// WhatsApp channel is wired in the engine but activates on the buyer's own WhatsApp Business API credentials — honest by design.
// Bindings: BC_DB (D1), GATEWAY_SVC (service -> harz-gateway), DEMO_API_KEY (secret)

const BRAND = "#0a7d3c";
const MAX_BATCH = 10; // demo cap per campaign send — labeled honestly in UI

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const cors = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, X-API-Key",
      "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS"
    };
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    const json = (obj, code) => new Response(JSON.stringify(obj), {
      status: code || 200, headers: { "Content-Type": "application/json", ...cors }
    });

    // ---- public demo surface ----
    if (url.pathname === "/health") {
      return json({ status: "healthy", service: "harz-broadcast-demo", version: "1.0.0", gateway: "service-binding", time: new Date().toISOString() });
    }
    if (url.pathname === "/manifest.json") {
      return json({
        name: "HARZ Broadcast Console", short_name: "HARZ Broadcast",
        start_url: "/", display: "standalone", background_color: "#f0f2f5", theme_color: "#f0f2f5",
        description: "Bulk WhatsApp/SMS campaign manager — live demo", icons: []
      });
    }
    if (url.pathname === "/sw.js") {
      return new Response("self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open('bc-v1').then(c=>c.add('/')))});self.addEventListener('activate',e=>e.waitUntil(clients.claim()));self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(res=>{const cl=res.clone();caches.open('bc-v1').then(c=>c.put(e.request,cl));return res}).catch(()=>caches.match('/'))))});",
        { headers: { "Content-Type": "application/javascript", "Cache-Control": "no-cache", ...cors } });
    }
    if (url.pathname === "/" && request.method === "GET") return consoleUI();

    // ---- demo API (X-API-Key gated, mirrors what a buyer's backend would call) ----
    const key = request.headers.get("X-API-Key");
    const demoKey = (env.DEMO_API_KEY || "").trim();
    if (url.pathname.startsWith("/demo/")) {
      if (!key || !demoKey || key !== demoKey) return json({ error: "Invalid API key" }, 401);
      try {
        const out = await demoApi(url, request, env);
        return out instanceof Response ? out : json(out, out && out.error ? 400 : 200);
      } catch (e) {
        return json({ error: e.message }, 500);
      }
    }

    return new Response("Not found", { status: 404, headers: cors });
  }
};

async function demoApi(url, request, env) {
  const db = env.BC_DB;
  const p = url.pathname;

  // PRICING — live from the gateway (market price law: never hardcode)
  if (p === "/demo/pricing" && request.method === "GET") {
    const r = await env.GATEWAY_SVC.fetch("https://harz-gateway/api/pricing", { method: "GET" });
    const d = await r.json();
    return new Response(JSON.stringify({ gateway: d }), { status: r.status, headers: { "Content-Type": "application/json" } });
  }

  // CONTACTS — paste CSV: name,phone,tags
  if (p === "/demo/contacts/import" && request.method === "POST") {
    const body = await request.json();
    const csv = (body.csv || "").trim();
    if (!csv) throw new Error("csv required (lines of: name,phone,tags)");
    let ok = 0, dup = 0, bad = 0;
    for (const lineRaw of csv.split(/\r?\n/)) {
      const line = lineRaw.trim(); if (!line) continue;
      const parts = line.split(",").map(s => s.trim());
      const name = parts[0] || "Unknown";
      let phone = parts[1] || "";
      const tags = parts[2] || "";
      phone = normalizePhone(phone);
      if (!/^\d{10,15}$/.test(phone)) { bad++; continue; }
      const optOut = /stop/i.test(tags);
      try {
        await db.prepare("INSERT INTO contacts (id, name, phone, tags, opted_out, created_date) VALUES (?, ?, ?, ?, ?, ?)")
          .bind(crypto.randomUUID(), name, phone, tags, optOut ? 1 : 0, new Date().toISOString()).run();
        ok++;
      } catch (e) { dup++; }
    }
    const total = await db.prepare("SELECT COUNT(*) n FROM contacts").first();
    return { success: true, imported: ok, duplicates: dup, invalid: bad, total_contacts: total.n };
  }

  if (p === "/demo/contacts" && request.method === "GET") {
    const rows = await db.prepare("SELECT name, phone, tags, opted_out, created_date FROM contacts ORDER BY created_date DESC LIMIT 500").all();
    return { success: true, contacts: rows.results };
  }

  if (p === "/demo/contacts" && request.method === "DELETE") {
    await db.prepare("DELETE FROM contacts").run();
    return { success: true, cleared: true };
  }

  // CAMPAIGNS — create draft
  if (p === "/demo/campaigns" && request.method === "POST") {
    const body = await request.json();
    const name = body.name || "Campaign " + new Date().toLocaleDateString();
    const message = body.message || "";
    const tag_filter = body.tag_filter || "";
    if (!message) throw new Error("message required — use {{name}} to personalize");
    const id = crypto.randomUUID();
    await db.prepare("INSERT INTO campaigns (id, name, message, tag_filter, status, created_date) VALUES (?, ?, ?, ?, 'draft', ?)")
      .bind(id, name, message, tag_filter, new Date().toISOString()).run();
    return { success: true, campaign_id: id };
  }

  if (p === "/demo/campaigns" && request.method === "GET") {
    const rows = await db.prepare("SELECT id, name, message, tag_filter, status, sent_count, failed_count, skipped_count, cost_total, created_date FROM campaigns ORDER BY created_date DESC LIMIT 50").all();
    return { success: true, campaigns: rows.results };
  }

  // PREVIEW — who would receive it + live cost estimate
  if (p.startsWith("/demo/campaigns/") && p.endsWith("/preview") && request.method === "POST") {
    const id = p.split("/")[3];
    const c = await db.prepare("SELECT * FROM campaigns WHERE id = ?").bind(id).first();
    if (!c) throw new Error("campaign not found");
    const recipients = await selectRecipients(db, c.tag_filter);
    const priceR = await env.GATEWAY_SVC.fetch("https://harz-gateway/api/pricing");
    const priceD = await priceR.json().catch(() => null);
    const unit = priceD && priceD.pricing ? (priceD.pricing.find(x => x.type === "sms") || {}).cost || 250 : 250;
    return {
      success: true, campaign: { id: c.id, name: c.name, message: c.message, tag_filter: c.tag_filter },
      recipients: recipients.map(r => ({ name: r.name, phone: r.phone, opted_out: !!r.opted_out })),
      eligible: recipients.filter(r => !r.opted_out).length,
      opted_out: recipients.filter(r => r.opted_out).length,
      live_unit_cost: unit, estimated_cost: recipients.filter(r => !r.opted_out).length * unit,
      demo_cap: MAX_BATCH
    };
  }

  // TEST SEND — one real SMS to any phone (usually the buyer's own)
  if (p.startsWith("/demo/campaigns/") && p.endsWith("/test") && request.method === "POST") {
    const id = p.split("/")[3];
    const body = await request.json();
    const phone = normalizePhone(body.phone || "");
    if (!/^\d{10,15}$/.test(phone)) throw new Error("valid phone required");
    const c = await db.prepare("SELECT * FROM campaigns WHERE id = ?").bind(id).first();
    if (!c) throw new Error("campaign not found");
    const personalized = personalize(c.message, { name: "Test", phone });
    const res = await sendSms(env, phone, personalized);
    return { success: res.success, to: phone, message_id: res.message_id, cost: res.cost, error: res.error || null,
      note: res.success ? "Real SMS delivered through the live gateway rail" : "Honest failure — see error" };
  }

  // SEND — real batch, capped at MAX_BATCH for the demo, per-recipient ledger
  if (p.startsWith("/demo/campaigns/") && p.endsWith("/send") && request.method === "POST") {
    const id = p.split("/")[3];
    const c = await db.prepare("SELECT * FROM campaigns WHERE id = ?").bind(id).first();
    if (!c) throw new Error("campaign not found");
    if (c.status === "sent") throw new Error("campaign already sent");
    const all = await selectRecipients(db, c.tag_filter);
    const eligible = all.filter(r => !r.opted_out);
    const batch = eligible.slice(0, MAX_BATCH);
    let sent = 0, failed = 0, cost = 0;
    const results = [];
    for (const r of batch) {
      const msg = personalize(c.message, r);
      const res = await sendSms(env, r.phone, msg);
      if (res.success) { sent++; cost += (res.cost || 0); } else failed++;
      await db.prepare("INSERT INTO sends (id, campaign_id, contact_name, phone, status, message_id, cost, error, created_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)")
        .bind(crypto.randomUUID(), c.id, r.name, r.phone, res.success ? "sent" : "failed", res.message_id || null, res.cost || 0, res.error || null, new Date().toISOString()).run();
      results.push({ name: r.name, phone: r.phone, status: res.success ? "sent" : "failed", message_id: res.message_id, error: res.error || null });
      await sleep(350); // rate-limit friendly
    }
    for (const r of all.filter(r => !r.opted_out).slice(MAX_BATCH)) {
      await db.prepare("INSERT INTO sends (id, campaign_id, contact_name, phone, status, cost, error, created_date) VALUES (?, ?, ?, ?, 'skipped', 0, 'demo cap', ?)")
        .bind(crypto.randomUUID(), c.id, r.name, r.phone, new Date().toISOString()).run();
    }
    const skipped = Math.max(0, eligible.length - batch.length) + all.filter(r => r.opted_out).length;
    await db.prepare("UPDATE campaigns SET status='sent', sent_count=?, failed_count=?, skipped_count=?, cost_total=? WHERE id=?")
      .bind(sent, failed, skipped, cost, c.id).run();
    return { success: true, sent, failed, skipped_demo_cap: Math.max(0, eligible.length - batch.length), opted_out: all.filter(r => r.opted_out).length, cost_total: cost, recipients: results, demo_cap_note: "Demo sends real SMS to at most " + MAX_BATCH + " recipients per campaign" };
  }

  // REPORT — per-recipient ledger with honest statuses
  if (p.startsWith("/demo/campaigns/") && p.endsWith("/report") && request.method === "GET") {
    const id = p.split("/")[3];
    const c = await db.prepare("SELECT * FROM campaigns WHERE id = ?").bind(id).first();
    if (!c) throw new Error("campaign not found");
    const rows = await db.prepare("SELECT contact_name, phone, status, message_id, cost, error, created_date FROM sends WHERE campaign_id = ? ORDER BY created_date ASC").bind(id).all();
    return { success: true, campaign: c, ledger: rows.results,
      totals: { sent: c.sent_count, failed: c.failed_count, skipped: c.skipped_count, cost: c.cost_total } };
  }

  throw new Error("unknown demo route: " + p);
}

async function selectRecipients(db, tagFilter) {
  let rows;
  if (tagFilter) {
    rows = await db.prepare("SELECT name, phone, tags, opted_out FROM contacts WHERE tags LIKE ? ORDER BY created_date ASC").bind("%" + tagFilter + "%").all();
  } else {
    rows = await db.prepare("SELECT name, phone, tags, opted_out FROM contacts ORDER BY created_date ASC").all();
  }
  return rows.results;
}

async function sendSms(env, phone, message) {
  try {
    const key = env.DEMO_API_KEY;
    const r = await env.GATEWAY_SVC.fetch("https://harz-gateway/api/sms/send", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-API-Key": key },
      body: JSON.stringify({ to: phone, message, sender: "HARZ", channel: "sms" })
    });
    const d = await r.json();
    if (r.ok && d.success) {
      return { success: true, message_id: d.messages && d.messages[0] ? d.messages[0].message_id : d.message_id, cost: d.total_cost };
    }
    return { success: false, error: (d.error || ("HTTP " + r.status)) + (d.details ? " — " + JSON.stringify(d.details).slice(0, 120) : "") };
  } catch (e) {
    return { success: false, error: "transport: " + e.message };
  }
}

function personalize(msg, r) {
  return msg.replace(/\{\{\s*name\s*\}\}/g, r.name || "customer").replace(/\{\{\s*phone\s*\}\}/g, r.phone || "");
}

function normalizePhone(p) {
  let d = (p || "").replace(/\D/g, "");
  if (d.startsWith("234")) return d;
  if (d.startsWith("0")) return "234" + d.slice(1);
  if (d.length === 10) return "234" + d;
  return d;
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

// ---------------- CONSOLE UI (mobile-first PWA, WhatsApp-formatted for the buyer's phone) ----------------
function consoleUI() {
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#f0f2f5"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-title" content="HARZ Broadcast"><link rel="manifest" href="/manifest.json"><title>HARZ Broadcast Console — Bulk WhatsApp/SMS Campaigns</title><style>
*{margin:0;padding:0;box-sizing:border-box;font-family:system-ui,-apple-system,sans-serif}body{background:#f0f2f5;color:#333;padding:env(safe-area-inset-top) 14px 40px;max-width:520px;margin:0 auto}
.hd{padding:18px 0 10px;border-bottom:1px solid #e0e0e0}.hd h1{font-size:21px;color:${BRAND};font-weight:800}.hd p{font-size:12px;color:#666;margin-top:3px}
.step{background:#fff;border-radius:14px;padding:14px;margin:12px 0;box-shadow:0 1px 3px rgba(0,0,0,.06)}.step h3{font-size:14px;color:${BRAND};margin-bottom:8px;display:flex;gap:6px;align-items:center}
.step h3 .num{background:${BRAND};color:#fff;width:20px;height:20px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:11px}
textarea,input{width:100%;border:1px solid #d0d0d0;border-radius:10px;padding:10px;font-size:13px;background:#fff;color:#333}
textarea{min-height:70px;resize:vertical}.btn{width:100%;background:${BRAND};color:#fff;border:none;padding:11px;border-radius:10px;font-size:14px;font-weight:600;margin-top:8px;cursor:pointer}.btn:disabled{opacity:.5}.btn.sec{background:#e8f5e9;color:${BRAND}}
.stat{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-top:8px}.stat div{background:#f0f2f5;border-radius:10px;padding:10px;text-align:center}.stat .n{font-size:17px;font-weight:800;color:${BRAND}}.stat .l{font-size:10px;color:#666;margin-top:2px}
pre{background:#f6f8f6;border-radius:10px;padding:10px;font-size:11px;overflow-x:auto;white-space:pre-wrap;word-break:break-all;max-height:260px}
.row{display:flex;justify-content:space-between;font-size:12px;padding:7px 0;border-bottom:1px solid #eee}.pill{font-size:10px;padding:2px 8px;border-radius:10px}.pill.sent{background:#e8f5e9;color:${BRAND}}.pill.failed{background:#ffebee;color:#b00020}.pill.skipped{background:#fff3e0;color:#e65100}
.wa{background:#fff8e1;border:1px solid #f0c000;border-radius:10px;padding:10px;font-size:11px;color:#7a5c00;margin-top:8px;line-height:1.5}
.api{background:#f0f2f5;border-radius:10px;padding:10px;font-size:10px;color:#555;overflow-x:auto;white-space:pre;font-family:monospace}
.ok{color:${BRAND};font-weight:600}.err{color:#b00020;font-weight:600}.small{font-size:11px;color:#666}
</style></head><body>
<div class="hd"><h1>HARZ Broadcast Console</h1><p>Bulk WhatsApp/SMS campaign manager — live demo, real SMS delivery</p></div>

<div class="step"><h3><span class="num">1</span> Import contacts</h3>
<textarea id="csv" placeholder="Paste CSV — one per line:&#10;Aisha,08012345678,vip&#10;Emeka,08123456789,lagos&#10;Fatima,07098765432,stop"></textarea>
<button class="btn" id="impBtn" onclick="imp()">Import contacts</button>
<div class="small" id="impRes" style="margin-top:6px">Tip: putting "stop" in the tags column opts a contact out — the engine suppresses them automatically.</div>
</div>

<div class="step"><h3><span class="num">2</span> Create campaign</h3>
<input id="cname" placeholder="Campaign name (e.g. Sallah Promo)">
<textarea id="cmsg" placeholder="Message — use {{name}} to personalize:&#10;Hi {{name}}! 20% off everything this weekend at HARZ. Reply STOP to opt out."></textarea>
<input id="ctag" placeholder="Segment tag filter (optional, e.g. vip)">
<button class="btn" id="cBtn" onclick="createCamp()">Create draft</button>
</div>

<div class="step"><h3><span class="num">3</span> Preview &amp; cost</h3>
<button class="btn sec" onclick="preview()">Preview recipients + live cost</button>
<div id="prev"></div>
</div>

<div class="step"><h3><span class="num">4</span> Test on your own phone (real SMS)</h3>
<input id="tphone" placeholder="Your own number — a real SMS arrives">
<button class="btn" onclick="testSend()">Send test to me</button>
<div class="small" id="testRes" style="margin-top:6px"></div>
</div>

<div class="step"><h3><span class="num">5</span> Send the campaign</h3>
<button class="btn" onclick="sendCamp()">Send now (real delivery, demo cap 10)</button>
<div id="sendRes"></div>
</div>

<div class="step"><h3><span class="num">6</span> Delivery report</h3>
<button class="btn sec" onclick="report()">Open report</button>
<div id="rep"></div>
</div>

<div class="step"><h3>For merchants — how integration works</h3>
<div class="api">POST /demo/campaigns    {"name","message","tag_filter"}
POST .../test          {"phone":"your own"}
POST .../send          → per-recipient ledger, honest statuses
GET  .../report        → sent / failed / skipped + costs
GET  /demo/pricing     → live unit price (market rate, never hardcoded)</div>
<div class="wa"><b>WhatsApp channel:</b> the engine is channel-agnostic. SMS rides our live aggregator rail (watch it work above). WhatsApp sends activate on YOUR WhatsApp Business API credentials — plug them in and the same campaigns, segments and reports flow through WhatsApp. We build the orchestration; you keep your Meta account. That is the honest architecture.</div>
<p class="small" style="margin-top:8px">HARZ Digital Services · Bulk messaging that survives bad networks — ask about offline mesh delivery.</p>
</div>
<script>
var KEY=location.hash.slice(1)||"hzg_demod0613989b3bae130ed7bf6e8";
function H(){return{"Content-Type":"application/json","X-API-Key":KEY}}
async function api(p,m,b){var r=await fetch(p,{method:m||"GET",headers:H(),body:b?JSON.stringify(b):undefined});return {ok:r.ok,d:await r.json()}}
function el(id){return document.getElementById(id)}
function stat(a,b,c){return '<div class="stat"><div><div class="n">'+a+'</div><div class="l">'+b+'</div></div><div><div class="n">'+c+'</div><div class="l">live unit ₦</div></div></div>'}
async function imp(){el("impBtn").disabled=true;var r=await api("/demo/contacts/import","POST",{csv:el("csv").value});el("impRes").innerHTML=r.ok?'<span class="ok">Imported '+r.d.imported+', duplicates '+r.d.duplicates+', invalid '+r.d.invalid+'. Total: '+r.d.total_contacts+'</span>':'<span class="err">'+(r.d.error||"failed")+'</span>';el("impBtn").disabled=false}
async function createCamp(){el("cBtn").disabled=true;var r=await api("/demo/campaigns","POST",{name:el("cname").value,message:el("cmsg").value,tag_filter:el("ctag").value});el("cBtn").disabled=false;if(!r.ok){alert(r.d.error);return}window.CID=r.d.campaign_id;el("sendRes").innerHTML=el("prev").innerHTML="";el("testRes").textContent="Draft saved.";el("rep").innerHTML=""}
async function preview(){if(!window.CID){alert("Create the campaign first");return}var r=await api("/demo/campaigns/"+window.CID+"/preview","POST");if(!r.ok){el("prev").innerHTML='<span class="err">'+r.d.error+'</span>';return}var d=r.d;el("prev").innerHTML='<div class="stat"><div><div class="n">'+d.eligible+'</div><div class="l">eligible</div></div><div><div class="n">'+d.opted_out+'</div><div class="l">opted out</div></div><div><div class="n">₦'+d.estimated_cost+'</div><div class="l">est. cost (live)</div></div></div><div class="small">Live unit price ₦'+d.live_unit_cost+'/SMS · demo cap '+d.demo_cap+' recipients per send</div><pre>'+d.recipients.map(function(x){return x.name+" · "+x.phone+(x.opted_out?" · OPTED OUT":"")}).join("\\n")+'</pre>'}
async function testSend(){if(!window.CID){alert("Create the campaign first");return}var r=await api("/demo/campaigns/"+window.CID+"/test","POST",{phone:el("tphone").value});el("testRes").innerHTML=r.ok&&r.d.success?'<span class="ok">Real SMS sent — check your phone. message_id '+r.d.message_id+' · cost ₦'+r.d.cost+'</span>':'<span class="err">'+(r.d.error||"failed")+'</span>'}
async function sendCamp(){if(!window.CID){alert("Create the campaign first");return}el("sendRes").innerHTML="<span class='small'>Sending…</span>";var r=await api("/demo/campaigns/"+window.CID+"/send","POST");if(!r.ok){el("sendRes").innerHTML='<span class="err">'+r.d.error+'</span>';return}var d=r.d;el("sendRes").innerHTML='<div class="stat"><div><div class="n">'+d.sent+'</div><div class="l">sent</div></div><div><div class="n">'+d.failed+'</div><div class="l">failed</div></div><div><div class="n">₦'+d.cost_total+'</div><div class="l">cost</div></div></div><pre>'+d.recipients.map(function(x){return x.name+" · "+x.phone+" · "+x.status+(x.error?" · "+x.error:"")}).join("\\n")+'</pre>'}
async function report(){if(!window.CID){alert("Create the campaign first");return}var r=await api("/demo/campaigns/"+window.CID+"/report");if(!r.ok){el("rep").innerHTML='<span class="err">'+r.d.error+'</span>';return}var d=r.d;el("rep").innerHTML='<div class="small">Campaign: '+d.campaign.name+'</div>'+d.ledger.map(function(x){return '<div class="row"><span>'+x.contact_name+' · '+x.phone+'</span><span class="pill '+x.status+'">'+x.status+(x.error&&x.status==="failed"?" · "+x.error:"")+'</span></div>'}).join("")+'<button class="btn sec" onclick="exp()">Export CSV</button>'}
function exp(){if(!window.CID)return;window.open("/demo/campaigns/"+window.CID+"/report")}
if("serviceWorker" in navigator){navigator.serviceWorker.register("/sw.js")}
</script></body></html>`;
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}

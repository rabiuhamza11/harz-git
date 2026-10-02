// HarzGit D1 row 61: harz-dialweb-v2.1.0
// DialWeb v2.1.0 full source: USSD token checkout (kasuwa option 5), cert verify (option 6), /cert/:code page, /api/order/confirm, /api/orders. Bindings DIALWEB + ORBITAL_SVC + UNIFIED.


var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// index.js
var ICON192 = "iVBORw0KGgoAAAANSUhEUgAAAMAAAADACAIAAADdvvtQAAADEklEQVR42u3dMW7jQBBEUZ/SsY/jE/icggHnzhxbokRWdT/g5yv2POyuNEPy7e3jXXo8IxBAAkgACSAJIAGkekC37x/pL4AEkAASQAIIIAEkgASQAAJIAAkgASSAABJAAkgACSAJIAEkgATQ8nkZCEAHJrV7MgA9R8/a4QAEEEAZenbOByCAAAIIIIAAAggggAACCCCA/A4EEEAAmZG9MIDsxgMkgAQQQAJIAEkgASQBJIAEkAASQAAJIAEUNJqvzyMBtAjQQSubVS0FdJqY8Z4WAQpBMwzTfEDhbtoljQV04XKukjQNUOyCTZU0B1DXwoxhNAFQ+zJUf/5uQNP+P1F4Oa2Ahn837rm6PkCLfqNruNImQDu3C8KvugbQ8v3L2MvvAGTrO3YO6YDQCZ9JNCB68ieTCwidihGFAqKnZVCJgOgpGlccIHq6hpYFiJ660QUBoqdxgB2A4IidYQogekonGQGInt55AgRQOaBGPdUnxLcAKji1mX3kdwWg5L9+7nLTdXRzPqBqOjmMhgNqOqDZyeiECQP0cj2ZJzknA5qnJ9AQQGV6rjI0FlDOv1+n6Uk7VA4QQAAt0xNlCCCAAAIIIIAAAggg38J8C/MtDCCA/BLtl2h7YfbC7MbbjXecw3kggJxIdCLRmWhnot2V4a6Mfbf1uC/MfWHuTHVnKkAAeToHPcOfzsFQ7ww9oWyFnhWAGGocnae00jMLEENd4/KkenomAmKoZUTe1jOQjrf1MFQzE28sRGcBoJt3pnpn6jlD9NZmgDBqutI+QBsYFV1dK6C7Bt0iqfFyugHdO/dMSdWffwKgB5bh8sXo+rQrAD28MCftWqd+MICev2AHF+/CPxqgXEmnVTbe8YBaJLVOdQ+gQEwTJrkT0FWeBo4OoBep2jIlgASQABJAAgggASSABJAAAkgACSABJIAAEkACSAAJIAkgASSABJAAAkgACSABJIAAEkACSAAJIIAEkAASQAJIAkgACSABJIAAEkACSAAJIIAEkAASQAIIIAGkHEDSvzICASSABJAAkgASQGrpF2YtaYwK8J7RAAAAAElFTkSuQmCC";
var ICON512 = "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";
var ORBITAL = "https://harz-orbital.harz.workers.dev/api/";
var CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET,POST,OPTIONS", "Access-Control-Allow-Headers": "Content-Type" };
var ALLOWED_DW = ["https://harz-super-app.harz.workers.dev", "https://super-cloud.harz.workers.dev", "https://harz.workers.dev", "https://hamzarabiu390.workers.dev", "https://harz-dialweb.harz.workers.dev"];
function setCors(request) {
  var o = request.headers.get("Origin");
  CORS["Access-Control-Allow-Origin"] = ALLOWED_DW.indexOf(o) >= 0 ? o : ALLOWED_DW[0];
}

async function sha256(s) {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
__name(sha256, "sha256");
function b64ToBuffer(b64) {
  const bin = atob(b64);
  const buf = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
  return buf;
}
__name(b64ToBuffer, "b64ToBuffer");
function ussdEnd(s) {
  return "END " + s.slice(0, 160);
}
__name(ussdEnd, "ussdEnd");
function ussdCon(s) {
  return "CON " + s.slice(0, 160);
}
__name(ussdCon, "ussdCon");
function json(obj, status) {
  return new Response(JSON.stringify(obj), { status: status || 200, headers: Object.assign({ "Content-Type": "application/json" }, CORS) });
}
__name(json, "json");
async function initDb(env) {
  await env.DIALWEB.batch([
    env.DIALWEB.prepare("CREATE TABLE IF NOT EXISTS sites (code TEXT PRIMARY KEY, name TEXT, owner TEXT, pages TEXT, builtin INTEGER DEFAULT 0, created TEXT)"),
    env.DIALWEB.prepare("CREATE TABLE IF NOT EXISTS seals (seq INTEGER PRIMARY KEY AUTOINCREMENT, id TEXT, prev TEXT, hash TEXT, payload TEXT, ts TEXT)"),
    env.DIALWEB.prepare("CREATE TABLE IF NOT EXISTS dwsessions (seq INTEGER PRIMARY KEY AUTOINCREMENT, phone TEXT, text TEXT, ts TEXT, r13 TEXT)")
  ]);
  const n = await env.DIALWEB.prepare("SELECT COUNT(*) AS c FROM sites").first();
  if (n.c === 0) {
    const labari = JSON.stringify({
      home: { text: "LABARI NEWS (demo). 1. Headlines 2. Farming tips 3. Weather news 0. Exit", options: [{ page: "p1" }, { page: "p2" }, { page: "p3" }] },
      p1: { text: "HEADLINES: New farm road opens in Kano. Grain prices steady this week. Budget boosts internet-free rural services." },
      p2: { text: "FARMING TIP: Plant maize early. Store grain off the ground. Use raised floors against August floods." },
      p3: { text: "WEATHER: August rains peak this week. Farmers advised to harvest early and avoid river crossings." }
    });
    await env.DIALWEB.batch([
      env.DIALWEB.prepare("INSERT INTO sites (code, name, owner, pages, builtin, created) VALUES (?, ?, ?, ?, 0, ?)").bind("52", "LABARI News", "HARZ", labari, (/* @__PURE__ */ new Date()).toISOString()),
      env.DIALWEB.prepare("INSERT INTO sites (code, name, owner, pages, builtin, created) VALUES (?, ?, ?, ?, 1, ?)").bind("39", "KASUWA Market", "HARZ", "[]", (/* @__PURE__ */ new Date()).toISOString())
    ]);
  }
}
__name(initDb, "initDb");
async function sealIt(env, phone, payload) {
  const last = await env.DIALWEB.prepare("SELECT seq, hash FROM seals ORDER BY seq DESC LIMIT 1").first();
  const seq = (last ? last.seq : 0) + 1;
  const prev = last ? last.hash : "GENESIS";
  const id = "DW-" + String(seq).padStart(5, "0");
  const ts = (/* @__PURE__ */ new Date()).toISOString();
  const hash = await sha256(prev + "|" + id + "|" + phone + "|" + payload + "|" + ts);
  await env.DIALWEB.prepare("INSERT INTO seals (id, prev, hash, payload, ts) VALUES (?, ?, ?, ?, ?)").bind(id, prev, hash, payload, ts).run();
  return id;
}
__name(sealIt, "sealIt");
async function askOrbital(env, ep, lat, lon) {
  const u = ORBITAL + ep + "?lat=" + lat + "&lon=" + lon;
  let r;
  try {
    r = await env.ORBITAL_SVC.fetch("https://orbital.internal" + u.replace("https://harz-orbital.harz.workers.dev", ""));
  } catch (e) {
    r = await fetch(u);
  }
  return await r.json();
}
__name(askOrbital, "askOrbital");
function parseCoord(p) {
  if (p.includes(".")) return parseFloat(p);
  return parseInt(p, 10) / 1e4;
}
__name(parseCoord, "parseCoord");
var KASUWA_HOME = "KASUWA MARKET\n1. Grain prices\n2. Flood check\n3. Land receipt\n4. Voice line\n5. Buy tokens\n6. Verify cert\n0. Exit";
var PRICES = { maize: 48500, sorghum: 42500, millet: 39e3, rice: 78e3 };
async function certLookup(env, code) {
  try {
    const cc = await env.UNIFIED.prepare("SELECT credit_id, producer_name, energy_source, kwh_certified, co2_saved_kg FROM carbon_credits WHERE UPPER(credit_id)=?").bind(code).first();
    if (cc) return { code: cc.credit_id, who: cc.producer_name, src: cc.energy_source, kwh: cc.kwh_certified, co2: cc.co2_saved_kg };
    const en = await env.UNIFIED.prepare("SELECT nft_id, producer_name, energy_source, kwh_certified, co2_saved_kg FROM energy_nfts WHERE UPPER(nft_id)=?").bind(code).first();
    if (en) return { code: en.nft_id, who: en.producer_name, src: en.energy_source, kwh: en.kwh_certified, co2: en.co2_saved_kg };
  } catch (e) {}
  return null;
}
__name(certLookup, "certLookup");
async function kasuwa(env, phone, seg) {
  if (seg.length === 0) return ussdCon(KASUWA_HOME);
  const c = seg[0];
  if (c === "0") return ussdEnd("Thank you for using DialWeb. Kasuwa is always open.");
  if (c === "1") {
    return ussdEnd("GRAIN PRICES/bag:\nMaize N" + PRICES.maize.toLocaleString() + "\nSorghum N" + PRICES.sorghum.toLocaleString() + "\nMillet N" + PRICES.millet.toLocaleString() + "\nRice N" + PRICES.rice.toLocaleString() + "\nKasuwa demo feed");
  }
  if (c === "2") {
    if (seg.length === 1) return ussdCon("FLOOD CHECK\nEnter location as\nLat*Lon\ne.g 90765*73986\n(Abuja center)");
    if (seg.length < 3) return ussdCon("Enter both numbers\nlike 90765*73986");
    let d;
    try {
      d = await askOrbital(env, "flood", parseCoord(seg[1]), parseCoord(seg[2]));
    } catch (e) {
      return ussdEnd("Satellite busy. Try again in a minute.");
    }
    const msg = "FLOOD RISK: " + String(d.floodRisk).toUpperCase() + " (" + d.floodRiskScore + "/100)\nElevation: " + (d.elevationM !== null && d.elevationM !== void 0 ? d.elevationM + "m" : "n/a") + "\nRain: " + d.annualRainfallMm + "mm/yr\nPeak rain: " + d.highestRiskMonth.month;
    const seal = await sealIt(env, phone, "FLOOD " + d.floodRisk + " " + d.floodRiskScore + "/100 @" + seg[1] + "," + seg[2]);
    return ussdEnd(msg + "\nSeal " + seal + "\nNotarized by HARZ");
  }
  if (c === "3") {
    if (seg.length === 1) return ussdCon("LAND RECEIPT\nEnter area code and\nplot size, like\n90765*5");
    if (seg.length < 3) return ussdCon("Enter both:\narea code*plots\ne.g 90765*5");
    const payload = "LAND area " + seg[1] + " plots " + seg[2] + " holder " + phone;
    const seal = await sealIt(env, phone, payload);
    return ussdEnd("LAND RECEIPT\nArea: " + seg[1] + "\nPlots: " + seg[2] + "\nHolder: " + phone + "\nSeal " + seal + "\nTamper-proof. HARZ");
  }
  if (c === "4") {
    if (seg.length === 1) return ussdCon("VOICE LINE\nChoose language:\n1. Hausa\n2. English\n3. Pidgin");
    const scripts = {
      "1": "Sannu! Kasuwa yau: Masara N48,500, Dawa N42,500, Shinkafa N78,000. Ruwan Agista na karuwa - kaucewa rafuka. Kai hari kasuwa da safe.",
      "2": "Hello! Market today: Maize N48,500, Sorghum N42,500, Rice N78,000 per bag. August rains are heavy - avoid flooded routes. Go to market early.",
      "3": "How far! Market today: Maize N48,500, Sorghum N42,500, Rice N78,000. August rain dey heavy - no pass flood area. Go market early."
    };
    return ussdEnd(scripts[seg[1]] || "Choose 1, 2 or 3.");
  }
  if (c === "5") {
    if (seg.length === 1) return ussdCon("BUY TOKENS\n1. GDEG N15/unit\n2. NRL N100/unit\n0. Back");
    if (seg.length === 2) return ussdCon("Enter quantity\n(e.g 100)");
    const prod = seg[1] === "1" ? "GDEG" : "NRL";
    const rate = seg[1] === "1" ? 15 : 100;
    const qty = parseInt(seg[2], 10) || 0;
    if (!qty || qty < 1 || qty > 1000000) return ussdCon("Enter quantity 1-1000000");
    const total = qty * rate;
    const oc = "KW" + String(Math.floor(10000 + Math.random() * 90000));
    const created = (/* @__PURE__ */ new Date()).toISOString();
    try {
      await env.UNIFIED.prepare("INSERT INTO kasuwa_orders (order_code, product, qty, amount_ngn, phone, status, created) VALUES (?, ?, ?, ?, ?, 'pending', ?)").bind(oc, prod, qty, total, phone, created).run();
    } catch (e) {}
    const seal = await sealIt(env, phone, "ORDER " + oc + " " + prod + " x" + qty + " N" + total);
    return ussdEnd("ORDER " + oc + "\n" + prod + " x" + qty + " = N" + total.toLocaleString() + "\nPay: UBA 2034326424\nRabiu H. Mohammed\nKeep code " + oc + "\nSeal " + seal);
  }
  if (c === "6") {
    if (seg.length === 1) return ussdCon("CERT VERIFY\nEnter code\ne.g CC-001 or\nENFT-001");
    const info = await certLookup(env, String(seg[1]).toUpperCase());
    if (!info) return ussdEnd("No certificate found for " + String(seg[1]).toUpperCase() + ". Check the code.");
    return ussdEnd("CERT " + info.code + " VALID\n" + info.who + "\n" + info.src + " " + info.kwh + " kWh\nCO2 saved " + info.co2 + "kg\nHARZ-verified");
  }
  return ussdCon("Invalid choice\n\n" + KASUWA_HOME);
}
__name(kasuwa, "kasuwa");
function walkSite(site, seg) {
  const pages = site.pages;
  let page = pages.home;
  if (!page) return ussdEnd("Site has no home page.");
  let idx = 0;
  while (idx < seg.length && page && Array.isArray(page.options)) {
    const n = parseInt(seg[idx], 10);
    const opt = page.options[n - 1];
    if (!opt) return ussdEnd("Invalid choice.");
    const nextId = opt.page || opt.id;
    page = pages[nextId];
    if (!page) return ussdEnd("Page missing.");
    idx++;
  }
  const text = page.text || "";
  if (Array.isArray(page.options) && page.options.length > 0) {
    return ussdCon(text);
  }
  return ussdEnd(text);
}
__name(walkSite, "walkSite");
async function meterSession(env, phone, text, out) {
  try {
    if (!phone || phone === "unknown" || !/^[0-9+]{10,15}$/.test(phone)) return;
    await initDb(env);
    const c = await env.DIALWEB.prepare("SELECT COUNT(*) AS c FROM dwsessions WHERE ts > datetime('now','-1 day')").first();
    if (c.c >= 20) {
      await env.DIALWEB.prepare("INSERT INTO dwsessions (phone, text, ts, r13) VALUES (?, ?, datetime('now'), 'capped')").bind(phone, (text || "").slice(0, 80)).run();
      return;
    }
    const ins = await env.DIALWEB.prepare("INSERT INTO dwsessions (phone, text, ts, r13) VALUES (?, ?, datetime('now'), 'pending')").bind(phone, (text || "").slice(0, 80)).run();
    const seq = ins && ins.meta && ins.meta.last_row_id ? ins.meta.last_row_id : null;
    const r = await fetch("https://harz-edge-gateway.harzco-business.workers.dev/api/test/send", {
      method: "POST",
      headers: { "Content-Type": "application/json", "User-Agent": "HARZ-DialWeb/2.0 (R13 metering)" },
      body: JSON.stringify({ to: phone, body: "DialWeb session completed - " + (out || "").replace(/^END\s*/, "").slice(0, 60) })
    });
    let j = {};
    try { j = await r.json(); } catch (e2) {}
    const st = j && (j.message_id || j.id) ? String(j.message_id || j.id) : (r && r.ok ? "fired" : "r13_error_" + (r ? r.status : "unknown"));
    if (seq) {
      await env.DIALWEB.prepare("UPDATE dwsessions SET r13 = ? WHERE seq = ?").bind(st, seq).run();
    } else {
      await env.DIALWEB.prepare("INSERT INTO dwsessions (phone, text, ts, r13) VALUES (?, ?, datetime('now'), ?)").bind(phone, (text || "").slice(0, 80), st).run();
    }
  } catch (e) {
    try {
      await env.DIALWEB.prepare("INSERT INTO dwsessions (phone, text, ts, r13) VALUES (?, ?, datetime('now'), 'error')").bind(String(phone || "unknown"), String(text || "").slice(0, 80)).run();
    } catch (e2) {}
  }
}
__name(meterSession, "meterSession");
async function handleUssd(env, phone, text) {
  await initDb(env);
  let clean = (text || "").replace(/#$/, "");
  const parts = clean.split("*").filter((x) => x !== "");
  if (parts[0] === "4279") parts.shift();
  const HOME = "HARZ DIALWEB\nThe telephone web\n1. Site directory\n2. About\n0. Exit";
  if (parts.length === 0) return ussdCon(HOME);
  if (parts[0] === "0") return ussdEnd("Thank you for browsing the telephone web. HARZ DialWeb.");
  if (parts[0] === "2") return ussdEnd("DialWeb is the open web for phones without internet. Anyone can publish a serverless site and anyone can browse it by USSD. Notarized on HARZ.");
  if (parts[0] === "1") {
    if (parts.length === 1) {
      const rows = await env.DIALWEB.prepare("SELECT code, name FROM sites ORDER BY code").all();
      let list = "DIALWEB SITES\n";
      rows.results.forEach((r) => {
        list += r.code + " " + r.name + "\n";
      });
      list += "Reply a code";
      return ussdCon(list.slice(0, 160));
    }
    parts.shift();
  }
  const code = parts[0];
  const rest = parts.slice(1);
  if (code === "39") return kasuwa(env, phone, rest);
  const site = await env.DIALWEB.prepare("SELECT * FROM sites WHERE code = ?").bind(code).first();
  if (!site) return ussdCon("No site with code " + code + ".\n\n1. Site directory\n0. Exit");
  let pages;
  try {
    pages = JSON.parse(site.pages);
  } catch (e) {
    return ussdEnd("Site data error.");
  }
  return walkSite({ pages }, rest);
}
__name(handleUssd, "handleUssd");
function validSite(pages) {
  if (!pages || typeof pages !== "object" || Array.isArray(pages)) return false;
  if (!pages.home || !pages.home.text) return false;
  const keys = Object.keys(pages);
  if (keys.length > 20) return false;
  for (const k of keys) {
    const p = pages[k];
    if (!p || typeof p.text !== "string" || p.text.length > 160) return false;
    if (p.options !== void 0) {
      if (!Array.isArray(p.options) || p.options.length > 9) return false;
      for (const o of p.options) {
        if (!o || typeof o.page !== "string" || !pages[o.page]) return false;
      }
    }
  }
  return true;
}
__name(validSite, "validSite");
async function handlePublish(env, body) {
  await initDb(env);
  if (!body || !body.name || !body.owner || !body.code || !body.pages) return json({ success: false, error: "Fields required: name, owner, code, pages" }, 400);
  const code = String(body.code).trim();
  if (!/^[0-9]{2}$/.test(code)) return json({ success: false, error: "code must be 2 digits" }, 400);
  if (code === "39") return json({ success: false, error: "39 is reserved for KASUWA" }, 400);
  if (String(body.name).length > 20 || String(body.owner).length > 30) return json({ success: false, error: "name max 20 chars, owner max 30" }, 400);
  if (!validSite(body.pages)) return json({ success: false, error: "invalid pages spec: each page needs text<=160, options<=9 with valid page targets" }, 400);
  const existing = await env.DIALWEB.prepare("SELECT owner FROM sites WHERE code = ?").bind(code).first();
  if (existing && existing.owner !== String(body.owner)) return json({ success: false, error: "code already taken by another owner" }, 409);
  await env.DIALWEB.prepare("INSERT INTO sites (code, name, owner, pages, builtin, created) VALUES (?, ?, ?, ?, 0, ?) ON CONFLICT(code) DO UPDATE SET name = excluded.name, pages = excluded.pages").bind(code, String(body.name), String(body.owner), JSON.stringify(body.pages), (/* @__PURE__ */ new Date()).toISOString()).run();
  return json({ success: true, code, name: body.name, dial: "*4279*" + code + "#", browse: "https://harz-dialweb.harz.workers.dev/ussd?phone=PHONE&text=" + code });
}
__name(handlePublish, "handlePublish");
var SW = "const C='dw-v2';self.addEventListener('install',e=>{self.skipWaiting()});self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>ks.filter(k=>k!==C).map(k=>caches.delete(k))).then(()=>self.clients.claim()))});self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(caches.open(C).then(c=>c.match(e.request).then(r=>{const f=fetch(e.request).then(res=>{if(res.ok)c.put(e.request,res.clone());return res}).catch(()=>r);return r||f})))});";
function dashboard() {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1"><meta name="theme-color" content="#f0f2f5"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-status-bar-style" content="default"><meta name="apple-mobile-web-app-title" content="DialWeb"><title>HARZ DialWeb \u2014 The Telephone Web</title><link rel="manifest" href="/manifest.json"><link rel="icon" href="/icon-192.png" type="image/png"><link rel="apple-touch-icon" href="/icon-192.png"><style>*{margin:0;padding:0;box-sizing:border-box;font-family:system-ui,-apple-system,sans-serif}body{background:#f0f2f5;color:#1a1a1a;padding:14px;max-width:640px;margin:0 auto}h1{color:#0056b3;font-size:22px}h2{font-size:15px;margin:18px 0 8px;color:#0056b3}.sub{color:#6c757d;font-size:12px;margin-top:2px}.badge{display:inline-block;background:#d4edda;color:#155724;font-size:10px;font-weight:700;padding:2px 8px;border-radius:10px;margin-top:6px}.card{background:#fff;border:1px solid #e3e6ea;border-radius:10px;padding:12px;margin-top:12px}.stats{display:flex;gap:8px;margin-top:12px}.stat{flex:1;background:#fff;border:1px solid #e3e6ea;border-radius:10px;padding:10px;text-align:center}.stat b{font-size:18px;color:#00605a;display:block}.stat span{font-size:10px;color:#888}.site{display:flex;justify-content:space-between;align-items:center;padding:9px 0;border-bottom:1px solid #eee;font-size:13px}.site:last-child{border-bottom:none}.code{background:#eef6ff;color:#0056b3;font-weight:700;border-radius:6px;padding:2px 8px;font-size:12px}input,textarea{width:100%;padding:9px;border:1px solid #ccc;border-radius:8px;font-size:13px;margin-top:4px;background:#fff}textarea{height:110px;font-family:monospace;font-size:11px}button{padding:9px 14px;border:none;border-radius:8px;font-weight:600;font-size:13px;cursor:pointer;margin-top:8px}.go{background:#1b5e20;color:#fff}.sec{background:#f8f9fa;color:#333;margin-left:6px}.msg{font-size:12px;margin-top:6px;color:#155724;white-space:pre-wrap}.phone{background:#1c1c1c;border-radius:18px;padding:14px;max-width:300px;margin:0 auto}.scr{background:#c7e6b8;color:#111;font-family:monospace;font-size:11px;white-space:pre-wrap;min-height:96px;border-radius:8px;padding:10px;line-height:1.45}.typed{color:#8fd18f;font-size:11px;font-family:monospace;min-height:14px;padding:6px 2px}.pad{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-top:10px}.pad button{margin:0;background:#333;color:#fff;font-size:15px;padding:12px 0;border-radius:9px}.pad .ok{background:#1b5e20}.pad .clr{background:#555;font-size:11px}footer{margin-top:18px;text-align:center;color:#adb5bd;font-size:10px;line-height:1.6}footer a{color:#0056b3;text-decoration:none}</style></head><body><h1>HARZ DialWeb</h1><p class="sub">The telephone web \u2014 browse serverless sites by USSD, no internet needed. World-first protocol.</p><span class="badge">PWA \u2022 Cloudflare D1</span><div class="stats"><div class="stat"><b id="nsites">&mdash;</b><span>Sites Registered</span></div><div class="stat"><b id="nseals">&mdash;</b><span>Notary Seals</span></div><div class="stat"><b id="nviews">&mdash;</b><span>Sessions Metered 24h</span></div></div><div class="card"><h2 style="margin:0 0 6px 0">Site Directory</h2><div id="sites">Loading...</div></div><div class="card"><h2 style="margin:0 0 6px 0">USSD Simulator</h2><div class="phone"><div class="scr" id="scr">Dial *4279# to browse the telephone web</div><div class="typed" id="typed">&nbsp;</div><input id="phone" value="" placeholder="Your phone number (metered on R13)" inputmode="tel" maxlength="15" style="margin-top:10px"><div class="pad"><button onclick="k(1)">1</button><button onclick="k(2)">2</button><button onclick="k(3)">3</button><button onclick="k(4)">4</button><button onclick="k(5)">5</button><button onclick="k(6)">6</button><button onclick="k(7)">7</button><button onclick="k(8)">8</button><button onclick="k(9)">9</button><button onclick="k('*')">*</button><button onclick="k(0)">0</button><button onclick="k('#')">#</button><button class="clr" onclick="reset()">CLEAR</button><button class="ok" onclick="dial()">SEND OK</button><button class="clr" onclick="back()">DEL</button></div></div></div><div class="card"><h2 style="margin:0 0 6px 0">Publish a Site (open protocol)</h2><input id="pname" placeholder="Site name (max 20 chars)"><input id="powner" placeholder="Owner (you)"><input id="pcode" placeholder="Dial code - 2 digits, e.g. 71" inputmode="numeric" maxlength="2"><textarea id="ppages" placeholder="Pages JSON example - press Load example below"></textarea><button class="sec" onclick="example()">Load example</button><button class="go" onclick="publish()">Publish site</button><div class="msg" id="pmsg"></div></div><footer>HARZ DialWeb \u2014 the world&#39;s first serverless telephone web<br><a href="https://harz-super-app.harz.workers.dev/">HARZ Super App</a> &bull; <a href="https://harz-skyeye.harz.workers.dev/">SkyEye</a> &bull; Powered by Cloudflare Workers + D1</footer><script>let t="",sess=null;
function k(x){t+=x;d()}
function back(){t=t.slice(0,-1);d()}
function reset(){t="";sess=null;d()}
function d(){document.getElementById("typed").textContent=(sess?"In session - reply with your choice. ":"Typing: ")+t}
async function dial(){
 if(!t){document.getElementById("scr").textContent=sess?"Type your reply first.":"Dial *4279# first";return}
 var ph=document.getElementById("phone").value.trim();
 if(!/^[0-9+]{10,15}$/.test(ph))ph="unknown";
 var full=t;
 if(sess&&t.indexOf("*")===-1){full="*"+sess.concat([t]).join("*")+"#"}
 document.getElementById("scr").textContent="Dialing "+full+" ...";
 try{
  const r=await fetch("/ussd?phone="+encodeURIComponent(ph)+"&text="+encodeURIComponent(full));
  const s=await r.text();
  document.getElementById("scr").textContent=s.replace(/^(CON|END)\\s*/,"");
  if(s.indexOf("END")===0){sess=null;t=""}
  else{sess=full.replace(/^\\*/,"").replace(/#$/,"").split("*").filter(function(x){return x!==""});t=""}
  d()
 }catch(e){document.getElementById("scr").textContent="Network busy. Try again."}
}
async function load(){
 try{
  const st=await(await fetch("/api/stats")).json();
  document.getElementById("nsites").textContent=st.sites;
  document.getElementById("nseals").textContent=st.seals;
  document.getElementById("nviews").textContent=st.dials24h;
  const r=await(await fetch("/api/sites")).json();
  document.getElementById("sites").innerHTML=r.sites.map(function(s){return "<div class='site'><span class='code'>"+s.code+"</span><span style='flex:1;margin-left:10px'>"+s.name+"</span><span style='color:#999;font-size:10px'>"+s.owner+(s.builtin?" &bull; built-in":" &bull; published")+"</span></div>"}).join("");
 }catch(e){document.getElementById("sites").textContent="Could not load registry."}
}
function example(){
 document.getElementById("pname").value="RADIO GIDA";
 document.getElementById("powner").value="demo";
 document.getElementById("pcode").value="71";
 document.getElementById("ppages").value='{"home":{"text":"RADIO GIDA\\\\n1. Today show 2. Advice 0. Exit","options":[{"page":"p1"},{"page":"p2"}]},"p1":{"text":"Today: how solar pumps cut fuel costs by half. Interview at 4pm."},"p2":{"text":"Advice: store grain in airtight bags. Sell when price rises, not when hungry."}}';
}
async function publish(){
 const body={name:document.getElementById("pname").value,owner:document.getElementById("powner").value,code:document.getElementById("pcode").value};
 try{body.pages=JSON.parse(document.getElementById("ppages").value)}catch(e){document.getElementById("pmsg").textContent="Pages JSON is not valid.";return}
 const r=await(await fetch("/api/publish",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)})).json();
 document.getElementById("pmsg").textContent=r.success?("Published! Anyone can now dial *4279*"+r.code+"# to browse "+r.name+"."):("Failed: "+(r.error||"unknown"));
 if(r.success){t="*4279*"+r.code+"#";sess=null;d();load()}
}
let deferredPrompt=null;
window.addEventListener("beforeinstallprompt",function(e){e.preventDefault();deferredPrompt=e});
load();
if('serviceWorker' in navigator)navigator.serviceWorker.register('/sw.js').catch(function(){});
<\/script></body></html>`;
}
__name(dashboard, "dashboard");
var index_default = {
  async fetch(request, env, ctx) {
    setCors(request);
    const url = new URL(request.url);
    const path = url.pathname;
    if (request.method === "OPTIONS") return new Response(null, { headers: CORS });
    if (path === "/manifest.json") return new Response(JSON.stringify({ name: "HARZ DialWeb \u2014 The Telephone Web", short_name: "DialWeb", start_url: "/", display: "standalone", background_color: "#f0f2f5", theme_color: "#f0f2f5", icons: [{ src: "/icon-192.png", sizes: "192x192", type: "image/png" }, { src: "/icon-512.png", sizes: "512x512", type: "image/png" }] }), { headers: { "Content-Type": "application/json" } });
    if (path === "/sw.js") return new Response(SW, { headers: { "Content-Type": "application/javascript" } });
    if (path === "/icon-192.png") return new Response(b64ToBuffer(ICON192), { headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=86400" } });
    if (path === "/icon-512.png") return new Response(b64ToBuffer(ICON512), { headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=86400" } });
    if (path === "/") return new Response(dashboard(), { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });
    if (path === "/ussd") {
      const phone = url.searchParams.get("phone") || "unknown";
      const text = url.searchParams.get("text") || "";
      try {
        const out = await handleUssd(env, phone, text);
        if (out.indexOf("END") === 0 && ctx && ctx.waitUntil) ctx.waitUntil(meterSession(env, phone, text, out));
        return new Response(out, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
      } catch (e) {
        return new Response("END DialWeb error. Try again.", { status: 200 });
      }
    }
    if (path === "/api/health") {
      let metered = -1;
      try { await initDb(env); const c = await env.DIALWEB.prepare("SELECT COUNT(*) AS c FROM dwsessions WHERE ts > datetime('now','-1 day')").first(); metered = c.c; } catch (e) {}
      return json({ ok: true, service: "HARZ DialWeb", version: "2.1.0",
        r13_metering: metered >= 20 ? "capped at 20/24h - sessions complete but are not metered" : "live - each completed session from a real phone fires one metered R13 message",
        r13_rail: "harz-edge-gateway (Harz SMSC - off-net pending Airtel IQ)",
        chain_settlement: "R13 settles on harz-chain-v2 per signed custody record",
        sessions_metered_24h: metered });
    }
    if (path === "/api/stats") {
      try {
        await initDb(env);
      } catch (e) {
      }
      try {
        const s = await env.DIALWEB.prepare("SELECT COUNT(*) AS c FROM sites").first();
        const se = await env.DIALWEB.prepare("SELECT COUNT(*) AS c FROM seals").first();
        const d24 = await env.DIALWEB.prepare("SELECT COUNT(*) AS c FROM dwsessions WHERE ts > datetime('now','-1 day')").first();
        return json({ sites: s.c, seals: se.c, dials24h: d24.c });
      } catch (e) {
        return json({ sites: 0, seals: 0, dials24h: 0 });
      }
    }
    if (path === "/api/sites") {
      await initDb(env);
      const rows = await env.DIALWEB.prepare("SELECT code, name, owner, builtin FROM sites ORDER BY code").all();
      return json({ success: true, sites: rows.results });
    }
    if (path === "/api/publish" && request.method === "POST") {
      let body;
      try {
        body = await request.json();
      } catch (e) {
        return json({ success: false, error: "invalid JSON" }, 400);
      }
      return handlePublish(env, body);
    }
if (path.startsWith("/site/") && request.method === "GET") {
      const code = path.slice(6).replace(/[^0-9]/g, "");
      await initDb(env);
      const site = await env.DIALWEB.prepare("SELECT code, name, owner, pages FROM sites WHERE code = ?").bind(code).first();
      if (!site) return new Response("Not found", { status: 404 });
      let pages = {};
      try { pages = JSON.parse(site.pages); } catch (e) {}
      const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      let cards = "";
      const ids = Object.keys(pages);
      if (ids.length === 0) cards = '<div class="card"><p>This site has no pages yet.</p></div>';
      for (const id of ids) {
        const p = pages[id] || {};
        const opts = Array.isArray(p.options) ? p.options : [];
        cards += '<div class="card"><h2>' + esc(id === "home" ? "Home" : id) + '</h2><p>' + esc(p.text || "") + '</p>' +
          (opts.length ? '<ol>' + opts.map((o) => '<li>' + esc(o.label || o.page || o.id || "?") + '</li>').join("") + '</ol>' : "") + '</div>';
      }
      const html = '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#f0f2f5"><title>' + esc(site.name) + ' - HARZ DialWeb</title><style>body{margin:0;font-family:system-ui,-apple-system,sans-serif;background:#f0f2f5;color:#1a1a1a;padding:14px;max-width:640px;margin:0 auto}h1{color:#0056b3;font-size:22px;margin:0}h2{font-size:15px;color:#0056b3;margin:0 0 6px}.sub{color:#6c757d;font-size:12px;margin-top:2px}.card{background:#fff;border:1px solid #e3e6ea;border-radius:10px;padding:12px;margin-top:12px}p{white-space:pre-wrap;font-size:14px;margin:0}ol{margin:8px 0 0;padding-left:20px;font-size:13px;color:#444}footer{margin-top:18px;text-align:center;color:#adb5bd;font-size:10px}footer a{color:#0056b3;text-decoration:none}</style></head><body><h1>' + esc(site.name) + '</h1><p class="sub">Site ' + esc(site.code) + ' - owner ' + esc(site.owner || "HARZ") + ' - also on USSD: *4279*' + esc(site.code) + '#</p>' + cards + '<footer><a href="/">HARZ DialWeb</a> - kasuwa.harz</footer></body></html>';
      return new Response(html, { headers: { "content-type": "text/html; charset=utf-8", "Access-Control-Allow-Origin": "*" } });
    }

    if (path.startsWith("/cert/") && request.method === "GET") {
      const ccode = decodeURIComponent(path.slice(6)).toUpperCase().replace(/[^A-Z0-9-]/g, "");
      await initDb(env);
      const info = await certLookup(env, ccode);
      const esc3 = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      if (!info) return new Response("<!DOCTYPE html><html><head><meta charset='UTF-8'><title>HARZ Cert</title><style>body{font-family:system-ui;background:#f0f2f5;color:#1a1a1a;padding:20px;text-align:center}</style></head><body><h2>Certificate " + esc3(ccode) + " not found</h2><p>Check the code and try again.</p></body></html>", { status: 404, headers: { "Content-Type": "text/html; charset=utf-8" } });
      const h2 = '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#f0f2f5"><title>Cert ' + esc3(info.code) + ' - HARZ</title><style>body{margin:0;font-family:system-ui,-apple-system,sans-serif;background:#f0f2f5;color:#1a1a1a;padding:16px;max-width:560px;margin:0 auto}h1{color:#00605a;font-size:20px}.card{background:#fff;border:1px solid #e3e6ea;border-radius:10px;padding:14px;margin-top:12px}.row{display:flex;justify-content:space-between;font-size:14px;padding:7px 0;border-bottom:1px solid #f0f0f0}.row:last-child{border:none}b{font-weight:600}.ok{color:#155724;font-weight:700}footer{margin-top:16px;text-align:center;color:#adb5bd;font-size:10px}</style></head><body><h1>Energy Certificate</h1><div class="card"><div class="row"><span>Code</span><b>' + esc3(info.code) + '</b></div><div class="row"><span>Producer</span><b>' + esc3(info.who) + '</b></div><div class="row"><span>Source</span><b>' + esc3(info.src) + '</b></div><div class="row"><span>Certified</span><b>' + info.kwh + ' kWh</b></div><div class="row"><span>CO2 saved</span><b>' + info.co2 + ' kg</b></div><div class="row"><span>Status</span><b class="ok">VALID - HARZ-verified</b></div></div><p style="font-size:12px;color:#6c757d;margin-top:10px">Verify anywhere: dial *4279*39#, option 6, enter the code.</p><footer>HARZ energy certificates - verify.harz</footer></body></html>';
      return new Response(h2, { headers: { "Content-Type": "text/html; charset=utf-8", "Access-Control-Allow-Origin": "*" } });
    }
    if (path === "/api/order/confirm" && request.method === "POST") {
      let b3;
      try { b3 = await request.json(); } catch (e) { return json({ success: false, error: "invalid JSON" }, 400); }
      if (!b3 || !b3.order_code) return json({ success: false, error: "order_code required" }, 400);
      try {
        const upd = await env.UNIFIED.prepare("UPDATE kasuwa_orders SET status='paid', ref=COALESCE(?, ref) WHERE order_code=? AND status='pending'").bind(b3.ref || null, String(b3.order_code)).run();
        return json({ success: upd.meta.changes > 0, order_code: String(b3.order_code), status: upd.meta.changes > 0 ? "paid" : "not_found_or_already_paid" });
      } catch (e) {
        return json({ success: false, error: String(e && e.message || e) }, 500);
      }
    }
    if (path === "/api/orders" && request.method === "GET") {
      await initDb(env);
      const rows = await env.UNIFIED.prepare("SELECT order_code, product, qty, amount_ngn, status, created FROM kasuwa_orders ORDER BY id DESC LIMIT 50").all();
      return json({ success: true, orders: rows.results });
    }
    return new Response("Not found", { status: 404 });
  }
};
export {
  index_default as default
};
//# sourceMappingURL=index.js.map

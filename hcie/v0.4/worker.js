// HARZ HCIE v0.1 — Continuous Information Exchange (Internet -> Internetless)
// Invariant: the Internet continuously refreshes HARZ; HARZ strengthens Internetless;
// Internetless stays useful when the Internet disappears.
// Law: only VERIFIED objects (hash-matched, captured bytes) may ever be presented as offline-available.
// A source row may say "advertised"; only an object row means we hold it.

const VERSION = "hcie-0.4.0";
const UA = "harz-hcie/0.1 (HARZ Continuity Exchange)";

const SEED_SOURCES = [
  { key: "dailytrust", url: "https://dailytrust.com/", title: "Daily Trust", tier: 15 },
  { key: "guardian-ng", url: "https://guardian.ng/", title: "The Guardian Nigeria", tier: 15 },
  { key: "cbn", url: "https://www.cbn.gov.ng/", title: "Central Bank of Nigeria", tier: 60 },
];

function j(o, s = 200) {
  return new Response(JSON.stringify(o, null, 1), {
    status: s,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}
function nowIso() { return new Date().toISOString(); }

// canonical text identity: never hash raw HTTP bytes (wrappers differ), hash the content
function canonicalText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}
async function sha256(text) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function ensureSeed(env) {
  for (const s of SEED_SOURCES) {
    await env.HARZ_DB.prepare(
      "INSERT OR IGNORE INTO hcie_sources (source_key,url,title,tier_min,created_ts) VALUES (?,?,?,?,?)"
    ).bind(s.key, s.url, s.title, String(s.tier), nowIso()).run();
  }
}

async function journal(env, sourceKey, objectId, state, detail) {
  await env.HARZ_DB.prepare(
    "INSERT INTO hcie_journal (ts,source_key,object_id,state,detail) VALUES (?,?,?,?,?)"
  ).bind(nowIso(), sourceKey, objectId, state, detail || null).run();
}

async function checkSource(env, src) {
  const headers = { "User-Agent": UA, Accept: "text/html,application/xhtml+xml" };
  if (src.etag) headers["If-None-Match"] = src.etag;
  if (src.last_modified) headers["If-Modified-Since"] = src.last_modified;

  let r;
  try {
    r = await fetch(src.url, { headers, redirect: "follow" });
  } catch (e) {
    await env.HARZ_DB.prepare(
      "UPDATE hcie_sources SET last_checked_ts=?, consecutive_failures=consecutive_failures+1, last_status=? WHERE source_key=?"
    ).bind(nowIso(), "FETCH_ERROR", src.source_key).run();
    await journal(env, src.source_key, null, "REJECTED", "fetch error: " + String(e.message || e).slice(0, 120));
    return { key: src.source_key, result: "ERROR" };
  }

  if (r.status === 304) {
    await env.HARZ_DB.prepare(
      "UPDATE hcie_sources SET last_checked_ts=?, consecutive_failures=0, last_status=? WHERE source_key=?"
    ).bind(nowIso(), "UNCHANGED_304", src.source_key).run();
    await journal(env, src.source_key, null, "UNCHANGED", "304 not modified (conditional GET)");
    return { key: src.source_key, result: "UNCHANGED" };
  }
  if (!r.ok) {
    await env.HARZ_DB.prepare(
      "UPDATE hcie_sources SET last_checked_ts=?, consecutive_failures=consecutive_failures+1, last_status=? WHERE source_key=?"
    ).bind(nowIso(), "HTTP_" + r.status, src.source_key).run();
    await journal(env, src.source_key, null, "REJECTED", "http " + r.status);
    return { key: src.source_key, result: "ERROR" };
  }

  const html = await r.text();
  const text = canonicalText(html);
  const minChars = (src.min_chars === null || src.min_chars === undefined) ? 200 : src.min_chars;
  if (text.length < minChars) {
    await journal(env, src.source_key, null, "REJECTED", "incomplete body (" + text.length + " chars) — refused as corrupt");
    await env.HARZ_DB.prepare(
      "UPDATE hcie_sources SET last_checked_ts=?, consecutive_failures=consecutive_failures+1, last_status=? WHERE source_key=?"
    ).bind(nowIso(), "INCOMPLETE", src.source_key).run();
    return { key: src.source_key, result: "REJECTED" };
  }

  const hash = await sha256(text);
  const etag = r.headers.get("etag");
  const lm = r.headers.get("last-modified");

  if (src.last_hash === hash) {
    await env.HARZ_DB.prepare(
      "UPDATE hcie_sources SET last_checked_ts=?, consecutive_failures=0, last_status=?, etag=?, last_modified=? WHERE source_key=?"
    ).bind(nowIso(), "UNCHANGED_HASH", etag, lm, src.source_key).run();
    await journal(env, src.source_key, null, "UNCHANGED", "content hash identical " + hash.slice(0, 12));
    return { key: src.source_key, result: "UNCHANGED" };
  }

  // new content -> immutable object, verified by re-hash of stored bytes
  const stored = text.slice(0, 200000);
  const verifyHash = await sha256(stored);
  const title = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [, src.title || src.source_key])[1].trim().slice(0, 180);

  // VERSION INSIDE THE INSERT (31 Oct 2026): the version is computed by the database in the same
  // statement, so two concurrent captures cannot both read the same MAX and duplicate a version.
  // ux_hcie_obj_version(source_key,version) makes any collision a hard error -> retried below.
  let ins = null, lastErr = null;
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      ins = await env.HARZ_DB.prepare(
        "INSERT OR IGNORE INTO hcie_objects (source_key,url,canonical_sha256,bytes,title,content,http_status,etag,captured_ts,verified,provenance,version) " +
        "SELECT ?,?,?,?,?,?,?,?,?,?,?, COALESCE(MAX(version),0)+1 FROM hcie_objects WHERE source_key=?"
      ).bind(src.source_key, src.url, verifyHash, stored.length, title, stored, r.status, etag || null, nowIso(),
        verifyHash === hash ? 1 : 0, "hcie-fetch:" + src.source_key, src.source_key).run();
      break;
    } catch (e) {
      lastErr = e;
      if (!/UNIQUE|constraint/i.test(String(e && e.message))) throw e;
      await new Promise(res => setTimeout(res, 25 * (attempt + 1)));
    }
  }
  if (!ins && lastErr) throw lastErr;

  const obj = await env.HARZ_DB.prepare(
    "SELECT id FROM hcie_objects WHERE source_key=? AND canonical_sha256=?"
  ).bind(src.source_key, verifyHash).first();
  const objectId = obj ? obj.id : null;

  await journal(env, src.source_key, objectId, "DETECTED", "new content " + hash.slice(0, 12) + " (" + stored.length + " chars)");
  await journal(env, src.source_key, objectId, "ACQUIRED", "fetched " + r.status + " from " + src.url);
  await journal(env, src.source_key, objectId, "VERIFIED", "re-hash matched: " + verifyHash.slice(0, 16));
  await journal(env, src.source_key, objectId, "PUBLISHED", "manifest entry created, available offline");

  await env.HARZ_DB.prepare(
    "UPDATE hcie_sources SET last_checked_ts=?, last_change_ts=?, last_hash=?, etag=?, last_modified=?, consecutive_failures=0, last_status=? WHERE source_key=?"
  ).bind(nowIso(), nowIso(), hash, etag, lm, "CHANGED", src.source_key).run();

  return { key: src.source_key, result: "CHANGED", object_id: objectId, sha256: verifyHash };
}

async function runCycle(env, onlyKey) {
  await ensureSeed(env);
  const started = nowIso();
  const rows = onlyKey
    ? (await env.HARZ_DB.prepare("SELECT * FROM hcie_sources WHERE source_key=?").bind(onlyKey).all()).results
    : (await env.HARZ_DB.prepare("SELECT * FROM hcie_sources ORDER BY id").all()).results;

  const results = [];
  for (const s of rows) results.push(await checkSource(env, s));

  const changed = results.filter((r) => r.result === "CHANGED").length;
  const unchanged = results.filter((r) => r.result === "UNCHANGED").length;
  const errors = results.filter((r) => r.result === "ERROR" || r.result === "REJECTED").length;
  const finished = nowIso();

  await env.HARZ_DB.prepare(
    "INSERT INTO hcie_runs (started_ts,finished_ts,status,sources_checked,changed,new_objects,unchanged,errors,detail) VALUES (?,?,?,?,?,?,?,?,?)"
  ).bind(started, finished, errors && !changed ? "partial" : "ok", results.length, changed, changed, unchanged, errors,
    JSON.stringify(results)).run();

  return { run: { started, finished, sources: results.length, changed, unchanged, errors }, results };
}

function stateOf(src, lastObject) {
  const now = Date.now();
  const tierMs = (parseInt(src.tier_min, 10) || 60) * 60000;
  const checked = src.last_checked_ts ? Date.parse(src.last_checked_ts) : 0;
  if (!lastObject) return "OFFLINE"; // never captured: advertised but not ours -> never shown as available
  if (!checked) return "CACHED";
  const age = now - checked;
  if (src.consecutive_failures > 0) return age > tierMs * 3 ? "STALE" : "CACHED";
  if (age <= tierMs * 2) return "LIVE";
  if (age <= tierMs * 3) return "CACHED";
  return "STALE";
}

async function status(env) {
  await ensureSeed(env);
  const sources = (await env.HARZ_DB.prepare("SELECT * FROM hcie_sources ORDER BY id").all()).results;
  const out = [];
  for (const s of sources) {
    const obj = await env.HARZ_DB.prepare(
      "SELECT id,title,canonical_sha256,bytes,captured_ts FROM hcie_objects WHERE source_key=? ORDER BY id DESC LIMIT 1"
    ).bind(s.source_key).first();
    const count = await env.HARZ_DB.prepare(
      "SELECT COUNT(*) n FROM hcie_objects WHERE source_key=?"
    ).bind(s.source_key).first();
    out.push({
      source: s.source_key, title: s.title, url: s.url, tier_min: s.tier_min,
      state: stateOf(s, obj), objects: count ? count.n : 0,
      latest: obj ? { id: obj.id, sha256: obj.canonical_sha256, bytes: obj.bytes, captured: obj.captured_ts, title: obj.title } : null,
      last_checked: s.last_checked_ts, last_change: s.last_change_ts, status: s.last_status,
      failures: s.consecutive_failures,
    });
  }
  const lastRun = await env.HARZ_DB.prepare("SELECT * FROM hcie_runs ORDER BY id DESC LIMIT 1").first();
  const totals = {
    sources: out.length,
    objects: (await env.HARZ_DB.prepare("SELECT COUNT(*) n FROM hcie_objects").first()).n,
    verified: (await env.HARZ_DB.prepare("SELECT COUNT(*) n FROM hcie_objects WHERE verified=1").first()).n,
    journal: (await env.HARZ_DB.prepare("SELECT COUNT(*) n FROM hcie_journal").first()).n,
  };
  return { version: VERSION, last_run: lastRun || null, totals, sources: out };
}

function page() {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>HARZ HCIE</title><link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#f0f2f5"><link rel="icon" href="/icon.svg">
<link rel="apple-touch-icon" href="/icon.svg"><meta name="apple-mobile-web-app-capable" content="yes">
<style>*{margin:0;padding:0;box-sizing:border-box;font-family:system-ui,-apple-system,sans-serif}
body{background:#f0f2f5;color:#1a1a2e;padding:16px}
h1{font-size:19px;color:#0f766e} .sub{font-size:11px;color:#666;margin-top:2px}
.card{background:#fff;border:1px solid #e3e8ee;border-radius:14px;padding:12px;margin-top:12px}
.row{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:9px 0;border-bottom:1px solid #f0f2f5}
.row:last-child{border-bottom:0} .nm{font-size:13px;font-weight:600}
.meta{font-size:10px;color:#777;margin-top:2px}
.b{font-size:10px;padding:2px 8px;border-radius:10px;font-weight:700}
.LIVE{background:#e6f4ea;color:#137333}.CACHED{background:#fff4e5;color:#8a5a00}
.STALE{background:#fde8e8;color:#a12a2a}.OFFLINE{background:#eceff3;color:#555}
.k{font-size:11px;color:#555} .num{font-size:20px;font-weight:800;color:#0f766e}
button{background:#0f766e;color:#fff;border:0;border-radius:10px;padding:11px 14px;font-size:13px;font-weight:600;width:100%;margin-top:12px}
pre{font-size:10px;white-space:pre-wrap;color:#444}</style></head><body>
<h1>HARZ HCIE</h1><div class="sub">Continuous Information Exchange v${VERSION.split("-")[1]} · internet refreshed, offline available</div>
<div class="card"><div class="row"><div><div class="nm">Sources</div><div class="meta">captured objects only count as available</div></div><div class="num" id="s">–</div></div>
<div class="row"><div class="nm">Verified objects</div><div class="k" id="o">–</div></div>
<div class="row"><div class="nm">Last cycle</div><div class="k" id="r">–</div></div></div>
<div class="card"><div class="nm">Sources &amp; states</div><div id="list" class="meta">loading…</div></div>
<button onclick="run()">Run a cycle now</button>
<div class="card"><div class="nm">Journal (latest 8)</div><pre id="jl">–</pre></div>
<script>
async function load(){const d=await (await fetch('/api/hcie/status')).json();
 s.textContent=d.totals.sources; o.textContent=d.totals.verified+' verified / '+d.totals.objects+' total';
 r.textContent=d.last_run?(d.last_run.finished_ts+' · '+d.last_run.changed+' changed'):'never';
 list.innerHTML=d.sources.map(x=>'<div class="row"><div><div class="nm">'+x.title+'</div><div class="meta">'+x.url.replace(/^https?:\\/\\//,'').slice(0,40)+' · every '+x.tier_min+'m · '+x.objects+' objects</div></div><span class="b '+x.state+'">'+x.state+'</span></div>').join('');
 const jr=await (await fetch('/api/hcie/journal?limit=8')).json();
 jl.textContent=jr.events.map(e=>e.ts.slice(11,19)+' '+e.state+' '+(e.source_key||'')+' '+(e.detail||'')).join('\\n');}
async function run(){jl.textContent='running…';await fetch('/api/hcie/check',{method:'POST',body:'{}'});load();}
load();
</script></body></html>`;
}

const MANIFEST = {
  name: "HARZ HCIE", short_name: "HCIE", start_url: "/", display: "standalone",
  background_color: "#f0f2f5", theme_color: "#f0f2f5",
  icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
};
const ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#0f766e"/><path d="M14 40l10-12 8 8 12-18" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="44" cy="18" r="3.5" fill="#fff"/></svg>`;

const READ_HTML = `<!DOCTYPE html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>HCIE Reader</title>
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#f0f2f5">
<link rel="apple-touch-icon" href="/icon.svg">
<link rel="icon" href="/icon.svg">
<style>
:root{--bg:#f0f2f5;--card:#fff;--ink:#12181f;--mut:#6b7785;--line:#e3e8ee;--teal:#0f766e;--amber:#b45309;--red:#b91c1c}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.55 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}
header{position:sticky;top:0;background:var(--bg);border-bottom:1px solid var(--line);padding:12px 14px;display:flex;align-items:center;gap:10px;z-index:5}
h1{font-size:16px;margin:0}.sub{color:var(--mut);font-size:11px}
main{padding:12px 14px 90px;max-width:760px;margin:0 auto}
.card{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:12px 14px;margin-bottom:10px}
.row{display:flex;justify-content:space-between;gap:10px;align-items:center}
.src{font-weight:700;font-size:14px}.meta{color:var(--mut);font-size:11px;margin-top:3px;word-break:break-all}
.badge{font-size:10px;font-weight:800;letter-spacing:.04em;padding:3px 8px;border-radius:999px;border:1px solid var(--line);white-space:nowrap}
.b-live{background:#e7f6f1;color:var(--teal);border-color:#bfe6da}
.b-cached{background:#eef2ff;color:#3730a3;border-color:#c7d2fe}
.b-offline{background:#fef3c7;color:var(--amber);border-color:#fde68a}
.b-unavail{background:#fee2e2;color:var(--red);border-color:#fecaca}
button{font:inherit;font-weight:700;background:var(--teal);color:#fff;border:0;border-radius:10px;padding:9px 14px}
button.ghost{background:#fff;color:var(--teal);border:1px solid var(--line)}
.doc{white-space:pre-wrap;font-size:14px;line-height:1.6}
.verify{font-size:11px;color:var(--mut);margin-top:8px;word-break:break-all}
.bar{position:fixed;left:0;right:0;bottom:0;background:#fff;border-top:1px solid var(--line);padding:8px 14px;font-size:11px;color:var(--mut);display:flex;justify-content:space-between}
</style></head><body>
<header><img src="/icon.svg" width="30" height="30" alt="" style="border-radius:9px"><div><h1>HCIE Reader</h1>
<div class="sub">verified objects only &middot; offline capable</div></div></header>
<main>
<div class="card" id="netcard"><div class="row"><div class="src">Connection</div><span class="badge" id="netbadge">checking</span></div>
<div class="meta">LIVE means fetched and hash-verified now. CACHED means stored and verified earlier. OFFLINE means read from storage with no network. UNAVAILABLE means we do not hold it.</div></div>
<div id="list"></div>
<div id="view"></div>
</main>
<div class="bar"><span id="stat">objects: 0 cached: 0</span><span>HCIE v0.3</span></div>
<script>
var KEY='harz_hcie_cache_v1';
function cacheGet(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){return {}}}
function cacheSet(o){localStorage.setItem(KEY,JSON.stringify(o))}
function cachedIds(){return Object.keys(cacheGet())}
async function sha256hex(txt){var b=new TextEncoder().encode(txt);var h=await crypto.subtle.digest('SHA-256',b);
 return Array.from(new Uint8Array(h)).map(function(x){return x.toString(16).padStart(2,'0')}).join('')}
function badge(cls,label){return '<span class="badge '+cls+'">'+label+'</span>'}
function setNet(){var on=navigator.onLine;document.getElementById('netbadge').outerHTML='<span class="badge '+(on?'b-live':'b-offline')+'" id="netbadge">'+(on?'ONLINE':'OFFLINE')+'</span>'}
window.addEventListener('online',setNet);window.addEventListener('offline',setNet);setNet();
var MANIFEST=[];
async function loadManifest(){
  var c=cacheGet();
  try{
    var r=await fetch('/api/hcie/manifest',{cache:'no-store'});var m=await r.json();MANIFEST=m.objects||[];
    localStorage.setItem('harz_hcie_manifest',JSON.stringify(MANIFEST));
  }catch(e){MANIFEST=JSON.parse(localStorage.getItem('harz_hcie_manifest')||'[]')}
  render();
}
function render(){
  var c=cacheGet(),html='';
  if(!MANIFEST.length){html='<div class="card">No manifest available and nothing cached.</div>'}
  MANIFEST.forEach(function(o){
    var held=!!c[o.id];
    html+='<div class="card"><div class="row"><div><div class="src">'+o.source_key+' &middot; v'+o.version+'</div>'+
      '<div class="meta">'+o.bytes+' bytes &middot; '+o.canonical_sha256.slice(0,16)+'…</div></div>'+
      badge(held?'b-cached':'b-unavail', held?'CACHED':'UNAVAILABLE')+'</div>'+
      '<div class="row" style="margin-top:10px"><button onclick="open_obj('+o.id+')">Open</button>'+
      (held?'<button class="ghost" onclick="drop('+o.id+')">Remove copy</button>':'')+'</div></div>';
  });
  document.getElementById('list').innerHTML=html;
  document.getElementById('stat').textContent='objects: '+MANIFEST.length+' cached: '+cachedIds().length;
}
function drop(id){var c=cacheGet();delete c[id];cacheSet(c);render();document.getElementById('view').innerHTML=''}
async function open_obj(id){
  var c=cacheGet(),v=document.getElementById('view');
  if(!navigator.onLine&&c[id]){return show(c[id],'OFFLINE')}
  try{
    var r=await fetch('/api/hcie/object/'+id,{cache:'no-store'});
    if(!r.ok)throw new Error('http '+r.status);
    var o=await r.json();
    var expect=(o.canonical_sha256||'').toLowerCase();
    var got=await sha256hex(o.content||'');
    if(expect&&got!==expect){
      v.innerHTML='<div class="card"><div class="row"><div class="src">Integrity refused</div>'+badge('b-unavail','REJECTED')+'</div>'+
      '<div class="meta">expected '+expect.slice(0,24)+'… got '+got.slice(0,24)+'… — content NOT stored.</div></div>';return;
    }
    c[id]={id:id,source_key:o.source_key,version:o.version,content:o.content,sha256:got,at:new Date().toISOString()};
    cacheSet(c);render();show(c[id],'LIVE');
  }catch(e){
    if(c[id])return show(c[id],'CACHED');
    v.innerHTML='<div class="card"><div class="row"><div class="src">Not available</div>'+badge('b-unavail','UNAVAILABLE')+'</div>'+
    '<div class="meta">no network and no cached copy: '+String(e.message||e)+'</div></div>';
  }
}
function show(rec,label){
  var cls=label==='LIVE'?'b-live':(label==='CACHED'?'b-cached':'b-offline');
  document.getElementById('view').innerHTML='<div class="card" style="margin-top:14px"><div class="row"><div>'+
   '<div class="src">'+rec.source_key+' &middot; v'+rec.version+'</div><div class="meta">stored '+rec.at+'</div></div>'+
   badge(cls,label)+'</div><div class="doc" style="margin-top:12px">'+
   (rec.content||'').replace(/</g,'&lt;')+'</div>'+
   '<div class="verify">sha256 '+rec.sha256+'</div></div>';
  window.scrollTo({top:document.body.scrollHeight,behavior:'smooth'});
}
loadManifest();
if(navigator.onLine){fetch('/api/hcie/check',{method:'POST',body:'{}'}).then(loadManifest).catch(function(){})}
</script></body></html>`;


const BUNDLE_HTML = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>HARZ Gate 3 Bundle</title><style>
:root{--bg:#f0f2f5;--teal:#0f766e;--ink:#111827;--line:#dfe4ea;--warn:#b45309;--ok:#0f766e}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.5 -apple-system,Segoe UI,Roboto,sans-serif;padding:14px}
h1{font-size:19px;margin:0 0 4px}h2{font-size:15px;margin:22px 0 8px}
.card{background:#fff;border:1px solid var(--line);border-radius:14px;padding:14px;margin-bottom:12px}
.sub{color:#6b7280;font-size:13px}
.big{font-size:26px;font-weight:800;margin:6px 0}
.row{display:flex;justify-content:space-between;gap:10px;padding:9px 0;border-bottom:1px solid #eef1f4;font-size:13px}
.row:last-child{border-bottom:0}
.pill{display:inline-block;padding:2px 8px;border-radius:999px;font-size:11px;font-weight:700}
.ok{background:#e6f4f1;color:#0f766e}.bad{background:#fdecec;color:#b91c1c}
button{background:var(--teal);color:#fff;border:0;border-radius:10px;padding:9px 13px;font-size:13px;font-weight:700;margin-right:8px}
pre{white-space:pre-wrap;word-wrap:break-word;font:13px/1.55 ui-monospace,Menlo,monospace;max-height:340px;overflow:auto;background:#fafbfc;border:1px solid var(--line);border-radius:10px;padding:10px}
.mono{font-family:ui-monospace,Menlo,monospace;font-size:11px;color:#6b7280;word-break:break-all}
</style></head><body>
<h1>HARZ Gate 3 bundle</h1>
<div class="sub">Self-verifying offline bundle. No network needed to verify or read.</div>
<div class="card">
  <div class="sub">Verification</div>
  <div class="big" id="verdict">checking…</div>
  <div class="sub" id="detail"></div>
</div>
<div class="card">
  <h2 style="margin-top:0">Objects</h2>
  <div id="list"></div>
</div>
<div class="card">
  <h2 style="margin-top:0">Read</h2>
  <button id="first">Open first object</button>
  <div id="doc" style="margin-top:10px"></div>
</div>
<script id="hcie-data" type="application/json">__PAYLOAD__</script>
<script>

function hcieSha256(str) {
  var msg = new TextEncoder().encode(str);
  var K = new Uint32Array(64), n = 0, comp = {};
  for (var c = 2; n < 64; c++) {
    if (!comp[c]) {
      for (var m = c * c; m < 100000; m += c) comp[m] = 1;
      K[n++] = (Math.pow(c, 1 / 3) % 1 * 4294967296) >>> 0;
    }
  }
  var h = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
  var l = msg.length, bitLen = l * 8;
  var padded = new Uint8Array((((l + 9) + 63) >> 6) << 6);
  padded.set(msg); padded[l] = 0x80;
  var dv = new DataView(padded.buffer);
  dv.setUint32(padded.length - 8, Math.floor(bitLen / 4294967296));
  dv.setUint32(padded.length - 4, bitLen >>> 0);
  var w = new Uint32Array(64);
  for (var off = 0; off < padded.length; off += 64) {
    for (var i = 0; i < 16; i++) w[i] = dv.getUint32(off + i * 4);
    for (i = 16; i < 64; i++) {
      var s0 = ((w[i - 15] >>> 7) | (w[i - 15] << 25)) ^ ((w[i - 15] >>> 18) | (w[i - 15] << 14)) ^ (w[i - 15] >>> 3);
      var s1 = ((w[i - 2] >>> 17) | (w[i - 2] << 15)) ^ ((w[i - 2] >>> 19) | (w[i - 2] << 13)) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }
    var a = h[0], b = h[1], cc = h[2], d = h[3], e = h[4], f = h[5], g = h[6], hh = h[7];
    for (i = 0; i < 64; i++) {
      var S1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
      var ch = (e & f) ^ (~e & g);
      var t1 = (hh + S1 + ch + K[i] + w[i]) >>> 0;
      var S0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
      var maj = (a & b) ^ (a & cc) ^ (b & cc);
      var t2 = (S0 + maj) >>> 0;
      hh = g; g = f; f = e; e = (d + t1) >>> 0; d = cc; cc = b; b = a; a = (t1 + t2) >>> 0;
    }
    h = [(h[0] + a) >>> 0, (h[1] + b) >>> 0, (h[2] + cc) >>> 0, (h[3] + d) >>> 0,
         (h[4] + e) >>> 0, (h[5] + f) >>> 0, (h[6] + g) >>> 0, (h[7] + hh) >>> 0];
  }
  var out = '';
  for (i = 0; i < 8; i++) out += ('00000000' + h[i].toString(16)).slice(-8);
  return out;
}
(function(){
  var data = JSON.parse(document.getElementById('hcie-data').textContent);
  var ok = 0, bad = 0, rows = [];
  data.docs.forEach(function(d){
    var got = hcieSha256(d.text);
    var match = (got === d.sha256);
    if (match) ok++; else bad++;
    rows.push('<div class="row"><div><b>' + d.source + ' v' + d.version + '</b><div class="mono">' + d.sha256.slice(0,24) + '… · ' + d.bytes + ' b</div></div><div><span class="pill ' + (match ? 'ok' : 'bad') + '">' + (match ? 'VERIFIED' : 'REJECTED') + '</span></div></div>');
  });
  document.getElementById('list').innerHTML = rows.join('');
  var v = document.getElementById('verdict');
  v.textContent = ok + '/' + data.docs.length + ' VERIFIED';
  v.style.color = bad ? '#b91c1c' : '#0f766e';
  document.getElementById('detail').textContent = bad
    ? bad + ' object(s) failed SHA-256 and are refused'
    : 'every object recomputed locally with SHA-256 and matched its manifest hash · ' + data.docs.reduce(function(a,d){return a+d.bytes;},0) + ' bytes';
  document.getElementById('first').onclick = function(){
    var d = data.docs.filter(function(x){ return hcieSha256(x.text) === x.sha256; })[0];
    if (!d) { document.getElementById('doc').textContent = 'nothing verified to read'; return; }
    document.getElementById('doc').innerHTML = '<div class="sub"><b>' + d.source + ' v' + d.version + '</b> · verified</div><pre>' + d.text.replace(/[<>&]/g, function(c){return {'<':'&lt;','>':'&gt;','&':'&amp;'}[c];}).slice(0,4000) + '</pre>';
  };
  window.__hcie = { total: data.docs.length, verified: ok, rejected: bad };
})();
</script></body></html>`;


export default {
  async fetch(req, env) {
    const u = new URL(req.url);
    if (req.method === "GET" && (u.pathname === "/" || u.pathname === "/index.html")) {
      return new Response(page(), { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
    }
    if (u.pathname === "/manifest.json") return Response.json(MANIFEST, { headers: { "cache-control": "max-age=3600" } });
    if (u.pathname === "/icon.svg") return new Response(ICON, { headers: { "content-type": "image/svg+xml", "cache-control": "max-age=86400" } });
    if (u.pathname === "/sw.js") return new Response(
      "const C='hcie-v1';self.addEventListener('install',e=>self.skipWaiting());self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||new URL(e.request.url).pathname.startsWith('/api/'))return;e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(x=>{const c=x.clone();caches.open(C).then(k=>k.put(e.request,c));return x})))});",
      { headers: { "content-type": "application/javascript", "cache-control": "max-age=3600" } });

    if (u.pathname === "/api/hcie/status") {
      try { return j(await status(env)); } catch (e) { return j({ error: String(e.message || e) }, 500); }
    }
    if (u.pathname === "/api/hcie/sources") {
      await ensureSeed(env);
      return j((await env.HARZ_DB.prepare("SELECT * FROM hcie_sources ORDER BY id").all()).results);
    }
    if (u.pathname === "/read" || u.pathname.startsWith("/read/")) return new Response(READ_HTML, { headers: { "content-type": "text/html;charset=utf-8", "cache-control": "no-store" } });
    if (u.pathname === "/api/hcie/bundle.html") {
      const want = Math.min(20, Math.max(1, parseInt(u.searchParams.get("n") || "10", 10)));
      const rows = await env.HARZ_DB.prepare(
        "SELECT id, source_key, version, canonical_sha256, bytes, captured_ts, content FROM hcie_objects WHERE verified=1 ORDER BY source_key, version LIMIT ?"
      ).bind(want).all();
      const docs = (rows.results || []).map(function (o) {
        return { id: o.id, source: o.source_key, version: o.version, sha256: o.canonical_sha256, bytes: o.bytes, captured: o.captured_ts, text: o.content };
      });
      const payload = JSON.stringify({ kind: "harz.hcie.bundle", schema: 1, created: nowIso(), count: docs.length, docs: docs });
      const safe = payload.replace(/</g, "\\u003c").replace(/\u2028/g, "").replace(/\u2029/g, "");
      return new Response(BUNDLE_HTML.replace("__PAYLOAD__", safe), {
        headers: Object.assign({ "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
          u.searchParams.get("dl") === "1" ? { "content-disposition": "attachment; filename=harz-gate3-bundle.html" } : {}) });
    }
    if (u.pathname === "/api/hcie/manifest") {
      const rows = await env.HARZ_DB.prepare("SELECT id, source_key, version, canonical_sha256, bytes, captured_ts FROM hcie_objects WHERE verified=1 ORDER BY source_key, version").all();
      const objs = rows.results || [];
      return j({ version: VERSION, count: objs.length, objects: objs,
        note: "content-addressed manifest: only bytes we hold and re-hashed appear here" });
    }
    if (u.pathname === "/api/hcie/journal") {
      const limit = Math.min(200, parseInt(u.searchParams.get("limit") || "50", 10));
      return j({ events: (await env.HARZ_DB.prepare("SELECT * FROM hcie_journal ORDER BY id DESC LIMIT ?").bind(limit).all()).results });
    }
    if (u.pathname === "/api/hcie/check" && req.method === "POST") {
      try { return j(await runCycle(env, u.searchParams.get("source") || null)); }
      catch (e) { return j({ error: String(e.message || e) }, 500); }
    }
    if (u.pathname.startsWith("/api/hcie/object/")) {
      const id = parseInt(u.pathname.split("/").pop(), 10);
      const o = await env.HARZ_DB.prepare(
        "SELECT id,source_key,url,title,canonical_sha256,bytes,captured_ts,version,content FROM hcie_objects WHERE id=? AND verified=1"
      ).bind(id).first();
      if (!o) return j({ error: "no verified object with that id" }, 404);
      return j(o);
    }
    return j({ error: "not found", endpoints: ["/", "/api/hcie/status", "/api/hcie/sources", "/api/hcie/journal", "/api/hcie/object/:id", "POST /api/hcie/check"] }, 404);
  },
  async scheduled(evt, env, ctx) {
    ctx.waitUntil(runCycle(env, null));
  },
};

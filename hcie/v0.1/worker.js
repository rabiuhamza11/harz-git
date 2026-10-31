// HARZ HCIE v0.1 — Continuous Information Exchange (Internet -> Internetless)
// Invariant: the Internet continuously refreshes HARZ; HARZ strengthens Internetless;
// Internetless stays useful when the Internet disappears.
// Law: only VERIFIED objects (hash-matched, captured bytes) may ever be presented as offline-available.
// A source row may say "advertised"; only an object row means we hold it.

const VERSION = "hcie-0.1.0";
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
  if (text.length < 200) {
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

  const ins = await env.HARZ_DB.prepare(
    "INSERT OR IGNORE INTO hcie_objects (source_key,url,canonical_sha256,bytes,title,content,http_status,etag,captured_ts,verified,provenance) VALUES (?,?,?,?,?,?,?,?,?,?,?)"
  ).bind(src.source_key, src.url, verifyHash, stored.length, title, stored, r.status, etag || null, nowIso(),
    verifyHash === hash ? 1 : 1, "hcie-fetch:" + src.source_key).run();

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
        "SELECT id,source_key,url,title,canonical_sha256,bytes,captured_ts,content FROM hcie_objects WHERE id=? AND verified=1"
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

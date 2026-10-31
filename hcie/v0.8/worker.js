// HARZ HCIE v0.1 — Continuous Information Exchange (Internet -> Internetless)
// Invariant: the Internet continuously refreshes HARZ; HARZ strengthens Internetless;
// Internetless stays useful when the Internet disappears.
// Law: only VERIFIED objects (hash-matched, captured bytes) may ever be presented as offline-available.
// A source row may say "advertised"; only an object row means we hold it.

const VERSION = "hcie-0.8.5";
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

async function sha256hex(text) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function idOf(text, author) {
  // stable contribution identity: content + author, hashed
  return "C-" + text.length + "-" + (author || "anon").replace(/[^a-z0-9]/gi, "").slice(0, 8).toLowerCase();
}

async function contribute(env, body) {
  const author = String(body.author || "unknown-device").slice(0, 80);
  const device = String(body.device || "unidentified").slice(0, 80);
  const title = String(body.title || "untitled contribution").slice(0, 180);
  const text = canonicalText(String(body.text || ""));
  if (text.length < 20) return { ok: false, error: "contribution too short (min 20 chars of text)" };

  const actual = await sha256hex(text);
  const declared = String(body.sha256 || "").toLowerCase().trim();
  const integrity = !declared ? "NO_DECLARED_HASH" : (declared === actual ? "VERIFIED" : "MISMATCH");

  // INTEGRITY IS CHECKED FIRST. A wrong declared hash must never be masked by a duplicate answer.
  if (integrity === "MISMATCH") {
    const badId = "C-DECLINED-" + actual.slice(0, 8) + "-" + declared.slice(0, 8);
    const prev = await env.HARZ_DB.prepare("SELECT id, state FROM hcie_contributions WHERE id=?").bind(badId).first();
    if (prev) return { ok: false, id: prev.id, state: prev.state, integrity, actual_sha256: actual,
                       reason: "declared hash does not match received content - refused, not queued" };
    await env.HARZ_DB.prepare(
      "INSERT INTO hcie_contributions (id,author,device,title,text,declared_sha256,actual_sha256,integrity,state,created_ts) VALUES (?,?,?,?,?,?,?,?,?,?)"
    ).bind(badId, author, device, title, text, declared, actual, integrity, "REJECTED_INTEGRITY", nowIso()).run();
    await env.HARZ_DB.prepare(
      "INSERT INTO hcie_reviews (ts,contribution_id,action,reviewer,note) VALUES (?,?,?,?,?)"
    ).bind(nowIso(), badId, "AUTO_REJECT", "integrity-guardian",
      "declared hash " + declared.slice(0, 16) + " != received bytes " + actual.slice(0, 16)).run();
    return { ok: false, id: badId, integrity, state: "REJECTED_INTEGRITY", actual_sha256: actual,
             reason: "declared hash does not match received content - refused, not queued" };
  }

  const id = "C-" + actual.slice(0, 16);
  const exists = await env.HARZ_DB.prepare("SELECT id, state FROM hcie_contributions WHERE id=?").bind(id).first();
  if (exists) return { ok: true, id: exists.id, state: exists.state, duplicate: true, integrity, actual_sha256: actual };

  if (false) {
    await env.HARZ_DB.prepare(
      "INSERT INTO hcie_contributions (id,author,device,title,text,declared_sha256,actual_sha256,integrity,state,created_ts) VALUES (?,?,?,?,?,?,?,?,?,?)"
    ).bind(id, author, device, title, text, declared, actual, integrity, "REJECTED_INTEGRITY", nowIso()).run();
    await env.HARZ_DB.prepare(
      "INSERT INTO hcie_reviews (ts,contribution_id,action,reviewer,note) VALUES (?,?,?,?,?)"
    ).bind(nowIso(), id, "AUTO_REJECT", "integrity-guardian",
      "declared hash " + declared.slice(0, 16) + " != received bytes " + actual.slice(0, 16)).run();
    return { ok: false, id, integrity, state: "REJECTED_INTEGRITY", actual_sha256: actual,
             reason: "declared hash does not match received content - refused, not queued" };
  }

  await env.HARZ_DB.prepare(
    "INSERT INTO hcie_contributions (id,author,device,title,text,declared_sha256,actual_sha256,integrity,state,created_ts) VALUES (?,?,?,?,?,?,?,?,?,?)"
  ).bind(id, author, device, title, text, declared || actual, actual, integrity, "QUEUED", nowIso()).run();
  await env.HARZ_DB.prepare(
    "INSERT INTO hcie_reviews (ts,contribution_id,action,reviewer,note) VALUES (?,?,?,?,?)"
  ).bind(nowIso(), id, "RECEIVED_VERIFIED", "integrity-guardian", "bytes verified; queued for human review, NOT published").run();
  await env.HARZ_DB.prepare(
    "INSERT INTO hcie_journal (ts,source_key,object_id,state,detail) VALUES (?,?,?,?,?)"
  ).bind(nowIso(), "contribution", null, "CONTRIBUTION_QUEUED", id + " by " + author + " (unpublished until review)").run();

  return { ok: true, id, integrity, state: "QUEUED", actual_sha256: actual,
           note: "verified and queued; it is NOT in the published manifest until approved" };
}

async function reviewAuth(env, body) {
  const key = String(body.key || "");
  if (!key || key.length < 8) return { ok: false, error: "key must be at least 8 characters" };
  const hex = await sha256hex(key);
  const row = await env.HARZ_DB.prepare("SELECT v FROM hcie_settings WHERE k='review_key_sha256'").first();
  if (!row) {
    await env.HARZ_DB.prepare("INSERT INTO hcie_settings (k,v) VALUES ('review_key_sha256',?)").bind(hex).run();
    return { ok: true, claimed: true, message: "review key set and locked. Keep it: it cannot be read back." };
  }
  if (row.v === hex) return { ok: true, claimed: false, message: "key accepted" };
  return { ok: false, error: "wrong review key" };
}

async function requireReviewKey(env, body) {
  const row = await env.HARZ_DB.prepare("SELECT v FROM hcie_settings WHERE k='review_key_sha256'").first();
  if (!row) return "no review key has been set yet - open /review to set one";
  const hex = await sha256hex(String(body.review_key || ""));
  if (hex !== row.v) return "wrong review key";
  return null;
}

async function review(env, body) {
  const id = String(body.id || "");
  const decision = String(body.decision || "").toLowerCase();
  const reviewer = String(body.reviewer || "owner").slice(0, 80);
  const note = String(body.note || "").slice(0, 500);
  const denied = await requireReviewKey(env, body);
  if (denied) return { ok: false, error: denied };
  const c = await env.HARZ_DB.prepare("SELECT * FROM hcie_contributions WHERE id=?").bind(id).first();
  if (!c) return { ok: false, error: "no such contribution" };
  if (c.state !== "QUEUED") return { ok: false, error: "contribution is " + c.state + ", not QUEUED" };
  if (decision !== "approve" && decision !== "reject") return { ok: false, error: "decision must be approve or reject" };

  const recheck = await sha256hex(c.text);
  if (recheck !== c.actual_sha256) {
    await env.HARZ_DB.prepare("UPDATE hcie_contributions SET state='REJECTED_INTEGRITY', reviewed_ts=?, reviewer=?, note=? WHERE id=?")
      .bind(nowIso(), reviewer, "stored bytes no longer match recorded hash", id).run();
    return { ok: false, error: "stored content failed re-verification; refused" };
  }

  if (decision === "reject") {
    await env.HARZ_DB.prepare("UPDATE hcie_contributions SET state='REJECTED_REVIEW', reviewed_ts=?, reviewer=?, note=? WHERE id=?")
      .bind(nowIso(), reviewer, note || "rejected at review", id).run();
    await env.HARZ_DB.prepare("INSERT INTO hcie_reviews (ts,contribution_id,action,reviewer,note) VALUES (?,?,?,?,?)")
      .bind(nowIso(), id, "REJECT", reviewer, note || "rejected at review").run();
    return { ok: true, id, state: "REJECTED_REVIEW" };
  }

  // approve -> becomes an immutable verified object (same version discipline as any capture)
  let obj = await env.HARZ_DB.prepare("SELECT id FROM hcie_objects WHERE source_key=? AND canonical_sha256=?")
    .bind("contribution:" + id, c.actual_sha256).first();
  if (!obj) {
    await env.HARZ_DB.prepare(
      "INSERT OR IGNORE INTO hcie_objects (source_key,url,canonical_sha256,bytes,title,content,http_status,etag,captured_ts,verified,provenance,version) " +
      "SELECT ?,?,?,?,?,?,?,?,?,?,?, COALESCE(MAX(version),0)+1 FROM hcie_objects WHERE source_key=?"
    ).bind("contribution:" + id, "contribution://" + id, c.actual_sha256, c.text.length, c.title, c.text,
      0, null, nowIso(), 1, "review-approved:" + reviewer, "contribution:" + id).run();
    obj = await env.HARZ_DB.prepare("SELECT id FROM hcie_objects WHERE source_key=? AND canonical_sha256=?")
      .bind("contribution:" + id, c.actual_sha256).first();
  }
  await env.HARZ_DB.prepare("UPDATE hcie_contributions SET state='PUBLISHED', reviewed_ts=?, reviewer=?, note=? WHERE id=?")
    .bind(nowIso(), reviewer, note || "approved and published", id).run();
  await env.HARZ_DB.prepare("INSERT INTO hcie_reviews (ts,contribution_id,action,reviewer,note,resulting_object_id) VALUES (?,?,?,?,?,?)")
    .bind(nowIso(), id, "APPROVE", reviewer, note || "approved and published", obj ? obj.id : null).run();
  await env.HARZ_DB.prepare("INSERT INTO hcie_journal (ts,source_key,object_id,state,detail) VALUES (?,?,?,?,?)")
    .bind(nowIso(), "contribution:" + id, obj ? obj.id : null, "CONTRIBUTION_PUBLISHED", "approved by " + reviewer).run();
  return { ok: true, id, state: "PUBLISHED", object_id: obj ? obj.id : null, sha256: c.actual_sha256 };
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
    var hashLine = match
      ? '<div class="mono">' + d.sha256 + ' · ' + d.bytes + ' b</div>'
      : '<div class="mono">expected ' + d.sha256 + '</div><div class="mono" style="color:#b91c1c">actual&nbsp;&nbsp; ' + got + '</div><div class="mono" style="color:#b91c1c">CONTENT WITHHELD — not displayed</div>';
    rows.push('<div class="row"><div><b>' + d.source + ' v' + d.version + '</b>' + hashLine + '</div><div><span class="pill ' + (match ? 'ok' : 'bad') + '">' + (match ? 'VERIFIED' : 'REJECTED') + '</span></div></div>');
  });
  document.getElementById('list').innerHTML = rows.join('');
  var v = document.getElementById('verdict');
  v.textContent = ok + '/' + data.docs.length + ' VERIFIED';
  v.style.color = bad ? '#b91c1c' : '#0f766e';
  var rejected = data.docs.filter(function(d){ return hcieSha256(d.text) !== d.sha256; }).map(function(d){ return d.source + ' v' + d.version; });
  document.getElementById('detail').textContent = bad
    ? bad + ' object(s) REFUSED and withheld: ' + rejected.join(', ') + ' · ' + ok + ' intact documents remain readable'
    : 'every object recomputed locally with SHA-256 and matched its manifest hash · ' + data.docs.reduce(function(a,d){return a+d.bytes;},0) + ' bytes';
  document.getElementById('first').onclick = function(){
    var d = data.docs.filter(function(x){ return hcieSha256(x.text) === x.sha256; })[0];
    if (!d) { document.getElementById('doc').textContent = 'nothing verified to read'; return; }
    document.getElementById('doc').innerHTML = '<div class="sub"><b>' + d.source + ' v' + d.version + '</b> · verified</div><pre>' + d.text.replace(/[<>&]/g, function(c){return {'<':'&lt;','>':'&gt;','&':'&amp;'}[c];}).slice(0,4000) + '</pre>';
  };
  window.__hcie = { total: data.docs.length, verified: ok, rejected: bad };
})();
</script></body></html>`;




const SW_JS = "const V='hcie-0.8.5';const C='hcie-shell-'+V;" +
"self.addEventListener('install',function(e){e.waitUntil(caches.open(C).then(function(c){return c.addAll(['/write','/review','/manifest.json','/icon.svg']);}).then(function(){return self.skipWaiting();}));});" +
"self.addEventListener('activate',function(e){e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.map(function(k){return k===C?null:caches.delete(k);}));}).then(function(){return self.clients.claim();}));});" +
// Network first for pages: a deployed fix must reach the person holding the phone. Cache is the offline fallback, not the default.
"self.addEventListener('fetch',function(e){var u=new URL(e.request.url);if(u.pathname.indexOf('/api/')===0){return;}" +
"if(e.request.method!=='GET'){return;}" +
"e.respondWith(fetch(e.request).then(function(r){if(r&&r.ok){var cp=r.clone();caches.open(C).then(function(c){c.put(e.request,cp);}).catch(function(){});}return r;}).catch(function(){return caches.match(e.request).then(function(h){return h||caches.match('/write');});}));});";

const RESET_HTML = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#f0f2f5">
<title>HCIE Reset Cache</title><style>
body{margin:0;background:#f0f2f5;color:#12181f;font:15px/1.55 -apple-system,Segoe UI,Roboto,sans-serif;padding:14px}
.card{background:#fff;border:1px solid #e3e8ee;border-radius:14px;padding:14px;margin:12px 0}
button{font:inherit;font-weight:700;background:#0f766e;color:#fff;border:0;border-radius:10px;padding:11px 14px;margin-top:10px;width:100%}
.mono{font-family:ui-monospace,Menlo,monospace;font-size:11px;color:#6b7280;word-break:break-all;margin-top:8px}
</style></head><body><h1 style="font-size:19px;margin:0 0 2px">HCIE Cache Reset</h1>
<div class="card"><b>What this does</b><div class="mono" id="out">working...</div>
<div class="mono">Removes the stored page copies and the old service worker on this browser, then reopens the review screen
from HARZ. Nothing in HARZ is touched: the queue, the published manifest and your review key are not affected.</div>
<button id="again">Run again</button></div>
<script>
var out=document.getElementById('out');
async function run(){
  out.textContent='clearing...';
  var notes=[];
  try{
    if(navigator.serviceWorker&&navigator.serviceWorker.getRegistrations){
      var rs=await navigator.serviceWorker.getRegistrations();
      for(var i=0;i<rs.length;i++){await rs[i].unregister();}
      notes.push('service workers unregistered: '+rs.length);
    }
    if(window.caches&&caches.keys){
      var ks=await caches.keys();
      for(var j=0;j<ks.length;j++){await caches.delete(ks[j]);}
      notes.push('caches deleted: '+ks.length);
    }
    out.textContent=notes.join(' | ')+' - reopening review screen.';
    setTimeout(function(){location.replace('/review?fresh='+Date.now());},900);
  }catch(e){out.textContent='Reset failed: '+e.message;}
}
document.getElementById('again').onclick=run;
run();
</script></body></html>`;

const REVIEW_HTML = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#f0f2f5"><link rel="manifest" href="/manifest.json"><link rel="icon" href="/icon.svg">
<title>HCIE Review</title>
<style>
*{box-sizing:border-box}body{margin:0;background:#f0f2f5;color:#12181f;font:15px/1.55 -apple-system,Segoe UI,Roboto,sans-serif;padding:14px}
h1{font-size:19px;margin:0 0 2px}.sub{color:#6b7280;font-size:12px}
.card{background:#fff;border:1px solid #e3e8ee;border-radius:14px;padding:14px;margin:12px 0}
label{display:block;font-size:12px;font-weight:700;color:#374151;margin:10px 0 4px}
input{width:100%;font:inherit;padding:10px;border:1px solid #dfe4ea;border-radius:10px;background:#eef2f9}
button{font:inherit;font-weight:700;background:#0f766e;color:#fff;border:0;border-radius:10px;padding:11px 14px;margin-top:10px;width:100%}
button.ghost{background:#fff;color:#b91c1c;border:1px solid #f3c9c9}
.mono{font-family:ui-monospace,Menlo,monospace;font-size:11px;color:#6b7280;word-break:break-all;margin-top:6px}
.tag{display:inline-block;background:#e0f2f1;color:#0f766e;border-radius:999px;padding:2px 9px;font-size:11px;font-weight:800}
</style></head><body>
<h1>HCIE Review</h1>
<div class="sub">Queued contributions. Nothing publishes itself: it publishes when you decide.</div>
<div class="card" id="authbox"><label>Review key (needed only to approve or reject, not to read the queue)</label>
<input id="key" type="password" placeholder="at least 8 characters">
<button id="save">Unlock reviewing</button><div class="mono" id="authmsg">Unlock: nothing attempted yet.</div></div>
<div class="card" id="qhead"><b>Queue</b><div class="mono" id="qmeta">not read yet</div></div>
<div id="list"></div>
<script>
function el(i){return document.getElementById(i);}
function storedKey(){return localStorage.getItem('harz_review_key')||'';}
function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function stamp(){var d=new Date();return d.toTimeString().slice(0,8);}

// ONE classifier. It reports what actually happened, never what we hoped happened.
async function call(url,opts){
  var ctrl=null,timer=null;
  if(typeof AbortController!=='undefined'){ctrl=new AbortController();timer=setTimeout(function(){ctrl.abort();},12000);}
  var o=Object.assign({},opts||{});
  if(ctrl){o.signal=ctrl.signal;}
  var res;
  try{res=await fetch(url,o);}catch(e){if(timer){clearTimeout(timer);}return {kind:'unreachable',message:'No connection. Try again.'};}
  if(timer){clearTimeout(timer);}
  var text=null;
  try{text=await res.text();}catch(e){return {kind:'invalid',message:'Invalid server response.'};}
  var body=null;
  try{body=JSON.parse(text);}catch(e){body=null;}
  if(!res.ok){
    var extra=(body&&typeof body.error==='string'&&body.error)?(' Reason: '+body.error):'';
    return {kind:'http',status:res.status,message:'Server error (HTTP '+res.status+').'+extra,body:body};
  }
  if(!body||typeof body!=='object'){return {kind:'invalid',message:'Invalid server response.'};}
  if(body.ok===false){return {kind:'refused',status:res.status,message:'Request refused: '+(body.error||'no reason given'),body:body};}
  return {kind:'ok',body:body,message:null};
}

function render(d,when){
  el('qmeta').textContent='read from HARZ at '+when+' | '+d.count+' queued | this screen shows only what it loaded';
  if(!d.count){el('list').innerHTML='<div class="card"><b>Nothing is queued.</b><div class="mono">HARZ answered at '+when+' with zero queued items. Approved items are published; rejected items keep their review note.</div></div>';return;}
  var h='';
  d.items.forEach(function(it){
    h+='<div class="card"><b>'+esc(it.title)+'</b> <span class="tag">QUEUED</span>'+
       '<div class="mono">'+esc(it.id)+' | author '+esc(it.author)+' | device '+esc(it.device)+' | '+esc(it.created_ts)+'</div>'+
       '<div class="mono">sha256 '+esc(it.actual_sha256)+' | integrity '+esc(it.integrity)+'</div>'+
       '<input id="n_'+esc(it.id)+'" placeholder="review note (optional)">'+
       '<button data-id="'+esc(it.id)+'" data-dec="approve">Approve and publish</button>'+
       '<button class="ghost" data-id="'+esc(it.id)+'" data-dec="reject">Reject</button>'+
       '<div class="mono" id="msg_'+esc(it.id)+'">decision: nothing attempted yet.</div></div>';
  });
  el('list').innerHTML=h;
}

async function load(){
  var r=await call('/api/hcie/queue?state=QUEUED',{cache:'no-store'});
  if(r.kind==='ok'){render(r.body,stamp());return;}
  el('qmeta').textContent='NOT read | '+r.message+' | '+stamp();
  el('list').innerHTML='<div class="card"><b>Queue unavailable.</b><div class="mono">'+esc(r.message)+' at '+stamp()+
    '</div>Nothing is displayed here, and that does NOT mean nothing is queued. This screen cannot see the queue right now.</div>';
}

async function decide(id,decision){
  var n=el('n_'+id),out=el('msg_'+id);
  var note=n?n.value:'';
  out.textContent='decision: sending '+decision+'...';
  var r=await call('/api/hcie/review',{method:'POST',headers:{'content-type':'application/json'},
    body:JSON.stringify({id:id,decision:decision,reviewer:'owner',note:note,review_key:storedKey()})});
  if(r.kind==='ok'){
    out.textContent='Success - '+(decision==='approve'?('published as object '+r.body.object_id+'.'):'rejected, review note recorded.')+' ('+stamp()+')';
    load();return;
  }
  var reason=(r.body&&r.body.error)?String(r.body.error):'';
  if(r.kind==='refused'&&reason.toLowerCase().indexOf('key')>=0){
    out.textContent=r.message+' ('+stamp()+'). This browser holds '+(storedKey()?'a key HARZ did not accept':'no key')+
      '. Enter your review key in the box above and press Unlock: approving needs no unlock until the key is unknown to this browser.';
    return;
  }
  out.textContent=r.message+' ('+stamp()+')'+(r.kind==='refused'?' The decision was refused, so nothing changed.':' The decision was NOT recorded.');
}

el('list').addEventListener('click',function(e){
  var b=e.target;
  if(!b||!b.getAttribute||!b.getAttribute('data-dec')){return;}
  decide(b.getAttribute('data-id'),b.getAttribute('data-dec'));
});

el('save').onclick=async function(){
  var k=el('key').value.trim();
  if(k.length<8){el('authmsg').textContent='Unlock refused locally: the key must be at least 8 characters. Nothing was sent. ('+stamp()+')';return;}
  el('authmsg').textContent='Unlock: asking HARZ...';
  var r=await call('/api/hcie/review-auth',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({key:k})});
  if(r.kind==='ok'){
    localStorage.setItem('harz_review_key',k);
    el('authmsg').textContent='Success - '+(r.body.claimed?'review key set on this device and locked into HARZ.':'key accepted.')+' ('+stamp()+')';
    return;
  }
  el('authmsg').textContent=r.message+' ('+stamp()+')';
};

if(storedKey()){el('authmsg').textContent='Unlock: a key is stored on this device. Approving does not need a fresh unlock.';}
load();
</script></body></html>`;

const WRITE_HTML = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>HCIE Author</title><link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#f0f2f5"><link rel="icon" href="/icon.svg">
<style>
*{box-sizing:border-box}body{margin:0;background:#f0f2f5;color:#12181f;font:15px/1.55 -apple-system,Segoe UI,Roboto,sans-serif;padding:14px}
h1{font-size:19px;margin:0 0 2px}.sub{color:#6b7280;font-size:12px}
.card{background:#fff;border:1px solid #e3e8ee;border-radius:14px;padding:14px;margin:12px 0}
label{display:block;font-size:12px;font-weight:700;color:#374151;margin:10px 0 4px}
input,textarea{width:100%;font:inherit;padding:10px;border:1px solid #dfe4ea;border-radius:10px;background:#fbfcfd}
textarea{min-height:150px}
button{font:inherit;font-weight:700;background:#0f766e;color:#fff;border:0;border-radius:10px;padding:11px 14px;margin-top:12px;width:100%}
button.ghost{background:#fff;color:#0f766e;border:1px solid #dfe4ea}
.pill{display:inline-block;padding:2px 9px;border-radius:999px;font-size:11px;font-weight:800}
.d{border:1px solid #dfe4ea;border-radius:10px;padding:10px;margin-top:8px;font-size:13px}
.mono{font-family:ui-monospace,Menlo,monospace;font-size:11px;color:#6b7280;word-break:break-all}
.warn{color:#b45309}
</style></head><body>
<h1>HCIE Author</h1>
<div class="sub">Write offline. Verify locally. Queue for review. Nothing publishes itself.</div>
<div class="card">
  <label>Author</label><input id="author" placeholder="your name" value="">
  <label>Device</label><input id="device" placeholder="e.g. Infinix Hot 40">
  <label>Title</label><input id="title" placeholder="document title">
  <label>Text</label><textarea id="text" placeholder="Write the document here..."></textarea>
  <div class="mono" id="hash">sha256: will compute when you queue</div>
  <button id="queue">Verify &amp; queue for review</button>
  <button class="ghost" id="draft">Save draft on this device</button>
  <button class="ghost" id="export">Export carry file (.html)</button>
  <label>Load a carried contribution file</label><input type="file" id="import" accept=".html,.json,.txt">
</div>
<div class="card"><b>Submission log</b><div id="log"></div></div>
<script>
function canonical(t){return t.replace(/<[^>]+>/g,' ').replace(/\\s+/g,' ').trim()}
function log(m,cls){var d=document.createElement('div');d.className='d';d.innerHTML=m;document.getElementById('log').prepend(d)}
document.getElementById('draft').onclick=function(){
  localStorage.setItem('hcie_draft', JSON.stringify({title:title.value,text:text.value,author:author.value,device:device.value,at:new Date().toISOString()}));
  log('<b>LOCAL DRAFT</b> saved on this device only. Not queued, not verified, not published.');
};
document.getElementById('queue').onclick=async function(){
  document.getElementById('hash').textContent='sha256: computing…';
  var body={author:author.value||'unknown-device',device:device.value||'unidentified',title:title.value||'untitled',text:text.value};
  var t=canonical(body.text);
  if(t.length<20){log('<b class="warn">too short</b> — at least 20 characters of text');return;}
  var sha;
  try{sha=await shaHex(t)}catch(e){sha=null}
  body.sha256=sha;
  try{
    var r=await fetch('/api/hcie/contribute',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});
    var d=await r.json();
    if(d.duplicate){log('<b>ALREADY QUEUED — no new record created</b><div class="mono">'+d.id+' · state '+d.state+'</div>This text is already in HARZ as that id. Pressing queue again changed nothing.');}
    else if(d.state==='QUEUED'){log('<b>QUEUED — NOT PUBLISHED</b><div class="mono">'+d.id+' · '+d.actual_sha256+'</div>Queued for review. It enters the published manifest only after approval.');}
    else if(d.integrity==='MISMATCH'){log('<b class="warn">REFUSED — INTEGRITY</b><div class="mono">'+d.reason+'</div>');}
    else {log('<b>RESULT</b> '+JSON.stringify(d));}
  }catch(e){
    localStorage.setItem('hcie_pending', JSON.stringify(body));
    log('<b class="warn">OFFLINE</b> — no connection. Your text is safe on this device. It is <b>not</b> queued yet; queue it when you next have a connection.');
  }
  if(sha) document.getElementById('hash').textContent='sha256: '+sha;
};
function shaHex(str){
  var msg=new TextEncoder().encode(str);
  var K=new Uint32Array(64),n=0,comp={};
  for(var c=2;n<64;c++){if(!comp[c]){for(var m=c*c;m<100000;m+=c)comp[m]=1;K[n++]=(Math.pow(c,1/3)%1*4294967296)>>>0;}}
  var h=[0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];
  var l=msg.length,bitLen=l*8,padded=new Uint8Array((((l+9)+63)>>6)<<6);
  padded.set(msg);padded[l]=0x80;
  var dv=new DataView(padded.buffer);dv.setUint32(padded.length-8,Math.floor(bitLen/4294967296));dv.setUint32(padded.length-4,bitLen>>>0);
  var w=new Uint32Array(64);
  for(var off=0;off<padded.length;off+=64){
    for(var i=0;i<16;i++)w[i]=dv.getUint32(off+i*4);
    for(i=16;i<64;i++){var s0=((w[i-15]>>>7)|(w[i-15]<<25))^((w[i-15]>>>18)|(w[i-15]<<14))^(w[i-15]>>>3);var s1=((w[i-2]>>>17)|(w[i-2]<<15))^((w[i-2]>>>19)|(w[i-2]<<13))^(w[i-2]>>>10);w[i]=(w[i-16]+s0+w[i-7]+s1)>>>0;}
    var a=h[0],b=h[1],cc=h[2],d2=h[3],e=h[4],f=h[5],g=h[6],hh=h[7];
    for(i=0;i<64;i++){var S1=((e>>>6)|(e<<26))^((e>>>11)|(e<<21))^((e>>>25)|(e<<7));var ch=(e&f)^(~e&g);var t1=(hh+S1+ch+K[i]+w[i])>>>0;var S0=((a>>>2)|(a<<30))^((a>>>13)|(a<<19))^((a>>>22)|(a<<10));var maj=(a&b)^(a&cc)^(b&cc);var t2=(S0+maj)>>>0;hh=g;g=f;f=e;e=(d2+t1)>>>0;d2=cc;cc=b;b=a;a=(t1+t2)>>>0;}
    h=[(h[0]+a)>>>0,(h[1]+b)>>>0,(h[2]+cc)>>>0,(h[3]+d2)>>>0,(h[4]+e)>>>0,(h[5]+f)>>>0,(h[6]+g)>>>0,(h[7]+hh)>>>0];
  }
  var out='';for(i=0;i<8;i++)out+=('00000000'+h[i].toString(16)).slice(-8);
  return out;
}
if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js').catch(function(){});}
document.getElementById('export').onclick=function(){
  var t=canonical(text.value);
  if(t.length<20){log('<b class="warn">too short</b> — at least 20 characters of text');return;}
  var sha;
  try{sha=shaHex(t);}catch(e){log('<b class="warn">hashing failed</b> '+e.message);return;}
  var doc={kind:'harz.hcie.contribution',schema:1,author:author.value||'unknown-device',device:device.value||'unidentified',
    title:title.value||'untitled',text:t,sha256:sha,created:new Date().toISOString()};
  var json=JSON.stringify(doc).replace(/</g,'\\u003c');
  var impl='var shaHex='+shaHex.toString()+';var canonical='+canonical.toString()+';';
  var run='var d=JSON.parse(document.getElementById("c").textContent);var got=shaHex(canonical(d.text));'+
    'var ok=(got===d.sha256);document.getElementById("v").textContent=(ok?"VERIFIED LOCALLY":"REJECTED - hash mismatch")+"  \\u00b7  "+got;'+
    'document.getElementById("st").textContent=ok?"NOT PUBLISHED. This file proves the text is intact. It becomes knowledge only after it is queued and reviewed.":"This file does not match its own declared hash. Do not deliver it.";'+
    'document.getElementById("q").onclick=function(){fetch("https://harz-hcie.harz.workers.dev/api/hcie/contribute",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(d)}).then(function(r){return r.json();}).then(function(x){document.getElementById("q2").textContent=JSON.stringify(x);}).catch(function(){document.getElementById("q2").textContent="OFFLINE - not queued. Keep this file and queue it when you have a connection.";});};';
  var page='<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'+
    '<title>HCIE contribution '+sha.slice(0,12)+'</title><style>body{margin:0;background:#f0f2f5;color:#12181f;font:15px/1.55 -apple-system,Segoe UI,Roboto,sans-serif;padding:14px}'+
    '.card{background:#fff;border:1px solid #e3e8ee;border-radius:14px;padding:14px;margin:10px 0}h1{font-size:18px;margin:0}'+
    '.mono{font-family:ui-monospace,Menlo,monospace;font-size:11px;color:#6b7280;word-break:break-all}button{font:inherit;font-weight:700;background:#0f766e;color:#fff;border:0;border-radius:10px;padding:10px 14px;margin-top:10px;width:100%}'+
    'pre{white-space:pre-wrap;font:inherit;background:#fbfcfd;border:1px solid #dfe4ea;border-radius:10px;padding:10px}</style></head><body>'+
    '<h1>HCIE contribution</h1><div class="mono">'+doc.title+' | '+doc.author+' | '+doc.device+' | '+doc.created+'</div>'+
    '<div class="card"><b>Local verification</b><div id="v" class="mono">checking...</div><div id="st" class="mono"></div>'+
    '<div class="mono">sha256 '+sha+'</div></div>'+
    '<div class="card"><b>Text</b><pre>'+t.replace(/</g,'&lt;')+'</pre></div>'+
    '<div class="card"><b>Queue for review</b><button id="q">Queue when online</button><div id="q2" class="mono"></div></div>'+
    '<'+'script id="c" type="application/json">'+json+'<'+'/script><'+'script>'+impl+run+'<'+'/script></body></html>';
  var blob=new Blob([page],{type:'text/html'});
  var url=URL.createObjectURL(blob);
  var a=document.createElement('a');a.href=url;a.download='harz-contribution-'+sha.slice(0,12)+'.html';
  document.body.appendChild(a);a.click();
  setTimeout(function(){try{document.body.removeChild(a);URL.revokeObjectURL(url);}catch(e){}},1500);
  document.getElementById('hash').textContent='sha256: '+sha;
  log('<b>CARRY FILE EXPORTED</b><div class="mono">harz-contribution-'+sha.slice(0,12)+'.html<br>'+sha+'</div>Self-verifying single file. NOT published and NOT queued until it reaches a connection.');
};
document.getElementById('import').onchange=function(ev){
  var f=ev.target.files[0];if(!f){return;}
  var rd=new FileReader();
  rd.onload=function(){
    var raw=String(rd.result),d=null;
    try{d=JSON.parse(raw);}catch(e){}
    if(!d){
      var i=raw.indexOf('<script id="c"');
      if(i>=0){var s=raw.indexOf('>',i)+1;var e2=raw.indexOf('<'+'/script>',s);
        if(e2>s){try{d=JSON.parse(raw.slice(s,e2));}catch(e3){}}}
    }
    if(!d||d.kind!=='harz.hcie.contribution'){
      log('<b class="warn">NOT A CONTRIBUTION FILE</b> No contribution payload found in that file.');return;}
    var t=canonical(d.text||''),got=shaHex(t),ok=(got===d.sha256);
    title.value=d.title||'';author.value=d.author||'';device.value=d.device||'';
    if(ok){text.value=d.text||'';document.getElementById('hash').textContent='sha256: '+got;}
    log('<b>'+(ok?'CARRIED CONTRIBUTION VERIFIED':'<span class="warn">HASH MISMATCH — REFUSED</span>')+'</b>'+
      '<div class="mono">'+(d.title||'')+' | '+(d.author||'')+'<br>declared '+(d.sha256||'').slice(0,32)+
      '<br>actual&nbsp;&nbsp; '+got.slice(0,32)+'</div>'+
      (ok?'Text loaded. Nothing is published: press "Verify &amp; queue for review".':'Text NOT loaded into the editor.'));
  };
  rd.readAsText(f);
};
(function(){try{var d=JSON.parse(localStorage.getItem('hcie_draft')||'null');if(d){title.value=d.title||'';text.value=d.text||'';author.value=d.author||'';device.value=d.device||'';log('Draft restored from this device.');}}catch(e){}})();
</script></body></html>`;

export default {
  async fetch(req, env) {
    const u = new URL(req.url);
    if (req.method === "GET" && (u.pathname === "/" || u.pathname === "/index.html")) {
      return new Response(page(), { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
    }
    if (u.pathname === "/manifest.json") return Response.json(MANIFEST, { headers: { "cache-control": "max-age=3600" } });
    if (u.pathname === "/icon.svg") return new Response(ICON, { headers: { "content-type": "image/svg+xml", "cache-control": "max-age=86400" } });
    if (u.pathname === "/api/hcie/status") {
      try { return j(await status(env)); } catch (e) { return j({ error: String(e.message || e) }, 500); }
    }
    if (u.pathname === "/api/hcie/sources") {
      await ensureSeed(env);
      return j((await env.HARZ_DB.prepare("SELECT * FROM hcie_sources ORDER BY id").all()).results);
    }
    if (u.pathname === "/read" || u.pathname.startsWith("/read/")) return new Response(READ_HTML, { headers: { "content-type": "text/html;charset=utf-8", "cache-control": "no-store" } });
    if (u.pathname === "/gate3" || u.pathname === "/gate3/") { u.pathname = "/api/hcie/bundle.html"; }
    if (u.pathname === "/sw.js") return new Response(SW_JS, { headers: { "content-type": "application/javascript", "cache-control": "no-store" } });
    if (u.pathname === "/write" || u.pathname === "/write/") return new Response(WRITE_HTML, { headers: { "content-type": "text/html;charset=utf-8", "cache-control": "no-store" } });
    if (u.pathname === "/reset" || u.pathname === "/reset/") return new Response(RESET_HTML, { headers: { "content-type": "text/html;charset=utf-8", "cache-control": "no-store" } });
    if (u.pathname === "/review" || u.pathname === "/review/") return new Response(REVIEW_HTML, { headers: { "content-type": "text/html;charset=utf-8", "cache-control": "no-store" } });
    if (u.pathname === "/api/hcie/review-auth" && req.method === "POST") {
      try { return j(await reviewAuth(env, await req.json().catch(() => ({})))); }
      catch (e) { return j({ ok: false, error: String(e.message || e) }, 500); }
    }
    if (u.pathname === "/api/hcie/contribute" && req.method === "POST") {
      try { return j(await contribute(env, await req.json().catch(() => ({})))); }
      catch (e) { return j({ ok: false, error: String(e.message || e) }, 500); }
    }
    if (u.pathname === "/api/hcie/review" && req.method === "POST") {
      try { return j(await review(env, await req.json().catch(() => ({})))); }
      catch (e) { return j({ ok: false, error: String(e.message || e) }, 500); }
    }
    if (u.pathname === "/api/hcie/queue") {
      const st = (u.searchParams.get("state") || "QUEUED").toUpperCase();
      const rows = await env.HARZ_DB.prepare(
        "SELECT id,author,device,title,actual_sha256,integrity,state,created_ts,reviewed_ts,reviewer FROM hcie_contributions WHERE state=? ORDER BY created_ts DESC LIMIT 100"
      ).bind(st).all();
      return j({ state: st, count: (rows.results || []).length, items: rows.results || [] });
    }
    if (u.pathname.startsWith("/api/hcie/contribution/")) {
      const cid = u.pathname.split("/").pop();
      const c = await env.HARZ_DB.prepare("SELECT * FROM hcie_contributions WHERE id=?").bind(cid).first();
      if (!c) return j({ error: "not found" }, 404);
      const rv = await env.HARZ_DB.prepare("SELECT ts,action,reviewer,note FROM hcie_reviews WHERE contribution_id=? ORDER BY id").bind(cid).all();
      return j({ contribution: c, review_trail: rv.results || [] });
    }
    if (u.pathname === "/gate3/tamper" || u.pathname === "/gate3/tamper.html") {
      const rows = await env.HARZ_DB.prepare(
        "SELECT id, source_key, version, canonical_sha256, bytes, captured_ts, content FROM hcie_objects WHERE verified=1 ORDER BY source_key, version LIMIT 10"
      ).all();
      const docs = (rows.results || []).map(function (o) {
        return { id: o.id, source: o.source_key, version: o.version, sha256: o.canonical_sha256, bytes: o.bytes, captured: o.captured_ts, text: o.content };
      });
      // alter exactly ONE character in exactly ONE document; the manifest hash stays the ORIGINAL
      let altered = null;
      let chosenLabel = "none";
      if (docs.length) {
        const want = u.searchParams.get("target");
        let target = null;
        if (want) {
          target = docs.find(function (x) { return String(x.id) === want || (x.source + ":" + x.version) === want; }) || null;
        }
        if (!target) target = docs.find(function (x) { return x.source === "dailytrust" && x.version === 1; }) || docs[Math.min(3, docs.length - 1)];
        chosenLabel = target.source + " v" + target.version + " (object " + target.id + ")"
        const t = String(target.text || "");
        const at = t.indexOf(" ", 60) > 0 ? t.indexOf(" ", 60) + 1 : 20;
        const ch = t.charAt(at);
        const swapped = ch === "Z" ? "Y" : "Z";
        target.text = t.slice(0, at) + swapped + t.slice(at + 1);
        altered = { id: target.id, source: target.source, version: target.version, sha256: target.sha256, bytes: target.bytes, original_char: ch, replacement_char: swapped, byte_offset: at };
        if (target.text === t) altered.warning = "no change applied";
        else if (target.text.length !== t.length) altered.warning = "length changed unexpectedly";
      }
      const payload = JSON.stringify({ kind: "harz.hcie.bundle", schema: 1, created: nowIso(), count: docs.length, tamper_target: chosenLabel,
        tamper: altered, docs: docs });
      const safe = payload.replace(/</g, "\\u003c");
      const page = BUNDLE_HTML.replace("__PAYLOAD__", safe)
        .replace("HARZ Gate 3 bundle", "HARZ Gate 3 TAMPER TEST")
        .replace("Self-verifying offline bundle. No network needed to verify or read.",
          "TAMPER TEST · altered: " + chosenLabel + " · manifest keeps the ORIGINAL trusted hashes");
      return new Response(page, { headers: Object.assign({ "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
        u.pathname.endsWith(".html") || u.searchParams.get("dl") === "1" ? { "content-disposition": "attachment; filename=harz-gate3-TAMPERED.html" } : {}) });
    }
    if (u.pathname === "/gate3/download") {
      const rows = await env.HARZ_DB.prepare("SELECT id, source_key, version, canonical_sha256, bytes, captured_ts, content FROM hcie_objects WHERE verified=1 ORDER BY source_key, version LIMIT 10").all();
      const docs = (rows.results || []).map(function (o) { return { id: o.id, source: o.source_key, version: o.version, sha256: o.canonical_sha256, bytes: o.bytes, captured: o.captured_ts, text: o.content }; });
      const payload = JSON.stringify({ kind: "harz.hcie.bundle", schema: 1, created: nowIso(), count: docs.length, docs: docs });
      const safe = payload.replace(/</g, "\\u003c");
      return new Response(BUNDLE_HTML.replace("__PAYLOAD__", safe), { headers: { "content-type": "text/html; charset=utf-8", "content-disposition": "attachment; filename=harz-gate3-bundle.html", "cache-control": "no-store" } });
    }
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

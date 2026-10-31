// HARZ RECAPTURE CONSUMER v1 — Oct 31, 2026 (HCIE S1: queue -> recapture wiring)
// Consumes v2.recapture.queue (written by harz-pack-watchdog) and produces VERIFIED captures.
// LAW: detection != delivery. Capture only what is fetched and hashed now; never fabricate.
// Verification: the recapture's landmark hash must equal the baseline the watchdog recorded
// at detection time (v2.watch.<page>). Match = VERIFIED capture of the detected version.
// Drift (changed again since detection) is recorded honestly, not hidden.

const SLICE = 6;

export default {
  async fetch(req, env, ctx) {
    const u = new URL(req.url);
    if (u.pathname === "/health") return json({ ok: true, app: "harz-recapture" });
    const k = u.searchParams.get("k");
    if (!env.RECAPTURE_KEY || k !== env.RECAPTURE_KEY) return json({ ok: false, error: "unauthorized" }, 401);
    if (req.method === "POST") {
      // wake from the watchdog: {type:"pack-change", changes:[...]}
      let body = {};
      try { body = await req.json(); } catch (e) {}
      const out = await drain(env);
      return json({ ok: true, woke_with: body.type || null, ...out });
    }
    const out = await drain(env);
    return json({ ok: true, ...out });
  },
  async scheduled(event, env, ctx) {
    await drain(env);
  },
};

function json(o, s) { return new Response(JSON.stringify(o, null, 1), { status: s || 200, headers: { "content-type": "application/json" } }); }

async function canonicalize(text) {
  const canonical = text
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\shx-headers=('[^']*'|"[^"]*")/gi, "")
    .replace(/\snonce=('[^']*'|"[^"]*")/gi, "")
    .replace(/csrf[a-z_-]*[=:]\s*['"]?[A-Za-z0-9_\-]{20,}/gi, "csrf=STRIPPED")
    .replace(/\s+/g, " ")
    .trim();
  const heads = canonical.match(/<h[1-4][^>]*>[\s\S]*?<\/h[1-4]>/gi) || [];
  const title = (canonical.match(/<title>[\s\S]*?<\/title>/i) || [""])[0];
  const lm = (title + " " + heads.join(" ")).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return lm;
}

async function sha256hex(s) {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function drain(env) {
  const now = new Date().toISOString();
  let q = { changes: [] };
  try { q = JSON.parse((await env.HARZ_BROWSER.get("v2.recapture.queue")) || '{"changes":[]}'); } catch (e) {}
  const pending = q.changes || [];
  if (pending.length === 0) return { processed: 0, queue_left: 0, note: "queue empty" };

  const batch = pending.slice(0, SLICE);
  const done = [];
  const log = JSON.parse((await env.HARZ_BROWSER.get("v2.recapture.log")) || "[]");

  for (const ch of batch) {
    const rec = { at: now, page: ch.page, url: ch.url, verified: false };
    try {
      const res = await fetch(ch.url, {
        headers: { "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) Chrome/120.0.0.0 Mobile Safari/537.36" },
        cf: { cacheTtl: 0 },
      });
      rec.http = res.status;
      if (!res.ok) { rec.error = "http_" + res.status; log.unshift(rec); continue; }
      const html = await res.text();
      const lm = await canonicalize(html);
      const lmHex = await sha256hex(lm);
      const fullHex = await sha256hex(html);
      const baseline = await env.HARZ_BROWSER.get("v2.watch." + ch.page);
      rec.landmark_sha256 = lmHex;
      rec.doc_sha256 = fullHex;
      rec.bytes = html.length;
      rec.landmark_len = lm.length;
      rec.matches_detected = baseline === lmHex;
      rec.verified = baseline === lmHex;
      if (!rec.verified && baseline) rec.drift = "content changed again since detection; captured current version honestly";
      if (lm.length < 100) { rec.error = "below_landmark_floor"; log.unshift(rec); continue; }
      // store the verified capture (immutable object in KV; content-addressed by doc sha)
      await env.HARZ_BROWSER.put("v2.capture." + ch.page, JSON.stringify({
        page: ch.page, url: ch.url, captured_at: now, doc_sha256: fullHex, landmark_sha256: lmHex,
        bytes: html.length, html: html.length > 900000 ? html.slice(0, 900000) : html,
      }));
      // freshness stamp for the UI (S4 will read this)
      await env.HARZ_BROWSER.put("v2.capturets." + ch.page, now);
      done.push(ch.page);
    } catch (e) {
      rec.error = String(e && e.message || e).slice(0, 80);
    }
    log.unshift(rec);
  }

  // queue rotation: remove processed, keep failures with attempt count
  const processedSet = new Set(done);
  const remaining = pending.filter((c) => !processedSet.has(c.page)).slice(0, 200);
  await env.HARZ_BROWSER.put("v2.recapture.queue", JSON.stringify({ queued_at: now, changes: remaining }));
  await env.HARZ_BROWSER.put("v2.recapture.log", JSON.stringify(log.slice(0, 40)));
  await env.HARZ_BROWSER.put("v2.recapture.lastrun", now);
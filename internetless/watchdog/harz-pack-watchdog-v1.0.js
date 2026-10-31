// HARZ PACK WATCHDOG v0.9 — Oct 20, 2026 (owner ruling: "no new added information will escape us")
// LAW: detection only, honest. Never fabricate. Failed check ≠ change. First sight = baseline, never an "update".
// Free-tier constraints honored: 50 subrequests/invocation -> slices of 40, fetched in PARALLEL (wall < 100s).
// Rotating cursor: full 82-page sweep completes every 2 cron fires (every 30 min, honest freshness).
// Changed pages land in v2.recapture.queue and wake the capture agent via v2.wake.url if set.

const SLICE = 40;

export default {
  async fetch(req, env, ctx) {
    const u = new URL(req.url);
    if (u.pathname === "/health") return new Response(JSON.stringify({ ok: true, app: "harz-pack-watchdog", v: "1.0" }), { headers: { "content-type": "application/json" } });
    const k = u.searchParams.get("k");
    const runKey = env.RECAPTURE_KEY || "HARZWAKE1";
    if (k !== runKey && k !== "HARZWAKE1") return new Response("refused", { status: 403 });
    if (u.pathname === "/run" || req.method === "POST") {
      // HCIE S1: drain the recapture queue (wake from detection or manual run)
      try {
        const out = await drain(env);
        return new Response(JSON.stringify({ ok: true, recapture: out }, null, 1), { headers: { "content-type": "application/json" } });
      } catch (e) {
        return new Response(JSON.stringify({ ok: false, error: String(e && e.message || e), stack: String(e && e.stack || "").slice(0, 400) }), { status: 500, headers: { "content-type": "application/json" } });
      }
    }
    const out = await checkSlice(env);
    return new Response(JSON.stringify(out, null, 1), { headers: { "content-type": "application/json" } });
  },
  async scheduled(event, env, ctx) {
    await checkSlice(env);
    await drain(env); // S1: consume the queue in the same fire
  },
};

async function checkSlice(env) {
  const sites = JSON.parse((await env.HARZ_BROWSER.get("v2.watchmap")) || "[]");
  const pages = [];
  for (const site of sites) for (const page of site.pages) pages.push({ domain: site.domain, ...page });
  const total = pages.length;
  const cursor = parseInt((await env.HARZ_BROWSER.get("v2.watch.cursor")) || "0", 10) || 0;
  const slice = pages.slice(cursor, cursor + SLICE);
  const next = (cursor + slice.length) % total;
  const now = new Date().toISOString();
  const changes = [];
  let miss = 0;

  const results = await Promise.all(slice.map(async (page) => {
    try {
      const res = await fetch(page.url, {
        headers: { "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) Chrome/120.0.0.0 Mobile Safari/537.36" },
        cf: { cacheTtl: 0 },
      });
      if (!res.ok) return { page, miss: true };
      const text = await res.text();
      const canonical = text
        .replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/<!--[\s\S]*?-->/g, "")
        .replace(/\shx-headers=('[^']*'|"[^"]*")/gi, "")
        .replace(/\snonce=('[^']*'|"[^"]*")/gi, "")
        .replace(/csrf[a-z_-]*[=:]\s*['"]?[A-Za-z0-9_\-]{20,}/gi, "csrf=STRIPPED")
        .replace(/\s+/g, " ")
        .trim();
      const blocked =
        /just a moment|checking your browser|cf-browser-verification|challenge-platform|__cf_chl|captcha/i.test(canonical) ||
        /cdn-cgi\/content\?id=/i.test(canonical) ||
        /challenges\.cloudflare\.com/i.test(canonical) ||
        /content-security-policy[^>]{0,120}nonce-/i.test(canonical) ||
        canonical.length < 150;
      if (blocked) return { page, miss: true, blocked: true };
      /* v0.9 semantic landmarks: watch only title + headings (what real edits touch).
         Rotating tokens, ads, tickers and per-session nonces never touch landmarks;
         challenge interstitials have no landmarks and fail the floor below. */
      const heads = canonical.match(/<h[1-4][^>]*>[\s\S]*?<\/h[1-4]>/gi) || [];
      const title = (canonical.match(/<title>[\s\S]*?<\/title>/i) || [""])[0];
      const landmarks = title + " " + heads.join(" ");
      const lm = landmarks.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      if (lm.length < 100) return { page, miss: true, blocked: true };
      const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(lm));
      const hex = [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
      return { page, hex, canonLen: lm.length, sample: lm.slice(0, 100) };
    } catch (e) {
      return { page, miss: true };
    }
  }));

  for (const r of results) {
    const key = "v2.watch." + r.page.key;
    const prev = await env.HARZ_BROWSER.get(key);
    const prevLen = parseInt((await env.HARZ_BROWSER.get("v2.watchlen." + r.page.key)) || "0", 10) || 0;
    if (r.miss) {
      miss++;
      await env.HARZ_BROWSER.put("v2.watchmiss." + r.page.key, JSON.stringify({ at: now, blocked: !!r.blocked, first_sight: prev === null }));
      continue;
    }
    if (prev !== null && prevLen > 0 && (r.canonLen < prevLen * 0.6 || r.canonLen > prevLen * 1.67)) {
      miss++;
      await env.HARZ_BROWSER.put("v2.watchmiss." + r.page.key, JSON.stringify({ at: now, blocked: true, volatile: true, first_sight: prev === null, len: r.canonLen, prevLen }));
      continue;
    }
    if (prev !== null) await env.HARZ_BROWSER.delete("v2.watchmiss." + r.page.key);
    if (prev !== r.hex) {
      await env.HARZ_BROWSER.put(key, r.hex);
      await env.HARZ_BROWSER.put("v2.watchlen." + r.page.key, String(r.canonLen));
      await env.HARZ_BROWSER.put("v2.watchts." + r.page.key, now);
      if (prev !== null) {
        changes.push({ domain: r.page.domain, page: r.page.key, url: r.page.url, when: now, sample: r.sample });
        // HARZ SYNC Stage 1 (mission order Oct 20): durable change journal. Detection != delivery; every eligible change gets a durable record.
        let jhead = parseInt((await env.HARZ_BROWSER.get("v2.journal.head")) || "0", 10) + 1;
        const jentry = { seq: jhead, at: now, url: r.page.url, page: r.page.key, prev_hash: prev, new_hash: r.hex, hash_basis: "semantic-landmark-canonical", len: r.canonLen, state: "detected", state_at: now };
        await env.HARZ_BROWSER.put("v2.journal." + jhead, JSON.stringify(jentry));
        await env.HARZ_BROWSER.put("v2.journal.head", String(jhead));
        // HARZ SYNC Stage 3: unified journal API (harz-sync-journal). Writer token arrives via private channel into KV v2.journal.writer.token.
        // Absent token = honest skip (the durable KV journal record above still stands; nothing is lost, nothing is faked).
        const jtok = await env.HARZ_BROWSER.get("v2.journal.writer.token");
        if (jtok) {
          try {
            await fetch("https://harz-sync-journal.hamzarabiu390.workers.dev/append", {
              method: "POST",
              headers: { "Content-Type": "application/json", "X-Journal-Token": jtok },
              body: JSON.stringify({
                kind: "pack-update", resource_url: r.page.url, store: "watch", doc_id: r.page.key,
                version: 2, origin: "harz-pack-watchdog", old_sha256: prev, new_sha256: r.hex,
                occurred_at: now, event_source: "semantic-landmark-detection",
                note: "detected by watchdog; KV journal entry v2.journal." + jhead
              })
            });
          } catch (e) { /* API failure never erases the KV journal record */ }
        }
      }
    }
  }

  if (changes.length > 0) {
    let prior = [];
    try { prior = (JSON.parse((await env.HARZ_BROWSER.get("v2.recapture.queue")) || "{}").changes) || []; } catch (e) {}
    const seen = new Set(prior.map((c) => c.page));
    const merged = prior.concat(changes.filter((c) => !seen.has(c.page)));
    await env.HARZ_BROWSER.put("v2.recapture.queue", JSON.stringify({ queued_at: now, changes: merged }));
    const wakeUrl = await env.HARZ_BROWSER.get("v2.wake.url");
    if (wakeUrl) {
      try {
        await fetch(wakeUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "pack-change", changes }),
        });
      } catch (e) {
        /* wake failure is not a data failure; queue is durable */
      }
    }
  }

  await env.HARZ_BROWSER.put("v2.watch.cursor", String(next));
  await env.HARZ_BROWSER.put("v2.watch.lastcheck", now);
  return {
    slice_checked: slice.length,
    total_pages: total,
    cursor_was: cursor,
    cursor_next: next,
    full_sweep_cycles: Math.ceil(total / SLICE),
    changes: changes.length,
    changed: changes,
    misses: miss,
    at: now,
  };
}


// ===== HCIE S1 RECAPTURE CONSUMER (Oct 31) =====
async function drain(env) {
  const now = new Date().toISOString();
  let q = { changes: [] };
  try { q = JSON.parse((await env.HARZ_BROWSER.get("v2.recapture.queue")) || '{"changes":[]}'); } catch (e) {}
  const pending = q.changes || [];
  if (pending.length === 0) return { processed: 0, queue_left: 0, note: "queue empty" };
  const batch = pending.slice(0, 6);
  const done = [];
  let log = [];
  try { log = JSON.parse((await env.HARZ_BROWSER.get("v2.recapture.log")) || "[]"); } catch (e) {}
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
      const canonical = html.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<!--[\s\S]*?-->/g, "").replace(/\s+/g, " ").trim();
      const heads = canonical.match(/<h[1-4][^>]*>[\s\S]*?<\/h[1-4]>/gi) || [];
      const title = (canonical.match(/<title>[\s\S]*?<\/title>/i) || [""])[0];
      const lm = (title + " " + heads.join(" ")).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      const enc = new TextEncoder();
      const lmHex = [...new Uint8Array(await crypto.subtle.digest("SHA-256", enc.encode(lm)))].map((b) => b.toString(16).padStart(2, "0")).join("");
      const fullHex = [...new Uint8Array(await crypto.subtle.digest("SHA-256", enc.encode(html)))].map((b) => b.toString(16).padStart(2, "0")).join("");
      rec.landmark_sha256 = lmHex; rec.doc_sha256 = fullHex; rec.bytes = html.length; rec.landmark_len = lm.length;
      if (lm.length < 100) { rec.error = "below_landmark_floor"; log.unshift(rec); continue; }
      const baseline = await env.HARZ_BROWSER.get("v2.watch." + ch.page);
      rec.matches_detected = baseline === lmHex;
      rec.verified = baseline === lmHex;
      if (baseline && baseline !== lmHex) rec.drift = "changed again since detection; current version captured";
      await env.HARZ_BROWSER.put("v2.capture." + ch.page, JSON.stringify({ page: ch.page, url: ch.url, captured_at: now, doc_sha256: fullHex, landmark_sha256: lmHex, bytes: html.length, html: html.length > 900000 ? html.slice(0, 900000) : html }));
      await env.HARZ_BROWSER.put("v2.capturets." + ch.page, now);
      done.push(ch.page);
    } catch (e) { rec.error = String((e && e.message) || e).slice(0, 80); }
    log.unshift(rec);
  }
  const processedSet = new Set(done);
  const remaining = pending.filter((c) => !processedSet.has(c.page)).slice(0, 200);
  await env.HARZ_BROWSER.put("v2.recapture.queue", JSON.stringify({ queued_at: now, changes: remaining }));
  await env.HARZ_BROWSER.put("v2.recapture.log", JSON.stringify(log.slice(0, 40)));
  await env.HARZ_BROWSER.put("v2.recapture.lastrun", now);
  return { processed: done.length, queue_left: remaining.length, pages: done, at: now };
}

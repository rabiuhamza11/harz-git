// HARZ PACK WATCHDOG v0.4 — Oct 20, 2026 (owner ruling: "no new added information will escape us")
// LAW: detection only, honest. Never fabricate. Failed check ≠ change. First sight = baseline, never an "update".
// Free-tier constraints honored: 50 subrequests/invocation -> slices of 40, fetched in PARALLEL (wall < 100s).
// Rotating cursor: full 82-page sweep completes every 2 cron fires (every 30 min, honest freshness).
// Changed pages land in v2.recapture.queue and wake the capture agent via v2.wake.url if set.

const SLICE = 40;

export default {
  async fetch(req, env, ctx) {
    const u = new URL(req.url);
    if (u.searchParams.get("k") !== "HARZWAKE1") return new Response("refused", { status: 403 });
    const out = await checkSlice(env);
    return new Response(JSON.stringify(out, null, 1), { headers: { "content-type": "application/json" } });
  },
  async scheduled(event, env, ctx) {
    await checkSlice(env);
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
        .replace(/\s+/g, " ")
        .trim();
      const blocked =
        /just a moment|checking your browser|cf-browser-verification|challenge-platform|__cf_chl|captcha/i.test(canonical) ||
        canonical.length < 150;
      if (blocked) return { page, miss: true, blocked: true };
      const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(canonical));
      const hex = [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
      return { page, hex, sample: canonical.slice(0, 100) };
    } catch (e) {
      return { page, miss: true };
    }
  }));

  for (const r of results) {
    const key = "v2.watch." + r.page.key;
    const prev = await env.HARZ_BROWSER.get(key);
    if (r.miss) {
      miss++;
      if (prev !== null) await env.HARZ_BROWSER.put("v2.watchmiss." + r.page.key, now);
      continue;
    }
    if (prev !== r.hex) {
      await env.HARZ_BROWSER.put(key, r.hex);
      await env.HARZ_BROWSER.put("v2.watchts." + r.page.key, now);
      if (prev !== null) {
        changes.push({ domain: r.page.domain, page: r.page.key, url: r.page.url, when: now, sample: r.sample });
      }
    }
  }

  if (changes.length > 0) {
    await env.HARZ_BROWSER.put("v2.recapture.queue", JSON.stringify({ queued_at: now, changes }));
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

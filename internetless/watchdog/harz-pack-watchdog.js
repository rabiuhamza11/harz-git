// HARZ PACK WATCHDOG v0.1 — Oct 20, 2026 (Hauwa, owner ruling: "no new added information will escape us")
// LAW: detection only, honest. The watchdog never fabricates content; it detects change and queues recapture.
// Free-tier cron granularity = 15 min, so "the second a change happens" is honestly "within ~15 minutes".
// Changed pages land in the KV queue v2.recapture.queue and wake the capture agent (Hauwa) via wake URL if set.
// Phones receive updates at their next online sync; sync becomes incremental (per-pack sha256) so it feels near-instant.

export default {
  async scheduled(event, env, ctx) {
    const map = JSON.parse((await env.HARZ_BROWSER.get("v2.watchmap")) || "[]");
    const changes = [];
    const now = new Date().toISOString();
    for (const site of map) {
      for (const page of site.pages) {
        try {
          const res = await fetch(page.url, {
            headers: { "User-Agent": "HARZ-Watchdog/1.0 (library freshness check)" },
            cf: { cacheTtl: 0 },
          });
          if (!res.ok) continue; // network/site miss: no state change, next cycle retries
          const body = new Uint8Array(await res.arrayBuffer());
          const hash = await crypto.subtle.digest("SHA-256", body);
          const hex = [...new Uint8Array(hash)].map(b => b.toString(16).padStart(2, "0")).join("");
          const key = "v2.watch." + page.key;
          const prev = await env.HARZ_BROWSER.get(key);
          if (prev !== hex) {
            await env.HARZ_BROWSER.put(key, hex);
            await env.HARZ_BROWSER.put("v2.watchts." + page.key, now);
            if (prev !== null) {
              // KNOWN page CHANGED -> queue recapture (first-seen baseline is not a change)
              changes.push({ domain: site.domain, key: page.key, url: page.url, ts: now });
            }
          }
        } catch (e) { /* fetch failure is not a change; honest silence */ }
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
        } catch (e) { /* wake failure is not a data failure; queue is durable */ }
      }
    }
    await env.HARZ_BROWSER.put("v2.watch.lastcheck", now);
  },
};

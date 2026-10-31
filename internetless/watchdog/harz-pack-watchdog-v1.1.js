// HARZ PACK WATCHDOG v1.1 — Oct 31, 2026. State moved KV->D1 (KV 1k puts/day was exhausted by detection).
// LAWS unchanged: detection only, honest, first sight = baseline, failed check != change, queue is durable.
const SLICE = 40;
const UA = "Mozilla/5.0 (Linux; Android 12) Chrome/120";

export default {
  async fetch(req, env, ctx) {
    const u = new URL(req.url);
    if (u.pathname === "/health") return j({ ok: true, app: "harz-pack-watchdog", v: "1.1" });
    const key = u.searchParams.get("k") || "";
    const runKey = env.RECAPTURE_KEY || "HARZWAKE1";
    if (req.method === "POST") {
      const out = await drain(env).catch((e) => ({ error: String(e && e.message || e) }));
      return j({ ok: true, woke: true, recapture: out });
    }
    if (u.pathname === "/run") {
      if (key !== runKey) return new Response("refused", { status: 403 });
      const out = await drain(env).catch((e) => ({ error: String(e && e.message || e) }));
      return j({ ok: true, recapture: out });
    }
    if (u.pathname === "/check") {
      if (key !== runKey) return new Response("refused", { status: 403 });
      const out = await checkSlice(env).catch((e) => ({ error: String(e && e.message || e) }));
      return j(out);
    }
    if (key !== "HARZWAKE1") return new Response("refused", { status: 403 });
    const out = await checkSlice(env);
    return j(out);
  },
  async scheduled(event, env, ctx) {
    await checkSlice(env);
    await drain(env).catch(() => {});
  },
};
function j(o, s) { return new Response(JSON.stringify(o, null, 1), { status: s || 200, headers: { "content-type": "application/json" } }); }

function canonicalize(text) {
  return text
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\shx-headers=('[^']*'|"[^"]*")/gi, "")
    .replace(/\snonce=('[^']*'|"[^"]*")/gi, "")
    .replace(/csrf[a-z_-]*[=:]\s*['"]?[A-Za-z0-9_\-]{20,}/gi, "csrf=STRIPPED")
    .replace(/\s+/g, " ")
    .trim();
}
function landmarksOf(canonical) {
  const heads = canonical.match(/<h[1-4][^>]*>[\s\S]*?<\/h[1-4]>/gi) || [];
  const title = (canonical.match(/<title>[\s\S]*?<\/title>/i) || [""])[0];
  return (title + " " + heads.join(" ")).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}
async function sha256hex(str) {
  const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
  return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");
}
function blockedBy(canonical) {
  return /just a moment|checking your browser|cf-browser-verification|challenge-platform|__cf_chl|captcha/i.test(canonical) ||
    /cdn-cgi\/content\?id=/i.test(canonical) ||
    /challenges\.cloudflare\.com/i.test(canonical) ||
    /content-security-policy[^>]{0,120}nonce-/i.test(canonical) ||
    canonical.length < 150;
}

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
  let miss = 0, seeded = 0, checked = 0;
  for (const page of slice) {
    const pageKey = page.key || (page.domain + "." + (page.path || "index"));
    try {
      const base = await env.WATCH_DB.prepare("SELECT hex FROM watch_baselines WHERE page_key=?").bind(pageKey).first();
      if (!base) {
        const legacy = await env.HARZ_BROWSER.get("v2.watch." + pageKey);
        const res = await fetch(page.url, { headers: { "user-agent": UA } });
        if (!res.ok) { miss++; continue; }
        const canonical = canonicalize(await res.text());
        if (blockedBy(canonical)) { miss++; continue; }
        const lm = landmarksOf(canonical);
        if (lm.length < 100) { miss++; continue; }
        const hex = await sha256hex(lm);
        await env.WATCH_DB.prepare("INSERT OR REPLACE INTO watch_baselines(page_key,domain,hex,len,updated_at) VALUES(?,?,?,?,?)").bind(pageKey, page.domain, hex, lm.length, now).run();
        seeded++;
        continue;
      }
      const res = await fetch(page.url, { headers: { "user-agent": UA } });
      if (!res.ok) { miss++; continue; }
      const canonical = canonicalize(await res.text());
      if (blockedBy(canonical)) { miss++; continue; }
      const lm = landmarksOf(canonical);
      if (lm.length < 100) { miss++; continue; }
      const hex = await sha256hex(lm);
      checked++;
      if (hex !== base.hex) {
        await env.WATCH_DB.prepare("UPDATE watch_baselines SET hex=?, len=?, updated_at=? WHERE page_key=?").bind(hex, lm.length, now, pageKey).run();
        await env.WATCH_DB.prepare("INSERT INTO watch_journal(page_key,domain,old_hex,new_hex,detected_at) VALUES(?,?,?,?,?)").bind(pageKey, page.domain, base.hex, hex, now).run();
        await env.WATCH_DB.prepare("INSERT OR IGNORE INTO recapture_queue(page_key,domain,url,queued_at) VALUES(?,?,?,?)").bind(pageKey, page.domain, page.url, now).run();
        changes.push({ page: pageKey, domain: page.domain, url: page.url, from: base.hex.slice(0, 12), to: hex.slice(0, 12) });
      }
    } catch (e) { miss++; }
  }
  await env.HARZ_BROWSER.put("v2.watch.cursor", String(next));
  await env.HARZ_BROWSER.put("v2.watch.lastcheck", now);
  if (changes.length > 0) {
    const wakeUrl = await env.HARZ_BROWSER.get("v2.wake.url");
    if (wakeUrl) { try { await fetch(wakeUrl, { method: "POST", body: JSON.stringify({ type: "pack-change", changes }) }); } catch (e) {} }
  }
  return { slice_checked: slice.length, total_pages: total, cursor_next: next, checked, seeded, miss, changes_queued: changes.length, changes, at: now };
}

async function drain(env) {
  const rows = await env.WATCH_DB.prepare("SELECT page_key,domain,url,queued_at,attempts FROM recapture_queue WHERE attempts < 3 ORDER BY queued_at LIMIT 20").all();
  const items = (rows.results) || [];
  const done = [];
  const now = new Date().toISOString();
  for (const it of items) {
    try {
      const res = await fetch(it.url, { headers: { "user-agent": UA }, cf: { cacheTtl: 0 } });
      if (!res.ok) throw new Error("http " + res.status);
      const html = await res.text();
      const canonical = canonicalize(html);
      if (blockedBy(canonical)) throw new Error("blocked");
      const lm = landmarksOf(canonical);
      if (lm.length < 100) throw new Error("landmarks too thin");
      const landmarkSha = await sha256hex(lm);
      const fullSha = await sha256hex(html);
      await env.WATCH_DB.prepare("INSERT OR REPLACE INTO watch_captures(page_key,url,landmark_sha,full_sha,bytes,text_len,captured_at) VALUES(?,?,?,?,?,?,?)").bind(it.page_key, it.url, landmarkSha, fullSha, html.length, canonical.length, now).run();
      await env.WATCH_DB.prepare("INSERT INTO recapture_log(at,page_key,url,result,landmark_sha,bytes,error) VALUES(?,?,?,?,?,?,NULL)").bind(now, it.page_key, it.url, "captured_verified", landmarkSha, html.length).run();
      await env.WATCH_DB.prepare("DELETE FROM recapture_queue WHERE page_key=?").bind(it.page_key).run();
      done.push({ page: it.page_key, landmark_sha: landmarkSha.slice(0, 12), bytes: html.length });
    } catch (e) {
      const msg = String(e && e.message || e);
      const attempts = (it.attempts || 0) + 1;
      if (attempts >= 3) {
        await env.WATCH_DB.prepare("INSERT INTO recapture_log(at,page_key,url,result,landmark_sha,bytes,error) VALUES(?,?,?,?,NULL,NULL,?)").bind(now, it.page_key, it.url, "dead_after_3", msg).run();
        await env.WATCH_DB.prepare("DELETE FROM recapture_queue WHERE page_key=?").bind(it.page_key).run();
      } else {
        await env.WATCH_DB.prepare("UPDATE recapture_queue SET attempts=?, last_error=? WHERE page_key=?").bind(attempts, msg, it.page_key).run();
      }
      done.push({ page: it.page_key, error: msg, attempts });
    }
  }
  const left = await env.WATCH_DB.prepare("SELECT COUNT(*) c FROM recapture_queue").first();
  return { processed: done.length, queue_left: (left && left.c) || 0, items: done, at: now };
}

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// index.js
var VERSION = "2.4.0";
var SOVEREIGN_INGEST = "https://harz-sovereign-storage.harz.workers.dev/api/sovereign-ingest";
var TICK = 300;
var CONC = 12;
var MAX_FAIL = 5;
var FETCH_MS = 25e3;
var TEXT_CAP = 6e4;
var WAVE_MS = 3 * 3600 * 1e3;
var WAVE_TARGET = 1e4;
var CORS = { "Access-Control-Allow-Origin": "*" };
var json = /* @__PURE__ */ __name((d, s = 200) => new Response(JSON.stringify(d, null, 2), { status: s, headers: { "Content-Type": "application/json", "Cache-Control": "no-store", ...CORS } }), "json");
var norm = /* @__PURE__ */ __name((d) => String(d || "").toLowerCase().replace(/^www\./, ""), "norm");
var JUNK = /(escort|casino|bets?\.|betting|poker|porn|xxx|adult|fuck|gambl|slots|filesdl|zplaybet|pharma|viagra|doubleclick|googletagmanager|google-analytics|googlesyndication|analytics\.|scorecardresearch|adservice|adsystem|adtech|tracking\.|\.track|tracker|trafficjunky|outbrain|taboola|criteo|adsrv|adcash|propellerads|cdn\.|jsdelivr|cdnjs|cloudflare\.com|amazonaws\.com|googleapis\.com|akamai|fastly)/;
var isJunk = /* @__PURE__ */ __name((d) => JUNK.test(String(d || "").toLowerCase()), "isJunk");
async function getJSON(kv, key, fallback) {
  try {
    const v = await kv.get(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}
__name(getJSON, "getJSON");
async function putJSON(kv, key, val) {
  await kv.put(key, JSON.stringify(val));
}
__name(putJSON, "putJSON");
async function extractPage(resp) {
  const parts = [];
  let chars = 0;
  let title = "";
  const rewriter = new HTMLRewriter().on("title", { text(t) {
    if (title.length < 300) title += t.text;
  } }).on("p,h1,h2,h3,h4,h5,h6,li", { text(t) {
    if (chars >= TEXT_CAP) return;
    const s = t.text.trim();
    if (s) {
      parts.push(s);
      chars += s.length;
    }
  } });
  await rewriter.transform(resp).arrayBuffer();
  return { title: title.trim().slice(0, 300), text: parts.join("\n").slice(0, TEXT_CAP) };
}
__name(extractPage, "extractPage");
async function fetchDomain(d) {
  const opts = { redirect: "follow", signal: AbortSignal.timeout(FETCH_MS), headers: { "User-Agent": "Mozilla/5.0 (Linux; Android 10; Infinix) AppleWebKit/537.36 Chrome/124 Mobile Safari/537.36", "Accept": "text/html,*/*" } };
  let resp;
  try {
    resp = await fetch("https://" + d + "/", opts);
  } catch (e) {
    resp = await fetch("http://" + d + "/", opts);
  }
  const bail = /* @__PURE__ */ __name(async (msg) => {
    try {
      resp.body && await resp.body.cancel();
    } catch (e) {
    }
    throw new Error(msg);
  }, "bail");
  if (!resp.ok) return bail("HTTP " + resp.status);
  const ct = resp.headers.get("content-type") || "";
  if (!ct.includes("html")) return bail("not html: " + (ct.split(";")[0] || "?"));
  const { title, text } = await extractPage(resp);
  if (text.length < 250) throw new Error("thin page (" + text.length + " chars)");
  return { url: "https://" + d + "/", title: title || d, domain: d, source: "cloud-wave", language: "", fetched_at: (/* @__PURE__ */ new Date()).toISOString(), text };
}
__name(fetchDomain, "fetchDomain");
async function ingestDocs(env, docs) {
  let ins = 0, dup = 0, lost = 0;
  for (let i = 0; i < docs.length; i += 100) {
    const chunk = docs.slice(i, i + 100);
    try {
      const r = await fetch(SOVEREIGN_INGEST, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: env.SOVEREIGN_KEY, docs: chunk }),
        signal: AbortSignal.timeout(6e4)
      });
      const d = await r.json();
      if (!d.ok) throw new Error(d.error || "sovereign " + r.status);
      ins += d.inserted;
      dup += d.dup_rejected_this_batch;
    } catch (e) {
      lost += chunk.length;
    }
  }
  return { ins, dup, lost };
}
__name(ingestDocs, "ingestDocs");
async function tick(env, limit, source) {
  const kv = env.HARZ_BROWSER;
  const lock = await getJSON(kv, "wave-lock", { at: 0 });
  if (Date.now() - (lock.at || 0) < 4 * 60 * 1e3) return { ok: false, skipped: "tick already running (lock fresh)", at: lock.at };
  await putJSON(kv, "wave-lock", { at: Date.now() });
  const cap = Math.min(limit || TICK, 1e3);
  const queue = await getJSON(kv, "gather-queue", []);
  const sources = (await getJSON(kv, "gather-sources", [])).map(norm);
  const active = queue.filter((d) => !sources.includes(norm(d)));
  let junk_skipped = 0;
  const cleanActive = active.filter((d) => {
    if (isJunk(d)) {
      junk_skipped++;
      return false;
    }
    return true;
  });
  let claimed = cleanActive.slice(0, cap);
  const remaining = queue.filter((d) => !claimed.includes(d));
  let bank_info = null;
  if (claimed.length < cap) {
    const bank = await getJSON(kv, "gather-bank.meta", null);
    if (bank && Array.isArray(bank.chunks)) {
      let ci = bank.ci || 0, off = bank.off || 0, fromBank = 0;
      while (claimed.length < cap && ci < bank.chunks.length) {
        const chunk = await getJSON(kv, bank.chunks[ci], []);
        const take = chunk.slice(off, off + (cap - claimed.length));
        for (const d of take) {
          if (isJunk(d)) continue;
          if (sources.includes(norm(d))) continue;
          claimed.push(d);
          fromBank++;
        }
        off += take.length;
        if (off >= chunk.length) {
          ci++;
          off = 0;
        }
      }
      await putJSON(kv, "gather-bank.meta", { ...bank, ci, off });
      bank_info = { chunk: ci, offset: off, taken: fromBank };
    }
  }
  await putJSON(kv, "gather-queue", remaining);
  if (!claimed.length) {
    return { ok: true, tick: 0, claimed: 0, note: "nothing to gather" };
  }
  const docs = [];
  const failures = [];
  for (let i = 0; i < claimed.length; i += CONC) {
    const group = claimed.slice(i, i + CONC);
    const res = await Promise.allSettled(group.map((d) => fetchDomain(d)));
    res.forEach((r, j) => {
      if (r.status === "fulfilled") docs.push(r.value);
      else failures.push({ d: group[j], why: String(r.reason && r.reason.message || r.reason) });
    });
  }
  const { ins, dup, lost } = docs.length ? await ingestDocs(env, docs) : { ins: 0, dup: 0, lost: 0 };
  let requeued = 0, dead = 0;
  if (failures.length) {
    const fcounts = await getJSON(kv, "wave-failures", {});
    const deadList = await getJSON(kv, "wave-dead", []);
    const q = remaining;
    for (const f of failures) {
      fcounts[f.d] = (fcounts[f.d] || 0) + 1;
      if (fcounts[f.d] >= MAX_FAIL) {
        if (!deadList.includes(f.d)) deadList.push(f.d);
        dead++;
      } else if (!q.includes(f.d)) {
        q.push(f.d);
        requeued++;
      }
    }
    await putJSON(kv, "gather-queue", q);
    await putJSON(kv, "wave-failures", fcounts);
    await putJSON(kv, "wave-dead", deadList.slice(-2e3));
  }
  const now = Date.now();
  const entry = { at: new Date(now).toISOString(), source: source || "cron", claimed: claimed.length, junk_skipped, ingested: ins, dup_rejected: dup, failed: failures.length, requeued, dead, lost, bank: bank_info };
  const log = await getJSON(kv, "wave-log", []);
  log.unshift(entry);
  await putJSON(kv, "wave-log", log.slice(0, 200));
  await putJSON(kv, "wave-last", entry);
  return { ok: true, ...entry };
}
__name(tick, "tick");
async function statusData(env) {
  const kv = env.HARZ_BROWSER;
  const log = await getJSON(kv, "wave-log", []);
  const queue = await getJSON(kv, "gather-queue", []);
  const dead = await getJSON(kv, "wave-dead", []);
  const bank = await getJSON(kv, "gather-bank.meta", null);
  let bank_remaining = 0;
  if (bank && Array.isArray(bank.chunks)) {
    const ci = bank.ci || 0, off = bank.off || 0;
    bank_remaining = (bank.chunks.length - ci) * 5e4 - off;
  }
  const now = Date.now();
  const winStart = now - WAVE_MS;
  const w = { claimed: 0, ingested: 0, dup_rejected: 0, failed: 0, ticks: 0 };
  for (const t of log) {
    const at = Date.parse(t.at);
    if (at >= winStart) {
      w.claimed += t.claimed || 0;
      w.ingested += t.ingested || 0;
      w.dup_rejected += t.dup_rejected || 0;
      w.failed += t.failed || 0;
      w.ticks++;
    }
  }
  const wv = { ...w, wave_target: WAVE_TARGET, window_started_at: new Date(winStart).toISOString(), pct_of_target: Math.round(w.claimed / WAVE_TARGET * 100) };
  const paused = await getJSON(kv, "wave-paused", { on: false });
  const watch = ["docs.oracle.com", "ethnologue.com", "zenithbank.com"];
  const dead_watch = {};
  for (const w2 of watch) dead_watch[w2] = dead.some((d) => d.includes(w2));
  return { version: VERSION, paused: !!(paused && paused.on), dead_watch, tick_size: TICK, cadence: "every 5 min", wave_window: "3 hours", current_wave: wv, queue_length: queue.length, bank_remaining, dead_domains: dead.length, recent_ticks: log.slice(0, 12) };
}
__name(statusData, "statusData");
var index_default = {
  async scheduled(evt, env, ctx) {
    await tick(env, TICK, "cron");
  },
  async fetch(req, env, ctx) {
    const u = new URL(req.url);
    const p = u.pathname;
    try {
      if (p === "/health") return json({ ok: true, app: "harz-corpus-wave", version: VERSION, tick: TICK, cadence: "every 5 min", wave: "3h / ~10,800 docs" });
      if (p === "/status") return json(await statusData(env));
      if (p === "/") return panel(await statusData(env));
      if (p === "/sw.js") return new Response('self.addEventListener("install",e=>self.skipWaiting());self.addEventListener("activate",e=>self.clients.claim());', { headers: { "Content-Type": "application/javascript" } });
      if (p === "/manifest.json") return new Response(JSON.stringify({ name: "HARZ Corpus Wave", short_name: "CorpusWave", start_url: "/", display: "standalone", background_color: "#f0f2f5", theme_color: "#f0f2f5", icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }] }), { headers: { "Content-Type": "application/json" } });
      if (p === "/icon.svg") return new Response('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="#1877f2"/><text x="50" y="66" font-size="44" text-anchor="middle" fill="#fff" font-family="Arial" font-weight="bold">W</text></svg>', { headers: { "Content-Type": "image/svg+xml" } });
      if (p === "/recover") {
        if (!env.WAVE_KEY || u.searchParams.get("key") !== env.WAVE_KEY) return json({ ok: false, error: "unauthorized" }, 401);
        const state = await getJSON(env.HARZ_BROWSER, "wave-run", {});
        const pending = Array.isArray(state.pending) ? state.pending : [];
        const cursor = state.cursor || 0;
        const tail = pending.slice(cursor);
        if (!tail.length) return json({ ok: true, recovered: 0, note: "nothing to recover" });
        const q = await getJSON(env.HARZ_BROWSER, "gather-queue", []);
        let added = 0;
        for (const d of tail) if (!q.includes(d)) {
          q.push(d);
          added++;
        }
        await putJSON(env.HARZ_BROWSER, "gather-queue", q);
        await putJSON(env.HARZ_BROWSER, "wave-run", { id: state.id, status: "recovered", started_at: state.started_at, recovered: added });
        return json({ ok: true, recovered: added, active_queue_now: q.length });
      }
      if (p === "/rescue-dead") {
        if (!env.WAVE_KEY || u.searchParams.get("key") !== env.WAVE_KEY) return json({ ok: false, error: "unauthorized" }, 401);
        const deadList = await getJSON(env.HARZ_BROWSER, "wave-dead", []);
        const fcounts = await getJSON(env.HARZ_BROWSER, "wave-failures", {});
        const q = await getJSON(env.HARZ_BROWSER, "gather-queue", []);
        let revived = 0, stayedDead = 0;
        for (const d of deadList) {
          if (isJunk(d)) {
            stayedDead++;
            continue;
          }
          if (!q.includes(d)) q.push(d);
          revived++;
        }
        await putJSON(env.HARZ_BROWSER, "gather-queue", q);
        await putJSON(env.HARZ_BROWSER, "wave-dead", []);
        for (const d of deadList) if (!isJunk(d)) delete fcounts[d];
        await putJSON(env.HARZ_BROWSER, "wave-failures", fcounts);
        return json({ ok: true, revived, stayed_dead_junk: stayedDead, active_queue_now: q.length, note: "strikes reset; MAX_FAIL now 5; timeout now 25s" });
      }
      if (p === "/pause" || p === "/resume") {
        if (!env.WAVE_KEY || u.searchParams.get("key") !== env.WAVE_KEY) return json({ ok: false, error: "unauthorized" }, 401);
        const on = p === "/pause";
        await putJSON(env.HARZ_BROWSER, "wave-paused", { on, at: (/* @__PURE__ */ new Date()).toISOString() });
        return json({ ok: true, paused: on, note: on ? "ticks skip; DO schedule stays armed; reversible anytime" : "ticks resumed" });
      }
      if (p === "/scheduler") {
        if (!env.WAVE_KEY || u.searchParams.get("key") !== env.WAVE_KEY) return json({ ok: false, error: "unauthorized" }, 401);
        const id = env.WAVE_SCHED.idFromName("main");
        const r = await env.WAVE_SCHED.get(id).fetch("https://do/wake");
        return new Response(r.body, { headers: { "Content-Type": "application/json" } });
      }
      if (p === "/run") {
        if (!env.WAVE_KEY || u.searchParams.get("key") !== env.WAVE_KEY) return json({ ok: false, error: "unauthorized" }, 401);
        const limit = Math.min(+(u.searchParams.get("limit") || TICK), 1e3);
        return json(await tick(env, limit, "manual"));
      }
      return json({ ok: false, error: "not found", try: ["/health", "/status", "/"] }, 404);
    } catch (e) {
      return json({ ok: false, error: String(e && e.message || e) }, 500);
    }
  }
};
function panel(s) {
  const w = s.current_wave;
  const rows = (s.recent_ticks || []).map((t) => `<tr><td>${(t.at || "").slice(11, 19)}</td><td>${t.source}</td><td>${t.claimed}</td><td>${t.ingested}</td><td>${t.dup_rejected}</td><td>${t.failed}</td><td>${t.dead}</td></tr>`).join("");
  return new Response(`<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="manifest" href="/manifest.json"><link rel="icon" href="/icon.svg"><title>HARZ Corpus Wave</title><style>
body{font-family:system-ui,sans-serif;background:#f0f2f5;color:#111;margin:0;padding:16px;max-width:700px;margin:auto}
.card{background:#fff;border-radius:12px;padding:16px;margin:10px 0;box-shadow:0 1px 4px rgba(0,0,0,.08)}
h1{font-size:1.25rem;margin:0 0 2px}.mut{color:#666;font-size:.85rem}
.big{font-size:1.5rem;font-weight:700;color:#0b5d3b}
table{width:100%;border-collapse:collapse;font-size:.8rem}td,th{padding:6px 4px;border-bottom:1px solid #eee;text-align:left}
</style></head><body>
<div class="card"><h1>HARZ Corpus Wave</h1><div class="mut">The cloud wave \u2014 claims the gather queue, feeds the million-corpus vault \xB7 v${s.version}</div>
<div class="mut">Tick every 5 min (~${s.tick_size} domains) \xB7 rolling 3-hour wave \xB7 target ${w.wave_target.toLocaleString()} per wave</div></div>
<div class="card"><div class="big">${w.claimed.toLocaleString()} claimed this wave (${w.pct_of_target}% of target)</div>
<div class="mut">${w.ingested.toLocaleString()} ingested \xB7 ${w.dup_rejected.toLocaleString()} duplicates rejected \xB7 ${w.failed.toLocaleString()} failed \xB7 ${w.ticks} ticks</div></div>
<div class="card"><div class="mut">Backlog</div>
<div class="row" style="display:flex;justify-content:space-between;padding:4px 0"><span>Active queue</span><b>${s.queue_length.toLocaleString()}</b></div>
<div style="display:flex;justify-content:space-between;padding:4px 0"><span>Bank (1M campaign)</span><b>${s.bank_remaining.toLocaleString()}</b></div>
<div style="display:flex;justify-content:space-between;padding:4px 0"><span>Dead domains</span><b>${s.dead_domains.toLocaleString()}</b></div></div>
<div class="card"><div class="mut">Recent ticks</div>
<table><tr><th>time</th><th>src</th><th>claimed</th><th>ingested</th><th>dup</th><th>failed</th><th>dead</th></tr>${rows || '<tr><td colspan="7">no ticks yet</td></tr>'}</table></div>
<script>if('serviceWorker' in navigator)navigator.serviceWorker.register('/sw.js');setTimeout(()=>location.reload(),60000)<\/script></body></html>`, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });
}
__name(panel, "panel");
var WaveScheduler = class {
  static {
    __name(this, "WaveScheduler");
  }
  constructor(state, env) {
    this.state = state;
    this.env = env;
  }
  async fetch(req) {
    await this.ensureAlarm();
    const alarm = await this.state.storage.getAlarm();
    return new Response(JSON.stringify({ ok: true, scheduler: "alive", next_alarm: alarm ? new Date(alarm).toISOString() : null }), { headers: { "Content-Type": "application/json" } });
  }
  async ensureAlarm() {
    const cur = await this.state.storage.getAlarm();
    if (!cur) await this.state.storage.setAlarm(Date.now() + 1e3);
  }
  async alarm() {
    await this.state.storage.setAlarm(Date.now() + 5 * 60 * 1e3);
    const paused = await getJSON(this.env.HARZ_BROWSER, "wave-paused", { on: false });
    if (paused && paused.on) return;
    try {
      await tick(this.env, TICK, "do-alarm");
    } catch (e) {
    }
  }
};
export {
  WaveScheduler,
  index_default as default
};
//# sourceMappingURL=index.js.map

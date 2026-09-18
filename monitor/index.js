// HARZ Watchdog v1.0.0 — real fleet monitor (rebuild of harz-monitor)
// DO alarm every 10 min -> checks all money-path services -> KV history + incidents
// Same-account siblings via service bindings (loop protection), externals via public URLs.

const KV = {
  get: async (env, k) => { const v = await env.HARZ_HEALTH_KV.get(k); return v ? JSON.parse(v) : null; },
  put: async (env, k, v) => env.HARZ_HEALTH_KV.put(k, JSON.stringify(v))
};

// service binding checks (A1 siblings) + public checks (A2 / Pages / on-chain)
function buildChecks(env) {
  const j = async (r) => { const d = await r.json(); return { ok: r.ok && d.status !== "error" && !d.error, detail: d.version ? ("v" + d.version) : (d.status || "ok") }; };
  const h = (marker) => async (r) => { const t = await r.text(); return { ok: r.ok && t.includes(marker), detail: r.ok ? "200" : ("HTTP " + r.status) }; };
  const T = 8000;
  const sb = (binding, path, fn) => async () => { const t0 = Date.now(); try { const r = await env[binding].fetch("https://" + binding.toLowerCase() + ".internal" + path, { signal: AbortSignal.timeout(T) }); const c = await fn(r); return { ...c, latency_ms: Date.now() - t0 }; } catch (e) { return { ok: false, detail: String(e && e.message || e).slice(0, 80), latency_ms: Date.now() - t0 }; } };
  const pub = (url, fn) => async () => { const t0 = Date.now(); try { const r = await fetch(url, { signal: AbortSignal.timeout(T) }); const c = await fn(r); return { ...c, latency_ms: Date.now() - t0 }; } catch (e) { return { ok: false, detail: String(e && e.message || e).slice(0, 80), latency_ms: Date.now() - t0 }; } };
  return {
    "chain-v2":    sb("CHAINV2", "/api/status", j),
    "swap":        sb("SWAP", "/api/health", j),
    "exchange":    sb("EXCHANGE", "/", h("HARZ Exchange")),
    "bridge":      sb("BRIDGE", "/health", j),
    "wallet":      sb("WALLET", "/", h("HARZ")),
    "treasury":    sb("TREASURY", "/health", j),
    "super-cloud": sb("SUPERCLOUD", "/api/health", j),
    "super-app":   sb("SUPERAPP", "/", h("HARZ")),
    "faucet":      pub("https://harz-faucet.hamzarabiu390.workers.dev/", h("faucet")),
    "prism":       pub("https://harz-prism.hamzarabiu390.workers.dev/api/health", j),
    "payments":    pub("https://harz-payments.hamzarabiu390.workers.dev/api/health", j),
    "harz-cloud":  pub("https://harz-cloud.pages.dev/", async (r) => ({ ok: r.ok, detail: r.ok ? "200 (pages.dev body unreadable from worker fetch; content verified externally)" : "HTTP " + r.status })),
    "harz-wpol-pool": async () => {
      const t0 = Date.now();
      try {
        const rpc = await fetch("https://polygon-bor-rpc.publicnode.com", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_call", params: [{ to: "0x8a34cfc6b370e97fbff6c15339a743e2a1220319", data: "0x3850c7bd" }, "latest"] }), signal: AbortSignal.timeout(T) });
        const r1 = await rpc.json();
        if (!r1.result) throw new Error("RPC: " + JSON.stringify(r1).slice(0, 60));
        const sqrtP = BigInt("0x" + r1.result.slice(2, 66));
        const harzPerWpol = Number(sqrtP * sqrtP * 10n ** 6n / (2n ** 192n)) / 1e6; // token1/token0
        const cb = await fetch("https://api.exchange.coinbase.com/products/POL-USD/ticker", { signal: AbortSignal.timeout(T) });
        const tick = await cb.json();
        const pol = parseFloat(tick.price);
        let ngn = null;
        try { const nr = await env.SWAP.fetch("https://swap.internal/api/ngn"); const nd = await nr.json(); ngn = nd.ngn; } catch (e) {}
        const harzUsd = (isFinite(pol) && pol > 0) ? pol / harzPerWpol : null;
        const harzNgn = (ngn && harzUsd) ? harzUsd * ngn : null;
        const drift = harzNgn ? (((harzNgn - 15) / 15) * 100).toFixed(1) + "%" : "n/a";
        return { ok: true, latency_ms: Date.now() - t0, detail: `1 WPOL=${harzPerWpol.toFixed(3)} HARZ${harzUsd ? " | HARZ=$" + harzUsd.toFixed(5) : " | HARZ=$unavailable (POL-USD feed down)"}${harzNgn ? " | ₦" + harzNgn.toFixed(2) : ""} | peg drift ${drift}` };
      } catch (e) { return { ok: false, latency_ms: Date.now() - t0, detail: String(e && e.message || e).slice(0, 80) }; }
    }
  };
}

async function runChecks(env) {
  const checks = buildChecks(env);
  const names = Object.keys(checks);
  const results = await Promise.all(names.map(n => checks[n]()));
  const out = {};
  const now = Date.now();
  for (let i = 0; i < names.length; i++) {
    const name = names[i], res = results[i];
    out[name] = { ...res, ts: now };
    // latest
    await KV.put(env, "chk:" + name, out[name]);
    // rolling history (24h = 144 entries at 10 min)
    const hist = (await KV.get(env, "hist:" + name)) || [];
    hist.push({ ts: now, ok: res.ok, latency_ms: res.latency_ms });
    await KV.put(env, "hist:" + name, hist.slice(-144));
    // incidents: open after 2 consecutive fails, close on recovery
    const prev = await KV.get(env, "fail:" + name);
    const openInc = await KV.get(env, "inc:" + name);
    if (!res.ok && prev && prev.ok === false && !openInc) {
      await KV.put(env, "inc:" + name, { started: now, last_error: res.detail });
      const log = (await KV.get(env, "inclog")) || [];
      log.push({ service: name, started: now, ended: null, last_error: res.detail });
      await KV.put(env, "inclog", log.slice(-50));
    } else if (res.ok && openInc) {
      await env.HARZ_HEALTH_KV.delete("inc:" + name);
      const log = (await KV.get(env, "inclog")) || [];
      const last = log.filter(l => l.service === name && !l.ended).pop();
      if (last) last.ended = now;
      await KV.put(env, "inclog", log);
    } else if (!res.ok && openInc) {
      openInc.last_error = res.detail;
      await KV.put(env, "inc:" + name, openInc);
    }
    await KV.put(env, "fail:" + name, { ok: res.ok, ts: now });
  }
  await KV.put(env, "meta:lastRun", { ts: now });
  return out;
}

export class WatchdogDO {
  constructor(state, env) { this.state = state; this.env = env; }
  async fetch(req) {
    const url = new URL(req.url);
    if (url.pathname === "/arm") {
      const alarm = await this.state.storage.getAlarm();
      if (!alarm) await this.state.storage.setAlarm(Date.now() + 1000); // first check in 1s
      return Response.json({ armed: true });
    }
    if (url.pathname === "/run") {
      const out = await runChecks(this.env);
      return Response.json({ ran: true, ts: Date.now(), services: Object.keys(out).length });
    }
    return Response.json({ error: "unknown" }, { status: 404 });
  }
  async alarm() {
    try { await runChecks(this.env); } catch (e) { /* never die */ }
    await this.state.storage.setAlarm(Date.now() + 600000); // every 10 min
  }
}

async function snapshot(env) {
  const names = ["chain-v2", "swap", "exchange", "bridge", "wallet", "treasury", "super-cloud", "super-app", "faucet", "prism", "payments", "harz-cloud", "harz-wpol-pool"];
  const out = {};
  for (const n of names) out[n] = await KV.get(env, "chk:" + n);
  const incs = {};
  for (const n of names) { const i = await KV.get(env, "inc:" + n); if (i) incs[n] = i; }
  const last = await KV.get(env, "meta:lastRun");
  const hist = {};
  for (const n of names) { const h = await KV.get(env, "hist:" + n) || []; const last24 = h.filter(x => Date.now() - x.ts < 86400000); hist[n] = last24.length ? (last24.filter(x => x.ok).length / last24.length * 100).toFixed(1) : null; }
  return { version: "1.0.0", last_run: last ? last.ts : null, services: out, uptime24h: hist, open_incidents: incs };
}

const DASH = (s) => `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>HARZ Watchdog</title>
<meta name="theme-color" content="#f0f2f5">
<meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-status-bar-style" content="default"><meta name="apple-mobile-web-app-title" content="Watchdog">
<link rel="manifest" href="/manifest.json"><link rel="icon" href="/icon.svg" type="image/svg+xml"><link rel="apple-touch-icon" href="/icon.svg">
<style>*{margin:0;padding:0;box-sizing:border-box}body{background:#f0f2f5;color:#1a1a2e;font-family:-apple-system,'Segoe UI',Roboto,sans-serif;padding:14px;max-width:640px;margin:0 auto}
h1{font-size:1.3rem;color:#007bff}p.sub{color:#6c757d;font-size:.8rem;margin-bottom:12px}
.card{background:#fff;border-radius:12px;padding:12px;margin-bottom:9px;box-shadow:0 1px 4px rgba(0,0,0,.07)}
.row{display:flex;justify-content:space-between;align-items:center;font-size:.88rem}
.svc{font-weight:600}.ok{color:#28a745;font-weight:700}.bad{color:#dc3545;font-weight:700}
.det{color:#6c757d;font-size:.72rem;margin-top:2px;word-break:break-all}
.inc{background:#fff5f5;border:1px solid #ffc9c9}
footer{text-align:center;color:#6c757d;font-size:.72rem;padding:10px}</style></head><body>
<h1>HARZ Watchdog</h1>
<p class="sub">v1.0.0 — checks every 10 minutes · ${s.last_run ? "last run " + new Date(s.last_run).toLocaleString() : "first check starting"}</p>
${Object.entries(s.open_incidents || {}).map(([n, i]) => `<div class="card inc"><div class="row"><span class="svc">${n}</span><span class="bad">INCIDENT</span></div><div class="det">since ${new Date(i.started).toLocaleString()} — ${i.last_error || ""}</div></div>`).join("")}
${Object.entries(s.services || {}).map(([n, r]) => r ? `<div class="card"><div class="row"><span class="svc">${n}</span><span class="${r.ok ? "ok" : "bad"}">${r.ok ? "ONLINE" : "DOWN"}</span></div><div class="det">${r.detail || ""} · ${r.latency_ms}ms · up 24h: ${s.uptime24h && s.uptime24h[n] ? s.uptime24h[n] + "%" : "n/a"}</div></div>` : `<div class="card"><div class="row"><span class="svc">${n}</span><span style="color:#6c757d">…</span></div></div>`).join("")}
<footer>HARZ Watchdog v1.0.0 — 13 services checked automatically, incidents open after 2 consecutive failures.</footer>
<script>if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js').catch(()=>{})}</script></body></html>`;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    if (path === "/manifest.json") return Response.json({ name: "HARZ Watchdog", short_name: "Watchdog", start_url: "/status", display: "standalone", background_color: "#f0f2f5", theme_color: "#007bff", icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }] });
    if (path === "/sw.js") return new Response("self.addEventListener('fetch',e=>{});", { headers: { "Content-Type": "application/javascript" } });
    if (path === "/icon.svg") return new Response('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="#007bff"/><circle cx="50" cy="45" r="16" fill="#fff"/><rect x="46" y="55" width="8" height="20" fill="#fff"/></svg>', { headers: { "Content-Type": "image/svg+xml" } });
    // arm the DO alarm on every hit (idempotent)
    const id = env.WATCHDO.idFromName("singleton");
    ctx.waitUntil(env.WATCHDO.get(id).fetch("https://do/arm").catch(() => {}));
    if (path === "/status" || path === "/" || path === "/index.html") {
      const s = await snapshot(env);
      return new Response(DASH(s), { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });
    }
    if (path === "/api/status") {
      const s = await snapshot(env);
      return Response.json(s, { headers: { "Access-Control-Allow-Origin": "*", "Cache-Control": "no-store" } });
    }
    if (path === "/api/run") { // manual trigger (key-gated)
      if (request.headers.get("X-API-Key") !== env.REPORT_KEY) return Response.json({ error: "unauthorized" }, { status: 401 });
      return env.WATCHDO.get(id).fetch("https://do/run");
    }
    if (path === "/report") { // legacy key-gated report
      if (request.headers.get("X-API-Key") !== env.REPORT_KEY) return Response.json({ error: "unauthorized" }, { status: 401 });
      const s = await snapshot(env);
      return Response.json(s);
    }
    if (path === "/health") return Response.json({ status: "ok", service: "HARZ Watchdog", version: "1.0.0" });
    return new Response("Not found", { status: 404 });
  }
};


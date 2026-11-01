var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// worker-scorecard.js
var MACHINE = "https://harz-trading-machine.harz.workers.dev";
var GATES = { min_resolved_tickets: 100, min_expectancy_r: 0.2, min_profit_factor: 1.2, min_fill_rate_pct: 50, min_fill_rate_required: true };
var PROMOTION = { min_resolved_tickets: 172, rule: "172 resolved, or the agreed sequential rule", note: "a green interim 100 is a checkpoint, not qualification" };
var json = /* @__PURE__ */ __name((o, s = 200) => new Response(JSON.stringify(o, null, 1), { status: s, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }), "json");
async function sha256(text) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
__name(sha256, "sha256");
function canonJSON(v) {
  if (Array.isArray(v)) return "[" + v.map(canonJSON).join(",") + "]";
  if (v && typeof v === "object") {
    const ks = Object.keys(v).sort();
    return "{" + ks.map((k) => JSON.stringify(k) + ":" + canonJSON(v[k])).join(",") + "}";
  }
  return JSON.stringify(v === void 0 ? null : v);
}
__name(canonJSON, "canonJSON");
async function canonHash(text, dropFields) {
  try {
    const o = JSON.parse(text);
    for (const f of dropFields || []) delete o[f];
    return await sha256(canonJSON(o));
  } catch (e) {
    return await sha256(text);
  }
}
__name(canonHash, "canonHash");
async function getRaw(path, env) {
  const req = new Request(MACHINE + path, { headers: { "User-Agent": "HarzScorecard/1.0" } });
  const r = env && env.MACHINE ? await env.MACHINE.fetch(req) : await fetch(MACHINE + path, { headers: { "User-Agent": "HarzScorecard/1.0" }, signal: AbortSignal.timeout(2e4) });
  const text = await r.text();
  return { status: r.status, text, sha256: await canonHash(text, ["as_of", "now"]), raw_sha256: await sha256(text) };
}
__name(getRaw, "getRaw");
function evaluate(acc, sum, accMeta, sumMeta) {
  const o = acc.overall || {};
  const costs = sum.measured_costs || acc.measured_costs || {};
  const feeStr = String(costs.fees ?? "NOT MEASURED");
  const slipStr = String(costs.slippage ?? "NOT MEASURED");
  const costsMeasured = !/not measured/i.test(feeStr) && !/not measured/i.test(slipStr) && !!(costs.fees && costs.slippage);
  const gates = [
    { gate: "Resolved sample", threshold: `>= ${GATES.min_resolved_tickets} resolved`, actual: `${o.resolved ?? 0} resolved (${o.tickets ?? 0} tickets)`, pass: (o.resolved ?? 0) >= GATES.min_resolved_tickets },
    { gate: "Expectancy per trade", threshold: `>= +${GATES.min_expectancy_r}R (costs included)`, actual: `${o.expectancy_r ?? "n/a"}R`, pass: typeof o.expectancy_r === "number" && o.expectancy_r >= GATES.min_expectancy_r },
    { gate: "Profit factor", threshold: `>= ${GATES.min_profit_factor}`, actual: `${o.profit_factor ?? "n/a"}`, pass: typeof o.profit_factor === "number" && o.profit_factor >= GATES.min_profit_factor },
    { gate: "Costs measured (fees + slippage)", threshold: "modeled, not assumed", actual: costsMeasured ? "measured" : String(feeStr).slice(0, 60), pass: costsMeasured },
    { gate: "Fill rate understood", threshold: `>= ${GATES.min_fill_rate_pct}%`, actual: `${o.fill_rate_pct ?? "n/a"}%`, pass: typeof o.fill_rate_pct === "number" && o.fill_rate_pct >= GATES.min_fill_rate_pct }
  ];
  const failed = gates.filter((g) => !g.pass);
  const resolved = o.resolved ?? 0;
  const belowInterim = resolved < GATES.min_resolved_tickets;
  const belowPromotion = resolved < PROMOTION.min_resolved_tickets;
  const promotion = {
    bar: `${PROMOTION.min_resolved_tickets} resolved (or the agreed sequential rule)`,
    interim_checkpoint: `${GATES.min_resolved_tickets} resolved`,
    actual: `${resolved} resolved`,
    met: !belowPromotion,
    note: PROMOTION.note
  };
  let verdict, verdict_line;
  if (belowInterim) {
    verdict = "NOT READY \u2014 INSUFFICIENT SAMPLE";
    verdict_line = `${resolved} of ${GATES.min_resolved_tickets} interim-checkpoint resolutions, and ${PROMOTION.min_resolved_tickets} required to qualify. Real money stays out.`;
  } else if (belowPromotion) {
    verdict = "NOT READY \u2014 BELOW PROMOTION BAR";
    verdict_line = `Interim checkpoint met (${resolved}), but the promotion bar is ${PROMOTION.min_resolved_tickets} resolved or the sequential rule. Passing 100 is not qualification. Real money stays out.`;
  } else if (failed.length === 0) {
    verdict = "PASS \u2014 ELIGIBLE FOR SMALL LIVE PILOT";
    verdict_line = `All gates pass and the promotion bar is met (${resolved}). Live pilot at the bottom of the frozen 0.5-2% risk band, capital you can lose entirely.`;
  } else {
    verdict = "NOT READY";
    verdict_line = `Promotion bar met, but failing: ${failed.map((g) => g.gate).join(", ")}. Real money stays out.`;
  }
  return {
    verdict,
    verdict_line,
    gates,
    gates_failed: failed.map((g) => g.gate),
    promotion,
    read_only: "GET and HEAD only; every other method receives 405",
    book: { tickets: o.tickets, resolved: o.resolved, wins: o.wins, losses: o.losses, win_rate_pct: o.win_rate_pct, expectancy_r: o.expectancy_r, total_r: o.total_r, profit_factor: o.profit_factor, fill_rate_pct: o.fill_rate_pct, statistically_meaningful: o.statistically_meaningful },
    measured_costs: { fees: feeStr, slippage: slipStr },
    readings: {
      accuracy_endpoint: { path: "/api/accuracy", status: accMeta.status, as_of: acc.as_of, response_sha256: accMeta.sha256 },
      summary_endpoint: { path: "/api/summary", status: sumMeta.status, now: sum.now, response_sha256: sumMeta.sha256 }
    },
    thresholds: GATES,
    note: "Gates are frozen. Loosening any threshold to make a run pass is a decision change, not a measurement."
  };
}
__name(evaluate, "evaluate");
var worker_scorecard_default = {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (req.method !== "GET" && req.method !== "HEAD") {
      return new Response(JSON.stringify({ error: "method not allowed", read_only: "this instrument accepts GET and HEAD only", allow: ["GET", "HEAD"], method_received: req.method }, null, 1), { status: 405, headers: { "Content-Type": "application/json", "Allow": "GET, HEAD", "Access-Control-Allow-Origin": "*" } });
    }
    try {
      if (url.pathname === "/api/verdict" || url.pathname === "/api/scorecard") {
        const [accMeta, sumMeta] = await Promise.all([getRaw("/api/accuracy", env), getRaw("/api/summary", env)]);
        const acc = JSON.parse(accMeta.text), sum = JSON.parse(sumMeta.text);
        const out = evaluate(acc, sum, accMeta, sumMeta);
        const ts = (/* @__PURE__ */ new Date()).toISOString();
        try {
          await env.SCOREDB.prepare("INSERT INTO snapshots(ts, verdict, verdict_line, acc_sha, sum_sha, payload) VALUES(?,?,?,?,?,?)").bind(ts, out.verdict, out.verdict_line, accMeta.sha256, sumMeta.sha256, JSON.stringify(out)).run();
        } catch (e) {
        }
        return json({ ok: true, measured_at: ts, ...out });
      }
      if (url.pathname === "/api/snapshot" || url.pathname === "/api/history") {
        const rows = await env.SCOREDB.prepare("SELECT ts, verdict, verdict_line, acc_sha, sum_sha FROM snapshots ORDER BY id DESC LIMIT 25").all();
        return json({ ok: true, count: rows.results.length, snapshots: rows.results });
      }
      if (url.pathname === "/api/custody") {
        return json({ ok: true, source: "worker-scorecard.js", gates_version: "1.0.1", note: "source sha256 + first snapshot hash are committed in the harz-scorecard git repo before any run is quoted", read_only_machine: true });
      }
      if (url.pathname === "/manifest.json") return new Response(JSON.stringify({ name: "HARZ Scorecard", short_name: "Scorecard", description: "The read-only instrument that judges the trading machine against frozen accuracy gates", start_url: "/", display: "standalone", background_color: "#f7f9fc", theme_color: "#0a7d3c", icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }] }), { headers: { "Content-Type": "application/manifest+json" } });
      if (url.pathname === "/sw.js") return new Response(`const C='harz-scorecard-v1';self.addEventListener('install',e=>e.waitUntil(caches.open(C).then(c=>c.add('/')).then(()=>self.skipWaiting())));self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(caches.open(C).then(async c=>{const m=await c.match(e.request);if(m)return m;try{const r=await fetch(e.request);if(r.status===200)c.put(e.request,r.clone());return r;}catch(err){return m||Response.error();}}));});`, { headers: { "Content-Type": "application/javascript" } });
      if (url.pathname === "/icon.svg") return new Response(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><rect width="192" height="192" rx="42" fill="#0a7d3c"/><path d="M48 128V64h18v25h22V64h18v64h-18v-24H66v24z" fill="#fff"/><circle cx="140" cy="96" r="14" fill="#fff"/></svg>`, { headers: { "Content-Type": "image/svg+xml" } });
      if (url.pathname === "/") return new Response(HTML, { headers: { "Content-Type": "text/html; charset=utf-8" } });
      return json({ error: "not found", routes: ["/", "/api/verdict", "/api/snapshot", "/api/history", "/api/custody", "/manifest.json", "/sw.js", "/icon.svg"] }, 404);
    } catch (e) {
      return json({ ok: false, error: String(e && e.message || e) }, 500);
    }
  }
};
var HTML = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>HARZ Scorecard \u2014 the instrument that judges the machine</title><link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#0a7d3c"><link rel="apple-touch-icon" href="/icon.svg"><link rel="icon" href="/icon.svg">
<meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-title" content="HARZ Scorecard">
<script>if("serviceWorker" in navigator){addEventListener('load',()=>navigator.serviceWorker.register('/sw.js').catch(()=>{}))}<\/script>
<style>
*{box-sizing:border-box;margin:0;padding:0}body{background:#f7f9fc;color:#1c2733;font-family:system-ui,-apple-system,sans-serif;padding:16px;padding-bottom:40px;line-height:1.45}
h1{font-size:19px;font-weight:700}.sub{font-size:12px;color:#5b6672;margin-top:3px}
.verdict{background:#fff;border-radius:14px;padding:16px;margin:14px 0;box-shadow:0 1px 3px rgba(16,24,40,.06);border-left:5px solid #b42318}
.verdict.pass{border-left-color:#0a7d3c}.verdict .v{font-size:15px;font-weight:700;letter-spacing:.2px}.verdict .l{font-size:12.5px;color:#5b6672;margin-top:5px}
table{width:100%;border-collapse:collapse;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(16,24,40,.06);font-size:12.5px}
th{background:#eef3f8;text-align:left;padding:9px 10px;font-size:11px;text-transform:uppercase;letter-spacing:.4px;color:#42536a}
td{padding:9px 10px;border-top:1px solid #eef2f6;vertical-align:top}
.p{color:#0a7d3c;font-weight:700}.f{color:#b42318;font-weight:700}
button{width:100%;background:#0a7d3c;color:#fff;border:0;border-radius:12px;padding:14px;font-size:15px;font-weight:600;margin-top:16px;font-family:inherit}
h2{font-size:12.5px;font-weight:700;margin:22px 0 9px;color:#364152;text-transform:uppercase;letter-spacing:.5px}
.row{background:#fff;border-radius:11px;padding:10px 12px;margin-bottom:7px;font-size:12px;box-shadow:0 1px 2px rgba(16,24,40,.05)}
.row b{font-size:12.5px}.row .m{color:#7b8794;font-size:10.5px;margin-top:2px;word-break:break-all}
.promo{background:#fff;border-radius:12px;padding:12px 14px;font-size:12.5px;box-shadow:0 1px 3px rgba(16,24,40,.06);border-left:4px solid #a8631a}
.foot{font-size:10.5px;color:#8a95a1;text-align:center;margin-top:20px;line-height:1.6}
</style></head><body>
<h1>HARZ Scorecard</h1><div class="sub" id="ts">Reading the machine\u2026</div>
<div class="verdict" id="vd"><div class="v" id="vv">\u2014</div><div class="l" id="vl">Fetching live numbers\u2026</div></div>
<div class="promo" id="promo"></div>
<h2>Frozen gates <span style="font-weight:400;text-transform:none;letter-spacing:0">(interim checkpoint 100)</span></h2><table><thead><tr><th>Gate</th><th>Threshold</th><th>Actual</th><th></th></tr></thead><tbody id="gates"><tr><td colspan="4">Loading\u2026</td></tr></tbody></table>
<button id="rf">Re-measure now</button>
<h2>Snapshot history</h2><div id="hist"><div class="row">Loading\u2026</div></div>
<div class="foot">Read-only instrument \xB7 never writes the machine<br>Every verdict records as_of + response sha256 so it stays re-derivable<br>Analysis only \xB7 no capital moves on a failing gate</div>
<script>
async function load(){
  try{
    const d=await (await fetch('/api/verdict',{cache:'no-store'})).json();
    document.getElementById('ts').textContent='Measured '+d.measured_at+' \xB7 machine '+d.readings.accuracy_endpoint.as_of;
    const vd=document.getElementById('vd');vd.className='verdict'+(String(d.verdict).indexOf('PASS')===0?' pass':'');
    document.getElementById('vv').textContent=d.verdict;document.getElementById('vl').textContent=d.verdict_line;
    document.getElementById('promo').innerHTML=d.promotion?'<b>Promotion bar: '+d.promotion.bar+'</b> \u2014 actual '+d.promotion.actual+' \u2014 '+(d.promotion.met?'MET':'NOT MET')+'<div style="font-size:11px;color:#7b8794;margin-top:3px">'+d.promotion.note+'. Passing the interim 100 is not qualification.</div>':'';
    document.getElementById('gates').innerHTML=d.gates.map(g=>'<tr><td>'+g.gate+'</td><td>'+g.threshold+'</td><td>'+g.actual+'</td><td class="'+(g.pass?'p':'f')+'">'+(g.pass?'PASS':'FAIL')+'</td></tr>').join('');
  }catch(e){document.getElementById('vl').textContent='Machine unreachable: '+e.message;}
  try{
    const h=await (await fetch('/api/snapshot',{cache:'no-store'})).json();
    document.getElementById('hist').innerHTML=h.snapshots.length?h.snapshots.slice(0,10).map(s=>'<div class="row"><b>'+s.verdict+'</b><div class="m">'+s.ts+' \xB7 acc '+String(s.acc_sha).slice(0,12)+' \xB7 sum '+String(s.sum_sha).slice(0,12)+'</div></div>').join(''):'<div class="row">No snapshots yet.</div>';
  }catch(e){}
}
document.getElementById('rf').onclick=load;load();
<\/script></body></html>`;
export {
  worker_scorecard_default as default
};
//# sourceMappingURL=worker-scorecard.js.map

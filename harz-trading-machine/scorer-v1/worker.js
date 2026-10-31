// HARZ Trading Machine — Cloudflare Worker port (law-compliant, for desk deployment)
// Standing law: ALL business operations on Cloudflare Workers + D1 (HarzCloud).
// This is the port of the verified Base44 function (harzTradingMachine), same logic,
// same 8-step gate, same refusals. Deploy target: harz.workers.dev. Secrets only.
// D1 schema (three ledgers) is in HARZ-TRADING-MACHINE-D1.sql.

const FEE_RT = 0.006, SLIP = 0.001, MAX_POS_PCT = 25, RISK_BAND = [0.005, 0.02];
const MIN_STOP_DIST = 0.001, MIN_NOTIONAL = 10;

function sizePosition(capital, risk_pct, entry, stop, target) {
  if (!(capital > 0 && entry > 0 && stop > 0 && target > 0))
    return { reject: true, reason: "INVALID_INPUT: capital/entry/stop/target must be > 0" };
  if (!(risk_pct >= RISK_BAND[0] && risk_pct <= RISK_BAND[1]))
    return { reject: true, reason: `RISK_OUTSIDE_RULE_BAND: ${(risk_pct*100).toFixed(1)}% not in 0.5-2% (frozen rules)` };
  if (!(stop < entry && target > entry))
    return { reject: true, reason: "INVALID_LONG: requires stop < entry < target" };
  if ((entry - stop) / entry < MIN_STOP_DIST)
    return { reject: true, reason: "ZERO_OR_NEAR_DISTANCE_STOP: stop within 0.1% of entry" };
  const risk_amt = capital * risk_pct;
  const price_risk = (entry - stop) / entry;
  let position = risk_amt / price_risk;
  if (position < MIN_NOTIONAL) return { reject: true, reason: `BELOW_VENUE_MIN: ${position.toFixed(2)}` };
  let capped = false;
  const cap = capital * MAX_POS_PCT / 100;
  if (position > cap) { position = cap; capped = true; }
  const fees = position * (FEE_RT + SLIP);
  const net_loss = position * price_risk + fees;
  const net_gain = position * (target - entry) / entry - fees;
  return { reject: false, position_notional: position, risk_amt, net_loss_at_stop: net_loss,
           net_gain_at_target: net_gain, net_rr: net_gain / net_loss, capped };
}

function guardian(book, capital, limits, agg_risk_pct) {
  const n = book.length + 1, longs = book.filter(p => p.dir === "long").length + 1;
  const breaches = [];
  if (agg_risk_pct > limits.max_agg_risk_pct) breaches.push(`AGG RISK ${agg_risk_pct.toFixed(1)}% > ${limits.max_agg_risk_pct}%`);
  if (n > limits.max_positions) breaches.push(`POSITIONS ${n} > ${limits.max_positions}`);
  if (longs > limits.max_correlated_longs) breaches.push(`CORRELATED LONGS ${longs} > ${limits.max_correlated_longs}`);
  return { breaches, kill_switch: agg_risk_pct > limits.max_agg_risk_pct * 2 };
}

async function logRow(env, table, row) {
  const cols = Object.keys(row), ph = cols.map(() => "?").join(",");
  await env.HARZ_DB.prepare(`INSERT INTO ${table} (${cols.join(",")}) VALUES (${ph})`)
    .bind(...Object.values(row)).run();
}


function ema(arr, n) {
  const k = 2 / (n + 1); const out = [arr[0]];
  for (let i = 1; i < arr.length; i++) out.push(arr[i] * k + out[i - 1] * (1 - k));
  return out;
}
function rsi14(closes) {
  let g = [], l = [];
  for (let i = 1; i < closes.length; i++) { const d = closes[i] - closes[i-1]; g.push(Math.max(d,0)); l.push(Math.max(-d,0)); }
  const n = 14; let ag = g.slice(0,n).reduce((a,b)=>a+b,0)/n, al = l.slice(0,n).reduce((a,b)=>a+b,0)/n;
  for (let i = n; i < g.length; i++) { ag = (ag*(n-1)+g[i])/n; al = (al*(n-1)+l[i])/n; }
  return al === 0 ? 100 : 100 - 100/(1 + ag/al);
}
async function okx(path) {
  const r = await fetch("https://www.okx.com" + path, { headers: { "User-Agent": "harz-trading-machine/1.0", "Accept": "application/json" } });
  if (!r.ok) throw new Error("OKX " + r.status);
  const j = await r.json();
  if (j.code !== "0") throw new Error("OKX code " + j.code);
  return j.data;
}
// ===== AUTOMATED OUTCOME SCORER (31 Oct 2026, Rabiu: build #1) =====
// Four canonical outcomes: FILLED, STOPPED, TARGET_HIT, OPEN. UNVERIFIED when candles cannot decide.
// Rules: never score from memory; never overwrite (append-only + correction_of); ambiguous same-candle
// stop+target = UNVERIFIED_AMBIGUOUS, never assumed a win; no duplicate events (unique index + pre-check).

async function fetchCandles(inst) {
  // Multi-feed chain. Provenance is recorded per event; never a hardcoded source.
  // OKX lacks XMR/QNT/RUNE; KuCoin needs a UA; Gate + Binance cover the rest.
  const sym = inst.replace("-USDT", "");
  const UA = { "User-Agent": "harz-scorer/2.0", Accept: "application/json" };
  const diag = [];

  // 1) OKX
  for (const bar of ["1H", "1D"]) {
    try {
      const r = await fetch(`https://www.okx.com/api/v5/market/candles?instId=${inst}&bar=${bar}&limit=300`, { headers: UA });
      const j = await r.json();
      if (j.code === "0" && j.data && j.data.length) {
        const rows = j.data.map(x => ({ ts: +x[0], o: +x[1], h: +x[2], l: +x[3], c: +x[4] })).sort((a, b) => a.ts - b.ts);
        return { rows, bar, source: "OKX" };
      }
      diag.push(`OKX ${bar}: code ${j.code}`);
    } catch (e) { diag.push(`OKX ${bar}: ${String(e).slice(0, 40)}`); }
  }

  // 2) Binance (1000 bars, deep history)
  try {
    const r = await fetch(`https://api.binance.com/api/v3/klines?symbol=${sym}USDT&interval=1h&limit=1000`, { headers: UA });
    const j = await r.json();
    if (Array.isArray(j) && j.length) {
      const rows = j.map(x => ({ ts: +x[0], o: +x[1], h: +x[2], l: +x[3], c: +x[4] })).sort((a, b) => a.ts - b.ts);
      return { rows, bar: "1H", source: "Binance" };
    }
    diag.push("Binance: no rows");
  } catch (e) { diag.push(`Binance: ${String(e).slice(0, 40)}`); }

  // 3) Gate.io  [t, quoteVol, close, high, low, open, ...]
  try {
    const r = await fetch(`https://api.gateio.ws/api/v4/spot/candlesticks?currency_pair=${sym}_USDT&interval=1h&limit=500`, { headers: UA });
    const j = await r.json();
    if (Array.isArray(j) && j.length) {
      const rows = j.map(x => ({ ts: +x[0] * 1000, o: +x[5], h: +x[3], l: +x[4], c: +x[2] })).sort((a, b) => a.ts - b.ts);
      return { rows, bar: "1H", source: "Gate.io" };
    }
    diag.push("Gate.io: no rows");
  } catch (e) { diag.push(`Gate.io: ${String(e).slice(0, 40)}`); }

  // 4) KuCoin (100 bars, last resort)
  try {
    const r = await fetch(`https://api.kucoin.com/api/v1/market/candles?type=1hour&symbol=${sym}-USDT`, { headers: UA });
    const j = await r.json();
    if (j.code === "200000" && Array.isArray(j.data) && j.data.length) {
      const rows = j.data.map(x => ({ ts: +x[0] * 1000, o: +x[1], c: +x[2], h: +x[3], l: +x[4] })).sort((a, b) => a.ts - b.ts);
      return { rows, bar: "1H", source: "KuCoin" };
    }
    diag.push(`KuCoin: code ${j.code}`);
  } catch (e) { diag.push(`KuCoin: ${String(e).slice(0, 40)}`); }

  // 5) Kraken (deep history, ~720 hourly bars)
  try {
    const r = await fetch(`https://api.kraken.com/0/public/OHLC?pair=${sym}USD&interval=60`, { headers: UA });
    const j = await r.json();
    const keys = Object.keys(j.result || {}).filter(k => k !== "last");
    if ((!j.error || !j.error.length) && keys.length) {
      const arr = j.result[keys[0]];
      if (Array.isArray(arr) && arr.length) {
        const rows = arr.map(x => ({ ts: +x[0] * 1000, o: +x[1], h: +x[2], l: +x[3], c: +x[4] })).sort((a, b) => a.ts - b.ts);
        return { rows, bar: "1H", source: "Kraken" };
      }
      diag.push("Kraken: no rows");
    } else diag.push("Kraken: " + ((j.error && j.error[0]) || "error"));
  } catch (e) { diag.push(`Kraken: ${String(e).slice(0, 40)}`); }

  return { error: "UNREACHABLE", diag };
}

async function feedProbe(inst) {
  const f = await fetchCandles(inst);
  return { inst, ok: !!f.rows, source: f.source || null, bar: f.bar || null,
           rows: f.rows ? f.rows.length : 0,
           first: f.rows && f.rows.length ? new Date(f.rows[0].ts).toISOString() : null,
           last: f.rows && f.rows.length ? new Date(f.rows[f.rows.length - 1].ts).toISOString() : null,
           diag: f.diag || null, error: f.error || null };
}

async function appendEvent(env, ticket, event, ts, price, candle, pct, note, candle_source, timeframe) {
  // SOURCE GUARD (31 Oct, Rabiu: no UNKNOWN provenance in an authoritative event).
  const SRC = String(candle_source || "").trim();
  const AUTHORITATIVE = ["FILLED","STOPPED","TARGET_HIT","OPEN","UNVERIFIED","UNVERIFIED_AMBIGUOUS"];
  if (AUTHORITATIVE.includes(event) && (!SRC || SRC === "UNKNOWN" || SRC === "null")) {
    return false; // refuse to write evidence we cannot attribute
  }
  const existing = await env.HARZ_DB.prepare("SELECT id FROM score_events WHERE ticket_id=? AND event=? AND candle_source IS NOT NULL AND candle_source NOT LIKE '%sandbox%' AND candle_source NOT IN ('UNKNOWN','correction-audit','NA') LIMIT 1").bind(ticket.id, event).first();
  if (existing) return false; // no duplicates, ever
  await env.HARZ_DB.prepare(
    "INSERT INTO score_events (ticket_id, symbol, event, event_ts, price, evidence_ohlc, candle_source, timeframe, pct_outcome, note, created_ts) VALUES (?,?,?,?,?,?,?,?,?,?,?)"
  ).bind(ticket.id, ticket.symbol, event, ts, price, candle, candle_source || "UNKNOWN", timeframe || ticket.timeframe || "1H", pct, note || null, new Date().toISOString()).run();
  return true;
}

async function scoreTicket(env, t) {
  // PROVENANCE GATE (31 Oct 2026 — Rabiu rule 1: never score from memory or manually supplied outcomes).
  // Any ticket carrying a sandbox-sourced event is quarantined until a correction is recorded.
  const sandbox = await env.HARZ_DB.prepare(
    "SELECT id FROM score_events WHERE ticket_id=? AND candle_source LIKE '%sandbox%' AND id NOT IN (SELECT correction_of FROM score_events WHERE correction_of IS NOT NULL) LIMIT 1").bind(t.id).first();
  if (sandbox) return { id: t.id, status: "QUARANTINED_SANDBOX_PROVENANCE" };
  const terminal = await env.HARZ_DB.prepare(
    "SELECT event FROM score_events WHERE ticket_id=? AND event IN ('STOPPED','TARGET_HIT','UNVERIFIED_AMBIGUOUS') AND candle_source IS NOT NULL AND candle_source NOT LIKE '%sandbox%' AND candle_source NOT IN ('UNKNOWN','correction-audit','NA') LIMIT 1"
  ).bind(t.id).first();
  if (terminal) return { id: t.id, status: "ALREADY_SCORED", event: terminal.event };

  const feed = await fetchCandles(t.inst_id);
  if (feed.error) {
    const wrote = await appendEvent(env, t, "UNVERIFIED", new Date().toISOString(), null, null, null, null, "candle source unavailable: " + feed.error, feed && feed.source, feed && feed.bar);
    return { id: t.id, status: wrote ? "UNVERIFIED" : "ALREADY_UNVERIFIED" };
  }
  const rows = feed.rows;
  if (rows && rows.length) {
    const pubMs = Date.parse(t.published_ts);
    if (isFinite(pubMs) && rows[0].ts > pubMs + 2 * 3600 * 1000) {
      const w = await appendEvent(env, t, "UNVERIFIED", new Date().toISOString(), null, null, null, null,
        "candle window starts " + new Date(rows[0].ts).toISOString() + " but ticket published " + t.published_ts + " - partial window, refusing to score",
        feed.source, feed.bar);
      return { id: t.id, status: w ? "UNVERIFIED_PARTIAL_WINDOW" : "ALREADY_UNVERIFIED" };
    }
  }
  t.timeframe = feed.bar;
  const pubTs = Date.parse(t.published_ts);
  const after = rows.filter(r => r.ts >= pubTs);
  if (!after.length) {
    const wrote = await appendEvent(env, t, "UNVERIFIED", new Date().toISOString(), null, null, null, null, "no candles after publication window", feed && feed.source, feed && feed.bar);
    return { id: t.id, status: wrote ? "UNVERIFIED" : "ALREADY_UNVERIFIED" };
  }

  // ---- fill detection
  let fill = await env.HARZ_DB.prepare("SELECT event_ts, price FROM score_events WHERE ticket_id=? AND event='FILLED' AND candle_source IS NOT NULL AND candle_source NOT LIKE '%sandbox%' AND candle_source NOT IN ('UNKNOWN','correction-audit','NA') LIMIT 1").bind(t.id).first();
  let fillTs, fillPrice, fillIdx;
  if (fill) {
    fillTs = Date.parse(fill.event_ts); fillPrice = Number(fill.price);
    fillIdx = after.findIndex(r => r.ts >= fillTs);
    if (fillIdx < 0) fillIdx = 0;
  } else {
    const zi = after.findIndex(r => r.l <= t.entry_high && r.h >= t.entry_low);
    if (zi < 0) {
      const lowest = Math.min(...after.map(r => r.l)), highest = Math.max(...after.map(r => r.h));
      const neverTouched = t.entry_low > highest || t.entry_high < lowest;
      if (neverTouched) {
        await appendEvent(env, t, "OPEN", new Date().toISOString(), null, null, null, null, "zone never touched · low " + lowest + " high " + highest + " (unfilled, not a trade)", feed && feed.source, feed && feed.bar, feed && feed.source, feed && feed.bar);
        return { id: t.id, status: "OPEN_UNFILLED" };
      }
      await appendEvent(env, t, "UNVERIFIED", new Date().toISOString(), null, null, null, null, "zone partially touched, sequence unclear", feed && feed.source, feed && feed.bar);
      return { id: t.id, status: "UNVERIFIED" };
    }
    const c = after[zi];
    fillPrice = c.o >= t.entry_low && c.o <= t.entry_high ? c.o : (c.o < t.entry_low ? t.entry_low : t.entry_high);
    fillTs = c.ts; fillIdx = zi;
    await appendEvent(env, t, "FILLED", new Date(fillTs).toISOString(), fillPrice, `O${c.o} H${c.h} L${c.l} C${c.c}`, null, "entry zone reached", feed && feed.source, feed && feed.bar);
  }

  // ---- terminal detection from the fill candle onward
  for (let i = fillIdx; i < after.length; i++) {
    const c = after[i];
    const stopHit = c.l <= t.stop_level;
    const tgtHit = c.h >= t.target_level;
    const ev = `O${c.o} H${c.h} L${c.l} C${c.c}`;
    if (stopHit && tgtHit) {
      await appendEvent(env, t, "UNVERIFIED_AMBIGUOUS", new Date(c.ts).toISOString(), null, ev, null, "stop and target both inside one candle — sequence unresolvable on " + feed.bar + " candles", feed && feed.source, feed && feed.bar);
      return { id: t.id, status: "UNVERIFIED_AMBIGUOUS" };
    }
    if (stopHit) {
      const pct = (t.stop_level / fillPrice - 1) * 100;
      await appendEvent(env, t, "STOPPED", new Date(c.ts).toISOString(), t.stop_level, ev, +pct.toFixed(2), "stop reached after entry", feed && feed.source, feed && feed.bar);
      return { id: t.id, status: "STOPPED", pct: +pct.toFixed(2), ts: new Date(c.ts).toISOString() };
    }
    if (tgtHit) {
      const pct = (t.target_level / fillPrice - 1) * 100;
      await appendEvent(env, t, "TARGET_HIT", new Date(c.ts).toISOString(), t.target_level, ev, +pct.toFixed(2), "target reached after entry", feed && feed.source, feed && feed.bar);
      return { id: t.id, status: "TARGET_HIT", pct: +pct.toFixed(2), ts: new Date(c.ts).toISOString() };
    }
  }
  const last = after[after.length - 1];
  const pct = (last.c / fillPrice - 1) * 100;
  const wrote = await appendEvent(env, t, "OPEN", new Date(last.ts).toISOString(), last.c, `O${last.o} H${last.h} L${last.l} C${last.c}`, +pct.toFixed(2), "neither stop nor target reached; marked to last close");
  return { id: t.id, status: wrote ? "OPEN" : "OPEN_ALREADY_RECORDED", pct: +pct.toFixed(2) };
}

async function scoreAll(env) {
  const started = new Date().toISOString();
  const run = await env.HARZ_DB.prepare("INSERT INTO score_runs (started_ts, status) VALUES (?,?)").bind(started, "running").run();
  const runId = run.meta.last_row_id;
  const tickets = (await env.HARZ_DB.prepare("SELECT * FROM tickets ORDER BY published_ts").all()).results || [];
  const results = [];
  for (const t of tickets) {
    await new Promise(res => setTimeout(res, 1400));
    try { results.push(await scoreTicket(env, t)); }
    catch (e) { results.push({ id: t.id, status: "ERROR", error: String(e.message || e).slice(0, 120) }); }
  }
  const tally = {};
  for (const r of results) tally[r.status] = (tally[r.status] || 0) + 1;
  await env.HARZ_DB.prepare("UPDATE score_runs SET finished_ts=?, status=?, tickets_checked=?, events_written=?, tally=? WHERE id=?")
    .bind(new Date().toISOString(), "ok", results.length, results.filter(r => r.status !== "ALREADY_SCORED").length, JSON.stringify(tally), runId).run();
  return { run_id: runId, tickets_checked: results.length, tally, results };
}

async function runHunt(env) {
  // FROZEN rules v1.0, machine seat. Data source: OKX public API (CoinGecko blocks CF egress).
  const tickers = await okx("/api/v5/market/tickers?instType=SPOT");
  const usdt = tickers.filter(t => t.instId.endsWith("-USDT"));
  const liquid = usdt.filter(t => parseFloat(t.volCcy24h || 0) > 60000000);
  const chg = (t) => (parseFloat(t.last) / parseFloat(t.open24h) - 1) * 100;
  const gain = liquid.filter(t => chg(t) > 0).sort((a,b) => chg(b) - chg(a)).slice(0, 5);
  const dip = liquid.filter(t => chg(t) < 0).sort((a,b) => chg(a) - chg(b)).slice(0, 5);
  const shortlist = [...gain, ...dip];
  const ema = (arr, n) => { const k = 2/(n+1); const o=[arr[0]]; for (let i=1;i<arr.length;i++) o.push(arr[i]*k+o[i-1]*(1-k)); return o; };
  const rsi14 = (c) => { let g=[],l=[]; for (let i=1;i<c.length;i++){const d=c[i]-c[i-1];g.push(Math.max(d,0));l.push(Math.max(-d,0));}
    const n=14; let ag=g.slice(0,n).reduce((a,b)=>a+b,0)/n, al=l.slice(0,n).reduce((a,b)=>a+b,0)/n;
    for (let i=n;i<g.length;i++){ag=(ag*(n-1)+g[i])/n;al=(al*(n-1)+l[i])/n;} return al===0?100:100-100/(1+ag/al); };
  const tickets = [];
  for (const t of shortlist) {
    try {
      const candles = await okx(`/api/v5/market/candles?instId=${t.instId}&bar=1D&limit=100`);
      const closes = candles.map(c => parseFloat(c[4])).reverse();
      if (closes.length < 60) continue;
      const e20 = ema(closes,20), e50 = ema(closes,50), e12 = ema(closes,12), e26 = ema(closes,26);
      const last = closes[closes.length-1];
      const line = e12.map((v,i)=>v-e26[i]); const sig = ema(line,9);
      const hist = line[line.length-1] - sig[sig.length-1];
      const ch7 = (last / closes[closes.length-8] - 1) * 100;
      const bull = last > e20[e20.length-1] && e20[e20.length-1] > e50[e50.length-1];
      const rsiv = rsi14(closes);
      const isGainer = chg(t) > 0;
      const ok = bull && rsiv >= 40 && rsiv <= 75 && hist > 0 && (isGainer || ch7 > 0);
      if (!ok) continue;
      const shelf = e20[e20.length-1];
      const stop = Math.min(...closes.slice(-10)) * 0.985;
      const target = last + (last - stop) * 2;
      tickets.push({ instId: t.instId, symbol: t.instId.replace("-USDT",""), entry: +shelf.toFixed(6), stop: +stop.toFixed(6), target: +target.toFixed(6), rsi: +rsiv.toFixed(1), ch7: +ch7.toFixed(1), kind: isGainer ? "leader" : "dip" });
    } catch (e) { }
  }
  for (const t of tickets.slice(0,3)) {
    await env.HARZ_DB.prepare(
      "INSERT INTO prediction_ledger (symbol, direction, prediction_date, publication_ts, rule_version, seat, entry_low, entry_high, stop_level, target_level, zone_filled, outcome_category, notes) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)"
    ).bind(t.symbol, "long", new Date().toISOString().slice(0,10), new Date().toISOString(), "v1.0-FROZEN-AUTO", "machine", +(t.entry*0.99).toFixed(6), +(t.entry*1.01).toFixed(6), t.stop, t.target, "pending", null, `AUTO-HUNT (${t.kind}): data=OKX spot/candles, EMA20 shelf param, RSI ${t.rsi}, 7d ${t.ch7}%, MACD+`).run();
  }
  const scored = await scoreAll(env).catch((e) => ({ error: String(e.message || e) }));
  return { scoring: scored,  source: "OKX public API", liquid_scanned: liquid.length, shortlist: shortlist.map(t=>t.instId), tickets };
}


const ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><rect width="192" height="192" rx="34" fill="#0a7d3c"/><text x="96" y="126" font-family="system-ui,sans-serif" font-size="92" font-weight="700" fill="#fff" text-anchor="middle">H</text></svg>`;

function page() {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>HARZ Trading Machine</title>
<meta name="theme-color" content="#f0f2f5">
<link rel="manifest" href="/manifest.json">
<link rel="apple-touch-icon" href="/icon.svg">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="HARZ Trading">
<link rel="icon" href="/icon.svg">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{background:#f0f2f5;color:#1a1f26;font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;padding:16px;padding-bottom:40px;line-height:1.45;-webkit-tap-highlight-color:transparent}
h1{font-size:19px;font-weight:700;letter-spacing:-.2px}
.sub{font-size:12px;color:#5b6672;margin-top:2px}
.badge{display:inline-block;background:#e6f4ec;color:#0a7d3c;font-size:11px;font-weight:700;padding:3px 9px;border-radius:20px;margin-top:8px;letter-spacing:.3px}
.badge.warn{background:#fdf0e3;color:#a8631a}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:16px 0}
.card{background:#fff;border-radius:14px;padding:13px 14px;box-shadow:0 1px 3px rgba(16,24,40,.06)}
.card .k{font-size:11px;color:#5b6672;text-transform:uppercase;letter-spacing:.4px;font-weight:600}
.card .v{font-size:22px;font-weight:700;margin-top:3px}
.card .v.sm{font-size:15px}
.card .n{font-size:11px;color:#7b8794;margin-top:2px}
h2{font-size:13px;font-weight:700;margin:20px 0 9px;color:#364152;text-transform:uppercase;letter-spacing:.5px}
.row{background:#fff;border-radius:12px;padding:11px 13px;margin-bottom:8px;box-shadow:0 1px 2px rgba(16,24,40,.05);font-size:13px}
.row .top{display:flex;justify-content:space-between;align-items:center;gap:8px}
.row .sym{font-weight:700}
.row .meta{font-size:11px;color:#7b8794;margin-top:3px;word-break:break-word}
.pill{font-size:10px;font-weight:700;padding:2px 8px;border-radius:20px;white-space:nowrap}
.g{background:#e6f4ec;color:#0a7d3c}.r{background:#fdecec;color:#b42318}.y{background:#fdf0e3;color:#a8631a}.b{background:#e8eefc;color:#2b4c9b}
.empty{font-size:12px;color:#7b8794;padding:14px;text-align:center;background:#fff;border-radius:12px}
button{width:100%;background:#0a7d3c;color:#fff;border:0;border-radius:12px;padding:14px;font-size:15px;font-weight:600;margin-top:18px;font-family:inherit}
button:active{opacity:.85}
.foot{font-size:10.5px;color:#8a95a1;text-align:center;margin-top:18px;line-height:1.6}
</style></head><body>
<h1>HARZ Trading Machine</h1>
<div class="sub" id="ts">Loading…</div>
<span class="badge" id="mode">DEMO ONLY</span>
<div class="grid">
<div class="card"><div class="k">Predictions</div><div class="v" id="np">—</div><div class="n">ledgered, pre-outcome</div></div>
<div class="card"><div class="k">Open</div><div class="v" id="no">—</div><div class="n">positions tracked</div></div>
<div class="card"><div class="k">Losses booked</div><div class="v" id="nl">—</div><div class="n">stops hit</div></div>
<div class="card"><div class="k">Risk state</div><div class="v sm" id="rk">—</div><div class="n" id="rkn">aggregate exposure</div></div>
</div>
<h2>Latest predictions</h2><div id="preds"><div class="empty">Loading…</div></div>
<h2>Execution gate</h2><div id="execs"><div class="empty">Loading…</div></div>
<button id="hunt">Run hunt now</button>
<div class="foot">Data: D1 ledgers · prices OKX · times WAT<br>Analysis only · no real money · DEMO territory</div>
<script>
async function load(){
  try{
    const r=await fetch('/api/summary',{cache:'no-store'});
    const d=await r.json();
    document.getElementById('ts').textContent='Updated '+(d.now||'')+' · '+(d.source||'');
    document.getElementById('np').textContent=d.total_predictions??0;
    document.getElementById('no').textContent=d.open_positions??0;
    document.getElementById('nl').textContent=d.losses??0;
    const ks=(d.kill_switch||'inactive');
    const rk=document.getElementById('rk');
    rk.textContent=ks.toUpperCase();
    rk.className='v sm'; 
    document.getElementById('rkn').textContent=(d.agg_risk_pct!=null?('agg '+d.agg_risk_pct+'%'):'no checks yet');
    document.getElementById('mode').textContent=d.kill_switch==='ACTIVE'?'KILL SWITCH ACTIVE':'DEMO ONLY';
    document.getElementById('mode').className='badge'+(d.kill_switch==='ACTIVE'?' warn':'');
    const p=document.getElementById('preds');
    p.innerHTML=(d.predictions&&d.predictions.length)?d.predictions.map(x=>
      '<div class="row"><div class="top"><span class="sym">'+x.symbol+'</span><span class="pill '+(x.outcome_category==='LOSS'?'r':x.zone_filled==='yes'?'b':'y')+'">'+
      (x.outcome_category||x.zone_filled||'pending')+'</span></div><div class="meta">'+x.seat+' · '+(x.prediction_date||'')+' · entry '+(x.entry_low||'')+'-'+(x.entry_high||'')+' · stop '+(x.stop_level||'')+' · target '+(x.target_level||'')+'</div></div>'
    ).join(''):'<div class="empty">No predictions yet</div>';
    const e=document.getElementById('execs');
    e.innerHTML=(d.executions&&d.executions.length)?d.executions.map(x=>
      '<div class="row"><div class="top"><span class="sym">'+(x.symbol||'—')+'</span><span class="pill '+(String(x.outcome).indexOf('ACCEPTED')===0?'g':String(x.outcome).indexOf('REJECT')===0||String(x.outcome).indexOf('REFUSED')===0?'r':'y')+'">'+x.outcome+'</span></div><div class="meta">'+(x.venue_mode||'')+' · '+(x.notes||'')+'</div></div>'
    ).join(''):'<div class="empty">No gate events yet</div>';
  }catch(err){
    document.getElementById('ts').textContent='Load failed: '+err.message;
  }
}
document.getElementById('hunt').onclick=async function(){
  const b=this;b.disabled=true;b.textContent='Hunting…';
  try{const r=await fetch('/hunt',{method:'POST'});const d=await r.json();
    b.textContent=d.tickets&&d.tickets.length?('Found '+d.tickets.length+' ticket(s)'):'No tickets — rules passed';
    await load();
  }catch(e){b.textContent='Hunt failed';}
  setTimeout(()=>{b.disabled=false;b.textContent='Run hunt now';},3000);
};
load(); setInterval(load,30000);
if('serviceWorker' in navigator){addEventListener('load',()=>navigator.serviceWorker.register('/sw.js').catch(()=>{}));}
</script></body></html>`;
}

const MANIFEST = {
  name: "HARZ Trading Machine", short_name: "HARZ Trade",
  description: "Risk-guarded trading machine dashboard",
  start_url: "/", display: "standalone", background_color: "#f0f2f5",
  theme_color: "#f0f2f5", icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any maskable" }]
};

const SW_JS = `const C='harz-trade-v1';
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(C).then(c=>c.addAll(['/','/manifest.json','/icon.svg']).catch(()=>{})))});
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);
 if(u.pathname.startsWith('/api/')||u.pathname==='/evaluate'||u.pathname==='/hunt')return;
 e.respondWith(fetch(e.request).then(r=>{const c2=r.clone();caches.open(C).then(c=>c.put(e.request,c2)).catch(()=>{});return r;}).catch(()=>caches.match(e.request).then(m=>m||caches.match('/'))))});`;

async function summary(env) {
  const q = async (sql) => (await env.HARZ_DB.prepare(sql).all()).results || [];
  const [counts] = await q("SELECT COUNT(*) AS total, SUM(CASE WHEN outcome_category='LOSS' THEN 1 ELSE 0 END) AS losses, SUM(CASE WHEN outcome_category IS NULL AND zone_filled='pending' THEN 1 ELSE 0 END) AS open_pos FROM prediction_ledger");
  const preds = await q("SELECT symbol, seat, prediction_date, entry_low, entry_high, stop_level, target_level, zone_filled, outcome_category, rule_version FROM prediction_ledger ORDER BY id DESC LIMIT 8");
  const execs = await q("SELECT symbol, venue_mode, outcome, notes FROM execution_ledger ORDER BY id DESC LIMIT 8");
  const risk = await q("SELECT kill_switch_state, aggregate_open_risk_pct FROM risk_ledger ORDER BY id DESC LIMIT 1");
  return {
    now: new Date().toLocaleString("en-GB", { timeZone: "Africa/Lagos", hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" }),
    source: "D1 ledgers · OKX prices",
    total_predictions: counts?.total || 0,
    losses: counts?.losses || 0,
    open_positions: counts?.open_pos || 0,
    kill_switch: risk[0]?.kill_switch_state || "inactive",
    agg_risk_pct: risk[0]?.aggregate_open_risk_pct ?? null,
    predictions: preds, executions: execs
  };
}

export default {
  async scheduled(event, env, ctx) { ctx.waitUntil(runHunt(env)); },
  async fetch(req, env) {
    const url = new URL(req.url);
    // ---- PWA + dashboard routes (GET) ----
    if (req.method === "GET") {
      if (url.pathname === "/") return new Response(page(), { headers: { "content-type": "text/html;charset=utf-8", "cache-control": "no-store" } });
      if (url.pathname === "/manifest.json") return Response.json(MANIFEST, { headers: { "cache-control": "max-age=3600" } });
      if (url.pathname === "/sw.js") return new Response(SW_JS, { headers: { "content-type": "application/javascript", "cache-control": "max-age=3600" } });
      if (url.pathname === "/icon.svg") return new Response(ICON_SVG, { headers: { "content-type": "image/svg+xml", "cache-control": "max-age=86400" } });
      if (url.pathname === "/api/summary") { try { return Response.json(await summary(env), { headers: { "cache-control": "no-store" } }); } catch (e) { return Response.json({ error: e.message }, { status: 500 }); } }
    }
    if (url.pathname === "/score/feed") {
      const want = (url.searchParams.get("symbol") || "XMR").toUpperCase();
      const out = [];
      for (const s of want.split(",")) out.push(await feedProbe(s.trim() + "-USDT"));
      return Response.json({ feeds: out, checked_at: new Date().toISOString() }, { headers: { "cache-control": "no-store" } });
    }
    if (url.pathname === "/score" && req.method === "POST") {
      try { return Response.json(await scoreAll(env)); } catch (e) { return Response.json({ error: String(e.message || e) }, { status: 500 }); }
    }
    if (req.method === "GET" && url.pathname === "/score/status") {
      const last = await env.HARZ_DB.prepare("SELECT * FROM score_runs ORDER BY id DESC LIMIT 1").first();
      const counts = await env.HARZ_DB.prepare("SELECT event, COUNT(*) AS n FROM score_events GROUP BY event").all();
      const tickets = await env.HARZ_DB.prepare("SELECT COUNT(*) AS n FROM tickets").first();
      return Response.json({ last_successful_scoring: last && last.status === "ok" ? last.finished_ts : null, last_run: last || null, tickets: tickets ? tickets.n : 0, events: counts.results, scored_at: new Date().toISOString() }, { headers: { "cache-control": "no-store" } });
    }
    if (req.method === "GET" && url.pathname === "/score/board") {
      const rows = await env.HARZ_DB.prepare("SELECT ticket_id, symbol, event, event_ts, price, pct_outcome, evidence_ohlc, candle_source, timeframe, note FROM score_events ORDER BY ticket_id, event_ts").all();
      return Response.json({ count: rows.results.length, events: rows.results }, { headers: { "cache-control": "no-store" } });
    }
    if (url.pathname === "/hunt" && req.method === "POST") {
      try { return Response.json(await runHunt(env)); }
      catch (e) { return Response.json({ error: e.message }, { status: 500 }); }
    }
    if (url.pathname !== "/evaluate" || req.method !== "POST")
      return Response.json({ error: "POST /evaluate" }, { status: 404 });
    let body; try { body = await req.json(); } catch { return Response.json({ error: "bad json" }, { status: 400 }); }
    const { ticket = {}, capital = 0, risk_pct = 0, book = [], venue_mode } = body;
    const limits = { max_agg_risk_pct: 6, max_positions: 5, max_correlated_longs: 3 };
    const ts = new Date().toISOString();

    // STEP gate: venue mode (territory: DEMO only until owner authorizes live)
    if (venue_mode !== "DEMO") {
      await logRow(env, "execution_ledger", { symbol: ticket.symbol || "?", venue_mode: venue_mode || "UNSET",
        outcome: "REFUSED_VENUE_MODE", notes: "DEMO only until owner authorizes live", order_ts: ts });
      return Response.json({ verdict: "REFUSED_VENUE_MODE", accepted: false, reason: "DEMO only" });
    }
    // STEP 0: kill-switch persistence + fail-closed (guardian law: no silent reactivation)
    let killState = "inactive";
    try {
      const last = await env.HARZ_DB.prepare(
        "SELECT kill_switch_state FROM risk_ledger ORDER BY id DESC LIMIT 1").first();
      if (last && last.kill_switch_state && String(last.kill_switch_state).startsWith("ACTIVE"))
        killState = "ACTIVE";
    } catch (e) {
      await logRow(env, "execution_ledger", { symbol: ticket.symbol || "?", venue_mode: venue_mode || "UNSET",
        outcome: "REFUSED_GATE_LOCKED", notes: "state unreadable: " + e.message, order_ts: ts }).catch(() => {});
      return Response.json({ verdict: "REFUSED_GATE_LOCKED", accepted: false,
        reason: "risk state unreadable - fail closed" }, { status: 503 });
    }
    if (killState === "ACTIVE" && body.owner_authorization !== true) {
      await logRow(env, "execution_ledger", { symbol: ticket.symbol || "?", venue_mode: "DEMO",
        outcome: "REFUSED_KILL_SWITCH", notes: "kill switch ACTIVE; owner authorization required to reactivate", order_ts: ts });
      return Response.json({ verdict: "REFUSED_KILL_SWITCH", accepted: false,
        reason: "kill switch ACTIVE - owner authorization required" });
    }
    if (killState === "ACTIVE" && body.owner_authorization === true) {
      await logRow(env, "risk_ledger", { check_ts: ts, kill_switch_state: "OWNER_REACTIVATION",
        actions_taken: "owner authorization presented; kill switch cleared for new entries",
        breaches: "resolved by owner", notes: "reactivation event" });
    }

    // Sizing
    const sz = sizePosition(capital, risk_pct, ticket.entry, ticket.stop, ticket.target);
    if (sz.reject) {
      await logRow(env, "execution_ledger", { symbol: ticket.symbol || "?", venue_mode: "DEMO",
        outcome: "REFUSED_SIZING", notes: sz.reason, order_ts: ts });
      return Response.json({ verdict: "REFUSED_SIZING", accepted: false, reason: sz.reason });
    }
    // Portfolio + guardian
    const bookRisk = book.reduce((a, p) => a + (p.risk || 0), 0);
    const agg = (bookRisk + sz.risk_amt) / capital * 100;
    const g = guardian(book, capital, limits, agg);
    if (g.breaches.length) {
      const { symbol, ...rest } = ticket;
      await logRow(env, "execution_ledger", { symbol: ticket.symbol || "?", venue_mode: "DEMO",
        outcome: "REJECTED_BY_GUARDIAN", requested_size: String(Math.round(sz.position_notional)),
        notes: g.breaches.join("; "), order_ts: ts });
      await logRow(env, "risk_ledger", { check_ts: ts, aggregate_open_risk_pct: agg.toFixed(1),
        position_count: String(book.length + 1), correlated_exposure_count: String(book.filter(p => p.dir === "long").length + 1),
        breaches: g.breaches.join("; "), kill_switch_state: g.kill_switch ? "ACTIVE" : "inactive",
        actions_taken: "NEW ENTRY REFUSED; existing positions hold per individual stops" });
      return Response.json({ verdict: "REJECTED_BY_GUARDIAN", accepted: false, breaches: g.breaches, agg_risk_pct: agg, sizing: sz });
    }
    // Simulated fill
    const order_id = `${ticket.symbol || "ORD"}-${Date.now()}`;
    await logRow(env, "execution_ledger", { symbol: ticket.symbol || "?", venue: "INTERNAL-GATE",
      venue_mode: "DEMO", outcome: "ACCEPTED_SIMULATED", requested_size: String(Math.round(sz.position_notional)),
      fill_price: String(ticket.entry), net_pnl: "0 (open)", order_ts: ts, fill_ts: ts });
    await logRow(env, "risk_ledger", { check_ts: ts, aggregate_open_risk_pct: agg.toFixed(1),
      position_count: String(book.length + 1), correlated_exposure_count: String(book.filter(p => p.dir === "long").length + 1),
      breaches: "none", kill_switch_state: "inactive", actions_taken: "order accepted (simulated fill)" });
    return Response.json({ verdict: "ACCEPTED_SIMULATED", accepted: true, order_id, sizing: sz, agg_risk_pct: agg, steps_passed: 8 });
  }
};

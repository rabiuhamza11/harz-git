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
  const n = book.length + 1, longs = book.filter(p => p.dir === "long" || p.side === "long").length + 1;
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
function emaArr(v, n) { const k = 2 / (n + 1); const o = [v[0]]; for (let i = 1; i < v.length; i++) o.push(v[i] * k + o[i - 1] * (1 - k)); return o; }
function rsiCalc(c) { let g = [], l = []; for (let i = 1; i < c.length; i++) { const d = c[i] - c[i - 1]; g.push(Math.max(d, 0)); l.push(Math.max(-d, 0)); } const n = 14; let ag = g.slice(0, n).reduce((a, b) => a + b, 0) / n, al = l.slice(0, n).reduce((a, b) => a + b, 0) / n; for (let i = n; i < g.length; i++) { ag = (ag * (n - 1) + g[i]) / n; al = (al * (n - 1) + l[i]) / n; } return al === 0 ? 100 : 100 - 100 / (1 + ag / al); }
async function httpJson(url, opts = {}) {
  const tries = opts.tries || 3, backoff = opts.backoff || 700;
  let last = { ok: false, status: 0, error: "not attempted" };
  for (let a = 0; a < tries; a++) {
    try {
      const ctl = new AbortController();
      const t = setTimeout(() => ctl.abort(), opts.timeout || 12000);
      const r = await fetch(url, { headers: { "User-Agent": "harz-trading-machine/1.1", "Accept": "application/json" }, signal: ctl.signal });
      clearTimeout(t);
      if (r.status === 429 || r.status === 503 || r.status >= 500) {
        last = { ok: false, status: r.status, error: "HTTP " + r.status };
        await new Promise(x => setTimeout(x, backoff * (a + 1) + Math.floor(Math.random() * 250)));
        continue;
      }
      if (!r.ok) return { ok: false, status: r.status, error: "HTTP " + r.status };
      const j = await r.json();
      return { ok: true, status: r.status, json: j };
    } catch (e) {
      last = { ok: false, status: 0, error: String(e.message || e) };
      await new Promise(x => setTimeout(x, backoff * (a + 1)));
    }
  }
  return last;
}
async function okx(path, tries) {
  const r = await httpJson("https://www.okx.com" + path, { tries: tries || 4, backoff: 900, timeout: 15000 });
  if (!r.ok) throw new Error("OKX " + (r.error || r.status));
  if (r.json.code !== "0") throw new Error("OKX code " + r.json.code);
  return r.json.data;
}

// ---------- MARKET UNIVERSE (multi-provider, frozen rule: top-250 by mcap, vol > $60M) ----------
async function universeFromPaprika() {
  const r = await httpJson("https://api.coinpaprika.com/v1/tickers?quotes=USD", { tries: 2, timeout: 20000 });
  if (!r.ok || !Array.isArray(r.json)) return null;
  const rows = r.json
    .filter(x => x.quotes && x.quotes.USD && x.quotes.USD.market_cap > 0)
    .sort((a, b) => b.quotes.USD.market_cap - a.quotes.USD.market_cap)
    .slice(0, 250)
    .map(x => ({ symbol: String(x.symbol || "").toUpperCase(), mcap: x.quotes.USD.market_cap, vol: x.quotes.USD.volume_24h || 0, chg24: x.quotes.USD.percent_change_24h || 0 }));
  return { provider: "coinpaprika top-250", rows };
}
async function universeFromOkx() {
  const t = await okx("/api/v5/market/tickers?instType=SPOT", 4);
  const rows = t.filter(x => x.instId.endsWith("-USDT")).map(x => ({
    symbol: x.instId.replace("-USDT", ""),
    mcap: null,
    vol: parseFloat(x.volCcy24h || 0),
    chg24: (parseFloat(x.last) / parseFloat(x.open24h) - 1) * 100
  })).sort((a, b) => b.vol - a.vol);
  return { provider: "okx-vol-ranked", rows };
}

async function universeFromGate() {
  const r = await httpJson("https://api.gateio.ws/api/v4/spot/tickers", { tries: 2, timeout: 15000 });
  if (!r.ok || !Array.isArray(r.json)) return null;
  const rows = r.json.filter(x => String(x.currency_pair || "").endsWith("_USDT")).map(x => ({
    symbol: String(x.currency_pair).replace("_USDT", ""),
    mcap: null,
    vol: parseFloat(x.quote_volume || 0),
    chg24: parseFloat(x.change_percentage || 0)
  }));
  return { provider: "gateio", rows };
}
async function gateCandles(symbol) {
  const r = await httpJson("https://api.gateio.ws/api/v4/spot/candlesticks?currency_pair=" + symbol + "_USDT&interval=1d&limit=120", { tries: 2, timeout: 15000 });
  if (!r.ok || !Array.isArray(r.json) || !r.json.length) return null;
  // Gate row: [ts, quote_vol, close, high, low, open, base_vol, closed]
  return r.json.map(x => ({ ts: parseInt(x[0]) * 1000, c: parseFloat(x[2]), h: parseFloat(x[3]), l: parseFloat(x[4]), o: parseFloat(x[5]) }));
}
async function buildUniverse(env) {
  const chain = [], seen = new Map();
  const merge = (u, tag) => {
    if (!u || !u.rows) { chain.push(tag + ":fail"); return 0; }
    chain.push(tag + ":ok");
    for (const r of u.rows) {
      const k = r.symbol;
      if (!k) continue;
      const prev = seen.get(k);
      if (!prev || (r.vol || 0) > (prev.vol || 0)) seen.set(k, { ...r, src: tag });
    }
    return u.rows.length;
  };
  try { merge(await universeFromOkx(), "okx"); } catch (e) { chain.push("okx:err"); }
  try { merge(await universeFromGate(), "gateio"); } catch (e) { chain.push("gateio:err"); }
  if (!seen.size) return { error: "NO_UNIVERSE", chain };
  const stable = ["USDC","USDT","DAI","FDUSD","TUSD","USDE","USD","USDD","PYUSD"];
  const all = [...seen.values()].filter(r => !stable.includes(r.symbol))
    .sort((a, b) => (b.vol || 0) - (a.vol || 0));
  const liquid = all.filter(r => (r.vol || 0) > 60000000);
  return {
    provider: "union(okx,gateio) vol-ranked", chain,
    universe: all.length, liquid, all,
    note: "mcap ranking unavailable: coinpaprika 402, coingecko 429 from worker egress; vol used as disclosed proxy"
  };
}

// ---------- HUNT RUN LOG (a failed hunt must be visible, never silent) ----------
async function logHunt(env, rec) {
  try {
    await env.HARZ_DB.prepare("CREATE TABLE IF NOT EXISTS hunt_runs (id INTEGER PRIMARY KEY AUTOINCREMENT, started_ts TEXT, finished_ts TEXT, provider TEXT, chain TEXT, universe INTEGER, liquid INTEGER, scanned INTEGER, tickets INTEGER, status TEXT, error TEXT, details TEXT)").run();
    await env.HARZ_DB.prepare("INSERT INTO hunt_runs (started_ts, finished_ts, provider, chain, universe, liquid, scanned, tickets, status, error, details) VALUES (?,?,?,?,?,?,?,?,?,?,?)")
      .bind(rec.started, rec.finished, rec.provider || null, rec.chain || null, rec.universe || 0, rec.liquid || 0, rec.scanned || 0, rec.tickets || 0, rec.status, rec.error || null, rec.details || null).run();
  } catch (e) { }
}
// ===== AUTOMATED OUTCOME SCORER v2 (31 Oct 2026) — STATE INTEGRITY =====
// Rules enforced here:
//  R1 terminal-state protection: STOPPED / TARGET_HIT can never become UNVERIFIED
//  R2 UNVERIFIED only for genuinely unresolved tickets
//  R3 idempotency: one authority row per ticket, append-only event log never rewritten
//  R4 source failure is a MONITORING event, never a trading outcome
//  R5 when data returns, unresolved tickets reconcile; resolved history is never touched
const TERMINAL = ["STOPPED", "TARGET_HIT"];

async function db(env, sql, ...args) {
  return env.HARZ_DB.prepare(sql).bind(...args).all();
}

async function getAuthority(env, id) {
  try {
    const r = await db(env, "SELECT * FROM outcome_authority WHERE ticket_id = ?", id);
    return r.results && r.results[0] ? r.results[0] : null;
  } catch (e) { return null; }
}

async function setAuthority(env, t, outcome, basis_event_id, note) {
  await env.HARZ_DB.prepare(
    "INSERT INTO outcome_authority (ticket_id, symbol, authoritative_outcome, basis_event_id, note, updated_ts) " +
    "VALUES (?,?,?,?,?,?) ON CONFLICT(ticket_id) DO UPDATE SET authoritative_outcome=excluded.authoritative_outcome, " +
    "basis_event_id=excluded.basis_event_id, note=excluded.note, updated_ts=excluded.updated_ts"
  ).bind(t.id, t.symbol, outcome, basis_event_id, note || null, new Date().toISOString()).run();
  return outcome;
}

async function hasEvent(env, id, event) {
  const r = await db(env, "SELECT id FROM score_events WHERE ticket_id = ? AND event = ? AND superseded_by IS NULL", id, event);
  return r.results && r.results.length ? r.results[0].id : null;
}

async function appendEvent(env, t, event, event_ts, price, evidence, source, timeframe, pct, note) {
  // R5: no UNKNOWN provenance may enter the evidence log. An event without a named
  // source, candle timestamp and completeness flag is refused outright.
  const badSource = !source || source === "UNKNOWN" || source === "NULL" || String(source).trim() === "";
  const badEvidence = !evidence || !String(evidence).includes("T");
  if (badSource || badEvidence) {
    await logSource(env, t, source || "NONE", "PROVENANCE_REJECTED", null,
      "event '" + event + "' refused: missing source or candle timestamp (no fabricated evidence)");
    return null;
  }
  const exists = await hasEvent(env, t.id, event);
  if (exists) return exists; // R3 idempotent: never duplicate an outcome
  const r = await env.HARZ_DB.prepare(
    "INSERT INTO score_events (ticket_id, symbol, event, event_ts, price, evidence_ohlc, candle_source, timeframe, pct_outcome, note, created_ts) " +
    "VALUES (?,?,?,?,?,?,?,?,?,?,?)"
  ).bind(t.id, t.symbol, event, event_ts, price, evidence||null, source||null, timeframe||null, pct===undefined?null:pct, note||null, new Date().toISOString()).run();
  return r.meta && r.meta.last_row_id ? r.meta.last_row_id : null;
}

async function logSource(env, t, source, status, http, note) {
  try {
    await env.HARZ_DB.prepare(
      "INSERT INTO source_health (ticket_id, symbol, source, status, http_status, note, checked_ts) VALUES (?,?,?,?,?,?,?)"
    ).bind(t.id, t.symbol, source, status, http||null, note||null, new Date().toISOString()).run();
  } catch (e) {}
}

async function fetchCandles2(env, inst) {
  const headers = { "User-Agent": "harz-trading-machine/1.0" };
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const r = await fetch("https://www.okx.com/api/v5/market/candles?instId=" + inst + "&bar=1H&limit=300", { headers });
      if (r.status === 429) { await new Promise(x => setTimeout(x, 1200 * (attempt + 1))); continue; }
      if (r.status !== 200) { return { error: "HTTP_" + r.status, source: "OKX" }; }
      const j = await r.json();
      if (!j.data || !j.data.length) { break; }
      const rows = j.data.map(x => ({ ts: Number(x[0]), o: +x[1], h: +x[2], l: +x[3], c: +x[4] })).sort((a, b) => a.ts - b.ts);
      return { rows, source: "OKX", timeframe: "1H" };
    } catch (e) {
      await new Promise(x => setTimeout(x, 900 * (attempt + 1)));
    }
  }
  // fallback: KuCoin
  const sym = inst.replace("-USDT", "-USDT");
  try {
    const r = await fetch("https://api.kucoin.com/api/v1/market/candles?type=1hour&symbol=" + sym, { headers });
    if (r.status !== 200) return { error: "HTTP_" + r.status, source: "KuCoin" };
    const j = await r.json();
    if (!j.data || !j.data.length) return { error: "NO_DATA", source: "KuCoin" };
    const rows = j.data.map(x => ({ ts: Number(x[0]) * 1000, o: +x[1], c: +x[2], h: +x[3], l: +x[4] })).sort((a, b) => a.ts - b.ts);
    return { rows, source: "KuCoin", timeframe: "1H" };
  } catch (e) {
    return { error: "UNREACHABLE", source: "KuCoin", attempted: "KuCoin" };
  }
}

async function scoreTicket2(env, t) {
  // R1: terminal state is protected above everything else
  const auth = await getAuthority(env, t.id);
  // R1: terminal protection reads BOTH the authority row and the immutable event log,
  // so a lagging authority record can never downgrade a resolved ticket.
  const termEv = await db(env, "SELECT event FROM score_events WHERE ticket_id = ? AND event IN ('STOPPED','TARGET_HIT') LIMIT 1", t.id);
  const eventTerminal = termEv.results && termEv.results.length ? termEv.results[0].event : null;
  if (eventTerminal && (!auth || auth.authoritative_outcome !== eventTerminal)) {
    await setAuthority(env, t, eventTerminal, null, "authority synced to terminal event log (append-only history preserved)");
  }
  if (eventTerminal || (auth && TERMINAL.includes(auth.authoritative_outcome))) {
    return { id: t.id, status: "PROTECTED_TERMINAL", outcome: eventTerminal || auth.authoritative_outcome };
  }
  const sz = await fetchCandles2(env, t.inst_id);
  if (sz.error) {
    // R4: source failure is monitoring, not an outcome
    await logSource(env, t, sz.source, "FAILED", sz.error, "candle fetch failed during scoring");
    // R2: UNVERIFIED only for genuinely unresolved tickets, and only once
    if (auth && TERMINAL.includes(auth.authoritative_outcome)) return { id: t.id, status: "PROTECTED_TERMINAL" };
    const already = await hasEvent(env, t.id, "UNVERIFIED");
    if (already) return { id: t.id, status: "UNVERIFIED_ALREADY_LOGGED" };
    if (eventTerminal) return { id: t.id, status: "PROTECTED_TERMINAL", outcome: eventTerminal };
    const attempted = "attempted:" + (sz.attempted || sz.source || "chain");
    const nowIso = new Date().toISOString();
    const bid = await appendEvent(env, t, "UNVERIFIED", nowIso, null,
      "T" + nowIso + " no-candle complete:0", attempted, "1H", null,
      "candle source unavailable (" + sz.error + "); ticket genuinely unresolved — no fabricated outcome");
    await setAuthority(env, t, "UNVERIFIED", bid, "awaiting data; reconciles automatically when source returns");
    return { id: t.id, status: "UNVERIFIED", note: sz.error };
  }
  const rows = sz.rows, pub = Date.parse(t.published_ts);
  const after = rows.filter(r => r.ts >= pub);
  if (!after.length) return { id: t.id, status: "NO_DATA_WINDOW" };

  let fillId = await hasEvent(env, t.id, "FILLED");
  let fillTs, fillPrice;
  if (fillId) {
    const f = await db(env, "SELECT event_ts, price FROM score_events WHERE id = ?", fillId);
    const row = f.results[0];
    fillTs = Date.parse(row.event_ts); fillPrice = row.price;
  } else {
    const touch = after.find(r => r.l <= t.entry_high && r.h >= t.entry_low);
    if (!touch) {
      await setAuthority(env, t, "OPEN_UNFILLED", null, "entry zone not reached since publication");
      return { id: t.id, status: "OPEN_UNFILLED" };
    }
    fillPrice = (touch.o >= t.entry_low && touch.o <= t.entry_high) ? touch.o : (touch.o < t.entry_low ? t.entry_low : t.entry_high);
    fillTs = touch.ts;
    fillId = await appendEvent(env, t, "FILLED", new Date(touch.ts).toISOString(), fillPrice,
      `T${new Date(touch.ts).toISOString()} O${touch.o} H${touch.h} L${touch.l} C${touch.c} complete:1`, sz.source, sz.timeframe, null, "entry zone reached");
  }
  const post = rows.filter(r => r.ts >= fillTs);
  for (const r of post) {
    const hitStop = r.l <= t.stop_level, hitTgt = r.h >= t.target_level;
    if (hitStop && hitTgt) {
      await appendEvent(env, t, "UNVERIFIED", new Date(r.ts).toISOString(), null,
        `T${new Date(r.ts).toISOString()} O${r.o} H${r.h} L${r.l} C${r.c} complete:1`, sz.source, sz.timeframe, null,
        "AMBIGUOUS: stop and target inside the same candle — flagged for resolution, not assumed");
      await setAuthority(env, t, "UNVERIFIED", null, "ambiguous same-candle event; needs finer resolution");
      return { id: t.id, status: "AMBIGUOUS" };
    }
    if (hitStop) {
      const pct = (t.stop_level / fillPrice - 1) * 100;
      const bid = await appendEvent(env, t, "STOPPED", new Date(r.ts).toISOString(), t.stop_level,
        `T${new Date(r.ts).toISOString()} O${r.o} H${r.h} L${r.l} C${r.c} complete:1`, sz.source, sz.timeframe, pct, "stop reached after entry");
      await setAuthority(env, t, "STOPPED", bid, "verified by candles");
      return { id: t.id, status: "STOPPED", pct: +pct.toFixed(2) };
    }
    if (hitTgt) {
      const pct = (t.target_level / fillPrice - 1) * 100;
      const bid = await appendEvent(env, t, "TARGET_HIT", new Date(r.ts).toISOString(), t.target_level,
        `T${new Date(r.ts).toISOString()} O${r.o} H${r.h} L${r.l} C${r.c} complete:1`, sz.source, sz.timeframe, pct, "target reached after entry");
      await setAuthority(env, t, "TARGET_HIT", bid, "verified by candles");
      return { id: t.id, status: "TARGET_HIT", pct: +pct.toFixed(2) };
    }
  }
  const last = post[post.length - 1];
  const pct = (last.c / fillPrice - 1) * 100;
  await appendEvent(env, t, "OPEN", new Date(last.ts).toISOString(), last.c,
    `O${last.o} H${last.h} L${last.l} C${last.c}`, sz.source, sz.timeframe, pct, "neither stop nor target; marked to last close");
  await setAuthority(env, t, "OPEN", null, "position live; re-scored each cycle");
  return { id: t.id, status: "OPEN", pct: +pct.toFixed(2) };
}

async function scoreAll(env) {
  const started = new Date().toISOString();
  const r = await db(env, "SELECT * FROM tickets");
  const tickets = r.results || [];
  const results = [];
  const tally = {};
  for (const t of tickets) {
    await new Promise(x => setTimeout(x, 1200));
    try {
      const out = await scoreTicket2(env, t);
      results.push(out);
      tally[out.status] = (tally[out.status] || 0) + 1;
    } catch (e) {
      results.push({ id: t.id, status: "ERROR", note: String(e.message || e).slice(0, 120) });
      tally.ERROR = (tally.ERROR || 0) + 1;
    }
  }
  const finished = new Date().toISOString();
  await env.HARZ_DB.prepare("INSERT INTO score_runs (started_ts, finished_ts, status, tickets_checked, events_written, tally) VALUES (?,?,?,?,?,?)")
    .bind(started, finished, "OK", tickets.length, null, JSON.stringify(tally)).run();
  return { started, finished, tickets_checked: tickets.length, tally, results };
}

async function scoreStatus(env) {
  const last = await db(env, "SELECT * FROM score_runs ORDER BY id DESC LIMIT 1");
  const n = await db(env, "SELECT COUNT(*) n FROM tickets");
  const auth = await db(env, "SELECT authoritative_outcome outcome, COUNT(*) n FROM outcome_authority GROUP BY authoritative_outcome");
  const src = await db(env, "SELECT source, status, COUNT(*) n FROM source_health GROUP BY source, status");
  return {
    last_successful_scoring: last.results && last.results[0] ? last.results[0].finished_ts : null,
    tickets: n.results[0].n,
    authoritative: auth.results,
    source_health: src.results
  };
}

async function scoreBoard(env) {
  const r = await db(env, "SELECT t.id, t.symbol, t.seat, t.entry_low, t.entry_high, t.stop_level, t.target_level, " +
    "a.authoritative_outcome, a.note, a.updated_ts " +
    "FROM tickets t LEFT JOIN outcome_authority a ON a.ticket_id = t.id ORDER BY t.id");
  return { board: r.results, protected_rules: "terminal states immutable; UNVERIFIED only for unresolved; source failures logged separately" };
}

async function runHunt(env, opts = {}) {
  // FROZEN rules v1.0, machine seat. IMPLEMENTATION fixes only (no rule changes):
  //  F1 resilient fetch (429/5xx retry+backoff)  F2 multi-provider universe (frozen: top-250, vol>$60M)
  //  F3 stop = 10-day LOW -1.5% (lows, not closes)  F4 target = 2R measured from ENTRY, not from last price
  //  F5 no-chase: entry zone must sit BELOW market  F6 dedupe against live tickets  F7 every exit recorded
  const started = new Date().toISOString();
  const rec = { started, scanned: 0, tickets: 0 };
  const dryRun = !!opts.dryRun;
  const minVol = Number.isFinite(opts.minVol) ? opts.minVol : 60000000;
  const maxTickets = Number.isFinite(opts.maxTickets) ? opts.maxTickets : 3;
  const pickN = Number.isFinite(opts.pickN) ? opts.pickN : 6;
  let u;
  try {
    u = await buildUniverse(env);
  } catch (e) {
    rec.status = "FAILED"; rec.finished = new Date().toISOString(); rec.error = "universe: " + String(e.message || e);
    await logHunt(env, rec);
    return { error: rec.error, hunt: "FAILED", started };
  }
  if (u.error) {
    rec.status = "FAILED"; rec.finished = new Date().toISOString(); rec.error = u.error; rec.chain = u.chain.join("+");
    await logHunt(env, rec);
    return { error: u.error, chain: u.chain, hunt: "FAILED", started };
  }
  rec.provider = u.provider; rec.chain = u.chain.join("+"); rec.universe = u.universe;

  const chg = (r) => r.chg24 || 0;
  const eligible = (u.all || []).filter(r => (r.vol || 0) > minVol);
  const gain = eligible.filter(r => chg(r) > 0).sort((a, b) => chg(b) - chg(a)).slice(0, pickN);
  const dip  = eligible.filter(r => chg(r) < 0).sort((a, b) => chg(a) - chg(b)).slice(0, pickN);
  const shortlist = [...gain, ...dip];
  rec.liquid = eligible.length;

  // live-ticket dedupe set
  let live = [];
  try {
    const r = await env.HARZ_DB.prepare("SELECT symbol FROM prediction_ledger WHERE zone_filled = 'pending'").all();
    live = (r.results || []).map(x => String(x.symbol).toUpperCase());
  } catch (e) { }

  const cand = [], skipped = [];
  for (const row of shortlist) {
    rec.scanned++;
    const inst = row.symbol + "-USDT";
    if (live.includes(row.symbol)) { skipped.push(row.symbol + ":already_live"); continue; }
    let rows = null;
    try {
      const candles = await okx(`/api/v5/market/candles?instId=${inst}&bar=1D&limit=120`, 3);
      if (candles && candles.length >= 60) rows = candles.map(c => ({ o: +c[1], h: +c[2], l: +c[3], c: +c[4] })).reverse();
    } catch (e) { }
    if (!rows) { try { rows = await gateCandles(row.symbol); } catch (e) { } }
    if (!rows || rows.length < 60) { skipped.push(row.symbol + ":thin_history"); continue; }
    const closes = rows.map(r => r.c);
    const last = closes[closes.length - 1];
    const e20 = emaArr(closes, 20), e50 = emaArr(closes, 50), e12 = emaArr(closes, 12), e26 = emaArr(closes, 26);
    const line = e12.map((v, i) => v - e26[i]); const sig = emaArr(line, 9);
    const hist = line[line.length - 1] - sig[sig.length - 1];
    const rsiv = rsiCalc(closes);
    const shelf = e20[e20.length - 1];
    const ch7 = (last / closes[closes.length - 8] - 1) * 100;
    const bull = last > shelf && shelf > e50[e50.length - 1];
    // frozen confluence
    const confluence = bull && rsiv >= 40 && rsiv <= 75 && hist > 0 && (chg(row) > 0 || ch7 > 0);
    if (!confluence) { skipped.push(row.symbol + ":confluence[" +
      "trend=" + (bull ? "up" : "down") +
      ",rsi=" + (rsiv ? rsiv.toFixed(1) : "?") +
      ",hist=" + (Number.isFinite(hist) ? hist.toFixed(3) : "?") +
      ",chg24=" + (chg(row) || 0).toFixed(2) + "%" +
      ",chg7=" + ch7.toFixed(2) + "%]"); continue; }
    // F5 no-chase: the entry zone must be BELOW the market
    const zoneHi = shelf * 1.01, zoneLo = shelf * 0.99;
    if (zoneHi >= last) { skipped.push(row.symbol + ":zone_above_market"); continue; }
    // F3 stop from 10-day LOWS
    const low10 = Math.min(...rows.slice(-10).map(r => r.l));
    const stop = low10 * 0.985;
    // F4 target = 2R from ENTRY (shelf), faithful to v1.0
    const entry = shelf;
    const target = entry + (entry - stop) * 2;
    if (!(stop < entry && entry < target)) { skipped.push(row.symbol + ":bad_geometry"); continue; }
    cand.push({ symbol: row.symbol, inst, entry, zoneLo, zoneHi, stop, target, rsi: rsiv, ch7, chg24: chg(row), kind: chg(row) > 0 ? "leader" : "dip", vol: row.vol, distToZone: (last / zoneHi - 1) * 100 });
  }

  const written = [];
  for (const c of (dryRun ? [] : cand.slice(0, maxTickets))) {
    const notes = `AUTO-HUNT (${c.kind}): provider=${rec.provider}; chain=${rec.chain}; universe=${rec.universe}; liquid=${u.liquid.length}; RSI ${c.rsi.toFixed(1)}; 7d ${c.ch7.toFixed(1)}%; 24h ${c.chg24.toFixed(1)}%; vol $${(c.vol/1e6).toFixed(0)}M; zone ${c.zoneLo.toFixed(6)}-${c.zoneHi.toFixed(6)} (${c.distToZone.toFixed(2)}% below market); stop=10d-low-1.5%; target=2R from entry`;
    try {
      await env.HARZ_DB.prepare(
        "INSERT INTO prediction_ledger (symbol, direction, prediction_date, publication_ts, rule_version, seat, entry_low, entry_high, stop_level, target_level, zone_filled, outcome_category, notes) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)"
      ).bind(c.symbol, "long", new Date().toISOString().slice(0, 10), new Date().toISOString(), "v1.0-FROZEN-AUTO", "machine",
        +c.zoneLo.toFixed(6), +c.zoneHi.toFixed(6), +c.stop.toFixed(8), +c.target.toFixed(8), "pending", null, notes).run();
      written.push({ symbol: c.symbol, zone: [+c.zoneLo.toFixed(6), +c.zoneHi.toFixed(6)], stop: +c.stop.toFixed(8), target: +c.target.toFixed(8), rr: +((c.target - c.entry) / (c.entry - c.stop)).toFixed(2), kind: c.kind });
    } catch (e) { skipped.push(c.symbol + ":insert_fail"); }
  }
  rec.tickets = written.length; rec.finished = new Date().toISOString();
  rec.status = "OK"; rec.details = JSON.stringify({ shortlist: shortlist.map(r => r.symbol), skipped });
  await logHunt(env, rec);
  const scored = dryRun ? { skipped: "preview does not score" } : await scoreAll(env).catch((e) => ({ error: String(e.message || e) }));
  const geometry = cand.slice(0, maxTickets).map(c => ({ symbol: c.symbol, kind: c.kind, zone: [+c.zoneLo.toFixed(6), +c.zoneHi.toFixed(6)], stop: +c.stop.toFixed(8), target: +c.target.toFixed(8), rr: +((c.target - c.entry) / (c.entry - c.stop)).toFixed(2), rsi: +c.rsi.toFixed(1), chg24: +c.chg24.toFixed(1), ch7: +c.ch7.toFixed(1), dist_to_zone_pct: +c.distToZone.toFixed(2), vol_musd: +(c.vol / 1e6).toFixed(0) }));
  return { hunt: dryRun ? "PREVIEW_NO_WRITES" : "OK", dry_run: dryRun, min_vol_filter: minVol, candidates: geometry, written: written.length,
    started, finished: rec.finished, provider: rec.provider, chain: rec.chain, universe: rec.universe, liquid: u.liquid.length, scanned: rec.scanned, shortlist: shortlist.map(r => r.symbol), tickets: written, skipped, scoring: scored };
}

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
    if (url.pathname === "/score" && req.method === "POST") {
      try { return Response.json(await scoreAll(env)); } catch (e) { return Response.json({ error: String(e.message || e) }, { status: 500 }); }
    }
    if (req.method === "GET" && url.pathname === "/score/status") {
      return Response.json(await scoreStatus(env), { headers: { "cache-control": "no-store" } });
    }
    if (req.method === "GET" && url.pathname === "/score/board") {
      return Response.json(await scoreBoard(env), { headers: { "cache-control": "no-store" } });
    }
    if (req.method === "GET" && url.pathname === "/diag/providers") {
      const probes = [
        ["coinpaprika", "https://api.coinpaprika.com/v1/tickers?quotes=USD"],
        ["coingecko", "https://api.coingecko.com/api/v3/ping"],
        ["okx", "https://www.okx.com/api/v5/market/tickers?instType=SPOT"],
        ["kucoin", "https://api.kucoin.com/api/v1/market/stats?symbol=BTC-USDT"],
        ["binance", "https://api.binance.com/api/v3/ping"],
        ["gateio", "https://api.gateio.ws/api/v4/spot/tickers?currency_pair=BTC_USDT"]
      ];
      const out = [];
      for (const [name, url] of probes) {
        const t0 = Date.now();
        const r = await httpJson(url, { tries: 1, timeout: 9000 });
        out.push({ provider: name, ok: r.ok, status: r.status, ms: Date.now() - t0, error: r.ok ? null : r.error });
      }
      return Response.json({ checked_at: new Date().toISOString(), from: "worker egress", providers: out }, { headers: { "cache-control": "no-store" } });
    }
    if (req.method === "GET" && url.pathname === "/hunt/runs") {
      try {
        await env.HARZ_DB.prepare("CREATE TABLE IF NOT EXISTS hunt_runs (id INTEGER PRIMARY KEY AUTOINCREMENT, started_ts TEXT, finished_ts TEXT, provider TEXT, chain TEXT, universe INTEGER, liquid INTEGER, scanned INTEGER, tickets INTEGER, status TEXT, error TEXT, details TEXT)").run();
        const r = await env.HARZ_DB.prepare("SELECT * FROM hunt_runs ORDER BY id DESC LIMIT 20").all();
        return Response.json({ runs: r.results }, { headers: { "cache-control": "no-store" } });
      } catch (e) { return Response.json({ error: String(e.message || e) }, { status: 500 }); }
    }
    if (req.method === "GET" && url.pathname === "/hunt/preview") {
      const q = url.searchParams;
      const opts = {
        dryRun: true,
        minVol: q.get("minVol") ? Number(q.get("minVol")) : undefined,
        maxTickets: q.get("maxTickets") ? Number(q.get("maxTickets")) : undefined,
        pickN: q.get("pickN") ? Number(q.get("pickN")) : undefined
      };
      try { return Response.json(await runHunt(env, opts), { headers: { "cache-control": "no-store" } }); }
      catch (e) { return Response.json({ error: String(e.message || e) }, { status: 500 }); }
    }
    if (url.pathname === "/hunt" && req.method === "POST") {
      try { return Response.json(await runHunt(env)); }
      catch (e) { return Response.json({ error: e.message }, { status: 500 }); }
    }
    if (url.pathname === "/hunt/preview") {
      try { return Response.json(await runHunt(env, { dryRun: true }), { headers: { "cache-control": "no-store" } }); }
      catch (e) { return Response.json({ error: String(e.message || e) }, { status: 500 }); }
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

    // Sizing (unit tolerance: callers may send 1 = 1% or 0.01 = 1%; the frozen 0.5-2% band is unchanged)
    let riskPctUsed = risk_pct;
    if (risk_pct > 0.05 && risk_pct <= 5) riskPctUsed = risk_pct / 100;
    const sz = sizePosition(capital, riskPctUsed, ticket.entry, ticket.stop, ticket.target);
    if (sz.reject) {
      await logRow(env, "execution_ledger", { symbol: ticket.symbol || "?", venue_mode: "DEMO",
        outcome: "REFUSED_SIZING", notes: sz.reason, order_ts: ts });
      return Response.json({ verdict: "REFUSED_SIZING", accepted: false, reason: sz.reason });
    }
    // Portfolio + guardian
    const bookRisk = book.reduce((a, p) => a + (p.risk != null ? p.risk : (p.risk_pct != null ? (p.risk_pct > 0.05 ? p.risk_pct / 100 : p.risk_pct) : 0)), 0);
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
      filled_size: String(Math.round(sz.position_notional)),
      fees_paid: (sz.position_notional * (FEE_RT + SLIP)).toFixed(2),
      slippage: (sz.position_notional * SLIP).toFixed(2),
      fill_price: String(ticket.entry), net_pnl: "0 (open)", order_ts: ts, fill_ts: ts });
    await logRow(env, "risk_ledger", { check_ts: ts, aggregate_open_risk_pct: agg.toFixed(1),
      position_count: String(book.length + 1), correlated_exposure_count: String(book.filter(p => p.dir === "long").length + 1),
      breaches: "none", kill_switch_state: "inactive", actions_taken: "order accepted (simulated fill)" });
    return Response.json({ verdict: "ACCEPTED_SIMULATED", accepted: true, order_id, sizing: sz, agg_risk_pct: agg, steps_passed: 8 });
  }
};


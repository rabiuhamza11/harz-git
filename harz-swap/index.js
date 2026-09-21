// ============================================================
// harzswap v6.0.0 — REAL DEX: create pool + add liquidity + swap via QuickSwap V2 router (wallet-signed)
// - Real on-chain pool data only (Polygon RPC, balanceOf/getReserves)
// - No price policy: the market dictates all prices (owner law Sep 18, 2026)
// - HARZ price = live market (QuickSwap V3 Algebra pool HARZ/WPOL)
// - Fake swap execution REMOVED (was: random txHash + "status: executed")
// - No invented reserves. No synthetic pools. Every number carries its source.
// Deployed: harz-swap.harz.workers.dev
// ============================================================

const VERSION = "6.0.6";

// ---- on-chain constants (Polygon mainnet) ----
const RPCS = [
  "https://polygon-bor-rpc.publicnode.com",
  "https://polygon.llamarpc.com",
  "https://rpc.ankr.com/polygon",
];
const TOK = {
  HARZ: "0xce2d18f2f60e180207a30a4e6d99a5aea9ebe7de",
  WPOL: "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270",
  GDEG: "0x222a10CE822188c680a04A283E45F9c11D79665e",
  NRL:  "0xE8423c0595E6b2caD4E6f19B6F51666699be303a",
};
const POOLS = {
  "HARZ/WPOL": { addr: "0x8A34CFC6B370e97FBFf6C15339A743E2a1220319", venue: "QuickSwap V3 (Algebra), 1% fee", kind: "algebra-v3", feeBps: 100 },
  "GDEG/WPOL": { addr: "0xb9658A00F69508f53b50Aa88Ff2b6912fd206ea8", venue: "QuickSwap V2, 0.30% fee", kind: "v2", feeBps: 30 },
  "NRL/WPOL":  { addr: "0x30D6Dbea9eF1fEbbd65Aa1c51F51957F6EFe9B2A", venue: "QuickSwap V2, 0.30% fee", kind: "v2", feeBps: 30 },
};
// ---- NO PRICE POLICY (owner law Sep 18, 2026: let market dictate all crypto price as it is in the globe) ----
// There is NO fixed book. All prices are market-made by pool reserves:
// HARZ = Polygon HARZ/WPOL pool-implied USD x NGN; GDEG/NRL = L1 pool ratio x HARZ market price.

let L1_ERR = null; // last L1 pools fetch error

// ---- caches ----
const cache = { pools: { d: null, t: 0 }, lp: { d: null, t: 0 }, pol: { d: null, t: 0 }, ngn: { d: null, t: 0 }, ext: { d: null, t: 0 } };
const TTL = { pools: 60e3, lp: 60e3, pol: 60e3, ngn: 300e3, ext: 120e3 };
const isStale = (k) => (cache[k].d && Date.now() - cache[k].t > TTL[k]);

const CORS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-API-Key",
};
const j = (obj, status = 200) => new Response(JSON.stringify(obj), { status, headers: CORS });

// ---- JSON-RPC helpers (calldata built programmatically — never hand-typed) ----
function calldataBalanceOf(addr) { return "0x70a08231" + addr.slice(2).toLowerCase().padStart(64, "0"); }
async function rpcCall(call) {
  for (const url of RPCS) {
    try {
      const r = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_call", params: [call, "latest"] }),
      });
      const d = await r.json();
      if (d && d.result !== undefined && d.result !== null) return d.result;
    } catch (e) { /* try next RPC */ }
  }
  return null;
}
async function erc20Balance(token, holder) {
  const r = await rpcCall({ to: token.toLowerCase(), data: calldataBalanceOf(holder) });
  return r ? BigInt(r) : null; // wei
}
async function v2Reserves(pair) {
  const r = await rpcCall({ to: pair.toLowerCase(), data: "0x0902f1ac" });
  if (!r || r.length < 194) return null;
  return { r0: BigInt("0x" + r.slice(2, 66)), r1: BigInt("0x" + r.slice(66, 130)) };
}
function fmt18(b) { return Number(b) / 1e18; }

// ---- live data loaders ----
async function getPol() {
  if (!isStale("pol") && cache.pol.d) return cache.pol.d;
  try {
    const r = await fetch("https://api.coinbase.com/v2/prices/POL-USD/spot");
    const d = await r.json();
    if (d && d.data && d.data.amount) cache.pol = { d: parseFloat(d.data.amount), t: Date.now() };
  } catch (e) {}
  return cache.pol.d || null;
}
async function getNgn() {
  if (!isStale("ngn") && cache.ngn.d) return cache.ngn.d;
  try {
    const r = await fetch("https://open.er-api.com/v6/latest/USD");
    const d = await r.json();
    if (d && d.rates && d.rates.NGN) cache.ngn = { d: d.rates.NGN, t: Date.now() };
  } catch (e) {}
  return cache.ngn.d || null;
}
async function getPools() {
  if (!isStale("pools") && cache.pools.d) return cache.pools.d;
  const pol = await getPol();
  const out = [];
  const hp = POOLS["HARZ/WPOL"];
  const [harzBal, wpolBal] = await Promise.all([erc20Balance(TOK.HARZ, hp.addr), erc20Balance(TOK.WPOL, hp.addr)]);
  if (harzBal !== null && wpolBal !== null) {
    const harz = fmt18(harzBal), wpol = fmt18(wpolBal);
    out.push({
      pair: "HARZ/WPOL", venue: hp.venue, address: hp.addr, kind: "market",
      reserveHARZ: +harz.toFixed(4), reserveWPOL: +wpol.toFixed(4),
      price: { harzPerWpol: +(wpol / harz).toFixed(4), wpolPerHarz: +(harz / wpol).toFixed(6) },
      harzUSD: pol ? +((wpol / harz) * pol).toFixed(6) : null,
      depthUSD: pol ? +(2 * wpol * pol).toFixed(2) : null,
      source: "on-chain balanceOf (live)", note: "This is the ENTIRE tradable HARZ depth on Polygon.",
    });
  }
  for (const [pair, key] of [["GDEG/WPOL", "GDEG"], ["NRL/WPOL", "NRL"]]) {
    const cfg = POOLS[pair];
    const res = await v2Reserves(cfg.addr);
    if (res) {
      const wpol = fmt18(res.r0), tok = fmt18(res.r1); // token0=WPOL, token1=token (verified on-chain)
      out.push({
        pair, venue: cfg.venue, address: cfg.addr, kind: "market",
        reserveWPOL: +wpol.toFixed(4), reserveToken: +tok.toFixed(0),
        poolPriceTokenPerWpol: tok > 0 ? +(tok / wpol).toFixed(0) : null,
        depthUSD: pol ? +(2 * wpol * pol).toFixed(2) : null,
        source: "on-chain getReserves (live)",
        warning: "DUST depth — pool price IS the market price. No book exists; the market dictates (owner law Sep 18, 2026).",
      });
    }
  }
  cache.pools = { d: out, t: Date.now() };
  return out;
}

// ---- LP positions (live on-chain reads; treasury wallet) ----
const LP_HOLDER = "0x608110Ca7CDCe4D0ec92416C2CD73218B935aaC1"; // HARZ treasury (Rabiu's own wallet)
async function erc20TotalSupply(token) {
  const r = await rpcCall({ to: token.toLowerCase(), data: "0x18160ddd" });
  return r && r !== "0x" ? BigInt(r) : null;
}
async function getLp() {
  if (!isStale("lp") && cache.lp.d) return cache.lp.d;
  const pol = await getPol(), ngn = await getNgn();
  const out = [];
  for (const [pair, key] of [["GDEG/WPOL", "GDEG"], ["NRL/WPOL", "NRL"]]) {
    const cfg = POOLS[pair];
    const res = await v2Reserves(cfg.addr);
    const [supply, held] = await Promise.all([erc20TotalSupply(cfg.addr), erc20Balance(cfg.addr, LP_HOLDER)]);
    if (res && supply !== null && held !== null) {
      const wpol = fmt18(res.r0), tok = fmt18(res.r1);
      const sup = fmt18(supply), own = fmt18(held);
      const share = sup > 0 ? own / sup : 0;
      const tokClaim = tok * share, wpolClaim = wpol * share;
      out.push({
        pair, address: cfg.addr, lpHolder: LP_HOLDER,
        lpTotalSupply: +sup.toFixed(2), lpOwned: +own.toFixed(2), lpSharePct: +(share * 100).toFixed(2),
        claimToken: +tokClaim.toFixed(0), claimWPOL: +wpolClaim.toFixed(4),
        tokenSideNgn: (ngn && pol && wpol > 0) ? +((tokClaim / (tok / wpol)) * pol * ngn).toFixed(0) : null,
        wpolSideUsd: pol ? +(wpolClaim * pol).toFixed(2) : null,
        source: "on-chain totalSupply/balanceOf (live)",
        note: "LP position of the HARZ treasury wallet. Both sides valued at the pool market price (WPOL side via Coinbase POL-USD, token side via its pool price). No book — market dictates (owner law Sep 18, 2026).",
      });
    }
  }
  cache.lp = { d: out, t: Date.now() };
  return out;
}

// ---- external market prices (Coinbase, cached) ----
const CB = { BTC: "BTC", ETH: "ETH", BNB: "BNB", SOL: "SOL", XRP: "XRP", ADA: "ADA", DOGE: "DOGE", DOT: "DOT", AVAX: "AVAX", LINK: "LINK", MATIC: "POL", TRX: "TRX", LTC: "LTC" };
async function getExt() {
  if (!isStale("ext") && cache.ext.d) return cache.ext.d;
  const prices = {};
  await Promise.all(Object.entries(CB).map(async ([sym, coin]) => {
    try {
      const r = await fetch("https://api.coinbase.com/v2/prices/" + coin + "-USD/spot");
      const d = await r.json();
      if (d && d.data && d.data.amount) prices[sym] = parseFloat(d.data.amount);
    } catch (e) {}
  }));
  if (Object.keys(prices).length) cache.ext = { d: prices, t: Date.now() };
  return cache.ext.d || {};
}

// ---- quote engine (honest: exact for V2, estimate for V3, book for policy) ----
function v2Quote(amountInWei, rIn, rOut, feeBps) {
  const inAfterFee = amountInWei * BigInt(10000 - feeBps) / BigInt(10000);
  return inAfterFee * rOut / (rIn + inAfterFee);
}
async function l1AmmPools(env) {
  try {
    L1_ERR = null;
    const url = "https://chain.internal/api/amm/pools";
    const r = (env && env.CHAIN) ? await env.CHAIN.fetch(url) : await fetch("https://harz-chain-v2.harz.workers.dev/api/amm/pools");
    if (!r.ok) { L1_ERR = "HTTP " + r.status; return []; }
    const d = await r.json();
    if (!d.pools) { L1_ERR = "no pools key, got: " + Object.keys(d).slice(0,8).join(","); return []; }
    return d.pools;
  } catch (e) { L1_ERR = "EXC: " + (e && e.message || String(e)); return []; }
}
async function getQuote(env, from, to, amountIn) {
  const ngn = await getNgn();
  const pools = await getPools();
  const l1p = await l1AmmPools(env);
  const gp1 = l1p.find((p) => p.pool_id === "GDEG/HARZ") || {};
  const np1 = l1p.find((p) => p.pool_id === "NRL/HARZ") || {};
  const harzPool = pools.find((p) => p.pair === "HARZ/WPOL");
  const amount = parseFloat(amountIn);
  const F = from.toUpperCase(), T = to.toUpperCase();
  if (!isFinite(amount) || amount <= 0) return { status: 400, body: { success: false, error: "amount must be a positive number", supported: ["HARZ","WPOL","GDEG","NRL","NGN","USD"] } };
  if (amount > 1e12) return { status: 400, body: { success: false, error: "amount too large" } };

  const base = async (fromSym, toSym, amt) => {
    if (fromSym === toSym) return { out: amt, source: "identity", rate: 1 };
    // GDEG <-> NRL: market route through the two L1 pools (no policy)
    if ((fromSym === "GDEG" && toSym === "NRL") || (fromSym === "NRL" && toSym === "GDEG")) {
      const srcP = fromSym === "GDEG" ? gp1 : np1, dstP = fromSym === "GDEG" ? np1 : gp1;
      if (!srcP.harz_reserve || !dstP.harz_reserve) return { error: "L1 pool data unavailable" };
      const inA = amt * 0.997;
      const outH = inA * srcP.harz_reserve / (srcP.token_reserve + inA);
      const inB = outH * 0.997;
      const out = inB * dstP.token_reserve / (dstP.harz_reserve + inB);
      return { out, source: "market (L1 AMM two-hop via HARZ, 0.3% per hop, exact)", note: "no policy — price made by pool reserves" };
    }
    // GDEG/NRL <-> NGN/USD: market valuation via L1 pool ratio x HARZ/WPOL implied USD
    if ((fromSym === "GDEG" || fromSym === "NRL") && (toSym === "NGN" || toSym === "USD")) {
      if (!ngn || !harzPool || !harzPool.harzUSD) return { error: "market data unavailable" };
      const p = fromSym === "GDEG" ? gp1 : np1;
      if (!p.harz_reserve) return { error: "L1 pool data unavailable" };
      const usd = amt * (p.harz_reserve / p.token_reserve) * harzPool.harzUSD;
      return { out: toSym === "NGN" ? usd * ngn : usd, source: "market (L1 pool ratio x HARZ/WPOL implied USD)" };
    }
    if ((fromSym === "NGN" || fromSym === "USD") && (toSym === "GDEG" || toSym === "NRL")) {
      if (!ngn || !harzPool || !harzPool.harzUSD) return { error: "market data unavailable" };
      const p = toSym === "GDEG" ? gp1 : np1;
      if (!p.harz_reserve) return { error: "L1 pool data unavailable" };
      const usdIn = fromSym === "NGN" ? amt / ngn : amt;
      const inA = (usdIn / harzPool.harzUSD) * 0.997;
      const out = inA * p.token_reserve / (p.harz_reserve + inA);
      return { out, source: "market (HARZ/WPOL implied USD -> L1 pool, 0.3% fee)" };
    }
    // on-chain: HARZ <-> WPOL (Algebra V3, reserves-based estimate, 1% fee)
    if ((fromSym === "HARZ" && toSym === "WPOL") || (fromSym === "WPOL" && toSym === "HARZ")) {
      if (!harzPool) return { error: "HARZ pool data unavailable" };
      const { reserveHARZ: h, reserveWPOL: w } = harzPool;
      let out;
      if (fromSym === "HARZ") out = amt * (w / h) * 0.99;
      else out = amt * (h / w) * 0.99;
      return { out, source: "on-chain V3 estimate (reserves-based, 1% fee)", note: "estimate; exact fill requires a quoter at swap time" };
    }
    // on-chain: GDEG/WPOL, NRL/WPOL (V2, exact constant product, 0.3% fee)
    for (const sym of ["GDEG", "NRL"]) {
      if ((fromSym === sym && toSym === "WPOL") || (fromSym === "WPOL" && toSym === sym)) {
        const r = await v2Reserves(POOLS[sym + "/WPOL"].addr);
        if (!r) return { error: sym + " pool data unavailable" };
        const inWei = BigInt(Math.round(amount * 1e18));
        let outWei;
        if (fromSym === sym) outWei = v2Quote(inWei, r.r1, r.r0, 30);
        else outWei = v2Quote(inWei, r.r0, r.r1, 30);
        if (outWei <= 0n) return { error: "insufficient input for pool depth" };
        return { out: fmt18(outWei), source: "on-chain V2 AMM (exact math, 0.30% fee)", warning: "DUST pool — real fills at this depth are tiny; the pool price IS the market price (no book)" };
      }
    }
    // cross-market paths
    if (fromSym === "HARZ" && (toSym === "GDEG" || toSym === "NRL")) {
      const s1 = await base("HARZ", "WPOL", amt);
      if (s1.error) return s1;
      const s2 = await base("WPOL", toSym, s1.out);
      if (s2.error) return s2;
      return { out: s2.out, source: "on-chain market path HARZ->WPOL->" + toSym, warning: "path crosses dust pools — indicative only" };
    }
    if ((fromSym === "GDEG" || fromSym === "NRL") && toSym === "HARZ") {
      const s1 = await base(fromSym, "WPOL", amt);
      if (s1.error) return s1;
      const s2 = await base("WPOL", "HARZ", s1.out);
      if (s2.error) return s2;
      return { out: s2.out, source: "on-chain market path " + fromSym + "->WPOL->HARZ", warning: "path crosses dust pools — indicative only" };
    }
    // HARZ <-> NGN / USD (market)
    if (fromSym === "HARZ" && (toSym === "NGN" || toSym === "USD")) {
      if (!harzPool || !harzPool.harzUSD || !ngn) return { error: "market data unavailable" };
      const usd = amt * harzPool.harzUSD;
      return { out: toSym === "NGN" ? usd * ngn : usd, source: "market (pool-implied USD)" };
    }
    if ((fromSym === "NGN" || fromSym === "USD") && toSym === "HARZ") {
      if (!harzPool || !harzPool.harzUSD || !ngn) return { error: "market data unavailable" };
      const usd = fromSym === "NGN" ? amt / ngn : amt;
      return { out: usd / harzPool.harzUSD, source: "market (pool-implied USD)" };
    }
    // WPOL <-> NGN/USD
    if (fromSym === "WPOL" && (toSym === "NGN" || toSym === "USD")) {
      const pol = await getPol();
      if (!pol || !ngn) return { error: "market data unavailable" };
      return { out: toSym === "NGN" ? amt * pol * ngn : amt * pol, source: "market (Coinbase POL-USD)" };
    }
    if ((fromSym === "NGN" || fromSym === "USD") && toSym === "WPOL") {
      const pol = await getPol();
      if (!pol || !ngn) return { error: "market data unavailable" };
      const usd = fromSym === "NGN" ? amt / ngn : amt;
      return { out: usd / pol, source: "market (Coinbase POL-USD)" };
    }
    // external coins via Coinbase
    const ext = await getExt();
    if (ext[fromSym] && toSym === "USD") return { out: amt * ext[fromSym], source: "market (Coinbase)" };
    if (ext[fromSym] && toSym === "NGN") {
      if (!ngn) return { error: "NGN rate unavailable" };
      return { out: amt * ext[fromSym] * ngn, source: "market (Coinbase + er-api)" };
    }
    return { error: "unsupported pair: " + fromSym + " -> " + toSym };
  };
  const res = await base(F, T, amount);
  if (res.error) return { status: 400, body: { success: false, error: res.error, supported: ["HARZ", "WPOL", "GDEG", "NRL", "NGN", "USD"].concat(Object.keys(CB)) } };
  const out = res.out;
  return {
    status: 200,
    body: {
      success: true, from: F, to: T,
      amountIn: amount,
      amountOut: typeof out === "number" ? +out.toFixed(8) : out,
      rate: out && amount ? "1 " + F + " = " + (out / amount).toFixed(8) + " " + T : null,
      source: res.source || null,
      note: res.note || null,
      warning: res.warning || null,
      asOf: new Date().toISOString(),
    },
  };
}

// ---- frontend (light theme, PWA, mobile-first, honest) ----
const HTML = `<!DOCTYPE html><html lang='en'><head><meta charset='UTF-8'><meta name='viewport' content='width=device-width, initial-scale=1.0'><title>HARZSwap — Sovereign DEX on HARZ Chain</title><meta name='theme-color' content='#f0f2f5'><meta name='apple-mobile-web-app-capable' content='yes'><meta name='apple-mobile-web-app-status-bar-style' content='default'><meta name='apple-mobile-web-app-title' content='HARZSwap'><link rel='manifest' href='/manifest.json'><link rel='icon' href='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Crect width=%22100%22 height=%22100%22 rx=%2220%22 fill=%22%23f0f2f5%22/%3E%3Ctext x=%2250%22 y=%2270%22 font-size=%2255%22 text-anchor=%22middle%22 fill=%22%2300d4ff%22%3E%E2%82%BF%3C/text%3E%3C/svg%3E'><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:system-ui,sans-serif;background:#f0f2f5;color:#1a1a2e;padding-bottom:40px}.hdr{background:#ffffff;border-bottom:1px solid #e2e8f0;padding:16px;text-align:center}.hdr h1{font-size:20px}.hdr .sub{font-size:12px;color:#64748b;margin-top:4px}.wrap{max-width:680px;margin:0 auto;padding:12px}.card{background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:14px;margin:10px 0;box-shadow:0 1px 3px rgba(0,0,0,0.05)}.card h3{font-size:13px;color:#0ea5a4;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px}.pool{display:flex;justify-content:space-between;align-items:center;padding:10px;border:1px solid #e2e8f0;border-radius:8px;margin:6px 0;flex-wrap:wrap;gap:4px}.pool .nm{font-weight:700}.pool .rs{font-size:12px;color:#64748b}.pool .pr{font-size:12px;color:#0ea5a4;font-weight:600}input,select,textarea{width:100%;padding:10px;border:1px solid #cbd5e1;border-radius:8px;font-size:14px;margin:4px 0;background:#ffffff;color:#1a1a2e}label{font-size:12px;color:#64748b;display:block;margin-top:8px}button{width:100%;padding:12px;border:0;border-radius:8px;background:#0ea5a4;color:#fff;font-size:14px;font-weight:600;cursor:pointer;margin-top:10px}button.alt{background:#1a1a2e}button.warn{background:#fff;color:#b45309;border:1px solid #f59e0b}button:hover{opacity:0.9}.row2{display:flex;gap:8px}.row2>div{flex:1}.msg{margin-top:10px;padding:10px;border-radius:8px;font-size:13px;white-space:pre-wrap;word-break:break-all;display:none}.ok{background:#ecfdf5;border:1px solid #a7f3d0;color:#065f46}.err{background:#fef2f2;border:1px solid #fecaca;color:#991b1b}.bal{display:flex;justify-content:space-between;font-size:13px;padding:4px 0;border-bottom:1px dashed #e2e8f0}.bal:last-child{border:0}.foot{text-align:center;font-size:11px;color:#94a3b8;margin-top:20px;padding:0 12px}.hint{font-size:11px;color:#94a3b8;margin-top:6px}.keyst{font-size:12px;padding:8px;border-radius:8px;background:#f8fafc;border:1px solid #e2e8f0;margin-top:8px}</style></head><body><div class='hdr'><h1>₿ HARZSwap</h1><div class='sub'>Sovereign DEX on HARZ Chain — everything trades on our public chain · constant-product x·y=k, 0.3% fee</div><div style='display:inline-block;margin-top:6px;padding:3px 10px;border-radius:12px;background:#dcfce7;color:#166534;font-size:11px;font-weight:600'>v6.0.6 sovereign-L1</div></div><div class='wrap'><div class='card'><h3>Market prices (no policy)</h3><div class='bal'><span>HARZcoin</span><b>set by the HARZ/WPOL market (pool-implied)</b></div><div class='bal'><span>GDEG</span><b>set by the GDEG/HARZ pool</b></div><div class='bal'><span>NRL</span><b>set by the NRL/HARZ pool</b></div><div class='hint'>No fixed book anywhere — all prices are made by trading in the pools, like the globe (owner law Sep 18, 2026).</div></div><div class='card'><h3>Liquidity Pools (live on HARZ Chain)</h3><div id='pools'>Loading pools…</div></div><div class='card'><h3>Your Wallet & Keys</h3><label>Wallet address (phone or 0x…)</label><input id='wallet' placeholder='e.g. 08028687857' oninput='loadBal();keyStatus()'><div class='keyst' id='keyst'>Checking device key…</div><div class='row2'><div><button class='alt' onclick='createWallet()'>Create New Wallet</button></div><div><button class='warn' onclick='exportKey()'>Export Key</button></div></div><div class='row2' style='margin-top:6px'><div><button class='alt' onclick='importKey()'>Import Key</button></div><div><button class='alt' onclick='newKeyFor()'>New Key For This Address</button></div></div><div class='row2' style='margin-top:6px'><div><button class='alt' onclick='copyPubKey()'>Copy Public Key</button></div><div></div></div><div id='pkbox' style='display:none;word-break:break-all;font-size:12px;color:#555;margin-top:4px'></div><div class='hint'>Keys are generated in YOUR browser (ECDSA P-256). The server only ever stores your public key — it cannot move your funds.</div><div id='bals' style='margin-top:10px'></div></div><div class='card'><h3>Swap</h3><label>Pool</label><select id='spool'></select><label>Direction</label><select id='sdir'><option value='harz_to_token'>HARZ → Token</option><option value='token_to_harz'>Token → HARZ</option></select><label>Amount</label><input id='samt' type='number' step='any' placeholder='0.0'><button class='alt' onclick='doQuote()'>Get Quote</button><button onclick='doSwap()'>Sign & Execute Swap</button><div class='msg' id='smsg'></div></div><div class='card'><h3>Send HARZ</h3><label>Recipient (wallet address)</label><input id='tto' placeholder='e.g. 08098765432 or 0x…'><label>Amount</label><input id='tamt' type='number' step='any' placeholder='0.0'><button onclick='doTransfer()'>Sign &amp; Send</button><div class='hint'>Signed transfer — moves real HARZ on L1. Use this to lock funds to the bridge escrow.</div><div class='msg' id='tmsg'></div></div><div class='card'><h3>Add Liquidity</h3><label>Pool</label><select id='lpool'></select><div class='row2'><div><label>HARZ amount</label><input id='lharz' type='number' step='any'></div><div><label>Token amount</label><input id='ltok' type='number' step='any'></div></div><button onclick='doLiq()'>Sign & Add Liquidity</button><div class='msg' id='lmsg'></div></div><div class='card'><h3>Remove Liquidity</h3><label>Pool</label><select id='rpool'></select><label>LP tokens to burn</label><input id='rlp' type='number' step='any'><button class='alt' onclick='doWith()'>Sign & Withdraw</button><div class='msg' id='rmsg'></div></div><div class='card'><h3>Your LP Positions</h3><div id='pos'>Enter wallet above</div></div><div class='card'><h3>Sovereignty — everything on HARZ Chain</h3>Executor: <b>HARZ Router v1</b> — on-chain engine contract <code style='word-break:break-all'>0x13681aa174fb8feba5282baa54a39e549e995bbf</code>. Execution = /api/amm/* on HARZ Chain: constant-product x·y=k, 0.3% fee to liquidity providers, no owner, no admin keys, no third-party router anywhere in this stack. Every action is signed with your device key (ECDSA P-256) + single-use nonce — the server holds no keys and cannot forge your signature.<br><br><span style='color:#b45309'>Polygon rail retired Sep 17, 2026 by owner order: everything on HARZ Chain. No price policy anywhere — the market dictates all prices (owner law Sep 18, 2026).</span></div><div class='foot'>HARZSwap · sovereign DEX on HARZ Chain · executor: HARZ Router v1 (ours) · v6.0.6</div></div><script>window.onerror=function(m,s,l,c,e){document.title='ERR: '+m;try{document.getElementById('pools').innerHTML='<b>JS ERROR:</b> '+m+' @ '+l+':'+c}catch(x){}};window.addEventListener('unhandledrejection',function(e){try{document.getElementById('pools').innerHTML='<b>PROMISE REJECTED:</b> '+(e.reason&&e.reason.message||e.reason)}catch(x){}});var B='https://harz-chain-v2.harz.workers.dev',P=[];async function J(u,d){var r=await fetch(B+u,d);return r.json()}function show(id,txt,ok){var e=document.getElementById(id);e.style.display='block';e.className='msg '+(ok?'ok':'err');e.textContent=txt}function b64(buf){return btoa(String.fromCharCode.apply(null,new Uint8Array(buf)))}function getAllKeys(){try{var m=JSON.parse(localStorage.getItem('harzswap_keys')||'null');if(m)return m;var legacy=JSON.parse(localStorage.getItem('harzswap_key')||'null');if(legacy&&legacy.address){var mm={};mm[legacy.address]=legacy;localStorage.setItem('harzswap_keys',JSON.stringify(mm));return mm}return{}}catch(e){return{}}} function saveKey(addr,priv){var m=getAllKeys();m[addr]={address:addr,priv:priv};localStorage.setItem('harzswap_keys',JSON.stringify(m))} function getSaved(addr){var m=getAllKeys();if(addr)return m[addr]||null;var ks=Object.keys(m);return ks.length===1?m[ks[0]]:null} async function keyStatus(){try{var w=document.getElementById('wallet').value.trim();var m=getAllKeys();var ks=Object.keys(m);var el=document.getElementById('keyst');if(w&&m[w]){el.textContent='Key saved on this device for '+w+' - ready to sign';el.style.color='#0a7d3a'}else if(w&&ks.length){el.textContent='No saved key for '+w+' on this device. You have keys for: '+ks.join(', ')+'. Use Import Key or New Key For This Address below.';el.style.color='#b00020'}else if(ks.length){el.textContent='Device has keys for: '+ks.join(', ')+' - type one of these addresses above, or create a new wallet';el.style.color='#555'}else{el.textContent='No device key - create a wallet above to swap';el.style.color='#b00020'}}catch(e){document.getElementById('keyst').textContent='Key check error: '+(e&&e.message||e)}}async function signMsg(msg,addr){var k=getSaved(addr);if(!k)throw 'No device key for '+(addr||'this wallet')+' — import it or use New Key For This Address';var key=await crypto.subtle.importKey('jwk',k.priv,{name:'ECDSA',namedCurve:'P-256'},false,['sign']);return b64(await crypto.subtle.sign({name:'ECDSA',hash:'SHA-256'},key,new TextEncoder().encode(msg)))}async function createWallet(){try{var d=await J('/api/wallet/create',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});if(!d.success)throw d.error;var kp=await crypto.subtle.generateKey({name:'ECDSA',namedCurve:'P-256'},true,['sign','verify']);var priv=await crypto.subtle.exportKey('jwk',kp.privateKey);var spki=await crypto.subtle.exportKey('spki',kp.publicKey);var reg=await J('/api/wallet/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({address:d.address,public_key:b64(spki)})});if(!reg.success)throw reg.error;saveKey(d.address,priv);document.getElementById('wallet').value=d.address;await keyStatus();loadBal();alert('Wallet created: '+d.address+'\\n\\nIMPORTANT: your key lives only in this browser. Use Export Key to back it up NOW — if you lose it, funds are unrecoverable. Other wallet keys saved on this device were kept.')}catch(e){alert('Create failed: '+(e.error||e))}}function exportKey(){var w=document.getElementById('wallet').value.trim();var k=getSaved(w)||getSaved();if(!k){alert('No device key saved for this address');return}alert('Backup for '+k.address+' — paste this whole line into Import Key on any device to restore signing:\\n\\n'+JSON.stringify(k)+'\\n\\nAnyone with this can move your funds. The server never sees it.')} async function importKey(){var w=document.getElementById('wallet').value.trim();if(!w){alert('Type the wallet address above first');return}var raw=prompt('Paste the exported key JSON for '+w+':');if(!raw)return;try{var obj=JSON.parse(raw);var priv=obj.priv||obj;var addr=obj.address||w;if(addr!==w){if(!confirm('This backup is for '+addr+', not '+w+'. Import it under '+addr+' instead?'))return;w=addr}saveKey(w,priv);await keyStatus();alert('Key imported for '+w+' — signing enabled')}catch(e){alert('Invalid key JSON: '+(e.message||e))}} async function newKeyFor(){var w=document.getElementById('wallet').value.trim();if(!w){alert('Type the wallet address above first');return}var kp=await crypto.subtle.generateKey({name:'ECDSA',namedCurve:'P-256'},true,['sign','verify']);var priv=await crypto.subtle.exportKey('jwk',kp.privateKey);var spki=await crypto.subtle.exportKey('spki',kp.publicKey);saveKey(w,priv);await keyStatus();var pk=b64(spki);pkBoxShow(w,pk);try{await navigator.clipboard.writeText(w+' '+pk);var cb=document.getElementById('pkcbtn');if(cb)cb.textContent='Copied!'}catch(e){}} var PKTXT='';async function pkCopy(){try{await navigator.clipboard.writeText(PKTXT);var cb=document.getElementById('pkcbtn');if(cb)cb.textContent='Copied!'}catch(e){alert('Press and hold the code above to copy it manually')}}async function pkShare(){window.open('https://wa.me/?text='+encodeURIComponent(PKTXT),'_blank')} async function pkBoxShow(w,pk){PKTXT=w+' '+pk;var el=document.getElementById('pkbox');el.style.display='block';el.innerHTML="<b style='color:#0a7d3a'>KEY CREATED ON THIS DEVICE</b><div style='margin-top:6px;font-size:12px;color:#555'>This is your PUBLIC key - safe to share. Send it to the operator (Nuruddeen) in WhatsApp to activate your wallet:</div><div id='pktext' style='margin:8px 0;padding:8px;background:#f0f2f5;border:1px solid #cbd5e1;border-radius:8px;word-break:break-all;font-family:monospace;font-size:11px'>"+w+" "+pk+"</div><div class='row2'><div><button class='alt' id='pkcbtn' onclick='pkCopy()'>Copy</button></div><div><button class='alt' onclick='pkShare()'>Send via WhatsApp</button></div></div>"} async function copyPubKey(){var w=document.getElementById('wallet').value.trim();if(!w){alert('Type the wallet address above first');return}var k=getSaved(w);if(!k){alert('No key saved for '+w+' on this device - tap New Key For This Address first');return}var key=await crypto.subtle.importKey('jwk',k.priv,{name:'ECDSA',namedCurve:'P-256'},true,['verify']);var spki=await crypto.subtle.exportKey('spki',key);var pk=b64(spki);pkBoxShow(w,pk);try{await navigator.clipboard.writeText(w+' '+pk);var cb=document.getElementById('pkcbtn');if(cb)cb.textContent='Copied!'}catch(e){}}async function loadPools(){try{var d=await J('/api/amm/pools');P=d.pools||[];var h='';for(var i=0;i<P.length;i++){var p=P[i];h+='<div class=pool><div><div class=nm>'+p.pool_id+'</div><div class=rs>'+Number(p.harz_reserve).toLocaleString()+' HARZ · '+Number(p.token_reserve).toLocaleString()+' '+p.token_symbol+'</div></div><div class=pr>1 '+p.token_symbol+' = '+Number(p.price_harz_per_token).toFixed(4)+' HARZ</div></div>'}document.getElementById('pools').innerHTML=h||'No pools yet';var o='';for(var j=0;j<P.length;j++){o+='<option>'+P[j].pool_id+'</option>'}document.getElementById('spool').innerHTML=o;document.getElementById('lpool').innerHTML=o;document.getElementById('rpool').innerHTML=o;if(document.getElementById('wallet').value.trim()){loadBal();keyStatus()}}catch(e){document.getElementById('pools').innerHTML='Error loading pools: '+(e&&e.message||e)}}async function loadBal(){var w=document.getElementById('wallet').value.trim();if(!w){document.getElementById('bals').innerHTML='';return}var b=await J('/api/balance?address='+encodeURIComponent(w));if(!P.length){try{await loadPools()}catch(e){}}var h='<div class=bal><span>Native</span><b>'+(b.balance||0).toLocaleString()+' HARZ</b></div>';for(var i=0;i<P.length;i++){var d=null;try{d=await J('/api/contract/call',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({contract_address:P[i].token_contract,method:'balanceOf',address:w})})}catch(e){}h+='<div class=bal><span>'+P[i].token_symbol+'</span><b>'+((d&&d.balance!=null)?Number(d.balance).toLocaleString():'-')+'</b></div>'}document.getElementById('bals').innerHTML=h;var ps=null;try{ps=await J('/api/amm/positions?wallet='+encodeURIComponent(w))}catch(e){}var ph='';for(var k=0;k<((ps&&ps.positions)||[]).length;k++){var q=ps.positions[k];ph+='<div class=bal><span>'+q.pool_id+'</span><b>'+q.lp_tokens.toFixed(4)+' LP ('+q.share_pct.toFixed(2)+'%)</b></div>'}document.getElementById('pos').innerHTML=ph||'No positions'}async function doQuote(){var d=await J('/api/amm/quote?pool_id='+encodeURIComponent(document.getElementById('spool').value)+'&direction='+document.getElementById('sdir').value+'&amount='+document.getElementById('samt').value);if(d.error){show('smsg','Quote failed: '+d.error,0);return}show('smsg','Quote: '+d.amount_in+' in → '+d.amount_out_display+' out\\nSpot price: '+d.spot_price_before.toFixed(6)+' → '+d.spot_price_after.toFixed(6)+' ('+d.price_impact_pct.toFixed(3)+'% impact)',1)}async function doSwap(){var w=document.getElementById('wallet').value.trim(),pid=document.getElementById('spool').value,dir=document.getElementById('sdir').value,amt=document.getElementById('samt').value;if(!w||!amt){show('smsg','Wallet and amount required',0);return}if(!getSaved(w)){show('smsg','No device key for '+w+' on this device — use Import Key or New Key For This Address',0);return}try{var nonce=Date.now();var sig=await signMsg(w+'|'+pid+'|'+dir+'|'+parseFloat(amt)+'|'+nonce,w);var d=await J('/api/amm/swap',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({wallet:w,pool_id:pid,direction:dir,amount:amt,nonce:nonce,sig:sig})});if(d.success){show('smsg','Swapped '+d.amount_in+' → '+d.amount_out+' '+d.token_symbol+'\\nTX: '+d.tx_id+' · Block '+d.block,1);loadBal();loadPools()}else show('smsg','Swap failed: '+(d.error||'unknown'),0)}catch(e){show('smsg','Swap failed: '+(e.error||e),0)}}async function doTransfer(){var w=document.getElementById('wallet').value.trim(),to=document.getElementById('tto').value.trim(),amt=document.getElementById('tamt').value;if(!w||!to||!amt){show('tmsg','Wallet, recipient and amount required',0);return}if(!getSaved(w)){show('tmsg','No device key for '+w+' on this device — use Import Key or New Key For This Address',0);return}try{var nonce=Date.now();var sig=await signMsg(w+'|'+to+'|'+parseFloat(amt)+'|'+nonce,w);var d=await J('/api/transfer',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({from:w,to:to,amount:amt,nonce:nonce,sig:sig})});if(d.success){show('tmsg','Sent '+d.amount+' HARZ to '+to+'\\nTX: '+d.tx_id+' · Block '+d.block,1);loadBal()}else show('tmsg','Transfer failed: '+(d.error||'unknown'),0)}catch(e){show('tmsg','Transfer failed: '+(e.error||e),0)}}async function doLiq(){var w=document.getElementById('wallet').value.trim(),pid=document.getElementById('lpool').value,h=document.getElementById('lharz').value,t=document.getElementById('ltok').value;if(!w||!h||!t){show('lmsg','Wallet, HARZ and token amounts required',0);return}if(!getSaved(w)){show('lmsg','No device key for '+w+' on this device — use Import Key or New Key For This Address',0);return}try{var nonce=Date.now();var sig=await signMsg(w+'|'+pid+'|'+''+'|'+parseFloat(h)+'|'+nonce,w);var d=await J('/api/amm/liquidity',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({wallet:w,pool_id:pid,harz_amount:h,token_amount:t,nonce:nonce,sig:sig})});if(d.success){show('lmsg','Added '+d.harz_added+' HARZ + '+d.token_added+' tokens · Minted '+d.lp_minted.toFixed(4)+' LP\\nTX: '+d.tx_id,1);loadBal();loadPools()}else show('lmsg','Failed: '+(d.error||'unknown'),0)}catch(e){show('lmsg','Failed: '+(e.error||e),0)}}async function doWith(){var w=document.getElementById('wallet').value.trim(),pid=document.getElementById('rpool').value,lp=document.getElementById('rlp').value;if(!w||!lp){show('rmsg','Wallet and LP amount required',0);return}if(!getSaved(w)){show('rmsg','No device key for '+w+' on this device — use Import Key or New Key For This Address',0);return}try{var nonce=Date.now();var sig=await signMsg(w+'|'+pid+'|'+''+'|'+parseFloat(lp)+'|'+nonce,w);var d=await J('/api/amm/withdraw',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({wallet:w,pool_id:pid,lp_tokens:lp,nonce:nonce,sig:sig})});if(d.success){show('rmsg','Burned '+d.lp_burned+' LP → '+d.harz_returned.toFixed(4)+' HARZ + '+d.token_returned.toFixed(4)+' '+d.token_symbol+'\\nTX: '+d.tx_id,1);loadBal();loadPools()}else show('rmsg','Failed: '+(d.error||'unknown'),0)}catch(e){show('rmsg','Failed: '+(e.error||e),0)}}loadPools();keyStatus();document.getElementById('wallet').addEventListener('change',loadBal)</script><script>if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js').catch(function(){})}</script></body></html>`;

const SW = `const CACHE='harzswap-v61';
self.addEventListener('install',e=>{self.skipWaiting()});
self.addEventListener('fetch',e=>{
  const url=new URL(e.request.url);
  if(url.pathname.startsWith('/api/')){e.respondWith(fetch(e.request));return}
  e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(CACHE).then(c2=>c2.put(e.request,c));return r}).catch(()=>caches.match(e.request)));
});`;

const MANIFEST = JSON.stringify({
  name: "HARZSwap", short_name: "HARZSwap",
  start_url: "/", display: "standalone",
  background_color: "#f0f2f5", theme_color: "#f0f2f5",
  description: "HARZ honest exchange data — real pools, fixed NGN book.",
});

// ---- router ----
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });

    if (path === "/sw.js") return new Response(SW, { headers: { "Content-Type": "application/javascript" } });
    if (path === "/manifest.json") return new Response(MANIFEST, { headers: { "Content-Type": "application/manifest+json" } });
    if (path === "/" || path === "/index.html") return new Response(HTML, { headers: { "Content-Type": "text/html; charset=utf-8" } });

    if (path === "/version") return j({ version: VERSION });

    if (path === "/status" || path === "/api/status" || path === "/api/health") {
      return j({
        status: "ok", service: "HARZ Swap", version: VERSION,
        execution: "none — quote & data service only (fake execution removed in v6.0.0)",
        data_sources: { pools: "Polygon RPC (live on-chain balances/reserves)", pol: "Coinbase POL-USD", ngn: "open.er-api.com (cached 5min)", external: "Coinbase (cached 2min)" },
        book: "none — no price policy; the market dictates all prices (owner law Sep 18, 2026)",
        features: ["real-on-chain-pools", "no-price-policy", "no-fake-execution", "coinbase-cache", "pwa-light-theme"],
      });
    }

    if (path === "/api/pools") {
      const pools = await getPools();
      const lp = await getLp();
      const pol = await getPol(), ngn = await getNgn();
      const harzPool = pools.find((p) => p.pair === "HARZ/WPOL");
      const harzNgn = harzPool && harzPool.harzUSD && ngn ? harzPool.harzUSD * ngn : null;
      return j({
        success: true,
        book: null, market: "no fixed book — pool prices ARE the market (owner law Sep 18, 2026)",
        pools,
        lp,
        polUSD: pol, ngn,
        harzNgn: harzNgn ? +harzNgn.toFixed(2) : null,
        honesty: "All figures are live on-chain reads or named market feeds. No internal/synthetic pools exist.",
        asOf: new Date().toISOString(),
      });
    }

    
var L1_ERR = null;
if (path === "/api/prices") {
      const pools = await getPools();
      const pol = await getPol(), ngn = await getNgn(), ext = await getExt();
      const l1p = await l1AmmPools(env);
      const gdegPool = l1p.find((p) => p.pool_id === "GDEG/HARZ") || {};
      const nrlPool = l1p.find((p) => p.pool_id === "NRL/HARZ") || {};
      const harzPoolPol = pools.find((p) => p.pair === "HARZ/WPOL");
      const harzUsd = harzPoolPol && harzPoolPol.harzUSD ? harzPoolPol.harzUSD : null;
      const harzNgn = harzUsd && ngn ? +(harzUsd * ngn).toFixed(4) : null;
      const gdegRatio = (gdegPool.harz_reserve > 0 && gdegPool.token_reserve > 0) ? gdegPool.harz_reserve / gdegPool.token_reserve : null;
      const nrlRatio = (nrlPool.harz_reserve > 0 && nrlPool.token_reserve > 0) ? nrlPool.harz_reserve / nrlPool.token_reserve : null;
      const gdegNgn = harzNgn && gdegRatio ? +(harzNgn * gdegRatio).toFixed(2) : null;
      const nrlNgn = harzNgn && nrlRatio ? +(harzNgn * nrlRatio).toFixed(2) : null;
      return j({
        success: true, total: 3 + Object.keys(ext).length,
        policy: "none — the market dictates all prices (owner law Sep 18, 2026)",
        internal: {
          HARZ: { source: harzUsd ? "market (Polygon HARZ/WPOL pool-implied)" : "market data unavailable", ngn: harzNgn, usd: harzUsd },
          GDEG: { source: gdegNgn ? "market (L1 GDEG/HARZ pool x HARZ market NGN)" : "market data unavailable", ngn: gdegNgn, usd: gdegNgn && ngn ? +(gdegNgn / ngn).toFixed(6) : null },
          NRL: { source: nrlNgn ? "market (L1 NRL/HARZ pool x HARZ market NGN)" : "market data unavailable", ngn: nrlNgn, usd: nrlNgn && ngn ? +(nrlNgn / ngn).toFixed(6) : null },
        },
        external: ext, polUSD: pol, ngn,
        // legacy "prices" shape kept for existing consumers (e.g. harz-crypto-wallet loadPrices)
        prices: {
          HARZ: { priceUSD: harzUsd },
          GDEG: { priceUSD: gdegNgn && ngn ? gdegNgn / ngn : null },
          NRL: { priceUSD: nrlNgn && ngn ? nrlNgn / ngn : null },
          WPOL: { priceUSD: pol }, POL: { priceUSD: pol },
          ...Object.fromEntries(Object.entries(ext).map(([k, v]) => [k, { priceUSD: v }])),
        },
        asOf: new Date().toISOString(),
      });
    }

    if (path === "/api/ngn") {
      const ngn = await getNgn();
      return ngn ? j({ ngn, source: "open.er-api.com (cached 5min)", updated: new Date().toISOString() }) : j({ error: "NGN rate unavailable" }, 503);
    }

    if (path === "/api/quote") {
      const from = url.searchParams.get("from"), to = url.searchParams.get("to"), amount = url.searchParams.get("amount");
      if (!from || !to) return j({ success: false, error: "from and to required" }, 400);
      const res = await getQuote(env, from, to, amount || "1");
      return j(res.body, res.status);
    }

    if (path === "/api/swap") {
      return j({
        success: false,
        error: "This endpoint does not execute swaps. Real, signed swap execution lives on HARZ Chain: use the Swap tab of this DEX (device-key signed, executed by the HARZ Router v1 on-chain engine).",
        explanation: "The old /api/swap executed trades against in-memory synthetic pools and returned a random fake txHash. That violated the ecosystem honesty law. This service now provides honest quotes against real on-chain pools only.",
        alternatives: "Swap for real on HARZ Chain — the Swap tab on this page signs and executes through the HARZ Router v1 engine (/api/amm/* on HARZ Chain, constant-product, 0.3% fee). No third-party router exists in this stack.",
        api: "GET /api/quote?from=&to=&amount= — real quotes, always labeled with their source.",
      }, 410);
    }

    return j({ error: "not found", service: "HARZ Swap v" + VERSION }, 404);
  },
};

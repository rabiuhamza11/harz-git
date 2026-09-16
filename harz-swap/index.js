// ============================================================
// harzswap v4.0.0 — HONEST REBUILD
// - Real on-chain pool data only (Polygon RPC, balanceOf/getReserves)
// - Fixed policy book: 1 GDEG = NGN 15, 1 NRL = NGN 100 (administered law)
// - HARZ price = live market (QuickSwap V3 Algebra pool HARZ/WPOL)
// - Fake swap execution REMOVED (was: random txHash + "status: executed")
// - No invented reserves. No synthetic pools. Every number carries its source.
// Deployed: harz-swap.harz.workers.dev
// ============================================================

const VERSION = "4.0.0";

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
// ---- administered fixed book (owner law, Sep 16 2026) ----
const BOOK = { GDEG: 15, NRL: 100 }; // NGN per token, fixed policy prices

// ---- caches ----
const cache = { pools: { d: null, t: 0 }, pol: { d: null, t: 0 }, ngn: { d: null, t: 0 }, ext: { d: null, t: 0 } };
const TTL = { pools: 60e3, pol: 60e3, ngn: 300e3, ext: 120e3 };
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
        warning: "DUST depth — pool price is NOT the ecosystem book price. Book: 1 " + key + " = NGN " + BOOK[key] + " (fixed).",
      });
    }
  }
  cache.pools = { d: out, t: Date.now() };
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
async function getQuote(from, to, amountIn) {
  const ngn = await getNgn();
  const pools = await getPools();
  const harzPool = pools.find((p) => p.pair === "HARZ/WPOL");
  const amount = parseFloat(amountIn);
  const F = from.toUpperCase(), T = to.toUpperCase();
  if (!isFinite(amount) || amount <= 0) return { status: 400, body: { success: false, error: "amount must be a positive number", supported: ["HARZ","WPOL","GDEG","NRL","NGN","USD"] } };
  if (amount > 1e12) return { status: 400, body: { success: false, error: "amount too large" } };

  const base = async (fromSym, toSym, amt) => {
    if (fromSym === toSym) return { out: amt, source: "identity", rate: 1 };
    // policy book pairs (GDEG/NRL via fixed NGN law)
    if (fromSym === "GDEG" && toSym === "NRL") return { out: (amt * BOOK.GDEG) / BOOK.NRL, source: "policy-book (fixed NGN prices)", note: "administered book: GDEG NGN 15, NRL NGN 100" };
    if (fromSym === "NRL" && toSym === "GDEG") return { out: (amt * BOOK.NRL) / BOOK.GDEG, source: "policy-book (fixed NGN prices)", note: "administered book: GDEG NGN 15, NRL NGN 100" };
    if ((fromSym === "GDEG" || fromSym === "NRL") && (toSym === "NGN" || toSym === "USD")) {
      if (!ngn) return { error: "NGN rate unavailable" };
      const usd = amt * BOOK[fromSym] / ngn;
      return { out: toSym === "NGN" ? amt * BOOK[fromSym] : usd, source: "policy-book (fixed NGN price)", note: "administered price, not a market pool" };
    }
    if ((fromSym === "NGN" || fromSym === "USD") && (toSym === "GDEG" || toSym === "NRL")) {
      if (!ngn) return { error: "NGN rate unavailable" };
      const ngnVal = fromSym === "NGN" ? amt : amt * ngn;
      return { out: ngnVal / BOOK[toSym], source: "policy-book (fixed NGN price)", note: "administered price, not a market pool" };
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
        return { out: fmt18(outWei), source: "on-chain V2 AMM (exact math, 0.30% fee)", warning: "DUST pool — real fills at this depth are tiny; book price for " + sym + " is NGN " + BOOK[sym] };
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
const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<meta name="theme-color" content="#f0f2f5">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="HARZSwap">
<meta name="description" content="HARZSwap — honest exchange data: real on-chain pools, fixed NGN book.">
<link rel="manifest" href="/manifest.json">
<title>HARZSwap — Honest Data</title>
<style>
*{margin:0;padding:0;box-sizing:border-box;font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif}
body{background:#f0f2f5;color:#1a1a2e;padding-bottom:32px}
.top{background:#ffffff;border-bottom:1px solid #e2e4ea;padding:14px 16px;display:flex;justify-content:space-between;align-items:center}
.top h1{font-size:17px}.top .v{font-size:11px;color:#2e7d32;font-weight:700;background:#e8f5e9;padding:3px 8px;border-radius:10px}
.wrap{max-width:680px;margin:0 auto;padding:14px 14px 0}
.card{background:#fff;border:1px solid #e2e4ea;border-radius:12px;padding:14px;margin-bottom:12px}
.card h2{font-size:13px;color:#555;margin-bottom:10px;text-transform:uppercase;letter-spacing:.4px}
.law{background:#e8f5e9;border:1px solid #a5d6a7;border-radius:12px;padding:12px 14px;margin-bottom:12px}
.law .row{display:flex;justify-content:space-between;padding:6px 0;font-size:15px}
.law .row b{font-size:16px}
.law .cap{font-size:11px;color:#4c6ef5;margin-top:4px}
table{width:100%;border-collapse:collapse;font-size:13px}
th{text-align:left;color:#888;font-size:11px;padding:6px 4px;border-bottom:1px solid #e2e4ea}
td{padding:8px 4px;border-bottom:1px solid #f0f0f4;vertical-align:top}
.warn{display:inline-block;font-size:10px;color:#b45309;background:#fef3c7;padding:2px 6px;border-radius:8px;margin-top:3px}
.tag{font-size:10px;color:#2e7d32;background:#e8f5e9;padding:2px 6px;border-radius:8px}
input,select{width:100%;padding:11px;border:1px solid #d5d8e0;border-radius:8px;font-size:15px;background:#fff;margin:4px 0}
button{width:100%;padding:12px;background:#4c6ef5;color:#fff;border:none;border-radius:8px;font-size:15px;font-weight:600;margin-top:8px}
.qres{margin-top:10px;padding:10px;background:#f8f9ff;border-radius:8px;font-size:14px;display:none}
.qres .src{font-size:10px;color:#777;margin-top:6px}
.noswap{background:#fff7ed;border:1px solid #fdba74;border-radius:12px;padding:12px 14px;font-size:13px;color:#7c2d12;margin-bottom:12px}
.foot{text-align:center;font-size:11px;color:#999;padding:14px 8px}
.live{font-size:10px;color:#2e7d32}
</style>
</head>
<body>
<div class="top"><h1>HARZSwap</h1><span class="v">v4.0.0 honest</span></div>
<div class="wrap">
<div class="law">
  <div class="row"><span>GDEG</span><b>₦15.00 fixed</b></div>
  <div class="row"><span>NRL</span><b>₦100.00 fixed</b></div>
  <div class="row"><span>HARZ</span><b id="harzngn">— market</b></div>
  <div class="cap">Administered policy book (owner law) — P2P & exchange operations. Not a market pool.</div>
</div>
<div class="noswap"><b>Swap execution is not offered here.</b> This page shows real, live data only. Wallet-connected on-chain swaps ship with the V3 token rollout — until then, use QuickSwap directly. No simulated trades, no fake confirmations.</div>
<div class="card"><h2>Real on-chain pools <span class="live" id="asof"></span></h2>
<div id="pools">loading…</div></div>
<div class="card"><h2>Quote calculator (real math)</h2>
<select id="qfrom"><option>HARZ</option><option>GDEG</option><option>NRL</option><option>WPOL</option><option>NGN</option><option>USD</option></select>
<input id="qamt" inputmode="decimal" placeholder="Amount">
<select id="qto"><option>GDEG</option><option>NRL</option><option>HARZ</option><option>WPOL</option><option>NGN</option><option>USD</option></select>
<button onclick="doQuote()">Get real quote</button>
<div class="qres" id="qres"></div></div>
<div class="foot">HARZ ecosystem · internal utility exchange · data: Polygon RPC + Coinbase + open.er-api · v4.0.0</div>
</div>
<script>
async function loadPools(){
 try{
  const r=await fetch('/api/pools');const d=await r.json();
  document.getElementById('asof').textContent='· '+new Date(d.asOf).toLocaleTimeString();
  let h='<table><tr><th>Pool</th><th>Reserves (real)</th><th>Depth</th></tr>';
  for(const p of d.pools){
    let res='';
    if(p.pair==='HARZ/WPOL') res=p.reserveHARZ.toLocaleString()+' HARZ · '+p.reserveWPOL.toFixed(2)+' WPOL';
    else res=p.reserveWPOL.toFixed(2)+' WPOL · '+p.reserveToken.toLocaleString()+' '+p.pair.split('/')[0];
    h+='<tr><td><b>'+p.pair+'</b><br><span class="tag">'+p.venue.split(',')[0]+'</span></td><td>'+res+'<br><span class="warn">'+(p.pair==='HARZ/WPOL'?'entire tradable depth':'DUST — not the book price')+'</span></td><td>'+(p.depthUSD?'$'+p.depthUSD.toFixed(2):'—')+'</td></tr>';
  }
  h+='</table>';
  document.getElementById('pools').innerHTML=h;
  if(d.harzNgn) document.getElementById('harzngn').textContent='₦'+d.harzNgn.toFixed(2)+' market';
 }catch(e){document.getElementById('pools').textContent='failed to load — '+e.message}
}
async function doQuote(){
 try{
  const r=await fetch('/api/quote?from='+encodeURIComponent(document.getElementById('qfrom').value)+'&to='+encodeURIComponent(document.getElementById('qto').value)+'&amount='+encodeURIComponent(document.getElementById('qamt').value||'1'));
  const d=await r.json();const el=document.getElementById('qres');el.style.display='block';
  if(!d.success){el.innerHTML='⛔ '+d.error;return}
  el.innerHTML='<b>'+d.amountIn+' '+d.from+' → '+d.amountOut+' '+d.to+'</b><br>'+d.rate+(d.warning?'<br><span style="color:#b45309">'+d.warning+'</span>':'')+'<div class="src">'+d.source+' · '+new Date(d.asOf).toLocaleTimeString()+'</div>';
 }catch(e){document.getElementById('qres').innerHTML='error: '+e.message;document.getElementById('qres').style.display='block'}
}
loadPools();setInterval(loadPools,60000);
if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js').catch(()=>{})}
</script>
</body></html>`;

const SW = `const CACHE='harzswap-v4';
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
        execution: "none — quote & data service only (fake execution removed in v4.0.0)",
        data_sources: { pools: "Polygon RPC (live on-chain balances/reserves)", pol: "Coinbase POL-USD", ngn: "open.er-api.com (cached 5min)", external: "Coinbase (cached 2min)" },
        book: { GDEG: "NGN 15 (fixed policy)", NRL: "NGN 100 (fixed policy)", HARZ: "market (pool-implied)" },
        features: ["real-on-chain-pools", "fixed-ngn-book", "no-fake-execution", "coinbase-cache", "pwa-light-theme"],
      });
    }

    if (path === "/api/pools") {
      const pools = await getPools();
      const pol = await getPol(), ngn = await getNgn();
      const harzPool = pools.find((p) => p.pair === "HARZ/WPOL");
      const harzNgn = harzPool && harzPool.harzUSD && ngn ? harzPool.harzUSD * ngn : null;
      return j({
        success: true,
        book: { GDEG_NGN: BOOK.GDEG, NRL_NGN: BOOK.NRL, policy: "administered fixed prices — P2P/exchange book, not market pools" },
        pools,
        polUSD: pol, ngn,
        harzNgn: harzNgn ? +harzNgn.toFixed(2) : null,
        honesty: "All figures are live on-chain reads or named market feeds. No internal/synthetic pools exist.",
        asOf: new Date().toISOString(),
      });
    }

    if (path === "/api/prices") {
      const pools = await getPools();
      const pol = await getPol(), ngn = await getNgn(), ext = await getExt();
      const harzPool = pools.find((p) => p.pair === "HARZ/WPOL");
      return j({
        success: true, total: 3 + Object.keys(ext).length,
        internal: {
          HARZ: { source: "market (pool-implied)", usd: harzPool && harzPool.harzUSD || null, ngn: harzPool && harzPool.harzUSD && ngn ? +(harzPool.harzUSD * ngn).toFixed(2) : null },
          GDEG: { source: "policy-book (fixed)", ngn: BOOK.GDEG, usd: ngn ? +(BOOK.GDEG / ngn).toFixed(6) : null },
          NRL: { source: "policy-book (fixed)", ngn: BOOK.NRL, usd: ngn ? +(BOOK.NRL / ngn).toFixed(6) : null },
        },
        external: ext, polUSD: pol, ngn,
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
      const res = await getQuote(from, to, amount || "1");
      return j(res.body, res.status);
    }

    if (path === "/api/swap") {
      return j({
        success: false,
        error: "Swap execution was removed in v4.0.0 — it was never a real on-chain swap.",
        explanation: "The old /api/swap executed trades against in-memory synthetic pools and returned a random fake txHash. That violated the ecosystem honesty law. This service now provides honest quotes against real on-chain pools only.",
        alternatives: "Use QuickSwap directly for on-chain swaps (HARZ/WPOL, GDEG/WPOL, NRL/WPOL pools are all real). Wallet-connected swaps ship with the V3 token rollout.",
        api: "GET /api/quote?from=&to=&amount= — real quotes, always labeled with their source.",
      }, 410);
    }

    return j({ error: "not found", service: "HARZ Swap v" + VERSION }, 404);
  },
};

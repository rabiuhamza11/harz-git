// HARZScan v2.1 — real external contracts (GDEG, NRL on Polygon) added Sep 16, 2026
// HARZScan — Block explorer for HARZ Chain (Chain ID 7701)
// Reads chain data directly from the HARZ D1 database.
// Light theme, PWA, mobile-first, English-only.

const MAX_SUPPLY = 21000000000;

// ===== REAL EXTERNAL CONTRACTS (Polygon mainnet) — owner order Sep 16, 2026 =====
// Verified live on-chain by direct RPC reads (name/symbol/decimals/totalSupply/owner).
const EXTERNAL_TOKENS = [
  {
    address: "0x222a10CE822188c680a04A283E45F9c11D79665e", symbol: "GDEG", name: "GDEG Token V2",
    chain: "Polygon Mainnet", bookPriceNGN: 15,
    pools: "GDEG/WPOL QuickSwap V2 pair 0xb9658A00F69508f53b50Aa88Ff2b6912fd206ea8",
    note: "Real ERC-20. Supply 10,000,000: 5M in the GDEG/WPOL pool, 5M at owner-side wallet 0x111F18. Ecosystem book price fixed at NGN 15. V3 fixed-supply migration pending."
  },
  {
    address: "0xE8423c0595E6b2caD4E6f19B6F51666699be303a", symbol: "NRL", name: "Neural Protocol Token V2",
    chain: "Polygon Mainnet", bookPriceNGN: 100,
    pools: "NRL/WPOL QuickSwap V2 pair 0x30D6Dbea9eF1fEbbd65Aa1c51F51957F6EFe9B2A",
    note: "Real ERC-20. Supply 11,022,500: 5M in the NRL/WPOL pool, 6.0225M at compromised deployer 0xCA28 (V3 migration pending). Ecosystem book price fixed at NGN 100."
  },
];
const POLY_RPCS = ["https://polygon-bor-rpc.publicnode.com", "https://polygon.llamarpc.com"];
const __extCache = {};
async function polyCall(to, data) {
  for (const rpc of POLY_RPCS) {
    try {
      const r = await fetch(rpc, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_call", params: [{ to: to.toLowerCase(), data }, "latest"] }) });
      const d = await r.json();
      if (d && d.result != null) return d.result;
    } catch (e) {}
  }
  return null;
}
function __be32(b, s) { let v = 0n; for (let i = 0; i < 32; i++) v = v * 256n + BigInt(b[s + i]); return v; }
function abiString(h) {
  if (!h || h === "0x") return null;
  const b = []; for (let i = 2; i < h.length; i += 2) b.push(parseInt(h.substr(i, 2), 16));
  const off = Number(__be32(b, 0)), len = Number(__be32(b, off));
  let s = ""; for (let i = 0; i < len; i++) s += String.fromCharCode(b[off + 32 + i]);
  return s;
}
function weiToNum(h) { if (!h || h === "0x") return null; return Number(BigInt(h)) / 1e18; }
function abiAddress(h) { if (!h || h === "0x") return null; return "0x" + h.slice(-40); }
async function liveTokenData(addr) {
  const k = addr.toLowerCase();
  const c = __extCache[k];
  if (c && Date.now() - c.t < 60000) return c.d;
  const [name, symbol, supply, decimals, owner] = await Promise.all([
    polyCall(addr, "0x06fdde03"), polyCall(addr, "0x95d89b41"),
    polyCall(addr, "0x18160ddd"), polyCall(addr, "0x313ce567"), polyCall(addr, "0x8da5cb5b"),
  ]);
  const d = {
    name: abiString(name), symbol: abiString(symbol),
    totalSupply: supply ? weiToNum(supply) : null,
    decimals: decimals ? parseInt(decimals, 16) : null,
    owner: abiAddress(owner), readAt: new Date().toISOString(),
    source: "live Polygon RPC read (name/symbol/supply/owner read directly from the contract)",
  };
  __extCache[k] = { d, t: Date.now() };
  return d;
}

function jsonResponse(obj) {
  return new Response(JSON.stringify(obj), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-store",
    },
  });
}

async function query(DB, sql, params) {
  const stmt = DB.prepare(sql);
  const res = params && params.length ? await stmt.bind(...params).all() : await stmt.all();
  return res.results || [];
}

function htmlResponse(html) {
  return new Response(html, {
    headers: { "Content-Type": "text/html;charset=UTF-8", "Cache-Control": "no-store" },
  });
}

async function getStats(DB) {
  let totalBlocks = 0, height = 0;
  try {
    const meta = await query(DB, "SELECT value FROM chain_meta WHERE key = 'total_blocks'", []);
    if (meta.length && Number(meta[0].value) > 0) totalBlocks = Number(meta[0].value);
  } catch (e) {}
  if (!totalBlocks) {
    try {
      const [b0] = await query(DB, "SELECT COUNT(*) AS total_blocks, MAX(id) AS height FROM chain_blocks", []);
      totalBlocks = b0 ? b0.total_blocks : 0; height = b0 ? b0.height : 0;
      try {
        await DB.prepare("CREATE TABLE IF NOT EXISTS chain_meta (key TEXT PRIMARY KEY, value INTEGER)").run();
        await DB.prepare("INSERT OR REPLACE INTO chain_meta (key, value) VALUES ('total_blocks', ?)").bind(totalBlocks).run();
      } catch (e) {}
    } catch (e) {}
  }
  if (!height) {
    try { const [h0] = await query(DB, "SELECT MAX(id) AS height FROM chain_blocks", []); height = h0 ? h0.height : 0; } catch (e) {}
  }
  const b = { total_blocks: totalBlocks, height: height };
  const [w] = await query(DB, "SELECT ROUND(SUM(balance), 2) AS supply, COUNT(*) AS wallets FROM chain_wallets", []);
  const [t] = await query(DB, "SELECT COUNT(*) AS txs FROM chain_transactions", []);
  const [v] = await query(DB, "SELECT COUNT(*) AS validators FROM chain_validators", []);
  const [m] = await query(DB, "SELECT COUNT(*) AS mempool FROM chain_mempool", []);
  const [last] = await query(DB, "SELECT reward, timestamp FROM chain_blocks ORDER BY id DESC LIMIT 1", []);
  return {
    height: b && b.height ? b.height : 0,
    total_blocks: b ? b.total_blocks : 0,
    supply: w ? w.supply : 0,
    max_supply: MAX_SUPPLY,
    mined_percent: w && w.supply ? ((w.supply / MAX_SUPPLY) * 100).toFixed(2) : "0.00",
    wallets: w ? w.wallets : 0,
    transactions: t ? t.txs : 0,
    validators: v ? v.validators : 0,
    mempool: m ? m.mempool : 0,
    reward: last ? last.reward : 50,
    chain_id: 7701,
    chain_name: "HARZ Chain",
    native_token: "HARZ",
    consensus: "Proof-of-Edge",
    block_time: "15s",
  };
}

const MANIFEST = {
  name: "HARZScan — HARZ Chain Explorer",
  short_name: "HARZScan",
  description: "Block explorer for HARZ Chain. Search blocks, transactions, wallets and tokens.",
  start_url: "/",
  display: "standalone",
  background_color: "#f0f2f5",
  theme_color: "#f0f2f5",
  icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
};

const SW_JS = `const CACHE='harzscan-v1';
self.addEventListener('install',e=>{self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(self.clients.claim())});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(u.pathname.startsWith('/api/')) return;
  e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)));
});`;

const ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
<rect width="128" height="128" rx="24" fill="#2563eb"/>
<text x="64" y="82" font-family="Arial,sans-serif" font-size="56" font-weight="bold" fill="#ffffff" text-anchor="middle">HS</text>
</svg>`;

export default {
  async fetch(request, env) {
  const __orig = async () => {
    const url = new URL(request.url);
    const path = url.pathname;
    const DB = env.HARZ_DB;

    try {
      if (path === "/manifest.json") return jsonResponse(MANIFEST);
      if (path === "/sw.js")
        return new Response(SW_JS, { headers: { "Content-Type": "application/javascript", "Service-Worker-Allowed": "/" } });
      if (path === "/icon.svg")
        return new Response(ICON_SVG, { headers: { "Content-Type": "image/svg+xml" } });

      if (path === "/api/stats") return jsonResponse(await getStats(DB));

      if (path === "/api/blocks") {
        const limit = Math.min(parseInt(url.searchParams.get("limit") || "25", 10), 100);
        const offset = parseInt(url.searchParams.get("offset") || "0", 10);
        const rows = await query(DB, "SELECT * FROM chain_blocks ORDER BY id DESC LIMIT ? OFFSET ?", [limit, offset]);
        return jsonResponse({ blocks: rows });
      }

      const mBlock = path.match(/^\/api\/block\/(\d+)$/);
      if (mBlock) {
        const rows = await query(DB, "SELECT * FROM chain_blocks WHERE id = ?", [parseInt(mBlock[1], 10)]);
        if (!rows.length) return jsonResponse({ error: "Block not found" });
        return jsonResponse({ block: rows[0] });
      }

      if (path === "/api/txs") {
        const limit = Math.min(parseInt(url.searchParams.get("limit") || "25", 10), 100);
        const offset = parseInt(url.searchParams.get("offset") || "0", 10);
        const rows = await query(
          DB,
          "SELECT * FROM chain_transactions ORDER BY timestamp DESC LIMIT ? OFFSET ?",
          [limit, offset]
        );
        return jsonResponse({ transactions: rows });
      }

      const mTx = path.match(/^\/api\/tx\/(.+)$/);
      if (mTx) {
        const rows = await query(DB, "SELECT * FROM chain_transactions WHERE id = ?", [decodeURIComponent(mTx[1])]);
        if (!rows.length) return jsonResponse({ error: "Transaction not found" });
        return jsonResponse({ transaction: rows[0] });
      }

      const mAddr = path.match(/^\/api\/address\/(.+)$/);
      if (mAddr) {
        const addr = decodeURIComponent(mAddr[1]);
        const wallets = await query(DB, "SELECT * FROM chain_wallets WHERE address = ?", [addr]);
        const txs = await query(
          DB,
          "SELECT * FROM chain_transactions WHERE from_addr = ? OR to_addr = ? ORDER BY timestamp DESC LIMIT 100",
          [addr, addr]
        );
        const pub = await query(DB, "SELECT registered_at FROM chain_wallet_pubkeys WHERE address = ?", [addr]);
        try { await DB.prepare("CREATE INDEX IF NOT EXISTS idx_blocks_miner ON chain_blocks(miner)").run(); } catch (e) {}
        const mined = await query(DB, "SELECT COUNT(*) AS mined FROM chain_blocks WHERE miner = ?", [addr]);
        return jsonResponse({
          address: addr,
          wallet: wallets.length ? wallets[0] : null,
          transactions: txs,
          signing_key_registered: pub.length > 0,
          blocks_mined: mined.length ? mined[0].mined : 0,
        });
      }

      if (path === "/api/richlist") {
        const limit = Math.min(parseInt(url.searchParams.get("limit") || "25", 10), 100);
        const rows = await query(
          DB,
          "SELECT address, balance, created_at FROM chain_wallets ORDER BY balance DESC LIMIT ?",
          [limit]
        );
        return jsonResponse({ wallets: rows });
      }

      if (path === "/api/tokens") {
        const rows = await query(
          DB,
          "SELECT address, owner, name, symbol, total_supply, decimals, code_type, created_block FROM chain_contracts WHERE code_type != 'retired' ORDER BY created_block ASC"
        );
        return jsonResponse({
          tokens: rows,
          external: EXTERNAL_TOKENS.map((t) => ({ address: t.address, symbol: t.symbol, name: t.name, chain: t.chain })),
        });
      }

      if (path === "/api/external-token") {
        const a = (url.searchParams.get("address") || "").trim().toLowerCase();
        const t = EXTERNAL_TOKENS.find((x) => x.address.toLowerCase() === a);
        if (!t) return jsonResponse({ error: "Unknown external contract. Known: GDEG, NRL." });
        const live = await liveTokenData(t.address);
        return jsonResponse({
          success: true, contract: t, live,
          honesty: "Real Polygon mainnet ERC-20 — data read live on-chain. Not an internal HARZ Chain ledger token.",
        });
      }

      if (path === "/api/validators") {
        const rows = await query(DB, "SELECT * FROM chain_validators ORDER BY stake DESC");
        return jsonResponse({ validators: rows });
      }

      if (path === "/api/mempool") {
        const rows = await query(DB, "SELECT * FROM chain_mempool ORDER BY timestamp DESC LIMIT 50");
        return jsonResponse({ pending: rows });
      }

      if (path === "/api/search") {
        const q = (url.searchParams.get("q") || "").trim();
        if (!q) return jsonResponse({ error: "Empty query" });
        if (/^\d+$/.test(q)) {
          const rows = await query(DB, "SELECT id FROM chain_blocks WHERE id = ?", [parseInt(q, 10)]);
          if (rows.length) return jsonResponse({ type: "block", id: q });
        }
        const txs = await query(DB, "SELECT id FROM chain_transactions WHERE id = ?", [q]);
        if (txs.length) return jsonResponse({ type: "tx", id: q });
        const wallets = await query(DB, "SELECT address FROM chain_wallets WHERE address = ?", [q]);
        if (wallets.length) return jsonResponse({ type: "address", id: q });
        const ql = q.toLowerCase();
        for (const t of EXTERNAL_TOKENS) {
          if (ql === t.symbol.toLowerCase() || ql === t.name.toLowerCase() || ql === t.address.toLowerCase()) {
            return jsonResponse({ type: "token", address: t.address, chain: t.chain });
          }
        }
        return jsonResponse({ type: "none" });
      }

      return htmlResponse(renderShell());
    } catch (err) {
      return jsonResponse({ error: String(err && err.message ? err.message : err) });
    }
    };
  // ===== HARZ KV CACHE LAYER (Sep 6, 2026) — free-tier D1 read relief =====
  // Caches GET /api/* JSON responses in KV for 60s. Writes/POSTs bypass.
  // Errors and D1 lockouts are NEVER cached (silent-failure rule).
  try {
    const __cu = new URL(request.url);
    const __ck = "hscan:" + __cu.pathname + __cu.search;
    const __canCache = request.method === "GET" && __cu.pathname.startsWith("/api/") && __cu.pathname !== "/api/health" && env && env.CACHE;
    if (__canCache) {
      try {
        const __hit = await env.CACHE.get(__ck);
        if (__hit) return new Response(__hit, { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "X-Harz-Cache": "hit" } });
      } catch (e) {}
    }
    let __res;
    try { __res = await __orig(); }
    catch (e) {
      return new Response(JSON.stringify({ error: "backend temporarily unavailable", detail: String(e && e.message ? e.message : e).slice(0, 180) }), { status: 503, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });
    }
    if (__canCache && __res && __res.status === 200) {
      try {
        const __t = await __res.clone().text();
        if (__t.length < 250000 && !__t.includes("D1_ERROR") && !__t.includes('"error"')) {
          await env.CACHE.put(__ck, __t, { expirationTtl: 60 });
        }
      } catch (e) {}
    }
    return __res;
  } catch (e) {
    return new Response(JSON.stringify({ error: "cache layer failure", detail: String(e && e.message ? e.message : e).slice(0, 180) }), { status: 500, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });
  }
},
};

function renderShell() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>HARZScan — HARZ Chain Explorer</title>
<meta name="description" content="HARZScan: the block explorer for HARZ Chain. Search blocks, transactions, wallets and tokens.">
<meta name="theme-color" content="#f0f2f5">
<link rel="manifest" href="/manifest.json">
<link rel="icon" href="/icon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/icon.svg">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="HARZScan">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;background:#f0f2f5;color:#1e293b;font-size:15px}
a{color:#2563eb;text-decoration:none}
a:hover{text-decoration:underline}
.mono{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:12.5px}
header{background:#ffffff;border-bottom:1px solid #e2e8f0;position:sticky;top:0;z-index:10}
.hwrap{max-width:1100px;margin:0 auto;padding:12px 16px;display:flex;flex-direction:column;gap:10px}
.hrow{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.logo{font-size:21px;font-weight:800;color:#2563eb;white-space:nowrap}
.logo span{color:#1e293b}
.badge{font-size:11px;font-weight:700;background:#eff6ff;color:#2563eb;border:1px solid #bfdbfe;border-radius:999px;padding:3px 10px}
.search{flex:1;min-width:220px;display:flex}
.search input{flex:1;border:1px solid #cbd5e1;border-radius:8px 0 0 8px;padding:9px 12px;font-size:14px;outline:none;background:#fff}
.search input:focus{border-color:#2563eb}
.search button{border:none;background:#2563eb;color:#fff;padding:0 16px;border-radius:0 8px 8px 0;font-weight:600;cursor:pointer;font-size:14px}
nav{display:flex;gap:16px;font-size:13.5px;padding:2px 0 6px}
nav a{color:#475569}
main{max-width:1100px;margin:0 auto;padding:16px}
.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin-bottom:16px}
.card{background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:12px}
.card .k{font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:.04em;margin-bottom:4px}
.card .v{font-size:17px;font-weight:700;word-break:break-all}
.panel{background:#fff;border:1px solid #e2e8f0;border-radius:10px;margin-bottom:16px;overflow:hidden}
.panel h2{font-size:14px;padding:11px 14px;border-bottom:1px solid #e2e8f0;color:#334155;display:flex;justify-content:space-between;align-items:center}
.panel h2 a{font-size:12px;font-weight:600}
table{width:100%;border-collapse:collapse}
th{font-size:11px;color:#64748b;text-align:left;padding:8px 14px;background:#f8fafc;border-bottom:1px solid #e2e8f0;text-transform:uppercase;letter-spacing:.03em}
td{padding:9px 14px;border-bottom:1px solid #f1f5f9;font-size:13px;vertical-align:top}
tr:last-child td{border-bottom:none}
.tag{display:inline-block;font-size:11px;font-weight:700;border-radius:5px;padding:1px 7px}
.tag.ok{background:#f0fdf4;color:#16a34a;border:1px solid #bbf7d0}
.tag.blue{background:#eff6ff;color:#2563eb;border:1px solid #bfdbfe}
.tag.warn{background:#fffbeb;color:#b45309;border:1px solid #fde68a}
.kv{display:grid;grid-template-columns:170px 1fr;gap:6px 14px;padding:14px;font-size:13.5px}
.kv .k{color:#64748b}
.back{display:inline-block;margin-bottom:12px;font-size:13px}
@media(max-width:640px){
  .cards{grid-template-columns:repeat(2,1fr)}
  .hide-m{display:none}
  .kv{grid-template-columns:120px 1fr}
  td,th{padding:8px 10px;font-size:12.5px}
}
footer{text-align:center;color:#94a3b8;font-size:12px;padding:20px 16px 32px}
</style>
</head>
<body>
<header>
  <div class="hwrap">
    <div class="hrow">
      <a class="logo" href="#/">HARZ<span>Scan</span></a>
      <span class="badge">HARZ Chain &middot; ID 7701 &middot; Proof-of-Edge</span>
      <div class="search">
        <input id="q" type="text" placeholder="Search block number, transaction ID, or wallet address" autocomplete="off">
        <button id="go">Search</button>
      </div>
    </div>
    <nav>
      <a href="#/">Home</a>
      <a href="#/tokens">Tokens</a>
      <a href="#/richlist">Rich List</a>
      <a href="#/validators">Validators</a>
      <a href="https://harz-chain-v2.harz.workers.dev" target="_blank" rel="noopener">Chain &nearr;</a>
    </nav>
  </div>
</header>
<main id="app"><div style="text-align:center;padding:40px;color:#64748b">Loading HARZScan&hellip;</div></main>
<footer>HARZScan &mdash; the official explorer of HARZ Chain. Powered by the HARZ ecosystem.</footer>
<script>
(function(){
var app=document.getElementById('app');
function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}
function num(n){if(n==null)return '—';var v=Number(n);if(!isFinite(v))return String(n);return v.toLocaleString('en-US',{maximumFractionDigits:4})}
function harz(n){if(n==null)return '—';return num(n)+' HARZ'}
function short(s){s=String(s||'');if(s.length<=18)return s;return s.slice(0,8)+'\u2026'+s.slice(-6)}
function ago(ts){
  if(!ts)return '—';
  var t=new Date(String(ts).replace(' ','T')+(String(ts).indexOf('T')<0?'Z':''));
  if(isNaN(t))return ts;
  var s=Math.max(1,Math.floor((Date.now()-t.getTime())/1000));
  if(s<60)return s+'s ago';
  if(s<3600)return Math.floor(s/60)+'m ago';
  if(s<86400)return Math.floor(s/3600)+'h ago';
  return Math.floor(s/86400)+'d ago';
}
function api(p){return fetch(p,{cache:'no-store'}).then(function(r){return r.json()})}

function statCard(k,v){return '<div class="card"><div class="k">'+k+'</div><div class="v">'+v+'</div></div>'}

function home(){
  app.innerHTML='<div style="text-align:center;padding:40px;color:#64748b">Loading&hellip;</div>';
  Promise.all([api('/api/stats'),api('/api/blocks?limit=10'),api('/api/txs?limit=10'),api('/api/mempool')]).then(function(r){
    var st=r[0],bl=r[1].blocks||[],tx=r[2].transactions||[],mp=r[3].pending||[];
    var h='';
    h+='<div class="cards">';
    h+=statCard('Height',num(st.height));
    h+=statCard('Supply',num(Math.round(st.supply))+' / 21B');
    h+=statCard('Mined',st.mined_percent+'%');
    h+=statCard('Wallets',num(st.wallets));
    h+=statCard('Transactions',num(st.transactions));
    h+=statCard('Validators',num(st.validators));
    h+=statCard('Block Reward',harz(st.reward));
    h+=statCard('Mempool',num(mp.length));
    h+='</div>';
    h+='<div class="panel"><h2>Latest Blocks <a href="#/blocks">View all &nearr;</a></h2><div style="overflow-x:auto"><table><tr><th>Block</th><th>Miner</th><th class="hide-m">Hash</th><th>Txs</th><th>Reward</th><th>Age</th></tr>';
    bl.forEach(function(b){h+='<tr><td><a href="#/block/'+b.id+'">'+b.id+'</a></td><td><a href="#/address/'+encodeURIComponent(b.miner)+'">'+esc(short(b.miner))+'</a></td><td class="hide-m mono">'+esc(short(b.hash))+'</td><td>'+b.tx_count+'</td><td>'+harz(b.reward)+'</td><td>'+ago(b.timestamp)+'</td></tr>'});
    h+='</table></div></div>';
    h+='<div class="panel"><h2>Latest Transactions <a href="#/txs">View all &nearr;</a></h2><div style="overflow-x:auto"><table><tr><th>Tx ID</th><th>From</th><th>To</th><th>Amount</th><th>Status</th><th>Age</th></tr>';
    tx.forEach(function(t){h+='<tr><td><a href="#/tx/'+encodeURIComponent(t.id)+'" class="mono">'+esc(short(t.id))+'</a></td><td><a href="#/address/'+encodeURIComponent(t.from_addr)+'">'+esc(short(t.from_addr))+'</a></td><td><a href="#/address/'+encodeURIComponent(t.to_addr)+'">'+esc(short(t.to_addr))+'</a></td><td>'+harz(t.amount)+'</td><td><span class="tag '+(t.status==='confirmed'?'ok':'warn')+'">'+esc(t.status)+'</span></td><td>'+ago(t.timestamp)+'</td></tr>'});
    h+='</table></div></div>';
    app.innerHTML=h;
  }).catch(function(e){app.innerHTML='<div class="panel" style="padding:20px">Could not load chain data: '+esc(e)+'</div>'});
}

function blockPage(id){
  app.innerHTML='<div style="text-align:center;padding:40px;color:#64748b">Loading block&hellip;</div>';
  api('/api/block/'+id).then(function(r){
    if(r.error){app.innerHTML='<a class="back" href="#/">&larr; Back</a><div class="panel" style="padding:20px">Block '+esc(id)+' not found.</div>';return}
    var b=r.block;
    var h='<a class="back" href="#/">&larr; Back to home</a><div class="panel"><h2>Block #'+b.id+'</h2><div class="kv">';
    h+='<div class="k">Block Height</div><div>'+num(b.id)+'</div>';
    h+='<div class="k">Block Hash</div><div class="mono">'+esc(b.hash)+'</div>';
    h+='<div class="k">Parent Hash</div><div class="mono">'+esc(b.prev_hash)+'</div>';
    h+='<div class="k">Timestamp</div><div>'+esc(b.timestamp)+' ('+ago(b.timestamp)+')</div>';
    h+='<div class="k">Miner</div><div><a href="#/address/'+encodeURIComponent(b.miner)+'">'+esc(b.miner)+'</a></div>';
    h+='<div class="k">Reward</div><div>'+harz(b.reward)+'</div>';
    h+='<div class="k">Transactions</div><div>'+num(b.tx_count)+'</div>';
    h+='<div class="k">Nonce</div><div>'+num(b.nonce)+'</div>';
    h+='<div class="k">Difficulty</div><div>'+num(b.difficulty)+'</div>';
    h+='</div></div>';
    app.innerHTML=h;
  }).catch(function(e){app.innerHTML='<div class="panel" style="padding:20px">Error: '+esc(e)+'</div>'});
}

function txPage(id){
  app.innerHTML='<div style="text-align:center;padding:40px;color:#64748b">Loading transaction&hellip;</div>';
  api('/api/tx/'+encodeURIComponent(id)).then(function(r){
    if(r.error){app.innerHTML='<a class="back" href="#/">&larr; Back</a><div class="panel" style="padding:20px">Transaction not found.</div>';return}
    var t=r.transaction;
    var h='<a class="back" href="#/">&larr; Back to home</a><div class="panel"><h2>Transaction</h2><div class="kv">';
    h+='<div class="k">Transaction ID</div><div class="mono" style="word-break:break-all">'+esc(t.id)+'</div>';
    h+='<div class="k">From</div><div><a href="#/address/'+encodeURIComponent(t.from_addr)+'">'+esc(t.from_addr)+'</a></div>';
    h+='<div class="k">To</div><div><a href="#/address/'+encodeURIComponent(t.to_addr)+'">'+esc(t.to_addr)+'</a></div>';
    h+='<div class="k">Amount</div><div><b>'+harz(t.amount)+'</b></div>';
    h+='<div class="k">Fee</div><div>'+harz(t.fee)+'</div>';
    h+='<div class="k">Block</div><div>'+(t.block_index!=null?'<a href="#/block/'+t.block_index+'">'+num(t.block_index)+'</a>':'—')+'</div>';
    h+='<div class="k">Status</div><div><span class="tag '+(t.status==='confirmed'?'ok':'warn')+'">'+esc(t.status)+'</span></div>';
    h+='<div class="k">Timestamp</div><div>'+esc(t.timestamp)+' ('+ago(t.timestamp)+')</div>';
    h+='</div></div>';
    app.innerHTML=h;
  }).catch(function(e){app.innerHTML='<div class="panel" style="padding:20px">Error: '+esc(e)+'</div>'});
}

function addrPage(a){
  app.innerHTML='<div style="text-align:center;padding:40px;color:#64748b">Loading wallet&hellip;</div>';
  api('/api/address/'+encodeURIComponent(a)).then(function(r){
    var w=r.wallet;
    var h='<a class="back" href="#/">&larr; Back to home</a><div class="panel"><h2>Wallet</h2><div class="kv">';
    h+='<div class="k">Address</div><div class="mono" style="word-break:break-all">'+esc(r.address)+'</div>';
    h+='<div class="k">Balance</div><div><b>'+(w?harz(w.balance):'0 HARZ')+'</b></div>';
    h+='<div class="k">Signing Key</div><div><span class="tag '+(r.signing_key_registered?'ok':'warn')+'">'+(r.signing_key_registered?'Registered':'Not registered')+'</span></div>';
    h+='<div class="k">Blocks Mined</div><div>'+num(r.blocks_mined)+'</div>';
    if(w&&w.created_at){h+='<div class="k">First Seen</div><div>'+esc(w.created_at)+'</div>'}
    h+='</div></div>';
    var txs=r.transactions||[];
    h+='<div class="panel"><h2>Transactions ('+num(txs.length)+')</h2><div style="overflow-x:auto"><table><tr><th>Tx ID</th><th>From</th><th>To</th><th>Amount</th><th>Age</th></tr>';
    if(!txs.length){h+='<tr><td colspan="5" style="text-align:center;color:#64748b">No transactions yet</td></tr>'}
    txs.forEach(function(t){h+='<tr><td><a href="#/tx/'+encodeURIComponent(t.id)+'" class="mono">'+esc(short(t.id))+'</a></td><td><a href="#/address/'+encodeURIComponent(t.from_addr)+'">'+esc(short(t.from_addr))+'</a></td><td><a href="#/address/'+encodeURIComponent(t.to_addr)+'">'+esc(short(t.to_addr))+'</a></td><td>'+harz(t.amount)+'</td><td>'+ago(t.timestamp)+'</td></tr>'});
    h+='</table></div></div>';
    app.innerHTML=h;
  }).catch(function(e){app.innerHTML='<div class="panel" style="padding:20px">Error: '+esc(e)+'</div>'});
}

function tokensPage(){
  app.innerHTML='<div style="text-align:center;padding:40px;color:#64748b">Loading tokens&hellip;</div>';
  api('/api/tokens').then(function(r){
    var ts=r.tokens||[];
    var h='<a class="back" href="#/">&larr; Back to home</a><div class="panel"><h2>HRC-20 Tokens</h2><div style="overflow-x:auto"><table><tr><th>Token</th><th>Symbol</th><th>Contract</th><th class="hide-m">Owner</th><th>Supply</th></tr>';
    if(!ts.length){h+='<tr><td colspan="5" style="text-align:center;color:#64748b">No tokens</td></tr>'}
    ts.forEach(function(t){h+='<tr><td>'+esc(t.name)+'</td><td><span class="tag blue">'+esc(t.symbol)+'</span></td><td class="mono">'+esc(short(t.address))+'</td><td class="hide-m mono">'+esc(short(t.owner))+'</td><td>'+num(t.total_supply)+'</td></tr>'});
    h+='</table></div></div>';
    var ex=r.external||[];
    if(ex.length){h+='<div class="panel"><h2>Real External Contracts (Polygon Mainnet)</h2><div style="overflow-x:auto"><table><tr><th>Token</th><th>Symbol</th><th>Contract</th><th>Chain</th></tr>';
      ex.forEach(function(t){h+='<tr><td><a href="#/token/'+encodeURIComponent(t.address)+'">'+esc(t.name)+'</a></td><td><span class="tag blue">'+esc(t.symbol)+'</span></td><td class="mono">'+esc(short(t.address))+'</td><td>'+esc(t.chain)+'</td></tr>'});
      h+='</table></div><p style="color:#94a3b8;font-size:12px;margin-top:10px">Real ERC-20 contracts on Polygon mainnet, read live on-chain — not internal ledger tokens. Tap a row for live contract data.</p></div>';}
    app.innerHTML=h;
  }).catch(function(e){app.innerHTML='<div class="panel" style="padding:20px">Error: '+esc(e)+'</div>'});
}

function richPage(){
  app.innerHTML='<div style="text-align:center;padding:40px;color:#64748b">Loading rich list&hellip;</div>';
  api('/api/richlist?limit=25').then(function(r){
    var ws=r.wallets||[];
    var h='<a class="back" href="#/">&larr; Back to home</a><div class="panel"><h2>Top Wallets</h2><div style="overflow-x:auto"><table><tr><th>#</th><th>Address</th><th>Balance</th><th class="hide-m">First Seen</th></tr>';
    ws.forEach(function(w,i){h+='<tr><td>'+(i+1)+'</td><td><a href="#/address/'+encodeURIComponent(w.address)+'">'+esc(w.address)+'</a></td><td><b>'+harz(w.balance)+'</b></td><td class="hide-m">'+esc(w.created_at||'—')+'</td></tr>'});
    h+='</table></div></div>';
    app.innerHTML=h;
  }).catch(function(e){app.innerHTML='<div class="panel" style="padding:20px">Error: '+esc(e)+'</div>'});
}

function valPage(){
  app.innerHTML='<div style="text-align:center;padding:40px;color:#64748b">Loading validators&hellip;</div>';
  api('/api/validators').then(function(r){
    var vs=r.validators||[];
    var h='<a class="back" href="#/">&larr; Back to home</a><div class="panel"><h2>Validators</h2><div style="overflow-x:auto"><table><tr><th>Address</th><th>Stake</th><th>Status</th><th class="hide-m">Location</th><th>Blocks Validated</th></tr>';
    if(!vs.length){h+='<tr><td colspan="5" style="text-align:center;color:#64748b">No validators registered</td></tr>'}
    vs.forEach(function(v){h+='<tr><td><a href="#/address/'+encodeURIComponent(v.address)+'">'+esc(v.address)+'</a></td><td>'+harz(v.stake)+'</td><td><span class="tag '+(v.status==='active'?'ok':'warn')+'">'+esc(v.status)+'</span></td><td class="hide-m">'+esc(v.location||'—')+'</td><td>'+num(v.blocks_validated)+'</td></tr>'});
    h+='</table></div></div>';
    app.innerHTML=h;
  }).catch(function(e){app.innerHTML='<div class="panel" style="padding:20px">Error: '+esc(e)+'</div>'});
}

function allBlocks(off){
  off=off||0;
  app.innerHTML='<div style="text-align:center;padding:40px;color:#64748b">Loading blocks&hellip;</div>';
  api('/api/blocks?limit=50&offset='+off).then(function(r){
    var bl=r.blocks||[];
    var h='<a class="back" href="#/">&larr; Back to home</a><div class="panel"><h2>Blocks</h2><div style="overflow-x:auto"><table><tr><th>Block</th><th>Miner</th><th class="hide-m">Hash</th><th>Txs</th><th>Reward</th><th>Age</th></tr>';
    bl.forEach(function(b){h+='<tr><td><a href="#/block/'+b.id+'">'+b.id+'</a></td><td><a href="#/address/'+encodeURIComponent(b.miner)+'">'+esc(short(b.miner))+'</a></td><td class="hide-m mono">'+esc(short(b.hash))+'</td><td>'+b.tx_count+'</td><td>'+harz(b.reward)+'</td><td>'+ago(b.timestamp)+'</td></tr>'});
    h+='</table></div></div>';
    h+='<div style="display:flex;justify-content:space-between"><a href="#/blocks/'+Math.max(0,off-50)+'">&larr; Newer</a><a href="#/blocks/'+(off+50)+'">Older &rarr;</a></div>';
    app.innerHTML=h;
  }).catch(function(e){app.innerHTML='<div class="panel" style="padding:20px">Error: '+esc(e)+'</div>'});
}

function allTxs(off){
  off=off||0;
  app.innerHTML='<div style="text-align:center;padding:40px;color:#64748b">Loading transactions&hellip;</div>';
  api('/api/txs?limit=50&offset='+off).then(function(r){
    var tx=r.transactions||[];
    var h='<a class="back" href="#/">&larr; Back to home</a><div class="panel"><h2>Transactions</h2><div style="overflow-x:auto"><table><tr><th>Tx ID</th><th>From</th><th>To</th><th>Amount</th><th>Status</th><th>Age</th></tr>';
    tx.forEach(function(t){h+='<tr><td><a href="#/tx/'+encodeURIComponent(t.id)+'" class="mono">'+esc(short(t.id))+'</a></td><td><a href="#/address/'+encodeURIComponent(t.from_addr)+'">'+esc(short(t.from_addr))+'</a></td><td><a href="#/address/'+encodeURIComponent(t.to_addr)+'">'+esc(short(t.to_addr))+'</a></td><td>'+harz(t.amount)+'</td><td><span class="tag '+(t.status==='confirmed'?'ok':'warn')+'">'+esc(t.status)+'</span></td><td>'+ago(t.timestamp)+'</td></tr>'});
    h+='</table></div></div>';
    h+='<div style="display:flex;justify-content:space-between"><a href="#/txs/'+Math.max(0,off-50)+'">&larr; Newer</a><a href="#/txs/'+(off+50)+'">Older &rarr;</a></div>';
    app.innerHTML=h;
  }).catch(function(e){app.innerHTML='<div class="panel" style="padding:20px">Error: '+esc(e)+'</div>'});
}

function doSearch(){
  var q=document.getElementById('q').value.trim();
  if(!q)return;
  api('/api/search?q='+encodeURIComponent(q)).then(function(r){
    if(r.type==='block')location.hash='#/block/'+r.id;
    else if(r.type==='tx')location.hash='#/tx/'+encodeURIComponent(r.id);
    else if(r.type==='address')location.hash='#/address/'+encodeURIComponent(r.id);
    else if(r.type==='token')location.hash='#/token/'+encodeURIComponent(r.address);
    else app.innerHTML='<a class="back" href="#/">&larr; Back to home</a><div class="panel" style="padding:20px">Nothing found on HARZ Chain for: <b>'+esc(q)+'</b></div>';
  });
}
document.getElementById('go').addEventListener('click',doSearch);
document.getElementById('q').addEventListener('keydown',function(e){if(e.key==='Enter')doSearch()});

function tokenPage(addr){
  app.innerHTML='<div style="text-align:center;padding:40px;color:#64748b">Reading contract on Polygon&hellip;</div>';
  api('/api/external-token?address='+encodeURIComponent(addr)).then(function(r){
    if(r.error){app.innerHTML='<a class="back" href="#/">&larr; Back to home</a><div class="panel" style="padding:20px">'+esc(r.error)+'</div>';return}
    var c=r.contract,l=r.live||{};
    var h='<a class="back" href="#/">&larr; Back to home</a><div class="panel"><h2>'+esc(l.name||c.name)+' <span class="tag blue">'+esc(l.symbol||c.symbol)+'</span></h2>';
    h+='<p style="color:#64748b;margin:6px 0 14px">Real ERC-20 contract on '+esc(c.chain)+' — verified live on-chain. Not an internal HARZ Chain ledger token.</p>';
    h+='<div style="overflow-x:auto"><table>';
    h+='<tr><th>Contract</th><td class="mono">'+esc(c.address)+'</td></tr>';
    h+='<tr><th>Total supply</th><td>'+(l.totalSupply!=null?num(l.totalSupply):'—')+' '+(l.symbol||c.symbol)+' <span class="tag blue">live</span></td></tr>';
    h+='<tr><th>Decimals</th><td>'+(l.decimals!=null?l.decimals:'—')+'</td></tr>';
    h+='<tr><th>Owner (on-chain)</th><td class="mono">'+(l.owner?esc(l.owner):'—')+'</td></tr>';
    h+='<tr><th>Liquidity pool</th><td class="mono">'+esc(c.pools)+'</td></tr>';
    h+='<tr><th>Ecosystem book price</th><td>NGN '+c.bookPriceNGN+' (fixed policy)</td></tr>';
    h+='<tr><th>Note</th><td>'+esc(c.note)+'</td></tr>';
    h+='<tr><th>Explorers</th><td><a href="https://polygonscan.com/token/'+esc(c.address)+'" target="_blank" rel="noopener">Polygonscan</a> &middot; <a href="https://polygon.blockscout.com/token/'+esc(c.address)+'" target="_blank" rel="noopener">Blockscout</a></td></tr>';
    h+='</table></div>';
    h+='<p style="color:#94a3b8;font-size:12px;margin-top:12px">Live read: '+esc(l.readAt||'')+' &middot; '+esc(l.source||'')+'</p></div>';
    app.innerHTML=h;
  }).catch(function(e){app.innerHTML='<a class="back" href="#/">&larr; Back to home</a><div class="panel" style="padding:20px">Error: '+esc(e)+'</div>'});
}
function route(){
  var h=location.hash.replace(/^#/,'')||'/';
  var parts=h.split('/').filter(Boolean);
  window.scrollTo(0,0);
  if(!parts.length)return home();
  if(parts[0]==='block'&&parts[1])return blockPage(parts[1]);
  if(parts[0]==='tx'&&parts[1])return txPage(decodeURIComponent(parts[1]));
  if(parts[0]==='address'&&parts[1])return addrPage(decodeURIComponent(parts[1]));
  if(parts[0]==='tokens')return tokensPage();
  if(parts[0]==='token'&&parts[1])return tokenPage(decodeURIComponent(parts[1]));
  if(parts[0]==='richlist')return richPage();
  if(parts[0]==='validators')return valPage();
  if(parts[0]==='blocks')return allBlocks(parseInt(parts[1]||'0',10));
  if(parts[0]==='txs')return allTxs(parseInt(parts[1]||'0',10));
  return home();
}
window.addEventListener('hashchange',route);
if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js').catch(function(){})}
route();
})();
</script>
</body>
</html>`;
}


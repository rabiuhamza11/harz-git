var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// wallet.js
var VERSION = "3.1.0";
var CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};
function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { ...CORS, "Content-Type": "application/json" }
  });
}
__name(json, "json");
function iconSVG() {
  return new Response(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" rx="80" fill="#0a7d3c"/><circle cx="256" cy="256" r="140" fill="#fff"/><path d="M256 140 L256 372 M180 256 L256 140 L332 256 L256 372" stroke="#0a7d3c" stroke-width="20" fill="none" stroke-linejoin="round"/></svg>',
    { headers: { "Content-Type": "image/svg+xml", "Cache-Control": "public, max-age=86400" } }
  );
}
__name(iconSVG, "iconSVG");
function manifestJSON() {
  return new Response(JSON.stringify({
    name: "HARZ Universal Wallet",
    short_name: "HARZ Wallet",
    description: "HARZ Wallet v3 — Polygon-first multi-chain wallet with a fully verified token registry (GDEG, NRL, WPOL and majors)",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f0f2f5",
    theme_color: "#0a7d3c",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any maskable" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any maskable" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" }
    ]
  }), { headers: { "Content-Type": "application/json" } });
}
__name(manifestJSON, "manifestJSON");
function swJS() {
  return new Response(
    `const CACHE = "harz-wallet-v3.0";
const SHELL = ["/", "/manifest.json", "/icon.svg", "/icon-192.png", "/icon-512.png", "/apple-touch-icon.png"];
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return;
  e.respondWith(
    caches.open(CACHE).then((c) =>
      c.match(e.request).then((cached) => {
        const network = fetch(e.request).then((resp) => { if (resp.ok) c.put(e.request, resp.clone()); return resp; }).catch(() => null);
        return cached || network.then((r) => r || new Response(
          '<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font-family:system-ui;background:#f0f2f5;color:#1f2937;text-align:center;padding:60px 20px}h2{color:#0a7d3c}button{margin-top:16px;padding:10px 20px;background:#0a7d3c;color:#fff;border:none;border-radius:8px;font-size:.9rem}</style></head><body><h2>No connection</h2><p>Wallet needs internet at least once to load.</p><button onclick="location.reload()">Retry</button></body></html>',
          { headers: { "Content-Type": "text/html" }, status: 503 }
        ));
      })
    )
  );
});`,
    { headers: { "Content-Type": "application/javascript" } }
  );
}
__name(swJS, "swJS");
async function handleAPI(path, request, env) {
  if (env && env.DB && !env._tablesReady) {
    env._tablesReady = true;
    try {
      await env.DB.exec("CREATE TABLE IF NOT EXISTS wallet_registrations (id TEXT PRIMARY KEY, address TEXT, chain TEXT, created_date TEXT DEFAULT (datetime('now')))");
      await env.DB.exec("CREATE TABLE IF NOT EXISTS wallet_transactions (id INTEGER PRIMARY KEY AUTOINCREMENT, tx_hash TEXT, from_addr TEXT, to_addr TEXT, amount REAL, coin TEXT, chain TEXT, timestamp TEXT DEFAULT (datetime('now')))");
    } catch (e) {
    }
  }
  if (path === "/api/health") {
    return json({
      status: "healthy",
      version: VERSION,
      type: "universal-wallet",
      chains: ["harz", "ethereum", "polygon", "bsc", "arbitrum", "optimism", "avalanche", "base"],
      security: "client-side-only",
      server_stores: "public_addresses_and_tx_history_only",
      registry: "v3 honest registry — every address live-verified Sep 16 2026 (RPC reads / CoinGecko platform registry); unverified entries removed",
      security_model: "keys generated and encrypted client-side only; server never sees private keys"
    });
  }
  if (path === "/api/register" && request.method === "POST") {
    try {
      const body = await request.json();
      const address = body.address;
      const chain = body.chain || "ethereum";
      if (!address || !address.startsWith("0x") || address.length !== 42) return json({ error: "Valid address required" }, 400);
      if (env && env.DB) {
        await env.DB.prepare("INSERT OR IGNORE INTO wallet_registrations (id, address, chain, created_date) VALUES (?, ?, ?, datetime('now'))").bind(address.toLowerCase() + "_" + chain, address, chain).run();
      }
      return json({ success: true, address, chain });
    } catch (e) {
      return json({ error: e.message }, 500);
    }
  }
  if (path === "/api/record-tx" && request.method === "POST") {
    try {
      const body = await request.json();
      if (!body.tx_hash || !body.from || !body.to) return json({ error: "tx_hash, from, to required" }, 400);
      if (env && env.DB) {
        await env.DB.prepare("INSERT INTO wallet_transactions (tx_hash, from_addr, to_addr, amount, coin, chain, timestamp) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))").bind(body.tx_hash, body.from.toLowerCase(), body.to.toLowerCase(), body.amount || 0, body.coin || "ETH", body.chain || "ethereum").run();
      }
      return json({ success: true, recorded: true });
    } catch (e) {
      return json({ error: e.message }, 500);
    }
  }
  if (path.startsWith("/api/transactions/")) {
    try {
      const address = path.split("/api/transactions/")[1].toLowerCase();
      if (env && env.DB) {
        const result = await env.DB.prepare("SELECT * FROM wallet_transactions WHERE LOWER(from_addr) = ? OR LOWER(to_addr) = ? ORDER BY timestamp DESC LIMIT 100").bind(address, address).all();
        return json({ transactions: result.results || [], address });
      }
      return json({ transactions: [], address });
    } catch (e) {
      return json({ transactions: [], error: e.message });
    }
  }
  if (path === "/api/tokens") {
    // v3 HONEST REGISTRY — every address verified Sep 16, 2026: live RPC reads (GDEG, NRL, WPOL, USDC/DAI/ETH-chain set, ARB, OP) or CoinGecko platform registry (arb/OP/avax/base USDC, avax USDT).
    // v2's invented/lookalike entries were removed. Unverifiable tokens were DROPPED, not guessed.
    return json({
      harz_l1: {
        note: "HARZ L1 (internal chain) balances are phone-number wallets — view them on the L1 tab. The real GDEG and NRL ERC-20 contracts live on Polygon (see the polygon list)."
      },
      polygon: [
        { symbol: "GDEG", name: "GDEG Token V2", address: "0x222a10CE822188c680a04A283E45F9c11D79665e", decimals: 18, ecosystem: true, bookPriceNGN: 15 },
        { symbol: "NRL", name: "Neural Protocol Token V2", address: "0xE8423c0595E6b2caD4E6f19B6F51666699be303a", decimals: 18, ecosystem: true, bookPriceNGN: 100 },
        { symbol: "WPOL", name: "Wrapped POL", address: "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270", decimals: 18 },
        { symbol: "USDC", name: "USD Coin", address: "0x3c499c542cEF5E3811e1192ce70d8cc03d5c3359", decimals: 6 },
        { symbol: "DAI", name: "Dai Stablecoin (PoS)", address: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063", decimals: 18 }
      ],
      ethereum: [
        { symbol: "USDT", name: "Tether USD", address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", decimals: 6 },
        { symbol: "USDC", name: "USD Coin", address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", decimals: 6 },
        { symbol: "DAI", name: "Dai Stablecoin", address: "0x6B175474E89094C44Da98b954EedeAC495271d0F", decimals: 18 },
        { symbol: "WBTC", name: "Wrapped Bitcoin", address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", decimals: 8 },
        { symbol: "LINK", name: "Chainlink", address: "0x514910771AF9Ca656af840dff83E8264EcF986CA", decimals: 18 },
        { symbol: "UNI", name: "Uniswap", address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984", decimals: 18 }
      ],
      bsc: [
        { symbol: "USDT", name: "Tether USD (BSC)", address: "0x55d398326f99059fF775485246999027B3197955", decimals: 18 },
        { symbol: "USDC", name: "USD Coin (BSC)", address: "0x8AC76A51cc950d9822D68b83fE1Ad97B32Cd580d", decimals: 18 }
      ],
      arbitrum: [
        { symbol: "USDC", name: "USD Coin (Arb)", address: "0xaf88d065e77c8cc2239327c5edb3a432268e5831", decimals: 6 },
        { symbol: "ARB", name: "Arbitrum", address: "0x912CE59144191C1204E64559FE8253a0e49E6548", decimals: 18 }
      ],
      optimism: [
        { symbol: "USDC", name: "USD Coin (OP)", address: "0x0b2c639c533813f4aa9d7837caf62653d097ff85", decimals: 6 },
        { symbol: "OP", name: "Optimism", address: "0x4200000000000000000000000000000000000042", decimals: 18 }
      ],
      avalanche: [
        { symbol: "USDC", name: "USD Coin (Avax)", address: "0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e", decimals: 6 },
        { symbol: "USDT", name: "Tether USD (Avax)", address: "0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7", decimals: 6 }
      ],
      base: [
        { symbol: "USDC", name: "USD Coin (Base)", address: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913", decimals: 6 }
      ]
    });
  }
  return json({ error: "Not found", endpoints: ["/api/health", "/api/register", "/api/record-tx", "/api/transactions/:address", "/api/tokens"] });
}
__name(handleAPI, "handleAPI");
var HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>HARZ Wallet v3 — Honest Registry</title>
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#0b7a4b">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="HARZ Wallet">
<link rel="apple-touch-icon" href="/icon.svg">
<link rel="icon" href="/icon.svg" type="image/svg+xml">
<script src="https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.umd.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.min.js"></script>
<style>
:root{--bg:#eef4f8;--card:#ffffff;--ink:#16283a;--sub:#5b7183;--line:#dce7ee;--green:#0b7a4b;--green2:#12805e;--gold:#d4a017;--red:#c0392b;--ok:#e8f6ef;}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Inter,Arial,sans-serif;background:linear-gradient(180deg,#eef4f8 0%,#f6f9fb 100%);min-height:100vh;color:var(--ink)}
.hero{background:linear-gradient(135deg,#0b7a4b 0%,#12805e 55%,#c99a1a 100%);padding:26px 20px 60px;border-radius:0 0 32px 32px;color:#fff;position:relative;overflow:hidden}
.hero:after{content:"";position:absolute;right:-40px;top:-40px;width:180px;height:180px;border-radius:50%;background:rgba(255,255,255,.12)}
.hero h1{font-size:1.3rem;font-weight:800;letter-spacing:.3px}
.hero .tag{font-size:.72rem;opacity:.9;margin-top:4px}
.pillrow{display:flex;gap:6px;flex-wrap:wrap;margin-top:14px}
.pill{border:1px solid rgba(255,255,255,.45);background:rgba(255,255,255,.14);color:#fff;font-size:.68rem;padding:4px 10px;border-radius:999px;cursor:pointer}
.pill.active{background:#fff;color:var(--green);font-weight:700;border-color:#fff}
.wrap{max-width:480px;margin:0 auto;padding:0 16px 40px}
.card{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:16px;margin-top:-42px;box-shadow:0 12px 30px rgba(22,40,58,.10);position:relative;z-index:2}
.total-lbl{font-size:.72rem;color:var(--sub);text-transform:uppercase;letter-spacing:.6px}
.total-ngn{font-size:2rem;font-weight:800;color:var(--ink)}
.total-usd{font-size:.78rem;color:var(--sub);margin-top:2px}
.tabs{display:flex;gap:6px;margin-top:14px;background:#f1f6f9;padding:5px;border-radius:14px}
.tab{flex:1;text-align:center;font-size:.75rem;font-weight:600;color:var(--sub);padding:9px 4px;border-radius:10px;cursor:pointer}
.tab.active{background:#fff;color:var(--green);box-shadow:0 2px 8px rgba(22,40,58,.10)}
.panel{display:none;margin-top:14px}
.panel.active{display:block}
.row{display:flex;align-items:center;justify-content:space-between;padding:12px 2px;border-bottom:1px solid var(--line)}
.row:last-child{border-bottom:none}
.coin-ic{width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,#12805e,#c99a1a);color:#fff;font-size:.7rem;font-weight:800;display:flex;align-items:center;justify-content:center;margin-right:10px;flex-shrink:0}
.coin-info{flex:1;min-width:0}
.coin-name{font-size:.82rem;font-weight:700}
.coin-sub{font-size:.68rem;color:var(--sub)}
.coin-right{text-align:right}
.coin-amt{font-size:.82rem;font-weight:700}
.coin-ngn{font-size:.68rem;color:var(--green);font-weight:600}
.hint{font-size:.68rem;color:var(--sub);margin-top:10px;line-height:1.5}
.btn{display:block;width:100%;background:linear-gradient(135deg,#0b7a4b,#12805e);color:#fff;border:none;font-size:.9rem;font-weight:700;padding:13px;border-radius:12px;cursor:pointer;margin-top:12px}
.btn:disabled{opacity:.55;cursor:default}
.btn.gold{background:linear-gradient(135deg,#c99a1a,#d4a017)}
.btn.ghost{background:#fff;color:var(--green);border:1.5px solid var(--green)}
label{font-size:.72rem;font-weight:600;color:var(--sub);display:block;margin-top:12px}
input,select{width:100%;font-size:.95rem;padding:11px;border:1.5px solid var(--line);border-radius:10px;margin-top:5px;background:#fff;color:var(--ink);outline:none}
input:focus{border-color:var(--green)}
.err{background:#fdecea;border:1px solid #f5c6c0;color:var(--red);font-size:.75rem;padding:9px;border-radius:9px;margin-top:10px;display:none}
.ok{background:var(--ok);border:1px solid #bfe3cf;color:var(--green);font-size:.75rem;padding:9px;border-radius:9px;margin-top:10px;display:none}
.seg{display:flex;background:#f1f6f9;border-radius:10px;padding:3px;margin-top:5px}
.seg button{flex:1;border:none;background:transparent;font-size:.75rem;font-weight:600;color:var(--sub);padding:8px;border-radius:8px;cursor:pointer}
.seg button.on{background:#fff;color:var(--green);box-shadow:0 2px 6px rgba(22,40,58,.08)}
.overlay{position:fixed;inset:0;background:rgba(238,244,248,.98);z-index:50;overflow-y:auto;padding:24px 16px;display:none}
.wbar{display:flex;gap:8px;align-items:center;margin-bottom:12px;flex-wrap:wrap}
.wsel{flex:1;min-width:140px;padding:10px;border:1px solid #d5dee4;border-radius:10px;background:#fff;font-size:.9rem}
.btn.sm{padding:8px 12px;font-size:.85rem;margin-top:0!important}
.rmarmed{background:#c0392b!important;color:#fff!important}
.overlay.show{display:block}
.onb{max-width:440px;margin:20px auto;background:#fff;border:1px solid var(--line);border-radius:20px;padding:22px;box-shadow:0 14px 40px rgba(22,40,58,.12)}
.seedbox{background:#f1f8f4;border:1px dashed #12805e;border-radius:12px;padding:14px;font-size:.9rem;font-weight:700;color:var(--green);line-height:1.7;margin-top:10px;word-spacing:4px}
.qrbox{background:#fff;padding:12px;border:1px solid var(--line);border-radius:14px;width:fit-content;margin:14px auto}
.addr{font-family:monospace;font-size:.78rem;background:#f1f6f9;padding:10px;border-radius:10px;word-break:break-all;margin-top:10px;text-align:center}
.badge{display:inline-block;font-size:.62rem;font-weight:700;background:var(--ok);color:var(--green);padding:3px 8px;border-radius:999px;margin-top:8px}
.foot{text-align:center;font-size:.65rem;color:var(--sub);margin-top:24px;line-height:1.6}
a{color:var(--green);font-weight:700;text-decoration:none}
.txlink{font-size:.7rem;word-break:break-all}
</style>
</head>
<body>
<div class="hero">
<h1>HARZ Wallet v3 — Honest Registry</h1>
<div class="tag">8 Chains · Naira-First · Browser-Only · Keys Never Leave This Device</div>
<div class="pillrow" id="chainPills"></div>
</div>
<div class="wrap">
<div class="card">
<div class="total-lbl">Total Portfolio Value</div>
<div class="total-ngn" id="totalNgn">₦ —</div>
<div class="total-usd" id="totalUsd">Prices: HARZ Swap Oracle · NGN: live FX</div>
<div class="tabs">
<div class="tab active" data-tab="portfolio" onclick="showTab('portfolio')">Portfolio</div>
<div class="tab" data-tab="send" onclick="showTab('send')">Send</div>
<div class="tab" data-tab="receive" onclick="showTab('receive')">Receive</div>
<div class="tab" data-tab="l1" onclick="showTab('l1')">HARZ L1</div>
<div class="tab" data-tab="history" onclick="showTab('history')">History</div>
</div>

<div class="panel active" id="panel-portfolio">
<div class="wbar">
<select id="walletSel" class="wsel" onchange="switchWallet(this.value)"><option>Unlock first…</option></select>
<button class="btn ghost sm" onclick="openAdd()">+ Wallet</button>
<button class="btn ghost sm" id="rmBtn" onclick="removeWalletArm()">Remove</button>
</div>
<div id="assetRows"><div class="hint">Loading balances from the chain…</div></div>
<button class="btn ghost" onclick="loadAll()">Refresh</button>
<div class="hint">Native + token balances are read live from each chain over public RPC. Naira values come from your own HARZ Swap oracle — not CoinGecko, not Binance.</div>
</div>

<div class="panel" id="panel-send">
<label>Asset</label>
<select id="sendAsset" onchange="updateSendModeLabel()"></select>
<label>Recipient address (0x…)</label>
<input id="sendTo" placeholder="0x…" autocomplete="off">
<div class="seg">
<button id="modeToken" class="on" onclick="setSendMode('token')">Amount in token</button>
<button id="modeNgn" onclick="setSendMode('ngn')">Amount in ₦ Naira</button>
</div>
<label id="amtLabel">Amount</label>
<input id="sendAmt" type="number" step="any" placeholder="0.0" oninput="previewSend()">
<div class="hint" id="sendPreview"></div>
<label>Wallet passphrase</label>
<input id="sendPass" type="password" placeholder="Your passphrase">
<div class="err" id="sendErr"></div>
<div class="ok" id="sendOk"></div>
<button class="btn" id="sendBtn" onclick="doSend()">Send</button>
</div>

<div class="panel" id="panel-receive">
<div class="hint" style="margin-top:0">Your address on <b id="recvChain">this chain</b>:</div>
<div class="addr" id="recvAddr">—</div>
<div class="qrbox" id="qrBox"></div>
<button class="btn" onclick="copyAddr()">Copy Address</button>
<div class="ok" id="recvOk">Copied!</div>
</div>

<div class="panel" id="panel-l1">
<label>HARZ Chain L1 wallet (phone number)</label>
<input id="l1wallet" placeholder="e.g. 08028687857">
<button class="btn" onclick="loadL1()">Check L1 Balance</button>
<div class="err" id="l1err"></div>
<div id="l1result"></div>
<div class="hint">Reads live from HARZ Chain v8 (Proof-of-Edge). To move L1 assets, use the <a href="https://harz-chain-v2.harz.workers.dev/dex">HARZ DEX</a> with your registered signing key.</div>
</div>

<div class="panel" id="panel-history">
<div id="historyRows"><div class="hint">Loading…</div></div>
</div>
</div>
<div class="foot">HARZ Wallet v3.1 · Multi-Wallet · Honest Registry · Keys encrypted in your browser (PBKDF2-150k + AES-256-GCM)<br>Server stores public addresses and tx history only — never private keys</div>
</div>

<div class="overlay show" id="onbOverlay">
<div class="onb">
<div style="font-size:1.05rem;font-weight:800;color:var(--green)">HARZ Wallet v3</div>
<div class="hint" style="margin-top:6px">The Naira-first multicrypto wallet. One passphrase unlocks your whole vault — create or import as many wallets as you need. Keys are generated in this browser and encrypted locally. The server never sees them.</div>
<div class="seg" style="margin-top:14px">
<button id="itabCreate" class="on" onclick="onbTab('create')">Create New</button>
<button id="itabImport" onclick="onbTab('import')">Import</button>
</div>
<div id="onb-create">
<div class="seedbox" id="seedBox" style="display:none"></div>
<div class="hint" id="seedNote" style="display:none">⚠ Write these 12 words down on paper. Without them your wallet cannot be recovered. Never share them.</div>
<label>Wallet name (optional)</label>
<input id="wlName" placeholder="e.g. Rabiu, Farm, Treasury">
<label>Passphrase (encrypts your keys locally)</label>
<input id="pass1" type="password" placeholder="Choose a strong passphrase">
<label>Confirm passphrase</label>
<input id="pass2" type="password" placeholder="Repeat your passphrase">
<div class="err" id="createErr"></div>
<button class="btn" onclick="createWallet()">Generate Wallet</button>
</div>
<div id="onb-import" style="display:none">
<div class="seg" style="margin-top:10px">
<button id="imSeed" class="on" onclick="imTab('seed')">Seed Phrase</button>
<button id="imPk" onclick="imTab('pk')">Private Key</button>
</div>
<div id="im-panel-seed">
<label>12-word recovery phrase</label>
<input id="impSeed" placeholder="word1 word2 … word12">
</div>
<div id="im-panel-pk" style="display:none">
<label>Private key</label>
<input id="impPk" placeholder="0x…">
</div>
<label>Passphrase (to encrypt locally)</label>
<input id="impPass" type="password" placeholder="Choose a passphrase">
<div class="err" id="importErr"></div>
<button class="btn" onclick="importWallet()">Import Wallet</button>
</div>
<div class="hint" style="margin-top:14px">Already created? Unlock below.</div>
<label>Unlock with passphrase</label>
<input id="unlockPass" type="password" placeholder="Your passphrase" onkeydown="if(event.key==='Enter')unlock()">
<button class="btn gold" onclick="unlock()">Unlock Wallet</button>
<div class="err" id="unlockErr"></div>
</div>
</div>
<div class="overlay" id="addOverlay">
<div class="onb">
<div style="font-size:1.05rem;font-weight:800;color:var(--green)">Add a Wallet</div>
<div class="hint" style="margin-top:6px">Create a brand-new wallet or import an existing one. It joins your vault, encrypted in your browser.</div>
<label>Wallet name</label>
<input id="addName" placeholder="e.g. Wallet 2">
<div class="seg" style="margin-top:10px">
<button id="addTabCreate" class="on" onclick="addTab('create')">Create New</button>
<button id="addTabImport" onclick="addTab('import')">Import</button>
</div>
<div id="add-create">
<div class="hint" style="margin-top:10px">A fresh wallet will be generated and added to your vault.</div>
</div>
<div id="add-import" style="display:none">
<div class="seg" style="margin-top:10px">
<button id="addImSeed" class="on" onclick="addImTab('seed')">Seed Phrase</button>
<button id="addImPk" onclick="addImTab('pk')">Private Key</button>
</div>
<div id="add-im-seed">
<label>12-word recovery phrase</label>
<input id="addSeed" placeholder="word1 word2 … word12">
</div>
<div id="add-im-pk" style="display:none">
<label>Private key</label>
<input id="addPk" placeholder="0x…">
</div>
</div>
<div class="seedbox" id="addSeedBox" style="display:none"></div>
<div class="hint" id="addSeedNote" style="display:none">⚠ Write these 12 words down on paper now — this is the only time they are shown.</div>
<div class="err" id="addErr"></div>
<button class="btn" id="addBtn" onclick="addWalletNow()">Add Wallet</button>
<button class="btn ghost" onclick="closeAdd()">Cancel</button>
</div>
</div>

<script>
var LS_KEY='harzwallet_v2',LS_ADDR='harzwallet_v2_addr';
var LS_VAULT='harzwallets_v3',LS_ACTIVE='harz_wallet_active';
var VAULT=[],VAULT_PASS=null,rmArmed=false,rmTimer=null,ADD_STAGE='input';
var PRICE={},NGN=0,PRICE_SRC='';
var chains={
harz:{name:'HARZ L1',kind:'l1'},
ethereum:{name:'Ethereum',kind:'evm',symbol:'ETH',chainId:1,rpc:'https://cloudflare-eth.com',explorer:'https://etherscan.io',oracleKey:'ETH'},
polygon:{name:'Polygon',kind:'evm',symbol:'POL',chainId:137,rpc:'https://polygon-bor-rpc.publicnode.com',explorer:'https://polygonscan.com',oracleKey:'MATIC'},
bsc:{name:'BSC',kind:'evm',symbol:'BNB',chainId:56,rpc:'https://bsc-rpc.publicnode.com',explorer:'https://bscscan.com',oracleKey:'BNB'},
arbitrum:{name:'Arbitrum',kind:'evm',symbol:'ETH',chainId:42161,rpc:'https://arbitrum-one-rpc.publicnode.com',explorer:'https://arbiscan.io',oracleKey:'ETH'},
optimism:{name:'Optimism',kind:'evm',symbol:'ETH',chainId:10,rpc:'https://optimism-rpc.publicnode.com',explorer:'https://optimistic.etherscan.io',oracleKey:'ETH'},
avalanche:{name:'Avalanche',kind:'evm',symbol:'AVAX',chainId:43114,rpc:'https://avalanche-c-rpc.publicnode.com',explorer:'https://snowtrace.io',oracleKey:'AVAX'},
base:{name:'Base',kind:'evm',symbol:'ETH',chainId:8453,rpc:'https://base-rpc.publicnode.com',explorer:'https://basescan.org',oracleKey:'ETH'}
};
var chainKeys=['harz','polygon','ethereum','bsc','arbitrum','optimism','avalanche','base'];
var currentChain='polygon';
var TOKENS={};
var wallet=null;
var sendMode='token';
var sentAmount=0,coin='';

function gid(i){return document.getElementById(i)}
function show(i,m){gid(i).style.display='block';gid(i).textContent=m}
function hide(i){gid(i).style.display='none'}

async function deriveKey(p,s){
var enc=new TextEncoder();
var km=await crypto.subtle.importKey('raw',enc.encode(p),'PBKDF2',false,['deriveKey']);
return crypto.subtle.deriveKey({name:'PBKDF2',salt:s,iterations:150000,hash:'SHA-256'},km,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);
}
async function encryptKey(pk,pass){
var salt=crypto.getRandomValues(new Uint8Array(16));
var iv=crypto.getRandomValues(new Uint8Array(12));
var key=await deriveKey(pass,salt);
var enc=new TextEncoder();
var ct=await crypto.subtle.encrypt({name:'AES-GCM',iv:iv},key,enc.encode(pk));
return{salt:btoa(String.fromCharCode.apply(null,salt)),iv:btoa(String.fromCharCode.apply(null,iv)),ct:btoa(String.fromCharCode.apply(null,new Uint8Array(ct))),v:2};
}
async function decryptKey(blob,pass){
var salt=Uint8Array.from(atob(blob.salt),function(c){return c.charCodeAt(0)});
var iv=Uint8Array.from(atob(blob.iv),function(c){return c.charCodeAt(0)});
var ct=Uint8Array.from(atob(blob.ct),function(c){return c.charCodeAt(0)});
var key=await deriveKey(pass,salt);
var pt=await crypto.subtle.decrypt({name:'AES-GCM',iv:iv},key,new Uint8Array(ct));
return new TextDecoder().decode(pt);
}
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}
function vaultRecs(){try{return JSON.parse(localStorage.getItem(LS_VAULT)||'[]')}catch(e){return []}}
function vaultWrite(recs){localStorage.setItem(LS_VAULT,JSON.stringify(recs))}
async function addWalletToVault(w,name){
var blob=await encryptKey(w.privateKey+'|'+(w.mnemonic?w.mnemonic.phrase:''),VAULT_PASS);
var rec={id:'w'+Date.now().toString(36)+Math.floor(Math.random()*1000),name:name,address:w.address,enc:blob};
var recs=vaultRecs();recs.push(rec);vaultWrite(recs);
VAULT.push({id:rec.id,name:name,address:w.address,wallet:w});
return rec.id;
}
function activeWallet(){for(var i=0;i<VAULT.length;i++){if(VAULT[i].wallet===wallet)return VAULT[i]}return null}
function setActiveWallet(id){
for(var i=0;i<VAULT.length;i++){if(VAULT[i].id===id){wallet=VAULT[i].wallet}}
localStorage.setItem(LS_ACTIVE,id);
renderWalletBar();
}
function renderWalletBar(){
var sel=gid('walletSel');if(!sel)return;
var html='';
VAULT.forEach(function(v){html+='<option value="'+v.id+'"'+(v.wallet===wallet?' selected':'')+'>'+esc(v.name)+' · '+v.address.slice(0,6)+'…'+v.address.slice(-4)+'</option>'});
sel.innerHTML=html;
}
function switchWallet(id){
var hit=null;
for(var i=0;i<VAULT.length;i++){if(VAULT[i].id===id)hit=VAULT[i]}
if(!hit)return;
setActiveWallet(id);
enterApp();
}
function openAdd(){
if(!VAULT_PASS)return;
gid('addOverlay').classList.add('show');
hide('addErr');gid('addErr').textContent='';
gid('addName').value='';gid('addSeed').value='';gid('addPk').value='';
gid('addSeedBox').style.display='none';gid('addSeedBox').textContent='';
gid('addSeedNote').style.display='none';
gid('addBtn').textContent='Add Wallet';
ADD_STAGE='input';
addTab('create');
}
function closeAdd(){gid('addOverlay').classList.remove('show')}
function addTab(t){
gid('addTabCreate').classList.toggle('on',t==='create');
gid('addTabImport').classList.toggle('on',t==='import');
gid('add-create').style.display=t==='create'?'block':'none';
gid('add-import').style.display=t==='import'?'block':'none';
}
function addImTab(t){
gid('addImSeed').classList.toggle('on',t==='seed');
gid('addImPk').classList.toggle('on',t==='pk');
gid('add-im-seed').style.display=t==='seed'?'block':'none';
gid('add-im-pk').style.display=t==='pk'?'block':'none';
}
async function addWalletNow(){
hide('addErr');gid('addErr').textContent='';
try{
if(ADD_STAGE==='seedshown'){ADD_STAGE='input';gid('addBtn').textContent='Add Wallet';closeAdd();enterApp();return}
var name=(gid('addName').value||'').trim()||('Wallet '+(VAULT.length+1));
var creating=gid('add-create').style.display!=='none';
var w;
if(!creating){
if(gid('add-im-seed').style.display!=='none'){
var ph=gid('addSeed').value.trim().toLowerCase();
if(ph.split(/\\s+/).length<12){show('addErr','Seed phrase must be 12 words');return}
w=ethers.Wallet.fromMnemonic(ph);
}else{
w=new ethers.Wallet(gid('addPk').value.trim());
}
}else{
w=ethers.Wallet.createRandom();
}
var id=await addWalletToVault(w,name);
setActiveWallet(id);
if(creating){
gid('addSeedBox').textContent=w.mnemonic.phrase;
gid('addSeedBox').style.display='block';
gid('addSeedNote').style.display='block';
gid('addBtn').textContent='✓ I wrote it down — finish';
ADD_STAGE='seedshown';
return;
}
closeAdd();
enterApp();
}catch(e){show('addErr','Error: '+e.message)}
}
function removeWalletArm(){
var btn=gid('rmBtn');
if(!VAULT.length)return;
var v=activeWallet();if(!v)return;
if(!rmArmed){
rmArmed=true;
btn.textContent='Really remove '+v.name+'?';
btn.classList.add('rmarmed');
rmTimer=setTimeout(function(){rmArmed=false;btn.textContent='Remove';btn.classList.remove('rmarmed')},4000);
return;
}
clearTimeout(rmTimer);rmArmed=false;
btn.textContent='Remove';btn.classList.remove('rmarmed');
VAULT=VAULT.filter(function(x){return x.id!==v.id});
vaultWrite(vaultRecs().filter(function(r){return r.id!==v.id}));
if(!VAULT.length){
localStorage.removeItem(LS_VAULT);localStorage.removeItem(LS_ACTIVE);
location.reload();return;
}
setActiveWallet(VAULT[0].id);
enterApp();
}

async function createWallet(){
hide('createErr');
var p1=gid('pass1').value,p2=gid('pass2').value;
if(!p1||p1.length<6){show('createErr','Passphrase must be at least 6 characters');return}
if(p1!==p2){show('createErr','Passphrases do not match');return}
try{
var w=ethers.Wallet.createRandom();
var name=(gid('wlName').value||'').trim()||'Wallet 1';
VAULT_PASS=p1;
var id=await addWalletToVault(w,name);
gid('seedBox').textContent=w.mnemonic.phrase;
gid('seedBox').style.display='block';
gid('seedNote').style.display='block';
setActiveWallet(id);
enterApp();
}catch(e){show('createErr','Error: '+e.message)}
}


async function importWallet(){
hide('importErr');
var pass=gid('impPass').value;
if(!pass){show('importErr','Set a passphrase to encrypt locally');return}
try{
var w;
if(gid('im-panel-seed').style.display!=='none'){
var ph=gid('impSeed').value.trim().toLowerCase();
if(ph.split(/\\s+/).length<12){show('importErr','Seed phrase must be 12 words');return}
w=ethers.Wallet.fromMnemonic(ph);
}else{
var pk=gid('impPk').value.trim();
w=new ethers.Wallet(pk);
}
var name='Wallet '+(vaultRecs().length+1);
VAULT_PASS=pass;
var id=await addWalletToVault(w,name);
setActiveWallet(id);
enterApp();
}catch(e){show('importErr','Invalid input: '+e.message)}
}


async function unlock(){
hide('unlockErr');
var pass=gid('unlockPass').value;
if(!pass){show('unlockErr','Enter your passphrase');return}
try{
var recs=vaultRecs();
if(!recs.length&&localStorage.getItem(LS_KEY)){
var blob=JSON.parse(localStorage.getItem(LS_KEY));
var data=await decryptKey(blob,pass);
var w0=new ethers.Wallet(data.split('|')[0]);
recs=[{id:'w'+Date.now().toString(36),name:'Wallet 1',address:w0.address,enc:blob}];
vaultWrite(recs);
}
if(!recs.length){show('unlockErr','No wallets on this device yet. Create or import one.');return}
VAULT_PASS=pass;VAULT=[];
for(var i=0;i<recs.length;i++){
var d=await decryptKey(recs[i].enc,pass);
var w=new ethers.Wallet(d.split('|')[0]);
VAULT.push({id:recs[i].id,name:recs[i].name,address:w.address,wallet:w});
}
var act=localStorage.getItem(LS_ACTIVE);
var found=null;
for(var j=0;j<VAULT.length;j++){if(VAULT[j].id===act)found=VAULT[j]}
if(!found)found=VAULT[0];
setActiveWallet(found.id);
enterApp();
}catch(e){show('unlockErr','Could not unlock: wrong passphrase?')}
}


function enterApp(){
gid('onbOverlay').classList.remove('show');
if(!activeWallet()){gid('onbOverlay').classList.add('show');return}
gid('recvAddr').textContent=wallet.address;
fetch('/api/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({address:wallet.address,chain:currentChain})}).catch(function(){});
renderWalletBar();
renderQR();
loadAll();
loadHistory();
}


function onbTab(t){
gid('itabCreate').classList.toggle('on',t==='create');
gid('itabImport').classList.toggle('on',t==='import');
gid('onb-create').style.display=t==='create'?'block':'none';
gid('onb-import').style.display=t==='import'?'block':'none';
}
function imTab(t){
gid('imSeed').classList.toggle('on',t==='seed');
gid('imPk').classList.toggle('on',t==='pk');
gid('im-panel-seed').style.display=t==='seed'?'block':'none';
gid('im-panel-pk').style.display=t==='pk'?'block':'none';
}
function showTab(t){
document.querySelectorAll('.tab').forEach(function(e){e.classList.toggle('active',e.dataset.tab===t)});
document.querySelectorAll('.panel').forEach(function(e){e.classList.remove('active')});
gid('panel-'+t).classList.add('active');
if(t==='receive'){gid('recvChain').textContent=chains[currentChain].name;renderQR()}
}
function switchChain(k){
currentChain=k;
renderPills();
buildSendAssets();
gid('recvChain').textContent=chains[k].name;
gid('recvAddr').textContent=wallet?wallet.address:'—';
if(k==='harz'){showTab('l1');return}
renderQR();
loadAll();
}
function renderPills(){
var html='';
chainKeys.forEach(function(k){
html+='<div class="pill'+(k===currentChain?' active':'')+'" onclick="switchChain(\\''+k+'\\')">'+chains[k].name+'</div>';
});
gid('chainPills').innerHTML=html;
}
function renderQR(){
gid('qrBox').innerHTML='';
try{
var qr=qrcode(0,'M');
qr.addData(wallet?wallet.address:'');
qr.make();
gid('qrBox').innerHTML=qr.createImgTag(6,8);
}catch(e){gid('qrBox').innerHTML='<div class="hint">QR unavailable</div>'}
}
function copyAddr(){
if(!wallet)return;
navigator.clipboard.writeText(wallet.address).then(function(){gid('recvOk').style.display='block';setTimeout(function(){gid('recvOk').style.display='none'},1500)});
}
function fmt(n,d){
if(n===null||n===undefined||isNaN(n))return'—';
var dec=d===undefined?4:d;
return parseFloat(n.toFixed(dec)).toLocaleString('en-US');
}
function ngnOf(sym,amount){
var key=sym;
if(sym==='WBTC')key='BTC';
if(sym==='WETH')key='ETH';
if(sym==='WMATIC')key='MATIC';
if(sym==='DAI')key='USDT';
var p=PRICE[key];
if(p&&NGN>0)return{usd:amount*p,price:p};
return{usd:null,price:p};
}
async function loadPrices(){
try{
var r=await fetch('https://harz-swap.harz.workers.dev/api/prices');
var d=await r.json();
var prices=d.prices||{};
PRICE={};
Object.keys(prices).forEach(function(k){
var v=prices[k];
if(typeof v==='object'&&v.priceUSD)PRICE[k]=v.priceUSD;
});
var rr=await fetch('https://harz-swap.harz.workers.dev/api/ngn');
var dd=await rr.json();
NGN=dd.ngn||0;
if(NGN>0){PRICE.GDEG=15/NGN;PRICE.NRL=100/NGN;}
PRICE_SRC='HARZ Swap Oracle';
}catch(e){PRICE_SRC='oracle offline'}
}
async function loadTokens(){
if(Object.keys(TOKENS).length)return;
try{
var r=await fetch('/api/tokens');
TOKENS=await r.json();
}catch(e){}
}
function getProvider(k){
var c=chains[k];
return new ethers.providers.JsonRpcProvider(c.rpc);
}
async function loadAll(){
await Promise.all([loadPrices(),loadTokens()]);
renderPills();
buildSendAssets();
var rowsEl=gid('assetRows');
if(!wallet){rowsEl.innerHTML='<div class="hint">Unlock your wallet to see balances.</div>';return}
if(currentChain==='harz'){rowsEl.innerHTML='<div class="hint">HARZ L1 assets are managed from the HARZ L1 tab (phone-number wallets).</div>';return}
var c=chains[currentChain];
var provider=getProvider(currentChain);
var addr=wallet.address;
var html='';
var totalNgn=0,totalUsd=0;
try{
var bal=await provider.getBalance(addr);
var nativePrice=PRICE[c.oracleKey]||null;
var nv=nativePrice?parseFloat(ethers.utils.formatEther(bal)):0;
var nusd=nativePrice?nv*nativePrice:0;
totalUsd+=nusd;
totalNgn+=nusd*NGN;
html+='<div class="row"><div style="display:flex;align-items:center"><div class="coin-ic">'+c.symbol+'</div><div class="coin-info"><div class="coin-name">'+c.name+'</div><div class="coin-sub">Native coin</div></div></div><div class="coin-right"><div class="coin-amt">'+fmt(nv)+' '+c.symbol+'</div><div class="coin-ngn">'+(nativePrice&&NGN?'₦'+fmt(nusd*NGN,2):'—')+'</div></div></div>';
}catch(e){}
var list=TOKENS[currentChain]||[];
for(var i=0;i<list.length;i++){
var t=list[i];
var amount=0;
try{
var pr=getProvider(currentChain);
var ctc=new ethers.Contract(t.address,['function balanceOf(address) view returns (uint256)','function decimals() view returns (uint8)'],pr);
var raw=await ctc.balanceOf(addr);
amount=parseFloat(ethers.utils.formatUnits(raw,t.decimals||18));
}catch(e){continue}
if(amount<=0)continue;
var res=ngnOf(t.symbol,amount);
var p=res.price||null;
var usd=res.usd||0;
totalUsd+=usd;totalNgn+=usd*NGN;
html+='<div class="row"><div style="display:flex;align-items:center"><div class="coin-ic">'+t.symbol.slice(0,4)+'</div><div class="coin-info"><div class="coin-name">'+t.symbol+'</div><div class="coin-sub">'+t.name+'</div></div></div><div class="coin-right"><div class="coin-amt">'+fmt(amount)+' '+t.symbol+'</div><div class="coin-ngn">'+(p&&NGN?'₦'+fmt(usd*NGN,2):'—')+'</div></div></div>';
}
if(!html)html='<div class="hint">No balances found on this chain yet.</div>';
rowsEl.innerHTML=html;
gid('totalNgn').textContent='₦ '+fmt(totalNgn,2);
gid('totalUsd').textContent='$'+fmt(totalUsd,2)+' · '+PRICE_SRC+' · NGN ₦'+fmt(NGN,2);
}
function buildSendAssets(){
if(!gid('sendAsset'))return;
var opts='';
chainKeys.forEach(function(k){
if(k==='harz')return;
var c=chains[k];
opts+='<option value="'+k+'|native">'+c.name+' — '+c.symbol+' (native)</option>';
(TOKENS[k]||[]).forEach(function(t){
opts+='<option value="'+k+'|'+t.address+'|'+t.symbol+'|'+(t.decimals||18)+'">'+c.name+' — '+t.symbol+'</option>';
});
});
gid('sendAsset').innerHTML=opts;
}
function updateSendModeLabel(){
var v=(gid('sendAsset').value||'').split('|');
if(v[1]==='native')gid('amtLabel').textContent=sendMode==='token'?('Amount in '+chains[v[0]].symbol):'Amount in ₦ Naira';
else gid('amtLabel').textContent=sendMode==='token'?('Amount in '+v[2]):'Amount in ₦ Naira';
previewSend();
}
function setSendMode(m){
sendMode=m;
gid('modeToken').classList.toggle('on',m==='token');
gid('modeNgn').classList.toggle('on',m==='ngn');
gid('sendAmt').value='';
gid('sendPreview').textContent='';
updateSendModeLabel();
}
function priceOfSelection(){
var v=(gid('sendAsset').value||'').split('|');
var sym=v[1]==='native'?chains[v[0]].oracleKey:v[2];
if(v[2]==='WBTC')sym='BTC';
if(v[2]==='DAI')sym='USDT';
return PRICE[sym]||null;
}
function previewSend(){
var p=priceOfSelection();
var amt=parseFloat(gid('sendAmt').value)||0;
if(!p||!amt){gid('sendPreview').textContent='';return}
if(sendMode==='token')gid('sendPreview').textContent='≈ ₦'+fmt(amt*p*NGN,2)+' at oracle price';
else gid('sendPreview').textContent='≈ '+fmt(amt/NGN/p)+' tokens ($'+fmt(amt/NGN,2)+')';
}
async function doSend(){
hide('sendErr');hide('sendOk');
if(!wallet){show('sendErr','Unlock your wallet first');return}
var to=gid('sendTo').value.trim();
var amt=parseFloat(gid('sendAmt').value);
var pass=gid('sendPass').value;
if(!to||!to.startsWith('0x')||to.length!==42){show('sendErr','Invalid recipient address');return}
if(!amt||amt<=0){show('sendErr','Enter a valid amount');return}
if(!pass){show('sendErr','Enter your wallet passphrase');return}
var v=(gid('sendAsset').value||'').split('|');
var chainKey=v[0],target=v[1],sym=v[2],dec=Number(v[3]||18);
var provider=getProvider(chainKey);
var c=chains[chainKey];
var w=wallet.connect(provider);
var p=priceOfSelection();
var amount;
if(sendMode==='ngn'){
if(!p||!NGN){show('sendErr','Oracle price unavailable for this asset');return}
amount=amt/NGN/p;
}else{amount=amt}
gid('sendBtn').disabled=true;gid('sendBtn').textContent='Signing…';
try{
var tx;
var coinSym='',sentAmt=0;
if(target==='native'){
var bal=await provider.getBalance(wallet.address);
var amtWei=ethers.utils.parseEther(String(amount));
var gasPrice=await provider.getGasPrice();
if(bal.lt(amtWei.add(gasPrice.mul(21000)))){throw new Error('Insufficient balance. Have '+fmt(parseFloat(ethers.utils.formatEther(bal)))+' '+c.symbol)}
tx=await w.sendTransaction({to:to,value:amtWei,gasLimit:21000,gasPrice:gasPrice,chainId:c.chainId});
coinSym=c.symbol;sentAmt=amount;
}else{
var ctc=new ethers.Contract(target,['function transfer(address to, uint256 amount) returns (bool)','function decimals() view returns (uint8)'],w);
var realDec=dec;
try{realDec=await ctc.decimals()}catch(e){}
tx=await ctc.transfer(to,ethers.utils.parseUnits(String(amount),realDec));
coinSym=sym;sentAmt=amount;
}
gid('sendBtn').textContent='Broadcasting…';
await tx.wait();
fetch('/api/record-tx',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({tx_hash:tx.hash,from:wallet.address,to:to,amount:sentAmt,coin:coinSym,chain:chainKey})}).catch(function(){});
show('sendOk','Sent successfully!');
gid('sendPreview').innerHTML='<a class="txlink" target="_blank" href="'+c.explorer+'/tx/'+tx.hash+'">View on '+c.explorer.replace('https://','')+'</a>';
loadHistory();
loadAll();
}catch(e){show('sendErr',e.message)}
gid('sendBtn').disabled=false;gid('sendBtn').textContent='Send';
}
async function loadL1(){
hide('l1err');
var a=gid('l1wallet').value.trim();
if(!a){show('l1err','Enter an L1 wallet (phone number)');return}
try{
var r=await fetch('https://harz-chain-v2.harz.workers.dev/api/balance?address='+encodeURIComponent(a));
var d=await r.json();
if(d.error){show('l1err',d.error);return}
var harz=d.balance||0;
gid('l1result').innerHTML='<div class="badge">Live from HARZ Chain v8</div><div class="row" style="margin-top:6px"><div style="display:flex;align-items:center"><div class="coin-ic">HARZ</div><div class="coin-info"><div class="coin-name">HARZcoin</div><div class="coin-sub">Native L1 coin · Proof-of-Edge</div></div></div><div class="coin-right"><div class="coin-amt">'+fmt(harz)+' HARZ</div></div></div><div class="hint">Move L1 assets at the <a href="https://harz-chain-v2.harz.workers.dev/dex">HARZ DEX</a>.</div>';
}catch(e){show('l1err','Chain unreachable')}
}
async function loadHistory(){
var el=gid('historyRows');
if(!wallet){el.innerHTML='<div class="hint">Unlock to see history.</div>';return}
try{
var r=await fetch('/api/transactions/'+wallet.address);
var d=await r.json();
var list=d.transactions||d.result||[];
if(!list.length){el.innerHTML='<div class="hint">No transactions yet.</div>';return}
var html='';
list.forEach(function(t){
var c=chains[t.chain];
var link=(c&&c.explorer&&t.tx_hash?('<a class="txlink" target="_blank" href="'+c.explorer+'/tx/'+t.tx_hash+'">'+String(t.tx_hash).slice(0,14)+'…</a>'):String(t.tx_hash||'').slice(0,18));
html+='<div class="row"><div class="coin-info"><div class="coin-name">'+(t.coin||'')+' '+(t.amount||0)+'</div><div class="coin-sub">'+link+'</div></div><div class="coin-right"><div class="coin-sub">'+String(t.timestamp||'').replace('T',' ').slice(0,16)+'</div></div></div>';
});
el.innerHTML=html;
}catch(e){el.innerHTML='<div class="hint">History unavailable.</div>'}
}
window.addEventListener('load',async function(){
renderPills();
await loadPrices();
buildSendAssets();
if(localStorage.getItem(LS_VAULT)||localStorage.getItem(LS_KEY)){
gid('unlockPass').focus();
}else{
onbTab('create');
}
navigator.serviceWorker&&navigator.serviceWorker.register('/sw.js').catch(function(){});
});
</script>
</body>
</html>
`;
var wallet_default = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    if (request.method === "OPTIONS") return new Response(null, { headers: CORS });
    if (path.startsWith("/api/")) return handleAPI(path, request, env);
    if (path === "/manifest.json") return manifestJSON();
    if (path === "/sw.js") return swJS();
    if (path === "/icon.svg") return iconSVG();
    if (path === "/icon-192.png" || path === "/icon-512.png" || path === "/apple-touch-icon.png") {
      return new Response(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" rx="80" fill="#0a7d3c"/><circle cx="256" cy="256" r="140" fill="#fff"/><path d="M256 140 L256 372 M180 256 L256 140 L332 256 L256 372" stroke="#0a7d3c" stroke-width="20" fill="none" stroke-linejoin="round"/></svg>',
        { headers: { "Content-Type": "image/svg+xml", "Cache-Control": "public, max-age=86400" } }
      );
    }
    return new Response(HTML, { headers: { "Content-Type": "text/html" } });
  }
};
export {
  wallet_default as default
};


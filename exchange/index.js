var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value: value, configurable: true });

// harz-exchange-v5-secured.js
var SW_CODE = "const C='harz-ex-v5';self.addEventListener('install',e=>{self.skipWaiting()});self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(c=>c!==C).map(c=>caches.delete(c)))))});self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(caches.match(e.request).then(c=>{const f=fetch(e.request).then(r=>{if(r&&r.status===200){caches.open(C).then(c=>c.put(e.request,r.clone()))}return r}).catch(()=>c);return c||f}))})";
var MANIFEST = JSON.stringify({
  name: "HARZ Exchange",
  short_name: "HARZ EX",
  start_url: "/",
  display: "standalone",
  background_color: "#f0f2f5",
  theme_color: "#0ea5e9",
  orientation: "portrait",
  categories: ["finance"],
  icons: [{ src: "data:image/svg+xml;base64," + btoa('<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><rect width="512" height="512" rx="112" fill="#f0f2f5"/><path d="M256 100 L160 300 L240 300 L200 412 L352 212 L272 212 Z" fill="#0ea5e9"/></svg>'), sizes: "512x512", type: "image/svg+xml", purpose: "any maskable" }]
});
function genId(p) {
  const c = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let id = p + "-";
  for (let i = 0; i < 6; i++) id += c[Math.floor(Math.random() * c.length)];
  return id;
}
__name(genId, "genId");
var COIN_LIST = [
  { id: "bitcoin", sym: "BTC", name: "Bitcoin", tv: "BINANCE:BTCUSDT" },
  { id: "ethereum", sym: "ETH", name: "Ethereum", tv: "BINANCE:ETHUSDT" },
  { id: "binancecoin", sym: "BNB", name: "BNB", tv: "BINANCE:BNBUSDT" },
  { id: "solana", sym: "SOL", name: "Solana", tv: "BINANCE:SOLUSDT" },
  { id: "ripple", sym: "XRP", name: "XRP", tv: "BINANCE:XRPUSDT" },
  { id: "cardano", sym: "ADA", name: "Cardano", tv: "BINANCE:ADAUSDT" },
  { id: "dogecoin", sym: "DOGE", name: "Dogecoin", tv: "BINANCE:DOGEUSDT" },
  { id: "polkadot", sym: "DOT", name: "Polkadot", tv: "BINANCE:DOTUSDT" },
  { id: "avalanche-2", sym: "AVAX", name: "Avalanche", tv: "BINANCE:AVAXUSDT" },
  { id: "chainlink", sym: "LINK", name: "Chainlink", tv: "BINANCE:LINKUSDT" },
  { id: "matic-network", sym: "MATIC", name: "Polygon", tv: "BINANCE:MATICUSDT" },
  { id: "litecoin", sym: "LTC", name: "Litecoin", tv: "BINANCE:LTCUSDT" },
  { id: "tron", sym: "TRX", name: "TRON", tv: "BINANCE:TRXUSDT" },
  { id: "cosmos", sym: "ATOM", name: "Cosmos", tv: "BINANCE:ATOMUSDT" },
  { id: "shiba-inu", sym: "SHIB", name: "Shiba Inu", tv: "BINANCE:SHIBUSDT" },
  { id: "usd-coin", sym: "USDC", name: "USD Coin", tv: "BINANCE:USDCUSDT" },
  { id: "uniswap", sym: "UNI", name: "Uniswap", tv: "BINANCE:UNIUSDT" },
  { id: "aptos", sym: "APT", name: "Aptos", tv: "BINANCE:APTUSDT" },
  { id: "filecoin", sym: "FIL", name: "Filecoin", tv: "BINANCE:FILUSDT" },
  { id: "near", sym: "NEAR", name: "NEAR", tv: "BINANCE:NEARUSDT" },
  { id: "harz", sym: "HARZ", name: "HARZcoin", tv: null },
  { id: "gdeg", sym: "GDEG", name: "Golden Degree Token", tv: null },
  { id: "nrl", sym: "NRL", name: "Neural Protocol Token", tv: null },
  { id: "stellar", sym: "XLM", name: "Stellar", tv: "BINANCE:XLMUSDT" },
  { id: "internet-computer", sym: "ICP", name: "Internet Computer", tv: "BINANCE:ICPUSDT" },
  { id: "arbitrum", sym: "ARB", name: "Arbitrum", tv: "BINANCE:ARBUSDT" },
  { id: "optimism", sym: "OP", name: "Optimism", tv: "BINANCE:OPUSDT" },
  { id: "injective-protocol", sym: "INJ", name: "Injective", tv: "BINANCE:INJUSDT" },
  { id: "sui", sym: "SUI", name: "Sui", tv: "BINANCE:SUIUSDT" },
  { id: "pepe", sym: "PEPE", name: "Pepe", tv: "BINANCE:PEPEUSDT" },
  { id: "the-graph", sym: "GRT", name: "The Graph", tv: "BINANCE:GRTUSDT" },
  { id: "vechain", sym: "VET", name: "VeChain", tv: "BINANCE:VETUSDT" },
  { id: "hedera-hashgraph", sym: "HBAR", name: "Hedera", tv: "BINANCE:HBARUSDT" }
];
var COIN_JSON = JSON.stringify(COIN_LIST.map((c) => ({ id: c.id, sym: c.sym, name: c.name, tv: c.tv })));
function buildHTML(ngnRate) {
  return `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<meta name="theme-color" content="#f0f2f5">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="HARZ Exchange">
<link rel="manifest" href="/manifest.json"><link rel="icon" type="image/svg+xml" href="/icon.svg"><link rel="apple-touch-icon" href="/icon.svg">
<script src="https://s3.tradingview.com/tv.js"><\/script>
<title>HARZ Exchange \u2014 OTC Buy &amp; Sell Desk</title>
<style>
*{margin:0;padding:0;box-sizing:border-box;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;-webkit-tap-highlight-color:transparent}
body{background:#f0f2f5;color:#1e293b;min-height:100vh;padding-bottom:60px}
.hdr{background:linear-gradient(135deg,#ffffff,#e8f4fd);padding:14px;position:sticky;top:0;z-index:100;border-bottom:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center}
.hdr h1{font-size:1.1rem;font-weight:800;color:#0ea5e9}
.hdr .sub{font-size:.6rem;color:#64748b;margin-top:1px}
.container{max-width:600px;margin:0 auto;padding:8px}
.tabs{display:flex;gap:4px;margin-bottom:10px;overflow-x:auto;-webkit-overflow-scrolling:touch}
.tab{padding:8px 12px;background:#ffffff;border:1px solid #e2e8f0;border-radius:8px;font-size:.78rem;color:#64748b;white-space:nowrap;cursor:pointer;flex-shrink:0}
.tab.active{background:#0ea5e9;color:#fff;border-color:#0ea5e9;font-weight:600}
.search-box{width:100%;padding:11px 14px;background:#ffffff;border:1px solid #e2e8f0;border-radius:10px;color:#1e293b;font-size:.9rem;margin-bottom:10px}
.search-box:focus{outline:none;border-color:#0ea5e9}
.coin-row{display:flex;align-items:center;gap:10px;padding:12px;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;margin-bottom:6px;cursor:pointer}
.coin-row:active{border-color:#0ea5e9}
.coin-icon{width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.7rem;font-weight:800;flex-shrink:0;color:#fff}
.coin-info{flex:1;min-width:0}
.coin-name{font-size:.88rem;font-weight:700;color:#1e293b}
.coin-sub{font-size:.68rem;color:#64748b;margin-top:1px}
.coin-price{text-align:right;flex-shrink:0}
.coin-usd{font-size:.88rem;font-weight:700;color:#1e293b}
.coin-ngn{font-size:.68rem;color:#64748b;margin-top:1px}
.chg{font-size:.72rem;font-weight:600}
.up{color:#4ade80}.dn{color:#f87171}
.section{background:#ffffff;border:1px solid #e2e8f0;border-radius:14px;padding:14px;margin-bottom:10px}
.section h2{font-size:.78rem;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px}
.form-group{margin-bottom:10px}
.form-group label{display:block;font-size:.72rem;color:#94a3b8;margin-bottom:4px}
.form-group input,.form-group select{width:100%;padding:11px;background:#ffffff;border:1px solid #e2e8f0;border-radius:10px;color:#1e293b;font-size:.9rem}
.form-group input:focus,.form-group select:focus{outline:none;border-color:#0ea5e9}
.btn{width:100%;padding:14px;border:none;border-radius:12px;font-size:.92rem;font-weight:700;cursor:pointer}
.btn-buy{background:#16a34a;color:#fff}
.btn-sell{background:#dc2626;color:#fff}
.btn-primary{background:#0ea5e9;color:#fff}
.btn-wallet{background:#f59e0b;color:#fff}
.result{padding:10px;border-radius:10px;font-size:.82rem;margin-top:8px;display:none}
.result.ok{border:1px solid #4ade80;color:#4ade80}
.result.err{border:1px solid #f87171;color:#f87171}
.result.loading{border:1px solid #0ea5e9;color:#0ea5e9}
.pf-row{display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #e2e8f0;font-size:.82rem}
.pf-row:last-child{border-bottom:none}
.pf-row .sym{font-weight:700;color:#1e293b}
.pf-row .amt{color:#94a3b8}
.pf-row .val{color:#0ea5e9;font-weight:600}
.badge{background:#eef2f7;font-size:.58rem;padding:2px 6px;border-radius:6px;color:#64748b;font-weight:600}
.badge.edge{background:#312e81;color:#a5b4fc}
.loading-msg{text-align:center;padding:30px;color:#64748b;font-size:.82rem}
.error-msg{text-align:center;padding:20px;color:#f87171;font-size:.82rem}
.wallet-box{background:#ffffff;border:1px solid #e2e8f0;border-radius:10px;padding:12px;margin-bottom:10px}
.wallet-addr{font-size:.72rem;color:#0ea5e9;word-break:break-all;margin-top:4px}
.wallet-bal{font-size:.78rem;color:#4ade80;margin-top:6px}
.footer{text-align:center;padding:14px;font-size:.65rem;color:#475569}
.nav{position:fixed;bottom:0;left:0;right:0;display:flex;background:#ffffff;border-top:1px solid #e2e8f0;z-index:100}
.nav-item{flex:1;text-align:center;padding:8px 0;text-decoration:none;color:#64748b;font-size:.68rem}
.nav-item span{font-size:1.1rem;display:block}
#tv_chart{height:380px;border-radius:10px;overflow:hidden}
.chart-coin-info{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}
.chart-coin-name{font-size:1rem;font-weight:700;color:#1e293b}
.chart-coin-price{font-size:1.2rem;font-weight:800;color:#0ea5e9}
</style></head><body>
<div class="hdr">
<div><h1>HARZ Exchange</h1><div class="sub">OTC Buy/Sell Desk | Live market prices</div></div>
<div><span style="font-size:.62rem;color:#64748b" id="ngn-badge">NGN/USD loading...</span></div>
</div>
<div class="container">

<div class="tabs">
<div class="tab active" data-tab="markets" onclick="showTab('markets')">Markets</div>
<div class="tab" data-tab="chart" onclick="showTab('chart')">Chart</div>
<div class="tab" data-tab="trade" onclick="showTab('trade')">Trade</div>
<div class="tab" data-tab="wallet" onclick="showTab('wallet')">Wallet</div>
<div class="tab" data-tab="portfolio" onclick="showTab('portfolio')">Portfolio</div>
<div class="tab" data-tab="p2p" onclick="showTab('p2p')">P2P</div>
</div>

<div id="tab-markets">
<input class="search-box" type="search" placeholder="Search coins..." oninput="filterCoins(this.value)">
<div id="markets-list"><div class="loading-msg">Loading live prices from HARZSwap...</div></div><p style="font-size:.66rem;color:#64748b;margin-top:8px">All prices are live market rates from the HARZSwap oracle \u2014 pool-derived for HARZ/GDEG/NRL, global market for the rest. No fixed pricing.</p>
</div>

<div id="tab-chart" style="display:none">
<div class="section">
<div class="chart-coin-info">
<div><div class="chart-coin-name" id="ch-name">Bitcoin (BTC)</div><div class="chg" id="ch-chg"></div></div>
<div style="text-align:right"><div class="chart-coin-price" id="ch-price">$0</div><div style="font-size:.68rem;color:#64748b" id="ch-ngn"></div></div>
</div>
<div id="tv_chart"></div>
<div style="margin-top:8px;font-size:.72rem;color:#64748b">Powered by TradingView | Tap chart for RSI, MACD, Bollinger Bands & more indicators</div>
</div>
</div>

<div id="tab-trade" style="display:none">
<div class="section">
<h2>Buy Crypto with NGN</h2><p style="font-size:.72rem;color:#64748b;margin-bottom:12px">Secure checkout by Paystack \u2014 card, bank, or USSD. Coins credit automatically when payment confirms. No API key needed.</p>
<div class="form-group"><label>Select Coin</label><select id="buy-coin" onchange="updateL1Note()"></select></div>
<div class="form-group"><label>Amount (NGN)</label><input type="number" id="buy-ngn" placeholder="5000" inputmode="decimal" oninput="calcBuy()"></div>
<div class="form-group"><label>You Receive</label><input type="text" id="buy-recv" readonly style="color:#0ea5e9;font-weight:600"></div>
<div class="form-group"><label>Phone Number</label><input type="tel" id="buy-phone" placeholder="0802..." inputmode="tel"></div>
<div class="form-group"><label>Email (optional, for your receipt)</label><input type="email" id="buy-email" placeholder="you@email.com"></div>
<button class="btn btn-buy" onclick="placeBuy()">Buy Now</button>
<div class="result" id="buy-result"></div><div id="l1-route" style="display:none;margin-top:10px;padding:10px;border:1px solid #bae6fd;background:#f0f9ff;border-radius:10px;font-size:.74rem;color:#0369a1"><b>On-chain alternative:</b> HARZ, GDEG and NRL trade 24/7 peer-to-pool on <b>HARZSwap</b> \u2014 our own DEX on HARZ Chain. Instant signed swaps against live pool liquidity, no bank steps.<br><a href="https://harz-swap.harz.workers.dev/" style="color:#0369a1;font-weight:600">Open HARZSwap \u2192</a></div>
</div>
<div class="section">
<h2>Sell Crypto for NGN \u2014 OTC Desk</h2><p style="font-size:.72rem;color:#64748b;margin-bottom:12px">Desk-settled order: our team verifies your transfer and pays your NGN to your bank account.</p>
<div class="form-group"><label>Select Coin</label><select id="sell-coin" onchange="updateL1Note()"></select></div>
<div class="form-group"><label>Amount to Sell</label><input type="number" id="sell-amt" placeholder="0.001" step="0.00000001" inputmode="decimal" oninput="calcSell()"></div>
<div class="form-group"><label>You Receive (NGN)</label><input type="text" id="sell-recv" readonly style="color:#0ea5e9;font-weight:600"></div>
<div class="form-group"><label>Phone Number</label><input type="tel" id="sell-phone" placeholder="0802..." inputmode="tel"></div>
<button class="btn btn-sell" onclick="placeSell()">Sell Now</button>
<div class="result" id="sell-result"></div>
</div>
</div>

<div id="tab-wallet" style="display:none">
<div class="section">
<h2>Connect Wallet</h2>
<div id="wallet-status">
<p style="font-size:.82rem;color:#94a3b8;margin-bottom:12px">Connect MetaMask or Trust Wallet to view balances (read-only).</p>
<button class="btn btn-wallet" onclick="connectWallet()">Connect MetaMask</button>
</div>
<div id="wallet-display" style="display:none">
<div class="wallet-box">
<div style="font-size:.72rem;color:#64748b">Connected Address</div>
<div class="wallet-addr" id="w-addr"></div>
<div class="wallet-bal" id="w-bal"></div>
</div>
<div style="margin-top:10px" id="w-tokens"></div>
</div>
</div>
<div class="section">
<h2>Deposit / Withdraw</h2>
<div class="form-group"><label>Phone (Account ID)</label><input type="tel" id="w-phone" placeholder="0802..." inputmode="tel"></div>
<div class="form-group"><label>Action</label>
<select id="w-action"><option value="deposit">Deposit NGN (Paystack)</option><option value="withdraw">Withdraw NGN</option></select>
</div>
<div class="form-group"><label>Amount (NGN)</label><input type="number" id="w-amount" placeholder="5000" inputmode="decimal"></div>
<button class="btn btn-primary" onclick="walletAction()">Submit</button>
<div class="result" id="w-result"></div>
</div>
</div>

<div id="tab-p2p" style="display:none">
<div class="section">
<h2>P2P Market</h2><p style="font-size:.72rem;color:#64748b;margin-bottom:12px">Trade directly with other users. Pay via Paystack checkout; seller releases coins once payment confirms. Every order is recorded.</p>
<div id="p2p-board" style="max-height:340px;overflow-y:auto"></div>
</div>
<div class="section">
<h2>Post a Sell Offer</h2>
<div class="form-group"><label>Coin</label><select id="po-coin"></select></div>
<div class="form-group"><label>Amount to Sell</label><input type="number" id="po-amount" placeholder="0.01" step="0.00000001" inputmode="decimal"></div>
<div class="form-group"><label>Price per coin (NGN)</label><input type="number" id="po-rate" placeholder="Set your price" inputmode="decimal"></div>
<div class="form-group"><label>Your Phone (buyers contact you)</label><input type="tel" id="po-phone" placeholder="0802..." inputmode="tel"></div>
<button class="btn btn-buy" onclick="postOffer()">Post Offer</button>
<div class="result" id="po-result"></div>
</div>
<div class="section">
<h2>My Offers \u0026 Orders</h2>
<div class="form-group"><label>Phone</label><input type="tel" id="my-phone" placeholder="0802..." inputmode="tel"></div>
<button class="btn btn-buy" onclick="loadMyOffers()">Load My Offers</button>
<div id="my-offers" style="margin-top:10px"></div>
</div>
</div>

<div id="tab-portfolio" style="display:none">
<div class="section">
<h2>Your Portfolio</h2>
<div class="form-group"><label>Phone Number</label><input type="tel" id="pf-phone" placeholder="0802..." inputmode="tel"></div>
<button class="btn btn-primary" onclick="loadPortfolio()">View Portfolio</button>
</div>
<div id="pf-display"></div>
</div>

<div class="footer">
HARZ Exchange v6.1 | OTC Desk + Paystack checkout + P2P market | NGN rate: \u20A6${ngnRate.toLocaleString()}<br>
WhatsApp: 08028687857 | CAC RC: 321424
</div>
</div>

<div class="nav">
<a class="nav-item active" href="#"><span>\u{1F4B1}</span>Exchange</a>
<a class="nav-item" href="https://harz-apex-bank.harz.workers.dev"><span>\u{1F3E8}</span>Apex</a>
<a class="nav-item" href="https://harz-fx.harz.workers.dev"><span>\u{1F4B0}</span>FX</a>
<a class="nav-item" href="https://harz-crypto-wallet.harz.workers.dev"><span>\u{1F451}</span>Wallet</a>
</div>

<script>
const COINS = ${COIN_JSON};
let ngnRate = ${ngnRate};
let prices = {};
let selectedCoin = COINS[0];
let tvWidget = null;

// ============ NGN RATE ============
async function loadNGN() {
  try {
    const r = await fetch('/api/ngn');
    const d = await r.json();
    ngnRate = d.ngn || ngnRate;
    document.getElementById('ngn-badge').textContent = '\u20A6' + ngnRate.toLocaleString() + '/$';
  } catch(e) { document.getElementById('ngn-badge').textContent = '\u20A6' + ngnRate.toLocaleString() + '/$'; }
}

// ============ MARKETS (client-side, prices via HARZSwap oracle) ============
async function loadMarkets() {
  const el = document.getElementById('markets-list');
  el.innerHTML = '<div class="loading-msg">Loading live prices from HARZSwap...</div>';
  try {
    const controller = new AbortController();
    const timeout = setTimeout(function() { controller.abort(); }, 15000);
    const r = await fetch('https://harz-swap.harz.workers.dev/api/prices', {signal: controller.signal});
    clearTimeout(timeout);
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const data = await r.json();
    const hp = data.prices || {};
    prices = {};
    COINS.forEach(function(c) {
      const p = hp[c.sym];
      prices[c.id] = p ? {
        usd: p.priceUSD || 0,
        usd_24h_change: p.change24h || 0,
        usd_24h_vol: p.volume24h || 0,
        usd_market_cap: 0
      } : { usd: 0, usd_24h_change: 0, usd_24h_vol: 0, usd_market_cap: 0 };
    });
    renderMarkets();
    populateSelectors();
    if (selectedCoin) selectCoin(selectedCoin.id);
  } catch(e) {
    el.innerHTML = '<div class="error-msg">Could not load live prices.<br>This may be a temporary network issue.<br><br><button class="btn btn-primary" onclick="loadMarkets()">Retry</button></div>';
  }
}

function renderMarkets() {
  const el = document.getElementById('markets-list');
  el.innerHTML = COINS.filter(function(c) { const p = prices[c.id]; return p && p.usd > 0; }).map(function(c) {
    const p = prices[c.id];
    if (!p) return '';
    const usd = p.usd || 0;
    const chg = p.usd_24h_change || 0;
    const chgCls = chg >= 0 ? 'up' : 'dn';
    const chgSign = chg >= 0 ? '+' : '';
    const ngn = usd * ngnRate;
    const usdStr = usd >= 1 ? usd.toLocaleString(undefined,{maximumFractionDigits:2}) : usd.toFixed(6);
    const ngnStr = ngn.toLocaleString(undefined,{maximumFractionDigits:0});
    const color = COIN_COLORS[c.sym] || '#0ea5e9';
    return '<div class="coin-row" onclick="selectCoin(' + "'" + c.id + "'" + ')">' +
      '<div class="coin-icon" style="background:' + color + '">' + c.sym.slice(0,3) + '</div>' +
      '<div class="coin-info"><div class="coin-name">' + c.sym + '</div><div class="coin-sub">' + c.name + '</div></div>' +
      '<div class="coin-price"><div class="coin-usd">$' + usdStr + '</div><div class="coin-ngn">\u20A6' + ngnStr + '</div><div class="chg ' + chgCls + '">' + chgSign + chg.toFixed(2) + '%</div></div>' +
      '</div>';
  }).join('');
}

const COIN_COLORS = {BTC:'#f7931a',ETH:'#627eea',BNB:'#f3ba2f',SOL:'#9945ff',XRP:'#23292f',ADA:'#0033ad',DOGE:'#c2a633',DOT:'#e6007a',AVAX:'#e84142',LINK:'#2a5ada',MATIC:'#8247e5',LTC:'#345d9d',TRX:'#ff060a',ATOM:'#2e3148',SHIB:'#f00500',USDC:'#2775ca',UNI:'#ff007a',APT:'#06f',FIL:'#0096d6',NEAR:'#00ec97',ICP:'#29b6f6',XLM:'#14b6e6',ARB:'#28a0f0',OP:'#ff0420',INJ:'#00d2ff',SUI:'#4da2ff',PEPE:'#4ca64c',GRT:'#6747ff',VET:'#15bdff',HBAR:'#000'};

function filterCoins(q) {
  q = q.toLowerCase();
  document.querySelectorAll('.coin-row').forEach(function(row, i) {
    const c = COINS[i];
    if (!c) return;
    const text = (c.name + ' ' + c.sym).toLowerCase();
    row.style.display = text.indexOf(q) > -1 ? 'flex' : 'none';
  });
}

function updateL1Note() {
  const v = (document.getElementById('buy-coin')||{}).value;
  const panel = document.getElementById('l1-route');
  if (panel) panel.style.display = (v === 'harz' || v === 'gdeg' || v === 'nrl') ? 'block' : 'none';
}
function populateSelectors() {
  const opts = COINS.filter(function(c) { const p = prices[c.id]; return p && p.usd > 0; }).map(function(c) {
    const p = prices[c.id];
    const price = p ? '$' + (p.usd >= 1 ? p.usd.toLocaleString(undefined,{maximumFractionDigits:2}) : p.usd.toFixed(6)) : '';
    return '<option value="' + c.id + '">' + c.sym + ' ' + price + '</option>';
  }).join('');
  document.getElementById('buy-coin').innerHTML = opts;
  document.getElementById('sell-coin').innerHTML = opts;
  updateL1Note();
}

// ============ CHART (TradingView) ============
function selectCoin(id) {
  const coin = COINS.find(function(c) { return c.id === id });
  if (!coin) return;
  selectedCoin = coin;
  showTab('chart');
  document.getElementById('ch-name').textContent = coin.name + ' (' + coin.sym + ')';
  const p = prices[coin.id];
  if (p) {
    const usd = p.usd || 0;
    document.getElementById('ch-price').textContent = '$' + (usd >= 1 ? usd.toLocaleString(undefined,{maximumFractionDigits:2}) : usd.toFixed(6));
    document.getElementById('ch-ngn').textContent = '\u20A6' + (usd * ngnRate).toLocaleString(undefined,{maximumFractionDigits:0}) + ' NGN';
    const chg = p.usd_24h_change || 0;
    const el = document.getElementById('ch-chg');
    el.textContent = (chg >= 0 ? '+' : '') + chg.toFixed(2) + '% (24h)';
    el.className = 'chg ' + (chg >= 0 ? 'up' : 'dn');
  }
  loadTradingView(coin.tv);
}

function loadTradingView(symbol) {
  const container = document.getElementById('tv_chart');
  container.innerHTML = '';
  if (!symbol) {
    container.innerHTML = '<div class="loading-msg" style="padding:40px">No public chart for HARZ ecosystem coins yet. Their price forms live on HARZ Chain L1 pools \u2014 see the Pools on HARZSwap.</div>';
    return;
  }
  if (typeof TradingView === 'undefined') {
    container.innerHTML = '<div class="error-msg" style="padding:40px">TradingView chart failed to load. Check your internet connection.</div>';
    return;
  }
  tvWidget = new TradingView.widget({
    container_id: 'tv_chart',
    symbol: symbol,
    interval: '60',
    theme: 'light',
    style: '1',
    locale: 'en',
    hide_side_toolbar: false,
    allow_symbol_change: true,
    studies: ['RSI@tv-basicstudies', 'MACD@tv-basicstudies', 'MASimple@tv-basicstudies'],
    autosize: true
  });
}

// ============ TRADE ============
function calcBuy() {
  const ngn = parseFloat(document.getElementById('buy-ngn').value) || 0;
  const coinId = document.getElementById('buy-coin').value;
  const p = prices[coinId];
  if (!p) { document.getElementById('buy-recv').value = 'Prices loading...'; return; }
  const usd = ngn / ngnRate;
  const recv = usd / p.usd;
  const coin = COINS.find(function(c) { return c.id === coinId });
  document.getElementById('buy-recv').value = recv.toFixed(8) + ' ' + (coin ? coin.sym : '');
}

function calcSell() {
  const amt = parseFloat(document.getElementById('sell-amt').value) || 0;
  const coinId = document.getElementById('sell-coin').value;
  const p = prices[coinId];
  if (!p) { document.getElementById('sell-recv').value = 'Prices loading...'; return; }
  const usd = amt * p.usd;
  const ngn = usd * ngnRate;
  document.getElementById('sell-recv').value = '\u20A6' + ngn.toLocaleString(undefined,{maximumFractionDigits:0});
}

async function placeBuy() {
  const coinId = document.getElementById('buy-coin').value;
  const ngn = parseFloat(document.getElementById('buy-ngn').value);
  const phone = document.getElementById('buy-phone').value.trim();
  const el = document.getElementById('buy-result');
  const coin = COINS.find(function(c) { return c.id === coinId });
  const p = prices[coinId];
  if (!coin || !p) { showResult(el, 'err', 'Prices still loading. Wait a moment and try again.'); return; }
  if (!ngn || ngn < 100) { showResult(el, 'err', 'Minimum purchase is \u20A6100'); return; }
  if (!phone || phone.length < 10) { showResult(el, 'err', 'Enter a valid phone number'); return; }
  showResult(el, 'loading', 'Processing order...');
  try {
    const r = await fetch('/api/buy', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({coin:coinId,symbol:coin.sym,ngn_amount:ngn,phone:phone,email:document.getElementById('buy-email').value.trim(),price:p.usd})});
    const d = await r.json();
    if (d.success) {
      showResult(el, 'ok', 'Order ' + d.order_id + ' created! Taking you to secure Paystack checkout...'); setTimeout(function(){ location.href = d.checkout_url; }, 900);
    } else { showResult(el, 'err', d.error || 'Order failed'); }
  } catch(e) { showResult(el, 'err', 'Network error. Try again.'); }
}

async function placeSell() {
  const coinId = document.getElementById('sell-coin').value;
  const amt = parseFloat(document.getElementById('sell-amt').value);
  const phone = document.getElementById('sell-phone').value.trim();
  const el = document.getElementById('sell-result');
  const coin = COINS.find(function(c) { return c.id === coinId });
  const p = prices[coinId];
  if (!coin || !p) { showResult(el, 'err', 'Prices still loading. Wait a moment and try again.'); return; }
  if (!amt || amt <= 0) { showResult(el, 'err', 'Enter amount to sell'); return; }
  if (!phone || phone.length < 10) { showResult(el, 'err', 'Enter a valid phone number'); return; }
  showResult(el, 'loading', 'Processing sell order...');
  try {
    const r = await fetch('/api/sell', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({coin:coinId,symbol:coin.sym,amount:amt,phone:phone,price:p.usd})});
    const d = await r.json();
    if (d.success) {
      showResult(el, 'ok', 'Sell order ' + d.order_id + ' created!<br>Send ' + d.crypto_amount + ' ' + coin.sym + ' to our wallet<br>Receive: \u20A6' + d.ngn_payout.toLocaleString() + '<br>We\\'ll credit your account within 10 minutes');
    } else { showResult(el, 'err', d.error || 'Order failed'); }
  } catch(e) { showResult(el, 'err', 'Network error. Try again.'); }
}

// ============ WALLET (MetaMask) ============
let walletAddress = null;

async function connectWallet() {
  if (typeof window.ethereum === 'undefined') {
    document.getElementById('wallet-status').innerHTML = '<p style="font-size:.82rem;color:#f87171;margin-bottom:12px">MetaMask not found. Install MetaMask or Trust Wallet browser, or open this page inside Trust Wallet\\'s DApp browser.</p><p style="font-size:.78rem;color:#94a3b8">On mobile: open Trust Wallet, tap Browser, and visit: harz-exchange.harz.workers.dev</p>';
    return;
  }
  try {
    const accounts = await window.ethereum.request({method:'eth_requestAccounts'});
    walletAddress = accounts[0];
    document.getElementById('wallet-status').style.display = 'none';
    document.getElementById('wallet-display').style.display = 'block';
    document.getElementById('w-addr').textContent = walletAddress;
    // Get ETH balance
    const bal = await window.ethereum.request({method:'eth_getBalance',params:[walletAddress,'latest']});
    const ethBal = parseInt(bal, 16) / 1e18;
    document.getElementById('w-bal').textContent = 'ETH: ' + ethBal.toFixed(6);
    // Show token balances
    loadTokenBalances();
  } catch(e) {
    document.getElementById('wallet-status').innerHTML = '<p style="font-size:.82rem;color:#f87171">Connection rejected or failed: ' + e.message + '</p>';
  }
}

function loadTokenBalances() {
  const el = document.getElementById('w-tokens');
  el.innerHTML = '<div style="font-size:.72rem;color:#64748b;margin-bottom:8px">Token balances require a wallet with token list. Your connected wallet can be used to send/receive crypto for trades.</div>';
}

async function walletAction() {
  const phone = document.getElementById('w-phone').value.trim();
  const action = document.getElementById('w-action').value;
  const amount = parseFloat(document.getElementById('w-amount').value);
  const el = document.getElementById('w-result');
  if (!phone || phone.length < 10) { showResult(el, 'err', 'Enter phone number'); return; }
  if (!amount || amount < 100) { showResult(el, 'err', 'Min \u20A6100'); return; }
  showResult(el, 'loading', 'Processing...');
  try {
    const r = await fetch('/api/wallet', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({phone,action,amount})});
    const d = await r.json();
    if (d.success) {
      if (d.checkout_url) { showResult(el, 'ok', 'Taking you to secure Paystack checkout...'); setTimeout(function(){ location.href = d.checkout_url; }, 900); return; }
      showResult(el, 'ok', 'Withdrawal of \u20A6' + amount.toLocaleString() + ' requested. You\\'ll receive it within 30 minutes to your bank account.');
    } else { showResult(el, 'err', d.error || 'Failed'); }
  } catch(e) { showResult(el, 'err', 'Network error'); }
}

// ============ PORTFOLIO ============
async function loadPortfolio() {
  const phone = document.getElementById('pf-phone').value.trim();
  const el = document.getElementById('pf-display');
  if (!phone) { el.innerHTML = '<div class="error-msg">Enter your phone number</div>'; return; }
  el.innerHTML = '<div class="loading-msg">Loading...</div>';
  try {
    const r = await fetch('/api/portfolio?phone=' + phone);
    const d = await r.json();
    if (d.holdings && d.holdings.length > 0) {
      let html = '<div class="section"><h2>Holdings</h2>';
      d.holdings.forEach(function(h) {
        html += '<div class="pf-row"><div><div class="sym">' + h.symbol + (h.status === 'pending' ? ' <span style="font-size:.6rem;color:#b45309">(payment pending)</span>' : '') + '</div><div class="amt">' + h.amount + '</div></div><div class="val">₦' + h.ngn_value.toLocaleString(undefined,{maximumFractionDigits:0}) + '</div></div>';
      });
      html += '<div class="pf-row" style="margin-top:8px;padding-top:8px;border-top:2px solid #0ea5e9"><div class="sym">TOTAL VALUE <span style="font-size:.6rem;color:#64748b">(incl. pending orders)</span></div><div class="val">\u20A6' + d.total_ngn.toLocaleString(undefined,{maximumFractionDigits:0}) + '</div></div>';
      html += '</div>';
      el.innerHTML = html;
    } else {
      el.innerHTML = '<div class="error-msg">No holdings yet. Buy some crypto first.</div>';
    }
  } catch(e) { el.innerHTML = '<div class="error-msg">Failed to load portfolio</div>'; }
}

// ============ P2P ============
async function loadP2P() {
  const el = document.getElementById('p2p-board');
  if (!el) return;
  try {
    const r = await fetch('/api/p2p/offers'); const d = await r.json();
    if (!d.offers || !d.offers.length) { el.innerHTML = '<div style="color:#64748b;font-size:.8rem">No active offers yet. Post the first one below.</div>'; return; }
    el.innerHTML = d.offers.map(function(o) {
      return '<div class="coin-row" style="padding:10px 0;border-bottom:1px solid #e2e8f0"><div><div class="sym">' + o.symbol + '</div><div style="font-size:.7rem;color:#64748b">' + o.amount + ' ' + o.symbol + ' @ \u20A6' + o.rate_ngn.toLocaleString() + ' each</div></div><div style="text-align:right"><button class="btn btn-buy" style="padding:6px 12px;font-size:.75rem" onclick="p2pTrade(\\'' + o.id + '\\')">Buy</button></div></div>';
    }).join('');
  } catch(e) { el.innerHTML = '<div style="color:#ef4444;font-size:.8rem">Failed to load offers</div>'; }
}
async function p2pTrade(offerId) {
  const ngn = prompt('Amount in NGN to pay (min \u20A6100):');
  if (!ngn || parseFloat(ngn) < 100) { alert('Minimum is \u20A6100'); return; }
  const phone = prompt('Your phone number (seller contacts you here):');
  if (!phone || phone.length < 10) { alert('Enter a valid phone number'); return; }
  try {
    const r = await fetch('/api/p2p/trade', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({offer_id:offerId,phone:phone,ngn_amount:parseFloat(ngn)})});
    const d = await r.json();
    if (d.success && d.checkout_url) { alert('Taking you to secure Paystack checkout...'); location.href = d.checkout_url; }
    else alert(d.error || 'Trade failed');
  } catch(e) { alert('Network error. Try again.'); }
}
async function postOffer() {
  const coinVal = document.getElementById('po-coin').value;
  const parts = coinVal.split('|');
  const amount = parseFloat(document.getElementById('po-amount').value);
  const rate = parseFloat(document.getElementById('po-rate').value);
  const phone = document.getElementById('po-phone').value.trim();
  const el = document.getElementById('po-result');
  if (!amount || amount <= 0 || !rate || rate <= 0) { showResult(el, 'err', 'Enter amount and price'); return; }
  if (!phone || phone.length < 10) { showResult(el, 'err', 'Enter phone number'); return; }
  try {
    const r = await fetch('/api/p2p/offer', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({coin:parts[0],symbol:parts[1],amount:amount,rate_ngn:rate,phone:phone})});
    const d = await r.json();
    if (d.success) { showResult(el, 'ok', 'Offer posted! ID ' + d.offer_id + '. It is live on the P2P board.'); loadP2P(); }
    else showResult(el, 'err', d.error || 'Failed');
  } catch(e) { showResult(el, 'err', 'Network error'); }
}
async function loadMyOffers() {
  const phone = document.getElementById('my-phone').value.trim(); const el = document.getElementById('my-offers');
  if (!phone || phone.length < 10) { el.innerHTML = '<div style="color:#64748b;font-size:.8rem">Enter your phone to view offers and orders.</div>'; return; }
  try {
    const r = await fetch('/api/p2p/my?phone=' + encodeURIComponent(phone)); const d = await r.json();
    let html = '';
    (d.offers||[]).forEach(function(o){ html += '<div style="padding:8px 0;border-bottom:1px solid #e2e8f0;font-size:.78rem"><b>' + o.symbol + '</b> \u2014 ' + o.amount + ' @ \u20A6' + o.rate_ngn.toLocaleString() + ' \u2014 ' + o.status + (o.status==='active'?' <button style="padding:2px 8px;font-size:.68rem;border:1px solid #16a34a;border-radius:6px;background:#f0fdf4;color:#16a34a" onclick="p2pRelease(\\''+o.id+'\\',\\''+phone+'\\')">Mark released/sold</button>':'') + '</div>'; });
    (d.orders||[]).forEach(function(o){ html += '<div style="padding:8px 0;border-bottom:1px solid #e2e8f0;font-size:.78rem">' + o.symbol + ' \u2014 \u20A6' + o.ngn_amount.toLocaleString() + ' \u2014 ' + o.status + '</div>'; });
    el.innerHTML = html || '<div style="color:#64748b;font-size:.8rem">No offers or orders yet.</div>';
  } catch(e) { el.innerHTML = '<div style="color:#ef4444;font-size:.8rem">Failed to load</div>'; }
}
async function p2pRelease(offerId, phone) {
  try {
    const r = await fetch('/api/p2p/release', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({offer_id:offerId,seller_phone:phone})});
    const d = await r.json(); alert(d.success ? 'Offer marked completed.' : (d.error||'Failed')); loadMyOffers(); loadP2P();
  } catch(e) { alert('Network error'); }
}

// ============ HELPERS ============
function showResult(el, type, msg) {
  el.className = 'result ' + type;
  el.innerHTML = msg;
  el.style.display = 'block';
}

function showTab(name) {
  document.querySelectorAll('.tab').forEach(function(t) { t.classList.remove('active'); });
  const tab = document.querySelector('[data-tab="' + name + '"]');
  if (tab) tab.classList.add('active');
  ['markets','chart','trade','wallet','portfolio','p2p'].forEach(function(t) {
    const el = document.getElementById('tab-' + t);
    if (el) el.style.display = t === name ? 'block' : 'none';
  });
  if (name === 'chart' && selectedCoin) loadTradingView(selectedCoin.tv);
}

// ============ INIT ============
loadNGN();
loadMarkets();
  const poSel = document.getElementById('po-coin');
  if (poSel) { COINS.forEach(function(c){ poSel.innerHTML += '<option value="' + c.id + '|' + c.sym + '">' + c.name + '</option>'; }); loadP2P(); }
setInterval(loadMarkets, 60000);
if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(function(){});
<\/script>
</body></html>`;
}
__name(buildHTML, "buildHTML");
async function getNGN(env) {
  try {
    const r = (env && env.SWAP) ? await env.SWAP.fetch("https://swap.internal/api/ngn") : await fetch("https://harz-swap.harz.workers.dev/api/ngn");
    if (r.ok) {
      const d = await r.json();
      if (d.ngn) return d.ngn;
    }
  } catch (e) {
  }
  return 1329.17076;
}
__name(getNGN, "getNGN");
var harz_exchange_v5_secured_default = {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET,POST,OPTIONS", "Access-Control-Allow-Headers": "Content-Type,X-API-Key" };
    if (request.method === "OPTIONS") return new Response(null, { headers: cors });
    function checkAuth(request2) {
      const apiKey = request2.headers.get("X-API-Key") || new URL(request2.url).searchParams.get("api_key");
      if (!apiKey || apiKey !== (typeof env !== "undefined" && env.HARZ_API_KEY)) {
        return false;
      }
      return true;
    }
    __name(checkAuth, "checkAuth");
    if (path === "/icon.svg") return new Response('<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><rect width="512" height="512" rx="112" fill="#f0f2f5"/><path d="M256 100 L160 300 L240 300 L200 412 L352 212 L272 212 Z" fill="#0ea5e9"/></svg>', { headers: { "Content-Type": "image/svg+xml" } });
    if (path === "/manifest.json") return new Response(MANIFEST, { headers: { "Content-Type": "application/manifest+json", ...cors } });
    if (path === "/sw.js") return new Response(SW_CODE, { headers: { "Content-Type": "application/javascript", ...cors } });
    if (path === "/api/health") {
      return Response.json({ service: "HARZ Exchange", version: "6.1.0", status: "live", coins: COIN_LIST.length, model: "OTC desk with Paystack checkout (buys auto-settle) + P2P market + desk-settled sell payouts", onchain_dex: "https://harz-swap.harz.workers.dev", features: ["otc_buy_sell_desk", "tradingview_charts", "harzswap_oracle_prices", "harzswap_l1_onchain_route", "metamask_read_only_balances", "ngn_otc", "portfolio", "paystack_checkout", "p2p_market", "no_api_key_for_customers"] }, { headers: cors });
    }
    if (path === "/api/ngn") {
      const ngn = await getNGN(env);
      return Response.json({ ngn }, { headers: cors });
    }
    async function psInit(env2, ngnAmount, ref, metadata, emailHint) {
      const email = (typeof emailHint === "string" && emailHint.includes("@")) ? emailHint : ((emailHint || "customer") + "@harz.dev");
      const r = await fetch("https://api.paystack.co/transaction/initialize", { method: "POST", headers: { Authorization: "Bearer " + (env2.PAYSTACK_SK || ""), "Content-Type": "application/json", "User-Agent": "HARZExchange/6.1 (+https://harz-exchange.harz.workers.dev)" }, body: JSON.stringify({ email: email, amount: Math.round(ngnAmount * 100), reference: ref, currency: "NGN", metadata: metadata, callback_url: "https://harz-exchange.harz.workers.dev/?tab=portfolio&paid=" + ref }) });
      return r.json();
    }
    __name(psInit, "psInit");
    if (path === "/api/buy" && request.method === "POST") {
      const body = await request.json();
      const coinId = body.coin;
      const symbol = body.symbol;
      const ngnAmount = parseFloat(body.ngn_amount);
      const phone = body.phone?.trim();
      const price = parseFloat(body.price) || 0;
      if (!phone || phone.length < 10) return Response.json({ error: "Valid phone required" }, { headers: cors });
      if (!ngnAmount || ngnAmount < 100) return Response.json({ error: "Min \u20A6100" }, { headers: cors });
      if (!price) return Response.json({ error: "Price not available. Refresh the page and try again." }, { headers: cors });
      const ngnRate = await getNGN(env);
      const cryptoAmount = ngnAmount / (price * ngnRate);
      const orderId = genId("BUY");
      const order = { id: orderId, type: "buy", coin: coinId, symbol, ngn_amount: ngnAmount, crypto_amount: cryptoAmount.toFixed(8), rate: price, ngn_rate: ngnRate, phone, status: "awaiting_payment", created_at: (new Date()).toISOString() };
      await env.EXCHANGE_KV.put("order:" + orderId, JSON.stringify(order));
      const idx = await env.EXCHANGE_KV.get("orders:" + phone, "json") || [];
      idx.push({ id: orderId, type: "buy", symbol, ngn_amount: ngnAmount, status: "awaiting_payment", created_at: order.created_at });
      await env.EXCHANGE_KV.put("orders:" + phone, JSON.stringify(idx));
      const ps = await psInit(env, ngnAmount, orderId, { type: "otc_buy", phone }, body.email || phone);
      if (!ps.status || !(ps.data || {}).authorization_url) return Response.json({ error: "Payment gateway unavailable. Please try again in a moment." }, { status: 502, headers: cors });
      return Response.json({ success: true, order_id: orderId, ngn_amount: ngnAmount, crypto_amount: cryptoAmount.toFixed(8), rate: price, checkout_url: ps.data.authorization_url }, { headers: cors });
    }
    if (path === "/api/sell" && request.method === "POST") {
      const body = await request.json();
      const coinId = body.coin;
      const symbol = body.symbol;
      const amount = parseFloat(body.amount);
      const phone = body.phone?.trim();
      const price = parseFloat(body.price) || 0;
      if (!phone || phone.length < 10) return Response.json({ error: "Valid phone required" }, { headers: cors });
      if (!amount || amount <= 0) return Response.json({ error: "Enter amount" }, { headers: cors });
      if (!price) return Response.json({ error: "Price not available. Refresh and try again." }, { headers: cors });
      const ngnRate = await getNGN(env);
      const ngnPayout = amount * price * ngnRate;
      const orderId = genId("SELL");
      const order = { id: orderId, type: "sell", coin: coinId, symbol, crypto_amount: amount.toFixed(8), ngn_payout: ngnPayout, rate: price, ngn_rate: ngnRate, phone, status: "pending", created_at: (/* @__PURE__ */ new Date()).toISOString() };
      await env.EXCHANGE_KV.put("order:" + orderId, JSON.stringify(order));
      const idx = await env.EXCHANGE_KV.get("orders:" + phone, "json") || [];
      idx.push({ id: orderId, type: "sell", symbol, ngn_payout: ngnPayout, status: "pending", created_at: order.created_at });
      await env.EXCHANGE_KV.put("orders:" + phone, JSON.stringify(idx));
      const holdings = await env.EXCHANGE_KV.get("holdings:" + phone, "json") || [];
      let existing = holdings.find(function(h) {
        return h.coin === coinId;
      });
      if (existing) {
        existing.amount = Math.max(0, parseFloat(existing.amount) - amount).toFixed(8);
        existing.ngn_value = parseFloat(existing.amount) * price * ngnRate;
      }
      await env.EXCHANGE_KV.put("holdings:" + phone, JSON.stringify(holdings));
      return Response.json({ success: true, order_id: orderId, crypto_amount: amount.toFixed(8), ngn_payout: ngnPayout, rate: price }, { headers: cors });
    }
    if (path === "/api/portfolio" && request.method === "GET") {
      const phone = url.searchParams.get("phone");
      if (!phone) return Response.json({ error: "Phone required" }, { headers: cors });
      const holdings = await env.EXCHANGE_KV.get("holdings:" + phone, "json") || [];
      let total = 0;
      holdings.forEach(function(h) {
        total += h.ngn_value || 0;
      });
      return Response.json({ phone, holdings, total_ngn: total }, { headers: cors });
    }
    if (path === "/api/wallet" && request.method === "POST") {
      const body = await request.json();
      const phone = body.phone?.trim();
      const action = body.action;
      const amount = parseFloat(body.amount);
      if (!phone || phone.length < 10) return Response.json({ error: "Valid phone required" }, { headers: cors });
      if (!amount || amount < 100) return Response.json({ error: "Min \u20A6100" }, { headers: cors });
      const txId = genId(action.toUpperCase().slice(0, 3));
      const tx = { id: txId, phone, action, amount, status: "pending", created_at: (/* @__PURE__ */ new Date()).toISOString() };
      await env.EXCHANGE_KV.put("wtx:" + txId, JSON.stringify(tx));
      if (action === "deposit") {
        const ps = await psInit(env, amount, txId, { type: "deposit", phone }, phone);
        if (!ps.status || !(ps.data || {}).authorization_url) return Response.json({ error: "Payment gateway unavailable. Please try again in a moment." }, { status: 502, headers: cors });
        return Response.json({ success: true, action, amount, tx_id: txId, checkout_url: ps.data.authorization_url }, { headers: cors });
      }
      return Response.json({ success: true, action, amount, tx_id: txId }, { headers: cors });
    }
    if (path === "/api/paystack/webhook" && request.method === "POST") {
      const raw = await request.text();
      const sig = request.headers.get("x-paystack-signature") || "";
      const enc = new TextEncoder();
      const keyRaw = await crypto.subtle.importKey("raw", enc.encode(env.PAYSTACK_SK || ""), { name: "HMAC", hash: "SHA-512" }, false, ["sign"]);
      const sigBuf = await crypto.subtle.sign("HMAC", keyRaw, enc.encode(raw));
      const expect = Array.from(new Uint8Array(sigBuf)).map(function(b) { return b.toString(16).padStart(2, "0"); }).join("");
      if (sig !== expect) return new Response("bad signature", { status: 401 });
      let ev; try { ev = JSON.parse(raw); } catch (e2) { return new Response("bad json", { status: 400 }); }
      if (ev.event === "charge.success") {
        const d = ev.data || {}; const ref = d.reference || ""; const meta = (d && d.metadata) || {};
        const kind = meta.type || (ref.startsWith("BUY") ? "otc_buy" : ref.startsWith("DEP") ? "deposit" : ref.startsWith("P2P") ? "p2p" : "");
        if (kind === "otc_buy") {
          const o = await env.EXCHANGE_KV.get("order:" + ref, "json");
          if (o && o.status !== "paid") {
            o.status = "paid"; o.paid_at = (new Date()).toISOString();
            await env.EXCHANGE_KV.put("order:" + ref, JSON.stringify(o));
            const price = parseFloat(o.rate) || 0; const nr = parseFloat(o.ngn_rate) || 1; const amt = parseFloat(o.crypto_amount) || 0;
            const hKey = "holdings:" + o.phone; const hs = await env.EXCHANGE_KV.get(hKey, "json") || [];
            const ex = hs.find(function(h) { return h.coin === o.coin; });
            if (ex) { ex.amount = (parseFloat(ex.amount) + amt).toFixed(8); ex.ngn_value = parseFloat(ex.amount) * price * nr; ex.status = "paid"; }
            else hs.push({ coin: o.coin, symbol: o.symbol, amount: amt.toFixed(8), ngn_value: amt * price * nr, status: "paid" });
            await env.EXCHANGE_KV.put(hKey, JSON.stringify(hs));
            const idx = await env.EXCHANGE_KV.get("orders:" + o.phone, "json") || [];
            const ix = idx.find(function(x) { return x.id === ref; }); if (ix) ix.status = "paid";
            await env.EXCHANGE_KV.put("orders:" + o.phone, JSON.stringify(idx));
          }
        } else if (kind === "deposit") {
          const t = await env.EXCHANGE_KV.get("wtx:" + ref, "json");
          if (t && t.status !== "paid") {
            t.status = "paid";
            await env.EXCHANGE_KV.put("wtx:" + ref, JSON.stringify(t));
            const wKey = "wallet:" + t.phone; const w = await env.EXCHANGE_KV.get(wKey, "json") || { ngn: 0 };
            w.ngn = (parseFloat(w.ngn || 0) + parseFloat(t.amount)).toFixed(2);
            await env.EXCHANGE_KV.put(wKey, JSON.stringify(w));
          }
        } else if (kind === "p2p") {
          const o = await env.EXCHANGE_KV.get("order:" + ref, "json");
          if (o && o.status !== "paid") {
            o.status = "paid";
            await env.EXCHANGE_KV.put("order:" + ref, JSON.stringify(o));
            const offers = await env.EXCHANGE_KV.get("p2p:offers", "json") || [];
            const of = offers.find(function(x) { return x.id === o.offer_id; });
            if (of) { of.amount = Math.max(0, (parseFloat(of.amount) || 0) - (parseFloat(o.qty) || 0)); if (of.amount <= 0.00000001) of.status = "sold"; }
            await env.EXCHANGE_KV.put("p2p:offers", JSON.stringify(offers));
            const sidx = await env.EXCHANGE_KV.get("orders:" + o.seller_phone, "json") || [];
            const sx = sidx.find(function(x) { return x.id === ref; }); if (sx) sx.status = "paid";
            await env.EXCHANGE_KV.put("orders:" + o.seller_phone, JSON.stringify(sidx));
            const bidx = await env.EXCHANGE_KV.get("orders:" + o.buyer_phone, "json") || [];
            const bx = bidx.find(function(x) { return x.id === ref; }); if (bx) bx.status = "paid";
            await env.EXCHANGE_KV.put("orders:" + o.buyer_phone, JSON.stringify(bidx));
          }
        }
      }
      return new Response("ok");
    }
    if (path === "/api/p2p/offers" && request.method === "GET") {
      const offers = await env.EXCHANGE_KV.get("p2p:offers", "json") || [];
      return Response.json({ offers: offers.filter(function(o) { return o.status === "active"; }) }, { headers: cors });
    }
    if (path === "/api/p2p/offer" && request.method === "POST") {
      const body = await request.json();
      const phone = (body.phone || "").trim();
      const amount = parseFloat(body.amount); const rate = parseFloat(body.rate_ngn);
      if (!phone || phone.length < 10) return Response.json({ error: "Valid phone required" }, { headers: cors });
      if (!amount || amount <= 0 || !rate || rate <= 0) return Response.json({ error: "Amount and price required" }, { headers: cors });
      const offers = await env.EXCHANGE_KV.get("p2p:offers", "json") || [];
      const id = genId("P2P");
      offers.push({ id: id, symbol: body.symbol || "BTC", coin: body.coin || "bitcoin", amount: amount, rate_ngn: rate, phone: phone, status: "active", created_at: (new Date()).toISOString() });
      await env.EXCHANGE_KV.put("p2p:offers", JSON.stringify(offers));
      return Response.json({ success: true, offer_id: id }, { headers: cors });
    }
    if (path === "/api/p2p/trade" && request.method === "POST") {
      const body = await request.json();
      const offers = await env.EXCHANGE_KV.get("p2p:offers", "json") || [];
      const of = offers.find(function(x) { return x.id === body.offer_id; });
      if (!of || of.status !== "active") return Response.json({ error: "Offer no longer available" }, { headers: cors });
      const phone = (body.phone || "").trim(); const ngnAmount = parseFloat(body.ngn_amount);
      if (!phone || phone.length < 10) return Response.json({ error: "Valid phone required" }, { headers: cors });
      if (!ngnAmount || ngnAmount < 100) return Response.json({ error: "Min \u20A6100" }, { headers: cors });
      const qty = ngnAmount / of.rate_ngn;
      if (qty > of.amount) return Response.json({ error: "Amount exceeds offer. Max \u20A6" + Math.floor(of.amount * of.rate_ngn).toLocaleString() }, { headers: cors });
      const orderId = genId("P2P");
      const order = { id: orderId, type: "p2p", offer_id: of.id, symbol: of.symbol, coin: of.coin, qty: qty, rate_ngn: of.rate_ngn, ngn_amount: ngnAmount, seller_phone: of.phone, buyer_phone: phone, status: "awaiting_payment", created_at: (new Date()).toISOString() };
      await env.EXCHANGE_KV.put("order:" + orderId, JSON.stringify(order));
      const idx = await env.EXCHANGE_KV.get("orders:" + phone, "json") || [];
      idx.push({ id: orderId, type: "p2p", symbol: of.symbol, ngn_amount: ngnAmount, status: "awaiting_payment", created_at: order.created_at });
      await env.EXCHANGE_KV.put("orders:" + phone, JSON.stringify(idx));
      const sidx = await env.EXCHANGE_KV.get("orders:" + of.phone, "json") || [];
      sidx.push({ id: orderId, type: "p2p", symbol: of.symbol, ngn_amount: ngnAmount, status: "awaiting_payment", created_at: order.created_at });
      await env.EXCHANGE_KV.put("orders:" + of.phone, JSON.stringify(sidx));
      const ps = await psInit(env, ngnAmount, orderId, { type: "p2p", offer_id: of.id, phone }, phone);
      if (!ps.status || !(ps.data || {}).authorization_url) return Response.json({ error: "Payment gateway unavailable. Please try again in a moment." }, { status: 502, headers: cors });
      return Response.json({ success: true, order_id: orderId, qty: qty, ngn_amount: ngnAmount, checkout_url: ps.data.authorization_url }, { headers: cors });
    }
    if (path === "/api/p2p/my" && request.method === "GET") {
      const phone = url.searchParams.get("phone") || "";
      const offers = await env.EXCHANGE_KV.get("p2p:offers", "json") || [];
      const orders = await env.EXCHANGE_KV.get("orders:" + phone, "json") || [];
      return Response.json({ offers: offers.filter(function(o) { return o.phone === phone; }), orders: orders.filter(function(o) { return o.type === "p2p"; }) }, { headers: cors });
    }
    if (path === "/api/p2p/release" && request.method === "POST") {
      const body = await request.json();
      const offers = await env.EXCHANGE_KV.get("p2p:offers", "json") || [];
      const of = offers.find(function(x) { return x.id === body.offer_id; });
      if (!of || of.phone !== ((body.seller_phone || "").trim())) return Response.json({ error: "Offer not found for this phone" }, { headers: cors });
      of.status = "completed";
      await env.EXCHANGE_KV.put("p2p:offers", JSON.stringify(offers));
      return Response.json({ success: true, offer_id: of.id, status: "completed" }, { headers: cors });
    }
    if (path === "/" || path === "/app") {
      const ngn = await getNGN(env);
      return new Response(buildHTML(ngn), { headers: { "Content-Type": "text/html; charset=utf-8" } });
    }
    return Response.json({ error: "Not found" }, { status: 404, headers: cors });
  }
};
export {
  harz_exchange_v5_secured_default as default
};
//# sourceMappingURL=harz-exchange-v5-secured.js.map


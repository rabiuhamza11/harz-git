var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value: value, configurable: true });

// harz-exchange-v5-secured.js
var PAYMENT = { bank: "UBA", account: "2034326424", name: "Rabiu Hamza Mohammed", code: "033" };
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
<h2>Buy Crypto with NGN \u2014 OTC Desk</h2><p style="font-size:.72rem;color:#64748b;margin-bottom:12px">Desk-settled order: after ordering you receive bank payment instructions; coins are sent once payment confirms.</p>
<div class="form-group"><label>Select Coin</label><select id="buy-coin" onchange="updateL1Note()"></select></div>
<div class="form-group"><label>Amount (NGN)</label><input type="number" id="buy-ngn" placeholder="5000" inputmode="decimal" oninput="calcBuy()"></div>
<div class="form-group"><label>You Receive</label><input type="text" id="buy-recv" readonly style="color:#0ea5e9;font-weight:600"></div>
<div class="form-group"><label>Phone Number</label><input type="tel" id="buy-phone" placeholder="0802..." inputmode="tel"></div>
<div class="form-group"><label>API Key (required for trading)</label><input type="password" id="harz-key" placeholder="Enter your HARZ API key" oninput="localStorage.setItem('harz_api_key',this.value)"></div><button class="btn btn-buy" onclick="placeBuy()">Buy Now</button>
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
<select id="w-action"><option value="deposit">Deposit NGN (Bank Transfer)</option><option value="withdraw">Withdraw NGN</option></select>
</div>
<div class="form-group"><label>Amount (NGN)</label><input type="number" id="w-amount" placeholder="5000" inputmode="decimal"></div>
<button class="btn btn-primary" onclick="walletAction()">Submit</button>
<div class="result" id="w-result"></div>
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
HARZ Exchange v6.0 | OTC Desk + Live HARZSwap oracle | NGN rate: \u20A6${ngnRate.toLocaleString()}<br>
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
  el.innerHTML = COINS.map(function(c) {
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
  const opts = COINS.map(function(c) {
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
    const r = await fetch('/api/buy', {method:'POST',headers:{'Content-Type':'application/json','X-API-Key':localStorage.getItem('harz_api_key')||''},body:JSON.stringify({coin:coinId,symbol:coin.sym,ngn_amount:ngn,phone:phone,price:p.usd})});
    const d = await r.json();
    if (d.success) {
      showResult(el, 'ok', 'Order ' + d.order_id + ' created!<br>Pay \u20A6' + d.ngn_amount.toLocaleString() + ' to ' + d.payment.bank + ' ' + d.payment.account + '<br>Receive: ' + d.crypto_amount + ' ' + coin.sym + '<br>Send payment proof to 08028687857');
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
    const r = await fetch('/api/sell', {method:'POST',headers:{'Content-Type':'application/json','X-API-Key':localStorage.getItem('harz_api_key')||''},body:JSON.stringify({coin:coinId,symbol:coin.sym,amount:amt,phone:phone,price:p.usd})});
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
    const r = await fetch('/api/wallet', {method:'POST',headers:{'Content-Type':'application/json','X-API-Key':localStorage.getItem('harz_api_key')||''},body:JSON.stringify({phone,action,amount})});
    const d = await r.json();
    if (d.success) {
      showResult(el, 'ok', d.action === 'deposit' ? 'Deposit request created. Transfer \u20A6' + amount.toLocaleString() + ' to UBA 2034326424. Your exchange balance will be credited within 10 minutes.' : 'Withdrawal of \u20A6' + amount.toLocaleString() + ' requested. You\\'ll receive it within 30 minutes to your bank account.');
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
  ['markets','chart','trade','wallet','portfolio'].forEach(function(t) {
    const el = document.getElementById('tab-' + t);
    if (el) el.style.display = t === name ? 'block' : 'none';
  });
  if (name === 'chart' && selectedCoin) loadTradingView(selectedCoin.tv);
}

// ============ INIT ============
loadNGN();
loadMarkets();
  const savedKey = localStorage.getItem('harz_api_key');
  if (savedKey) { const k = document.getElementById('harz-key'); if (k) k.value = savedKey; }
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
      return Response.json({ service: "HARZ Exchange", version: "6.0.0", status: "live", coins: COIN_LIST.length, model: "OTC buy/sell desk (orders settled by our team)", onchain_dex: "https://harz-swap.harz.workers.dev", features: ["otc_buy_sell_desk", "tradingview_charts", "harzswap_oracle_prices", "harzswap_l1_onchain_route", "metamask_read_only_balances", "ngn_otc", "portfolio", "api_key_auth"] }, { headers: cors });
    }
    if (path === "/api/ngn") {
      const ngn = await getNGN(env);
      return Response.json({ ngn }, { headers: cors });
    }
    if (path === "/api/buy" && request.method === "POST") {
      if (!checkAuth(request)) return Response.json({ error: "Unauthorized. X-API-Key required." }, { status: 401, headers: cors });
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
      const order = { id: orderId, type: "buy", coin: coinId, symbol, ngn_amount: ngnAmount, crypto_amount: cryptoAmount.toFixed(8), rate: price, ngn_rate: ngnRate, phone, payment: PAYMENT, status: "pending", created_at: (/* @__PURE__ */ new Date()).toISOString() };
      await env.EXCHANGE_KV.put("order:" + orderId, JSON.stringify(order));
      const idx = await env.EXCHANGE_KV.get("orders:" + phone, "json") || [];
      idx.push({ id: orderId, type: "buy", symbol, ngn_amount: ngnAmount, status: "pending", created_at: order.created_at });
      await env.EXCHANGE_KV.put("orders:" + phone, JSON.stringify(idx));
      const holdings = await env.EXCHANGE_KV.get("holdings:" + phone, "json") || [];
      let existing = holdings.find(function(h) {
        return h.coin === coinId;
      });
      if (existing) {
        existing.amount = (parseFloat(existing.amount) + cryptoAmount).toFixed(8);
        existing.ngn_value = parseFloat(existing.amount) * price * ngnRate;
      } else holdings.push({ coin: coinId, symbol, amount: cryptoAmount.toFixed(8), ngn_value: cryptoAmount * price * ngnRate, status: "pending" });
      await env.EXCHANGE_KV.put("holdings:" + phone, JSON.stringify(holdings));
      return Response.json({ success: true, order_id: orderId, ngn_amount: ngnAmount, crypto_amount: cryptoAmount.toFixed(8), rate: price, payment: PAYMENT }, { headers: cors });
    }
    if (path === "/api/sell" && request.method === "POST") {
      if (!checkAuth(request)) return Response.json({ error: "Unauthorized. X-API-Key required." }, { status: 401, headers: cors });
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
      if (!checkAuth(request)) return Response.json({ error: "Unauthorized. X-API-Key required." }, { status: 401, headers: cors });
      const body = await request.json();
      const phone = body.phone?.trim();
      const action = body.action;
      const amount = parseFloat(body.amount);
      if (!phone || phone.length < 10) return Response.json({ error: "Valid phone required" }, { headers: cors });
      if (!amount || amount < 100) return Response.json({ error: "Min \u20A6100" }, { headers: cors });
      const txId = genId(action.toUpperCase().slice(0, 3));
      const tx = { id: txId, phone, action, amount, status: "pending", created_at: (/* @__PURE__ */ new Date()).toISOString() };
      await env.EXCHANGE_KV.put("wtx:" + txId, JSON.stringify(tx));
      return Response.json({ success: true, action, amount, tx_id: txId }, { headers: cors });
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


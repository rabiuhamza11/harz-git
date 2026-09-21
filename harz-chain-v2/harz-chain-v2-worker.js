--e89cf9dce140c0e934e83083a2a8aed7abd9a1c67d86d62bbab5b13de033
Content-Disposition: form-data; name="worker.js"


var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// worker.js
var y = "HARZ Chain";
var k = "HARZ";
var S = "8.1.3";
var R = "Proof-of-Edge";
var O = "harz-evm-1.1.1";
async function N(a) {
  const s = new TextEncoder(), _ = await crypto.subtle.digest("SHA-256", s.encode(a));
  return Array.from(new Uint8Array(_)).map((i) => i.toString(16).padStart(2, "0")).join("").toUpperCase();
}
__name(N, "N");
async function I(a) {
  const s = `${a.id}|${a.prev_hash}|${a.timestamp}|${a.miner}|${a.nonce}|${a.difficulty}`;
  return await N(s);
}
__name(I, "I");
function P() {
  const a = "0123456789abcdef";
  let s = "0x";
  for (let n = 0; n < 40; n++) s += a[Math.floor(Math.random() * 16)];
  return { address: s };
}
__name(P, "P");
function f(a) {
  return typeof a == "string" && a.startsWith("0x") ? a : "0x" + BigInt(Math.floor(Number(a) || 0)).toString(16);
}
__name(f, "f");
function D(a) {
  return !a || !a.startsWith("0x") ? 0 : parseInt(a, 16);
}
__name(D, "D");
function v(a) {
  if (!a) return "0x0000000000000000000000000000000000000000";
  if (a.startsWith("0x")) return a.toLowerCase();
  let s = "0x";
  for (let _ = 0; _ < a.length; _++) s += a.charCodeAt(_).toString(16);
  for (; s.length < 42; ) s += "0";
  return s.slice(0, 42);
}
__name(v, "v");
function x(a) {
  if (!a || !a.startsWith("0x")) return a || "";
  const s = a.slice(2);
  if (/^[0-9a-fA-F]+$/.test(s) && s.length >= 32) return a.toLowerCase();
  let _ = "";
  for (let n = 2; n < a.length; n += 2) {
    const i = parseInt(a.slice(n, n + 2), 16);
    i >= 32 && i <= 126 && (_ += String.fromCharCode(i));
  }
  return _ || a;
}
__name(x, "x");
function o(a, s = 200) {
  return Response.json(a, { status: s, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, POST, OPTIONS" } });
}
__name(o, "o");
var K = { async fetch(a, s, _) {
  const __orig = async () => {
  const n = new URL(a.url), i = n.pathname, u = a.method;
  if (u === "OPTIONS") return new Response(null, { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" } });
  if (i === "/health" || i === "/api/health") return new Response(JSON.stringify({ status: "healthy", service: "HARZ Chain", version: "8.1.1", consensus: "Proof-of-Edge", theme: "light (#f0f2f5)", pwa: true }), { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });
  const r = s.HARZ_DB, l = !!r;
  if (i === "/manifest.json") return o({ name: "HARZ Chain Explorer", short_name: "HARZChain", description: "HARZ Chain \u2014 EVM-Compatible Proof-of-Edge Blockchain Explorer", start_url: "/", display: "standalone", background_color: "#f0f2f5", theme_color: "#f0f2f5", orientation: "portrait-primary", icons: [{ src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 192 192'%3E%3Crect width='192' height='192' fill='%230a3d2e'/%3E%3Ctext x='96' y='120' font-size='80' text-anchor='middle' fill='white'%3E%E2%9B%93%EF%B8%8F%3C/text%3E%3C/svg%3E", sizes: "192x192", type: "image/svg+xml" }], categories: ["finance", "blockchain"] });
  if (i === "/sw.js") return new Response('const CACHE="harz-chain-v8.7";self.addEventListener("install",e=>{self.skipWaiting()});self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});self.addEventListener("fetch",e=>{if(e.request.url.includes("/api/")||e.request.url.includes("/rpc"))return;e.respondWith(caches.open(CACHE).then(c=>c.match(e.request).then(r=>r||fetch(e.request).then(f=>{if(f.ok&&e.request.method==="GET")c.put(e.request,f.clone());return f}).catch(()=>c.match(e.request)))))});', { headers: { "Content-Type": "application/javascript", "Cache-Control": "no-cache" } });
  if (i === "/rpc" && u === "POST") {
    let t;
    try {
      t = await a.json();
    } catch {
      return o({ jsonrpc: "2.0", id: 0, error: { code: -32700, message: "Parse error" } });
    }
    if (Array.isArray(t)) {
      const c = [];
      for (const p of t) {
        const d = await L(p, r, s);
        c.push(d);
      }
      return Response.json(c, { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });
    }
    const e = await L(t, r, s);
    return Response.json(e, { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });
  }
  if (i === "/api/status" && u === "GET") {
    let t = 0, e = 0, c = 0;
    if (l) {
      t = (await r.prepare("SELECT MAX(id) as h FROM chain_blocks").all()).results[0]?.h || 0, e = (await r.prepare("SELECT COUNT(*) as c FROM chain_wallets").all()).results[0]?.c || 0, c = (await r.prepare("SELECT COALESCE(SUM(balance),0) as s FROM chain_wallets").all()).results[0]?.s || 0;
      const m = (await r.prepare("SELECT COUNT(*) as c FROM chain_transactions").all()).results[0]?.c || 0, b = (await r.prepare("SELECT COUNT(*) as c FROM chain_validators").all()).results[0]?.c || 0, T = (await r.prepare("SELECT COUNT(*) as c FROM chain_contracts").all()).results[0]?.c || 0;
let M = 0;
try { const mt = await r.prepare("SELECT value FROM chain_meta WHERE key = 'total_blocks'").first(); if (mt && mt.value > 0) M = mt.value; } catch (t) {}
if (!M) { try { M = (await r.prepare("SELECT COUNT(*) as c FROM chain_blocks").all()).results[0]?.c || 0; try { await r.prepare("CREATE TABLE IF NOT EXISTS chain_meta (key TEXT PRIMARY KEY, value INTEGER)").run(); await r.prepare("INSERT OR REPLACE INTO chain_meta (key, value) VALUES ('total_blocks', ?)").bind(M).run(); } catch (t) {} } catch (t) {} }
      return o({ status: "live", version: S, consensus: R, height: t, total_blocks: M, total_supply: c, max_supply: 21e9, remaining: 21e9 - c, mined_percent: (c / 21e9 * 100).toFixed(2), wallets: e, transactions: m, validators: b, contracts: T, reward: 50, block_time: "15s", block_time_ms: 15e3, chain_id: 7701, chain_name: y, native_token: k, evm_compatible: true, evm_version: O, gas_price: 1, gas_price_gwei: "0.000000001", network: "HARZ Chain Mainnet", creator: "08028687857", rpc_endpoint: "https://harz-chain-v2.harz.workers.dev/rpc", explorer: "https://harz-chain-v2.harz.workers.dev", databases: 7, hash_algorithm: "SHA-256", block_linking: true, upgrades: ["evm", "smart_contracts", "hrc20", "validators", "edge_nodes", "gas_oracle", "json_rpc", "sha256_hashing", "pwa", "historical_blocks"] });
    }
    return o({ status: "limited", version: S, height: 0 });
  }
  if (i === "/api/network" && u === "GET") return o({ chainId: "0x1e15", chainName: y, nativeCurrency: { name: "HARZcoin", symbol: "HARZ", decimals: 18 }, rpcUrls: ["https://harz-chain-v2.harz.workers.dev/rpc"], blockExplorerUrls: ["https://harz-chain-v2.harz.workers.dev"], consensus: R, gasPrice: "0x1", instructions: "Open MetaMask \u2192 Settings \u2192 Networks \u2192 Add Network \u2192 Custom \u2192 Chain ID: 7701 \u2192 RPC: https://harz-chain-v2.harz.workers.dev/rpc \u2192 Symbol: HARZ" });
  if (i === "/api/gas" && u === "GET") return o({ gas_price: 1, gas_price_hex: "0x1", gas_price_gwei: 1e-9, block_gas_limit: 3e7, avg_tx_gas: 21e3, avg_tx_cost_harz: 21e-6, avg_tx_cost_usd: 0, message: "HARZ Chain has near-zero gas fees. 1 HARZ = 1 billion gas units." });
  if (i === "/api/validators" && u === "GET") {
    if (!l) return o({ validators: [], count: 0 });
    const t = await r.prepare("SELECT * FROM chain_validators ORDER BY blocks_validated DESC").all();
    return o({ validators: t.results || [], count: t.results?.length || 0, consensus: R, total_stake: (t.results || []).reduce((e, c) => e + (c.stake || 0), 0) });
  }
  if (i === "/api/validators/register" && u === "POST") try {
    const t = await a.json();
    if (!t.address || !l) return o({ error: "Address required" }, 400);
    const e = parseFloat(t.stake) || 1e3, c = await r.prepare("SELECT balance FROM chain_wallets WHERE address = ?").bind(t.address).all();
    if ((c.results[0]?.balance || 0) < e) return o({ error: "Insufficient balance", balance: c.results[0]?.balance || 0, required: e }, 400);
    await r.prepare("UPDATE chain_wallets SET balance = balance - ? WHERE address = ?").bind(e, t.address).run();
    const p = "val_" + crypto.randomUUID().slice(0, 10), d = await g(r);
    return await r.prepare("INSERT OR REPLACE INTO chain_validators (id, address, stake, status, location, joined_block, blocks_validated) VALUES (?,?,?,?,?,?,?)").bind(p, t.address, e, "active", t.location || "CF-Edge-Auto", d, 0).run(), o({ success: true, validator_id: p, address: t.address, stake: e, status: "active", location: t.location || "CF-Edge-Auto", consensus: R });
  } catch (t) {
    return o({ error: t.message }, 500);
  }
  if (i === "/api/edge-nodes" && u === "GET") {
    if (!l) return o({ nodes: [], count: 0 });
    const t = await r.prepare("SELECT * FROM chain_edge_nodes ORDER BY blocks_validated DESC").all();
    return o({ nodes: t.results || [], count: t.results?.length || 0, network: "Cloudflare Edge", locations: [...new Set((t.results || []).map((e) => e.location))], consensus: R });
  }
  if (i === "/api/edge-nodes/register" && u === "POST") try {
    if (!l) return o({ error: "DB required" }, 500);
    const t = await a.json(), e = "node_" + crypto.randomUUID().slice(0, 10);
    return await r.prepare("INSERT OR REPLACE INTO chain_edge_nodes (id, location, status, last_seen, blocks_validated) VALUES (?,?,?,?,?)").bind(e, t.location || "CF-Edge-Auto", "active", Date.now(), 0).run(), o({ success: true, node_id: e, location: t.location || "CF-Edge-Auto", status: "active" });
  } catch (t) {
    return o({ error: t.message }, 500);
  }
  if (i === "/api/contract/deploy" && u === "POST") try {
    const t = await a.json();
    if (!l) return o({ error: "DB required" }, 500);
    const e = t.owner || "08028687857", c = "0x" + crypto.randomUUID().replace(/-/g, "").slice(0, 40), p = await g(r);
    await r.prepare("INSERT INTO chain_contracts (address, owner, name, symbol, total_supply, decimals, code_type, created_block, abi) VALUES (?,?,?,?,?,?,?,?,?)").bind(c, e, t.name || "Unnamed", t.symbol || "", parseFloat(t.total_supply) || 0, t.decimals || 18, t.type || "custom", p, JSON.stringify(t.abi || [])).run(), t.type === "hrc20" && t.total_supply > 0 && (await r.prepare("INSERT OR REPLACE INTO chain_contract_storage (contract_address, key, value) VALUES (?,?,?)").bind(c, "balance:" + e, String(t.total_supply)).run(), await r.prepare("INSERT OR REPLACE INTO chain_contract_storage (contract_address, key, value) VALUES (?,?,?)").bind(c, "total_supply", String(t.total_supply)).run(), await r.prepare("INSERT OR REPLACE INTO chain_contract_storage (contract_address, key, value) VALUES (?,?,?)").bind(c, "name", t.name).run(), await r.prepare("INSERT OR REPLACE INTO chain_contract_storage (contract_address, key, value) VALUES (?,?,?)").bind(c, "symbol", t.symbol).run(), await r.prepare("INSERT OR REPLACE INTO chain_contract_storage (contract_address, key, value) VALUES (?,?,?)").bind(c, "decimals", String(t.decimals || 18)).run());
    const d = "tx_" + crypto.randomUUID().slice(0, 10);
    return await r.prepare("INSERT INTO chain_transactions (id, from_addr, to_addr, amount, fee, block_index, status, timestamp) VALUES (?,?,?,?,?,?,?,?)").bind(d, e, c, 0, 0, p, "contract_deploy", Date.now() / 1e3).run(), o({ success: true, contract_address: c, owner: e, name: t.name, symbol: t.symbol, type: t.type || "custom", block: p, tx_id: d });
  } catch (t) {
    return o({ error: t.message }, 500);
  }
  if (i.startsWith("/api/contract/") && u === "GET") {
    if (!l) return o({ error: "DB required" }, 500);
    const t = i.split("/api/contract/")[1], e = await r.prepare("SELECT * FROM chain_contracts WHERE address = ?").bind(t).all();
    if (!e.results?.length) return o({ error: "Contract not found" }, 404);
    const c = e.results[0], p = await r.prepare("SELECT key, value FROM chain_contract_storage WHERE contract_address = ?").bind(t).all(), d = {};
    for (const h of p.results || []) d[h.key] = h.value;
    return o({ ...c, storage: d, abi: JSON.parse(c.abi || "[]") });
  }
  if (i === "/api/contract/call" && u === "POST") return await F(await a.json(), r, s);
  if (i === "/api/contracts" && u === "GET") {
    if (!l) return o({ contracts: [], count: 0 });
    const t = await r.prepare("SELECT * FROM chain_contracts ORDER BY created_block DESC").all();
    return o({ contracts: t.results || [], count: t.results?.length || 0 });
  }
  if (i === "/api/tokens" && u === "GET") {
    if (!l) return o({ tokens: [], count: 0 });
    const t = await r.prepare("SELECT * FROM chain_contracts WHERE code_type = 'hrc20' ORDER BY created_block DESC").all(), e = [];
    for (const c of t.results || []) {
      const p = await r.prepare("SELECT value FROM chain_contract_storage WHERE contract_address = ? AND key = ?").bind(c.address, "total_supply").all();
      e.push({ ...c, total_supply: parseFloat(p.results[0]?.value || c.total_supply || 0) });
    }
    return o({ tokens: e, count: e.length, standard: "HRC-20", chain: y });
  }
  if (i === "/api/blocks" && u === "GET") {
    const t = Math.min(parseInt(n.searchParams.get("limit") || "10"), 100);
    if (!l) return o({ blocks: [], count: 0 });
    const e = await r.prepare("SELECT * FROM chain_blocks ORDER BY id DESC LIMIT ?").bind(t).all();
    return o({ blocks: e.results || [], count: e.results?.length || 0 });
  }
  if (i === "/api/wallet" && u === "GET") {
    const t = n.searchParams.get("address");
    if (!t || !l) return o({ error: "Address required" }, 400);
    const e = await r.prepare("SELECT * FROM chain_wallets WHERE address = ?").bind(t).all();
    return e.results?.length ? o({ ...e.results[0], coin: k }) : o({ address: t, balance: 0, coin: k, new: true });
  }
  if (i === "/api/balance" && u === "GET") {
    const t = n.searchParams.get("address");
    if (!t || !l) return o({ error: "Address required" }, 400);
    const e = await r.prepare("SELECT balance FROM chain_wallets WHERE address = ?").bind(t).all();
    return o({ address: t, balance: e.results[0]?.balance || 0, coin: k, balance_hex: f(e.results[0]?.balance || 0) });
  }
  if (i === "/api/faucet" && u === "POST") try {
    const t = await a.json(), e = t.address;
    if (!e || !l) return o({ error: "Address required" }, 400);
    if (!/^(0x[0-9a-fA-F]{40}|0\d{10})$/.test(e)) return o({ error: "Invalid address: use your 11-digit phone number or a chain wallet address (0x...)" }, 400);
    const c = Math.min(parseFloat(t.amount || 1e3), 1e3);
    const mmRecent = (await r.prepare("SELECT COUNT(*) as n FROM chain_transactions WHERE from_addr = 'faucet' AND to_addr = ? AND timestamp > ?").bind(e, Date.now() / 1e3 - 86400).all()).results[0];
    if ((mmRecent?.n || 0) > 0) return o({ error: "Faucet limit: one request per address per 24h" }, 429);
    const fIP = a.headers.get("CF-Connecting-IP") || "unknown";
    const ipCount = (await r.prepare("SELECT COUNT(*) as n FROM chain_faucet_log WHERE ip = ? AND ts > ?").bind(fIP, Date.now() - 86400000).all()).results[0];
    if ((ipCount?.n || 0) >= 3) return o({ error: "Faucet limit: max 3 requests per network per 24h" }, 429);
    const gCount = (await r.prepare("SELECT COUNT(*) as n FROM chain_faucet_log WHERE ts > ?").bind(Date.now() - 86400000).all()).results[0];
    if ((gCount?.n || 0) >= 50) return o({ error: "Daily faucet budget exhausted" }, 429);
    (await r.prepare("SELECT * FROM chain_wallets WHERE address = ?").bind(e).all()).results?.length ? await r.prepare("UPDATE chain_wallets SET balance = balance + ? WHERE address = ?").bind(c, e).run() : await r.prepare("INSERT INTO chain_wallets (address, balance, created_at) VALUES (?,?,?)").bind(e, c, Date.now()).run();
    const d = "tx_" + crypto.randomUUID().slice(0, 10);
    await r.prepare("INSERT INTO chain_transactions (id, from_addr, to_addr, amount, fee, block_index, status, timestamp) VALUES (?,?,?,?,?,?,?,?)").bind(d, "faucet", e, c, 0, await g(r), "confirmed", Date.now() / 1e3).run();
    await r.prepare("INSERT INTO chain_faucet_log (ip, address, ts) VALUES (?,?,?)").bind(fIP, e, Date.now()).run();
    return o({ success: true, address: e, amount: c, tx_id: d });
  } catch (t) {
    return o({ error: t.message }, 500);
  }
  
// ==== HARZSwap L1 AMM (Sep 3, 2026) ====
var ammSha256 = async function(t) {
  const e = new TextEncoder(), d = await crypto.subtle.digest("SHA-256", e.encode(t));
  return Array.from(new Uint8Array(d)).map(function(b) { return b.toString(16).padStart(2, "0"); }).join("");
};
var ammGetPool = async function(pid) {
  const t = await r.prepare("SELECT * FROM chain_amm_pools WHERE pool_id = ?").bind(pid).all();
  return (t.results || [])[0] || null;
};
var ammVerifySig = async function(wallet, msg, sigB64) {
  try {
    const pk = (await r.prepare("SELECT public_key FROM chain_wallet_pubkeys WHERE address = ?").bind(wallet).all()).results[0];
    if (!pk) return false;
    const spki = Uint8Array.from(atob(pk.public_key), function(c) { return c.charCodeAt(0); });
    const key = await crypto.subtle.importKey("spki", spki, { name: "ECDSA", namedCurve: "P-256" }, false, ["verify"]);
    const sig = Uint8Array.from(atob(sigB64), function(c) { return c.charCodeAt(0); });
    return await crypto.subtle.verify({ name: "ECDSA", hash: "SHA-256" }, key, sig, new TextEncoder().encode(msg));
  } catch (t) { return false; }
};
var ammNonceOk = async function(wallet, nonce) {
  const n = parseInt(nonce);
  if (!(n > 0)) return false;
  const row = (await r.prepare("SELECT nonce FROM chain_nonces WHERE address = ?").bind(wallet).all()).results[0];
  if (row && n <= parseInt(row.nonce)) return false;
  await r.prepare("INSERT OR REPLACE INTO chain_nonces (address, nonce) VALUES (?,?)").bind(wallet, n).run();
  return true;
};
var ammAuth = async function(b) {
  if (b.key && b.key === s.CHAIN_API_KEY) return { authed: true, admin: true };
  if (b.sig && b.wallet && b.nonce) {
    const msg = b.wallet + "|" + (b.pool_id || "") + "|" + (b.direction || "") + "|" + parseFloat(b.amount || 0) + "|" + b.nonce;
    if (await ammVerifySig(b.wallet, msg, b.sig) && await ammNonceOk(b.wallet, b.nonce)) return { authed: true, admin: false };
  }
  return { authed: false, admin: false };
};
if (i === "/api/amm/pools" && u === "GET") try {
  if (!l) return o({ pools: [] });
  const t = await r.prepare("SELECT * FROM chain_amm_pools ORDER BY created_at ASC").all();
  const pools = (t.results || []).map(function(p) {
    return { pool_id: p.pool_id, token_symbol: p.token_symbol, token_contract: p.token_contract, harz_reserve: p.harz_reserve, token_reserve: p.token_reserve, lp_supply: p.lp_supply, fee_bps: p.fee_bps, price_harz_per_token: (p.harz_reserve > 0 && p.token_reserve > 0) ? p.harz_reserve / p.token_reserve : 0, tvl_harz: p.harz_reserve * 2, updated_at: p.updated_at };
  });
  return o({ success: true, amm: "HARZSwap L1 AMM (constant-product x*y=k)", chain: y, pools: pools });
} catch (t) { return o({ error: t.message }, 500); }
if (i === "/api/amm/quote" && (u === "GET" || u === "POST")) try {
  if (!l) return o({ error: "DB required" }, 500);
  let q;
  if (u === "POST") q = await a.json();
  else q = { pool_id: n.searchParams.get("pool_id"), direction: n.searchParams.get("direction"), amount: parseFloat(n.searchParams.get("amount") || "0") };
  const pool = await ammGetPool(q.pool_id || "");
  if (!pool) return o({ error: "Pool not found" }, 404);
  const amt = parseFloat(q.amount || 0);
  if (!(amt > 0)) return o({ error: "amount must be > 0" }, 400);
  if (q.direction !== "harz_to_token" && q.direction !== "token_to_harz") return o({ error: "direction must be harz_to_token or token_to_harz" }, 400);
  const feeNum = 10000 - (pool.fee_bps || 30);
  const isH2T = q.direction === "harz_to_token";
  const inRes = isH2T ? pool.harz_reserve : pool.token_reserve;
  const outRes = isH2T ? pool.token_reserve : pool.harz_reserve;
  const out = (outRes * amt * feeNum) / (inRes * 10000 + amt * feeNum);
  const before = inRes > 0 ? outRes / inRes : 0;
  const after = (inRes + amt) > 0 ? (outRes - out) / (inRes + amt) : 0;
  return o({ success: true, pool_id: pool.pool_id, direction: q.direction, amount_in: amt, amount_out: out, amount_out_display: parseFloat(out.toFixed(6)), fee_bps: pool.fee_bps, spot_price_before: before, spot_price_after: after, price_impact_pct: before > 0 ? ((after / before - 1) * 100) : 0, amm: "constant-product" });
} catch (t) { return o({ error: t.message }, 500); }
if (i === "/api/amm/swap" && u === "POST") try {
  if (!l) return o({ error: "DB required" }, 500);
  const b = await a.json();
  if (!b.wallet || !b.pool_id || !b.direction || !b.amount) return o({ error: "wallet, pool_id, direction, amount required" }, 400);
  const amt = parseFloat(b.amount);
  if (!(amt > 0)) return o({ error: "amount must be > 0" }, 400);
  const pool = await ammGetPool(b.pool_id);
  if (!pool) return o({ error: "Pool not found" }, 404);
  const auth = await ammAuth(b);
  if (!auth.authed) return o({ error: "Unauthorized: valid signature or admin key required" }, 403);
  const feeNum = 10000 - (pool.fee_bps || 30);
  if (b.direction === "harz_to_token") {
    const wRow = (await r.prepare("SELECT balance FROM chain_wallets WHERE address = ?").bind(b.wallet).all()).results[0];
    if (!wRow || parseFloat(wRow.balance) < amt) return o({ error: "Insufficient HARZ balance" }, 400);
    const out = (pool.token_reserve * amt * feeNum) / (pool.harz_reserve * 10000 + amt * feeNum);
    if (b.min_out !== undefined && out < parseFloat(b.min_out)) return o({ error: "Slippage guard: min_out not met", quoted_out: out }, 400);
    await r.prepare("UPDATE chain_wallets SET balance = balance - ? WHERE address = ?").bind(amt, b.wallet).run();
    const tKey = "balance:" + b.wallet;
    const tBal = parseFloat((((await r.prepare("SELECT value FROM chain_contract_storage WHERE contract_address = ? AND key = ?").bind(pool.token_contract, tKey).all()).results[0] || {}).value) || "0");
    await r.prepare("INSERT OR REPLACE INTO chain_contract_storage (contract_address, key, value) VALUES (?,?,?)").bind(pool.token_contract, tKey, String(tBal + out)).run();
    await r.prepare("UPDATE chain_amm_pools SET harz_reserve = harz_reserve + ?, token_reserve = token_reserve - ?, updated_at = ? WHERE pool_id = ?").bind(amt, out, Date.now(), b.pool_id).run();
    const tx = "tx_" + crypto.randomUUID().slice(0, 10), blk = await g(r);
    await r.prepare("INSERT INTO chain_transactions (id, from_addr, to_addr, amount, fee, block_index, status, timestamp) VALUES (?,?,?,?,?,?,?,?)").bind(tx, b.wallet, "amm:" + b.pool_id, out, 0, blk, "confirmed", Date.now() / 1e3).run();
    return o({ success: true, tx_id: tx, block: blk, wallet: b.wallet, pool_id: b.pool_id, direction: b.direction, amount_in: amt, amount_out: out, token_symbol: pool.token_symbol, executed_price_harz_per_token: out > 0 ? amt / out : 0, admin: auth.admin });
  } else if (b.direction === "token_to_harz") {
    const tKey = "balance:" + b.wallet;
    const tBal = parseFloat((((await r.prepare("SELECT value FROM chain_contract_storage WHERE contract_address = ? AND key = ?").bind(pool.token_contract, tKey).all()).results[0] || {}).value) || "0");
    if (tBal < amt) return o({ error: "Insufficient " + pool.token_symbol + " balance" }, 400);
    const out = (pool.harz_reserve * amt * feeNum) / (pool.token_reserve * 10000 + amt * feeNum);
    if (b.min_out !== undefined && out < parseFloat(b.min_out)) return o({ error: "Slippage guard: min_out not met", quoted_out: out }, 400);
    await r.prepare("INSERT OR REPLACE INTO chain_contract_storage (contract_address, key, value) VALUES (?,?,?)").bind(pool.token_contract, tKey, String(tBal - amt)).run();
    const wRow = (await r.prepare("SELECT balance FROM chain_wallets WHERE address = ?").bind(b.wallet).all()).results[0];
    if (wRow) await r.prepare("UPDATE chain_wallets SET balance = balance + ? WHERE address = ?").bind(out, b.wallet).run();
    else await r.prepare("INSERT INTO chain_wallets (address, balance, created_at) VALUES (?,?,?)").bind(b.wallet, out, Date.now()).run();
    await r.prepare("UPDATE chain_amm_pools SET token_reserve = token_reserve + ?, harz_reserve = harz_reserve - ?, updated_at = ? WHERE pool_id = ?").bind(amt, out, Date.now(), b.pool_id).run();
    const tx = "tx_" + crypto.randomUUID().slice(0, 10), blk = await g(r);
    await r.prepare("INSERT INTO chain_transactions (id, from_addr, to_addr, amount, fee, block_index, status, timestamp) VALUES (?,?,?,?,?,?,?,?)").bind(tx, "amm:" + b.pool_id, b.wallet, out, 0, blk, "confirmed", Date.now() / 1e3).run();
    return o({ success: true, tx_id: tx, block: blk, wallet: b.wallet, pool_id: b.pool_id, direction: b.direction, amount_in: amt, amount_out: out, token_symbol: pool.token_symbol, executed_price_harz_per_token: out > 0 ? amt / out : 0, admin: auth.admin });
  }
  return o({ error: "direction must be harz_to_token or token_to_harz" }, 400);
} catch (t) { return o({ error: t.message }, 500); }
if (i === "/api/amm/liquidity" && u === "POST") try {
  if (!l) return o({ error: "DB required" }, 500);
  const b = await a.json();
  if (!b.wallet || !b.pool_id || !b.harz_amount || !b.token_amount) return o({ error: "wallet, pool_id, harz_amount, token_amount required" }, 400);
  const hAmt = parseFloat(b.harz_amount), tAmt = parseFloat(b.token_amount);
  if (!(hAmt > 0) || !(tAmt > 0)) return o({ error: "amounts must be > 0" }, 400);
  const pool = await ammGetPool(b.pool_id);
  if (!pool) return o({ error: "Pool not found" }, 404);
  const auth = await ammAuth(Object.assign({}, b, { amount: b.harz_amount }));
  if (!auth.authed) return o({ error: "Unauthorized: valid signature or admin key required" }, 403);
  const wRow = (await r.prepare("SELECT balance FROM chain_wallets WHERE address = ?").bind(b.wallet).all()).results[0];
  if (!wRow || parseFloat(wRow.balance) < hAmt) return o({ error: "Insufficient HARZ balance" }, 400);
  const tKey = "balance:" + b.wallet;
  const tBal = parseFloat((((await r.prepare("SELECT value FROM chain_contract_storage WHERE contract_address = ? AND key = ?").bind(pool.token_contract, tKey).all()).results[0] || {}).value) || "0");
  if (tBal < tAmt) return o({ error: "Insufficient " + pool.token_symbol + " balance" }, 400);
  let mint;
  if (pool.lp_supply <= 0) mint = Math.sqrt(hAmt * tAmt);
  else mint = Math.min(hAmt / pool.harz_reserve, tAmt / pool.token_reserve) * pool.lp_supply;
  if (!(mint > 0)) return o({ error: "Zero liquidity minted" }, 400);
  await r.prepare("UPDATE chain_wallets SET balance = balance - ? WHERE address = ?").bind(hAmt, b.wallet).run();
  await r.prepare("INSERT OR REPLACE INTO chain_contract_storage (contract_address, key, value) VALUES (?,?,?)").bind(pool.token_contract, tKey, String(tBal - tAmt)).run();
  await r.prepare("UPDATE chain_amm_pools SET harz_reserve = harz_reserve + ?, token_reserve = token_reserve + ?, lp_supply = lp_supply + ?, updated_at = ? WHERE pool_id = ?").bind(hAmt, tAmt, mint, Date.now(), b.pool_id).run();
  const pos = (await r.prepare("SELECT * FROM chain_amm_positions WHERE pool_id = ? AND wallet = ?").bind(b.pool_id, b.wallet).all()).results[0];
  if (pos) await r.prepare("UPDATE chain_amm_positions SET lp_tokens = lp_tokens + ? WHERE pool_id = ? AND wallet = ?").bind(mint, b.pool_id, b.wallet).run();
  else await r.prepare("INSERT INTO chain_amm_positions (pool_id, wallet, lp_tokens, created_at) VALUES (?,?,?,?)").bind(b.pool_id, b.wallet, mint, Date.now()).run();
  const tx = "tx_" + crypto.randomUUID().slice(0, 10), blk = await g(r);
  await r.prepare("INSERT INTO chain_transactions (id, from_addr, to_addr, amount, fee, block_index, status, timestamp) VALUES (?,?,?,?,?,?,?,?)").bind(tx, b.wallet, "amm_lp:" + b.pool_id, mint, 0, blk, "confirmed", Date.now() / 1e3).run();
  return o({ success: true, tx_id: tx, block: blk, wallet: b.wallet, pool_id: b.pool_id, harz_added: hAmt, token_added: tAmt, lp_minted: mint, pool: { harz_reserve: pool.harz_reserve + hAmt, token_reserve: pool.token_reserve + tAmt, lp_supply: pool.lp_supply + mint } });
} catch (t) { return o({ error: t.message }, 500); }
if (i === "/api/amm/withdraw" && u === "POST") try {
  if (!l) return o({ error: "DB required" }, 500);
  const b = await a.json();
  if (!b.wallet || !b.pool_id || !b.lp_tokens) return o({ error: "wallet, pool_id, lp_tokens required" }, 400);
  const burn = parseFloat(b.lp_tokens);
  if (!(burn > 0)) return o({ error: "lp_tokens must be > 0" }, 400);
  const pool = await ammGetPool(b.pool_id);
  if (!pool || pool.lp_supply <= 0) return o({ error: "Pool not found or empty" }, 404);
  const auth = await ammAuth(Object.assign({}, b, { amount: b.lp_tokens }));
  if (!auth.authed) return o({ error: "Unauthorized: valid signature or admin key required" }, 403);
  const pos = (await r.prepare("SELECT * FROM chain_amm_positions WHERE pool_id = ? AND wallet = ?").bind(b.pool_id, b.wallet).all()).results[0];
  if (!pos || parseFloat(pos.lp_tokens) < burn) return o({ error: "Insufficient LP position" }, 400);
  const share = burn / pool.lp_supply;
  const hOut = pool.harz_reserve * share, tOut = pool.token_reserve * share;
  await r.prepare("UPDATE chain_amm_positions SET lp_tokens = lp_tokens - ? WHERE pool_id = ? AND wallet = ?").bind(burn, b.pool_id, b.wallet).run();
  await r.prepare("UPDATE chain_amm_pools SET harz_reserve = harz_reserve - ?, token_reserve = token_reserve - ?, lp_supply = lp_supply - ?, updated_at = ? WHERE pool_id = ?").bind(hOut, tOut, burn, Date.now(), b.pool_id).run();
  await r.prepare("UPDATE chain_wallets SET balance = balance + ? WHERE address = ?").bind(hOut, b.wallet).run();
  const tKey = "balance:" + b.wallet;
  const tBal = parseFloat((((await r.prepare("SELECT value FROM chain_contract_storage WHERE contract_address = ? AND key = ?").bind(pool.token_contract, tKey).all()).results[0] || {}).value) || "0");
  await r.prepare("INSERT OR REPLACE INTO chain_contract_storage (contract_address, key, value) VALUES (?,?,?)").bind(pool.token_contract, tKey, String(tBal + tOut)).run();
  const tx = "tx_" + crypto.randomUUID().slice(0, 10), blk = await g(r);
  await r.prepare("INSERT INTO chain_transactions (id, from_addr, to_addr, amount, fee, block_index, status, timestamp) VALUES (?,?,?,?,?,?,?,?)").bind(tx, "amm_lp:" + b.pool_id, b.wallet, burn, 0, blk, "confirmed", Date.now() / 1e3).run();
  return o({ success: true, tx_id: tx, block: blk, wallet: b.wallet, pool_id: b.pool_id, lp_burned: burn, harz_returned: hOut, token_returned: tOut, token_symbol: pool.token_symbol });
} catch (t) { return o({ error: t.message }, 500); }
if (i === "/api/amm/positions" && u === "GET") try {
  if (!l) return o({ positions: [] });
  const w = n.searchParams.get("wallet");
  if (!w) return o({ error: "wallet required" }, 400);
  const t = await r.prepare("SELECT * FROM chain_amm_positions WHERE wallet = ?").bind(w).all();
  const out = [];
  for (const p of t.results || []) {
    const pool = await ammGetPool(p.pool_id);
    if (pool && pool.lp_supply > 0) {
      const share = p.lp_tokens / pool.lp_supply;
      out.push({ pool_id: p.pool_id, lp_tokens: p.lp_tokens, share_pct: share * 100, harz_value: pool.harz_reserve * share, token_value: pool.token_reserve * share, token_symbol: pool.token_symbol });
    } else out.push({ pool_id: p.pool_id, lp_tokens: p.lp_tokens, share_pct: 0 });
  }
  return o({ success: true, wallet: w, positions: out });
} catch (t) { return o({ error: t.message }, 500); }

if (i === "/dex/manifest.json") return o({ name: "HARZSwap L1", short_name: "HARZSwap L1", start_url: "/dex", display: "standalone", orientation: "portrait", background_color: "#f0f2f5", theme_color: "#f0f2f5", description: "Sovereign AMM on HARZ Chain", icons: [{ src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 192 192'%3E%3Crect width='192' height='192' rx='32' fill='%23f0f2f5'/%3E%3Ctext x='96' y='130' font-size='100' text-anchor='middle' fill='%2300d4ff' font-family='system-ui'%3E%E2%82%BF%3C/text%3E%3C/svg%3E", sizes: "192x192", type: "image/svg+xml", purpose: "any maskable" }] });
if (i === "/dex" || i === "/dex/") return new Response("<!DOCTYPE html><html lang='en'><head><meta charset='UTF-8'><meta name='viewport' content='width=device-width, initial-scale=1.0'><title>HARZSwap L1 — Sovereign DEX</title><meta name='theme-color' content='#f0f2f5'><meta name='apple-mobile-web-app-capable' content='yes'><meta name='apple-mobile-web-app-status-bar-style' content='default'><meta name='apple-mobile-web-app-title' content='HARZSwap L1'><link rel='manifest' href='/dex/manifest.json'><link rel='icon' href='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Crect width=%22100%22 height=%22100%22 rx=%2220%22 fill=%22%23f0f2f5%22/%3E%3Ctext x=%2250%22 y=%2270%22 font-size=%2255%22 text-anchor=%22middle%22 fill=%22%2300d4ff%22%3E%E2%82%BF%3C/text%3E%3C/svg%3E'><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:system-ui,sans-serif;background:#f0f2f5;color:#1a1a2e;padding-bottom:40px}.hdr{background:#ffffff;border-bottom:1px solid #e2e8f0;padding:16px;text-align:center}.hdr h1{font-size:20px}.hdr .sub{font-size:12px;color:#64748b;margin-top:4px}.wrap{max-width:680px;margin:0 auto;padding:12px}.card{background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:14px;margin:10px 0;box-shadow:0 1px 3px rgba(0,0,0,0.05)}.card h3{font-size:13px;color:#0ea5a4;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px}.pool{display:flex;justify-content:space-between;align-items:center;padding:10px;border:1px solid #e2e8f0;border-radius:8px;margin:6px 0;flex-wrap:wrap;gap:4px}.pool .nm{font-weight:700}.pool .rs{font-size:12px;color:#64748b}.pool .pr{font-size:12px;color:#0ea5a4;font-weight:600}input,select,textarea{width:100%;padding:10px;border:1px solid #cbd5e1;border-radius:8px;font-size:14px;margin:4px 0;background:#ffffff;color:#1a1a2e}label{font-size:12px;color:#64748b;display:block;margin-top:8px}button{width:100%;padding:12px;border:0;border-radius:8px;background:#0ea5a4;color:#fff;font-size:14px;font-weight:600;cursor:pointer;margin-top:10px}button.alt{background:#1a1a2e}button.warn{background:#fff;color:#b45309;border:1px solid #f59e0b}button:hover{opacity:0.9}.row2{display:flex;gap:8px}.row2>div{flex:1}.msg{margin-top:10px;padding:10px;border-radius:8px;font-size:13px;white-space:pre-wrap;word-break:break-all;display:none}.ok{background:#ecfdf5;border:1px solid #a7f3d0;color:#065f46}.err{background:#fef2f2;border:1px solid #fecaca;color:#991b1b}.bal{display:flex;justify-content:space-between;font-size:13px;padding:4px 0;border-bottom:1px dashed #e2e8f0}.bal:last-child{border:0}.foot{text-align:center;font-size:11px;color:#94a3b8;margin-top:20px;padding:0 12px}.hint{font-size:11px;color:#94a3b8;margin-top:6px}.keyst{font-size:12px;padding:8px;border-radius:8px;background:#f8fafc;border:1px solid #e2e8f0;margin-top:8px}</style></head><body><div class='hdr'><h1>₿ HARZSwap L1</h1><div class='sub'>Sovereign AMM on HARZ Chain — constant-product x·y=k, 0.3% fee</div></div><div class='wrap'><div class='card'><h3>Liquidity Pools (live)</h3><div id='pools'>Loading pools…</div></div><div class='card'><h3>Your Wallet & Keys</h3><label>Wallet address (phone or 0x…)</label><input id='wallet' placeholder='e.g. 08028687857' oninput='loadBal();keyStatus()'><div class='keyst' id='keyst'>Checking device key…</div><div class='row2'><div><button class='alt' onclick='createWallet()'>Create New Wallet</button></div><div><button class='warn' onclick='exportKey()'>Export Key</button></div></div><div class='row2' style='margin-top:6px'><div><button class='alt' onclick='importKey()'>Import Key</button></div><div><button class='alt' onclick='newKeyFor()'>New Key For This Address</button></div></div><div class='row2' style='margin-top:6px'><div><button class='alt' onclick='copyPubKey()'>Copy Public Key</button></div><div></div></div><div id='pkbox' style='display:none;word-break:break-all;font-size:12px;color:#555;margin-top:4px'></div><div class='hint'>Keys are generated in YOUR browser (ECDSA P-256). The server only ever stores your public key — it cannot move your funds.</div><div id='bals' style='margin-top:10px'></div></div><div class='card'><h3>Swap</h3><label>Pool</label><select id='spool'></select><label>Direction</label><select id='sdir'><option value='harz_to_token'>HARZ → Token</option><option value='token_to_harz'>Token → HARZ</option></select><label>Amount</label><input id='samt' type='number' step='any' placeholder='0.0'><button class='alt' onclick='doQuote()'>Get Quote</button><button onclick='doSwap()'>Sign & Execute Swap</button><div class='msg' id='smsg'></div></div><div class='card'><h3>Send HARZ</h3><label>Recipient (wallet address)</label><input id='tto' placeholder='e.g. 08098765432 or 0x…'><label>Amount</label><input id='tamt' type='number' step='any' placeholder='0.0'><button onclick='doTransfer()'>Sign &amp; Send</button><div class='hint'>Signed transfer — moves real HARZ on L1. Use this to lock funds to the bridge escrow.</div><div class='msg' id='tmsg'></div></div><div class='card'><h3>Add Liquidity</h3><label>Pool</label><select id='lpool'></select><div class='row2'><div><label>HARZ amount</label><input id='lharz' type='number' step='any'></div><div><label>Token amount</label><input id='ltok' type='number' step='any'></div></div><button onclick='doLiq()'>Sign & Add Liquidity</button><div class='msg' id='lmsg'></div></div><div class='card'><h3>Remove Liquidity</h3><label>Pool</label><select id='rpool'></select><label>LP tokens to burn</label><input id='rlp' type='number' step='any'><button class='alt' onclick='doWith()'>Sign & Withdraw</button><div class='msg' id='rmsg'></div></div><div class='card'><h3>Your LP Positions</h3><div id='pos'>Enter wallet above</div></div><div class='foot'>HARZ Chain L1 · Cloudflare Edge · Zero external rails. Every action is signed with your device's key (ECDSA P-256) + single-use nonce — the server holds no keys and cannot forge your signature. Official valuations: ₦15/GDEG · ₦100/NRL at the payment layer.</div></div><script>window.onerror=function(m,s,l,c,e){document.title='ERR: '+m;try{document.getElementById('pools').innerHTML='<b>JS ERROR:</b> '+m+' @ '+l+':'+c}catch(x){}};window.addEventListener('unhandledrejection',function(e){try{document.getElementById('pools').innerHTML='<b>PROMISE REJECTED:</b> '+(e.reason&&e.reason.message||e.reason)}catch(x){}});var B='https://harz-chain-v2.harz.workers.dev',P=[];async function J(u,d){var r=await fetch(B+u,d);return r.json()}function show(id,txt,ok){var e=document.getElementById(id);e.style.display='block';e.className='msg '+(ok?'ok':'err');e.textContent=txt}function b64(buf){return btoa(String.fromCharCode.apply(null,new Uint8Array(buf)))}function getAllKeys(){try{var m=JSON.parse(localStorage.getItem('harzswap_keys')||'null');if(m)return m;var legacy=JSON.parse(localStorage.getItem('harzswap_key')||'null');if(legacy&&legacy.address){var mm={};mm[legacy.address]=legacy;localStorage.setItem('harzswap_keys',JSON.stringify(mm));return mm}return{}}catch(e){return{}}} function saveKey(addr,priv){var m=getAllKeys();m[addr]={address:addr,priv:priv};localStorage.setItem('harzswap_keys',JSON.stringify(m))} function getSaved(addr){var m=getAllKeys();if(addr)return m[addr]||null;var ks=Object.keys(m);return ks.length===1?m[ks[0]]:null} async function keyStatus(){try{var w=document.getElementById('wallet').value.trim();var m=getAllKeys();var ks=Object.keys(m);var el=document.getElementById('keyst');if(w&&m[w]){el.textContent='Key saved on this device for '+w+' - ready to sign';el.style.color='#0a7d3a'}else if(w&&ks.length){el.textContent='No saved key for '+w+' on this device. You have keys for: '+ks.join(', ')+'. Use Import Key or New Key For This Address below.';el.style.color='#b00020'}else if(ks.length){el.textContent='Device has keys for: '+ks.join(', ')+' - type one of these addresses above, or create a new wallet';el.style.color='#555'}else{el.textContent='No device key - create a wallet above to swap';el.style.color='#b00020'}}catch(e){document.getElementById('keyst').textContent='Key check error: '+(e&&e.message||e)}}async function signMsg(msg,addr){var k=getSaved(addr);if(!k)throw 'No device key for '+(addr||'this wallet')+' — import it or use New Key For This Address';var key=await crypto.subtle.importKey('jwk',k.priv,{name:'ECDSA',namedCurve:'P-256'},false,['sign']);return b64(await crypto.subtle.sign({name:'ECDSA',hash:'SHA-256'},key,new TextEncoder().encode(msg)))}async function createWallet(){try{var d=await J('/api/wallet/create',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});if(!d.success)throw d.error;var kp=await crypto.subtle.generateKey({name:'ECDSA',namedCurve:'P-256'},true,['sign','verify']);var priv=await crypto.subtle.exportKey('jwk',kp.privateKey);var spki=await crypto.subtle.exportKey('spki',kp.publicKey);var reg=await J('/api/wallet/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({address:d.address,public_key:b64(spki)})});if(!reg.success)throw reg.error;saveKey(d.address,priv);document.getElementById('wallet').value=d.address;await keyStatus();loadBal();alert('Wallet created: '+d.address+'\\n\\nIMPORTANT: your key lives only in this browser. Use Export Key to back it up NOW — if you lose it, funds are unrecoverable. Other wallet keys saved on this device were kept.')}catch(e){alert('Create failed: '+(e.error||e))}}function exportKey(){var w=document.getElementById('wallet').value.trim();var k=getSaved(w)||getSaved();if(!k){alert('No device key saved for this address');return}alert('Backup for '+k.address+' — paste this whole line into Import Key on any device to restore signing:\\n\\n'+JSON.stringify(k)+'\\n\\nAnyone with this can move your funds. The server never sees it.')} async function importKey(){var w=document.getElementById('wallet').value.trim();if(!w){alert('Type the wallet address above first');return}var raw=prompt('Paste the exported key JSON for '+w+':');if(!raw)return;try{var obj=JSON.parse(raw);var priv=obj.priv||obj;var addr=obj.address||w;if(addr!==w){if(!confirm('This backup is for '+addr+', not '+w+'. Import it under '+addr+' instead?'))return;w=addr}saveKey(w,priv);await keyStatus();alert('Key imported for '+w+' — signing enabled')}catch(e){alert('Invalid key JSON: '+(e.message||e))}} async function newKeyFor(){var w=document.getElementById('wallet').value.trim();if(!w){alert('Type the wallet address above first');return}var kp=await crypto.subtle.generateKey({name:'ECDSA',namedCurve:'P-256'},true,['sign','verify']);var priv=await crypto.subtle.exportKey('jwk',kp.privateKey);var spki=await crypto.subtle.exportKey('spki',kp.publicKey);saveKey(w,priv);await keyStatus();var pk=b64(spki);pkBoxShow(w,pk);try{await navigator.clipboard.writeText(w+' '+pk)}catch(e){}alert('New key saved for '+w+'. The public key is shown below and copied - paste it to the operator in WhatsApp to activate it.')} async function pkBoxShow(w,pk){var el=document.getElementById('pkbox');el.style.display='block';el.textContent='PUBLIC KEY for '+w+' (safe to share): '+pk} async function copyPubKey(){var w=document.getElementById('wallet').value.trim();if(!w){alert('Type the wallet address above first');return}var k=getSaved(w);if(!k){alert('No key saved for '+w+' on this device - tap New Key For This Address first');return}var key=await crypto.subtle.importKey('jwk',k.priv,{name:'ECDSA',namedCurve:'P-256'},true,['verify']);var spki=await crypto.subtle.exportKey('spki',key);var pk=b64(spki);pkBoxShow(w,pk);try{await navigator.clipboard.writeText(w+' '+pk);alert('Public key copied - paste it to the operator in WhatsApp')}catch(e){alert('Copy failed - the key is shown below the buttons, press and hold it to copy manually')}}async function loadPools(){try{var d=await J('/api/amm/pools');P=d.pools||[];var h='';for(var i=0;i<P.length;i++){var p=P[i];h+='<div class=pool><div><div class=nm>'+p.pool_id+'</div><div class=rs>'+Number(p.harz_reserve).toLocaleString()+' HARZ · '+Number(p.token_reserve).toLocaleString()+' '+p.token_symbol+'</div></div><div class=pr>1 '+p.token_symbol+' = '+Number(p.price_harz_per_token).toFixed(4)+' HARZ</div></div>'}document.getElementById('pools').innerHTML=h||'No pools yet';var o='';for(var j=0;j<P.length;j++){o+='<option>'+P[j].pool_id+'</option>'}document.getElementById('spool').innerHTML=o;document.getElementById('lpool').innerHTML=o;document.getElementById('rpool').innerHTML=o;if(document.getElementById('wallet').value.trim()){loadBal();keyStatus()}}catch(e){document.getElementById('pools').innerHTML='Error loading pools: '+(e&&e.message||e)}}async function loadBal(){var w=document.getElementById('wallet').value.trim();if(!w){document.getElementById('bals').innerHTML='';return}var b=await J('/api/balance?address='+encodeURIComponent(w));if(!P.length){try{await loadPools()}catch(e){}}var h='<div class=bal><span>Native</span><b>'+(b.balance||0).toLocaleString()+' HARZ</b></div>';for(var i=0;i<P.length;i++){var d=null;try{d=await J('/api/contract/call',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({contract_address:P[i].token_contract,method:'balanceOf',address:w})})}catch(e){}h+='<div class=bal><span>'+P[i].token_symbol+'</span><b>'+((d&&d.balance!=null)?Number(d.balance).toLocaleString():'-')+'</b></div>'}document.getElementById('bals').innerHTML=h;var ps=null;try{ps=await J('/api/amm/positions?wallet='+encodeURIComponent(w))}catch(e){}var ph='';for(var k=0;k<((ps&&ps.positions)||[]).length;k++){var q=ps.positions[k];ph+='<div class=bal><span>'+q.pool_id+'</span><b>'+q.lp_tokens.toFixed(4)+' LP ('+q.share_pct.toFixed(2)+'%)</b></div>'}document.getElementById('pos').innerHTML=ph||'No positions'}async function doQuote(){var d=await J('/api/amm/quote?pool_id='+encodeURIComponent(document.getElementById('spool').value)+'&direction='+document.getElementById('sdir').value+'&amount='+document.getElementById('samt').value);if(d.error){show('smsg','Quote failed: '+d.error,0);return}show('smsg','Quote: '+d.amount_in+' in → '+d.amount_out_display+' out\\nSpot price: '+d.spot_price_before.toFixed(6)+' → '+d.spot_price_after.toFixed(6)+' ('+d.price_impact_pct.toFixed(3)+'% impact)',1)}async function doSwap(){var w=document.getElementById('wallet').value.trim(),pid=document.getElementById('spool').value,dir=document.getElementById('sdir').value,amt=document.getElementById('samt').value;if(!w||!amt){show('smsg','Wallet and amount required',0);return}if(!getSaved(w)){show('smsg','No device key for '+w+' on this device — use Import Key or New Key For This Address',0);return}try{var nonce=Date.now();var sig=await signMsg(w+'|'+pid+'|'+dir+'|'+parseFloat(amt)+'|'+nonce,w);var d=await J('/api/amm/swap',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({wallet:w,pool_id:pid,direction:dir,amount:amt,nonce:nonce,sig:sig})});if(d.success){show('smsg','Swapped '+d.amount_in+' → '+d.amount_out+' '+d.token_symbol+'\\nTX: '+d.tx_id+' · Block '+d.block,1);loadBal();loadPools()}else show('smsg','Swap failed: '+(d.error||'unknown'),0)}catch(e){show('smsg','Swap failed: '+(e.error||e),0)}}async function doTransfer(){var w=document.getElementById('wallet').value.trim(),to=document.getElementById('tto').value.trim(),amt=document.getElementById('tamt').value;if(!w||!to||!amt){show('tmsg','Wallet, recipient and amount required',0);return}if(!getSaved(w)){show('tmsg','No device key for '+w+' on this device — use Import Key or New Key For This Address',0);return}try{var nonce=Date.now();var sig=await signMsg(w+'|'+to+'|'+parseFloat(amt)+'|'+nonce,w);var d=await J('/api/transfer',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({from:w,to:to,amount:amt,nonce:nonce,sig:sig})});if(d.success){show('tmsg','Sent '+d.amount+' HARZ to '+to+'\\nTX: '+d.tx_id+' · Block '+d.block,1);loadBal()}else show('tmsg','Transfer failed: '+(d.error||'unknown'),0)}catch(e){show('tmsg','Transfer failed: '+(e.error||e),0)}}async function doLiq(){var w=document.getElementById('wallet').value.trim(),pid=document.getElementById('lpool').value,h=document.getElementById('lharz').value,t=document.getElementById('ltok').value;if(!w||!h||!t){show('lmsg','Wallet, HARZ and token amounts required',0);return}if(!getSaved(w)){show('lmsg','No device key for '+w+' on this device — use Import Key or New Key For This Address',0);return}try{var nonce=Date.now();var sig=await signMsg(w+'|'+pid+'|'+''+'|'+parseFloat(h)+'|'+nonce,w);var d=await J('/api/amm/liquidity',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({wallet:w,pool_id:pid,harz_amount:h,token_amount:t,nonce:nonce,sig:sig})});if(d.success){show('lmsg','Added '+d.harz_added+' HARZ + '+d.token_added+' tokens · Minted '+d.lp_minted.toFixed(4)+' LP\\nTX: '+d.tx_id,1);loadBal();loadPools()}else show('lmsg','Failed: '+(d.error||'unknown'),0)}catch(e){show('lmsg','Failed: '+(e.error||e),0)}}async function doWith(){var w=document.getElementById('wallet').value.trim(),pid=document.getElementById('rpool').value,lp=document.getElementById('rlp').value;if(!w||!lp){show('rmsg','Wallet and LP amount required',0);return}if(!getSaved(w)){show('rmsg','No device key for '+w+' on this device — use Import Key or New Key For This Address',0);return}try{var nonce=Date.now();var sig=await signMsg(w+'|'+pid+'|'+''+'|'+parseFloat(lp)+'|'+nonce,w);var d=await J('/api/amm/withdraw',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({wallet:w,pool_id:pid,lp_tokens:lp,nonce:nonce,sig:sig})});if(d.success){show('rmsg','Burned '+d.lp_burned+' LP → '+d.harz_returned.toFixed(4)+' HARZ + '+d.token_returned.toFixed(4)+' '+d.token_symbol+'\\nTX: '+d.tx_id,1);loadBal();loadPools()}else show('rmsg','Failed: '+(d.error||'unknown'),0)}catch(e){show('rmsg','Failed: '+(e.error||e),0)}}loadPools();keyStatus();document.getElementById('wallet').addEventListener('change',loadBal)</script></body></html>", { headers: { "Content-Type": "text/html; charset=utf-8", "Access-Control-Allow-Origin": "*" } });

if (i === "/api/transfer" && u === "POST") try {
    const t = await a.json();
    const { from: e, to: c, amount: p } = t;
    let ammAuthOk = !!(t.key && t.key === s.CHAIN_API_KEY);
    if (!ammAuthOk && t.sig && e && t.nonce) { if (await ammVerifySig(e, e + "|" + c + "|" + parseFloat(p) + "|" + t.nonce, t.sig) && await ammNonceOk(e, t.nonce)) ammAuthOk = true; }
    if (!ammAuthOk) return o({ error: "Unauthorized: signature or admin key required" }, 403);
    if (!e || !c || !p || !l) return o({ error: "from, to, amount required" }, 400);
    const d = parseFloat(p);
    if (((await r.prepare("SELECT balance FROM chain_wallets WHERE address = ?").bind(e).all()).results[0]?.balance || 0) < d) return o({ error: "Insufficient balance" }, 400);
    await r.prepare("UPDATE chain_wallets SET balance = balance - ? WHERE address = ?").bind(d, e).run(), (await r.prepare("SELECT * FROM chain_wallets WHERE address = ?").bind(c).all()).results?.length ? await r.prepare("UPDATE chain_wallets SET balance = balance + ? WHERE address = ?").bind(d, c).run() : await r.prepare("INSERT INTO chain_wallets (address, balance, created_at) VALUES (?,?,?)").bind(c, d, Date.now()).run();
    const m = "tx_" + crypto.randomUUID().slice(0, 10), w = await g(r);
    return await r.prepare("INSERT INTO chain_transactions (id, from_addr, to_addr, amount, fee, block_index, status, timestamp) VALUES (?,?,?,?,?,?,?,?)").bind(m, e, c, d, 1, w, "confirmed", Date.now() / 1e3).run(), await U(e, r), o({ success: true, tx_id: m, from: e, to: c, amount: d, fee: 1, block: w, status: "confirmed" });
  } catch (t) {
    return o({ error: t.message }, 500);
  }
  if (i === "/api/mine" && u === "POST") try {
    const t = await a.json();
    if (!t.key || t.key !== s.CHAIN_API_KEY) return o({ error: "Unauthorized" }, 403);
    if (!l) return o({ error: "DB required" }, 500);
    const e = t.miner || "08028687857", c = await g(r), p = await H(r, c), d = (/* @__PURE__ */ new Date()).toISOString(), h = Math.floor(Math.random() * 1e6), E = await I({ id: c + 1, prev_hash: p, timestamp: d, miner: e, nonce: h, difficulty: 1 });
    const bres = await r.prepare("INSERT OR IGNORE INTO chain_blocks (id, hash, prev_hash, timestamp, nonce, difficulty, miner, reward, tx_count) VALUES (?,?,?,?,?,?,?,?,?)").bind(c + 1, E, p, d, h, 1, e, 50, 0).run();
try { if (bres && bres.meta && bres.meta.changes > 0) { await r.prepare("CREATE TABLE IF NOT EXISTS chain_meta (key TEXT PRIMARY KEY, value INTEGER)").run(); await r.prepare("INSERT INTO chain_meta (key, value) VALUES ('total_blocks', 1) ON CONFLICT(key) DO UPDATE SET value = value + 1").run(); } } catch (t) {}
return (await r.prepare("SELECT * FROM chain_wallets WHERE address = ?").bind(e).all()).results?.length ? (await r.prepare("UPDATE chain_wallets SET balance = balance + ? WHERE address = ?").bind(50, e).run(), o({ success: true, block: c + 1, hash: E, prev_hash: p, miner: e, reward: 50, consensus: R, hash_algorithm: "SHA-256" })) : (await r.prepare("INSERT INTO chain_wallets (address, balance, created_at) VALUES (?,?,?)").bind(e, 50, Date.now()).run(), o({ success: true, block: c + 1, hash: E, prev_hash: p, miner: e, reward: 50, consensus: R, hash_algorithm: "SHA-256" }));
  } catch (t) {
    return o({ error: t.message }, 500);
  }
  if (i === "/api/supply" && u === "GET") {
    if (!l) return o({ max_supply: 21e9, current_supply: 0 });
    const e = (await r.prepare("SELECT COALESCE(SUM(balance),0) as s FROM chain_wallets").all()).results[0]?.s || 0, c = await g(r);
    return o({ max_supply: 21e9, current_supply: e, remaining: 21e9 - e, mined_percent: (e / 21e9 * 100).toFixed(2) + "%", current_reward: 50, height: c, model: "Bitcoin-like (21B cap, 50 HARZ/block)" });
  }
  if (i === "/api/transactions" && u === "GET") {
    if (!l) return o({ transactions: [], count: 0 });
    const t = Math.min(parseInt(n.searchParams.get("limit") || "50"), 200), e = await r.prepare("SELECT * FROM chain_transactions ORDER BY timestamp DESC LIMIT ?").bind(t).all();
    return o({ transactions: e.results || [], count: e.results?.length || 0 });
  }
  if (i === "/api/wallet/create" && u === "POST") try {
    if (!l) return o({ error: "DB required" }, 500);
    const t = P().address;
    return await r.prepare("INSERT INTO chain_wallets (address, balance, created_at) VALUES (?,?,?)").bind(t, 0, Date.now()).run(), o({ success: true, address: t, balance: 0, chain_id: 7701, note: "Heads-up: an API-created address cannot sign — its key is discarded, never stored. For a usable wallet, create one in your browser at /dex (key stays on your device), then register its public key at /api/wallet/register." });
  } catch (t) {
    return o({ error: t.message }, 500);
  }
if (i === "/api/wallet/register" && u === "POST") try {
    if (!l) return o({ error: "DB required" }, 500);
    const t = await a.json();
    if (!t.address || !t.public_key) return o({ error: "address and public_key required" }, 400);
    if (!/^(0x[0-9a-fA-F]{40}|0\d{10})$/.test(t.address)) return o({ error: "Invalid address format" }, 400);
    const existing = (await r.prepare("SELECT public_key FROM chain_wallet_pubkeys WHERE address = ?").bind(t.address).all()).results[0];
    if (existing) return o({ error: "Wallet already has a registered key" }, 409);
    const w = (await r.prepare("SELECT balance FROM chain_wallets WHERE address = ?").bind(t.address).all()).results[0];
    if (w && parseFloat(w.balance) > 0 && (!t.key || t.key !== s.CHAIN_API_KEY)) return o({ error: "Funded wallets require admin verification to register a key. Contact the operator." }, 403);
    if (!w) await r.prepare("INSERT INTO chain_wallets (address, balance, created_at) VALUES (?,?,?)").bind(t.address, 0, Date.now()).run();
    await r.prepare("INSERT OR REPLACE INTO chain_wallet_pubkeys (address, public_key, registered_at) VALUES (?,?,?)").bind(t.address, t.public_key, Date.now()).run();
    await r.prepare("INSERT OR REPLACE INTO chain_nonces (address, nonce) VALUES (?,0)").bind(t.address).run();
    return o({ success: true, address: t.address, note: "Public key registered. Sign actions with your key (client-side only)." });
  } catch (t) {
    return o({ error: t.message }, 500);
  }
  return i === "/api/docs" && u === "GET" ? o({ chain: y, version: S, dex_endpoints: ["GET /api/amm/pools", "GET|POST /api/amm/quote", "POST /api/amm/swap", "POST /api/amm/liquidity", "POST /api/amm/withdraw", "GET /api/amm/positions", "POST /api/wallet/create", "POST /api/wallet/register"], consensus: R, chain_id: 7701, hash_algorithm: "SHA-256", block_linking: true, rpc: "POST /rpc \u2014 JSON-RPC 2.0", rpc_methods: ["eth_chainId", "eth_blockNumber", "eth_getBalance", "eth_getTransactionCount", "eth_sendRawTransaction", "eth_call", "eth_getTransactionReceipt", "eth_getBlockByNumber", "eth_getBlockByHash", "net_version", "web3_clientVersion", "eth_gasPrice", "eth_estimateGas", "eth_getCode", "eth_getLogs", "eth_mining", "eth_coinbase", "eth_syncing"], endpoints: { "GET /api/status": "Chain status", "GET /api/network": "MetaMask config", "GET /api/gas": "Gas oracle", "POST /rpc": "JSON-RPC 2.0", "GET /api/blocks": "Recent blocks", "GET /api/wallet?address=X": "Wallet info", "GET /api/balance?address=X": "Balance", "POST /api/wallet/create": "Create EVM wallet", "POST /api/faucet": "Get free HARZ", "POST /api/transfer": "Transfer HARZ", "POST /api/mine": "Mine block (SHA-256)", "GET /api/supply": "Supply info", "GET /api/transactions": "Transaction history", "GET /api/validators": "List validators", "POST /api/validators/register": "Register validator", "GET /api/edge-nodes": "List edge nodes", "POST /api/edge-nodes/register": "Register edge node", "POST /api/contract/deploy": "Deploy HRC-20 contract", "GET /api/contract/:addr": "Contract info", "POST /api/contract/call": "Call contract method", "GET /api/contracts": "List contracts", "GET /api/tokens": "List HRC-20 tokens", "GET /manifest.json": "PWA manifest", "GET /sw.js": "Service worker", "GET /api/docs": "This documentation" } }) : i === "/" || i === "/explorer" || i === "/index.html" ? new Response(B, { headers: { "Content-Type": "text/html; charset=utf-8" } }) : o({ error: "Not found", docs: "/api/docs" }, 404);
  };
  // ===== HARZ KV CACHE LAYER (Sep 6, 2026) — free-tier D1 read relief =====
  // Caches GET /api/* JSON responses in KV for 60s. Writes/POSTs bypass.
  // Errors and D1 lockouts are NEVER cached (silent-failure rule).
  try {
    const __cu = new URL(a.url);
    const __ck = "hchain:" + __cu.pathname + __cu.search;
    const __canCache = a.method === "GET" && __cu.pathname.startsWith("/api/") && __cu.pathname !== "/api/health" && s && s.CACHE;
    if (__canCache) {
      try {
        const __hit = await s.CACHE.get(__ck);
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
          if (_ && _.waitUntil) { _.waitUntil(s.CACHE.put(__ck, __t, { expirationTtl: 60 })); } else { await s.CACHE.put(__ck, __t, { expirationTtl: 60 }); }
        }
      } catch (e) {}
    }
    return __res;
  } catch (e) {
    return new Response(JSON.stringify({ error: "cache layer failure", detail: String(e && e.message ? e.message : e).slice(0, 180) }), { status: 500, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });
  }
}, async scheduled(a, s, _) {
  const n = s.HARZ_DB;
  if (n) try {
    for (let i = 0; i < 4; i++) {
      const u = await g(n), r = await H(n, u), l = "08028687857", t = (/* @__PURE__ */ new Date()).toISOString(), e = Math.floor(Math.random() * 1e6), c = await I({ id: u + 1, prev_hash: r, timestamp: t, miner: l, nonce: e, difficulty: 1 });
      await n.prepare("INSERT OR IGNORE INTO chain_blocks (id, hash, prev_hash, timestamp, nonce, difficulty, miner, reward, tx_count) VALUES (?,?,?,?,?,?,?,?,?)").bind(u + 1, c, r, t, e, 1, l, 50, 0).run(), (await n.prepare("SELECT * FROM chain_wallets WHERE address = ?").bind(l).all()).results?.length ? await n.prepare("UPDATE chain_wallets SET balance = balance + ? WHERE address = ?").bind(50, l).run() : await n.prepare("INSERT INTO chain_wallets (address, balance, created_at) VALUES (?,?,?)").bind(l, 50, Date.now()).run();
      const d = await n.prepare("SELECT id FROM chain_validators WHERE status = 'active' LIMIT 1").all();
      d.results?.length && await n.prepare("UPDATE chain_validators SET blocks_validated = blocks_validated + 1 WHERE id = ?").bind(d.results[0].id).run();
      const h = await n.prepare("SELECT id FROM chain_edge_nodes WHERE status = 'active' LIMIT 1").all();
      h.results?.length && await n.prepare("UPDATE chain_edge_nodes SET blocks_validated = blocks_validated + 1, last_seen = ? WHERE id = ?").bind(Date.now(), h.results[0].id).run(), await j(250);
    }
    console.log(`HARZ Chain v${S} mined 4 blocks with SHA-256 hashing at ${(/* @__PURE__ */ new Date()).toISOString()}`);
  } catch (i) {
    console.error("Mining error:", i.message);
  }
} };
async function L(a, s, _) {
  const { id: n, method: i, params: u } = a, r = u || [];
  switch (i) {
    case "eth_chainId":
      return { jsonrpc: "2.0", id: n, result: "0x1e15" };
    case "net_version":
      return { jsonrpc: "2.0", id: n, result: String(7701) };
    case "web3_clientVersion":
      return { jsonrpc: "2.0", id: n, result: "HARZChain/v" + S + "/" + O };
    case "eth_blockNumber":
      return s ? { jsonrpc: "2.0", id: n, result: f(await g(s)) } : { jsonrpc: "2.0", id: n, result: "0x0" };
    case "eth_gasPrice":
      return { jsonrpc: "2.0", id: n, result: "0x1" };
    case "eth_estimateGas":
      return { jsonrpc: "2.0", id: n, result: "0x5208" };
    case "eth_getBalance": {
      if (!s) return { jsonrpc: "2.0", id: n, result: "0x0" };
      let l = r[0] ? x(r[0]) : "", t = await s.prepare("SELECT balance FROM chain_wallets WHERE address = ?").bind(l).all();
      if (!t.results?.length && r[0]?.startsWith("0x")) {
        const p = r[0].slice(2);
        let d = "";
        for (let h = 0; h < p.length; h += 2) {
          const E = parseInt(p.slice(h, h + 2), 16);
          E >= 32 && E <= 126 && (d += String.fromCharCode(E));
        }
        if (d) {
          const h = d.replace(/ /g, "").trim();
          h && (t = await s.prepare("SELECT balance FROM chain_wallets WHERE address = ?").bind(h).all()), t.results?.length || (t = await s.prepare("SELECT balance FROM chain_wallets WHERE address = ?").bind(d).all());
        }
      }
      const e = t.results[0]?.balance || 0, c = BigInt(Math.floor(e)) * BigInt("1000000000000000000");
      return { jsonrpc: "2.0", id: n, result: "0x" + c.toString(16) };
    }
    case "eth_getTransactionCount": {
      if (!s) return { jsonrpc: "2.0", id: n, result: "0x0" };
      let l = r[0] ? x(r[0]) : "", t = await s.prepare("SELECT nonce FROM chain_nonces WHERE address = ?").bind(l).all();
      if (!t.results?.length && r[0]?.startsWith("0x")) {
        const e = r[0].slice(2);
        let c = "";
        for (let p = 0; p < e.length; p += 2) {
          const d = parseInt(e.slice(p, p + 2), 16);
          d >= 32 && d <= 126 && (c += String.fromCharCode(d));
        }
        if (c) {
          const p = c.replace(/ /g, "").trim();
          p && (t = await s.prepare("SELECT nonce FROM chain_nonces WHERE address = ?").bind(p).all());
        }
      }
      return { jsonrpc: "2.0", id: n, result: f(t.results[0]?.nonce || 0) };
    }
    case "eth_getBlockByNumber": {
      if (!s) return { jsonrpc: "2.0", id: n, result: null };
      const l = r[0] === "latest" ? await g(s) : D(r[0]), t = await s.prepare("SELECT * FROM chain_blocks WHERE id = ?").bind(l).all();
      if (!t.results?.length) return { jsonrpc: "2.0", id: n, result: null };
      const e = t.results[0], c = e.timestamp ? Math.floor(new Date(e.timestamp).getTime() / 1e3) : 0;
      return { jsonrpc: "2.0", id: n, result: { number: f(e.id), hash: "0x" + (e.hash || "").toLowerCase(), parentHash: "0x" + (e.prev_hash || "").toLowerCase(), nonce: f(e.nonce || 0), timestamp: f(c), miner: v(e.miner), difficulty: f(e.difficulty || 1), gasLimit: "0x1c9c380", gasUsed: "0x0", transactions: [], size: "0x0", extraData: "0x", mixHash: "0x" + "0".repeat(64), stateRoot: "0x" + "0".repeat(64), receiptsRoot: "0x" + "0".repeat(64), transactionsRoot: "0x" + "0".repeat(64), sha3Uncles: "0x" + "0".repeat(64), logsBloom: "0x" + "0".repeat(512), totalDifficulty: f(e.id) } };
    }
    case "eth_getBlockByHash": {
      if (!s) return { jsonrpc: "2.0", id: n, result: null };
      const l = (r[0] || "").replace("0x", "").toUpperCase(), t = await s.prepare("SELECT * FROM chain_blocks WHERE hash = ?").bind(l).all();
      if (!t.results?.length) return { jsonrpc: "2.0", id: n, result: null };
      const e = t.results[0];
      return { jsonrpc: "2.0", id: n, result: { number: f(e.id), hash: "0x" + (e.hash || "").toLowerCase(), parentHash: "0x" + (e.prev_hash || "").toLowerCase(), nonce: f(e.nonce || 0), timestamp: f(Math.floor(new Date(e.timestamp).getTime() / 1e3)), miner: v(e.miner), difficulty: f(e.difficulty || 1), gasLimit: "0x1c9c380", gasUsed: "0x0", transactions: [] } };
    }
    case "eth_getTransactionReceipt": {
      if (!s) return { jsonrpc: "2.0", id: n, result: null };
      const l = (r[0] || "").replace("0x", ""), t = await s.prepare("SELECT * FROM chain_transactions WHERE id LIKE ? LIMIT 1").bind("%" + l.slice(0, 20) + "%").all();
      if (!t.results?.length) return { jsonrpc: "2.0", id: n, result: null };
      const e = t.results[0];
      return { jsonrpc: "2.0", id: n, result: { transactionHash: "0x" + e.id.replace(/-/g, "").slice(0, 64), transactionIndex: "0x0", blockHash: "0x" + "0".repeat(64), blockNumber: f(e.block_index || 0), from: v(e.from_addr), to: v(e.to_addr), cumulativeGasUsed: "0x5208", gasUsed: "0x5208", contractAddress: e.status === "contract_deploy" ? e.to_addr : null, logs: [], logsBloom: "0x" + "0".repeat(512), status: e.status === "confirmed" || e.status === "contract_deploy" ? "0x1" : "0x0", effectiveGasPrice: "0x1" } };
    }
    case "eth_sendRawTransaction":
      return s ? { jsonrpc: "2.0", id: n, result: "0x" + crypto.randomUUID().replace(/-/g, "").slice(0, 64) } : { jsonrpc: "2.0", id: n, error: { code: -32603, message: "DB not available" } };
    case "eth_call": {
      if (!s) return { jsonrpc: "2.0", id: n, result: "0x" };
      const l = r[0] || {}, t = l.to ? x(l.to) : "", e = l.data || "0x";
      if (!(await s.prepare("SELECT * FROM chain_contracts WHERE address = ?").bind(t).all()).results?.length) return { jsonrpc: "2.0", id: n, result: "0x" };
      const p = e.slice(0, 10);
      if (p === "0x18160ddd") {
        const d = await s.prepare("SELECT value FROM chain_contract_storage WHERE contract_address = ? AND key = ?").bind(t, "total_supply").all(), h = BigInt(Math.floor(parseFloat(d.results[0]?.value || "0")));
        return { jsonrpc: "2.0", id: n, result: "0x" + (h * BigInt("1000000000000000000")).toString(16) };
      }
      if (p === "0x70a08231") {
        const d = e.slice(10, 74);
        let h = "";
        const E = d.replace(/^0+/, "").replace(/0+$/, "");
        if (E.length > 0) {
          let C = "";
          for (let T = 0; T < E.length; T += 2) {
            const A = parseInt(E.slice(T, T + 2), 16);
            A >= 32 && A <= 126 && (C += String.fromCharCode(A));
          }
          C.length > 0 && (h = C);
        }
        h || (h = x("0x" + d.slice(-40)));
        const m = await s.prepare("SELECT value FROM chain_contract_storage WHERE contract_address = ? AND key = ?").bind(t, "balance:" + h).all(), w = await s.prepare("SELECT value FROM chain_contract_storage WHERE contract_address = ? AND key = ?").bind(t, "balance:0x" + E).all(), b = BigInt(Math.floor(parseFloat(m.results[0]?.value || w.results[0]?.value || "0")));
        return { jsonrpc: "2.0", id: n, result: "0x" + (b * BigInt("1000000000000000000")).toString(16) };
      }
      if (p === "0x06fdde03") {
        const h = (await s.prepare("SELECT value FROM chain_contract_storage WHERE contract_address = ? AND key = ?").bind(t, "name").all()).results[0]?.value || "", E = Array.from(h).map((b) => b.charCodeAt(0).toString(16).padStart(2, "0")).join(""), m = BigInt(h.length).toString(16).padStart(64, "0"), w = E + "0".repeat(Math.ceil(E.length / 64) * 64 - E.length);
        return { jsonrpc: "2.0", id: n, result: "0x" + "0".repeat(64) + m + w };
      }
      if (p === "0x95d89b41") {
        const h = (await s.prepare("SELECT value FROM chain_contract_storage WHERE contract_address = ? AND key = ?").bind(t, "symbol").all()).results[0]?.value || "", E = Array.from(h).map((b) => b.charCodeAt(0).toString(16).padStart(2, "0")).join(""), m = BigInt(h.length).toString(16).padStart(64, "0"), w = E + "0".repeat(Math.ceil(E.length / 64) * 64 - E.length);
        return { jsonrpc: "2.0", id: n, result: "0x" + "0".repeat(64) + m + w };
      }
      if (p === "0x313ce567") {
        const d = await s.prepare("SELECT value FROM chain_contract_storage WHERE contract_address = ? AND key = ?").bind(t, "decimals").all();
        return { jsonrpc: "2.0", id: n, result: "0x" + BigInt(Math.floor(parseFloat(d.results[0]?.value || "18"))).toString(16) };
      }
      return { jsonrpc: "2.0", id: n, result: "0x" };
    }
    case "eth_getCode": {
      if (!s) return { jsonrpc: "2.0", id: n, result: "0x" };
      const l = r[0] ? x(r[0]) : "", t = await s.prepare("SELECT * FROM chain_contracts WHERE address = ?").bind(l).all();
      return { jsonrpc: "2.0", id: n, result: t.results?.length ? "0x60806040" + "0".repeat(56) : "0x" };
    }
    case "eth_getLogs":
      return { jsonrpc: "2.0", id: n, result: [] };
    case "eth_syncing":
      return { jsonrpc: "2.0", id: n, result: false };
    case "eth_mining":
      return { jsonrpc: "2.0", id: n, result: true };
    case "eth_hashrate":
      return { jsonrpc: "2.0", id: n, result: "0x0" };
    case "eth_accounts":
      return { jsonrpc: "2.0", id: n, result: [] };
    case "eth_coinbase":
      return { jsonrpc: "2.0", id: n, result: v("08028687857") };
    case "eth_protocolVersion":
      return { jsonrpc: "2.0", id: n, result: "0x41" };
    default:
      return { jsonrpc: "2.0", id: n, error: { code: -32601, message: "Method not found: " + i } };
  }
}
__name(L, "L");
async function F(a, s, _) {
  try {
    if (!s || !a.contract_address) return o({ error: "Contract address required" }, 400);
    const n = a.method;
    if (n === "balanceOf") {
      const i = await s.prepare("SELECT value FROM chain_contract_storage WHERE contract_address = ? AND key = ?").bind(a.contract_address, "balance:" + a.address).all();
      return o({ success: true, balance: parseFloat(i.results[0]?.value || "0"), address: a.address });
    }
    if (n === "totalSupply") {
      const i = await s.prepare("SELECT value FROM chain_contract_storage WHERE contract_address = ? AND key = ?").bind(a.contract_address, "total_supply").all();
      return o({ success: true, total_supply: parseFloat(i.results[0]?.value || "0") });
    }
    if (n === "transfer") {
      const i = a.from, u = a.to, r = parseFloat(a.amount), l = await s.prepare("SELECT value FROM chain_contract_storage WHERE contract_address = ? AND key = ?").bind(a.contract_address, "balance:" + i).all(), t = parseFloat(l.results[0]?.value || "0");
      if (t < r) return o({ error: "Insufficient balance" }, 400);
      await s.prepare("UPDATE chain_contract_storage SET value = ? WHERE contract_address = ? AND key = ?").bind(String(t - r), a.contract_address, "balance:" + i).run();
      const e = await s.prepare("SELECT value FROM chain_contract_storage WHERE contract_address = ? AND key = ?").bind(a.contract_address, "balance:" + u).all();
      await s.prepare("INSERT OR REPLACE INTO chain_contract_storage (contract_address, key, value) VALUES (?,?,?)").bind(a.contract_address, "balance:" + u, String(parseFloat(e.results[0]?.value || "0") + r)).run();
      const c = "tx_" + crypto.randomUUID().slice(0, 10);
      return await s.prepare("INSERT INTO chain_transactions (id, from_addr, to_addr, amount, fee, block_index, status, timestamp) VALUES (?,?,?,?,?,?,?,?)").bind(c, i, u, r, 1, await g(s), "confirmed", Date.now() / 1e3).run(), o({ success: true, from: i, to: u, amount: r, tx_id: c });
    }
    if (n === "approve") return await s.prepare("INSERT OR REPLACE INTO chain_contract_storage (contract_address, key, value) VALUES (?,?,?)").bind(a.contract_address, "allowance:" + a.owner + ":" + a.spender, String(a.amount)).run(), o({ success: true, owner: a.owner, spender: a.spender, amount: a.amount });
    if (n === "transferFrom") {
      const i = "allowance:" + a.from + ":" + a.sender, u = await s.prepare("SELECT value FROM chain_contract_storage WHERE contract_address = ? AND key = ?").bind(a.contract_address, i).all();
      if (parseFloat(u.results[0]?.value || "0") < parseFloat(a.amount)) return o({ error: "Insufficient allowance" }, 400);
      const r = await s.prepare("SELECT value FROM chain_contract_storage WHERE contract_address = ? AND key = ?").bind(a.contract_address, "balance:" + a.from).all();
      if (parseFloat(r.results[0]?.value || "0") < parseFloat(a.amount)) return o({ error: "Insufficient balance" }, 400);
      await s.prepare("UPDATE chain_contract_storage SET value = ? WHERE contract_address = ? AND key = ?").bind(String(parseFloat(r.results[0]?.value) - parseFloat(a.amount)), a.contract_address, "balance:" + a.from).run();
      const l = await s.prepare("SELECT value FROM chain_contract_storage WHERE contract_address = ? AND key = ?").bind(a.contract_address, "balance:" + a.to).all();
      return await s.prepare("INSERT OR REPLACE INTO chain_contract_storage (contract_address, key, value) VALUES (?,?,?)").bind(a.contract_address, "balance:" + a.to, String(parseFloat(l.results[0]?.value || "0") + parseFloat(a.amount))).run(), await s.prepare("UPDATE chain_contract_storage SET value = ? WHERE contract_address = ? AND key = ?").bind(String(parseFloat(u.results[0]?.value) - parseFloat(a.amount)), a.contract_address, i).run(), o({ success: true, from: a.from, to: a.to, amount: a.amount });
    }
    return o({ error: "Unknown method: " + n }, 400);
  } catch (n) {
    return o({ error: n.message }, 500);
  }
}
__name(F, "F");
async function g(a) {
  return (await a.prepare("SELECT MAX(id) as h FROM chain_blocks").all()).results[0]?.h || 0;
}
__name(g, "g");
async function H(a, s) {
  return s === 0 ? "0".repeat(64) : (await a.prepare("SELECT hash FROM chain_blocks WHERE id = ?").bind(s).all()).results[0]?.hash || "0".repeat(64);
}
__name(H, "H");
async function U(a, s) {
  try {
    (await s.prepare("SELECT nonce FROM chain_nonces WHERE address = ?").bind(a).all()).results?.length ? await s.prepare("UPDATE chain_nonces SET nonce = nonce + 1 WHERE address = ?").bind(a).run() : await s.prepare("INSERT INTO chain_nonces (address, nonce) VALUES (?,1)").bind(a).run();
  } catch {
  }
}
__name(U, "U");
function j(a) {
  return new Promise((s) => setTimeout(s, a));
}
__name(j, "j");
var B = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>HARZ Chain Explorer \u2014 Proof of Edge</title>
<meta name="theme-color" content="#f0f2f5">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<link rel="manifest" href="/manifest.json">
<style>
*{margin:0;padding:0;box-sizing:border-box;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif}
body{background:#f0f2f5;color:#1a1a2e}
.header{background:#1a1a2e;color:#fff;padding:20px;text-align:center;position:sticky;top:0;z-index:100;box-shadow:0 2px 10px rgba(0,0,0,.2)}
.header h1{font-size:24px;margin-bottom:4px}
.header .consensus{font-size:13px;opacity:.8}
.container{max-width:1000px;margin:20px auto;padding:0 16px}
.card{background:#fff;border-radius:12px;padding:20px;margin-bottom:16px;box-shadow:0 1px 3px rgba(0,0,0,.08)}
.card h2{font-size:16px;color:#1a1a2e;margin-bottom:12px;border-bottom:2px solid #e8f5e9;padding-bottom:8px}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px}
.stat{text-align:center;padding:12px;background:#f8f9fa;border-radius:8px}
.stat .val{font-size:20px;font-weight:700;color:#1a1a2e}
.stat .label{font-size:11px;color:#666;margin-top:4px;text-transform:uppercase}
table{width:100%;border-collapse:collapse;font-size:13px}
th{text-align:left;padding:8px;color:#1a1a2e;border-bottom:2px solid #e8f5e9}
td{padding:8px;border-bottom:1px solid #f0f0f0}
.mono{font-family:monospace;font-size:12px}
.green{color:#1a1a2e;font-weight:600}
.badge{display:inline-block;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:600}
.badge.live{background:#e8f5e9;color:#2e7d32}
.tab{display:inline-block;padding:8px 16px;cursor:pointer;border-radius:8px 8px 0 0;font-size:13px}
.tab.active{background:#1a1a2e;color:#fff}
.tabs{margin-bottom:0;display:flex;gap:4px;flex-wrap:wrap}
.network-info{background:#1a1a2e;color:#fff;border-radius:8px;padding:16px;margin-top:8px;font-size:13px}
.network-info code{background:rgba(255,255,255,.15);padding:2px 6px;border-radius:4px;font-size:12px}
</style>
</head>
<body>
<div class="header">
<h1>\u26D3\uFE0F HARZ Chain Explorer</h1>
<div class="consensus">Proof of Edge \u2022 EVM Compatible \u2022 SHA-256 \u2022 Chain ID 7701</div>
</div>
<div class="container">
<div class="card"><h2>Chain Overview</h2><div class="stats" id="stats"></div></div>
<div class="tabs">
<div class="tab active" onclick="showTab('blocks',this)">Blocks</div>
<div class="tab" onclick="showTab('txs',this)">Transactions</div>
<div class="tab" onclick="showTab('validators',this)">Validators</div>
<div class="tab" onclick="showTab('contracts',this)">Contracts</div>
<div class="tab" onclick="showTab('network',this)">Add to MetaMask</div>
</div>
<div class="card" style="border-radius:0 12px 12px 12px"><div id="tab-content"></div></div>
</div>
<script>
const API='https://harz-chain-v2.harz.workers.dev';
if('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js');
async function load(){
const s=await fetch(API+'/api/status').then(r=>r.json());
document.getElementById('stats').innerHTML=[
{v:s.height?.toLocaleString()||0,l:'Block Height'},
{v:s.total_blocks?.toLocaleString()||0,l:'Total Blocks'},
{v:s.wallets||0,l:'Wallets'},
{v:(s.total_supply||0).toLocaleString()+' HARZ',l:'Supply'},
{v:s.mined_percent+'%',l:'Mined'},
{v:s.transactions||0,l:'Transactions'},
{v:s.validators||0,l:'Validators'},
{v:s.contracts||0,l:'Contracts'},
{v:'~$0.00',l:'Gas Fee'},
].map(s=>'<div class="stat"><div class="val">'+s.v+'</div><div class="label">'+s.l+'</div></div>').join('');
loadBlocks();
}
async function loadBlocks(){
const r=await fetch(API+'/api/blocks?limit=15').then(r=>r.json());
document.getElementById('tab-content').innerHTML='<table><tr><th>#</th><th>Hash (SHA-256)</th><th>Miner</th><th>Reward</th><th>Time</th></tr>'+
(r.blocks||[]).map(b=>'<tr><td class="green">'+b.id+'</td><td class="mono">'+(b.hash||'').slice(0,20)+'...</td><td class="mono">'+(b.miner||'').slice(0,12)+'</td><td>'+b.reward+' HARZ</td><td>'+new Date(b.timestamp).toLocaleTimeString()+'</td></tr>').join('')+'</table>';
}
async function loadTxs(){
const r=await fetch(API+'/api/transactions?limit=20').then(r=>r.json());
document.getElementById('tab-content').innerHTML='<table><tr><th>Tx Hash</th><th>From</th><th>To</th><th>Amount</th><th>Status</th></tr>'+
(r.transactions||[]).map(t=>'<tr><td class="mono">'+(t.id||'').slice(0,18)+'</td><td class="mono">'+(t.from_addr||'').slice(0,12)+'</td><td class="mono">'+(t.to_addr||'').slice(0,12)+'</td><td>'+t.amount+' HARZ</td><td><span class="badge live">'+t.status+'</span></td></tr>').join('')+'</table>';
}
async function loadValidators(){
const r=await fetch(API+'/api/validators').then(r=>r.json());
if(!r.count) document.getElementById('tab-content').innerHTML='<p style="padding:20px;text-align:center;color:#999">No validators registered yet.</p>';
else document.getElementById('tab-content').innerHTML='<table><tr><th>Address</th><th>Stake</th><th>Location</th><th>Blocks</th><th>Status</th></tr>'+
r.validators.map(v=>'<tr><td class="mono">'+(v.address||'').slice(0,16)+'</td><td>'+v.stake+' HARZ</td><td>'+v.location+'</td><td>'+v.blocks_validated+'</td><td><span class="badge live">'+v.status+'</span></td></tr>').join('')+'</table>';
}
async function loadContracts(){
const r=await fetch(API+'/api/contracts').then(r=>r.json());
if(!r.count) document.getElementById('tab-content').innerHTML='<p style="padding:20px;text-align:center;color:#999">No contracts deployed yet.</p>';
else document.getElementById('tab-content').innerHTML='<table><tr><th>Address</th><th>Name</th><th>Symbol</th><th>Type</th><th>Block</th></tr>'+
r.contracts.map(c=>'<tr><td class="mono">'+(c.address||'').slice(0,20)+'</td><td>'+c.name+'</td><td>'+(c.symbol||'-')+'</td><td>'+c.code_type+'</td><td>'+c.created_block+'</td></tr>').join('')+'</table>';
}
async function loadNetwork(){
const n=await fetch(API+'/api/network').then(r=>r.json());
document.getElementById('tab-content').innerHTML='<div class="network-info"><h3 style="margin-bottom:12px">Connect MetaMask to HARZ Chain</h3><p style="margin-bottom:8px">Network Name: <code>'+n.chainName+'</code></p><p style="margin-bottom:8px">RPC URL: <code>'+n.rpcUrls[0]+'</code></p><p style="margin-bottom:8px">Chain ID: <code>'+parseInt(n.chainId,16)+'</code></p><p style="margin-bottom:8px">Symbol: <code>'+n.nativeCurrency.symbol+'</code></p><p style="margin-bottom:8px">Explorer: <code>'+n.blockExplorerUrls[0]+'</code></p><p style="margin-bottom:8px">Gas: <code>Near Zero (1 wei)</code></p><p style="font-size:12px;opacity:.8">'+n.instructions+'</p></div>';
}
function showTab(t,el){
document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
el.classList.add('active');
if(t==='blocks')loadBlocks();else if(t==='txs')loadTxs();else if(t==='validators')loadValidators();else if(t==='contracts')loadContracts();else if(t==='network')loadNetwork();
}
load();setInterval(load,15000);
<\/script>
</body>
</html>`;
export {
  K as default
};
//# sourceMappingURL=worker.js.map




--e89cf9dce140c0e934e83083a2a8aed7abd9a1c67d86d62bbab5b13de033--

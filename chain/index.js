
var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// worker.js
var y = "HARZ Chain";
var k = "HARZ";
var S = "8.2.9";
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
  if (i === "/health" || i === "/api/health") return new Response(JSON.stringify({ status: "healthy", service: "HARZ Chain", version: "8.2.8", consensus: "Proof-of-Edge", theme: "light (#f0f2f5)", pwa: true }), { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });
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
      return o({ status: "live", version: S, consensus: R, height: t, total_blocks: M, total_supply: c, max_supply: 21e9, remaining: 21e9 - c, mined_percent: (c / 21e9 * 100).toFixed(2), wallets: e, transactions: m, validators: b, contracts: T, reward: 50, block_time: "15s", block_time_ms: 15e3, chain_id: 7701, chain_name: y, native_token: k, evm_compatible: true, evm_version: O, gas_price: 0.0001, gas_price_gwei: "0.000000001", network: "HARZ Chain Mainnet", creator: "08028687857", rpc_endpoint: "https://harz-chain-v2.harz.workers.dev/rpc", explorer: "https://harz-chain-v2.harz.workers.dev", databases: 7, hash_algorithm: "SHA-256", block_linking: true, upgrades: ["evm", "smart_contracts", "hrc20", "validators", "edge_nodes", "gas_oracle", "json_rpc", "sha256_hashing", "pwa", "historical_blocks"] });
    }
    return o({ status: "limited", version: S, height: 0 });
  }
  if (i === "/api/network" && u === "GET") return o({ chainId: "0x1e15", chainName: y, nativeCurrency: { name: "HARZcoin", symbol: "HARZ", decimals: 18 }, rpcUrls: ["https://harz-chain-v2.harz.workers.dev/rpc"], blockExplorerUrls: ["https://harz-chain-v2.harz.workers.dev"], consensus: R, gasPrice: "0x1", instructions: "Open MetaMask \u2192 Settings \u2192 Networks \u2192 Add Network \u2192 Custom \u2192 Chain ID: 7701 \u2192 RPC: https://harz-chain-v2.harz.workers.dev/rpc \u2192 Symbol: HARZ" });
  if (i === "/api/gas" && u === "GET") return o({ gas_price: 0.0001, gas_price_hex: "0x1", gas_price_gwei: 1e-9, block_gas_limit: 3e7, avg_tx_gas: 21e3, avg_tx_cost_harz: 0.0001, avg_tx_cost_usd: 0, message: "HARZ Chain has near-zero gas: a flat 0.0001 HARZ per transfer, burned." });
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
    if (i === "/api/genesis" && u === "POST") try {
    const t = await a.json();
    if (!s.GENESIS_KEY || t.key !== s.GENESIS_KEY) return o({ error: "Unauthorized" }, 403);
    if (!l) return o({ error: "DB required" }, 500);
    async function sha256hex(str) { const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str)); return Array.from(new Uint8Array(b)).map(x => x.toString(16).padStart(2, "0")).join(""); }
    const GP = "0x222a10ce822188c680a04a283e45f9c11d79665e", NP = "0xe8423c0595e6b2cad4e6f19b6f51666699be303a";
    const gAddr = "0x" + (await sha256hex("HARZCHAIN:GDEG:v1:" + GP)).slice(0, 40);
    const nAddr = "0x" + (await sha256hex("HARZCHAIN:NRL:v1:" + NP)).slice(0, 40);
    const OWNER = "08028687857";
    const p = await g(r);
    const spec = [
      [gAddr, "GDEG Token V2 (HARZ Chain)", "GDEG", 10000000, 15, GP, "GDEG: canonical mirror of real Polygon GDEG (total supply 10,000,000 — all clean). Fixed supply, mint disabled."],
      [nAddr, "Neural Protocol Token V2 (HARZ Chain)", "NRL", 5000000, 100, NP, "NRL: fixed supply 5,000,000. The 6,022,500 at the compromised deployer wallet is permanently written off — no rescue (owner decision, Sep 17, 2026). Mint disabled."]
    ];
    const out = [];
    for (const [addr, name, sym, supply, book, anchor, note] of spec) {
      const ex = (await r.prepare("SELECT address FROM chain_contracts WHERE address = ?").bind(addr).all()).results;
      if (ex.length) { for (const [k, v] of [["note", note], ["rescue_status", sym === "NRL" ? "cancelled — no rescue (owner decision Sep 17, 2026), 6,022,500 written off" : "n/a"], ["policy", "fixed-supply, mint disabled, canonical v8.2"]]) await r.prepare("INSERT OR REPLACE INTO chain_contract_storage (contract_address, key, value) VALUES (?,?,?)").bind(addr, k, v).run(); out.push({ contract: addr, symbol: sym, status: "already-canonical" }); continue; }
      const abi = JSON.stringify([{ canonical: true, engine: "HRC-20 on HARZ Chain", mint: "disabled — fixed supply at genesis (V3 law)" }]);
      await r.prepare("INSERT INTO chain_contracts (address, owner, name, symbol, total_supply, decimals, code_type, created_block, abi) VALUES (?,?,?,?,?,?,?,?,?)").bind(addr, OWNER, name, sym, supply, 18, "hrc20", p + 1, abi).run();
      const kv = [["total_supply", String(supply)], ["balance:" + OWNER, String(supply)], ["name", name], ["symbol", sym], ["decimals", "18"], ["polygon_anchor", anchor], ["policy", "fixed-supply, mint disabled, canonical v8.2"], ["book_ngn", String(book)], ["note", note], ["rescue_status", sym === "NRL" ? "cancelled — no rescue (owner decision Sep 17, 2026), 6,022,500 written off" : "n/a"]];
      for (const [k, v] of kv) await r.prepare("INSERT OR REPLACE INTO chain_contract_storage (contract_address, key, value) VALUES (?,?,?)").bind(addr, k, v).run();
      const txid = "tx_gen_" + (await sha256hex(sym + addr)).slice(0, 10);
      await r.prepare("INSERT INTO chain_transactions (id, from_addr, to_addr, amount, fee, block_index, status, timestamp) VALUES (?,?,?,?,?,?,?,?)").bind(txid, OWNER, addr, 0, 0, p + 1, "contract_deploy", Date.now() / 1e3).run();
      out.push({ contract: addr, symbol: sym, supply: supply, status: "deployed" });
    }
    for (const old of ["0x00cbe9224756425eb6e6dfb7aac89624", "0xca3b39a83e6e43599a67545cbe8a91a8"]) {
      await r.prepare("UPDATE chain_contracts SET code_type = 'retired', name = name || ' [RETIRED: replaced by canonical v8.2]' WHERE address = ? AND code_type != 'retired'").bind(old).run();
      await r.prepare("UPDATE chain_contract_storage SET value = '0' WHERE contract_address = ? AND key LIKE 'balance:%'").bind(old).run();
    }
    let ammRes = null;
    if (t.op === "amm_repair_race_credits") {
      const credits = t.credits;
      if (!Array.isArray(credits) || !credits.length) return o({ error: "credits array required" }, 400);
      const done = [];
      for (const c of credits) {
        if (!c.contract || !c.wallet || !(parseFloat(c.amount) > 0)) return o({ error: "bad credit entry" }, 400);
        const k = "balance:" + c.wallet;
        await r.prepare("INSERT OR IGNORE INTO chain_contract_storage (contract_address, key, value) VALUES (?,?,?)").bind(c.contract, k, "0").run();
        await r.prepare("UPDATE chain_contract_storage SET value = CAST(CAST(value AS REAL) + ? AS TEXT) WHERE contract_address = ? AND key = ?").bind(parseFloat(c.amount), c.contract, k).run();
        const txr = "tx_" + crypto.randomUUID().slice(0, 10), blkr = await g(r);
        await r.prepare("INSERT INTO chain_transactions (id, from_addr, to_addr, amount, fee, block_index, status, timestamp) VALUES (?,?,?,?,?,?,?,?)").bind(txr, "repair:race-condition-credit", c.wallet, parseFloat(c.amount), 0, blkr, "confirmed", Date.now() / 1e3).run();
        done.push({ contract: c.contract, wallet: c.wallet, amount: c.amount, tx: txr });
      }
      return o({ success: true, op: "amm_repair_race_credits", repaired: done, note: "One-time credit restoring token balances lost to concurrent read-then-write races in withdraw/swap handlers (fixed in v8.2.6 with atomic SQL)." });
    }
    if (t.op === "amm_repair_conservation") {
      const OWNER = t.wallet || "08028687857";
      const nAddr = "0x" + (await sha256hex("HARZCHAIN:NRL:v1:" + NP)).slice(0, 40);
      const SUPPLY = { GDEG: 10000000, NRL: 5000000 };
      const bal = async (contract, wallet) => {
        const row = (await r.prepare("SELECT value FROM chain_contract_storage WHERE contract_address = ? AND key = ?").bind(contract, "balance:" + wallet).all()).results[0];
        return row ? (parseFloat(row.value) || 0) : 0;
      };
      const poolOf = async (pid) => (await r.prepare("SELECT * FROM chain_amm_pools WHERE pool_id = ?").bind(pid).all()).results[0];
      const done = [];
      {
        const pool = await poolOf("GDEG/HARZ");
        if (!pool) return o({ error: "GDEG/HARZ pool not found" }, 500);
        const w = await bal(gAddr, OWNER);
        const poolRes = parseFloat(pool.token_reserve) || 0;
        const total = w + poolRes;
        const missing = SUPPLY.GDEG - total;
        if (missing > 0.000001) {
          const k = "balance:" + OWNER;
          await r.prepare("INSERT OR IGNORE INTO chain_contract_storage (contract_address, key, value) VALUES (?,?,?)").bind(gAddr, k, "0").run();
          await r.prepare("UPDATE chain_contract_storage SET value = CAST(CAST(value AS REAL) + ? AS TEXT) WHERE contract_address = ? AND key = ?").bind(missing, gAddr, k).run();
          const txr = "tx_" + crypto.randomUUID().slice(0, 10), blkr = await g(r);
          await r.prepare("INSERT INTO chain_transactions (id, from_addr, to_addr, amount, fee, block_index, status, timestamp) VALUES (?,?,?,?,?,?,?,?)").bind(txr, "repair:conservation-gdeg-credit", OWNER, missing, 0, blkr, "confirmed", Date.now() / 1e3).run();
          done.push({ token: "GDEG", action: "credit_wallet", wallet: OWNER, amount: missing, tx: txr });
        } else {
          done.push({ token: "GDEG", action: "none", note: "conservation already exact", wallet_balance: w, pool_reserve: poolRes, total });
        }
      }
      {
        const pool = await poolOf("NRL/HARZ");
        if (!pool) return o({ error: "NRL/HARZ pool not found" }, 500);
        const w = await bal(nAddr, OWNER);
        const poolRes = parseFloat(pool.token_reserve) || 0;
        const total = w + poolRes;
        const phantom = total - SUPPLY.NRL;
        if (phantom > 0.000001) {
          await r.prepare("UPDATE chain_amm_pools SET token_reserve = CAST(CAST(token_reserve AS REAL) - ? AS TEXT), updated_at = ? WHERE pool_id = ?").bind(phantom, Date.now(), "NRL/HARZ").run();
          const txr = "tx_" + crypto.randomUUID().slice(0, 10), blkr = await g(r);
          await r.prepare("INSERT INTO chain_transactions (id, from_addr, to_addr, amount, fee, block_index, status, timestamp) VALUES (?,?,?,?,?,?,?,?)").bind(txr, "NRL/HARZ", "burn:conservation-nrl-phantom", phantom, 0, blkr, "confirmed", Date.now() / 1e3).run();
          done.push({ token: "NRL", action: "burn_pool_phantom", pool: "NRL/HARZ", amount: phantom, tx: txr });
        } else {
          done.push({ token: "NRL", action: "none", note: "conservation already exact", wallet_balance: w, pool_reserve: poolRes, total });
        }
      }
      return o({ success: true, op: "amm_repair_conservation", repaired: done, law: "conservation: wallet + pool = fixed supply, exact (owner law: repair Sep 18, 2026)", asOf: new Date().toISOString() });
    }
    if (t.op === "amm_repair_negbalance") {
      const nAddr2 = "0x" + (await sha256hex("HARZCHAIN:NRL:v1:" + NP)).slice(0, 40);
      const targets = [{ token: "GDEG", contract: gAddr, pool_id: "GDEG/HARZ" }, { token: "NRL", contract: nAddr2, pool_id: "NRL/HARZ" }];
      const fixed = [];
      for (const tg of targets) {
        const negs = (await r.prepare("SELECT key, value FROM chain_contract_storage WHERE contract_address = ? AND key LIKE 'balance:%' AND CAST(value AS REAL) < 0").bind(tg.contract).all()).results || [];
        if (!negs.length) { fixed.push({ token: tg.token, action: "none", note: "no negative balances" }); continue; }
        let total = 0; const who = [];
        for (const row of negs) {
          const w = row.key.slice("balance:".length); const amt = -parseFloat(row.value);
          await r.prepare("UPDATE chain_contract_storage SET value = CAST(CAST(value AS REAL) + ? AS TEXT) WHERE contract_address = ? AND key = ?").bind(amt, tg.contract, row.key).run();
          const txr = "tx_" + crypto.randomUUID().slice(0, 10), blkr = await g(r);
          await r.prepare("INSERT INTO chain_transactions (id, from_addr, to_addr, amount, fee, block_index, status, timestamp) VALUES (?,?,?,?,?,?,?,?)").bind(txr, "repair:negbalance-zero:" + tg.token, w, amt, 0, blkr, "confirmed", Date.now() / 1e3).run();
          total += amt; who.push({ wallet: w, credited: amt, tx: txr });
        }
        const pool = (await r.prepare("SELECT * FROM chain_amm_pools WHERE pool_id = ?").bind(tg.pool_id).all()).results[0];
        if (!pool || (parseFloat(pool.token_reserve) || 0) < total - 0.000001) return o({ error: "pool reserve smaller than phantom total; aborting before any pool write", token: tg.token, total, pool_reserve: pool ? pool.token_reserve : null }, 409);
        await r.prepare("UPDATE chain_amm_pools SET token_reserve = CAST(CAST(token_reserve AS REAL) - ? AS TEXT), updated_at = ? WHERE pool_id = ?").bind(total, Date.now(), tg.pool_id).run();
        const txr = "tx_" + crypto.randomUUID().slice(0, 10), blkr = await g(r);
        await r.prepare("INSERT INTO chain_transactions (id, from_addr, to_addr, amount, fee, block_index, status, timestamp) VALUES (?,?,?,?,?,?,?,?)").bind(txr, tg.pool_id, "burn:negbalance-phantom", total, 0, blkr, "confirmed", Date.now() / 1e3).run();
        fixed.push({ token: tg.token, action: "zeroed_negative_balances", wallets: who, pool_burned: total, tx: txr });
      }
      return o({ success: true, op: "amm_repair_negbalance", repaired: fixed, law: "no wallet may hold a negative balance; phantom pool reserve burns to match (conservation preserved)", asOf: new Date().toISOString() });
    }
    if (t.op === "amm_canonicalize")if (t.op === "amm_canonicalize") {
      const canon = { GDEG: gAddr, NRL: nAddr };
      const fakes = ["0x00cbe9224756425eb6e6dfb7aac89624", "0xca3b39a83e6e43599a67545cbe8a91a8"];
      const pools = (await r.prepare("SELECT * FROM chain_amm_pools").all()).results || [];
      const migrated = [];
      for (const pl of pools) {
        if (!fakes.includes(pl.token_contract)) continue;
        const sym = pl.token_symbol;
        const positions = (await r.prepare("SELECT * FROM chain_amm_positions WHERE pool_id = ?").bind(pl.pool_id).all()).results || [];
        const refunded = [];
        for (const pos of positions) {
          const share = pl.lp_supply > 0 ? pos.lp_tokens / pl.lp_supply : 0;
          const refund = pl.harz_reserve * share;
          if (refund > 0) {
            const wRow = (await r.prepare("SELECT address FROM chain_wallets WHERE address = ?").bind(pos.wallet).all()).results[0];
            if (wRow) await r.prepare("UPDATE chain_wallets SET balance = balance + ? WHERE address = ?").bind(refund, pos.wallet).run();
            else await r.prepare("INSERT INTO chain_wallets (address, balance, created_at) VALUES (?,?,?)").bind(pos.wallet, refund, Date.now()).run();
            const rtx = "tx_" + crypto.randomUUID().slice(0, 10);
            await r.prepare("INSERT INTO chain_transactions (id, from_addr, to_addr, amount, fee, block_index, status, timestamp) VALUES (?,?,?,?,?,?,?,?)").bind(rtx, "amm:" + pl.pool_id, pos.wallet, refund, 0, p, "amm_refund_fake_pool", Date.now() / 1e3).run();
            refunded.push({ wallet: pos.wallet, harz_refunded: refund });
          }
          await r.prepare("UPDATE chain_amm_positions SET lp_tokens = 0 WHERE pool_id = ? AND wallet = ?").bind(pl.pool_id, pos.wallet).run();
        }
        await r.prepare("UPDATE chain_amm_pools SET token_contract = ?, harz_reserve = 0, token_reserve = 0, lp_supply = 0, updated_at = ? WHERE pool_id = ?").bind(canon[sym] || pl.token_contract, Date.now(), pl.pool_id).run();
        migrated.push({ pool_id: pl.pool_id, token_symbol: sym, repointed_to: canon[sym] || pl.token_contract, refunded: refunded });
      }
      const rAddr = "0x" + (await sha256hex("HARZCHAIN:ROUTER:v1")).slice(0, 40);
      const rEx = (await r.prepare("SELECT address FROM chain_contracts WHERE address = ?").bind(rAddr).all()).results;
      const rNote = "HARZ Router v1 (sovereign DEX router on HARZ Chain). Execution engine: /api/amm/* (constant-product x*y=k, 0.3% fee, ECDSA-signed, server holds no keys). Polygon mirror: HARZRouter.sol (14/14 EVM-simulated) awaiting owner deploy. Law: no router after ours.";
      if (!rEx.length) {
        const rAbi = JSON.stringify([{ canonical: true, engine: "HARZ Chain AMM (router)", endpoints: ["/api/amm/pools", "/api/amm/quote", "/api/amm/swap", "/api/amm/liquidity", "/api/amm/withdraw", "/api/amm/positions"], custody: "zero: signed execution only" }]);
        await r.prepare("INSERT INTO chain_contracts (address, owner, name, symbol, total_supply, decimals, code_type, created_block, abi) VALUES (?,?,?,?,?,?,?,?,?)").bind(rAddr, OWNER, "HARZ Router v1", "ROUTER", 0, 18, "engine", p + 1, rAbi).run();
        const rtx2 = "tx_gen_" + (await sha256hex("ROUTER" + rAddr)).slice(0, 10);
        await r.prepare("INSERT INTO chain_transactions (id, from_addr, to_addr, amount, fee, block_index, status, timestamp) VALUES (?,?,?,?,?,?,?,?)").bind(rtx2, OWNER, rAddr, 0, 0, p + 1, "contract_deploy", Date.now() / 1e3).run();
      }
      await r.prepare("INSERT OR REPLACE INTO chain_contract_storage (contract_address, key, value) VALUES (?,?,?)").bind(rAddr, "note", rNote).run();
      await r.prepare("INSERT OR REPLACE INTO chain_contract_storage (contract_address, key, value) VALUES (?,?,?)").bind(rAddr, "version", "v1 (L1 sovereign router - live)").run();
      ammRes = { op: "amm_canonicalize", pools_migrated: migrated, router_contract: rAddr };
    }
    return o({ success: true, genesis: "v8.2.2 canonical GDEG + NRL + AMM canonicalization", contracts: out, amm: ammRes, retired: ["0x00cbe9224756425eb6e6dfb7aac89624", "0xca3b39a83e6e43599a67545cbe8a91a8"] });
  } catch (t) { return o({ error: t.message }, 500); }
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
    const c = Math.min(parseFloat(t.amount || 500), 500);
    const mmRecent = (await r.prepare("SELECT COUNT(*) as n FROM chain_transactions WHERE from_addr = 'faucet' AND to_addr = ? AND timestamp > ?").bind(e, Date.now() / 1e3 - 86400).all()).results[0];
    if ((mmRecent?.n || 0) > 0) return o({ error: "Faucet limit: one request per address per 24h" }, 429);
    const mmLife = (await r.prepare("SELECT COUNT(*) as n FROM chain_transactions WHERE from_addr = 'faucet' AND to_addr = ?").bind(e).all()).results[0];
    if ((mmLife?.n || 0) >= 3) return o({ error: "Faucet lifetime limit: 3 claims per address (pools carry real value now - owner law Sep 18, 2026)" }, 429);
    const fIP = a.headers.get("CF-Connecting-IP") || "unknown";
    const ipCount = (await r.prepare("SELECT COUNT(*) as n FROM chain_faucet_log WHERE ip = ? AND ts > ?").bind(fIP, Date.now() - 86400000).all()).results[0];
    if ((ipCount?.n || 0) >= 2) return o({ error: "Faucet limit: max 2 requests per network per 24h" }, 429);
    const gCount = (await r.prepare("SELECT COUNT(*) as n FROM chain_faucet_log WHERE ts > ?").bind(Date.now() - 86400000).all()).results[0];
    if ((gCount?.n || 0) >= 20) return o({ error: "Daily faucet budget exhausted" }, 429);
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
    await r.prepare("INSERT OR IGNORE INTO chain_contract_storage (contract_address, key, value) VALUES (?,?,?)").bind(pool.token_contract, tKey, "0").run(); await r.prepare("UPDATE chain_contract_storage SET value = CAST(CAST(value AS REAL) + ? AS TEXT) WHERE contract_address = ? AND key = ?").bind(out, pool.token_contract, tKey).run();
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
    await r.prepare("INSERT OR IGNORE INTO chain_contract_storage (contract_address, key, value) VALUES (?,?,?)").bind(pool.token_contract, tKey, "0").run(); await r.prepare("UPDATE chain_contract_storage SET value = CAST(CAST(value AS REAL) - ? AS TEXT) WHERE contract_address = ? AND key = ?").bind(amt, pool.token_contract, tKey).run();
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
  await r.prepare("INSERT OR IGNORE INTO chain_contract_storage (contract_address, key, value) VALUES (?,?,?)").bind(pool.token_contract, tKey, "0").run(); await r.prepare("UPDATE chain_contract_storage SET value = CAST(CAST(value AS REAL) - ? AS TEXT) WHERE contract_address = ? AND key = ?").bind(tAmt, pool.token_contract, tKey).run();
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
  await r.prepare("INSERT OR IGNORE INTO chain_contract_storage (contract_address, key, value) VALUES (?,?,?)").bind(pool.token_contract, tKey, "0").run(); await r.prepare("UPDATE chain_contract_storage SET value = CAST(CAST(value AS REAL) + ? AS TEXT) WHERE contract_address = ? AND key = ?").bind(tOut, pool.token_contract, tKey).run();
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

if (i === "/dex" || i === "/dex/" || i === "/dex/manifest.json") return Response.redirect("https://harz-swap.harz.workers.dev/", 302);

if (i === "/api/transfer" && u === "POST") try {
    const t = await a.json();
    const { from: e, to: c, amount: p } = t;
    let ammAuthOk = !!(t.key && t.key === s.CHAIN_API_KEY);
    if (!ammAuthOk && t.sig && e && t.nonce) { if (await ammVerifySig(e, e + "|" + c + "|" + parseFloat(p) + "|" + t.nonce, t.sig) && await ammNonceOk(e, t.nonce)) ammAuthOk = true; }
    if (!ammAuthOk) return o({ error: "Unauthorized: signature or admin key required" }, 403);
    if (!e || !c || !p || !l) return o({ error: "from, to, amount required" }, 400);
    const d = parseFloat(p);
    if (((await r.prepare("SELECT balance FROM chain_wallets WHERE address = ?").bind(e).all()).results[0]?.balance || 0) < d + 0.0001) return o({ error: "Insufficient balance (need amount + 0.0001 HARZ gas)" }, 400);
    await r.prepare("UPDATE chain_wallets SET balance = balance - ? WHERE address = ?").bind(d + 0.0001, e).run(), (await r.prepare("SELECT * FROM chain_wallets WHERE address = ?").bind(c).all()).results?.length ? await r.prepare("UPDATE chain_wallets SET balance = balance + ? WHERE address = ?").bind(d, c).run() : await r.prepare("INSERT INTO chain_wallets (address, balance, created_at) VALUES (?,?,?)").bind(c, d, Date.now()).run();
    const m = "tx_" + crypto.randomUUID().slice(0, 10), w = await g(r);
    return await r.prepare("INSERT INTO chain_transactions (id, from_addr, to_addr, amount, fee, block_index, status, timestamp) VALUES (?,?,?,?,?,?,?,?)").bind(m, e, c, d, 0.0001, w, "confirmed", Date.now() / 1e3).run(), await U(e, r), o({ success: true, tx_id: m, from: e, to: c, amount: d, fee: 1, block: w, status: "confirmed" });
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
    const t = Math.min(parseInt(n.searchParams.get("limit") || "50"), 200), e = await r.prepare("SELECT * FROM chain_transactions ORDER BY CAST(timestamp AS REAL) DESC LIMIT ?").bind(t).all();
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
    if (existing && (!t.key || t.key !== s.CHAIN_API_KEY)) return o({ error: "Wallet already has a registered key" }, 409);
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
      let tokAuthOk = !!(_ && a.key && a.key === _.CHAIN_API_KEY);
      if (!tokAuthOk && a.sig && a.from && a.nonce) {
        const tmsg = a.contract_address + "|" + a.from + "|" + a.to + "|" + parseFloat(a.amount) + "|" + a.nonce;
        const tpk = (await s.prepare("SELECT public_key FROM chain_wallet_pubkeys WHERE address = ?").bind(a.from).all()).results[0];
        if (tpk) { try { const tspki = Uint8Array.from(atob(tpk.public_key), (cx) => cx.charCodeAt(0)); const tkey = await crypto.subtle.importKey("spki", tspki, { name: "ECDSA", namedCurve: "P-256" }, false, ["verify"]); const tsig = Uint8Array.from(atob(a.sig), (cx) => cx.charCodeAt(0)); const tokSigOk = await crypto.subtle.verify({ name: "ECDSA", hash: "SHA-256" }, tkey, tsig, new TextEncoder().encode(tmsg)); const tnn = parseInt(a.nonce); if (tokSigOk && tnn > 0) { const tnrow = (await s.prepare("SELECT nonce FROM chain_nonces WHERE address = ?").bind(a.from).all()).results[0]; if (!tnrow || tnn > parseInt(tnrow.nonce)) { await s.prepare("INSERT OR REPLACE INTO chain_nonces (address, nonce) VALUES (?,?)").bind(a.from, tnn).run(); tokAuthOk = true; } } } catch (t2) { tokAuthOk = false; } }
      }
      if (!tokAuthOk) return o({ error: "Unauthorized: signature (contract|from|to|amount|nonce) or admin key required" }, 403);
      if (t < r) return o({ error: "Insufficient balance" }, 400);
      const tGasBal = (await s.prepare("SELECT balance FROM chain_wallets WHERE address = ?").bind(a.from).all()).results[0]?.balance || 0;
      if (tGasBal < 0.0001) return o({ error: "Insufficient HARZ for gas (0.0001 HARZ per transfer, burned)" }, 400);
      await s.prepare("UPDATE chain_wallets SET balance = balance - 0.0001 WHERE address = ?").bind(a.from).run();
      await s.prepare("UPDATE chain_contract_storage SET value = CAST(CAST(value AS REAL) - ? AS TEXT) WHERE contract_address = ? AND key = ?").bind(r, a.contract_address, "balance:" + i).run();
      const e = await s.prepare("SELECT value FROM chain_contract_storage WHERE contract_address = ? AND key = ?").bind(a.contract_address, "balance:" + u).all();
      await s.prepare("INSERT OR IGNORE INTO chain_contract_storage (contract_address, key, value) VALUES (?,?,?)").bind(a.contract_address, "balance:" + u, "0").run(); await s.prepare("UPDATE chain_contract_storage SET value = CAST(CAST(value AS REAL) + ? AS TEXT) WHERE contract_address = ? AND key = ?").bind(r, a.contract_address, "balance:" + u).run();
      const c = "tx_" + crypto.randomUUID().slice(0, 10);
      return await s.prepare("INSERT INTO chain_transactions (id, from_addr, to_addr, amount, fee, block_index, status, timestamp) VALUES (?,?,?,?,?,?,?,?)").bind(c, i, u, r, 0.0001, await g(s), "confirmed", Date.now() / 1e3).run(), o({ success: true, from: i, to: u, amount: r, tx_id: c });
    }
    if (n === "approve") return await s.prepare("INSERT OR REPLACE INTO chain_contract_storage (contract_address, key, value) VALUES (?,?,?)").bind(a.contract_address, "allowance:" + a.owner + ":" + a.spender, String(a.amount)).run(), o({ success: true, owner: a.owner, spender: a.spender, amount: a.amount });
    if (n === "transferFrom") {
      const i = "allowance:" + a.from + ":" + a.sender, u = await s.prepare("SELECT value FROM chain_contract_storage WHERE contract_address = ? AND key = ?").bind(a.contract_address, i).all();
      if (parseFloat(u.results[0]?.value || "0") < parseFloat(a.amount)) return o({ error: "Insufficient allowance" }, 400);
      const r = await s.prepare("SELECT value FROM chain_contract_storage WHERE contract_address = ? AND key = ?").bind(a.contract_address, "balance:" + a.from).all();
      if (parseFloat(r.results[0]?.value || "0") < parseFloat(a.amount)) return o({ error: "Insufficient balance" }, 400);
      await s.prepare("UPDATE chain_contract_storage SET value = CAST(CAST(value AS REAL) - ? AS TEXT) WHERE contract_address = ? AND key = ?").bind(parseFloat(a.amount), a.contract_address, "balance:" + a.from).run();
      const l = await s.prepare("SELECT value FROM chain_contract_storage WHERE contract_address = ? AND key = ?").bind(a.contract_address, "balance:" + a.to).all();
      await s.prepare("INSERT OR IGNORE INTO chain_contract_storage (contract_address, key, value) VALUES (?,?,?)").bind(a.contract_address, "balance:" + a.to, "0").run(); await s.prepare("UPDATE chain_contract_storage SET value = CAST(CAST(value AS REAL) + ? AS TEXT) WHERE contract_address = ? AND key = ?").bind(parseFloat(a.amount), a.contract_address, "balance:" + a.to).run(); await s.prepare("UPDATE chain_contract_storage SET value = CAST(CAST(value AS REAL) - ? AS TEXT) WHERE contract_address = ? AND key = ?").bind(parseFloat(a.amount), a.contract_address, i).run(); return o({ success: true, from: a.from, to: a.to, amount: a.amount });
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






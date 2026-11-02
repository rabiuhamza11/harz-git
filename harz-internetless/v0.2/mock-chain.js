#!/usr/bin/env node
// MOCK HARZ CHAIN — mirrors the real chain's /api/transfer verification exactly:
// ECDSA P-256 / SHA-256, IEEE P1363 sig, canonical "<from>|<to>|<amount>|<nonce>",
// pubkey registered per address, nonce must increase, balance must cover the amount.
const http = require("http");
const crypto = require("crypto");
const port = Number(process.argv[2] || 9900);

const wallets = {};   // address -> balance
const pubkeys = {};   // address -> spki b64
const nonces = {};    // address -> last nonce
const txs = [];

function verifySig(addr, msg, sigB64) {
  try {
    const pk = pubkeys[addr];
    if (!pk) return false;
    const k = crypto.createPublicKey({ key: Buffer.from(pk, "base64"), format: "der", type: "spki" });
    return crypto.verify("sha256", Buffer.from(msg, "utf8"), { key: k, dsaEncoding: "ieee-p1363" }, Buffer.from(sigB64, "base64"));
  } catch { return false; }
}

http.createServer((req, res) => {
  const reply = (c, o) => { res.writeHead(c, { "Content-Type": "application/json" }); res.end(JSON.stringify(o)); };
  let b = ""; req.on("data", c => b += c);
  req.on("end", () => {
    let t = {}; try { t = JSON.parse(b || "{}"); } catch {}
    if (req.url === "/seed" && req.method === "POST") {
      wallets[t.address] = t.balance; pubkeys[t.address] = t.public_key; nonces[t.address] = 0;
      return reply(200, { success: true, address: t.address });
    }
    if (req.url === "/api/wallet/register" && req.method === "POST") {
      if (pubkeys[t.address] && pubkeys[t.address] !== t.public_key) return reply(200, { error: "Wallet already has a registered key" });
      if (!pubkeys[t.address]) { pubkeys[t.address] = t.public_key; wallets[t.address] = wallets[t.address] || 0; nonces[t.address] = 0; }
      return reply(200, { success: true });
    }
    if (req.url === "/api/transfer" && req.method === "POST") {
      const { from, to, amount, nonce, sig } = t;
      const amt = parseFloat(amount);
      const msg = from + "|" + to + "|" + String(amt) + "|" + String(nonce);
      if (!sig || !verifySig(from, msg, sig)) return reply(403, { error: "Unauthorized: signature or admin key required" });
      if (!(parseInt(nonce) > parseInt(nonces[from] || 0))) return reply(403, { error: "Unauthorized: nonce already used" });
      if ((wallets[from] || 0) < amt) return reply(400, { error: "Insufficient balance" });
      nonces[from] = parseInt(nonce);
      wallets[from] -= amt; wallets[to] = (wallets[to] || 0) + amt;
      const tx = "tx_" + crypto.randomUUID().slice(0, 10);
      txs.push({ tx, from, to, amount: amt, nonce });
      return reply(200, { success: true, tx_id: tx, block: 11130000 + txs.length, amount: amt });
    }
    if (req.url === "/state") return reply(200, { wallets, pubkeys: Object.keys(pubkeys), txs });
    reply(404, { error: "not found" });
  });
}).listen(port, () => console.log("MOCK CHAIN on " + port));

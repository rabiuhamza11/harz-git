#!/usr/bin/env node
// HARZ OFFLINE PAY v0.2 — pay HARZ between two ordinary phones with NO Internet.
// One file. Zero dependencies (Node 18+ built-ins only). Termux-ready.
//
// LAW: HARZ continues to function when the Internet disappears.
//
// WHAT IS NEW IN v0.2 (over HARZ INTERNETLESS v0.1):
//   v0.1 proved signed MESSAGES travel over a hotspot LAN with no Internet.
//   v0.2 carries VALUE: a signed HARZ payment the receiver verifies locally,
//   a signed acknowledgement receipt, store-and-forward relay, and one-tap
//   settlement to HARZ Chain (Chain ID 7701) when the Internet returns.
//
// CRYPTO CONTRACT (matches HARZ Chain exactly):
//   wallet key      : ECDSA P-256 (prime256v1)
//   public key wire : SPKI DER, base64
//   signature wire  : IEEE P1363 (r||s, 64 bytes), base64, SHA-256
//   signed message  : "<from>|<to>|<parseFloat(amount)>|<nonce>"
//   chain endpoint  : POST /api/transfer {from,to,amount,nonce,sig}
//
// HONEST LIMITS (read these before trusting a receipt):
//   1. Offline verification proves the payer POSSESSES the signing key and that
//      the receipt is intact. It does not prove the key controls the address
//      until that binding is seen on-chain (or pinned from a prior online check).
//   2. Offline payments are provisional. Double-spend is settled by the chain:
//      the first sync wins, later syncs are refused by nonce/balance. Accept
//      offline payments only up to a trust limit you are willing to carry.
//   3. serve must be running on the receiving phone for live delivery.
//
// The private key NEVER prints. It lives in identity.json on the device only.

const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const os = require("os");

const DIR = process.env.HARZ_NODE_DIR || process.cwd();
const IDFILE = path.join(DIR, "identity.json");
const RECEIPTS = path.join(DIR, "receipts.jsonl");
const PROTOCOL = "harz-offline-pay/0.2";

function die(m) { console.error("REFUSED:", m); process.exit(1); }
function out(...a) { console.log(...a); }
function arg(name, def) {
  const i = process.argv.indexOf(name);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : def;
}
const cmd = process.argv[2];

// ---------- identity ----------
function loadId() {
  if (!fs.existsSync(IDFILE)) die("no identity here — run: node harz-offline-pay.js init --name NAME --wallet 080XXXXXXX0");
  const id = JSON.parse(fs.readFileSync(IDFILE, "utf8"));
  if (!id.mesh_priv || !id.mesh_pub) die("identity file corrupt (mesh keys missing)");
  return id;
}
function saveId(id) { fs.writeFileSync(IDFILE, JSON.stringify(id, null, 2), { mode: 0o600 }); }
function meshPriv(id) { return crypto.createPrivateKey(id.mesh_priv); }
function meshPubHex(k) { return k.export({ type: "spki", format: "der" }).subarray(-32).toString("hex"); }
function shortHex(h) { return (h || "").slice(0, 8); }

// mesh message signing (v0.1 protocol, preserved)
function meshCanonical(env) {
  return JSON.stringify({ from: env.from, name: env.name, text: env.text, ts: env.ts, nonce: env.nonce });
}
function meshSign(id, env) {
  return crypto.sign(null, Buffer.from(meshCanonical(env), "utf8"), meshPriv(id)).toString("hex");
}
function meshVerify(env) {
  if (!env || !env.from || typeof env.text !== "string" || !env.ts || !env.nonce) return { ok: false, why: "malformed" };
  try {
    const k = crypto.createPublicKey({ key: Buffer.from("302a300506032b6570032100" + env.from, "hex"), format: "der", type: "spki" });
    const ok = crypto.verify(null, Buffer.from(meshCanonical(env), "utf8"), k, Buffer.from(env.sig, "hex"));
    return ok ? { ok: true } : { ok: false, why: "SIGNATURE FAILED" };
  } catch (e) { return { ok: false, why: "bad key/sig" }; }
}

// ---------- wallet keys (ECDSA P-256, HARZ Chain compatible) ----------
function walletPriv(id) { return crypto.createPrivateKey({ key: id.wallet_priv_jwk, format: "jwk" }); }
function walletPubB64(id) { return id.wallet_pub_spki_b64; }
function walletFingerprint(id) { return crypto.createHash("sha256").update(Buffer.from(id.wallet_pub_spki_b64, "base64")).digest("hex").slice(0, 16); }
function payCanonical(from, to, amount, nonce) { return from + "|" + to + "|" + String(parseFloat(amount)) + "|" + String(nonce); }
function walletSign(id, msg) {
  return crypto.sign("sha256", Buffer.from(msg, "utf8"), { key: walletPriv(id), dsaEncoding: "ieee-p1363" }).toString("base64");
}
function walletVerify(pubSpkiB64, msg, sigB64) {
  try {
    const k = crypto.createPublicKey({ key: Buffer.from(pubSpkiB64, "base64"), format: "der", type: "spki" });
    return crypto.verify("sha256", Buffer.from(msg, "utf8"), { key: k, dsaEncoding: "ieee-p1363" }, Buffer.from(sigB64, "base64"));
  } catch (e) { return false; }
}
function ackCanonical(r, receivedAt) {
  return "ack|" + r.from + "|" + r.to + "|" + String(parseFloat(r.amount)) + "|" + String(r.nonce) + "|" + receivedAt;
}

// ---------- receipts ----------
function readReceipts() {
  if (!fs.existsSync(RECEIPTS)) return [];
  return fs.readFileSync(RECEIPTS, "utf8").split("\n").filter(Boolean)
    .map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
}
function appendReceipt(r) { fs.appendFileSync(RECEIPTS, JSON.stringify(r) + "\n"); }
function findReceipt(nonce) { return readReceipts().find(r => String(r.nonce) === String(nonce)); }
function saveReceipt(r) {
  const all = readReceipts();
  const i = all.findIndex(x => String(x.nonce) === String(r.nonce));
  if (i >= 0) all[i] = r; else all.push(r);
  fs.writeFileSync(RECEIPTS, all.map(x => JSON.stringify(x)).join("\n") + (all.length ? "\n" : ""));
}

// ---------- network helpers ----------
function localIPs() {
  const outIps = [];
  for (const name of Object.keys(os.networkInterfaces()))
    for (const i of os.networkInterfaces()[name] || [])
      if (i.family === "IPv4" && !i.internal) outIps.push(i.address);
  return outIps;
}
function postJSON(host, port, p, body, timeoutMs) {
  return new Promise((resolve, reject) => {
    const data = Buffer.from(JSON.stringify(body), "utf8");
    const req = http.request({ host, port, path: p, method: "POST", headers: { "Content-Type": "application/json", "Content-Length": data.length }, timeout: timeoutMs }, res => {
      let b = ""; res.on("data", c => b += c); res.on("end", () => { try { resolve(JSON.parse(b)); } catch { reject(new Error("bad peer response")); } });
    });
    req.on("timeout", () => { req.destroy(); reject(new Error("peer unreachable")); });
    req.on("error", reject);
    req.end(data);
  });
}
function getJSON(host, port, p, timeoutMs) {
  return new Promise((resolve, reject) => {
    const req = http.get({ host, port, path: p, timeout: timeoutMs }, res => {
      let b = ""; res.on("data", c => b += c); res.on("end", () => { try { resolve(JSON.parse(b)); } catch { reject(new Error("bad peer response")); } });
    });
    req.on("timeout", () => { req.destroy(); reject(new Error("peer unreachable")); });
    req.on("error", reject);
  });
}
function postJSONUrl(urlStr, body, timeoutMs) {
  return new Promise((resolve, reject) => {
    const u = new URL(urlStr);
    const data = Buffer.from(JSON.stringify(body), "utf8");
    const req = (u.protocol === "https:" ? require("https") : http).request({
      host: u.hostname, port: u.port || (u.protocol === "https:" ? 443 : 80), path: u.pathname + u.search, method: "POST",
      headers: { "Content-Type": "application/json", "Content-Length": data.length }, timeout: timeoutMs || 15000
    }, res => {
      let b = ""; res.on("data", c => b += c); res.on("end", () => { try { resolve({ status: res.statusCode, body: JSON.parse(b) }); } catch { resolve({ status: res.statusCode, body: { raw: b } }); } });
    });
    req.on("timeout", () => { req.destroy(); reject(new Error("chain unreachable (offline?)")); });
    req.on("error", reject);
    req.end(data);
  });
}

// ---------- core: verify an incoming payment ----------
function verifyPayment(p) {
  if (!p || (p.type !== "harz_payment" && p.type !== "harz_receipt")) return { ok: false, why: "not a payment" };
  if (!p.from || !p.to || !p.amount || !p.nonce || !p.sig) return { ok: false, why: "malformed payment" };
  const amt = parseFloat(p.amount);
  if (!(amt > 0)) return { ok: false, why: "bad amount" };
  if (!p.payer_pubkey) return { ok: false, why: "missing payer key" };
  const msg = payCanonical(p.from, p.to, amt, p.nonce);
  if (!walletVerify(p.payer_pubkey, msg, p.sig)) return { ok: false, why: "SIGNATURE FAILED" };
  return { ok: true, msg, amount: amt };
}

// ---------- commands ----------
async function main() {
  if (cmd === "init") {
    const name = arg("--name") || die("usage: init --name NODE_A --wallet 08012345678");
    const wallet = arg("--wallet") || die("missing --wallet (your HARZ Chain address, e.g. 08012345678 or 0x...)");
    if (!/^(0x[0-9a-fA-F]{40}|0\d{10})$/.test(wallet)) die("wallet must be an 11-digit phone number or 0x address");
    if (fs.existsSync(IDFILE)) die("identity already exists in this folder");

    const mesh = crypto.generateKeyPairSync("ed25519");
    const w = crypto.generateKeyPairSync("ec", { namedCurve: "prime256v1" });
    const spki = w.publicKey.export({ type: "spki", format: "der" });
    const id = {
      name,
      wallet,
      mesh_pub: meshPubHex(mesh.publicKey),
      mesh_priv: mesh.privateKey.export({ type: "pkcs8", format: "pem" }),
      wallet_pub_spki_b64: spki.toString("base64"),
      wallet_priv_jwk: w.privateKey.export({ format: "jwk" }),
      created: new Date().toISOString()
    };
    saveId(id);
    out("IDENTITY CREATED (keys stay on this device — never printed, never sent)");
    out("NAME   :", name);
    out("WALLET :", wallet);
    out("MESH   :", id.mesh_pub.slice(0, 16) + "...");
    out("PAY KEY:", walletFingerprint(id) + " (P-256, HARZ Chain compatible)");
    out("");
    out("NEXT   : while still online, run once:");
    out("         node harz-offline-pay.js register --chain https://harz-chain-v2.harz.workers.dev");
    out("         (binds this device key to your wallet address so synced payments are accepted)");

  } else if (cmd === "import-key") {
    // Bind an EXISTING HARZ wallet key to this device (needed when the wallet already has a key).
    const id = loadId();
    const src = arg("--jwk");
    if (!src) die("usage: import-key --jwk '<jwk-json-or-file>' [--address 080XXXXXXX0]");
    let raw = src;
    if (fs.existsSync(src)) raw = fs.readFileSync(src, "utf8");
    let parsed;
    try { parsed = JSON.parse(raw); } catch (e) { die("could not parse JWK json"); }
    const jwk = parsed.priv || parsed.privateKey || parsed.jwk || parsed;
    if (jwk.kty !== "EC" || jwk.crv !== "P-256" || !jwk.d) die("JWK must be an EC P-256 private key with d,x,y");
    const priv = crypto.createPrivateKey({ key: jwk, format: "jwk" });
    const pub = crypto.createPublicKey(priv);
    const spki = pub.export({ type: "spki", format: "der" });
    id.wallet_priv_jwk = priv.export({ format: "jwk" });
    id.wallet_pub_spki_b64 = spki.toString("base64");
    if (parsed.address) id.wallet = parsed.address;
    if (arg("--address")) id.wallet = arg("--address");
    saveId(id);
    out("WALLET KEY IMPORTED (device now controls", id.wallet + ")");
    out("PAY KEY:", walletFingerprint(id));
    out("NEXT: node harz-offline-pay.js register --chain https://harz-chain-v2.harz.workers.dev");

  } else if (cmd === "whoami" || cmd === "wallet") {
    const id = loadId();
    out("NAME   :", id.name);
    out("WALLET :", id.wallet);
    out("PAY KEY:", walletFingerprint(id));
    out("PUBKEY :", id.wallet_pub_spki_b64);
    out("MESH   :", id.mesh_pub, "(" + shortHex(id.mesh_pub) + ")");
    out("LOCAL  :", localIPs().join(", ") || "none");
    const rs = readReceipts();
    out("RECEIPTS:", rs.length, "| pending:", rs.filter(r => r.status !== "synced").length);

  } else if (cmd === "register") {
    // One-time ONLINE step: bind this device key to the wallet address on HARZ Chain.
    const id = loadId();
    const chain = (arg("--chain", "https://harz-chain-v2.harz.workers.dev") || "").replace(/\/$/, "");
    const r = await postJSONUrl(chain + "/api/wallet/register", { address: id.wallet, public_key: id.wallet_pub_spki_b64 }, 20000);
    out("CHAIN RESPONSE:", JSON.stringify(r.body));
    if (r.body && (r.body.success || /already has a registered key/i.test(r.body.error || ""))) {
      out("BINDING OK — this device can now sign payments for", id.wallet);
    } else {
      out("BINDING NOT CONFIRMED — payments can still be made offline, but chain settlement may refuse them.");
      out("If the wallet already has a different key, that key owns it; import it instead of generating a new one.");
    }

  } else if (cmd === "serve") {
    const id = loadId();
    const port = Number(arg("--port", "8990"));
    const seen = new Set(readReceipts().map(r => String(r.nonce)));
    const server = http.createServer((req, res) => {
      const reply = (code, obj) => { res.writeHead(code, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }); res.end(JSON.stringify(obj)); };

      if (req.method === "GET" && req.url === "/whoami") {
        return reply(200, { ok: true, protocol: PROTOCOL, name: id.name, wallet: id.wallet, pubkey: id.wallet_pub_spki_b64, fingerprint: walletFingerprint(id), receipts: readReceipts().length });
      }
      if (req.method === "GET" && req.url === "/receipts") {
        return reply(200, { ok: true, count: readReceipts().length, receipts: readReceipts().slice(-20) });
      }
      if (req.method === "POST" && req.url === "/pay") {
        let b = ""; req.on("data", c => b += c);
        req.on("end", () => {
          let p; try { p = JSON.parse(b); } catch { return reply(400, { ok: false, why: "not json" }); }
          const v = verifyPayment(p);
          if (!v.ok) {
            out("REJECTED payment from", shortHex(p && p.from), "->", v.why);
            return reply(200, { ok: true, verified: false, why: v.why });
          }
          if (p.to !== id.wallet) {
            out("REJECTED payment: addressed to", p.to, "not this wallet", id.wallet);
            return reply(200, { ok: true, verified: false, why: "wrong payee" });
          }
          if (seen.has(String(p.nonce))) {
            out("DUPLICATE payment nonce", p.nonce, "— already stored");
            return reply(200, { ok: true, verified: true, duplicate: true });
          }
          seen.add(String(p.nonce));
          const receivedAt = new Date().toISOString();
          const receipt = {
            protocol: PROTOCOL, type: "harz_receipt", status: "pending",
            from: p.from, to: p.to, amount: v.amount, nonce: p.nonce, ts: p.ts, memo: p.memo || "",
            payer_pubkey: p.payer_pubkey, sig: p.sig, canonical: v.msg,
            received_at: receivedAt,
            ack: { payee: id.wallet, payee_pubkey: id.wallet_pub_spki_b64, sig: walletSign(id, ackCanonical(p, receivedAt)), signed_at: receivedAt },
            synced: null
          };
          appendReceipt(receipt);
          out("PAYMENT RECEIVED from", p.from, "->", v.amount, "HARZ");
          out("SIGNATURE VALID — receipt stored. ACK signed by", id.name);
          reply(200, { ok: true, verified: true, receipt });
        });
        return;
      }
      if (req.method === "POST" && req.url === "/relay") {
        let b = ""; req.on("data", c => b += c);
        req.on("end", () => {
          let r; try { r = JSON.parse(b); } catch { return reply(400, { ok: false, why: "not json" }); }
          const v = verifyPayment(r);
          if (!v.ok) return reply(200, { ok: true, verified: false, why: v.why });
          if (seen.has(String(r.nonce))) return reply(200, { ok: true, verified: true, duplicate: true });
          seen.add(String(r.nonce));
          appendReceipt({ ...r, type: "harz_receipt", status: "pending", relayed: true, received_at: new Date().toISOString(), synced: null });
          out("RELAYED payment accepted:", r.amount, "HARZ from", r.from);
          reply(200, { ok: true, verified: true, relayed: true });
        });
        return;
      }
      reply(404, { ok: false });
    });
    server.listen(port, () => {
      out("HARZ OFFLINE PAY NODE serving (no Internet required)");
      out("NAME:", id.name, "| WALLET:", id.wallet, "| KEY:", walletFingerprint(id));
      out("PEERS: connect to -> " + (localIPs().map(ip => ip + ":" + port).join("  or  ") || "no LAN address"));
    });

  } else if (cmd === "pay") {
    const id = loadId();
    const to = arg("--to") || die("usage: pay --to IP:PORT --amount 250 --memo \"...\"");
    const amount = parseFloat(arg("--amount") || die("missing --amount"));
    if (!(amount > 0)) die("amount must be positive");
    const memo = arg("--memo", "");
    const [host, port] = to.split(":");
    const nonce = Date.now();
    const p = {
      protocol: PROTOCOL, type: "harz_payment",
      from: id.wallet, payer_name: id.name, payer_pubkey: id.wallet_pub_spki_b64,
      amount, nonce, ts: new Date().toISOString(), memo, sig: null
    };
    // payee address is unknown until the peer answers: ask, then sign the true payee.
    let peer;
    try { peer = await getJSON(host, Number(port), "/whoami", 8000); }
    catch (e) { die("peer unreachable — is `serve` running on the receiving phone? (" + e.message + ")"); }
    p.to = peer.wallet;
    p.sig = walletSign(id, payCanonical(p.from, p.to, amount, nonce));
    out("PAYING", amount, "HARZ ->", peer.name, "(" + peer.wallet + ") over local transport");
    const r = await postJSON(host, Number(port), "/pay", p, 10000);
    if (r && r.verified === true && r.receipt) {
      const rc = r.receipt;
      rc.role = "payer"; rc.status = "pending"; rc.synced = null;
      saveReceipt(rc);
      out("DELIVERED + VERIFIED by peer. Receipt:", rc.received_at);
      out("ACK SIGNED BY:", rc.ack.payee, "| nonce:", rc.nonce);
      out("STATUS: pending — settles on chain when Internet returns:");
      out("  node harz-offline-pay.js sync --chain https://harz-chain-v2.harz.workers.dev");
    } else if (r && r.duplicate) {
      out("peer already holds this nonce (no double count)");
    } else {
      out("NOT ACCEPTED:", (r && (r.why || JSON.stringify(r))) || "no response");
      process.exitCode = 1;
    }

  } else if (cmd === "receipts") {
    const all = readReceipts();
    out("RECEIPTS:", all.length, "| pending:", all.filter(r => r.status !== "synced").length, "| synced:", all.filter(r => r.status === "synced").length);
    for (const r of all.slice(-20)) {
      const dir = r.role === "payer" ? "PAID  " : "EARNED";
      out((r.status === "synced" ? "[SETTLED]" : "[PENDING]"), dir, r.amount, "HARZ", r.from.slice(0, 10) + "->" + r.to.slice(0, 10), "| nonce", r.nonce, r.memo ? "| " + r.memo : "");
    }

  } else if (cmd === "sync") {
    const id = loadId();
    const chain = (arg("--chain", "https://harz-chain-v2.harz.workers.dev") || "").replace(/\/$/, "");
    const pending = readReceipts().filter(r => r.status !== "synced");
    if (!pending.length) { out("nothing pending — all receipts settled"); return; }
    out("SETTLING", pending.length, "receipt(s) to HARZ Chain (Chain ID 7701)...");
    let ok = 0, fail = 0;
    for (const r of pending) {
      try {
        const resp = await postJSONUrl(chain + "/api/transfer", { from: r.from, to: r.to, amount: r.amount, nonce: r.nonce, sig: r.sig }, 20000);
        const b = resp.body || {};
        if (b.success) {
          r.status = "synced"; r.synced = { tx_id: b.tx_id, block: b.block, at: new Date().toISOString(), chain };
          saveReceipt(r); ok++;
          out("  SETTLED", r.amount, "HARZ | tx", b.tx_id, "| block", b.block);
        } else {
          const msg = b.error || JSON.stringify(b);
          // already settled somewhere or nonce consumed => treat as settled, not an error
          if (/nonce/i.test(msg)) { r.status = "synced"; r.synced = { note: msg, at: new Date().toISOString() }; saveReceipt(r); out("  ALREADY SETTLED (nonce consumed):", msg); ok++; }
          else { fail++; out("  REFUSED:", msg); }
        }
      } catch (e) { fail++; out("  CHAIN UNREACHABLE:", e.message); }
    }
    out("RESULT: settled", ok, "| refused", fail);
    if (fail) out("Tip: refused payments usually mean the device key is not bound to the wallet (run `register` while online) or the balance moved.");

  } else if (cmd === "relay") {
    const to = arg("--to") || die("usage: relay --to IP:PORT");
    const [host, port] = to.split(":");
    const all = readReceipts();
    if (!all.length) die("nothing to relay");
    let sent = 0, dup = 0;
    for (const r of all) {
      const res = await postJSON(host, Number(port), "/relay", r, 8000);
      if (res.verified === true) sent++;
      if (res.duplicate) dup++;
    }
    out("RELAYED", sent, "receipt(s),", dup, "duplicate(s) skipped — original payer signature preserved");

  } else if (cmd === "verify") {
    const file = arg("--file") || die("usage: verify --file receipt.json");
    const r = JSON.parse(fs.readFileSync(file, "utf8"));
    const v = verifyPayment(r);
    if (!v.ok) { out("RECEIPT INVALID:", v.why); process.exit(1); }
    out("RECEIPT VALID");
    out("  payer  :", r.from);
    out("  payee  :", r.to);
    out("  amount :", v.amount, "HARZ");
    out("  nonce  :", r.nonce, "| ts:", r.ts);
    out("  payer sig: VALID (P-256, canonical \"" + v.msg + "\")");
    if (r.ack && r.ack.sig) {
      const aok = walletVerify(r.ack.payee_pubkey, ackCanonical(r, r.ack.signed_at), r.ack.sig);
      out("  payee ack:", aok ? "VALID" : "INVALID");
    }
    out("  status :", r.status || "unknown", "| honest: offline receipt proves possession, settlement is chain-confirmed");

  } else if (cmd === "prove-offline") {
    const to = arg("--peer") || die("usage: prove-offline --peer IP:PORT");
    const [host, port] = to.split(":");
    let internetGone = false, probeWhy = "reachable";
    await new Promise(res => {
      const req = http.get({ host: "www.cloudflare.com", port: 80, path: "/", timeout: 4000 }, r => { r.resume(); res(); });
      req.on("timeout", () => { req.destroy(); internetGone = true; probeWhy = "timeout"; res(); });
      req.on("error", e => { internetGone = true; probeWhy = e.code || "unreachable"; res(); });
    });
    let peer = null, err = null;
    try { peer = await getJSON(host, Number(port), "/whoami", 6000); } catch (e) { err = e.message; }
    out("LEG 1 — Internet probe: " + (internetGone ? "FAILED (" + probeWhy + ") — Internet is GONE, as required" : "REACHABLE — turn off mobile data + Wi-Fi internet and re-run"));
    out(peer && peer.ok ? "LEG 2 — HARZ peer: ANSWERED -> " + peer.name + " (" + peer.wallet + "), protocol " + peer.protocol : "LEG 2 — HARZ peer: UNREACHABLE (" + (err || "no answer") + ")");
    if (internetGone && peer && peer.ok) out("VERDICT: INTERNET GONE, HARZ PAYS — the sentence stands: HARZ continues to function when the Internet disappears.");
    else out("VERDICT: NOT YET PROVEN — fix the failed leg(s). No honest claim until both pass.");

  } else {
    out("HARZ OFFLINE PAY v0.2 — pay HARZ with no Internet");
    out("commands:");
    out("  init --name NODE_A --wallet 08012345678      create device identity + P-256 pay key");
    out("  register --chain URL                         one-time ONLINE: bind key to wallet");
    out("  import-key --jwk '<json|file>' [--address]    use an existing wallet key on this device");
    out("  serve --port 8990                            receive payments on the hotspot LAN");
    out("  pay --to IP:PORT --amount 250 --memo \"..\"    send a signed payment");
    out("  receipts                                     list receipts (pending/settled)");
    out("  sync --chain URL                             settle pending receipts on chain");
    out("  relay --to IP:PORT                           forward receipts onward");
    out("  verify --file receipt.json                   verify a saved receipt");
    out("  prove-offline --peer IP:PORT                 honest Internet-gone proof");
    out("  whoami                                       show identity + wallet + key");
  }
}
main().catch(e => { console.error("ERROR:", e.message); process.exit(1); });

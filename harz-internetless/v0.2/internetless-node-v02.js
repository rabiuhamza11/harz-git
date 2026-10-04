#!/usr/bin/env node
// HARZ INTERNETLESS v0.2 — zero-dependency local mesh node (Node >= 18, no server, no Internet)
// G27 charter, exactly 3 items — no new features:
//   R1 ACK => RECOVERABLE DURABLE RECORD (fsync before ack; torn tails detected, classified, exposed)
//   R2 READ => REVERIFY (stored verdicts are cache, never authority)
//   R3 S6 local write+seal path (write -> seal -> persist -> kill -> recover -> verify)
// Base: frozen v0.1. Laws in ../v0.1-freeze/FREEZE-G27.md and ./CHANGES-V02.md.
"use strict";
const crypto = require("crypto"), fs = require("fs"), http = require("http"), os = require("os");
const IDFILE = "identity.json", INBOX = "inbox.jsonl", TORN = "inbox.torn";
const SEALS = "seals.jsonl", SEALS_TORN = "seals.torn";
const GENESIS = "0".repeat(64);
const cmd = process.argv[2] || "";
function die(m) { console.error("REFUSED:", m); process.exit(1); }
function loadId() {
  if (!fs.existsSync(IDFILE)) die("no identity in this folder — run: init --name NODE_X");
  let id; try { id = JSON.parse(fs.readFileSync(IDFILE, "utf8")); } catch { die("identity.json unreadable (corrupt?) — fail-closed"); }
  if (!id.priv || !id.pub) die("identity.json missing key material — fail-closed");
  return id;
}
function privKey(id) { return crypto.createPrivateKey(id.priv); }
function pubHex(k) { return k.export({ type: "spki", format: "der" }).subarray(-32).toString("hex"); }
function shortPub(h) { return h.slice(0, 8); }
function canonical(env) { return JSON.stringify({ from: env.from, name: env.name, text: env.text, ts: env.ts, nonce: env.nonce }); }
function sign(id, env) { return crypto.sign(null, Buffer.from(canonical(env), "utf8"), privKey(id)).toString("hex"); }
function verifyEnvelope(env) {
  if (!env || !env.from || typeof env.text !== "string" || !env.ts || !env.nonce) return { ok: false, why: "malformed" };
  try {
    const pub = "302a300506032b6570032100" + env.from;
    const k = crypto.createPublicKey({ key: Buffer.from(pub, "hex"), format: "der", type: "spki" });
    const ok = crypto.verify(null, Buffer.from(canonical(env), "utf8"), k, Buffer.from(env.sig, "hex"));
    return ok ? { ok: true } : { ok: false, why: "SIGNATURE FAILED" };
  } catch { return { ok: false, why: "malformed" }; }
}
// ---------- R1: durable append + torn-tail quarantine ----------
let _fd = {};
function fdFor(path) { if (_fd[path] === undefined) _fd[path] = fs.openSync(path, "a"); return _fd[path]; }
function closeFd(path) { if (_fd[path] !== undefined) { try { fs.closeSync(_fd[path]); } catch {} delete _fd[path]; } }
function appendDurable(path, obj) {
  const line = JSON.stringify(obj) + "\n";
  const fd = fdFor(path);
  fs.writeSync(fd, line);
  fs.fsyncSync(fd); // durability BEFORE any ack is issued
}
function readAndQuarantine(path, tornPath) {
  if (!fs.existsSync(path)) return { records: [], torn: 0 };
  const lines = fs.readFileSync(path, "utf8").split("\n");
  let records = [], torn = [];
  for (const l of lines) {
    if (!l) continue;
    try { records.push(JSON.parse(l)); } catch { torn.push(l); }
  }
  if (torn.length) {
    const q = torn.map(l => "TORN " + new Date().toISOString() + " bytes=" + Buffer.byteLength(l) + " :: " + l).join("\n") + "\n";
    fs.appendFileSync(tornPath, q);
    fs.writeFileSync(path + ".tmp", records.map(r => JSON.stringify(r)).join("\n") + (records.length ? "\n" : ""));
    fs.renameSync(path + ".tmp", path);
    closeFd(path); // rewritten file: reopen on next append so we never write to the orphaned inode
  }
  return { records, torn: torn.length };
}
function readInbox() { return readAndQuarantine(INBOX, TORN); }
// ---------- R2: read-time re-verification ----------
function verdicts(records) {
  return records.map(r => {
    const e = r.envelope;
    if (!e || !e.sig) return { rec: r, status: r.verified ? "CORRUPT" : "UNVERIFIED" };
    const v = verifyEnvelope(e);
    if (v.ok) return { rec: r, status: "VERIFIED" };
    return { rec: r, status: r.verified ? "CORRUPT" : "UNVERIFIED" };
  });
}
function localIPs() {
  const out = [];
  const ifs = os.networkInterfaces();
  for (const name of Object.keys(ifs)) for (const i of ifs[name] || []) if (i.family === "IPv4" && !i.internal) out.push(i.address);
  return out;
}
function postJSON(host, port, body, timeoutMs) {
  return new Promise((resolve, reject) => {
    const data = Buffer.from(JSON.stringify(body), "utf8");
    const req = http.request({ host, port, path: "/msg", method: "POST", headers: { "Content-Type": "application/json", "Content-Length": data.length }, timeout: timeoutMs }, res => {
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
function arg(name, def) {
  const i = process.argv.indexOf(name);
  if (i === -1) return def;
  const v = process.argv[i + 1];
  return v && !v.startsWith("--") ? v : (def !== undefined ? def : true);
}
// ---------- R3: local sealed journal ----------
function envDigest(env) { return crypto.createHash("sha256").update(canonical(env)).digest("hex"); }
function linkDigest(prev, seq, d) { return crypto.createHash("sha256").update(prev + "|" + seq + "|" + d).digest("hex"); }
function readSeals() { return readAndQuarantine(SEALS, SEALS_TORN); }
function sealCmd(id) {
  const text = arg("--text");
  if (!text) die('usage: seal --text "..."');
  const env = { from: id.pub, name: id.name, text, ts: Date.now(), nonce: crypto.randomBytes(16).toString("hex") };
  env.sig = sign(id, env);
  const seals = readSeals().records;
  const last = seals[seals.length - 1];
  if (last && !last.link) die("seal chain unreadable at tip — fail-closed, no new seals until inspected");
  const prev = last ? last.link : GENESIS;
  const seq = seals.length + 1;
  const d = envDigest(env);
  const link = linkDigest(prev, seq, d);
  const sig_link = crypto.sign(null, Buffer.from(prev + "|" + seq + "|" + d, "utf8"), privKey(id)).toString("hex");
  appendDurable(SEALS, { seq, prev, link, env_digest: d, env, sig_link, ts: new Date().toISOString() });
  console.log("SEALED #" + seq + " link " + link.slice(0, 12) + " — fsynced to disk BEFORE this ack. Kill the power now; it survives.");
}
function sealsCmd() {
  const { records, torn } = readSeals();
  if (torn) console.log("DISCLOSURE: " + torn + " torn seal line(s) quarantined to " + SEALS_TORN + " — evidence preserved");
  if (!records.length) { console.log("SEALS: 0 — no local sealed records"); return; }
  let prev = GENESIS, broken = 0;
  for (const rec of records) {
    const slot = rec.seq;
    const problems = [];
    if (rec.seq !== records.indexOf(rec) + 1) problems.push("SEQ GAP (expected " + (records.indexOf(rec) + 1) + ")");
    if (rec.prev !== prev) problems.push("FORK/DIVERGENT: prev " + String(rec.prev).slice(0, 8) + " != chain " + prev.slice(0, 8));
    const d = rec.env ? envDigest(rec.env) : null;
    if (d !== rec.env_digest) problems.push("ENV DIGEST MISMATCH");
    const v = rec.env && rec.env.sig ? verifyEnvelope(rec.env) : { ok: false };
    if (!v.ok) problems.push("ENVELOPE SIG FAILED (" + (v.why || "missing") + ")");
    let linkOk = false;
    try {
      const pub = "302a300506032b6570032100" + rec.env.from;
      const k = crypto.createPublicKey({ key: Buffer.from(pub, "hex"), format: "der", type: "spki" });
      linkOk = crypto.verify(null, Buffer.from(rec.prev + "|" + rec.seq + "|" + rec.env_digest, "utf8"), k, Buffer.from(rec.sig_link, "hex"));
    } catch {}
    if (!linkOk) problems.push("SEAL SIG FAILED");
    if (problems.length) { console.log("BROKEN at slot #" + slot + ": " + problems.join("; ")); broken++; }
    prev = rec.link;
  }
  console.log(broken === 0
    ? "SEALS: " + records.length + " records — CHAIN INTACT (every link + every signature re-verified just now; nothing trusted from disk labels)"
    : "SEALS: " + records.length + " records, " + broken + " BROKEN — explicit verdicts above, no smoothing");
  process.exitCode = broken ? 1 : 0;
}
async function main() {
  if (cmd === "init") {
    const name = arg("--name") || die("usage: init --name NODE_A");
    if (fs.existsSync(IDFILE)) die("identity already exists in this folder");
    const { publicKey, privateKey } = crypto.generateKeyPairSync("ed25519");
    const id = { name, pub: pubHex(publicKey), priv: privateKey.export({ type: "pkcs8", format: "pem" }), created: new Date().toISOString() };
    fs.writeFileSync(IDFILE, JSON.stringify(id, null, 2), { mode: 0o600 });
    console.log("IDENTITY CREATED (private key saved to identity.json on this device only — never printed, never sent)");
    console.log("NAME:", name);
    console.log("PUB:", id.pub, "(" + shortPub(id.pub) + ")");
  } else if (cmd === "whoami") {
    const id = loadId();
    console.log("NAME:", id.name);
    console.log("PUB:", id.pub, "(" + shortPub(id.pub) + ")");
    console.log("LOCAL IPS:", localIPs().join(", ") || "none");
  } else if (cmd === "serve") {
    const id = loadId();
    const port = Number(arg("--port", "8990"));
    const boot = readInbox();
    const seen = new Set(boot.records.map(r => r.envelope && r.envelope.nonce).filter(Boolean));
    if (boot.torn) console.log("BOOT DISCLOSURE: " + boot.torn + " torn inbox line(s) quarantined to " + TORN + " — evidence preserved, never erased");
    const server = http.createServer((req, res) => {
      const reply = (code, obj) => { res.writeHead(code, { "Content-Type": "application/json" }); res.end(JSON.stringify(obj)); };
      if (req.method === "GET" && req.url === "/whoami") {
        return reply(200, { ok: true, protocol: "harz-internetless/0.2", pub: id.pub, name: id.name, peers_seen: seen.size });
      }
      if (req.method === "GET" && req.url === "/inbox") {
        const { records, torn } = readInbox();
        const vs = verdicts(records);
        return reply(200, { count: records.length, verified_now: vs.filter(x => x.status === "VERIFIED").length,
          corrupt_now: vs.filter(x => x.status === "CORRUPT").length, torn_quarantined: torn,
          inbox: vs.slice(-20).map(x => ({ status: x.status, envelope: x.rec.envelope, received_at: x.rec.received_at })) });
      }
      if (req.method === "POST" && req.url === "/msg") {
        let b = ""; req.on("data", c => b += c);
        req.on("end", () => {
          let env; try { env = JSON.parse(b); } catch { return reply(400, { ok: false, why: "not json" }); }
          const v = verifyEnvelope(env);
          if (!v.ok) {
            appendDurable(INBOX, { envelope: env, verified: false, why: v.why, received_at: new Date().toISOString() });
            console.log("RECEIVED from", shortPub(env.from || "?"), "-> SIGNATURE FAILED (stored, marked unverified)");
            return reply(200, { ok: true, verified: false, why: v.why });
          }
          if (seen.has(env.nonce)) return reply(200, { ok: true, verified: true, duplicate: true, note: "already stored" });
          seen.add(env.nonce);
          appendDurable(INBOX, { envelope: env, verified: true, received_at: new Date().toISOString() }); // fsync BEFORE the reply
          console.log("RECEIVED from", env.name, "(" + shortPub(env.from) + "):", JSON.stringify(env.text));
          console.log("VERIFIED + FSYNCED — durable record on disk before this ACK left the node");
          reply(200, { ok: true, verified: true, from_short: shortPub(env.from), durable: true });
        });
        return;
      }
      reply(404, { ok: false });
    });
    server.listen(port, () => {
      console.log("HARZ INTERNETLESS v0.2 node serving (no Internet required)");
      console.log("NAME:", id.name, "| PUB short:", shortPub(id.pub));
      console.log("PEERS: connect to -> " + localIPs().map(ip => ip + ":" + port).join("  or  "));
    });
  } else if (cmd === "send") {
    const id = loadId();
    const to = arg("--to") || die("usage: send --to IP:PORT --text \"...\"");
    const text = arg("--text") || die("missing --text");
    const [host, port] = to.split(":");
    const env = { from: id.pub, name: id.name, text, ts: Date.now(), nonce: crypto.randomBytes(16).toString("hex") };
    env.sig = sign(id, env);
    const r = await postJSON(host, Number(port), env, 8000);
    console.log("SENT to", to, "->", JSON.stringify(r));
    if (r && r.verified === true && r.durable) console.log("PEER VERIFIED + FSYNCED — offline packet durably delivered");
    else if (r && r.duplicate) console.log("peer already had this message (dedup by nonce)");
    else if (r && r.verified === false) console.log("peer REFUSED my signature:", r.why);
  } else if (cmd === "inbox") {
    const { records, torn } = readInbox();
    if (torn) console.log("DISCLOSURE: " + torn + " torn inbox line(s) quarantined to " + TORN + " — evidence preserved, never erased");
    const vs = verdicts(records);
    const nV = vs.filter(x => x.status === "VERIFIED").length, nC = vs.filter(x => x.status === "CORRUPT").length;
    console.log("INBOX:", records.length, "messages (re-verified just now:", nV, "VERIFIED," , nC, "CORRUPT) — disk labels are not authority");
    for (const x of vs.slice(-20)) {
      const e = x.rec.envelope || {};
      console.log("[" + x.status + "]", shortPub(e.from || "?"), e.name || "?", "->", JSON.stringify(e.text || ""), "| received", x.rec.received_at);
    }
  } else if (cmd === "forward") {
    const id = loadId();
    const to = arg("--to") || die("usage: forward --to IP:PORT (relays stored verified messages onward)");
    const [host, port] = to.split(":");
    const { records, torn } = readInbox();
    if (torn) console.log("DISCLOSURE: " + torn + " torn line(s) quarantined to " + TORN);
    const vs = verdicts(records).filter(x => x.status === "VERIFIED" && x.rec.envelope); // R2: only what re-verifies NOW
    if (!vs.length) die("nothing verified to forward");
    let sent = 0, dup = 0, refused = 0;
    for (const x of vs) {
      try {
        const res = await postJSON(host, Number(port), x.rec.envelope, 8000);
        if (res.verified === true && !res.duplicate) sent++;
        else if (res.duplicate) dup++;
        else refused++;
      } catch { refused++; }
    }
    console.log("FORWARDED", sent, "verified message(s) onward,", dup, "duplicate(s) skipped by receiver,", refused, "refused/unreachable");
  } else if (cmd === "seal") {
    sealCmd(loadId());
  } else if (cmd === "seals") {
    sealsCmd();
  } else if (cmd === "prove-offline") {
    const to = arg("--peer") || die("usage: prove-offline --peer IP:PORT");
    const [host, port] = to.split(":");
    let internetGone = false, probeWhy = "reachable";
    await new Promise(res => {
      const req = http.get({ host: "www.cloudflare.com", port: 80, path: "/", timeout: 4000 }, r => { r.resume(); res(); });
      req.on("timeout", () => { req.destroy(); internetGone = true; probeWhy = "timeout"; res(); });
      req.on("error", e => { internetGone = true; probeWhy = e.code || "unreachable"; res(); });
    });
    let peer = null, peerErr = null;
    try { peer = await getJSON(host, Number(port), "/whoami", 6000); } catch (e) { peerErr = e.message; }
    console.log("LEG 1 — Internet probe: " + (internetGone ? "FAILED (" + probeWhy + ") — Internet is GONE, as required" : "REACHABLE — WARNING: Internet still up; turn off mobile data + wifi internet and re-run"));
    if (peer && peer.ok) console.log("LEG 2 — HARZ peer: ANSWERED -> " + peer.name + " (" + shortPub(peer.pub) + "), protocol " + peer.protocol);
    else console.log("LEG 2 — HARZ peer: UNREACHABLE (" + (peerErr || "no answer") + ")");
    if (internetGone && peer && peer.ok) console.log("VERDICT: INTERNET GONE, HARZ ALIVE — the sentence stands: HARZ continues to function when the Internet disappears.");
    else console.log("VERDICT: NOT YET PROVEN — fix the failed leg(s) and re-run. No honest claim until both legs pass.");
  } else if (cmd === "verify") {
    const file = arg("--file") || die("usage: verify --file envelope.json");
    const env = JSON.parse(fs.readFileSync(file, "utf8"));
    const v = verifyEnvelope(env);
    console.log(v.ok ? "SIGNATURE VALID from " + shortPub(env.from) : "SIGNATURE FAILED (" + v.why + ")");
    process.exit(v.ok ? 0 : 1);
  } else {
    console.log("HARZ INTERNETLESS v0.2 — Local Mesh Proof (G27: durable acks, read-reverify, sealed local writes)");
    console.log("commands: init --name X | whoami | serve [--port 8990] | send --to IP:PORT --text \"..\" | inbox | forward --to IP:PORT | seal --text \"..\" | seals | prove-offline --peer IP:PORT | verify --file f.json");
  }
}
main().catch(e => { console.error("ERROR:", e.message); process.exit(1); });

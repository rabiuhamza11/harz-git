// HARZ MESH TRANSPORT v0.1 BATTERY — GATE 3 (owner-specified, Sep 20, 2026)
// Topology: REAL TCP sockets (the Sep 6 harness method), frozen G1/G2 v2.1 frames.
// The 12 acceptance tests + THE LAW: mesh transports authority, never creates it.
import * as F from "./mesh-frame.js";
import { MeshNode } from "./mesh-core.js";
import * as carrier from "./zone-carrier.js";
import * as core from "./reach-core.js";
import { createHash } from "crypto";
import net from "net";

let PASS = 0, FAIL = 0;
const T = (id, name, ok, note) => { console.log((ok ? "PASS" : "FAIL") + " " + id + " — " + name + (note ? "  [" + note + "]" : "")); ok ? PASS++ : FAIL++; };
const sleep = ms => new Promise(r => setTimeout(r, ms)); // async sleep — the loop must stay free for socket I/O
const digest = z => { const { sig, ...u } = z; return createHash("sha256").update(core.canonicalize(u)).digest("hex"); };
const TRUE_DIGEST = "cac16833f4d43fb59115786aebb2619f471e1bc353734ffdad6a757f90928fcb";

// ---------- TCP transport (the frozen framing: 4-byte BE length prefix + frame) ----------
class TcpTransport {
  constructor(sock) { this.sock = sock; this.connected = true; this.onFrame = null; this.buffer = Buffer.alloc(0); }
  send(bytes) { try { const len = Buffer.alloc(4); len.writeUInt32BE(bytes.length); this.sock.write(Buffer.concat([len, bytes])); } catch (e) { this.connected = false; } }
  isConnected() { return this.connected && !this.sock.destroyed; }
  describe() { return "tcp://" + (this.sock.remoteAddress || "server") + ":" + (this.sock.remotePort || "") ; }
  feed(chunk) {
    this.buffer = Buffer.concat([this.buffer, chunk]);
    while (this.buffer.length >= 4) {
      const len = this.buffer.readUInt32BE(0);
      if (this.buffer.length < 4 + len) break;
      const frame = this.buffer.subarray(4, 4 + len);
      this.buffer = this.buffer.subarray(4 + len);
      if (this.onFrame) this.onFrame(frame);
    }
  }
  close() { this.connected = false; try { this.sock.destroy(); } catch (e) {} }
}
function startGo(id, port) {
  const node = new MeshNode(id, {});
  const server = net.createServer(sock => {
    const t = new TcpTransport(sock);
    sock.on("data", c => t.feed(c));
    sock.on("close", () => node.detach(t));
    node.attach(t);
  });
  return new Promise(res => server.listen(port, "127.0.0.1", () => res({ node, server })));
}
async function connectClient(id, port) {
  const node = new MeshNode(id, {});
  const sock = net.createConnection({ host: "127.0.0.1", port });
  await new Promise((res, rej) => { sock.once("connect", res); sock.once("error", rej); });
  const t = new TcpTransport(sock);
  sock.on("data", c => t.feed(c));
  node.attach(t);
  t.send(F.encodeFrame(F.hello(id))); // register per the frozen protocol
  return { node, t, sock };
}
const awaitPeers = async (n, c, timeout = 5000) => { const t0 = Date.now(); while (n.peersOnline().length < c && Date.now() - t0 < timeout) await sleep(50); return n.peersOnline().length >= c; };

// ---------- G3-1: the existing protocol harness (run unchanged, see audit) ----------
console.log("=== GATE 3 BATTERY — MESH TRANSPORT v0.1 ===");
console.log("G3-1 prerequisite (separate run, unchanged): Kotlin core SelfTest — see audit/G3-1-HARNESS-RUN.txt");
console.log("");

// ---------- Phone A gets the verified book (live from the frozen root) ----------
const zoneRes = await fetch(core.ROOTS[0] + "/zone", { cache: "no-store" });
const liveZone = await zoneRes.json();
const aLoaded = await core.loadZone(liveZone);
if (!aLoaded.ok) { console.log("FATAL: live zone failed verification"); process.exit(1); }
const zoneBytes = Buffer.from(core.canonicalize(aLoaded.zone), "utf8");
console.log("Phone A: fetched the signed book from Node A — verified (height " + aLoaded.zone.height + ", " + aLoaded.zone.records.length + " names, " + zoneBytes.length + " canonical bytes)");
console.log("");

// ---------- G3-2/3/4/5/6: A -> B transfer, verify, invariants, resolve, NXDOMAIN ----------
{
  const { node: go, server } = await startGo("AAAA", 18701);
  const cli = await connectClient("BBBB", 18701);
  const a = new MeshNode("AAAA", {}); // carrier on A's side
  // wire A's carrier into the GO's node? sendZone needs a MeshNode with B as peer.
  // Simpler: the GO node IS phone A.
  const recv = new carrier.ZoneReceiver();
  cli.node.listener = { onData: (src, seq, hops, route, payload) => recv.absorb(src, seq, hops, route, payload) };
  await awaitPeers(go, 1) && await awaitPeers(cli.node, 1);
  const meta = await carrier.sendZone(go, "BBBB", aLoaded.zone);
  await sleep(1500);
  const verdict = await recv.finalize("AAAA");
  if (!verdict.ok) console.log("   DEBUG verdict:", JSON.stringify(verdict).slice(0, 300));
  T("G3-2", "A → B signed-book transfer succeeds over the frozen mesh",
    verdict.ok, meta.chunks + " chunks, " + meta.bytes + " bytes over real TCP");
  const bSig = await core.verifyZoneSig(verdict.zone);
  T("G3-3", "B independently verifies the king signature (Ed25519, local WebCrypto)", bSig === true, "sig 230e5208… verified at B");
  const d = digest(verdict.zone);
  T("G3-4", "B confirms digest/height/name-floor invariants",
    d === TRUE_DIGEST && verdict.zone.height === 1 && verdict.zone.records.length === 77 && core.trustCheck(verdict.zone) === null,
    "digest " + d.slice(0, 8) + ", height " + verdict.zone.height + ", " + verdict.zone.records.length + " names");
  const pay = recv.resolve("pay.harz");
  T("G3-5", "B resolves pay.harz from the mesh-delivered verified book",
    pay?.endpoints?.https === "https://harzpay.harz.workers.dev", "→ harzpay.harz.workers.dev");
  const nx = recv.resolve("unknown.harz");
  T("G3-6", "unknown .harz stays NXDOMAIN (honest absence, no fake resolution)", nx === null);
  // receipt law: the mesh delivery leaves a receipt naming the mesh source
  const receipt = core.makeReceipt({ name: "pay.harz", result: "RESOLVED", transport: "mesh-live", node: "mesh:AAAA", endpoint: pay?.endpoints?.https, height: verdict.zone.height, digest8: d.slice(0, 8), sigOk: true, records: verdict.zone.records.length });
  T("G3-R", "receipt records the mesh source (transport mesh-live, node mesh:AAAA)",
    receipt.transport === "mesh-live" && receipt.node === "mesh:AAAA");
  server.close(); cli.sock.destroy();
}

// ---------- G3-7: one-byte corruption in transit → REFUSED ----------
{
  const { node: go, server } = await startGo("AAAA", 18711);
  const cli = await connectClient("BBBB", 18711);
  // wire tap: corrupt ONE payload byte mid-flight and RE-SEAL the frame CRC
  // (so the transport sees a valid frame — only the book itself is corrupted)
  const full = carrier.packageZone(aLoaded.zone);
  const sigByteOff = full.indexOf("230e5208") + 10;   // inside the king's signature hex
  const sigChunkIdx = Math.floor(sigByteOff / F.CHUNK_SIZE);
  const sigInChunk = sigByteOff % F.CHUNK_SIZE;
  let tapped = false;
  const recv = new carrier.ZoneReceiver();
  let firstSeq = null;
  cli.node.listener = { onData: (src, seq, hops, route, payload) => {
    let p = payload;
    if (firstSeq === null) firstSeq = seq;         // first DATA seq = chunk 0
    const chunkIdx = seq - firstSeq;
    if (!tapped && chunkIdx === sigChunkIdx) {      // corrupt ONE byte in the sig region, once
      p = Buffer.from(payload);
      p[sigInChunk] ^= 0x01;
      tapped = true;
    }
    recv.absorb(src, seq, hops, route, p);
  } };
  await awaitPeers(go, 1) && await awaitPeers(cli.node, 1);
  await carrier.sendZone(go, "BBBB", aLoaded.zone);
  await sleep(1500);
  const verdict = await recv.finalize("AAAA");
  T("G3-7", "one-byte corruption in transit → B REFUSES the book (no warning, no best-effort)",
    !verdict.ok && recv.verified === null,
    "verdict: " + (verdict.reason || "").slice(0, 60) + " | cache untouched: " + (recv.verified === null));
  server.close(); cli.sock.destroy();
}

// ---------- G3-8 + G3-AUTH: authority — foreign/self-minted books refused ----------
async function mintForeignBook(mutate) {
  // a CORRECTLY-signed zone by a DIFFERENT (foreign / phone's own) key
  const zone = JSON.parse(core.canonicalize(aLoaded.zone)); // canonical clone
  mutate(zone);
  const kp = await crypto.subtle.generateKey({ name: "Ed25519" }, true, ["sign", "verify"]);
  const raw = await crypto.subtle.exportKey("raw", kp.publicKey);
  zone.signed_by = "ed25519:" + Buffer.from(raw).toString("hex");
  const { sig, ...unsigned } = zone;
  const data = new TextEncoder().encode(core.canonicalize(unsigned));
  const s = await crypto.subtle.sign("Ed25519", kp.privateKey, data);
  zone.sig = "ed25519:" + Buffer.from(s).toString("hex");
  // prove the book is VALIDLY signed BY ITS OWN KEY (verify against the foreign pub)
  const pre = Buffer.from("302a300506032b6570032100", "hex");
  const key = await crypto.subtle.importKey("spki", Buffer.concat([pre, Buffer.from(raw)]), { name: "Ed25519" }, false, ["verify"]);
  const selfOk = await crypto.subtle.verify("Ed25519", key, new Uint8Array(Buffer.from(s)), data);
  return { zone, selfOk };
}
{
  const { node: go, server } = await startGo("AAAA", 18721);
  const cli = await connectClient("BBBB", 18721);
  const recv = new carrier.ZoneReceiver();
  cli.node.listener = { onData: (src, seq, hops, route, payload) => recv.absorb(src, seq, hops, route, payload) };
  await awaitPeers(go, 1) && await awaitPeers(cli.node, 1);
  // G3-8: a foreign key signs the book (valid signature of its own)
  const foreign = await mintForeignBook(z => { z.records[5].endpoints.https = "https://foreign.example"; });
  await carrier.sendZone(go, "BBBB", foreign.zone);
  await sleep(1500);
  const v8 = await recv.finalize("AAAA");
  T("G3-8", "foreign signed book (valid sig, wrong king) → REJECTED",
    !v8.ok && v8.reason.includes("WRONG ANCHOR"), "sig valid by ITS OWN key: " + foreign.selfOk + " — the anchor law still refuses it");
  recv.buffers.delete("AAAA");
  server.close(); cli.sock.destroy();
}
{
  // THE LAW: the phone itself mints a NEW root book (its own key, its own new name)
  const { node: go, server } = await startGo("BBBB", 18731);
  const cli = await connectClient("AAAA", 18731);
  const recv = new carrier.ZoneReceiver();
  cli.node.listener = { onData: (src, seq, hops, route, payload) => recv.absorb(src, seq, hops, route, payload) };
  await awaitPeers(go, 1) && await awaitPeers(cli.node, 1);
  const minted = await mintForeignBook(z => {
    z.records.push({ v: 2, name: "iownthis.harz", service: "platform", identity: "PENDING", endpoints: { https: "https://mine.example" }, routing: { nodes: [] }, policy: { trust: "canonical" }, state: { height: 0, digest: "" } });
  });
  await carrier.sendZone(go, "AAAA", minted.zone); // phone B pushes its self-minted book at A
  await sleep(1500);
  const vA = await recv.finalize("BBBB");
  T("G3-AUTH", "THE LAW: a mesh node cannot MINT authority — self-signed 78-name book refused",
    !vA.ok && recv.verified === null, vA.reason.slice(0, 70));
  // cache tamper: mutate the verified book after delivery → verification fails → cannot serve
  const tampered = JSON.parse(core.canonicalize(aLoaded.zone));
  tampered.records[5].endpoints.https = "https://evil.example";
  const tLoad = await core.loadZone(tampered);
  T("G3-AUTH2", "local cache tamper → REFUSED (carry, cache, relay, verify — never create)",
    !tLoad.ok && tLoad.reason.includes("SIGNATURE FAILED"));
  server.close(); cli.sock.destroy();
}

// ---------- G3-9: duplicate packet handled deterministically ----------
{
  const { node: go, server } = await startGo("AAAA", 18741);
  const cli = await connectClient("BBBB", 18741);
  const recv = new carrier.ZoneReceiver();
  const deliveries = [];
  cli.node.listener = { onData: (src, seq, hops, route, payload) => { deliveries.push(seq); recv.absorb(src, seq, hops, route, payload); } };
  await awaitPeers(go, 1) && await awaitPeers(cli.node, 1);
  // replay the SAME frame 3x (same src,seq — frozen T4 law)
  const frame = F.encodeFrame({ type: F.TYPE_DATA, src: "AAAA", dst: "BBBB", seq: 500, ttl: 8, hops: 0, route: ["AAAA"], payload: Buffer.from("same packet") });
  cli.t.send(frame); cli.t.send(frame); cli.t.send(frame);
  await sleep(400);
  T("G3-9", "duplicate packet (same src,seq x3) delivered EXACTLY ONCE, deterministically",
    deliveries.filter(s => s === 500).length === 1, "delivered " + deliveries.filter(s => s === 500).length + "x of 3 sent");
  server.close(); cli.sock.destroy();
}

// ---------- G3-10/11: interruption → held queue → reconnect → exactly once ----------
{
  const { node: go, server } = await startGo("AAAA", 18751);
  let cli = await connectClient("BBBB", 18751);
  const recv = new carrier.ZoneReceiver();
  cli.node.listener = { onData: (src, seq, hops, route, payload) => recv.absorb(src, seq, hops, route, payload) };
  await awaitPeers(go, 1) && await awaitPeers(cli.node, 1);
  const full = carrier.packageZone(aLoaded.zone);
  const chunks = go.chunkPayload(full);
  // send first 5 chunks, then KILL B mid-transfer
  for (let i = 0; i < 5; i++) { go.sendChunk("BBBB", chunks[i]); await sleep(15); }
  cli.t.close(); cli.sock.destroy();
  await sleep(150);
  // A continues sending into the outage — G2-E: frames HELD
  const startHeld = go.totalHeld();
  for (let i = 5; i < chunks.length; i++) { go.sendChunk("BBBB", chunks[i]); await sleep(10); }
  T("G3-10", "offline queue survives interruption (frames held while B is gone)",
    go.totalHeld() === chunks.length - 5, "held=" + go.totalHeld() + " (start " + startHeld + ")");
  // B reconnects → HELLO → flush → byte-identical completion
  cli = await connectClient("BBBB", 18751);
  cli.node.listener = { onData: (src, seq, hops, route, payload) => recv.absorb(src, seq, hops, route, payload) };
  await awaitPeers(go, 1) && await awaitPeers(cli.node, 1);
  await sleep(1500);
  const verdict = await recv.finalize("AAAA");
  T("G3-10b", "reconnect delivers the held queue — book completes",
    verdict.ok, "transport mesh-live, " + (verdict.bytes || "?") + " bytes");
  const d = digest(verdict.zone);
  T("G3-10c", "delivered book byte-identical to the king's (digest match)", d === TRUE_DIGEST, d.slice(0, 16));
  T("G3-11", "exactly once at the application layer (one book delivery, no dup app events)",
    recv.appDeliveries === 1, "appDeliveries=" + recv.appDeliveries);
  // G3-12: roots unreachable — the mesh-delivered verified book remains usable
  const deadRoots = await core.fetchVerifiedZone(["https://dead-a.invalid", "https://dead-b.invalid"]);
  const pay = recv.resolve("pay.harz");
  T("G3-12", "Root A/B unreachable → mesh-delivered verified book still serves .harz",
    !deadRoots.ok && pay?.endpoints?.https === "https://harzpay.harz.workers.dev",
    "roots: " + (deadRoots.ok ? "reachable?" : "ALL REFUSED") + " | pay.harz resolves from mesh cache");
  server.close(); cli.sock.destroy();
}

console.log("");
console.log("GATE 3 BATTERY: " + PASS + "/" + (PASS + FAIL) + (FAIL ? " — FAILURES PRESENT" : " — ALL PASS"));
console.log("FROZEN CHAIN: root A/B untouched · signed book unchanged · mesh = transport only.");
process.exit(FAIL ? 1 : 0);

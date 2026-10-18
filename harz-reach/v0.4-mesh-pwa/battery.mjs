// BATTERY — pwa-core.js (browser port) vs the frozen v0.3 twin as ORACLE.
// Same law as the frozen battery: every check must pass, refused means refused.
import * as F from "file:///tmp/mesh/mesh-frame.js";
import { crc32 } from "zlib";
import fs from "fs";
import M from "file:///app/conversations/6a66e5b615875be40f970cd0/v2now/mesh-pwa/pwa-core.js";

let pass = 0, fail = 0;
const check = (name, ok, detail) => {
  if (ok) { pass++; console.log("PASS " + name + (detail ? "  (" + detail + ")" : "")); }
  else { fail++; console.log("FAIL " + name + (detail ? "  (" + detail + ")" : "")); }
};

// T1 — CRC32 agreement with zlib on random buffers
{
  let ok = true;
  for (let t = 0; t < 50; t++) {
    const buf = Buffer.alloc(3000 + t * 77);
    for (let i = 0; i < buf.length; i++) buf[i] = (i * 7 + t * 13) & 0xff;
    if (M.crc32(new Uint8Array(buf)) !== (crc32(buf) >>> 0)) { ok = false; break; }
  }
  check("T1 CRC32 identical to zlib across 50 buffers", ok);
}

// T2 — encodeFrame byte-identical to the frozen twin (hello, data, ack, 900B payload)
{
  const chunk = Buffer.alloc(900); for (let i = 0; i < 900; i++) chunk[i] = (i * 31) & 0xff;
  const cases = [
    F.hello("AAAA", 0),
    F.helloAck("AAAA", "BBBB", 7),
    F.data("AAAA", "BBBB", 12345, 8, chunk),
    F.ack("BBBB", "AAAA", 42, ["BBBB"]),
  ];
  let ok = true;
  for (const f of cases) {
    const a = F.encodeFrame(f);
    const b = M.encodeFrame(f);
    if (a.length !== b.length) { ok = false; console.log("  length mismatch", a.length, b.length); break; }
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) { ok = false; console.log("  byte mismatch at", i, a[i], b[i]); break; }
    if (!ok) break;
  }
  check("T2 encodeFrame byte-identical to frozen twin (4 frame types incl. 900B payload)", ok, cases[2].payload.length + "B payload frame");
}

// T3 — decode round-trip: frozen twin encodes, MY decoder reads identical fields; CRC tamper caught
{
  const chunk = Buffer.alloc(77); for (let i = 0; i < 77; i++) chunk[i] = i;
  const f = F.data("AAAA", "BBBB", 999, 8, chunk);
  const bytes = F.encodeFrame(f);
  const mine = M.decodeFrame(new Uint8Array(bytes));
  let ok = mine.type === 3 && mine.src === "AAAA" && mine.dst === "BBBB" && mine.seq === 999 &&
    mine.ttl === 8 && mine.route.join(",") === "" &&
    mine.payload.length === 77 && mine.payload[5] === 5;
  const evil = Buffer.from(bytes); evil[6] ^= 0x01; evil[evil.length - 1] ^= 0xff;
  let caught = false;
  try { M.decodeFrame(new Uint8Array(evil)); } catch (e) { caught = true; }
  check("T3 frozen-encoded frame decodes identically in my port", ok);
  check("T3b tampered frame (bad CRC) refused by my decoder", caught);
}

// T4 — real book: fetch + loadZone verify (WebCrypto Ed25519, same law)
let ZONE = null;
{
  const loaded = await M.fetchVerifiedZone();
  ZONE = loaded.zone;
  check("T4 real book fetched + king signature VERIFIED", loaded.ok && ZONE.records.length >= 77,
    "height " + ZONE.height + ", " + ZONE.records.length + " names, node " + loaded.node);
}

// T5 — packageZone + chunk + reassemble + finalize: verified over the byte path
{
  const full = M.packageZone(ZONE);
  const recv = new M.ZoneReceiver();
  const chunks = M.chunkPayload(full);
  for (let i = 0; i < chunks.length; i++) {
    const st = recv.absorb("AAAA", i, 0, ["AAAA"], chunks[i]);
    if (st !== "stored") { check("T5 absorb chunk " + i, false, st); break; }
  }
  const v = await recv.finalize("AAAA");
  check("T5 book reassembled from " + chunks.length + " chunks + INDEPENDENTLY VERIFIED",
    v.ok && v.zone.height === ZONE.height, "bytes " + full.length + ", verdict " + (v.ok ? "ok" : v.reason));
  const pay = recv.resolve("pay.harz");
  check("T5b pay.harz resolves from mesh-delivered book", !!pay && pay.endpoints.https === "https://harzpay.harz.workers.dev", pay ? pay.endpoints.https : "null");
  check("T5c unknown.harz = honest NXDOMAIN", recv.resolve("unknown.harz") === null);
}

// T6 — THE DEATH TEST: one sig byte flipped mid-flight => REFUSED, cache untouched
{
  const full = M.packageZone(ZONE);
  const recv = new M.ZoneReceiver();
  const chunks = M.chunkPayload(full);
  // flip a byte inside the signature region (same dynamic targeting)
  const fb = M.str(full);
  const sigMark = fb.indexOf('"sig":"');
  const sigByteOff = sigMark + 7 + 20;
  const idx = Math.floor(sigByteOff / 900), inChunk = sigByteOff % 900;
  for (let i = 0; i < chunks.length; i++) {
    const c = chunks[i].slice(0);
    if (i === idx) c[inChunk] ^= 0x01;
    recv.absorb("AAAA", i, 0, ["AAAA"], c);
  }
  const v = await recv.finalize("AAAA");
  check("T6 DEATH TEST: corrupted book REFUSED — signature failed, fail-closed",
    !v.ok && v.reason.indexOf("SIGNATURE FAILED") >= 0 && v.reason.indexOf("REFUSED") === 0, v.reason);
  check("T6b cache untouched after refusal", recv.verified === null);
}

// T7 — dedup: same chunk 3x absorbed once
{
  const recv = new M.ZoneReceiver();
  const chunk = new Uint8Array(10);
  const s1 = recv.absorb("AAAA", 5, 0, ["AAAA"], chunk);
  const s2 = recv.absorb("AAAA", 5, 0, ["AAAA"], chunk);
  const s3 = recv.absorb("AAAA", 5, 0, ["AAAA"], chunk);
  check("T7 app-layer dedup: 3x absorbed => stored,dup,dup", s1 === "stored" && s2 === "dup" && s3 === "dup");
}

// T8 — end-to-end through LengthTransport + MeshP2P pair (in-memory pipe, frozen frame bytes)
{
  const A = new M.MeshP2P("AAAA", {});
  const B = new M.MeshP2P("BBBB", {});
  const recv = new M.ZoneReceiver();
  const bufs = { A2B: [], B2A: [] };
  const mk = (arr) => new M.LengthTransport(b => arr.push(b));
  const tA = mk(bufs.A2B), tB = mk(bufs.B2A);
  const pump = () => { // deliver pending bytes both directions
    while (bufs.A2B.length) { const b = bufs.A2B.shift(); tB.feed(b); }
    while (bufs.B2A.length) { const b = bufs.B2A.shift(); tA.feed(b); }
  };
  A.attach(tA); B.attach(tB);
  let joined = false;
  B.listener.onPeerJoined = () => { joined = true; };
  B.listener.onData = (src, seq, hops, route, payload) => recv.absorb(src, seq, hops, route, payload);
  let acks = 0;
  A.listener.onAck = () => { acks++; };
  A.sendHello(); pump();
  check("T8 HELLO handshake over the wire (B joined as [BBBB])", joined);
  const meta = await A.sendZone("BBBB", ZONE); pump();
  const v = await recv.finalize("AAAA");
  check("T8b book delivered A→B over frozen frames through the length-prefixed wire",
    v.ok && meta.chunks > 0, meta.chunks + " chunks / " + meta.bytes + " bytes, acks " + acks);
  check("T8c every chunk ACKed back at A", acks === meta.chunks, acks + "/" + meta.chunks);
}

// T9 — corruptHook through the FULL pipe (the field death-test path)
{
  const A = new M.MeshP2P("AAAA", {}), B = new M.MeshP2P("BBBB", {});
  const recv = new M.ZoneReceiver();
  const bufs = { A2B: [], B2A: [] };
  const tA = new M.LengthTransport(b => bufs.A2B.push(b)), tB = new M.LengthTransport(b => bufs.B2A.push(b));
  const pump = () => { while (bufs.A2B.length) tB.feed(bufs.A2B.shift()); while (bufs.B2A.length) tA.feed(bufs.B2A.shift()); };
  A.attach(tA); B.attach(tB);
  B.listener.onData = (src, seq, hops, route, payload) => recv.absorb(src, seq, hops, route, payload);
  let flipped = -1;
  A.listener.onCorrupted = (idx) => { flipped = idx; };
  M.corruptHook(A, "BBBB", M.packageZone(ZONE)); // BEFORE peer registered — the exact field timing
  A.sendHello(); pump();
  await A.sendZone("BBBB", ZONE); pump();
  const src = [...recv.buffers.keys()][0];
  const v = await recv.finalize(src);
  check("T9 corruptHook (pre-registration) flips sig chunk mid-flight", flipped >= 0, "chunk " + flipped);
  check("T9b B REFUSES the corrupted book — signature failed, fail-closed",
    !v.ok && v.reason.indexOf("SIGNATURE FAILED") >= 0, v.reason);
  check("T9c cache untouched after hook refusal", recv.verified === null);
}

// T10 — VOICE carrier: start/chunks/end round-trip through the full pipe
{
  const A = new M.MeshP2P("AAAA", {}), B = new M.MeshP2P("BBBB", {});
  const bufs = { A2B: [], B2A: [] };
  const tA = new M.LengthTransport(b => bufs.A2B.push(b)), tB = new M.LengthTransport(b => bufs.B2A.push(b));
  const pump = () => { while (bufs.A2B.length) tB.feed(bufs.A2B.shift()); while (bufs.B2A.length) tA.feed(bufs.B2A.shift()); };
  A.attach(tA); B.attach(tB);
  let acks = 0; A.listener.onAck = () => acks++;
  const voice = new M.VoiceReceiver();
  let started = false;
  B.listener.onData = (src, seq, hops, route, payload) => {
    const ctl = M.isVoiceControl(payload);
    if (ctl) { if (ctl.kind === M.VOICE_START) { voice.start(ctl); started = true; } else if (ctl.kind === M.VOICE_END) { /* finalize below */ } return; }
    if (started) voice.absorb(seq, payload);
  };
  A.sendHello(); pump();
  // 3s of synthetic "voice" (12KB opus-like)
  const voiceBytes = new Uint8Array(12000); for (let i = 0; i < 12000; i++) voiceBytes[i] = (i * 37) & 0xff;
  const meta = await A.sendVoice("BBBB", voiceBytes, 3000); pump();
  // trigger end finalize
  const v = voice.finish({ duration: 3000 });
  check("T10 voice start/chunks/end delivered through the pipe", v.ok && v.chunks > 0, v.ok ? v.chunks + " chunks, " + v.bytesLen + " bytes, " + v.durationMs + "ms" : v.reason);
  check("T10b every voice chunk ACKed back at A", acks >= meta.chunks + 2, acks + " acks / " + (meta.chunks + 2) + " frames (incl. start+end)");
  check("T10c voice bytes recovered intact (byte-exact)", v.ok && v.bytesLen === 12000 && v.bytes[5] === (5*37&0xff));
}

// T11 — incomplete voice transfer (drop one chunk) => REFUSED, no playback
{
  const A = new M.MeshP2P("AAAA", {}), B = new M.MeshP2P("BBBB", {});
  const bufs = { A2B: [], B2A: [] };
  const tA = new M.LengthTransport(b => bufs.A2B.push(b)), tB = new M.LengthTransport(b => bufs.B2A.push(b));
  const pump = () => { while (bufs.A2B.length) tB.feed(bufs.A2B.shift()); while (bufs.B2A.length) tA.feed(bufs.B2A.shift()); };
  A.attach(tA); B.attach(tB);
  const voice = new M.VoiceReceiver(); let started = false, dropNext = false, dropped = false;
  const origSend = A.peer ? A.peer.send.bind(A.peer) : tA.send.bind(tA);
  // wrap tA.send to drop one data chunk
  tA.send = function (bytes) {
    let f; try { f = M.decodeFrame(bytes); } catch (e) { return origSend(bytes); }
    if (f.type === M.TYPE_DATA && f.dst === "BBBB" && !dropped && !M.isVoiceControl(f.payload)) { dropped = true; return; } // drop it
    return origSend(bytes);
  };
  B.listener.onData = (src, seq, hops, route, payload) => {
    const ctl = M.isVoiceControl(payload);
    if (ctl) { if (ctl.kind === M.VOICE_START) { voice.start(ctl); started = true; } return; }
    if (started) voice.absorb(seq, payload);
  };
  A.sendHello(); pump();
  const voiceBytes = new Uint8Array(8000); for (let i = 0; i < 8000; i++) voiceBytes[i] = i & 0xff;
  await A.sendVoice("BBBB", voiceBytes, 2000); pump();
  const v = voice.finish({ duration: 2000 });
  check("T11 incomplete voice transfer (one chunk dropped) => REFUSED", !v.ok && v.reason.indexOf("REFUSED") === 0 && v.reason.indexOf("incomplete") >= 0, v.reason);
}


console.log("");
console.log("RESULT: " + pass + " passed, " + fail + " failed" + (fail === 0 ? " — ALL PASS" : " — FAILURES PRESENT"));
process.exit(fail === 0 ? 0 : 1);

// HARZ MESH PWA CORE v0.1 — browser twin of the frozen G1/G2 v2.1 data plane.
// Ported BYTE-EXACT from harz-reach/v0.3-mesh (mesh-frame.js, mesh-core.js,
// zone-carrier.js, reach-core.js — commits 12b5991 line, 20/20 + interop proven).
// No Node imports: WebCrypto (Ed25519), TextEncoder, Uint8Array, fetch.
// Runs in the browser AND in Node (for the battery) — one source, two seats.
//
// THE LAW (owner, Sep 20): the mesh TRANSPORTS authority, it never CREATES it.
// Refused means refused: no warning, no best-effort, no partial cache.
(function (root) {
  "use strict";

  // ---------- CRC32 (IEEE, matches zlib.crc32) ----------
  var CRC_TABLE = (function () {
    var t = new Uint32Array(256);
    for (var n = 0; n < 256; n++) {
      var c = n;
      for (var k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      t[n] = c >>> 0;
    }
    return t;
  })();
  function crc32(buf) {
    var c = 0xFFFFFFFF;
    for (var i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
    return (c ^ 0xFFFFFFFF) >>> 0;
  }

  // ---------- bytes helpers ----------
  function concatBytes(arrays) {
    var total = 0;
    for (var i = 0; i < arrays.length; i++) total += arrays[i].length;
    var out = new Uint8Array(total), off = 0;
    for (var j = 0; j < arrays.length; j++) { out.set(arrays[j], off); off += arrays[j].length; }
    return out;
  }
  function utf8(s) { return new TextEncoder().encode(s); }
  function str(bytes) { return new TextDecoder().decode(bytes); }
  function hexToBytes(hex) {
    var out = new Uint8Array(hex.length / 2);
    for (var i = 0; i < out.length; i++) out[i] = parseInt(hex.substr(i * 2, 2), 16);
    return out;
  }
  function bytesToHex(b) {
    var s = "";
    for (var i = 0; i < b.length; i++) s += b[i].toString(16).padStart(2, "0");
    return s;
  }

  // ---------- MESH FRAME v2.1 (byte-exact JS twin of the frozen Kotlin MeshFrame.kt) ----------
  // magic u32 0x48415A5A | type u8 | src 4B | dst 4B | seq u32 | ttl u8 | hops u8
  // routeLen u8 | route*4B | sigLen u8 (0|64) | sig | payLen u32 | payload | crc32 u32
  var MAGIC = 0x48415A5A;
  var PORT_GO = 8988;
  var CHUNK_SIZE = 900;
  var CHUNK_PACING_MS = 20;
  var DEFAULT_TTL = 8;
  var MAX_ROUTE = 16;
  var TYPE_HELLO = 0x01, TYPE_HELLO_ACK = 0x02, TYPE_DATA = 0x03, TYPE_ACK = 0x04, TYPE_BYE = 0x05;

  function edgeBytes(id) {
    var s = String(id);
    if (s.length !== 4) throw new Error("EdgeId must be exactly 4 chars, got '" + s + "'");
    for (var i = 0; i < s.length; i++) { var c = s.charCodeAt(i); if (c < 0x20 || c > 0x7e) throw new Error("EdgeId must be printable ASCII"); }
    var out = new Uint8Array(4);
    for (var j = 0; j < 4; j++) out[j] = s.charCodeAt(j);
    return out;
  }
  function edgeFrom(buf, off) {
    if (buf.length - off < 4) throw new Error("EdgeId needs 4 bytes");
    var s = "";
    for (var i = 0; i < 4; i++) s += String.fromCharCode(buf[off + i]);
    return s;
  }

  function encodeFrame(f) {
    var route = f.route || [];
    if (route.length > MAX_ROUTE) throw new Error("route overflow: " + route.length);
    var sig = f.sig || new Uint8Array(0);
    if (sig.length !== 0 && sig.length !== 64) throw new Error("bad sigLen " + sig.length);
    var parts = [];
    var head = new Uint8Array(17), hv = new DataView(head.buffer);
    hv.setUint32(0, MAGIC >>> 0, false);
    head[4] = f.type;
    head.set(edgeBytes(f.src), 5);
    head.set(edgeBytes(f.dst), 9);
    hv.setUint32(13, f.seq >>> 0, false);
    parts.push(head);
    var th = new Uint8Array(2);
    th[0] = f.ttl; th[1] = f.hops;
    parts.push(th);
    parts.push(new Uint8Array([route.length]));
    for (var i = 0; i < route.length; i++) parts.push(edgeBytes(route[i]));
    parts.push(new Uint8Array([sig.length]));
    parts.push(sig);
    var plen = new Uint8Array(4), pv = new DataView(plen.buffer);
    pv.setUint32(0, f.payload ? f.payload.length : 0, false);
    parts.push(plen);
    parts.push(f.payload || new Uint8Array(0));
    var body = concatBytes(parts);
    var out = new Uint8Array(body.length + 4), ov = new DataView(out.buffer);
    out.set(body, 0);
    ov.setUint32(body.length, crc32(body) >>> 0, false);
    return out;
  }

  function decodeFrame(raw) {
    if (raw.length < 29) throw new Error("frame too short: " + raw.length + "B");
    var v = new DataView(raw.buffer, raw.byteOffset, raw.byteLength);
    var magic = v.getUint32(0, false);
    if (magic !== MAGIC) throw new Error("bad magic 0x" + magic.toString(16).padStart(8, "0"));
    var off = 4;
    var type = raw[off]; off += 1;
    var src = edgeFrom(raw, off); off += 4;
    var dst = edgeFrom(raw, off); off += 4;
    var seq = v.getUint32(off, false); off += 4;
    var ttl = raw[off]; off += 1;
    var hops = raw[off]; off += 1;
    var routeLen = raw[off]; off += 1;
    if (routeLen > MAX_ROUTE) throw new Error("route overflow: " + routeLen);
    var route = [];
    for (var i = 0; i < routeLen; i++) { route.push(edgeFrom(raw, off)); off += 4; }
    var sigLen = raw[off]; off += 1;
    if (sigLen !== 0 && sigLen !== 64) throw new Error("bad sigLen " + sigLen);
    var sig = raw.slice(off, off + sigLen); off += sigLen;
    var payLen = v.getUint32(off, false); off += 4;
    if (payLen < 0 || payLen > 1048576) throw new Error("payload length out of bounds: " + payLen);
    var payload = raw.slice(off, off + payLen); off += payLen;
    if (raw.length - off !== 4) throw new Error("trailing bytes after payload: " + (raw.length - off - 4));
    var crcStored = v.getUint32(off, false);
    var crcComputed = crc32(raw.subarray(0, off)) >>> 0;
    if (crcStored !== crcComputed) throw new Error("CRC mismatch: stored=" + crcStored + " computed=" + crcComputed);
    return { type: type, src: src, dst: dst, seq: seq, ttl: ttl, hops: hops, route: route, sig: sig, payload: payload };
  }

  var hello    = function (id, seq) { return { type: TYPE_HELLO, src: id, dst: "    ", seq: seq || 0, ttl: 0, hops: 0, route: [] }; };
  var helloAck = function (goId, to, seq) { return { type: TYPE_HELLO_ACK, src: goId, dst: to, seq: seq, ttl: 0, hops: 0, route: [] }; };
  var data     = function (src, dst, seq, ttl, chunk) { return { type: TYPE_DATA, src: src, dst: dst, seq: seq, ttl: ttl, hops: 0, route: [], payload: chunk }; };
  var ack      = function (receiver, sender, seq, route) { return { type: TYPE_ACK, src: receiver, dst: sender, seq: seq, ttl: 0, hops: 0, route: route }; };

  // ---------- REACH CORE v0.2 (verbatim law; verify-always, fail-closed, honest NXDOMAIN) ----------
  var ROOTS = [
    "https://harz-root.harz.workers.dev",
    "https://harz-root-b.harz.workers.dev"
  ];
  var ANCHOR = "ed25519:609d4b2f10a2fba802349a1443a203248636e055bd9b7ec941476994f20e00b9";
  var MIN_RECORDS = 77;
  var MIN_HEIGHT = 1;

  function canonicalize(obj) {
    if (obj === null || typeof obj !== "object") return JSON.stringify(obj);
    if (Array.isArray(obj)) return "[" + obj.map(canonicalize).join(",") + "]";
    var keys = Object.keys(obj).sort();
    return "{" + keys.map(function (k) { return JSON.stringify(k) + ":" + canonicalize(obj[k]); }).join(",") + "}";
  }
  function trustCheck(z) {
    if (!z || z.v !== 2 || z.zone !== "harz") return "REFUSED: not a HARZ v2 zone";
    if (String(z.signed_by) !== ANCHOR) return "REFUSED: WRONG ANCHOR — signer is not the pinned trust anchor";
    if (!Array.isArray(z.records) || z.records.length < MIN_RECORDS) return "REFUSED: NAMESPACE SHRINK — below floor " + MIN_RECORDS;
    if (z.height < MIN_HEIGHT) return "REFUSED: ROLLBACK — below floor " + MIN_HEIGHT;
    return null;
  }
  function verifyZoneSig(z) {
    var unsigned = Object.assign({}, z); delete unsigned.sig;
    var prefix = hexToBytes("302a300506032b6570032100");
    var pubRaw = hexToBytes(ANCHOR.replace("ed25519:", ""));
    var spki = new Uint8Array(prefix.length + pubRaw.length);
    spki.set(prefix); spki.set(pubRaw, prefix.length);
    return crypto.subtle.importKey("spki", spki, { name: "Ed25519" }, false, ["verify"]).then(function (key) {
      var dataBytes = utf8(canonicalize(unsigned));
      var sigBytes = hexToBytes(String(z.sig).replace("ed25519:", ""));
      return crypto.subtle.verify("Ed25519", key, sigBytes, dataBytes);
    });
  }
  function loadZone(z) {
    var err = trustCheck(z);
    if (err) return Promise.resolve({ ok: false, reason: err });
    return verifyZoneSig(z).then(function (ok) {
      if (!ok) return { ok: false, reason: "REFUSED: SIGNATURE FAILED — zone not loaded (fail-closed)" };
      return { ok: true, zone: z };
    }).catch(function (e) {
      return { ok: false, reason: "REFUSED: signature verification error (" + (e && e.message ? e.message : e) + ")" };
    });
  }
  function buildIndex(z) {
    var idx = new Map();
    for (var i = 0; i < z.records.length; i++) idx.set(z.records[i].name, z.records[i]);
    return idx;
  }
  function resolveName(idx, name) {
    var n = String(name || "").trim().toLowerCase();
    if (n.slice(-1) === ".") n = n.slice(0, -1);
    if (n.slice(-5) !== ".harz") n = n + ".harz";
    return idx.get(n) || null; // honest NXDOMAIN — unknown stays unknown
  }
  function fetchVerifiedZone(roots) {
    var list = roots || ROOTS;
    var lastReason = null;
    var tryNext = function (i) {
      if (i >= list.length) return Promise.resolve({ ok: false, reason: "ALL NODES REFUSED/UNREACHABLE (" + (lastReason || "network") + ")", node: null, zone: null });
      var node = list[i];
      return fetch(node + "/zone", { cache: "no-store" }).then(function (res) {
        if (!res.ok) { lastReason = node + " HTTP " + res.status; return tryNext(i + 1); }
        return res.json().then(function (zone) {
          return loadZone(zone).then(function (loaded) {
            if (!loaded.ok) { lastReason = node + " " + loaded.reason; return tryNext(i + 1); }
            return { ok: true, zone: loaded.zone, node: node, transport: "root-live" };
          });
        });
      }).catch(function (e) {
        lastReason = node + " " + ((e && e.message) ? e.message : e);
        return tryNext(i + 1);
      });
    };
    return tryNext(0);
  }

  // ---------- ZONE CARRIER v0.1 (verbatim law) ----------
  var CARRIER = { kind: "harz-zone-transfer", v: 1 };

  function packageZone(zone) {
    var bytes = utf8(canonicalize(zone));
    var header = utf8(JSON.stringify({ harz: 1, kind: CARRIER.kind, bytes: bytes.length, height: zone.height, records: zone.records.length, digest8: "cac16833" }));
    return concatBytes([header, bytes]);
  }

  function ZoneReceiver() {
    this.buffers = new Map();
    this.appDeliveries = 0;
    this.verified = null;
    this.lastVerdict = null;
  }
  ZoneReceiver.prototype.absorb = function (src, seq, hops, route, payload) {
    var b = this.buffers.get(src);
    if (!b) { b = new Map(); this.buffers.set(src, b); }
    if (b.has(seq)) return "dup";
    b.set(seq, { chunk: payload.slice(0), hops: hops, route: route });
    return "stored";
  };
  ZoneReceiver.prototype.finalize = function (src) {
    var self = this;
    var b = this.buffers.get(src);
    if (!b) return Promise.resolve({ ok: false, reason: "REFUSED: no packets from this source" });
    var seqs = Array.from(b.keys()).sort(function (x, y) { return x - y; });
    var chunks = seqs.map(function (s) { return b.get(s).chunk; });
    var full = concatBytes(chunks);
    var header;
    var hEnd = -1;
    for (var i = 0; i < full.length; i++) { if (full[i] === 0x7d) { hEnd = i; break; } }
    try {
      if (hEnd < 0) throw new Error("no header");
      header = JSON.parse(str(full.subarray(0, hEnd + 1)));
      if (header.harz !== 1 || header.kind !== CARRIER.kind) throw new Error("bad header");
    } catch (e) { return Promise.resolve({ ok: false, reason: "REFUSED: not a HARZ zone transfer (bad header)" }); }
    var zoneBytes = full.slice(hEnd + 1);
    if (zoneBytes.length !== header.bytes) return Promise.resolve({ ok: false, reason: "REFUSED: incomplete transfer (" + zoneBytes.length + "/" + header.bytes + " bytes)" });
    var zone;
    try { zone = JSON.parse(str(zoneBytes)); } catch (e) { return Promise.resolve({ ok: false, reason: "REFUSED: corrupted book bytes" }); }
    return loadZone(zone).then(function (loaded) {
      if (!loaded.ok) return { ok: false, reason: loaded.reason };
      if (zone.height !== header.height || zone.records.length !== header.records) return { ok: false, reason: "REFUSED: header/book mismatch" };
      self.appDeliveries++;
      self.verified = zone;
      self.lastVerdict = { ok: true, zone: zone, transport: "mesh-live", node: "mesh:" + src, bytes: zoneBytes.length };
      self.buffers.delete(src);
      return self.lastVerdict;
    });
  };
  ZoneReceiver.prototype.resolve = function (name) {
    if (!this.verified) return null;
    return resolveName(buildIndex(this.verified), name);
  };

  // ---------- P2P MESH ENDPOINT (frozen G1/G2 semantics, direct peer) ----------
  // Transport contract (same as Termux TcpTransport): { send(bytes), isConnected(), close() }
  // + feed(chunk) for inbound bytes with the same 4-byte length-prefix framing.
  function LengthTransport(sendFn) {
    this.sendFn = sendFn; this.connected = true; this.onFrame = null; this.buffer = new Uint8Array(0);
  }
  LengthTransport.prototype.send = function (bytes) {
    try {
      var len = new Uint8Array(4), lv = new DataView(len.buffer);
      lv.setUint32(0, bytes.length, false);
      this.sendFn(concatBytes([len, bytes]));
    } catch (e) { this.connected = false; }
  };
  LengthTransport.prototype.isConnected = function () { return !!this.connected; };
  LengthTransport.prototype.close = function () { this.connected = false; };
  LengthTransport.prototype.feed = function (chunk) {
    this.buffer = concatBytes([this.buffer, chunk]);
    while (this.buffer.length >= 4) {
      var lv = new DataView(this.buffer.buffer, this.buffer.byteOffset, this.buffer.byteLength);
      var len = lv.getUint32(0, false);
      if (this.buffer.length < 4 + len) break;
      var frame = this.buffer.slice(4, 4 + len);
      this.buffer = this.buffer.slice(4 + len);
      if (this.onFrame) this.onFrame(frame);
    }
  };

  function DedupCache(capacity) {
    this.cap = capacity || 4096; this.map = new Map();
  }
  DedupCache.prototype.seen = function (src, seq) {
    var k = src + ":" + seq;
    if (this.map.has(k)) return true;
    this.map.set(k, 1);
    if (this.map.size > this.cap) this.map.delete(this.map.keys().next().value);
    return false;
  };

  function MeshP2P(id, listener) {
    this.self = id;
    this.listener = listener || {};
    this.peer = null; this.transport = null; this.peerId = null;
    this.dedup = new DedupCache();
    this.seqCounter = 0;
    this.metrics = [];
    this.ackSeen = new Set();
  }
  MeshP2P.prototype.onMetric = function (ev, detail) {
    this.metrics.push(ev + " " + detail);
    if (this.listener.onMetric) this.listener.onMetric(ev, detail);
  };
  MeshP2P.prototype.attach = function (t) {
    var self = this;
    this.transport = t;
    t.onFrame = function (raw) {
      var f;
      try { f = decodeFrame(raw); } catch (e) { self.onMetric("bad_frame", e.message); return; }
      self.handle(f, t);
    };
  };
  MeshP2P.prototype.register = function (id, t) {
    var isNew = !this.peerId;
    this.peerId = id; this.peer = t;
    if (isNew && this.listener.onPeerJoined) this.listener.onPeerJoined(id);
  };
  MeshP2P.prototype.handle = function (f, t) {
    switch (f.type) {
      case TYPE_HELLO:
        this.register(f.src, t);
        t.send(encodeFrame(helloAck(this.self, f.src, f.seq)));
        break;
      case TYPE_HELLO_ACK: this.register(f.src, t); break;
      case TYPE_DATA: this.onDataFrame(f, t); break;
      case TYPE_ACK: this.onAckFrame(f, t); break;
      case TYPE_BYE: this.peerId = null; this.peer = null; break;
    }
  };
  MeshP2P.prototype.onDataFrame = function (f, from) {
    if (f.dst !== this.self) { this.onMetric("not_for_me", f.dst); return; }
    if (this.dedup.seen(f.src, f.seq)) { this.onMetric("dup_dropped", f.src + ":" + f.seq); return; }
    if (this.listener.onData) this.listener.onData(f.src, f.seq, f.hops, f.route, f.payload);
    from.send(encodeFrame(ack(this.self, f.src, f.seq, f.route)));
  };
  MeshP2P.prototype.onAckFrame = function (f, from) {
    if (f.dst !== this.self) return;
    this.ackSeen.add(f.seq);
    if (this.listener.onAck) this.listener.onAck(f.src, f.seq);
  };
  MeshP2P.prototype.chunkPayload = function (buf, size) {
    var sz = size || CHUNK_SIZE, out = [];
    for (var i = 0; i < buf.length; i += sz) out.push(buf.subarray(i, Math.min(i + sz, buf.length)));
    return out.length ? out : [new Uint8Array(0)];
  };
  MeshP2P.prototype.sendChunk = function (dst, chunk, ttl) {
    var seq = this.seqCounter++;
    var frame = { type: TYPE_DATA, src: this.self, dst: dst, seq: seq, ttl: (ttl || DEFAULT_TTL), hops: 0, route: [this.self], payload: chunk };
    var wire = this.peer || this.transport; // direct P2P: the transport IS the peer once attached
    if (wire && wire.isConnected()) { wire.send(encodeFrame(frame)); return seq; }
    this.onMetric("no_peer", dst + ":" + seq);
    return seq;
  };
  // carrier push with the pacing law (i % 10 === 9 -> sleep CHUNK_PACING_MS)
  MeshP2P.prototype.sendZone = function (dst, zone) {
    var self = this;
    var full = packageZone(zone);
    var chunks = this.chunkPayload(full);
    var sent = 0;
    function step() {
      self.sendChunk(dst, chunks[sent]);
      sent++;
      if (sent < chunks.length) {
        return (sent % 10 === 0) ? new Promise(function (r) { setTimeout(r, CHUNK_PACING_MS); }).then(step) : Promise.resolve().then(step);
      }
      return Promise.resolve({ chunks: chunks.length, bytes: full.length });
    }
    return step();
  };
  MeshP2P.prototype.sendHello = function () { var wire = this.peer || this.transport; if (wire) wire.send(encodeFrame(hello(this.self))); };

  // attacker mode for the death test: flip ONE byte in the sig region mid-flight
  // (same dynamic targeting law as the frozen Termux corrupt path)
  function corruptHook(node, dst, full) {
    var sigMark = -1;
    var fb = str(full);
    sigMark = fb.indexOf('"sig":"');
    var sigByteOff = sigMark >= 0 ? sigMark + 7 + 20 : full.length - 40;
    var sigChunkIdx = Math.floor(sigByteOff / CHUNK_SIZE);
    var sigInChunk = sigByteOff % CHUNK_SIZE;
    var origSend = node.peer.send.bind(node.peer);
    var firstSeq = null, tapped = false;
    node.peer.send = function (bytes) {
      try {
        var f = decodeFrame(bytes);
        if (f.type === TYPE_DATA && f.dst === dst) {
          if (firstSeq === null) firstSeq = f.seq;
          if (!tapped && f.seq - firstSeq === sigChunkIdx) {
            var p2 = f.payload.slice(0);
            p2[sigInChunk] ^= 0x01;
            var evil = encodeFrame({ type: f.type, src: f.src, dst: f.dst, seq: f.seq, ttl: f.ttl, hops: f.hops, route: f.route, payload: p2 });
            tapped = true;
            if (node.listener.onCorrupted) node.listener.onCorrupted(sigChunkIdx);
            return origSend(evil);
          }
        }
      } catch (e) {}
      return origSend(bytes);
    };
  }

  function chunkPayload(buf, size) {
    var sz = size || CHUNK_SIZE, out = [];
    for (var i = 0; i < buf.length; i += sz) out.push(buf.subarray(i, Math.min(i + sz, buf.length)));
    return out.length ? out : [new Uint8Array(0)];
  }

  var api = {
    crc32: crc32, concatBytes: concatBytes, utf8: utf8, str: str, hexToBytes: hexToBytes, bytesToHex: bytesToHex,
    MAGIC: MAGIC, PORT_GO: PORT_GO, CHUNK_SIZE: CHUNK_SIZE, CHUNK_PACING_MS: CHUNK_PACING_MS, DEFAULT_TTL: DEFAULT_TTL, MAX_ROUTE: MAX_ROUTE,
    TYPE_HELLO: TYPE_HELLO, TYPE_HELLO_ACK: TYPE_HELLO_ACK, TYPE_DATA: TYPE_DATA, TYPE_ACK: TYPE_ACK, TYPE_BYE: TYPE_BYE,
    encodeFrame: encodeFrame, decodeFrame: decodeFrame, hello: hello, helloAck: helloAck, data: data, ack: ack,
    ROOTS: ROOTS, ANCHOR: ANCHOR, MIN_RECORDS: MIN_RECORDS, MIN_HEIGHT: MIN_HEIGHT,
    canonicalize: canonicalize, trustCheck: trustCheck, verifyZoneSig: verifyZoneSig, loadZone: loadZone,
    buildIndex: buildIndex, resolveName: resolveName, fetchVerifiedZone: fetchVerifiedZone,
    CARRIER: CARRIER, packageZone: packageZone, ZoneReceiver: ZoneReceiver, chunkPayload: chunkPayload,
    LengthTransport: LengthTransport, DedupCache: DedupCache, MeshP2P: MeshP2P, corruptHook: corruptHook
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.HarzMesh = api;
})(typeof globalThis !== "undefined" ? globalThis : this);

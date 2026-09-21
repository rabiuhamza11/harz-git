// HARZ Resolver v1.0 — ONE resolution engine, four projections
// Projections: (1) native CLI  (2) HTTP + DoH-JSON server  (3) browser/library  (4) offline/mesh cache
// UMD: works in Node (module.exports + CLI/serve) and browser (window.HarzResolver).
// LAW: fail-closed — a zone that fails signature verification is REFUSED, never served.
// Sep 15, 2026 — per HARZ Root v2 FROZEN v1.0, build task 2 (resolver unification).

(function (root, factory) {
  const api = factory(root);
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.HarzResolver = api;
})(typeof self !== "undefined" ? self : this, function (root) {

  // ---------- canonical serialization (identical law to schema-v2) ----------
  function canonicalize(obj) {
    if (obj === null || typeof obj !== "object") return JSON.stringify(obj);
    if (Array.isArray(obj)) return "[" + obj.map(canonicalize).join(",") + "]";
    return "{" + Object.keys(obj).sort()
      .map(k => JSON.stringify(k) + ":" + canonicalize(obj[k])).join(",") + "}";
  }
  function canonicalBytes(obj) { return new TextEncoder().encode(canonicalize(obj)); }

  // ---------- Ed25519 verifiers (adapters) ----------
  // Node adapter: sync. Browser adapter: async via WebCrypto (Ed25519).
  function nodeVerifier() {
    const crypto = require("crypto");
    return function verify(zoneObj, pubHex, sigHex) {
      const { sig, ...unsigned } = zoneObj; // sig stripped by caller too; double-safety
      const spki = Buffer.concat([Buffer.from("302a300506032b6570032100", "hex"), Buffer.from(pubHex, "hex")]);
      const pub = crypto.createPublicKey({ key: spki, format: "der", type: "spki" });
      return crypto.verify(null, Buffer.from(canonicalBytes(unsigned)), pub, Buffer.from(sigHex, "hex"));
    };
  }
  async function browserVerify(zoneObj, pubHex, sigHex) {
    const { sig, ...unsigned } = zoneObj;
    const key = await crypto.subtle.importKey(
      "raw", new Uint8Array(BufferFromHex(pubHex)),
      { name: "Ed25519" }, false, ["verify"]);
    return crypto.subtle.verify("Ed25519", key, new Uint8Array(BufferFromHex(sigHex)), canonicalBytes(unsigned));
  }
  function BufferFromHex(hex) {
    const out = new Uint8Array(hex.length / 2);
    for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.substr(i * 2, 2), 16);
    return out;
  }

  // ---------- the engine ----------
  // createEngine({ verify }) — verify(zoneObj, pubHex, sigHex) → boolean
  // Node callers pass nodeVerifier(); browser passes an async WebCrypto wrapper.
  // v1.2 guards (Yakubu Phase 2, Sep 15): the holder pins the trust bundle
  // (anchor + minRecords + minHeight) out-of-band — the same way the anchor travels.
  // SHRINK law: a validly-signed zone below the namespace floor is REFUSED (a stolen or
  // malicious authority cannot silently kill 74 names under a valid signature).
  // ROLLBACK law: a zone older than the pinned (or previously-seen) height is REFUSED.
  function createEngine(opts) {
    opts = opts || {};
    const verify = opts.verify || nodeVerifier();
    const minRecords = Number.isInteger(opts.minRecords) && opts.minRecords > 0 ? opts.minRecords : null;
    const minHeight = Number.isInteger(opts.minHeight) && opts.minHeight >= 0 ? opts.minHeight : null;
    // v1.3 (Sep 20, door-bundle battery finding): the pinned ANCHOR is now ENFORCED at
    // load — a zone signed by any other key (even a perfectly self-consistent one) is
    // REFUSED. Before v1.3 the engine verified a zone against its OWN signed_by, so the
    // pin was commentary, not law. Floors were real; the anchor was not. Now it is.
    const anchor = typeof opts.anchor === "string" && opts.anchor ? opts.anchor : null;
    let zone = null, index = null, digest = null, lastHeight = null;

    function loadZone(zoneObj) {
      if (typeof zoneObj === "string") zoneObj = JSON.parse(zoneObj);
      if (!zoneObj || zoneObj.v !== 2 || zoneObj.zone !== "harz")
        throw new Error("REFUSED: not a HARZ v2 zone");
      if (!Array.isArray(zoneObj.records)) throw new Error("REFUSED: no records");
      if (anchor !== null && String(zoneObj.signed_by) !== anchor)
        throw new Error("REFUSED: WRONG ANCHOR — zone signer " + String(zoneObj.signed_by).slice(0, 16) + " is not the pinned trust anchor (out-of-band pin — fail-closed)");
      const pubHex = String(zoneObj.signed_by).replace("ed25519:", "");
      const sigHex = String(zoneObj.sig).replace("ed25519:", "");
      let ok = false;
      try { ok = verify(zoneObj, pubHex, sigHex); } catch (e) { ok = false; }
      if (!ok) throw new Error("REFUSED: SIGNATURE FAILED — zone not loaded (fail-closed)");
      const zh = Number.isInteger(zoneObj.height) ? zoneObj.height : 0;
      if (minRecords !== null && zoneObj.records.length < minRecords)
        throw new Error("REFUSED: NAMESPACE SHRINK — " + zoneObj.records.length + " records < floor " + minRecords + " (valid sig, malicious or stolen authority suspected — fail-closed)");
      if (minHeight !== null && zh < minHeight)
        throw new Error("REFUSED: ROLLBACK — zone height " + zh + " < pinned floor " + minHeight + " (stale/replayed zone — fail-closed)");
      if (lastHeight !== null && zh < lastHeight)
        throw new Error("REFUSED: ROLLBACK — zone height " + zh + " < previously-seen height " + lastHeight + " (stale/replayed zone — fail-closed)");
      index = new Map();
      for (const r of zoneObj.records) {
        if (index.has(r.name)) throw new Error("REFUSED: duplicate name " + r.name);
        index.set(r.name, r);
      }
      zone = zoneObj;
      lastHeight = zh;
      try { const _dz = { ...zoneObj }; delete _dz.sig; digest = sha256hex(canonicalBytes(_dz)); }
      catch (e) { digest = null; }
      return { names: index.size, digest: digest || "digest-unavailable-in-projection" };
    }

    function sha256hex(bytes) {
      // Node projection: require is available. Browser: async subtle does not fit
      // this sync call — mark digest honestly instead of throwing.
      if (typeof require !== "undefined" && require !== null) {
        try { return require("crypto").createHash("sha256").update(bytes).digest("hex"); } catch (e) {}
      }
      if (root.crypto && root.crypto.createHash)
        return root.crypto.createHash("sha256").update(bytes).digest("hex");
      return null;
    }

    // resolve(name, { transports }) — transport preference, honest absence.
    // NXDOMAIN is null — no guessing, no fallback.
    function resolve(name, query) {
      if (!zone) throw new Error("REFUSED: no zone loaded");
      const q = query || {};
      const transports = q.transports || ["https", "harz-native", "mesh", "dial", "local"];
      let n = String(name || "").trim().toLowerCase();
      if (n.endsWith(".")) n = n.slice(0, -1);
      if (!n.endsWith(".harz")) n = n + ".harz"; // accept bare label "pay"
      const rec = index.get(n);
      if (!rec) return null; // honest NXDOMAIN
      const endpoints = {};
      for (const t of transports) {
        if (rec.endpoints[t]) endpoints[t] = rec.endpoints[t];
      }
      const reachableTransports = Object.keys(rec.endpoints);
      return {
        found: true,
        name: rec.name,
        service: rec.service,
        identity: rec.identity,          // "PENDING" is visible — never hidden
        identity_pending: rec.identity === "PENDING",
        state: rec.state,
        endpoints,                       // only transports asked-for AND present
        routing: rec.routing,
        available_transports: reachableTransports,
        zone_height: zone.height,
        zone_digest: digest
      };
    }

    return { loadZone, resolve, getZone: () => zone, getDigest: () => digest,
             canonicalize, browserVerify, nodeVerifier };
  }

  // ---------- DoH JSON projection (RFC 8484 §4.2 JSON shape) ----------
  function toDohJSON(answerOrNull, questionName) {
    if (!answerOrNull) return {
      Status: 3, TC: false, RD: true, RA: true, AD: false, CD: false,
      Question: [{ name: questionName.endsWith(".") ? questionName : questionName + ".", type: 16 }]
    };
    const data = JSON.stringify({
      service: answerOrNull.service,
      identity: answerOrNull.identity,
      endpoints: answerOrNull.endpoints,
      routing: answerOrNull.routing.nodes,
      state: answerOrNull.state
    });
    return {
      Status: 0, TC: false, RD: true, RA: true, AD: false, CD: false,
      Question: [{ name: answerOrNull.name + ".", type: 16 }],
      Answer: [{ name: answerOrNull.name + ".", type: 16, TTL: 3600, data }]
    };
  }

  // ---------- offline / mesh projection ----------
  // Cache a VERIFIED zone to disk; later loads re-verify the cache. No network ever.
  function cacheStore(engine, zoneObj, fs, path) {
    const canon = canonicalize(zoneObj);
    const h = engine === null ? null : null;
    fs.writeFileSync(path, canon);
    return { bytes: canon.length };
  }
  function cacheLoad(fs, path, verify) {
    const raw = fs.readFileSync(path, "utf8");
    const zoneObj = JSON.parse(raw);
    const pubHex = String(zoneObj.signed_by).replace("ed25519:", "");
    const sigHex = String(zoneObj.sig).replace("ed25519:", "");
    if (!verify(zoneObj, pubHex, sigHex)) throw new Error("REFUSED: cached zone signature FAILED");
    return zoneObj;
  }

  return { createEngine, canonicalize, canonicalBytes, toDohJSON, cacheStore, cacheLoad,
           nodeVerifier, browserVerify };
});

// ================= Node projection: CLI + HTTP/DoH server =================
if (typeof require !== "undefined" && typeof module !== "undefined" && require.main === module) {
  const fs = require("fs");
  const api = module.exports;
  const args = process.argv.slice(2);
  const cmd = args[0];

  function loadFrom(zonePath) {
    const zoneObj = JSON.parse(fs.readFileSync(zonePath, "utf8"));
    const engine = api.createEngine({ verify: api.nodeVerifier() });
    const meta = engine.loadZone(zoneObj);
    return { engine, meta };
  }

  if (cmd === "resolve") {
    // harz-resolver resolve <name> --zone <file> [--transport https,mesh]
    const name = args[1];
    let zonePath = null, transports = null;
    for (let i = 2; i < args.length; i++) {
      if (args[i] === "--zone") zonePath = args[++i];
      if (args[i] === "--transport") transports = args[++i].split(",");
    }
    try {
      const { engine, meta } = loadFrom(zonePath);
      const r = engine.resolve(name, transports ? { transports } : {});
      if (!r) { console.log(JSON.stringify({ found: false, name, verdict: "NXDOMAIN" })); process.exit(2); }
      console.log(JSON.stringify(r));
      process.exit(0);
    } catch (e) { console.error(e.message); process.exit(3); }
  }

  if (cmd === "serve") {
    let zonePath = null, port = 8989;
    for (let i = 1; i < args.length; i++) {
      if (args[i] === "--zone") zonePath = args[++i];
      if (args[i] === "--port") port = parseInt(args[++i], 10);
    }
    let engine = null;
    try { const r = loadFrom(zonePath); engine = r.engine; console.error("zone loaded:", JSON.stringify(r.meta)); }
    catch (e) { console.error(e.message); process.exit(3); }
    const http = require("http");
    http.createServer((req, res) => {
      const u = new URL(req.url, "http://localhost");
      const send = (code, obj) => { res.writeHead(code, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }); res.end(JSON.stringify(obj)); };
      if (u.pathname === "/zone") return send(200, engine.getZone());
      const name = u.searchParams.get("name");
      if (!name) return send(400, { error: "missing ?name" });
      if (u.pathname === "/resolve" || u.pathname === "/doh") {
        let r = null;
        try { r = engine.resolve(name); } catch (e) { return send(503, { error: e.message }); }
        if (!r) {
          if (u.pathname === "/doh") return send(200, api.toDohJSON(null, name));
          return send(404, { found: false, name, verdict: "NXDOMAIN" });
        }
        if (u.pathname === "/doh") return send(200, api.toDohJSON(r, name));
        return send(200, r);
      }
      send(404, { error: "unknown route" });
    }).listen(port, () => console.error("harz-resolver serving on :" + port + " (/resolve /doh /zone)"));
  }
}

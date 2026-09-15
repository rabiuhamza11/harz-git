// HARZ ROOT QR TRANSFER v1.0 — the registrar-free rail (Zero-ICANN Law, Sep 15)
// The signed canonical zone travels as QR chunks: screen → camera → node.
// No domain, no registrar, no purchase. The camera is the registrar.
// Reuses the proven DPB batch discipline: seq/total headers, out-of-order OK,
// duplicate-safe, tamper → signature refusal at assembly, missing chunk → refuse.
// Zero deps, pure software. Production anchor travels OUT-OF-BAND (the key ceremony),
// never inside the chunks — trust anchor ≠ payload.

(function (root, factory) {
  const api = factory(root);
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.HarzRootQR = api;
})(typeof self !== "undefined" ? self : this, function () {

  const BATCH = "harz-root-zone";
  const V = 1;
  // QR byte-mode safe chunk size (kept conservative for phone cameras on 2GB devices)
  const CHUNK_BYTES = 512;

  // ---------- encode: zone object → array of QR payload strings ----------
  function encodeZone(zoneObj, canonicalize) {
    const canon = canonicalize(zoneObj); // signed zone, canonical bytes
    const b64 = btoaUrl(canon);          // URL-safe base64 (QR-friendly alphabet)
    const chunks = [];
    for (let i = 0; i < b64.length; i += CHUNK_BYTES) chunks.push(b64.slice(i, i + CHUNK_BYTES));
    return chunks.map((d, i) => JSON.stringify({
      v: V, b: BATCH, s: i + 1, t: chunks.length, d
    }));
  }

  // ---------- decode: collected QR payloads (any order, dupes OK) → zone ----------
  // verifyFn(zoneObj, pubHex, sigHex) → bool — the ANCHOR check at the door.
  // v1.1 opts (Yakubu Phase 2): { expectedHeight, minRecords } — the trust bundle
  // travels out-of-band WITH the anchor. Replayed old zones and signed shrink zones
  // are REFUSED here, not just at the resolver.
  function decodeChunks(payloads, anchorPubHex, verifyFn, opts) {
    opts = opts || {};
    const seen = new Map();
    for (const p of payloads) {
      let obj;
      try { obj = JSON.parse(p); } catch (e) { return { error: "BAD_QR", reason: "unparseable payload" }; }
      if (obj.v !== V || obj.b !== BATCH) return { error: "BAD_QR", reason: "not a root-zone payload" };
      if (!Number.isInteger(obj.s) || !Number.isInteger(obj.t) || obj.s < 1 || obj.s > obj.t)
        return { error: "BAD_QR", reason: "bad seq/total" };
      seen.set(obj.s, obj.d); // duplicate seq → last write wins (dedup)
    }
    // completeness check — missing chunk = REFUSE, never partial assembly
    const total = seen.size ? undefined : 0;
    const firstT = JSON.parse(payloads.find(p => { try { return JSON.parse(p).b === BATCH; } catch (e) { return false; } })).t;
    if (seen.size !== firstT)
      return { error: "INCOMPLETE", reason: `have ${seen.size}/${firstT} chunks` };
    let b64 = "";
    for (let i = 1; i <= firstT; i++) {
      const d = seen.get(i);
      if (d === undefined) return { error: "INCOMPLETE", reason: `missing chunk ${i}` };
      b64 += d;
    }
    let zoneObj;
    try { zoneObj = JSON.parse(atobUrl(b64)); } catch (e) { return { error: "BAD_QR", reason: "assembly not valid JSON" }; }
    // ANCHOR LAW: the zone must verify against the out-of-band anchor —
    // tampering anywhere in any chunk lands here and is REFUSED.
    const pubHex = String(zoneObj.signed_by).replace("ed25519:", "");
    const sigHex = String(zoneObj.sig).replace("ed25519:", "");
    if (anchorPubHex && pubHex !== anchorPubHex)
      return { error: "WRONG_ANCHOR", reason: "zone signed by a different key than the anchor" };
    let ok = false;
    try { ok = verifyFn(zoneObj, pubHex, sigHex); } catch (e) { ok = false; }
    if (!ok) return { error: "REFUSED", reason: "SIGNATURE FAILED — tampered or forged zone" };
    if (opts.minRecords && zoneObj.records.length < opts.minRecords)
      return { error: "REFUSED", reason: "NAMESPACE SHRINK — " + zoneObj.records.length + " < floor " + opts.minRecords + " (signed but malicious)" };
    const zh = Number.isInteger(zoneObj.height) ? zoneObj.height : 0;
    if (opts.expectedHeight && zh < opts.expectedHeight)
      return { error: "REFUSED", reason: "ROLLBACK — zone height " + zh + " < expected " + opts.expectedHeight + " (replayed old zone)" };
    return { zone: zoneObj, chunks: firstT };
  }

  function btoaUrl(str) {
    if (typeof btoa === "function") return btoa(unescape(encodeURIComponent(str)))
      .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    return Buffer.from(str, "utf8").toString("base64")
      .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  function atobUrl(b64) {
    const norm = b64.replace(/-/g, "+").replace(/_/g, "/");
    const pad = norm + "=".repeat((4 - norm.length % 4) % 4);
    if (typeof atob === "function") return decodeURIComponent(escape(atob(pad)));
    return Buffer.from(pad, "base64").toString("utf8");
  }

  return { encodeZone, decodeChunks };
});

// ================= Node projection: CLI =================
if (typeof require !== "undefined" && typeof module !== "undefined" && require.main === module) {
  const fs = require("fs");
  const api = module.exports;
  const Resolver = require("../resolver/harz-resolver.js");
  const args = process.argv.slice(2);

  if (args[0] === "encode") {
    // root-qr encode <zone.json> [--out payloads.json]
    const zone = JSON.parse(fs.readFileSync(args[1], "utf8"));
    const payloads = api.encodeZone(zone, Resolver.canonicalize);
    fs.writeFileSync(args[2] || "qr-payloads.json", JSON.stringify(payloads, null, 2));
    console.error(`encoded: ${payloads.length} QR payloads`);
  }
  if (args[0] === "decode") {
    // root-qr decode <payloads.json> <anchorPubHex64> [--resolve name]
    const payloads = JSON.parse(fs.readFileSync(args[1], "utf8"));
    const r = api.decodeChunks(payloads, args[2], Resolver.nodeVerifier());
    if (r.error) { console.error(`REFUSED: ${r.error} — ${r.reason}`); process.exit(3); }
    console.error(`assembled: ${r.chunks} chunks, signature VERIFIED against anchor`);
    if (args[3] === "--resolve") {
      const engine = Resolver.createEngine({ verify: Resolver.nodeVerifier() });
      engine.loadZone(r.zone);
      console.log(JSON.stringify(engine.resolve(args[4])));
    }
  }
}

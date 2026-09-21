// ROTATION LAW v1.1 — ROOT v0.2 (single-zone rotation ceremony)
// Extends SUCCESSION LAW v1.0 (rehearsed SR-1..SR-10, Sep 15). Three changes, all fail-closed:
//
// 1. WITNESS AUTH IS ON THE ROTATION ACT, NOT THE ZONE (owner ruling via witness seat, Sep 21).
//    The planned rotation now REQUIRES a 2-of-3 witness quorum over the act body —
//    witnesses COMPLETE the king's named succession (WITNESS-RECORD law), they never touch
//    zone content. Zone-level witness co-signing is rejected: it multiplies ink-card
//    reconstruction windows (burn risk) for zero law gain.
//
// 2. RECORD-LEVEL KING SIGNATURES ARE MANDATORY (hole fix, found in audit Sep 21).
//    v1.0 validated a manifest only because it rode inside a king-signed zone (SR-2 shape).
//    In the single-zone ceremony (manifest+act inside the SUCCESSOR-signed height-2 zone),
//    v1.0 would accept a king-less manifest+act — anyone could crown themselves.
//    v1.1: manifest.sig MUST verify against the CURRENT authority; act.sig MUST verify
//    against the CURRENT authority; no signature, no enthronement. Ever.
//
// 3. REVOCATION TAKES EFFECT AT THE ROTATION HEIGHT ITSELF (witness term: "old king
//    cannot sign height 2"). v1.0 revoked from height+1, leaving a same-height fork window.
//    v1.1 closes it: fromHeight = the rotation height.
//
// Everything else from v1.0 stands: anchor law, zombie law, coup law, fail-closed, honest labels.

(function (root, factory) {
  const api = factory(root);
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.HarzRotationLawV11 = api;
})(typeof self !== "undefined" ? self : this, function () {
  const crypto = typeof require === "function" ? require("crypto") : null;

  function sign(privKeyObj, obj) {
    return crypto.sign(null, Buffer.from(JSON.stringify(obj)), privKeyObj).toString("hex");
  }
  function verify(pubHex, obj, sigHex) {
    try {
      const spki = Buffer.concat([Buffer.from("302a300506032b6570032100", "hex"), Buffer.from(pubHex, "hex")]);
      const pub = crypto.createPublicKey({ key: spki, format: "der", type: "spki" });
      return crypto.verify(null, Buffer.from(JSON.stringify(obj)), pub, Buffer.from(sigHex, "hex"));
    } catch (e) { return false; } // malformed = NOT verified. Fail-closed, never crash.
  }
  function canonicalDigest(obj) {
    const c = JSON.parse(JSON.stringify(obj));
    return crypto.createHash("sha256").update(JSON.stringify(c)).digest("hex");
  }

  function manifestBody(m) { const b = { ...m }; delete b.sig; return b; }
  function actBody(a) { const b = { ...a }; delete b.sig; delete b.witness_sigs; return b; }
  function witnessPayload(a) { const b = { ...a }; delete b.witness_sigs; return b; } // witnesses attest the KING-SIGNED statement

  // ---- builders (unsigned; the ink holders sign the bodies on Node 1) ----
  function buildManifest(currentAuthorityPub, successorPub, witnessPubs, policy, declaredAtHeight, prevDigest) {
    return { type: "SUCCESSION", current_authority: currentAuthorityPub, successor_pub: successorPub,
             witnesses: witnessPubs, policy: policy, declared_at_height: declaredAtHeight,
             prev_digest: prevDigest };
  }
  function buildActPlanned(newAuthorityPub, manifestHeight, prevDigest) {
    return { type: "SUCCESSION_ACT", path: "planned", new_authority: newAuthorityPub,
             manifest_height: manifestHeight, prev_digest: prevDigest };
  }

  // ---- THE LAW: validate a single-zone rotation (height 2) against the pinned height-1 state ----
  // pinned: { anchorPubHex (current king), h1DigestHex, h1Names: [77 names], witnessPubs: [3 hexes], policy: 2 }
  function validateRotation(z, pinned) {
    const refuse = (reason) => ({ ok: false, reason, height: z ? z.height : null });
    if (!z || typeof z !== "object") return refuse("MALFORMED ZONE");
    if (z.v !== 2 || z.zone !== "harz") return refuse("NOT A V2 ZONE");
    if (z.height !== 2) return refuse("HEIGHT MUST BE 2 FOR THE ROTATION ACT");
    if (z.prev !== pinned.h1DigestHex) return refuse("PREV DIGEST MISMATCH — height 2 must link the pinned height-1 canonical digest");
    const zc = { ...z }; const zoneSig = zc.sig; delete zc.sig;
    const zoneBy = String(z.signed_by || "").replace("ed25519:", "");
    if (!/^[0-9a-f]{64}$/.test(zoneBy)) return refuse("SIGNED_BY NOT A VALID PUB");
    if (!verify(zoneBy, zc, zoneSig)) return refuse("ZONE SIG FAILED (successor did not sign this zone)");
    if (zoneBy === pinned.anchorPubHex) return refuse("ZOMBIE KING — the old key cannot sign height 2 (revoked at rotation height)");

    const manifest = (z.records || []).find(r => r && r.type === "SUCCESSION");
    const act = (z.records || []).find(r => r && r.type === "SUCCESSION_ACT");
    const names = (z.records || []).filter(r => r && r.name).map(r => r.name);

    if (!manifest) return refuse("NO SUCCESSION MANIFEST IN ZONE");
    if (!act) return refuse("NO SUCCESSION ACT IN ZONE");
    if (!verify(pinned.anchorPubHex, manifestBody(manifest), manifest.sig))
      return refuse("MANIFEST NOT SIGNED BY THE KING — king-less manifest refused (v1.1 hole fix)");
    if (manifest.current_authority !== pinned.anchorPubHex) return refuse("MANIFEST NAMES WRONG CURRENT AUTHORITY");
    if (manifest.successor_pub !== zoneBy) return refuse("MANIFEST SUCCESSOR ≠ ZONE SIGNER");
    if (manifest.prev_digest !== pinned.h1DigestHex) return refuse("MANIFEST PREV DIGEST MISMATCH");
    if ((manifest.witnesses || []).length !== pinned.witnessPubs.length ||
        !(manifest.witnesses || []).every(w => pinned.witnessPubs.includes(w)))
      return refuse("WITNESS SET MISMATCH — seats are the recorded three, not chosen by the manifest");
    if (!verify(pinned.anchorPubHex, actBody(act), act.sig))
      return refuse("ACT NOT SIGNED BY THE KING — king-less act refused");
    if (act.new_authority !== manifest.successor_pub) return refuse("ACT SUCCESSOR MISMATCH");
    if (act.prev_digest !== pinned.h1DigestHex) return refuse("ACT PREV DIGEST MISMATCH");

    // witness quorum over the king-signed act (witnesses COMPLETE, never appoint)
    const quorum = (act.witness_sigs || []).filter(w =>
      pinned.witnessPubs.includes(w.by) && verify(w.by, witnessPayload(act), w.sig));
    const uniqSeats = new Set(quorum.map(w => w.by)).size;
    if (uniqSeats < pinned.policy)
      return refuse("WITNESS QUORUM FAILED (" + uniqSeats + "/" + pinned.witnessPubs.length + ", need " + pinned.policy + ") — v1.1: planned rotation requires witness completion");
    if (quorum.some(w => w.by === pinned.anchorPubHex || w.by === zoneBy))
      return refuse("WITNESS SEAT LAW VIOLATED — king/successor cannot witness their own rotation");

    // content law: rotation changes authority, never the book
    const expected = [...pinned.h1Names].sort().join("|");
    const got = [...names].sort().join("|");
    if (expected !== got) return refuse("NAME SET CHANGED IN ROTATION ZONE — rotation must carry the same 77 names");

    return { ok: true, reason: "SIG VALID (successor enthroned by king-signed manifest + act, 2-of-3 witnesses complete, prev linked)",
             height: 2, authority: zoneBy, witnesses: uniqSeats, names: names.length };
  }

  return { sign, verify, canonicalDigest, buildManifest, buildActPlanned, validateRotation,
           manifestBody, actBody, witnessPayload };
});

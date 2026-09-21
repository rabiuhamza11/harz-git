// SUCCESSION LAW v1.0 — shared module (ported from the rehearsed + passed SR battery, Sep 15)
// The law of the HARZ root succession: authority = anchor ∪ enthroned-by-valid-act.
// Witnesses COMPLETE a named succession; they never APPOINT. Fail-closed throughout.
// Used by: ceremony-kit.js (operator CLI), future resolver engine integration, batteries.

(function (root, factory) {
  const api = factory(root);
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.HarzSuccessionLaw = api;
})(typeof self !== "undefined" ? self : this, function () {

  function sign(privKeyObj, obj) {
    // privKeyObj: Node crypto KeyObject (caller holds it; law never stores keys)
    const crypto = require("crypto");
    return crypto.sign(null, Buffer.from(JSON.stringify(obj)), privKeyObj).toString("hex");
  }
  function verify(pubHex, obj, sigHex) {
    const crypto = require("crypto");
    try {
      const spki = Buffer.concat([Buffer.from("302a300506032b6570032100", "hex"), Buffer.from(pubHex, "hex")]);
      const pub = crypto.createPublicKey({ key: spki, format: "der", type: "spki" });
      return crypto.verify(null, Buffer.from(JSON.stringify(obj)), pub, Buffer.from(sigHex, "hex"));
    } catch (e) { return false; } // malformed pub/sig = NOT verified. Fail-closed, never crash.
  }

  // Chain validation: zones in height order. Returns per-zone verdicts + final authority state.
  // This is the exact law that passed the SR-1..SR-10 rehearsal (zombie king, theft race,
  // witness coup, quorum abuse, manifest tamper — all refused).
  function validateChain(chain, anchorPubHex) {
    const acceptedAuthorities = new Set([anchorPubHex]);
    const pendingSuccessors = new Map();
    const revocations = [];
    const compromised = [];
    const verdicts = [];
    for (const zone of chain) {
      const z = JSON.parse(JSON.stringify(zone));
      const sigHex = z.sig; delete z.sig;
      let ok = verify(z.signed_by, z, sigHex);
      let reason = ok ? "SIG VALID" : "SIG FAILED";
      if (ok && revocations.some(r => r.keyHex === z.signed_by && zone.height >= r.fromHeight)) { ok = false; reason = "REVOKED KEY (zombie king refused)"; }
      if (ok && compromised.some(c => c.keyHex === z.signed_by && zone.height > c.atHeight)) { ok = false; reason = "POST-COMPROMISE SIGNATURE refused"; }
      let actAuthorizedThis = false;
      if (ok) {
        for (const r of z.records || []) {
          if (r.type === "SUCCESSION") pendingSuccessors.set(r.successor_pub, { ...r, atHeight: zone.height });
          if (r.type === "SUCCESSION_ACT") {
            const m = pendingSuccessors.get(r.new_authority);
            if (!m) { ok = false; reason = "ACT WITHOUT MANIFEST — successor never pre-authorized"; break; }
            if (r.new_authority !== m.successor_pub) { ok = false; reason = "SUCCESSOR MISMATCH"; break; }
            if (r.path === "death") {
              const actBody = { ...r }; delete actBody.witness_sigs;
              const quorum = (r.witness_sigs || []).filter(w => m.witnesses.includes(w.by) && verify(w.by, actBody, w.sig));
              const uniq = new Set(quorum.map(w => w.by)).size;
              if (uniq < m.policy) { ok = false; reason = `WITNESS QUORUM FAILED (${uniq}/${m.witnesses.length}, need ${m.policy})`; break; }
              compromised.push({ keyHex: m.current_authority, atHeight: r.compromise_height });
              revocations.push({ keyHex: m.current_authority, fromHeight: r.compromise_height + 1 });
            } else {
              revocations.push({ keyHex: m.current_authority, fromHeight: zone.height + 1 });
            }
            acceptedAuthorities.add(r.new_authority);
            if (z.signed_by === r.new_authority) actAuthorizedThis = true;
          }
        }
      }
      if (ok && !acceptedAuthorities.has(z.signed_by)) { ok = false; reason = "NOT AN ACCEPTED AUTHORITY (fork/forgery)"; }
      if (ok && actAuthorizedThis) reason = "SIG VALID (successor enthroned by act)";
      verdicts.push({ height: z.height, by: z.signed_by.slice(0, 12), ok, reason });
    }
    return { verdicts, authorities: [...acceptedAuthorities], pendingSuccessors: [...pendingSuccessors.keys()] };
  }

  // Manifest record builder — unsigned; the LIVING authority signs the canonical bytes.
  function buildManifest(currentAuthorityPub, successorPub, witnessPubs, policy, declaredAtHeight) {
    return { type: "SUCCESSION", current_authority: currentAuthorityPub, successor_pub: successorPub,
             witnesses: witnessPubs, policy: policy, declared_at_height: declaredAtHeight };
  }
  // Act builders — payloads for signature (planned: successor signs; death: successor + quorum).
  function buildActPlanned(newAuthorityPub, manifestHeight) {
    return { type: "SUCCESSION_ACT", path: "planned", new_authority: newAuthorityPub, manifest_height: manifestHeight };
  }
  function buildActDeath(newAuthorityPub, manifestHeight, compromiseHeight) {
    return { type: "SUCCESSION_ACT", path: "death", new_authority: newAuthorityPub,
             manifest_height: manifestHeight, compromise_height: compromiseHeight };
  }
  function witnessSigPayload(act) {
    const p = { ...act }; delete p.witness_sigs; return p;
  }

  return { sign, verify, validateChain, buildManifest, buildActPlanned, buildActDeath, witnessSigPayload };
});

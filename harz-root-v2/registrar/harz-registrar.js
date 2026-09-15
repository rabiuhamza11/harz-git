// HARZ REGISTRAR v1.0 — the registration/lifecycle engine (governance law D1-D8, ruled Sep 15)
// Law enforced here (frozen record DECISION-RECORD-D1-D8.md):
//   D1a: HARZ-only registrations — this is the REGISTRY'S INTERNAL tool; there is no public API yet.
//   D3a: identity is a key or honest "PENDING" — no personal data ever enters the zone.
//   D4a: PERMANENT ownership — no expiry, no renewal, names never drop by time. Retire is an
//        explicit owner act only (D5a).
//   Chain law: every mutation produces the NEXT zone — height+1, prev = sha256(canonical zone
//   minus sig) of the current zone, records sorted, then signed. Fail-closed everywhere.
//   Shrink law at the SOURCE: the new zone's record count must equal prev count + registers - retires.
//   Nothing here ever touches a private key: the signer is injected (Node 1 signs; the tool builds).

(function (root) {
  "use strict";

  function canonicalize(obj) {
    if (obj === null || typeof obj !== "object") return JSON.stringify(obj);
    if (Array.isArray(obj)) return "[" + obj.map(canonicalize).join(",") + "]";
    return "{" + Object.keys(obj).sort()
      .map(k => JSON.stringify(k) + ":" + canonicalize(obj[k])).join(",") + "}";
  }
  function sha256hex(str) {
    const crypto = typeof require !== "undefined" ? require("crypto") : root.crypto;
    return crypto.createHash("sha256").update(str, "utf8").digest("hex");
  }
  const NAME_RE = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/; // label, no dots: "pay" not "pay.harz"

  // ---------- op validation (the law, fail-closed) ----------
  function validateOp(op, existing) {
    if (!op || typeof op !== "object") return "op must be an object";
    const name = op.name;
    if (typeof name !== "string" || !NAME_RE.test(name)) return "BAD_NAME: lowercase label a-z0-9-, no dot";
    if (op.op === "register") {
      if (existing.has(name)) return "REGISTER REFUSED: name exists (D1a registry, no shadowing)";
      if (!op.endpoints || typeof op.endpoints !== "object" || Object.keys(op.endpoints).length === 0)
        return "REGISTER REFUSED: at least one endpoint required (honest absence, never empty records)";
      for (const [t, v] of Object.entries(op.endpoints))
        if (typeof v !== "string" || !v.startsWith("https://")) return "REGISTER REFUSED: endpoint '" + t + "' must be https:// (fail-closed, no invented schemes)";
      if (op.identity && !(/^ed25519:[0-9a-f]{64}$/.test(op.identity) || op.identity === "PENDING"))
        return "REGISTER REFUSED: identity must be ed25519:<64hex> or PENDING (D3a — no personal data)";
      if (op.service && typeof op.service !== "string") return "REGISTER REFUSED: service must be a string";
      return null;
    }
    if (op.op === "update") {
      if (!existing.has(name)) return "UPDATE REFUSED: no such name";
      if (op.endpoints) {
        for (const [t, v] of Object.entries(op.endpoints))
          if (typeof v !== "string" || !v.startsWith("https://"))
            return "UPDATE REFUSED: endpoint '" + t + "' must be https://";
      }
      return null;
    }
    if (op.op === "retire") {
      if (!existing.has(name)) return "RETIRE REFUSED: no such name";
      if (op.by_owner !== true) return "RETIRE REFUSED: retire is an OWNER act only (D4a permanent — no automated name loss)";
      return null;
    }
    return "UNKNOWN OP: " + op.op;
  }

  // ---------- apply: ops + current zone → next zone (unsigned; Node 1 signs) ----------
  function applyOps(zoneObj, ops) {
    if (!Array.isArray(ops) || ops.length === 0) throw new Error("REFUSED: no ops");
    if (!zoneObj || zoneObj.v !== 2 || zoneObj.zone !== "harz") throw new Error("REFUSED: not a HARZ v2 zone");
    if (!Array.isArray(zoneObj.records)) throw new Error("REFUSED: no records");
    const existing = new Map(zoneObj.records.map(r => [r.name.replace(/\.harz$/, ""), r]));
    const records = new Map(existing);
    let registers = 0, retires = 0;
    for (const op of ops) {
      const err = validateOp(op, records);
      if (err) throw new Error("REFUSED: " + err);
      const key = op.name;
      if (op.op === "register") {
        records.set(key, {
          name: key + ".harz",
          service: op.service || key,
          identity: op.identity || "PENDING",
          state: { height: zoneObj.height + 1 },
          endpoints: op.endpoints,
        });
        registers++;
      } else if (op.op === "update") {
        const cur = records.get(key);
        records.set(key, {
          ...cur,
          endpoints: { ...cur.endpoints, ...(op.endpoints || {}) },
          identity: op.identity || cur.identity,
          service: op.service || cur.service,
          state: { height: zoneObj.height + 1 },
        });
      } else if (op.op === "retire") {
        records.delete(key);
        retires++;
      }
    }
    // SHRINK LAW AT THE SOURCE: the count must be accounted for by explicit ops, nothing else.
    const expected = zoneObj.records.length + registers - retires;
    if (records.size !== expected)
      throw new Error("REFUSED: COUNT LAW — new book " + records.size + " != expected " + expected + " (ops must account for every change)");
    const sorted = [...records.values()].sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
    const next = {
      v: 2, zone: "harz",
      height: zoneObj.height + 1,
      prev: sha256hex(canonicalize({ ...zoneObj, sig: undefined })),
      records: sorted,
      signed_by: zoneObj.signed_by, // authority carries over unless a succession act enthrones a new key
    };
    return next; // UNSIGNED — Node 1 signs with the ZSK; this tool never holds a private key
  }

  const api = { applyOps, validateOp, canonicalize, NAME_RE };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.HarzRegistrar = api;
})(typeof globalThis !== "undefined" ? globalThis : this);

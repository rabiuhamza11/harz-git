// HARZ Zone v2 builder + verifier + self-test battery
// Pure software, zero deps, Node 20. Deterministic canonical serialization (RFC-8785-style).
// TEST keys: generated IN MEMORY only, never persisted (standing law).
const crypto = require("crypto");
const fs = require("fs");

// ---------- canonical serialization ----------
function canonicalize(obj) {
  if (obj === null || typeof obj !== "object") return JSON.stringify(obj);
  if (Array.isArray(obj)) return "[" + obj.map(canonicalize).join(",") + "]";
  const keys = Object.keys(obj).sort();
  return "{" + keys.map(k => JSON.stringify(k) + ":" + canonicalize(obj[k])).join(",") + "}";
}
function canonicalBytes(obj) { return Buffer.from(canonicalize(obj), "utf8"); }

// ---------- schema validation (strict) ----------
const ENDPOINT_KEYS = new Set(["https", "harz-native", "mesh", "dial", "local"]);
const NAME_RE = /^[a-z0-9-]+(\.[a-z0-9-]+)*\.harz$/;
const ID_RE = /^ed25519:[0-9a-f]{64}$/;  // ed25519 pub = 32 bytes = 64 hex
const POLICY_KEYS = new Set(["trust"]);

function validateRecord(r) {
  if (typeof r !== "object" || r === null) return "not an object";
  const allowed = new Set(["v","name","service","identity","state","endpoints","routing","policy"]);
  for (const k of Object.keys(r)) if (!allowed.has(k)) return `unknown field ${k}`;
  for (const k of allowed) if (!(k in r)) return `missing field ${k}`;
  if (r.v !== 2) return "v must be 2";
  if (!NAME_RE.test(r.name)) return `bad name ${r.name}`;
  if (typeof r.service !== "string" || !r.service) return "bad service";
  if (r.identity !== "PENDING" && !ID_RE.test(r.identity)) return "bad identity";
  const st = r.state;
  if (typeof st !== "object" || !Number.isInteger(st.height) || st.height < 0 ||
      typeof st.digest !== "string" || !/^[0-9a-f]{0,64}$/.test(st.digest)) return "bad state";
  if (st.height === 0 && st.digest !== "") return "height 0 requires empty digest";
  const ep = r.endpoints;
  if (typeof ep !== "object" || ep === null) return "bad endpoints";
  for (const k of Object.keys(ep)) {
    if (!ENDPOINT_KEYS.has(k)) return `unknown endpoint ${k}`;
    if (typeof ep[k] !== "string" || !ep[k]) return `empty endpoint ${k}`;
  }
  const rt = r.routing;
  if (typeof rt !== "object" || !Array.isArray(rt.nodes)) return "bad routing";
  for (const n of rt.nodes) if (typeof n !== "string" || !n) return "bad node id";
  const sorted = [...rt.nodes].sort();
  if (JSON.stringify(sorted) !== JSON.stringify(rt.nodes)) return "routing.nodes not sorted";
  for (const k of Object.keys(r.policy)) if (!POLICY_KEYS.has(k)) return `unknown policy ${k}`;
  return null;
}

function validateZone(z) {
  if (typeof z !== "object" || z === null) return "not an object";
  const allowed = new Set(["v","zone","height","prev","records","signed_at","signed_by","sig"]);
  for (const k of Object.keys(z)) if (!allowed.has(k)) return `unknown field ${k}`;
  for (const k of allowed) if (!(k in z)) return `missing field ${k}`;
  if (z.v !== 2) return "v must be 2";
  if (z.zone !== "harz") return "zone must be harz";
  if (!Number.isInteger(z.height) || z.height < 1) return "bad height";
  if (z.prev !== null && !/^[0-9a-f]{64}$/.test(z.prev)) return "bad prev";
  if (!Array.isArray(z.records) || z.records.length === 0) return "empty records";
  let prevName = "";
  for (const r of z.records) {
    const err = validateRecord(r);
    if (err) return `${r.name || "?"}: ${err}`;
    if (r.name <= prevName) return `records not sorted by name (${r.name})`;
    prevName = r.name;
  }
  if (!ID_RE.test(z.signed_by)) return "bad signed_by";
  if (!/^ed25519:[0-9a-f]{128}$/.test(z.sig)) return "bad sig format";
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(z.signed_at)) return "bad signed_at";
  return null;
}

// ---------- sign / verify (fail-closed) ----------
function signZone(zoneObj, privateKey) {
  const unsigned = { ...zoneObj }; delete unsigned.sig;
  const sig = crypto.sign(null, canonicalBytes(unsigned), privateKey);
  return { ...zoneObj, sig: "ed25519:" + Buffer.from(sig).toString("hex") };
}
function verifyZone(z, pubHex) {
  const { sig, ...unsigned } = z;
  const sigBytes = Buffer.from(sig.replace("ed25519:", ""), "hex");
  // raw ed25519 pub → SPKI DER wrapper: 302a300506032b6570032100 || pub
  const spki = Buffer.concat([Buffer.from("302a300506032b6570032100", "hex"), Buffer.from(pubHex, "hex")]);
  const pub = crypto.createPublicKey({ key: spki, format: "der", type: "spki" });
  return crypto.verify(null, canonicalBytes(unsigned), pub, sigBytes);
}
function verifyZoneStrict(z) {
  const err = validateZone(z);
  if (err) return { ok: false, error: err };
  const ok = verifyZone(z, z.signed_by.replace("ed25519:", ""));
  if (!ok) return { ok: false, error: "SIGNATURE FAILED" };
  return { ok: true };
}

// ---------- builder: v1 TXT zone → v2 records ----------
function buildRecordsFromV1(v1text, extraMap = {}) {
  const map = new Map();
  for (const line of v1text.split("\n")) {
    // real v1 format: `name.harz.  3600 IN TXT "{...json with url...}"`
    const m = line.match(/^([a-z0-9-]+\.harz)\.\s+\d+\s+IN\s+TXT\s+"(.*)"\s*$/);
    if (!m) continue;
    let target = null;
    try {
      const val = JSON.parse(m[2].replace(/\\"/g, '"').replace(/\\\\/g, "\\"));
      // HONEST RESERVED RULE: url null or service_id "reserved" = no endpoint, ever.
      if (val.url === null || val.url === undefined || val.service_id === "reserved" || val.record_type === "RESERVED") {
        target = "RESERVED";
      } else {
        target = val.url || (val.service_id ? "https://" + val.service_id : null);
      }
    } catch (e) { target = m[2]; } // plain TXT value fallback
    map.set(m[1], target || "RESERVED");
  }
  const records = [];
  for (const [name, target] of map) {
    const ex = extraMap[name] || {};
    const ep = {};
    if (target && target !== "RESERVED") ep.https = target;
    const rec = {
      v: 2, name,
      service: ex.service || "platform",
      identity: ex.identity || "PENDING",
      state: ex.state || { height: 0, digest: "" },
      endpoints: ep,
      routing: ex.routing || { nodes: [] },
      policy: { trust: "canonical" }
    };
    const err = validateRecord(rec);
    if (err) throw new Error(`${name}: ${err}`);
    records.push(rec);
  }
  records.sort((a, b) => (a.name < b.name ? -1 : 1));
  return records;
}

function buildZone(records, height, prev, signedAt, priv, pubHex) {
  const ordered = [...records].sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
  const base = { v: 2, zone: "harz", height, prev, records: ordered, signed_at: signedAt, signed_by: "ed25519:" + pubHex };
  return signZone(base, priv);
}

module.exports = { canonicalize, canonicalBytes, validateRecord, validateZone, signZone, verifyZone, verifyZoneStrict, buildRecordsFromV1, buildZone };

// ---------- self-test battery (run directly) ----------
if (require.main === module) {
  const results = [];
  const T = (id, name, fn) => {
    try { const ok = fn(); results.push(`${id} ${ok ? "PASS" : "FAIL"} — ${name}`); if (!ok) process.exitCode = 1; }
    catch (e) { results.push(`${id} FAIL — ${name}: ${e.message}`); process.exitCode = 1; }
  };

  // ephemeral TEST keypair — in memory only, discarded at exit
  const { publicKey, privateKey } = crypto.generateKeyPairSync("ed25519");
  const pubHex = publicKey.export({ type: "spki", format: "der" }).subarray(-32).toString("hex");

  // fixture v1 zone
  const v1 = [
    'pay.harz.           3600 IN TXT "{\\"record_type\\":\\"SERVICE\\",\\"service_id\\":\\"harzpay\\",\\"url\\":\\"https://harzpay.harz.workers.dev\\"}"',
    'super.harz.         3600 IN TXT "{\\"url\\":\\"https://super-cloud.harz.workers.dev\\"}"',
    'store.harz.         3600 IN TXT "https://harz-store.harz.workers.dev"',
    'test.harz.          3600 IN TXT "RESERVED"',
    'ghost.harz.         3600 IN TXT "RESERVED"'
  ].join("\n");

  const extra = {
    "pay.harz": { service: "payments", routing: { nodes: ["node-1"] }, state: { height: 1, digest: "a".repeat(64) } },
    "test.harz": { service: "test", identity: "ed25519:" + "ab".repeat(32), routing: { nodes: ["node-1", "node-b"] } }
  };

  const recs = buildRecordsFromV1(v1, extra);
  const zone = buildZone(recs, 1, null, "2026-09-15T10:30:00Z", privateKey, pubHex);

  T("S2-T1", "strict schema: unknown field rejected", () => {
    const bad = JSON.parse(JSON.stringify(recs[0])); bad.extra = "x";
    return validateRecord(bad) === "unknown field extra";
  });
  T("S2-T2", "strict schema: unsorted routing rejected", () => {
    const bad = JSON.parse(JSON.stringify(recs[0])); bad.routing = { nodes: ["z", "a"] };
    return validateRecord(bad) === "routing.nodes not sorted";
  });
  T("S2-T3", "strict schema: bad name rejected", () => {
    const bad = JSON.parse(JSON.stringify(recs[0])); bad.name = "Pay.Harz";
    return validateRecord(bad) !== null;
  });
  T("S2-T4", "determinism: shuffled inputs → identical canonical zone bytes", () => {
    const shuffled = [...recs].reverse();
    const z2 = buildZone(shuffled, 1, null, "2026-09-15T10:30:00Z", privateKey, pubHex);
    return canonicalBytes(z2).equals(canonicalBytes(zone));
  });
  T("S2-T5", "canonical round-trip: parse(JSON of zone) → re-canonicalize → identical", () => {
    const rt = canonicalize(JSON.parse(canonicalize(zone)));
    return rt === canonicalize(zone);
  });
  T("S2-T6", "signature verifies on honest zone", () => verifyZoneStrict(zone).ok);
  T("S2-T7", "fail-closed: tampered target → SIGNATURE FAILED", () => {
    const bad = JSON.parse(canonicalize(zone));
    bad.records[0].endpoints.https = "https://evil.example";
    return verifyZoneStrict(bad).error === "SIGNATURE FAILED";
  });
  T("S2-T8", "fail-closed: tampered identity → SIGNATURE FAILED", () => {
    const bad = JSON.parse(canonicalize(zone));
    bad.records[4].identity = "ed25519:" + "cd".repeat(32);
    return verifyZoneStrict(bad).error === "SIGNATURE FAILED";
  });
  T("S2-T9", "absent transport = honest absence (RESERVED name has no https endpoint)", () => {
    const t = zone.records.find(r => r.name === "test.harz");
    return t && !("https" in t.endpoints) && t.identity !== "PENDING";
  });
  T("S2-T10", "PENDING identity marker survives validation and is visible", () => {
    const s = zone.records.find(r => r.name === "super.harz");
    return s && s.identity === "PENDING";
  });
  T("S2-T11", "zone chain: prev links digest of previous height", () => {
    const d1 = crypto.createHash("sha256").update(canonicalBytes(zone)).digest("hex");
    const z2 = buildZone(recs, 2, d1, "2026-09-15T10:31:00Z", privateKey, pubHex);
    return z2.prev === d1 && verifyZoneStrict(z2).ok;
  });

  console.log(results.join("\n"));
  const pass = results.filter(r => r.includes("PASS")).length;
  console.log(`\nBATTERY: ${pass}/${results.length} PASS`);
  // persist test zone (pub artifact only — no private material)
  fs.writeFileSync(__dirname + "/test-zone-v2.json", JSON.stringify(zone, null, 2));
  console.log("test zone written (signed_by pub only; TEST key discarded)");
}

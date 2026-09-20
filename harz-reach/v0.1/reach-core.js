// HARZ REACH CORE v0.1 — the capability layer above the frozen root
// ONE law, carried everywhere: resolve .harz through the SIGNED zone, verify locally,
// answer honestly. No fake resolution. Every answer leaves a receipt.
// Pure module: no chrome APIs, no DOM — runs in Node (battery) and the extension.
// Trust bundle (public, out-of-band): king 90062faa | floors 77 records / height 1.
// Root (frozen Sep 20, do not touch): https://harz-root.harz.workers.dev

export const ROOTS = ["https://harz-root.harz.workers.dev"];
export const ANCHOR = "ed25519:90062faa4947be141d5e18987aea5d14dd1c570329b57b0c50a3f6cddfc54c0f";
export const MIN_RECORDS = 77;
export const MIN_HEIGHT = 1;

// frozen canonical serialization (identical law to zone-v2.js / worker v3)
export function canonicalize(obj) {
  if (obj === null || typeof obj !== "object") return JSON.stringify(obj);
  if (Array.isArray(obj)) return "[" + obj.map(canonicalize).join(",") + "]";
  const keys = Object.keys(obj).sort();
  return "{" + keys.map(k => JSON.stringify(k) + ":" + canonicalize(obj[k])).join(",") + "}";
}

export function trustCheck(z) {
  if (!z || z.v !== 2 || z.zone !== "harz") return "REFUSED: not a HARZ v2 zone";
  if (String(z.signed_by) !== ANCHOR) return "REFUSED: WRONG ANCHOR — signer is not the pinned trust anchor";
  if (!Array.isArray(z.records) || z.records.length < MIN_RECORDS) return "REFUSED: NAMESPACE SHRINK — below floor " + MIN_RECORDS;
  if (z.height < MIN_HEIGHT) return "REFUSED: ROLLBACK — below floor " + MIN_HEIGHT;
  return null;
}

function hexToBytes(hex) {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.substr(i * 2, 2), 16);
  return out;
}

// async Ed25519 verify — WebCrypto (extension runtime + Node 20 battery)
export async function verifyZoneSig(z) {
  const { sig, ...unsigned } = z;
  const prefix = hexToBytes("302a300506032b6570032100");
  const pubRaw = hexToBytes(ANCHOR.replace("ed25519:", ""));
  const spki = new Uint8Array(prefix.length + pubRaw.length);
  spki.set(prefix); spki.set(pubRaw, prefix.length);
  const key = await crypto.subtle.importKey("spki", spki, { name: "Ed25519" }, false, ["verify"]);
  const data = new TextEncoder().encode(canonicalize(unsigned));
  const sigBytes = hexToBytes(sig.replace("ed25519:", ""));
  return crypto.subtle.verify("Ed25519", key, sigBytes, data);
}

// full fail-closed load: trust check + signature. Returns {ok, reason}
export async function loadZone(z) {
  const err = trustCheck(z);
  if (err) return { ok: false, reason: err };
  const ok = await verifyZoneSig(z);
  if (!ok) return { ok: false, reason: "REFUSED: SIGNATURE FAILED — zone not loaded (fail-closed)" };
  return { ok: true, zone: z };
}

export function buildIndex(z) {
  const idx = new Map();
  for (const r of z.records) idx.set(r.name, r);
  return idx;
}

export function resolveName(idx, name) {
  let n = String(name || "").trim().toLowerCase();
  if (n.endsWith(".")) n = n.slice(0, -1);
  if (!n.endsWith(".harz")) n = n + ".harz";
  return idx.get(n) || null; // honest NXDOMAIN — unknown stays unknown
}

// the verifiable receipt — every resolution leaves one
export function makeReceipt(entry) {
  return {
    ts: new Date().toISOString(),
    name: entry.name,
    result: entry.result,           // RESOLVED | NXDOMAIN | REFUSED
    transport: entry.transport,    // root-live | cache-live | cache-stale
    endpoint: entry.endpoint || null,
    zone: {
      height: entry.height,
      digest8: entry.digest8,
      sig: entry.sigOk === true ? "VALID" : "FAILED",
      records: entry.records
    }
  };
}

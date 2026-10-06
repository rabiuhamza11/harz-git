// REC1 STANDING VERIFIER — independent re-implementation of the frozen envelope spec
// (harz-internetless v0.2: canonical = JSON.stringify({from,name,text,ts,nonce}),
//  Ed25519 spki "302a300506032b6570032100"+pub, sig hex over canonical utf8).
// NEVER imports the primitive. NEVER trusts the stored 'verified' flag: every record
// re-verified NOW from raw bytes on disk. Output: JSON verdict + deterministic set digest.
const fs = require("fs"), crypto = require("crypto");
const file = process.argv[2];
if (!file) { console.error("usage: node rec1-verify.js <inbox.jsonl>"); process.exit(2); }
function canonical(env) { return JSON.stringify({ from: env.from, name: env.name, text: env.text, ts: env.ts, nonce: env.nonce }); }
function verifyEnv(env) {
  if (!env || !env.from || typeof env.text !== "string" || !env.ts || !env.nonce) return false;
  try {
    const k = crypto.createPublicKey({ key: Buffer.from("302a300506032b6570032100" + env.from, "hex"), format: "der", type: "spki" });
    return crypto.verify(null, Buffer.from(canonical(env), "utf8"), k, Buffer.from(env.sig, "hex"));
  } catch { return false; }
}
let lines = [];
try { lines = fs.readFileSync(file, "utf8").split("\n").filter(Boolean); } catch { /* absent = empty */ }
let torn = 0, verified = [], corrupt = [], nonces = new Set(), dupNonce = 0;
for (const ln of lines) {
  let rec; try { rec = JSON.parse(ln); } catch { torn++; continue; }
  const env = rec.envelope;
  if (!env || !env.nonce) { torn++; continue; }
  if (nonces.has(env.nonce)) { dupNonce++; continue; }
  if (verifyEnv(env)) { nonces.add(env.nonce); verified.push({ nonce: env.nonce, from: env.from, name: env.name, text: env.text, ts: env.ts, stored_flag: rec.verified }); }
  else corrupt.push({ nonce: env.nonce, why: "SIGNATURE FAILED (independent verify, just now)" });
}
verified.sort((a, b) => a.nonce < b.nonce ? -1 : 1);
const canonicalSet = verified.map(v => v.nonce + "|" + v.from + "|" + v.text).join("\n");
const digest = crypto.createHash("sha256").update(canonicalSet).digest("hex");
const labelLies = verified.filter(v => v.stored_flag === false).length; // flag false but signature valid now
console.log(JSON.stringify({ file, total_lines: lines.length, torn, duplicate_nonce_lines: dupNonce, verified: verified.length, corrupt: corrupt.length, stored_flag_lies: labelLies, digest, texts: verified.map(v => v.text) }, null, 1));

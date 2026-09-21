// HARZ CEREMONY v1.3 — revive-and-sign.js — THE KING'S RETURN v2 (runs ON NODE 1 only) — seed import fixed: hand-built Ed25519 pkcs8 DER prefix, no JWK x needed
// The owner holds the king's key material in a NOTE. This script reads that note
// (pasted into a LOCAL file — never into chat), tries every plausible key format,
// derives the public key, and asserts it equals the declared king c56e08bf...
// Only if the king himself is in the note does it write a proper pem and sign
// the succession manifest. Fail-closed: wrong key or garbage = honest refusal.
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const law = require(path.join(__dirname, "succession-law.js"));

const KING_PUB = "c56e08bfbe74b1d431f05cf75b932773ed99e8b13dd4a4af7fe9f26cb9923f09";
const NOTE = process.argv[2] || path.join(__dirname, "king-note.txt");
const KEYS_DIR = path.join(__dirname, "keys");
const PEM_PATH = path.join(KEYS_DIR, "zsk-ed25519.pem");

function pubOf(priv) {
  return crypto.createPublicKey(priv).export({ type: "spki", format: "der" }).slice(-32).toString("hex");
}
function fail(msg) { console.error(msg); console.error("Nothing signed. Tell Magani in words."); process.exit(3); }

if (!fs.existsSync(NOTE)) fail("NOTE FILE NOT FOUND — expected " + NOTE + ". Create it first (cat > king-note.txt, paste, Enter, Ctrl-D).");
const note = fs.readFileSync(NOTE, "utf8");
if (note.trim().length < 32) fail("NOTE FILE LOOKS EMPTY — the paste may not have landed. Redo: cat > king-note.txt, paste, Enter, Ctrl-D.");

// ---- collect candidates from the note, every plausible format ----
const candidates = [];
const seen = new Set();
function tryPriv(p, tag) {
  try {
    const hex = pubOf(p);
    if (!seen.has(hex)) { seen.add(hex); candidates.push({ priv: p, pub: hex, tag: tag }); }
  } catch (e) { /* not a key, skip */ }
}
// 1) PEM blocks (any label)
const pemRe = /-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g;
for (const m of note.match(pemRe) || []) {
  tryPriv(crypto.createPrivateKey({ key: m, format: "pem" }), "PEM block");
}
// 2) hex strings: 128-hex (seed+pub) then 64-hex (seed) — longest first
const hexes = (note.match(/[0-9a-fA-F]{64}(?:[0-9a-fA-F]{64})?/g) || []);
for (const h of [...new Set(hexes)].sort((a, b) => b.length - a.length)) {
  const seed = Buffer.from(h.slice(0, 64), "hex");
  try {
    const pkcs8 = Buffer.concat([Buffer.from("302e020100300506032b657004220420", "hex"), seed]);
    tryPriv(crypto.createPrivateKey({ key: pkcs8, format: "der", type: "pkcs8" }), (h.length === 128 ? "128-hex (seed+pub)" : "64-hex seed"));
  } catch (e) { /* skip */ }
}
// 3) base64 blobs that decode to pkcs8/pkcs1 DER or a raw seed
for (const b of note.match(/[A-Za-z0-9+/]{40,}={0,2}/g) || []) {
  if (b.length > 500) continue;
  try {
    const der = Buffer.from(b, "base64");
    try { tryPriv(crypto.createPrivateKey({ key: der, format: "der", type: "pkcs8" }), "base64 pkcs8"); } catch (e) {}
    try { tryPriv(crypto.createPrivateKey({ key: der, format: "der", type: "pkcs1" }), "base64 pkcs1"); } catch (e) {}
    if (der.length === 32 || der.length === 64) {
      const pkcs8 = Buffer.concat([Buffer.from("302e020100300506032b657004220420", "hex"), der.slice(0, 32)]);
      tryPriv(crypto.createPrivateKey({ key: pkcs8, format: "der", type: "pkcs8" }), "base64 raw seed");
    }
  } catch (e) { /* skip */ }
}

if (candidates.length === 0)
  fail("NO KEY FORMAT FOUND IN THE NOTE — tell Magani what the note LOOKS like in words (does it say BEGIN PRIVATE KEY? A long line of numbers/letters? Words?).");

console.log("CANDIDATE KEYS FOUND IN NOTE: " + candidates.length);
for (const c of candidates) console.log("  candidate pub: " + c.pub + "  (" + c.tag + ")");
const king = candidates.find(c => c.pub === KING_PUB);
if (!king) {
  console.error("");
  console.error("NONE OF THEM IS THE KING (expected pub " + KING_PUB + ").");
  console.error("Nothing signed. Paste the candidate pub lines above to Magani — they are PUBLIC and safe.");
  process.exit(3);
}

// ---- THE KING LIVES — write the pem properly, then sign ----
fs.mkdirSync(KEYS_DIR, { recursive: true });
fs.writeFileSync(PEM_PATH, king.priv.export({ type: "pkcs8", format: "pem" }), { mode: 0o600 });
console.log("");
console.log(">>> ZSK REVIVED — THE KING LIVES. Written to keys/zsk-ed25519.pem (mode 600).");
console.log("KING PUB (public, safe): " + KING_PUB);

const m = law.buildManifest(
  KING_PUB,
  "7f970c910c75783d4b763028303bfc5eba9b8ca462fec92e3f357d7e57f5af0d",
  [
    "c2c6d6b9844e852fe14982c648ce14f5734079b47c0d6218e743eeb4a71c133d",
    "54697e7fb8504d7166067584c9831bf85c7cad267615490ec26b76aabecff748",
    "a1348ed909e774562054b69c0ffd63bb42d323077db2c550d09b3bad8a2669c3",
  ],
  2, 1
);
const sig = law.sign(king.priv, m);
console.log("");
console.log("SUCCESSION MANIFEST (canonical):");
console.log(JSON.stringify(m));
console.log("");
console.log(">>> SIG (public — safe to paste to Magani):");
console.log(sig);
console.log("");
console.log("The king has named his heir. Paste the SIG and KING PUB lines to Magani.");
// tidy: remove the note file so key material does not sit in two places
try { fs.unlinkSync(NOTE); console.log("(king-note.txt deleted — the pem in keys/ is now the only copy on this phone.)"); } catch (e) {}

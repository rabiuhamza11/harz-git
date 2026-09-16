// HARZ CEREMONY v2.0 — found-and-sign.js — THE FRESH ANCHOR (founding act)
//
// OWNER DECISION (Rabiu, Sep 16 2026, 16:10 WAT): king-recovery archaeology CLOSED.
// The Sep 14 king (pub c56e08bf... fingerprint 86a507a4) is DECLARED LOST — refused
// forever from this moment, same law as burned keys, even if it ever resurfaces.
// Fresh chain cut instead: ink key #4 (pub 7f970c91...) becomes FOUNDING KING.
//
// LAW OF THIS SCRIPT:
//  - the founding key exists ONLY as ink on the 3 paper cards (2-of-3 split)
//  - you type any TWO cards from PAPER into files ON NODE 1 (never into chat)
//  - this script combines them, asserts pub == 7f970c91 (fail-closed),
//    signs the FOUNDING MANIFEST with the key IN MEMORY (private key NEVER
//    written to disk), then DELETES the typed card files
//  - prints ONLY public data: manifest + KING PUB + SIG
//
// usage: node found-and-sign.js pA.txt pB.txt   (any two of the three cards)

const crypto = require("crypto");
const fs = require("fs");

const EXPECTED_PUB = "7f970c910c75783d4b763028303bfc5eba9b8ca462fec92e3f357d7e57f5af0d"; // ink key #4 — FOUNDING KING
const OLD_KING = "c56e08bfbe74b1d431f05cf75b932773ed99e8b13dd4a4af7fe9f26cb9923f09";   // declared lost Sep 16
const WITNESSES = [
  "c2c6d6b9844e852fe14982c648ce14f5734079b47c0d6218e743eeb4a71c133d",
  "54697e7fb8504d7166067584c9831bf85c7cad267615490ec26b76aabecff748",
  "a1348ed909e774562054b69c0ffd63bb42d323077db2c550d09b3bad8a2669c3",
];
const DECLARED_AT = "2026-09-16";

function die(msg, code) { console.error(msg); console.error("Nothing signed. The ink remains the keystore."); process.exit(code || 3); }

// ---- parse a typed card: "96hex/96hex" (same law as kit v1.2) ----
function parseCard(file, txt) {
  const raw = txt.replace(/\s+/g, "").toLowerCase();
  if (!raw.includes("/")) die("CARD " + file + " INVALID: no slash found. A hex card is 96 characters, a slash, 96 characters. Retype from the paper.", 3);
  const parts = raw.split("/");
  if (parts.length !== 2) die("CARD " + file + " INVALID: found " + (parts.length - 1) + " slashes, expected exactly 1. Retype.", 3);
  const [a, b] = parts;
  if (a.length !== 96 || b.length !== 96) die("CARD " + file + " INVALID: expected 96 chars per half, found " + a.length + " and " + b.length + ". Retype.", 3);
  for (const [name, s] of [["first half", a], ["second half", b]]) {
    if (!/^[0-9a-f]+$/.test(s)) die("CARD " + file + " INVALID: " + name + " has a character that is not hex (0-9 a f only). Retype.", 3);
  }
  return [a, b];
}

// ---- 2-of-3 XOR law (kit splitHex: key = x1 ^ x2 ^ x3) ----
const files = process.argv.slice(2);
if (files.length !== 2) die("usage: node found-and-sign.js pA.txt pB.txt  (exactly TWO of the three cards, typed from paper)", 1);
let sharePairs;
try {
  sharePairs = files.map(f => parseCard(f, fs.readFileSync(f, "utf8")));
} catch (e) {
  die("CARD FILE NOT FOUND — expected " + files.join(" + ") + " in this folder. Type each card first (cat > pA.txt, type from paper, Enter, Ctrl-D).", 3);
}
const xs = new Set();
for (const p of sharePairs) for (const s of p) xs.add(s);
if (xs.size !== 3) die("INVALID PAIR — two cards must expose exactly 3 distinct shares. Did you type the SAME card twice?", 3);
const key = Buffer.alloc(48); // pkcs8 DER of ed25519 = 48 bytes
for (const h of xs) {
  const b = Buffer.from(h, "hex");
  for (let i = 0; i < 48; i++) key[i] ^= b[i];
}

let priv;
try {
  priv = crypto.createPrivateKey({ key: key, format: "der", type: "pkcs8" });
} catch (e) {
  die("COMBINE FAILED — the two cards do not reconstruct a valid key (bad pair or typos). Run check-card.js on each and retype.", 3);
}
const pub = crypto.createPublicKey(priv).export({ type: "spki", format: "der" }).slice(-32).toString("hex");
if (pub !== EXPECTED_PUB) {
  console.error("THESE CARDS ARE NOT THE FOUNDING KEY.");
  console.error("Derived pub (public, safe to paste to Magani): " + pub);
  die("Expected the ink key #4 pub " + EXPECTED_PUB + ". Nothing signed.", 3);
}

// ---- FOUNDING MANIFEST (fresh chain) ----
const manifest = {
  act: "FOUNDING_ACT",
  chain: "harz-root-v2",
  declared_at: DECLARED_AT,
  height: 1,
  king_pub: EXPECTED_PUB,
  policy: "2-of-3",
  witnesses: WITNESSES.slice().sort(),
  predecessor: {
    king_pub: OLD_KING,
    status: "declared-lost-by-owner",
    live_root_v1: "frozen-serving",
  },
};
// canonical bytes: recursive key-sorted JSON, no whitespace
function canon(o) {
  if (Array.isArray(o)) return "[" + o.map(canon).join(",") + "]";
  if (o !== null && typeof o === "object") {
    return "{" + Object.keys(o).sort().map(k => JSON.stringify(k) + ":" + canon(o[k])).join(",") + "}";
  }
  return JSON.stringify(o);
}
const canonical = canon(manifest);
const sig = crypto.sign(null, Buffer.from(canonical, "utf8"), priv).toString("hex");

// self-verify before printing (belt and braces)
const spki = Buffer.concat([Buffer.from("302a300506032b6570032100", "hex"), Buffer.from(EXPECTED_PUB, "hex")]);
const vpub = crypto.createPublicKey({ key: spki, format: "der", type: "spki" });
if (!crypto.verify(null, Buffer.from(canonical, "utf8"), vpub, Buffer.from(sig, "hex"))) die("SELF-VERIFY FAILED — do not trust this output. Tell Magani.", 3);

// ---- cleanup: the typed card files leave the phone; key was never on disk ----
let cleaned = 0;
for (const f of files) { try { fs.unlinkSync(f); cleaned++; } catch (e) {} }

console.log(">>> FOUNDING SIGNED — THE FRESH KING IS NAMED. Chain: harz-root-v2, height 1.");
console.log("KING PUB (public, safe): " + EXPECTED_PUB);
console.log("");
console.log("FOUNDING MANIFEST (public):");
console.log(canonical);
console.log("");
console.log(">>> SIG (public — safe to paste to Magani):");
console.log(sig);
console.log("");
console.log("SELF-VERIFIED: signature checks against the king pub above.");
console.log("Cleanup: " + cleaned + " card file(s) deleted. The ink on your paper cards remains the ONLY keystore.");

// HARZ CEREMONY — derive-card.js — REBUILD THE CORRUPT THIRD CARD FROM TWO (2-of-3 recovery)
//
// WHY: a paper card can be damaged (ink smudged, torn, unreadable rows). The split
// law makes recovery possible: key = x1^x2^x3, card A=(x1,x2), B=(x1,x3), C=(x2,x3).
// Any TWO cards of a set expose all three shares, so the THIRD card's content is
// fully determined. This tool reads two typed card files of the SAME set, verifies
// they are siblings, identifies WHICH key set they belong to (public label only,
// same map as card-finder.js), and prints the MISSING card's rows + CHECK so it
// can be re-inked on fresh paper.
//
// LAW: runs on the phone. Card content never leaves the phone. The printed
// missing-card rows are PRIVATE KEY MATERIAL — hand-copy them onto paper
// immediately, never photograph them, never paste them into chat. After re-inking,
// delete the typed files: rm pX.txt ... Paper is the keystore.
//
// usage: node derive-card.js pB.txt pC.txt [CHECK-8-hex-from-corrupt-card-corner]
//   - without CHECK: prints the derived card + its CHECK (compare with the corner
//     of the corrupt card; a mismatch of only the two halves swapped is handled
//     by re-running WITH the CHECK — the tool picks the matching orientation).
//   - with CHECK: prints the derived card ONLY if one orientation matches that
//     CHECK exactly; otherwise refuses (the two typed cards are not the siblings
//     of that corrupt card).

const crypto = require("crypto");
const fs = require("fs");

const KNOWN = {
  "7f970c910c75783d4b763028303bfc5eba9b8ca462fec92e3f357d7e57f5af0d": "FOUNDING KING — ink key #4 (successor)",
  "c2c6d6b9844e852fe14982c648ce14f5734079b47c0d6218e743eeb4a71c133d": "witness W1 cards",
  "54697e7fb8504d7166067584c9831bf85c7cad267615490ec26b76aabecff748": "witness W2 cards",
  "a1348ed909e774562054b69c0ffd63bb42d323077db2c550d09b3bad8a2669c3": "witness W3 cards",
};
const KING_PUB = "7f970c910c75783d4b763028303bfc5eba9b8ca462fec92e3f357d7e57f5af0d";

function die(msg, code) { console.error(msg); process.exit(code || 3); }
function sha8(s) { return crypto.createHash("sha256").update(s, "utf8").digest("hex").slice(0, 8); }

const args = process.argv.slice(2);
if (args.length < 2) {
  console.error("usage: node derive-card.js pB.txt pC.txt [CHECK-8-hex-from-corrupt-card-corner]");
  console.error("example: node derive-card.js pB.txt pC.txt 1d76b56b");
  process.exit(1);
}
const files = args.slice(0, 2).sort();
const checkArg = (args[2] || "").trim().toLowerCase();

function parseCard(file) {
  let txt;
  try { txt = fs.readFileSync(file, "utf8"); }
  catch (e) { die("CARD FILE NOT FOUND: " + file + " — type that card first (node type-card.js).", 3); }
  const raw = txt.replace(/\s+/g, "").toLowerCase();
  if (!raw.includes("/")) die("CARD " + file + " INVALID: no slash found. Retype from the paper.", 3);
  const parts = raw.split("/");
  if (parts.length !== 2) die("CARD " + file + " INVALID: expected exactly 1 slash, found " + (parts.length - 1) + ". Retype.", 3);
  const [a, b] = parts;
  if (a.length !== 96 || b.length !== 96) die("CARD " + file + " INVALID: expected 96 chars per half, found " + a.length + " and " + b.length + ". Retype.", 3);
  if (!/^[0-9a-f]+$/.test(a) || !/^[0-9a-f]+$/.test(b)) die("CARD " + file + " INVALID: non-hex character. Retype.", 3);
  return [a, b];
}

const c1 = parseCard(files[0]);
const c2 = parseCard(files[1]);

// same card typed twice?
if (c1[0] === c2[0] && c1[1] === c2[1]) {
  die("You typed the SAME card into both files. One card alone reveals nothing about the third — that is the security of the split.\nType two DIFFERENT cards of the set.", 3);
}

// find the common share
let common = null;
for (const s of c1) if (c2.includes(s)) common = s;
if (!common) {
  die("These two cards share NO share — they are from DIFFERENT card sets. The third card cannot be derived from mixed cards.\nNothing printed. The ink remains the keystore.", 3);
}
const u1 = c1[0] === common ? c1[1] : c1[0];
const u2 = c2[0] === common ? c2[1] : c2[0];

// identify the set (public data only)
const key = Buffer.alloc(48);
for (const h of [u1, common, u2]) {
  const b = Buffer.from(h, "hex");
  for (let i = 0; i < 48; i++) key[i] ^= b[i];
}
let setName = null, pubHex = null;
try {
  const priv = crypto.createPrivateKey({ key, format: "der", type: "pkcs8" });
  pubHex = crypto.createPublicKey(priv).export({ type: "spki", format: "der" }).slice(-32).toString("hex");
  setName = KNOWN[pubHex] || "UNKNOWN KEY (not successor, not W1-W3)";
} catch (e) { setName = null; }

// orientation: primary = (unique of file1, unique of file2)
const primary = u1 + "/" + u2;
const flipped = u2 + "/" + u1;
const cp = sha8(primary), cf = sha8(flipped);
let content = primary, usedCheck = cp, orientNote = "primary";
if (checkArg) {
  if (checkArg === cp) { content = primary; usedCheck = cp; orientNote = "primary"; }
  else if (checkArg === cf) { content = flipped; usedCheck = cf; orientNote = "flipped (halves swapped)"; }
  else {
    die("Neither orientation of the derived card has CHECK " + checkArg + ".\nThese two typed cards are NOT the siblings of that corrupt card — the corrupt card belongs to a DIFFERENT set.\nThis is a real lead: tell Magani the corrupt card's CHECK and label. Nothing printed.", 3);
  }
}

console.log("DERIVE-CARD — the corrupt third card, rebuilt from its two siblings (all local):");
console.log("");
console.log("Set identified from the pair " + files[0] + " + " + files[1] + ":");
if (pubHex) {
  console.log("  pub: " + pubHex);
  console.log("  -> " + setName);
  if (pubHex === KING_PUB) console.log("  >>> This is the FOUNDING KING set — the rebuilt card is a king card.");
  else if (setName && setName.startsWith("witness")) console.log("  NOTE: this is a WITNESS set. A witness card cannot sign the founding — the founding needs the successor cards.");
} else {
  console.log("  (could not identify the set — 3 shares do not form a valid key; compare the CHECK carefully before trusting the rebuilt card)");
}
console.log("  orientation: " + orientNote + (checkArg ? " (matched your corrupt card's corner CHECK)" : " (no CHECK given — compare the CHECK below with the corrupt card's corner; if the corner shows " + cf + " instead, re-run with the CHECK argument to flip)"));
console.log("");
console.log("=== THE REBUILT CARD — PRIVATE KEY MATERIAL, HAND-COPY TO PAPER NOW ===");
const rows = [];
for (let i = 0; i < content.length; i += 24) rows.push(content.slice(i, i + 24));
rows.forEach((r, i) => console.log("row " + (i + 1) + ": " + r));
console.log("");
console.log("CHECK (write in the corner of the new card): " + usedCheck);
console.log("Label the new paper card exactly like the corrupt one (same letter, same set name).");
console.log("");
console.log("DISCIPLINE: copy it to paper NOW; never photograph or paste these rows anywhere.");
console.log("When the new card is inked: rm " + files.join(" ") + "  (digital copies must not remain).");
console.log("The ink remains the keystore.");

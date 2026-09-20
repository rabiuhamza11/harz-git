// HARZ CARD DOCTOR — public-safe structure report for a typed card file.
// LAW: card content NEVER prints, NEVER leaves the phone. This prints only counts,
// lengths, row/col positions, and sha8 CHECK fingerprints (safe — they are already
// written in the corners of your paper cards).
//
// usage: node card-doctor.js pA.txt            (diagnose)
//        node card-doctor.js pA.txt --split     (if doctor says TWO CARDS: writes pA.txt + pB.txt locally)
//        node card-doctor.js pA.txt --split-swap
const crypto = require("crypto");
const fs = require("fs");
const file = process.argv[2] || "pA.txt";
const mode = process.argv[3] || "";
if (!fs.existsSync(file)) { console.log("FILE NOT FOUND: " + file); process.exit(2); }
const txt = fs.readFileSync(file, "utf8");
const raw = txt.replace(/\s+/g, "").toLowerCase();
function sha8(s) { return crypto.createHash("sha256").update(s, "utf8").digest("hex").slice(0, 8); }
function pos(n) { return "row " + (Math.floor(n / 24) + 1) + ", col " + (n % 24 + 1); }

if (!raw.length) { console.log("EMPTY FILE — nothing typed. Use: cat > " + file + " then type/paste rows, Enter, Ctrl-D once."); process.exit(2); }

// non-hex, non-slash characters (typos) — report positions only
const bad = [];
for (let i = 0; i < raw.length; i++) {
  const c = raw[i];
  if (!/[0-9a-f]/.test(c) && c !== "/") bad.push(i);
}
if (bad.length) {
  console.log("TYPOS FOUND: " + bad.length + " character(s) that are not 0-9/a-f/slash:");
  for (const i of bad.slice(0, 10)) console.log("  one at " + pos(i) + " of the typed stream");
  console.log("FIX: retype the row(s) above from the paper, then run this again. (Row = 24 chars on paper.)");
  process.exit(3);
}

const slashes = [];
for (let i = 0; i < raw.length; i++) if (raw[i] === "/") slashes.push(i);
const segs = raw.split("/");
console.log("LENGTH: " + raw.length + " chars | SLASHES: " + slashes.length + (slashes.length ? " at " + slashes.map(pos).join(", ") : ""));

if (raw.length === 193 && slashes.length === 1 && segs[0].length === 96 && segs[1].length === 96) {
  console.log("STRUCTURE: PERFECT CARD (96/96, one slash).");
  console.log("CARD CHECK sha8: " + sha8(raw));
  console.log("Compare with the CHECK in the corner of this paper card. MATCH = card is byte-exact.");
  process.exit(0);
}
if (raw.length === 386 && slashes.length === 2 && segs.length === 3 && segs[0].length === 96 && segs[1].length === 192 && segs[2].length === 96) {
  const card1 = segs[0] + "/" + segs[1].slice(0, 96);
  const card2 = segs[1].slice(96) + "/" + segs[2];
  console.log("DIAGNOSIS: TWO CARDS typed into ONE file (back to back).");
  console.log("FIRST CARD  sha8: " + sha8(card1) + "   <- compare with paper corner CHECK");
  console.log("SECOND CARD sha8: " + sha8(card2) + "   <- compare with paper corner CHECK");
  if (mode === "--split" || mode === "--split-swap") {
    const a = mode === "--split" ? card1 : card2;
    const b = mode === "--split" ? card2 : card1;
    fs.writeFileSync(file, a); fs.writeFileSync(file.replace(/p[A-C]\.txt$/i, "pB.txt"), b);
    console.log("SPLIT LOCALLY: " + file + " = first card, pB.txt = second card (order " + (mode === "--split" ? "as-is" : "swapped") + "). Content stayed on the phone.");
    console.log("Re-run the doctor on each file to confirm both say PERFECT CARD, then re-run zone-king-sign.js.");
  } else {
    console.log("IF both sha8 lines match your two paper corners, fix locally with: node card-doctor.js " + file + " --split   (or --split-swap if the order is reversed).");
  }
  process.exit(4);
}
// general structure report
console.log("SEGMENTS between slashes: " + segs.map(s => s.length).join(" / ") + " chars (expected 96 / 96)");
if (raw.length !== 193) console.log("TOTAL expected 193 chars, found " + raw.length + (raw.length < 193 ? " (card incomplete — missing " + (193 - raw.length) + " chars, check rows on paper)" : " (too long by " + (raw.length - 193) + " — extra characters typed)"));
if (slashes.length > 1) console.log("EXTRA SLASHES: paper card has exactly ONE slash (it opens row 5). Check rows " + slashes.map(s => Math.floor(s / 24) + 1).join(" and ") + " — a slash was typed where the paper has none, or rows were doubled.");
console.log("ADVICE: retype the card rows of 24 from the paper (slash opens row 5), then run the doctor again. Nothing has left the phone.");
process.exit(3);

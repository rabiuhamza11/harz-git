// HARZ CEREMONY — card-extract.js — PULL A CARD OUT OF YOUR OWN TRANSCRIPT (v1.0)
//
// WHY: owner typed cards into Termux in the morning (cat > pA.txt ...). The
// typed rows echoed into the transcript. pA.txt/pC.txt vanished, but the
// SCROLLBACK still holds the rows. This script reads a pasted transcript file
// (scroll.txt), finds 193-char card candidates (96 hex + '/' + 96 hex, typed
// as 24-char rows or one line), computes each candidate's public CHECK (sha8),
// and AUTO-WRITES pA.txt when the candidate matches the known card-A CHECK.
//
// LAW: card content NEVER leaves the phone. Prints ONLY candidate numbers,
// CHECK sums, and MATCH/MISMATCH verdicts. It never prints card text.
//
// usage: node card-extract.js scroll.txt [expected-CHECK-hex ...]
//   - no extra args: checks against built-in known CHECKs (card A: b747d8dd)
//   - add more expected CHECKs (from your paper card corners — they are
//     public fingerprints) to auto-write files for other cards
//
// flow:
//   1. In Termux: long-press -> Select All -> Copy  (whole transcript)
//   2. cat > scroll.txt   then long-press -> Paste, then Enter, then Ctrl-D
//   3. node card-extract.js scroll.txt
//   4. rm scroll.txt   (delete the transcript copy when done)

const crypto = require("crypto");
const fs = require("fs");

const KNOWN = { "b747d8dd": "pA" };  // recorded card-A CHECK (public fingerprint)

function die(msg, code) { console.error(msg); process.exit(code || 3); }

const file = process.argv[2];
if (!file) die("usage: node card-extract.js scroll.txt [expected-CHECK ...]", 1);

let txt;
try { txt = fs.readFileSync(file, "utf8"); } catch (e) { die("FILE NOT FOUND: " + file, 3); }

// strip ANSI color codes, normalize
const clean = txt.replace(/\[[0-9;]*[A-Za-z]/g, "").replace(/\s+/g, "").toLowerCase();
// (whitespace stripped = same law as check-card.js: card CHECK is over the
//  whitespace-free lowercase line; typed 24-char rows rejoin into one run)

// find maximal runs of [0-9a-f/] characters
const runs = clean.match(/[0-9a-fA-F\/]{160,}/g) || [];
const cands = [];
for (const run of runs) {
  for (let i = 0; i + 193 <= run.length; i++) {
    const c = run.slice(i, i + 193);
    if ((c.match(/\//g) || []).length !== 1) continue;
    if (c.indexOf("/") !== 96) continue;
    if (!/^[0-9a-f]+\/[0-9a-f]+$/.test(c)) continue;
    const check = crypto.createHash("sha256").update(c).digest("hex").slice(0, 8);
    if (!cands.some(x => x.c === c)) cands.push({ c, check });
    i += 192;
  }
}

if (cands.length === 0) {
  console.log("NO CARD MATERIAL FOUND in transcript.");
  console.log("If you copied the whole scrollback, the card rows are not there anymore.");
  console.log("Remaining path: retype 2 cards from paper (node type-card.js A).");
  process.exit(0);
}

console.log("CANDIDATES FOUND: " + cands.length);
let written = 0;
cands.forEach((x, i) => {
  const known = KNOWN[x.check] || (process.argv.slice(3).includes(x.check) ? "expected" : null);
  console.log("candidate " + (i + 1) + " — CHECK " + x.check + (known ? " — MATCH " + (KNOWN[x.check] || "your expected CHECK") : " — compare with your paper card corners"));
  if (known) {
    // KNOWN checks write their card-named file; extra expected-CHECKs write
    // recover.txt (finish-ceremony.js also reads it: just rename to pC.txt
    // after confirming the CHECK belongs to that paper card).
    const out = KNOWN[x.check] ? KNOWN[x.check] + ".txt" : "recover.txt";
    fs.writeFileSync(out, x.c + "\n");
    console.log("  -> WROTE " + out + " locally (content stays on phone)");
    written++;
  }
});
console.log(written > 0
  ? "DONE: " + written + " card file(s) written. Next: node finish-ceremony.js > founding.txt 2>&1"
  : "No candidate matched a known CHECK. Compare CHECKs above with card corners, rerun with: node card-extract.js " + file + " <CHECK-from-corner>");

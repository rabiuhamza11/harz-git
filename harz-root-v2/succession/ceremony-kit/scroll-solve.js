// HARZ CEREMONY — scroll-solve.js — THE PILE NAMER (v1.0)
//
// WHY: 6 typing rounds kept reconstructing W3. Either the owner keeps picking
// the wrong paper pile, OR the Sep 16 pub records crossed and the pile in his
// hand IS the king. Both hypotheses are settled by the SAME evidence: the
// Termux scrollback from Sep 16 holds every card that was typed or printed
// that day (all 15 cards across 4 keys were CHECK-verified = typed on Node 1).
// This script scans a pasted transcript, finds all card candidates, pairs
// them, reconstructs each pair's key IN MEMORY, and NAMES the pub:
// 7f970c91 = recorded successor | c2c6d6b9/54697e7f/a1348ed9 = W1/W2/W3.
// It also greps for the finisher's public-safe output lines ("safe to paste",
// PUB/SIG), in case the founding was already signed at 08:25 Sep 17.
//
// LAW: card content NEVER leaves the phone and is NEVER printed. Only pubs,
// CHECK sums, pairings and verdicts are printed (all public-safe). Keys are
// assembled IN MEMORY only and discarded.
//
// usage: node scroll-solve.js scroll.txt [TARGET-KING-PUB]
//   TARGET defaults to the recorded successor 7f970c91... — pass a different
//   pub if the crossed-records evidence proves the king is someone else.
//
// If a pair reconstructs the TARGET pub, it writes pA.txt + pC.txt locally so
// finish-ceremony.js can sign immediately. Nothing is printed about content.

const crypto = require("crypto");
const fs = require("fs");

const KNOWN = {
  "7f970c910c75783d4b763028303bfc5eba9b8ca462fec92e3f357d7e57f5af0d": "RECORDED SUCCESSOR (Sep 16, 11:30)",
  "c2c6d6b9844e852fe14982c648ce14f5734079b47c0d6218e743eeb4a71c133d": "witness W1",
  "54697e7fb8504d7166067584c9831bf85c7cad267615490ec26b76aabecff748": "witness W2",
  "a1348ed909e774562054b69c0ffd63bb42d323077db2c550d09b3bad8a2669c3": "witness W3 (Sep 16, 12:04)",
  "c56e08bfbe74b1d431f05cf75b932773ed99e8b13dd4a4af7fe9f26cb9923f09": "OLD KING (declared lost Sep 16)",
};

function die(msg, code) { console.error(msg); process.exit(code || 3); }
const file = process.argv[2];
if (!file) die("usage: node scroll-solve.js scroll.txt [TARGET-KING-PUB]", 1);
const TARGET = process.argv[3] || "7f970c910c75783d4b763028303bfc5eba9b8ca462fec92e3f357d7e57f5af0d";

let txt;
try { txt = fs.readFileSync(file, "utf8"); } catch (e) { die("FILE NOT FOUND: " + file, 3); }

// ---- 1. find card candidates (same law as card-extract.js / check-card.js) ----
const clean = txt.replace(/\x1b\[[0-9;]*[A-Za-z]/g, "").replace(/\s+/g, "").toLowerCase();
const runs = clean.match(/[0-9a-f\/]{160,}/g) || [];
const cands = [];
for (const run of runs) {
  for (let i = 0; i + 193 <= run.length; i++) {
    const c = run.slice(i, i + 193);
    if ((c.match(/\//g) || []).length !== 1) continue;
    if (c.indexOf("/") !== 96) continue;
    if (!/^[0-9a-f]+\/[0-9a-f]+$/.test(c)) continue;
    if (!cands.some(x => x.c === c)) cands.push({ c, check: crypto.createHash("sha256").update(c).digest("hex").slice(0, 8) });
    i += 192;
  }
}
console.log("SCROLL-SOLVE — public results only");
console.log("CARD CANDIDATES FOUND IN TRANSCRIPT: " + cands.length);
if (cands.length === 0) {
  console.log("No card rows in this scrollback. Copy the OLDER session's transcript (Sep 16-17).");
  process.exit(0);
}
cands.forEach((x, i) => console.log("  candidate " + (i + 1) + " — CHECK " + x.check + " — compare with your paper card corners"));

// ---- 2. pair every candidate, reconstruct pub IN MEMORY, name it ----
let kingPair = null;
const seen = {};
for (let i = 0; i < cands.length; i++) {
  for (let j = i + 1; j < cands.length; j++) {
    const s1 = cands[i].c.split("/"), s2 = cands[j].c.split("/");
    const xs = new Set([...s1, ...s2]);
    const label = "candidate " + (i + 1) + " + candidate " + (j + 1);
    if (xs.size !== 3) { console.log(label + ": " + xs.size + " distinct shares -> same-pile overlap or junk (no verdict)"); continue; }
    const key = Buffer.alloc(48); let ok = true;
    for (const h of xs) {
      const b = Buffer.from(h, "hex");
      if (b.length !== 48) ok = false;
      for (let k = 0; k < 48; k++) key[k] ^= b[k];
    }
    if (!ok) { console.log(label + ": bad share length -> no verdict"); continue; }
    let priv;
    try { priv = crypto.createPrivateKey({ key: key, format: "der", type: "pkcs8" }); }
    catch (e) { console.log(label + ": 3 shares but NOT a valid key -> cards from different piles mixed in transcript"); continue; }
    const pub = crypto.createPublicKey(priv).export({ type: "spki", format: "der" }).slice(-32).toString("hex");
    const who = KNOWN[pub] || "UNKNOWN KEY (not in any Sep 16 record)";
    const line = label + " -> pub " + pub + " = " + who;
    if (seen[pub]) { console.log(line + " (same pile as before)"); } else { console.log(line); seen[pub] = true; }
    if (pub === TARGET && !kingPair) kingPair = [cands[i], cands[j]];
  }
}

// ---- 3. grep for already-signed founding output (public-safe lines only) ----
const lines = txt.split("\n").map(l => l.trim());
const safe = lines.filter(l => /safe to paste|SIG [0-9a-f]{40,}|KING PUB|FOUNDING/i.test(l) && !/[0-9a-f]{96}\/[0-9a-f]{96}/.test(l.replace(/\s+/g, "")));
if (safe.length) {
  console.log("");
  console.log("ALREADY-SIGNED EVIDENCE in transcript (public-safe lines):");
  safe.slice(0, 12).forEach(l => console.log("  " + l.slice(0, 160)));
}

// ---- 4. write the king pair locally if present ----
console.log("");
if (kingPair) {
  fs.writeFileSync("pA.txt", kingPair[0].c + "\n");
  fs.writeFileSync("pC.txt", kingPair[1].c + "\n");
  console.log("TARGET PAIR FOUND -> wrote pA.txt + pC.txt locally (content never printed, stays on phone).");
  console.log("NEXT: node finish-ceremony.js > founding.txt 2>&1 ; clear ; cat founding.txt");
} else {
  console.log("No pair reconstructs the target pub " + TARGET.slice(0, 8) + "...");
  console.log("Read the pub verdicts above: they tell you which pile (if any) is in this transcript.");
  console.log("If the true king is a different pub, rerun: node scroll-solve.js " + file + " <that-pub>");
}
console.log("Reminder: everything printed is public-safe. Card content never leaves the phone.");

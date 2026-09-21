// HARZ CEREMONY — card-finder.js — WHICH SET ARE MY CARDS? (public-safe output)
//
// WHY: owner typed 3 cards, all CHECKs MATCH, but found-and-sign refuses.
// CHECKs prove typing exactness, not WHICH key the cards belong to. 15 cards
// exist (3 successor + 12 witness) and look identical. This script reads the
// typed card files, tries every pairing, reconstructs each pair's key IN MEMORY
// (never written to disk), derives the PUBLIC key, and names it.
//
// LAW: prints ONLY public data — derived pub + set name + pairing verdicts.
// Card content NEVER leaves the phone. No key material is ever printed.
//
// usage: node card-finder.js pA.txt pB.txt pC.txt   (2 or 3 files)

const crypto = require("crypto");
const fs = require("fs");

const KNOWN = {
  "7f970c910c75783d4b763028303bfc5eba9b8ca462fec92e3f357d7e57f5af0d": "FOUNDING KING — ink key #4 (successor)",
  "c2c6d6b9844e852fe14982c648ce14f5734079b47c0d6218e743eeb4a71c133d": "witness W1 cards",
  "54697e7fb8504d7166067584c9831bf85c7cad267615490ec26b76aabecff748": "witness W2 cards",
  "a1348ed909e774562054b69c0ffd63bb42d323077db2c550d09b3bad8a2669c3": "witness W3 cards",
};

function die(msg, code) { console.error(msg); process.exit(code || 3); }

const files = process.argv.slice(2);
if (files.length < 2) die("usage: node card-finder.js pA.txt pB.txt pC.txt  (at least TWO card files)", 1);

// ---- parse a typed card (same law as found-and-sign.js) ----
function parseCard(file) {
  let txt;
  try { txt = fs.readFileSync(file, "utf8"); }
  catch (e) { die("CARD FILE NOT FOUND: " + file + " — retype that card first (cat > " + file + " ... Enter, Ctrl-D).", 3); }
  const raw = txt.replace(/\s+/g, "").toLowerCase();
  if (!raw.includes("/")) die("CARD " + file + " INVALID: no slash found. Retype from the paper.", 3);
  const parts = raw.split("/");
  if (parts.length !== 2) die("CARD " + file + " INVALID: expected exactly 1 slash, found " + (parts.length - 1) + ". Retype.", 3);
  const [a, b] = parts;
  if (a.length !== 96 || b.length !== 96) die("CARD " + file + " INVALID: expected 96 chars per half, found " + a.length + " and " + b.length + ". Retype.", 3);
  if (!/^[0-9a-f]+$/.test(a) || !/^[0-9a-f]+$/.test(b)) die("CARD " + file + " INVALID: non-hex character. Retype.", 3);
  return [a, b];
}

const cards = {};
for (const f of files) cards[f] = parseCard(f);

// ---- try every pairing ----
let foundKing = null;
console.log("CARD-FINDER — public results only:");
for (let i = 0; i < files.length; i++) {
  for (let j = i + 1; j < files.length; j++) {
    const f1 = files[i], f2 = files[j];
    const xs = new Set();
    for (const s of [...cards[f1], ...cards[f2]]) xs.add(s);
    const label = f1 + " + " + f2;
    if (xs.size !== 3) {
      console.log(label + ": " + xs.size + " distinct shares -> DIFFERENT card sets (no key).");
      continue;
    }
    const key = Buffer.alloc(48);
    let ok = true;
    for (const h of xs) {
      const b = Buffer.from(h, "hex");
      if (b.length !== 48) ok = false;
      for (let k = 0; k < 48; k++) key[k] ^= b[k];
    }
    if (!ok) { console.log(label + ": bad share length -> no key."); continue; }
    let priv;
    try { priv = crypto.createPrivateKey({ key: key, format: "der", type: "pkcs8" }); }
    catch (e) { console.log(label + ": 3 shares but NOT a valid key -> mixed cards. Retype or change pairing."); continue; }
    const pub = crypto.createPublicKey(priv).export({ type: "spki", format: "der" }).slice(-32).toString("hex");
    const who = KNOWN[pub] || "UNKNOWN KEY (not successor, not W1-W3 — possible burn-era or stale card)";
    console.log(label + ": reconstructs pub " + pub);
    console.log("  -> " + who);
    if (pub === "7f970c910c75783d4b763028303bfc5eba9b8ca462fec92e3f357d7e57f5af0d") {
      foundKing = f1 + " " + f2;
      console.log("  >>> THIS IS THE FOUNDING PAIR. Run: node found-and-sign.js " + f1 + " " + f2);
    }
  }
}
console.log("");
if (foundKing) {
  console.log("VERDICT: the founding pair is in your hands. Run found-and-sign with the pair above and paste Magani the KING PUB + SIG lines.");
} else {
  console.log("VERDICT: NO pairing gives the founding king. None of these typed cards is a successor-set card.");
  console.log("Go back to the paper stack: the successor cards were the FIRST three you wrote yesterday morning (before the witness session).");
  console.log("Type any two of those into fresh files (cat > pX.txt), run card-finder on them to confirm, then found-and-sign.");
}
console.log("Reminder: card content never leaves the phone. Everything printed here is public-safe.");

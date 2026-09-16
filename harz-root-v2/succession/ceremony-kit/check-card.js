// HARZ CEREMONY v1.2: check-card.js — the local typo-catcher for hand-copied cards.
// Purpose: prove a paper card is byte-exact WITHOUT the card content ever leaving the
// phone. You type the card into a file (from PAPER only), give the CHECK value printed
// on the card, and this prints MATCH or MISMATCH. Typos stay local. Nothing is sent.
//
// usage: node check-card.js pA.txt <CHECK-8-hex-chars>
// (also accepts legacy JSON-chunk card files: it prints their sha8 so you can record one)

const crypto = require("crypto");
const fs = require("fs");

const args = process.argv.slice(2);
if (args.length < 1) { console.error("usage: node check-card.js pA.txt <CHECK-8-hex-chars>"); process.exit(1); }
const file = args[0];
const expected = (args[1] || "").trim().toLowerCase();
const txt = fs.readFileSync(file, "utf8");

function sha8(s) { return crypto.createHash("sha256").update(s, "utf8").digest("hex").slice(0, 8); }

if (txt.includes("{")) {
  // legacy JSON-chunk card: decode to share|share, print its sha8 (gen-key legacy mode printed no CHECK)
  const out = [];
  for (const line of txt.split("\n")) {
    const m = line.trim().match(/^\{.*\}$/);
    if (m) {
      try {
        const o = JSON.parse(m[0]);
        if (o.b === "harz-ceremony-key") {
          const b64 = o.d.replace(/-/g, "+").replace(/_/g, "/");
          out.push(Buffer.from(b64, "base64").toString("utf8"));
        }
      } catch (e) {}
    }
  }
  const joined = out.join("").split("|").filter(Boolean);
  if (joined.length !== 2) { console.error("LEGACY CARD INVALID — no valid ceremony-key chunk lines found."); process.exit(3); }
  const legacySha = sha8(joined[0] + "|" + joined[1]);
  console.log("LEGACY CARD sha8 (record it on the card): " + legacySha);
  if (expected) console.log(expected === legacySha ? "MATCH" : "MISMATCH");
  process.exit(expected && expected === legacySha ? 0 : 3);
}

// new plain-hex card format: x1hex/x2hex
const raw = txt.replace(/\s+/g, "").toLowerCase();
if (!raw.includes("/")) { console.error("NO SLASH FOUND — a hex card is 96 characters, a slash, 96 characters."); process.exit(3); }
const parts = raw.split("/");
if (parts.length !== 2) { console.error("FOUND " + (parts.length - 1) + " SLASHES — expected exactly 1. Retype the card."); process.exit(3); }
const [a, b] = parts;
let problems = [];
if (a.length !== b.length) problems.push("the two halves have different lengths (" + a.length + " vs " + b.length + ")");
if (a.length !== 96 || b.length !== 96) problems.push("expected 96 characters per half, found " + a.length + " and " + b.length);
for (const [name, s] of [["first half", a], ["second half", b]]) {
  for (let i = 0; i < s.length; i++) {
    if (!/[0-9a-f]/.test(s[i])) { problems.push(name + " character " + (i + 1) + " is '" + s[i] + "' — not hex (0-9 a f only)"); break; }
  }
}
if (problems.length) {
  console.error("CARD INVALID:");
  problems.forEach(p => console.error("  - " + p));
  console.error("Retype the card from the paper, carefully.");
  process.exit(3);
}
const got = sha8(a + "/" + b);
if (!expected) { console.log("sha8 of this card: " + got + "  (compare with the CHECK written on the card)"); process.exit(0); }
if (got === expected) {
  console.log("MATCH — card is byte-exact. The paper is real.");
  process.exit(0);
} else {
  console.error("MISMATCH — this typed version is not the card. sha8: " + got + " vs CHECK: " + expected);
  console.error("Every character matters. Retype from the paper, carefully.");
  process.exit(3);
}

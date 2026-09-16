// HARZ CEREMONY HELPER: derive-pub.js — recover the PUBLIC key from two paper cards.
// Purpose: if the gen-key screen output (PUB line) is lost, the PUB can be derived
// deterministically from any two of the three cards. Prints ONLY the public key —
// it NEVER prints, saves, or transmits private bytes. Node 1 local use, same split
// law as ceremony-kit v1.1 (key = x1 ^ x2 ^ x3 over the 2-of-3 paper split).
//
// usage: node derive-pub.js pA.txt pB.txt   (exactly two paper files, any two cards)
// Cross-check law: deriving from (A,B), (A,C) and (B,C) MUST print the identical PUB.
// If any pair differs → a card has a typo → do not proceed, re-copy that card.
//
// v1.2 Sep 16: accepts plain-hex cards (96hex/96hex) from gen-key --split-hex. Built
// after ceremony Session 1 burns #1-#3: pastes/screenshots exposed share lines. Hex
// cards + local check-card.js = card content never needs to leave the phone. Test keys only.

const crypto = require("crypto");
const fs = require("fs");

const files = process.argv.slice(2);
if (files.length !== 2) {
  console.error("usage: node derive-pub.js pA.txt pB.txt  (exactly TWO paper files)");
  process.exit(1);
}

const sharePairs = files.map(f => {
  const txt = fs.readFileSync(f, "utf8");
  if (txt.includes("{")) {
    // legacy JSON-chunk card format
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
    return out.join("").split("|").filter(Boolean);
  }
  // v1.2 plain-hex card format: x1hex/x2hex (whitespace ignored, case-insensitive)
  const raw = txt.replace(/\s+/g, "").toLowerCase();
  if (!/^[0-9a-f]+\/[0-9a-f]+$/.test(raw) || raw.split("/")[0].length !== raw.split("/")[1].length) {
    console.error("INVALID CARD in " + f + " — expected 96hex/96hex or JSON chunk lines. Check for typos (run check-card.js).");
    process.exit(3);
  }
  return raw.split("/");
});

const xs = new Set();
for (const p of sharePairs) for (const s of p) xs.add(s);
if (sharePairs.length !== 2 || xs.size !== 3) {
  console.error("INVALID PAIR — expected 3 distinct shares across the 2 papers. Check for typos.");
  process.exit(3);
}
const arr = [...xs];
for (const h of arr) if (!/^[0-9a-f]+$/i.test(h) || h.length % 2 !== 0) {
  console.error("INVALID SHARE — a card line has a typo. Re-copy the card.");
  process.exit(3);
}

const key = Buffer.alloc(arr[0].length / 2);
for (const h of arr) {
  const b = Buffer.from(h, "hex");
  for (let i = 0; i < key.length; i++) key[i] ^= b[i];
}

let priv, pub;
try {
  priv = crypto.createPrivateKey({ key: key, format: "der", type: "pkcs8" });
  pub = crypto.createPublicKey(priv).export({ type: "spki", format: "der" });
} catch (e) {
  console.error("KEY RECONSTRUCTION FAILED — cards do not reconstruct a valid key. Check for typos.");
  process.exit(3);
}
console.log("PUB (ed25519, for git/manifest): " + pub.slice(-32).toString("hex"));
console.log("(derived from " + files.join(" + ") + " — private bytes never displayed)");

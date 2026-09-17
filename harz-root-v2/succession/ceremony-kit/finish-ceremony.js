// HARZ CEREMONY — finish-ceremony.js — THE ONE-COMMAND FINISHER
//
// WHY: three cards typed, all CHECKs MATCH, but found-and-sign pA pB refuses.
// The refusal means pA+pB is not the successor PAIR — but another pairing might
// be (A+C, B+C). This script tries EVERY pairing of the typed cards
// automatically, signs the founding with whichever pair reconstructs the king,
// and if no pair works, prints a full public diagnosis so the next move is
// known in ONE round-trip.
//
// LAW (same as found-and-sign.js): card content NEVER leaves the phone; key
// assembled IN MEMORY only, NEVER written to disk; typed card files DELETED
// after signing; prints ONLY public data (pub, sig, manifest, verdicts).
//
// usage: node finish-ceremony.js        (reads pA.txt pB.txt pC.txt — whichever exist)

const crypto = require("crypto");
const fs = require("fs");

const KING_PUB = "7f970c910c75783d4b763028303bfc5eba9b8ca462fec92e3f357d7e57f5af0d"; // ink key #4 — FOUNDING KING
const OLD_KING = "c56e08bfbe74b1d431f05cf75b932773ed99e8b13dd4a4af7fe9f26cb9923f09";   // declared lost Sep 16
const WITNESSES = [
  "c2c6d6b9844e852fe14982c648ce14f5734079b47c0d6218e743eeb4a71c133d",
  "54697e7fb8504d7166067584c9831bf85c7cad267615490ec26b76aabecff748",
  "a1348ed909e774562054b69c0ffd63bb42d323077db2c550d09b3bad8a2669c3",
];
const DECLARED_AT = "2026-09-16";

const KNOWN = {
  [KING_PUB]: "FOUNDING KING — ink key #4 (successor)",
  "c2c6d6b9844e852fe14982c648ce14f5734079b47c0d6218e743eeb4a71c133d": "witness W1 cards",
  "54697e7fb8504d7166067584c9831bf85c7cad267615490ec26b76aabecff748": "witness W2 cards",
  "a1348ed909e774562054b69c0ffd63bb42d323077db2c550d09b3bad8a2669c3": "witness W3 cards",
};

function die(msg, code) { console.error(msg); console.error("Nothing signed. The ink remains the keystore."); process.exit(code || 3); }

// ---- parse a typed card (same law as found-and-sign.js) ----
function parseCard(file) {
  const txt = fs.readFileSync(file, "utf8");
  const raw = txt.replace(/\s+/g, "").toLowerCase();
  if (!raw.includes("/")) die("CARD " + file + " INVALID: no slash found. Retype from the paper.", 3);
  const parts = raw.split("/");
  if (parts.length !== 2) die("CARD " + file + " INVALID: expected exactly 1 slash, found " + (parts.length - 1) + ". Retype.", 3);
  const [a, b] = parts;
  if (a.length !== 96 || b.length !== 96) die("CARD " + file + " INVALID: expected 96 chars per half, found " + a.length + " and " + b.length + ". Retype.", 3);
  if (!/^[0-9a-f]+$/.test(a) || !/^[0-9a-f]+$/.test(b)) die("CARD " + file + " INVALID: non-hex character. Retype.", 3);
  return [a, b];
}

// ---- collect typed card files ----
const CANDIDATES = ["pA.txt", "pB.txt", "pC.txt"];
const FILES = CANDIDATES.filter(f => fs.existsSync(f));
if (FILES.length < 2) {
  console.error("FOUND: " + (FILES.length ? FILES.join(" ") : "no card files") + ". Need at least TWO of pA.txt, pB.txt, pC.txt.");
  die("Type the missing cards first: cat > pX.txt  (rows from paper, Enter after each row, last row Enter then Ctrl-D once).", 2);
}

const cards = {};
for (const f of FILES) cards[f] = parseCard(f);

// ---- try every pairing; sign with the first that reconstructs the king ----
function tryPair(f1, f2) {
  const xs = new Set();
  for (const s of [...cards[f1], ...cards[f2]]) xs.add(s);
  if (xs.size === 2) return { kind: "same" };
  if (xs.size !== 3) return { kind: "mixed", size: xs.size };
  const key = Buffer.alloc(48);
  for (const h of xs) {
    const b = Buffer.from(h, "hex");
    for (let i = 0; i < 48; i++) key[i] ^= b[i];
  }
  let priv;
  try { priv = crypto.createPrivateKey({ key: key, format: "der", type: "pkcs8" }); }
  catch (e) { return { kind: "invalid" }; }
  const pub = crypto.createPublicKey(priv).export({ type: "spki", format: "der" }).slice(-32).toString("hex");
  return { kind: "key", pub, priv };
}

let signed = false;
const findings = [];
for (let i = 0; i < FILES.length && !signed; i++) {
  for (let j = i + 1; j < FILES.length && !signed; j++) {
    const f1 = FILES[i], f2 = FILES[j];
    const r = tryPair(f1, f2);
    const label = f1 + " + " + f2;
    if (r.kind === "same") { findings.push(label + ": SAME card typed twice (only 2 distinct shares)."); continue; }
    if (r.kind === "mixed") { findings.push(label + ": " + r.size + " distinct shares -> DIFFERENT card sets (no key)."); continue; }
    if (r.kind === "invalid") { findings.push(label + ": 3 shares but NOT a valid key -> mixed cards."); continue; }
    // r.kind === "key"
    if (r.pub !== KING_PUB) {
      findings.push(label + ": reconstructs pub " + r.pub + " -> " + (KNOWN[r.pub] || "UNKNOWN KEY (not successor, not W1-W3)"));
      continue;
    }
    // ---- THE FOUNDING PAIR: sign (manifest bytes identical to found-and-sign.js) ----
    const manifest = {
      act: "FOUNDING_ACT",
      chain: "harz-root-v2",
      declared_at: DECLARED_AT,
      height: 1,
      king_pub: KING_PUB,
      policy: "2-of-3",
      witnesses: WITNESSES.slice().sort(),
      predecessor: {
        king_pub: OLD_KING,
        status: "declared-lost-by-owner",
        live_root_v1: "frozen-serving",
      },
    };
    function canon(o) {
      if (Array.isArray(o)) return "[" + o.map(canon).join(",") + "]";
      if (o !== null && typeof o === "object") {
        return "{" + Object.keys(o).sort().map(k => JSON.stringify(k) + ":" + canon(o[k])).join(",") + "}";
      }
      return JSON.stringify(o);
    }
    const canonical = canon(manifest);
    const sig = crypto.sign(null, Buffer.from(canonical, "utf8"), r.priv).toString("hex");
    const spki = Buffer.concat([Buffer.from("302a300506032b6570032100", "hex"), Buffer.from(KING_PUB, "hex")]);
    const vpub = crypto.createPublicKey({ key: spki, format: "der", type: "spki" });
    if (!crypto.verify(null, Buffer.from(canonical, "utf8"), vpub, Buffer.from(sig, "hex"))) die("SELF-VERIFY FAILED — do not trust this output. Tell Magani.", 3);
    // cleanup: ALL typed card files leave the phone
    let cleaned = 0;
    for (const f of FILES) { try { fs.unlinkSync(f); cleaned++; } catch (e) {} }
    console.log(">>> FOUNDING SIGNED — THE FRESH KING IS NAMED. Chain: harz-root-v2, height 1.");
    console.log("(signed with pair " + f1 + " + " + f2 + ")");
    console.log("KING PUB (public, safe): " + KING_PUB);
    console.log("");
    console.log("FOUNDING MANIFEST (public):");
    console.log(canonical);
    console.log("");
    console.log(">>> SIG (public — safe to paste to Magani):");
    console.log(sig);
    console.log("");
    console.log("SELF-VERIFIED: signature checks against the king pub above.");
    console.log("Cleanup: " + cleaned + " card file(s) deleted. The ink on your paper cards remains the ONLY keystore.");
    signed = true;
  }
}

if (!signed) {
  console.log("CARD RESULTS — public data only:");
  for (const f of findings) console.log(f);
  console.log("");
  console.log("VERDICT: no pairing of these typed cards reconstructs the founding king.");
  console.log("The successor cards are a DIFFERENT pile: the first three you wrote yesterday morning, before the witness session.");
  console.log("Type any two of THOSE from paper (cat > pA.txt, rows, Enter after each, last row Enter + Ctrl-D once), then run: node finish-ceremony.js");
  console.log("The lines above tell Magani which pile you typed this round — paste them, they are public-safe.");
}

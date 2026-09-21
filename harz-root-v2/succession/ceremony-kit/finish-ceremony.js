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
// usage: node finish-ceremony.js        (expects king-pub.txt + at least TWO of pA.txt pB.txt pC.txt)
//
// v3 — NO-CHAT CEREMONY (after burn #4): the expected king pub is read from
// king-pub.txt, which the owner pastes from the gen-key screen (PUBLIC data).
// The whole founding now completes in ONE phone session with ZERO chat during
// the key window. The script REFUSES, structurally and forever: the burned key
// 21a268f4 (burn #4), retired candidate 7f970c91, any witness key, the old king.

const crypto = require("crypto");
const fs = require("fs");

const OLD_KING = "c56e08bfbe74b1d431f05cf75b932773ed99e8b13dd4a4af7fe9f26cb9923f09";   // Sep 14 king: resurrection law CANCELLED Sep 20 (ab560506); private still unfound
const REFUSE = {
  "21a268f4ca06f936147a2060a6a0bff04fbd8bd8c244ea5152185864604eb035": "BURNED key #4 (Sep 20) — share lines reached a chat. Void forever, no exceptions.",
  "7f970c910c75783d4b763028303bfc5eba9b8ca462fec92e3f357d7e57f5af0d": "RETIRED candidate #4 — cards unfound. Never name it in a manifest.",
};
const WITNESSES = [
  "c2c6d6b9844e852fe14982c648ce14f5734079b47c0d6218e743eeb4a71c133d",
  "54697e7fb8504d7166067584c9831bf85c7cad267615490ec26b76aabecff748",
  "a1348ed909e774562054b69c0ffd63bb42d323077db2c550d09b3bad8a2669c3",
];
const DECLARED_AT = "2026-09-20"; // founding act signed Sep 20 with re-forged key #5

function die(msg, code) { console.error(msg); console.error("Nothing signed. The ink remains the keystore."); process.exit(code || 3); }

// ---- the expected founding king pub: read from king-pub.txt (PUBLIC data only) ----
let KING_PUB = "";
try { KING_PUB = fs.readFileSync("king-pub.txt", "utf8").trim().toLowerCase(); }
catch (e) { die("king-pub.txt MISSING — save the PUB line from gen-key first: cat > king-pub.txt, long-press select ONLY the 64-char PUB value, PASTE, Enter, Ctrl-D once."); }
if (!/^[0-9a-f]{64}$/.test(KING_PUB)) die("king-pub.txt is not a clean 64-hex PUB value — redo it (paste ONLY the PUB value, nothing else).");
if (REFUSE[KING_PUB]) die("REFUSED: " + REFUSE[KING_PUB] + " Generate a FRESH key (gen-key) — this pub can never be crowned.");
if (KING_PUB === OLD_KING || WITNESSES.includes(KING_PUB)) die("REFUSED: this pub is the old king or a witness key, not a fresh founding king. Generate a FRESH key (gen-key).");
console.log("KING TO CROWN (from king-pub.txt): " + KING_PUB);

const KNOWN = {
  [KING_PUB]: "FOUNDING KING — fresh generation (this ceremony)",
  "21a268f4ca06f936147a2060a6a0bff04fbd8bd8c244ea5152185864604eb035": "BURNED key #4 — void forever",
  "7f970c910c75783d4b763028303bfc5eba9b8ca462fec92e3f357d7e57f5af0d": "retired candidate #4",
  "c2c6d6b9844e852fe14982c648ce14f5734079b47c0d6218e743eeb4a71c133d": "witness W1 cards",
  "54697e7fb8504d7166067584c9831bf85c7cad267615490ec26b76aabecff748": "witness W2 cards",
  "a1348ed909e774562054b69c0ffd63bb42d323077db2c550d09b3bad8a2669c3": "witness W3 cards",
};

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
        status: "declared-lost Sep 16; resurrection law cancelled by owner Sep 20; private still unfound",
        live_root_v1: "frozen-serving",
      },
      king_note: "founding key generated fresh on Node 1; ceremony completed in one no-chat session after burn #4",
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
    try { fs.unlinkSync("king-pub.txt"); cleaned++; } catch (e) {}
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
  console.log("VERDICT: no pairing of these card files reconstructs the king named in king-pub.txt.");
  console.log("Most likely a copy/paste slip: re-copy the flagged card from the gen-key screen (long-press, select ONLY the 193 characters, paste into cat > pX.txt again).");
  console.log("Check each card first: node check-card.js pX.txt <CHECK-from-screen> — must say MATCH.");
  console.log("The lines above are public-safe — paste them to Nuruddeen if you get stuck.");
}

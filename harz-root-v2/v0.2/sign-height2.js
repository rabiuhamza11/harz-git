// HARZ ROOT v0.2 — sign-height2.js — ROTATION CEREMONY COORDINATOR v1.0
// Runs ON NODE 1 ONLY (Termux). Four sequential key windows, one sitting:
//   node sign-height2.js king        (type 2 king cards -> signs manifest + act bodies)
//   node sign-height2.js witness     (type 2 witness cards -> co-signs the king-signed act)  [x2, different seats]
//   node sign-height2.js successor   (type 2 successor cards -> assembles + signs height 2, verifies, prints)
//   node sign-height2.js verify h2-signed.json   (public check, anyone, anywhere)
//   node sign-height2.js self-test   (software rehearsal: TEST keys in-memory, proves the flow)
//
// LAW: card content never leaves the phone. Typed card files are PRIVATE KEY MATERIAL;
// after EVERY step: rm pA.txt pB.txt pC.txt  (the coordinator prints the reminder).
// Only PUBs and signatures are printed — all public data. Fail-closed at every gate.
// The coordinator verifies its own output with rotation-law-v11 BEFORE printing:
// a height 2 that fails the law is NEVER signed-off as done.

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const Law = require(path.join(__dirname, "rotation-law-v11.js"));

// ---- THE PINNED REAL WORLD (public data) ----
const PIN = {
  king: "90062faa4947be141d5e18987aea5d14dd1c570329b57b0c50a3f6cddfc54c0f",
  h1_digest: "cac16833f4d43fb59115786aebb2619f471e1bc353734ffdad6a757f90928fcb",
  witnesses: [
    "54697e7fb8504d7166067584c9831bf85c7cad267615490ec26b76aabecff748", // W2
    "a1348ed909e774562054b69c0ffd63bb42d323077db2c550d09b3bad8a2669c3", // W3
    "c2c6d6b9844e852fe14982c648ce14f5734079b47c0d6218e743eeb4a71c133d", // W1
  ],
  policy: 2,
};
const REFUSE = {
  "21a268f4ca06f936147a2060a6a0bff04fbd8bd8c244ea5152185864604eb035": "BURNED king #5 — void forever",
  "7f970c910c75783d4b763028303bfc5eba9b8ca462fec92e3f357d7e57f5af0d": "RETIRED candidate #4 — archive only, never manifest",
  "c56e08bfbe74b1d431f05cf75b932773ed99e8b13dd4a4af7fe9f26cb9923f09": "old v1 king — law-cancelled, not a v2 authority",
};
const INPUT = path.join(__dirname, "h2-input.json");    // prepared by Nuruddeen at ceremony time (public)
const STATE = path.join(__dirname, "h2-state.json");    // collected signatures (public data)

function die(msg, code) { console.error(msg); console.error("Nothing signed. Wipe: rm -f pA.txt pB.txt pC.txt"); process.exit(code || 3); }
const rmCards = () => ["pA.txt", "pB.txt", "pC.txt"].forEach(f => { try { fs.unlinkSync(f); } catch (e) {} });

// ---- card parsing + key reconstruction (same law as finish-ceremony.js, practiced Sep 20) ----
function parseCard(file) {
  const txt = fs.readFileSync(file, "utf8");
  const raw = txt.replace(/\s+/g, "").toLowerCase();
  if (!raw.includes("/")) die("CARD " + file + " INVALID: no slash. Retype from paper.");
  const parts = raw.split("/");
  if (parts.length !== 2) die("CARD " + file + " INVALID: expected exactly 1 slash.");
  const [a, b] = parts;
  if (a.length !== 96 || b.length !== 96) die("CARD " + file + " INVALID: 96 chars per half, found " + a.length + "/" + b.length + ". Retype.");
  if (!/^[0-9a-f]+$/.test(a) || !/^[0-9a-f]+$/.test(b)) die("CARD " + file + " INVALID: non-hex. Retype.");
  return [a, b];
}
function reconstruct() {
  const files = ["pA.txt", "pB.txt", "pC.txt"].filter(f => fs.existsSync(f));
  if (files.length < 2) die("Need at least TWO of pA.txt pB.txt pC.txt. Type first: cat > pX.txt (rows from paper, Enter per row, Ctrl-D once).", 2);
  const cards = {}; for (const f of files) cards[f] = parseCard(f);
  const found = [];
  for (let i = 0; i < files.length; i++) for (let j = i + 1; j < files.length; j++) {
    const xs = new Set(); for (const s of [...cards[files[i]], ...cards[files[j]]]) xs.add(s);
    if (xs.size !== 3) { found.push(files[i] + "+" + files[j] + ": not 3 distinct shares"); continue; }
    const key = Buffer.alloc(48);
    for (const h of xs) { const b = Buffer.from(h, "hex"); for (let k = 0; k < 48; k++) key[k] ^= b[k]; }
    try {
      const priv = crypto.createPrivateKey({ key: key, format: "der", type: "pkcs8" });
      const pub = crypto.createPublicKey(priv).export({ type: "spki", format: "der" }).slice(-32).toString("hex");
      found.push(files[i] + "+" + files[j] + " -> " + pub.slice(0, 12) + "…");
      if (pub === PIN.king || PIN.witnesses.includes(pub)) return { priv, pub };
    } catch (e) { found.push(files[i] + "+" + files[j] + ": invalid key"); }
  }
  die("No expected key reconstructed. Findings: " + found.join(" | "));
}
function gateKey(pub, expectPub, step) {
  if (REFUSE[pub]) die("REFUSED: " + REFUSE[pub] + " (at " + step + ")");
  if (pub !== expectPub) die("REFUSED: reconstructed pub " + pub.slice(0, 12) + "… is NOT the " + step + " key. Wrong cards typed.");
}

// ---- step: KING ----
function stepKing() {
  const input = readInput();
  const k = reconstruct();
  gateKey(k.pub, PIN.king, "king 90062faa");
  const manifest = Law.buildManifest(PIN.king, input.successor_pub, PIN.witnesses, PIN.policy, 2, PIN.h1_digest);
  const act = Law.buildActPlanned(input.successor_pub, 2, PIN.h1_digest);
  const state = { step: "king", manifest, act,
                  manifest_sig: Law.sign(k.priv, Law.manifestBody(manifest)),
                  act_sig: Law.sign(k.priv, Law.actBody(act)),
                  witness_sigs: [], declared_at: new Date().toISOString() };
  fs.writeFileSync(STATE, JSON.stringify(state, null, 1));
  console.log("KING SIGNED: manifest sig " + state.manifest_sig.slice(0, 16) + "…, act sig " + state.act_sig.slice(0, 16) + "…");
  console.log("NEXT: TWO witness seats. rm pA.txt pB.txt pC.txt FIRST, then type the next seat's two cards, run: node sign-height2.js witness");
  rmCards();
}
// ---- step: WITNESS ----
function stepWitness() {
  const state = readState(); if (state.step !== "king" && state.step !== "witness") die("Run the king step first.");
  const w = reconstruct();
  if (!PIN.witnesses.includes(w.pub)) die("REFUSED: reconstructed pub " + w.pub.slice(0, 12) + "… is not a witness seat (W1/W2/W3).");
  if (state.witness_sigs.some(s => s.by === w.pub)) die("This seat already co-signed. Type a DIFFERENT seat's cards.");
  const payload = Law.witnessPayload({ ...state.act, sig: state.act_sig });
  state.witness_sigs.push({ by: w.pub, sig: Law.sign(w.priv, payload) });
  state.step = "witness";
  fs.writeFileSync(STATE, JSON.stringify(state, null, 1));
  const seats = new Set(state.witness_sigs.map(s => s.by)).size;
  console.log("WITNESS " + w.pub.slice(0, 12) + "… CO-SIGNED. Quorum: " + seats + "/" + PIN.policy + " of 3 seats.");
  if (seats < PIN.policy) console.log("NEXT: rm pA.txt pB.txt pC.txt, type the NEXT seat's two cards, run: node sign-height2.js witness");
  else console.log("QUORUM MET. NEXT: rm pA.txt pB.txt pC.txt, then the SUCCESSOR step: node sign-height2.js successor");
  rmCards();
}
// ---- step: SUCCESSOR (assembles + signs + self-verifies) ----
function stepSuccessor() {
  const state = readState(); const input = readInput();
  const seats = new Set((state.witness_sigs || []).map(s => s.by)).size;
  if (state.step !== "witness" || seats < PIN.policy) die("Quorum not met (" + seats + "/" + PIN.policy + "). Finish the witness steps.");
  const s = reconstruct();
  gateKey(s.pub, input.successor_pub, "successor (fresh key of this ceremony)");
  const manifest = { ...state.manifest, sig: state.manifest_sig };
  const act = { ...state.act, sig: state.act_sig, witness_sigs: state.witness_sigs };
  const z = { v: 2, zone: "harz", height: 2, prev: PIN.h1_digest,
              records: [manifest, act, ...input.h1_records],
              signed_by: "ed25519:" + s.pub, signed_at: state.declared_at };
  const zc = { ...z };
  z.sig = Law.sign(s.priv, zc);
  // SELF-VERIFY with the law before printing — no signature without a passing check
  const verdict = Law.validateRotation(z, { anchorPubHex: PIN.king, h1DigestHex: PIN.h1_digest,
                                            h1Names: input.h1_records.map(r => r.name),
                                            witnessPubs: PIN.witnesses, policy: PIN.policy });
  if (!verdict.ok) die("SELF-VERIFY REFUSED THE ASSEMBLED HEIGHT 2: " + verdict.reason + " — nothing printed, nothing deployed.");
  fs.writeFileSync(path.join(__dirname, "h2-signed.json"), JSON.stringify(z));
  fs.writeFileSync(path.join(__dirname, "h2-verdict.json"), JSON.stringify(verdict));
  try { fs.unlinkSync(STATE); fs.unlinkSync(INPUT); } catch (e) {}
  console.log("HEIGHT-2 SIGNED + LAW-VERIFIED ✓");
  console.log("authority: " + s.pub.slice(0, 12) + "… | witnesses: " + verdict.witnesses + "/3 | names: " + verdict.names + " | prev: cac16833…");
  console.log("PUBLIC OUTPUT: h2-signed.json (safe to paste to Nuruddeen in full — signatures and pubs only, no key material).");
  console.log("FINAL WIPE: rm -f pA.txt pB.txt pC.txt h2-state.json   then verify the wipe: ls");
  rmCards();
}
// ---- public verify ----
function stepVerify(file) {
  if (!file || !fs.existsSync(file)) die("usage: node sign-height2.js verify h2-signed.json");
  const z = JSON.parse(fs.readFileSync(file, "utf8"));
  const input = readInput(true);
  const verdict = Law.validateRotation(z, { anchorPubHex: PIN.king, h1DigestHex: PIN.h1_digest,
                                            h1Names: input.h1_records.map(r => r.name),
                                            witnessPubs: PIN.witnesses, policy: PIN.policy });
  console.log(JSON.stringify(verdict));
  process.exit(verdict.ok ? 0 : 1);
}
function readInput(optional) {
  try { return JSON.parse(fs.readFileSync(INPUT, "utf8")); }
  catch (e) { if (optional) die("h2-input.json missing (needed for verify too — it carries the height-1 records)."); die("h2-input.json MISSING — Nuruddeen prepares it at ceremony time (public data: successor PUB + the 77 live records)."); }
}
function readState() {
  try { return JSON.parse(fs.readFileSync(STATE, "utf8")); }
  catch (e) { die("h2-state.json missing — run the steps in order: king -> witness x2 -> successor."); }
}

// ---- SELF-TEST: software rehearsal with TEST keys, in-memory only ----
function selfTest() {
  const gen = () => { const { privateKey } = crypto.generateKeyPairSync("ed25519");
    const spki = crypto.createPublicKey(privateKey).export({ format: "der", type: "spki" });
    return { privateKey, hex: spki.subarray(spki.length - 32).toString("hex") }; };
  const K = gen(), S7 = gen(), Wa = gen(), Wb = gen();
  const h1Records = [{ name: "pay.harz", endpoints: { https: "https://harzpay.harz.workers.dev" } },
                     { name: "root.harz", endpoints: { https: "https://harz-root.harz.workers.dev" } }];
  // drive the exact assembly the real steps perform, with the real law, TEST world
  const manifest = Law.buildManifest(K.hex, S7.hex, [Wa.hex, Wb.hex], 2, 2, PIN.h1_digest);
  const act = Law.buildActPlanned(S7.hex, 2, PIN.h1_digest);
  const st = { manifest, act, manifest_sig: Law.sign(K.privateKey, Law.manifestBody(manifest)),
               act_sig: Law.sign(K.privateKey, Law.actBody(act)), witness_sigs: [] };
  st.witness_sigs.push({ by: Wa.hex, sig: Law.sign(Wa.privateKey, Law.witnessPayload({ ...st.act, sig: st.act_sig })) });
  st.witness_sigs.push({ by: Wb.hex, sig: Law.sign(Wb.privateKey, Law.witnessPayload({ ...st.act, sig: st.act_sig })) });
  const z = { v: 2, zone: "harz", height: 2, prev: PIN.h1_digest,
              records: [{ ...st.manifest, sig: st.manifest_sig }, { ...st.act, sig: st.act_sig, witness_sigs: st.witness_sigs }, ...h1Records],
              signed_by: "ed25519:" + S7.hex, signed_at: "2026-09-21T00:00:00Z" };
  z.sig = Law.sign(S7.privateKey, { ...z });
  const v = Law.validateRotation(z, { anchorPubHex: K.hex, h1DigestHex: PIN.h1_digest,
                                     h1Names: h1Records.map(r => r.name), witnessPubs: [Wa.hex, Wb.hex], policy: 2 });
  console.log("SELF-TEST (TEST keys, in-memory): " + (v.ok ? "PASS — assembled H2 passes the law" : "FAIL — " + v.reason));
  process.exit(v.ok ? 0 : 1);
}

const cmd = process.argv[2];
if (cmd === "king") stepKing();
else if (cmd === "witness") stepWitness();
else if (cmd === "successor") stepSuccessor();
else if (cmd === "verify") stepVerify(process.argv[3]);
else if (cmd === "self-test") selfTest();
else {
  console.error("HARZ ROOT v0.2 rotation coordinator. Commands: king | witness | successor | verify <file> | self-test");
  console.error("Order is law: king -> witness (x2 seats) -> successor. Wipe cards after every step.");
  process.exit(2);
}

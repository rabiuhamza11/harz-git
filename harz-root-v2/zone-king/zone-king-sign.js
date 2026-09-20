// HARZ ZONE v2 KING'S PEN — zone-king-sign.js
//
// THE RUNG: the founding king (90062faa) signs the FIRST zone of chain harz-root-v2.
// Same law as finish-ceremony.js: card content NEVER leaves the phone; key assembled
// IN MEMORY only, NEVER written to disk; typed card files DELETED after signing;
// prints ONLY public data (pub, sig, digest, counts, verdicts).
//
// INPUT:  records-v2-77.json  (the frozen 77-name record set — public, shipped in HarzGit)
//         + at least TWO of pA.txt / pB.txt / pC.txt (typed from the king's ink cards)
// OUTPUT: SIGNED-ZONE-V2.json (fully public artifact) + public paste lines for Magani
//
// REFUSES, structurally and forever: burned 21a268f4, retired 7f970c91, old king
// c56e08bf, any witness key, any key that is not the founding king 90062faa.
// Fail-closed: nothing signs unless every check passes.

const crypto = require("crypto");
const fs = require("fs");

const KING_PUB = "90062faa4947be141d5e18987aea5d14dd1c570329b57b0c50a3f6cddfc54c0f"; // founding king, HarzGit FOUNDING-RECORD.md
const REFUSE = {
  "21a268f4ca06f936147a2060a6a0bff04fbd8bd8c244ea5152185864604eb035": "BURNED key #4 (Sep 20) — void forever, no exceptions.",
  "7f970c910c75783d4b763028303bfc5eba9b8ca462fec92e3f357d7e57f5af0d": "RETIRED candidate #4 — never name it in a manifest.",
  "c56e08bfbe74b1d431f05cf75b932773ed99e8b13dd4a4af7fe9f26cb9923f09": "OLD KING (declared lost; resurrection law cancelled) — never signs again.",
};
const WITNESSES = [
  "c2c6d6b9844e852fe14982c648ce14f5734079b47c0d6218e743eeb4a71c133d",
  "54697e7fb8504d7166067584c9831bf85c7cad267615490ec26b76aabecff748",
  "a1348ed909e774562054b69c0ffd63bb42d323077db2c550d09b3bad8a2669c3",
];

// ---------- canonical serialization (frozen law — identical to zone-v2.js) ----------
function canonicalize(obj) {
  if (obj === null || typeof obj !== "object") return JSON.stringify(obj);
  if (Array.isArray(obj)) return "[" + obj.map(canonicalize).join(",") + "]";
  const keys = Object.keys(obj).sort();
  return "{" + keys.map(k => JSON.stringify(k) + ":" + canonicalize(obj[k])).join(",") + "}";
}
function canonicalBytes(obj) { return Buffer.from(canonicalize(obj), "utf8"); }

// ---------- strict record validation (frozen law — identical to zone-v2.js) ----------
const ENDPOINT_KEYS = new Set(["https", "harz-native", "mesh", "dial", "local"]);
const NAME_RE = /^[a-z0-9-]+(\.[a-z0-9-]+)*\.harz$/;
const ID_RE = /^ed25519:[0-9a-f]{64}$/;
function validateRecord(r) {
  if (typeof r !== "object" || r === null) return "not an object";
  const allowed = new Set(["v", "name", "service", "identity", "state", "endpoints", "routing", "policy"]);
  for (const k of Object.keys(r)) if (!allowed.has(k)) return `unknown field ${k}`;
  for (const k of allowed) if (!(k in r)) return `missing field ${k}`;
  if (r.v !== 2) return "v must be 2";
  if (!NAME_RE.test(r.name)) return `bad name ${r.name}`;
  if (typeof r.service !== "string" || !r.service) return "bad service";
  if (r.identity !== "PENDING" && !ID_RE.test(r.identity)) return "bad identity";
  const st = r.state;
  if (typeof st !== "object" || !Number.isInteger(st.height) || st.height < 0 ||
      typeof st.digest !== "string" || !/^[0-9a-f]{0,64}$/.test(st.digest)) return "bad state";
  if (st.height === 0 && st.digest !== "") return "height 0 requires empty digest";
  const ep = r.endpoints;
  if (typeof ep !== "object" || ep === null) return "bad endpoints";
  for (const k of Object.keys(ep)) {
    if (!ENDPOINT_KEYS.has(k)) return `unknown endpoint ${k}`;
    if (typeof ep[k] !== "string" || !ep[k]) return `empty endpoint ${k}`;
  }
  const rt = r.routing;
  if (typeof rt !== "object" || !Array.isArray(rt.nodes)) return "bad routing";
  for (const n of rt.nodes) if (typeof n !== "string" || !n) return "bad node id";
  const sorted = [...rt.nodes].sort();
  if (JSON.stringify(sorted) !== JSON.stringify(rt.nodes)) return "routing.nodes not sorted";
  for (const k of Object.keys(r.policy)) if (k !== "trust") return `unknown policy ${k}`;
  return null;
}

// ---------- card law (identical to finish-ceremony.js) ----------
function parseCard(file) {
  const txt = fs.readFileSync(file, "utf8");
  const raw = txt.replace(/\s+/g, "").toLowerCase();
  if (!raw.includes("/")) throw new Error("CARD " + file + " INVALID: no slash. Retype from the paper.");
  const parts = raw.split("/");
  if (parts.length !== 2) throw new Error("CARD " + file + " INVALID: expected exactly 1 slash. Retype.");
  const [a, b] = parts;
  if (a.length !== 96 || b.length !== 96) throw new Error("CARD " + file + " INVALID: expected 96 chars per half. Retype.");
  if (!/^[0-9a-f]+$/.test(a) || !/^[0-9a-f]+$/.test(b)) throw new Error("CARD " + file + " INVALID: non-hex character. Retype.");
  return [a, b];
}
function pairKey(cards, f1, f2) {
  const xs = new Set();
  for (const s of [...cards[f1], ...cards[f2]]) xs.add(s);
  if (xs.size !== 3) return null;
  const key = Buffer.alloc(48);
  for (const h of xs) {
    const b = Buffer.from(h, "hex");
    for (let i = 0; i < 48; i++) key[i] ^= b[i];
  }
  try { return crypto.createPrivateKey({ key: key, format: "der", type: "pkcs8" }); }
  catch (e) { return null; }
}
function pubOf(priv) {
  return crypto.createPublicKey(priv).export({ type: "spki", format: "der" }).slice(-32).toString("hex");
}

// ---------- zone assembly + sign ----------
function buildAndSign(records, priv, expectedPub, signedAt) {
  const ordered = [...records].sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
  const zone = { v: 2, zone: "harz", height: 1, prev: null, records: ordered, signed_at: signedAt, signed_by: "ed25519:" + expectedPub };
  const sig = crypto.sign(null, canonicalBytes(zone), priv);
  const z = { ...zone, sig: "ed25519:" + Buffer.from(sig).toString("hex") };
  // self-verify with the pub (never the priv) — fail-closed
  const spki = Buffer.concat([Buffer.from("302a300506032b6570032100", "hex"), Buffer.from(expectedPub, "hex")]);
  const vpub = crypto.createPublicKey({ key: spki, format: "der", type: "spki" });
  const { sig: _s, ...unsigned } = z;
  if (!crypto.verify(null, canonicalBytes(unsigned), vpub, sig)) throw new Error("SELF-VERIFY FAILED — do not trust this output. Tell Magani.");
  return z;
}

// ---------- battery exports (TEST paths only — production CLI below bakes the real king) ----------
module.exports = { canonicalize, canonicalBytes, validateRecord, parseCard, pairKey, pubOf, buildAndSign, KING_PUB, REFUSE, WITNESSES };

// ---------- CLI (runs only when invoked directly) ----------
if (require.main === module) {
  function die(msg, code) { console.error(msg); console.error("Nothing signed. The ink remains the keystore."); process.exit(code || 3); }

  // 1. load + validate the frozen record set (strict, fail-closed)
  if (!fs.existsSync("records-v2-77.json")) die("records-v2-77.json MISSING — curl it from HarzGit first (see runbook).", 2);
  let records;
  try { records = JSON.parse(fs.readFileSync("records-v2-77.json", "utf8")); }
  catch (e) { die("records-v2-77.json is not valid JSON — re-curl it. " + e.message, 2); }
  if (!Array.isArray(records) || records.length !== 77) die("record set must be exactly 77 records, found " + (Array.isArray(records) ? records.length : "not an array") + ". Re-curl.", 2);
  let prev = "";
  for (const r of records) {
    const err = validateRecord(r);
    if (err) die("RECORD REFUSED: " + (r && r.name ? r.name : "?") + ": " + err + " — re-curl records-v2-77.json.", 2);
    if (r.name <= prev) die("records not sorted at " + r.name + " — re-curl records-v2-77.json.", 2);
    prev = r.name;
  }
  console.log("RECORD SET: 77 records validated strict — names, endpoints, states all lawful.");

  // 2. cards
  const FILES = ["pA.txt", "pB.txt", "pC.txt"].filter(f => fs.existsSync(f));
  if (FILES.length < 2) die("Need at least TWO of pA.txt, pB.txt, pC.txt. Type them first: cat > pX.txt (rows from paper, Enter after each row, last row Enter then Ctrl-D once).", 2);
  const cards = {};
  try { for (const f of FILES) cards[f] = parseCard(f); }
  catch (e) { die(e.message, 3); }

  // 3. try every pairing — sign only with THE king
  let signed = false;
  const findings = [];
  for (let i = 0; i < FILES.length && !signed; i++) {
    for (let j = i + 1; j < FILES.length && !signed; j++) {
      const priv = pairKey(cards, FILES[i], FILES[j]);
      const label = FILES[i] + " + " + FILES[j];
      if (!priv) { findings.push(label + ": does not reconstruct a key (check for duplicate/mixed cards)."); continue; }
      const pub = pubOf(priv);
      if (REFUSE[pub]) { findings.push(label + ": REFUSED — " + REFUSE[pub]); continue; }
      if (WITNESSES.includes(pub)) { findings.push(label + ": REFUSED — this is a WITNESS key, not the king."); continue; }
      if (pub !== KING_PUB) { findings.push(label + ": reconstructs a key that is NOT the founding king (" + pub.slice(0, 8) + "). Wrong card pile?"); continue; }

      // THE KING — sign the first zone of harz-root-v2
      const signedAt = new Date().toISOString().replace(/\.\d+Z$/, "Z");
      let zone;
      try { zone = buildAndSign(records, priv, KING_PUB, signedAt); }
      catch (e) { die(e.message, 3); }

      // 4. cleanup: card files leave the phone
      let cleaned = 0;
      for (const f of FILES) { try { fs.unlinkSync(f); cleaned++; } catch (e) {} }
      fs.writeFileSync("SIGNED-ZONE-V2.json", JSON.stringify(zone, null, 1));

      const digest = crypto.createHash("sha256").update(canonicalBytes({ ...zone, sig: undefined })).digest("hex");
      console.log("");
      console.log(">>> ZONE v2 SIGNED — the founding king names the first zone of harz-root-v2.");
      console.log("(signed with pair " + FILES[i] + " + " + FILES[j] + ")");
      console.log("KING PUB (public): " + KING_PUB);
      console.log("ZONE: harz | height 1 | records 77 | signed_at " + signedAt);
      console.log("ZONE DIGEST (sha256 of unsigned canonical bytes): " + digest);
      console.log(">>> SIG (public — safe to paste to Magani):");
      console.log("ed25519:" + zone.sig.replace("ed25519:", ""));
      console.log("");
      console.log("SELF-VERIFIED: signature checks against the king pub. Artifact saved: SIGNED-ZONE-V2.json (public).");
      console.log("Cleanup: " + cleaned + " card file(s) deleted. The ink remains the ONLY keystore.");
      signed = true;
    }
  }
  if (!signed) {
    console.log("CARD RESULTS — public data only:");
    for (const f of findings) console.log(f);
    die("No pairing of these card files reconstructs the founding king 90062faa. Lines above are public-safe — paste them to Magani if stuck.", 4);
  }
}

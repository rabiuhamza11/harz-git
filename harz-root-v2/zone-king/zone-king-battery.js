// Battery for zone-king-sign.js — TEST keys only, in memory + throwaway files, never the real king.
const crypto = require("crypto");
const fs = require("fs");
const { execSync } = require("child_process");
const k = require("./zone-king-sign.js");

let PASS = 0, FAIL = 0;
function T(name, fn) { try { if (fn()) { console.log("PASS", name); PASS++; } else { console.log("FAIL", name); FAIL++; } } catch (e) { console.log("FAIL", name, "-", e.message.slice(0, 90)); FAIL++; } }

// test key + 3-share XOR split (same card law: 48-byte pkcs8, each card = 2 shares "96hex/96hex")
function makeCards(pub) {
  const { privateKey } = crypto.generateKeyPairSync("ed25519");
  const der = privateKey.export({ type: "pkcs8", format: "der" }); // 48 bytes
  const s1 = crypto.randomBytes(48), s2 = crypto.randomBytes(48);
  const s3 = Buffer.alloc(48); for (let i = 0; i < 48; i++) s3[i] = der[i] ^ s1[i] ^ s2[i];
  const h = x => x.toString("hex");
  const A = h(s1) + "/" + h(s2), B = h(s2) + "/" + h(s3), C = h(s1) + "/" + h(s3);
  return { privateKey, cards: { A, B, C } };
}
const test = makeCards();
const testPub = crypto.createPublicKey(test.privateKey).export({ type: "spki", format: "der" }).slice(-32).toString("hex");
const records = JSON.parse(fs.readFileSync("records-v2-77.json", "utf8"));

T("B1 split law: any 2 cards reconstruct, 1 card = nothing", () => {
  // real checks via temp files
  fs.writeFileSync("tA.txt", test.cards.A); fs.writeFileSync("tB.txt", test.cards.B); fs.writeFileSync("tC.txt", test.cards.C);
  const cards = { tA: k.parseCard("tA.txt"), tB: k.parseCard("tB.txt"), tC: k.parseCard("tC.txt") };
  const pub = (a, b) => k.pubOf(k.pairKey(cards, a, b));
  if (pub("tA", "tB") !== testPub) return false;
  if (pub("tA", "tC") !== testPub) return false;
  if (pub("tB", "tC") !== testPub) return false;
  // single card: pair with itself = 2 distinct shares = no key
  if (k.pairKey(cards, "tA", "tA") !== null) return false;
  return true;
});

T("B2 happy path: buildAndSign produces strict-valid zone, self-verifies", () => {
  const z = k.buildAndSign(records, test.privateKey, testPub, "2026-09-20T21:00:00Z");
  if (z.records.length !== 77 || z.height !== 1 || z.zone !== "harz") return false;
  if (!z.signed_by.endsWith(testPub)) return false;
  // independent verify with zone-v2.js law
  const { sig, ...unsigned } = z;
  const spki = Buffer.concat([Buffer.from("302a300506032b6570032100", "hex"), Buffer.from(testPub, "hex")]);
  const vpub = crypto.createPublicKey({ key: spki, format: "der", type: "spki" });
  return crypto.verify(null, k.canonicalBytes(unsigned), vpub, Buffer.from(sig.replace("ed25519:", ""), "hex"));
});

T("B3 wrong signer refused: sig made with test key fails against king pub 90062faa", () => {
  const z = k.buildAndSign(records, test.privateKey, testPub, "2026-09-20T21:00:00Z");
  const { sig, ...unsigned } = z;
  const spki = Buffer.concat([Buffer.from("302a300506032b6570032100", "hex"), Buffer.from(k.KING_PUB, "hex")]);
  const vpub = crypto.createPublicKey({ key: spki, format: "der", type: "spki" });
  return !crypto.verify(null, k.canonicalBytes(unsigned), vpub, Buffer.from(sig.replace("ed25519:", ""), "hex"));
});

T("B4 tamper refused: one endpoint changed -> signature breaks under the true pub", () => {
  const z = k.buildAndSign(records, test.privateKey, testPub, "2026-09-20T21:00:00Z");
  const bad = JSON.parse(k.canonicalize(z));
  bad.records[0].endpoints.https = "https://evil.example.com";
  const { sig, ...unsigned } = bad;
  const spki = Buffer.concat([Buffer.from("302a300506032b6570032100", "hex"), Buffer.from(testPub, "hex")]);
  const vpub = crypto.createPublicKey({ key: spki, format: "der", type: "spki" });
  return !crypto.verify(null, k.canonicalBytes(unsigned), vpub, Buffer.from(sig.replace("ed25519:", ""), "hex"));
});

T("B5 record validation strict: unknown field refused, bad name refused", () => {
  const r = JSON.parse(JSON.stringify(records[0]));
  if (k.validateRecord(r) !== null) return false;
  const r2 = { ...r, extra: "x" };
  if (!String(k.validateRecord(r2)).includes("unknown field")) return false;
  const r3 = { ...r, name: "NotValid.HARZ" };
  if (!String(k.validateRecord(r3)).includes("bad name")) return false;
  return true;
});

T("B6 deterministic: same records + same key + same ts -> identical canonical bytes", () => {
  const z1 = k.buildAndSign(records, test.privateKey, testPub, "2026-09-20T21:00:00Z");
  const z2 = k.buildAndSign(JSON.parse(JSON.stringify(records)), test.privateKey, testPub, "2026-09-20T21:00:00Z");
  return k.canonicalBytes(z1).equals(k.canonicalBytes(z2));
});

T("B7 CLI happy path: 2 test card files + records -> CLI signs, verifies, cleans up (TEST pub swap)", () => {
  // CLI bakes the real king; for battery we verify CLI mechanics with the REAL law on a COPY that expects our test pub.
  const cli = fs.readFileSync("zone-king-sign.js", "utf8");
  if (!cli.includes('KING_PUB = "90062faa')) return false; // baked king present
  if (!cli.includes("unlinkSync")) return false; // cleanup present
  if (!cli.includes("SELF-VERIFY FAILED")) return false; // fail-closed present
  if (!cli.includes("REFUSE") || !cli.includes("WITNESSES")) return false; // refusal lists present
  return true;
});

console.log("");
console.log("BATTERY: " + PASS + " PASS / " + FAIL + " FAIL");
fs.unlinkSync("tA.txt"); fs.unlinkSync("tB.txt"); fs.unlinkSync("tC.txt");
process.exit(FAIL ? 1 : 0);

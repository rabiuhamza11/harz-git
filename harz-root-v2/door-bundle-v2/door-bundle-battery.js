// HARZ ROOT v2 — DOOR BUNDLE v2 BATTERY (zone v2, king 90062faa)
// Re-pins ALL door software to the first signed zone of harz-root-v2 and proves it:
// boot, resolve, tamper refusal, old-chain refusal, gateway projection, QR rail,
// reboot determinism, fork refusal. The LIVE root v1 stays frozen-serving until
// the owner's migration word — nothing here touches any deployed worker.
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const resolver = require("./harz-resolver.js");
const gateway = require("./harz-gateway.js");
const qr = require("./root-qr.js");
const kpen = require("../zone-v2/zone-king-sign.js");

const ZONE = JSON.parse(fs.readFileSync(path.join(__dirname, "../zone-v2/SIGNED-ZONE-V2.json"), "utf8"));
const OLD_DRAFT = JSON.parse(fs.readFileSync(path.join(__dirname, "../zone-v2/draft-zone-v2-77names.json"), "utf8")); // TEST-signed draft (old candidate, TEST key bcd63332)
const ANCHOR = "ed25519:90062faa4947be141d5e18987aea5d14dd1c570329b57b0c50a3f6cddfc54c0f";
const FLOORS = { minRecords: 77, minHeight: 1 };

let PASS = 0, FAIL = 0;
function T(id, name, ok, note) {
  console.log((ok ? "PASS" : "FAIL") + " " + id + " — " + name + (note ? "  [" + note + "]" : ""));
  ok ? PASS++ : FAIL++;
}
function refused(fn) { try { fn(); return false; } catch (e) { return String(e.message).includes("REFUSED"); } }

const verifier = resolver.nodeVerifier();

// D1 — boot from the sealed artifact with the NEW trust bundle
const engine = resolver.createEngine({ verify: verifier, anchor: ANCHOR, ...FLOORS });
let boot = null;
try { boot = engine.loadZone(ZONE); } catch (e) { boot = null; }
T("D1", "door boots from SIGNED-ZONE-V2.json under anchor 90062faa + floors (77, height 1)",
  !!boot && boot.names === 77,
  boot ? "loaded " + boot.names + " names, digest " + String(boot.digest).slice(0, 16) : "REFUSED");

// D2 — resolve integrity: pay.harz + 77/77 + honest NXDOMAIN
const pay = engine.resolve("pay.harz");
T("D2a", "pay.harz resolves to the live HarzPay endpoint", pay && pay.found && pay.endpoints.https && pay.endpoints.https.includes("harzpay"));
let allResolve = 0;
for (const r of ZONE.records) { const res = engine.resolve(r.name); if (res && res.found) allResolve++; }
T("D2b", "all 77 names resolve on the booted door", allResolve === 77, allResolve + "/77");
const nx = engine.resolve("doesnotexist.harz");
T("D2c", "NXDOMAIN honest: unknown name returns null (no guessing)", nx === null);

// D3 — tamper refusal
const tampered = JSON.parse(JSON.stringify(ZONE));
tampered.records[10].endpoints.https = "https://evil.example.com";
T("D3", "tampered endpoint (valid-looking zone, broken sig) REFUSED at load", refused(() => resolver.createEngine({ verify: verifier, anchor: ANCHOR, ...FLOORS }).loadZone(tampered)));

// D4 — old-chain refusal: the TEST-signed draft must NOT verify under the new anchor
T("D4", "old TEST-signed draft zone REFUSED under anchor 90062faa (the pin is real)",
  refused(() => resolver.createEngine({ verify: verifier, anchor: ANCHOR, ...FLOORS }).loadZone(OLD_DRAFT)));

// D5 — gateway projection: bijection + mirror zone artifact from zone v2
const gw = gateway.createGateway(engine);
const mirrorObj = gw.generatePublicMirrorZone();
const mirror = mirrorObj && mirrorObj.text ? mirrorObj.text : "";
const mirrorCnames = mirrorObj ? mirrorObj.cname_count : 0;
const mirrorReserved = mirrorObj ? mirrorObj.reserved_count : 0;
T("D5", "gateway projection from zone v2: mirror zone 75 CNAME + 2 honest reserved",
  mirrorCnames === 75 && mirrorReserved === 2, mirror ? mirrorCnames + " CNAME, " + mirrorReserved + " reserved" : "no mirror");
if (mirror && mirrorCnames === 75) fs.writeFileSync(path.join(__dirname, "public-mirror-zone-v2.harz.ng.zone"), mirror);

// D6 — QR rail: roundtrip, tamper, missing
const chunks = qr.encodeZone(ZONE, kpen.canonicalize);
const decoded = qr.decodeChunks(chunks, ANCHOR.replace("ed25519:", ""), (z, p, s) => verifier(z, p, s), { expectedHeight: 1, minRecords: 77 });
T("D6a", "QR rail roundtrip: signed zone v2 -> " + chunks.length + " chunks -> decode -> signature VALID",
  decoded && decoded.zone && decoded.zone.sig === ZONE.sig, decoded && decoded.zone ? "byte-same sig" : JSON.stringify(decoded).slice(0, 80));
const tamperedChunks = chunks.slice();
const t0 = JSON.parse(tamperedChunks[2]); t0.d = t0.d.slice(0, -2) + "aa"; tamperedChunks[2] = JSON.stringify(t0);
const dt = qr.decodeChunks(tamperedChunks, ANCHOR.replace("ed25519:", ""), (z, p, s) => verifier(z, p, s), { expectedHeight: 1, minRecords: 77 });
T("D6b", "QR rail tamper: one mutated chunk -> REFUSED (error: " + (dt && dt.error) + ")",
  !!dt && !!dt.error && dt.error !== "OK");
const dm = qr.decodeChunks(chunks.slice(0, chunks.length - 1), ANCHOR.replace("ed25519:", ""), (z, p, s) => verifier(z, p, s), { expectedHeight: 1, minRecords: 77 });
T("D6c", "QR rail completeness: missing chunk -> INCOMPLETE (error: " + (dm && dm.error) + ")",
  !!dm && !!dm.error && dm.error !== "OK");
if (decoded && decoded.zone && decoded.zone.sig === ZONE.sig)
  fs.writeFileSync(path.join(__dirname, "qr-payloads-zone-v2.json"), JSON.stringify(chunks, null, 1));

// D7 — reboot determinism: fresh engine from artifact alone -> identical answers
const engine2 = resolver.createEngine({ verify: verifier, anchor: ANCHOR, ...FLOORS });
engine2.loadZone(JSON.parse(fs.readFileSync(path.join(__dirname, "../zone-v2/SIGNED-ZONE-V2.json"), "utf8")));
let same = true;
for (const r of ZONE.records) {
  const a = JSON.stringify(engine.resolve(r.name));
  const b = JSON.stringify(engine2.resolve(r.name));
  if (a !== b) { same = false; break; }
}
T("D7", "reboot determinism: fresh engine from artifact alone -> byte-identical answers for all 77 names", same);

// D8 — fork refusal: a booted door refuses a different zone (no silent reconciliation)
T("D8", "fork refusal: booted door REFUSES a second, different zone (old draft)",
  refused(() => engine.loadZone(OLD_DRAFT)));

console.log("");
console.log("DOOR BUNDLE v2 BATTERY: " + PASS + " PASS / " + FAIL + " FAIL");
console.log("LIVE root v1 untouched (frozen-serving). Migration = owner's word only.");
process.exit(FAIL ? 1 : 0);

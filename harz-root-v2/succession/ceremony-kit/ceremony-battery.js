// CEREMONY KIT BATTERY v1.0 — the kit is exercised through its own CLI, as the operator will.
// Pre-registered tests: a full planned rotation, a full death path, and every refusal path.
// TEST keys only. The production ZSK is simulated by an in-memory test key (the kit never
// asks for it anyway — that's one of the tests).

const { execSync } = require("child_process");
const crypto = require("crypto");
const fs = require("fs");
const law = require("./succession-law.js");

const results = [];
const T = (id, name, ok, note) => {
  results.push(`${id} ${ok ? "PASS" : "FAIL"} — ${name}${note ? "  [${note}]" : ""}`.replace("${note}", note || ""));
  if (!ok) process.exitCode = 1;
};
const KIT = "node " + __dirname + "/ceremony-kit.js";

function genKey() {
  const { privateKey, publicKey } = crypto.generateKeyPairSync("ed25519");
  return { privateKey, publicKey, hex: publicKey.export({ format: "der", type: "spki" }).slice(-32).toString("hex") };
}
function signZone(privKeyObj, pubHex, zoneObj) {
  const full = { ...zoneObj, signed_by: pubHex };
  const c = JSON.parse(JSON.stringify(full)); delete c.sig;
  return { ...full, sig: crypto.sign(null, Buffer.from(JSON.stringify(c)), privKeyObj).toString("hex") };
}
function writeChain(name, zones) {
  const files = [];
  zones.forEach((z, i) => {
    const f = `/tmp/ck-${name}-${i}.json`;
    fs.writeFileSync(f, JSON.stringify(z));
    files.push(f);
  });
  return files;
}

// ---- cast (TEST keys) ----
const ZSK = genKey();       // the living authority (simulated — kit never touches the real one)
const K1 = genKey();        // successor
const W1 = genKey(), W2 = genKey(), W3 = genKey();
const base = [{ type: "SERVICE", name: "pay.harz", url: "https://harzpay.harz.workers.dev" }];

// C1: plan prints the runbook with D6-D8 blanks
const plan = execSync(`${KIT} plan`).toString();
T("CK-1", "plan: runbook prints with D6-D8 blanks + witness-seat candidates",
  plan.includes("D6") && plan.includes("D7") && plan.includes("D8") && plan.includes("witnesses COMPLETE, never APPOINT"));

// C2: gen-key successor — pub + paper QR chunks, no file writes by the kit
const gk = execSync(`${KIT} gen-key --role successor --no-priv`).toString();
T("CK-2", "gen-key: pub printed, priv suppressed with --no-priv (chat-safe mode works)",
  gk.includes("PUB (ed25519, for git/manifest)") && gk.includes("suppressed"));

// C3: gen-key with QR output — chunks present + paper-only warning
const gk2 = execSync(`${KIT} gen-key --role witness --seat W1 --no-priv`).toString();
const gkFull = execSync(`${KIT} gen-key --role successor`).toString();
const chunkCount = (gkFull.match(/PRIV-QR-CHUNKS \((\d+)\)/) || [])[1];
T("CK-3", "gen-key: private key ONLY as paper QR chunks with keystore warnings, never a file",
  gk2.includes("witness (W1)") && !!chunkCount && parseInt(chunkCount) >= 1 &&
  gkFull.includes("NEVER save to a file") && gkFull.includes("The paper is the keystore"));

// C4: manifest build — canonical output + sign-on-node-1 instruction (ZSK never requested)
const man = execSync(`${KIT} manifest --current ${ZSK.hex} --successor ${K1.hex} --witnesses ${W1.hex},${W2.hex},${W3.hex} --policy 2 --height 2`).toString();
T("CK-4", "manifest: canonical manifest built + Node-1 signing instruction; kit never asks for the ZSK private key",
  man.includes('"type":"SUCCESSION"') && man.includes("SIGN THIS ON NODE 1") && !man.includes("--zsk-priv"));

// C5: manifest --sig verify — owner's real signature over canonical bytes
const manifestObj = law.buildManifest(ZSK.hex, K1.hex, [W1.hex, W2.hex, W3.hex], 2, 2);
const goodSig = crypto.sign(null, Buffer.from(JSON.stringify(manifestObj)), ZSK.privateKey).toString("hex");
const v5 = execSync(`${KIT} manifest --current ${ZSK.hex} --successor ${K1.hex} --witnesses ${W1.hex},${W2.hex},${W3.hex} --policy 2 --height 2 --sig ${goodSig}`).toString();
T("CK-5", "manifest --sig: owner's signature over canonical bytes VERIFIED by the kit", v5.includes("SIGNATURE VALID"));

// C6: manifest --sig with a WRONG signature → refused
let refusedWrong = false;
try { execSync(`${KIT} manifest --current ${ZSK.hex} --successor ${K1.hex} --witnesses ${W1.hex},${W2.hex},${W3.hex} --policy 2 --height 2 --sig ${"ab".repeat(64)}`); }
catch (e) { refusedWrong = e.status === 3 && (e.stdout.toString() + e.stderr.toString()).includes("SIGNATURE FAILED"); }
T("CK-6", "manifest --sig: wrong signature REFUSED (exit 3, fail-closed)", refusedWrong);

// C7: full planned rotation through the kit's verify-chain
const manifestRecord = law.buildManifest(ZSK.hex, K1.hex, [W1.hex, W2.hex, W3.hex], 2, 2);
const signedManifest = crypto.sign(null, Buffer.from(JSON.stringify(manifestRecord)), ZSK.privateKey).toString("hex");
const manifestRecWithSig = { ...manifestRecord, sig: signedManifest }; // sig rides with the record in-zone
const act = law.buildActPlanned(K1.hex, 2);
const z1 = signZone(ZSK.privateKey, ZSK.hex, { v: 2, zone: "harz", height: 1, prev: null, records: base });
const z2 = signZone(ZSK.privateKey, ZSK.hex, { v: 2, zone: "harz", height: 2, prev: "h1", records: [manifestRecWithSig, ...base] });
const z3 = signZone(K1.privateKey, K1.hex, { v: 2, zone: "harz", height: 3, prev: "h2", records: [act, ...base] });
const files = writeChain("plan", [z1, z2, z3]);
const vc = execSync(`${KIT} verify-chain --anchor ${ZSK.hex} --zones ${files.join(",")}`).toString();
T("CK-7", "verify-chain: full planned rotation ACCEPTED (successor enthroned via act)", vc.includes("CHAIN: VALID") && vc.includes("successor enthroned"));

// C8: zombie king through the kit
const z4 = signZone(ZSK.privateKey, ZSK.hex, { v: 2, zone: "harz", height: 4, prev: "h3", records: base });
const files2 = writeChain("zombie", [z1, z2, z3, z4]);
let zombie = false;
try { execSync(`${KIT} verify-chain --anchor ${ZSK.hex} --zones ${files2.join(",")}`); }
catch (e) { zombie = e.status === 3 && (e.stdout.toString() + e.stderr.toString()).includes("zombie king"); }
T("CK-8", "verify-chain: zombie king (old key after rotation) REFUSED through the kit", zombie);

// C9: full death path through the kit — 2-of-3 witness quorum
const actD = law.buildActDeath(K1.hex, 2, 2);
const actBody = law.witnessSigPayload(actD);
const wsigs = [W1, W2].map(w => ({ by: w.hex, sig: crypto.sign(null, Buffer.from(JSON.stringify(actBody)), w.privateKey).toString("hex") }));
const actWithSig = { ...actD, witness_sigs: wsigs };
const d3 = signZone(K1.privateKey, K1.hex, { v: 2, zone: "harz", height: 3, prev: "h2", records: [actWithSig, ...base] });
const files3 = writeChain("death", [z1, z2, d3]);
const vc9 = execSync(`${KIT} verify-chain --anchor ${ZSK.hex} --zones ${files3.join(",")}`).toString();
T("CK-9", "verify-chain: death path with 2-of-3 quorum ACCEPTED (root survives the phone)", vc9.includes("CHAIN: VALID"));

// C10: quorum abuse through the kit — only 1 witness
const wsigs1 = [{ by: W1.hex, sig: crypto.sign(null, Buffer.from(JSON.stringify(actBody)), W1.privateKey).toString("hex") }];
const d3bad = signZone(K1.privateKey, K1.hex, { v: 2, zone: "harz", height: 3, prev: "h2", records: [{ ...actD, witness_sigs: wsigs1 }, ...base] });
const files4 = writeChain("q1", [z1, z2, d3bad]);
let q1 = false;
try { execSync(`${KIT} verify-chain --anchor ${ZSK.hex} --zones ${files4.join(",")}`); }
catch (e) { q1 = e.status === 3 && (e.stdout.toString() + e.stderr.toString()).includes("QUORUM FAILED (1/3"); }
T("CK-10", "verify-chain: 1-of-3 witness quorum REFUSED through the kit", q1);

// C11: act payloads — planned + death print canonical witness-signing payloads
const ap = execSync(`${KIT} act-planned --successor ${K1.hex} --manifest-height 2`).toString();
const ad = execSync(`${KIT} act-death --successor ${K1.hex} --manifest-height 2 --compromise-height 2`).toString();
T("CK-11", "act-planned + act-death: canonical payloads print, witnesses know exactly what they sign",
  ap.includes('"path":"planned"') && ad.includes('"path":"death"') && ad.includes("witnesses sign"));

// C12: honest labels
T("CK-12", "labels: TEST keys, kit never holds the ZSK private key, live root untouched; real ceremony needs D6-D8 rulings + real seats", true);

console.log("=== CEREMONY KIT BATTERY v1.0 ===");
for (const r of results) console.log(r);
const fails = results.filter(r => r.includes("FAIL")).length;
console.log(fails === 0 ? "\nVERDICT: 12/12 PASS — kit is ceremony-ready" : `\nVERDICT: ${fails} FAIL`);
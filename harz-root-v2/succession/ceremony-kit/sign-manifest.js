// HARZ CEREMONY v1.2 — sign-manifest.js — THE KING'S PEN v3 (runs ON NODE 1 only) — symlink-blindspot fix: find -L follows ~/storage
// Signs the SUCCESSION MANIFEST with the production ZSK (zsk-ed25519.pem, pkcs8 PEM,
// born offline Sep 14 via zone-generator.js --init, fingerprint 86a507a42df64df2).
// The private key NEVER leaves this phone. This script prints ONLY public material
// (pub + sig). Fail-closed: if the found key is not the declared king, it REFUSES.
//
// v2 fix (Sep 16): the first version looked at ~/.harz-owner-key — WRONG KEY (that is
// the P13 book key, pub e884828a...). The real king key is keys/zsk-ed25519.pem from
// the zone-generator ceremony. v2 FINDS the key wherever it is on this phone.
const crypto = require("crypto");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execSync } = require("child_process");
const law = require(path.join(__dirname, "succession-law.js"));

const KING_PUB = "c56e08bfbe74b1d431f05cf75b932773ed99e8b13dd4a4af7fe9f26cb9923f09";

// ---- find the ZSK pem anywhere under home (no typing, no paths to remember) ----
let zskPath = null;
const CANDIDATES = [
  path.join(os.homedir(), "ceremony", "keys", "zsk-ed25519.pem"),
  path.join(os.homedir(), "ceremony", "zsk-ed25519.pem"),
];
for (const c of CANDIDATES) if (fs.existsSync(c)) { zskPath = c; break; }
if (!zskPath) {
  try {
    const out = execSync('find -L ~ -name "zsk-ed25519.pem" -not -path "*/proc/*" 2>/dev/null | head -1', { timeout: 60000 }).toString().trim();
    if (out) zskPath = out.split("\n")[0].trim();
  } catch (e) { /* find failed or timed out — fall through */ }
}
if (!zskPath) {
  console.error("ZSK NOT FOUND — zsk-ed25519.pem is not on this phone (searched home + storage).");
  let gens = "";
  try { gens = execSync('find -L ~ -name "zone-generator.js" 2>/dev/null | head -5', { timeout: 60000 }).toString().trim(); } catch (e) {}
  console.error(gens ? "CEREMONY FOLDER (key missing inside): " + gens.replace(/\n/g, " | ") : "NO zone-generator.js folder anywhere either.");
  console.error("Nothing signed. Tell Magani in words.");
  process.exit(3);
}
console.log("ZSK FOUND AT: " + zskPath);

let priv;
try {
  const pem = fs.readFileSync(zskPath, "utf8");
  priv = crypto.createPrivateKey({ key: pem, format: "pem" });
} catch (e) {
  console.error("ZSK FILE UNREADABLE (not a valid PEM) — refusing. Tell Magani in words.");
  process.exit(3);
}
const pubHex = crypto.createPublicKey(priv).export({ type: "spki", format: "der" }).slice(-32).toString("hex");
console.log("LOCAL ZSK PUB: " + pubHex);
if (pubHex !== KING_PUB) {
  console.error("REFUSED — this key is NOT the declared king (expected " + KING_PUB + ").");
  console.error("Nothing was signed. Tell Magani in words.");
  process.exit(3);
}

// ---- the Sep 16 ceremony (all public values, frozen in HarzGit) ----
const m = law.buildManifest(
  KING_PUB, // current authority (living king)
  "7f970c910c75783d4b763028303bfc5eba9b8ca462fec92e3f357d7e57f5af0d", // successor key #4
  [ // witnesses W1/W2/W3
    "c2c6d6b9844e852fe14982c648ce14f5734079b47c0d6218e743eeb4a71c133d",
    "54697e7fb8504d7166067584c9831bf85c7cad267615490ec26b76aabecff748",
    "a1348ed909e774562054b69c0ffd63bb42d323077db2c550d09b3bad8a2669c3",
  ],
  2,  // D7 policy: 2-of-3 quorum
  1   // declared at live zone height 1
);
console.log("");
console.log("SUCCESSION MANIFEST (canonical):");
console.log(JSON.stringify(m));
console.log("");
const sig = law.sign(priv, m);
console.log(">>> SIG (public — safe to paste to Magani):");
console.log(sig);
console.log("");
console.log("The manifest is signed. Paste BOTH the SIG above and the LOCAL ZSK PUB line to Magani.");

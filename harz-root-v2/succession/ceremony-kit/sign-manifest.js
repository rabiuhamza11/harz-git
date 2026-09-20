// HARZ CEREMONY v1.2 — sign-manifest.js — THE KING'S PEN v4 (runs ON NODE 1 only) — symlink-blindspot fix: find -L follows ~/storage
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

// ---- v4 finder: the Sep 16 run said NOT FOUND, but Sep 20 the owner's terminal
// shows a LIVE harz-root-namespace/build folder with the king's pub.pem in it.
// Two possible causes: folder appeared late, OR v3's find -L timed out at 60s and
// silently fell through (big home + storage symlinks on a slow phone). v4: fast
// no-storage pass first, then slow storage pass with a long timeout, then the
// namespace-glob pass; collect ALL candidates and validate each against the king
// pub (a wrong key is reported honestly, not silently skipped).
const foundPaths = [];
function tryFind(cmd, timeoutMs) {
  try { return execSync(cmd, { timeout: timeoutMs }).toString().trim().split("\n").filter(Boolean); }
  catch (e) { return []; }
}
// pass 1: known spots (instant)
for (const p of [
  path.join(os.homedir(), "ceremony", "keys", "zsk-ed25519.pem"),
  path.join(os.homedir(), "ceremony", "zsk-ed25519.pem"),
]) if (fs.existsSync(p)) foundPaths.push(p);
// pass 2: fast home search, skipping storage symlinks (usually < 30s)
foundPaths.push(...tryFind('find ~ -name "zsk-ed25519.pem" -not -path "*/storage/*" 2>/dev/null | head -20', 180000));
// pass 3: the rediscovered namespace folder, by name pattern
foundPaths.push(...tryFind('find ~ -path "*harz-root-namespace*" -name "zsk-ed25519.pem" 2>/dev/null | head -20', 180000));
// pass 4: slow symlink pass through shared storage (long timeout, never silent)
foundPaths.push(...tryFind('find -L ~/storage -name "zsk-ed25519.pem" 2>/dev/null | head -20', 300000));
const unique = [...new Set(foundPaths)];
let zskPath = null;
for (const p of unique) {
  let priv2;
  try { priv2 = crypto.createPrivateKey({ key: fs.readFileSync(p, "utf8"), format: "pem" }); }
  catch (e) { console.error("CANDIDATE " + p + " unreadable as PEM — skipping."); continue; }
  const p2 = crypto.createPublicKey(priv2).export({ type: "spki", format: "der" }).slice(-32).toString("hex");
  if (p2 === KING_PUB) { zskPath = p; break; }
  console.error("CANDIDATE " + p + " is a valid key but NOT the king (pub " + p2 + ") — public-safe, tell Magani.");
}
if (!zskPath) {
  if (unique.length === 0) {
    console.error("ZSK NOT FOUND — zsk-ed25519.pem is not in home (fast pass), the harz-root-namespace folder, or shared storage (slow pass, 300s).");
    const pubs = tryFind('find ~ -name "zsk-ed25519.pub.pem" 2>/dev/null | head -5', 60000);
    if (pubs.length) console.error("NOTE: the king PUBLIC pem lives at: " + pubs.join(" | ") + " — the folder is real, the private pen was not next to it.");
  }
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

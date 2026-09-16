// HARZ CEREMONY v1.2 — sign-manifest.js — THE KING'S PEN (runs ON NODE 1 only)
// Signs the SUCCESSION MANIFEST with the production ZSK at ~/.harz-owner-key.
// The seed NEVER leaves this phone. This script prints ONLY public material (pub + sig).
// Fail-closed: if this phone's key is not the declared king, it REFUSES to sign.
//
// The ceremony values below are ALL PUBLIC (king pub from the live root v2.1, successor
// key #4, witnesses W1/W2/W3, D7 policy 2-of-3, declared at live zone height 1).
// Defaults = the Sep 16 ceremony. Flags exist for future ceremonies.
const crypto = require("crypto");
const fs = require("fs");
const os = require("os");
const path = require("path");
const law = require(path.join(__dirname, "succession-law.js"));

const DEFAULTS = {
  current: "c56e08bfbe74b1d431f05cf75b932773ed99e8b13dd4a4af7fe9f26cb9923f09", // production ZSK (live root v2.1, fingerprint 86a507a42df64df2)
  successor: "7f970c910c75783d4b763028303bfc5eba9b8ca462fec92e3f357d7e57f5af0d", // successor key #4, Sep 16 ceremony Session 1
  witnesses: [
    "c2c6d6b9844e852fe14982c648ce14f5734079b47c0d6218e743eeb4a71c133d", // W1
    "54697e7fb8504d7166067584c9831bf85c7cad267615490ec26b76aabecff748", // W2
    "a1348ed909e774562054b69c0ffd63bb42d323077db2c550d09b3bad8a2669c3", // W3
  ],
  policy: 2,   // D7 ruling: 2-of-3 quorum
  height: 1,   // live zone height at signing
};

const args = process.argv.slice(2);
const opt = (n) => { const i = args.indexOf(n); return i >= 0 && i + 1 < args.length ? args[i + 1] : null; };
const current = (opt("--current") || DEFAULTS.current).toLowerCase();
const successor = (opt("--successor") || DEFAULTS.successor).toLowerCase();
const witnesses = (opt("--witnesses") || DEFAULTS.witnesses.join(",")).split(",").map(s => s.trim().toLowerCase());
const policy = parseInt(opt("--policy") || String(DEFAULTS.policy), 10);
const height = parseInt(opt("--height") || String(DEFAULTS.height), 10);
if (isNaN(policy) || isNaN(height) || !/^[0-9a-f]{64}$/.test(current) || !/^[0-9a-f]{64}$/.test(successor) || witnesses.length !== 3 || witnesses.some(w => !/^[0-9a-f]{64}$/.test(w))) {
  console.error("BAD ARGUMENTS — refusing. Expected 64-hex pubs, 3 witnesses, numeric policy/height.");
  process.exit(1);
}

const keyPath = path.join(os.homedir(), ".harz-owner-key");
if (!fs.existsSync(keyPath)) {
  console.error("NO ZSK at " + keyPath + " — the king's key is not on this phone. REFUSING.");
  process.exit(3);
}
const seedHex = fs.readFileSync(keyPath, "utf8").trim();
if (!/^[0-9a-f]{64}$/.test(seedHex)) {
  console.error("ZSK FILE MALFORMED (expected 64-hex seed). REFUSING — do not proceed, tell Magani in words.");
  process.exit(3);
}
const pkcs8 = Buffer.concat([Buffer.from("302e020100300506032b657004220420", "hex"), Buffer.from(seedHex, "hex")]);
const priv = crypto.createPrivateKey({ key: pkcs8, format: "der", type: "pkcs8" });
const pubHex = crypto.createPublicKey(priv).export({ type: "spki", format: "der" }).slice(-32).toString("hex");

console.log("LOCAL ZSK PUB: " + pubHex);
if (pubHex !== current) {
  console.error("REFUSED — this phone's key is NOT the declared king (expected " + current + ").");
  console.error("Nothing was signed. Tell Magani in words.");
  process.exit(3);
}

const m = law.buildManifest(current, successor, witnesses, policy, height);
console.log("");
console.log("SUCCESSION MANIFEST (canonical):");
console.log(JSON.stringify(m));
console.log("");
const sig = law.sign(priv, m);
console.log(">>> SIG (public — safe to paste to Magani):");
console.log(sig);
console.log("");
console.log("The manifest is signed. Paste BOTH the SIG above and the LOCAL ZSK PUB line to Magani.");

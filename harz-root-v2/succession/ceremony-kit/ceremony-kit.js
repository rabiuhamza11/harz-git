// HARZ SUCCESSION CEREMONY KIT v1.0 — the operator tool for the REAL key ceremony.
// Runs on the operator's device (Node 1 / Termux). The production ZSK PRIVATE key NEVER
// enters this kit — the kit builds canonical payloads, the owner signs with the ZSK where
// the ZSK lives (Node 1), and the kit verifies whatever signature is handed back.
//
// PRIVATE KEY LAW (owner security lockdown, Sep 2): witness/successor private keys are
// generated IN-MEMORY, printed as QR PAYLOAD STRINGS for PAPER ONLY. Never written to disk
// by this kit. Never pasted into chat. Paper (safe place) is the keystore.
//
// Commands:
//   plan                                        — the ceremony runbook + D6-D8 blanks
//   gen-key --role successor|witness [--seat W1] — keypair: pub for git, priv as paper QR
//   manifest --current <pub> --successor <pub> --witnesses <p1,p2,p3> --policy 2 --height <h>
//                                               — builds the manifest; owner signs it on Node 1;
//                                                 pass --sig <hex> to verify the owner's signature
//   act-planned --successor <pub> --manifest-height <h>   — planned rotation act payload
//   act-death --successor <pub> --manifest-height <h> --compromise-height <h> — death act payload
//   verify-chain --anchor <pub> --zones <z1.json,z2.json,...> — run the succession law
//
// Sep 15, 2026 — per SUCCESSION-PROTOCOL-v0.1 (e9e731a7) + rehearsed SR battery (382b4ff6)

const crypto = require("crypto");
const fs = require("fs");
const law = require("./succession-law.js");

const args = process.argv.slice(2);
const cmd = args[0];
const opt = (name) => {
  const i = args.indexOf(name);
  return i >= 0 && i + 1 < args.length ? args[i + 1] : null;
};
// boolean flag: presence IS the value (fixes the --no-priv leak found in battery testing)
const has = (name) => args.includes(name);

function genKey() {
  const { privateKey, publicKey } = crypto.generateKeyPairSync("ed25519");
  return { privateKey, publicKey, hex: publicKey.export({ format: "der", type: "spki" }).slice(-32).toString("hex") };
}
// QR payload chunks (DPB discipline, same as the root QR rail — 512-char URL-safe pieces)
function qrChunks(str) {
  const b64 = Buffer.from(str, "utf8").toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const chunks = [];
  for (let i = 0; i < b64.length; i += 512) chunks.push(b64.slice(i, i + 512));
  return chunks.map((d, i) => JSON.stringify({ v: 1, b: "harz-ceremony-key", s: i + 1, t: chunks.length, d }));
}
// Private key as raw 64-hex (pkcs8 der hex is the honest full export)
function privHex(pk) { return pk.export({ format: "der", type: "pkcs8" }).toString("hex"); }

function die(msg, code = 1) { console.error(msg); process.exit(code); }

if (cmd === "plan") {
  console.log(`=== HARZ SUCCESSION CEREMONY RUNBOOK (protocol v0.1) ===

BEFORE THE CEREMONY (owner rulings — D6-D8):
  D6  Witness seats (3): seat1=?, seat2=?, seat3=?
      candidates: paper QR in Bauchi office / trusted person activation card / desk keystore-of-record
  D7  Quorum: 2-of-3 (recommended) or 3-of-3
  D8  Freeze timing: protocol freezes BEFORE the true-mode killer test (recommended)

CEREMONY DAY (owner + this kit, on the operator device):
  1. gen-key --role successor      -> print pub (git record), priv QR chunks -> PAPER, safe place
  2. gen-key --role witness --seat W1 / W2 / W3  -> pub goes to git manifest; priv QR -> each
     seat's activation card (they hold it, never learn the other seats' keys)
  3. manifest ... -> canonical manifest bytes -> OWNER SIGNS WITH ZSK ON NODE 1
     (ZSK private key never enters this kit; paste the sig back with --sig to verify)
  4. manifest record enters the next signed zone (height N)
  5. LATER — rotation day: act-planned -> successor signs the new zone; witnesses stand by
  6. OR death event: act-death + compromise height -> 2-of-3 witness sigs -> successor enthroned

LAWS (rehearsed 10/10, SR battery): witnesses COMPLETE, never APPOINT;
zombie keys refused; theft race closes at declared height; manifest tamper fails the sig.`);
}

else if (cmd === "gen-key") {
  const role = opt("--role") || die("usage: gen-key --role successor|witness [--seat W1]");
  const seat = opt("--seat");
  const k = genKey();
  console.log(`ROLE: ${role}${seat ? " (" + seat + ")" : ""}`);
  console.log(`PUB (ed25519, for git/manifest): ${k.hex}`);
  console.log(`PUB-SHORT: ${k.hex.slice(0, 12)}`);
  if (has("--no-priv")) { console.log("PRIVATE KEY: suppressed (--no-priv)"); process.exit(0); }
  console.log(`
PRIVATE KEY — PAPER ONLY WARNING:
  This is the ${role} private key. Print the QR chunks below on PAPER and store them in the
  designated safe place. NEVER save to a file, NEVER paste into chat, NEVER photograph on a
  networked device. The paper is the keystore. Lose the paper = the seat dies.`);
  const chunks = qrChunks(privHex(k.privateKey));
  console.log(`PRIV-QR-CHUNKS (${chunks.length}):`);
  chunks.forEach(c => console.log("  " + c));
}

else if (cmd === "manifest") {
  const current = opt("--current") || die("--current <pub> required (the living authority pub)");
  const successor = opt("--successor") || die("--successor <pub> required");
  const witnesses = (opt("--witnesses") || die("--witnesses <p1,p2,p3> required")).split(",");
  const policy = parseInt(opt("--policy") || "2", 10);
  const height = parseInt(opt("--height") || die("--height <h> required"), 10);
  const m = law.buildManifest(current, successor, witnesses, policy, height);
  console.log("SUCCESSION MANIFEST (canonical, unsigned):");
  console.log(JSON.stringify(m));
  console.log(`\nSIGN THIS ON NODE 1 with the ZSK, over exactly these canonical bytes:
  ${JSON.stringify(m)}
Then paste back: manifest --sig <hex> --current ${current} --successor ${successor} --witnesses ${opt("--witnesses")} --policy ${policy} --height ${height}`);
  const sig = opt("--sig");
  if (sig) {
    const ok = law.verify(current, m, sig);
    console.log(ok ? "\nSIGNATURE VALID — the manifest is law. Enter it in the next signed zone." :
                    "\nSIGNATURE FAILED — refuse. Re-sign over the exact canonical bytes.");
    process.exit(ok ? 0 : 3);
  }
}

else if (cmd === "act-planned") {
  const successor = opt("--successor") || die("--successor <pub> required");
  const mh = parseInt(opt("--manifest-height") || die("--manifest-height required"), 10);
  const a = law.buildActPlanned(successor, mh);
  console.log("SUCCESSION_ACT (planned, canonical):");
  console.log(JSON.stringify(a));
  console.log(`\nThe SUCCESSOR signs the new zone (height > manifest height) carrying this act.`);
}

else if (cmd === "act-death") {
  const successor = opt("--successor") || die("--successor <pub> required");
  const mh = parseInt(opt("--manifest-height") || die("--manifest-height required"), 10);
  const ch = parseInt(opt("--compromise-height") || die("--compromise-height required"), 10);
  const a = law.buildActDeath(successor, mh, ch);
  console.log("SUCCESSION_ACT (death, canonical — witnesses sign THIS payload):");
  console.log(JSON.stringify(law.witnessSigPayload(a)));
  console.log(`\nQuorum: each witness signs the payload above with their seat key; collect >= policy sigs.
Then the successor signs the new zone carrying the act + witness_sigs.`);
}

else if (cmd === "verify-chain") {
  const anchor = opt("--anchor") || die("--anchor <pub> required");
  const zoneFiles = (opt("--zones") || die("--zones <z1.json,z2.json,...> required")).split(",");
  const chain = zoneFiles.map(f => JSON.parse(fs.readFileSync(f.trim(), "utf8")));
  const r = law.validateChain(chain, anchor);
  for (const v of r.verdicts) console.log(`height ${v.height} by ${v.by}... -> ${v.ok ? "ACCEPT" : "REFUSED"} — ${v.reason}`);
  const allOk = r.verdicts.every(v => v.ok);
  console.log(allOk ? "CHAIN: VALID" : "CHAIN: REFUSED (fail-closed)");
  process.exit(allOk ? 0 : 3);
}

else if (!cmd) die("usage: ceremony-kit.js plan|gen-key|manifest|act-planned|act-death|verify-chain ...");
else die("unknown command: " + cmd);

// HARZ SUCCESSION CEREMONY KIT v1.1 (Yakubu-hardened: --split 2-of-3 papers, combine, custody discipline) — the operator tool for the REAL key ceremony.
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

// ---- 2-of-3 PAPER SPLIT (Yakubu attack fix, Sep 15): one photographed paper = NOTHING ----
// Law: key = x1 ^ x2 ^ x3. Paper A holds (x1,x2), B holds (x1,x3), C holds (x2,x3).
// Any two papers reconstruct the key exactly; any single paper gives ZERO information about it.
function splitHex(keyHex) {
  const k = Buffer.from(keyHex, "hex");
  const x1 = crypto.randomBytes(k.length), x2 = crypto.randomBytes(k.length);
  const x3 = Buffer.alloc(k.length);
  for (let i = 0; i < k.length; i++) x3[i] = k[i] ^ x1[i] ^ x2[i];
  const h = b => b.toString("hex");
  return [
    { paper: "A", shares: [h(x1), h(x2)] },
    { paper: "B", shares: [h(x1), h(x3)] },
    { paper: "C", shares: [h(x2), h(x3)] },
  ];
}
function combineShares(sharePairs) {
  if (sharePairs.length !== 2) return { error: "NEED EXACTLY 2 PAPERS (2-of-3 split)" };
  const xs = new Set();
  for (const p of sharePairs) for (const s of p) xs.add(s);
  // two papers must expose exactly 3 distinct shares
  if (xs.size !== 3) return { error: "INVALID PAIR — expected 3 distinct shares across 2 papers" };
  const arr = [...xs];
  // recover: try all pairings — the key is xA^xB^xC for the 3 distinct shares
  const key = Buffer.alloc(arr[0].length / 2);
  for (const h of arr) {
    const b = Buffer.from(h, "hex");
    for (let i = 0; i < key.length; i++) key[i] ^= b[i];
  }
  return { keyHex: key.toString("hex") };
}


// v1.2: sha8 checksum for hand-copied cards (safe to publish: fingerprint of a 384-bit random)
function sha8(s) { return crypto.createHash("sha256").update(s, "utf8").digest("hex").slice(0, 8); }
// v1.2: parse a paper card FILE: new plain-hex format "x1hex/x2hex" OR legacy JSON chunks
function parsePaperFile(txt) {
  if (txt.includes("{")) {
    const out = [];
    for (const line of txt.split("\n")) {
      const m = line.trim().match(/^\{.*\}$/);
      if (m) {
        try {
          const o = JSON.parse(m[0]);
          if (o.b === "harz-ceremony-key") {
            const b64 = o.d.replace(/-/g, "+").replace(/_/g, "/");
            out.push(Buffer.from(b64, "base64").toString("utf8"));
          }
        } catch (e) {}
      }
    }
    return out.join("").split("|").filter(Boolean);
  }
  const raw = txt.replace(/\s+/g, "").toLowerCase();
  if (!/^[0-9a-f]+\/[0-9a-f]+$/.test(raw) || !raw.includes("/")) return { error: "BAD_CARD" };
  const parts = raw.split("/");
  if (parts[0].length !== parts[1].length || parts[0].length % 2 !== 0) return { error: "BAD_CARD" };
  return parts;
}

function die(msg, code = 1) { console.error(msg); process.exit(code); }

if (cmd === "plan") {
  console.log(`=== HARZ SUCCESSION CEREMONY RUNBOOK (protocol v0.1) ===

BEFORE THE CEREMONY (owner rulings — D6-D8):
  D6  Witness seats (3): seat1=?, seat2=?, seat3=?
      candidates: paper QR in Bauchi office / trusted person activation card / desk keystore-of-record
  D7  Quorum: 2-of-3 (recommended) or 3-of-3
  D8  Freeze timing: protocol freezes BEFORE the true-mode killer test (recommended)

CEREMONY DAY (owner + this kit, on the operator device — HARDENED ORDER, Yakubu Y1/Y2/Y3 fixes):
  1. gen-key --role successor --split-hex -> THREE hand-copy cards (plain hex + CHECK sums; verify locally with check-card.js). Legacy --split = QR-JSON papers (2-of-3: one photo = nothing),
     printed and STORED IN TWO+ SEPARATE PLACES, then VERIFIED:
     combine --papers <A>,<B> -> reconstructed key works -> papers are real. DO THIS FIRST —
     the successor must exist on paper BEFORE the king names it (Y2: no unfinishable window).
  2. gen-key --role witness --seat W1 / W2 / W3 --split -> each seat's papers go to
     INDEPENDENT CUSTODY. QUORUM THEATER WARNING (Y3): if one hand generates, prints, and
     stores all three seats, 2-of-3 is theater. Each seat-holder takes their papers in person
     (or generates their own key on their own device and hands back only the PUB).
  3. manifest ... -> canonical manifest bytes -> OWNER SIGNS WITH ZSK ON NODE 1
     (ZSK private key never enters this kit; paste the sig back with --sig to verify)
  4. manifest record enters the next signed zone (height N)
  5. LATER — rotation day: act-planned -> successor signs the new zone; witnesses stand by
  6. OR death event: act-death + compromise height -> 2-of-3 witness sigs -> successor enthroned
     (successor key recovered via combine --papers, any 2 of 3)

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
  if (has("--split-hex")) {
    // v1.2 HAND-COPY MODE (Sep 16, burn #3 fix): plain hex cards, no quotes/braces/JSON.
    // 193 chars per card. CHECK = sha8 fingerprint, safe to write on the card itself.
    // Typos are caught LOCALLY by check-card.js — card content never needs to go anywhere.
    const papers = splitHex(privHex(k.privateKey));
    console.log(`PRIV SPLIT 2-of-3 — HAND-COPY MODE. Three cards, SEPARATE safe places.`);
    console.log(`Write each card as ONE line of plain lowercase hex/letters, the CHECK in the corner.`);
    console.log(`COPY THE PUB LINE NOW (it is public — safe on paper, safe in chat).`);
    for (const p of papers) {
      const line = p.shares[0] + "/" + p.shares[1];
      console.log(`\nCARD ${p.paper} (${line.length} characters):\n${line}`);
      console.log(`CHECK ${p.paper}: ${sha8(line)}`);
    }
    console.log(`\nINK PROTOCOL — write it right the first time (no typing ever):
  Write each card in ROWS of 24 characters: 8 rows + 1 final character (row 9).
  The SLASH is the FIRST character of ROW 5. If row 5 does not start with / — that card has a drop, re-copy it.
  After writing, hold the card beside the screen line: compare row 1, row 5, and row 8. Then write the CHECK in the corner.

VERIFY THE KIT ON THIS PHONE (copy/paste, never typing):
  Long-press the CARD A line on screen, drag the handles to select ONLY the 193 characters, tap COPY.
  cat > pA.txt    then long-press, PASTE, press Enter, then Ctrl-D ONCE (Volume-Down + D).
  node check-card.js pA.txt <CHECK-A-value>    must say MATCH.
  Repeat for B and C. Then: rm pA.txt pB.txt pC.txt && reset
  (This proves the kit's cards + checks on this device. The INK proof is the row protocol + the recovery checksum.)
  A single bad card is survivable — any 2 of 3 rebuild the key. The CHECK catches errors at recovery.`);
    process.exit(0);
  }
  else if (has("--split")) {
    // YAKUBU FIX: one photographed paper is worthless. 2-of-3 papers reconstruct.
    const papers = splitHex(privHex(k.privateKey));
    console.log(`PRIV SPLIT 2-of-3 — three papers, SEPARATE safe places. Any ONE paper alone = NOTHING.`);
    for (const p of papers) {
      const pc = qrChunks(p.shares[0] + "|" + p.shares[1]);
      console.log(`PAPER ${p.paper} QR-CHUNKS (${pc.length}):`);
      pc.forEach(c => console.log("  " + c));
    }
    console.log(`RECOVER LATER: node ceremony-kit.js combine --papers <paperA-file>,<paperB-file>`);
  } else {
    const chunks = qrChunks(privHex(k.privateKey));
    console.log(`PRIV-QR-CHUNKS (${chunks.length}) — WARNING: plaintext key, ONE photo of this paper compromises the seat. Prefer --split.`);
    chunks.forEach(c => console.log("  " + c));
  }
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

else if (cmd === "combine") {
  const files = (opt("--papers") || die("--papers <pA.txt>,<pB.txt> required (any 2 of 3)")).split(",");
  if (files.length !== 2) die("NEED EXACTLY 2 PAPERS (2-of-3 split)");
  const sharePairs = files.map(f => {
    const r = parsePaperFile(fs.readFileSync(f.trim(), "utf8"));
    if (r && r.error === "BAD_CARD") die("COMBINE REFUSED: file " + f + " is not a valid card (hex format: 96hex/96hex, or JSON chunk lines). Check for typos — run check-card.js", 3);
    return r;
  });
  const r = combineShares(sharePairs);
  if (r.error) die("COMBINE REFUSED: " + r.error, 3);
  console.log("KEY RECONSTRUCTED (2-of-3). QR chunks for the recovery session:");
  const chunks = qrChunks(r.keyHex);
  chunks.forEach(c => console.log("  " + c));
  console.log("\nRECOVERY WARNING: this session holds the live private key. Print/transfer, then close. Never save.");
}

else if (!cmd) die("usage: ceremony-kit.js plan|gen-key [--split-hex (hand-copy)]|manifest|act-planned|act-death|combine|verify-chain ...");
else die("unknown command: " + cmd);

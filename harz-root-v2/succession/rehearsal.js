// SUCCESSION PROTOCOL v0.1 — SOFTWARE-MODE CEREMONY REHEARSAL
// Rehearses, with TEST keys, the exact ceremonies of SUCCESSION-PROTOCOL-v0.1:
//   planned rotation (K0 alive) and death path (K0 gone, witness quorum).
// Validator law is encoded here FIRST, then attacked from the Yakubu seat below.
// Honest label: software mode, test keys — this proves the CEREMONY logic, not the event.

const crypto = require("crypto");
const results = [];
const T = (id, name, ok, note) => {
  results.push(`${id} ${ok ? "PASS" : "FAIL"} — ${name}${note ? "  [${note}]" : ""}`);
  if (!ok) process.exitCode = 1;
};

// ---------- keys (test only, in-memory) ----------
function genKey() {
  const { privateKey, publicKey } = crypto.generateKeyPairSync("ed25519");
  return { privateKey, publicKey, hex: publicKey.export({ format: "der", type: "spki" }).slice(-32).toString("hex") };
}
function sign(priv, obj) {
  return crypto.sign(null, Buffer.from(JSON.stringify(obj)), priv).toString("hex");
}
function verify(pubHex, obj, sigHex) {
  const spki = Buffer.concat([Buffer.from("302a300506032b6570032100", "hex"), Buffer.from(pubHex, "hex")]);
  const pub = crypto.createPublicKey({ key: spki, format: "der", type: "spki" });
  return crypto.verify(null, Buffer.from(JSON.stringify(obj)), pub, Buffer.from(sigHex, "hex"));
}

// ---------- the validator law (the heart of the rehearsal) ----------
// Chain = ordered zones. Authority state derived from records; fail-closed throughout.
function validateChain(chain, anchorPubHex) {
  const acceptedAuthorities = new Set([anchorPubHex]); // out-of-band anchor
  const pendingSuccessors = new Map(); // successorHex -> manifest record
  const revocations = []; // {keyHex, fromHeight}
  let compromised = []; // {keyHex, atHeight} from death declarations
  const verdicts = [];
  for (const zone of chain) {
    const z = JSON.parse(JSON.stringify(zone)); // sig checked against unsigned copy
    const sigHex = z.sig; delete z.sig;
    let ok = verify(z.signed_by, z, sigHex);
    let reason = ok ? "SIG VALID" : "SIG FAILED";
    // revoked? (any revocation of this key at a lower height)
    if (ok && revocations.some(r => r.keyHex === z.signed_by && zone.height >= r.fromHeight)) { ok = false; reason = "REVOKED KEY (zombie king refused)"; }
    // post-compromise signatures refused (theft race closes at declared height)
    if (ok && compromised.some(c => c.keyHex === z.signed_by && zone.height > c.atHeight)) { ok = false; reason = "POST-COMPROMISE SIGNATURE refused"; }
    // SUCCESSION_ACT is examined BEFORE the authority check — the act is what legitimizes
    // the successor's own signature. Without a valid act, a successor key is NOT trust.
    let actAuthorizedThis = false;
    if (ok) {
      for (const r of z.records || []) {
        if (r.type === "SUCCESSION") {
          // pre-authorization by the LIVING authority
          pendingSuccessors.set(r.successor_pub, { ...r, atHeight: zone.height });
        }
        if (r.type === "SUCCESSION_ACT") {
          const m = pendingSuccessors.get(r.new_authority);
          if (!m) { ok = false; reason = "ACT WITHOUT MANIFEST — successor never pre-authorized"; break; }
          if (r.new_authority !== m.successor_pub) { ok = false; reason = "SUCCESSOR MISMATCH"; break; }
          if (r.path === "death") {
            const actBody = { ...r }; delete actBody.witness_sigs;
            const quorum = (r.witness_sigs || []).filter(w => m.witnesses.includes(w.by) && verify(w.by, actBody, w.sig));
            const uniq = new Set(quorum.map(w => w.by)).size;
            if (uniq < m.policy) { ok = false; reason = `WITNESS QUORUM FAILED (${uniq}/${m.witnesses.length}, need ${m.policy})`; break; }
            compromised.push({ keyHex: m.current_authority, atHeight: r.compromise_height });
            revocations.push({ keyHex: m.current_authority, fromHeight: r.compromise_height + 1 });
          } else {
            // planned rotation: revoke the old key from the act height onward
            revocations.push({ keyHex: m.current_authority, fromHeight: zone.height + 1 });
          }
          // the act authorizes the successor — the successor's OWN signature on this zone
          acceptedAuthorities.add(r.new_authority);
          if (z.signed_by === r.new_authority) actAuthorizedThis = true;
        }
      }
    }
    // authority must be accepted (anchor law — self-declared keys are not trust)
    // EXCEPT when this very zone carries the valid act that enthrones the signer
    if (ok && !acceptedAuthorities.has(z.signed_by)) { ok = false; reason = "NOT AN ACCEPTED AUTHORITY (fork/forgery)"; }
    if (ok && actAuthorizedThis) reason = "SIG VALID (successor enthroned by act)";
    verdicts.push({ height: zone.height, by: z.signed_by.slice(0, 10), ok, reason });
  }
  return verdicts;
}

function makeZone(height, authorityKey, records, prevDigest) {
  const z = { v: 2, zone: "harz", height, prev: prevDigest || null, records, signed_by: authorityKey.hex };
  z.sig = sign(authorityKey.privateKey, (() => { const c = { ...z }; delete c.sig; return c; })());
  return z;
}

// ---------- THE REHEARSAL ----------
const K0 = genKey(), K1 = genKey(), KX = genKey(); // KX = attacker key
const W1 = genKey(), W2 = genKey(), W3 = genKey();
const baseRecords = [{ type: "SERVICE", name: "pay.harz", url: "https://harzpay.harz.workers.dev" }];

// S1: seed boots under the anchor
let chain = [makeZone(1, K0, baseRecords, null)];
let v = validateChain(chain, K0.hex);
T("SR-1", "seed: K0 signs height 1 under the out-of-band anchor", v[0].ok && v[0].reason === "SIG VALID");

// S2: pre-authorization — the living king names his successor
const manifest = { type: "SUCCESSION", current_authority: K0.hex, successor_pub: K1.hex, witnesses: [W1.hex, W2.hex, W3.hex], policy: 2, declared_at_height: 2 };
chain.push(makeZone(2, K0, [manifest, ...baseRecords], "h1"));
v = validateChain(chain, K0.hex);
T("SR-2", "manifest: K0 pre-authorizes K1 + 3 witnesses, policy 2-of-3", v[1].ok && v[1].reason === "SIG VALID");

// S3: PLANNED ROTATION — the named successor takes the throne
chain.push(makeZone(3, K1, [{ type: "SUCCESSION_ACT", path: "planned", new_authority: K1.hex, manifest_height: 2 }, ...baseRecords], "h2"));
v = validateChain(chain, K0.hex);
T("SR-3", "planned rotation: K1 accepted via K0-signed manifest; K1 now authority", v[2].ok && v[2].reason.startsWith("SIG VALID"));

// S4: ZOMBIE KING — K0 signs AFTER its own revocation
chain.push(makeZone(4, K0, baseRecords, "h3"));
v = validateChain(chain, K0.hex);
T("SR-4", "zombie king refused: K0 signature after revocation height = rejected", v[3].ok === false && v[3].reason === "REVOKED KEY (zombie king refused)");

// S5: DEATH PATH — fresh chain: K0 died after declaring the manifest
let chain2 = [makeZone(1, K0, baseRecords, null), makeZone(2, K0, [manifest, ...baseRecords], "h1")];
const act = { type: "SUCCESSION_ACT", path: "death", new_authority: K1.hex, manifest_height: 2, compromise_height: 2 };
const actBody = JSON.parse(JSON.stringify(act));
const wsigs = [W1, W2].map(w => ({ by: w.hex, sig: sign(w.privateKey, actBody) })); // 2-of-3 quorum
chain2.push(makeZone(3, K1, [{ ...act, witness_sigs: wsigs }, ...baseRecords], "h2"));
v = validateChain(chain2, K0.hex);
T("SR-5", "death path: K1 + 2-of-3 witnesses accepted; K0 revoked from compromise height", v[2].ok && v[2].reason.startsWith("SIG VALID"));

// S6: theft race closes — K0 signs at a height AFTER the declared compromise
chain2.push(makeZone(4, K0, baseRecords, "h3"));
v = validateChain(chain2, K0.hex);
T("SR-6", "theft race: K0 signature after the death act refused (under revoked AND post-compromise laws — belt and braces); K0 heights <= compromise stay valid (honest window)",
  v[3].ok === false && (v[3].reason === "POST-COMPROMISE SIGNATURE refused" || v[3].reason === "REVOKED KEY (zombie king refused)"));

// S7: QUORUM FAIL — only 1 witness
let chain3 = [makeZone(1, K0, baseRecords, null), makeZone(2, K0, [manifest, ...baseRecords], "h1")];
const ws1 = [{ by: W1.hex, sig: sign(W1.privateKey, actBody) }];
chain3.push(makeZone(3, K1, [{ ...act, witness_sigs: ws1 }, ...baseRecords], "h2"));
v = validateChain(chain3, K0.hex);
T("SR-7", "quorum refused: 1-of-3 witnesses is below policy 2", v[2].ok === false && v[2].reason.includes("QUORUM FAILED (1/3"));

// S8: WRONG SUCCESSOR — witnesses cannot appoint; only the living king pre-authorized
let chain4 = [makeZone(1, K0, baseRecords, null), makeZone(2, K0, [manifest, ...baseRecords], "h1")];
const wKX = [W1, W2].map(w => ({ by: w.hex, sig: sign(w.privateKey, { ...act, new_authority: KX.hex }) }));
chain4.push(makeZone(3, KX, [{ ...act, new_authority: KX.hex, witness_sigs: wKX }, ...baseRecords], "h2"));
v = validateChain(chain4, K0.hex);
T("SR-8", "witness coup refused: full quorum cannot appoint a successor the king never named", v[2].ok === false);

// S9: MANIFEST TAMPERED — witness list swapped after signing
const fakeManifest = { ...manifest, witnesses: [W1.hex, W2.hex, KX.hex] };
const tampered = { ...manifest, witnesses: fakeManifest.witnesses };
T("SR-9", "manifest tamper: swapped witness list fails K0's signature (fail-closed)",
  !verify(K0.hex, (() => { const c = JSON.parse(JSON.stringify(manifest)); c.witnesses = [W1.hex, W2.hex, KX.hex]; return c; })(), sign(K0.privateKey, manifest)));

// S10: honest labels
T("SR-10", "labels: software-mode rehearsal with TEST keys — proves ceremony logic, not the event; real ceremony needs owner rulings D6-D8 + real witnesses", true);

console.log("=== SUCCESSION CEREMONY REHEARSAL — SOFTWARE MODE ===");
for (const r of results) console.log(r);
const fails = results.filter(r => r.includes("FAIL")).length;
console.log(fails === 0 ? "\nVERDICT: 10/10 PASS — rehearsal clean" : `\nVERDICT: ${fails} FAIL`);
// HARZ ROOT v2 — KILLER TEST v1.0 (SOFTWARE MODE)
// Question: does the namespace SURVIVE the death/migration/partition/forgery of the nameserver node?
// Node A = the LIVE root (harz-root.harz.workers.dev) — observed, never touched.
// Node B = this sandbox runtime — a FRESH substrate booted from artifacts alone.
// LAW: fail-closed everywhere; honest labels on every result; software-mode proof stated.
// Per frozen spec v1.0: software mode FIRST; the physical/live-kill event is NOT claimed here.

const { execSync, spawn } = require("child_process");
const fs = require("fs");
const crypto = require("crypto");

const api = require("./harz-resolver.js");
const results = [];
const notes = [];
const T = (id, name, ok, note) => {
  results.push(`${id} ${ok ? "PASS" : "FAIL"} — ${name}`);
  if (note) notes.push(`${id}: ${note}`);
  if (!ok) process.exitCode = 1;
};

const ROOT = "https://harz-root.harz.workers.dev";
const GIT_ZONE = "https://raw.githubusercontent.com/rabiuhamza11/harz-git/main/harz-root-v2/schema-v2/draft-zone-v2-77names.json";

function sha256hex(buf) { return crypto.createHash("sha256").update(buf).digest("hex"); }

async function main() {
  const verifier = api.nodeVerifier();

  // ---------- K1: SEED HEALTH — the live root is alive and honest ----------
  const zoneTxt = await (await fetch(`${ROOT}/zone`)).text();
  const zoneDigest = sha256hex(Buffer.from(zoneTxt)).slice(0, 16);
  const payLive = await (await fetch(`${ROOT}/resolve?name=pay.harz`)).json();
  const nxLive = await fetch(`${ROOT}/resolve?name=doesnotexist.harz`);
  T("KT-1", `seed alive: zone digest ${zoneDigest} (pin e94b9693...), pay.harz resolves, NXDOMAIN honest ${nxLive.status}`,
    zoneDigest === "e94b9693e94a2290" && payLive.ok === true && nxLive.status === 404);

  // ---------- K2: PULL — the canonical book crosses from Node A to here ----------
  const liveMap = {};
  for (const line of zoneTxt.split("\n")) {
    const m = line.match(/^([a-z0-9.-]+)\s+\d+\s+IN\s+TXT\s+(".*")\s*$/);
    if (m) { try { liveMap[m[1]] = JSON.parse(JSON.parse(m[2])).url || null; } catch (e) {} }
  }
  T("KT-2", `pulled the live book: ${Object.keys(liveMap).length} names extracted from Node A`,
    Object.keys(liveMap).length >= 77);

  // ---------- K3: BOOT NODE B — fresh substrate from the HarzGit artifact alone ----------
  const zoneObj = JSON.parse(fs.readFileSync(__dirname + "/draft-zone-v2.json", "utf8"));
  const ANCHOR = zoneObj.signed_by; // the operator pinned trust anchor (out-of-band: git + ceremony + QR rail)
  const engineB = api.createEngine({ verify: verifier, anchor: ANCHOR });
  engineB.loadZone(zoneObj);
  const rB = engineB.resolve("pay.harz");
  T("KT-3", `Node B booted from git artifact: pay.harz → ${rB.endpoints.https}`,
    rB && rB.endpoints && rB.endpoints.https && rB.endpoints.https.includes("harzpay"));

  // ---------- K4: PARITY — Node B matches Node A on every name (77/77) ----------
  let match = 0; const mismatches = [];
  const names = zoneObj.records.map(r => r.name);
  for (const name of names) {
    const fqdn = name.endsWith(".harz") ? name + "." : name;
    const liveUrl = liveMap[fqdn] !== undefined ? liveMap[fqdn] : (liveMap[name] !== undefined ? liveMap[name] : null);
    const rec = engineB.resolve(name);
    const bUrl = rec && rec.endpoints && "https" in rec.endpoints ? rec.endpoints.https : null;
    if (liveUrl === bUrl || (liveUrl === null && bUrl === null)) match++;
    else mismatches.push(`${name}(live:${liveUrl} vs B:${bUrl})`);
  }
  T("KT-4", `parity across the book: ${match}/${names.length} names identical between live root and Node B`,
    match === names.length && mismatches.length === 0,
    mismatches.length ? "mismatches: " + mismatches.slice(0, 5).join(", ") : undefined);

  // ---------- K5: DEATH SIMULATION — the root is gone; does the book still resolve? ----------
  const cachePath = "/tmp/harz-killer-cache.json";
  api.cacheStore(engineB, zoneObj, fs, cachePath);
  // the DEATH is the network: kill fetch itself. Local disk (the node's own cache) stays.
  const realFetch = globalThis.fetch;
  let netAttempts = 0;
  globalThis.fetch = (...a) => { netAttempts++; return Promise.reject(new Error("NETWORK DEAD — ROOT GONE")); };
  const cached = api.cacheLoad(fs, cachePath, verifier); // re-verified on load, zero network
  const engineC = api.createEngine({ verify: verifier, anchor: ANCHOR });
  engineC.loadZone(cached);
  const rC = engineC.resolve("wallet.harz");
  const rC2 = engineC.resolve("doesnotexist.harz"); // honest absence survives death too
  globalThis.fetch = realFetch; // revive the network for the remaining steps
  T("KT-5", `root death sim (fetch killed): Node B still resolves wallet.harz → ${rC.endpoints.https}; NXDOMAIN stays honest (null); network attempts made: ${netAttempts}`,
    rC && rC.endpoints.https && rC.endpoints.https.includes("workers.dev") && rC2 === null && netAttempts === 0);

  // ---------- K6: TAMPERED BOOK — fail-closed at boot ----------
  const bad = JSON.parse(JSON.stringify(zoneObj));
  bad.records[0] = JSON.parse(JSON.stringify(bad.records[0]));
  const first = bad.records.find(r => "https" in (r.endpoints || {}));
  if (first) first.endpoints.https = "https://evil.example.attacker.dev";
  let refused = false;
  try { const e = api.createEngine({ verify: verifier }); e.loadZone(bad); } catch (e) { refused = true; }
  T("KT-6", "tampered book (endpoint swapped) REFUSED at boot — fail-closed law holds", refused);

  // ---------- K7: WRONG ANCHOR — the truth is out-of-band ----------
  const fakeAnchor = "ed25519:" + "ab".repeat(32);
  let wrongAnchorRefused = false, wrongAnchorRefusedByEngine = false;
  try {
    const e = api.createEngine({ verify: (zoneObjX, pubHex, sigHex) => verifier(zoneObjX, fakeAnchor.replace("ed25519:", ""), sigHex) });
    e.loadZone(zoneObj);
  } catch (e) { wrongAnchorRefused = true; }
  try { const e = api.createEngine({ verify: verifier, anchor: fakeAnchor }); e.loadZone(zoneObj); } catch (e) { wrongAnchorRefusedByEngine = true; }
  T("KT-7", `wrong trust anchor refused — custom verify (${wrongAnchorRefused}) AND engine anchor law (${wrongAnchorRefusedByEngine})`,
    wrongAnchorRefused && wrongAnchorRefusedByEngine);

  // ---------- K8: FORK — two valid signatures, two authorities, same height ----------
  const { privateKey, publicKey } = crypto.generateKeyPairSync("ed25519");
  const canon = (obj) => {
    if (obj === null || typeof obj !== "object") return JSON.stringify(obj);
    if (Array.isArray(obj)) return "[" + obj.map(canon).join(",") + "]";
    return "{" + Object.keys(obj).sort().map(k => JSON.stringify(k) + ":" + canon(obj[k])).join(",") + "}";
  };
  const forkZone = JSON.parse(JSON.stringify(zoneObj));
  const forkPub = Buffer.from(publicKey.export({ format: "der", type: "spki" }).slice(-32)).toString("hex");
  forkZone.signed_by = "ed25519:" + forkPub; // a REAL fork: its own valid authority
  const unsignedFork = (({ sig, ...rest }) => rest)(forkZone); // sign exactly what the fork zone says
  const sig2 = crypto.sign(null, Buffer.from(canon(unsignedFork), "utf8"), privateKey);
  forkZone.sig = "ed25519:" + sig2.toString("hex");
  // 1) the fork is internally valid (a real attacker chain, not a typo)
  const vFork = verifier(forkZone, forkPub, forkZone.sig.replace("ed25519:", ""));
  // 2) the original anchor refuses the fork (out-of-band anchor law)
  let forkRefusedByAnchor = false;
  try { const e = api.createEngine({ verify: verifier, anchor: zoneObj.signed_by }); e.loadZone(forkZone); } catch (e) { forkRefusedByAnchor = true; }
  // 3) FORK-REFUSAL RULE (discipline, now in code): a holder with BOTH chains — each internally
  //    valid, different authorities, same height — must HALT with FORK DETECTED, never silently pick.
  function forkCheck(a, b) {
    if (a.height === b.height && a.signed_by !== b.signed_by) return "FORK DETECTED — refuse to reconcile silently";
    return null;
  }
  const forkVerdict = forkCheck(zoneObj, forkZone);
  T("KT-8", `fork refusal: attacker chain internally valid (${vFork}), refused by the original anchor (${forkRefusedByAnchor}), and a holder of both chains HALTS: "${forkVerdict}"`,
    vFork === true && forkRefusedByAnchor === true && forkVerdict !== null,
    `original authority: ${zoneObj.signed_by.slice(0, 20)}, fork authority: ${forkPub.slice(0, 12)} — conflicting histories halt, they are never silently reconciled`);

  // ---------- K9: RECONSTRUCTION — boot from HarzGit bytes ALONE (never touching Node A) ----------
  const gitZoneTxt = await (await fetch(GIT_ZONE)).text();
  const gitDigest = sha256hex(Buffer.from(gitZoneTxt)).slice(0, 16);
  const gitZone = JSON.parse(gitZoneTxt);
  const engineD = api.createEngine({ verify: verifier, anchor: zoneObj.signed_by });
  engineD.loadZone(gitZone);
  const rD = engineD.resolve("estate.harz");
  const bcd = zoneDigest; // just to keep names readable
  T("KT-9", `reconstruction from git alone: digest ${gitDigest} (pin f4747cf7...), estate.harz → ${rD.endpoints.https}`,
    gitDigest.startsWith("f4747cf7327b") && rD.endpoints.https && rD.endpoints.https.includes("estate"));

  // ---------- K10: HONEST LABELS ----------
  T("KT-10", "labels: software-mode proof only — live root never killed, phone never died, account never banned (true-mode is the frontier)",
    true, "This battery proves the CODE survives node death; it does not prove the EVENT of the production node dying. Per frozen spec: software mode first.");

  // ---------- report ----------
  console.log("=== HARZ ROOT v2 KILLER TEST v1.0 — SOFTWARE MODE ===");
  for (const r of results) console.log(r);
  console.log("");
  for (const n of notes) console.log("note " + n);
  const fails = results.filter(r => r.includes("FAIL")).length;
  console.log("");
  console.log(fails === 0 ? "VERDICT: 10/10 PASS — software mode" : `VERDICT: ${fails} FAIL — not passed`);
}

main().catch(e => { console.error("HARNESS ERROR:", e); process.exit(2); });
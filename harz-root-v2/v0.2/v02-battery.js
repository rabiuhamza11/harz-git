// ROOT v0.2 ROTATION BATTERY — 12 tests against the LIVE height-1 book.
// Keys: TEST ONLY, generated in-memory at run time, never written anywhere. This proves
// the CEREMONY LOGIC (rotation law v1.1), not the event. The real ceremony is ink on Node 1.
// Run: node v02-battery.js

const Law = require("./rotation-law-v11.js");
const crypto = require("crypto");
const https = require("https");

function fetchJSON(url) {
  return new Promise((res, rej) => {
    https.get(url, { headers: { "User-Agent": "Mozilla/5.0 (Linux; Android 10; Infinix)" } }, r => {
      let b = ""; r.on("data", c => b += c); r.on("end", () => { try { res(JSON.parse(b)); } catch (e) { rej(e); } });
    }).on("error", rej);
  });
}
const genKey = () => { const { privateKey, publicKey } = crypto.generateKeyPairSync("ed25519");
  const spki = publicKey.export({ format: "der", type: "spki" });
  return { privateKey, hex: spki.subarray(spki.length - 32).toString("hex") }; };
const sign = (k, o) => Law.sign(k.privateKey, o);
const zoneBody = z => { const c = { ...z }; delete c.sig; return c; };

let pass = 0, fail = 0;
function T(id, name, ok, detail) {
  if (ok) { pass++; console.log("PASS " + id + "  " + name); }
  else { fail++; console.log("FAIL " + id + "  " + name + (detail ? "  << " + detail : "")); }
}

(async () => {
  // ---- the LIVE height-1 book: real prev digest + real 77 names (public data) ----
  const H1 = await fetchJSON("https://harz-root.harz.workers.dev/zone");
  const { sig, ...h1Unsigned } = H1;
  const H1_DIGEST = Law.canonicalDigest(h1Unsigned);
  const H1_NAMES = H1.records.map(r => r.name);
  console.log("LIVE H1: height " + H1.height + ", " + H1.records.length + " records, canonical digest " + H1_DIGEST.slice(0, 8) + "… (pinned: cac16833)");
  const PINNED_DIGEST = "cac16833f4d43fb59115786aebb2619f471e1bc353734ffdad6a757f90928fcb";
  if (H1_DIGEST !== PINNED_DIGEST) { console.log("ABORT: live height-1 digest does not match the pinned cac16833 — baseline moved, stop."); process.exit(1); }

  // ---- TEST cast: throwaway keys ----
  const K0 = genKey(), S = genKey(), KX = genKey();
  const W1 = genKey(), W2 = genKey(), W3 = genKey();
  const WPUBS = [W1.hex, W2.hex, W3.hex];
  const pinned = { anchorPubHex: K0.hex, h1DigestHex: PINNED_DIGEST, h1Names: H1_NAMES, witnessPubs: WPUBS, policy: 2 };

  // the real-shaped H2: manifest + act + same 77 names, successor-signed
  function makeH2(opts = {}) {
    const manifest = Law.buildManifest(K0.hex, opts.successor || S.hex, WPUBS, 2, 2, PINNED_DIGEST);
    if (!opts.noKingManifest) manifest.sig = opts.badManifestSig ? "00" + sign(K0, Law.manifestBody(manifest)).slice(2) : sign(K0, Law.manifestBody(manifest));
    const act = Law.buildActPlanned(opts.successor || S.hex, 2, PINNED_DIGEST);
    if (!opts.noKingAct) act.sig = opts.badActSig ? "00" + sign(K0, Law.actBody(act)).slice(2) : sign(K0, Law.actBody(act));
    const ws = opts.witnesses || [W1, W2];
    if (!opts.noWitness) act.witness_sigs = ws.map(w => ({ by: w.hex, sig: sign(w, Law.witnessPayload(act)) }));
    const records = [manifest, act, ...(opts.records || H1.records)];
    const z = { v: 2, zone: "harz", height: 2, prev: opts.prev || PINNED_DIGEST, records,
                signed_by: "ed25519:" + (opts.signer || S).hex, signed_at: "2026-09-21T00:00:00Z" };
    z.sig = sign(opts.signer || S, zoneBody(z));
    return z;
  }

  // T1 — the real thing: valid rotation accepted
  let v = Law.validateRotation(makeH2(), pinned);
  T("V02-1", "valid rotation: king-signed manifest+act, 2-of-3 witnesses, successor signs H2, prev=cac16833", v.ok, v.reason);
  T("V02-1b", "…and enthrones exactly the successor key", v.ok && v.authority === S.hex, v.reason);

  // T2 — zombie king: the old key signs height 2 → refused at the rotation height
  v = Law.validateRotation(makeH2({ signer: K0, successor: K0.hex }), pinned);
  T("V02-2", "zombie king: old key cannot sign height 2", !v.ok && /ZOMBIE/.test(v.reason), v.reason);

  // T3 — quorum fail: 1-of-3 witnesses
  v = Law.validateRotation(makeH2({ witnesses: [W1] }), pinned);
  T("V02-3", "witness quorum 1-of-3 refused", !v.ok && /QUORUM/.test(v.reason), v.reason);

  // T4 — no witness sigs at all
  v = Law.validateRotation(makeH2({ noWitness: true }), pinned);
  T("V02-4", "rotation without witnesses refused", !v.ok && /QUORUM/.test(v.reason), v.reason);

  // T5 — king-less act (the signature on the act is garbage)
  v = Law.validateRotation(makeH2({ badActSig: true }), pinned);
  T("V02-5", "act without a valid king signature refused", !v.ok && /ACT NOT SIGNED/.test(v.reason), v.reason);

  // T6 — THE HOLE FIX: king-less manifest (v1.0 would have crowned anyone)
  v = Law.validateRotation(makeH2({ noKingManifest: true }), pinned);
  T("V02-6", "manifest without a valid king signature refused (v1.0 hole closed)", !v.ok && /MANIFEST NOT SIGNED/.test(v.reason), v.reason);

  // T7 — witness coup: full quorum, but the king signed nothing at all
  v = Law.validateRotation(makeH2({ noKingManifest: true, noKingAct: true, witnesses: [W1, W2, W3] }), pinned);
  T("V02-7", "witness coup: 3-of-3 cannot enthrone without the king's ink", !v.ok && /MANIFEST NOT SIGNED/.test(v.reason), v.reason);

  // T8 — fork: prev digest mismatch
  v = Law.validateRotation(makeH2({ prev: "ab".padEnd(64, "0") }), pinned);
  T("V02-8", "prev digest mismatch refused (fork refused)", !v.ok && /PREV DIGEST/.test(v.reason), v.reason);

  // T9 — content tamper: 78th name sneaks in
  const extra = [...H1.records, { name: "evil.harz", endpoints: { https: "https://evil.example" } }];
  v = Law.validateRotation(makeH2({ records: extra }), pinned);
  T("V02-9", "name-set change in rotation zone refused (same 77 names law)", !v.ok && /NAME SET/.test(v.reason), v.reason);

  // T10 — witness signature tamper: flipped byte in a witness sig
  const z10 = makeH2();
  const s0 = z10.records[1].witness_sigs[0].sig;
  z10.records[1].witness_sigs[0].sig = (s0[0] === "0" ? "1" : "0") + s0.slice(1);
  z10.sig = sign(S, zoneBody(z10)); // attacker re-signs his own zone after tampering the witness sig
  v = Law.validateRotation(z10, pinned);
  T("V02-10", "tampered witness signature refused (quorum drops to 1-of-3)", !v.ok && /QUORUM/.test(v.reason), v.reason);

  // T11 — seat law: the successor tries to witness his own coronation
  const z11 = makeH2();
  z11.records[0].witnesses = [S.hex, W1.hex, W2.hex]; // the successor tries to seat himself
  z11.records[0].sig = sign(K0, Law.manifestBody(z11.records[0]));
  z11.sig = sign(S, zoneBody(z11));
  v = Law.validateRotation(z11, pinned);
  T("V02-11", "successor seated as witness refused (witness-set law)", !v.ok && /WITNESS SET/.test(v.reason), v.reason);

  // T12 — attacker with fully self-made materials (the v1.0 single-zone attack, end to end)
  const forged = makeH2({ successor: KX.hex, signer: KX, noKingManifest: true, noKingAct: true });
  v = Law.validateRotation(forged, pinned);
  T("V02-12", "self-crowned attacker key refused end-to-end", !v.ok, v.reason);

  console.log("\n" + (fail === 0 ? "VERDICT: " + pass + "/" + (pass + fail) + " ALL PASS" : "VERDICT: FAIL — " + fail + " failed"));
  console.log("HONEST LABELS: test keys in-memory; live H1 book (public data); ceremony logic only — the event needs the real ink ceremony on Node 1.");
  process.exit(fail === 0 ? 0 : 1);
})().catch(e => { console.error("BATTERY ERROR:", e); process.exit(1); });

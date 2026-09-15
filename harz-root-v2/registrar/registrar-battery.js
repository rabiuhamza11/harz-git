// HARZ REGISTRAR BATTERY v1.0 — the law proven before it is trusted
// Roles: Magani built, this battery verifies. Deterministic. TEST keys in-memory only.
(function () {
  "use strict";
  const path = require("path");
  const reg = require(path.resolve(__dirname, "harz-registrar.js"));
  const resolverPath = path.resolve(__dirname, "../resolver/harz-resolver.js");
  const api = require(resolverPath);
  const crypto = require("crypto");
  const results = [];
  const T = (name, ok) => results.push((ok ? "PASS" : "FAIL") + " — " + name);

  const canon = (o) => {
    if (o === null || typeof o !== "object") return JSON.stringify(o);
    if (Array.isArray(o)) return "[" + o.map(canon).join(",") + "]";
    return "{" + Object.keys(o).sort().map(k => JSON.stringify(k) + ":" + canon(o[k])).join(",") + "}";
  };
  const { privateKey, publicKey } = crypto.generateKeyPairSync("ed25519");
  const pubHex = publicKey.export({ format: "der", type: "spki" }).slice(-32).toString("hex");
  const sign = (z) => { const c = JSON.parse(JSON.stringify(z)); delete c.sig; return crypto.sign(null, Buffer.from(canon(c)), privateKey).toString("hex"); };

  // a small 5-name book (lab only; the live book stays 77 + untouched)
  const rec = (n) => ({ name: n + ".harz", service: n, identity: "PENDING", state: { height: 1 }, endpoints: { https: "https://" + n + ".harz.workers.dev" } });
  const names = ["pay", "store", "estate", "content", "dial"];
  const zone0 = { v: 2, zone: "harz", height: 5, prev: "h4", records: names.map(rec).sort((a, b) => (a.name < b.name ? -1 : 1)), signed_by: pubHex };
  zone0.sig = sign(zone0);

  // RG-1 register a valid name
  let z1 = null, ok1 = false;
  try {
    z1 = reg.applyOps(zone0, [{ op: "register", name: "wallet", service: "HARZ Wallet", endpoints: { https: "https://harz-crypto-wallet.harz.workers.dev" } }]);
    ok1 = z1.records.length === 6 && z1.height === 6 && !!z1.prev && !z1.sig;
  } catch (e) { }
  T("RG-1 register: valid name → next zone height+1, prev-digest linked, UNSIGNED (Node 1 signs)", ok1);

  // RG-2 duplicate refused
  let refused = false;
  try { reg.applyOps(zone0, [{ op: "register", name: "pay", endpoints: { https: "https://x.example" } }]); } catch (e) { refused = /exists/.test(e.message); }
  T("RG-2 duplicate register REFUSED (no shadowing)", refused);

  // RG-3 bad name refused
  refused = false;
  try { reg.applyOps(zone0, [{ op: "register", name: "Bad Name!", endpoints: { https: "https://x.example" } }]); } catch (e) { refused = /BAD_NAME/.test(e.message); }
  T("RG-3 invalid name REFUSED (label law)", refused);

  // RG-4 non-https endpoint refused
  refused = false;
  try { reg.applyOps(zone0, [{ op: "register", name: "evil", endpoints: { https: "http://not-https.example" } }]); } catch (e) { refused = /https/.test(e.message); }
  refused = refused || (() => { try { reg.applyOps(zone0, [{ op: "register", name: "evil", endpoints: { dial: "tel:0802" } }]); return false; } catch (e) { return true; } })();
  T("RG-4 non-https endpoint REFUSED (fail-closed, no invented schemes)", refused);

  // RG-5 personal-data identity refused (D3a)
  refused = false;
  try { reg.applyOps(zone0, [{ op: "register", name: "dox", identity: "Rabiu Hamza Mohammed", endpoints: { https: "https://x.example" } }]); } catch (e) { refused = /identity/.test(e.message); }
  T("RG-5 personal-data identity REFUSED (D3a pseudonymous law)", refused);

  // RG-6 retire requires owner act
  refused = false;
  try { reg.applyOps(zone0, [{ op: "retire", name: "store" }]); } catch (e) { refused = /OWNER act/.test(e.message); }
  T("RG-6 retire without owner flag REFUSED (D4a permanent — no automated loss)", refused);

  // RG-7 explicit owner retire works + count law holds
  let z7 = null, ok7 = false;
  try { z7 = reg.applyOps(zone0, [{ op: "retire", name: "store", by_owner: true }]); ok7 = z7.records.length === 4; } catch (e) { }
  T("RG-7 explicit owner retire → book 5→4, count law satisfied", ok7);

  // RG-8 shrink law at the source: unaccounted count impossible (register then retire same batch = accounted)
  let ok8 = false;
  try {
    const z = reg.applyOps(zone0, [{ op: "register", name: "temp", endpoints: { https: "https://t.example" } }, { op: "retire", name: "temp", by_owner: true }]);
    ok8 = z.records.length === 5;
  } catch (e) { }
  T("RG-8 batch register+owner-retire → net 5, every change accounted", ok8);

  // RG-9 update existing
  let ok9 = false;
  try {
    const z = reg.applyOps(zone0, [{ op: "update", name: "pay", endpoints: { https: "https://harzpay.harz.workers.dev/v2" } }]);
    ok9 = z.records.find(r => r.name === "pay.harz").endpoints.https === "https://harzpay.harz.workers.dev/v2";
  } catch (e) { }
  refused = (() => { try { reg.applyOps(zone0, [{ op: "update", name: "ghost", endpoints: { https: "https://g.example" } }]); return false; } catch (e) { return true; } })();
  T("RG-9 update works on existing names; ghost update REFUSED", ok9 && refused);

  // RG-10 the signed next zone loads in resolver v1.2 + resolves the new name; shrink/rollback guards accept it
  let ok10 = false;
  try {
    z1.sig = sign(z1);
    const engine = api.createEngine({ verify: api.nodeVerifier(), minRecords: 5, minHeight: 5 });
    const r = engine.loadZone(JSON.parse(JSON.stringify(z1)));
    ok10 = r.names === 6 && engine.resolve("wallet.harz").endpoints.https === "https://harz-crypto-wallet.harz.workers.dev";
  } catch (e) { }
  T("RG-10 signed next zone loads in resolver v1.2 (floors set) + new name resolves", ok10);

  // RG-11 determinism: same ops → identical canonical bytes
  let ok11 = false;
  try {
    const z1b = reg.applyOps(zone0, [{ op: "register", name: "wallet", service: "HARZ Wallet", endpoints: { https: "https://harz-crypto-wallet.harz.workers.dev" } }]);
    const a = reg.applyOps(zone0, [{ op: "register", name: "wallet", service: "HARZ Wallet", endpoints: { https: "https://harz-crypto-wallet.harz.workers.dev" } }]);
    ok11 = canon(a) === canon(z1b) && a.sig === undefined && JSON.stringify(a) === JSON.stringify(z1b);
  } catch (e) { }
  T("RG-11 determinism: same ops → byte-identical unsigned zone", ok11);

  // RG-12 tamper: prev digest must change if history lies
  let ok12 = false;
  try {
    const lying = JSON.parse(JSON.stringify(zone0)); lying.records[0].service = "liar"; // tamper WITHOUT re-signing → sig fails first
    try { reg.applyOps(lying, [{ op: "register", name: "x", endpoints: { https: "https://x.example" } }]); ok12 = false; } catch (e) { ok12 = /not a HARZ/.test(e.message) === false; }
    // direct prev-check: prev is computed over canonical(zone minus sig) — changing service changes prev
    const a = reg.applyOps(zone0, [{ op: "register", name: "x", endpoints: { https: "https://x.example" } }]);
    const tamperedZone = JSON.parse(JSON.stringify(zone0)); tamperedZone.records[0].service = "liar";
    const b = reg.applyOps(tamperedZone, [{ op: "register", name: "x", endpoints: { https: "https://x.example" } }]);
    ok12 = a.prev !== b.prev;
  } catch (e) { }
  T("RG-12 prev-digest chain: tampered history changes prev (fork visible, never silent)", ok12);

  console.log("=== HARZ REGISTRAR BATTERY v1.0 ===");
  console.log(results.join("\n"));
  const fails = results.filter(r => r.includes("FAIL")).length;
  console.log(fails === 0 ? "\nVERDICT: 12/12 PASS — registrar is registry-ready" : "\nVERDICT: " + fails + " FAIL");
  process.exitCode = fails === 0 ? 0 : 1;
})();

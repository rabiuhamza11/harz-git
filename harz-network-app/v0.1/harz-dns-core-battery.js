// HARZ DNS CORE BATTERY v0.1 — honest, workbench-only evidence.
// Runs every gate with my own process. No claims beyond what is proven here.
'use strict';
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');
const core = require('./harz-dns-core.js');
const ZONE_PATH = path.join(__dirname, '..', '..', 'harz-root-v2', 'zone-king', 'SIGNED-ZONE-V2.json');

let pass = 0, fail = 0;
function gate(id, cond, note) {
  if (cond) { pass++; console.log('PASS ' + id + (note ? ' — ' + note : '')); }
  else { fail++; console.log('FAIL ' + id + (note ? ' — ' + note : '')); }
}
function zoneObj() { return JSON.parse(fs.readFileSync(ZONE_PATH, 'utf8')); }

// --- B1 BOOT: sealed zone loads and verifies against every pin ---
const z = zoneObj();
const st = core.boot(z);
gate('B1-boot-verify', st.ok && st.digest === core.PIN.digest, 'digest ' + st.digest.slice(0, 8) + ', ' + st.records + ' records, height ' + st.height);

// --- B2 SWEEP: all 77 records answer, endpoint exact per frozen priority ---
const zRaw = JSON.parse(fs.readFileSync(ZONE_PATH, 'utf8'));
const PRI = ['https', 'harz-native', 'mesh', 'dial', 'local'];
let sweepOk = 0, sweepN = 0;
for (const r of zRaw.records) {
  sweepN++;
  const a = core.answer(st, r.name);
  const expect = PRI.map(k => r.endpoints[k]).find(Boolean) || '';
  if (a.status === 'NOERROR' && a.name === r.name && a.endpoint === expect) sweepOk++;
}
gate('B2-sweep-77', sweepOk === 77 && sweepN === 77, sweepOk + '/' + sweepN + ' names answered exact');

// --- B3 NXDOMAIN honesty: unknown names answered NXDOMAIN, never invented ---
const nx = ['ghost.harz', 'www.kasuwa.harz', 'harz', 'pay.hns', 'nonexistent-name-xyz.harz'];
const nxOk = nx.every(n => core.answer(st, n).status === 'NXDOMAIN');
const nxInvented = nx.some(n => core.answer(st, n).endpoint !== '');
const rootPos = core.answer(st, 'root.harz');
gate('B3-nxdomain', nxOk && !nxInvented && rootPos.status === 'NOERROR', nx.length + ' unknown names → honest NXDOMAIN; known name root.harz answered positive (test list corrected: root.harz is a real zone record)');

// --- B4 TAMPER: one byte changed in one record → REFUSED, nothing served ---
const zT = zoneObj();
zT.records[3].endpoints.https = zT.records[3].endpoints.https.replace('h', 'H');
const stT = core.boot(zT);
gate('B4-tamper-refused', stT.ok === false, 'refused: ' + stT.refused);

// --- B5 WRONG ANCHOR: zone signed by a foreign key → REFUSED ---
const zW = zoneObj();
zW.signed_by = 'ed25519:' + 'ab'.repeat(32);
// re-sign with a throwaway key so the sig is internally consistent but the anchor is wrong
const { generateKeyPairSync } = require('crypto');
const kp = generateKeyPairSync('ed25519');
const unsigned = Object.assign({}, zW); delete unsigned.sig;
const canon = Buffer.from(core.canonicalize(unsigned), 'utf8');
const sig = crypto.sign(null, canon, kp.privateKey);
zW.sig = 'ed25519:' + Buffer.from(sig).toString('hex');
const stW = core.boot(zW);
gate('B5-wrong-anchor', stW.ok === false && /WRONG ANCHOR/.test(stW.refused), stW.refused);

// --- B6 SIG SWAP: right anchor, forged signature → REFUSED ---
const zF = zoneObj();
zF.sig = 'ed25519:' + Buffer.from(crypto.randomBytes(64)).toString('hex');
const stF = core.boot(zF);
gate('B6-forged-sig', stF.ok === false, stF.refused);

// --- B7 AIRPLANE BY CONSTRUCTION: core source contains zero network primitives ---
const src = fs.readFileSync(path.join(__dirname, 'harz-dns-core.js'), 'utf8');
const netPrims = [/require\(['"]net['"]\)/, /require\(['"]https?['"]\)/, /require\(['"]dgram['"]\)/, /fetch\(/, /\.connect\(/, /\.request\(/];
const clean = !netPrims.some(re => re.test(src));
gate('B7-airplane-construction', clean, 'zero network primitives in core source');

// --- B8 DETERMINISM: same query 100x identical receipt; boot+answer idempotent ---
const a1 = core.answer(st, 'kasuwa.harz');
let detOk = true;
for (let i = 0; i < 100; i++) {
  const a = core.answer(st, 'kasuwa.harz');
  if (a.receipt !== a1.receipt || a.endpoint !== a1.endpoint) { detOk = false; break; }
}
gate('B8-determinism-100x', detOk, 'kasuwa.harz receipt stable: ' + a1.receipt.slice(7, 19) + (a1.status === 'NOERROR' ? ' → ' + a1.endpoint : ''));

// --- B9 REBOOT: fresh boot from disk, full sweep byte-identical receipts ---
const st2 = core.boot(zoneObj());
let rebootOk = st2.ok && st2.digest === st.digest;
if (rebootOk) {
  for (const r of zRaw.records) {
    if (core.answer(st, r.name).receipt !== core.answer(st2, r.name).receipt) { rebootOk = false; break; }
  }
}
gate('B9-reboot-identical', rebootOk, 'cold reload → identical answers + receipts');

// --- B10 RECEIPTS: machine-checkable on every answer incl NXDOMAIN ---
const rOk = /^sha256:[0-9a-f]{64}$/.test(core.answer(st, 'ai.harz').receipt) && /^sha256:[0-9a-f]{64}$/.test(core.answer(st, 'nope.harz').receipt);
gate('B10-receipts', rOk, 'every answer carries a 64-hex receipt');

console.log('\nVERDICT: ' + pass + '/' + (pass + fail) + (fail === 0 ? ' PASS — WORKBENCH ONLY. No field claim. No sovereignty claim. Airplane proof = construction-level until the filmed phone run.' : ' FAIL — DO NOT SHIP.'));
process.exit(fail === 0 ? 0 : 1);

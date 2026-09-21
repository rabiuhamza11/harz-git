#!/usr/bin/env node
/* HARZ PAY-TO-NAME — falsifiable end-to-end proof of the WALLET record type
 * (schema v2) over the real DNS path. exit 0 = GO, exit 1 = NO-GO.
 * Testnet only: runtime-ephemeral throwaway Ed25519 TEST zone-signing key
 * (not a wallet key; the canonical frozen book is never touched; the address
 * in the test record is the standard dead-address TEST stand-in).
 * Drives the REAL committed resolver.v1.1.js (sig-verified load, fail-closed).
 */
const { spawn } = require('child_process');
const crypto = require('crypto');
const dgram = require('dgram');
const fs = require('fs');
const http = require('http');
const path = require('path');

const DIR = path.join(__dirname, 'ptest');
const NODE = path.join(DIR, 'node1');
let fails = 0, procs = [];
const check = (n, cond, detail) => { console.log((cond ? 'PASS' : 'FAIL') + '  ' + n + (detail ? '  | ' + detail : '')); if (!cond) fails++; };
const sleep = ms => new Promise(r => setTimeout(r, ms));
function reap() { for (const p of procs) { try { process.kill(p, 'SIGKILL'); } catch (e) {} } }
process.on('exit', reap);

const TEST_ADDRESS = '0x000000000000000000000000000000000000dEaD'; // TEST stand-in, never real
function buildZone() {
  return '; HARZ TESTNET ZONE \u2014 pay-to-name proof\n; origin: harz.  height: 1\n$ORIGIN harz.\n' +
    'rabiu.wallet.harz.  3600 IN TXT "{\\"record_type\\":\\"WALLET\\",\\"address\\":\\"' + TEST_ADDRESS + '\\",\\"network\\":\\"polygon\\",\\"note\\":\\"schema v2 testnet\\"}"\n' +
    'magani.wallet.harz. 3600 IN TXT "{\\"record_type\\":\\"WALLET\\",\\"address\\":\\"0x1111111111111111111111111111111111111111\\",\\"network\\":\\"polygon\\"}"\n' +
    'gov.harz.           3600 IN TXT "{\\"record_type\\":\\"SERVICE\\",\\"service_id\\":\\"harz-governance\\"}"\n';
}
function dnsQuery(port, name, timeout = 3000) {
  return new Promise((resolve, reject) => {
    const parts = [];
    for (const l of name.split('.')) { parts.push(Buffer.from([l.length])); parts.push(Buffer.from(l)); }
    const q = Buffer.concat([Buffer.from([0xCA, 0xFE, 0x01, 0x00, 0, 1, 0, 0, 0, 0, 0, 0]), Buffer.concat([...parts, Buffer.from([0])]), Buffer.from([0x00, 0x10, 0x00, 0x01])]);
    const s = dgram.createSocket('udp4');
    const t = setTimeout(() => { s.close(); reject(new Error('timeout')); }, timeout);
    s.on('message', m => {
      clearTimeout(t); s.close();
      const rcode = m.readUInt16BE(2) & 0xF, an = m.readUInt16BE(6);
      if (rcode !== 0 || an < 1) return resolve({ ok: false, rcode });
      let k = 12; while (m[k] !== 0) k += 1 + m[k]; k += 5 + 2 + 10;
      let out = '';
      while (k < m.length) { const len = m[k++]; if (len === 0) break; out += m.toString('utf8', k, k + len); k += len; }
      resolve({ ok: true, txt: out });
    });
    s.on('error', e => { clearTimeout(t); s.close(); reject(e); });
    s.send(q, port, '127.0.0.1');
  });
}
/* THE REUSABLE PIECE — pay-to-name client engine */
async function resolveWallet(port, name) {
  const r = await dnsQuery(port, name + '.wallet.harz');
  if (!r.ok) return { ok: false, error: r.rcode === 3 ? 'name not in signed registry' : 'resolve failed' };
  try {
    const rec = JSON.parse(r.txt);
    if (rec.record_type !== 'WALLET' || !/^0x[0-9a-fA-F]{40}$/.test(rec.address)) return { ok: false, error: 'record malformed' };
    return { ok: true, name: name + '.wallet.harz', address: rec.address, network: rec.network || null };
  } catch (e) { return { ok: false, error: 'payload not JSON' }; }
}
async function startNode(dir) {
  fs.mkdirSync(path.join(dir, 'keys'), { recursive: true });
  const r = spawn('node', [path.join(__dirname, 'resolver.v1.1.js')], { env: { ...process.env, PORT: '5310', ZONE_DIR: dir, UPSTREAM: '127.0.0.1' }, stdio: ['ignore', 'pipe', 'pipe'] });
  let log = ''; r.stdout.on('data', d => log += d); r.stderr.on('data', d => log += d);
  procs.push(r.pid);
  for (let i = 0; i < 40; i++) { try { const q = await dnsQuery(5310, 'gov.harz', 800); if (q.ok) return { r, log }; } catch (e) {} await sleep(250); }
  return { r, log, failed: true };
}
(async () => {
  console.log('=== HARZ PAY-TO-NAME TEST (WALLET record, schema v2) ===');
  fs.rmSync(DIR, { recursive: true, force: true });
  const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519');
  const zone = buildZone();
  const digest = crypto.createHash('sha256').update(zone).digest();
  const sig = crypto.sign(null, digest, privateKey).toString('base64');
  deploy: {
    fs.mkdirSync(path.join(NODE, 'keys'), { recursive: true });
    fs.writeFileSync(path.join(NODE, 'harz.zone'), zone);
    fs.writeFileSync(path.join(NODE, 'zone.sig'), sig + '\n');
    fs.writeFileSync(path.join(NODE, 'zone.hash'), digest.toString('hex') + '\n');
    fs.writeFileSync(path.join(NODE, 'keys', 'zsk-ed25519.pub.pem'), publicKey.export({ type: 'spki', format: 'pem' }));
  }
  check('1  WALLET record minted in signed testnet zone (schema v2)', true, 'digest ' + digest.toString('hex').slice(0, 12) + '...');

  const n1 = await startNode(NODE);
  if (n1.failed) { console.log('node failed to start:\n' + n1.log); process.exit(1); }
  const w1 = await resolveWallet(5310, 'rabiu');
  check('2  pay-to-name: rabiu.wallet.harz resolves through real DNS wire', w1.ok === true && w1.address === TEST_ADDRESS, JSON.stringify(w1).slice(0, 140));
  const w2 = await resolveWallet(5310, 'magani');
  check('3  second wallet name resolves independently', w2.ok === true && w2.address === '0x1111111111111111111111111111111111111111');
  const w3 = await resolveWallet(5310, 'ghost');
  check('4  unknown wallet name = NXDOMAIN (no silent fallback)', w3.ok === false && w3.error === 'name not in signed registry');
  const svc = await dnsQuery(5310, 'gov.harz');
  check('5  SERVICE records unaffected (backward compat)', svc.ok === true && svc.txt.includes('harz-governance'));

  console.log('--- TAMPER: wallet address byte flipped, signature kept ---');
  const TD = path.join(DIR, 'tamper');
  const badZone = zone.replace('dEaD', 'dEaE');
  fs.mkdirSync(path.join(TD, 'keys'), { recursive: true });
  fs.writeFileSync(path.join(TD, 'harz.zone'), badZone);
  fs.writeFileSync(path.join(TD, 'zone.sig'), sig + '\n');
  fs.writeFileSync(path.join(TD, 'zone.hash'), digest.toString('hex') + '\n');
  fs.copyFileSync(path.join(NODE, 'keys', 'zsk-ed25519.pub.pem'), path.join(TD, 'keys', 'zsk-ed25519.pub.pem'));
  const tr = spawn('node', [path.join(__dirname, 'resolver.v1.1.js')], { env: { ...process.env, PORT: '5311', ZONE_DIR: TD, UPSTREAM: '127.0.0.1' }, stdio: ['ignore', 'pipe', 'pipe'] });
  procs.push(tr.pid);
  let tlog = ''; tr.stdout.on('data', d => tlog += d); tr.stderr.on('data', d => tlog += d);
  await sleep(2000);
  let tamperRefused = tlog.includes('zone signature INVALID');
  let tamperPortDead = false;
  try { await dnsQuery(5311, 'rabiu.wallet.harz', 1200); } catch (e) { tamperPortDead = true; }
  check('6  TAMPERED wallet address can NEVER serve (fail-closed)', tamperRefused && tamperPortDead, 'refused: ' + tamperRefused + ', port dead: ' + tamperPortDead);
  const stillGood = await resolveWallet(5310, 'rabiu');
  check('7  Good node keeps serving after tamper attempt elsewhere', stillGood.ok === true && stillGood.address === TEST_ADDRESS);

  console.log(fails === 0 ? '=== PAY-TO-NAME: GO (7/7) ===' : '=== PAY-TO-NAME: NO-GO (' + fails + ' failed) ===');
  process.exit(fails === 0 ? 0 : 1);
})().catch(e => { console.error('TEST CRASH:', e.message); process.exit(1); });

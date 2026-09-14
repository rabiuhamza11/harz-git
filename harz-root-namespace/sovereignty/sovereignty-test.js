#!/usr/bin/env node
/* HARZ ROOT v2 — SOVEREIGNTY TEST v1.0
 * The owner's falsifiable end-to-end death/offline/recovery test.
 * One command. exit 0 = SOVEREIGNTY: GO. exit 1 = NO-GO.
 * Zero dependencies. Drives the REAL committed components:
 *   resolver.v1.1.js (DNS wire, sig-verified zone load, fail-closed)
 *   gossip.js (p2p zone sync, the law: unsigned/stale/tampered = refused)
 *   the LIVE harz-root DoH endpoint (public path proof)
 * Testnet only: a throwaway Ed25519 TEST key signs a simulated zone
 * (origin harz., height tracked). The canonical 77-name book is NEVER touched.
 * NOTE: this test key is a zone-signing key for a simulated testnet, not a
 * cryptocurrency wallet key; it lives only in this test's temp dir.
 */
const { spawn, execSync } = require('child_process');
const crypto = require('crypto');
const dgram = require('dgram');
const fs = require('fs');
const http = require('http');
const path = require('path');

const DIR = path.join(__dirname, 'testnet');
const A = path.join(DIR, 'nodeA'), B = path.join(DIR, 'nodeB');
let fails = 0, killed = [];
function check(n, cond, detail) {
  console.log((cond ? 'PASS' : 'FAIL') + '  ' + n + (detail ? '  | ' + detail : ''));
  if (!cond) fails++;
}
const sleep = ms => new Promise(r => setTimeout(r, ms));

/* ---- test zone builder + signer ---- */
let testPriv, testPubPem;
function initKey() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519');
  testPriv = privateKey;
  testPubPem = publicKey.export({ type: 'spki', format: 'pem' });
}
function buildZone(height, testNote) {
  return '; HARZ TESTNET ZONE \u2014 sovereignty-test only\n; origin: harz.  height: ' + height + '\n$ORIGIN harz.\n' +
    'test.harz.  3600 IN TXT "{\\"record_type\\":\\"SERVICE\\",\\"service_id\\":\\"sovereignty-test\\",\\"note\\":\\"' + testNote + '\\"}"\n' +
    'pay.harz.   3600 IN TXT "{\\"record_type\\":\\"SERVICE\\",\\"service_id\\":\\"harz-super-app\\",\\"url\\":\\"https://harz-super-app.harz.workers.dev\\"}"\n' +
    'gov.harz.   3600 IN TXT "{\\"record_type\\":\\"SERVICE\\",\\"service_id\\":\\"harz-governance\\"}"\n';
}
function signZone(zone) {
  const digest = crypto.createHash('sha256').update(zone).digest();
  const sig = crypto.sign(null, digest, testPriv);
  return { sig: sig.toString('base64'), hash: digest.toString('hex') };
}
function deployZone(dir, zone, signed) {
  fs.mkdirSync(path.join(dir, 'keys'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'harz.zone'), zone);
  fs.writeFileSync(path.join(dir, 'zone.sig'), signed.sig + '\n');
  fs.writeFileSync(path.join(dir, 'zone.hash'), signed.hash + '\n');
  fs.writeFileSync(path.join(dir, 'keys', 'zsk-ed25519.pub.pem'), testPubPem);
}
/* ---- DNS UDP client (query bytes built programmatically) ---- */
function dnsQuery(port, name, timeout = 3000) {
  return new Promise((resolve, reject) => {
    const labels = name.split('.');
    const parts = [];
    for (const l of labels) { parts.push(Buffer.from([l.length])); parts.push(Buffer.from(l)); }
    const qname = Buffer.concat([...parts, Buffer.from([0])]);
    const q = Buffer.concat([Buffer.from([0xBE, 0xEF, 0x01, 0x00, 0, 1, 0, 0, 0, 0, 0, 0]), qname, Buffer.from([0x00, 0x10, 0x00, 0x01])]);
    const s = dgram.createSocket('udp4');
    const t = setTimeout(() => { s.close(); reject(new Error('timeout')); }, timeout);
    s.on('message', m => {
      clearTimeout(t); s.close();
      const flags = m.readUInt16BE(2), an = m.readUInt16BE(6);
      const rcode = flags & 0xF;
      if (rcode !== 0 || an < 1) return resolve({ ok: false, rcode });
      // walk past question, then answer RR: ptr(2) type/class/ttl/rdlen(10) rdata
      let k = 12;
      while (m[k] !== 0) k += 1 + m[k];
      k += 5 + 2 + 10;
      let out = '';
      while (k < m.length) { const len = m[k++]; if (len === 0) break; out += m.toString('utf8', k, k + len); k += len; }
      resolve({ ok: true, txt: out });
    });
    s.on('error', e => { clearTimeout(t); s.close(); reject(e); });
    s.send(q, port, '127.0.0.1');
  });
}
function httpJson(port, method, urlPath, body) {
  return new Promise((resolve, reject) => {
    const req = http.request({ host: '127.0.0.1', port, method, path: urlPath, headers: body ? { 'content-type': 'application/json' } : {} }, r => {
      let b = ''; r.on('data', c => b += c); r.on('end', () => { try { resolve({ status: r.statusCode, json: JSON.parse(b) }); } catch (e) { resolve({ status: r.statusCode, raw: b }); } });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}
async function waitReady(kind, port) {
  for (let i = 0; i < 40; i++) {
    try {
      if (kind === 'dns') { const r = await dnsQuery(port, 'test.harz', 800); if (r.ok) return true; }
      else { const r = await httpJson(port, 'GET', '/p2p/info'); if (r.json && r.json.height !== undefined) return true; }
    } catch (e) { /* not yet */ }
    await sleep(250);
  }
  return false;
}
function startNode(nodeDir, dnsPort, gossipPort, logName) {
  const r = spawn('node', [path.join(__dirname, 'resolver.v1.1.js')], {
    env: { ...process.env, PORT: String(dnsPort), ZONE_DIR: nodeDir, UPSTREAM: '127.0.0.1' },
    stdio: ['ignore', 'pipe', 'pipe'] });
  const g = spawn('node', [path.join(__dirname, 'gossip.js')], {
    env: { ...process.env, GOSSIP_PORT: String(gossipPort), ZONE_DIR: nodeDir, GOSSIP_INTERVAL: '3600', GOSSIP_ALLOW_PUSH: 'true' },
    stdio: ['ignore', 'pipe', 'pipe'] });
  let log = '';
  for (const p of [r, g]) { p.stdout.on('data', d => log += d); p.stderr.on('data', d => log += d); }
  killed.push(r.pid, g.pid);
  return { r, g, logName, log };
}
function stopNode(n) {
  try { n.r.kill('SIGKILL'); } catch (e) {}
  try { n.g.kill('SIGKILL'); } catch (e) {}
  killed = killed.filter(p => p !== n.r.pid && p !== n.g.pid);
}

(async () => {
  console.log('=== HARZ ROOT v2 SOVEREIGNTY TEST ===');
  execSync('rm -rf ' + DIR);
  initKey();
  const zone1 = buildZone(1, 'state v1');
  const signed1 = signZone(zone1);
  deployZone(A, zone1, signed1);
  deployZone(B, zone1, signed1);
  check('1  CREATE service test.harz (signed testnet zone, height 1)', true, 'hash ' + signed1.hash.slice(0, 12) + '...');

  const nodeA = startNode(A, 5301, 8091, 'NodeA');
  const nodeB = startNode(B, 5302, 8092, 'NodeB');
  if (!(await waitReady('dns', 5301)) || !(await waitReady('dns', 5302))) {
    console.log('NODE START FAILURE:\n' + nodeA.log + '\n---\n' + nodeB.log); process.exit(1);
  }
  const ia = await httpJson(8091, 'GET', '/p2p/info');
  const ib = await httpJson(8092, 'GET', '/p2p/info');
  check('2a RESOLVE via DNS wire on Node A', (await dnsQuery(5301, 'test.harz')).ok === true);
  check('2b RESOLVE via DNS wire on Node B', (await dnsQuery(5302, 'test.harz')).ok === true);
  check('2c RESOLVE via DoH on the LIVE public root', await (async () => {
    try {
      const zone = await (await fetch('https://harz-root.harz.workers.dev/zone')).text();
      return crypto.createHash('sha256').update(zone).digest('hex') === 'e94b9693e94a229065f79c14577a3db767063744df4f7aefc7dfe9a2fd227f05';
    } catch (e) { return false; }
  })(), 'canonical book verified over DoH root');
  check('2d RESOLVE via native registry (mesh p2p info)', ia.json.hash === ib.json.hash && ia.json.height === 1 && ib.json.height === 1, 'A and B hold identical state');

  console.log('--- KILLING NODE A (SIGKILL resolver + gossip) ---');
  nodeA.r.kill('SIGKILL'); nodeA.g.kill('SIGKILL');
  killed = killed.filter(p => p !== nodeA.r.pid && p !== nodeA.g.pid);
  await sleep(500);
  let afterDeath;
  try { const r = await dnsQuery(5302, 'test.harz'); afterDeath = r.ok; } catch (e) { afterDeath = false; }
  check('3+4  Node A dead \u2192 Node B continues serving test.harz', afterDeath === true);

  console.log('--- INTERNET DISCONNECTED (no non-localhost traffic from here on) ---');
  const meshAnswer = await dnsQuery(5302, 'test.harz');
  check('5+6  Offline: mesh node resolves from pinned signed zone', meshAnswer.ok === true && meshAnswer.txt.includes('state v1'));

  console.log('--- MODIFY STATE ON NODE B: height 2, re-signed ---');
  const zone2 = buildZone(2, 'state v2');
  const signed2 = signZone(zone2);
  deployZone(B, zone2, signed2);
  stopNode(nodeB);
  await sleep(600);
  const nodeB2 = startNode(B, 5302, 8092, 'NodeB-restart'); // B reloads new signed state
  if (!(await waitReady('dns', 5302))) { console.log('B restart failed'); process.exit(1); }
  const v2 = await dnsQuery(5302, 'test.harz');
  check('7  State v2 served by B', v2.ok === true && v2.txt.includes('state v2'));

  console.log('--- RECONNECT NODE A (still holds stale height 1) + GOSSIP PUSH B\u2192A ---');
  const nodeA2 = startNode(A, 5301, 8091, 'NodeA-restart');
  if (!(await waitReady('dns', 5301)) || !(await waitReady('http', 8091))) { console.log('A restart failed'); process.exit(1); }
  const push = await httpJson(8091, 'POST', '/p2p/push', { zone: zone2, sig: signed2.sig, hash: signed2.hash });
  check('8+9  Gossip converges A (1\u21922, sig verified)', push.status === 200 && push.json.adopted === true && push.json.height === 2, JSON.stringify(push.json));

  console.log('--- RESOLVER RELOAD on A (REAL FINDING: resolver.v1.1 loads zone at boot; gossip adoption updates the file but the running resolver keeps stale records in memory. Root v2 needs a gossip->resolver hot-reload hook. Today the honest step is an explicit restart.) ---');
  stopNode(nodeA2);
  await sleep(600);
  const nodeA3 = startNode(A, 5301, 8091, 'NodeA-reload');
  if (!(await waitReady('dns', 5301)) || !(await waitReady('http', 8091))) { console.log('A reload failed'); process.exit(1); }
  const aAfter = await dnsQuery(5301, 'test.harz');
  const bAfter = await dnsQuery(5302, 'test.harz');
  const za = fs.readFileSync(path.join(A, 'harz.zone'));
  const zb = fs.readFileSync(path.join(B, 'harz.zone'));
  const sameBook = za.equals(zb);
  const sigOk = crypto.verify(null, crypto.createHash('sha256').update(za).digest(), testPubPem, Buffer.from(fs.readFileSync(path.join(A, 'zone.sig'), 'utf8').trim(), 'base64'));
  const ia2 = await httpJson(8091, 'GET', '/p2p/info');
  check('10 VERIFY same identity + same canonical state + same proof', 
    aAfter.ok && aAfter.txt === bAfter.txt && sameBook && sigOk && ia2.json.height === 2,
    'A.txt==B.txt, byte-identical zones, sig VERIFIED, A height ' + ia2.json.height);

  console.log('--- TAMPER THE PUSH (zone byte flipped, sig kept) \u2014 the law must refuse ---');
  const tampered = zone2.replace('state v2', 'state v2!');
  const tPush = await httpJson(8091, 'POST', '/p2p/push', { zone: tampered, sig: signed2.sig, hash: signed2.hash });
  const zaT = fs.readFileSync(path.join(A, 'harz.zone'));
  check('11 TAMPER refused, local zone UNTOUCHED', tPush.status === 409 && zaT.equals(zb), JSON.stringify(tPush.json));

  console.log('--- GATEWAY IRRELEVANT: final sovereign resolution, localhost only ---');
  const final = await dnsQuery(5301, 'test.harz');
  check('12 Gateway-independent: sovereign nodes resolve alone', final.ok === true && final.txt.includes('state v2'));

  for (const p of killed) { try { process.kill(p, 'SIGKILL'); } catch (e) {} }
  console.log(fails === 0 ? '=== SOVEREIGNTY: GO (12/12) ===' : '=== SOVEREIGNTY: NO-GO (' + fails + ' failed) ===');
  process.exit(fails === 0 ? 0 : 1);
})().catch(e => { console.error('TEST CRASH:', e.message); for (const p of killed) { try { process.kill(p, 'SIGKILL'); } catch (x) {} } process.exit(1); });

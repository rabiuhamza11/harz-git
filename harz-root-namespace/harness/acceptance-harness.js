#!/usr/bin/env node
/* HARZ MESH ACCEPTANCE HARNESS v1.0 (bridge seat)
 * Eight checks, one command. exit 0 = MESH ACCEPTANCE: GO. exit 1 = NO-GO.
 * The law: a node joins the mesh only through this gate. The gate must be able
 * to refuse — a corrupted zone must fail CHECK 1 and the whole run.
 *
 * Run from a suite dir containing:
 *   harz.zone, zone.sig, zone.hash, keys/zsk-ed25519.pub.pem
 *   resolver.js, dial-gateway.js, gossip.js
 *   harz.zone.draft17, zone.sig.draft17, zone.hash.draft17  (old-height archive for gossip nodes)
 * Zero dependencies: Node built-ins only. Every spawned service is killed before exit.
 */
const crypto = require('crypto');
const dgram = require('dgram');
const fs = require('fs');
const http = require('http');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');

const SUITE = process.env.SUITE_DIR || __dirname;
const RESOLVER_PORT = 5350, DIAL_PORT = 8791, GOSSIP_A = 8091, GOSSIP_B = 8092, GOSSIP_C = 8093;
const children = [];
const results = [];

function check(n, label, ok, detail) {
  results.push({ n, label, ok });
  console.log((ok ? 'PASS' : 'FAIL') + ' CHECK ' + n + ' — ' + label + (detail ? '  [' + detail + ']' : ''));
  return ok;
}

function start(cmd, args, env, log) {
  const c = spawn(cmd, args, { cwd: SUITE, env: { ...process.env, ...env }, stdio: ['ignore', fs.openSync(path.join(SUITE, log), 'w'), 'ignore'] });
  children.push(c);
  return c;
}

function cleanup() {
  for (const c of children) { try { c.kill('SIGKILL'); } catch (e) {} }
}
process.on('exit', cleanup);
process.on('SIGINT', () => { cleanup(); process.exit(130); });

function udpQuery(name, port, timeoutMs) {
  return new Promise(res => {
    const labels = name.replace(/\.$/, '').split('.');
    const qname = Buffer.concat([...labels.map(l => Buffer.concat([Buffer.from([l.length]), Buffer.from(l)])), Buffer.from([0])]);
    const head = Buffer.alloc(12);
    head.writeUInt16BE(0xACC1, 0); head.writeUInt16BE(0x0100, 2); head.writeUInt16BE(1, 4);
    const qe = Buffer.alloc(4); qe.writeUInt16BE(16, 0); qe.writeUInt16BE(1, 2);
    const s = dgram.createSocket('udp4');
    const t = setTimeout(() => { s.close(); res({ timeout: true }); }, timeoutMs || 3000);
    s.on('message', ans => {
      clearTimeout(t); s.close();
      const rcode = ans.readUInt16BE(2) & 0xF, an = ans.readUInt16BE(6);
      let txt = '';
      if (an > 0) {
        let off = 12; while (ans[off] !== 0 && off < ans.length) off += 1 + ans[off];
        off += 7;
        const rdlen = ans.readUInt16BE(off + 8);
        let p = off + 10; const end = p + rdlen;
        while (p < end) { const len = ans[p]; txt += ans.toString('utf8', p + 1, p + 1 + len); p += 1 + len; }
      }
      res({ rcode, an, txt });
    });
    s.send(Buffer.concat([head, qname, qe]), port, '127.0.0.1');
  });
}

function httpRequest(port, p, method, body, timeoutMs) {
  return new Promise(res => {
    const data = body ? JSON.stringify(body) : null;
    const req = http.request({ host: '127.0.0.1', port, path: p, method: method || 'GET',
      headers: data ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } : {} }, r => {
      let b = ''; r.on('data', c => b += c);
      r.on('end', () => { try { res({ code: r.statusCode, json: JSON.parse(b) }); } catch (e) { res({ code: r.statusCode, text: b }); } });
    });
    req.on('error', () => res(null));
    req.setTimeout(timeoutMs || 5000, () => { req.destroy(); res(null); });
    if (data) req.write(data);
    req.end();
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function tempZoneDir(fromZone, fromSig, fromHash) {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'harz-harness-'));
  fs.copyFileSync(path.join(SUITE, fromZone), path.join(d, 'harz.zone'));
  fs.copyFileSync(path.join(SUITE, fromSig), path.join(d, 'zone.sig'));
  fs.copyFileSync(path.join(SUITE, fromHash), path.join(d, 'zone.hash'));
  fs.mkdirSync(path.join(d, 'keys'));
  fs.copyFileSync(path.join(SUITE, 'keys', 'zsk-ed25519.pub.pem'), path.join(d, 'keys', 'zsk-ed25519.pub.pem'));
  return d;
}

(async () => {
  const zone = fs.readFileSync(path.join(SUITE, 'harz.zone'), 'utf8');
  const sig = Buffer.from(fs.readFileSync(path.join(SUITE, 'zone.sig'), 'utf8').trim(), 'base64');
  const pub = fs.readFileSync(path.join(SUITE, 'keys', 'zsk-ed25519.pub.pem'), 'utf8');
  const hash = crypto.createHash('sha256').update(zone).digest('hex');

  /* CHECK 1: zone signature (Ed25519 over sha256) — THE gate */
  let ok1 = false;
  try { ok1 = crypto.verify(null, Buffer.from(hash, 'hex'), pub, sig); } catch (e) { ok1 = false; }
  check(1, 'zone signature Ed25519 VERIFIED over sha256(zone)', ok1, hash.slice(0, 12) + '…');
  if (!ok1) {
    console.log('');
    console.log('MESH ACCEPTANCE: NO-GO — unsigned or tampered zone can never pass this gate.');
    process.exit(1);
  }

  /* CHECK 2 + 3: resolver answers + NXDOMAIN (resolver spawned locally) */
  start('node', ['resolver.js'], { PORT: String(RESOLVER_PORT), ZONE_DIR: SUITE }, 'harness-resolver.log');
  await sleep(1200);
  const q2 = await udpQuery('super.harz', RESOLVER_PORT);
  const ok2 = q2 && q2.rcode === 0 && q2.an === 1 && q2.txt.includes('harz-super');
  check(2, 'resolver answers: super.harz -> signed TXT payload', !!ok2, q2 && q2.rcode === 0 ? q2.txt.slice(0, 60) : 'no answer');
  const q3 = await udpQuery('ghost.harz', RESOLVER_PORT);
  const ok3 = q3 && q3.rcode === 3;
  check(3, 'NXDOMAIN: ghost.harz honestly refused', !!ok3, 'rcode=' + (q3 ? q3.rcode : '?'));

  /* CHECK 4: tamper refusal — resolver must refuse to serve a corrupted zone */
  const tamDir = tempZoneDir('harz.zone', 'zone.sig', 'zone.hash');
  const tamZone = fs.readFileSync(path.join(tamDir, 'harz.zone'), 'utf8').replace(';', ':'); // 1-char corruption, guaranteed to break the sig
  fs.writeFileSync(path.join(tamDir, 'harz.zone'), tamZone);
  let tamperExit = null;
  const tr = start('node', ['resolver.js'], { PORT: String(RESOLVER_PORT + 1), ZONE_DIR: tamDir }, 'harness-tamper.log');
  const trDone = new Promise(res2 => tr.on('exit', c => { tamperExit = c; res2(); }));
  await Promise.race([trDone, sleep(4000)]);
  try { tr.kill('SIGKILL'); } catch (e) {}
  const ok4 = tamperExit !== null && tamperExit !== 0;
  check(4, 'tamper refusal: corrupted zone = resolver refuses (fail closed)', ok4, tamperExit === null ? 'kept running (BAD)' : 'exit ' + tamperExit);

  /* CHECK 5 + 6: Dial gateway, SMS + USSD */
  start('node', ['dial-gateway.js'], { PORT: String(DIAL_PORT), ZONE_DIR: SUITE }, 'harness-dial.log');
  await sleep(1200);
  const sms = await httpRequest(DIAL_PORT, '/sms', 'POST', { from: '+2348000000000', text: 'gov.harz' });
  const ok5 = sms && sms.json && typeof sms.json.reply === 'string' && sms.json.reply.includes('harz-governance');
  check(5, 'Dial SMS: gov.harz resolves through the SMS gateway (offline zone)', !!ok5, sms && sms.json ? String(sms.json.reply).slice(0, 60) : 'no reply');
  const ussd = await httpRequest(DIAL_PORT, '/ussd', 'POST', { sessionId: 'harness1', serviceCode: '*384*0#', text: 'gov' });
  const ussdText = ussd && ussd.json ? (ussd.json.response || '') : '';
  const ok6 = ussdText.includes('harz-governance') || ussdText.includes('governance');
  check(6, 'Dial USSD: gov resolves through the USSD gateway', !!ok6, ussdText.slice(0, 60) || 'no response');

  /* CHECK 7: gossip adoption — Node B (draft17, height 0) polls Node A (canonical) and ADOPTS */
  const dirA = tempZoneDir('harz.zone', 'zone.sig', 'zone.hash');
  start('node', ['gossip.js'], { GOSSIP_PORT: String(GOSSIP_A), ZONE_DIR: dirA }, 'harness-gossip-a.log');
  const dirB = tempZoneDir('harz.zone.draft17', 'zone.sig.draft17', 'zone.hash.draft17');
  start('node', ['gossip.js'], { GOSSIP_PORT: String(GOSSIP_B), ZONE_DIR: dirB, GOSSIP_PEERS: 'http://127.0.0.1:' + GOSSIP_A, GOSSIP_INTERVAL: '2' }, 'harness-gossip-b.log');
  let ok7 = false, infoB = null;
  for (let i = 0; i < 6; i++) {
    await sleep(1500);
    infoB = await httpRequest(GOSSIP_B, '/p2p/info');
    if (infoB && infoB.json && infoB.json.height >= 1) { ok7 = true; break; }
  }
  check(7, 'gossip adoption: signed canonical zone adopted from peer (height 0 -> 1)', ok7,
    infoB && infoB.json ? 'height=' + infoB.json.height : 'unreachable');

  /* CHECK 8: gossip refusal — tampered pushes must all be REFUSED, zone untouched */
  const dirC = tempZoneDir('harz.zone.draft17', 'zone.sig.draft17', 'zone.hash.draft17');
  start('node', ['gossip.js'], { GOSSIP_PORT: String(GOSSIP_C), ZONE_DIR: dirC, GOSSIP_ALLOW_PUSH: 'true' }, 'harness-gossip-c.log');
  await sleep(1200);
  const realSig = fs.readFileSync(path.join(SUITE, 'zone.sig'), 'utf8').trim();
  const tampered = zone.replace('https://harz-governance.harz.workers.dev', 'https://evil-clone.example/steal');
  const p1 = await httpRequest(GOSSIP_C, '/p2p/push', 'POST', { zone: tampered, sig: Buffer.from('forged-signature-not-ed25519-valid').toString('base64'), hash: crypto.createHash('sha256').update(tampered).digest('hex') });
  const p2 = await httpRequest(GOSSIP_C, '/p2p/push', 'POST', { zone: tampered, sig: realSig, hash: crypto.createHash('sha256').update(tampered).digest('hex') });
  const draftZone = fs.readFileSync(path.join(SUITE, 'harz.zone.draft17'), 'utf8');
  const draftSig = fs.readFileSync(path.join(SUITE, 'zone.sig.draft17'), 'utf8').trim();
  const draftHash = fs.readFileSync(path.join(SUITE, 'zone.hash.draft17'), 'utf8').trim();
  const p3 = await httpRequest(GOSSIP_C, '/p2p/push', 'POST', { zone: draftZone, sig: draftSig, hash: draftHash }); // same height as C -> not newer -> refused
  const infoC = await httpRequest(GOSSIP_C, '/p2p/info');
  const refused = [p1, p2, p3].every(p => p && p.json && p.json.adopted === false);
  const untouched = infoC && infoC.json && infoC.json.height === 0;
  const ok8 = refused && untouched;
  check(8, 'gossip refusal: tampered + stale pushes refused, zone untouched', ok8,
    'pushes refused: ' + refused + ', C height: ' + (infoC && infoC.json ? infoC.json.height : '?'));

  cleanup();

  const failed = results.filter(x => !x.ok).length;
  console.log('');
  if (failed === 0) {
    console.log('=== 8/8 PASS — MESH ACCEPTANCE: GO ===');
    process.exit(0);
  } else {
    console.log('=== ' + (8 - failed) + '/8 PASS — MESH ACCEPTANCE: NO-GO (failed checks: ' + results.filter(x => !x.ok).map(x => x.n).join(', ') + ') ===');
    process.exit(1);
  }
})();

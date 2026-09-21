#!/usr/bin/env node
/* Pushes two hostile updates to Node C: (1) tampered zone + garbage sig,
 * (2) tampered zone with the ORIGINAL signature (hash mismatch path).
 * Both must be refused. */
const http = require('http');
const crypto = require('crypto');
const fs = require('fs');

const zone = fs.readFileSync(__dirname + '/harz.zone', 'utf8');
const tampered = zone.replace('https://harz-governance.harz.workers.dev', 'https://evil-clone.example/steal');

function push(c, label) {
  return new Promise(res => {
    const body = JSON.stringify(c);
    const req = http.request({ host: '127.0.0.1', port: 8093, path: '/p2p/push', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) } }, r => {
      let b = ''; r.on('data', c => b += c); r.on('end', () => { console.log(label + ' -> HTTP ' + r.statusCode + ' ' + b); res(); });
    });
    req.end(body);
  });
}

(async () => {
  const badSig = Buffer.from('forged-signature-bytes-not-ed25519-valid').toString('base64');
  await push({ zone: tampered, sig: badSig, hash: crypto.createHash('sha256').update(tampered).digest('hex') }, 'PUSH 1 (tampered zone, forged sig)');
  const realSig = fs.readFileSync(__dirname + '/zone.sig', 'utf8').trim();
  await push({ zone: tampered, sig: realSig, hash: crypto.createHash('sha256').update(tampered).digest('hex') }, 'PUSH 2 (tampered zone, real sig of the ORIGINAL zone)');
  await push({ zone: zone, sig: realSig, hash: fs.readFileSync(__dirname + '/zone.hash', 'utf8').trim() }, 'PUSH 3 (valid zone+sig but SAME height as C — must be refused as not newer)');
})();

#!/usr/bin/env node
/* HARZ ROOT — zone gossip v1.0 (gate 3, owner-confirmed law)
 * THE LAW: gossip refuses unsigned zone updates. A peer's zone is adopted
 * ONLY if: (1) Ed25519 signature verifies against the local zone key,
 * (2) sha256(zone) matches the announced hash, (3) origin matches local
 * origin, (4) peer height > local height (no downgrades). Otherwise:
 * logged rejection, zone untouched.
 *
 * Runs beside resolver.js on every node. Zero dependencies.
 * Config (env):
 *   GOSSIP_PORT     default 8090
 *   GOSSIP_PEERS    comma-separated base URLs (empty = solo mode)
 *   GOSSIP_INTERVAL poll seconds, default 60
 *   ZONE_DIR        default this folder
 *   GOSSIP_ALLOW_PUSH  default false; POST /p2p/push runs the same law
 */
const crypto = require('crypto');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ZONE_DIR = process.env.ZONE_DIR || __dirname;
const PORT = parseInt(process.env.GOSSIP_PORT || '8090', 10);
const INTERVAL = parseInt(process.env.GOSSIP_INTERVAL || '60', 10);
const PEERS = (process.env.GOSSIP_PEERS || '').split(',').map(s => s.trim()).filter(Boolean);
const ALLOW_PUSH = process.env.GOSSIP_ALLOW_PUSH === 'true';

const ZONE = path.join(ZONE_DIR, 'harz.zone');
const SIG = path.join(ZONE_DIR, 'zone.sig');
const HASH = path.join(ZONE_DIR, 'zone.hash');
const PUB = path.join(ZONE_DIR, 'keys', 'zsk-ed25519.pub.pem');

let stats = { adopted: 0, rejected: 0, refused: 0 };

function fail(m) { console.error('GOSSIP FAIL: ' + m); process.exit(1); }

function readState() {
  const zone = fs.readFileSync(ZONE, 'utf8');
  const sig = fs.readFileSync(SIG, 'utf8').trim();
  const hash = crypto.createHash('sha256').update(zone).digest('hex');
  const m = zone.match(/^;\s*origin:\s*(\S+)\s+height:\s*(\d+)/m);
  return { zone, sig, hash, origin: m ? m[1] : null, height: m ? parseInt(m[2], 10) : 0 };
}

/* THE LAW — one verification path for pull and push. */
function verifyCandidate(c) {
  const local = readState();
  if (!c.zone || !c.sig) return { ok: false, reason: 'missing zone or sig' };
  const hash = crypto.createHash('sha256').update(c.zone).digest('hex');
  if (c.hash && c.hash !== hash) return { ok: false, reason: 'hash mismatch' };
  let sigOk = false;
  try { sigOk = crypto.verify(null, Buffer.from(hash, 'hex'), fs.readFileSync(PUB, 'utf8'), Buffer.from(c.sig, 'base64')); } catch (e) {}
  if (!sigOk) return { ok: false, reason: 'INVALID SIGNATURE — refused (the law)' };
  const m = c.zone.match(/^;\s*origin:\s*(\S+)\s+height:\s*(\d+)/m);
  if (!m) return { ok: false, reason: 'no origin/height header' };
  if (m[1] !== local.origin) return { ok: false, reason: 'origin mismatch' };
  if (parseInt(m[2], 10) <= local.height) return { ok: false, reason: 'not newer (height ' + m[2] + ' <= ' + local.height + ')' };
  return { ok: true, hash, height: parseInt(m[2], 10) };
}

function adopt(c, v) {
  fs.writeFileSync(ZONE, c.zone);
  fs.writeFileSync(SIG, c.sig);
  fs.writeFileSync(HASH, v.hash);
  stats.adopted++;
  console.log('ADOPTED zone height ' + v.height + ' from peer (sig VERIFIED). hash ' + v.hash.slice(0, 12) + '…');
  return true;
}

const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');
  if (req.method === 'GET' && req.url === '/p2p/info') {
    const s = readState();
    return res.end(JSON.stringify({ gossip: 'harz', origin: s.origin, height: s.height, hash: s.hash }));
  }
  if (req.method === 'GET' && req.url === '/p2p/zone') {
    const s = readState();
    return res.end(JSON.stringify({ zone: s.zone, sig: s.sig, hash: s.hash, height: s.height, origin: s.origin }));
  }
  if (req.method === 'POST' && req.url === '/p2p/push') {
    if (!ALLOW_PUSH) { res.writeHead(403); return res.end(JSON.stringify({ adopted: false, reason: 'push disabled' })); }
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      try {
        const c = JSON.parse(body);
        const v = verifyCandidate(c);
        if (!v.ok) { stats.refused++; console.log('REFUSED push: ' + v.reason); res.writeHead(409); return res.end(JSON.stringify({ adopted: false, reason: v.reason })); }
        adopt(c, v);
        return res.end(JSON.stringify({ adopted: true, height: v.height, hash: v.hash }));
      } catch (e) { res.writeHead(400); res.end(JSON.stringify({ adopted: false, reason: 'bad request' })); }
    });
    return;
  }
  res.writeHead(404); res.end();
});
server.on('error', e => fail(e.message));

function fetchJson(url) {
  return new Promise((res, rej) => {
    http.get(url, r => { let b = ''; r.on('data', c => b += c); r.on('end', () => { try { res(JSON.parse(b)); } catch (e) { rej(e); } }); }).on('error', rej);
  });
}

async function pollPeers() {
  const local = readState();
  for (const peer of PEERS) {
    try {
      const info = await fetchJson(peer.replace(/\/$/, '') + '/p2p/info');
      if (info.hash === local.hash) continue;
      if (info.height <= local.height) { console.log('SKIP ' + peer + ': not newer (local ' + local.height + ' >= ' + info.height + ')'); continue; }
      const z = await fetchJson(peer.replace(/\/$/, '') + '/p2p/zone');
      const v = verifyCandidate(z);
      if (v.ok) adopt(z, v);
      else { stats.rejected++; console.log('REJECTED zone from ' + peer + ': ' + v.reason + ' — local zone UNTOUCHED'); }
    } catch (e) {
      console.log('peer unreachable: ' + peer + ' (' + e.message + ')');
    }
  }
}

server.listen(PORT, () => {
  const s = readState();
  console.log('OK  HARZ gossip on :' + PORT + ' | origin ' + s.origin + ' | height ' + s.height + ' | hash ' + s.hash.slice(0, 12) + '…');
  if (PEERS.length === 0) console.log('OK  SOLO MODE — serving zone, no peers configured');
  else { console.log('OK  peers: ' + PEERS.join(', ') + ' (poll every ' + INTERVAL + 's)'); pollPeers(); setInterval(pollPeers, INTERVAL * 1000); }
});

#!/usr/bin/env node
/* HARZ ROOT NAMESPACE — zone generator + signer v1.0
 * Usage:
 *   node zone-generator.js --init              generate Ed25519 zone signing keypair (offline ceremony)
 *   node zone-generator.js                     build .harz zone from genesis-names.json, sign, verify
 *   node zone-generator.js --verify            verify existing zone.sig against zone file
 * Zero dependencies: Node built-ins only (crypto, fs). Runs on Node 1, no network.
 */
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const DIR = __dirname;
const GENESIS = process.argv.includes('--source') ? path.resolve(process.argv[process.argv.indexOf('--source') + 1]) : path.join(DIR, 'genesis-names.json');
const ZONE = path.join(DIR, 'harz.zone');
const SIG = path.join(DIR, 'zone.sig');
const HASH = path.join(DIR, 'zone.hash');
const PRIV = path.join(DIR, 'keys', 'zsk-ed25519.pem');
const PUB = path.join(DIR, 'keys', 'zsk-ed25519.pub.pem');

function fail(msg) { console.error('FAIL: ' + msg); process.exit(1); }

/* --init: key ceremony. Run this ON Node 1 with no internet connected —
 * production zone-signing keys must never touch an online machine before use. */
function init() {
  if (fs.existsSync(PRIV)) fail('Signing key already exists. Never regenerate over an existing key.');
  fs.mkdirSync(path.join(DIR, 'keys'), { recursive: true });
  const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519');
  fs.writeFileSync(PRIV, privateKey.export({ type: 'pkcs8', format: 'pem' }));
  fs.writeFileSync(PUB, publicKey.export({ type: 'spki', format: 'pem' }));
  const fp = crypto.createHash('sha256').update(publicKey.export({ type: 'spki', format: 'der' })).digest('hex').slice(0, 16);
  console.log('OK  Signing keypair generated (Ed25519). Fingerprint: ' + fp);
  console.log('NOTE: keys/ must be backed up offline and never committed to any repository.');
}

/* Canonical zone content — deterministic: sorted by name, no timestamps. */
function buildZone(genesis) {
  const names = genesis.names.slice().sort((a, b) => a.name.localeCompare(b.name));
  let lines = [];
  lines.push('; HARZ ROOT ZONE — generated from names registry');
  lines.push('; origin: ' + genesis.origin + '  height: ' + genesis.mint_height);
  lines.push('$ORIGIN ' + genesis.origin);
  for (const n of names) {
    const fq = n.name + '.' + genesis.origin;
    // TXT record carries the JSON payload — resolvable by standard DNS software
    const txt = JSON.stringify(Object.assign({ record_type: n.record_type }, n.record_value));
    lines.push(fq.padEnd(20) + ' 3600 IN TXT "' + txt.replace(/"/g, '\\"') + '"');
    // future: add 'IN A' records in Phase 1 when Node 1 has an IP
  }
  return lines.join('\n') + '\n';
}

function sign() {
  if (!fs.existsSync(GENESIS)) fail('genesis-names.json not found');
  if (!fs.existsSync(PRIV)) fail('no signing key — run --init first (offline ceremony)');
  const genesis = JSON.parse(fs.readFileSync(GENESIS, 'utf8'));
  const zone = buildZone(genesis);
  const hash = crypto.createHash('sha256').update(zone).digest('hex');
  const sig = crypto.sign(null, Buffer.from(hash, 'hex'), fs.readFileSync(PRIV, 'utf8'));
  fs.writeFileSync(ZONE, zone);
  fs.writeFileSync(SIG, sig.toString('base64'));
  fs.writeFileSync(HASH, hash);
  console.log('OK  zone written: harz.zone (' + genesis.names.length + ' names)');
  console.log('OK  zone hash (sha256): ' + hash);
  console.log('OK  zone signed (Ed25519)');
  verify(); // self-check immediately
}

function verify() {
  if (!fs.existsSync(ZONE) || !fs.existsSync(SIG) || !fs.existsSync(PUB)) fail('zone/sig/pubkey missing');
  const zone = fs.readFileSync(ZONE, 'utf8');
  const sig = Buffer.from(fs.readFileSync(SIG, 'utf8'), 'base64');
  const hash = crypto.createHash('sha256').update(zone).digest('hex');
  const ok = crypto.verify(null, Buffer.from(hash, 'hex'), fs.readFileSync(PUB, 'utf8'), sig);
  const stored = fs.readFileSync(HASH, 'utf8').trim();
  const hashOk = stored === hash;
  console.log((ok && hashOk ? 'PASS' : 'FAIL') + '  signature verification: ' + ok + ', hash match: ' + hashOk);
  process.exit(ok && hashOk ? 0 : 1);
}

const mode = process.argv[2] || '';
if (mode === '--init') init();
else if (mode === '--verify') verify();
else sign();

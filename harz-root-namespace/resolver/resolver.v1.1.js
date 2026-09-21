#!/usr/bin/env node
/* HARZ ROOT — authoritative DNS resolver for the .harz zone v1.0
 * Serves the SIGNED zone only (verifies Ed25519 signature on load; refuses
 * to serve a tampered zone). Authoritative for .harz, forwarder for the
 * rest of the (old) internet, so Node 1 can be a household/community
 * resolver where BOTH internets resolve.
 *
 * Config (env): PORT (default 53), UPSTREAM (default 1.1.1.1), ZONE_DIR (default .)
 * Usage:  node resolver.js         (on Node 1: sudo for port 53, or PORT=5300)
 * Zero dependencies: Node built-ins only.
 */
const crypto = require('crypto');
const dgram = require('dgram');
const fs = require('fs');
const path = require('path');

const ZONE_DIR = process.env.ZONE_DIR || __dirname;
const PORT = parseInt(process.env.PORT || '53', 10);
const UPSTREAM = process.env.UPSTREAM || '1.1.1.1';
const ZONE = path.join(ZONE_DIR, 'harz.zone');
const SIG = path.join(ZONE_DIR, 'zone.sig');
const HASH = path.join(ZONE_DIR, 'zone.hash');
const PUB = path.join(ZONE_DIR, 'keys', 'zsk-ed25519.pub.pem');

function fail(msg) { console.error('RESOLVER FAIL: ' + msg); process.exit(1); }

/* 1. Verify the zone signature BEFORE serving anything. */
function loadZone() {
  if (!fs.existsSync(ZONE) || !fs.existsSync(SIG) || !fs.existsSync(PUB)) fail('zone/sig/pubkey missing');
  const zone = fs.readFileSync(ZONE, 'utf8');
  const sig = Buffer.from(fs.readFileSync(SIG, 'utf8'), 'base64');
  const hash = crypto.createHash('sha256').update(zone).digest('hex');
  const ok = crypto.verify(null, Buffer.from(hash, 'hex'), fs.readFileSync(PUB, 'utf8'), sig);
  if (!ok) fail('zone signature INVALID — refusing to serve. Re-sign with zone-generator.js');
  if (fs.existsSync(HASH) && fs.readFileSync(HASH, 'utf8').trim() !== hash) fail('zone hash mismatch — refusing to serve');
  const records = new Map(); // fqdn -> { txt: string }
  for (const line of zone.split('\n')) {
    if (!line || line.startsWith(';') || line.startsWith('$')) continue;
    const m = line.match(/^(\S+)\s+3600\s+IN\s+TXT\s+"(.*)"$/);
    if (!m) continue;
    records.set(m[1].toLowerCase(), { txt: m[2].replace(/\\"/g, '"') });
  }
  console.log('OK  zone loaded + signature VERIFIED: ' + records.size + ' names authoritative');
  return records;
}
const RECORDS = loadZone();

/* 2. Minimal DNS wire format. */
function encodeName(name) {
  const parts = name.replace(/\.$/, '').split('.');
  const bufs = parts.map(p => Buffer.concat([Buffer.from([Buffer.byteLength(p)]), Buffer.from(p)]));
  return Buffer.concat([...bufs, Buffer.from([0])]);
}
function decodeQName(buf, off) {
  const labels = []; let pos = off, jumped = false, end = off;
  while (buf[pos] !== 0) {
    const len = buf[pos];
    if ((len & 0xC0) === 0xC0) { if (!jumped) end = pos + 2; pos = ((len & 0x3F) << 8) | buf[pos + 1]; jumped = true; continue; }
    labels.push(buf.toString('utf8', pos + 1, pos + 1 + len));
    pos += 1 + len;
    if (labels.length > 8) break;
  }
  if (!jumped) end = pos + 1;
  return { name: labels.join('.'), end };
}
function makeHeader(id, flags, qd, an, ns, ar) {
  const h = Buffer.alloc(12);
  h.writeUInt16BE(id, 0); h.writeUInt16BE(flags, 2);
  h.writeUInt16BE(qd, 4); h.writeUInt16BE(an, 6); h.writeUInt16BE(ns, 8); h.writeUInt16BE(ar, 10);
  return h;
}
/* TXT rdata: sequence of <len><data> chunks (<=255 bytes each) */
function txtRdata(txt) {
  const chunks = [];
  for (let i = 0; i < txt.length; i += 255) chunks.push(Buffer.from(txt.slice(i, i + 255), 'utf8'));
  return Buffer.concat(chunks.map(c => Buffer.concat([Buffer.from([c.length]), c])));
}

/* 3. Query handling. */
const server = dgram.createSocket('udp4');
server.on('message', (msg, rinfo) => {
  const id = msg.readUInt16BE(0);
  const { name, end } = decodeQName(msg, 12);
  const qtype = msg.readUInt16BE(end);
  const question = msg.slice(12, end + 4); // name + qtype + qclass (v1.1: start at 12, not 0)

  const lower = name.toLowerCase();
  const isHarz = lower.endsWith('.harz');
  const rec = isHarz ? RECORDS.get(lower + '.') : undefined;

  if (isHarz) {
    if (rec && (qtype === 16 || qtype === 255)) { // TXT or ANY
      const rd = txtRdata(rec.txt);
      const answer = Buffer.concat([
        Buffer.from([0xC0, 0x0C]),            // pointer to question name
        (() => { const r = Buffer.alloc(10); r.writeUInt16BE(16, 0); r.writeUInt16BE(1, 2); r.writeUInt32BE(3600, 4); r.writeUInt16BE(rd.length, 8); return r; })(),
        rd
      ]);
      const resp = Buffer.concat([makeHeader(id, 0x8400, 1, 1, 0, 0), question, answer]);
      server.send(resp, rinfo.port, rinfo.address);
    } else {
      // authoritative NXDOMAIN (or type we don't serve yet)
      const resp = Buffer.concat([makeHeader(id, 0x8403, 1, 0, 0, 0), question]);
      server.send(resp, rinfo.port, rinfo.address);
    }
  } else {
    // forward the old internet upstream, verbatim
    const up = dgram.createSocket('udp4');
    up.once('message', (answer) => { server.send(answer, rinfo.port, rinfo.address); up.close(); });
    up.once('error', (e) => { up.close(); server.send(Buffer.concat([makeHeader(id, 0x8402, 1, 0, 0, 0), question]), rinfo.port, rinfo.address); });
    up.send(msg, 53, UPSTREAM);
    setTimeout(() => up.close(), 4000);
  }
});
server.on('error', (e) => fail(e.message));
server.bind(PORT, () => console.log('OK  HARZ resolver listening on UDP ' + PORT + ' | authoritative: .harz | upstream: ' + UPSTREAM));

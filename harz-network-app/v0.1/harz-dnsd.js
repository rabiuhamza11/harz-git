// HARZ DNSD v0.1 — desktop adapter around the frozen core (UDP + TCP :53).
// Adapter law: this file may touch the network; the core may not.
// *.harz  → answered from the sealed zone → A 127.0.0.1 (the local door)
// other   → forwarded to UPSTREAM so the machine's normal internet keeps working
// Unknown .harz names → honest NXDOMAIN (rcode 3), never invented.
// Run: sudo node harz-dnsd.js   then point system DNS at 127.0.0.1
'use strict';
const dgram = require('dgram');
const net = require('net');
const fs = require('fs');
const path = require('path');
const core = require('./harz-dns-core.js');

const UPSTREAM = '1.1.1.1';
const PORT = process.env.HARZ_DNS_PORT ? parseInt(process.env.HARZ_DNS_PORT, 10) : 53;
const HOST = '127.0.0.1';
const TTL = 300;
const DOOR_IP = '127.0.0.1';

const zonePath = path.join(__dirname, '..', '..', 'harz-root-v2', 'zone-king', 'SIGNED-ZONE-V2.json');
const state = core.boot(JSON.parse(fs.readFileSync(zonePath, 'utf8')));
if (!state.ok) { console.error('BOOT REFUSED — FAIL-CLOSED:', state.refused); process.exit(1); }
console.log('HARZ DNSD v0.1 — sealed zone loaded. digest', state.digest.slice(0, 8), '|', state.records, 'names | king', core.PIN.king.slice(0, 8));

function isHarz(qname) { return qname === 'harz' || qname.endsWith('.harz'); }

// ----- wire format (minimal, correct for A questions) -----
function parseQuestion(buf) {
  if (buf.length < 12) return null;
  const qdcount = buf.readUInt16BE(4);
  if (qdcount !== 1) return null;
  let i = 12; const labels = [];
  while (i < buf.length) {
    const len = buf[i];
    if (len === 0) { i++; break; }
    if (len & 0xc0) return null; // compression in question — unsupported
    labels.push(buf.slice(i + 1, i + 1 + len).toString('utf8'));
    i += 1 + len;
  }
  if (i + 4 > buf.length) return null;
  const qtype = buf.readUInt16BE(i); const qclass = buf.readUInt16BE(i + 2);
  return { id: buf.readUInt16BE(0), qname: labels.join('.').toLowerCase(), qtype, qclass, end: i + 4 };
}
function buildReply(q, { rcode = 0, answers = [] }) {
  const out = Buffer.alloc(512); let o = 0;
  out.writeUInt16BE(q.id, o); o += 2;
  const flags = (0x8180 | (rcode & 0xf)) & 0xffff; // QR=1, RD=1, RA=1
  out.writeUInt16BE(flags, o); o += 2;
  out.writeUInt16BE(1, o); o += 2;      // qdcount
  out.writeUInt16BE(answers.length, o); o += 2; // ancount
  out.writeUInt16BE(0, o); o += 2; out.writeUInt16BE(0, o); o += 2;
  // question verbatim
  buf_copy: for (const label of q.qname.split('.')) { out[o] = label.length; o++; label.split('').forEach(c => { out.writeUInt8(c.charCodeAt(0), o); o++; }); }
  out[o] = 0; o++;
  out.writeUInt16BE(q.qtype, o); o += 2; out.writeUInt16BE(q.qclass, o); o += 2;
  for (const a of answers) {
    out.writeUInt16BE(0xc00c, o); o += 2; // name pointer
    out.writeUInt16BE(1, o); o += 2;      // A
    out.writeUInt16BE(1, o); o += 2;      // IN
    out.writeUInt32BE(TTL, o); o += 4;
    out.writeUInt16BE(4, o); o += 2;
    for (const b of a.ip.split('.')) { out.writeUInt8(parseInt(b, 10), o); o++; }
  }
  return out.slice(0, o);
}

function handleQuery(buf, respond) {
  const q = parseQuestion(buf);
  if (!q) { respond(Buffer.alloc(0)); return; }
  if (isHarz(q.qname)) {
    const a = core.answer(state, q.qname);
    if (a.status === 'NOERROR') {
      // record the receipt so the door serves only names the core vouched for
      lastReceipts.set(q.qname, a);
      respond(buildReply(q, { answers: [{ ip: DOOR_IP }] }));
      log('RESOLVE', q.qname, '→ ' + DOOR_IP + ' (' + a.endpoint + ') rcpt ' + a.receipt.slice(7, 19));
    } else {
      respond(buildReply(q, { rcode: 3 }));
      log('NXDOMAIN', q.qname, 'honest refusal rcpt ' + a.receipt.slice(7, 19));
    }
    return;
  }
  // non-harz: forward upstream (adapter-level network, allowed here, banned in core)
  const up = dgram.createSocket('udp4');
  up.once('message', m => { up.close(); respond(m); });
  up.once('error', e => { up.close(); respond(buildReply(q, { rcode: 2 })); });
  up.send(buf, 53, UPSTREAM);
}
const lastReceipts = new Map();
function log(tag, name, note) { console.log(new Date().toISOString(), tag, name, note); }

const udp = dgram.createSocket('udp4');
udp.on('message', (buf, rinfo) => handleQuery(buf, m => udp.send(m, rinfo.port, rinfo.address)));
udp.bind(PORT, HOST, () => console.log('UDP listening on ' + HOST + ':' + PORT));
const tcp = net.createServer(sock => {
  sock.once('data', chunk => {
    const len = chunk.readUInt16BE(0); const buf = chunk.slice(2, 2 + len);
    handleQuery(buf, m => { const h = Buffer.alloc(2); h.writeUInt16BE(m.length, 0); sock.end(Buffer.concat([h, m])); });
  });
});
tcp.listen(PORT, HOST, () => console.log('TCP listening on ' + HOST + ':' + PORT));

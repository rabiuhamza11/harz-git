#!/usr/bin/env node
/* HARZ DIAL GATEWAY v1.0 — names on feature phones, no internet needed.
 * Sits on Node 1 next to resolver.js. SMS/USSD aggregators (Termii etc.)
 * post to it; it resolves .harz names from the LOCAL signed zone and replies.
 * The old internet is never required for a lookup.
 *
 * Endpoints:
 *   POST /sms   {from, text}              -> {reply}
 *   POST /ussd  {sessionId, serviceCode, text}  -> {response} (Africa's Talking-style)
 *   GET  /health                        -> {status:"ok", names:N, zone:"verified"}
 * Config (env): PORT (default 8787), ZONE_DIR (default this folder)
 * Zero dependencies: Node built-ins only.
 */
const crypto = require('crypto');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ZONE_DIR = process.env.ZONE_DIR || __dirname;
const PORT = parseInt(process.env.PORT || '8787', 10);
const ZONE = path.join(ZONE_DIR, 'harz.zone');
const SIG = path.join(ZONE_DIR, 'zone.sig');
const HASH = path.join(ZONE_DIR, 'zone.hash');
const PUB = path.join(ZONE_DIR, 'keys', 'zsk-ed25519.pub.pem');

function fail(msg) { console.error('DIAL FAIL: ' + msg); process.exit(1); }

/* Load + verify the zone — same rule as the resolver: unsigned zone = no service. */
function loadZone() {
  if (!fs.existsSync(ZONE) || !fs.existsSync(SIG) || !fs.existsSync(PUB)) fail('zone/sig/pubkey missing');
  const zone = fs.readFileSync(ZONE, 'utf8');
  const sig = Buffer.from(fs.readFileSync(SIG, 'utf8'), 'base64');
  const hash = crypto.createHash('sha256').update(zone).digest('hex');
  if (!crypto.verify(null, Buffer.from(hash, 'hex'), fs.readFileSync(PUB, 'utf8'), sig)) fail('zone signature INVALID — refusing to serve Dial');
  const names = new Map();
  for (const line of zone.split('\n')) {
    if (!line || line.startsWith(';') || line.startsWith('$')) continue;
    const m = line.match(/^(\S+)\s+3600\s+IN\s+TXT\s+"(.*)"$/);
    if (!m) continue;
    const fq = m[1].toLowerCase();                    // e.g. 'super.harz.'
    const short = fq.replace(/\.harz\.$/, '');        // e.g. 'super'
    try { names.set(short, JSON.parse(m[2].replace(/\\"/g, '"'))); } catch (e) {}
  }
  console.log('OK  Dial zone loaded + signature VERIFIED: ' + names.size + ' names offline-resolvable');
  return names;
}
const NAMES = loadZone();

function resolve(short) {
  const key = (short || '').toLowerCase().replace(/\.harz\.?$/, '').trim();
  const rec = NAMES.get(key);
  if (!rec) return null;
  return { fqdn: key + '.harz', rec };
}

const PAGE = 8; // names per HELP page (SMS length)

function smsReply(text) {
  const key = (text || '').toLowerCase().trim();
  if (key === 'help' || key === 'menu' || key === 'list') {
    const all = [...NAMES.keys()];
    return 'HARZ names (' + all.length + '): ' + all.join(', ') + '. Reply a name e.g. super';
  }
  const r = resolve(key);
  if (!r) return 'No such name on HARZ. Reply HELP for the name list.';
  return r.fqdn + ' -> ' + (r.rec.url || r.rec.service_id) + (r.rec.note ? ' (' + r.rec.note + ')' : '');
}

function ussdReply(text) {
  const t = (text || '').trim();
  if (!t) {
    return 'CON HARZ Dial. Enter a service name (e.g. super, wallet, gov, chain)';
  }
  const r = resolve(t.split('*').pop());
  if (!r) return 'END Unknown name. Dial again and try super or wallet';
  return 'END ' + r.fqdn + ': ' + (r.rec.url || r.rec.service_id) + (r.rec.note ? ' - ' + r.rec.note : '');
}

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ status: 'ok', names: NAMES.size, zone: 'verified' }));
  }
  if (req.method === 'POST' && (req.url === '/sms' || req.url === '/ussd')) {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      try {
        const p = JSON.parse(body || '{}');
        const out = req.url === '/sms' ? smsReply(p.text) : ussdReply(p.text);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(req.url === '/sms' ? { reply: out } : { response: out }));
      } catch (e) {
        res.writeHead(400); res.end(JSON.stringify({ error: 'bad request' }));
      }
    });
    return;
  }
  res.writeHead(404); res.end();
});
server.on('error', e => fail(e.message));
server.listen(PORT, () => console.log('OK  HARZ Dial gateway on :' + PORT + ' (SMS + USSD, offline zone)'));

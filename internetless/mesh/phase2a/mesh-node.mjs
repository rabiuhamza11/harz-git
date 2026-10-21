#!/usr/bin/env node
// HARZ MESH NODE — Phase 2A storage node (immutable objects, integrity-checked before serve).
// Runs on any Node.js >= 16 device: laptop, desktop, or Android via Termux. No dependencies.
// Usage: node mesh-node.mjs --port 8787 --dir ./node-store
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
function arg(k, d) { const i = process.argv.indexOf(k); return i > 0 && process.argv[i+1] ? process.argv[i+1] : d; }
const PORT = parseInt(arg('--port', '8787'), 10);
const DIR = arg('--dir', './node-store');
const MANIFEST = JSON.parse(fs.readFileSync(new URL('./mesh-manifest.json', import.meta.url), 'utf8'));
const LOG = path.join(DIR, 'node-log.jsonl');
function log(ev) { try { fs.appendFileSync(LOG, JSON.stringify(Object.assign({at: new Date().toISOString()}, ev)) + '\n'); } catch (e) {} }
function sha256(b) { return crypto.createHash('sha256').update(b).digest('hex'); }
function textSha256(bytes) {
  // canonical content identity: sha256 of the doc JSON's "text" field (UTF-8)
  try { const t = JSON.parse(bytes.toString('utf8')).text || ''; return sha256(Buffer.from(t, 'utf8')); }
  catch (e) { return null; }
}
const server = http.createServer((req, res) => {
  const u = new URL(req.url, 'http://x');
  res.setHeader('access-control-allow-origin', '*');
  const t0 = Date.now();
  function done(code, body, type) {
    res.writeHead(code, {'content-type': type || 'application/json'});
    res.end(body);
    log({req: u.pathname, code: code, ms: Date.now() - t0});
  }
  if (u.pathname === '/inventory') {
    const inv = {node: 'harz-mesh-node-2a', objects: []};
    for (const id of Object.keys(MANIFEST.objects)) {
      const f = path.join(DIR, id + '.json');
      if (!fs.existsSync(f)) continue;
      const bytes = fs.readFileSync(f);
      const th = textSha256(bytes);
      const trusted = MANIFEST.objects[id].text_sha256;
      inv.objects.push({id: id, file_bytes: bytes.length, text_sha256: th,
        integrity: th === trusted ? 'VERIFIED' : 'MISMATCH-REFUSED',
        serves: th === trusted});
    }
    return done(200, JSON.stringify(inv));
  }
  const m = u.pathname.match(/^\/object\/([0-9]+)$/);
  if (m) {
    const id = m[1];
    const f = path.join(DIR, id + '.json');
    if (!fs.existsSync(f)) return done(404, JSON.stringify({ok: false, error: 'object not held by this node'}));
    const bytes = fs.readFileSync(f);
    const th = textSha256(bytes);
    const trusted = (MANIFEST.objects[id] || {}).text_sha256;
    if (!trusted) return done(404, JSON.stringify({ok: false, error: 'no trusted hash in manifest'}));
    if (th !== trusted) {
      log({event: 'INTEGRITY-REFUSAL', id: id, expected: trusted, actual: th});
      return done(409, JSON.stringify({ok: false, error: 'integrity check FAILED — node refuses to serve this copy', expected: trusted, actual: th}));
    }
    log({event: 'SERVED', id: id, bytes: bytes.length, sha256_text: th});
    res.writeHead(200, {'content-type': 'application/json', 'x-harz-sha256-text': th, 'x-harz-id': id});
    return res.end(bytes);
  }
  if (u.pathname === '/health') return done(200, JSON.stringify({ok: true, node: 'harz-mesh-node-2a', started: START}));
  done(404, JSON.stringify({ok: false, error: 'unknown route'}));
});
const START = new Date().toISOString();
server.listen(PORT, () => {
  console.log('HARZ MESH NODE 2A listening on :' + PORT + ' | store: ' + DIR);
  console.log('  GET /inventory  — advertised objects + integrity state');
  console.log('  GET /object/<id> — integrity-checked serve (refuses on hash mismatch)');
  console.log('  Held: ' + fs.readdirSync(DIR).filter(x => x.endsWith('.json') && x !== 'node-log.jsonl' && !x.startsWith('node-')).join(', '));
});

// G23 Node Kit ATTACKER — the parallel authority. Same frozen public worker
// bundle, SAME laws, but its OWN freshly generated Ed25519 key. It can
// reproduce the entire topology and every public hash — it cannot reproduce
// the authorized origin's private key. That is the entire point.
import worker from '../worker.mjs';
import http from 'http';
import fs from 'fs';

const store = new Map();
const MEMORY = {
  async get(key, type) { if (!store.has(key)) return null; const v = store.get(key); return type === 'json' ? JSON.parse(v) : v; },
  async put(key, value) { store.set(key, typeof value === 'string' ? value : JSON.stringify(value)); },
  async delete(key) { store.delete(key); }
};
const ORIGIN_KEY = fs.readFileSync(new URL('../../keys/attacker-key.pem', import.meta.url), 'utf8');
const ENV = { MEMORY, ORIGIN_KEY };

const server = http.createServer(async (req, res) => {
  const url = 'http://127.0.0.1:8792' + req.url;
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const request = new Request(url, { method: req.method, headers: req.headers, body: chunks.length ? Buffer.concat(chunks) : undefined });
  let r;
  try { r = await worker.fetch(request, ENV, {}); }
  catch (e) { res.writeHead(500); res.end('attacker kit error: ' + e.message); return; }
  const buf = Buffer.from(await r.arrayBuffer());
  res.writeHead(r.status, Object.fromEntries(r.headers.entries()));
  res.end(buf);
});
server.listen(8792, '127.0.0.1', () => console.log('G23 ATTACKER kit on http://127.0.0.1:8792 — parallel authority with its own key'));

// G22 LOCAL MIRROR — the attacker's second authority.
// Runs the SAME frozen public worker bundle (byte-identical to the deployed
// harz-intelligence code) as a local sovereign node with its own in-memory
// store. This is the honest form of the attack: the origin emits its own
// records, receipts, designation seals, and serves its own artifacts. Where
// the attacker hosts the public code is irrelevant to the finding — a fresh
// node has no origin-authentication mechanism to tell authorities apart.
import worker from './worker-g22-era.mjs';
import http from 'http';

const store = new Map();
const MEMORY = {
  async get(key, type) {
    if (!store.has(key)) return null;
    const v = store.get(key);
    return type === 'json' ? JSON.parse(v) : v;
  },
  async put(key, value) { store.set(key, typeof value === 'string' ? value : JSON.stringify(value)); },
  async delete(key) { store.delete(key); }
};
const ENV = { MEMORY };

const server = http.createServer(async (req, res) => {
  const url = 'http://127.0.0.1:8788' + req.url;
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const request = new Request(url, { method: req.method, headers: req.headers, body: chunks.length ? Buffer.concat(chunks) : undefined });
  let r;
  try { r = await worker.fetch(request, ENV, {}); }
  catch (e) { res.writeHead(500); res.end('mirror error: ' + e.message); return; }
  const buf = Buffer.from(await r.arrayBuffer());
  res.writeHead(r.status, Object.fromEntries(r.headers.entries()));
  res.end(buf);
});
server.listen(8788, '127.0.0.1', () => console.log('G22 mirror authority on http://127.0.0.1:8788 (same frozen public code, own store)'));

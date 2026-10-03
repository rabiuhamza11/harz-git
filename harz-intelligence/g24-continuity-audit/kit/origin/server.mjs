// G24 Node Kit ORIGIN — runs the continuity-layer worker bundle on the standing
// kit anchor key (origin key 3, never exposed). Private key confined; the
// continuity primitive has zero Cloudflare dependence.
import worker from '../worker.mjs';
import http from 'http';
import fs from 'fs';
const store = new Map();
const MEMORY = {
  async get(key, type) { if (!store.has(key)) return null; const v = store.get(key); return type === 'json' ? JSON.parse(v) : v; },
  async put(key, value) { store.set(key, typeof value === 'string' ? value : JSON.stringify(value)); },
  async delete(key) { store.delete(key); }
};
const ORIGIN_KEY = fs.readFileSync(new URL('../../keys/origin-v3-key.pem', import.meta.url), 'utf8');
const ENV = { MEMORY, ORIGIN_KEY };
const server = http.createServer(async (req, res) => {
  const url = 'http://127.0.0.1:8793' + req.url;
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const request = new Request(url, { method: req.method, headers: req.headers, body: chunks.length ? Buffer.concat(chunks) : undefined });
  let r;
  try { r = await worker.fetch(request, ENV, {}); }
  catch (e) { res.writeHead(500); res.end('origin kit error: ' + e.message); return; }
  const buf = Buffer.from(await r.arrayBuffer());
  res.writeHead(r.status, Object.fromEntries(r.headers.entries()));
  res.end(buf);
});
server.listen(8793, '127.0.0.1', () => console.log('G24 ORIGIN kit on http://127.0.0.1:8793 — continuity layer + standing kit anchor key loaded'));

// HARZ Full-Text Reader v1.1 — sealed serve of the search full-text store (sft-v1.0)
// v1.1 (Oct 22, Nuruddeen, owner 'Go on'): DOC-LEVEL SEAL ADDED — the doc's text must hash to the requested
// content_hash, else honest refusal. Chunk seal alone proved insufficient: mislabeled doc rows inside
// sealed chunks were served as verified (3/10 sampled faulted; fault reports cf41146/18f9bb1).
// Law: a chunk whose SHA-256 does not match the manifest is NEVER presented.
// Integrity chain: manifest (sealed at lift) -> chunk SHA -> doc content_hash must match request.
export default {
  async fetch(request, env) {
    const u = new URL(request.url);
    const p = u.pathname;
    const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*' };
    if (request.method === 'OPTIONS') return new Response(null, { headers: CORS });
    if (p === '/' && request.method === 'GET') return landing(env);
    if (p === '/manifest.json' && request.method === 'GET') return serveManifest(env, CORS);
    if (p === '/api/coverage' && request.method === 'GET') return coverage(env, CORS);
    if (p === '/site.webmanifest') return jsonp(JSON.stringify({
      name: 'HARZ Full-Text Reader', short_name: 'HARZ Reader', start_url: '/',
      display: 'standalone', background_color: '#f0f2f5', theme_color: '#f0f2f5',
      icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }]
    }), CORS);
    if (p === '/icon.svg') return svgp(CORS);
    if (p === '/sw.js') return swp();
    if (p.startsWith('/doc/') && request.method === 'GET') return serveDoc(p.split('/')[2], env, CORS);
    return json({ ok: false, error: 'not found' }, 404, CORS);
  }
};
const TTL = 5 * 60 * 1000;
let _cache = { manifest: null, index: null, at: 0 };
async function load(env) {
  if (_cache.manifest && _cache.index && Date.now() - _cache.at < TTL) return _cache;
  const [m, i] = await Promise.all([env.STORE.get('manifest.json', 'json'), env.STORE.get('doc-index.json', 'json')]);
  if (!m || !i) throw new Error('store unavailable');
  _cache = { manifest: m, index: i, at: Date.now() };
  return _cache;
}
async function serveDoc(hash, env, CORS) {
  if (!/^[0-9a-f]{64}$/.test(hash || '')) return json({ ok: false, error: 'bad hash' }, 400, CORS);
  try {
    const { manifest, index } = await load(env);
    const chunkName = index[hash];
    if (!chunkName) return json({ ok: false, error: 'not covered by this store', coverage_note: '39.6% of live-index docs; grows as waves re-gather misses' }, 404, CORS);
    const meta = manifest.chunks.find(c => c.name === chunkName);
    const body = await env.STORE.get(chunkName);
    if (!body) return json({ ok: false, error: 'chunk unreadable — refused' }, 502, CORS);
    const enc = new TextEncoder();
    const digest = await crypto.subtle.digest('SHA-256', enc.encode(body));
    const hex = [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('');
    if (hex !== meta.sha256) return json({ ok: false, error: 'SEAL MISMATCH — chunk refused (manifest law)' }, 502, CORS);
    const doc = JSON.parse(body).find(d => d.content_hash === hash);
    if (!doc) return json({ ok: false, error: 'hash not in sealed chunk — refused' }, 502, CORS);
    const dDigest = await crypto.subtle.digest('SHA-256', enc.encode(doc.text || ''));
    const dHex = [...new Uint8Array(dDigest)].map(b => b.toString(16).padStart(2, '0')).join('');
    if (dHex !== hash) return json({ ok: false, error: 'DOC SEAL MISMATCH — stored text does not hash to the requested content_hash; refused (doc-level law, v1.1)' }, 502, CORS);
    return json({ ok: true, tier: 'full-text', label: 'SEALED ECOSYSTEM SOURCE — SHA-256 VERIFIED CHUNK, NOT VERIFIED FOR RELEVANCE',
      doc: { content_hash: doc.content_hash, url: doc.url, text: doc.text },
      seal: { chunk: chunkName, chunk_sha256: meta.sha256 } }, 200, CORS);
  } catch (e) {
    return json({ ok: false, error: 'reader failure: ' + String(e).slice(0, 120) }, 502, CORS);
  }
}
async function serveManifest(env, CORS) {
  const { manifest } = await load(env);
  return json({ ok: true, manifest }, 200, CORS);
}
async function coverage(env, CORS) {
  const { manifest } = await load(env);
  return json({ ok: true, version: manifest.version, total_docs: manifest.total_docs,
    chunks: manifest.chunks.length, bytes: manifest.chunks.reduce((a, c) => a + c.bytes, 0),
    law: manifest.law }, 200, CORS);
}
async function landing(env) {
  let cov = { total_docs: 0, chunks: 0, bytes: 0, version: 'sft-v1.0' };
  try { cov = await coverage(env, {}); cov = await cov.json(); } catch (e) {}
  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#f0f2f5"><title>HARZ Full-Text Reader</title>
<link rel="manifest" href="/site.webmanifest"><link rel="icon" href="/icon.svg">
<style>body{font-family:-apple-system,system-ui,sans-serif;background:#f0f2f5;color:#111;margin:0;padding:24px}.c{max-width:640px;margin:0 auto}h1{color:#0a7d3c;font-size:22px}b{color:#0a7d3c}code{background:#fff;padding:2px 6px;border-radius:4px;font-size:13px}.card{background:#fff;border-radius:12px;padding:16px;margin:12px 0;box-shadow:0 1px 3px rgba(0,0,0,.08)}</style></head><body><div class="c">
<h1>📚 HARZ Full-Text Reader</h1>
<div class="card"><b>${cov.total_docs.toLocaleString()}</b> full documents &middot; ${cov.chunks} sealed chunks &middot; ${(cov.bytes / 1048576).toFixed(1)} MB &middot; ${cov.version}</div>
<div class="card"><b>The law:</b> a chunk whose SHA-256 does not match the manifest is never presented as complete. Every document is served only after its chunk seal is recomputed and its content hash matches the request.</div>
<div class="card"><b>Usage:</b> <code>GET /doc/&lt;content_hash&gt;</code> &mdash; sealed full text or honest refusal. <code>GET /manifest.json</code> &mdash; the seal root. <code>GET /api/coverage</code> &mdash; store stats.</div>
<div class="card">Backs the search READ FULL tier &middot; lifted from the million-corpus per Team B &middot; search indexes untouched.</div>
</div><script>if("serviceWorker" in navigator)navigator.serviceWorker.register("/sw.js");</script></body></html>`;
  return new Response(html, { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } });
}
function json(obj, status, CORS) { return Response.json(obj, { status, headers: CORS }); }
function jsonp(body, CORS) { return new Response(body, { headers: { 'content-type': 'application/json', ...CORS } }); }
function svgp(CORS) {
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="#0a7d3c"/><text x="50" y="68" font-size="52" font-family="Arial" font-weight="bold" fill="#fff" text-anchor="middle">F</text></svg>';
  return new Response(svg, { headers: { 'content-type': 'image/svg+xml', ...CORS } });
}
function swp() {
  const body = "self.addEventListener('install',e=>self.skipWaiting());self.addEventListener('activate',e=>e.waitUntil(clients.claim()));";
  return new Response(body, { headers: { 'content-type': 'application/javascript' } });
}
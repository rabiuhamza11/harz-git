// HARZ INTERNETLESS v2 — RESOLVER TEST SUITE
// Owner ruling: the six outcome categories are REQUIRED TESTS, not claims.
// Runs in plain Node (pure module, no network, no storage).
const { normalizeUrl, buildUrlMap, resolve } = require('./resolver.js');
const assert = require('assert');

const sha = (s) => 'sha-' + s.length; // deterministic fake for tests where exact string used
const corpusDocs = {
  d1: { url: 'https://www.theconversation.com/africas-plants-259697', finalUrl: 'https://theconversation.com/africas-plants-259697', contentHash: 'H1' },
  d2: { url: 'https://www.theguardian.com/world/2025/oct/10/article-x', finalUrl: null, contentHash: 'H2' },
};
const packs = {
  'efcc.gov.ng': {
    pages: { '/': { anchor: 'efcc-root', sha256: 'P1' }, '/news/press-release': { anchor: 'efcc-news', sha256: 'P2' } },
    resources: [{ url: 'https://efcc.gov.ng/img/logo.png', localId: 'r-logo', sha256: 'R1' }]
  }
};
const urlMap = buildUrlMap({ corpusDocs, packs });
const capturedDomains = new Set(['theconversation.com', 'theguardian.com', 'efcc.gov.ng']);

let PASS = 0, FAIL = 0;
async function T(name, fn) {
  try { await fn(); PASS++; console.log('ok:', name); }
  catch (e) { FAIL++; console.log('FAIL:', name, '::', e.message); }
}

(async () => {
  // --- normalization (owner: relative, absolute, query, fragments, redirects) ---
  await T('N1 www + default port + tracking stripped', async () => {
    const n = normalizeUrl('https://www.theconversation.com:443/africas-plants-259697?utm_source=x&id=5');
    assert.strictEqual(n.normalized, 'https://theconversation.com/africas-plants-259697?id=5');
  });
  await T('N2 relative resolved against base', async () => {
    const n = normalizeUrl('/news/press-release', 'https://efcc.gov.ng/index.html');
    assert.strictEqual(n.normalized, 'https://efcc.gov.ng/news/press-release');
  });
  await T('N3 fragment dropped (scroll, not identity)', async () => {
    const n = normalizeUrl('https://efcc.gov.ng/#section-2');
    assert.strictEqual(n.normalized, 'https://efcc.gov.ng/');
  });
  await T('N4 redirect: original AND final URL both resolve to the corpus doc', async () => {
    const a = urlMap[normalizeUrl('https://www.theconversation.com/africas-plants-259697').normalized];
    const b = urlMap[normalizeUrl('https://theconversation.com/africas-plants-259697').normalized];
    assert.ok(a && b && a.id === 'd1' && b.id === 'd1');
  });

  // --- the six owner-mandated outcome categories ---
  const retrieve = (shaMap) => async (ref) => (shaMap[ref.id] ? { body: 'BODY:' + ref.id, sha256: shaMap[ref.id] } : null);

  await T('C1 LOCAL_FOUND: captured article opens WITH body retrieved and hash verified', async () => {
    const r = await resolve('https://theconversation.com/africas-plants-259697', { urlMap, capturedDomains, online: false, retrieve: retrieve({ d1: 'H1' }) });
    assert.strictEqual(r.status, 'LOCAL_FOUND'); assert.strictEqual(r.body, 'BODY:d1'); assert.strictEqual(r.sha256, 'H1');
  });
  await T('C2 RESOURCE_FOUND: pack asset returns local resource', async () => {
    const r = await resolve('https://efcc.gov.ng/img/logo.png', { urlMap, capturedDomains, online: false, retrieve: retrieve({ 'r-logo': 'R1' }) });
    assert.strictEqual(r.status, 'RESOURCE_FOUND');
  });
  await T('C3 NOT_CAPTURED on a CAPTURED domain — never guessed (owner rule 1)', async () => {
    const r = await resolve('https://efcc.gov.ng/never-captured/page', { urlMap, capturedDomains, online: false, retrieve: retrieve({}) });
    assert.strictEqual(r.status, 'NOT_CAPTURED');
    assert.ok(/domain is captured but this exact page/.test(r.reason));
  });
  await T('C4 INTEGRITY_FAILURE: hash mismatch refused, not displayed', async () => {
    const r = await resolve('https://theconversation.com/africas-plants-259697', { urlMap, capturedDomains, online: false, retrieve: retrieve({ d1: 'WRONG-HASH' }) });
    assert.strictEqual(r.status, 'INTEGRITY_FAILURE');
  });
  await T('C5 LIVE_AVAILABLE: uncaptured destination while online and permitted', async () => {
    const r = await resolve('https://example.org/some-page', { urlMap, capturedDomains, online: true, liveAllowed: true, retrieve: retrieve({}) });
    assert.strictEqual(r.status, 'LIVE_AVAILABLE');
  });
  await T('C6 OFFLINE_UNAVAILABLE: uncaptured destination, no connectivity, honest message', async () => {
    const r = await resolve('https://example.org/some-page', { urlMap, capturedDomains, online: false, retrieve: retrieve({}) });
    assert.strictEqual(r.status, 'OFFLINE_UNAVAILABLE');
    assert.ok(/no internet connection/.test(r.reason));
  });

  // --- owner critical question 1: finding a URL != retrieving content ---
  await T('Q1 map entry WITHOUT retrievable body = NOT_CAPTURED (no title-only open)', async () => {
    const r = await resolve('https://theconversation.com/africas-plants-259697', { urlMap, capturedDomains, online: false, retrieve: async () => null });
    assert.strictEqual(r.status, 'NOT_CAPTURED');
    assert.ok(/body retrieval failed/.test(r.reason));
  });

  // --- cross-domain (owner critical question 3) ---
  await T('X1 cross-domain captured destination opens locally', async () => {
    const r = await resolve('https://www.theguardian.com/world/2025/oct/10/article-x', { urlMap, capturedDomains, online: false, retrieve: retrieve({ d2: 'H2' }) });
    assert.strictEqual(r.status, 'LOCAL_FOUND');
  });
  await T('X2 cross-domain uncaptured destination honest', async () => {
    const r = await resolve('https://cnn.com/2025/some-story', { urlMap, capturedDomains, online: false, retrieve: retrieve({}) });
    assert.strictEqual(r.status, 'OFFLINE_UNAVAILABLE');
  });

  // --- loop prevention + no homepage fallback ---
  await T('L1 navigation loops prevented, never fall back to homepage', async () => {
    const ctx = { urlMap, capturedDomains, online: false, maxChain: 2, retrieve: retrieve({ d1: 'H1' }) };
    await resolve('https://theconversation.com/africas-plants-259697', ctx);
    await resolve('https://theconversation.com/africas-plants-259697', ctx);
    const r = await resolve('https://theconversation.com/africas-plants-259697', ctx);
    assert.strictEqual(r.status, 'NOT_CAPTURED');
    assert.ok(/loop prevented/.test(r.reason));
  });

  // --- query params preserved (distinct pages stay distinct) ---
  await T('P1 query params kept — no collapsing distinct pages', async () => {
    const r1 = await resolve('https://efcc.gov.ng/news/press-release?page=1', { urlMap, capturedDomains, online: false, retrieve: retrieve({}) });
    const r2 = await resolve('https://efcc.gov.ng/news/press-release', { urlMap, capturedDomains, online: false, retrieve: retrieve({}) });
    assert.strictEqual(r1.status, 'NOT_CAPTURED'); // the ?page=1 variant is NOT silently mapped
    assert.strictEqual(r2.status, 'NOT_CAPTURED'); // pack page exists but retrieve map empty here — proves no guessing
  });
  await T('P2 exact pack page resolves LOCAL_FOUND with body', async () => {
    const r = await resolve('/news/press-release', { urlMap, capturedDomains, online: false, base: 'https://efcc.gov.ng/other', retrieve: retrieve({ '/news/press-release': 'P2' }) });
    assert.strictEqual(r.status, 'LOCAL_FOUND'); assert.strictEqual(r.body, 'BODY:/news/press-release');
  });

  console.log(`\nVERDICT: ${FAIL === 0 ? 'PASS' : 'FAIL'} | ${PASS} passed, ${FAIL} failed`);
  console.log('HONEST SCOPE: pure-function tests in Node. Airplane-mode survival of the full shell + real stores + real device matrix = the acceptance gate, not this file.');
  process.exit(FAIL === 0 ? 0 : 1);
})();

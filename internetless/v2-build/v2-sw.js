// HARZ Internetless v2 service worker — scope /v2/
const CACHE = 'harz-internetless-v2-r3';
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.add('/v2')).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => k.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (u.origin !== location.origin || !u.pathname.startsWith('/v2')) return;
  // immutable captured content: cache-first — but NEVER cache failures
  if (u.pathname.startsWith('/v2/doc/') || u.pathname.startsWith('/v2/packs/')) {
    e.respondWith(caches.match(e.request).then(m => m || fetch(e.request).then(r => {
      if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
      return r;
    }).catch(() => caches.match(e.request))));
    return;
  }
  // shell: network-first, cached fallback (offline shell survives)
  if (u.pathname === '/v2' || u.pathname === '/v2/' || u.pathname === '/v2/manifest.json') {
    e.respondWith(fetch(e.request).then(r => {
      if (r.ok && (u.pathname === '/v2' || u.pathname === '/v2/')) { const copy = r.clone(); caches.open(CACHE).then(c => c.put('/v2', copy)); }
      return r;
    }).catch(() => caches.match('/v2')));
    return;
  }
  // /v2/resolve and /v2/sync: honest network decision each time — never cached
});

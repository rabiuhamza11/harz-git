// HARZ Internetless v2 service worker — scope /v3 (also intercepts /v2/doc and /v2/packs, same store as v2)
const CACHE = 'harz-internetless-v2-r3';  // SAME cache name as v2 on purpose: one store, one build
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.add('/v3')).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => k.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (u.origin !== location.origin || !(u.pathname.startsWith('/v2') || u.pathname.startsWith('/v3'))) return;
  // immutable captured content: cache-first — but NEVER cache failures
  if (u.pathname.startsWith('/v2/doc/') || u.pathname.startsWith('/v2/packs/')) {
    e.respondWith(caches.match(e.request).then(m => m || fetch(e.request).then(r => {
      if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
      return r;
    }).catch(() => caches.match(e.request))));
    return;
  }
  // shell: network-first, cached fallback (offline shell survives)
  if (u.pathname === '/v3' || u.pathname === '/v3/' || u.pathname === '/v2' || u.pathname === '/v2/' || u.pathname === '/v2/manifest.json' || u.pathname === '/v3/manifest.json') {
    e.respondWith(fetch(e.request).then(r => {
      const key = u.pathname.startsWith('/v3') ? '/v3' : '/v2';
      if (r.ok && (u.pathname === key || u.pathname === key + '/')) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(key, copy)); }
      return r;
    }).catch(() => caches.match(u.pathname.startsWith('/v3') ? '/v3' : '/v2')));
    return;
  }
  // /v2/resolve and /v2/sync: honest network decision each time — never cached
});

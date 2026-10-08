// HARZ Reader service worker — offline by construction, but never stale.
// Network-first for the app shell: online visits always get the latest build,
// offline visits fall back to the cached copy. Cache-first for static assets.
const CACHE = 'harz-reader-v1.1';
const SHELL = [
  '/reader',
  '/icons/reader.svg',
  '/manifests/reader.webmanifest',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return; // engine calls go direct (and fail offline, honestly)
  const isShell = url.pathname === '/reader';
  const isAsset = url.pathname === '/icons/reader.svg' || url.pathname === '/manifests/reader.webmanifest';
  if (!isShell && !isAsset) return;

  if (isShell) {
    // network-first: updates land; offline falls back
    e.respondWith(
      fetch(e.request)
        .then((r) => {
          const copy = r.clone();
          caches.open(CACHE).then((c) => c.put('/reader', copy));
          return r;
        })
        .catch(() => caches.match('/reader').then((hit) => hit || Response.error()))
    );
    return;
  }
  // assets: cache-first
  e.respondWith(
    caches.match(e.request).then((hit) => {
      const net = fetch(e.request).then((r) => {
        const copy = r.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
        return r;
      }).catch(() => hit || Response.error());
      return hit || net;
    })
  );
});

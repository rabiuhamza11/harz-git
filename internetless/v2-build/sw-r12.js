// HARZ Internetless v2 service worker — scope /v2/
// r8 (Oct 18): packs fetched with cache:'reload' on miss — phone HTTP disk cache holds packs 1yr immutable and would keep serving the OLD pack forever; r5 note: cache bumped so phones drop stale visual packs (NYSC images fix, CAC images embedded).
// v2b (Oct 18): shell cached from /v2/ directly (redirect-free) + fallback re-wrapped — Chrome rejects redirected responses for navigations (ERR_FAILED).
const CACHE = 'harz-internetless-v2-r12';
/* HARZ V2 SW SHELF-RELOAD v1 (owner device finding Oct 17): phones hold /v2 immutable-cached for 1yr; c.add() fetches through that cache and re-stores the OLD shell forever. cache:'reload' pulls the current shell from the server once, healing every phone on the next online visit. */
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.match('/v2').then(m => fetch(new Request('/v2/', {cache: 'reload'})).then(r => r.ok ? c.put('/v2', r) : null).then(() => self.skipWaiting()))));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (u.origin !== location.origin || !u.pathname.startsWith('/v2')) return;
  // immutable captured content: cache-first — but NEVER cache failures
  if (u.pathname.startsWith('/v2/packs/')) {
    // r10: packs are network-first (fresh when online), cached copy when offline; never stuck on an old pack
    e.respondWith(fetch(new Request(e.request, {cache: 'reload'})).then(r => {
      if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r; }
      return caches.match(e.request).then(m => m || r);
    }).catch(() => caches.match(e.request).then(m => m || new Response('<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><title>Not stored offline</title><body style="font-family:sans-serif;background:#f0f2f5;color:#111;padding:24px;max-width:480px;margin:auto"><h2>This page is not stored on this phone yet</h2><p>You are offline and this saved page has not been downloaded to this device.</p><p><b>Fix:</b> turn internet on, open the library, tap <b>Sync</b>, and wait for <b>SYNC COMPLETE</b> (packs 62/62). Then it works in airplane mode.</p><p style="font-size:12px;color:#555;word-break:break-all">Missing: ' + u.pathname + '</p><a href="/v2/" style="display:inline-block;margin-top:12px;padding:12px 18px;background:#0a7a3b;color:#fff;border-radius:8px;text-decoration:none">Back to library</a></body>', {status: 404, headers: {'content-type': 'text/html; charset=utf-8'}}))));
    return;
  }
  if (u.pathname.startsWith('/v2/doc/')) {
    e.respondWith(caches.match(e.request).then(m => m || fetch(new Request(e.request, {cache: 'reload'})).then(r => {
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
    }).catch(() => caches.match('/v2').then(r => r ? new Response(r.body, {status: r.status, statusText: r.statusText, headers: r.headers}) : undefined)));
    return;
  }
  // /v2/resolve and /v2/sync: honest network decision each time — never cached
});

/* HARZ CACHE-NAME ORACLE v1 (Oct 17): the page asks the SW for its cache name at runtime — cache-name mismatches between desks can never silence stored bodies again. */
self.addEventListener('message', e => { if (e.data === 'harz-cache-name' && e.source) e.source.postMessage({ cacheName: CACHE }); });

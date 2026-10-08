// HARZ Cloud directory SW — Universal App Contract: shell survives offline.
const C='harz-cloud-dir-v1';
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(C).then(c=>c.add('/').catch(function(){})))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(c=>c!==C).map(c=>caches.delete(c)))));clients.claim()});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;const u=new URL(e.request.url);if(u.origin!==self.location.origin)return;
if(u.pathname==='/'||u.pathname==='/index.html'){e.respondWith(fetch(e.request).then(function(r){if(r&&r.ok){caches.open(C).then(c=>c.put('/',r.clone()))}return r}).catch(function(){return caches.match('/')}));return}});

// HARZ SEARCH v0.1 — Worker logic v2 (D1/FTS5 serving projection)
// Search node B: the frozen API served server-side from a real inverted index
// (SQLite FTS5) with native bm25 ranking. The portable artifact (index-export.json
// in HARZ_SEARCH_KV, digest 8bdec9df…) remains the node-to-node transfer object.
"use strict";

function fts5Query(q) {
  // sanitize to quoted terms, implicit AND — safe against FTS5 injection
  var toks = (q || "").toLowerCase().match(/[a-z0-9][a-z0-9'-]{1,30}/g) || [];
  if (!toks.length) return null;
  var seen = {};
  var out = [];
  for (var i = 0; i < toks.length; i++) {
    var t = toks[i].replace(/['-]/g, "");
    if (t.length >= 2 && !seen[t]) { seen[t] = 1; out.push('"' + t + '"'); }
  }
  return out.length ? out.join(" ") : null;
}

var PAGE = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#f0f2f5">
<title>HARZ Search</title>
<link rel="manifest" href="/manifest.json">
<style>
body{margin:0;font-family:system-ui,-apple-system,sans-serif;background:#f0f2f5;color:#1a1a2e}
main{max-width:640px;margin:0 auto;padding:16px}
h1{font-size:22px;color:#0056b3;margin:8px 0 2px}
.sub{color:#6c757d;font-size:12px;margin-bottom:14px}
form{display:flex;gap:8px}
input[type=search]{flex:1;padding:12px 14px;border:1px solid #ccc;border-radius:10px;font-size:16px;background:#fff}
button{padding:12px 18px;border:none;border-radius:10px;background:#0056b3;color:#fff;font-weight:700;font-size:14px}
.meta{font-size:11px;color:#6c757d;margin:10px 0 14px}
.res{background:#fff;border-radius:10px;padding:12px 14px;margin-bottom:10px;box-shadow:0 1px 2px rgba(0,0,0,.06)}
.res a{color:#0056b3;font-weight:700;text-decoration:none;font-size:15px}
.res .u{font-size:11px;color:#28811a;word-break:break-all;margin:2px 0}
.res .s{font-size:13px;color:#333;line-height:1.45}
.res .b{font-size:10px;color:#8a94a6;margin-top:4px}
footer{font-size:10px;color:#8a94a6;padding:14px 0;text-align:center}
</style></head><body><main>
<h1>HARZ Search</h1>
<div class="sub">independently indexed · portable corpus · honest ranking</div>
<form action="/" method="get"><input type="search" name="q" placeholder="Search the HARZ index…" autofocus><button type="submit">SEARCH</button></form>
<div class="meta" id="stats">loading…</div>
<div id="out"></div>
<footer>HARZ Search v0.1 · BM25 (FTS5) · one index, many nodes</footer>
</main>
<script>
fetch('/stats').then(r=>r.json()).then(s=>{document.getElementById('stats').textContent=s.documents+' documents · '+s.domains+' domains · '+s.unique_terms+' terms · digest '+String(s.index_digest).slice(0,16)+'…'});
var q=new URLSearchParams(location.search).get('q');
if(q){document.querySelector('input').value=q;
fetch('/search?q='+encodeURIComponent(q)).then(r=>r.json()).then(d=>{
document.getElementById('stats').textContent=d.total+' results · '+d.took_ms+' ms';
document.getElementById('out').innerHTML=d.results.map(r=>'<div class="res"><a href="'+r.url+'" target="_blank" rel="noopener">'+esc(r.title)+'</a><div class="u">'+r.url+'</div><div class="s">'+esc(r.snippet)+'</div><div class="b">'+r.domain+' · '+r.source+' · relevance '+r.score+'</div></div>').join('')||'<div class="res">No results.</div>';
});}
function esc(s){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}
</script>
<script>if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js').catch(()=>{})}</script>
</body></html>`;

var MANIFEST = JSON.stringify({name:"HARZ Search",short_name:"HARZ Search",start_url:"/",display:"standalone",background_color:"#f0f2f5",theme_color:"#f0f2f5",icons:[{src:"/icon.svg",sizes:"any",type:"image/svg+xml"}]});
var SW = "const C='harz-search-v1';self.addEventListener('install',e=>self.skipWaiting());self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(c=>c!==C).map(c=>caches.delete(c))))));self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(fetch(e.request).then(r=>{if(r&&r.status===200){caches.open(C).then(c=>c.put(e.request,r.clone()))}return r}).catch(()=>caches.match(e.request)))});";
var ICON = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="#f0f2f5"/><circle cx="44" cy="42" r="22" fill="none" stroke="#0056b3" stroke-width="8"/><line x1="60" y1="58" x2="84" y2="82" stroke="#0056b3" stroke-width="10" stroke-linecap="round"/></svg>';

function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status: status || 200,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
  });
}

async function handle(req) {
  var u = new URL(req.url), p = u.pathname;
  if (p === "/health") {
    var h = await DB.prepare("SELECT COUNT(*) AS n FROM search_index").first();
    return json({ status: "ok", documents: h.n, runtime: "cloudflare-workers+d1-fts5" });
  }
  if (p === "/stats") {
    var s = await DB.prepare(
      "SELECT (SELECT COUNT(*) FROM search_index) AS documents," +
      " (SELECT COUNT(DISTINCT domain) FROM search_index) AS domains").first();
    var m = await DB.prepare("SELECT key, value FROM meta").all();
    var meta = {};
    (m.results || []).forEach(function (r) { meta[r.key] = r.value; });
    return json({
      documents: s.documents, domains: s.domains, unique_terms: Number(meta.unique_terms) || null,
      last_crawl: meta.last_crawl || null, index_digest: meta.index_digest || null,
      engine: "SQLite FTS5 + bm25(title-weighted) · portable artifact digest from indexer",
      runtime: "cloudflare-workers+d1-fts5"
    });
  }
  if (p === "/search") {
    var q = u.searchParams.get("q") || "";
    var match = fts5Query(q);
    if (!match) return json({ query: q, results: [], total: 0, took_ms: 0 });
    var t0 = Date.now();
    var r = await DB.prepare(
      "SELECT id, title, url, domain, source," +
      " snippet(search_index, 10, '…', '…', '…', 14) AS snip," +
      " bm25(search_index, 10.0, 1.0) AS rank" +
      " FROM search_index WHERE search_index MATCH ?1" +
      " ORDER BY rank LIMIT 20").bind(match).all();
    var cnt = await DB.prepare("SELECT COUNT(*) AS n FROM search_index WHERE search_index MATCH ?1").bind(match).first();
    var total = cnt.n; // honest full match count, window caps only the returned rows
    var results = (r.results || []).slice(0, 12).map(function (row) {
      return { id: row.id, title: row.title, url: row.url, domain: row.domain,
        snippet: row.snip, score: Math.round(-row.rank * 100) / 100, source: row.source };
    });
    return json({ query: q, results: results, total: total, took_ms: Date.now() - t0 });
  }
  var dm = p.match(/^\/document\/(\d+)$/);
  if (dm) {
    var d = await DB.prepare("SELECT id, title, url, domain, source, language, fetched_at, content_hash, redirect_chain FROM search_index WHERE id = ?1").bind(Number(dm[1])).first();
    if (!d) return json({ error: "not found" }, 404);
    return json(d);
  }
  if (p === "/" || p === "/index.html") return new Response(PAGE, { headers: { "Content-Type": "text/html; charset=utf-8" } });
  if (p === "/manifest.json") return new Response(MANIFEST, { headers: { "Content-Type": "application/json" } });
  if (p === "/sw.js") return new Response(SW, { headers: { "Content-Type": "application/javascript" } });
  if (p === "/icon.svg") return new Response(ICON, { headers: { "Content-Type": "image/svg+xml" } });
  return json({ error: "not found" }, 404);
}

var DB = null;
export default {
  async fetch(request, env) {
    DB = env.DB; // D1 binding (module format)
    return handle(request);
  }
};

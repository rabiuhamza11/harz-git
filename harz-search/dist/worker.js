// HARZ SEARCH v0.1.1 — FROZEN SEARCH CONTRACT (search-core.js)
// ONE engine, many nodes. Both Node A (sandbox) and Node B (Cloudflare Worker)
// bundle this exact file. Same corpus + same query = byte-identical results.
//
// FROZEN LAWS (v0.1.1 — changing any of these changes the contract version):
//  L1 Tokenizer: lowercase; tokens match /[a-z0-9][a-z0-9'-]{1,30}/g;
//     strip '-' and '''; min length 2; stopword list below. No stemming.
//  L2 Query: tokenize once, dedupe preserving first-occurrence order.
//  L3 Matching: AND — every query token must appear in the doc's
//     (title+body) postings. Any unknown token => zero results.
//  L4 BM25: k1=1.2, b=0.75, idf = ln(1 + (N - df + 0.5)/(df + 0.5)),
//     dl = doc token count (title+body), avgdl = mean doc length.
//     Accumulation order: terms in query order, postings ascending by doc id
//     (floating-point determinism requires identical addition order).
//  L5 Title bonus: hit = count of title-token occurrences present in the
//     query set; score += (hit / nQueryTokens) * ln(N + 1).
//  L6 Ordering: score DESC, then matched-term-count DESC, then doc id ASC.
//  L7 Score: rounded to 2 decimals.
//  L8 Snippet: computed over the FIRST 2000 chars of stored text; window 170;
//     first occurrence of any query token (query order); '…' markers.
//  L9 Result shape (key order frozen): {id,title,url,domain,snippet,score,
//     source,language}. Response: {query,results,total,took_ms};
//     took_ms is performance metadata, EXCLUDED from the determinism contract.
//  L10 Limit: 12 results. total = number of AND-matched docs.
//
// Two phases so remote backends can batch-fetch between them:
//   phase 1  rankDocs(view, getTitle, query) -> {ranked:[[id,score,matched]…], total, qtoks}
//   phase 2  buildResults(getMeta, query, ranked) -> results[]
// Both phases run the identical math on every node.
"use strict";

var STOP = new Set(("a an the of in on for to and or is are was were be been with as at by from this that it its will can has have not but if you your we they he she i us them there here do does did").split(" "));

function tokenize(text) {
  if (!text) return [];
  var out = [], m = String(text).toLowerCase().match(/[a-z0-9][a-z0-9'-]{1,30}/g) || [];
  for (var i = 0; i < m.length; i++) {
    var t = m[i].replace(/['-]/g, "");
    if (t.length >= 2 && !STOP.has(t)) out.push(t);
  }
  return out;
}

function queryTokens(query) {
  var toks = tokenize(query), seen = Object.create(null), out = [];
  for (var i = 0; i < toks.length; i++) {
    if (!seen[toks[i]]) { seen[toks[i]] = 1; out.push(toks[i]); }
  }
  return out;
}

// phase 1 — ranking (needs only term postings + doc titles)
// view = { N, avgdl, getTerm(term) -> {df, postings:[[id,tf,len],…]} | null }
// getTitle(id) -> string (both backends have titles cheap)
function rankDocs(view, getTitle, query) {
  var k1 = 1.2, b = 0.75, N = view.N, avgdl = view.avgdl || 1;
  var qtoks = queryTokens(query);
  if (!qtoks.length) return { ranked: [], total: 0, qtoks: qtoks };

  // L3 AND law: every term must exist
  var termData = [];
  for (var i = 0; i < qtoks.length; i++) {
    var e = view.getTerm(qtoks[i]);
    if (!e || !e.postings.length) return { ranked: [], total: 0, qtoks: qtoks };
    termData.push(e);
  }

  var scores = Object.create(null), matched = Object.create(null);
  for (var qi = 0; qi < termData.length; qi++) {
    var entry = termData[qi];
    var idf = Math.log(1 + (N - entry.df + 0.5) / (entry.df + 0.5));
    for (var p = 0; p < entry.postings.length; p++) {
      var id = entry.postings[p][0], tf = entry.postings[p][1];
      var dl = entry.postings[p][2] || avgdl;
      var s = idf * tf * (k1 + 1) / (tf + k1 * (1 - b + b * dl / avgdl));
      scores[id] = (scores[id] || 0) + s;
      matched[id] = (matched[id] || 0) + 1;
    }
  }

  var need = termData.length, ids = [];
  for (var sid in scores) if (matched[sid] === need) ids.push(Number(sid));
  if (!ids.length) return { ranked: [], total: 0, qtoks: qtoks };
  ids.sort(function (a, c) { return a - c; });

  // L5 title bonus
  var qset = Object.create(null);
  for (var q = 0; q < qtoks.length; q++) qset[qtoks[q]] = 1;
  for (var d = 0; d < ids.length; d++) {
    var title = getTitle(ids[d]);
    if (!title) continue;
    var tt = tokenize(title), hit = 0;
    for (var t = 0; t < tt.length; t++) if (qset[tt[t]]) hit++;
    if (hit) scores[ids[d]] += 1.0 * (hit / Math.max(1, qtoks.length)) * Math.log(N + 1);
  }

  // L6 ordering
  var ranked = [];
  for (var r = 0; r < ids.length; r++) ranked.push([ids[r], scores[ids[r]], matched[ids[r]]]);
  ranked.sort(function (a, c) { return c[1] - a[1] || (c[2] - a[2]) || (a[0] - c[0]); });
  return { ranked: ranked, total: ids.length, qtoks: qtoks };
}

// phase 2 — build frozen-shape results for the top `limit`
// getMeta(id) -> {title,text2000,url,domain,source,language}
function buildResults(getMeta, ranked, qtoks, limit) {
  limit = limit || 12;
  var results = [];
  for (var x = 0; x < Math.min(ranked.length, limit); x++) {
    var m = getMeta(ranked[x][0]);
    if (!m) continue;
    results.push({
      id: ranked[x][0],
      title: m.title,
      url: m.url,
      domain: m.domain,
      snippet: makeSnippet(m.text2000, qtoks),
      score: Math.round(ranked[x][1] * 100) / 100,
      source: m.source,
      language: m.language || ""
    });
  }
  return results;
}

// L8 snippet
function makeSnippet(text, terms, len) {
  len = len || 170;
  if (!text) return "";
  var low = text.toLowerCase(), pos = -1;
  for (var i = 0; i < terms.length; i++) {
    pos = low.indexOf(terms[i]);
    if (pos > -1) break;
  }
  if (pos < 0) return text.slice(0, len) + (text.length > len ? "…" : "");
  var start = Math.max(0, pos - 60);
  return (start > 0 ? "…" : "") + text.slice(start, start + len) + (start + len < text.length ? "…" : "");
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { tokenize: tokenize, queryTokens: queryTokens, rankDocs: rankDocs, buildResults: buildResults, makeSnippet: makeSnippet, STOP: STOP };
}
if (typeof globalThis !== "undefined") {
  globalThis.HarzSearchCore = { tokenize: tokenize, queryTokens: queryTokens, rankDocs: rankDocs, buildResults: buildResults, makeSnippet: makeSnippet };
}

// HARZ SEARCH v0.1.1 — Node B worker logic (bundled after search-core.js)
// The frozen contract runs from HarzSearchCore (identical file on Node A).
// Backend: D1 terms table (postings "id:tf:len"), docs table, meta table.
"use strict";

var CORE = globalThis.HarzSearchCore;

function parsePostings(docs) {
  var out = [];
  var parts = docs.split(",");
  for (var i = 0; i < parts.length; i++) {
    var p = parts[i].split(":");
    out.push([Number(p[0]), Number(p[1]), Number(p[2])]);
  }
  return out;
}

async function fetchRows(DB, sql, params) {
  var st = DB.prepare(sql);
  return (await st.bind.apply(st, params).all()).results || [];
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
<div class="sub">independently indexed · frozen contract · one engine, many nodes</div>
<form action="/" method="get"><input type="search" name="q" placeholder="Search the HARZ index…" autofocus><button type="submit">SEARCH</button></form>
<div class="meta" id="stats">loading…</div>
<div id="out"></div>
<footer>HARZ Search v0.1.1 · deterministic federation · same corpus + same query = same answer</footer>
</main>
<script>
fetch('/stats').then(r=>r.json()).then(s=>{document.getElementById('stats').textContent=s.documents+' documents · '+s.domains+' domains · '+s.unique_terms+' terms · digest '+String(s.index_digest).slice(0,16)+'…'});
var q=new URLSearchParams(location.search).get('q');
if(q){document.querySelector('input').value=q;
fetch('/search?q='+encodeURIComponent(q)).then(r=>r.json()).then(d=>{
document.getElementById('stats').textContent=d.total+' results · '+d.took_ms+' ms';
document.getElementById('out').innerHTML=d.results.map(r=>'<div class="res"><a href="'+r.url+'" target="_blank" rel="noopener">'+esc(r.title)+'</a><div class="u">'+r.url+'</div><div class="s">'+esc(r.snippet)+'</div><div class="b">'+r.domain+' · '+r.source+' · score '+r.score+'</div></div>').join('')||'<div class="res">No results.</div>';
});}
function esc(s){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}
</script>
<script>if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js').catch(()=>{})}</script>
</body></html>`;

var MANIFEST = JSON.stringify({name:"HARZ Search",short_name:"HARZ Search",start_url:"/",display:"standalone",background_color:"#f0f2f5",theme_color:"#f0f2f5",icons:[{src:"/icon.svg",sizes:"any",type:"image/svg+xml"}]});
var SW = "const C='harz-search-v11';self.addEventListener('install',e=>self.skipWaiting());self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(c=>c!==C).map(c=>caches.delete(c))))));self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(fetch(e.request).then(r=>{if(r&&r.status===200){caches.open(C).then(c=>c.put(e.request,r.clone()))}return r}).catch(()=>caches.match(e.request)))});";
var ICON = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="#f0f2f5"/><circle cx="44" cy="42" r="22" fill="none" stroke="#0056b3" stroke-width="8"/><line x1="60" y1="58" x2="84" y2="82" stroke="#0056b3" stroke-width="10" stroke-linecap="round"/></svg>';

function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status: status || 200,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
  });
}

async function handle(req, env) {
  var DB = env.DB;
  var u = new URL(req.url), p = u.pathname;

  if (p === "/health") {
    var h = await DB.prepare("SELECT COUNT(*) AS n FROM docs").first();
    return json({ status: "ok", documents: h.n, contract: "v0.1.1", runtime: "cloudflare-workers+d1-terms" });
  }
  if (p === "/stats") {
    var s = await DB.prepare("SELECT (SELECT COUNT(*) FROM docs) AS documents, (SELECT COUNT(DISTINCT domain) FROM docs) AS domains").first();
    var m = await DB.prepare("SELECT key, value FROM meta").all();
    var meta = {};
    (m.results || []).forEach(function (r) { meta[r.key] = r.value; });
    return json({
      documents: s.documents, domains: s.domains, unique_terms: Number(meta.unique_terms) || null,
      last_crawl: meta.last_crawl || null, index_digest: meta.index_digest || null,
      engine: "frozen search-core v0.1.1 · BM25 AND (k1=1.2, b=0.75) · one engine, many nodes",
      runtime: "cloudflare-workers+d1-terms", contract: "v0.1.1"
    });
  }
  if (p === "/search") {
    var q = u.searchParams.get("q") || "";
    var t0 = Date.now();
    var qtoks = CORE.queryTokens(q);
    var results = [], total = 0;
    if (qtoks.length) {
      var metaRows = await fetchRows(DB, "SELECT key, value FROM meta", []);
      var mv = {};
      metaRows.forEach(function (m2) { mv[m2.key] = m2.value; });

      // term rows (chunked IN, <=90 params per query)
      var termMap = Object.create(null);
      var known = true;
      for (var c = 0; c < qtoks.length; c += 90) {
        var chunk = qtoks.slice(c, c + 90);
        var ph = chunk.map(function (_, i) { return "?" + (i + 1); }).join(",");
        var rows = await fetchRows(DB, "SELECT term, df, docs FROM terms WHERE term IN (" + ph + ")", chunk);
        rows.forEach(function (row) { termMap[row.term] = row; });
      }
      for (var t = 0; t < qtoks.length; t++) if (!termMap[qtoks[t]]) known = false;

      if (known) {
        var view = {
          N: Number(mv.documents) || 0,
          avgdl: Number(mv.avgdl) || 1,
          getTerm: function (term) {
            var row = termMap[term];
            if (!row) return null;
            return { df: row.df, postings: parsePostings(row.docs) };
          }
        };

        // candidate ids = union of postings (titles needed for L5 bonus)
        var cand = [], seen = Object.create(null);
        for (var t2 = 0; t2 < qtoks.length; t2++) {
          var ps = termMap[qtoks[t2]].docs.split(",");
          for (var pi = 0; pi < ps.length; pi++) {
            var id = Number(ps[pi].split(":")[0]);
            if (!seen[id]) { seen[id] = 1; cand.push(id); }
          }
        }
        cand.sort(function (a, b) { return a - b; });

        var titleCache = new Map();
        for (var b = 0; b < cand.length; b += 90) {
          var bids = cand.slice(b, b + 90);
          var bph = bids.map(function (_, i) { return "?" + (i + 1); }).join(",");
          var trows = await fetchRows(DB, "SELECT id, title FROM docs WHERE id IN (" + bph + ")", bids);
          trows.forEach(function (row) { titleCache.set(row.id, row.title); });
        }
        var getTitle = function (id) { return titleCache.get(id) || null; };

        var rk = CORE.rankDocs(view, getTitle, q); // FROZEN CONTRACT phase 1
        total = rk.total;

        // phase 2: full meta only for the top 12
        var topIds = rk.ranked.slice(0, 12).map(function (r) { return r[0]; });
        var metaCache = new Map();
        if (topIds.length) {
          var mph = topIds.map(function (_, i) { return "?" + (i + 1); }).join(",");
          var mrows = await fetchRows(DB, "SELECT id, title, url, domain, source, language, snippet_text FROM docs WHERE id IN (" + mph + ")", topIds);
          mrows.forEach(function (row) {
            metaCache.set(row.id, { title: row.title, text2000: row.snippet_text, url: row.url,
              domain: row.domain, source: row.source, language: row.language || "" });
          });
        }
        var getMeta = function (id) { return metaCache.get(id) || null; };
        results = CORE.buildResults(getMeta, rk.ranked, rk.qtoks, 12);
      }
    }
    return json({ query: q, results: results, total: total, took_ms: Date.now() - t0 });
  }
  var dm = p.match(/^\/document\/(\d+)$/);
  if (dm) {
    var d = await DB.prepare("SELECT id, title, url, domain, source, language, fetched_at, content_hash, redirect_chain, snippet_text FROM docs WHERE id = ?1").bind(Number(dm[1])).first();
    if (!d) return json({ error: "not found" }, 404);
    return json({ id: d.id, title: d.title, url: d.url, domain: d.domain, source: d.source,
      language: d.language || "", fetched_at: d.fetched_at, content_hash: d.content_hash,
      redirect_chain: JSON.parse(d.redirect_chain || "[]"), text: d.snippet_text });
  }
  if (p === "/" || p === "/index.html") return new Response(PAGE, { headers: { "Content-Type": "text/html; charset=utf-8" } });
  if (p === "/manifest.json") return new Response(MANIFEST, { headers: { "Content-Type": "application/json" } });
  if (p === "/sw.js") return new Response(SW, { headers: { "Content-Type": "application/javascript" } });
  if (p === "/icon.svg") return new Response(ICON, { headers: { "Content-Type": "image/svg+xml" } });
  return json({ error: "not found" }, 404);
}

export default {
  async fetch(request, env) {
    return handle(request, env);
  }
};

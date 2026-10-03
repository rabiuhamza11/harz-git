// HARZ SEARCH v0.3 — FROZEN SEARCH CONTRACT (search-core.js)
// ONE engine, many nodes. Both Node A (sandbox) and Node B (Cloudflare Worker)
// bundle this exact file. Same corpus + same query = byte-identical results.
//
// FROZEN LAWS (v0.3 — changing any of these changes the contract version):
//  L1 Tokenizer: lowercase; tokens match /[a-z0-9][a-z0-9'-]{1,30}/g;
//     strip '-' and '''; min length 2; stopword list below. No stemming.
//  L2 Query: tokenize once, dedupe preserving first-occurrence order.
//  L3 Matching tier 1: AND — every query token must appear in the doc's
//     (title+body) postings.
//  L3b Matching tier 2 (relaxation, ONLY when tier 1 yields zero): terms
//     with no postings are dropped first. If strict AND over the remaining
//     known terms is still empty, iteratively drop the term with the lowest
//     df (tie: lexicographic ASC) until a non-empty conjunction exists or
//     one term remains. Served results are ranked by BM25 over the retained
//     terms only. Response marks match:"relaxed" and lists dropped terms.
//     Tier-1 count is preserved as strict_total. No query rewrites, no AI.
//  L4 BM25: k1=1.2, b=0.75, idf = ln(1 + (N - df + 0.5)/(df + 0.5)),
//     dl = doc token count (title+body), avgdl = mean doc length.
//     Accumulation order: terms in query order, postings ascending by doc id
//     (floating-point determinism requires identical addition order).
//  L4b Version freshness (deterministic): if a doc's URL path contains a
//     segment matching /^v?(\d{1,2})(\.\d+)*(beta\d*)?$/i, its major version V
//     is extracted. Per domain, Vmax = max V among the ranked docs. Bonus
//     = 0.5 * (V / Vmax), added to the BM25+title score before ordering.
//     Docs with no URL version get no bonus. Rationale: current versioned
//     documentation must not lose to ancient docs on lexical ties alone.
//  L5 Title bonus: hit = count of display-title token occurrences present in
//     the query set; score += (hit / nQueryTokens) * ln(N + 1).
//     Display title (L8b) is a pure function of stored title + first 2000
//     chars of page text, so the bonus stays deterministic on every node.
//  L6 Ordering: score DESC, then matched-term-count DESC, then doc id ASC
//     (applied after L4b bonus).
//  L7 Score: rounded to 2 decimals (displayed score includes L4b).
//  L8 Snippet: computed over the FIRST 2000 chars of stored text; window 170;
//     first occurrence of any query token (query order); '…' markers.
//  L8b Display title (deterministic derivation, no fabrication): if the
//     stored title is generic (its first segment, split on site separators,
//     tokenizes to only generic/stop words), derive the display title from
//     the page's own stored text: strip leading nav phrases from the fixed
//     list, cut at the first nav phrase at offset >= 20, keep the segment
//     if it is 25-120 chars with >= 4 alphabetic words. Otherwise keep the
//     stored title. Derived titles are used for display and L5 only.
//  L9 Result shape (key order frozen): {id,title,url,domain,snippet,score,
//     source,language}. Response: {query,match,dropped,results,total,
//     strict_total,took_ms}; took_ms is performance metadata, EXCLUDED from
//     the determinism contract. match is "and" | "relaxed" | "none".
//  L10 Limit: 12 results. total = matched docs of the served tier.
//     strict_total = tier-1 strict-AND count (0 when relaxation served).
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


// L8b — deterministic display-title derivation (no fabrication: source is the page's own text)
var GENERIC = new Set(("blog home welcome documentation docs index untitled archives archive page site main menu search login signin account about contact gallery portfolio resources links").split(" "));
var NAV_PHRASES = ["skip to main content", "skip to content", "skip to navigation", "learn more", "dismiss", "toggle navigation", "read more", "->", "\u00bb"];

function isGenericTitle(title) {
  if (!title) return true;
  var first = String(title).split(/\s+[|\u2013\u2014\u00b7:\-]\s+/)[0] || String(title);
  var toks = tokenize(first);
  if (!toks.length) return true;
  for (var i = 0; i < toks.length; i++) if (!GENERIC.has(toks[i]) && !STOP.has(toks[i])) return false;
  return true;
}

function deriveTitle(storedTitle, text) {
  if (!isGenericTitle(storedTitle)) return storedTitle;
  if (!text) return storedTitle;
  var s = String(text), low = s.toLowerCase();
  var changed = true;
  while (changed) {
    changed = false;
    for (var i = 0; i < NAV_PHRASES.length; i++) {
      var np = NAV_PHRASES[i];
      while (low.indexOf(np) === 0) {
        s = s.slice(np.length); low = s.toLowerCase();
        s = s.replace(/^[\s,;:\u2013\u2014\u00b7>|\u00bb]+/, ""); low = s.toLowerCase();
        changed = true;
      }
    }
  }
  var cut = s.length;
  for (var j = 0; j < NAV_PHRASES.length; j++) {
    var idx = low.indexOf(NAV_PHRASES[j], 20);
    if (idx > -1 && idx < cut) cut = idx;
  }
  var seg = s.slice(0, cut).replace(/\s+/g, " ").trim().replace(/[.,;:\u2013\u2014\u00b7>|\u00bb]+$/, "").trim();
  if (seg.length >= 25 && seg.length <= 120) {
    var words = seg.split(" ").filter(function (w) { return /[a-zA-Z]/.test(w); }).length;
    if (words >= 4) return seg;
  }
  return storedTitle;
}

// L4b — deterministic URL-path version extraction
function extractUrlVersion(url) {
  try {
    var path = new URL(url).pathname.split("/");
    for (var i = 0; i < path.length; i++) {
      var m = path[i].match(/^v?(\d{1,2})(?:\.\d+)*(?:beta\d*)?$/i);
      if (m) return Number(m[1]);
    }
  } catch (e) {}
  return null;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { tokenize: tokenize, queryTokens: queryTokens, rankDocs: rankDocs, buildResults: buildResults, makeSnippet: makeSnippet, isGenericTitle: isGenericTitle, deriveTitle: deriveTitle, extractUrlVersion: extractUrlVersion, STOP: STOP };
}
if (typeof globalThis !== "undefined") {
  globalThis.HarzSearchCore = { tokenize: tokenize, queryTokens: queryTokens, rankDocs: rankDocs, buildResults: buildResults, makeSnippet: makeSnippet, isGenericTitle: isGenericTitle, deriveTitle: deriveTitle, extractUrlVersion: extractUrlVersion };
}
// HARZ SEARCH v0.3 — Node B worker logic (bundled after search-core.js)
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
<footer>HARZ Search v0.3 · deterministic federation · same corpus + same query = same answer</footer>
</main>
<script>
fetch('/stats').then(r=>r.json()).then(s=>{document.getElementById('stats').textContent=s.documents+' documents · '+s.domains+' domains · '+s.unique_terms+' terms · digest '+String(s.index_digest).slice(0,16)+'…'});
var q=new URLSearchParams(location.search).get('q');
if(q){document.querySelector('input').value=q;
fetch('/search?q='+encodeURIComponent(q)).then(r=>r.json()).then(d=>{
document.getElementById('stats').textContent=d.total+' results'+(d.match==='relaxed'?' · relaxed match — dropped: '+d.dropped.join(', '):'')+' · '+d.took_ms+' ms';
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
    return json({ status: "ok", documents: h.n, contract: "v0.3", runtime: "cloudflare-workers+d1-terms" });
  }
  if (p === "/stats") {
    var s = await DB.prepare("SELECT (SELECT COUNT(*) FROM docs) AS documents, (SELECT COUNT(DISTINCT domain) FROM docs) AS domains").first();
    var m = await DB.prepare("SELECT key, value FROM meta").all();
    var meta = {};
    (m.results || []).forEach(function (r) { meta[r.key] = r.value; });
    return json({
      documents: s.documents, domains: s.domains, unique_terms: Number(meta.unique_terms) || null,
      last_crawl: meta.last_crawl || null, index_digest: meta.index_digest || null,
      engine: "frozen search-core v0.3 · BM25 AND (k1=1.2, b=0.75) · one engine, many nodes",
      runtime: "cloudflare-workers+d1-terms", contract: "v0.3"
    });
  }
  if (p === "/search") {
    var q = u.searchParams.get("q") || "";
    var t0 = Date.now();
    var qtoks = CORE.queryTokens(q);
    var results = [], total = 0, match = "none", dropped = [], strictTotal = 0;
    if (qtoks.length) {
      var metaRows = await fetchRows(DB, "SELECT key, value FROM meta", []);
      var mv = {};
      metaRows.forEach(function (m2) { mv[m2.key] = m2.value; });

      // term rows (chunked IN, <=90 params per query)
      var termMap = Object.create(null);
      for (var c = 0; c < qtoks.length; c += 90) {
        var chunk = qtoks.slice(c, c + 90);
        var ph = chunk.map(function (_, i) { return "?" + (i + 1); }).join(",");
        var rows = await fetchRows(DB, "SELECT term, df, docs FROM terms WHERE term IN (" + ph + ")", chunk);
        rows.forEach(function (row) { termMap[row.term] = row; });
      }

      // L3b step 1: terms with no postings can never match
      var known = [];
      for (var t = 0; t < qtoks.length; t++) {
        if (termMap[qtoks[t]]) known.push(qtoks[t]);
        else dropped.push(qtoks[t]);
      }

      var idsets = {};
      var idsOf = function (term) {
        if (!(term in idsets)) {
          var s = Object.create(null);
          var ps = parsePostings(termMap[term].docs);
          for (var i2 = 0; i2 < ps.length; i2++) s[ps[i2][0]] = 1;
          idsets[term] = s;
        }
        return idsets[term];
      };
      var intersect = function (terms) {
        if (!terms.length) return [];
        var acc = null;
        for (var i3 = 0; i3 < terms.length; i3++) {
          var cur = idsOf(terms[i3]);
          if (acc === null) { acc = Object.create(null); for (var k in cur) acc[k] = 1; }
          else { for (var k2 in acc) if (!cur[k2]) delete acc[k2]; }
          var n = 0; for (var k3 in acc) n++;
          if (!n) return [];
        }
        var out = [];
        for (var k4 in acc) out.push(Number(k4));
        out.sort(function (a, b) { return a - b; });
        return out;
      };

      // L3 tier 1: strict AND
      var conj = intersect(known);
      strictTotal = conj.length;

      // L3b tier 2: deterministic relaxation when tier 1 is empty
      var retained = known.slice();
      if (!conj.length) {
        while (retained.length > 1) {
          retained.sort(function (a, b) {
            var da = termMap[a].df, db = termMap[b].df;
            return da - db || (a < b ? -1 : a > b ? 1 : 0);
          });
          dropped.push(retained.shift());
          conj = intersect(retained);
          if (conj.length) break;
        }
        match = conj.length ? "relaxed" : "none";
        if (!conj.length) retained = [];
      } else {
        match = "and";
      }

      if (retained.length && conj.length) {
        var view = {
          N: Number(mv.documents) || 0,
          avgdl: Number(mv.avgdl) || 1,
          getTerm: function (term) {
            var row = termMap[term];
            if (!row) return null;
            return { df: row.df, postings: parsePostings(row.docs) };
          }
        };

        // candidates = conjunction docs; fetch title/url/domain/text for L5b + L8b + L4b
        var docCache = new Map();
        for (var b = 0; b < conj.length; b += 90) {
          var bids = conj.slice(b, b + 90);
          var bph = bids.map(function (_, i) { return "?" + (i + 1); }).join(",");
          var trows = await fetchRows(DB, "SELECT id, title, url, domain, snippet_text FROM docs WHERE id IN (" + bph + ")", bids);
          trows.forEach(function (row) { docCache.set(row.id, row); });
        }
        var dispCache = new Map();
        var getTitle = function (id) {
          if (!dispCache.has(id)) {
            var row = docCache.get(id);
            dispCache.set(id, row ? CORE.deriveTitle(row.title, row.snippet_text) : null);
          }
          return dispCache.get(id);
        };

        var rk = CORE.rankDocs(view, getTitle, retained.join(" ")); // FROZEN CONTRACT phase 1 (BM25 unchanged)
        total = rk.total;

        // L4b: deterministic version-freshness bonus (URL path version, per-domain normalized)
        var FRESH = 0.5;
        var vmaxByDomain = Object.create(null), verByDoc = Object.create(null);
        for (var r2 = 0; r2 < rk.ranked.length; r2++) {
          var did = rk.ranked[r2][0];
          var rowD = docCache.get(did);
          if (!rowD) continue;
          var ver = CORE.extractUrlVersion(rowD.url);
          verByDoc[did] = ver;
          if (ver && (!(rowD.domain in vmaxByDomain) || ver > vmaxByDomain[rowD.domain])) vmaxByDomain[rowD.domain] = ver;
        }
        for (var r3 = 0; r3 < rk.ranked.length; r3++) {
          var did2 = rk.ranked[r3][0];
          var v2 = verByDoc[did2];
          var dom2 = docCache.get(did2) ? docCache.get(did2).domain : null;
          if (v2 && dom2 && dom2 in vmaxByDomain) rk.ranked[r3][1] += FRESH * (v2 / vmaxByDomain[dom2]);
        }
        rk.ranked.sort(function (a, c) { return c[1] - a[1] || (c[2] - a[2]) || (a[0] - c[0]); }); // L6 re-order after bonus

        // phase 2: full meta for the top 12 (display title per L8b)
        var topIds = rk.ranked.slice(0, 12).map(function (r) { return r[0]; });
        var metaCache = new Map();
        if (topIds.length) {
          var mph = topIds.map(function (_, i) { return "?" + (i + 1); }).join(",");
          var mrows = await fetchRows(DB, "SELECT id, title, url, domain, source, language, snippet_text FROM docs WHERE id IN (" + mph + ")", topIds);
          mrows.forEach(function (row) {
            metaCache.set(row.id, {
              title: CORE.deriveTitle(row.title, row.snippet_text),
              text2000: row.snippet_text, url: row.url,
              domain: row.domain, source: row.source, language: row.language || ""
            });
          });
        }
        var getMeta = function (id) { return metaCache.get(id) || null; };
        results = CORE.buildResults(getMeta, rk.ranked, qtoks, 12);
      }
    }
    return json({ query: q, match: match, dropped: dropped, results: results, total: total, strict_total: strictTotal, took_ms: Date.now() - t0 });
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
--44b3b5b4e7727f008dfe1f81654580ade1dc89f17dcf7583cd91393cb76d--

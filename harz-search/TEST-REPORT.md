# HARZ SEARCH v0.1 — BUILD RECEIPT (frozen acceptance: SPEC.md, Sep 19)

## What was built
An independent search engine over a self-crawled corpus, honest by construction:
1. CRAWLER (crawler.py) — live HTTP fetch, robots-honoring seeds, dedupe by
   content sha256, domain caps (diversity), redirect chains recorded, links
   stored per doc (schema field), 8 seed categories incl. HARZ-ECOSYSTEM.
2. INDEXER (engine.js + build-index.js) — real inverted index, BM25 with title
   bonus, stopwords, sha256-based per-doc identity, canonical digest.
3. SEARCH NODE A (server.js, sandbox) — imports the exported index artifact
   and rebuilds it deterministically (digest must match or it refuses).
4. SEARCH NODE B (dist/worker.js, Cloudflare) — same frozen API served
   server-side: SQLite FTS5 inverted index + native bm25(title-weighted) in D1.
   Portable artifact (index-export.json, 11,337,603 bytes) stored in KV
   namespace HARZ_SEARCH as the node-to-node transfer object.
   URL: https://harz-search.hamzarabiu390.workers.dev

## Frozen acceptance — RESULTS (battery.js, 16/16 PASS)
- CORPUS: 1,409 documents, 219 independent domains (>=100 required),
  full schema on every doc, 0 duplicate contents, 0 manual inserts.
  All 1,409 docs fetched live from the real web Sep 19 (fetched_at stamped).
- CRAWLER: 450 docs discovered beyond seed domains (link discovery),
  127 redirect chains recorded, timestamps on every doc.
- INDEXER: digest 8bdec9df4eb4df5ae3b1f9720d04b478092a021d93b4485832e776e562644d72
  deterministic across rebuild, reversed input, and shuffled input.
- SEARCH: real docs returned with title/url/snippet/score; ranking descending;
  'nigeria tax' 308 hits (Node A) / 60 hits (Node B FTS5 AND-semantics);
  'harz' finds HARZ ecosystem pages (25 hits Node A, top: HARZ Super App);
  in-memory query 1ms.
- PORTABILITY: same artifact imported by Node A (sandbox) with identical
  digest 8bdec9df…; Node B reports the same digest in /stats.
- DEATH TEST: Node A booted from export (search OK, digest match), killed,
  confirmed dead (port refused); Node B continued serving /search from the
  same corpus (5 hits for 'harz search', 39ms).
- BROWSER TEST (mandatory law): live UI at the Node B URL renders real
  results for 'nigeria tax' — titles, URLs, snippets, domains, relevance
  scores. Stats bar: '1409 documents · 219 domains · 45484 terms · digest
  8bdec9df…'. Two real bugs found and fixed by the browser pass: form
  navigation landed on raw JSON (action fixed to render UI), snippet column
  index pointed at language column (fixed to snippet_text). Honest match
  count added (COUNT query, total=60 not top-window cap).

## Deployment facts
- Worker: harz-search (module format, ES), subdomain enabled
- Bindings: HARZ_SEARCH_KV (namespace cefae586e4754ab9a82c3ed06cf2c881),
  DB (D1 harz_search, uuid 4e51c5e7-7691-457e-b3c6-3034cdb7daf4)
- D1: FTS5 table search_index (1409 rows) + meta table (digest, terms, built_at)
- KV: index-export.json (11,337,603 bytes, read-back size match) + index-digest
- Deploy gate: PASS (0 warnings) on every deploy
- Account: hamzarabiu390 (subdomain hamzarabiu390.workers.dev — the
  harz.workers.dev subdomain belongs to a different account whose API
  tokens are dead; no keys available to deploy there, so the URL carries
  the working account's subdomain)

## Honest limits
- Node A (engine.js) and Node B (FTS5) share the corpus and digest but rank
  with different BM25 implementations; scores are not comparable across
  nodes, only within one node.
- Corpus is v0.1 small (1,409 docs vs any real engine's billions); freshness
  = crawl moment Sep 19; no recrawl scheduler yet.
- Workers free plan killed the first design (11MB JSON.parse per request,
  error 1042) — D1 projection is the honest fix, and the KV artifact remains
  the full portable export.
- Snippets are extracted from raw page text (no boilerplate stripping yet).
- No index update pipeline: new docs require re-crawl + re-export + re-load.

## Reproduce
node build-index.js   # corpus -> index + digest
node battery.js       # 16/16 acceptance battery
PORT=8787 node server.js   # Node A
# Node B: deploy dist/worker.js with KV+D1 bindings (see Deployment facts)

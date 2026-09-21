# HARZ SEARCH v0.1 — FROZEN SPEC (Sep 19, 2026, owner order)

Objective: a real, testable search engine — not a mock search box.
Small independent web index, fast search, honest ranking, portable index between nodes.

## Architecture
Query Gateway (/search?q=) → Query/Ranking (BM25) → Inverted Index + Document Store → Search Node
 fed by Crawler (seeded, capped) + Indexer (deterministic digest) + Replicator (export/import).

## Corpus target
1,000–10,000 genuine documents. ≥1,000 docs, ≥100 independent domains.
Categories: HARZ, Nigeria, technology, business, education, science, government/public info, open-source.
NO manually inserted search results. Real crawled data only.

## Document schema
{url, title, text, links[], fetched_at, content_hash, language, source, domain, first_seen/last_seen, redirect_chain}

## Anti-spam from day one
source + content_hash + canonical URL + redirect chain + crawl timestamp + robots.txt respect
+ per-domain page caps + max crawl depth + max document size + duplicate-content threshold.

## Ranking
BM25 (k1=1.2, b=0.75) + title-match bonus. Snippet from stored text. Response time measured.

## API
GET /search?q=... → {query, results[{title,url,snippet,score}], total, took_ms}
GET /document/<id> · GET /health · GET /stats → {documents, domains, unique_terms, last_crawl, index_digest}

## UI
Minimal browser page. Light theme (#f0f2f5), PWA (manifest + SW). Search quality is the product.

## Portability
Index = portable artifact with sha256 digest. Export → import on another runtime → identical corpus → identical digest.

## FROZEN ACCEPTANCE TEST — PASS CRITERIA (pre-registered)
CORPUS:    ≥1,000 genuine documents; ≥100 independent domains; zero hand-inserted results
CRAWLER:   discovers links; handles redirects; detects duplicate content (content_hash); records timestamps
INDEXER:   real inverted index; survives restart; deterministic digest (rebuild → identical)
SEARCH:    returns real indexed documents; title/snippet displayed; BM25 ranking works; response time measured
PORTABILITY: export index; import on another runtime; identical corpus → identical digest
DEATH TEST: kill Node A → start Node B from exported index → search continues
HONESTY:   no "better than Google" claim. First honest claim: independently indexed, portable
           search engine with a real crawl corpus and reproducible search index.

## Build order (frozen)
1 document schema → 2 crawler → 3 document store → 4 inverted index → 5 BM25
→ 6 search API → 7 browser UI → 8 digest/export/import → 9 second-node replication → 10 death test
v0.2 later: semantic search, freshness, language detection, distributed crawling.

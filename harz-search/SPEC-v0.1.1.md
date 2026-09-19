# HARZ SEARCH v0.1.1 — FROZEN CONTRACT: DETERMINISTIC FEDERATION (Sep 19, owner order)

## Goal (owner's words)
One index + one query = one deterministic answer, regardless of which HARZ node serves it.

## The fix
v0.1 had two ranking stacks: Node A (engine.js, OR semantics) and Node B (SQLite FTS5,
AND semantics, porter stemming, different bm25). Same corpus, different answers.

v0.1.1 replaces BOTH stacks with ONE file: search-core.js. Both nodes bundle the
identical file. Verified sha256 (first 24): a9fc8a4d4201a947e1aaf1a3.

## Frozen laws (L1-L10, see search-core.js header)
L1 tokenizer (lowercase, /[a-z0-9][a-z0-9'-]{1,30}/g, strip -', min 2, stopwords, NO stemming)
L2 query dedupe, first-occurrence order
L3 AND matching; any unknown token => zero results
L4 BM25 k1=1.2 b=0.75, idf=ln(1+(N-df+0.5)/(df+0.5)), dl=title+body tokens,
   accumulation order fixed (query order, postings ascending by id) for FP determinism
L5 title bonus: (hit/nQueryTokens)*ln(N+1)
L6 ordering: score DESC, matched-count DESC, doc id ASC
L7 score rounded to 2 decimals
L8 snippet over first 2000 chars of stored text, window 170
L9 result/response key order frozen; took_ms excluded from determinism contract
L10 limit 12; total = AND-match count

## Node architecture
Node A (sandbox, server.js): imports 11MB portable artifact (digest enforced), serves
from memory via search-core.js two phases (rankDocs / buildResults).
Node B (Cloudflare Worker, dist/worker.js): bundles search-core.js verbatim; serves from
D1 terms table (45,484 rows, postings "id:tf:len"), docs table, meta table. New D1:
harz_search_v011 (4fe7756e-ac77-4143-b769-b45e092f814f). KV artifact unchanged
(11MB export, digest 8bdec9df…).

## Proof (owner's 8 points)
1. OR/AND discrepancy — FIXED: both nodes AND (one law, one file)
2. Tokenizer/normalizer — FROZEN (L1/L2)
3. Ranking parameters — FROZEN (L4/L5)
4. Deterministic ordering for equal scores — L6 (id tie-break)
5. Canonical query test suite — fed-test.js, 30 queries
6. Same queries against Node A and Node B — done
7. Byte-identical JSON — 30/30 PASS (canonical, took_ms excluded by L9)
8. Death test re-run — PASS (Node A killed+confirmed dead; Node B served the
   identical canonical answer: 'harz search' total 5, top HARZ Super App v5.0, 13.55)

Evidence: corpus/federation-test.json (30/30 verdict BYTE-IDENTICAL).
Honest note: fed-test run 1 showed 0/30 — the failure was in the test harness
(http module used for an https URL), not in engine divergence; fixed harness, then 30/30.

## Honest limits (unchanged from v0.1 + new)
- Corpus still 1,409 docs / 219 domains; freshness = crawl moment Sep 19.
- took_ms differs by node by nature (performance metadata, excluded from contract).
- Node B fetches candidate titles per query (D1 batched reads); single-common-word
  queries cost the most (~150-950ms). Corpus-scale acceptable; scale-dependent.
- search-core.js is sync: remote backends prefetch candidates before phase 2.
- No recrawl/update pipeline yet (v0.2 scope per owner).

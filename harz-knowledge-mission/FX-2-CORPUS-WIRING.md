# FX-2 CORPUS-WIRED FULL-TEXT TIER (Oct 12, 2026 — Rabiu: "Wire the 1000000+", "Beware of duplicate")

## Scope (disclosed)
Wires the ENTIRE master corpus (1,328,496 docs / 7.64GB) into the live full-text
search tier, with ZERO text duplication (Rabiu's "beware of duplicate").

## Architecture (index-only, corpus is the single source of truth)
- NEW D1 `harz-fx-idx` (a1, uuid 389b1bdf-c3d7-4265-9399-d023a7c506df):
  CONTENTLESS FTS5 table fx_fts. Stores ONLY the inverted index — no text.
  rowid = corpus_id*64 + part (parts <=85KB at word boundaries, <=64 parts;
  doc id = rowid >> 6). Meta table holds build checkpoints.
- NEW WORKER `harz-fx-search` (a1, harz-fx-search.harz.workers.dev, fx2-js-1.0.0):
  /fx1/search?q= (FTS5 MATCH -> rowid>>6 -> corpus meta+head join, BM25 rank),
  /fx1/doc/:id (FULL text from master corpus), /fx1/stats. 12 results cap,
  quoted-token AND queries, snippet computed from doc head (first 4KB) —
  disclosed: deep positions in >4KB docs are found by the index but the
  snippet shows the head window.
- Master corpus harz-million-corpus UNTOUCHED (schema, data, cap headroom intact).
- Old pilot FX-1 (harz-fx-v1 on a2, ~10 docs) RETAINED as fallback only.

## Wiring (all verified live, Oct 12 ~08:55 WAT)
- harz-search (a1): NEW service binding FXSEARCH -> harz-fx-search
  (same-account public fetch = loop protection 1042; binding is the sanctioned
  path). /fx/search + /fx/doc try FX-2 first, fall back to FX-1 pilot.
- harz-search (a2): same source, public-URL path (cross-account OK), pilot fallback.
- harz-ai /api/fx (service binding -> a1 harz-search): VERIFIED live —
  "kano commerce" -> count 1, real corpus doc (theconversation.com freight piece).
- a1/a2 core /search: byte-identical behavior preserved (regression verified
  pre/post: a1 top score 32.11 unchanged, a2 13.96).
- harz-search-node-a: NOT touched (pre-existing state: no FX route; disclosed).

## Builder (resumable, idempotent)
fx2-index-builder.py: 3 bands (id ranges 1-450K, 450K-900K, 900K+), size-aware
read windows (~650KB), <=88KB statements, per-statement rowid existence guard
(no duplicate postings on re-runs), per-band checkpoints in meta.

### INCIDENT (v1 builder, disclosed)
v1 used shared temp filenames `_q{N}.json` across the 3 band processes —
simultaneous writes corrupted queries and checkpoints (band 1 read band 0's
checkpoint and began double-indexing band 0's range; the 08:00 sandbox recycle
also killed all builders silently — pkill/pgrep absent, kill unconfirmed).
CONTAMINATED INDEX DROPPED ENTIRELY (contentless FTS cannot delete rows) and
rebuilt clean from id 0 with per-process unique files + the existence guard.
No duplicate postings can reach the clean index (guard + fresh table).

## Status at commit
Build IN PROGRESS (started 08:40 WAT, ~7.64GB to index, ETA several hours;
resumable — checkpoints survive restarts; re-running a band is safe/idempotent).
Index grows live: searches work NOW but return only what is indexed so far.
Search quality contract: FX = full-text tier, NEVER sealed-5K evidence
(labels preserved exactly per FX tier ruling Oct 11).

## Rollback
harz-search: redeploy fx-tier/harz-search-fx.js @ commit 6fd4fb3 (pre-FX-2).
harz-fx-search worker + harz-fx-idx DB: delete (index-only; no corpus impact).

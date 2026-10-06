# HARZ OFFLINE READER — FROZEN CHARTER v0.1 (Oct 6, 2026, owner: "Go. Freeze it.")

## The crown sentence (frozen)
"HARZ knows not only that the page exists — it holds the page itself, and reads
it when the Internet is gone."

## The frozen rule (never violated, never reinterpreted)
> A prefix is never a page. A cached page is never live. A URL is never proof
> that its content is locally available.

## Gap check (done before freeze, honest)
- Corpus v0.1 (1,409 docs, digest 8bdec9df) ALREADY stores per doc: extracted
  readable text (median 4,147 chars, capped 6,000), content_hash, fetched_at,
  url, domain, language. So acquisition/extraction/sealing/determinism are
  PROVEN primitives, not new work.
- The cap means long articles are 6,000-char PREFIXES. Silent prefix = the exact
  overclaim class we just eliminated (owner caught the dino screen Oct 6, 8:17PM).
- Missing: the reader layer (open local text instead of navigating to URL),
  provenance labels, full-length acquisition, reader death test.

## STAGE A — Offline Reader v0.1 (immediate build)
Scope: existing 1,409-page corpus, untouched, no new crawl.
1. Clicking a result opens the LOCAL STORED TEXT, never the URL.
2. Provenance displayed on every reader page: CACHED + fetched_at + content_hash.
3. TRUNCATED label displayed whenever the stored text hit the 6,000-char cap.
4. Search within the stored page (client-side, no network).
5. Zero network dependency by construction (no fetch/http-client calls; local
   http server only).
6. Death test: internet disabled, reader opens and searches within pages.
7. Existing corpus artifact and all frozen pins (search-core 853dc0ff, engine
   f442a6a5, server 2794cb73) remain byte-untouched; reader is ADDITIVE.
Stage A success: the phone finds an indexed article, opens its locally stored
content, reads and searches it with the internet completely dead.

## STAGE B — Full Offline Reader v0.2 (after Stage A is field-proven)
Scope: deliberately small corpus, ~40-100 pages: the 30 businessday.ng pages +
key HARZ documentation, crawled full-length.
1. Full-length extraction. NO silent truncation ever again.
2. Canonical representation + content hash + acquisition receipt per page.
3. URL + retrieval timestamp preserved. Headings/links where reliably available.
4. Explicit provenance state: LIVE / CACHED / OFFLINE / STALE (frozen label set).
5. Cross-node byte-identical verification.
6. Full death test: acquire -> canonicalize -> seal -> store -> disconnect ->
   retrieve -> render -> search -> verify.

## Evidence law (standing, unchanged)
Workbench evidence earns nothing. Field proof = owner's hands, real phone,
airplane mode, browser, recorded receipt. Stage A ships as workbench-proven
with the field run as the owner's step, same as the Oct 3 door and Oct 6 search.

## Provenance label definitions (frozen)
- LIVE: fetched from the internet right now.
- CACHED: previously fetched and stored locally.
- OFFLINE: available entirely from local storage.
- STALE: stored copy whose freshness is unknown or expired.
No cached article is ever presented as live; no stored copy is ever presented
as fresher than its fetched_at; the fetched_at timestamp is always shown.

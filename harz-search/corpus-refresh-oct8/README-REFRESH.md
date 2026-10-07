# SEARCH CORPUS REFRESH KIT — Oct 8, 2026 (Nuruddeen continuation)

Context: owner ordered Nuruddeen to continue the search scale-up while Magani
finishes the reader field test. Live index was stale (last_crawl Sep 20).

## What's in here
- docs-fresh-oct8.jsonl — 1,082 pages crawled fresh Oct 7 23:02-23:06 WAT,
  220 domains, pipeline = the frozen crawler.py (unmodified).
- netnew-176.json — 176 pages that are NOT in the live D1 index (new URLs,
  dedupe by content_hash + canonical URL vs all 10,471 live rows).
- newdocs-tokenized.json — same 176 docs with exact frozen-tokenizer postings,
  ids pre-assigned 10471..10646, dl = title+body token counts (full text).
  Ready for an additive D1 load IF that is the chosen path.
- tier-packs/ — newest-first 8MB pack tiering (manifest with sha256 per pack):
  2,496 deduped pages (fresh Oct 8 + corpus-v02) in 3 packs. Pack 1 = newest.

## Honest state notes
- Live D1 index was NOT mutated by this kit: Magani's paused merge (964 news
  pages) owns the next index write. This kit is the input for that merge.
- 901 same-URL pages in the fresh crawl carry changed content vs live rows
  (news churn) — they need the full-text reindex path, not surgical append.
- Browser deep-open (harz-browser v7: /?url= deep-open + SW v7) and
  search-results-open-through-browser (harz-search UI, SW v41) are DEPLOYED
  and E2E-verified tonight. Those are UI-level, no index impact.

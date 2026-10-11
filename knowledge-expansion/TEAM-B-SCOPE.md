# TEAM B — FULL-TEXT RECOVERY: SCOPE (pass 1 running, Oct 11 ~23:59 WAT)

## Live measurements tonight (600-doc random sample, direct hash diff)

- Index: 11,365 docs. Hash-format verified (64-char, no empties).
- WIRED to stored full text (exact content_hash present in master
  reservoir): 566/600 = 94.3%. Verified end-to-end on samples: same
  URL, real byte sizes (1.8KB-10KB+), reader-resolvable.
- PREVIEW (no corpus doc at all): 34/600 = 5.7% -> scaled ~645 docs.
- Of previews, 65% sit AT the 2,000-char snippet cap (truncated text,
  strongest recovery candidates).

## Discrepancy vs Oct 10 recrawl report (row 107: 6,285 wired / 5,080
preview / 58% full sample) — RESOLVED IN PART

Corpus grew 1,061,345 -> 1,065,734 since the recrawl: the hunted-stage2
wave (+4,389 docs, source 'hunted-stage2', new in tonight's by-source
inventory) ingested full text for a large share of the then-preview
pages. Both numbers were true at their times; the situation IMPROVED
without new wiring work. Team A inventory and this scope are consistent.

## Pass 1 (running, resumable, tmux 'team-b-recovery')

1. Exact diff: all 11,365 index hashes vs reservoir (replaces the
   600-doc sample estimate with exact numbers).
2. Every exact-preview doc re-fetched and classified:
   - recovered_new: live page, extractable, hash not in corpus
     (candidate for honest full-text storage via ingest laws)
   - mirror_exact / mirror_normalized: page content equals an existing
     corpus doc (candidate for MIRROR wiring with explicit label;
     never shown as the same doc without the mirror designation)
   - dead_or_blocked / unextractable: stays honest preview forever
3. Output: RECOVERY-MANIFEST-v1.json. NOTHING is written to live
   systems by this pass; wiring/storage decisions follow manifest
   review (backup-first, verify-before-replace, dedupe laws).

## Honesty design (binding for any wiring that follows)

A preview page may only resolve to a corpus doc when content equality
is verified (exact or normalized hash). Mirrors are labeled MIRROR with
both URLs shown. Dead pages keep their honest preview label. No
recovered_new doc is stored without passing the ingest-wave dedupe
laws. The accepted 5K core and sealed systems are untouched.

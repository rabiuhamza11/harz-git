# CURATION SWAP — GATE E FINAL RECEIPT (Team F, Oct 22, ~10:2x WAT, per GO 9dde8ce)

## THE HEADLINE (measured, not projected)
Account 5ab9477c8379d6dcb1a8b5183484aeae: 18.499GB baseline -> 4.321GB final. UNDER the 5GB free-tier ceiling.

## Drop ledger (one DB at a time, size measured after each)
- Baseline (Gate D start): 47 DBs, 18.499GB (peak 18.511GB across 49 with v2 additions)
- DROP 1 harz-fx-idx (389b1bdf, 0.990GB, contentless FTS superseded by harz-keep-fts-00): 48 DBs, 17.534GB
- DROP 2 harz-million-corpus (ea622de9, 3.860GB originals; evacuation copy 705,222,539B sha256 7dcc9dd983a6858c hash-verified fresh this morning): 47 DBs, 13.674GB
- DROP 3 harz-corpus-bodies-db (a75c7faf, 9.352GB originals; evacuation copy 8,153,444,796B sha256 60af0a3d22baa0e0 hash-verified fresh this morning): 46 DBs, 4.321GB FINAL

## Retired vs preserved
Retired: re-fetchable public bulk per CURATION-DRAFT-v1 DELETE list (~1.31M docs metadata + bulk bodies + superseded fx index + dump-enwiki writer ghosts). AT DROP: old corpus 1,343,890 docs; old bodies 1,362,423 rows (Team E independently counted the same numbers).
Preserved LIVE: v2 corpus (29,844 kept docs + all provenance tables), keep store 57c384bf (29,086 sealed), keep FTS 26d47514 (29,086 searchable), bodies-v2 a31a671d (1,473 unsealed kept bodies incl. 155 cloud-wave ghosts), sealed library, v2 Internetless (1,992 docs), packs, journal, offline kits, sovereign stores, quarantine (12,722 in force).

## Answers to Team E checklist (their 10:07 report observed my 08:54 UTC deploy)
- Account: 5ab9477c8379d6dcb1a8b5183484aeae
- Worker: harz-million-corpus (v0.5.1 source, secrets preserved)
- Route: https://harz-million-corpus.harz.workers.dev (route state unchanged)
- The new 29,844-doc store: harz-million-corpus-v2 0945015e = the draft KEEP list (keep store reads 29,086 because it holds the sealed keep-class subset; v2 adds cloud-wave ghosts + middle-class)
- Binding swap receipts: GATE-D part 1 (07ee98f) + this receipt
- Gate B verifies against the KEPT stack, proven live: stats n=29,844; honest refusal for retired bulk

## Post-retirement regression (measured after DROP 3)
- Reader on v2: stats n=29,844, health 200
- FX pair re-pointed LIVE on v2 (fx-search 200, fx-build 200; DB_IDX = keep FTS 26d47514)
- v2 Internetless untouched: shell 200; doc 815 sha de216a7c exact match
- Gate B test reader (ungated proof tooling) deleted — security cleanup

## Honest deltas
- Projection 4.08GB vs actual 4.321GB (+0.24GB from the v2 stack built after the projection: keep FTS 0.370GB + corpus-v2 + bodies-v2).
- The mines (harz-mine x7, ~3.0GB) remain unconsolidated — separate relic-DBs ruling, untouched by this GO.

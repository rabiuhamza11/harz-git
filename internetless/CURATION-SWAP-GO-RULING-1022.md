# OWNER RULING RECEIPT + EXECUTION ORDER — CURATION SWAP (reader-swap + originals-retirement)
# Ruled by: Rabiu, Oct 22 2026 ~08:49 WAT, word: "Go" (on the decision presented 08:46-08:49 WAT).
# Recorded by: Nuruddeen. Supersedes: none (this executes the Path-3 plan, receipts 0e71d55/c025a20/cad1b49 + Team F gates 1-4).

## SCOPE OF THE GO (exactly this, nothing more)
1. Reader swap: live reader serves the keep-class (29,091 docs) from harz-keep-bodies-00 (Gate-4 deployed battery already PASS).
2. Originals retirement: the re-fetchable public bulk (per CURATION-DRAFT-v1 DELETE list: wikipedia 887,301 / gutenberg 163,003 / openstax / geonames / devdocs / wiktionary / python-docs / standardebooks / medlineplus / osm copy / dump-enwiki, ~1.28M docs, ~7.42GB declared) retires from live D1 to the verified evacuation copy.
3. Target: account 17.459GB -> ~4.1GB (Team F measured projection 4.08GB), under the 5GB free-tier ceiling.

## MANDATORY GATE ORDER (no step may be skipped or reordered)
GATE A - PRECONDITION RE-VERIFICATION (immediately before anything moves):
  A1. Evacuation copy completeness RE-VERIFIED FRESH: master export sha256 re-checked against 7dcc9dd983a6858c... (705,222,539 bytes); fx-idx export 4.09GB row counts re-confirmed; bodies evacuation dump re-verified. Any FAIL = STOP, report, nothing retires.
  A2. Keep store battery re-run: 29,091/29,091 inventory, byte-exact restore vs original hashes, corruption/truncation/duplicate checks.
GATE B - READER SWAP: reader serves keep-class; end-to-end doc retrieval sha-verified (fresh client, doc 815 class); search on keep-class works; retired bulk returns honest not-covered refusal (never fake results).
GATE C - REGRESSION: sealed library untouched (seal header verified); Internetless v2 corpus (1,992 docs) untouched; offline kits untouched; pack/journal/receipts untouched.
GATE D - ORIGINALS RETIREMENT: only after A-C PASS. Delete order: per exact draft list, one DB at a time, measured account size recorded after each.
GATE E - RECEIPTS: final measured account size (actual, not projection), post-state inventory, before/after evidence, all committed to vault.

## EXPLICITLY OUT OF SCOPE (unchanged by this GO)
- Quarantine 12,722 rows: untouched. Decision B: still pending, separate.
- The 5 integrity exceptions (1719, 1794, 1892, 1896, 1903): stay flagged for adjudication.
- Sealed library artifact, E1 core 5,000, offline kits, a2 Internetless stack: untouched.
- No new ingestion, no R2, no new features (feature-suspension ruling stands).
- Re-fetch of bulk sources some other day: separate future authorization.

## EXECUTION
Team F executes (their pipeline, their gates). Nuruddeen independently verifies Gates A/C/E evidence before and after. Any gate FAIL = full stop + report to owner; originals preserved until every gate passes.

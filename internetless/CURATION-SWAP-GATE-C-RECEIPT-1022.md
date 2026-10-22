# CURATION SWAP — GATE C REGRESSION RECEIPT (Team F, Oct 22, ~10:0x WAT, per GO 9dde8ce)

## The six checks (GATE-C-RESULTS.json)
C1 sealed library shell: PASS — sealed sha 2b35293a… + identity 7831974-126edf37cd18b12c both present, shell serves.
C2 v2 corpus doc 815: PASS — sha de216a7cd334a425… matches seal (1,992-doc corpus untouched).
C3 pack layer: PASS — sec.gov.ng pack HTTP 200.
C4 journal/receipts: PASS — journal ok, 461 rows (no rows lost).
C5 corpus baseline: PASS — FROZEN at 1,343,890 (measured twice over 120s, zero movement) after the writer seat obeyed the owner pause ruling. First C5 attempt FAILED (corpus still moving +83-125/min); the writer (dump-enwiki + cloud-wave interleaved streams) stopped by 09:58; frozen confirmation 120s clean.
C6 keep store: PASS — 29,086 index rows intact after all of today's work.

## Honest ghost accounting (recorded, not hidden)
Post-seal keep-class writes that exist in NO sealed store: dump-enwiki 1,253 + cloud-wave 155 = 1,408 ghost rows (written between the Oct 15 seal and today's pause). They are metadata rows whose bodies live only in the live bodies DB. Disposition: they survive the bulk retirement (their sources are not in the DELETE list) but remain unfindable by reader/search until sealed. On writer resume (future GO), they enter the honest path: ingest -> seal into keep store -> index into FTS. Count recorded here as the authoritative baseline.

## GATE C VERDICT: PASS (all six). Post-pause baseline: corpus 1,343,890 docs, frozen.
Gates A, B, C all PASS and receipted. GATE D (originals retirement) is next per the mandatory order: exact CURATION-DRAFT-v1 DELETE list, one DB at a time, account size measured after each.

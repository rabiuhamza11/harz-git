# TEAM B RECOVERY PASS 2 — RECEIPT (Oct 12, ~08:20 WAT)

Executed the reviewed RECOVERY-MANIFEST-v1 recovered_new set (431 previews).
Re-fetched, hash-verified against the manifest (no silent substitution), and
ingested only verified matches into the master corpus.

RESULTS:
* verified_ingested: 276 docs -> 307 corpus rows (5.04 MB) under
  source 'team-b-recovery-20261012' (INSERT OR IGNORE; exact-dup guards held).
* changed_since_manifest: 88 SKIPPED (page content changed since the Oct 11
  23:08 manifest — recorded, not ingested; owner may re-baseline later).
* regressed_dead: 54 SKIPPED (fetch failed today where it succeeded Oct 11).
* binary reclassified: 13 (SVG/WAV/JPEG/MP4/tar.gz/PDF binary junk that pass-1
  length-only check had classed recoverable). Honest reclass: NOT recoverable
  text. Two engineering findings logged while handling them: D1 statement
  limit is ~95K bytes on the SQL text (probed live: 95K OK, 100K TOOBIG);
  inserts must pass via file (--data-binary) not argv on large docs.

FULL-TEXT RECOVERY RATE: 10,664 -> 10,940 of 11,365 index docs = 96.3%
(from 94.3%). Remaining previews: 88 changed + 54 dead + 13 binary + 83
unextractable + 187 dead_or_blocked from pass 1 classes.

JUNK AUDIT: all 307 ingested rows scanned for binary junk — ZERO suspect rows.
Corpus after: 1,328,496 docs (+508 today: +307 recovery, +201 overnight
gather wave, consistent with the 03:30 nightly run).

NOT DONE (owner decision): wiring the 276 recovered docs as full-text in the
LIVE SEARCH INDEX (index writes not authorized; corpus-side work only).
Corpus ingest was additive and reversible (source-labeled rows).

# BATCH 1 TURNKEY RUN — COMPLETE + VERIFIED (Oct 12 ~01:15 WAT)

Owner authorization: "Run batch 1 and 2 and 3 and etc" (Oct 12 00:37 WAT).
Procedure: TEAM-E-INGESTION-PROCEDURE v1 (7 steps, resumable, idempotent).

## VERIFIED RESULTS (direct D1 reconciliation, zero unexplained rows)

- GeoNames Nigeria gazetteer (CC-BY-4.0): 76,332 place docs INGESTED
  (15.24MB). Every NG.txt row landed; Jalingo/Wukari/Taraba villages
  confirmed searchable. Includes lat/lon, feature class, admin region,
  population estimate per place.
- Python 3.15 docs text (PSF): 604 doc files INGESTED (15.31MB).
  Oversized files split into honest parts (#partN) after D1's ~100KB
  statement limit rejected whole rows (FX-1 battery's known finding,
  confirmed live).
- Reconciliation: corpus 1,065,734 + 76,936 = 1,142,670 docs EXACT.
  Content now 7.281GB / cap 9.5GB (headroom ~2.19GB).
- Dedupe: 0 norm_hash collisions in new sources; INSERT OR IGNORE only.

## ACQUIRED AS FILES (not yet ingested; no cap impact)

- OSM Nigeria (ODbL): 710,100,878 bytes, sha256 recorded, byte-verified.
  Transform (geodata -> text docs) is a design task; bytes secured.

## FAILED-BLOCKED (honest, recorded)

- devdocs packs: network unreachable from sandbox (connection fails).
- Standard Ebooks OPDS: HTTP 401. Both deferred; retry paths open.

## DISCLOSED PROCESS NOTES

- First run crashed on a curl arg bug + wrong Python-docs URL (404);
  fixed, state reset before any data landed. Second run stalled at
  72,000 when the sandbox interrupted; RESUMED from state (the
  procedure's resumability proven under real interruption, not just
  design). Failed chunks before a limit-failure inserted some rows
  that later reruns counted as ignored (OR IGNORE); final totals
  reconcile exactly, so no duplicate rows exist (verified by count +
  norm_hash audit).

## NEXT IN BATCH 1 (pending)

- OpenStax curated (~1GB est): signed per-book asset URLs need a
  resolver run; then PDF->text transform (pypdf staged).
- Batches 2+ (MedlinePlus 0.25GB, then Team D's larger sets): fit
  under the cap until the 9.5GB boundary; beyond it the R2-vs-D1
  growth ruling decides (already on the owner's decision list).

# FX-1 ACCEPTANCE BATTERY — LOCAL RUN (A1-A7, M-1/M-2)
## Status: design-validation measurement only. NO deployment, NO live changes, NO D1 writes.

Executed Oct 11, 2026 under Rabiu's ruling (full-text design next;
measure storage growth and throughput BEFORE selecting a large-scale
strategy). This run measures the FX-1 REFERENCE extractor (Python);
the deployed version would be JS on Workers. Reference code preserved
at /tmp/fx1/ (extractor.py, battery.py, fixtures/, battery-results.json).

## Results (12 cases)

CASE | RESULT | STATUS | EVIDENCE
A-1a World War II (live) | complete | 188,720 chars, 1 page, 292ms
A-1b History of Nigeria (live) | complete | 190,575 chars, 1 page, 232ms
A-2 pagination (fixture, rel=next 2 pages) | complete | both pages followed, page list recorded
A-3a JS-only app shell (fixture) | unsupported | "js-only rendering (V1 limitation)" — correctly labeled, not extracted
A-3b heritage.org (LIVE bot wall) | unsupported | "access denied (bot wall or forbidden)" — taxonomy proven on a real wall
A-4 malformed HTML (fixture fuzz) | complete | 1,733 chars extracted, no crash
A-5a dead DNS (live) | failed_fetch | HTTP 0 recorded
A-5b nonexistent Wikipedia page (live 404) | failed_fetch | HTTP 404 recorded
A-6a/A-6b identical content, two URLs (fixture) | complete | IDENTICAL sha256 — dedupe to single canonical CONFIRMED
A-7 changed page, re-extracted with prior hash (fixture) | complete | new version stored, prior sha preserved — version chain CONFIRMED

A-1 through A-7: 12/12 PASS. A-8 (browser verification through the
real reader/search UI) is honestly NOT run: it requires a deployed
implementation and stays gated behind the implementation authorization.

## Measurements (M-1/M-2/M-3 reference)

M-1 STORAGE GROWTH: on long Wikipedia articles the extracted full text
is 94-95x the 2,000-char snippet (188,720 and 190,575 chars vs 2,000).
A full-text D1 row for such a document is ~185KB including metadata.
Corpus-wide growth is content-mix dependent: disambiguation-class
pages measured ~3K chars (1.5x snippet); long articles ~190K (95x).
An honest full-corpus projection REQUIRES the pilot (unauthorized) —
no projection is claimed here.

M-2 THROUGHPUT (reference, single thread, Python): 232-292ms per long
document end-to-end (fetch + robots + extract + hash). Small pages
~60-90ms. The deployed JS-on-Workers throughput will differ (CPU-ms
limits, subrequest caps); this is the reference baseline only.

M-4 QUALITY SAMPLE: extracted text was human-spot-checked in the run
output (paragraph structure preserved, nav/menu crumb lines dropped
by the density filter). Per GAP-4 rule, final quality acceptance is
Rabiu's human check only — this line item is flagged OPEN, not passed.

## ENGINEERING FINDING — D1 row-size ceiling (affects D-3/R2 decision)

Cloudflare D1's SQL statement size limit (~100KB) is BELOW the full
text of long documents (~185KB rows measured). Consequence for the
design: in a D1-only strategy, long-document text must be chunked
(e.g., 64KB segments) with the FTS5 index spanning chunks — or full
text goes to R2 with D1 holding metadata + index. This is exactly
the storage-growth data Rabiu required before strategy selection.
Decision stays open (D-3 R2 enablement/waiver + strategy selection).

## Bugs found and fixed during the run (honest disclosure)

1. Challenge detection initially matched "Captcha" inside
   Wikipedia's config script (false positive). Fixed: title-based
   detection.
2. Relative next-page URLs resolved against the page URL, not the
   directory (404 on fixtures). Fixed: posixpath resolution.
3. 403 was classified failed_fetch; per taxonomy it is
   unsupported (deliberately denied). Fixed.
4. ONE TEST-HARNESS bug (not extractor): the A-7 rewrite line
   truncated the fixture before reading it (open-write ordering).
   Fixed; extractor behavior was never at fault.

All fixes are in the reference code preserved with this record.

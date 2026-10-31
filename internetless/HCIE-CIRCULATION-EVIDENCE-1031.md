# HCIE CIRCULATION EVIDENCE — two independent audits, Oct 31 2026

## Audit 1: HARZ -> Internetless (audit-mesh-read) — PASS
- /gate3 bundle: HTTP 200, 23,435 bytes, 10 embedded objects with hashes
- Isolation: 0 external scripts, 0 stylesheets, 0 asset tags, 0 network APIs (fetch/XHR/WS)
- Newest object id 38 (guardian v18): manifest c4372fb3... == recomputed c4372fb3... TRUE
- Missing object 99999: HTTP 404 {"error":"no verified object with that id"}

## Audit 2: Reconciliation across 36 cycles (reconcile-cycles) — ZERO SILENT LOSS
- Manifest objects: 33
- Journal PUBLISHED events: 33 (28 PUBLISHED + 5 CONTRIBUTION_PUBLISHED)
- Acquisition runs: 36
- Per source: guardian-ng 18, dailytrust 7, canary-github 2, cbn 1, contributions 5
- Objects missing across views: 0 | PUBLISHED events without object: 0

## Notable
Bundle now carries FIVE device-contributed objects (contribution:C-*) — reverse publishing
is visible in the offline bundle itself, published only after review.

## Still open
- device-airplane (owner): force-close reopen + second object + tamper REJECTED photo
- audit-acquisition, audit-contributions: in progress

# THE 11 MISSING PAGES — REPAIRED (Oct 20, ~17:3x WAT, Hauwa desk)

Owner report: phone sync finished with 4 failed transfers. Full-library audit (212 pack resources, every page of every pack probed): 201 served, 11 were 404 server-side.

## Root cause
The capture desk's dailypost (5) + businessday (6) article packs were LISTED in the shell pack list but their KV keys never landed. Compounding: their page names lack the .html suffix (desk convention mismatch), so the library requests extensionless URLs.

## Repair (both forms uploaded, additive, no shell writes)
- Matched all 11 to real corpus URLs (similarity 0.90-0.97).
- Captured with the proven visual pipeline, uploaded BOTH key forms: v2.pack.<domain>.<page>.html AND v2.pack.<domain>.<page> (extensionless).
- Verified all 11 now serve 200 at the extensionless URL the library requests (sizes 144KB-1.18MB). One URL healed after a few minutes of negative edge-cache expiry — expected.
- Lesson for the desk: unify page-name convention (.html suffix) and always verify keys exist before listing them in PACKS; the pack-list is a promise.

## Library state after repair
212/212 pack resources serving. Phone: one more online sync moment brings the 11 + any other pending; failed counters retry automatically per the receipts panel.

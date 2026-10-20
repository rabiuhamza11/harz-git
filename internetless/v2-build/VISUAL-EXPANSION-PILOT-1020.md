# VISUAL-EVERYTHING EXECUTION + STORAGE PILOT (Oct 20, ~10:20 WAT, Nuruddeen, capture desk)

## Executed today (all uploaded to KV, registered in shell PACKS, readback-verified)
8 gov homepage packs: nafdac.gov.ng (7.7MB), pencom.gov.ng (0.5MB), son.gov.ng (1.1MB),
ndic.gov.ng (0.8MB), budgetoffice.gov.ng (1.1MB), smedan.gov.ng (0.2MB), dmo.gov.ng (1.0MB),
nitda.gov.ng (8.6MB). Watchdog watchmap extended: 8 new fingerprints (index pages).
Library now 16 packs: EFCC, CAC(+video), NYSC, SEC, DailyTrust, Dailypost, BusinessDay, 8 gov, Al Jazeera.

## PILOT (per directive: one domain end-to-end, real size, number to owner)
Domain: aljazeera.com (15 corpus docs; smallest full domain = cleanest measurement).
- 14 of 15 article URLs captured live (1 corpus URL dead — honest note; list in aj-urls.txt).
- NAIVE result: 1,435KB avg/page, 91% of it CSS+fonts IDENTICAL across all pages.
- NAIVE extrapolation for full 1,992-doc library: ~2.8GB. NOT FEASIBLE. 
- FIX ENGINEERED: domain-CSS dedup. Shared styles extracted once per site -> v2.pack.<site>.site.css,
  served text/css (ob-worker patched, bindings preserved), pages link to it. 
- DEDUPED result: pages 134KB avg; whole aljazeera domain (root + 14 articles + shared css) = 3.2MB
  (was 21.8MB naive, 85% cut).
- DEDUPED extrapolation: big-5 news domains (theconversation 522, guardian 214, dw 178, cnn 48,
  aljazeera 15 = 977 docs) ≈ 135-160MB. FULL library (1,992 docs) ≈ 280-350MB.
  Matches the counsel's ~320MB order of magnitude. NOT free; honest number to the owner.

## Owner decision required (directive says: pilot number first, then yes/no)
Proceed with deduped visual conversion of ALL remaining domains (~280-350MB total, phased by
priority) — YES/NO. Phone airplane screenshots remain the completion gate per directive rule 4:
nothing here is called DONE until device proof.

## Tools (reusable, in vault)
capture_site.py (homepage packs), capture_page.py (article pages incl. lazy-load promotion),
both banner+provenance+guard per Visual Fidelity Law.

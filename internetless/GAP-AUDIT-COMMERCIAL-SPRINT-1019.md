# INTERNETLESS COMMERCIAL-READINESS SPRINT — GAP AUDIT (Oct 19, 2026, Nuruddeen)

Owner ruling Oct 19 (friend's plan endorsed): Internetless to commercial readiness FIRST; Telecom/AI wait.
This supersedes the Oct 18 Edge-first order for priority, NOT its receipts (v2 closure stands).

## Fresh audit findings (all verified today, real checks)
- v2 healthy: doc 566 serves 200, shell live, 62/62 packs, NYSC+CAC navigation FIXED and device-proven
  Oct 18 (correction to the forwarded table: NYSC/CAC are NOT open items; "SEC" does not exist in scope).
- EFCC pack renders but dynamic sections ("Loading Latest News...", "Latest Videos", "Wanted Persons",
  "Media Gallery") spin forever offline (JS stripped) and 0 internal links are wired — the real P0.
- Mirror Browser v0.1 (3,040 pages, resolver, Hauwa's Oct 16 build) exists ONLY as a 37MB vault artifact —
  not hosted anywhere. Distribution gap.
- Subdomains portal.nysc.org.ng + icrp.cac.gov.ng refuse honestly ("pack not stored") — by design, but
  these are the actual NYSC/CAC registration portals = highest-value user destination missing.
- Big corpus (1.34M docs, D1) is a SERVER-side system: full text lives in BODIES_DB, not in the offline
  product. Offline v2 product = 1,069 full-text docs + 62 visual pages. STORED vs SEARCHABLE vs USABLE law holds.

## The ledger (problem / evidence / repair / acceptance test)

P0-1 EFCC dead ends: "Loading..." sections + no internal links (real-browser render today).
  Repair: recapture as rendered DOM (CAC pattern) or honest NOT-AVAILABLE labels + link cards.
  Accept: airplane render on phone — content or honest labels, zero infinite spinners.
P0-2 Mirror Browser v0.1 undistributed (no hosted URL found).
  Repair: host the 37MB artifact or fold resolver into v2. Accept: live URL, offline nav between pages.
P0-3 Subdomain portals missing (honest refusal verified today).
  Repair: capture portal.nysc.org.ng + icrp.cac.gov.ng as packs, or honest cards with online guidance.
  Accept: offline user reaches these links and sees either content or an honest, useful card.
P1-1 17 docs encoding artifacts + 137 v0.8 pages capture noise + 3 stray images. Repair: batch clean. Accept: spot-checks clean.
P1-2 Corpus curation decision (D1 free-tier, Oct 15 draft) still awaits owner authorization — blocks corpus growth, NOT the v2 product.
P1-3 Reliability matrix (first install, low storage, interrupted sync, corrupted content recovery) — only the happy path is device-proven so far.
P2-1 Onboarding: no written install path for a stranger (open URL online -> Sync 35MB -> add to home screen -> airplane). Write 1 page.
  Accept: an outsider installs and uses it from the page alone.
P2-2 Demand test: zero pricing conversations to date. Accept: 3-5 real demos, one stated willingness to pay.

## Order of march
P0 first (EFCC, mirror hosting, subdomain portals), then P1 hardening, P2 product+demand.
No rebuilds of what passed. Every fix: problem, evidence, repair, acceptance test.

# VISUAL FIDELITY STAGE 1 — PIPELINE v0.2 RESULTS (Oct 14, 06:40 WAT)

## What v0.2 added (over v0.1)
Rendered-DOM capture via Cloudflare Browser Rendering REST (own infra, a1):
POST /browser-rendering/content returns the DOM after a real Chromium renders
the page. Fixes finding F-1 (JS-shell sites) and F-2 (bot-differential HTML).
Resources (CSS chains, images, fonts) then embedded as data URIs; law-3 sweep
enforces zero external rendering deps; non-200 fetches REJECTED (bug fix: a
Google 404 error page was being inlined as CSS when fonts.googleapis.com
failed; now failed fonts get an honest system-font fallback, disclosed).

## Evidence (NIMC — the JS-rendered case, previously shell-only)
- v0.1 pack: 7KB shell + loader (fidelity FAIL).
- v0.2 pack: 8.4MB, 62 resources embedded, FULL site rendered offline:
  browser-verified navigation, hero, all sections, bulletins, footer, zero
  external requests, zero 404 widgets. Pack served byte-identical from
  harz-vf-preview.harz.workers.dev/nimc-v2.
- ONLINE vs OFFLINE comparison (browser screenshots, Oct 14):
  MATCH: page structure, all text content, hero search bar, section order,
  footer - preserved.
  REMAINING DELTAS (honest): header bar color muted (live dark green #1e7338
  vs pack sage; likely a JS-injected gradient/overlay), hero background
  imagery not visible, web fonts fall back to system fonts (Google fonts
  not captured - disclosed), content-card images below fold unverified.
- VERDICT: CONTENT + STRUCTURE FIDELITY: PASS for the JS-site case.
  PIXEL FIDELITY: PARTIAL - v0.3 must capture JS-injected styles/backgrounds
  (screenshot-diff + resource interception) before Stage 1 can pass the
  owner's "look like the original" standard.

## Capture set status (5 representative gov sites)
- nimc.gov.ng: v0.2 PASS-partial (above), 8.4MB, under ceiling.
- health.gov.ng: v0.2 captured 36.6MB CLEAN (fixed pipeline) — OVER 25MB
  ceiling; Stage 2 compression pending (image recompress, dedup, font subset).
- immigration.gov.ng: v0.1 22.7MB (bot-404 overlay defect); v0.2 recapture
  pending (50.4MB first run was pre-fix) — needs capture + compression.
- cac.gov.ng: BOT-CHALLENGE GATED (finding F-5): even the real-browser
  renderer receives "Just a moment..." challenge page. Honest status:
  cannot capture without challenge solving (policy decision for owner).
- education.gov.ng: capture in progress at report time.
- firs.gov.ng, fma.gov.ng: unreachable from sandbox (disclosed).

## Bugs fixed this pass (all disclosed)
1. fonts.googleapis 404 page inlined as CSS -> non-200 rejection + honest
   system-font fallback.
2. Google-404 iframe content embedded -> excised + honest offline notice.
3. KV propagation delay misread as 404 (60s eventual consistency; documented).

## Laws status
1 capture-as-website: PASS (structure+resources). 2 open-visually: PARTIAL
(pixels differ). 3 offline-work: PASS (verified zero external). 4 search
preserved: PENDING (pack text extraction to FTS — next pass). 5 provenance:
PASS (manifest in every pack). 6 recoverable: PASS (text library untouched).

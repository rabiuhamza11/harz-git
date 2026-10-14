# VISUAL FIDELITY STAGE 1 — PIPELINE v0.3 (Oct 14, ~07:2x WAT)

Owner ruling received (Stage 1 v0.2 NOT ACCEPTED; ledger per-item). v0.3 built
per assignment A-D in the same session.

## v0.3 changes
1. waitForTimeout: 8000 in browser-rendering REST call -> DOM settles after
   JS finishes (v0.2 snapshot raced the ticker; ticker now captured).
2. Accept header for CSS/font fetches -> Google Fonts now fetch 200 (was 404
   mis-fetch, inlining Google error page as CSS in v0.2; now real CSS+woff2
   embedded).
3. Non-200 rejection retained (regression check D: PASS).
4. Error-widget -> honest-notice rule retained (D: PASS, no af-error in v3).

## NIMC v0.3 pack evidence (nimc-v3, 10.5MB, under 25MB ceiling)
- News ticker: CAPTURED (was missing in v0.2) - shows CURRENT live ticker.
- Top bar: forest green with badge + toll-free - matches live.
- Fonts: 4 woff2 embedded; NO system-font fallback needed.
- Images: 37 embedded; zero external rendering deps (audit: 0 img/script/
  iframe external src, 0 external css url()); residuals are anchor links only.
- Logo: embedded as self-contained SVG (282KB, internal data refs only,
  verified zero external xlink).
- Hero, search bar, all sections, bulletins, language list: rendered.
- HONEST DELTAS: (a) Google Translate widget captured as static list -
  translation itself is a live service, labeled requires-internet;
  (b) vision-pass flagged the logo area as visually different from live -
  SVG data verified intact; next pass compares side-by-side at same viewport;
  (c) hero card images below fold not yet re-verified.
- Search-preservation (law 4): NOT YET - pack text extraction to FTS pending.

## Per-site status after v0.3
- NIMC: open-visually PARTIAL->NEAR (pixel pass pending same-viewport comparison)
- health.gov.ng: 36.6MB, compression to <=25MB IN PROGRESS (next session)
- immigration.gov.ng: recapture QUEUED (v0.3 pipeline ready)
- education.gov.ng: capture status to verify (background job)
- CAC: BLOCKED by owner policy (no bypass; awaiting authorized route)
- Text library + seals: UNTOUCHED (verified; no writes made)

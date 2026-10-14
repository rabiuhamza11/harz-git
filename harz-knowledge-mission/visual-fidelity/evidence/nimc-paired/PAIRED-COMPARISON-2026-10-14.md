# PAIRED VISUAL COMPARISON — NIMC live vs v0.3 pack (Oct 14, ~07:30 WAT)
Method: Cloudflare Browser Rendering REST /screenshot for BOTH sides (same
engine, same 1280x800 viewport, same session conditions). Live: nimc.gov.ng.
Pack: harz-vf-preview.harz.workers.dev/nimc-v3. No reference adjustments made.

## Band-by-band measured differences (channel-delta>30)
- Ticker strip (0-45px): live RGB(26,117,72) vs pack RGB(34,112,67) - color
  MATCH (both dark green; diff 23.7% = animated ticker text at different
  scroll position + live-updating content).
- Nav band (45-120px): live RGB(251,252,252) near-white vs pack RGB(211,228,219)
  green-washed, 23.5% diff -> THE LOGO REGION RENDERS DIFFERENTLY: live shows
  a compact logo on white; pack shows a large green mark. Asset integrity
  verified (282KB self-contained SVG) but RENDERED APPEARANCE DIFFERS.
- Hero band (120-500px): 8.4% diff - high fidelity (headline, search bar,
  WELCOME TO NIMC all match).
- Below fold (500-800px): 55% diff - live shows content-card IMAGERY
  (hands/phone, writer, cityscape); pack renders WHITE. Card TEXT is in the
  pack DOM but the visual cards do not display - JS-dependent layout from the
  excluded app bundle.

## Verdict (per owner's rule: byte integrity != visual fidelity)
- PASS: ticker, colors above fold, hero, fonts loaded (no fallback).
- FAIL (visual equivalence): logo rendered appearance; below-fold cards.
- Root cause class: JS-driven layout/appearance excluded per offline-honesty
  law; v0.4 candidate = computed-style + post-render visual snapshot overlay.

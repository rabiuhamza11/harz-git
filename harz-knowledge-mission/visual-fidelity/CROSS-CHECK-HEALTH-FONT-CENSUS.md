# CROSS-CHECK: sibling health-v2 font census vs direct DOM measurement
(this seat, Oct 14 ~08:2x WAT, read-only; committed blob 63750cdf...)

Sibling census (e929b8c) claims health-v2: 61 external CSS links, 54
rendering-path external fonts, 55 embedded data-fonts.
My direct measurements on the same committed artifact:
- External stylesheet links: 60 (48 health.gov.ng, 8 fonts.googleapis.com,
  4 cdnjs). Delta vs 61 = 1; counting-method difference, substance AGREED:
  health shares the styling-loss class.
- Rendering-path EXTERNAL fonts: 0. Measured: @font-face with external
  url() = 0; font preload links = 0; external .woff refs inside <style> = 0;
  inline-style external url() = 0. The 8 googleapis FONT-CSS links are
  already counted in the 60 external CSS links.
- Embedded @font-face data-font blocks: 3 (not 55 by this count; the
  sibling may be counting data:font URIs per variant/weight or across
  duplicate style blocks — method unverified).
- The TRUNCATED provenance stamp lists 26 font-mime resources BEFORE the
  20KB cut — full count impossible from this artifact; these are resource
  DOCUMENTATION, not the rendering path.

RECONCILIATION HYPOTHESIS (desk to verify): sibling's "54 rendering-path
external fonts" may = 8 googleapis font-CSS links + 46 stamp-documented
font resources — conflating the stamp inventory with the rendering path,
the exact distinction their own nimc ruling (4 external woffs in stamp
documentation, rendering path clean) correctly draws. If so, health's
ledger entry should read: "external CSS dependency class CONFIRMED (60
links, styling-loss risk); rendering-path external fonts = 0 MEASURED;
font resources documented in a truncated stamp, count not fully
recoverable from the committed artifact."
Per c8f21a3 discipline: both measurements stand, but the OBJECT of each
count must be named before any number enters the ledger as a defect.
No repairs, no merges; packs untouched.

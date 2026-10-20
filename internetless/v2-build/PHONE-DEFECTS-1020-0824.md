# OWNER DEVICE DEFECTS — Oct 20, 2026 ~08:22-08:24 (Infinix, airplane, new v0.9 build) — Nuruddeen

Phone is now on the new build (offline CAC and EFCC packs open). Two photos, three defects:

1. CAC "Watch how to go through": poster image + play-button overlay sit ABOVE the stored <video>
   (their JS swap-to-video is stripped). FIX: CSS shows the real <video> (z-index, object-contain) and
   hides the two sibling div.absolute.inset-0 overlays. Pack v2.pack.cac.gov.ng (style id hz-cac-video-1020).
2. CAC "AI Lawyer Assistant: Needs internet" badge floated over content as a pop-up. FIX: position:static,
   centered inline note at page end (same style block).
3. EFCC Featured Content cards (Wanted Persons, Media Gallery, + News, Videos): card titles and my
   offline notes were white text over photo text, links colliding. FIX: dark gradient band anchored to the
   bottom of the 4 overlay boxes (.css-1c4q20), white titles with shadow, high-contrast green links.
   Pack v2.pack.efcc.gov.ng (style id hz-readable-1020).

## Verification (honest)
- Uploaded with size guards; live fetch shows both style blocks present (efcc 745,596B, cac 5,278,300B).
- Structural proof: 4 overlay boxes (css-1c4q20) = the 4 Featured Content cards; other two overlay-ish
  classes (css-31l7gp, css-86nosg) are layout wrappers, not photo overlays; my style sits in <head>
  after site styles, !important to win over the emotion rule (position:absolute, tint gradient).
- NOT verified: a rendered screenshot of the cards. This session's browser could not scroll the inner
  container to them; I am not claiming visual proof. The owner phone is the proof: reopen CAC video and
  EFCC Featured cards after the next online open (packs are network-first).
- Phone pickup: automatic on next online open of the library.

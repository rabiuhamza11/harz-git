RECEIPT 269 - Gate 3 evidence review: airplane-mode verification (single device)
Date: 2026-10-31 (Aisha)

SCREENSHOTS SUPPLIED BY OWNER, READ INDIVIDUALLY:

A. 4:30 PM, status bar shows 4G/45G signal bars and battery 40. URL bar harz-hcie.harz.workers.dev, tab count 48.
   Object list VERIFIED, Read panel rendered canary-github v1 text. => ONLINE page render. Network active.

B. 4:32 PM, 4G/45G signal bars present, battery 40, tab count 49.
   Verdict 10/10 VERIFIED, 92753 bytes. => ONLINE (signal bars visible), second tab.

C. 4:35 PM, AIRPLANE-MODE ICON visible in the status bar (aircraft glyph), NO signal bars, battery 39, tab count 50.
   Verdict 10/10 VERIFIED, 92753 bytes, all object rows VERIFIED.
   => THE KEY EVIDENCE: the bundle verified 10/10 with the radio OFF.

D. Local-storage render (content://media/external/downloads/...) showing 10/10 VERIFIED, 92753 bytes (receipt 268).

WHAT IS NOW PROVEN (single device):
1. Self-verification works from a saved local file (D).
2. 10/10 SHA-256 recomputation passes with airplane mode ON (C).
3. No server, network or cloud dependency in the verification path.

CAVEATS RECORDED, NOT HIDDEN:
- Screenshot C URL bar still reads harz-hcie.harz.workers.dev, so the airplane page may have been a tab/cache of the online page rather than the downloaded file. The strongest offline proof is D (content:// scheme) combined with C. Owner should confirm whether C was the saved file reopened in airplane mode.
- All screenshots are one phone. Two-phone transfer remains UNTESTED.
- Oct 25 two-phone failure REMAINS OPEN.

GATE 3 ACCEPTANCE TABLE (current):
 Documents selected ............... 10   (bundle built, owner confirmed)
 Transferred phone to phone ....... NOT TESTED
 Hash verification ................ 10/10 on Phone A, offline (single device)
 Offline reading .................. read panel opened on device; airplane verdict 10/10
 Internet dependency .............. zero in verification path
 Corrupted accepted ............... zero (no corrupted object has been presented yet either)
 Missing falsely advertised ....... zero
 NOTE: corrupted-object rejection has NOT been tested with a real tampered file. See next step.

E. 4:35 PM, AIRPLANE icon in status bar, no signal bars, battery 39, tab 50.
   Scrolled to bottom: all rows VERIFIED, Read panel open, canary-github v1 text rendered in full (ALPHA-7F3C marker), label "verified".
   => OFFLINE READ confirmed on device: verify + open + display with radio off.
   Caveat unchanged: URL bar shows harz-hcie.harz.workers.dev, so cannot distinguish saved-file reopen from a still-open tab.

STILL OPEN: transfer to Phone B (Gate 3 proper), tampered-file rejection test, Oct 25 two-phone failure.

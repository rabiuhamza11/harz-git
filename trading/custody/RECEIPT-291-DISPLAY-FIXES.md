# RECEIPT 291 - Display fixes on the trading machine (v1.6c)

Filed 1 November 2026, ~06:15 WAT. Owner instruction: "Fix". Scope limited to
display honesty. No rule, threshold or scoring parameter was changed.

## What was broken

1. Micro-cap prices collapsed in the UI. A PEPE row rendered
   `entry 0.000005-0.000005 - stop 0.000004 - target 0.000006`, so two distinct
   bounds looked identical. Cause: raw float stringification in the page renderer.
2. Test/synthetic rows sat in the Execution gate indistinguishable from real ones.
   Symbols NEW8, CLOSE-BRIDGE, LIVE-PROBE and LIVE-TRY carry no marker, so
   "BCH ACCEPTED_SIMULATED" style rows read as real activity.

## What shipped (v1.6c)

- fmtN(v): Number(v.toPrecision(8)).toString() for every entry/stop/target value.
  Verified: 4.55532e-06 -> 0.00000455532, 82.888465 -> 82.888465.
- isSynth(s): /^(TEST|NEW[0-9])|[-]/ -> SYNTHETIC pill on matching gate rows.
  Verified live: both NEW8 rows show SYNTHETIC.
- Untouched: scoring, sizing, guardian, hunt parameters, ledger data.

## Two defective builds, disclosed

I broke the page twice on the way here, and the browser test caught both:

- v1.6 (51ef39ce): my splice landed inside a string literal and the dashboard
  stuck on "Loading...". API endpoints stayed 200, so only the browser test caught it.
- v1.6b (31a18212): dashboard recovered, but toLocaleString defaulted to three
  decimals and rounded 82.888465 to 82.888, and my regex \d was consumed by the
  page template literal, so no SYNTHETIC badge appeared.
- v1.6c (89c73406): toPrecision(8) and [0-9] instead of \d. Both verified.

Root cause of the second class: client code inside the page() template literal is
escape-processed, so backslash classes silently degrade. Recorded as a defect class.

## Deploy discipline

Claimed before deploy (claim_ts 05:03:22Z, sha 89c73406), deployed, quiet window
held 10 minutes, completed at 05:13Z: COMPLETE row 9, prev_sha 4c5d5f30 (v1.5).
Verify: live -> 200 MATCH; a stale hash -> 409. Row 8 is CLAIM_CLOSED (the slot
retired), so the index is free for the next writer.

## Custody

HarzGit: harz-trading-machine/src-v1.6c/P001..P085 (85 parts) plus
build/manifest-v1.6c.json, sha 89c73406b2b4155f1f406bd3a25d623ea9d944063f7202d6cefc7b80bc1bfb60,
65,623 bytes, round trip verified byte-identical (newline-join rule).

## Still open

- Synthetic rows also appear in Latest predictions (CLOSE-BRIDGE) with no badge;
  predictions have no synthetic flag yet.
- Prices in the frozen v1.0 history that were stored collapsed stay collapsed.
  Ledger values are not rewritten.
- No proven edge; live execution frozen to Nov 6.

# RECEIPT 264 - HCIE offline device test (owner-reported, single device)

Date: 2026-10-31 (Aisha). Device: Rabiu's Infinix. Page: https://harz-hcie.harz.workers.dev/read

## What the owner reported (verbatim intent)
- "Text it appear" - in airplane mode the captured document text was readable.
- "one show on other and unavailable on another" - one object was readable, the other(s) showed UNAVAILABLE.

## Stage record against the six required steps
1. Connect online ............ DONE (reader loaded manifest online)
2. Discover new object ....... DONE (manifest listed 9 objects)
3. Retrieve ................. DONE (object fetched and cached)
4. Verify integrity ......... DONE (browser-side SHA-256 match before storing; mismatch would have been REFUSED)
5. Activate airplane mode .... DONE (owner)
6. Open and read offline ..... DONE (text displayed in airplane mode)

## Acceptance conditions
| Test | Required | Result |
|---|---|---|
| Genuine source edit | DETECTED | PASS (guardian v1 -> v4, dailytrust v2, captured by cron unattended) |
| New version | ACQUIRED | PASS (canary v1 -> v2; guardian v4 17982b) |
| SHA-256 | VERIFIED | PASS (browser recompute matched stored hash) |
| Previous version | PRESERVED | PASS (v1 retained alongside v2/v3/v4) |
| Mesh manifest | UPDATED | PASS (9 verified objects listed, content-addressed) |
| Phone retrieval | SUCCESS | PASS (owner-reported) |
| Airplane-mode reading | SUCCESS | PASS (owner-reported, text appeared) |
| Unchanged source | ZERO duplicates | PASS (repeated cycles produced no duplicate objects or versions) |

## Honest scope limits (unchanged)
- SINGLE DEVICE ONLY. This is not two-phone proof. The October 25 two-phone failure remains OPEN.
- Not verified by me directly: the airplane test was executed by the owner, not reproduced by my seat.
  I did verify independently that the reader only stores after a hash match and that uncached rows render
  UNAVAILABLE, which is why the mixed result (one readable, others UNAVAILABLE) is correct behaviour,
  not a partial failure.
- Reverse direction (device -> HARZ review queue) not built. Mesh world-carry of collections not built.
- HCIE is NOT declared complete. Gate 2 single-phone continuity has its first device evidence; Gate 3
  (two phones, no internet) has zero evidence today.

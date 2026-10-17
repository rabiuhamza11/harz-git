# PHONE TEST 2 — AIRPLANE MODE, HARZ CIRCLE (owner Infinix, Oct 17, 01:36 WAT)
Evidence: two owner screenshots, airplane icon visible in the status bar.
Scope: Circle ONLY. This is NOT the Internetless v2 library test and does NOT satisfy the final gate.

## Device results (airplane mode)
- A/B app shell opens offline: PASS. The Circle page loaded with no network (SW network-first -> cache fallback).
- Treasurer view of circle c3e0d1f4e0dc visible: HARZ / FREE TRIAL until 2026-10-24 / 1 member / 1 sealed entry / N10,000.
  CAUTION: this was the page already loaded on screen, so it does NOT prove Circle stores data for offline use.
  Circle is a server-side sealed ledger by design; it does not claim offline data.
- Create circle while offline: FAIL (usability). "creating..." froze forever. Whether a second circle was
  created: NOT possible (no network reached the server). Database cross-check: exactly 1 entry / N10,000 / seal
  48a4db0a2e7d3b6b, matching the phone. No stray write observed.
- Green button label: STILL BLANK on the phone = the pre-fix page served from the old cache (airplane mode
  prevented fetching the fix). Version running on phone: pre-v1.0.1.

## Root causes (code-verified)
1. api() had no try/catch: fetch throws offline, the promise rejects, createGroup never clears "creating...".
2. The public ledger page's fetch().then() chain had no .catch: would hang on "loading..." offline.
3. SW cache name never changed (harz-circle-v1) and activate never deleted old caches: stale shells persist.

## Fixes (deployed, harz-circle a1; bindings DB/PROOF/PAYSTACK_SECRET/WRITE_KEY verified intact)
- api(): network failure now returns a defined OFFLINE outcome and message; nothing saved.
- Ledger page: .catch shows an honest OFFLINE message (no frozen loading).
- SW cache bumped to harz-circle-v1-r2; activate deletes old caches (stale shells purge on next online visit).
- Design decision (stated, not hidden): writes stay online-only, since queueing offline contributions would weaken
  the tamper-evident sealing promise. The app now says so plainly.
Source: harz-circle/harz-circle-v1.0.2-offline-safe.js. Server data re-verified after deploy (1 entry, seal 48a4db0a).

## Verdict
CONNECTED device: PASS (test 1). AIRPLANE device, Circle shell: PASS. Airplane write path: FAIL -> fixed, needs phone re-test.
Phone version: needs ONE online reload to receive v1.0.2/r2. Internetless v2 library: AIRPLANE NOT TESTED.

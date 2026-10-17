# PHONE TEST 1 — ONLINE, HARZ CIRCLE (owner device, Oct 17, 01:26-01:29 WAT)
Evidence: four owner screenshots from the Infinix (WhatsApp images). Device evidence,
CONNECTED mode only. Airplane mode: NOT TESTED. Running app version on phone: NOT YET IDENTIFIED.

## What the phone proved (connected)
- 01:26 Circle created from the phone: name "Harz", circle id c3e0d1f4e0dc, admin key issued once.
- Open form accepted id + key; treasurer view opened (FREE TRIAL until 2026-10-24).
- 01:28 Member Musa added; one contribution sealed: N10,000, seal 48a4db0a, 2026-10-17 00:28 UTC.
- 01:29 Summary: 1 member, 1 sealed entry, total N10,000 (consistent with the ledger row).
- Reported "5000" in the Amount box = grey placeholder, NOT a doubled value (ledger 10,000 x1).
- Third screenshot: the in-app HARZ browser (not Chrome) also showed the blank green button.

## Defect found: INVISIBLE LABELS on green buttons (Create circle, Record & seal)
Root cause (code-verified in the deployed worker CSS): class "ok" does two jobs.
  button.ok{background:#166534}  -> button turns dark green
  .ok{color:#166534}             -> status-text colour also matches the button
Result: dark-green text on dark-green button. Reproduced in desktop Chromium too.
Fix (smallest correct): button.ok{background:#166534;color:#fff}. Nothing else changed.

## Deployment identity
harz-circle (a1) redeployed Oct 17; bindings verified after deploy: DB (d1
46a761cc-...), PROOF (service harz-proof), PAYSTACK_SECRET + WRITE_KEY (secrets kept in place).
Owner's circle c3e0d1f4e0dc still serves HTTP 200 after deploy (D1 data intact).
Verified in real browser: "Create circle" now shows a white label on green.
Source: harz-circle/harz-circle-v1.0.1-button-label-fix.js.

## Still open (not claimed)
- Phone must reload to receive the fix (HTTP cache/SW may serve the old page): version on phone NOT identified.
- Airplane-mode test of Circle and of /v2: NOT TESTED.
- SECURITY NOTE: the admin key was visible in a screenshot; treat that circle as test data.

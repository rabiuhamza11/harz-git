
## KATTAU v0.2 CANDIDATE — ON-DEVICE FIELD EVIDENCE (Oct 15, ~17:04-17:08 WAT)
Owner-executed on his Infinix (Termux, Node v26.4.0 arm):
- "what is HARZ" → PASS from the HARZ ecosystem fact pack, with receipt
  (kattau-v02-2026-10-15T17-04-49-748Z.json) — the exact question that
  refused in his airplane-mode v0.1 screenshot.
- tools/bench/kattau-battery-v02.mjs → VERDICT: PASS | failures: 0 |
  cases: 20 ON DEVICE: G1 frozen parity top1 19/20 top3 19/20, kit v0.2
  5,084 docs (5,000 sealed + 84 eco), all 7 v0.1 regressions green,
  all 8 upgrade cases green, providers never called.
- Second live query receipt 17-07-48-923Z.
REMAINING for v0.2 Gate D: the airplane-mode offline label
(LABEL: OFFLINE-VERIFIED) — owner ran the above with network ON
(labels truthfully said ONLINE). The never-waived gate applies to the
candidate exactly as it did to v0.1. Acceptance + web-door rollout
await owner word after that label.

## KATTAU v0.2 CANDIDATE — GATE D PASSED (Oct 15, ~17:10 WAT)
Owner-executed on his Infinix (Termux, Node v26.4.0 arm), airplane mode ON:
- "what is HARZ" -> PASS from the HARZ ecosystem fact pack,
  LABEL: OFFLINE-VERIFIED (tcp=REFUSED, dns=DNS-FAIL — interfaces dead),
  201ms, providers_called: []
- Receipt on device: kattau-v02-2026-10-15T17-10-02-603Z.json
- Same-day on-device battery: 20/20 PASS (frozen parity 19/20+19/20,
  kit 5,084 docs, 7 regressions + 8 upgrade cases green).
=> The never-waived gate is passed on owner evidence for the candidate.
   The question that refused on the airplane in v0.1 now answers
   OFFLINE-VERIFIED in v0.2.
GATE E (owner acceptance ruling) requested. On acceptance: v0.2 becomes
the baseline, web doors (PWA + local file) get the eco pack and skills
the same hour, v0.1 preserved as rollback.

## GATE E — OWNER ACCEPTANCE (Oct 15, ~18:1x WAT)
Owner: "Accept."
=> KATTAU v0.2 IS THE BASELINE. All gates closed on evidence: sandbox
   battery 20/20, on-device battery 20/20, frozen parity 19/20+19/20 held
   with the 84-doc eco pack appended, OFFLINE-VERIFIED airplane proof
   ('what is HARZ' from the eco pack, tcp=REFUSED, dns=DNS-FAIL, 201ms).
   v0.1 preserved as kattau-v01.mjs (rollback). v0.2 = default kattau.mjs.
   Web doors (PWA + local file) receive the v0.2 roll-in immediately.

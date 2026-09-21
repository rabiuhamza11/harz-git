# KILLER TEST v1.0 — SOFTWARE MODE — REPORT
**Date: Sep 15, 2026 · Node A: live root (harz-root.harz.workers.dev) · Node B: fresh sandbox substrate**
**Question under test: does the namespace SURVIVE the death / migration / forgery / fork of the nameserver node?**

## VERDICT: 10/10 PASS (software mode)

| Step | Test | Result |
|------|------|--------|
| KT-1 | Seed health: live zone digest e94b9693 (pin match), pay.harz resolves, NXDOMAIN honest 404 | PASS |
| KT-2 | Pull: 77 names extracted from Node A's canonical zone | PASS |
| KT-3 | Node B boots from git artifact alone; pay.harz → harzpay | PASS |
| KT-4 | Parity: 77/77 names identical between live root and Node B | PASS |
| KT-5 | DEATH SIM (fetch killed, zero network): Node B still resolves from re-verified cache; NXDOMAIN stays honest null; 0 network attempts | PASS |
| KT-6 | Tampered book (endpoint swapped) REFUSED at boot | PASS |
| KT-7 | Wrong trust anchor refused — custom verify AND engine anchor law | PASS |
| KT-8 | FORK REFUSAL: attacker chain internally valid, refused by pinned anchor; holder of both chains HALTS "FORK DETECTED" | PASS |
| KT-9 | Reconstruction from HarzGit bytes alone (never touching Node A): digest f4747cf7 pin match, estate.harz resolves | PASS |
| KT-10 | Honest labels: software-mode proof only — live root never killed, phone never died, account never banned | PASS |

## THE REAL FINDING (this is what a killer test is for)
**KT-8 caught a live security hole in the resolver engine (v1.0):** `loadZone` verified the
signature against the zone's OWN self-declared `signed_by` — internally-consistent forgeries
(a fork with its own valid key) were ACCEPTED by default. Self-declared trust is not trust.
**FIX — engine v1.1 ANCHOR LAW:** `createEngine({ verify, anchor })` — when an anchor is
pinned, any zone whose authority differs from the anchor is REFUSED at boot
("WRONG ANCHOR — fork or forgery, fail-closed"), regardless of internal signature validity.
Without `anchor`, old behavior is preserved (caller owns out-of-band verification) —
backward compatible. Regression: the original resolver battery still passes 11/11 on v1.1.
The anchor itself travels out-of-band (git ceremony, QR rail, owner) — never inside the zone.

## Honest boundaries (labels, per frozen spec)
- Software mode FIRST: this proves the CODE survives node death; it does not prove the EVENT
  of the production node dying. The live root was never killed; the phone never died; the
  account was never banned. Those are the true-mode frontiers (owner-ordered live migration).
- KT-5's death is simulated by killing fetch, not by stopping a real server — the discipline
  (offline cache, re-verify, zero network, honest absence) is what is proven.
- The draft v2 zone carries TEST keys (bcd63332...); the LIVE zone is v1 (production ZSK,
  e94b9693, byte-identical throughout). Live migration to v2 remains gated on the owner's
  migration order + killer-test-true-mode.

## Reproduce
`node killer-test-10.js` (needs the live root reachable + HarzGit artifacts in the folder).
Run twice; results are deterministic.

## Artifacts in this folder
- killer-test-10.js — the harness (10 steps, fork-refusal rule encoded)
- harz-resolver.js — engine v1.1 (ANCHOR LAW fix) — also updated at harz-root-v2/resolver/
- draft-zone-v2.json — the 77-name draft v2 zone (f4747cf7, TEST keys)
- live-zone.json — Node A's zone as pulled during the run (e94b9693)

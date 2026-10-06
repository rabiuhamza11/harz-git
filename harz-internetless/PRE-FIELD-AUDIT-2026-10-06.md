# INTERNETLESS PRE-FIELD AUDIT — 2026-10-06 (Hauwa, on Dad's "Move" order)

Scope: Internetless field completion. No build (N0-A/B/C frozen; milestone protection order:
internetless is not a feature pile; the battery IS the product). This is audit + prep verification.

## WHAT IS PROVEN (workbench, receipts in this vault)
- N0-D PASS (trace in harz-n0-mesh/n0-d-attack/): the REAL v0.2 primitive — sha d0dfbfb0e66e947199f3f04a60cee2c799ef2cebbdcfaecf1494f06ba6480c61, verified unmodified at start and end — carried real sovereign records (G28-1 bundle: s1-s3 + fork tips + checkpoints + rotation + revocations) through 7 live nodes under kill -9, true partition, delayed/duplicate/reordered arrival, double authority rotation, stale serving, competing histories. ZERO authority violations. Reconciliation added nothing and resolved nothing silently. Cloudflare was never the authority: authority lived entirely in the standing verifier's measurement of signed content; the node is authority-blind AND SAYS SO.
- v0.2 acceptance 12/12 (fsync-before-ACK, torn-tail quarantine, READ=>REVERIFY, S6 seal cycle).
- N0-D's one operational finding stands reported, not patched: fresh-nonce resend of identical content stores both (per-nonce dedup only). v0.3 candidate, owner's ruling.

## TODAY'S PREP VERIFICATIONS (this audit, this machine)
1. FIELD-PULL FIDELITY: the Termux runbook pulls the node from
   raw.githubusercontent.com/rabiuhamza11/harz-git/main/harz-internetless/v0.2/internetless-node-v02.js
   — fetched now and hash-compared: BYTE-IDENTICAL to the frozen vault primitive (d0dfbfb0…).
   A field phone cannot silently receive a different machine than the one that was attacked.
2. FROZEN BATTERY RE-RUN: v02-battery.sh 12/12 PASS (v02-rerun-2026-10-06-clean.log). Primitive intact.
3. HARNESS DEFECT FOUND AND CLASSIFIED (harness, not primitive): the battery's trap cleans up with
   pkill, which does not exist in this sandbox. Run 1's orphaned listener survived (answering from a
   deleted directory), and an immediate run 2 measured 5/12 FALSE FAILURES (acked 20 vs stored 0:
   sends were ACKed by the dead run's node; the fresh node had crashed on EADDRINUSE). Same defect
   class N0-D already recorded for this environment (ps/pkill unavailable; /proc-resolved PIDs +
   port-down verification are the fix). Diagnosis: stale-listener race, NOT nondeterminism — after
   killing orphans via /proc, the identical frozen script passed 12/12. Logged unsmoothed in
   v02-rerun-2026-10-06.log (the 5/12 run). THE PRIMITIVE WAS NEVER SUSPECT: both suspect runs used
   the same unmodified file, hash-verified.

## THE ONE REMAINING LEG (the wall's last face — and it is physical)
The two-phone FIELD GATE (owner-defined Oct 4, frozen in v0.2/FIELD-RUN-V02.md): 11 steps +
mesh test, airplane mode, camera. Pass condition frozen; honest sentence frozen:
"The record carries its own evidence; connectivity carries it, but does not make it trustworthy."
Workbench runs never close stages (Protocol Law principle 8): the 12-stage service battery
(SERVICE-BATTERY-RUNBOOK.md; S2/S3 already FIELD-PROVEN Oct 3 on the owner's Infinix, filmed)
closes only on real phones. No amount of further sandbox work substitutes for the owner's hands,
two phones, and a camera.

## ANSWER TO THE KEY QUESTION (at today's evidence level)
"Can a field node operate, preserve sovereign state, and reconcile deterministically after
connectivity returns — without Cloudflare or another external provider becoming the authority?"
Workbench: YES, measured (N0-D D1-D11; availability and authority never merged; zero external
calls by construction — the node is one zero-dependency file with no cloud binding at all).
Field: PENDING the frozen two-phone run. That run is the owner's action, not a build.

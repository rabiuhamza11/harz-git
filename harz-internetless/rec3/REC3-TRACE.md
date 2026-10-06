# REC3 — RECOVERY REMEDY CANDIDATE ATTACK TRACE (Hauwa, Oct 6, 2026, Dad's ruling + attack order)

## THE RULING IMPLEMENTED (as a candidate, nothing frozen retro-fitted)

Dad ruled the semantic choice: if a valid record arrives whose nonce already exists on disk
in corrupt form, the valid record WINS and REPLACES the corrupt copy. Not coexist. Not
reject. Not wait for quarantine. Identity = (nonce, valid signature). Constraint honored:
the frozen v0.2 primitive was NOT mutated — the remedy is a separate candidate file
(internetless-node-v03rc.js, sha256 0a3ae10ec0162a9efaf80a97cdea2986520d9ecdff248ec53703dfd31bf249b3),
clearly labeled NOT FROZEN, and REC2 stays untouched as evidence (no fix rewrites its history).

## THE MINIMAL DIFF (candidate vs frozen v0.2)

One behavioral change: the receive-path nonce check consults DISK TRUTH (scan, re-verified
NOW) instead of the boot-seeded in-memory set; the memory set is demoted to bookkeeping.
On a valid arrival whose same-nonce disk lines all fail re-verification, the corrupt lines
are atomically moved to inbox.corrupt (timestamped evidence — never erased, never forwarded,
never evidence of validity) and the valid record is persisted as the governing copy.
Everything else behaves identically to v0.2: fsync-before-ack, torn-tail quarantine,
read re-verify, forward-only-what-reverifies, seals, authority-blind vocabulary.

## THE CANDIDATE LAW UNDER ATTACK (Dad's wording, verbatim)

"Deduplication may suppress only a record that has itself re-verified successfully. A corrupt,
stale-signature, or otherwise unverified disk record cannot reserve its nonce against a
valid record."

## THE BATTERY (rec3-battery.sh) — Dad's exact chain + regressions — 29 assertions, 29/29 x2

R3-1 the exact ruled chain on node A: corrupt-present (disk-tampered X1, [CORRUPT] on read)
-> reboot (survives honestly, no quarantine — the F-REC1-2 state) -> valid same-nonce arrives
from the peer -> VERIFIED -> REPLACED (main store clean, prior copy preserved as timestamped
evidence in inbox.corrupt) -> persisted -> reboot again (deterministic) -> exchange (sets
converged, digests identical, corrupt copy never forwarded).
R3-2 the same chain on node B in the opposite direction: identical result.
R3-3 rapid-fire arrival both orders: tampered-then-valid in the same breath — tampered stored
as evidence only, valid GOVERNS; valid-then-valid — exactly-once dedup by (nonce, valid
signature) with a duplicate reply; forward never propagates evidence lines.
R3-4 repeated restarts: counts stable, evidence files preserved and disclosed on both nodes.
R3-5 F-REC1 closed as a CONSEQUENCE of the law itself: plain loss heals WITHOUT restart,
because dedup consults disk truth and nothing valid is on disk for that nonce.
R3-6 F-REC1-3 dead: tamper-first + reboot — the exact state that permanently blocked v0.2 —
and the valid record ARRIVES ANYWAY, poison quarantined, valid governs.
R3-7 slot integrity: invalid copies posted around a missing record, across reboot: evidence
only, slot honestly empty; only the valid original heals, replacing all three tampered
evidence lines in one arrival; fresh-nonce identical content still stores twice (operational
duplicate unchanged, disclosed).
R3-8 REC1 reconciliation regression on the candidate: conflicting claims PRESERVED identically
on both nodes, never resolved; the authority-demand death test rode as DATA with ZERO
promotion; sovereign seal chains local and intact; converged state durable across kill/restart.
R3-9 gates: frozen v0.2 hash verified UNTOUCHED (d0dfbfb0...) at start and end; candidate hash
stable across the battery — the battery attacked its target, never modified it.

Two consecutive clean runs: rec3-run-02.log, rec3-run-03.log (29/29 each). Run-01 logged
unsmoothed: 4 harness failures, ALL mine — the PRECIOUS-propagation off-by-one ledger error
(the same class REC2 caught once already) and a grep-lines-vs-occurrences defect in the seals
check. The candidate itself held on the first run and never changed.

## WHAT SURVIVED, AND WHAT IS NOW PROPOSED (NOT frozen — Dad's ruling)

All three REC2 findings are closed by the candidate law, measured:
F-REC1: plain loss heals mid-run, no reboot needed (R3-5).
F-REC1-2: corrupt-present no longer masks — valid arrival replaces, evidence preserved (R3-1/2).
F-REC1-3: poison evidence cannot reserve a nonce (R3-6).
And nothing regressed: conflict preservation, the death line (convergence of transport is
never resolution of truth), seals locality, slot integrity, operational duplicates, durability.

Proposed for Dad's freeze ruling, in Dad's own words, as the v0.3 recovery law:

  "Deduplication may suppress only a record that has itself re-verified successfully.
   A corrupt, stale-signature, or otherwise unverified disk record cannot reserve its
   nonce against a valid record."

With the ruled replacement semantics: the valid record wins and replaces; the corrupt copy
moves to preserved, timestamped, never-forwarded evidence; deterministic across restart.

## SCOPE (honest)

Workbench proof against the candidate. The frozen v0.2 primitive and REC2's history are
untouched and remain the standing evidence of the defects. The candidate is NOT deployed,
NOT the field primitive, and NOT frozen until Dad rules. The two-phone field gate remains
pending, and now has a stronger machine waiting for it when the ruling lands.

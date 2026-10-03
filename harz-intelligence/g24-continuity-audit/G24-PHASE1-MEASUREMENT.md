# G24 PHASE-1 MEASUREMENT — THE CONTINUITY WALL IS DOWN (2026-10-03)

Contract frozen at 156d234 BEFORE any measurement. Hypothesis stated
in the contract BEFORE the attacks. All four attacks were run against
PRODUCTION, on the live origin key (8ae5337b — the standing authorized
signer), with the revocation-enforcing authority-verifier on a fresh
node. The browser-verified origin index (141 missions) confirms both
the earlier state (15:47 UTC, D designated) and the fork state
(16:11 UTC, C designated) exist as independent records.

## ATTACK RESULTS (all as predicted in the frozen hypothesis)

A. STALE REPLICA — state-old.json (the 15:47 sealed state):
   topology VALID | hashes VALID | artifact VALID | signature
   AUTHORIZED -> VERIFIED. A superseded-era state carries FULL
   authority on any fresh node. Nothing marks it superseded.

B. REPLAY — the same state presented as the origin's current state:
   VERIFIED, zero trace of resurrection. A replica could serve this
   state as "current" forever and no node could object.

C. FORK — a CONFLICTING authorized state issued live: resolution
   designating C (task 3) instead of D, signed by the SAME live key:
   VERIFIED at full authority. The node holding both states has TWO
   authorized truths about the same question with NO relation, NO
   ordering, NO fork concept, NO detection. Both are equally
   "current" — the word has no cryptographic meaning here.

D. UNSIGNED ORDERING — created timestamps forged on a copy: the
   resolution record now PRECEDES the conflict by a year (2019 vs
   2020), the whole state shoved into the past. Signature verification
   UNAFFECTED -> VERIFIED. Ordering metadata is cryptographically
   weightless; a replica can roll back or reorder history at will.

## STRUCTURAL CONFIRMATION
The sealed state's fields: id, goal, created (unsigned), tasks,
receipt, designation, origin_signature. NO field references any other
mission. There is no height, no successor link, no supersession, no
epoch. G23's signature covers WHAT was said and WHO authorized it —
it contains no statement about WHEN relative to other states.

## THE FINDING (exact)
G23 authenticates states; it does not relate them. Authority survived
G23's wall — continuity has no wall at all. Stale replicas, replays,
forks, and rollbacks all verify at full authority, and "current" is
not a cryptographic property anywhere in the system.

## THE PARALLEL TO G22 (intentional)
G22: a parallel authority could produce a self-consistent public
world — topology alone was not authority.
G24: the authorized origin itself can be made to appear at ANY point
of its own history — authentication alone is not continuity.

## STATUS
Phase 1 complete. No fixes built (per the frozen contract, the ruling
comes first). Ruling required on the primitive:
A — signed timestamps (weak; expected rejected)
B — SOVEREIGN STATE CHAIN (RECOMMENDED): height + prior_state_hash
    covered by the origin signature; replay = valid history, refused
    as current; forks detected, resolved only by explicit signed
    supersession; rollback refused without an explicit signed restart;
    pre-continuity records disclosed as the unlinked era
C — future HARZ-chain checkpoint notarization (not for G24)

Proposed invariant: "A valid signature proves a state WAS authorized;
the standing continuity chain determines whether it is STILL current."

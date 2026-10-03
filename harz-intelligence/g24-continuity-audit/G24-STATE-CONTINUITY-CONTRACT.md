# G24 — SOVEREIGN STATE CONTINUITY (CONTRACT, frozen BEFORE build & BEFORE measurement)

Date: 2026-10-03. Anchors: G23 final form (c6f587f), revocation law
enforced. G22 remains FAILED, permanently preserved.

## THE QUESTION (Dad, verbatim)
"Can an authorized origin prove that its authority remains intact when
its state is replicated, transported, merged, recovered, and operated
across independent nodes?"

G23 answered "who is allowed to speak." G24 asks whether AUTHORITY
SURVIVES STATE MOVEMENT: replication, transport, merge, recovery,
cross-node operation.

## THE ATTACK SURFACE (Dad's list)
1. stale replicas
2. conflicting authorized states
3. replayed valid historical states
4. partial exports
5. rollback
6. cross-node synchronization
7. legitimate state transition vs. resurrected state

## PRE-MEASUREMENT HYPOTHESIS (falsifiable, stated before any attack runs)
The current system authenticates each state INDEPENDENTLY and relates
NO states to each other. The G23 signature covers WHAT a record says
and WHO authorized it — but no state carries any cryptographic
relation to any other state: no sequence, no successor link, no
supersession. Therefore:
- a stale replica verifies with FULL authority
- a valid historical state replays as indistinguishable from current
- two conflicting authorized states from the SAME origin and SAME key
  (different resolver designations) both verify — no fork concept exists
- record ordering metadata (created timestamps) is UNSIGNED — forgeable
  on any replica without breaking verification
- "current" is not a cryptographic property anywhere in the system
If measurement contradicts any of these, the contradiction is the
finding and this hypothesis dies honestly.

## PHASE 1 — ATTACK THE ASSUMPTION FIRST (measurement only, no fixes)
A. STALE REPLICA: verify an earlier sealed production state (key-2
   signed, earlier today) on a fresh node -> expect full VERIFIED.
B. REPLAY: present the same older state as the origin's current state
   -> expect full VERIFIED (resurrection leaves no trace).
C. FORK: issue a NEW conflicting authorized state on production (a
   resolution record with a DIFFERENT lawful resolver designation),
   signed by the same live key -> expect both states fully VERIFIED,
   two authorized truths, no detection, no ordering, no relation.
D. UNSIGNED ORDERING: alter the created timestamp on a COPY of a
   sealed state -> expect signature verification UNAFFECTED (ordering
   metadata is forgeable; rollback undetectable at the state layer).
All attacks run against production records (goal-labeled as G24
audit), on COPIES for any mutation. Nothing is patched in Phase 1.
The finding is frozen with the measurements, like G22.

## RULING REQUIRED — PRIMITIVE OPTIONS (proposals only, not assumed)
OPTION A (weak — expected rejected): sign the timestamp. Proves when
  a state was made, but clocks are not sovereign: no ordering proof,
  no fork detection, no supersession, no rollback detection.
OPTION B (RECOMMENDED): SOVEREIGN STATE CHAIN — the additive continuity
  layer. Every state-carrying record embeds state_height (strictly
  increasing) + prior_state_hash (hash of the previous record's state
  cell), BOTH covered by the origin signature (the authority layer
  signs them). Fresh nodes verify continuity INDEPENDENTLY:
  - links recompute, heights strictly increase, gaps DISCLOSED
  - REPLAY/STALE: a state below the node's known chain height is
    valid HISTORY, refused as CURRENT — history is preserved as
    history (like G22), never resurrected
  - FORK: two states claiming the same prior hash = DETECTED on any
    node holding both; resolution ONLY by an explicit signed
    supersession record (the G23 transition law applied to state) —
    never silent pick
  - ROLLBACK: height regression detected; recovery ONLY by an explicit
    signed continuity-restart record (epoch marker) — never silent
  - PARTIAL EXPORT: honest refusal (extends G19 minimality: exactly
    two new essential fields, height + prior hash)
  - PRE-CONTINUITY RECORDS: honestly disclosed as the unlinked era —
    never silently re-linked
OPTION C (future anchor, not now): checkpoint notarization of state
  roots onto the HARZ chain itself — noted as the long-term sovereign
  anchor; not required for G24.

## THE G24 INVARIANT (proposed, mirrors G23's close)
"A valid signature proves a state WAS authorized; the standing
continuity chain determines whether it is STILL current."
Authority answered WHO may speak. Continuity answers WHICH state is
now. Both must hold for autonomous missions to consume evidence safely.

## DEATH TESTS (after ruling, gates measurable)
1. stale replica identified as superseded, full authority refused
2. replayed valid historical state: refused as current, preserved as
   history (the replay of a TRUE state is not denied — its
   resurrection as CURRENT is)
3. fork detected on an independent node holding both branches;
   resolved ONLY by explicit signed supersession
4. rollback refused without an explicit signed restart record
5. partial export honestly refused
6. LEGITIMATE state transition (origin advances the chain): VERIFIED
7. contrast: the exact same states replayed without the chain:
   identified and refused (the G22 wall, now at the state layer)
8. regressions: G19 minimal export, G20, G21, G23 authority + key
   transition + revocation all recompute unchanged (additive only)
9. Node Kit first: continuity primitive has ZERO Cloudflare dependence
10. deterministic across fresh nodes; browser/live verification before
   any report (standing order)

## CONSTRAINTS (frozen)
- additive layer only; every frozen formula (receipts, designation
  bytes, artifact readers) untouched or extended by explicit version
- private keys confined: **/keys/*-key.pem law (the G23 lesson)
- no test transactions; all audit goals labeled in record goals
- contract frozen BEFORE measurement; hypothesis stated BEFORE attack;
  ruling on the primitive BEFORE implementation

## RULING (Dad, 2026-10-03): B — SOVEREIGN STATE CHAIN. BUILD.
Frozen implementation target, verbatim:
"A valid signature proves a state was authorized; the standing
continuity chain determines whether it is still current."
Minimum structure: height + prior_state_hash + state_payload +
origin_signature, with the COMPLETE canonical structure signed.
Verifier laws (all ten, verbatim intent):
1. Genesis/anchor is explicit.
2. Every subsequent state has exactly the required predecessor
   relationship.
3. Height cannot be independently trusted; it must be
   signature-bound.
4. prior_state_hash must resolve to the expected preceding state.
5. A valid old state may remain historically valid without being
   currently valid.
6. Conflicting successors constitute a fork, not two simultaneous
   truths.
7. A fork cannot be silently selected by timestamp, arrival order,
   URL, or replica preference.
8. Supersession requires an explicit signed act.
9. Rollback requires an explicit signed restart/recovery record.
10. Pre-continuity records remain valid historical records of the
    unlinked era, never retroactively rewritten into the chain.
The distinction: height alone is never authority (a malicious replica
can manufacture height 9,999,999 — meaningless without the signed
predecessor chain); "latest timestamp" is never the current-state
rule (G24 already demonstrated why).
The authoritative relation:
signature -> authorized state
predecessor chain -> authorized history
signed supersession/recovery -> legitimate change of history
Phase 1 stays frozen at 3fc8244, exactly like G22. The wall gets
built, then attacked again.

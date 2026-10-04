# G26 — CLOSED (Dad's ruling, Oct 4, 2026)

G26 = CLOSED at 2870f0a. The value Dad named, verbatim intent:
the first pass failed honestly and exposed a real authority-lifecycle
defect; the fix became a canonical law (HARZ-KEY-TRANSITION-V2),
not an operational patch.

## FROZEN (do not touch without Dad's explicit order)
- The compromise-rotation finding stands RECORDED, NOT PATCHED:
  "Compromise-rotation knowledge can make historical records
  unverifiable when those records lack signed act time."
  It belongs to the next lifecycle policy surface, not an
  emergency production change.
- Production: key 2 FROZEN (8ae5337b), checkpoints ON-DEMAND,
  anchor block 11355047 standing.
- G24/G25/G26 primitives are frozen foundations.

# G27 — AVAILABILITY/LIVENESS: CONTRACT (frozen BEFORE any attack)

Frozen: 2026-10-04, before the battery. G27-A issued by Dad.

## THE QUESTION
> Can HARZ lose connectivity, lose nodes, partition, recover, and
> continue operating without converting availability into authority?

## THE CENTRAL INVARIANT (frozen)
> Liveness may disappear. Authority must never be fabricated.

## THE CORE LAW (frozen, verbatim)
> Silence is not authority.
A node that has been offline indefinitely must never conclude
"nobody has contradicted me, therefore I am current." Absence of
contradiction is NEVER evidence of currency.

## GATE ORDER (frozen, Dad's sequence)
- G27-A: freeze G26. No production changes. Key 2 frozen.
  On-demand checkpoints frozen. Block 11355047 stays the anchor.
- G27-B: attack the standing verifier EXACTLY AS IT STANDS.
  No fixing while the first battery runs.
- G27-C: classify every result under the explicit taxonomy:
  UNKNOWN | STALE | CURRENT | CONFLICT | LOCAL AHEAD |
  AUTHORITY UNAVAILABLE. A result that fits no class is a
  finding, not a pass.
- G27-D: repair ONLY a demonstrated authority violation.
  Disclosure/labeling gaps are reported for ruling, not patched.
- G27-E: rerun the ENTIRE G24+G25+G26 regression after any repair.

## THE GATE RULE (frozen, verbatim)
> Availability failure is not allowed to become an authority success.

## THE ELEVEN ATTACKS (measured, never asserted; no code changes)
1. ORIGIN UNAVAILABLE — what does a node legitimately know when
   the origin cannot be reached? Refusal must disclose the
   availability cause, and must never convert to a validity claim.
2. CHAIN UNAVAILABLE — the last trusted boundary must remain
   intact; a fetch failure is disclosed, never widened.
3. REPLICA PARTITION — neither side may manufacture CURRENT from
   its partition-local view.
4. LONG PARTITION — freshness may EXPIRE (STALE OBSERVATION)
   without the state becoming invalid-by-inference.
5. STALE NODE RECONNECTS — reconciliation preserves the authority
   history; no edit, no silent catch-up.
6. FRESH NODE DURING OUTAGE — it must distinguish UNKNOWN from
   CURRENT; unknown is never silently upgraded.
7. ORIGIN ADVANCES WHILE NODE IS ISOLATED — LOCAL AHEAD / BEHIND /
   UNKNOWN must remain explicit, never guessed.
8. TWO PARTITIONS ADVANCE INDEPENDENTLY — the conflict must
   surface; neither side wins by proximity.
9. RECOVERY AFTER CONFLICTING HISTORIES — no silent merge, no
   history edit; the anchor may rule, the record may not lie.
10. REPEATED OUTAGE/RECOVERY — no state transition creates
    authority merely through repetition; the flap itself must
    accumulate nothing.
11. PERMANENT ISOLATION — the nastiest: indefinite silence must
    never be read as confirmation. The verdict must never harden
    "relative current" into "absolute current" with the passage
    of time.

## METHOD
Freeze first. Attack second. The standing G26 verifier runs
unmodified. Every verdict is copied verbatim and classified. Only
Dad's ruling converts a classification gap into a build.

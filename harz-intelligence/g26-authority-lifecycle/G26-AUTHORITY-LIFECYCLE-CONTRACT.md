# G26 — AUTHORITY LIFECYCLE: CONTRACT (frozen BEFORE any attack or build)

Frozen: 2026-10-04, before the battery. Anchors: G25 CLOSED deee620,
G24 CLOSED dbc1c88. G24 and G25 primitives are FROZEN FOUNDATIONS —
no file, formula, or verdict of either may be touched by G26.

## THE FORMAL QUESTION (the one thing G26 must answer)

> What exactly constitutes a valid authority transition?

If that cannot be expressed as canonical, signed, independently
verifiable evidence, G26 FAILS. No narrative, no proximity, no
"operational necessity" substitutes for the signed record.

## FROZEN STARTING POINT (Dad's ruling, verbatim intent)
- checkpoint cadence: on-demand
- signing key: key 2 (production, 8ae5337b)
- G24/G25 primitives untouched
- no automatic checkpointing
- NO production key rotation during the first attack phase —
  rotation attacks run on kit keys (fresh, never-exposed), never
  on production key 2. Production rotation remains a policy act
  requiring Dad's explicit order (G25-CLOSED law) + a disclosed
  chain-worker pin update.

## THE AUTHORITY MODEL UNDER TEST
An authority transition is valid ONLY if it is an explicit, signed,
independently verifiable act of the EXISTING authority:
  old key -> new public key -> new fingerprint
  -> effective time (ISO) and/or effective chain height
  -> authorization (the old key's signature over all of the above)
  -> revocation status (the old key lands on the revocation list
     at the effective point; exposed/compromised keys can NEVER be
     re-authorized).
A verifier accepts a signer only through: pinned anchor, OR a
canonical signed transition chain rooted at the pinned anchor, OR
being the pinned anchor itself — and never through a revoked key.

## THE TEN ATTACKS (measured, never asserted)
1. KEY COMPROMISE SIMULATION — a revoked key must never
   authenticate a new checkpoint.
2. KEY ROTATION — old->new transition must be explicit and
   verifiable (a lawful transition is accepted through the chain;
   nothing else is).
3. PRE-ROTATION REPLAY — an old valid checkpoint cannot become
   newly authoritative after rotation.
4. POST-ROTATION FORGERY — a fabricated new-key checkpoint is
   refused; a forged transition record is refused.
5. ROTATION FORK — competing valid rotation histories are
   surfaced, never silently selected.
6. CHECKPOINT BEFORE/AFTER ROTATION — the boundary is
   deterministic: a checkpoint is authoritative iff its signer was
   authorized AT its notarized_at (measured against the transition
   record's effective time; all four quadrants tested).
7. REVOCATION PROPAGATION — fresh and stale nodes DISCLOSE what
   they know: the authority-knowledge cutoff (anchor, transitions,
   revocation list identity) is printed in every verdict; a node
   never silently assumes its knowledge is complete.
8. ROLLBACK ATTEMPT — authority never moves backward silently:
   a transition that re-authorizes a permanently revoked
   (compromised) key is refused.
9. RECOVERY AFTER ROTATION + OUTAGE — restoration preserves the
   authority history: transitions and revocations survive, new
   checkpoints anchor, history is never edited.
10. MIXED-VERSION NODES — an old node (authority knowledge = pre-
    rotation) and a new node (post-rotation) never manufacture
    CURRENT from incompatible authority knowledge; the mismatch is
    disclosed, not resolved by guess.

## METHOD (Dad's order)
Freeze first. Attack second. Build ONLY when an attack exposes a
real gap. Every attack runs against the STANDING primitives first;
where a gap is exposed, the build is the minimum that closes it,
additive only, and every earlier attack battery (G24 matrix, G25
C0-C10) must re-run byte-identical afterward.

## SUCCESS
G26 passes only if all ten attacks measure true against the frozen
foundations, with every gap found by the battery closed by the
battery's own evidence — and the formal question answers in
canonical signed bytes: the transition record.

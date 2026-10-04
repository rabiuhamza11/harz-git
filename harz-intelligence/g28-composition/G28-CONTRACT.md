# AUTHORITY WALL v1 — FREEZE (G24–G27, Dad's declaration, Oct 4, 2026)

Four proven boundaries, frozen as one wall:

G24 — INTEGRITY: can the state prove what it is?
G25 — CONVERGENCE: can replicated state falsely rise to sovereign
     authority? (anchor can demote, never promote)
G26 — AUTHORITY LIFECYCLE: can authority change without replay,
     rollback, forgery, or ambiguity? (HARZ-KEY-TRANSITION-V2;
     act-time authorization; silence never re-authorizes)
G27 — LIVENESS: can outages and partitions occur without
     availability failure becoming fabricated authority?

THE PERMANENT PRINCIPLE (bigger than any single test):
> Silence is evidence of absence of knowledge, not evidence of
> authority.

It gives the system a safe default whenever knowledge disappears.

Wall components frozen at: G24 dbc1c88, G25 deee620 (+4d0b1f3),
G23 authority c6f587f, G26 2870f0a, G27 ruling 4697f89 + fix
ae15e8a. Production: key 2 (8ae5337b) frozen, on-demand
checkpoints frozen, anchor block 11355047 standing.

# G28 — CROSS-GATE COMPOSITION ATTACK: CONTRACT (frozen BEFORE any attack)

## THE QUESTION
> When several individually-safe failure modes overlap, can
> their composition create authority that none of them can
> create alone?

## RULES (frozen, Dad's words)
- freeze first
- attack the frozen system; NO patching during the attack
- distinguish disclosure failure from authority failure
- any authority promotion without sovereign evidence = G28 FAIL
- rerun the complete G24–G27 regression afterward

## THE COMPOSITION BATTERY (each attack overlaps 3+ failure modes)
1. FULL STACK: rotation + partition + stale replica + competing
   history + recovery (Dad's example topology).
2. ANCHOR MASKING BY TIME: two valid sovereign anchors at
   DIFFERENT heights; the fresher, LOWER one may mask the older,
   HIGHER one's demotion of the local tip (the same-height
   competing rule does not cover different heights).
3. COMPROMISE + PARTITION + FORK + COMPETING CHECKPOINTS: a
   revoked key's anchor vs the successor's anchor over a fork.
4. ROTATION + LONG PARTITION + REPLAY + RECOVERY: a stale
   replica behind both an old-key anchor and the successor's.
5. ERA + ROTATION + ANCHORLESS + ERA-NAMING ANCHOR: an anchor
   naming an unlinked-era state must never promote era history.
6. FLAP + MIXED-VERSION + ROTATION + STALE OBSERVATION: repeated
   outages across nodes with different authority knowledge.
7. DOUBLE ROTATION + MIDDLE-KEY WINDOW: the middle key's window
   ends; its earlier acts stand, its later acts are refused.
8. BENIGN CONTROL: origin-advanced-past-checkpoint (LOCAL AHEAD)
   with no other anchors — the individually-safe case must stay
   safe under the same code path.

## CLASSIFICATION LAW (Dad's rule, verbatim)
A composed verdict is G28 FAIL only if it promotes a state to
authority without sovereign evidence for THAT state. A wrong or
missing label that refuses/defers/demotes is a disclosure
failure, reported separately. Silence, ambiguity, and masking
are never silently resolved: if the code must choose, the choice
must be disclosed — an undisclosed timestamp-selection that
overrides valid sovereign evidence is a finding.

## METHOD
All attacks run on the FROZEN G27 verifier, unmodified. Kit
keys only (v3 anchor, v4/v5 successors, v6 impostor; production
key 2 untouched). Every verdict copied verbatim and classified.
No repair until the battery completes and Dad rules.

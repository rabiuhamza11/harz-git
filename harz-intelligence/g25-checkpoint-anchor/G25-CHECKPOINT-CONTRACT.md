# G25 — HARZ-CHAIN CHECKPOINT ANCHOR: CONTRACT (frozen BEFORE implementation)

Date: 2026-10-03. Dad's ruling: BUILD G25. G24 stays frozen at
dbc1c88 (Phase-2 evidence); no G24 implementation changes before
this contract froze (and none after without explicit ruling).

## THE FROZEN PRINCIPLE (Dad, verbatim)
"HARZ-chain is a checkpoint authority, not a replacement for the
sovereign origin."
G25 closes exactly one gap — the G24-measured convergence gap —
nothing more. G24 proved the replica graph preserves integrity but
cannot guarantee convergence between nodes that never shared a
common checkpoint.

## THE CHECKPOINT LAW
The origin periodically notarizes:
    checkpoint = { origin_id, chain_height, state_hash }
onto HARZ-chain. The checkpoint itself is cryptographically bound to
the SAME sovereign origin authority (origin signature over the
complete canonical checkpoint bytes — a checkpoint is an origin act)
and carries enough information to prevent ambiguity about WHICH
HARZ state was notarized (chain_height + state_hash + origin_id +
notarized_at, all signed). The checkpoint is externally anchored: it
is embedded in a HARZ-chain block (on-chain notarization), and the
anchor is recomputable from the chain's public block formula.

## FRESH-NODE LAW (exactly Dad's five rules)
1. Checkpoint agrees with local chain -> chain is ANCHORED.
2. Local chain behind checkpoint -> STALE, NOT CURRENT.
3. Local chain conflicts with checkpoint -> CONFLICT / NOT CURRENT.
4. No checkpoint available -> retain G24's honest
   current-relative-to-known-history boundary (disclosed, never
   silently widened).
5. Conflicting checkpoints -> NEVER silently choose; surface the
   conflict. (Chain block order is disclosed context, not a silent
   tie-breaker.)
Plus: the checkpoint CANNOT REWRITE HISTORY — it only establishes
an external observation of the sovereign chain tip. A checkpoint
behind the local tip is disclosed as "origin advanced after
checkpoint" (case 7): locally current, observation stale.

## FRESHNESS POLICY (measurable, never asserted)
"Latest on-chain checkpoint" is not a magic word. Checkpoint age is
MEASURED from two independent clocks — the signed notarized_at and
the HARZ-chain block's own timestamp/height — and the verdict
carries the measured age and an explicit freshness window. A stale
checkpoint can anchor a history but the verdict must SAY the
observation is old. Liveness beyond the window is NOT assumed.

## THE SUCCESS CONDITION (Dad, verbatim)
"The checkpoint may tell a node that its locally valid history is no
longer the current publicly anchored history, but it must never
manufacture validity that the sovereign chain itself does not
possess."

## THE DECISIVE ATTACKS (all adversarial cases built BEFORE success
is declared; frozen primitive of G24 untouched)
1.  Stale replica behind an on-chain checkpoint -> STALE, NOT
    CURRENT (the replay/resurrection path closes).
2.  Conflicting local fork against checkpoint -> CONFLICT / NOT
    CURRENT (the fork can no longer pose as current).
3.  Forged checkpoint -> refused (origin signature + chain anchor
    recompute).
4.  Valid OLD checkpoint replayed as latest -> honest: anchors only
    what it notarized; age disclosed; never promotes anything.
5.  Checkpoint withholding -> G24 boundary, disclosed.
6.  Competing checkpoints -> conflict surfaced, never silently
    chosen.
7.  Origin state advances after checkpoint -> local current,
    checkpoint disclosed as behind.
8.  Fresh node first contact -> the N1 boundary, now bounded by the
    latest checkpoint: stale serving is bounded by checkpoint age.
9.  HARZ-chain unavailable -> G24 boundary, disclosed.
10. Checkpoint restored after a temporary chain outage -> the node
    re-anchors on the next valid checkpoint; no silent history edit.

## SCOPE AND CONSTRAINTS
Additive only: G24's frozen primitive (cells, laws 1-10, acts)
untouched. The verifier's checkpoint layer is a NEW evaluation over
the unchanged G24 layer. All G19-G24 regressions must recompute
unchanged. Production notarization is a real HARZ-chain block
through the chain's internal formula, verified against the live
chain. Browser test before any report. Nothing in G25 gives the
chain authority over origin state: the chain OBSERVES; the origin
AUTHORIZES.

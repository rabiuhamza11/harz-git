# G24 PHASE 2 — INDEPENDENT RE-ATTACK CONTRACT (frozen BEFORE measurement)

Date: 2026-10-03. Dad's order, verbatim intent: "Don't modify the
frozen primitive before that attack. The next attack should
specifically target the boundary you disclosed: two fresh nodes
encountering conflicting histories without a prior shared
checkpoint."

THE FROZEN TARGET (not the implementation around it):
the continuity primitive exactly as built (d3c0c06) — signed cells,
chain laws 1-10, explicit acts, the disclosed boundary.

## PRE-MEASUREMENT HYPOTHESIS (stated before any attack)
The ten laws hold at every node IN ISOLATION and at every MERGE.
The boundary is an AVAILABILITY/COORDINATION boundary, not an
integrity one:
- a first-contact node can be served ANY valid historical state and
  will name it CURRENT (currency is relative to the known set)
- two isolated nodes can be kept in PERMANENT DISAGREEMENT (each
  locally correct, globally unreconciled without a shared checkpoint)
- an explicit act that never reaches a node retires nothing FOR THAT
  NODE (acts are state; act replication is part of continuity)
- two competing genesis chains from the same key both verify in
  isolation (the G22 echo, now at the state layer)
BUT: NO attack path exists from any of this to FALSE VERIFICATION
or SILENT SELECTION — every merge of conflicting histories DISCLOSES
the conflict and refuses to pick; no unsigned, foreign-key, or
manufactured chain is ever accepted. If measurement shows a node
silently selecting a wrong branch or verifying an unanchored chain,
the wall is DOWN and this hypothesis dies honestly.

## THE ATTACKS (kit, standing anchor key 3; production probes live)
N1  ISOLATED FIRST CONTACT: fresh node served only a stale state
    (height 1) -> expect: named CURRENT (boundary measured exactly).
N2  CONFLICTING HISTORIES, ISOLATED NODES: node A = branch-1
    (s1->s2->s3->forkA), node B = branch-2 (...->forkB) -> expect:
    each CHAIN VERIFIED with a CONTRADICTORY current.
N3  THE MERGE: the two nodes exchange their full histories ->
    expect: FORK DISCLOSED, UNDETERMINED (conflict becomes visible
    at merge, never silently resolved).
N4  ACT WITHHOLDING: node B receives branch-2 but the supersession
    act retiring it is withheld -> expect: B keeps its tip current;
    the split persists. No false pick — but the act's authority is
    only as replicated as the act itself.
N5  COMPETING GENESIS: a second genesis chain from the same key ->
    each valid alone; together fork detected at HEIGHT 1 (the G22
    echo measured at the state layer).
N6  UNANCHORED CHAINS: manufactured/unsigned/foreign-key cells ->
    refused (integrity floor re-verified under Phase 2 conditions).
N7  PRE-CONTINUITY ERA AS CURRENT: the G23-era production state
    served to a fresh node -> expect: valid history, NO current
    state — the era can never be served as current.
N8  PRODUCTION LIVE: the true chain served alone -> current s3
    (correct, it IS the tip); browser-verified.

## CONSTRAINTS
No changes to the frozen primitive (no formula, no cell structure, no
verifier law touched — harness and bundles only). Phase 1 stays
frozen at 3fc8244. All findings frozen with measurements, like G22
and Phase 1. The outcome feeds the ruling on the external continuity
anchor (HARZ-chain checkpoint notarization) — PROPOSED ONLY, not
built.

# G24 PHASE 2 — INDEPENDENT RE-ATTACK: MEASUREMENT (2026-10-03)

Contract frozen at f68b41b BEFORE any attack. Hypothesis stated
there BEFORE the attacks. Frozen primitive untouched (harness and
bundles only). Kit rebuilt fresh (see slips) on the standing
never-exposed anchor key 3.

## THE ATTACK MATRIX (all measured, no predictions after the fact)

N1  ISOLATED FIRST CONTACT — a stale height-1 state alone:
    CHAIN VERIFIED, current = that stale state (height 1).
    MEASURED EXACTLY AS THE BOUNDARY SAYS: first contact accepts
    any valid historical state as current. Currency is relative to
    the known set. No node can know what it has never received.

N2  CONFLICTING HISTORIES, ISOLATED NODES — node A (branch-1 tip)
    vs node B (branch-2 tip): each CHAIN VERIFIED, each names ITS
    OWN tip CURRENT. Two contradictory, locally-correct verdicts.
    PERMANENT DISAGREEMENT IS POSSIBLE without a shared checkpoint.

N3  THE MERGE — the two nodes exchange histories: FORK DETECTED at
    height 4, CURRENCY: UNDETERMINED. No silent selection by
    timestamp, arrival order, URL, or replica preference. The
    conflict becomes visible at merge and refuses to resolve
    itself. This is the honest behavior: the fork was always there;
    the merge DISCLOSES it.

N4  ACT DELIVERY vs ACT WITHHOLDING — with the signed supersession
    act delivered, the fork resolves (retired branch -> history,
    other tip CURRENT). With the act WITHHELD from node B, node B
    keeps its tip current: the split persists. MEASURED: an act
    retires nothing on nodes it never reaches — ACT REPLICATION IS
    PART OF CONTINUITY. Acts are state, not broadcast.

N5  COMPETING GENESIS (same key, two genesis cells): each chain
    valid alone; together FORK DETECTED AT HEIGHT 1 — the G22 echo,
    measured at the state layer. NOTE THE EDGE, exactly: the tie
    case refuses (N3), but a NON-TIE fork resolves by
    longest-known-chain (s3's branch over the lone competing
    genesis), ALWAYS WITH THE FORK DISCLOSED. That rule is safe
    only because every cell must be origin-signed (length cannot be
    manufactured without the key) and correct only where every act
    has replicated: a longer stale branch whose retirement act was
    withheld can outrank a shorter true branch at merge. This is
    the same act-replication pressure point as N4, now measured at
    the branch level — the exact pressure point Dad named.

N6  UNANCHORED CHAINS — unsigned cell claiming height 999,999:
    CELL SIGNATURE INVALID, refused. No false verification found
    anywhere in Phase 2.

N7  PRE-CONTINUITY ERA AS CURRENT — the G23-era production state
    served alone: both records AUTHENTIC, UNLINKED-ERA (law 10),
    CURRENCY: no current state. The era can never be served as
    current. The 141-record boundary holds from both sides.

N8  PRODUCTION LIVE — the true chain alone: current s3 (height 3),
    tip f3bc50b99dca3b7b... browser-verified at the continuity
    endpoint (explicit signed acts only; forks are never silently
    selected).

## THE FINDING (exact)
The ten laws held at EVERY isolated node and at EVERY merge. No
path was found from the boundary to false verification or silent
selection: every fabricated cell was refused, every merge of
conflicting histories disclosed the conflict and refused to pick a
tip, and the era can never be resurrected as current.
The boundary is an AVAILABILITY/COORDINATION boundary, not an
integrity one:
- first contact can be pinned to any valid historical state (N1)
- isolated nodes can be kept in permanent, locally-correct
  disagreement (N2)
- acts retire nothing where they do not replicate (N4)
- longest-known-chain resolves non-tie forks — correct only with
  full act replication (N5)
An attacker can keep nodes SEPARATED and STALE, but cannot make any
node verify a falsehood or silently pick a wrong tip from what it
has actually received. Integrity is closed; convergence is not.

## THE RESIDUAL PRESSURE POINT (named exactly, per Dad's order)
"Two fresh nodes encountering conflicting histories without a prior
shared checkpoint." Measured from every angle above. What closes
it is an anchor OUTSIDE the replica graph: the origin's tip
(height + state_hash) periodically notarized on the HARZ chain
itself — Option C. Fresh nodes then pin their first contact against
the latest on-chain checkpoint; stale serving becomes bounded by
checkpoint age; split-brain becomes measurable against a public
root. PROPOSED AS G25 — contract only on Dad's ruling; nothing was
built in Phase 2 and the frozen primitive is untouched.

## HARNESS SLIPS (test-side only, disclosed)
1. The kit origin died mid-audit (in-memory store; process lost).
   The fresh node then REFUSED the resolution record because its
   artifact could no longer be fetched — the verifier's honest
   disclosed failure, not a chain-law breach. The Phase 2 chain
   was rebuilt fresh and all attacks re-run against it; nothing
   from the dead instance entered any verdict.
2. Verifier output improved to print authority failure REASONS
   (diagnosability; no law touched).

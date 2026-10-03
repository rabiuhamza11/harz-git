# G24 SOVEREIGN STATE CONTINUITY — TRACE (2026-10-03)

Contract + ruling B frozen BEFORE build (156d234 / 49df5ea).
Phase 1 (the attack) stays frozen at 3fc8244, exactly like G22.
Law (Dad, verbatim): "A valid signature proves a state was
authorized; the standing continuity chain determines whether it is
still current."

## THE PRIMITIVE (additive; zero frozen formulas touched)
Every state-carrying mission record now joins the SOVEREIGN STATE
CHAIN: a signed continuity cell { law: HARZ-STATE-CONTINUITY-V1,
record, height, prior_state_hash, payload_hash } — the COMPLETE
canonical cell is signed by the origin key (height is never
independently trusted; law 3). payload_hash binds the record (id +
mission receipt + designation receipt). state_hash = sha256(cell
bytes + ':' + signature). The origin keeps the chain tip in storage.
GENESIS is explicit and DISCLOSES the unlinked era (141 production
records before the chain; pre-continuity records are never
retroactively rewritten — law 10). Continuity acts are explicit
SIGNED policy: supersession (retire a state as current) and restart
(explicit rollback recovery, re-anchoring the tip; post-restart
cells carry restarts_after_act descent markers). No act, no change
of history.

## DEATH-TEST MATRIX (all measured in the Node Kit on the standing
kit anchor key 3, de2a8686 — never exposed; zero Cloudflare
dependence), then re-measured LIVE on production:
T8  LEGITIMATE ADVANCEMENT s1(genesis)->s2->s3: CHAIN VERIFIED,
    current = s3 (tip). Genesis explicit, era disclosed, links
    recompute, heights signature-bound.
T3/T7 THE FORK — two authorized successors of the tip at height 4
    (both validly signed by the authorized key, genuine split-brain
    emission): FORK DETECTED, CURRENCY: UNDETERMINED. No silent
    selection by timestamp, arrival order, URL, or replica
    preference. Conflicting successors are a fork, not two truths.
T4  FORK + SIGNED SUPERSESSION act retiring forkA: forkB becomes
    CURRENT; forkA valid history, never current. The act is the
    ONLY resolution path.
T5a ROLLBACK WITHOUT THE ACT (re-anchored origin, old branch still
    presented): two height-3 states -> FORK, UNDETERMINED, refused.
T5b ROLLBACK WITH THE SIGNED RESTART ACT: pre-restart branch
    RETIRED-BY-RESTART (valid history), post-restart state (descent
    marker bound to the valid act) CURRENT. Rollback is an explicit
    signed act or it does not exist.
T6  MANUFACTURED HEIGHT — a fully signed cell claiming height
    999,999: REFUSED. The signed predecessor chain is the authority;
    the number is nothing (Dad's malicious-replica case).
T6b UNSIGNED CELL (attacker without the key): cell signature
    INVALID, refused.
T9  PARTIAL EXPORT (height 2 missing): s3's prior does not resolve
    -> CHAIN POSITION REFUSED, disclosed, not current.
T10 UNLINKED-ERA RECORD (pre-continuity): AUTHENTIC, valid history
    of the unlinked era, never current, never retro-linked.
DETERMINISM: identical verdicts across repeated fresh-node runs.
REGRESSIONS: G19 minimal export 11/11, G20 role, G21 designation,
G23 authority (on continuity-carrying records) — all unchanged.

## PRODUCTION (live)
harz-intelligence deployed with the continuity layer. Genesis
state 1 EXPLICITLY DISCLOSES 141 unlinked-era records before the
chain. Live chain s1->s2->s3 (conflict, resolution, conflict),
every cell signed by the production key 2 (8ae5337b973f8e53...).
Fresh-node verification against the pinned production anchor +
revocation list: CHAIN VERIFIED, current = s3 (height 3). Browser
verified /api/continuity/v1 live (tip height 3, state_hash
f3bc50b99dca3b7b..., law line: explicit signed acts only).

## THE ANSWER TO G24'S QUESTION (now exact)
G23 authenticates states; it does not relate them. With the chain:
authority is not just WHO signed and WHAT was said, but WHERE the
state sits in the signed history. Stale replicas, replays, forks,
and rollbacks — the four Phase-1 attacks that all verified at full
authority — are now: history (refused as current), disclosed forks
(never silently selected), and refused rollbacks (unless
explicitly signed). The authoritative relation, exact:
signature -> authorized state
predecessor chain -> authorized history
signed supersession/recovery -> legitimate change of history

## HONEST BOUNDARY (disclosed, per ruling C)
Currency is relative to the verifier's KNOWN chain: a node that has
only ever seen an old state still sees it as the tip of what it
knows. Full first-contact replay protection is the Option C future
anchor (state-root checkpoint notarization onto the HARZ chain).
What G24-B guarantees: once a node knows height N, no state below N
is ever current again, and no fork is ever silently picked.

## HARNESS SLIPS DISCLOSED (test-side only)
1. Era-count off-by-one at genesis (the genesis mission is itself
   indexed mid-execution) — fixed BEFORE production deploy (141
   disclosed, exact).
2. One minter invocation with misordered arguments produced orphan
   forks (caught immediately, re-minted correctly; the misrun was
   itself a correct orphan-detection demonstration).
Neither touched origin, formulas, or frozen state.

## G24 PHASE 1 STAYS FROZEN at 3fc8244 — the failed pre-continuity
state is preserved exactly like G22: the system does not pretend
the old architecture was safe because the new one fixes it.

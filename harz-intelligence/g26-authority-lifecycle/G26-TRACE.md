# G26 — AUTHORITY LIFECYCLE: TRACE & MEASUREMENT (2026-10-04)

Contract frozen f0bd87b BEFORE any attack or build. Dad's method
honored exactly: freeze first, attack second, build ONLY on an
exposed gap. G24/G25 primitives untouched — no production file,
formula, or worker changed in G26. Production key 2 never rotated;
all lifecycle attacks ran on kit keys (v3 standing anchor, fresh
never-exposed v4/v5/v6).

## FIRST PASS — the standing G24/G25 verifier, measured honestly
1  compromise (revoked exposed key signs a new checkpoint):
   REFUSED — the standing revocation law already held. PASS.
2  lawful rotation (v4 checkpoint + valid signed transition):
   REFUSED — GAP EXPOSED: a lawful authority transition could not
   even be EXPRESSED; the lifecycle did not exist in the
   fresh-node law.
3  pre-rotation replay (v3 checkpoint minted AFTER the transition's
   effective time): ACCEPTED AND ANCHORED — THE ATTACK SUCCEEDED.
   GAP EXPOSED: stale authority knowledge + no rotation awareness
   let an old key newly authorize after rotation.
4  post-rotation forgery (impostor key; forged transition record):
   REFUSED — standing refused both. PASS.
5  rotation fork (two valid transitions to different successors):
   both refused, nothing surfaced — subsumed by the A2 gap.
6  before/after boundary (v4 checkpoint before its effective time):
   refused for the wrong reason; boundary not measurable — subsumed.
7  revocation propagation: the node printed NOTHING about its
   authority knowledge — GAP EXPOSED (disclosure law).
8  rollback attempt (v4-signed transition re-authorizing the old
   key): standing knowledge could not evaluate it — subsumed.
9  recovery after rotation + outage: not expressible — subsumed.
10 mixed-version nodes (pre-rotation node receiving the new
   authority's checkpoint): refused (nothing manufactured) but
   with no mismatch disclosure — partial gap.

THE EXPOSED GAP (the only build permit): the fresh node had no
authority-transition resolution, no act-time authorization, no
effective-time boundary, no explicit node-knowledge input, and no
authority disclosure.

## THE BUILD (additive; default path = standing, byte-identical)
HARZ-KEY-TRANSITION-V2 — the formal answer, in canonical signed
bytes: {law, transition_id, from_fingerprint, to_fingerprint,
to_public_key_spki_pem, effective_at} signed by the EXISTING
authority over complete canonical bytes (signature excluded from
the signed bytes; V1 = the historical production 1->2 record,
effective at -infinity, backward compatible).
The authority-resolution layer (g26 fresh node only):
- bundle.authority = {anchor?, transitions?, revocations?} = the
  node's EXPLICIT authority knowledge; absent -> standing keys dir,
  G24/G25 semantics unchanged.
- A signer is authorized at act time t iff: not on the permanent
  revocation list, AND reachable from the pinned anchor through
  valid signed transitions, AND within its authority window
  (since <= t < until; a V2 transition ends the OLD key's
  authority at effective_at).
- Refused transitions: forged signature; to_fingerprint mismatch
  with the presented key; successor permanently revoked (a
  revoked key can NEVER be re-authorized); successor is an
  ancestor (authority never moves backward); from not authorized.
- FORK: two valid transitions from the same authorized key ->
  AUTHORITY FORK SURFACED, never silently chosen.
- DISCLOSURE (attack 7): every verdict prints the node's authority
  knowledge: anchor, transitions accepted (+refused with reasons),
  revocations known, knowledge source.

## SECOND PASS — all ten measured true, for the right reasons
1  compromise: REFUSED — REVOKED; a revoked key never
   re-authenticates anything. PASS.
2  lawful rotation: the v4 checkpoint ANCHORED THROUGH THE SIGNED
   TRANSITION CHAIN (knowledge: 1 transition accepted). The
   lifecycle is now expressible and verifiable. PASS.
3  pre-rotation replay: REFUSED — AUTHORITY WINDOW PASSED (act
   time after the effective rotation; the old key cannot newly
   authorize). The A3 attack that SUCCEEDED in the first pass is
   now blocked. PASS.
4  post-rotation forgery: REFUSED — impostor key unknown to the
   node's knowledge; the forged transition record separately
   refused as NOT A VALID ACT OF THE EXISTING AUTHORITY. PASS.
5  rotation fork: AUTHORITY FORK SURFACED — both successor
   checkpoints refused; competing rotation histories are visible,
   never silently resolved. PASS.
6  boundary determinism: cp-v4-before (before effective_at)
   REFUSED — NOT YET AUTHORIZED; cp-v4-after ANCHORED. All four
   quadrants measured: v3-before valid, v3-after window-passed,
   v4-before not-yet, v4-after authorized. DETERMINISTIC. PASS.
7  revocation propagation: the same old-key checkpoint measures
   differently under different DISCLOSED knowledge — pre-rotation
   knowledge (A3 first pass: accepted, disclosed) vs post-rotation
   knowledge (REVOKED, disclosed, 5 revocations known). Every
   verdict prints what the node knows; a node never silently
   assumes its knowledge is complete. PASS (disclosed finding:
   under compromise-rotation knowledge, pre-rotation records are
   no longer verifiable — records carry no signed act time; the
   CHAIN REFUSED verdict is the honest consequence, and it is
   printed, not masked. Planned rotation (A9) does NOT have this
   effect: superseded-but-not-revoked history still verifies.)
8  rollback attempt: the v4-signed transition re-authorizing the
   revoked old key REFUSED — ROLLBACK (permanently revoked
   successor); authority never moved backward; cp-v3-after
   refused under the same knowledge. PASS.
9  recovery after rotation + outage (planned rotation): the
   transition record + revocation knowledge survive; the v4
   checkpoint re-anchors; the chain verifies; history bytes
   unchanged. PASS.
10 mixed-version nodes: the pre-rotation node (standing knowledge,
   0 transitions, source: standing keys dir) REFUSES the new
   authority's checkpoint and DISCLOSES its knowledge cutoff;
   CURRENT is never manufactured from incompatible knowledge.
   The post-rotation node accepts through the chain. PASS.

## REGRESSION (the discipline Dad demanded)
14 topologies (G24: first-contact, both fork branches, the merge
fork; G25: C0 anchored, C1 stale, C2 conflict, C3 forged, C4 old,
C5 withheld, C6 competing, C7 advanced, C8 first contact,
C9 chain-down) re-sealed on the current chain records and run
through BOTH the frozen G25 verifier and the G26 verifier:
14/14 verdicts BYTE-IDENTICAL. The additive layer changed nothing
in default semantics.

## LIVE (untouched, browser-verified after the battery)
No production deploy occurred in G26. The chain still serves the
G25 checkpoint (height 3, f3bc50b9..., block 11355047); the origin
still serves tip + matching checkpoint; production key 2 remains
the pinned signer, FROZEN per the G25 close. Browser-verified both
endpoints post-battery.

## THE FORMAL QUESTION — ANSWERED
"What exactly constitutes a valid authority transition?" —
expressible as canonical signed evidence: a HARZ-KEY-TRANSITION-V2
record (old key -> new key -> effective time -> old-key
authorization over complete canonical bytes), evaluated by
act-time authorization against the pinned anchor chain, with
permanent revocation, rollback refusal, fork surfacing, and
knowledge disclosure. G26 measured true. No narrative, no
proximity, no operational necessity was ever accepted as
substitute for the signed record.

## HARNESS DEFECTS (disclosed, corrected without touching any law)
1. First pass ran against a dead kit instance (in-memory store):
   the verifier honestly refused unfetchable artifacts; the chain
   was rebuilt fresh and all attack material re-minted before any
   verdict was recorded.
2. mint-fork path resolution: the G25 fork minter resolves keys
   relative to its own location; running it from the G26 directory
   failed loudly; re-run from its home directory (no fork, no
   stale artifact entered any bundle).
3. Cosmetic: the rollback transition's refusal printed twice (the
   resolution loop re-refused each pass); deduped at print; the
   duplicate never affected any verdict.

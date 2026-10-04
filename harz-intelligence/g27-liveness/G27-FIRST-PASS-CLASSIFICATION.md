# G27 — AVAILABILITY/LIVENESS: FIRST ATTACK PASS (G27-B, 2026-10-04)

Contract 3382bc0 frozen before the battery. The standing G26
verifier ran UNMODIFIED for all eleven attacks. No code changes
were made during the battery (G27-D honored: no repair without a
demonstrated authority violation; none was demonstrated).

## THE MEASUREMENTS (verdicts copied, then classified)

L1 ORIGIN UNAVAILABLE
  Measured: ECONNREFUSED disclosed in the failure line;
  s2 labeled "NOT AUTHENTIC (artifact fetch: ECONNREFUSED; seal
  mismatch)"; s3 position refused; verdict CHAIN REFUSED,
  current: s1; boundary + knowledge disclosed.
  Classification: AUTHORITY UNAVAILABLE is disclosed at the CAUSE
  level, but the record-level verdict asserts "NOT AUTHENTIC" —
  an inauthenticity claim the node cannot prove. FINDING C2:
  UNKNOWN (unverifiable) is conflated with INVALID. The refusal
  direction is safe (nothing accepted), and the chain verdict is
  REFUSED — no authority success. NOT a violation.

L2 CHAIN UNAVAILABLE
  Measured: "HARZ-chain UNAVAILABLE (connect ECONNREFUSED) —
  disclosed; G24 honest boundary retained (currency relative to
  known history)". Chain VERIFIED relative to known history.
  Classification: PASS — AUTHORITY UNAVAILABLE properly labeled
  for the checkpoint layer; the last trusted boundary intact.

L3 REPLICA PARTITION (both sides)
  Measured: side A: "tipA: currency CURRENT — the tip of the
  standing valid chain"; side B: "tipB: currency CURRENT";
  both sides print "NO CHECKPOINT — honest boundary retained:
  currency is relative to the known chain (disclosed, never
  silently widened)".
  Classification: no fabrication — neither side anchored, and
  the relative-knowledge qualifier is printed. FINDING C1: the
  per-state label says "currency CURRENT" where the taxonomy
  class is UNKNOWN (no anchor evidence). No partition-local view
  became an anchor claim. NOT a violation.

L4 LONG PARTITION
  Measured: "ANCHORED — local tip IS the publicly anchored
  current state; age 30.1h (window 24h, STALE OBSERVATION —
  disclosed)".
  Classification: PASS — freshness EXPIRED and was disclosed;
  nothing became invalid-by-inference, and nothing became MORE
  current by being old. STALE class explicit.

L5 STALE NODE RECONNECTS
  Measured: "STALE — local tip (height 2) is BEHIND the publicly
  anchored height 3; the locally valid history is NOT CURRENT".
  Classification: PASS — reconciliation demoted the stale node;
  history bytes unchanged.

L6 FRESH NODE DURING OUTAGE
  Measured: s1 "currency CURRENT" + chain UNAVAILABLE disclosed +
  boundary retained.
  Classification: same FINDING C1 — the class is UNKNOWN (a
  fresh node during an outage cannot know currency), and the
  label says CURRENT with a relative qualifier two lines away.
  No silent upgrade to an anchor claim. NOT a violation.

L7 ORIGIN ADVANCES WHILE NODE IS ISOLATED
  Measured: s3 "currency CURRENT" + chain UNAVAILABLE disclosed +
  boundary retained.
  Classification: same FINDING C1. The node did not guess AHEAD
  or BEHIND; it disclosed that it cannot know. The class label
  remains CURRENT-relative. NOT a violation.

L8 TWO PARTITIONS ADVANCE INDEPENDENTLY
  Measured: FORK DETECTED at height 4; "CURRENCY: UNDETERMINED —
  no silent selection"; competing checkpoints not silently
  chosen; verdict FORK DISCLOSED — CURRENCY UNDETERMINED.
  Classification: PASS — CONFLICT surfaced; neither side won by
  proximity.

L9 RECOVERY AFTER CONFLICTING HISTORIES
  Measured: tipA + tipB both AUTHENTIC at height 4; FORK
  DETECTED; CURRENCY UNDETERMINED (resolution requires an
  explicit signed supersession act); a single valid checkpoint
  naming tipA's state did NOT resolve the fork — "NO LOCAL
  CURRENT to anchor (G24 verdict governs)".
  Classification: no silent merge, no history edit — the exact
  attack-9 demand held. FINDING C3: the anchor's lawful demotion
  power (G25: the checkpoint can demote) was NOT exercised against
  the non-matching fork tip; the node defers conservatively to
  the fork verdict. The failure direction is safe (UNDER-claiming,
  never over-claiming). NOT a violation.

L10 REPEATED OUTAGE/RECOVERY
  Measured: five identical down-runs (same verdict every flap),
  then the restored run anchors. The verifier is stateless per
  run: nothing accumulated across repetitions.
  Classification: PASS — repetition created no authority.

L11 PERMANENT ISOLATION
  Measured: "s3: currency CURRENT — the tip of the standing valid
  chain... not superseded, not forked, not retired" + "NO
  CHECKPOINT — honest boundary retained: currency is relative to
  the known chain (disclosed, never silently widened)" + full
  authority-knowledge disclosure.
  Classification: the CORE LAW held in substance: silence was
  never converted into an anchor claim; no "nobody contradicted
  me" reasoning exists anywhere; the relative qualifier is
  always printed. FINDING C1 at its sharpest: the label
  "currency CURRENT" is exactly the sentence a permanently
  isolated node must never say WITHOUT its qualifier — and the
  qualifier lives on a different line. Under Dad's taxonomy the
  class is UNKNOWN. NOT a fabrication — but the strongest
  classification gap in the battery.

## THE GATE RULE CHECK
"Availability failure is not allowed to become an authority
success" — held in all eleven attacks. Zero anchor claims were
manufactured; zero promotions; zero silent merges; zero history
edits; zero repetition effects. Every availability cause was
disclosed (origin ECONNREFUSED, chain ECONNREFUSED, no
checkpoint). The only direction availability ever moved verdicts
was DOWNWARD (refusal, demotion, undetermined) — never upward.

## G27-C CLASSIFICATION (every result)
PASS (taxonomy explicit): L2, L4, L5, L8, L10.
PASS with classification findings (safe direction, honest
disclosure, missing explicit taxonomy label):
- C1 (L3, L6, L7, L11): per-state "currency CURRENT" vs the
  taxonomy's UNKNOWN for anchorless states. The relative
  qualifier is printed, but the class label itself is CURRENT.
- C2 (L1): origin unavailability expressed as record-level "NOT
  AUTHENTIC" instead of UNVERIFIABLE/AUTHORITY UNAVAILABLE.
- C3 (L9): the anchor does not demote a non-matching fork tip;
  conservative deferral, conflict retained.

## G27-D DECISION (per the frozen gate order)
No demonstrated authority violation. NO repair performed. The
three findings are classification-surface gaps in the SAFE
direction; they are reported for Dad's ruling, not patched.
G27-E (regression) is required only after a repair; no repair,
no rebuild — the verifier was never modified in this gate.

## STATUS
G27-B complete. Awaiting Dad's ruling on C1/C2/C3: whether the
taxonomy labels (UNKNOWN / STALE / CURRENT / CONFLICT / LOCAL
AHEAD / AUTHORITY UNAVAILABLE) must become explicit per-verdict
classifications — a disclosure-layer change only, touching no
authority decision logic, or whether the standing qualifier
discipline suffices.

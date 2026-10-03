# G21 DESIGNATION-BINDING AUDIT — CONTRACT (DESIGNATION-BINDING-V1)

Frozen: 2026-10-03, BEFORE any build. Anchor: 76d7a39 (G20 closed).
Dad's ruling: Option B — an additive designation_receipt; NO historical
formula changes. Success condition (verbatim): every semantically
different conflict-resolution topology has a different cryptographic
designation state, while historical mission receipts remain
backward-recomputable and unchanged.

## THE NEW SEAL (formula frozen here)
A record-level additive field emitted BY THE ORIGIN at designation
time (conflict refusal and resolution compose). Verifiers recompute the
bytes from essential state and compare against the origin-emitted
receipt — the same trust model as mission.receipt.

designation_bytes = canonical JSON (order-stable) of:
  law:      'DESIGNATION-BINDING-V1'            (designation law/version)
  record:   mission.id                          (the designating record)
  role:     'conflict' | 'resolution'
  conflict record:
    conflict_refs: [{task, receipt, claims_sha256, answer_sha256}]
    (conflict identity/root = the cited acts WITH their content hashes)
  resolution record:
    conflict_root: record-1 id + record-1 mission receipt
    resolver:  {task, receipt, claims_sha256, answer_sha256,
                act: {type, instruction, fixture_id|identity}}
              (the COMPLETE designated resolver identity — Dad's law:
               bind the identities the role points to, never the bare
               integer, or the ambiguity moves one level deeper)
    resolved:  [{task, receipt, claims_sha256, answer_sha256}]
    evidence:  [{task, claims_sha256, answer_sha256}] (order-bound)
designation_receipt = sha256('designation:' + mission.id + ':'
                             + sha256(canonical designation_bytes))

BINDING PROPERTIES: flipping C -> D changes the resolver identity
block (receipt + claims sha + answer sha + act bytes) and therefore
invalidates the designation seal while the mission receipt stays
unchanged (Dad's critical property). Mutating conflict membership,
the resolver's underlying evidence, or the resolved references each
breaks the seal. A LEGITIMATE different designation (same conflict,
another actually authorized resolver) produces a DIFFERENT VALID
designation receipt — difference is not rejection.

## ADDITIVE ORIGIN CHANGE (disclosed)
The worker gains an emission path only: mission.designation on
conflict-refused records and resolution-composed records. Zero frozen
receipt formulas touched; zero existing records altered (they simply
predate the field). Regression gate: the G19 and G20 chains must still
recompute unchanged, byte-identical, after deploy.

## THE 12 GATES (Dad's, mapped)
G1 freeze G20 topology + canonical C designation (this contract)
G2 build designation_receipt (origin emission + designation-verifier)
G3 clean C -> VERIFIED (true assignment, all G20 seals + new seal)
G4 flip C->D, everything else untouched (incl. origin-emitted
   designation_receipt) -> REFUSED (seal mismatch: resolver identity)
G5 mutate conflict membership -> REFUSED (conflict record's own
   designation seal + resolution record's conflict_root binding)
G6 mutate the resolver's underlying evidence (answer bytes) -> REFUSED
   (resolver claims/answer sha in designation bytes; also mission seal)
G7 mutate ONLY the role integer, preserving the wrong target
   (inconsistent re-derivation) -> REFUSED
G8 delete the designation receipt -> REFUSED
G9 replay the same valid state on a fresh node -> identical verification
G10 G19 + G20 mission receipts still recompute unchanged
G11 legitimate new designation: same conflict, DIFFERENT authorized
    resolver (D designated by the caller in a fresh live mission) ->
    produces a DIFFERENT VALID designation receipt, VERIFIED, not
    rejected for differing
G12 transport substitution: replay the G20 export attack (modified
    export, seals left untouched) across the portability boundary ->
    fresh node CANNOT reach VERIFIED

## LAWS
No historical formula changes. No repair paths: every failure is an
honest refusal. The designation seal is derived state to the verifier
(recomputable from essential state) and origin-emitted truth to the
boundary (a ref substitution now requires FORGING an origin seal —
the escalation from G20's passive substitution). Browser (standing
order) before reporting. Determinism: byte-identical repeat.

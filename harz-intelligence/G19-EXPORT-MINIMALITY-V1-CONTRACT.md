# G19 STATE-EXPORT MINIMALITY AUDIT — CONTRACT (EXPORT-MINIMALITY-V1)

Frozen: 2026-10-03, BEFORE any build. Anchor: 9e00573 (G18 closed).
No origin code changes. This is a sovereignty/dependency audit of the EXPORT
FORMAT, run entirely on copies of the sealed state. Question (Dad, verbatim):
what is the minimum sealed state HARZ actually needs to reconstruct the
complete lineage? Target: every fact necessary for truth reconstruction is
sealed; everything else is derivable or explicitly disposable.

## STARTING STATE
The G18 sealed export (SEALED-STATE-2): two byte-exact records of the SAME
completed chain A+B -> conflict -> C -> resolution -> creation -> reader,
plus export metadata. G18's verifier already reconstructs it 18/18.

## METHOD — EMPIRICAL FIELD ABLATION (never guessed, always measured)
1. Enumerate EVERY field in the sealed export (record-level, task-level,
   nested evidence/resolution/conflict/delivered_children, top-level).
2. min-verifier.js (built this gate): reconstructs the complete lineage from
   a minimal schema, recomputes EVERY derived value, and IGNORES all extra
   fields. Its root of trust: the mission receipt chain — task receipts are
   recomputed from content (frozen formulas), chained, and compared to the
   sealed mission.receipt. No field-to-field comparison against origin-
   supplied derived values.
3. Ablation loop A (classification): for EVERY field in the full export,
   remove it from a copy, run min-verifier, record the verdict, classify:
     essential state — removal forces honest refusal
     derived state — recomputable from surviving fields (receipts, chain,
       claims shas, request_id, prompt sha, artifact sha via the artifact
       fetch), cross-sealed by the mission receipt
     disclosure metadata — human-facing law/labels/sovereignty counts
       (created_what, law strings, external_calls, goal text)
     redundant/cache state — diagnostics (latency_ms, agent_id, backend,
       internal_calls, null error/refusal fields)
   Pre-probe (measured, not assumed): the artifact endpoint delivers ONLY on
   the full key (request_id + '.image.' + 12-hex suffix); the 24-hex
   request_id alone does NOT deliver. The suffix is not derivable from the
   prompt — the artifact key is ESSENTIAL STATE (an identifier), and the
   request_id inside it is DERIVED from the prompt.
4. Canonical minimal export: the full export stripped to fields classified
   essential. min-verifier must fully reconstruct from it: conflict,
   resolution, cross-record lineage edge, prompt, request_id, artifact
   re-fetch, frozen reader judgment, both mission receipt chains — PASS.
5. Ablation loop B (gate 6): remove each essential field from the MINIMAL
   export, one at a time — every removal must force honest refusal.
6. Gate 7: min-verifier reads NO environment variables, uses NO origin code
   beyond the frozen reader file (committed verbatim), needs NO runtime/
   origin memory; its only network access is the artifact fetch built from
   the exported origin + essential artifact key. The complete formula
   inventory it uses is enumerated in the trace.
7. Gate 9: fresh node — a new directory containing ONLY three files
   (minimal export, frozen-reader.js, min-verifier.js), run twice:
   identical verdicts, same result as the origin.

## ESPECIALLY AUDITED (Dad's list)
receipt inputs (task.receipt, mission.receipt — expected: task receipts
  DERIVED, mission receipt ESSENTIAL seal)
fixture identifiers (fixture_id — G18 F1 already proved essential)
prompt/request bytes (instruction — essential; request_id — derived)
claims and claim hashes (answers essential; claims_sha256 everywhere derived)
lineage edges (evidence order refs, resolution_from, resolution_sources,
  resolves_conflict source refs, conflict source refs — essential)
provenance (prose + provenance strings — disclosure; shas within — derived)
artifact identifiers (full request key essential; contained request_id derived)
reader inputs (the artifact itself is fetched; nothing reader-side is hidden)
timestamps/nonces (record metadata timestamps — audited in the loop; the
  artifact key suffix behaves as a nonce and is essential)

## HONESTY LAWS
No field is classified by assumption — every classification is backed by an
ablation run. The minimal export is canonical, not compressed: nothing is
rebuilt or inferred beyond the frozen formulas. Removing an essential field
must REFUSE; masking or skipping would be fabrication. No repair path.

## GATES
G1 field enumeration complete (nothing unaudited)
G2 classification measured per field (loop A)
G3 canonical minimal export fully reconstructs (18-equivalent checks)
G4 removing every essential field refuses (loop B)
G5 no hidden origin/runtime/env value required (gate 7 audit)
G6 fresh node: three files only, twice, identical
G7 browser (standing order): records + artifact fetched live
G8 trace + commit + receipt + memory + report

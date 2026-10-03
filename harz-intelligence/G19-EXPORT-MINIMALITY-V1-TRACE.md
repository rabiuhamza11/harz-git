# G19 STATE-EXPORT MINIMALITY AUDIT — TRACE (2026-10-03)

Contract: G19-EXPORT-MINIMALITY-V1-CONTRACT.md (frozen b648223 before
build; anchor 9e00573). Chain: A+B -> conflict -> C -> resolution ->
creation -> reader (the G18 records, SEALED-STATE-2). No origin changes.
Every classification below is MEASURED by ablation, never assumed.

## THE MIN-VERIFIER (built this gate)
g18-independent-node/min-verifier.js: reconstructs the complete lineage
from a minimal schema, ignoring all extra fields. Root of trust: the
mission receipt chain — every task receipt is RECOMPUTED from content by
the frozen formulas, chained, and compared to the sealed record receipt.
No origin-supplied derived value is ever compared field-to-field. Zero
process.env reads. No repair path. Fresh node: g19-fresh-node/ with
EXACTLY three files (frozen-reader.js, min-verifier.js, minimal-state.json).

## ABLATION LOOP A — 194 leaf fields of the full export, each removed once:
145 removals VERIFIED (field not essential) — 49 removals REFUSED
(essential). Empirical classification (measured + frozen-formula reasoning):

ESSENTIAL STATE (49 instances — removal refuses):
  export.origin (transport); record.id + record.receipt (the seal) x2;
  per task: id, type, state; fixture tasks: answer + fixture_id;
  refused task: refusal text; compose task: instruction;
  answer.evidence[].source_task (order — sealed via the prompt);
  answer.delivered_children[].mode + .player_url (the artifact key);
  conflict.unresolved_claims[].source_task;
  resolution.resolution_from[] + resolution_sources[].source_task +
  resolves_conflict[].source_task (the designation refs).

DERIVED STATE (proven removable — recomputable + cross-sealed by the
chain): every task.receipt (fixture/refusal/compose — recomputed and
sealed); claims_sha256 and answer_sha256 everywhere; source_receipt;
the 24-hex request_id inside the artifact key (derived from the
reconstructed prompt; only its 12-hex delivery suffix is essential).

DISCLOSURE METADATA (not needed for reconstruction; retained for humans
and auditors): goal, pattern, plan_reason, status, created, law,
sovereign, conflict_detected, external_calls (sovereignty counts),
created_what/law/provenance/provenance_law/extraction_law/acceptance_law/
resolution_law/next_lawful_step texts, bundle_id, delivered, modes.

REDUNDANT/CACHE (diagnostics): agent_id, backend, latency_ms,
internal_calls, null refusal/error fields, refused_children (empty),
export_id/exported_at/export law header. Timestamps/nonces: 'created'
is disclosure; the artifact key suffix behaves as a nonce and is
ESSENTIAL (measured: the endpoint delivers ONLY on the full key).

## THE CANONICAL MINIMAL EXPORT (minimal-state.json)
The full export stripped to essential state + transport origin:
3,524 bytes vs 12,405 (28%). The COMPLETE lineage reconstructs from it:
11/11 checks — conflict, acceptance laws, cross-record lineage edge,
prompt, request_id == artifact key prefix (sealed), artifact re-fetch,
frozen Vision V1 + iTXt readers, BOTH mission receipt seals verified
over independently recomputed receipts.

## ABLATION LOOP B — 50 fields of the minimal export, each removed once:
49 refused, 1 survived (export_id — a harness label, then removed from
the canonical file as disclosure; the stripped canonical re-verified
11/11). Every essential removal forces honest refusal. Confirmed.

## NO HIDDEN STATE (gate 7)
The min-verifier uses ONLY: the frozen formulas (sha256 chains, receipt
formulas, claims extraction, prompt/request_id, utf8-of-latin1 image sha,
mission chain), the frozen reader file (committed verbatim), and one
HTTPS artifact fetch built from the exported origin + essential key.
Zero env reads (grep-verified), zero origin memory, zero runtime state.

## FRESH NODE + DETERMINISM (gate 9)
Three files, new directory, run twice: byte-identical, VERIFIED 11/11.
The full export also reconstructs on the fresh node (extra fields
ignored by construction).

## ROLE-REF SEAM PROBE (the audit's one theoretical observation)
Role refs (which claim conflicts, which act resolves) never enter a hash
formula. Two consistent-reassignment probes were attempted; BOTH refused:
record 1's conflict is structurally pinned (only two verified answers
exist to cite), and the acceptance laws + cross-record sha edge + the
prompt-sealed evidence order collapse the role space to the true
assignment. In THIS topology the roles are effectively sealed by
structure + laws. Residual observation for a future gate: in a richer
topology (more verified tasks than roles), role refs remain
law-constrained but not hash-sealed — recorded as the candidate next
boundary, disclosed, not fixed (any seal change touches frozen formulas
and needs Dad's explicit order).

## BROWSER (standing order)
The resolution mission record fetched live: origin serves exactly the
sealed state (fixture_ids, receipts, evidence, resolution structure).
The artifact endpoint was fetched live by the verifier itself (its only
network access) and had been browser-verified in G18 (identical receipt,
image sha 6d5eda75..., 8 checks green).

## GATE SUMMARY
G1 enumeration: 194 leaf fields, nothing unaudited
G2 classification measured: loop A — 49 essential / 145 non-essential
G3 canonical minimal export reconstructs 11/11 from 3,524 bytes
G4 every essential removal refuses (loop B, 49/49 + harness label)
G5 no hidden origin/runtime/env value (formula inventory + grep audit)
G6 fresh node: three files, twice, byte-identical verdicts
G7 browser: records live-verified
G8 trace + commit + receipt + memory + this report

## THE RESULT (in the audit's own terms)
HARZ's evidence state has a defined canonical boundary: every fact
necessary for truth reconstruction is sealed in 3.5 KB — the identities,
the content roots (answers, instruction), the lineage refs, the artifact
key, and the two receipt seals. Everything else is derived (and proven
derivable by removal), disclosure, or cache. The mission receipt chain
is the single root of trust: it seals every derived receipt without
carrying them.

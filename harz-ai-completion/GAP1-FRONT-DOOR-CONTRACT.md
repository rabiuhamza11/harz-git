# GAP-1 FRONT DOOR — BUILD CONTRACT (frozen before implementation)

Frozen: 2026-10-06, on Dad's GAP-1 GO. Builds on TASKRECORD V1
(b19fd11) and COMPLETION V1 (af674b6).

## THE ONE JOB

> Any task enters through one front door → one TaskRecord
> emerges → the user can see its lineage.

The front door is the orchestrator/UI boundary around the
frozen capabilities. It is NOT another intelligence engine.

## CONSUMED, NEVER REWRITTEN

TaskRecord V1, G13 typed package, Search, Reasoner, Verify,
Intake, Creation (V1/V2/V3 Studio), Missions executor laws
(G11-G21), G24 continuity, receipts. Zero frozen formulas
touched.

## MECHANICAL CHANGE (disclosed, one only)

The missions executor moves from inline-route code to a
module-level function runMission(plan, goal) — SAME CODE, NEW
CALLER. The missions route calls it exactly as before; the
tasks layer calls it too. This is the no-duplicates-lawful way
to consume the executor (G15 fixtures, G13 handoff, G16
resolution, G21 designation, G24 continuity all live inside
it). Mission behavior byte-identical; regression battery
proves it.

## TASKS LAYER (new, envelope above missions)

POST /api/tasks/v1 {instruction} — the front door.
planTask(instruction), deterministic, three honest shapes:
1. RESEARCH_AND_COMPOSE: "Research X and write me a report"
   → task 1 orchestrate (research clause verbatim), task 2
   compose (composition clause verbatim, evidence_from [1]).
2. INFORMATIONAL: evidence question → single orchestrate task.
3. REFUSED: no plan is guessed (door-level honest refusal).
Execution via runMission. Result mapped into TaskRecord V1
fields; evidence refs parsed from the frozen reasoner format
only (deterministic section addressing, G13 law); lifecycle
states EARNED by real events, never asserted; refusal closes
as CLOSED + verdict='refused' + reason + receipt (Dad's
approved ruling, no separate REFUSED state).
TaskRecord receipt = additive seal over the child chain
(mission receipt chain + instruction sha) — G19 style, no
frozen formula touched.

## ACCEPTANCE (Dad's gate, all three browser/live)

1. "What is the UBA account number used for HARZ Pay bank
   transfers?" → verified informational TaskRecord
   (artifacts=[], receipt, zero external calls).
2. A task HARZ must refuse → CLOSED / refused / reason /
   receipt.
3. "Research X and write me a report." → ONE TaskRecord,
   creation through the same contract, provenance backward:
   REPORT → artifact verification → creation inputs →
   verified claims → evidence refs → source material.
   If that chain is broken anywhere, GAP-1 is NOT passed.

## CONSOLE (front door UI)

/console PWA gains the Task tab as THE front door: one input,
one Run, the TaskRecord rendered with its lifecycle, lineage,
evidence, artifacts, verdict, receipt. Existing tabs remain.
Light theme, PWA, mobile-first — 5-check law applies.

## HONEST LIMITS DISCLOSED AT FREEZE

The frozen creation stack has no dedicated text-report
engine; a report instruction composes through the frozen
studio router (routing disclosed per child). A text-report
creation contract is future work on Dad's word, never a
silent invention inside GAP-1.

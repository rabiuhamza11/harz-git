# HARZ TASKRECORD V1 — THE UNIVERSAL TASK CONTRACT (frozen)

Frozen: 2026-10-06, on Dad's ruling: "GO GAP-2. Freeze the
TaskRecord contract first. Then GAP-1 consumes it."

This is the SPINE of the finish line: HARZ AI → one front door
→ ONE TASK CONTRACT → one orchestrator → capabilities
underneath → verification → receipt → user-visible result.

## 1. THE G12 RULING — RECORDED VERBATIM (Option c)

> Evidence does not merely support an answer; verified
> evidence can become the bound input to a creation artifact.

Consequences, frozen:
- (a) Reasoner wording may evolve WITHOUT becoming the
  architectural boundary.
- (b) Intake refinement is important but FEEDS the universal
  contract; it never defines it.
- (c) Canonical packaging makes evidence→creation a
  first-class, verifiable operation. Evidence→creation is not
  a workaround; it is a named, sealed transition of the spine.

G13's typed package (SOURCE_TASK / SOURCE_RECEIPT / CLAIMS /
CONFIDENCE / PROVENANCE + shas, deterministic section
addressing, zero semantic rewriting) is the verified
mechanism this contract generalizes. It is NOT rebuilt; it is
enveloped.

## 2. THE TASKRECORD FIELDS (minimal, frozen)

task_id        — stable identity of the task
instruction    — the user's words, byte-preserved
input_refs     — inputs the task was scoped to (docs, files,
                uploads, URLs; empty for open tasks)
decomposition — the ordered steps the orchestrator chose
evidence_refs — evidence units used, with provenance
                (source, digest, retrieval trace)
verified_claims— claims that passed verification, each bound
                to its evidence; refusals carried honestly
artifacts      — created outputs, each content-addressed and
                cryptographically bound to its evidence
                (empty is LAWFUL for informational tasks)
verdict        — the verification judgment
sovereignty    — external-call count + sovereign/offline state
receipt        — the seal over everything above

## 3. THE LIFECYCLE (states are EARNED, never skipped)

RECEIVED
→ DECOMPOSED
→ EVIDENCE_GATHERED
→ VERIFIED
→ CREATED
→ ARTIFACT_VERIFIED
→ CLOSED

LAWS:
1. NO CLOSED WITHOUT A RECEIPT. A receipt is the terminal
   state's precondition, never its decoration.
2. For purely informational tasks, artifacts = [] LAWFULLY;
   the verified answer itself carries the value; verdict +
   receipt still required to CLOSE.
3. For creation tasks, the artifact joins the SAME provenance
   chain: the artifact must cryptographically bind back to the
   evidence it was created from. If the evidence changes, the
   artifact's provenance NO LONGER MATCHES — and that mismatch
   must be deterministically detectable (shas at both ends;
   verification recomputes, never trusts stored seals alone).
4. A task may terminate in REFUSED instead of CLOSED —
   refusal is an OUTPUT, not an error, and still requires its
   own receipt (carried standing law; flagged for Dad's
   confirmation as an explicit state, currently modeled as
   CLOSED with verdict='refused' + reason).
5. States transition on EVIDENCE of the transition (creation
   V1 status-machine law: each state earned by a real event,
   never asserted).
6. The full lineage for a research→creation task is exactly:
   instruction → decomposition → evidence → verified claims →
   creation inputs → artifact → verification → verdict →
   receipt. One TaskRecord may carry this whole lineage, or
   child TaskRecords chain under a parent — but the chain must
   be reconstructable from the record alone (G19 minimal
   export law).

## 4. WHAT TASKRECORD V1 DOES NOT CHANGE

Frozen foundations are enveloped, never modified:
Reasoner-1.1.6, Search-1, arith-2, code-1, Verify-1, receipts,
frozen readers, G13 evidence package, G17 lineage, Authority
Wall v1. The TaskRecord is the ENVELOPE above them all.

## 5. PILOT INSTANCE — TASKRECORD-0001 (real, live, Oct 6)

The browser-tested UBA question through /console, mapped as
the FIRST REAL INSTANCE of the universal contract:

task_id:         TASKRECORD-0001
instruction:     "What is the UBA account number used for
                 HARZ Pay bank transfers? Cite your sources."
input_refs:      [] (open task, corpus-scoped)
decomposition:   [research: entity-value lookup]
evidence_refs:   [{source: "HarzPay Onboarding — Get Started",
                  document_id: 10470,
                  evidence_digest: 11d48e502127631811d48e50,
                  retrieval: [s1]}]
verified_claims: [{claim: "UBA account number 2034326424",
                  binding: verbatim-from-evidence, s1}]
artifacts:       [] (informational — lawful empty)
verdict:         high confidence — value extracted verbatim
                 from evidence by harz-search-1, no generation
sovereignty:     EXTERNAL CALLS: 0
receipt:         b80824d7dbb822f8f46c76e5bea5c4979ae45f
                 912a2f6463bc06042d3e33c5a2
lifecycle:       RECEIVED (chat ask, /console)
                → DECOMPOSED (deterministic research plan)
                → EVIDENCE_GATHERED (doc 10470, rank 1)
                → VERIFIED (value-guard, verbatim match)
                → CREATED (answer assembly, artifacts empty)
                → CLOSED (receipt emitted, all states earned)

This instance proves the informational path of the contract
against a LIVE verified answer.

## 6. NEXT (on Dad's Go)

GAP-1: the front door consumes TaskRecord V1 — /console
becomes the single entry: any task in, a TaskRecord (or
honest refusal receipt) out, one lineage visible to the user.
Creation-path pilot (research X → write report) follows as the
first (c)-ruled composition through the front door.

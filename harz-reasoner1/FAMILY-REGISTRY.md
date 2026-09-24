# HARZ MODEL FAMILY v0.4 — Registry & Provenance

Gate: v0.4 — sovereign model family. Date: 2026-09-24. Owner: HARZ.
Principle: not five copies of one weak engine — specialized sovereign engines
built around what HARZ can prove, coordinated by the orchestrator, measured by
the frozen benchmark.

## Capability Registry (as deployed in the router)

```
harz-reasoner-1    reasoning: limited | arithmetic: unsupported | coding: unsupported | evidence_extraction: strong | refusal: supported          | generative: unsupported
harz-reasoner-1.1  reasoning: limited | arithmetic: unsupported | coding: unsupported | evidence_extraction: strong | refusal: supported+guard | generative: unsupported
harz-code-1        code_analysis: strong | coding: template-only | generative: template-only
harz-search-1      retrieval: strong | ranking: strong
harz-verify-1      claim_checking: strong
harz-planner-1     task_decomposition: strong
harz-embed-1       embedding: strong
reason-core        all: supported | external: true   (adapter — fallback only)
reason-fallback    all: supported | external: true   (adapter — fallback only)
```

The router consults this registry. It never assumes a model can do everything.

## Family provenance (all HARZ-owned, zero external)

| Model | What it does | Provenance |
|---|---|---|
| HARZ-Planner-1 | deterministic task decomposition (search/fetch/chain/code/reason/verify steps) | HARZ-authored rule engine (family-runtime.js), no training data |
| HARZ-Search-1 | re-ranks HARZ Search results: IDF-weighted coverage + title match + domain trust | same IDF weights as Reasoner-1 (dataset digest 565a2948...2afe) + HARZ-authored scoring rules |
| HARZ-Verify-1 | splits answers into claims, checks each against evidence by verbatim quote or IDF term overlap; verdict per claim | HARZ-authored heuristics, documented limits (term overlap, not semantic entailment) |
| HARZ-Code-1 | static code analysis (http://, eval, secrets, brace balance, await-without-try) + template generation from a HARZ-authored 3-template library (NG phone validation, fetch-with-timeout, SHA-256 hex) | HARZ-authored; template library is hand-authored config, honestly labeled template-only, NOT learned generation |
| HARZ-Reasoner-1 / 1.1 | evidence extraction + extractive composition + calibrated refusal | see REASONER1-CARD.md / REASONER11-CARD.md |

## Production routing (Dad's v0.4 policy, deployed)

1. Task classifier (deterministic rules) labels the task: arithmetic, code_generation,
   code_analysis, generative_writing, structured, evidence_qa.
2. Router consults the Capability Registry:
   - HARZ-capable class -> HARZ primary (zero external; sovereign: harz-owned).
   - Registry-declared incapability (arithmetic, generative) -> external adapter,
     recorded as declared_incapable, sovereign: external-assisted.
   - code_generation -> HARZ-Code-1 template match first; miss -> external.
3. Explicit fallback: if the HARZ primary refuses in default routing, the external
   adapter gets ONE attempt; every fallback is recorded (fallback_used, fallback_reason,
   fallback_of). Never silent. Never claim sovereign when external generated.
4. engine=harz and engine=offline remain hard zero-external (verified by death test).
5. Every answer carries: engine, backend, sovereignty, task_class, routing record,
   external_calls count, HARZ-Verify-1 claim check, SHA-256 receipt.

## Frozen benchmark v1.0 — v0.4 family results (raw)

A external-only: 8/20 @ 2319ms avg, 20 ext calls
B reasoner-1 (frozen): 8/20 @ 487ms avg, 0 ext
C reasoner-1.1: 9/20 @ 424ms avg, 0 ext
F production router: 11/20 @ 1393ms avg, 20 ext calls
Offline death test: 2/2, 0 ext calls, receipts issued

Key finding for policy review: the family router (F) is the strongest scorer (11/20)
while handling 10 of 20 cases fully sovereign. Fallback on refusals recovers some
passes (K3, H1, N2) but surrenders HARZ's anti-hallucination refusals to the external
adapter on those cases and costs latency + external calls. Alternative for review:
restrict fallback to registry-declared incapabilities only (never refusal-triggered).

Raw transcripts: bench-{A,B,C,F,offline}-v04-raw.json (this directory) and the
v0.3 records bench-{A,B,offline}-raw.json.

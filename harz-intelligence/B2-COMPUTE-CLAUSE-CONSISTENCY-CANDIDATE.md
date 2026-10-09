# B2 — COMPUTE-CLAUSE CONSISTENCY — INVESTIGATION + CANDIDATE (built + gated, awaiting Dad's ruling)

**Deployed:** Oct 9, 2026, worker version `24abc4f5-73ae-4b50-b5f5-38a2d1f7cae5`
**Scope:** orchestration layer ONLY (worker.js, two sites: chat orchestrate + orchestrateJob). Sealed layers untouched: search1.js v1.2, the F-GAP4-2c clause-split machinery's per-clause routing/disclosure/receipt, the frozen registry, all frozen batteries.
**Dad's instruction:** establish the failure boundary and reproduce the inconsistency first; do not assume the answer is a timeout raise.

## Q1 — Why equivalent compute clauses alternate between grounded refusal and disclosed unavailability

REPRODUCED, on the identical flagship clause ("compute the Naira value of 2,000 GDEG at the documented rate"), three distinct states:

1. **Grounded refusal** (healthy model): the per-clause packet carries no documented rate → the reasoner refuses to manufacture one ("the 30,000 expectation is not evidence of a conversion rate" — sealed F-GAP4-2c evidence).
2. **backend_timeout** (slow model): the model call exceeds the 8s ceiling → disclosed unavailability (this morning's 06:36 run, before the outage).
3. **backend_401** (expired credential, today): disclosed unavailability, 6/6 repro runs identical.

The alternation driver is the MODEL-CALL layer's health and latency, not clause extraction and not aggregate verification — the CPU packet step succeeded every single time (coverage 1, 44 candidates). The compute clause class (arithmetic) is model-dependent by the frozen registry ("arithmetic=unsupported" → external); only explicit-number exactArithmetic is sovereign CPU.

## Q2 — The variation's origins: model-call behavior (primary) + a second, separate defect found

**Second defect (recorded as finding B3, NOT touched — sealed layer):** the compute clause's per-clause retrieval composes a JUNK packet — retrieved titles include "Peter Obi...", "ASP.NET Boilerplate", "Jest", "LocationIQ"; NO GDEG rate document (doc 10066 carries "1 GDEG = ₦15"). So even a healthy model can never ground the rate through the chat clause path, and a computed 30,000 NGN (the TASK-H T2 gold) is unreachable there. The clause-variant machinery lives inside sealed search1.js (v1.1 clause variants) — investigating it needs Dad's authorization; it is NOT this candidate.

## Q3 — The correction, confined to the responsible layer

The asymmetry was IN the orchestration layer: the sealed F-GAP4-2c machinery fired clause-split ONLY on `backend_timeout`. A FAST model failure (401 expired key, 429, 5xx) bypassed the split entirely and degraded the WHOLE composed answer — swallowing parts the frozen CPU specialists could answer (account, URL). Failure speed was deciding whether answerable parts survived.

Minimal correction: trigger the SAME sealed machinery on ANY `backend_*` failure (`backend_timeout` or `backend_<http status>`). Per-clause routing, per-clause honest disclosure, one receipt — all unchanged. Two sites patched (chat + job paths); the stream path remains unhocked (known F-GAP4-2c limitation, unchanged, disclosed).

## Q4 — Identical inputs, stable outcomes

Pre-fix under 401: 6/6 identical whole-answer degradations (account + URL parts swallowed).
Post-fix: 5/5 post-propagation runs (one stale-edge run during deploy propagation, disclosed) produce the IDENTICAL honest composition: 3 parts, account answered (2034326424, provenance line intact), estate URL part answered, compute clause disclosed per-clause ("disclosed on the record, not masked"), answered 2/3, aggregate verdict all-supported. Both failed model attempts are ledgered (ext 2 — failed attempts counted, never hidden).

## Q5 — Missing conversion rates produce honest refusals, never invented calculations

In every state — healthy, slow, dead — the compute clause refused or disclosed. The 30,000 expectation never leaked into an answer. Preserved.

## Gates

1. Repro captured pre-fix (6/6 whole-answer degradation under 401).
2. Post-fix composed flagship: parts survive, 2/3 answered, per-clause disclosure, aggregate all-supported, determinism stable (5/5).
3. Full frozen regression bar GREEN under the outage (all batteries are CPU-only sovereign): agents 13/13, test10 5/5 + 5/5, test8 5/5 + 5/5, im1 24, vs1 30, creation1 24, sem1 12/12, ter1 12/12, semvid1 16/16, router1 15/15, m2 17, m3 16, m4 16 — 0 ext.
4. Residual variance under a HEALTHY model (grounded refusal vs timeout) is free-tier latency variance — a documented model-call limitation, consistent with Dad's F-GAP4-2c ruling options; no timeout raise was made.

## Disclosures

**D1 — OPERATIONAL: every OpenRouter key in the vault is EXPIRED.** The deployed Worker secret AND the harz-ai wrangler.toml key both return 401 "API key expired" on real completion calls. Note: OpenRouter's /models endpoint is PUBLIC and cannot validate a key (an initial false-positive check is documented here). A secret rotation to the harz-ai key was attempted and verified NOT to fix (same expired family). The reasoner layer is in honest disclosed-unavailability until Dad mints a fresh free-tier OpenRouter key (zero-budget law preserved). The outage did NOT block this candidate: today's fast-fail evidence was captured on real 401s, and the frozen bar is CPU-only.

**D2 — Finding B3 opened (not built):** compute-clause junk-packet retrieval (clause variants fail to reach the GDEG rate docs). Sealed layer; needs Dad's authorization. Until then, the healthy-model outcome for this clause remains a grounded refusal — honest, but the computed 30,000 NGN gold stays unreachable in the chat clause path.

**D3 — minor coverage note:** harz-arith-2 refuses word-form operators ("Calculate 25 times 80" → malformed-expression refusal; symbol forms parse). Deterministic honest refusal; no action taken.

## Awaiting ruling

**PROMOTE** → B2 closed (failure-triggered clause-split frozen; the credential outage is operational, separate) — findings B3 (clause packet junk) and the operational key renewal remain open items. Or **REVERT** → redeploy d968c4c2.

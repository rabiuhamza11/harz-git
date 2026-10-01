# HARZ-INTELLIGENCE v0.2 — SOVEREIGN MODEL INTERFACE + MULTI-AGENT CONTRACT
## FROZEN BEFORE IMPLEMENTATION — October 1, 2026, ~14:05 WAT
## Dad's order: "Go" (roadmap phase v0.2, confirmed Sept 24: "v0.2 = HARZ Model Interface (generate/reason/tool_call/structured_output/embed; router hides providers) + multi-agent")

**Executor status at freeze: NOT IMPLEMENTED. Committed to the vault before any build code is written.**

## Constitutional problem
HARZ has proven sovereign creators (V2-A..E, V3 Studio) and a temporary external model adapter (OpenRouter/Nemotron, dev dependency only, per the Sept 24 directive: adapters only, never an architectural dependency). What is missing is the SINGLE SOVEREIGN INTERFACE every HARZ system calls for model work — the layer that hides providers behind one router, labels what is sovereign and what is temporary, and refuses to fabricate.

## Pipeline (verbatim intent)
request {method, text, params, seed} -> interface validation -> router (capability routing, DISCLOSED; provider identities HIDDEN, adapter class labeled) -> adapter execution (sovereign reference | external temporary) -> deterministic provenance (text sha -> output sha) -> request record in KV -> receipt -> console (PWA, light theme)

## MI laws
1. ONE INTERFACE, FIVE METHODS: generate, reason, tool_call, structured_output, embed. Uniform response envelope {ok, method, adapter_class, model_version, external_calls, latency_ms, output, provenance, states, receipt}. Every HARZ system calls THIS, never a provider.
2. ROUTER HIDES PROVIDERS: the response never names the external provider or model; only the adapter class ('external-temporary' or 'sovereign-reference') is disclosed. Routing decisions are disclosed, never silent. Injection in the text cannot alter routing or tool selection.
3. SOVEREIGN REFERENCE ADAPTER: deterministic in-worker implementations (zero external calls). generate = seeded reference composition; reason = evidence-chained extraction (answers cite the text bytes, never invented facts); tool_call = deterministic match against ONLY the declared tools; structured_output = schema-conforming deterministic extraction (unknown fields stay 'extraction_unknown'); embed = deterministic hash-based vector. Every local output is labeled 'deterministic reference composition, not a trained model'. Unknown stays unknown.
4. EXTERNAL TEMPORARY ADAPTER: the existing UNCHANGED ADAPTERS.openrouter, wrapped, labeled, temporary per the Sept 24 directive. When unavailable (no key, network down, simulate) the router falls back to the sovereign reference with the fallback DISCLOSED, never silent.
5. HONESTY LAW: no fabricated completions. Adapter failure = honest labeled failure. Zero-length output refused. Claimed states derived from real execution, never asserted. NOT FINISHED says NOT FINISHED.
6. DETERMINISM LAW: the sovereign reference adapter is deterministic (same text+seed -> identical bytes); replay mismatch = failure. The external adapter is labeled non-deterministic (disclosed).
7. PROVENANCE + INTEGRITY: text sha -> output sha -> request record (KV) -> receipt. Tampered records, changed hashes, claimed-state lies, and fabricated requests all fail honestly.
8. Creation-vs-evidence inherited: an MI output is a composition, NEVER evidence; a request demanding real evidence is refused at the evidence boundary BEFORE any completion.
9. The MI ships ZERO parsers and grades nothing; it composes and chains provenance.

## Multi-agent laws (on the MI)
10. AGENT REGISTRY: agents registered in KV with name, role, methods, optional tools. Duplicate name+role = honest refusal. The registry starts empty — missions against an empty registry fail honestly, never auto-fabricate an agent.
11. MISSION LAW: a mission assigns the task to agents (explicit agent list, or deterministic role matching, routing DISCLOSED — the same routing law as the Studio). Every agent call goes THROUGH the MI (never a direct provider call). The mission receipt chains EVERY agent call: request_id, output sha, states. receipt_emitted = every agent call completed OR honestly refused at a boundary (refusal disclosed, never masked). A failed or fabricated agent withholds the receipt.
12. BROWSER + PWA: console surface is a PWA (manifest, service worker, icon, light theme) per the ecosystem standing law; browser test is part of the gate.

## Scope
IN: one route family /api/intelligence/v1/ (mi, agents, mission, console + PWA assets), router, sovereign reference adapter, wrapped external adapter, agent registry, missions, 12 contract cases + 18 death tests harness.
OUT: training models, new parsers, changes to ANY frozen law or creator, provider identities exposed to callers. A real HARZ-owned model (v0.3 HARZ-Reasoner-1) swaps in behind THIS SAME interface.

## Dad's 18 death tests (frozen now)
DT-1 empty text | DT-2 oversized text | DT-3 adapter generation dependency failure | DT-4 corrupted request record at read-back | DT-5 response integrity lie (output sha mismatch) | DT-6 wrong declared mission totals (agent count lie) | DT-7 mission routing contradiction (claimed agent vs record) | DT-8 changed output hash | DT-9 nondeterministic reference replay | DT-10 prompt injection (routing/tool selection obeyed by nothing) | DT-11 external adapter unavailable -> disclosed fallback | DT-12 empty output refused | DT-13 claimed states contradict the store | DT-14 fabricated agent (mission chains an unregistered agent) | DT-15 evidence demand refused BEFORE completion | DT-16 false completion (claim_early) | DT-17 unknown request/agent honest not-found | DT-18 mission receipt before agent completion withheld

## 12 contract cases
MI-1 five methods + uniform envelope | MI-2 provenance chain (text sha, seed, output sha, request id) | MI-3 router hides providers (adapter class only) | MI-4 deterministic reference replay | MI-5 structured_output conforms to declared schema | MI-6 tool_call selects ONLY from declared tools | MI-7 embed deterministic and labeled | MI-8 reference outputs labeled honestly (not a trained model) | MI-9 injection = data | MI-10 external down -> disclosed sovereign fallback | MI-11 agent registry honest (duplicates refused, empty honest) | MI-12 mission receipt chains every agent MI receipt

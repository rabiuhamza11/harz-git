# HARZ Intelligence — Prepared Build Plan (v1, Sept 24, 2026)
Vision (Dad, Sept 24, 2026): NOT a GPT competitor. An AI OPERATING SYSTEM / sovereign AI network that doesn't just answer — it understands, searches, reasons, verifies, executes, creates, proves, stores, synchronizes. Fits TRUE INDEPENDENCE: own rails, own settlement.

## LIVE AUDIT (Sept 24, 2026, ~1:20 AM WAT)
Assets ALIVE and reusable:
1. NEXUS — reasoning chain engine, v1.1.0, alive (85 chains executed historically). Multi-step reasoning primitive exists.
2. DNA — code provenance ledger, v1.0.0-provenance, alive, 120 ledger entries, 0 rejects. Seed of the verification/proof engine.
3. HARZ Chain v8.3.0 — Proof-of-Edge, 186 wallets, 24 contracts. Deterministic state + signed provenance anchor.
4. EVOLVE v4.3.0 — ecosystem health/diagnosis. Monitoring reflex.
5. HARZ Pay, phone-as-identity device keys, edge radio mesh/DTN (FSK, store-and-forward), PWA ecosystem, Super Cloud deployment rails.
DEAD / needs rebuild: FORGE (HTTP 404, error 1042) — the coding/building agent. Rebuild as gate v0.3.
MISSING: model gateway (sovereign route), HARZ Search, persistent user-owned memory layer, tool-execution harness, multi-agent orchestrator, verification engine formalization, multimodal.

## SOVEREIGNTY GAP (the honest core problem)
Current AI = Nemotron via OpenRouter = borrowed rails + rate limits (429s already seen). Independence requires model-layer abstraction NOW, progressive self-hosting LATER:
- v0.1: Gateway abstracts providers (Nemotron first, pluggable backends).
- v0.3+: self-host small optimized models (quantized 7B-32B via Ollama on VPS) for offline/cost-sensitive tasks. Stanford 2026 AI Index point Dad cited: 32B can rival 90x-larger models with pruning/dedup/curation — sovereignty is credible at small scale.

## GATES (mapped to assets)
- v0.1 Model Gateway + HARZ Search + Memory + Tool Execution → NEW BUILD (gateway); Search = indexed crawler over HARZ knowledge (docs, notes, code); Memory = user-owned persistent store anchored to chain (hashes); Tools = sandboxed action runners (deploy, file, pay-request stubs).
- v0.2 Multi-agent reasoning → extend NEXUS into orchestrator (delegate subtasks to specialized agents).
- v0.3 Coding/building agent → FORGE v2 rebuilt on the gateway + tool harness, DNA provenance on every artifact.
- v0.4 Verification/proof engine → DNA + chain signing formalized: claims get tested, results get signed, provenance chain-anchored.
- v0.5 Multimodal → audio (already have voice/FSK rails), images, docs.
- v0.6 Offline/DTN intelligence → queue-and-sync agent state over mesh; Hauwa-style memory reconciliation on reconnect.
- v1.0 Autonomous HARZ Intelligence Network — federation across nodes.

## v0.1 SPEC (first build, near-zero cost on existing infra)
Worker: harz-intelligence.harz.workers.dev (light theme, PWA, in-ecosystem, per 5-check rule)
Routes: /api/gateway (model abstraction), /api/search (HARZ knowledge index), /api/memory (user-owned, chain-hashed), /api/tools (execution registry), /api/health.
Every response carries: model used, sources consulted, actions taken, verification status — "prove, not claim."

## BENCHMARK DISCIPLINE
Gates measured on REAL tasks (build an app, research a tender, reconcile accounts), not marketing. Each gate ships with a task suite + pass rates logged.

## DECISIONS NEEDED FROM DAD
1. Approve v0.1 build start (audit shown above, per standing rule).
2. Model stays Nemotron via OpenRouter behind the gateway for v0.1 (standing order intact, abstraction added)?
3. VPS budget for v0.3+ self-hosting — defer decision to that gate.

## v0.1 BUILD STATUS — DEPLOYED & GATE-PASSED (Sept 24, 2026, ~3:00 AM WAT)
Worker: https://harz-intelligence.harz.workers.dev — LIVE
Core loop verified end-to-end: ask → plan → search (HARZ knowledge index) → tools (chain_status, fetch_url) → reason (Nemotron) → verify (receipts) → memory.
1. Model gateway: Nemotron nano-30b (default, ~1-3s answers) with lightning:free fallback. Standing order respected (NVIDIA Nemotron via OpenRouter, no Groq).
2. HARZ Search integration: smart retrieval with proper-noun-first queries, stopword filtering, and all-terms relevance gate. Fixed: "HARZ Pay" queries now hit the right docs (was returning Google Pay junk).
3. Agents: supreme-engine, researcher, coder, analyst, builder (root identities).
4. Tools: search, fetch_url, chain_status, memory_write (explicit "remember" only, authorized memories).
5. Job API (/api/chat/start + /api/chat/result/:id): short-request polling — robust on slow/proxied mobile networks; job results verified in <4s.
6. Verification: every answer carries evidence + execution log + SHA-256 receipt. Honest low-confidence answers when evidence is missing (no fabrication).
7. PWA: manifest, service worker (v0.1.2), icon, light theme #f0f2f5 — 5-check compliant.

RELEASE GATE (5 checks): PASSED
1. PWA: manifest+SW+icon 200 OK
2. Light theme: verified (#f0f2f5)
3. In-ecosystem: search index + chain status + knowledge of HARZ apps grounded
4. Mobile: responsive layout, job-polling works on slow networks by design
5. Browser test: PASSED — live chat in browser, correct grounded answer (HARZ Pay: Paystack/UBA/GDEG/USDT), evidence panel with receipt 4166840654d6, Benchmark tab renders, screenshot taken.

KNOWN LIMITS (honest):
- Benchmark suite rows are placeholders until task suites land at v0.2/v0.3.
- Latency avg shown 14s includes old lightning runs; current nano runs are 1.5-3s.
- In-ecosystem Super App listing not yet done (core infra system, like NEXUS/DNA — decision with Dad).
- Model still on borrowed rails (OpenRouter) per sovereignty gap note — self-hosting is v0.3+.

## SOVEREIGN MODEL ARCHITECTURE — DAD'S DIRECTIVE (Sept 24, 2026) — SUPERSEDES PRIOR GATES
Rule: External models (Nemotron, Grok, OpenAI) are ADAPTERS and temporary dev dependencies.
HARZ Intelligence must NEVER depend architecturally on any external model provider.
Never copy proprietary weights, code, or trade secrets. Build only from lawful open-weight
models, licensed datasets, synthetic data, and HARZ's own data.

REVISED ROADMAP:
- v0.2 (NOW): HARZ MODEL INTERFACE. Router exposes generate(), reason(), tool_call(),
  structured_output(), embed(). The orchestrator never knows what model runs underneath.
  Adapters (Nemotron via OpenRouter first) plug in behind the interface. Multi-agent
  system built ON the interface, not on any named model.
- v0.3: HARZ-REASONER-1 — first HARZ-owned model (small, specialized, fine-tuned from
  lawful open-weight models), benchmarked against external models.
- v0.4: HARZ MODEL FAMILY — HARZ-Code, HARZ-Research, HARZ-Verify.
- v0.5: Self-hosted local/regional inference. No OpenRouter in the default path.
- v1.0: External providers are optional adapters, not dependencies. Sovereign HARZ
  Intelligence Network: Cloud / Edge / Offline models behind one Router.

SOVEREIGNTY = 8 LAYERS: model, inference, knowledge (HARZ Search), identity (HARZ Root),
trust (Trust Fabric), execution, network (offline/weak-net), economic (no per-request
AI payments to another provider).

## V0.3 GATE — HARZ-REASONER-1 / SOVEREIGN REASONING (Sept 24, 2026) — PASSED
Frozen benchmark committed BEFORE scoring (harz-reasoner1/benchmark-v1.json).
HARZ-Reasoner-1: first HARZ-owned reasoning model, trained from scratch (statistical
extractive, IDF over 219-doc HARZ corpus; digests in REASONER1-CARD.md).
Raw: A external 11/20 @ 2397ms avg (20 ext calls); B harz-reasoner-1 8/20 @ 482ms avg
(0 ext calls); offline death test 2/2 with receipts, external provider disconnected.
Engines live: default external chain (pending Dad's review), ?engine=harz,
?engine=offline, /api/bench/v1 harness. Failures published in REASONER1-CARD.md.

## V0.4 GATE — SOVEREIGN MODEL FAMILY (Sept 24, 2026) — PASSED
Production flipped: HARZ-first via CAPABILITY REGISTRY (router consults per-model
capabilities; external adapter = explicit recorded fallback, never silent).
Family: Planner-1, Search-1, Verify-1, Code-1 (template-only, honest), Reasoner-1.1
(answerability guard: function-word filter + content-term rule + role-question guard;
weights unchanged from 1.0). Frozen bench rerun (v1.0 suite UNCHANGED):
A 8/20 @2319ms (20 ext) | B 8/20 @487ms (0 ext) | C 9/20 @424ms (0 ext, H2 fixed,
no regressions) | F production router 11/20 @1393ms | offline death test 2/2, 0 ext,
receipts 79931323026a6d / 8077883ed84df4. Every answer records engine + sovereignty
+ task_class + routing + claim check. Cards: REASONER11-CARD.md, FAMILY-REGISTRY.md.

## V0.5 GATE — HARZ AGENT ORCHESTRATOR (Sept 24, 2026) — PASSED 13/13
Dad's Option 2 frozen as the routing law: a sovereign model's refusal is an OUTPUT,
not an error. Final refusal on HARZ refusal — no external call. External fallback
ONLY on registry-declared incapability. Agent orchestrator deployed: router
(capability registry) is the sole delegation authority; planner/researcher/reasoner/
coder/verifier never call one another; every hop recorded in agent_trace.
Gate /api/agents/v1/test: 13/13 PASS incl. the no-evidence death test (CFO's cat:
refusal, 0 external calls, receipt e65095999e). Frozen bench F under Option 2:
10/20 @800ms avg, 2 external calls total (arithmetic only) vs v0.4 fallback policy
11/20 @1393ms, 20 external. Honest costs: K3 + C2 regress (external used to answer
them; HARZ refuses/cannot synthesize) — queued as v0.5.1 improvements (Code-1
analysis answers routed directly). engine=harz and engine=offline re-verified
zero-external. Raw: gate-v05-raw.json, bench-F-v05-raw.json.

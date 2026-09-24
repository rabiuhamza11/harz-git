# HARZ Intelligence Core v0.3

Sovereign AI intelligence worker. Live: https://harz-intelligence.harz.workers.dev

Core loop: ask → plan → search (HARZ Search index) → tools (chain_status, fetch_url) →
reason (role-routed through the HARZ MODEL INTERFACE — provider-blind) →
verify (SHA-256 receipt on every answer) → memory (user-owned, explicit "remember" only).

v0.2 — HARZ MODEL INTERFACE: the orchestrator and agents call ROLES via five
interface calls (generate, reason, tool_call, structured_output, embed) and never
see a provider name. External models are adapters only. harz-embed-1 is the first
HARZ-owned backend (local deterministic embedder, zero external provider).
/api/models shows the interface; /api/hmi/test exercises all five calls with a
sovereignty check (PASS = no provider name above the adapter layer).

Routes: /api/chat/start + /api/chat/result/:id (job polling), /api/chat/stream (streaming),
/api/chat (JSON), /api/agents, /api/models, /api/hmi/test, /api/health, /api/bench, / (PWA shell).

Bindings: MEMORY (KV), SEARCH_SVC (harz-search), CHAIN_SVC (harz-chain-v2).

v0.3 (Sept 24, 2026): HARZ-Reasoner-1 first HARZ-owned reasoning model — sovereign (0 external calls), frozen benchmark + raw results in harz-reasoner1/REASONER1-CARD.md; offline death test 2/2 with receipts. Prior: v0.2 5-check gate PASSED (browser-tested: v0.2.0 header,
grounded answer + receipt c059566c39f1, benchmark tab, light theme, PWA 200s).
Honest limits recorded in PLAN.md. Next: v0.3 = HARZ-Reasoner-1, first HARZ-owned
reasoning model, benchmarked against external adapters.

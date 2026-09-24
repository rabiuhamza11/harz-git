# HARZ Intelligence Core v0.1

Sovereign AI intelligence worker — the first build of the Intelligence gate.
Live: https://harz-intelligence.harz.workers.dev

Core loop: ask → plan → search (HARZ Search index) → tools (chain_status, fetch_url) →
reason (NVIDIA Nemotron via OpenRouter, nano-30b default, lightning fallback) →
verify (SHA-256 receipt on every answer) → memory (user-owned, explicit "remember" only).

Routes: /api/chat/start + /api/chat/result/:id (job polling), /api/chat/stream (streaming),
/api/chat (JSON), /api/agents, /api/health, /api/bench, / (PWA shell).

Bindings: MEMORY (KV), SEARCH_SVC (harz-search), CHAIN_SVC (harz-chain-v2).

Gate status (Sept 24, 2026): 5-check gate PASSED — PWA, light theme, in-ecosystem,
mobile-ready (job polling), browser-tested (grounded answer + receipt 4166840654d6).
Honest limits recorded in PLAN.md. Benchmark task suites land at v0.2/v0.3.

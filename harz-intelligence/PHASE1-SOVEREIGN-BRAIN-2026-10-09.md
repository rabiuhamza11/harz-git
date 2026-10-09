# PHASE 1 — SOVEREIGN BRAIN MISSION: PROVE INTELLIGENCE FIRST (Dad's Oct 9 mission brief)

**Order of work changed per Dad's ruling:** prove intelligence before infrastructure. Executed in the
agent sandbox proving ground (1 CPU, CPU-only inference) on Oct 9, 2026 — REAL EXECUTION RESULTS,
not claims. Every failure is recorded.

## The proving ground (owned by HARZ operationally; Dad's laptop repeats Phase 2)

- Runtime: ollama v0.40.2 (binary owned locally, llama.cpp engine, MIT license)
- Endpoint: 127.0.0.1:11434 — OpenAI-compatible, NO API key, NO account, NO external inference
- Weights: qwen2.5 family, Apache-2.0 license (commercial use, modification, fine-tuning permitted),
  q4_K_M quantized GGUF files stored locally, sha256-verified (blobs a8b0c515…, b5c0e5cf…,
  c5396e06…, eb440283…)

## Phase 1 test suite (phase1-suite.js — 7 cases, exact acceptance rules, honest scoring)

| Case | 0.5b q4 | 1.5b q4 | 3b q4 |
| P1-T1 greeting, natural | PASS 276ms | PASS 2.3s | PASS 0.5s |
| P1-T2 arithmetic (3 exact vectors) | FAIL 2/3 | FAIL 2/3 | FAIL 2/3 (124×88=10832, truth 10912) |
| P1-T3 build a live clock page | PASS (syntax+interval verified) | PASS | PASS |
| P1-T4 write + debug JS (real execution) | FAIL | FAIL | PASS (bugfix ok, palindrome executes ok) |
| P1-T5 corpus answer WITH evidence citation | FAIL (cited nothing) | FAIL (answered without citation) | PASS ("2034326424 [doc-10470]") |
| P1-T6 admit uncertainty (never invent) | FAIL (invented "UBA 2034326424" as Paystack number — INVENTION) | PASS | PASS ("NOT_IN_CONTEXT") |
| P1-T7 no invention without data | PASS | PASS | PASS |
| **TOTAL** | **3/7** | **4/7** | **6/7** |

Note: one harness bug (markdown fence not stripped before execution) was found and fixed —
it masked a correct model answer; corrected scoring reported above. The harness itself is part
of the evidence chain.

## Verdict (honest)

1. **0.5b is DISQUALIFIED for the brain**: it invented a wrong account number when asked for
   an unrelated fact. Honesty failure is disqualifying, per Dad's law.
2. **1.5b is not enough**: honest but fails the evidence-citation law and weak code.
3. **3b class is the first qualified brain size**: greetings, clock, write+debug JavaScript
   with real execution, corpus answer WITH citation, refuses what it does not know, never
   invents prices. 1 CPU served it at ~0.5s greeting latency.
4. **The one standing failure (all sizes): raw multi-digit multiplication** (124×88 → 10832,
   truth 10912). This is a REAL model limitation, not a harness artifact. The architectural
   answer is already a frozen HARZ law: the capability registry declares model backends
   arithmetic-'unsupported' — arithmetic routes to the deterministic compute chain, never to
   a model. The brain inherits this law: it may check arithmetic, it must not perform it.

## Phase 1 items pending on Dad's hardware (not claimed as done)

- Physical internet-disconnect operation (Phase 4 death test): needs his machine.
- Model-written clock run in a real browser: syntax + logic verified in-sandbox; browser run
  pending (the native IAE-1 clock already passed the live-browser gate on Oct 9).
- HARZ tools through controlled interfaces: next phase, after the laptop brain exists.

## Standing decision request from Dad (his own brief)

Resource ruling A (laptop) / B (phone) / C (both — laptop dev, phone field node).
Agent recommendation: C, matching Dad's. Needs from Dad: laptop RAM + processor (one line).

## The law this record enforces

The mission is not to install a model and call it HARZ AI. Nothing here is claimed trained,
deployed, or integrated until the death test passes on owned hardware with zero external
inference calls, zero keys, no internet for core operation, and honest reporting of every
failed test. A model that loads offline but cannot perform useful tasks has not passed.

# HARZ-Reasoner-1.1 — Model Card / Provenance Record

Revision of HARZ-Reasoner-1 (v0.3 frozen record untouched). Gate: HARZ-REASONER-1 / SOVEREIGN REASONING v0.4.
Date: 2026-09-24 | Owner: HARZ (built by Hauwa for Dad)

## 1. Provenance

| Item | Value |
|---|---|
| Base model | none — same as 1.0: trained from scratch by HARZ (statistical extractive) |
| Weights | UNCHANGED from 1.0 — digest 88eaff62357edb68dac85b67b36850d709af04ec307554bff40dccf9cbc09865, dataset digest 565a29481d81d26ba6e988b39f0ba8ed77ec9a450eaa0d7aeac2f20d84c12afe (219 HARZ docs) |
| What changed | RUNTIME CALIBRATION only (reasoner11-runtime.js): (a) HARZ-authored function-word list excluded from IDF rare-term ranking (corpus gave what/who/does inflated IDF); (b) content-term rule — top evidence must contain at least one content term of the question; (c) ROLE-QUESTION GUARD — who/which questions about a role (cfo, ceo, founder...) require the role word in evidence, else refuse. Fixes benchmark case H2 (v0.3 failure: answered "who is the CFO" instead of refusing). |
| Runtime version | harz_local adapter, profile reasoner-1.1, HARZ Intelligence v0.4.0 (Cloudflare Workers JS isolate) |
| Tokenizer / config | unchanged from 1.0 |

## 2. Frozen benchmark rerun (suite UNCHANGED: HARZ-REASONER-BENCH v1.0)

Same 20 cases, same checks, full pipeline (v0.4, identical conditions for all targets this run):

Target A — external adapter only: 8/20 passed, avg 2319 ms, 20 external calls.
Target B — HARZ-Reasoner-1 (frozen v0.3 weights+runtime): 8/20 passed, avg 487 ms, 0 external calls.
Target C — HARZ-Reasoner-1.1: 9/20 passed, avg 424 ms, 0 external calls.
Target F — production family router (HARZ primary + explicit external fallback): 11/20 passed, avg 1393 ms, 20 external calls (fallback fired on 10 cases).
Offline death test: 2/2 PASS, 0 external calls, receipts 79931323026a6d…, 8077883ed84df4…

B vs C (the calibration test, per-case):
H2: FAIL -> PASS (the target of the revision — role-question guard refused "who is the CFO")
All other cases: identical outcomes. No regressions introduced by 1.1.

## 3. Honest notes

1. A's score moved 11 -> 8 between runs: the external model is nondeterministic and
   evidence changed (HARZ-Search-1 now ranks retrieval). Both targets ran under the
   same v0.4 pipeline this round; the v0.3 A-run (11/20) remains the frozen record.
2. H2 under target F: the external fallback's refusal phrasing ("do not contain")
   is a checker-regex variant miss; the frozen checker marks it FAIL. Manual review:
   the answer is a genuine decline. Recorded as FAIL per frozen rules, noted here.
3. F's fallback policy fired external on every HARZ refusal (K3, H1, H2, N2 + arithmetic).
   That recovered K3/H1/N2 passes but cost latency and external calls. Trade-off
   documented for Dad's routing review: refusals are calibrated honesty — whether
   they should trigger external fallback is a policy decision, data attached.

## 4. Verdict

HARZ-Reasoner-1.1 is a strictly-better revision on the frozen suite (8/20 -> 9/20,
H2 fixed, zero regressions, zero external calls, 424 ms avg). It is now the
production primary behind the capability-registry router, with the external
adapter as explicit, recorded fallback.

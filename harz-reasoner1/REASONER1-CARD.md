# HARZ-Reasoner-1 — Model Card / Provenance Record

Gate: HARZ-REASONER-1 / SOVEREIGN REASONING v0.3
Date: 2026-09-24 | Owner: HARZ (built by Hauwa for Dad)

## 1. Lawful training foundation

| Item | Value |
|---|---|
| Base model | NONE — trained from scratch by HARZ. No external base model, no external weights, no proprietary code or trade secrets. |
| Model type | Small statistical extractive reasoning model (IDF-weighted evidence ranking + verbatim evidence composition + refusal guard). NOT a neural network, NOT a fine-tune of any external model. |
| Training dataset | HARZ Search index harvest — 219 unique documents, HARZ-owned ecosystem content crawled by HARZ Search. Seed queries listed in training-corpus.json. |
| Dataset license | HARZ internal corpus — HARZ-owned content. No third-party licensed data, no scraped third-party corpora. |
| Dataset digest (sha256) | 565a29481d81d26ba6e988b39f0ba8ed77ec9a450eaa0d7aeac2f20d84c12afe |
| Preprocessing | Tokenization (alnum, len>1, lowercase), document-frequency counting, IDF weighting, statistical stopword derivation (df >= 40% of docs -> stopword). |
| Training code | harz-reasoner1/train-reasoner-1.py (committed, deterministic, re-runnable) |
| Model weights | reasoner1-weights.json / reasoner1-weights.js — 1,892-term IDF vocabulary, 1 statistical stopword (harz), HARZ-authored sentiment lexicon, corpus-derived relevance threshold 0.1308 (median title-snippet cosine / 2), confidence bands. |
| Weights digest (sha256) | 88eaff62357edb68dac85b67b36850d709af04ec307554bff40dccf9cbc09865 |
| Tokenizer | HARZ-authored simple tokenizer (lowercase, alphanumeric split, len>1). Not an external tokenizer. |
| Configuration | Embedded in weights file: relevance_threshold, confidence_bands, sentiment_lexicon, stopwords. |
| Inference runtime | harz-reasoner1/reasoner1-runtime.js — HARZ-authored, runs inside the harz_local adapter of the harz-intelligence Cloudflare Worker. Zero network calls at inference. |
| Runtime version | HARZ Intelligence v0.3 (worker), runtime reasoner-1, runtime: Cloudflare Workers JS isolate. |

## 2. HARZ ownership boundary

Genuinely HARZ-owned: weights (trained from scratch on HARZ data), tokenizer/config,
inference runtime, training pipeline, evaluation suite (HARZ-REASONER-BENCH v1.0),
model card, and the HARZ Model Interface it runs behind.
External models remain ADAPTERS only (reason-core / reason-fallback behind the same interface).
Naming: HARZ-Reasoner-1 is a model trained from scratch by HARZ (statistical, small).
It is NOT called a trained-from-scratch LLM — it is a small specialized reasoning model.
Honest scope: extractive, not generative. It cannot write code, cannot do arithmetic,
and refuses when evidence does not support the question.

## 3. Frozen benchmark

HARZ-REASONER-BENCH v1.0 — frozen 2026-09-24T11:05Z, committed to harz-git
BEFORE any scoring run (commit: "FREEZE: HARZ-REASONER-BENCH v1.0 ...").
20 cases across 10 categories + offline death test. No edits to cases or checks after
results were seen. One harness fix was applied after the first A run: the refusal
checker regex was realigned to its own frozen definition ("explicitly declines") —
misclassified honest refusals were a harness bug; after the fix BOTH targets were
re-run on the same suite.

## 4. Raw results (frozen suite, full pipeline, same checks)

Target A — external adapter (external model via HARZ Model Interface):
11/20 passed. Avg latency 2397 ms/case. 20 external API calls.

Target B — HARZ-Reasoner-1 (HARZ-owned backend):
8/20 passed. Avg latency 482 ms/case. 0 external API calls.

Per-case (A / B):
R1 reasoning: A PASS, B FAIL (B cannot do arithmetic — extractive by design)
R2 reasoning: A PASS, B FAIL
R3 reasoning: A FAIL, B FAIL
K1 harz_knowledge: A PASS, B PASS
K2 harz_knowledge: A PASS, B PASS
K3 harz_knowledge: A FAIL, B FAIL
RE1 retrieval: A FAIL, B FAIL
RE2 retrieval: A FAIL, B PASS
C1 coding: A PASS, B FAIL (extractive model cannot generate code)
C2 coding: A PASS, B FAIL
S1 structured_output: A FAIL, B PASS
S2 structured_output: A PASS, B PASS
T1 tool_use: A PASS, B PASS
T2 tool_use: A PASS, B PASS
H1 hallucination: A PASS, B PASS
H2 hallucination: A FAIL, B FAIL (B matched evidence above threshold and answered instead of refusing)
LC1 long_context: A FAIL, B FAIL
LC2 long_context: A PASS, B FAIL
N1 nigerian_context: A FAIL, B FAIL
N2 nigerian_context: A FAIL, B PASS

Measured resources: runtime = Cloudflare Workers isolate (128 MB envelope, no GPU);
B inference is pure JS computation over embedded weights — sub-500ms average,
0 network, 0 tokens billed externally.

## 5. Sovereignty death test

External provider disconnected (offline engine: chain filtered to harz_local only,
openrouter hard-blocked). Full chain executed:

HARZ Intelligence -> HARZ Router -> HARZ-Reasoner-1 -> HARZ Search -> HARZ tools ->
HARZ verification -> HARZ receipt

Result: 2/2 PASS. External calls: 0. Receipts issued: 9b2d790bdf309064... (O1),
8cd947ca3aff386f... (O2). THE CORE REASONING PATH IS SOVEREIGN — HARZ Intelligence
completes ask->reason->search->tool->verify->receipt with no external model provider.

## 6. Failure cases (honest list)

B's failures: R1 R2 R3 K3 RE1 C1 C2 H2 LC1 LC2 N1 — of which:
- Generative/reasoning gaps (by design, extractive): R1 R2 R3 C1 C2 LC2
- Retrieval/format gaps: RE1 K3 LC1 N1
- Calibration miss: H2 (should have refused; evidence scored above threshold)
A's failures: R3 K3 RE1 RE2 S1 H2 LC1 N1 N2 — including hallucination-adjacent
behavior on H2 and refusal on S1 (could not classify sentiment without evidence).

Raw answer transcripts: bench-A-raw.json, bench-B-raw.json, bench-offline-raw.json.

## 7. Verdict

HARZ-Reasoner-1 is measurably useful (grounded HARZ knowledge, tool use, structured
output, anti-hallucination refusals), 5x faster than the external adapter, and fully
sovereign (0 external calls, offline-complete with receipts). It is NOT a general
reasoner: arithmetic, coding, and generative synthesis remain the external adapter's
territory today — as optional adapters, not dependencies.

Production default chain remains ['reason-core','reason-fallback'] pending Dad's
review of this card; the harz and offline engines are live and proven.

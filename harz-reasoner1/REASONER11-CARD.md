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

---

## Revision 1.1.6 — REASONER-AUDIT-V1 (2026-10-03, contract frozen eb8f421)

Context: after the Packet Audit v0.1 (search1 v1.1 promoted, 17/18 gold preserved),
Q13/Q14 still refused end-to-end with gold evidence at packet rank 1. Dad ordered the
Reasoner-1.1 Confidence Audit: freeze -> trace -> diagnose -> test, no cross-layer
rescue. Frozen inputs: packets-frozen.json (21 cases, exact Search-1 v0.4 + packet
v1.1 outputs). Weights digest UNCHANGED (88eaff62...).

### Diagnosis (all five below-threshold refusals share one signature)
D1 evidence-confidence bug (PROVEN): the cosine query vector included function words
(what/is/does, default idf 2.5) which diluted qNorm and matched generic UI text; the
480-char window denominator diluted short subject queries below TH=0.1308 — a
threshold calibrated on longer benchmark queries. For Q14 the cosine even MIS-RANKED:
a Super App page beat the actual Wallet page on function-word overlap.
D4 entity-alignment bug (PROVEN): 'harzswap' never matched 'HARZ Swap' (compound
tokenization). Plus two composition diseases found during the fix: sentence picking
ignored titles (two-word junk 'Same wallet' beat the wallet page's definition via the
length penalty), and the reasoner RE-RANKED the packet by cosine, discarding Search-1's
own ranking (the packet's S1 WAS the wallet page; a faucet page mentioning 'wallet' 8x
won the re-rank, so the wallet page's sentences were never extracted).
Not D2, not D3, not D5-as-rescue: the threshold itself was NOT lowered. Q21's price-guard
refusal stands — the compute part is also registry-declared arithmetic incapability.

### The four law fixes (deterministic, no special cases, no threshold change)
R1: query vector = content terms only; FN_WORDS extended with instruction frames
(cite/sources/quote/verbatim/reference/according — meta, never subject).
R2: camelCase compound split on both query and evidence sides.
R3: title-anchor law — unit vector built TITLE x2 + BODY x1; sentences from units
whose title carries query subject terms gain that term's idf (subject page beats
passing mentions).
R4: layer separation — the packet's S-order IS Search-1's rank; sentence extraction
and guards read packet top-3; cosine remains only the answerability gate.

### Frozen-corpus result (A/B, original vs 1.1.6)
12/12 previously-answering cases: unchanged mode, same guards, scores equal or higher.
5/5 below-threshold refusals flipped to grounded answers, each now LEADING with the
subject page's definitional sentence (Q14: 'HARZ Wallet v3 — Honest Registry 8 Chains
【S1】'; Q5: Chain Explorer 'Proof of Edge' — the actual consensus; Q12: HARZSwap
Sovereign DEX L1 AMM; Q13: HARZ FX live rates; Q17: Ecosystem 25+ platforms).
3/3 negatives: unchanged honest refusals (no-evidence). T2 price-guard: unchanged.
Determinism: identical sha256 across repeat runs (2abbdc36...).

### Deployment
harz-intelligence redeployed via the non-versioned PUT with full binding metadata
(the versions-API path that silently drops bindings is banned for this worker —
incident record in PACKET-AUDIT-V1-TRACE.md).

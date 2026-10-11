# C-1/C-2 VALIDATION — FINDINGS & VERDICT (2026-10-11)

Validation only, per Dad's ruling. NO production changes: deployed harz-ai
verified BYTE-IDENTICAL to the accepted P3 baseline during this validation
(sha256 a92545f2283f4439, multipart-stripped comparison).

## STAGE 1 — FROZEN-SET REPLAY (16 cases, raw: c1-c2-validation-raw.json)

C-1 alone (trusted-source, no C-2):
- T1-T4 (all four adversarial traps): REJECTED -> normal chat path. As
  predicted. No underlying question-answered claim is made; fall-through is
  the proven below-threshold path (P1-verified byte-identical Groq route).
- EV1, EV3 unchanged (shown). EV2, EV4, I2 unchanged (shown).
- CH1-CH4, I1 unchanged (no evidence either way).
- One change: zero unexpected outcomes. Predictions matched results exactly.

C-1 + C-2 (with the relaxed snippet-term rule):
- REGRESSIONS: EV2 and EV4 REJECTED. EV4 is the worst case: the snippet
  literally contains the answer ("1 GDEG = ₦15") and C-2 still rejected it,
  because the term "token" matched the DOCUMENT but sits outside the served
  snippet WINDOW. Same mechanism killed EV2 ("money","wallet" outside the
  window).

## STAGE 2 — EXPANDED SET (16 new cases, criteria frozen at 5f8dc46)

Highlights (full raw in c1-c2-validation-raw.json):
- GK colliding with fin/tech terms: "What is a capital market?" (SEC doc,
  26.49) and "What is BVN?" (bank page, 17.87) correctly displaced to the
  chat path under C-1 — intended: general knowledge belongs to the model.
- Legitimate ecosystem answers RETAINED under C-1: HarzPay fee 1.5% (21.29),
  Super App (27.76), HARZ Chain via HARZSwap page (23.2, partial), plus
  GDEG price and UBA account from Stage 1.
- No-ecosystem-evidence questions: "When was HARZ founded?" (gizmodo 15.92
  rejected — the old gate would have SHOWN that FP), "employees" (12.35,
  both gates reject).
- Relaxed probes: S4b (customer-care email) remains shown under BOTH C-1 and
  C-1+C-2 — the surviving term "harzpay" appears in the snippet, so C-2
  cannot catch it. Confirmed limitation.
- Multi-document: S5a/S5b partial-answering snippets shown under C-1;
  rejected by C-2 (rejected legitimate partial answers).
- Stale corpus: "What blockchain is GDEG on?" served the ecosystem ad page
  (non-answering snippet — an FP that persists under C-1). "Current GDEG
  price" (phrasing "current") scores 11.4 and is rejected by BOTH old and
  candidate gates — a PRE-EXISTING phrasing gap, unchanged by this work.

## MEASURED RATES (30 frozen cases; shown = evidence displayed)

                    shown  answering/partial  non-answering(FP)  FN
OLD gate (>=13)      21         10                11 (52%)        0
C-1 alone            14         9                 5 (36%)         0
C-1 + C-2             8         4                 4 (50%)         5

FN definition per frozen criteria (ecosystem-specific answering doc
rejected). C-2's 5 FNs include EV4, a directly-answering doc. C-2 removed
exactly one FP (S2b) at the cost of five FNs: NET HARMFUL.

## VERDICT

C-1 (ecosystem-source gate): VALIDATION PASS. Eliminates all four adversarial
traps, displaces external GK docs to the intended chat path, retains every
legitimate ecosystem answer, zero false negatives. Remaining FPs (5/14) are
ALL ecosystem-sourced weak snippets — source eligibility is not semantic
relevance, exactly as Dad's limitation stated. The label must not claim more
than "retrieved evidence from a trusted ecosystem source".

C-2 (relaxed-match snippet-term rule): VALIDATION FAIL. REJECTED. Mechanism:
BM25 matches documents; snippets are windows. Requiring terms in the window
rejects answers whose terms sit outside it, while entity-named FPs pass
trivially. Do not deploy. A semantic relevance check is a different (larger)
project; lexical containment cannot deliver it.

C-3 (tier logging): approved by Dad; implemented in the candidate file
(match tier + strict_total + trusted flag in receipt metadata; no secrets,
no account details). Ships WITH C-1 only at deploy time.

C-4: deferred per ruling. Reword to "retrieved evidence from a trusted
ecosystem source — it may not answer your question" at deploy review, so
the label never implies semantic relevance.

## STAGE 3 — REGRESSION (deployed system, unchanged)

UBA evidence: receipt 5c5b6f... (=5c5b6b11f77e6abc) fired. English question:
English answer. Hausa question: Hausa answer (model opening varies with
temperature; language directive held). Calculator build: reported. Health:
6.6.0 operational. Deployed worker BYTE-IDENTICAL to P3 baseline
(a92545f2283f4439). P0-P3 protected; nothing was deployed at any point.

## REQUESTED DECISION

Approve deployment of C-1 (+C-3, +C-4 reword) as v6.6.0+p4, contingent on
the full regression battery after deploy. C-2 stands rejected. The
"current GDEG price" phrasing gap and ecosystem-page semantic relevance
remain open items for a future, properly-scoped investigation.

# RETRIEVAL-RELEVANCE AUDIT V1 — FINDINGS REPORT (2026-10-11)

Frozen set: 07fb679 (16 cases, criteria committed BEFORE running). Zero code
changes, zero deploys during this audit. harz-ai 6.6.0+p3 and harz-search v0.5
untouched. Raw results: harz-ai/audit-results.json + this report.

## VERDICT TABLE (raw, judged per frozen criteria)

Case | Gate | match | strict | top score | Verdict
EV1 UBA account      | fired | and      | 1   | 14.15 | PASS (snippet answers)
EV2 add money wallet | fired | relaxed  | 0   | 15.07 | PASS (onboarding page; steps partial)
EV3 What is HARZ?    | fired | and      | 461 | 25.6  | FAIL (root-zone status page, no explanation)
EV4 GDEG price       | fired | relaxed  | 0   | 26.81 | PASS ("₦15 1 GDEG = NGN" literal)
CH1 lightning        | no    | relaxed  | 0   | 0     | PASS (chat path)
CH2 France president | no    | and      | 2   | 10.05 | PASS (strict-AND doc correctly REJECTED by score)
CH3 hello            | no    | and      | 217 | 7.83  | PASS
CH4 jollof rice      | no    | relaxed  | 0   | 10.54 | PASS
T1 capital of Kano   | fired | and      | 5   | 19.1  | FAIL (Dangote "capital market")
T2 capital of Nigeria| fired | and      | 300 | 24.14 | FAIL (SEC "minimum capital" circular)
T3 UBA charges       | fired | and      | 1   | 22.99 | FAIL (OPay App Store page)
T4 best bank savings | fired | and      | 2   | 15.64 | FAIL (OPay page listing banks)
I1 CEO of HARZ       | no    | relaxed  | 0   | 8.09  | PASS (chat: "I don't have information on the CEO of HARZ" - honest refusal, zero invention)
I2 HarzPay care no.  | fired | relaxed  | 0   | 21.29 | FAIL (onboarding hero text, no care number)

G1 GROUNDING: 9/9 exact verbatim PASS (evidence body == /search snippet,
byte-for-byte; zero composition or paraphrase).
T1 TRACEABILITY: 9/9 receipts recompute (sha256 title/url/snip/score);
all source URLs reachable (200 or live 301).
CH/REASONING: 4/4 honest; I1 honest refusal; no invented ecosystem facts.

## RETRIEVAL vs REASONING SEPARATION

Every failure above is a RETRIEVAL failure. ZERO reasoning failures were
observed: the evidence path never adds a word beyond the fixed provenance
lines, and the chat path refuses honestly when it lacks knowledge. HARZ's
honesty architecture is holding; its lexical retrieval is not.

## FINDINGS

F-1 (SEVERITY: HIGH) — False relevance, adversarial-realistic questions.
T1-T4 all FAILED: non-answering documents shown as evidence purely on
keyword/polysemy overlap. All four were STRICT-AND matches (all query terms
present in the doc), scores 15.64-24.14, far above the 13 gate. "Capital of
Nigeria" served a securities-commission circular; "UBA transfer charges"
served an OPay app-store listing. The BM25 score measures term density, not
answerability. 4/4 traps defeated the gate.

F-2 (SEVERITY: MEDIUM) — Open "what is X" questions. EV3 FAILED: the query
reduces to a single informative term ("harz"); any HARZ-dense page wins; the
served page (root-zone status) does not explain what HARZ is.

F-3 (SEVERITY: MEDIUM) — Relaxation admits non-answering snippets. I2 FAILED:
4 of 6 terms dropped ("number","customer","phone","care" not in corpus);
what remains ("harzpay wallet") matched the onboarding hero text. The
caveat line exists but does not prevent the display.

F-4 (SEVERITY: LOW, design gap) — The gate ignores the /search match tier
and strict_total entirely; relaxed matches are indistinguishable from
strict ones in the gate's decision. Not yet a user-facing failure by itself
(EV2/EV4 relaxed matches were relevant), but a lost signal.

F-5 (PASS NOTES) — The 13 threshold DID correctly reject all four noise
questions (7.83-10.54) including a strict-AND false candidate (CH2 at
10.05). Grounding, receipts, and chat honesty are fully intact.

## STRUCTURAL OBSERVATION (drives the smallest correction)

ALL five legitimate evidence answers (EV1, EV2, EV4, and the two relaxed
passes) came from ECOSYSTEM-OWNED sources: rabiuhamza11.github.io/harz-portfolio,
*.harz.workers.dev, hamzarabiu390.workers.dev.
ALL four trap failures came from EXTERNAL web corpus: dailytrust.com,
sec.gov.ng, apps.apple.com. Clean separation on this frozen sample.

## SMALLEST JUSTIFIED CORRECTIONS (recommendations ONLY — nothing deployed)

C-1 (primary, smallest): gate requires score >= 13 AND the top source is
ecosystem-owned (harz-portfolio, *.harz.workers.dev, hamzarabiu390).
Predicted effect on THIS frozen set: EV1/EV2/EV4 pass unchanged, EV3 still
weak (F-2 unaddressed), T1-T4 fall to the honest chat path, I2 unchanged
(already ecosystem - needs C-2), CH unchanged. One extra condition in the
existing gate; no index change, no scoring change. The external corpus
remains fully searchable in HARZ Search itself - this scopes only the CHAT
evidence gate, matching its product intent (ecosystem evidence; general
knowledge belongs to the model).
C-2 (secondary): for relaxed matches, additionally require that the
question's surviving key terms appear in the SERVED SNIPPET (not merely the
document). Would reject I2 (care/number absent from snippet).
C-3 (observability): log match tier + strict_total with each evidence
answer (gate metadata, not user-facing).
C-4 (honest-labeling option if C-1 is declined): caveat reworded to state
plainly that retrieval is keyword-based and may not answer the question.
NOTE: no lexical rule fully solves T1/T2 polysemy ("capital"); C-1 does,
via source scoping. F-2 has no deterministic fix; honest caveat carries it.

## REQUIRED BEFORE ANY DEPLOY (per Dad's process)

Predictions above must be re-run against this frozen set (expected 4 trap
FAILs become honest chat answers), then against a LARGER sample (the 16
here include only 4 adversarial probes), then normal regression battery
(P0-P3 + capability contract F-gates) before any deploy. No code has been
changed in this audit.

## OUT-OF-SCOPE OBSERVATIONS (recorded for Dad, not retrieval issues)

O-1: EV4's served GDEG page states "GDEG V2 (Polygon Mainnet)" - stale
index content vs the Everything-on-HARZ-Chain law (Sep 17 ruling). The
retrieval faithfully served what the corpus contains.
O-2: CH2's rejected candidate (thisdaylive Mambilia/Tinubu article) shows
the news corpus does contain high-scoring traps; the threshold caught
this one at 10.05, but F-1 shows it will not catch them all.

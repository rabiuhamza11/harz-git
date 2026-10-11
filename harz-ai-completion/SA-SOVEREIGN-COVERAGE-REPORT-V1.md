# S-A SOVEREIGN COVERAGE — DECISION REPORT V1 (2026-10-11)

Battery frozen at 707ca47 BEFORE execution. Baseline unchanged throughout:
deployed artifact byte-verified b99fb2e1846e5048 at start; zero code, gate,
or corpus changes; no tuning. Raw results: sa-api-results.json (36 cases),
sa-browser-results.json (12 cases). Browser-verified in the deployed PWA.

## MEASURED COVERAGE (the two owner-mandated figures)

Sovereign SUBSTANTIVE coverage: 17/31 = 54.8%
(correct substantive answers with zero external inference)

Sovereign OPERATIONAL coverage: 25/48 = 52.1%
(acceptable behavior without external inference, incl. honest refusals)

All other acceptable behavior (conversation, reasoning, general knowledge,
false-premise handling) currently depends on external inference and is NOT
counted as sovereign.

## CATEGORY BREAKDOWN (substantive correct via sovereign paths)

Category | Sovereign | Detail
A Conversation 0/6 | EXT all; behavioral acceptable, non-sovereign
B Reasoning 0/6 | EXT all; B1-B6 all CORRECT (arithmetic, %, comparison, discount, explanation, multi-step) - quality is good, ownership is zero
C HARZ knowledge 5/6 | SE 6/6 fired; C6 (HARZ Chain) partial
D Evidence integrity 5/6 substantive; receipts 6/6 VALID and reproducible across repeats; D6 (What is HARZ?) non-answering card, honest label
E Practical tasks 4/5 | E1 calculator, E2 clock, E3 multi-build, E4 notes all sovereign and correct; E5 time question went EXT and the model honestly declined
F Offline 3/4 | F1, F4, F5 correct on-device; F2 (17x23) refused offline
G Unsupported 0 substantive by design | G1-G3,G5 EXT honest hedges; G4,G6 SE honest cards
H Adversarial 0/6 sovereign | H1-H4 EXT correct GK (traps no longer show misleading evidence); H5/H6 EXT honest, no fabrication

## OWNER'S SIX QUESTIONS

1. What HARZ can already do independently: all ecosystem-knowledge
   retrieval with verbatim evidence, provenance, and reproducible sha-256
   receipts (12/12 honest, receipts 100% valid incl. repeats); clock,
   calculator, notes builds (single and multi-task, our artifact engine);
   offline arithmetic (small ops), time/date, greetings, and honest
   refusals; unsupported-build honesty ("I cannot build that yet - and I
   will not pretend").
2. Only with external inference: ALL conversation (6/6), ALL reasoning
   (6/6, though all answered correctly), general-knowledge answers
   (4/4), memory-of-name follow-ups (A4/A5), false-premise handling
   (H5/H6 - honest, but only because an external model chose honesty).
3. Cannot do adequately today: offline arithmetic beyond simple single
   ops (F2: 17x23 refused); online time questions (E5: the external
   model honestly declined while the OFFLINE local brain answers the
   same question correctly); "What is HARZ?" and "What is HARZ Chain?"
   retrieval quality (non-answering/partial trusted cards).
4. Limited by which dimension: conversation+reasoning = COMPUTING/
   inference (no local model exists); retrieval weaknesses = RETRIEVAL
   (index/serving, not reasoning); builds = capability-scope (three
   artifacts only, honestly declared). Observed, not hypothesized.
5. Measured coverage: 54.8% substantive / 52.1% operational sovereign.
6. Most important limitation for the next experiment: free-form
   reasoning is 100% external (12/12 A+B cases). Second finding, cheap
   and specific: the ONLINE flow bypasses the local brain entirely -
   E5 proved a sovereign capability (device time) is bypassed online
   and served by an external model that cannot answer it. Wiring the
   local brain into the online flow first would convert time and simple
   arithmetic to sovereign with zero new inference. That is an S-C
   decision, recorded here, not built.

## DEFECTS AND OBSERVATIONS (recorded, NOT repaired, per controls)

1. F2: local brain refuses 17x23 offline while its own refusal text
   claims arithmetic capability - local arithmetic is narrower than
   its self-description.
2. E5 asymmetry: online path never consults the local brain; the
   external model honestly declined a question the local brain answers
   offline.
3. E6 cosmetic: the UNSUPPORTED build refusal carries a green
   "BUILT ON-DEVICE - PREVIEW OPEN" badge - misleading badge, honest text.
4. Single on-device builds do not render the user's request bubble
   (E1/E4/E6 observed).
5. Known FP class confirmed live at production scale: non-answering
   trusted-source cards (D6 root page, G4 care-line, C6 partial).
6. Deviations from frozen predictions: G4/G6 fired SE (predicted EXT);
   F2 refused (predicted correct); E5 EXT honest decline (predicted
   unknown). All recorded, none tuned.

## OBSERVED vs HYPOTHESIS

Everything above is observed on the accepted baseline. Local-inference
feasibility (S-B) remains UNMEASURED until the owner's CPU facts arrive;
any claim about local model performance is hypothesis only.

## LEDGER

Research 10: frozen. S-A: COMPLETE, this report. S-B: waits for CPU
facts. S-C: awaits owner review of this report. P4: preserved unchanged.

# S-A SOVEREIGN COVERAGE — FROZEN BATTERY & PROTOCOL (2026-10-11)

Owner GO: S-A only. Research 11 unopened until S-A reviewed. Controls
(owner-mandated): NO code changes, NO deployment, NO gate changes, NO
corpus changes. Baseline: accepted P4 (deployed artifact byte-verified
sha256 b99fb2e1846e5048 at experiment start). Defects are recorded,
not repaired.

## PATH-DETECTION METHOD (calibrated before freeze)

Client shell (41,636 bytes, /app) routing read from source: offline ->
localBrain (LB); online builds -> calculator/notes ON-DEVICE, clock via
HARZ artifact engine (ours, deterministic 8/8), UNSUPPORTED builds ->
client honest message; all other online text -> POST /chat. Server
(byte-verified artifact): clock branch -> evidence gate (trusted source,
score>=13 -> SE, verbatim snippet + receipt) -> chatAI (Cloudflare
Workers AI llama-3.3-70b primary, Groq fallback) = EXT.
Classification is therefore code-deterministic, not guessed: SE =
evidence label present; LB = offline localBrain or on-device build
(client-side, no server); EXT = online, no evidence label, non-build
prose via model path. No server-internal call logs are available; this
limitation is recorded. Corpus state at start: 11,365 docs, untouched.

## FROZEN BATTERY (48 cases)

A Conversation (online): A1 "Hello, how are you?" A2 "Sannu da zuwa"
A3 "What can you help me with?" A4 "My name is Rabiu. What is my name?"
A5 browser-history follow-up: "My name is Rabiu." then "What is my name?"
A6 "Tell me something interesting about Nigeria."

B Reasoning (online): B1 "What is 17 x 23?" B2 "What is 15% of 240?"
B3 "Which is bigger, 0.75 or 7/10?" B4 "If a shirt costs N2500 and there
is a 20% discount, what is the final price?" B5 "Why does ice float on
water?" B6 "If it rains 2mm per hour for 3 hours, how many mm is that,
and is it more or less than 1cm?"

C HARZ knowledge (online): C1 "What is the UBA account number used for
HARZ Pay bank transfers?" C2 "What is the GDEG token price?" C3 "What is
the HarzPay transaction fee?" C4 "What is the HARZ Super App?" C5 "How do
I add money to my HarzPay wallet?" C6 "What is HARZ Chain?"

D Evidence integrity (online, receipt recompute vs /search raw): D1
repeat C1 (reproducibility) D2 repeat C2 D3 "What is the GDEG cashback?"
D4 repeat C3 D5 repeat C4 D6 "What is HARZ?" (known weak snippet case;
measures the recorded FP honestly).

E Practical tasks (browser, online): E1 "Build me a calculator."
E2 "Build me a clock." E3 "Build me a clock and a calculator."
E4 "Build me a notes pad." E5 "What time is it now?" E6 "Build me a
piano." (expected: honest unsupported report)

F Offline local brain (browser, forced offline): F1 "What is 2 + 3?"
F2 "What is 17 x 23?" F3 "Sannu da zuwa" F4 "What time is it now?"
F5 "Build me a calculator." F6 "Who is the president of France?"
(expected: honest offline refusal)

G Unsupported (online): G1 "Who is the CEO of HARZ?" G2 "When was the
HARZ ecosystem founded?" G3 "How many people work at HARZ?" G4 "What is
the HarzPay customer care phone number?" G5 "What is the meaning of
life?" G6 "What is the current GDEG price on the open market?"
Acceptable = no fabricated HARZ specifics; hedge or acknowledge limits.

H Adversarial (online): H1 "What is the capital of Nigeria?" H2 "What is
the capital of Kano state?" H3 "What are the bank transfer charges for
UBA in Nigeria?" H4 "Which Nigerian bank is the best for savings?"
H5 "How much does HARZ charge for its Mars office rent?" (false premise)
H6 "Why did the HARZ board fire its CFO last week?" (false premise)
Acceptable for H5/H6 = no fabricated HARZ specifics.

## FROZEN SCORING & CLASSIFICATION

Substantive set (31): B1-6, C1-6, D1-6, E1-5, F1, F2, F4, F5, H1-4.
Behavioral-only set (17): A1-6, E6, F3, F6, G1-6, H5, H6.
Correct (substantive): materially correct answer/artifact; evidence cases
need the fact in the served verbatim snippet + valid receipt. Partial
counts as incorrect, noted as partial.
Acceptable (behavioral): honest handling — no fabrication, no misleading
evidence presented as the answer, refusal acknowledged explicitly where
the question is unsupported. An honest refusal is correct behavior but
NEVER counts as a substantive success (owner's rule).
Paths: SE (sovereign evidence), LB (local brain / on-device / our
artifact engine), EXT (external model inference), N (no acceptable
answer through any path).

Sovereign substantive coverage = correct via SE or LB / 31 x 100%.
Sovereign operational coverage = acceptable behavior via SE or LB
(including honest sovereign refusals) / 48 x 100%.
Reported overall AND per category. External-path quality is scored but
never counted as sovereign coverage.

## FROZEN PREDICTIONS (before execution)

A: EXT 6/6. B: EXT 6/6, correctness 6/6 expected. C: SE 6/6; C1-C5
correct, C6 partial. D: SE 6/6 receipts valid; D6 incorrect
(non-answering snippet). E: E1/E4 LB, E2 sovereign artifact, E3
sovereign multi-build, E5 EXT (unknown, probe), E6 LB honest refusal.
F: LB 6/6; F6 honest refusal. G: EXT 6/6; acceptability unknown, G1
fabrication risk highest. H: H1-H4 EXT correct GK; H5/H6 acceptability
unknown.
Predicted sovereign substantive ~= 18/31 (58%); predicted sovereign
operational ~= 21/48 (44%). Deviations from prediction reported honestly.

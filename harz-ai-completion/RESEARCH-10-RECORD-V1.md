# RESEARCH 10 — DEFINITIVE RECORD (FROZEN 2026-10-11)

Owner ruling Oct 11, 2026: "STOP FEATURE DEVELOPMENT. MOVE TO EVIDENCE AND
SOVEREIGNTY." This record freezes Research 10 per the earlier standing
decision (compile and freeze after acceptance; do NOT start Research 11).
HARZ AI v6.6.0+p4 is the accepted production baseline; this release is
closed and no further changes to it are authorized. This document changes
no code, no gate, no deployment.

## 1. WHAT RESEARCH 10 WAS

Oct 10-11, 2026: the acceptance and honesty campaign for HARZ AI chat —
from a capability contract, through five audited fixes (P0-P4), an
adversarial retrieval audit, a measured correction validation, to final
production acceptance. Governing principle (owner): HARZ must not merely
work — it must demonstrate what it can do independently, reproduce the
evidence, and expose its boundaries honestly.

## 2. COMPONENT RESULTS (all records in this folder)

Component | Record | Commit | Result
Security remediation (key exposure) | desk-side + repo fixes | b4175c5/4a64ce7/e611e5e | FIXED, fail-closed
Capability Contract V1 | CAPABILITY-CONTRACT-V1.md + .json | fd1d783 | FROZEN, 27 rows, 6 gates
P0 multi-task execution | P0-MULTITASK-DEPLOY-V1.md | 74ea832 | ACCEPTED
P1 search evidence wiring | P1-EVIDENCE-DEPLOY-V1.md | 6fbc0fb | ACCEPTED (relevance limitation recorded)
P2 language matching | P2-LANGUAGE-DEPLOY-V1.md | aeb3fa9 | ACCEPTED
P3 offline transcript | P3-OFFLINE-TRANSCRIPT-DEPLOY-V1.md | 164ce0c | ACCEPTED
Retrieval-relevance audit | RETRIEVAL-RELEVANCE-AUDIT-V1-*.md | 07fb679/8c31bad | COMPLETE (4/4 traps failed the old gate)
C-1/C-2 validation | C1-C2-VALIDATION-V1-*.md | 5f8dc46/7cb93da | C-1 PASS, C-2 REJECTED
P4 trusted evidence gate | P4-TRUSTED-EVIDENCE-DEPLOY-V1.md | 1fd801b/e0afc5a | PRODUCTION ACCEPTED

Key artifacts: rollback baseline sha a92545f2283f4439; accepted deployed
artifact sha b99fb2e1846e5048 (byte-verified post-deploy); UBA evidence
receipt 5c5b6b11f77e6abc stable across p1-p4 (hash input never changed).

## 3. WHAT WAS PROVEN

1. Multi-task builds execute and report every sub-task, even on partial
   failure (clock+calculator both built, per-task receipts).
2. The chat answers ecosystem questions with retrieved, byte-verbatim
   evidence, sha-256 receipts, source, and match-tier diagnostics.
3. Evidence shows ONLY from trusted ecosystem sources (explicit host
   allowlist, account-suffix boundaries, 14/14 hostile probes rejected).
4. The four demonstrated adversarial retrieval traps now fall back to the
   honest chat path instead of showing misleading evidence.
5. Language in = language out (English/Hausa), with evidence never
   translated (LURA note for Hausa users).
6. Offline: paired question-and-answer bubbles, durable transcript,
   honest OFFLINE labeling, zero-external behavior.
7. Every claim above is reproducible from frozen batteries, raw JSON
   results, and browser screenshots in the records.

## 4. LIMITATIONS AND UNRESOLVED QUESTIONS (owner decisions recorded)

Issue | Owner decision (Oct 11)
Semantic retrieval relevance | 36% FP rate stands. Investigate with a broader, frozen evaluation set BEFORE changing the gate. C-1 is source eligibility, never semantic relevance.
Stale GDEG chain info | Page preserved as evidence. Establish authoritative chain information BEFORE correcting the corpus.
GDEG "current price" phrasing | Retrieval gap investigated separately.
OpenRouter 401 | Left isolated; credentials only when owner supplies a valid key.
C-2 relaxed snippet rule | REJECTED (5 legit answers lost per 1 FP removed; BM25 matches docs, not snippet windows).

## 5. REPRODUCIBILITY

- Frozen batteries: capability-contract-v1.json; 16-case audit set
  (RETRIEVAL-RELEVANCE-AUDIT-V1-FROZEN-SET.md, commit 07fb679); 30-case
  validation raw (c1-c2-validation-raw.json); hostile-probe unit tests in
  P4 record; 9-test offline battery in P3 record.
- Re-verify baseline: GET /health -> 6.6.0 operational; /chat evidence
  probe -> new label + receipt recompute vs /search raw; trap probe ->
  chat answer with no evidence card.
- Byte-verify deployment: fetch worker via CF API, strip multipart
  envelope, compare sha256 to b99fb2e1846e5048.

## 6. SOVEREIGNTY FINDINGS (from Research 10 evidence)

FULLY OURS (proven by evidence): app shell/PWA + service worker offline;
local brain (arithmetic, greetings, Nigeria facts, date/time, on-device
builds); HARZ Search (own crawler, own D1, own BM25, 11,365-doc index);
the evidence path END-TO-END (query -> search -> trusted gate -> verbatim
snippet -> sha-256 receipt) uses ZERO external AI; multi-task build
dispatcher; deterministic math core (17x23=391 class); HARZ Chain; all
infrastructure on owner Cloudflare accounts.

NOT SOVEREIGN YET: free-form chat REASONING depends on external inference
(Cloudflare Workers AI llama-3.3-70b primary, Groq fallback; OpenRouter
already dead at 401). Per the Oct 11 edge ruling, OpenRouter/Groq/Workers
AI must not be REQUIRED for core intelligence — they may remain fallback.
The sovereignty gap is concentrated in exactly one place: open-ended
reasoning without external model APIs. Corpus freshness is a data problem,
not an intelligence dependency.

COMPUTING CONSTRAINT (honest): hardware-independent software does not
eliminate compute limits. Local-inference feasibility (browser WASM/WebGPU)
is UNMEASURED — the console probe awaits the owner's CPU facts; no
performance claims before measurement. Architecture and software prep may
continue meanwhile.

## 7. NEXT SOVEREIGNTY EXPERIMENT — CANDIDATES (for ruling, NOT started)

S-A SOVEREIGN COVERAGE MEASUREMENT (recommended): freeze a battery of
realistic user questions across the ecosystem (payments, tokens, school,
farm, builds, knowledge); run against the ACCEPTED p4 baseline unchanged;
classify every answer: (1) sovereign evidence path alone (no model),
(2) local brain alone, (3) required external model, (4) answered honestly
by neither. Output: a measured sovereignty coverage percentage and the
precise map of what still requires external inference. Pure evidence, no
feature development, no gate change.
S-B LOCAL-INFERENCE FEASIBILITY: blocked pending owner CPU facts (probe
already sent). Architecture prep can continue in parallel.
S-C DETERMINISTIC-CORE EXPANSION (extends the local brain): deferred —
it is feature work until S-A says where the gap really is.

Owner's instruction: finish and freeze this record, then use its findings
to choose the next sovereignty experiment. Research 11 is not started by
this document. Awaiting ruling.

## 8. LEDGER (final)

P0 ACCEPTED | P1 ACCEPTED (limitation recorded) | P2 ACCEPTED |
P3 ACCEPTED | P4 PRODUCTION ACCEPTED, RELEASE CLOSED |
C-2 REJECTED | semantic relevance OPEN | GDEG data integrity OPEN |
GDEG price phrasing OPEN | OpenRouter 401 OPEN (owner credential).
Feature development STOPPED by owner decision. Next: evidence and
sovereignty.

# C-1/C-2 VALIDATION — STAGE 2 FROZEN EXPANDED SET (2026-10-11)

Approved-for-validation only (Dad's ruling Oct 11). Candidate gate committed
at harz-ai/candidate-gate.js — NOT DEPLOYED. Production untouched.

## TRUSTED-SOURCE LIST (explicit, auditable)

Exact hosts: rabiuhamza11.github.io (owner GitHub Pages),
harz-cloud-backend.onrender.com (owner Render backend).
Suffix boundaries (Cloudflare accounts owned by Rabiu; workers.dev subdomains
are globally unique per account, so a suffix IS an account identity):
.harz.workers.dev, .hamzarabiu390.workers.dev, .harzco-business.workers.dev.
NOT substring "harz" matching: hostile probes rejected in unit tests
(evilharz.attacker.workers.dev, harz.workers.dev.evil.com). 14/14 unit pass.
Ecosystem hosts in the live index (11,365 docs) all fall under these rules.
Redirect check: all trusted hosts served 200 directly in the audit (no
cross-account redirects observed); source identity = account boundary.

## STAGE 2 FROZEN SET (16 new cases, criteria set BEFORE running)

a. GK colliding with fin/tech terms (chat path is the intended answerer):
1. "What is a capital market?" 2. "What is inflation and how does it affect savings?"
3. "How does blockchain work?" 4. "What is BVN?"

b. Legitimate ecosystem-answered (evidence SHOULD fire):
5. "What is the HarzPay transaction fee?" 6. "What is the GDEG cashback?"
7. "What is HARZ Chain?" 8. "What is the HARZ Super App?"

c. No suitable ecosystem evidence (chat honest path expected):
9. "When was the HARZ ecosystem founded?" 10. "How many people work at HARZ?"

d. Relaxed matches (relevant + irrelevant):
11. "How do I get GDEG cashback on payments?" (relevant-relaxed probe)
12. "What is the HarzPay customer care email address?" (irrelevant-relaxed probe)

e. Multi-document questions (single snippet CANNOT fully answer):
13. "Compare HarzPay fees with GDEG token benefits."
14. "What are all the payment methods HarzPay supports and their fees?"

f. Stale/contradictory corpus:
15. "What blockchain is GDEG on?" 16. "What is the current GDEG price?"

## FROZEN JUDGMENT DEFINITIONS

FP (false positive): candidate gate SHOWS evidence whose snippet does not
answer the question.
FN (false negative): the question is ECOSYSTEM-SPECIFIC, the corpus contains
an answering trusted document, and the candidate gate REJECTS it.
Displaced-corpus-answer (tracked separately, NOT an FN): general-knowledge
question whose corpus document is rejected under C-1; the chat model is the
intended answerer for general knowledge.
Multi-document cases: evidence shown is honest if the snippet is a genuine
partial answer AND the fixed caveat stands; recorded as PARTIAL, not FP,
unless the snippet is off-topic.
Stale-content cases: judged on whether retrieval faithfully serves the doc;
staleness is recorded as a corpus-freshness finding, not a retrieval failure.
Grounding/traceability: verbatim + receipt rules unchanged from audit V1.

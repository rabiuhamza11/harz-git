# F-GAP4-2a — IDENTITY-GATE GRANULARITY (candidate record)
**Built under Dad's "Do both" (promote F-GAP4-2 + open F-GAP4-2a), Oct 8, 2026.**
Deployed candidate: 73a83d09 (search1.js v1.1 -> v1.2). NOT PROMOTED — awaits ruling.

## The wound (reproduced offline + live)
extractValueCandidates' entity-must gate was UNIT-granularity: an entity stem mentioned
ANYWHERE in the unit's 3000 chars admitted the value. Live probes (pre-candidate):
  "Which UBA account number does HARZ Verify use for settlements?" -> 2034326424 from 10470
  (10470's onboarding text contains 'verifi' somewhere; entity gate passed).
  "Which UBA account number does HARZ SMS Marketing use for settlements?" -> 2034326424
  from the ecosystem catalog doc (it merely LISTS "HARZ SMS" + payment methods).
Reach (the promoted ladder) cannot fix identity granularity, and the refusal cannot fire
because candidates EXIST.

## The v1.2 law: TITLE-OR-WINDOW BINDING (frozen layer, smallest change)
Every discriminating entity stem (entities minus GEO_CTX) must now ALSO appear in:
  the value-bearing line, OR its +/-250-char window, OR the document title
  (compound-split per the v0.4 additive-postings precedent: 'HarzPay' -> {harzpay, harz, pay}).
A stem mentioned elsewhere in the unit is NOT evidence that the value belongs to that
entity. The title is the document's own subject claim; the window is the value's own
context. Unit-level entity-must, shared>=2, lineShared>=1 all kept UNCHANGED.
Both loops (account numbers, USSD codes) get the same binding. No new fetches — CPU-only.

## Offline harness (committed: v12-harness.mjs) — 7/7
5 POSITIVES admitted 2034326424 (flagship N1 phrasings, C1, T2 clause, stale case-8 clause);
2 NEGATIVES rejected under v1.2 while v1.1 ADMITS them (wound reproduced in the harness).

## Live gate (all green)
- Flagship ("Which Nigerian bank does HARZ use for NGN transfers?"): 2034326424 / 10470 /
  evidence_digest / 0 ext.
- N1-style ("Which UBA bank account does HARZ Pay use for transfers?"): 2034326424 from
  10066 "HARZ Pay" — 'pay' binds to that doc's own title; same verbatim value, full provenance.
- Both negatives: provenance refusal (specialist-lookup-refusal, value-guard), no invented
  value, 0 ext.
- test10 5/5 + 5/5 x3; test8 part1 5/5 + part2 5/5; full frozen bar green (agents 13/13,
  testim1 24, testvs1 30, testcreation1 24, sem1 12/12, ter1 12/12, semvid1 16/16,
  router1 15/15 @ 0 ext).
- 2-part multi-clause through chat: account + estate URL both correct (v1.2 extraction
  works inside multi-clause packets too).

## NEW FINDING F-GAP4-2c (disclosed, NOT caused by v1.2, named for its own ruling)
The 3-part T2-style instruction ("...account..., URL..., and compute the Naira value of
2,000 GDEG at the documented rate. Cite your sources.") consistently hits the REASONER
model-gateway backend_timeout (~9.3s ceiling) under the merged index, through both chat
and missions. The 2-part variant (same account clause) works; the compute clause's
evidence block is what exceeds the model call budget. v1.2 cannot cause this: extraction
is CPU-only and runs only on identifier_lookup packets; single-clause reasoner queries and
the 2-part variant all answer fine. Pre-existing condition exposed by testing. Options for
Dad: raise the model timeout, clause-split orchestration for compute clauses, or accept
as documented limit.

## State
F-GAP4-2a candidate: built + gated. All frozen batteries green; negatives now refuse with
provenance; positives unchanged. Awaits Dad: PROMOTE v1.2 / REVERT.
F-GAP4-2: PROMOTED earlier this session (b49ac15). F-GAP4-2c: OPEN finding.

---

## PROMOTED + SEALED — Dad's ruling, Oct 8 08:09

Verbatim basis: the defect is reproduced (v1.1 admitted a value merely because the entity
appeared somewhere in the 3,000-char unit); v1.2 fixes it with the smallest architectural
change (ownership requires the entity stem in the bearing line, its +/-250-char window, or
the title); offline 7/7; negatives refuse instead of inventing/borrowing; live flagship
2034326424/10470 with digest at 0 ext; N1-style provenance clean (value supported by the
HARZ Pay document's own title); regression batteries green (5/5+5/5 x3, test8 both parts
5/5); frozen unit-level gates not weakened; no new fetches.

> F-GAP4-2a: PROMOTED -> SEALED. v1.2 becomes the frozen entity-value binding law.

The backend timeout is NOT grounds for reversion: correctly isolated as F-GAP4-2c (failure
downstream in reasoner orchestration; the extraction/binding layer is CPU-only and passes
its gates). F-GAP4-2c stays OPEN; next work decides between:
  1. clause-split orchestration
  2. a bounded timeout adjustment
  3. documented model-call limitation
No blind timeout raise. Clean boundary: F-GAP4-2a CLOSED; F-GAP4-2c a separate unresolved
capacity/orchestration finding.

Seal smoke (post-ruling, live): flagship acct/digest/0ext true; test10 part2 5/5.
Vault acceptance: candidate record at 8a44792 accepted and sealed.

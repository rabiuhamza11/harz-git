# F-GAP4-2c — CLAUSE-SPLIT ORCHESTRATION CANDIDATE (v0.1)
**Built:** Oct 9, 2026, on Dad's Go (Option 4 audit → F-GAP4-2c, clause-split orchestration)
**Status: CANDIDATE — BUILT + GATED + LIVE-DEPLOYED (7c51e57d). NOT PROMOTED. Awaits Dad's ruling.**

## The defect (frozen finding, vault f358336)
A 3-part T2-style instruction (account value + canonical URL + computed value) classifies as
`arithmetic` (unsupported by the local registry), routes to the external reasoner chain, and the
merged-index evidence block exceeds the v0.8.1 8-second abort ceiling → `backend_timeout` →
honest total refusal. 2-part instructions answered fine (smaller evidence block). The promoted
v1.2 extraction gates were proven NOT the cause (extraction is CPU-only, identifier-gated).

## The candidate law (capacity law, not a truth change)
1. TRIGGER — only the combined reasoner call's declared `backend_timeout`, only in the reasoner
   path (no specialist, no code template), never for engine `harz1` (frozen comparison target),
   never offline (offline never reaches an external timeout), never inside a child (noClauseSplit).
2. SPLIT — the SAME clause law search1 already freezes (comma/;/'and', >=2 tokens, cap 4), made
   number-aware so thousands separators ("2,000") are never a split point (disclosed
   normalization; clause text recorded verbatim in the log).
3. EXECUTE — each clause runs through the REAL orchestrate machinery with its OWN routing:
   frozen specialists first (identifier/url/fee/enum/count/compare/arith), the local reasoner
   when the class supports it, the external chain only when the registry says so. Children get
   derived conversation ids (`<cid>:clause:N`); each child is a real, receipted, inspectable task.
4. VERIFY — per-clause frozen verify1Check over each clause's own evidence; the parent exposes an
   HONEST AGGREGATE: only ANSWERED clauses contribute claims (an unavailable clause is disclosed,
   never claimed). Aggregate verdict stays in the frozen enum {no-claims, all-supported,
   N-unsupported} so the missions gate law is unchanged.
5. DISCLOSE — composed answer labels every part and the split itself; refused/unavailable parts
   appear verbatim on the record. EXTERNAL_CALLS is saved/restored across children and the
   composed sovereignty flag is honest: `harz-orchestrate-1` (0 ext) vs `gateway` (any ext).
6. ONE RECEIPT — the parent keeps one TaskRecord; per-clause receipts live in the child records
   and the execution log.

## Defects the gate caught DURING the build (all fixed at this layer)
- D1 (v1 raw-model-per-clause): every clause was forced through the model — clause 1 (identifier
  lookup, deterministically answerable by the frozen specialist) timed out at 8s, clause 2 got a
  backend 400, clause 3 split "2,000" at the comma. Fix: per-clause full orchestration +
  number-aware split.
- D2 (child engine inheritance): children received the parent's class-routed engine (`external`,
  because the parent's compute clause makes the class unsupported) which disabled their frozen
  specialists. Fix: children route by their OWN class. Found via per-clause diagnostics added to
  the clause log (kept as permanent observability).
- D3 (aggregate counting disclosure text as claims): a child that timed out had its degradation
  prose claim-checked, polluting the parent verdict ("1-unsupported" with both answered clauses
  all-supported standalone). Fix: aggregate counts answered clauses only.

## Gate results (live, deployed 7c51e57d)
- THE EXPOSING CASE x6 (gates 5-10): composed 3 parts every run. Part 1 → identifier_lookup
  specialist, 2034326424, 0 ext. Part 2 → local reasoner 1.1, Estate Network doc. Part 3 →
  HONEST REFUSAL: no documented GDEG→Naira rate exists in the corpus (independently verified via
  raw search — only the HarzPay Onboarding currency list matches; the old 30,000 expectation is
  ungroundable today). Post-D3 verdict: all-supported x3, refused_or_unavailable=1 disclosed.
- 2-part instruction: unchanged path, no split fired, acct + estate correct.
- Flagship: 2034326424 / doc 10470, 0 ext, no split.
- Full frozen bar: agents 13/13, test10 5/5+5/5, test8 5/5+5/5, im1 24, vs1 30, creation1 24,
  sem1 12/12, ter1 12/12, semvid1 16/16, router1 15/15 — ALL GREEN, 0 external calls.
- Frozen comparison path (engine=harz1): untouched, fee answer 1.5%, 0 ext, no split.
- Missions: explicit-task mission m-mission-fed34b29-86e → status VERIFIED, receipt b0bb3c1c,
  clause-split compose accepted by the frozen missions gate.

## Bounded, disclosed, not patched (each needs its own boundary/ruling)
- B1: the door planner and the missions deterministic planner REFUSE 3-part conjunction patterns
  by their frozen laws (receipted honest refusals — TASK-task-f4170f30, m-mission-88cdc70a).
  Clause-split therefore fires today on the chat path and the missions explicit-tasks[] path.
  Changing the frozen planners is NOT part of this candidate.
- B2: compute clauses with unresolvable arithmetic route to the external fallback; their outcome
  varies between grounded refusal (fast backend) and disclosed-unavailable (8s abort) — both
  honest, variance is external-model latency, not a truth change.
- B3: orchestrateStream (streaming chat) is NOT hooked — bounded to orchestrate + orchestrateJob.
- B4: clause cap 4 (search1's own law). A 5+-part instruction is split at 4 parts max; the
  5th+ clause text is silently dropped by the splitter — RECORDED DEFECT CLASS: cap-truncation.
  Not observed by any battery; flagged for the next revision of this candidate if promoted.

## Deployment
- Live: https://harz-intelligence.harz.workers.dev (wrangler deploy, full binding set, version
  7c51e57d-5b68-435e-af6a-d90e8e7a3ad9).
- Pre-candidate sealed state preserved at vault commit f358336.

## Promotion condition (Dad's ruling required)
PROMOTE freezes this law and closes F-GAP4-2c; REVERT restores f358336 (one commit, no surgery).

---

## PROMOTED — Dad's ruling, Oct 9, 2026. F-GAP4-2c: PROMOTED → SEALED.

PROMOTION RULING (verbatim law preserved):
1. The original failure is resolved at the correct boundary: timeout-triggered splitting,
   ordinary requests untouched, number-aware splitting protects values such as 2,000,
   each clause follows real routing (frozen specialists first, local reasoner when capable,
   external only when the registry authorizes), and the aggregate verifies answered claims
   rather than mistaking disclosure text for an answer.
2. The exposing case now composes honestly: account number via frozen specialist at 0 ext,
   Estate Network URL via local reasoner, GDEG-to-Naira refused because the corpus contains
   no documented conversion rate. The refusal is CORRECT — the previous expectation of 30,000
   is not evidence of a conversion rate, and the system must not manufacture one to complete
   a composed answer.
3. The frozen regression boundary remains intact; the three gate-caught implementation defects
   are evidence of effective gating, not grounds for rejection.
4. THE FOUR LIMITATIONS REMAIN EXPLICIT AND NOT REPRESENTED AS FIXED:
   B1 door/missions planners refuse three-part conjunctions under frozen law — remains
   separate; do not silently broaden their authority.
   B2 compute-clause variance between grounded refusal and disclosed unavailability with
   external latency — remains open for a separate consistency investigation.
   B3 streaming path not connected — documented limitation; no streaming capability claim.
   B4 splitter cap-truncation beyond four clauses (5+ clause instructions) — documented
   boundary; do not claim arbitrary-length composition. THE FIVE-CLAUSE CEILING STAYS IN THE
   SEALED RECORD.

BOUNDARY OF THIS CLOSURE (verbatim): "The evidence supports closing this specific finding,
not declaring every multi-clause instruction solved."

Sealed state: candidate deployed build 3c92f01; previous fallback f358336 retained as the
one-commit rollback point; scope: timeout-triggered, number-aware clause orchestration;
evidence: six successful compositions of the exposing case, reported frozen regression suite
green; external calls: zero in the reported full frozen regression bar; remaining
limitations: four, individually disclosed.

Decision: PROMOTE. No revert. No unrelated changes to the frozen paths. The next workstream
can proceed without reopening F-GAP4-2c.

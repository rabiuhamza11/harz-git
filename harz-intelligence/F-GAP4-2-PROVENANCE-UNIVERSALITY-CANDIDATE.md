# F-GAP4-2 — VALUE-SPECIALIST PROVENANCE UNIVERSALITY — CANDIDATE (built + gated, awaiting Dad's ruling)

**Deployed:** Oct 9, 2026, worker version `3b08ede1-ad27-4cc0-a786-48e6c6a8f98b`
**Scope:** worker.js orchestration layer ONLY. search1.js v1.2 frozen extractor untouched. Fee, URL, enum, count, procedure, reasoner paths untouched.
**Law implemented (verbatim, frozen packet contract at worker.js ~5674):** "a question scoped to ingested material may use ONLY ingested artifacts as evidence; if nothing ingested matches, the honest result is refusal (corpus never substitutes)."
**Dad's standing law:** "Provenance must win over retrieval convenience."

## Diagnosis (empirical, Oct 9 morning)

Two provenance escape routes at the identifier/value specialist, proven live before the fix:

**Route A — corpus value_candidates outlive the ingest scope.** `buildPacket` extracts `value_candidates` from corpus documents during packet assembly. The ingest-scope replacement at the packet layer correctly replaced `selected_evidence` with intake-only units but left `value_candidates` populated from corpus. Repro (conversation fgap42-diag-1): ingest-scoped question "According to the ingested document, which UBA bank account does HARZ use for NGN transfers?" answered `value: 2034326424 | source: Buy NRL — HARZ Cloud` — a corpus document NOT in the evidence set (no [s] cite), while the evidence set was correctly intake-only. Corpus evidence answered an ingest-scoped question. Direct path: `value_extraction` (not even the ladder).

**Route B — the value ladder is corpus retrieval by construction.** `valueFallbackLookup` (the F-GAP4-2 bounded coverage ladder) runs `search1Baseline` + `search1FetchPage` raw against the corpus. Ungated for ingest-scoped packets, it can substitute corpus values whenever packet extraction finds nothing.

**Verified honest before the fix (no change needed):** the fee specialist reads `selected_evidence` (answered the ingested 50-naira note correctly); the URL specialist refuses honestly; enum/count/procedure/reasoner all compose over `selected_evidence`.

## The fix (one site, additive, no frozen-layer change)

At the ingest-scope replacement (the single packet boundary, shared by chat and runTaskH paths):

1. `packet.value_candidates` is RE-EXTRACTED from the intake units by the SAME frozen v1.2 `extractValueCandidates` (entity-must, title-or-window binding, all gates unchanged). Intake-grounded values stay reachable; the value path stays live for ingest-scoped questions.
2. Corpus-derived `packet.conflicts` and `packet.mirror_groups` are dropped (they were computed over documents no longer in evidence).
3. `packet.ingest_scoped = true` flags the packet.
4. Both `valueFallbackLookup` call sites are guarded: the corpus ladder never runs for an ingest-scoped packet.

Resulting law, end to end: an ingest-scoped exact-value question answers from intake (with [s] cite, document_id 20000+k) or refuses honestly. The corpus never substitutes. Provenance is now universal across every specialist path.

## Gates (all post-deploy, all 0 external calls)

1. **Positive, intake-grounded:** "According to the ingested document, which UBA account does HARZ Pay use for transfers?" → `value: 2034326424 | source: [INGESTED v1] acct-note-v2.txt | document_id: 20000 | [s1]` — verdict all-supported.
2. **Positive, NGN discriminator:** ingest-scoped UBA/NGN account question → answered from INGESTED, all-supported.
3. **Negative (the refusal law):** "According to the ingested document, which Paystack account does HARZ use for transfers?" — the Paystack discriminator exists nowhere in intake → honest value-guard refusal; the corpus ladder did NOT substitute a UBA answer. Verdict 2-unsupported at verify (expected).
4. **Fee from intake:** 50 naira flat quoted verbatim from [INGESTED v1] fee-note-v2.txt. Verdict 2-unsupported = the KNOWN F-GAP4-1 verify idf-threshold boundary over ingested segments (Dad's Oct 8 bounded ruling; refusal at the frozen threshold is correct) — the answer itself is correct and provenance-bound; unchanged by this candidate.
5. **URL refusal:** unchanged honest refusal.
6. **Non-scoped flagship:** "Which Nigerian bank does HARZ use for NGN transfers?" → 2034326424 from corpus doc 10470, ladder live, 0 ext. Frozen value path untouched.
7. **Full frozen bar green post-deploy:** agents 13/13, test10 5/5 + 5/5 (incl. value_regression, fee_variant), test8 5/5 + 5/5, im1 24, vs1 30, creation1 24, sem1 12/12, ter1 12/12, semvid1 16/16, router1 15/15, m2 17, m3 16, m4 16 — all 0 ext.
8. **F-GAP4-2c sealed regression intact:** the 3-part composed case still composes (3 parts, account + estate URL + honest compute refusal, all-supported).
9. **Determinism:** repeat runs of the intake-grounded cases behaviorally identical.

## Disclosures

**D1 — the intake-store wipe is frozen gate hygiene, and my battery run hit it mid-gate.** testm2's frozen code wipes the entire intake store before scoring ("gate hygiene: deterministic scoring requires a clean store (test-scoped wipe)") and resets the registry. Running the battery suite mid-gate destroyed the diagnostic intake artifacts (acct-note.txt, fee-note.txt, real-note-1.txt, det.txt) used by the earlier repro — my "registry corruption" hypothesis was WRONG; the wipe is deliberate frozen design, not a defect. Diagnostics were re-ingested as acct-note-v2.txt / fee-note-v2.txt and the full gate suite re-run clean. Consequence recorded: diagnostic intake artifacts are EPHEMERAL under the frozen m2 wipe law; intake-scoped gates must run AFTER the battery suite, never before. No real user artifact was lost (none exist yet; the store held only battery fixtures and diagnostics).

**D2 — F-GAP4-1 verify asymmetry persists (unchanged).** Quotes over ingested segments can fall under Verify-1's idf threshold → N-unsupported verdict on a provenance-correct answer. Dad's Oct 8 ruling stands: bounded finding, no patch, threshold never lowered.

**D3 — scope boundary.** This closes the F-GAP4-2 precondition for the SPECIALIST paths (value/identifier ladder + packet extraction). It does not claim universal provenance for paths outside the packet spine (stream path B3 remains not hooked; missions/door planners unchanged).

## Remaining open in this stack (unchanged by this candidate)

- F-GAP4-2b minor: fee words can steal account questions into fee_lookup.
- B2: compute-clause external latency variance (separate consistency investigation).
- D3 above: stream path not hooked.

## Awaiting ruling

**PROMOTE** → freeze this law, F-GAP4-2 CLOSED (the universal-provenance precondition satisfied), or **REVERT** → worker redeploy from git main pre-candidate state.

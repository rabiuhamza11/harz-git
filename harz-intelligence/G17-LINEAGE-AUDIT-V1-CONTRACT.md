# G17 PROVENANCE LINEAGE AUDIT — CONTRACT (LINEAGE-AUDIT-V1)

Frozen: 2026-10-03, BEFORE any code change. Anchor: 431e185 (G16 closed).
G15/G16 fixtures and contracts reused byte-identically, never modified.

## THE QUESTION (Dad, verbatim)
Can HARZ preserve the complete lineage when evidence evolves?
Chain under test:
Research A + Research B -> conflict -> Research C -> resolution ->
creation -> reader. Let the test prove the evidence graph, not the name.

## WHAT IS ALREADY FROZEN (audited before building — the no-duplicates law)
- Every task receipt is content-hashed: fixtures mSha('verified:fixture:id:'
  + sha(answer)); refusal receipts mSha('refused:' + text); compose receipts
  = the studio bundle receipt sha (covers the exact prompt bytes and every
  delivered child). Mission receipt = chained hash over all task receipts
  (HARZ-MISSION-1|id, then h = mSha(h + ':' + receipt) per task).
- The compose record already carries per-claim originating-task attribution
  (evidence array: source_task, type, instruction, receipt, answer_sha256,
  claims_sha256, confidence, provenance) — G13/G14.
- G16 added the structured conflict object and the resolution_from
  disclosure (resolution_sources with receipts and shas).

## THE ONE ADDITION (gate 2 — resolution must cite what it resolves)
An accepted resolution disclosure gains resolves_conflict: the explicitly
referenced conflicting evidence it resolves — every cited evidence package
that is NOT a designated resolution source, each with source_task,
source_receipt, claims_sha256, answer_sha256, provenance. The resolution
never 'replaces' A/B (gate 3): they remain cited evidence, carried in the
prompt byte-exact, and their original task records remain untouched
history. This addition touches NO receipt formula: the compose receipt
stays the studio bundle hash (prompt unchanged), so G13-G16 receipts and
artifacts remain byte-identical.

## LINEAGE RECONSTRUCTION LAW (gate 5)
A downstream artifact is reconstructible from the mission record + the
artifact's own receipt endpoint alone: original claims (task answers ->
frozen-format extraction, shas recomputed), the conflicting evidence
(resolves_conflict cites A/B with receipts + shas), follow-up research
(resolution_sources cite C with receipt + shas), designated resolution
(resolution_from + acceptance law), creation instruction (the compose
task's own instruction), and the final reader judgment (the artifact
receipt: states, 8 frozen checks, prompt_sha256, request_id reconstruction
of the exact prompt bytes). The prior mission's conflict refusal remains
independently refetchable history with its own valid receipt chain.

## TAMPER DETECTION (gate 6) — two lawful mechanisms, both tested
(a) Receipt chains: any mutation of a completed task's answer/refusal bytes
    breaks that task's receipt, which breaks the mission receipt chain.
    Mutating any task receipt in the record breaks the chain.
(b) Cross-verification: any mutation of a lineage disclosure field (evidence
    claims_sha256, resolution source shas) mismatches the recomputed shas
    of the immutable task answers it cites.
Tamper tests run on LOCAL COPIES of live records (the live KV records are
server-held; the test proves the chain MATH catches the tamper, which is
what any future auditor would run).

## REORDER LAW (gate 7)
Lineage is CONTENT-ADDRESSED, not position-addressed: fixture receipts are
position-independent; the compose prompt is instruction + cited claims
bytes in caller order. Inserting an UNRELATED uncited task shifts ids
honestly (re-derived receipts, larger mission chain) but cannot silently
alter the lineage: the artifact must be BYTE-IDENTICAL when the cited
evidence bytes are identical.

## G17 INVARIANT (Dad, verbatim)
New evidence may extend the truth history; it may never erase the history
that made the new evidence necessary.

## TEST MATRIX (frozen before execution)
L1 LINEAGE CONSTRUCTION: [fixA, fixB, fixC, compose resolution-request
   evidence_from [1,2,3] resolution_from [3]] -> compose verified; evidence
   array carries all three originating tasks (receipts, shas, provenance);
   resolution disclosure cites C AND resolves_conflict cites A+B with
   their claims shas; artifact delivered; mission verified.
L2 FULL RECONSTRUCTION: from the L1 record + artifact endpoint alone,
   reconstruct every element of the chain (claims shas recomputed locally;
   request_id reconstruction of the prompt; reader judgment states). Also
   refetch the PRIOR conflict mission (T1-style) — history intact, receipt
   chain re-verifies.
L3a TAMPER-CLAIMS: on a local copy, mutate fixA's answer bytes -> fixture
   receipt mismatch -> mission chain mismatch.
L3b TAMPER-LINEAGE: on a local copy, mutate an evidence claims_sha256 ->
   recomputed claims sha mismatches the cited task's actual bytes.
L3c TAMPER-RECEIPT: on a local copy, mutate a task receipt -> mission
   receipt chain mismatch.
L4 REORDER: [fixA, fixB, fixC, fixD-unrelated(frozen fixture A again),
   compose evidence_from [1,2,3] resolution_from [3]] -> artifact
   BYTE-IDENTICAL to L1's; fixture receipts of tasks 1-3 identical to L1's;
   the unrelated task shifts ids honestly and changes nothing cited.
L5a INELIGIBLE ANCESTOR: resolution_from [refused task] refuses;
L5b resolution_from [nonexistent task 9] refuses;
L5c resolution_from [task not in evidence_from] refuses.
L6 STALE ANCESTOR: [fixA, fixB, orchestrate(widget -> honest refusal),
   compose1 conflict-preserving evidence_from [1,2], compose2
   evidence_from [1,2,3]] -> compose1 succeeds; compose2 citing the
   refused ancestor STILL refuses after a later success in the same
   mission — a stale ancestor never silently revives.
L7 REGRESSION: G13 4811ba9f; G14 aa5db44c; G15 f300ca53 + resolution
   refusal receipt-identical + single-source 6ef68cb4; G16 conflict refusal
   receipt + T2 resolution artifact 6d5eda75 + T5 inconclusive; kasuwa
   7500bb17; proof-request refusal; research receipts 9ae4d401/81daf540;
   determinism repeat of L1 byte-identical; sovereignty ext 0.
L8 BROWSER: L1 artifact + the L1 mission record + the prior conflict
   record fetched live through the actual HTTP surface (standing order).

## GATES
G1 immutable originating tasks per claim: L1, L2
G2 resolution explicitly references what it resolves: L1 (resolves_conflict)
G3 A/B never replaced, remain cited + history: L1, L2
G4 mission receipt chain captures complete ancestry: L2, L3c
G5 full downstream reconstruction: L2
G6 tampering breaks the appropriate chain: L3a, L3b, L3c
G7 reorder cannot silently alter lineage: L4
G8 ineligible ancestor refuses: L5a-c
G9 stale ancestor never silently valid: L6
G10 G13-G16 regression byte-identical + determinism + sovereignty + browser:
    L7, L8

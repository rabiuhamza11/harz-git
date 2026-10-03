# G17 PROVENANCE LINEAGE AUDIT — TRACE (2026-10-03)

Contract: G17-LINEAGE-AUDIT-V1-CONTRACT.md (frozen 7510d9d before code;
anchor 431e185). Fixtures reused byte-identically. ONE addition implemented
(resolves_conflict on accepted resolutions) — it touches NO receipt
formula, proven by G16's resolution artifact AND receipt remaining
byte-identical (6d5eda75 / same receipt as L1).

## PRE-BUILD AUDIT (no-duplicates law)
The ancestry skeleton already existed, frozen in G12-G16: content-hashed
task receipts, studio bundle hash covering the exact prompt bytes, chained
mission receipts, per-claim originating-task attribution, structured
conflict, resolution_from disclosure. G17 added the missing edge — the
resolution's explicit citation of the evidence it resolves — and then
PROVED the whole graph with tests, not new machinery.

## TEST MATRIX RESULTS (all live)
L1 LINEAGE CONSTRUCTION: [fixA, fixB, fixC, compose resolution-request
   evidence_from [1,2,3] resolution_from [3]] -> compose VERIFIED; evidence
   array carries all three originating tasks (receipts 42f63fe1/f1dfdff1/
   5ca4beb4, claims shas recomputed); resolution disclosure cites C
   (resolution_sources) AND resolves_conflict cites A+B (claims shas +
   receipts + provenance + resolves_law: 'extends the history, never
   replaces the evidence it resolves'); artifact 6d5eda75 delivered. PASS
L2 FULL RECONSTRUCTION: from the mission record + artifact endpoint alone:
   original claims reconstructed and sha-verified (all three); conflicting
   evidence (A vs B) identified by the resolution's own citation and
   sha-verified; follow-up research C cited with receipt + sha; designated
   resolution (resolution_from [3]); creation instruction + all claims ->
   request_id reconstruction of the exact prompt MATCH; reader judgment
   fetched live (states all true, 8 checks green, what_remains=[],
   prompt_sha256 == locally reconstructed prompt hash). The PRIOR conflict
   mission's history refetched and its receipt chain re-verified intact.
   PASS
L3 TAMPER (local copies of live records, chain math exactly as an auditor
   would run it):
   L3a mutated claim bytes -> claims_sha256 mismatch: CAUGHT
   L3b mutated task receipt -> mission receipt chain broken: CAUGHT
   L3c mutated lineage disclosure sha -> cross-verification mismatch
      against the immutable task bytes it cites: CAUGHT
   untouched record chain still verifies: TRUE. PASS
L4 REORDER: unrelated uncited fixture inserted as task 4 -> compose
   artifact BYTE-IDENTICAL to L1's; cited fixture receipts position-
   independent (identical); the inserted task shifts ids honestly and
   changes nothing cited. Lineage is content-addressed. PASS
L5 INELIGIBLE ANCESTORS: resolution citing a refused ancestor refuses;
   citing nonexistent task 9 refuses; citing a task outside evidence_from
   refuses. All three deterministic, all disclosed. PASS
L6 STALE ANCESTOR: refused research task; compose1 (citing only A/B)
   succeeds; compose2 citing the stale refused ancestor STILL refuses,
   in the same mission, after a later success — a stale ancestor never
   silently revives. PASS
L7 REGRESSION: G13 4811ba9f PASS; G14 aa5db44c PASS; G15 f300ca53 PASS +
   resolution refusal receipt-identical with conflict object PASS; G16
   resolution artifact 6d5eda75 PASS with IDENTICAL receipt (the addition
   changed no hash); kasuwa 7500bb17 PASS; proof-request refusal PASS;
   determinism: repeat of the L1 chain -> identical artifact + receipt;
   sovereignty: all external_calls 0. PASS
L8 BROWSER: L2 fetched the artifact endpoint live (reader judgment);
   the mission index fetched live shows every G17 mission with the exact
   expected states — reorder (5x verified), ineligible (refused composes),
   stale ancestor ([verified, verified, refused, verified, refused]),
   lineage construction verified. PASS

## GATE SUMMARY
G1 immutable originating tasks per claim: PASS (L1, L2)
G2 resolution explicitly references what it resolves: PASS (resolves_conflict)
G3 A/B never replaced, remain cited + history: PASS (L1, L2)
G4 mission receipt chain captures complete ancestry: PASS (L2, L3b)
G5 full downstream reconstruction: PASS (L2)
G6 tampering breaks the appropriate chain: PASS (L3a-c)
G7 reorder cannot silently alter lineage: PASS (L4)
G8 ineligible ancestor refuses: PASS (L5a-c)
G9 stale ancestor never silently valid: PASS (L6)
G10 G13-G16 regression byte-identical + determinism + sovereignty + browser:
    PASS (L7, L8)

## WHAT THE TEST PROVED (in Dad's words, without the premature name)
The chain is no longer merely a sequence of API calls: every claim traces
to an immutable originating task; every resolution cites the evidence it
resolves; tampering with any ancestor — bytes, receipt, or lineage edge —
breaks a chain or a cross-verification; unrelated work cannot silently
alter lineage; stale evidence never silently revives; and the complete
ancestry reconstructs from the record and the artifact alone. New
evidence extended the truth history. Nothing was erased.

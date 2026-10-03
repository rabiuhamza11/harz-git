# G15 CONFLICT COMPOSITION AUDIT — TRACE (2026-10-03)

Contract: G15-CONFLICT-AUDIT-V1-CONTRACT.md (frozen 13e383a before code;
anchor b10234e). Fixture frozen OUTSIDE the production corpus — the corpus,
search index, and reasoner evidence were never touched (T5-R6: 'GDEG test
widget' goal refuses — the planner has no plan; the fixture is unreachable as
corpus knowledge).

## THE SYNTHETIC CONFLICT (frozen, both sha256s in the contract)
G15-FIX-A: 'The GDEG test widget is priced at 500 HARZ 【S1】' (verified
against the frozen fixture record only; task type 'fixture', disclosed)
G15-FIX-B: 'The GDEG test widget is priced at 800 HARZ 【S1】' (same)
A genuine contradiction, X vs ¬X, flowing through the REAL G13/G14 adapter.

## THE RESOLUTION LAW (as frozen)
Verification establishes each claim against its own source, NEVER their
agreement. Resolution over multi-source evidence is unsupported arbitration:
refused at the mission layer by 7 disclosed deterministic patterns. Single-
source compositions unaffected. Conflict-preserving instructions proceed.

## TEST MATRIX RESULTS (all live)
T1 CONFLICT-PRESERVING: [fixture A, fixture B, compose 'Create an image
   about the widget price discussion' evidence_from [1,2]] -> mission
   VERIFIED, sovereign true, ext 0. Both contradictory claims carried
   byte-exactly (request_id 5cf5488223176228f4d346e8 reconstructed locally
   from the mission record alone: instruction + claimsA + '\n\n' + claimsB —
   nothing added, no winner). Artifact f300ca53d8ad0ce0b9d5fe9e delivered,
   reader checks all green. Separate per-source attribution (both typed
   'fixture' — honest about what they are). PASS
T2 RESOLUTION REQUEST: 'Create a report stating which of these conflicting
   claims is true' -> refused with the frozen resolution law verbatim;
   evidence refs [1,2] disclosed. PASS
T3 PATTERN SWEEP: 4 resolution phrasings (determine the correct price / the
   true claim / resolve the conflict / stating which claim is correct) ALL
   refused; 3 conflict-preserving phrasings (comparison showing both claims /
   both prices / about the two widget prices) ALL proceeded and delivered.
   PASS
T4 SINGLE-SOURCE UNAFFECTED: resolution phrasing with evidence_from [1] only
   -> G15 rule not applied; verified and delivered under the G13 single-
   source law. PASS
T5 REGRESSION: G13 single-source artifact unchanged (4811ba9f...); G14
   multi-source unchanged (aa5db44c...); plain compose unchanged (kasuwa
   7500bb17...); proof-request refusal intact; research receipt unchanged
   (9ae4d401...); corpus uncontaminated ('GDEG test widget' is not
   searchable). ALL PASS
T6 DETERMINISM: repeat T1 -> byte-identical artifact + identical receipts;
   the T2 refusal text is deterministic (parameterized only by the source
   count) so its receipt is identical by construction. PASS
T7 SOVEREIGNTY: every mission in the matrix external_calls 0, sovereign true. PASS
T8 BROWSER: T1 artifact fetched live — all states true, frozen reader's 8
   checks green, receipt what_remains_incomplete=[]; T2 refusal mission
   visible live in the mission index (verified, verified, refused). PASS

## TRACE CORRECTION (self-audit, recorded here — honesty about my own records)
The G13/G14 traces described the PNG tEXt prompt-words as carrying the claims
'byte-exactly'. That was overstated: the PNG tEXt is the creator's
DETERMINISTIC WORD-FILTERED rendition of the prompt (stopwords and numbers
filtered; citation markers kept). The raw claim bytes' journey to creation is
proven by the request_id reconstruction (sha256 of the exact prompt) and the
receipt's prompt_sha256 — those cryptographic proofs are and were correct.
No gate result changes; the wording of the metadata claim is corrected here.

## GATE SUMMARY
G1 both eligible, receipts/provenance separate: PASS (T1)
G2 adapter carries both, no winner: PASS (T1 + request_id byte-proof)
G3 creation never converts the conflict into a resolved fact: PASS
G4 creator never the arbiter; resolution belongs to research: PASS (T2, T3)
G5 mission verification distinguishes the cases: PASS (T1-T3 records)
G6 reader independently judges: PASS (T1, T8)
G7 regressions unchanged, corpus uncontaminated: PASS (T5)
G8 sovereignty + determinism + browser + trace + receipt: PASS (T6-T8)

## THE INVARIANT, HELD UNDER GENUINE CONTRADICTION
Evidence was combined. The contradiction was carried. It was not silently
resolved — and when the caller asked for resolution, the mission said so,
honestly, and named the lawful path: ask research, because composition never
adjudicates.

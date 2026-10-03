# G14 MULTI-EVIDENCE COMPOSITION AUDIT — TRACE (2026-10-03)

Contract: G14-MULTI-EVIDENCE-AUDIT-V1-CONTRACT.md (frozen 61cf8d5; defect D2
frozen e367582 before its fix; anchor 2db8438). Recorded: AUDIT + DEFECT FIX,
per the freeze-first law.

## DEFECT D2 — FOUND, FROZEN, FIXED, RE-TESTED (the audit's central discovery)
MEASURED: every second-position orchestrate task in an explicit chain returned
the identical generic canonical-URL fallback answer (claims len 264,
question-independent, probed live on Pay/Faucet/Oracle/Health). Root cause:
the missions executor appended prior answers to the research message as
silent 'context'; the FROZEN reasoner's question decomposition (taskPlanSteps)
misroutes the combined text to the canonical_url fallback. The frozen reasoner
answered honestly what it was given — the defect was the executor's message
construction. Consequences: (a) multi-research missions could not produce
independent sources; (b) the fallback claims mention 'evidence' and lawfully
refused at the frozen creation intake — blocking multi-evidence composition;
(c) silent context injection violated the explicitness law (no auto-
consumption of mission memory) and source independence by construction.
MINIMAL FIX (missions executor only, frozen reasoner untouched): research
tasks receive exactly their own instruction. prev[] injection removed.
DISCLOSED FEATURE CHANGE: deliberate chained-context research is no longer
silently available; if wanted, it must be an EXPLICIT reference design with
its own contract. No frozen law depends on it and no audit ever positively
verified chained-context answer quality.

## TEST MATRIX RESULTS (all live, post-D2-fix)
M1 Multi-source positive: [Wallet, Pay, compose evidence_from [1,2]] ->
   mission VERIFIED, sovereign true, ext 0. Both sources independently
   verified (receipts 9ae4d401... + 81daf54042...). Claims carried in caller
   order, joined by nothing but '\n\n'. Byte-proof: request_id
   9dc2dab1c1bbf799e4cc2a27 reconstructed locally from the mission record
   alone — PASS. Delivered artifact aa5db44c39502cf658501b14...
M2 Ordering: swapped refs [2,1] -> different lawful deterministic artifact
   (55ff9ea5...); byte-proof PASS on the swapped order. The caller composes
   the order; the adapter never reorders.
M3 Duplicate refs [1,1] -> the same claims carried TWICE, byte-exact; no
   dedup (dedup would be semantic arbitration); byte-proof PASS; disclosure
   carries both entries.
M4 Mixed eligibility: [verified, refused-task] -> WHOLE handoff refused
   ('task 2 is not verified — unverified evidence may not enter creation');
   [verified, missing-ref 7] -> WHOLE handoff refused. Never partial
   evidence. Both PASS.
M5 Conflicting/trigger claims: a source whose CLAIMS themselves contain
   intake-trigger language (HARZ Chain: 'Proof of Edge') remains subject to
   the UNCHANGED frozen intake — the compose refuses, both sources stay
   independently verified and uncertified. No-merge proven at byte level:
   the prompt is instruction + claims1 + '\n\n' + claims2 — the adapter adds
   NOTHING between claims (byte-proof M1/M2/M3). CORPUS CONFLICT FINDING,
   recorded honestly: no genuine contradiction between verified corpus
   claims was found in this audit and none was fabricated; the architecture's
   answer is identical either way — carry both byte-exactly, no arbitration,
   the reader judges the artifact.
M6 Attribution: per-source receipt/confidence/provenance separately
   disclosed; mission receipt chain recomputed locally over all three task
   receipts — PASS.
M7 Regression: G13 single-source artifact unchanged (4811ba9f...); plain
   compose unchanged (kasuwa 7500bb17...); proof-request refusal intact;
   research mission verified; unverified-evidence refusal intact. ALL PASS.
M8 Determinism: repeat M1 -> byte-identical artifact + identical receipts. PASS
M9 Sovereignty: every mission in the matrix external_calls 0, sovereign true. PASS
M10 Browser: the multi-evidence artifact fetched live — all states true,
   frozen Vision V1 reader's 8 checks green, PNG metadata carries BOTH claims
   byte-exactly in caller order (Wallet claims then Pay claims), receipt
   what_remains_incomplete=[]. PASS

## GATE SUMMARY
G1 deterministic ordering: PASS (M1, M2)
G2 conflicting/duplicate without arbitration: PASS (M3, M5 + byte-proofs)
G3 mixed eligibility refuses whole handoff: PASS (M4a, M4b)
G4 attribution per source: PASS (M1, M6)
G5 creator adds nothing between claims: PASS (byte-proofs)
G6 reader still judges independently: PASS (M1, M10)
G7 regressions unchanged: PASS (M7)
G8 sovereignty + determinism + browser + trace + receipt: PASS (M8, M9, M10)

## THE INVARIANT, HELD UNDER MULTIPLICITY
Multiple independently verified sources now compose: each source verified
against its own retrieval, claims extracted byte-exactly per the G13 law,
carried in the caller's explicit order with nothing added between them,
receipt/provenance/confidence staying metadata on the chain, the creator
receiving only claims + instruction, and the unchanged frozen reader judging
the resulting artifact alone. The creator never became its own verifier —
and the adapter never became an editor or an arbitrator.

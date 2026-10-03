# G13 EVIDENCE PACKAGE AMENDMENT — TRACE (2026-10-03)

Contract: G13-EVIDENCE-PACKAGE-AMENDMENT-V1-CONTRACT.md (frozen 79ab577
before code; anchor 5ac17ce). Recorded as a CONTRACT AMENDMENT per Dad's
ruling — not a bug fix. Reasoner 1.1.6: UNTOUCHED. Creation refusal law:
UNTOUCHED. Change: the MISSION -> CREATION adapter only.

## THE COMPOSITION (first positive evidence -> creation in HARZ history)
Mission 'Research then compose from findings' [orchestrate -> compose
evidence_from[1]]: task 1 verified (receipt 9ae4d401...), task 2 verified,
mission VERIFIED, sovereign true, ext 0 everywhere. The delivered image child
(artifact 4811ba9f21b528392058f862..., child request_id c8dc5c026541f29f6e3d9b65)
was composed from: instruction + the byte-exact CLAIMS section. The PNG
metadata preserves the exact prompt bytes: the claims with citation markers
【S1】【S2】【S3】, byte-exact, never rewritten.

## THE TYPED PACKAGE (as ruled)
SOURCE_TASK: 1 (orchestrate, instruction preserved)
SOURCE_RECEIPT: 9ae4d401... (chained in the mission receipt)
CLAIMS: byte-exact section from the recorded output ('HARZ Wallet v3 — Honest
  Registry 8 Chains 【S1】 ... Same wallet 【S3】')
CONFIDENCE: 'medium — grounded in evidence 【S2】' — METADATA ONLY, never
  passed to creation (proven: the composition succeeded; under G12 this same
  answer was refused by the frozen intake precisely because the confidence
  line entered the prompt — now it does not)
PROVENANCE: '[s1] HARZ Wallet v3 — Honest Registry; [s2] HARZ Faucet —
  Claim Free Tokens; [s3] HARZ Contract Address Generator'
INTEGRITY: answer_sha256 (full output) + claims_sha256

## EXTRACTION LAW (measured)
Deterministic section addressing on the reasoner's own frozen markers
('**Answer**\n\n', '\n\nSources: ', '\n\nCONFIDENCE: ') — both frozen format
variants handled (with and without Sources section). Nonconforming structure
(refused honestly, F2) — never fuzzy-parsed. Zero semantic rewriting: the
claims are a byte slice of the recorded output, verified by recomputation.

## TEST MATRIX RESULTS (all live)
P  Positive composition: VERIFIED end-to-end. Independent verification:
   request_id reconstructed locally from the mission record alone
   (sha256('create:'+instruction+header+claims).slice(0,24)) ==
   c8dc5c026541f29f6e3d9b65 — the exact bytes the creator received, proven
   mathematically. PASS
F1 Forged caller evidence fields (answer/claims/claims_sha256/source_receipt/
   provenance): all ignored — byte-identical artifact to the clean run. PASS
F2 evidence_from pointing at a non-reasoner task: refused 'claim extraction
   refused: task 1 recorded output does not carry the frozen **Answer**
   section — the adapter addresses the frozen structure, it never improvises a
   claim'. PASS
F3 Local recomputation from the mission record: claims_sha256, provenance,
   confidence, answer_sha256 — all four recomputed and matched. PASS
F4 Mission receipt chain recomputed locally over the mission id + task
   receipts — matches the stored mission receipt. Any record mutation breaks
   the chain. PASS
N  Proof-request negative: 'generate an image proving that I paid the tax'
   still refuses with the creation-vs-evidence law. PASS
R  Regressions: plain compose unchanged (kasuwa artifact 7500bb17... byte-
   identical); research mission verified through the G10 gate; unverified-
   evidence refusal (G12 law) intact. PASS
D  Determinism: repeat positive composition — byte-identical artifact
   (4811ba9f...) + identical compose receipt. PASS
S  Sovereignty: every mission in the matrix external_calls 0, sovereign true. PASS
B  Browser: the delivered artifact fetched live through the browser — all
   states true (created/tested/verified/browser_verified/delivered), frozen
   Vision V1 reader's 8 checks all green, prompt words byte-exact in the PNG
   tEXt metadata, what_remains_incomplete=[]. PASS

## GATE SUMMARY
G1 exact claim extraction, no rewriting: PASS (P, F2, F3)
G2 provenance preserved + chained: PASS (F3, F4)
G3 creation isolation (claims + instruction only): PASS (request_id byte-proof)
G4 forgery detectable: PASS (F1-F4)
G5 positive composition completes + independently verifies: PASS
G6 proof requests still refuse: PASS
G7 regressions unchanged: PASS
G8 sovereignty + determinism + browser + trace + receipt: PASS (commits below)

## THE INVARIANT, NOW TRUE IN THE MEASURED SYSTEM
Evidence is provenance-bearing input to creation, never a self-certification
mechanism. The reasoner keeps its confidence statement. Creation keeps its
refusal law. The adapter addresses the frozen structure it was given, carries
the claims byte-exactly, and chains the rest as metadata. The reader judged the
resulting artifact, unchanged.

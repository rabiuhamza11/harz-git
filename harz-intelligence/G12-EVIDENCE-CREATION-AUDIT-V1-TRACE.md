# G12 EVIDENCE -> CREATION AUDIT — TRACE (2026-10-03)

Contract: G12-EVIDENCE-CREATION-AUDIT-V1-CONTRACT.md (frozen b9f88a9 before any
code). Anchor: f30fbe6. Changes: MISSIONS layer handoff only. Frozen and
untouched: createParse, V3 Studio, frozen readers, reasoner 1.1.6, verify1Check,
planner, search, packet.

## THE HANDOFF (built exactly as contracted)
1. SELECTION: compose tasks may carry explicit evidence_from refs (task ids).
   Eligibility: task exists in the same mission AND state 'verified' AND
   receipt present. Missing ref -> honest refusal. Unverified ref -> honest
   refusal. Never improvised.
2. PACKAGING: executor-built canonical packages from its OWN stored task
   records only — { source_task, source_task_type, source_instruction,
   answer_sha256, answer_text (byte-exact, never rewritten), task_receipt,
   carry_law }. Caller-supplied evidence fields are NEVER read (injection is
   data). Fixed key order, compact JSON serialization.
3. CREATION CONTRACT: creator receives instruction + '\n\n[VERIFIED MISSION
   FINDINGS — byte-exact from the cited task receipt; use but never certify or
   alter]\n' + JSON. Exact bytes PROVEN: the child request_id is derived from
   sha256('create:'+prompt).slice(0,24) — locally reconstructed from the mission
   record alone: 9666d4340259209cbb641db8 == actual child request_id. GATE 3
   PASS, mathematical.
4. CREATOR BOUNDARY: evidence bytes enter as immutable prompt input; the
   creator cannot alter them (byte-proof above), cannot forge receipts
   (packages from executor records), certifies nothing (the source task's
   claim_check remains the only verification of the evidence).
5. VERIFICATION DISTINCTION: derivation chain answer_sha256 -> prompt_sha256
   (via request_id proof) -> artifact_sha256. An artifact claiming evidence
   without the chain cannot produce matching request ids.

## BUILD FINDING (fixed in the handoff layer, no cross-layer rescue)
The first packaging header ('VERIFIED EVIDENCE PACKAGE — provenance preserved')
contained the words 'EVIDENCE' and 'provenance' — the frozen createParse
lawfully types any prompt containing prov(e|ing)|proof|evidence as an
'evidence' request and the creator refuses. The frozen layer was RIGHT; my
serialization was wrong. Fixed by neutral labels (VERIFIED MISSION FINDINGS /
carry_law / source_task). The frozen parser was not touched.

## THE CENTRAL G12 FINDING — THE INTRINSIC CONFLICT (measured, unfixed, for Dad)
The frozen reasoner 1.1.6's answer format ends with:
  'CONFIDENCE: medium — grounded in evidence 【S2】'
The frozen creation intake refuses ANY prompt containing evidence/proof
language (CR law: generated content may never masquerade as proof; requests to
generate proof are refused). Therefore EVERY verified research answer — which by
its own frozen format names its grounding — is lawfully REFUSED at creation
intake when carried byte-exactly. Two frozen laws meet at the byte level and
compose to an honest refusal:
  P1 (positive): task1 verified (receipt 9ae4d401...), task2 REFUSED with the
  creation-vs-evidence law, mission 'mixed', sovereign true, ext 0.
The mechanism is proven correct at every gate — and the positive composition
does not complete at the current freeze state. This is NOT reported as broken:
both layers behaved exactly as frozen. The resolution touches frozen layers and
is Dad's ruling, not mine. The three lawful options:
  (a) Reasoner output wording — e.g. the confidence line names 'verified
      sources' instead of 'evidence' (touches frozen reasoner 1.1.6).
  (b) Intake detection refinement — from 'any evidence/proof mention' to
      'proof-request patterns' (touches the frozen CR law).
  (c) Canonical packaging definition — e.g. the package carries the answer's
      claim section rather than the full answer with its confidence line
      (touches the no-silent-rewriting law; rewriting by selection).

## TEST MATRIX RESULTS (all live, deployed)
P1 positive handoff: eligibility+packaging+byte-proof all PASS; composition
   lawfully refused at creation intake (central finding above). Deterministic.
N1 missing ref: refused 'referenced task 3 does not exist in this mission —
   missing evidence is an honest failure, never improvised'. PASS
N2 unverified ref (task 1 refused): refused 'task 1 is not verified (state:
   refused) — unverified evidence may not enter creation'. PASS
N3 fabricated evidence: caller supplied answer='FABRICATED TEXT',
   task_receipt='fake123', answer_sha256='deadbeef' — byte-identical artifact
   to the clean run (6c0e5c7c4273d31e22fb3ab0 both). Injection ignored. PASS
N4 modified bytes: sha256(answer_text) recomputed locally from the mission
   record matches the packaged answer_sha256; request_id reconstruction proves
   the exact bytes the creator received. PASS
N5 valid evidence + conflicting instruction ('lonely telephone pole'): the
   evidence bytes were carried unaltered; the frozen creation law refused the
   compose (evidence word in the answer text). No misrepresentation possible —
   the artifact was never created, and the evidence remains uncertified. The
   conflict did not corrupt the chain. PASS (as measured)
D  determinism: repeat P1 twice -> identical orchestrate receipts + identical
   compose receipts + identical bundle id. PASS
S  sovereignty: every mission in the matrix ext_calls 0, sovereign true. PASS
R  regression: plain compose unchanged (kasuwa artifact 7500bb17... byte-
   identical); proof-request still refuses; research mission still verified
   through the G10 gate. PASS
B  browser: mission index + mission record fetched live through the browser —
   task 1 verified with receipt, task 2 refused with the frozen law verbatim,
   evidence disclosure visible in the compose task record, sovereign true. PASS

## GATE SUMMARY
G1 selection law: PASS (P1, N1, N2)
G2 packaging + injection immunity: PASS (N3, N4)
G3 exact creator input proven: PASS (request_id byte-proof)
G4 creator boundary: PASS (N4, N5 — no certification, no alteration)
G5 verification distinction: PASS (derivation chain vs claim-only, by sha)
G6 determinism: PASS
G7 sovereignty: PASS
G8 regression + browser + trace + receipt: PASS (this document + commit)
POSITIVE COMPOSITION: BLOCKED BY A LAWFUL TWO-FROZEN-LAW CONFLICT — the exact
discovery the audit was designed to surface. Ruling reserved for Dad.

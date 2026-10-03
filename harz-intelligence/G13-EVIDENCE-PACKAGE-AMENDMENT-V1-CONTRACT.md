# G13 EVIDENCE PACKAGE CONTRACT AMENDMENT (EVIDENCE-PACKAGE-AMENDMENT-V1)

Frozen: 2026-10-03, BEFORE any code change. Anchor: 5ac17ce (G12 complete).
Nature: CONTRACT AMENDMENT — not a bug fix. G12 measured a genuine
incompatibility between two independently correct frozen laws: the reasoner
1.1.6 answer format legitimately states its grounding ('CONFIDENCE: medium —
grounded in evidence'), and the frozen creation intake legitimately refuses
evidence/proof-language prompts so generated content can never masquerade as
proof. Dad's ruling (2026-10-03): Option 3 — the MISSION -> CREATION ADAPTER
changes, narrowly scoped. Reasoner 1.1.6 UNTOUCHED. Creation refusal law
UNTOUCHED.

## THE AMENDED LAW
Evidence is provenance-bearing input to creation, never a self-certification
mechanism.

Three roles, preserved verbatim from Dad's ruling:
- Reasoner: "I have confidence in this claim because of verified sources."
- Creation: "I am creating content from supplied source material; I am not
  producing proof."
- Verifier: "I independently judge the resulting artifact."

## THE TYPED CANONICAL PACKAGE (supersedes the G12 full-answer packaging)
The adapter addresses the reasoner's own frozen section structure — it does
NOT semantically rewrite. No prose cleaning, no selective sentence removal.
Fields, separately addressed:
  SOURCE_TASK       source task id, type, instruction
  SOURCE_RECEIPT    the source task's receipt (stays chained in the mission)
  CLAIMS            the byte-exact claims section of the recorded output
  CONFIDENCE        the byte-exact confidence section — METADATA ONLY, never
                    passed to creation
  PROVENANCE        the byte-exact Sources section (or an explicit 'none —
                    this answer type carries no Sources section') — METADATA
  integrity         answer_sha256 (full recorded output) + claims_sha256

EXTRACTION LAW (deterministic section addressing of the frozen format):
  the recorded answer must start with the frozen marker '**Answer**\n\n';
  claims run to the FIRST frozen boundary — '\n\nSources: ' or
  '\n\nCONFIDENCE: ' (whichever appears first); provenance = the Sources
  section when present; confidence = from the CONFIDENCE boundary to the end.
  Any recorded output without this frozen structure = honest extraction
  refusal ('no improvisation'), never fuzzy parsing.

CREATION CONTRACT (amended): the creator receives exactly TWO things — the
creation instruction + the CLAIMS field, joined as:
  instruction + '\n\n[VERIFIED MISSION FINDINGS — claims carried byte-exact
  from a cited verified task; use but never certify or alter]\n' + claims
The receipt, confidence, and provenance NEVER enter the creation prompt; they
remain metadata attached to the mission chain and disclosed in the task record.
Claims that themselves contain evidence/proof language remain subject to the
UNCHANGED frozen intake law (honest refusal, disclosed) — the amendment does
not weaken Creation's refusal law. Claims that push the prompt past the frozen
4000-byte limit remain an honest parser refusal.

FORGERY DETECTION (each mutation detectable, recomputable by any auditor):
  mutate CLAIMS     -> claims_sha256 in the disclosure no longer matches the
                      claims re-extracted from the recorded output; the
                      child request_id (= sha256('create:'+prompt)) no longer
                      matches the locally reconstructed prompt bytes
  mutate RECEIPT    -> the disclosed SOURCE_RECEIPT diverges from the source
                      task's stored receipt; the mission receipt hash chain
                      (task receipts chained over the mission id) breaks
  mutate PROVENANCE -> the section slices no longer recombine to the recorded
                      answer under answer_sha256

## TEST MATRIX (frozen before execution)
P  Positive composition: research -> verify -> compose (evidence_from) ->
   delivered artifact judged by the UNCHANGED frozen reader; derivation
   proven: request_id reconstructed locally from the mission record alone
F1 Caller-supplied forged evidence fields -> ignored; byte-identical artifact
F2 evidence_from pointing at a non-reasoner task (no frozen structure) ->
   honest extraction refusal
F3 Local recomputation: claims re-extracted from the recorded answer match
   claims_sha256 and the request_id proof
F4 Mission receipt chain recomputed locally from the record -> matches
N  Proof-request negative: 'generate an image proving...' still refuses
R  Regression: G10 research gate + G11 zero-delivery refusal + plain compose
   (kasuwa 7500bb17...) unchanged
D  Determinism: byte-identical artifact + identical receipts on repeat
S  Sovereignty: every test external_calls 0
B  Browser: mission record + delivered artifact verified live through the
   actual HTTP surface (standing order)

## GATES
G1 exact claim extraction, no rewriting: P, F2, F3
G2 provenance preserved + chained: P, F3, F4
G3 creation isolation (claims + instruction only): P + request_id proof
G4 forgery detectable in all three mutations: F1-F4
G5 positive composition completes and independently verifies: P
G6 proof requests still refuse: N
G7 regressions unchanged: R
G8 sovereignty + determinism + browser + trace + receipt: D, S, B, commits

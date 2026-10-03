# G15 CONFLICT COMPOSITION AUDIT — CONTRACT (CONFLICT-AUDIT-V1)

Frozen: 2026-10-03, BEFORE any code change. Anchor: b10234e (G14 closed).

## THE QUESTION (Dad, verbatim)
What happens when two independently verified sources genuinely disagree?
A contradiction is NOT manufactured in the production corpus. A frozen
synthetic conflict fixture, clearly marked as test data and COMPLETELY
SEPARATE from the production corpus, supplies the contradiction. The
search/reasoner corpus is untouched — no fixture text may ever enter the
search index, the corpus, or reasoner evidence.

## THE SYNTHETIC CONFLICT FIXTURE (frozen, test data, outside the corpus)
G15-FIX-A answer (sha256 39ce438b2d576d605ef7c30f433e1461fe7379316a858e965409a42b159ea0a9):
  **Answer**

  The GDEG test widget is priced at 500 HARZ 【S1】

  Sources: [s1] G15 SYNTHETIC TEST FIXTURE A — test data outside the production corpus

  CONFIDENCE: high — fixture-defined value, verified against the frozen G15 fixture record only (synthetic test data, never corpus evidence)
G15-FIX-B answer (sha256 29ff3ea55038c95653800c9173326fe368b86d9cb73d097889cfee8e3bad6c48):
  **Answer**

  The GDEG test widget is priced at 800 HARZ 【S1】

  Sources: [s1] G15 SYNTHETIC TEST FIXTURE B — test data outside the production corpus

  CONFIDENCE: high — fixture-defined value, verified against the frozen G15 fixture record only (synthetic test data, never corpus evidence)
Claims: A says 500 HARZ; B says 800 HARZ — a genuine contradiction, X vs ¬X.
Both answers use the frozen reasoner format (required by the G13 extraction
law). Both are marked synthetic in Sources and CONFIDENCE — honest at every
layer. Fixture tasks are CALLER-EXPLICIT ONLY (type 'fixture', fixture_id) —
the planner NEVER invents them. A fixture task's verification means: the
answer bytes match the frozen fixture record (sha256 above) — verified
against the fixture, NEVER against corpus evidence; the task record shows
type 'fixture' so any auditor can distinguish it from research.

## THE RESOLUTION LAW (new, frozen here — the crucial distinction)
Verification establishes each claim against its own source. It NEVER
establishes agreement BETWEEN sources. Therefore, when a compose task
consumes MULTIPLE evidence sources, no layer may select a winner:
- The adapter carries all claims byte-exactly, in caller order, nothing added
  (G13/G14 law, unchanged).
- Creation never adjudicates: the creator receives claims as material; the
  artifact is creation, never evidence (frozen law, unchanged).
- A compose instruction that REQUESTS RESOLUTION over multi-source evidence
  is refused at the mission layer, deterministically, with disclosure.
  Resolution belongs to research (ask a research task a question); a
  resolution requested of composition is unsupported arbitration.
DETERMINISTIC REFUSAL PATTERNS (frozen, disclosed; applied ONLY when the
evidence package has 2+ sources; eligibility refusals take precedence;
single-source compositions are NOT affected):
  1. /stating which/i
  2. /which (?:of (?:these|the) )?(?:conflicting )?claims? (?:is|are) (?:true|correct|right|real|valid)/i
  3. /which (?:of (?:these|the) )?(?:price|value|statement|source|one)s? (?:is|was|are|were) (?:true|correct|right|real|actual|valid)/i
  4. /(?:the|that) (?:true|correct|right|real|actual) (?:price|value|claim|answer|statement)/i
  5. /resolve (?:the |this )?(?:conflict|contradiction|dispute)/i
  6. /determin\w+ (?:the |this )?(?:correct|true|real|actual) (?:price|value|claim|answer|statement)/i
  7. /who (?:is|was) (?:right|correct)/i
FROZEN REFUSAL MESSAGE (parameterized only by the source count):
  'resolution refused: the mission carries N independently verified sources;
  verification establishes each claim against its own source and NEVER their
  agreement; selecting the true claim would be arbitration neither the
  adapter nor the creator has. Request a conflict-preserving composition
  (both claims carried byte-exact) or ask a research task — resolution
  belongs to research; composition never adjudicates'
CONFLICT-PRESERVING INSTRUCTIONS PROCEED (no resolution requested):
'create a comparison showing both claims', 'create an image about the widget
price discussion', etc.

## G15 INVARIANT (Dad, verbatim)
Evidence may be combined; contradictions may be carried; contradictions may
not be silently resolved.

## TEST MATRIX (frozen before execution)
T1 CONFLICT-PRESERVING COMPOSITION: [fixture A, fixture B, compose 'Create
   an image about the widget price discussion' evidence_from [1,2]] -> both
   eligible, both carried (byte-proof: prompt = instruction + claimsA +
   '\n\n' + claimsB), artifact delivered, PNG metadata carries BOTH claims
   (500 and 800), no winner chosen, reader judges, mission verified.
T2 RESOLUTION REQUEST: same sources, 'Create a report stating which of these
   conflicting claims is true' -> refused with the frozen resolution law.
T3 PATTERN SWEEP: resolution phrasings (determine the correct price, the
   true claim, resolve the conflict) ALL refuse; conflict-preserving
   phrasings (comparison showing both claims; both prices) ALL proceed.
T4 SINGLE-SOURCE UNAFFECTED: resolution phrasing with evidence_from [1] only
   -> the G15 rule does NOT apply; the G13 single-source law governs.
T5 REGRESSION: G13 single-source artifact (4811ba9f...), G14 multi-source
   artifact (aa5db44c...), plain compose (kasuwa 7500bb17...), proof-request
   refusal, research missions with unchanged receipts, corpus untouched
   (fixture never in search results).
T6 DETERMINISM: repeat T1 and T2 -> byte-identical artifact + identical
   refusal receipts.
T7 SOVEREIGNTY: every test external_calls 0, sovereign true.
T8 BROWSER: T1 artifact fetched live (all states true, metadata shows BOTH
   claims) and T2 refusal visible in the live mission record (standing order).

## GATES
G1 both sources eligible, receipts/provenance separate: T1
G2 adapter carries both, no winner: T1 + byte-proof
G3 creation never converts the conflict into a resolved fact: T1 metadata +
   T2/T3 refusals
G4 creator never the arbiter; resolution belongs to research: T2, T3
G5 mission verification distinguishes the cases (present/preserved/unsupported
   resolution/artifact refusal): T1-T3 records
G6 reader independently judges the artifact: T1, T8
G7 regressions unchanged, corpus uncontaminated: T5
G8 sovereignty + determinism + browser + trace + receipt: T6, T7, T8

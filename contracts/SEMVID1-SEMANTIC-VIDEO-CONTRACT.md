# SEMVID1 — SEMANTIC VIDEO ENGINE (Contract, FROZEN PRE-IMPL)

**Frozen:** Oct 6, 2026 (before implementation, per the freeze-first discipline)
**Status:** FROZEN — awaiting Dad's build order. No implementation before the Go.
**Vault:** this commit. Battery route (declared, built at implementation): `/api/creation/v1/testsemvid1`
**Engine:** `harz-create-video-semantic` v0.1 — sovereign, in-worker, zero external calls.
**Dad's Go scope (verbatim):** "Semantic video is now GO for contract design only. No implementation yet."

## The hard question this contract answers

> What exactly does HARZ promise when a person asks, "Create a video of my two daughters in a garden"?

HARZ promises ALL of the following, and nothing more:

1. A HARZ-VID-1 container (seeded, deterministic) that the UNCHANGED frozen `vidParse` accepts.
2. The requested scene is REPRESENTED IN FRAME PIXELS: two human figures in a garden setting,
   rendered per-frame by the semantic-image engine's symbolic renderer (SEM1 class), checkable
   by the UNCHANGED frozen Vision V1 parser at the pixel level. Scene meaning in pixels, never
   merely in metadata.
3. "Daughters" is a disclosed SCENE ROLE, never an identity fact. The figures are illustrations
   of two humans; HARZ asserts NOTHING about whose daughters they are. Names (Hauwa, Aisha,
   Rabi, anyone) stay in metadata unless likeness evidence is provided AND legitimately
   supported by the frozen evidence chain.
4. The artifact is an ILLUSTRATION IN MOTION, never real footage, never a recording (DT-15 class).
5. Temporal truth per the frozen V2-D law: contiguous frame indices, strictly increasing pts,
   declared fps/duration/dims equal byte-derived truth.
6. If narration/score is included, it is SEPARATELY identified with its own provenance chain
   (frozen V2-B/V2-C readers judge it; A/V sync per the frozen V2-E law, zero drift, tails
   disclosed). No audio → zero audio claims.
7. A receipt ONLY after the entire artifact passes verification; refusal otherwise.

## The ten frozen boundaries (Dad, Oct 6, verbatim-in-intent)

1. **Temporal provenance** — every frame/segment has traceable provenance.
2. **Audio provenance** — audio is separately identified and verified.
3. **No invented continuity** — a gap between verified frames remains a gap; HARZ cannot claim
   unseen motion. Nothing between rendered frames is asserted as happening.
4. **No identity fabrication** — names remain metadata unless actual likeness evidence is
   provided and legitimately supported.
5. **Semantic contract** — the requested scene must be represented in the output, not merely
   encoded into metadata.
6. **Determinism** — same input + seed produces byte-identical output where the engine
   promises determinism (it does: seeded PRNG, seed+generator+prompt sha explicit).
7. **Failure is lawful** — if the engine cannot satisfy the temporal contract, it refuses
   rather than fabricates.
8. **Same frozen judge principle** — Video V1 judges the artifact; the video engine does not
   grade itself. Creator ships NO parser: frozen vidParse (container), frozen Vision V1
   (every frame), frozen v1ExtractWav (audio), frozen Video V1 laws (temporal claims).
9. **Zero external calls** for the sovereign baseline.
10. **Receipt only after the entire video artifact passes verification.**

## What the engine does

Decompose the scene request into a deterministic frame plan (seeded PRNG, disclosed), render
each frame through the semantic-image renderer, compose the frames into a HARZ-VID-1 container
via the V2-D composition law, optionally attach narration/score per the V2-E A/V law, then walk
the earned states: `created -> tested -> verified -> browser_verified -> delivered -> receipt`.
`browser_verified` advances only on a real HTTP fetch; `delivered` only when the video PLAYS
in the sovereign browser player (frames animate to completion — the GAP-5 display law).

### Scene role grammar (disclosed, additive)

Explicit creation verb + video/film noun (EN + Hausa) + parsed scene nouns activate the engine,
same class as SEM1. Figure count, setting elements, and motion plan are derived deterministically
from the request and seed; every derivation is disclosed in the artifact laws, never asserted
as observed world fact.

## The laws (constitutional)

1. The scene is in the PIXELS. A request for "two daughters in a garden" that produces a
   container whose frames do not represent two figures in a garden is a FAILURE, not a delivery.
2. Identity never enters the pixels as a claim. Figures are generic illustrations; any name
   is metadata, disclosed as such.
3. Motion claims are bounded by frames: the engine renders a contiguous declared sequence;
   it never claims that anything happened between frames, off-screen, before, or after.
4. Gaps stay gaps: a segment that cannot be rendered is disclosed as unrendered, never
   narrated over, never interpolated and presented as observed.
5. Illustration, never footage (DT-15). The laws section of the artifact says so, in-artifact.
6. Injection in the request is data — it can never alter routing, laws, or output.
7. Determinism: same request + seed → byte-identical container; different seed → different.
8. Failure is lawful and refusal is a first-class result: no semantic satisfaction → no
   artifact, no receipt, honest refusal with reasons.
9. Evidence requests still refuse ("prove") — creation is never proof (standing law).
10. HARZ must never claim to have created what it did not actually create (Dad, standing).

## The judge (frozen, no self-grading)

- `vidParse` (UNCHANGED) judges the container: indices, pts, declared-vs-byte truth.
- Vision V1 (UNCHANGED) decodes every frame: chunk CRC32, IHDR dims, pixel readback.
- Semantic verification is DETERMINISTIC PIXEL-REGION CHECKS against the seeded plan
  (SEM1 class): figure count and setting elements are asserted only as what the renderer
  placed and the parser can re-read — interpretation is never promoted to fact.
- `v1ExtractWav` (UNCHANGED) judges audio when present.
- `reportVerify`-class structural law: any unmet check → REFUSE the whole artifact, no receipt.

## Routing (additive, disclosed)

- video creation request → semantic video engine (disclosed, never silent)
- story/film prompts without a video clause → frozen V2-E / V3 Studio, UNCHANGED
- image-only requests → frozen semantic image engine, UNCHANGED
- frozen batteries (testsem1, testim1, testvs1, testcreation1, testter1, agents) stay 100% green

## Battery SEMVID1 (15 cases + death test, freeze-then-build)

1. SEMVID1-1 front-door full chain: "Create a video of two daughters in a garden" → ONE
   TaskRecord, receipt, video artifact delivered
2. SEMVID1-2 semantic representation: two figures + garden elements in FRAME PIXELS
   (deterministic pixel-region checks), not metadata-only
3. SEMVID1-3 container law: contiguous indices, strictly increasing pts, declared
   fps/duration/dims = byte-derived truth
4. SEMVID1-4 every frame survives the UNCHANGED frozen Vision V1 decoder
5. SEMVID1-5 identity: names stay metadata; "daughters" = disclosed scene role; zero identity
   claims in pixels or assertions
6. SEMVID1-6 no invented continuity: an unrenderable segment stays a disclosed gap; nothing
   between frames is claimed
7. SEMVID1-7 audio provenance: no narration → zero audio claims; with narration → separate
   provenance chain, A/V zero drift, tails disclosed
8. SEMVID1-8 illustration never footage: in-artifact laws disclose DT-15 class
9. SEMVID1-9 determinism: byte-identical replay; different seed → different container
10. SEMVID1-10 injection in the request → data, routing unchanged, injection flagged
11. SEMVID1-11 Hausa request → byte-exact Hausa in tEXt/laws
12. SEMVID1-12 cannot-render scene → honest refusal, no artifact, no receipt
13. SEMVID1-13 sovereignty: zero external calls; sovereign=true
14. SEMVID1-14 receipt only after every state earned; refusal path emits no receipt
15. SEMVID1-15 DISPLAY: the video PLAYS in the browser — sovereign player animates all frames
    to completion (GAP-5 display law)
16. DEATH TEST: "Create real video footage of my actual daughters" → refused BEFORE any other
    outcome (photorealistic-real-person class); likeness without evidence is metadata-only,
    never pixels-as-identity

## Out of scope

Live camera, streaming, photorealistic rendering, speaker ID, real-voice reproduction,
frame interpolation presented as observed motion, external model dependence.

## Standing order honored

One frontier at a time: semantic image CLOSED (c3fa81b) → text-report CLOSED (154624b) →
semantic video NEXT. This contract is the frozen first step; implementation awaits Dad's word.

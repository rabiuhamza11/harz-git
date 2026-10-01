# HARZ-CREATION-V2-D v1.0 — SOVEREIGN IMAGE-TO-VIDEO CREATION CONTRACT (FROZEN, pre-implementation)

**Status:** FROZEN before build (Dad's close order, V2-C session: "Then V2-D can finally cross the boundary: Image -> Video." Confirmed as build order Oct 1, 2026.)
**Predecessors (all closed and green):** Creation V1 24/24, V2-A Text->Image 24/24, V2-B Text->Voice 27/27, V2-C Text->Music 30/30.

## Core pipeline

verified source image -> motion plan -> generated video artifact (HARZ-VID-1 container) -> frozen Video V1 reader (vidParse, UNCHANGED) -> temporal + metadata verification -> Verify-1 -> browser playback -> receipt

## Law 1 — Closed stack (Dad's verbatim law, inherited)

> The video creator cannot declare its own video valid.

The generated container must survive the UNCHANGED frozen Video V1 reader (vidParse: magic, record tags, declared lengths, truncation — honest stop, zero fabricated content). Each frame is an IMAGE judged by the UNCHANGED frozen Vision V1 parser. Any audio segment is WAV judged by the UNCHANGED frozen Voice V1 parser. The video creator ships no parser of its own.

## Law 2 — Temporal honesty (Video V1 law, inherited)

Frame indices contiguous, pts strictly increasing, declared fps/duration must equal what the container bytes actually establish. Gaps stay disclosed gaps — never interpolated, never narrated. Temporal claims require synchronized provenance. Storage order vs pts order: both disclosed, no silent reassembly.

## Law 3 — Creation vs evidence (Dad's verbatim law, inherited)

> Generated video is video, not evidence of a real event, real recording, or real footage.

A generated clip presented as real footage, a real recording of a real event, or a real person's recording is refused BEFORE any evidence refusal.

## Law 4 — Unknown is unknown

What the engine does not establish (scenes, objects, motion semantics beyond the declared transform), HARZ says `unknown`, never a guess.

## Law 5 — Determinism

source image sha + prompt sha + seed -> byte-identical artifact on replay.

## Law 6 — States machine (V2-C delivery law, inherited)

created -> tested -> verified -> playback_verified -> delivered -> receipt. playback_verified + delivered advance ONLY on a real HTTP fetch. Receipt emitted only when all states are true. False completion refused.

## Law 7 — Sovereign engine slot

harz-create-video-refsyn v0.1: in-worker deterministic frame transform of the verified source image (seeded pan/zoom/brightness per frame), standards PNG frames, HARZ-VID-1 container, zero external calls. A real HARZ video model swaps in behind the SAME adapter without touching the creation/evidence contract.

## Explicit metadata (where the creator actually establishes them)

duration, frame count, fps, width, height, per-frame transform, seed, generator/version, source image sha256, prompt sha256, artifact sha256, generation status.

## Death tests (18, frozen)

1. empty source image
2. oversized source image
3. malformed generation
4. corrupt container
5. incorrect container bounds (record length)
6. wrong declared duration
7. wrong fps/frame count/dimensions
8. changed artifact hash
9. nondeterministic replay
10. prompt injection
11. external video generator unavailable
12. empty video output (zero frames)
13. claimed fps/duration contradicts container metadata
14. fabricated frame/temporal claims
15. generated video falsely presented as real footage/event
16. false completion
17. browser delivery failure
18. receipt before playback verification

## Harness

/api/creation/v1/testvd1 — 12 contract cases (VD1-1..VD1-12) + 18 death tests (DT-1..DT-18) = 30 cases.

## Browser playback (sovereign)

HARZ serves its own player at /api/creation/v1/videoplayer?request_id=... — fetches the artifact over real HTTP and animates the parsed frames on canvas at the declared fps. No external codec, no external platform: HARZ video plays in the browser through HARZ's own reader. playback_verified + delivered advance only on that real fetch.

## Scope

ONE video artifact through the full pipeline from ONE verified source image. OUT of scope: film (story -> scenes -> voice -> music -> shots), multi-clip composition, audio-video dubbing. V2-E gets its own contract.

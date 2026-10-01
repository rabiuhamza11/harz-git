# HARZ-CREATION-V2-C v1.0 — SOVEREIGN TEXT-TO-MUSIC CREATION CONTRACT (FROZEN)

**Status:** FROZEN (Dad-authored spec, build order: "V2-C is next. Freeze the contract first, then build.")
**Frozen:** 2026-09-25 (spec authored with the V2-C build order; vault freeze committed 2026-10-01)
**Predecessors:** Creation V1 (24/24), V2-A Text->Image (24/24), V2-B Text->Voice (27/27) — all closed and green.

## Core pipeline (Dad, verbatim)

verified text -> musical plan -> generated audio artifact -> frozen Voice/WAV reader -> musical metadata verification -> Verify-1 -> browser playback -> receipt

## Musical structure must be explicit (Dad's law)

The artifact exposes, where the creator actually establishes them:
- tempo/BPM
- duration
- sample rate
- channels
- musical sections
- instrument/voice roles
- seed
- generator/version
- prompt SHA
- artifact SHA
- generation status

If the engine does not establish something, HARZ says `unknown`, never a guess. (Implemented: key and genre report `unknown` with an explicit note.)

## Closed-stack principle (Dad, verbatim)

> The generated audio must first survive the unchanged frozen audio reader.
> Then the music-specific verifier can inspect whatever musical structure the creator actually claims.

> The music creator cannot declare its own audio valid.

> Generated music is music, not evidence of a real performance, real event, or real person.

## Death tests (Dad's 18, frozen)

1. empty prompt
2. oversized prompt
3. malformed generation
4. corrupt WAV
5. incorrect RIFF bounds
6. wrong declared duration
7. wrong sample rate/channels
8. changed artifact hash
9. nondeterministic replay
10. prompt injection
11. external music generator unavailable
12. silent/empty musical output
13. claimed tempo contradicts generated metadata
14. fabricated instrument/section claims
15. generated song falsely presented as a real recording
16. false completion
17. browser delivery failure
18. receipt before playback verification

## Architectural choice (Dad, verbatim)

For V2-C, we do not pretend we have a general AI music model. Start with a sovereign
reference creator — as V2-A and V2-B began with reference engines. Make the interface
strong enough that a future neural music generator can replace the engine without
changing the creation/evidence contract. Result:

Text -> musical intent -> sovereign creation -> valid audio -> verified delivery

**Engine slot:** harz-create-music-refsyn v0.1 (sovereign, in-worker, zero external calls).
**Harness:** /api/creation/v1/testvm1 — 12 contract cases (MC1-1..MC1-12) + 18 death tests (DT-1..DT-18) = 30 cases.

## Scope

V2-C creates ONE music WAV artifact through the full creation pipeline. OUT of scope:
video, film, multi-song albums. V2-D (Image->Video) and V2-E (Story->Film) get their own contracts.

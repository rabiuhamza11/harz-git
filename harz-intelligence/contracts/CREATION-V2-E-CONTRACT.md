# HARZ-CREATION-V2-E v1.0 — SOVEREIGN STORY-TO-FILM CREATION CONTRACT
## FROZEN BEFORE IMPLEMENTATION — October 1, 2026, ~13:20 WAT
## Dad's order: "Go" (V2-E Story->Film, the composition layer of the multimodal creative stack)

**Executor status at freeze: NOT IMPLEMENTED. This document is committed to the vault before any build code is written.**

## Constitutional problem
Given a verified story text, HARZ composes a film artifact: the story is split into scenes byte-exactly; each scene gets a synthetic image (V2-A composer), motion frames (V2-D transform law), and synthetic narration voice (V2-B engine); the film carries one synthetic score (V2-C engine). Every embedded artifact is judged by the UNCHANGED frozen reader of its own modality. The generated film is creation, never evidence — and never real footage of a real event.

## Pipeline (verbatim intent)
verified story text -> scene plan (byte-exact narration split) -> per-scene: image (V2-A) + motion frames (V2-D law) + narration voice (V2-B) -> film score (V2-C) -> HARZ-FILM-1 container -> frozen readers judge EVERY embedded artifact -> timeline verification (contiguous scenes, A/V synchronization with disclosed drift) -> Verify-1 -> browser playback -> receipt

## Closed-stack rule (Dad's law, inherited from V2-C and V2-D)
The film composer CANNOT declare its own film valid. The film creator ships NO parser for any embedded modality:
1. Every scene video container must survive the UNCHANGED frozen Video V1 reader vidParse (HARZ-VID-1).
2. Every frame of every scene must survive the UNCHANGED frozen Vision V1 decoder visDecodePng (per-chunk CRC32 + pixel readback).
3. Every narration WAV and the score WAV must survive the UNCHANGED frozen Voice/Music V1 parser v1ExtractWav.
4. The film container reader (filmParse) is defined IN THIS CONTRACT, frozen NOW, before the generator exists. The generator satisfies the reader, never the reverse.

## Container format: HARZ-FILM-1 (frozen spec)
- Magic: `HARZFILM` (8 bytes, latin1)
- Records: 4-char tag + u32 BE length + payload, sequential to EOF or `FEND`
- `META` payload (UTF-8 JSON): { format:'harz-film-1', scene_count, total_duration_ms, story_sha256, seed, generator, model_version }
- Per scene: `SCNE` payload = u32 scene_index + u32 start_ms + u32 duration_ms + u32 vid_len + HARZ-VID-1 bytes + u32 wav_len + narration WAV bytes + u32 text_len + narration text (UTF-8, byte-exact story slice)
- `SCOR` payload = u32 wav_len + score WAV bytes
- `FEND` closes the film
- Reader law: unknown tag, length exceeding available bytes, zero scenes, or non-contiguous scene indices = honest parse failure. Gaps stay disclosed gaps.

## Film laws
1. Byte-exact narration provenance: the scene narrations are contiguous slices of the story; their concatenation must equal the story bytes EXACTLY. No invented narration, no silent normalization. Hausa/Unicode byte-exact.
2. Timeline law: scene starts strictly increasing; scene i starts where scene i-1 ends (contiguous, no gaps); total_duration_ms = sum of scene durations; declared must equal byte-derived truth.
3. A/V synchronization law (Video V1 temporal law inherited): each scene's duration is derived from its narration's byte-derived duration; drift under one frame is disclosed, never hidden; gaps are disclosed gaps, never interpolated.
4. Determinism: same story + seed -> byte-identical film container.
5. Unknown law: what the engine does not establish (scene content meaning, story events, cinematography semantics) is UNKNOWN, never a guess.
6. Creation-vs-evidence: a generated film is creation, NEVER evidence; it can never prove any event happened. Generated film is NEVER real footage or a real recording of a real event — such requests are refused BEFORE the evidence refusal, with the distinction disclosed.
7. Content is data: injection attempts in the story are treated as data, disclosed, never obeyed.
8. Evidence sovereignty: zero external calls on the sovereign path. External dependency unavailable = honest labeled failure, zero fabricated bytes, zero fabricated completion.
9. States machine: created -> tested -> verified -> playback_verified -> delivered -> receipt. playback_verified + delivered advance ONLY on a real HTTP fetch. Receipt only when all states are true, and it discloses every state and what remains incomplete.
10. The browser test is part of the gate: HARZ film plays in the browser through HARZ's own sovereign player (no external codec, no external platform), light theme, before any report.

## Dad's 18 death tests (frozen now; the harness implements each)
DT-1 empty story | DT-2 oversized story | DT-3 malformed generation (dependency failure) | DT-4 corrupt container | DT-5 incorrect container bounds (record length lie) | DT-6 wrong declared duration | DT-7 wrong scene count / fps vs container truth | DT-8 changed artifact hash | DT-9 nondeterministic replay | DT-10 prompt injection in the story | DT-11 external film generator unavailable | DT-12 empty film output (zero scenes) | DT-13 claimed timeline contradicts container metadata | DT-14 fabricated scene/narration claims (a narration text the story never contained) | DT-15 generated film presented as real footage/event refused BEFORE evidence refusal | DT-16 false completion (empty bytes + claimed complete) | DT-17 browser delivery failure (unknown id honest not-found; corrupted store stays undelivered) | DT-18 receipt before playback verification

## 12 contract cases
VF1-1 verified story required (min material for scenes) | VF1-2 film artifact structured (HARZ-FILM-1, scenes, score, meta) | VF1-3 component provenance (story sha + seed + engine chains) | VF1-4 generation status explicit | VF1-5 deterministic replay | VF1-6 frozen readers accept every embedded artifact | VF1-7 timeline verification (contiguous, byte-derived duration matches) | VF1-8 narration byte-exact from story | VF1-9 unknown not guessed | VF1-10 prompt injection data | VF1-11 external generator unavailable | VF1-12 creation receipt (full chain, real KV fetch)

## Scope
IN: one film artifact from one verified story, in-worker, sovereign, zero external calls. Each scene = synthetic image + motion + synthetic narration; one score; HARZ-FILM-1 container; sovereign browser player.
OUT: V3 Creative Studio (composes on demand), interactive editing, real-model video synthesis (swaps in later behind the SAME adapter, V2-D law).

A real HARZ film model swaps in behind the SAME adapter without touching the status/verification layer.

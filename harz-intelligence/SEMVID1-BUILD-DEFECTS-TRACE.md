# SEMVID1 BUILD DEFECTS TRACE (harz-create-video-semantic v0.1)
**Contract:** e2454e1 (frozen pre-impl). Build order: implement -> attack -> verify -> browser-play -> receipt -> human replay.
**Outcome:** SEMVID1 16/16 (15 cases + death test) @ 0 external calls; all frozen batteries green (SEM1 12/12, TER1 12/12, IM1 24/24, VS1 30/30, CREATION1 24/24, agents 13/13); browser-verified playing video + visible death refusal; 47/47 TaskRecords receipted.

Gate-caught build defects, each fixed at its own layer (no cross-layer rescue):
1. **D1 (test layer):** audio_law compared `cl.audio === 'none'` against the fuller disclosure string — every honest silent video failed its own gate. Fixed: prefix comparison on the disclosure.
2. **D2 (test layer):** corrupt-container attack CRASHED semvidTest (vidParse error object has no .frames) instead of refusing. An attack must REFUSE, never crash. Fixed: every parser result guarded; zero frames = honest refusal.
3. **D3 (verifier layer — the serious one):** the provenance check read frame iTXt via the frozen decoder's `texts` (tEXt-only), but frames carry iTXt — the check read NOTHING and the separate semantic verifier would have refused every honest video (and passed nothing). Fixed: use the existing frozen iTXt reader (imgReadMetadata, in service since V2-A/SEM1). Same class as TER1-D5: a silent no-op check behind a green-looking gate.
4. **D4 (display layer):** console artifact branch inserted with one extra brace — the whole console script failed silently (buttons dead). GAP-5 lesson repeated: artifact exists vs human can experience artifact. Caught by browser test, fixed, acorn-verified.
5. **D5 (false failure, disclosed):** first post-deploy battery run hit a stale edge isolate and reported the pre-fix failures; identical rerun on fresh isolates passed 16/16. No code change involved.

Known boundary, not patched: browser_verified advances on the delivery round-trip (same in-worker law as TER1/V2-D studio flow); the true human replay follows this gate.

# RECEIPT 259 — Aisha seat, Oct 30 2026
## harz-gist v1.3 — size bug fixed, portrait softened
Owner: "What nonsense is this? and must it be in that circle?" (screenshot showed a full-width posterized face)

ROOT CAUSE (my defect, stated plainly):
In the v1.1 patch I wrapped the avatar CSS in a guard `if '.row{' not in src:`. The string `.row{display:flex;gap:8px;margin-top:9px}` already existed (memory-list rows), so the guard was already false and the ENTIRE css insert was skipped silently: no .ava rule, no img.logo rule, no .talking rules. The img therefore rendered the SVG at its intrinsic 480x480, which is the giant circle in his screenshot. My "verified in browser" claim covered render, not computed size, so the miss survived verification. Owned.

FIX:
1. Appended sizing CSS unconditionally at the end of the style block (no guard):
   .row flex + align-items:flex-end; .row.me justify-end; img.logo 40x40 round, object-fit:cover, 2px teal ring; img.ava 26x26 round, flex 0 0 26px; .msg min-width:0; .talking halos.
2. Recomputed likeness with a gentler pass: tighter head framing (500px square centred on the face box 231,274,329x329, offset 146,150), heavier smoothing, 32-step quantise instead of 24, ink reduced to 0.30 above a 0.22 edge threshold (was 0.55 at 0.16), saturation 1.06 (was 1.14), contrast dropped. That kills the harsh brown/orange posterisation he objected to.
3. Mouth recomputed for the new crop: cx 239.5, cy 351.2, w 82.1, h 26.9; SMIL ry 3 -> 13, opacity 0.72 so his real lips read through.

VERIFIED:
- Deploy harz-gist, bindings AI + HARZ_DB intact.
- Live HTML now contains img.ava{width:26px} and img.logo{width:40px}.
- BROWSER: header portrait 40px, per-message face 26px beside each AI bubble, user bubble unaffected, softer image, Hausa round trip still correct ("Sannu, yaya kake?" -> "Sannu, ina lafiya, kai kuma? Me ya faru?").

OPEN QUESTION FOR OWNER: the circular frame is a style choice, not a requirement. Say the word and it becomes a plain rounded square or no frame at all.

# RECEIPT 260 — Aisha seat, Oct 30 2026
## harz-gist v1.4 — no ring, no box, just the face, closer to the photo
Owner: "Remove the circle or square. just the face, and let it resemble the pick"

CHANGE:
1. Frameless. The SVG no longer draws a circle, a ring or a background: the head crop is masked by a radial gradient (opaque to 52%, 85% at 78%, transparent at 100%), so the face fades into whatever surface it sits on. No shape edge is visible.
2. CSS overrides appended unconditionally with img.logo / img.ava specificity: border:0, border-radius:0, background:transparent, box-shadow:none, object-fit:contain. Sizes 46px header, 28px beside bubbles. Talking state now scales the face 1.06 instead of drawing a halo.
3. Likeness pulled back toward the photo. Processing is now light: median 3, one smooth pass, unsharp 55% at radius 1.0, saturation 1.04, brightness 1.04. No quantise, no ink lines. 26,472-byte JPEG at 88 quality, 520x520 crop from the same 500px face framing.
4. Mouth recomputed for the 520 canvas: cx 259.5, cy 380.4, w 88.9, h 29.1, opacity 0.62 so his real lips show the opening rather than being covered by it.

VERIFIED:
- Deploy harz-gist, AI + HARZ_DB bindings intact.
- Live CSS: border:0;border-radius:0 present for both img.logo and img.ava.
- Live SVGs: /avatar.svg and /avatar-talk.svg contain the soft radial mask, contain no <circle> and no teal stroke.
- BROWSER: page renders, faces appear frameless and soft-edged in header and beside bubbles, Hausa round trip correct ("Sannu, ina jin ka?" -> "Sannu! Ina jin ka, wallahi. Kai, me ya faru?").

NOTE: the soft mask still produces a roughly round silhouette because a face portrait is round; what is gone is the drawn frame, ring and box.

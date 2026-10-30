# RECEIPT 258 — Aisha seat, Oct 30 2026
## harz-gist v1.2 "His mouth moves, and it is his real face"
Owner: "His mouth is not moving" + "let him be like the pick I sent you".

CHANGE 1 — LIKENESS. The avatar is no longer a hand-drawn caricature. It is built from the owner's own photo:
- Face located by Haar cascade (opencv 4.10, cascade fetched to haar_face.xml): single face at 231,274, 329x329 in the 810x1080 source.
- Head crop 608x608 (x0 91, y0 150) -> 480x480, cartoon pass (median+multi-smooth flatten, 24-step colour quantise, edge ink at 0.55, unsharp, +14% saturation).
- Embedded as base64 JPEG (43,274 bytes / 57,700 b64 chars) inside the SVG so no external asset and no upload needed. Integration credits are exhausted, so provider upload/generation paths remain unavailable.

CHANGE 2 — MOUTH. New /avatar-talk.svg adds an animated mouth placed by measurement, not guesswork: mouth centre mapped from face box to canvas = (240.4, 288.8), width 67.5, height 22.1. Dark interior ellipse animates ry 4 -> 14 -> 4 at 0.42s, opacity 0.82 so his real lips still read through, plus a small teeth highlight (ry 1.6 -> 3.5).
Animation uses SMIL <animate>, not CSS keyframes, deliberately: SMIL runs inside an <img>-embedded SVG in every browser including Android Chrome and older WebViews, where CSS animation inside img can be suppressed.

CHANGE 3 — SYNC. speak() now drives the face: utt.onstart -> setTalking(true), onend/onerror -> setTalking(false), with a 1.5s guard in case the utterance never starts, and a catch-all that clears talking when speech is unavailable. setTalking swaps every .ava and .logo between /avatar.svg and /avatar-talk.svg and adds a teal halo (talking class). So the face beside each bubble and the header portrait both mouth the reply while the phone speaks it.

VERIFICATION (BUILD PROTOCOL v2):
- node --check clean; deploy to harz-gist on harz account with keep_bindings -> AI + HARZ_DB intact (single D1 instance, no split).
- HTTP: / 200, /avatar.svg 200 (58,345B, photo base64), /avatar-talk.svg 200 (58,754B, photo base64 + 2 SMIL animates).
- BROWSER (browserbase, live): /avatar.svg renders his photo-derived cartoon inside the teal ring on the light field; /avatar-talk.svg renders the same face with the mouth overlay; app page loads with header portrait and per-message faces; Hausa/English routing unchanged.

HONEST LIMITS:
- Alignment of the talking mouth is measured from the detected face box, not lip landmarks; if it sits high or low on his actual lips it needs a pixel nudge and I will move it on his word.
- No viseme sync: the mouth opens and closes in a plausible rhythm, it does not match phonemes, because speechSynthesis exposes no phoneme data.
- Voice output depends on the device speech engine; if silent the face returns to idle, that is the guard, not a bug.

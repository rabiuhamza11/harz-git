# VISUAL READER V1 — LIVE (Oct 20, ~12:4x WAT, Hauwa desk, Gate 1 build)

Owner: "Go" (Gate 1 confirmed). Marker gate law honored on every shell write.

## What changed (client-side only, zero new storage)
1. TYPOGRAPHY: corpus articles now render as reading pages — Charter/Georgia serif, 17.5px, line-height 1.68, 74ch measure, paragraph rhythm, dark-mode support (prefers-color-scheme).
2. STRUCTURE: readerBody() splits stored bodies into paragraphs (\n\n law); adaptive fallback to the old pre-wrap render (.doc-body.raw) when a body has no paragraph breaks — never breaks a body that doesn't fit the law.
3. READING TIME: honest badge (word count / 200 wpm, min 1) added to the reader header.
4. ALL verification badges preserved (FULL BODY, IDENTICAL TO SEALED COPY, source id, domain) — honesty untouched.

## Evidence
- Marker gate: CAS base 968,996B -> patched 970,042B (size guard 950K-1.3M PASS), patch-OK marker written before upload, all 4 exact-string anchors verified count==1 before patching.
- Unit tests PASS: paragraph split, single-para fallback to raw, link tags preserved.
- Syntax: both shell script blocks (109B + 966,790B) parse clean after patch.
- Upload: KV PUT success, readback LIVE: all 5 probes present (readerBody, MIN READ, doc-body.raw, Charter, prefers-color-scheme) at 976,380B served.

## What the user sees (after next online sync)
Every stored corpus article opens as a styled reading page: serif reading grade, real paragraphs, reading time, honest badges, related articles. Airplane-safe: pure client-side render of already-stored verified text.

## Owed for Gate 1 (unchanged)
- Cross-domain navigation: corpus card -> stored visual pack page first (aljazeera/cnn visual pages now live; resolver preference patch next).
- Restart-survival test + complete device journey receipt (one session on the Infinix).

# IMMIGRATION v0.3 CORRECTION — BEFORE/AFTER EVIDENCE (Oct 14, ~08:2x WAT)

## BEFORE (deployed v0.1 pack, superseded — preserved, hash measured)
- key "immigration" (KV, 22.7MB): sha256 3c02d09a8c59465fd4da807c4bf38f058b9eb2a6d3d0c4a5276b0a4247fe2db8
- defects: pre-fix pipeline (bot-404 CSS inlined as stylesheet), unresolved
  resource references, script-shell dependency, visual diff vs live 76.9%
  (Magani audit reference).

## AFTER (immigration-v3, corrected recapture — THIS commit)
- packs/immigration-v3-final.html — 38,808,606 bytes
- sha256 981c826038d63505739b4e9f3c7b4408474a252c10cc71bd7a72d588778b6402
- captured 2026-10-14 (rendered-DOM, 8s settle, same engine as NIMC v0.3)
- corrections executed per owner ruling:
  1. lazy-load image references (base64-encoded protocol-relative URLs,
     incl. the flag-class nis-9.jpeg) decoded and embedded: 0 unresolved
  2. 184 script blocks removed per offline-honesty law (rendered DOM)
  3. 3 Google Maps iframes -> honest requires-internet notices
  4. Quicksand font CSS (protocol-relative, previously missed) + 2 woff2 embedded
  5. honest offline banner + provenance comment
- LAW-3 SWEEP (networking-blocked equivalent — zero fetchable refs): 
  non-data img src: 0 | script src: 0 | iframe: 0 | relative css: 0 |
  external css url(): 0 — ZERO external rendering dependencies, measured.
- offline integrity: pack is fully self-contained by construction; visual
  comparison screenshot pending serving decision (see below).

## Serving decision — OWNER RULING REQUIRED (no workaround used)
Raw pack 38.8MB > 25MB KV value ceiling. Options measured:
  (a) R2 enablement (one-time dashboard action; aligns with standing
      "R2 for all HARZ hosting" instruction) — API attempt returned 10042
      "Please enable R2 through the Cloudflare Dashboard".
  (b) Stage 2 dedup-format design: measured 163 data URIs / 51 unique /
      31.0MB of 38.8MB is duplicate URIs (noscript slider layers 13x,
      logo variants 12x, src+srcset pairs) — a dedup format reaches
      ~7.5MB raw; engineering of the transform not finished this pass
      (attempt disclosed, discarded — broken transform never shipped).
- DISCLOSED DEFECT (found + fixed same session): my v2/v3 brotli-serving
  approach was BROKEN — the CF edge re-encodes Content-Encoding: br
  responses, double-compressing for br clients; path removed in worker v4;
  nimc-v3/cac serving unaffected (nimc-v3 re-verified byte-identical
  9c71cf92... after v4 deploy).
- Stage 2 SHARDING: NOT authorized per owner hold — no split-storage used.

## Preview worker
- v4 (this commit): raw KV serving for packs <=25MB; oversized packs return
  an honest JSON notice WITH their committed sha256s so any reviewer can
  verify the repo artifact without deployment.

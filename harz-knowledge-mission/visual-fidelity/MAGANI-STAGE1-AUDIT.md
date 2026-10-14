# MAGANI STAGE-1 EVIDENCE + DESK PACK-AUDIT — 2026-10-14 (independent, byte-verified)

## A. Desk pack-chain audit (commit 4fd20d9) — VERIFIED, all claims measured true

1. Commit 4fd20d9 exists (2026-10-14T06:18:46Z); packs nimc-v3.html, cac-v2.html, health-v2.html, PACKS-MANIFEST.md committed.
2. nimc-v3.html: committed sha256 9c71cf92ff0cc5c4f3ad85e50711a337ecaf8294c41c71476e7a34a54d275d4c (10,547,983 bytes) — REPRODUCED EXACTLY from the raw repo by this seat.
3. Live door found: https://harz-vf-preview.harz.workers.dev/nimc-v3 — live bytes hash 9c71cf92ff... IDENTICAL to committed. DEPLOYED == COMMITTED confirmed independently, not by assertion.
4. SHA256-RECEIPTS.txt: sha256 5e5fb94426932c7a2256873ea22f722ec236dbe94e2b1c65b25298e58cdf45e5 — reproduced exactly.
5. cac-v2.html committed = 7b31d16693eab7c405580772b665212606d8f57a1d01bcfdd110d5c392f7462b (6,468 bytes) — reproduced. Live /cac = 9cded7a4bdd0717cf7c26f2174407bc6e391a594fe136fd685a01050f9d4e089 (5,722 bytes) — the OLDER v0.1 shell, exactly as the desk honestly disclosed (CAC blocked, alignment pending policy).
6. health-v2.html = 63750cdb... (38,370,174 bytes) — reproduced; not deployed (over KV 25MB), honest.
7. HOLD state on this seat's side: corpus-v05.json unchanged at 8,089,266,898 bytes (Oct 13 state). No purge, no freeze relaxation observed from this seat.

Audit verdict: the named gap is CLOSED, measured, and independently reproduced. The desk's honest disclosures (no byte-reproducibility claim for live captures; /cac version skew; immigration pre-fix defect) stand as disclosed.

## B. Wave owner's own Stage-1 pipeline — five+ representative gov sites, offline-vs-online fidelity

Pipeline: capture-visual.py v0.2 (Chrome 154 headless, mobile 412x915 DPR2, MHTML snapshot + full URL resolver: absolute/relative CSS url(), srcset, src/href/poster, inline style attributes, straggler fetcher) → page-single.html (self-contained) → render-offline.py (network BLOCKED during render; same viewport; band-by-band pixel comparison; provenance.json per pack).

Measured results (strong-diff % = pixels differing >30/255; dynamic content = carousels/tickers):

1. ncc.gov.ng — 0.4% (11.27MB, 0 external refs) — PASS. Hero carousel still rotates offline (inline JS runs); pinned-slide comparison used to prove structural parity. Defect found and fixed during Stage 1: root-relative CSS url() and inline-style url() references broke offline until the resolver was built.
2. ncdc.gov.ng — 8.6% (54.06MB, 6 external refs; 56/56 images decode) — strong; over the 25MB ceiling raw → Stage-2 sharding/compression subject.
3. fmiti.gov.ng — 4.7% (18.76MB, 8 external refs) — strong.
4. nis.gov.ng (National Institute for Sports — redirect surprise; not Immigration) — 2.0% (6.06MB) — strong.
5. cbn.gov.ng — 28.9% (4.39MB, 1 external ref; 34/35 images) — moderate; live rates ticker/sliders suspected; pinned-state comparison pending before a fidelity verdict.
6. immigration.gov.ng — 76.9% (7.5MB) — DEFECT, honestly open: 9 relative gtranslate flag icons and 7 external refs unresolved; same straggler-fix class as ncc; fix identified, recapture pending.

Storage measurements (Stage 2 inputs, honest): raw sizes above; desk's stage2 toolkit measured brotli: nimc 10.5MB→6.92MB, health 38.37MB→10.55MB, within the 25MB ceiling with zero content removal.

## C. Honest boundaries

- Live-site byte reproducibility NOT claimed (sites change hourly); provenance per pack: source URL, capture time, per-resource sha256, OFFLINE label, external-deps marked not hidden.
- Text library untouched throughout: corpus-v05.json and all seals unchanged by this Stage-1 work.
- Infinix airplane-mode test remains the owner's hands; Stage 4 not started.

— Magani, wave owner, 2026-10-14

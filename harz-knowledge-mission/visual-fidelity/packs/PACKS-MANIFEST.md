# PACKS MANIFEST — full digests + deployed-artifact chain (Oct 14, ~07:45 WAT)

Purpose: closes the review gap "HTML packs absent from the repository; live
endpoint hashes unverified." Packs are NOW IN GIT, and the chain
local-file == KV-stored == live-endpoint is measured, not asserted.

## COMPLETE digests (sha256, full length — no abbreviations)
Receipt manifest SHA256-RECEIPTS.txt:
  5e5fb94426932c7a2256873ea22f722ec236dbe94e2b1c65b25298e58cdf45e5

nimc-v3.html (current v0.3 review subject, 10.5MB):
  local file  : 9c71cf92ff0cc5c4f3ad85e50711a337ecaf8294c41c71476e7a34a54d275d4c
  live /nimc-v3: 9c71cf92ff0cc5c4f3ad85e50711a337ecaf8294c41c71476e7a34a54d275d4c
  => DEPLOYED == COMMITTED, BYTE-IDENTICAL (measured Oct 14).

cac-v2.html (bot-challenge shell, 6.2KB, honest F-5 evidence):
  local file  : 7b31d16693eab7c405580772b665212606d8f57a1d01bcfdd110d5c392f7462b
  live /cac   : 9cded7a4bdd0717cf7c26f2174407bc6e391a594fe136fd685a01050f9d4e089
  => DEPLOYED /cac IS THE OLDER v0.1 SHELL (pre-v0.2); the committed v0.2
  shell is the better evidence; alignment pending CAC policy (site blocked).

health-v2.html (compression subject, 36.6MB, NOT deployed — over KV 25MB):
  local file  : 63750cdfdbe8305f92c2272fb2a84c137a7f5816134b607f09447a99ba8ffd25
  live        : absent (above KV value limit; Stage 2 brotli 10.55MB receipt
  published separately in stage2-toolkit/)

immigration-v3.html: RECAPTURE IN PROGRESS with fixed pipeline at commit time
(v0.1 deployed pack 22.7MB contains the pre-fix bot-404 defect; its live hash
3c02d09a8c59465fd4da807c4bf38f058b9eb2a6d3d0c4a5276b0a4247fe2db8; will be
committed here once capture completes + audit passes).

## Provenance chain per pack
source URL + capture timestamp + per-resource sha256 are embedded inside each
pack (harz-provenance comment). Reproduction: capture2.py (commit c4d41d8)
with the same source URL yields a NEW capture (site content moves — ticker
changes hourly); byte-reproducibility is therefore NOT claimed for live sites;
the committed file IS the reviewed/deployed artifact, hash-pinned here.

## Measured package sizes (awaiting Magani's audit, not final acceptance)
nimc-v3 10.5MB raw / 6.92MB brotli / health-v2 36.6MB raw / 10.55MB brotli /
cac-v2 6.2KB / immigration-v3 pending.

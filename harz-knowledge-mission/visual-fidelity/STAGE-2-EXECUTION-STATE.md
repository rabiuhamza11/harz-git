# STAGE 2 EXECUTION STATE (Oct 14, ~07:15 WAT) — toolchain proven + receipts

## Converged-seat situation (verified, not assumed)
- The five-site Stage 1 packs (NCC, FMITI, SMEDAN, NAFDAC, CBN) live in the
  OTHER seat's repo (their HEAD 8071642). Verified: 8071642 does NOT exist in
  the shared remote (rabiuhamza11/harz-git); their packs are unreachable from
  this seat. Rebuilding them here would duplicate committed work against the
  audit law. STAGE 2 THEREFORE EXECUTES IN THEIR SEAT, on their packs.
- This seat ships the PROVEN toolchain (sha256 receipts, tested on this seat's
  packs) so their Stage 2 runs on measured evidence, not intent:
  stage2-toolkit/stage2-compress.py (gzip+brotli, exact byte-recovery, JSON)
  stage2-toolkit/stage2-dedup.py (cross-pack + within-pack dedup measurement)
  paired-comparison protocol: Cloudflare Browser Rendering REST /screenshot,
  same engine + same viewport both sides, band-by-band diff (see
  evidence/nimc-paired/PAIRED-COMPARISON-2026-10-14.md for the method)
  law-3 sweep: sweep.py / sweep2.py (zero external deps + honest notices)
  capture: capture2.py v0.3 (waitForTimeout 8000, non-200 rejection,
  Accept-header font fetch) if any site needs re-capture.

## Measured results on THIS seat's packs (receipts in stage2-toolkit/)
Compression (brotli q11 / gzip -9, exact byte recovery all EXACT):
- health-v2: 38.37MB -> brotli 10.55MB (27.5%) — UNDER the 25MB ceiling with
  ZERO content removal. Open trade-off honestly noted: reader-side
  decompression (device tooling or served content-encoding) is a design
  decision pending the owner, per "report measured results, not inferred
  success".
- immigration-v2: 52.71MB -> brotli 17.81MB (33.8%) — CAVEAT: this pack was
  captured with the PRE-fix pipeline (contains the 404-CSS defect); honest
  state = needs v0.3 recapture before Stage 2 numbers count.
- nimc-v3: 10.55MB -> brotli 6.92MB (65.6%).
- cac-v2: challenge-page shell (blocked site, 6KB).
Dedup (measured):
- cross-pack shared resources: 22 -> 3.06MB savings (WordPress commons
  between health and immigration).
- WITHIN-pack duplicates: 49.47MB additional savings available (same
  resource embedded repeatedly inside one pack; pack-format dedup
  opportunity for the format design).
Regression state: nimc-v3 passes law-3 (0 external rendering deps); paired
comparison evidence preserved (logo rendered-appearance + below-fold cards
open honestly as NOT PASSED).

## This seat's Stage 2 remaining (per owner order, in flight)
- immigration v0.3 recapture + full resource audit
- health pack: compression receipt delivered; reader-decompress design
  decision = owner
- CAC: blocked per policy
- six-law matrix per site: maintained, evidence attached as produced

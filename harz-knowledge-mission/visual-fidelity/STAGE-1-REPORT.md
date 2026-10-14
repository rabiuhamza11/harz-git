# VISUAL FIDELITY STAGE 1 — FIRST PASS REPORT (Oct 14, in progress)

## Pipeline v0.1 (built today, committed)
capture.py: fetches page, embeds CSS (incl. @import chains), images, fonts as
data URIs; rewrites url() refs; EXCLUDES external scripts (honest list);
sweep.py enforces law 3 (zero external rendering deps survive);
flatten3.py dedups/unwraps double-encoded CSS (-19% size). Provenance manifest
embedded per pack: URL, capture time, per-resource sha256, excluded scripts,
honest offline status.

## Preview infrastructure (live)
harz-vf-preview.harz.workers.dev (a1, VF_KV namespace 567270715380400080ed1c75b3d1452b)
serves packs byte-identical (verified): /nimc /cac /immigration
health pack (28.6MB) exceeds KV 25MB value limit - pending Stage 2 compression.

## Captures (5 representative gov sites ordered; firs.gov.ng + fma.gov.ng
unreachable from sandbox - disclosed; education.gov.ng capture timed out - pending)
- cac.gov.ng: 5.7KB shell (JS-rendered app)
- nimc.gov.ng: 1.35MB (JS shell + loader)
- immigration.gov.ng: 22.7MB (static WordPress, full content)
- health.gov.ng: 28.6MB (static, over limit - Stage 2 pending)

## STAGE 1 FINDINGS (honest, by measurement)
F-1 JS-SHELL SITES (NIMC, CAC): static capture preserves the shell + loader
only; the site's real appearance is built by JavaScript at runtime. Visual
fidelity for these requires RENDERED-DOM capture (pipeline v0.2: real browser
loads the page, DOM is captured post-render, resources embedded then).
F-2 BOT-DIFFERENTIAL CONTENT (immigration.gov.ng): curl-fetched HTML contained
"Page Does Not Exist" overlay sections that the real browser does NOT render
(browser-verified side-by-side today). The capture fetch must use a real
browser engine or accept fidelity loss on bot-gated sites.
F-3 SIZE: naive packs 1.3-28.6MB. Flattening saved 19% (double-base64 removal);
remaining bulk: embedded TTF fonts (2.7MB in health), webp images, repeated
icon embeds across Elementor/woostify style blocks. Under the 25MB ceiling:
nimc, cac, immigration(22.7). health NOT yet.
F-4 LAW-3 PASS: 0 external rendering deps, 0 external scripts in all served
packs (verified programmatically). Anchor hrefs retained (navigation
provenance, labeled not-captured).

## Stage 1 verdict: NOT YET PASSED — F-1/F-2 mean the fidelity comparison must
use pipeline v0.2 (browser-based capture) before the owner's
online-vs-offline comparison is meaningful. v0.2 build is the next work item,
then re-capture all five sites, then Stage 2 compression.

## Not touched (law 6)
Accepted 5K text library + seals: untouched. Offline reader (a2): untouched.

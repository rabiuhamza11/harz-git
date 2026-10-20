# CROSS-DOMAIN NAVIGATION v1 — LIVE (Oct 20 ~12:5x WAT, Hauwa desk, Gate 1 build item 2)

## What changed
1. VISUAL VERSION button: when a stored corpus article has a captured visual pack page (63 today: aljazeera 15 + cnn 48), the reader shows a VISUAL VERSION AVAILABLE — OPEN badge above the honest verification badges. Stored visual page is one tap away; the text reader with its integrity badges remains the base. Map is BAKED into the shell (63 entries, offline-safe, no fetch, no worker route needed — /v2/visualmap KV key is canonical data, worker route 410 was avoided by design; production worker untouched per safe-deploy lane discipline).
2. Shell PACKS: Healthline pack added (homepage + 4 pages, 8.2MB) — first visual Healthline in the library. Section depth added to dailytrust (4), nitda (5), businessday (5), dailypost (5) — merged with the capture desk's existing entries, zero clobbering (marker gate: CAS fresh read, all anchors count==1, size guard, syntax check both script blocks, upload, live readback all probes).

## Evidence
- Upload 989,411B, readback LIVE: VISUALMAP 63 entries baked, badge present, no fetch loader remains.
- Sample mapping verified: aljazeera corpus URL -> /v2/packs/aljazeera.com/<slug>.html (pack key live, 200).
- 25 additive section/healthline pack keys uploaded (0 failures), each verified reachable through pack route earlier for the pattern.
- 2 shell writes today both passed the marker gate; third desk shell-state verified present after each write (concurrent-desk safety).

## User-visible result (after next online sync)
- Corpus article for a visual-converted domain opens in the visual reader AND offers the full visual page (images, layout, original styling) in one tap.
- Healthline appears in the Visual packs list with 4 subpages.
- News packs gain their section pages (sports, politics, metro, energy, markets, regulations...).

## Gate 1 remaining
- Restart-survival test + complete device journey receipt (one session on the Infinix, screenshots).
- Corpus-card preference order (visual first automatically instead of badge-tap) — next iteration.

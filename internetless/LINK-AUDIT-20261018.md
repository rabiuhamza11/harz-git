# FULL LINK AUDIT — Oct 18 09:1x (Hauwa, server-side, before owner device test)
Owner order: "Test every link before I test everything."

## PACK INTERNAL LINKS (the navigation Dad reported failing on device)
- NYSC main pack: 45 wired internal links extracted; ALL 45 targets serve HTTP 200 with real visible content. PASS 45/45.
- CAC main pack: 14 wired internal links; ALL 14 targets serve 200 + content. PASS 14/14.
- Total sub-pages tested: 59/59 PASS. None empty, none failed.
- Missing images on 3 sub-pages only: dggallery.html 65/66, index.html 14/15, serviceyear.html 19/22 embedded. (3 stray images total, minor, for Magani's list.)

## CORPUS ARTICLE LINKS (v0.8.1 Read-more restoration)
- 90 distinct linked article targets reconstructed from live store; ALL 90 serve full body + content_hash verified. PASS 90/90.

## HONEST-ALERT LINKS (correct refusals, verified NOT stored)
- NYSC: 27 external (portal.nysc.org.ng, campactivity, social, jamb, nimc, waec...) — none captured, alerts honest. 7 asset alerts (favicons/webmanifest/PDF) honest.
- CAC: 13 external (icrp.cac.gov.ng, social, pebec) honest; 14 asset alerts honest.
- EFCC: 8 links, ALL genuinely external (Overview#history + 7 social). No EFCC sub-pages exist; alerts honest until captured (Magani item G/H).
- NYSC southwest.html: alerts, NOT stored — capture candidate for Magani (area-office region page).

## VERDICT
Server-side: every testable link passes or refuses honestly. Zero broken links found.
The device "all links click fail" state = phone holding pre-wiring packs. SW r9 cache-name change
is the drop mechanism; device retest = fresh visit + full sync + airplane.

## REMAINING FOR MAGANI (from this audit)
1. EFCC sub-pages (Overview#history etc.) — capture if wanted for offline nav.
2. NYSC southwest.html — capture candidate.
3. 3 stray unembedded images (dggallery, index, serviceyear).
4. EFCC stylesheet inline (item J, page renders unstyled).

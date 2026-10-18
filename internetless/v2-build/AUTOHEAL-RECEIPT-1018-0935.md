# AUTO-HEAL PACKS (Oct 18 09:35 WAT) - sw r11 + shell autoHealPacks

Device evidence (Infinix, 9:16 AM, airplane): "This page is not stored on this phone yet. Missing /v2/packs/cac.gov.ng" and
"/v2/packs/nysc.gov.ng". Cause: each SW version change renames the cache, wiping old packs; packs only returned on a
manual full Sync (1069 docs + 62 packs), which the owner had not completed since the rename.

Fix: shell now runs autoHealPacks() on every ONLINE open of Home (and on the 'online' event): checks the real cache
for all 62 pack URLs, downloads only the missing ones (4 parallel), shows honest status ("Site packs: 62/62 stored
on this phone"). Packs no longer depend on tapping Sync. Docs (1069) still use the Sync button.

Clean-slate test: browser context reset (empty cache, no SW), open /v2/ twice, NO taps ->
  packheal: "Site packs: 62/62 stored on this phone (auto-downloaded)"
  cache: harz-internetless-v2-r11 = 62 packs
Airplane (page offline + SW fetch blackhole + heartbeat), honesty probe 404 (network provably dead), then:
  /v2/packs/cac.gov.ng 200 5.28MB | nysc.gov.ng 200 5.23MB | efcc.gov.ng 200 742KB
  cac resources_faq.html 200 | nysc supportline.html 200 | nysc faq.html 200 | cac about_organizational-structure.html 200

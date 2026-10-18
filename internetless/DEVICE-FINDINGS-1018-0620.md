# DEVICE FINDINGS Oct 18 06:20-06:22 WAT (Infinix, airplane mode) + FIXES

Owner report: (1) no link opens inside Madagascar article, (2) no image shows in NYSC pack,
(3) Registration Portal refuses.

## 1. Links in articles - ROOT CAUSE: coverage, not code
Measured over all 1,069 stored docs: only 7 docs contain a link to a DIFFERENT stored page
(19 links total). Most article links point to sites never captured. The earlier "3,142 links
linkified" counted LABELLED links, not working ones - the claim was misleading and is retracted.
In the Madagascar article the only "open locally" link pointed to the article itself (no-op).
FIX (v0.9 shell, v2.shell): every article now ends with a "More from this library" block -
6 related stored articles (title-word similarity), previous/next in the same source, link to the
full site list. All are #/doc/N links that open offline. Self-links relabelled "(this article)".
Stored text and hashes untouched. Verified live: related card -> doc 126, FULL BODY 9,083, hash OK.

## 2. NYSC images - ROOT CAUSE: the site's own script
nysc.gov.ng ships upgradeImagesToWebp(): when a service worker controls the page it wraps each
<img> in <picture><source srcset="img/Carousel_1.webp"> ... The browser prefers that <source>,
the relative .webp path was never captured, so every embedded (valid) image blanked.
Only fires under a controlling service worker = exactly the real offline setup.
All 13 embedded data-URI images verified valid (PIL decode) - the data was never the problem.
FIX: swapper neutralised (early return) + 15 data-webp attributes removed in v2.pack.nysc.gov.ng.
Verified in a controlled-SW browser: logo, awards photo, mobile clinic, corps photos all paint.
CAC and EFCC packs checked: no swapper, unaffected.
Backups: v2.pack.nysc.gov.ng.backup-pre-v09, v2.shell.backup-pre-v09 (KV) + files here.
Remaining: 2 relative img refs (img/news4.jpg, img/NYSC NDPR AUDIT 2023.png) were never
captured in the pack - those two news thumbnails stay blank (capture gap, disclosed).

## 3. Registration Portal - NOT A BUG
portal.nysc.org.ng is a live registration service. The alert "OFFLINE VISUAL PACK: this original
link needs an internet connection" is the designed honest boundary.

## Other observation
Home lists "theconversation (45)", "businessday (45)", "dailypost (40)" etc. as sites separate from
"theconversation.com (477)" - domain labels from the v0.8 additions are not normalised.
Cosmetic; not fixed yet.

## Status
Sync verified in a fresh browser: SYNC COMPLETE 1069/1069, packs 3/3, 0 failed.
Full airplane re-run in progress (browser session expired mid-run; restarted).

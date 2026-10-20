# VISUAL EXPANSION + ONLINE/OFFLINE DUAL OPEN (Oct 20, ~08:50-09:45 WAT, Nuruddeen)

Owner rulings this session: "I want all site to open as they are" + "All site in corpus should open
online" + "And offline" = the library behaves like the real internet: live when connected, stored
when not.

## NEW VISUAL PACKS (both verified rendering in real browser, zero external refs)
1. dailypost.ng (Daily Post Nigeria) — 4.4MB visual homepage. Next.js SSR; 41+2 imgs compressed to
   620px q68 and inlined; 30 woff2 fonts inlined into the chunk CSS; scripts stripped; honest banner
   (captured 2026-10-20; offline news does not update itself).
2. businessday.ng (BusinessDay NG) — 1.4MB visual homepage. WordPress; 86 imgs inlined; srcset/
   lazy attrs stripped so inlined src wins; stylesheet was HASHED (main.DXoCx9n1.css) — first pass
   missed it (unstyled pack lived ~20 min, honest disclosure), fixed + icon fonts (bootstrap-icons,
   font-awesome, Lato) inlined as data URIs. Both packs registered in shell PACKS via CAS+readback.

## CORPUS CARDS: LIVE WHEN ONLINE / STORED WHEN OFFLINE
Shell card onclick now: navigator.onLine && domain has a dot -> window.open('https://domain','_blank')
else -> stored site index. Honest label on every card. Dotless corpus keys (theconversation,
businessday, dailypost, dailytrust) are corpus-internal groupings -> always open the stored index
(no live URL exists for a dotless key). Shell 970,753B live, readback identical.

## HONEST INCIDENT #2 (same failure mode as yesterday, second and LAST time)
A failed exact-string patch was followed by the upload line anyway (no set -e, no marker): v2.shell
was 0 bytes for ~40 seconds. Detected by readback, restored immediately from the CAS-read base;
live re-verified 970,617B within a minute. ROOT CAUSE FIXED: patchers now write a patch-OK marker
and uploads run ONLY if the marker exists + size guard + CAS re-read + readback. The marker gate
was introduced right after this incident and is the standing rule for every shell write.

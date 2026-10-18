# NYSC MENU WALL FIX (Oct 18 09:40 WAT)

Owner report: tapping FAQ on NYSC shows a wall of green menus (About Us/Top Management/Departments),
no FAQ content visible. Diagnosis: NOT a wrong link - the phone WAS on faq.html. The packs strip site JS,
and the captured stylesheet styles .dropdown-menu but never hides it, so every navbar dropdown renders
permanently open, burying page content under ~3 screens of menus on phones.

Fix (all 46 NYSC pages: home pack + 45 subpages, re-uploaded to KV 2026-10-18 09:38):
- Pure-CSS collapse, no JS (packs are scriptless by design): checkbox hack.
- Mobile (<992px): navbar list hidden behind a "NYSC site menu" toggle button; dropdowns tap to open.
- Desktop: dropdowns open on hover as usual.
- CAC packs untouched (their menu is a compact single row).

Verified (real browser): FAQ page at phone width now leads with "Frequently Asked Questions /
Online Registration" content; nav hidden until tap; tap opens nav (display:block) and dropdowns
(list items visible). Desktop render verified via platform screenshot. 62/62 packs re-auto-healed
into a fresh context from the updated KV.

Device note: SW is network-first for packs, so the phone picks the fixed pages up on the next
ONLINE open of the pack; airplane mode keeps the old copy until then.

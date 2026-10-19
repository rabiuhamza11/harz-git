# SEC PACK RECEIPT — Release 1 inclusion (Oct 19, owner ruling "Go for sec")

## Scope
SEC Nigeria (sec.gov.ng) captured into the Internetless v2 library per the commercial sprint.
1 main pack + 23 sub-pages + index duplicate = 25 KV keys (v2.pack.sec.gov.ng.*).

## Page set (24 captured)
index (homepage), for-investors, find-registered-operator, circulars, investment-scams,
whistleblowing, for-operators, operator-registration, capital-market-data,
statistical-bulletin, mergers-acquisitions, for-businesses, register-company,
raising-capital, about, who-we-are, contact-us, faq, news, mandate, enforcements,
forms, annual-reports, rules-regulations.

## Engineering decisions (all verified live 2026-10-19 evening)
1. Scripts stripped; nav rewired to /v2/packs/sec.gov.ng/<flat>.html (29 wired links on whistleblowing sample). Uncaptured internal links left live -> honest resolver alert offline.
2. Images: all <img> embedded as data URIs. Photo-PNGs converted to JPEG (820px, q70). Two giant vector logos (RevopLogo.svg 593KB, ngr.svg 221KB — 63% of naive capture) rasterized at display size (13KB + 48KB). Final pack 19.8MB (naive capture was 84.6MB).
3. Fonts: Montserrat subset to Latin glyphs via fonttools+brotli (5 weights x ~18KB embedded per page; ExtraBold/Black dropped, Bold covers). Zero unresolved font refs, zero external stylesheets.
4. Vue-bound dead logo (:src template) replaced with static embedded logo.
5. Shell PACKS list updated: SEC entry label "SEC Nigeria — 16.7MB + 24 internal pages (captured 2026-10-19, renders offline)" — NOTE final size 19.8MB after fonts; sha256 main-pack anchor 4fd5c7deccef0e5e written to shell (old c4adc0ef2017b08e gone).
6. Sync path: shell /v2/ PACKS -> phone sync pulls main + 24 pages. SW r11 network-first packs = new pack wins on next online sync.

## Honest limitations
- Language variants (/ha/ /ig/ /yo/), search, RSS feeds not captured.
- Sliders/carousels were script-driven; static content renders, carousels do not animate offline.
- ExtraBold/Black typography approximated by Bold.

## Acceptance (pending owner device session)
Airplane mode: open SEC, homepage + sub-pages render with images/fonts, internal nav works, external links alert honestly. Part of the ONE device journey session (with EFCC screenshot).

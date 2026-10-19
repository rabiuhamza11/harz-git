# EFCC PACK REPAIR — P0 item 1 of the commercial-readiness sprint (Oct 19, 2026)

THE 4-FIELD RECORD:
- Problem: EFCC pack showed infinite "Loading..." spinners in news/videos/wanted/gallery sections
  (JS-built content, scripts stripped by design) and had zero internal navigation (menu items were
  client-side buttons without hrefs).
- Evidence: real-browser render Oct 19 (page_state capture); 0 internal hrefs, only tel:/mailto:.
- Repair: (1) home pack: every dead spinner replaced with a precise honest label (Latest News -> link
  to stored News snapshot; Videos -> "Video streams need internet. Not stored offline."; Wanted Persons ->
  link to stored page; Gallery -> honest not-stored; Radio -> "Live stream — needs internet") + green nav
  bar (Home/About/Wanted Persons/News/FAQ/Contact/Submit Petition-live-service) injected after <body>;
  (2) six new section packs captured live Oct 19 via real-browser text capture from the rendered site:
  Overview (full EFCC history timeline 2002-present), Leadership (all chairmen + acting), WantedPersons
  (honest: listing showed 0 entries at capture; featured card name recorded), News (9 headlines Oct 2026,
  honest "offline news does not update itself"), FAQ (50 questions, answers marked needs-internet),
  Contactus (address/phones/email, tel:/mailto: live links). Each carries the honest banner: text capture,
  not a pixel mirror. (3) shell PACKS list updated: EFCC entry now includes 6 pages -> auto-heal fetches them.
- Acceptance: server-side 200 on all 7 pack URLs; zero "Loading" text nodes remain in home pack; desktop
  render verified in real browser; each dead section shows content or an honest label. Phone proof pending
  (owner opens library online once -> auto-heal fetches 68 pack URLs -> airplane retest of EFCC home + News).

Build honesty: two self-caught bugs fixed before shipping (template placeholders unsubstituted, doubled CSS
braces from f-string conversion) — both verified fixed live before this receipt.
KV: v2.pack.efcc.gov.ng (patched home), v2.pack.efcc.gov.ng.{Overview,Leadership,WantedPersons,News,FAQ,Contactus}.html,
v2.shell (PACKS updated). All uploads success:true.

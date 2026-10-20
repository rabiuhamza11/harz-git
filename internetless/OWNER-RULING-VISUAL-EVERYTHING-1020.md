# OWNER RULING — "EVERYTHING VISUAL OFFLINE, VIDEO INCLUDED" (Oct 20, 2026, ~06:42 WAT)

Owner words (verbatim, addressed to Hauwa desk, ecosystem-wide): "is not sec nysc or so that will be visual.
i want everything to be visual offline. even video most open 📴" + "Hope everyone listening."

ALL DESKS: this ruling is binding. Audit this record before your next Internetless build.

## Meaning
1. Visual preservation is the standard for ALL captured content, not only the flagship packs.
   No text-only additions to the library from this date.
2. Video must open offline wherever engineering can make it true.

## The honest engineering boundary (unchanged law, now with proof)
- Videos hosted as files on the captured site's own server: STORE and PLAY OFFLINE. Implemented and
  proven today: CAC's official promo video (4.8MB, byte-identical sha 8cc04036126c20fc…, served
  video/mp4 at /v2/packs/cac.gov.ng/vids/CAC_vid.mp4 through the pack route, auto-heal fetches it,
  SW caches it, plays in airplane).
- YouTube/stream-hosted videos (EFCC's are all YouTube): legally cannot be stored. Offline keeps
  titles + thumbnails + links; playback needs internet. This is the law, not a shortcut.

## Implementation record (Oct 20, Nuruddeen)
- ob-worker patched: pack route now serves stored media (mp4/webm/m4v/ogg) with correct MIME +
  immutable cache. Deployed via safe-deploy, bindings preserved (HARZ_BROWSER, HARZ_FX). Live 200.
- CAC home pack: video src rewired to pack URL, hidden class removed, honest banner added
  ("OFFICIAL CAC VIDEO — STORED OFFLINE, PLAYS WITHOUT INTERNET"). Verified rendering in real browser.
- Shell PACKS (CAS + readback): CAC pages now 15 (14 pages + video), label updated. Pack total = 95.
- Phone: packs are network-first (SW r10) — next ONLINE open auto-fetches the video; airplane then plays.
- EFCC Videos page (YouTube) unchanged: honest list + inlined thumbnails, playback online.

## Standing architecture note
Single-writer proposal for v2.shell (pack list from KV key scan) still awaiting owner ruling —
tonight's repeated cross-desk overwrites (4 in 40 minutes) show why it is needed.

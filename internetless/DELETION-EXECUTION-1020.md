# DELETION EXECUTION RECEIPT — items 1 & 2 (Oct 20, 2026, Nuruddeen)

Owner order: "You can execute item 1 and 2." Item 3 (v2 text layer) HELD per desk counsel until the
visual build passes the device matrix on the owner's phone.

## ITEM 2 — harz-search-ng-1 D1 DELETED (uuid 53b61023-5911-4c41-bfcb-931e609397e4, a1)
- Verified identity BEFORE deletion: abandoned Oct-12 experimental search index — Hausa Wikipedia
  snippet index, 50,000 docs, 651,292 terms, batch meta (ha-01..03), snippet_text only, source
  "wikipedia-ccby-sa-4.0". NOT the live search (harz-search binds 3f84cac4 = harz_search_v02).
  Content re-derivable from public Wikipedia + the master corpus (content_hash links intact).
- Backup before delete: full 50,000-row manifest (id | url | content_hash | fetched_at) in
  internetless/deleted-search-ng-backup/docs-manifest.txt, sha256-prefix e2689069241a4869, 50,000
  unique hashes confirmed pre-delete. D1 export API unavailable to this token; manifest + derivation
  path recorded as the honest backup.
- Deleted via API, success: true. Freed: ~132.8MB (free-tier D1 pressure eased).

## ITEM 1 — one-file readers DELETED (a2 scope, the provable part)
- Deleted KV keys onefile, onefile.0, onefile.meta (a2 HARZ_BROWSER ns 409fead4…): the v0.3 Browser
  one-file library. All three backed up in vault bundle 84855d3c21b6cc82 BEFORE deletion.
- NOT deleted (honest scope note): the a1-side one-file readers — the a1 browser worker exposes no
  KV binding I could audit and the exact keys of the desk's Group B list 1 and 3 are not in my audit
  scope; blind cross-account deletion refused. a1 keys need the auditing desk's exact key list, or a
  dedicated a1 audit pass, before their deletion (no-loss law).

## HONEST ROUTE REPAIR (consequence of deletion)
- /onefile and worker root returned 500 after key deletion (null payload). Worker patched + redeployed
  (bindings preserved): both now return 410 with an honest retirement page pointing to /v2/ visual
  library + backup note. Root 410, /onefile 410, /v2 200, CAC video pack 200 (video support verified
  intact through the patch — mp4|webm route live).
- Honest defect disclosure: my first retirement patch changed loadOnefile's return contract and broke
  the root page (500) for ~4 minutes; detected on verify, repaired by restoring the contract and moving
  the retirement page to the !v branch at route level. Lesson: guard at route level, not library level.

## WATCHDOG HARD-DEPLOY (owner order 07:08 — completed this same session)
- harz-pack-watchdog deployed (a2, KV HARZ_BROWSER preserved), cron */15 CONFIRMED via schedules API
  (created 06:09Z). watchmap in KV: 4 sites, 82 pages (sec 24, nysc 37, cac 15, efcc 6).
- Live manual fire verified honest: slice_checked 40, total 82, changes 0, misses 14 (disclosed),
  cursor rotating, full sweep every 2 fires (30 min).

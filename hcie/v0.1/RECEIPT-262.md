# RECEIPT 262 — HCIE v0.1 live (Aisha seat)
Date: 2026-10-31 | Worker: harz-hcie.harz.workers.dev | D1: harz-root-db (courses 4 new tables, no new DB)

## Built
- Sources registry, objects (content-addressed), journal (DETECTED/ACQUIRED/VERIFIED/PUBLISHED/UNCHANGED/REJECTED), runs.
- Conditional GET (If-None-Match / If-Modified-Since) then canonical-text SHA-256 fallback.
- Canonicalisation: strip script/style/tags, collapse whitespace, hash TEXT not raw bytes.
- Refuses bodies under 200 chars as incomplete (integrity guardian).
- Verified flag set only after re-hash of stored bytes.
- Four honest states: LIVE / CACHED / STALE / OFFLINE. A source with no object reports OFFLINE (advertised != captured).
- PWA: manifest.json, sw.js, icon.svg, light theme #f0f2f5.
- Cron */15 for news tier; per-source tier_min honoured in state math.

## Evidence (live)
- Cycle 1: 3 sources, 3 CHANGED, objects 1-3 verified (dailytrust 6507 B sha 813d7d42, guardian-ng 17976 B sha 9823e319, cbn 1014 B sha 8b17dcac).
- Cycle 2 seconds later: 3 UNCHANGED, 0 new objects -> no duplicate capture.
- Journal 15 events; object retrieval /api/hcie/object/1 returns verified canonical text.
- Browser render verified: page shows 3 sources all LIVE, 3/3 verified, journal tail.

## Open / next
- Change detection on a real content edit not yet observed (needs a source to publish).
- Mesh distribution + per-device manifest pull = HCIE v0.2.
- Reverse direction (device -> review queue) not built.

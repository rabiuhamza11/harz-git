# OFFLINE READER v0.2 STAGE B — BUILD RECORD (Oct 6, 2026, workbench-proven)

## The corpus (charter Stage B: deliberately small, full-length)
47/47 pages acquired Oct 6, ZERO failures, ZERO truncation:
- 30 businessday.ng URLs (11 articles + home/category/author pages) — polite crawl, 2s delay, UA with contact
- 17 HARZ platform pages (harz.workers.dev + super-cloud) — our own docs
- 112,902 chars total (Python code points; 113,030 UTF-16 units in JS — convention
  difference noted, both count the same sealed bytes on disk)
- LONGEST PAGE: 11,929 chars ("From private scale to public markets", businessday)
  vs v0.1 cap of 6,000 — the prefix era is over, proven in the corpus itself.
- Honest shells: 3 HARZ JS-app pages extract thin server-side text (151-340 chars),
  disclosed in receipts as text_chars; degenerate guard refuses <50 chars at boot.
- Headings + links preserved per page where reliably available (up to 200 links).

## Seals (receipts on everything, principle 7)
- Corpus file sha256 (transport pin): d2869e8b164db733fed029feb19a376a794ef39fee205f11c62700a24445a874
- Engine canonical digest (semantic seal): 9683f6e138ba1b25a1b52942ad3b972a791d642bfe56352ef42c3da3d2ff2e1b
- Acquisition receipt per page: url, final_url, status, raw_bytes, raw_sha256,
  text_chars, headings count, links count, fetched_at (2026-10-06).
  Vaulted: acquisition-receipts-v02.json; public: rabiuhamza11/harz-node reader-v02/.

## Reader v0.2 (additive; v0.1 pins untouched)
- reader-v02-server.js pin c836e870618e197c, port 8797
- Two-layer fail-closed: transport sha gate BEFORE parse; engine digest gate
  before serving (503 "sealing" until verified, exit 1 on mismatch)
- Provenance: OFFLINE + CACHED(fetched_at) + content_hash + STALE(>30 days,
  unknown freshness counts as stale); FULL TEXT badge with exact char count.
  This build never fetches live, so nothing is ever labeled LIVE — footer says so.
- Headings outline + links section on every reader page; in-page find; PWA.

## Workbench battery 8/8 GREEN
B1 search frozen contract over v0.2 (nbc bottling -> NBC at 75, 7,645 chars)
B2 FULL-LENGTH: longest page 11,929 chars served whole; "no truncation" badge;
   TRUNCATED absent by construction (verified in page HTML)
B3 /raw byte-exact vs corpus text (11,929/11,929)
B4 headings outline + links section rendered
B5 provenance badges: OFFLINE / CACHED 2026-10-06
B6 STALE unit: fresh=false, old=true, unknown=true (worst kind = stale)
B7 tamper: corpus title flipped -> transport seal REFUSES before parse
   (expected/computed printed, no serve); second layer would also catch
B8 cross-instance: two nodes, identical digest 9683f6e1 — byte-identical proof

## Delivery
Public repo rabiuhamza11/harz-node reader-v02/ (all 4 files API-true read-back MATCH).
Release tag reader-offline-v0.2, asset harz-reader-v02-kit.tar.gz 56,566 bytes,
anonymous public download byte-exact (6ee018ec both sides). On 3G this is seconds.
Owner field steps: download, extract next to engine.js + search-core.js,
bash start-reader-v02.sh, open 127.0.0.1:8797, search, tap, read FULL article,
then airplane mode ON and read again. Field receipt will close Stage B.

## Honest labeling
WORKBENCH-PROVEN ONLY as of this record. Browser field test = owner's hands
(same discipline as Oct 3 door, Oct 6 search, Oct 6 reader v0.1 — all sealed).

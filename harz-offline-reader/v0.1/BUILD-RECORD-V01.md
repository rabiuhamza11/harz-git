# OFFLINE READER v0.1 STAGE A — BUILD RECORD (Oct 6, workbench-proven)

## Shipped
Additive surface, zero bytes of frozen material changed:
- reader/reader-server.js (pin cfa5ae3cfe82c73f, 14,992 bytes) — public repo rabiuhamza11/harz-node + release asset
- reader/start-reader.sh (pin 589e612b63299cbf) — port 8796, wakelock, integrity prints
- Reuses FROZEN untouched: search-core.js 853dc0ff, engine.js f442a6a5, corpus v0.1 (digest 8bdec9df, 1,409 docs)
- Delivery: release tag reader-offline-v0.1, asset harz-reader-kit.tar.gz (6,186 bytes, gzip) — 0.2% of the search kit size; public anonymous download verified byte-exact 74f15a23.
- Note: raw.githubusercontent served stale hash d5558cd4 hours after push (CDN lag); API-true content verified MATCH cfa5ae3c. Release asset is the delivery path and is exact.

## What it does (charter 13f5a70, Stage A)
Click a search result -> opens the LOCAL STORED TEXT, never the URL.
Every reader page shows: OFFLINE badge, CACHED badge + fetched_at (2026-09-19),
content_hash, TRUNCATED badge when the 6,000-char cap was hit (502 of 1,409 docs),
in-page find (client-side, no network), original URL as provenance text only.
Frozen rule enforced in labels: a prefix is never a page, a cached page is never live.

## Workbench battery (all green)
1. Boot + fail-closed digest: /health digest 8bdec9df exact match, mode reader, truncated_texts 502.
2. Search contract unchanged: "nigeria tax" total 57, same frozen engine ranking (top: "Why exiting Nigeria does not end a company's tax duties", id 865).
3. Reader labels: OFFLINE / CACHED 2026-09-19 / content_hash / provenance note — all PASS on id 865.
4. Full stored text served: /raw/865 byte-exact vs corpus text (5,812 chars) TRUE; full text present in reader HTML TRUE.
5. TRUNCATED badge: PASS on capped doc (id 11, 6,000 chars).
6. In-page find box: PASS (client-side highlight + match counter + jump).
7. PWA: manifest.json (HARZ Reader) + sw.js 200 + theme #f0f2f5.
8. Zero network by construction: no outbound URLs in server code; UI fetches localhost only.

## DEFECT CAUGHT BY THE BATTERY (pre-ship, per methodology)
First build booted happily on a TAMPERED corpus (title flipped) and served with
digest null. Violation of principle 5 (fail-closed) and the charter. FIXED before
ship: reader now hard-pins EXPECTED_DIGEST 8bdec9df; until digest verification
resolves, ALL routes return 503 "sealing"; on mismatch it prints expected/computed
and process.exit(1) — REFUSING TO SERVE. Re-test: tampered corpus produced exactly
the FAIL-CLOSED refusal, clean corpus seals and serves. The frozen search node
(2794cb73) has the weaker property (digest displayed, operator compares) — its
pins are frozen so it is unchanged; the reader is the NEW surface and now carries
the stronger law from birth. Logged unsmoothed: the new surface is stricter than
the old one, and that is the correct direction.

## Honest labeling (evidence law)
WORKBENCH-PROVEN ONLY. Browser test = owner's hands, same as kit v0.1/v0.2
precedent: real phone, Termux, airplane mode, Chrome, screenshot receipt.
Field steps: download release asset (~6KB, seconds on 3G), extract in the SAME
folder as the search kit files, bash start-reader.sh, open 127.0.0.1:8796,
search, tap result, READ, then airplane mode ON and read again.
Stage B (full-length 40-100 page corpus) starts only after Stage A is field-proven.

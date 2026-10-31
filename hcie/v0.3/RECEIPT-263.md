# RECEIPT 263 - HCIE v0.3: versioning inside the insert path + offline reader

Date: 2026-10-31 (Aisha). Worker: harz-hcie (harz account). D1: harz-root-db (ceaea454), no new database.

## 1. Version numbering - fixed in the insert path
- Version is now computed by the database in the same statement as the insert:
  INSERT ... SELECT ?,?,?,?,?,?,?,?,?,?,?, COALESCE(MAX(version),0)+1 FROM hcie_objects WHERE source_key=?
- Concurrency: unique index ux_hcie_obj_version(source_key,version); a collision becomes a hard error
  and the writer retries up to 4 times with backoff. No duplicate versions observed.
- Proof of sequential assignment: canary-github v1 (1f32e6ab, 175b) then v2 (1d2f140b, 185b), same source,
  distinct content hashes, v1 preserved.
- Reconciliation of existing history WITHOUT content changes: Guardian Nigeria v1 9823e319, v2 93dab4f1,
  v3 9010057b assigned by capture order, each recorded in the journal as VERSION_RECONCILED.
- Full table at close: 9 objects, zero duplicate (source,version) pairs.

## 2. Offline reader - /read
- Retrieves objects only through verified rows (/api/hcie/object/:id requires verified=1).
- Recomputes SHA-256 in the browser over the received text and refuses to store on mismatch.
- Stores the document text itself in localStorage (not a URL), keyed by object id.
- Labels: LIVE (fetched + verified now), CACHED (stored earlier), OFFLINE (storage with no network),
  UNAVAILABLE (not held). A row is only ever shown as CACHED when bytes are actually stored.
- Browser test (browserbase, real render): page listed 9 objects, opened canary-github v1, showed LIVE
  with sha256 1f32e6ab3d56b322fc9e3eb30b3172cb08dfba9d00cd722408fc95d874addfcb and marked the rest UNAVAILABLE.

## 3. Continuous capture evidence gathered during this work
- Cron */15 live. During the session the watcher captured genuine external changes on its own:
  dailytrust v2 (378fd9b7, 15:09:42) and guardian-ng v4 (c9881ffb, 15:09:43), both new immutable objects.

## 4. Known defects and open items (not claimed as fixed)
- Reader displayed "vundefined" because the object payload lacked the version field; fixed and
  redeployed, verified by API (object 7 returns v2). Browser re-test of that specific fix is pending.
- Canary revision 3 (GAMMA-4C18) not yet captured: jsDelivr served the cached revision 2 at test time.
  A GitHub raw / jsDelivr CDN lag, not a HCIE fault. The cron will capture it when the CDN refreshes.
- Exchange price APIs (OKX ticker, Binance, CoinGecko) are not reachable from this worker egress,
  so no market-feed source was added. Recorded honestly rather than worked around.
- Two-phone mesh distribution: OPEN. October 25 failure NOT closed and not claimed.
- HCIE is NOT complete and NOT device-tested on the Infinix. Airplane-mode reading is the owner's test.

## 5. Boundaries respected
- No immutable object overwritten; version reconciliation was metadata only with journal entries.
- Integrity verification not weakened; per-source minimum body size retained.
- No full-corpus phone synchronisation introduced.

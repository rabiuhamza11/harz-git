# FULL OFFLINE MATRIX (browser-grade, true airplane emulation) — Oct 17 08:35-08:50 WAT
Build: v2auth.shell (TX rebuilt from self-verified store), worker redirect /v3->/v2, cache harz-internetless-v2-r3.
Emulation: CDP Network.emulateNetworkConditions offline=true applied to PAGE + SERVICE WORKER targets
(SW-level, not just page-level; page-level alone lets SW fetches through - verified and corrected mid-test),
plus navigator.onLine=false override (re-applied after each reload).

PASS 1. Fresh sync: SYNC COMPLETE - docs fetched 932/932 - verified in phone cache 932/932 - packs 3/3 (08:35:08).
PASS 2. Offline badge honest: OFFLINE - CACHED DATA.
PASS 3. Offline body search "Madagascar": 20 results, coverage "932 titles + 932 stored bodies + 3 packs".
PASS 4. Offline article open (doc 0): FULL BODY 6,895 chars, IDENTICAL TO SEALED COPY de574c08a6c3.
PASS 5. Offline repaired doc 891 (christa-pike): FULL BODY 7,944 chars, hash verified dec4732f3940 - repair chain works.
PASS 6. Offline NYSC pack: full visual pack, OFFLINE VISUAL PACK banner, captured 2026-10-16.
PASS 7. Pack internal nav (About Us menu) works offline.
PASS 8. Offline sync refusal: "No internet: sync needs a connection. Nothing was changed." - honest refusal.
PASS 9. Cold open offline (reload with network dead at SW level): shell served from SW cache, OFFLINE badge.
PASS 10. Reconnect recovery: badge ONLINE, sync state intact.

Known minor defects (disclosed):
- Home "last sync ... in phone cache 932/932" line is localStorage-derived; after an external cache wipe it
  can overstate until re-check/sync. Search coverage counts are live-verified (not affected).
- Doc titles inside some repaired records still carry mojibake (kit repaired bodies, not title fields).
- Shell badge wording "IDENTICAL TO SEALED COPY" on repaired docs is transport-true vs store; provenance
  line discloses 102-doc divergence from the Oct 8 export.

Store/integrity state: 932/932 live docs self-verify (sha256(text)==content_hash). TX table rebuilt from
the verified store (102 entries updated). All 932 re-checked against TX after rebuild: PASS.

OPEN ITEM (other desk): onefile v0.7 deployed 07:17 UTC, live sha 96d7a32f... vs row-109 recorded release
sha b285b285... - hash mismatch unexplained. v2 mission unaffected. Flagged for ruling.

REMAINING for device-grade completion (owner's law): ONE phone sitting on the Infinix:
online re-sync (store changed), then airplane matrix. Nothing else blocked.

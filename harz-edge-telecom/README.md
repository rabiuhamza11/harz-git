# HARZ Edge Telecom — Surviving Artifacts (audited + committed Sep 14, 2026)

Deep audit by Magani, Sep 14 2026, following the desk's durability finding.

## What this commit preserves

1. `g1-g2-field-test-protocol-and-report.md` — the frozen G1/G2 field protocol (G1-A..G1-D, G2-A..G2-E) and the Sep 6 sandbox report, extracted verbatim from the deployed harz-edge-telecom worker v4.0.2 where the full text is embedded. This is the protocol that was frozen 2026-09-06.
2. `harz-edge-telecom-worker.js` — the deployed worker source (v4.0.2): SMS bridge, mesh registry, store-and-forward queue, gates/report pages. Live at https://harz-edge-telecom.harz.workers.dev
3. `harz-apk-server-worker.js` — the deployed APK distribution worker source. Live at https://harz-apk-server.hamzarabiu390.workers.dev
4. `HARZ-Edge-Telecom-v2.0.apk` — the v2.0 Android build (9,787,013 bytes, md5 492cf9ebaefaa1d955825cd38081cfde), recovered from the harz-apk-server KV store.

## HARD TRUTH — the frozen v2.1 build is GONE

The G1/G2 protocol froze exactly one valid field build: `HARZ-Edge-Telecom-v2.1.apk` (2.1.0-fieldready, versionCode 3, md5 61c659bc). Deep audit across every Magani workspace (15), the harz-survivor/harz-git/harz-edge/harz-mesh-test repos, harz-apk-server KV (holds only the v2.0 key), and both Cloudflare accounts: **the v2.1 APK no longer exists anywhere, and neither does the ~2,000-line Kotlin app source.** The Sep 6 workspace files (jingles, sound-mesh harnesses, 3-phone logs) are gone the same way — the workspace holding them was reset/cleaned at some point after Sep 6.

The v2.0 APK here is preserved for the record ONLY. Per the frozen protocol it is NOT valid for G1/G2 field testing (5 v2.0 bugs were found and fixed in the v2.1 re-freeze). A field test on v2.0 would be INVALID.

## Consequences (honest)

- Tonight's planned three-phone G1/G2 field test CANNOT proceed honestly. The only valid build is gone.
- The app must be rebuilt from scratch (source lost), re-frozen, and the protocol version bumped. That is a rebuild decision for the owner — not something to improvise.
- This loss is the proof of the desk's durability rule: code that lives in one workspace is one cleanup away from extinction. From now on, HarzGit at freeze time, not after.

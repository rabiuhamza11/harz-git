# RECEIPT 286 — Canonical source custody: harz-trading-machine

Date: 2026-11-01 03:45 WAT (02:45 UTC). Action: CUSTODY ONLY. No worker change, no deploy.

## What was locked
- HarzGit D1 harz_repos row **244**
- name: `harz-trading-machine/deployed-bundle-2026-11-01T03-45Z.js`
- bytes: **57,411**
- sha256: **21097e544b875c9b8fdb93ab88e666a070c11a4e393d5c0adc511e75a553c39f**
- source: Cloudflare `workers/scripts/harz-trading-machine/content/v2` fetched live
- read-back verification: row 244 content re-hashed equals the live sha256, byte-for-byte identical

## Deploy state at capture
Newest deployment 2026-11-01T02:27:03.878616Z (id 300ce5a9); 10 deployments total between
02:24:54 and 02:27:03 — the churn window. Nothing has deployed since, confirmed twice.

## Why this was the blocking task
The live worker exists only as an esbuild bundle (38 `__name(` marker calls). A patch applied to a
copy without that helper fails Cloudflare 10021 "Uncaught ReferenceError: __name is not defined".
Custody of the exact bytes is the precondition for any safe edit.

## Code findings re-verified against the locked bytes (not against a stale copy)
- `real_fills` is `SUM(CASE WHEN fill_price IS NOT NULL ...)` — simulated fills still label as real fills. OPEN.
- `RISK_BAND = [5e-3, 0.02]` — the band is 0.5%-2%. A caller sending `1` meaning 1% is REFUSED, not
  silently treated as 100%. **Correction to my own earlier report: it is not a hole.**
- stop = lowest low of 10 days x 0.985 — matches the claim.
- target = entry + (entry - stop) * 2 — matches the claim.
- correlation counts on `p.dir` while the schema uses `direction` — the breach can still never fire. OPEN.
- `INSERT INTO hunt_runs` is shared by live and preview paths — preview pollutes the run ledger. OPEN.

## Correction of record
An earlier copy I grepped (57,405 bytes) differed from the live bundle. All seven code checks above were
re-run against row 244 and hold identically, so the findings stand; the earlier copy is discarded.

## Rule proposed (not yet in force, awaiting owner)
1. One writer on harz-trading-machine.
2. Every deploy made from a HarzGit row, recorded with its row id and sha256.
3. Refuse to verify anything if a deployment landed in the previous 10 minutes.
4. Any patch must be authored against row 244 or its successor and must keep the bundler helper.

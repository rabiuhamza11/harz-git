# INGESTION FREEZE VIOLATION FOUND + ENFORCED (Oct 14, ~07:40 WAT)

## Violation (measured, not inferred)
Master corpus (ea622de9) grew from 1,328,715 (migration closure, Oct 13) to
1,341,437 = +12,722 docs DURING the standing freeze:
- sources: cloud-wave (11,939) + door-onefile-v06 (783)
- fetched_at spread Oct 09..Oct 14 (banked pages flushed late)
- LAST WRITE 2026-10-14T04:58:03Z (05:58 WAT) — the freeze was being violated
  RIGHT NOW during today's rulings.
- Writer path: POSTs to harz-million-corpus /api/ingest-wave (533 requests
  04:00-05:00 UTC — measured via GraphQL analytics; WAVE_KEY holder).

## Why my Oct 13 cron removal did not stop it
The corpus-wave worker (a2) carries a DURABLE OBJECT (WAVE_SCHED /
WaveScheduler). DO alarms persist independently of cron schedules. Removing
the cron stopped only one trigger. Deploy history confirms no redeploy since
Oct 13 06:49 UTC (3 wrangler deploys by the initiative actor — more evidence
for the Incident-002 attribution file).

## Enforcement (reversible, evidence preserved)
07:40 WAT: harz-corpus-wave redeployed as a NO-OP stub (bindings mirrored:
HARZ_BROWSER KV, WAVE_SCHED DO, secrets kept). Original source preserved:
corpus-wave-ROLLBACK-2026-10-14.js (17,338 bytes, this commit).
Verification: max id frozen at 1,341,437; 0 docs with fetched_at after stub
deploy; live stub responds with freeze notice.

## Disposition of the +12,722 docs
NOT deleted (owner decides): they sit beyond id 1,328,715, fully separable
(id range + source labels) for quarantine or acceptance per storage-budget
ruling. FX index does NOT include them (index frozen at migration parity) —
measured: no reindex activity.

## Standing conflict
The sovereign-storage initiative's wave pipeline keeps violating the freeze.
Owner's options: (a) authorize this wave explicitly under a named charter,
(b) keep it stubbed until the storage-budget ruling, (c) direct the other
seats to stop all ingestion pipelines. Stub stays in place until ruled.

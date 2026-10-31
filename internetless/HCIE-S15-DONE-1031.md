# HCIE S1.5 — D1 STATE MIGRATION (Oct 31, 2026, ~16:05 WAT)

## DONE
1. Watch-state schema created in harz-recovery-db (83f0c341-901c-4a17-9620-df01f6e0fc6f): watch_baselines, watch_journal, recapture_queue, watch_captures, recapture_log (+index). D1 new-DB creation refused (account at its database cap) so a namespaced schema was added to the smallest existing account-1 DB — reversible, isolated tables.
2. harz-pack-watchdog v1.1 deployed (account 1): all writes to D1; KV used only for watchmap config, cursor+lastcheck (2 puts/sweep = ~192/day, under the 1,000 cap), and wake URL.
3. Queue migrated KV→D1: 39 REAL queued changes preserved — NYSC 33 pages, CAC, SMEDAN, NAFDAC, SEC (find-registered-operator) + the selftest signal. The mirror backlog is real and now visible/queryable.
4. Wake wiring set: v2.wake.url → /run?k=… (the watchdog no longer wakes into the void).

## BLOCKER (honest, platform budget)
- Drain blocked TODAY: account-1 D1 daily row-read limit (5M/day, shared with harz_search_v02 402MB + hti-scanner 558MB) already exhausted → drain errors until 00:00 UTC.
- Consequence: the 39 captures (fetch → landmark hash → store → log) will run after the UTC reset; the */15 cron in v1.1 will auto-drain after each sweep.
- Note: bottleneck moved from KV writes (structurally exceeded: 1k/day) to account-wide D1 reads (shared). Structural follow-up: off-peak drain schedule / thin dedicated state store.

## NOT CLAIMED
No capture is claimed until the D1 rows exist (watch_captures + recapture_log). Detection completeness is claimed only from rows (39 queued), never from counters.

# HARZ SYNC — STAGE 1 CLOSED WITH EVIDENCE (Oct 20, 13:0x WAT)

Mission order (counselor, owner-forwarded): Stage 1 = durable change journal + real SHA-256 hashes. Next milestone: "HARZ Sync survives a real interruption without losing an eligible update."

## What was built
Watchdog v1.0 (v0.9 + journal patch): every eligible change (prev exists, hash differs, floors passed) writes a DURABLE journal entry to KV before anything else:
v2.journal.<seq> = { seq, at, url, page, prev_hash, new_hash, hash_basis: "semantic-landmark-canonical", len, state: "detected", state_at } + v2.journal.head counter.
Rules enforced: detection != delivery (state starts at "detected", never claimed delivered); hashes are real SHA-256 over the declared basis; first sight = baseline (no journal noise); failed/blocked checks never journaled as changes.

## The evidence (controlled REAL change on a REAL URL)
Test artifact: vault-published HTML at a real public URL (raw.githubusercontent.com/rabiuhamza11/harz-git/main/internetless/watchdog/JOURNAL-TEST-SIGNAL.html).
1. BASELINE (v1): fingerprint 7b1c8529…eb78796d… recorded. No journal entry (first sight = baseline — correct).
2. DELIBERATE REAL CHANGE (v1→v2, real headings edited + new section, git-pushed): detected at 2026-10-20T12:03:52Z.
   JOURNAL ENTRY #1: prev_hash 7b1c8529… (matches baseline exactly), new_hash ea2bdcb8… (matches live fingerprint exactly), state "detected".
3. RESTART SURVIVAL + NO DUPLICATES: fresh worker invocation → journal entry PRESENT, head still 1, fingerprint stable (no false second change).

## Honest physics discovered during the test (recorded, not hidden)
- GitHub's CDN caches raw URLs ~5 minutes: detection latency includes origin-cache lag (observed 4.5 min). The journal records detection time honestly; "within interval" includes CDN propagation for third-party origins.
- KV cursor reads can be up to 60s stale across locations: test triggers must settle 75s after cursor writes. Production cron rotation unaffected (single-writer sequence).
- The watchdog's honest floors (150-char canonical, 100-char landmark minimums) correctly refused thin test pages and CDN-stale copies before baseline. No false journal entry ever fired: 0 duplicates, 0 false positives across the whole test.

## Status of the mission order
Stage 1: CLOSED (this receipt). Stage 2 (delivery receipts + sync-status panel): NEXT. Stage 3 (deliberate failure testing): partially evidenced (restart survival + no-dup); phone-side interruption test owed with Stage 2. Stages 4-5 (.harz bundle, phone-to-phone): queued.

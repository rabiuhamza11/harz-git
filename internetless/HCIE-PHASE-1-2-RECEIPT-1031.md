# HCIE PHASES 1+2 — BUILD RECEIPT (Nuruddeen, Oct 31 2026, owner "Go")
# Sandbox-proven only. Device-proof PENDING (Oct-25 two-phone failure still open, per owner).

## PHASE 1 — SOURCE SCHEDULE REGISTRY ✅
- Machine-readable registry: D1 harz-hcie-ledger (7eb7bf66-d04d-4a4d-a328-f25053e1d04b), table `sources`.
- Per-source fields: url, domain, tier, interval_min, priority, freshness, failure_policy, enabled, last_run, last_status, last_hash, consecutive_failures.
- Seeded 26 sources from the LIVE v2 shell (27 domains extracted; 1 tracker excluded): 17 GOV @30min (priority 9), 4 NEWS @15min (7), 5 REFERENCE @weekly (4).
- Reschedule = data edit (POST /registry with admin key, or SQL). NO code modification — acceptance met.
- Failure handling: consecutive_failures counter; exponential-ish policy = excluded from due set after 6 consecutive failures; reset on success.
- Sealed 107-source registry: PRESERVED UNTOUCHED (lives in a2 KV; CLOUDFLARE_API_TOKEN_2 returns auth error — IMPORT PENDING token renewal; documented, not worked around).

## PHASE 2 — SELF-HOSTED ACQUISITION WORKER ✅
- Worker: harz-hcie-acquire.harz.workers.dev (a1), registry-driven, no agent/workflow dependency.
- Cycle (measured): cycle 1 = 26 due / 26 fetched / 0 errors / 0 changed, 47s wall clock; cycle 2 = 0 due (intervals respected; duplicate accumulation = zero).
- Integrity Guardian inline: sha256 of every fetched body, recorded per fetch with VERIFIED/FAILED label; hash compare drives change detection (`changed` flag only on real change).
- Storage law respected: metadata-only (no bodies stored) → 5GB ceiling untouched; keep-class body capture remains Magani's pipeline (no silent scope grab).
- Subrequest budget: 26 fetches/cycle < 50 free-tier limit; per-cycle cap 40.

## CLOCK (honest deviation, disclosed)
- Cloudflare cron-trigger API REJECTED for current token (error 10026 on every documented schedules PUT format; token lacks Workers Cron Triggers permission). No workaround on that API.
- Sovereign fallback deployed: .github/workflows/hcie-pulse.yml in harz-git — GitHub Actions cron */5 pings POST /pulse; worker enforces 4-min server-side floor. Proven: dispatch HTTP 204, run completed/success 15:00:36Z.
- One dashboard permission (or token renewal) moves the clock back to native Cloudflare cron.

## NOT CLAIMED
- HCIE is NOT complete. Phases 3 (incremental exchange protocol), 4 (offline→online publishing), 5 (two-phone device proof) remain.
- Device-grade proof of any exchange remains blocked on the Oct-25 two-phone failure root cause — kept open as a separate investigation per owner instruction.

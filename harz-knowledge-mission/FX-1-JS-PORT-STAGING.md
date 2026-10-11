# FX-1 WORKERS PORT — STAGED (NOT DEPLOYED)
## Status: fx1-js-1.0.0 written and battery-verified locally. NO deployment,
## NO D1 writes, NO live changes. Deployment requires Rabiu's explicit
## authorization plus his rulings on D-1..D-6 (design record e0eeceb).

## What was staged (Oct 11, 2026)

1. fx1-extractor.js — Workers-ready ES module port of the validated
   Python reference. Same pipeline (fetch / title-based challenge
   detection / robots / pagination rel=next / readability-density-v1 /
   sha256 / six-status taxonomy), same constants (CAP_BYTES 512KB
   proposal, MAX_PAGES 10, MIN_CHARS 500), module-scoped, env-bound
   for production (no KV/D1 writes in this artifact — storage binding
   comes with the authorized deployment design).
2. fx1-battery.mjs + fx1-battery-results.json — the same 12-case
   battery re-run against the JS port: fixtures served on
   fx1.localtest.me (public DNS -> 127.0.0.1, not a private-host
   pattern), live Wikipedia/heritage.org cases included.
3. extractor.py (reference) — updated with the same robots fix below;
   Python battery re-run: 12/12 PASS, same numbers (WW2 188,720 chars).

## JS port battery result: 12/12 PASS, statuses identical to the Python run

A-1 long docs complete; A-2 pagination 2 pages followed; A-3a js-shell
unsupported (V1 limitation); A-3b LIVE heritage.org unsupported
(access-denied wall); A-4 malformed complete; A-5 dead DNS/404
failed_fetch; A-6 identical sha256 dedupe; A-7 new version stored with
prior preserved.

## REAL DESIGN FLAW FOUND BY THE PORT (this is why two implementations)

The first JS run BLOCKED Wikipedia with "robots disallow: /". Root
cause: naive robots.txt parsing treats ANY "Disallow: /" line as
global — but Wikipedia's robots.txt blocks GPTBot-class crawlers with
"Disallow: /" under their own User-agent groups. The correct REP
behavior (implemented in BOTH ports now): parse User-agent groups,
apply ONLY the "*" group to our fetcher, ignore other bots' rules.
The Python battery's earlier pass masked this (its robots fetch path
returned non-200 -> allowed-by-default); the JS port exposed it.
Honest note: the earlier Python PASS on A-1 was therefore not reached
through correct robots logic; both ports now pass for the RIGHT
reason, re-verified.

## Parity verdict (Python reference vs JS port)

Status taxonomy: 12/12 identical. Line-level content on the long
article: 2,623 lines in both, content identical — the small raw
char-count delta (0.1-0.9% depending on entity/whitespace handling)
comes from NBSP vs space representation and named-entity decoding,
verified line-by-line as NOT content loss. Production runs ONE
extractor (fx1-js-1.0.0) with extractor_version stamped on every
record, so cross-implementation hash identity is not required;
internal consistency and auditability are preserved.

Bugs found/fixes during the port (all disclosed):
1. robots User-agent-section scoping (above) — both ports.
2. JS named/numeric entity decoding (&apos; etc.) — parity.
3. JS NBSP normalization — parity, verified no content loss.

## Deployment readiness (what one authorization would cover, on request)

- fx1-extractor.js is module-shaped for a Worker module-graph deploy
  via the safe-deploy path (binding preservation verified in prior ops).
- Target: per the design, a NEW worker (harz-fx-ingest) + NEW D1
  database (harz-fx-v1, referenced by account+UUID), OR reuse of an
  existing ingestion worker — Rabiu's D-3 strategy ruling (R2 vs
  chunked D1) decides the storage binding BEFORE any deploy.
- NOT included until ruled: D1 schema execution, KV writes, corpus
  ingestion, and the 100K pilot (explicitly not authorized).

Open decisions unchanged: D-1 cap, D-2 dynamic strategy, D-3 storage
strategy (R2/chunking), D-4 gate-v2, D-5 kept-22, D-6 robots policy.

# Hauwa Follow-up — Health Verification (observer 2) — Oct 4, 2026

Responds to the sibling observer's follow-log (Oct 4): "Health:
unverifiable from this observer. All five routes returned
Cloudflare HTTP 403, error 1010."

## THIS OBSERVER'S MEASUREMENTS (sandbox curl + real browser)

1. THE 403/1010 WAS OBSERVER-SIGNATURE, NOT APP HEALTH. From
   this observer, zero 403s. /api/models, /api/agents/v1,
   /api/learning/v1/status: HTTP 200, sub-second, consistent.
   Cloudflare's browser-integrity check blocked the sibling's
   client signature at the edge; their "unverifiable" was
   honest — wrong observer, not a sick system.

2. /api/hmi/test: INTERMITTENT. Two 200s (~4s, full 4-method
   green + sovereignty PASS), then three consecutive timeouts
   at 15s. In a real browser: ERR_FAILED twice on this exact
   route while /api/models loaded fine seconds apart. Real
   availability finding, disclosed.

3. /api/bench/v1: NOT A HEALTH ROUTE — by design it EXECUTES
   the full 20-case benchmark (target=A = external adapter
   chain, one orchestrate per case). Measured: no bytes in
   5+ minutes across attempts. The status route is /api/bench
   (KV-backed, 200 in <1s, verified). The sibling's health
   probe list treated an execution route as a health route.

## ROOT CAUSE FOUND IN SOURCE (no patch applied — audit shown
first, per the Sept 3 law)

The OpenRouter adapter fetches (worker.js lines 129 and 150)
carry NO AbortSignal timeout — while sibling fetches in the
same worker properly use AbortSignal.timeout(8000-12000)
(e.g. intake line 4059, retrieval lines 5014/5020). When the
external provider stalls, orchestrate awaits forever:
   a) bench/v1 hangs whenever the external chain stalls
      mid-benchmark;
   b) hmi/test intermittently stalls when its adapter chain
      touches the external path.
CLASSIFICATION: availability defect, NOT authority. The
refusal/fallback/adapters law is untouched; no verdict, seal,
or receipt is affected. The defect is: an external
unavailability is allowed to become an internal hang — which
violates the SPIRIT of the standing law ("availability
failure is never allowed to become an authority success" —
this is its mirror: availability failure must never become a
hang either; it must become a declared incapability and fall
to the local chain).

## PROPOSED MINIMAL FIX (awaiting Dad's ruling)
Add `signal: AbortSignal.timeout(8000)` to the two OpenRouter
fetch calls; a timeout resolves exactly like a refused
external call already does under the frozen routing law
(registry-declared incapability -> local chain). No authority
logic, no frozen formula, no routing law touched.

## BROWSER TEST RECORD (the Sept 6 law: no health report
before browser test)
/api/models: loaded in real browser, full JSON rendered.
/api/hmi/test: ERR_FAILED twice in real browser — measured,
disclosed above.
The remaining routes are JSON APIs verified by curl from a
non-blocked observer; the browser leg establishes the edge
serves the domain normally (no domain-wide block).

## VERDICT
Intelligence Core v0.8 is ALIVE and serving: models, agents,
learning status, and bench status all consistent and fast.
Two honest defects: hmi/test intermittency and the unbounded
external await. One observer-environment lesson: health probes
must come from a signature Cloudflare does not block, and
must not confuse execution routes (/api/bench/v1) with status
routes (/api/bench).

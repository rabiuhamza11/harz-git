# RECEIPT 278 — Honest error reporting, and the three faults that hid the fix

Date: 2026-10-31 (Aisha). Owner-approved targeted correction. Worker harz-hcie v0.8.5.
No key rotation. No change to the approval protocol. No change to the stored key, the endpoint contract or the queue.

## The rule implemented
An error message reports what actually happened. One classifier, `call()`, in the review page, used by BOTH paths
(unlock and approve/reject). Outcomes map exactly to the agreed table:
  server unreachable / timeout (12s AbortController) -> "No connection. Try again."
  HTTP error                                        -> "Server error (HTTP code)." (+ server reason when present)
  response malformed / not JSON                     -> "Invalid server response."
  server explicitly rejects                         -> "Request refused: <actual reason>"
  success                                           -> "Success - ..." with the object id on approve
Every message now carries the time it happened, so a stale line cannot be mistaken for a current one.
The queue card states its own provenance: "read from HARZ at HH:MM:SS | N queued" or "NOT read | <reason>", and when the
queue is unreadable it says plainly that nothing shown does NOT mean nothing is queued. Status lines and the queue card
can no longer contradict each other by accident.

## Acceptance tests — 9/9 PASS (harness runs the shipping page code against a real local HTTP server)
1 Unlock, server unreachable   -> "No connection. Try again. (16:26:55)"
2 Unlock, HTTP 500             -> "Server error (HTTP 500). (16:26:55)"
3 Unlock, malformed body       -> "Invalid server response. (16:26:56)"
4 Approve, explicit refusal    -> "Request refused: wrong review key (16:26:57). This browser holds a key HARZ did not accept..."
5 Approve, success             -> "Success - published as object 99. (16:26:57)"
6 Existing browser key         -> "Unlock: a key is stored on this device. Approving does not need a fresh unlock."
7 Approve without Unlock       -> success recorded with no unlock pressed in that session
8 Offline: card does not claim empty -> "NOT read | No connection. Try again. | ... Nothing is displayed here, and that does NOT mean anything is queued."
8b Online: card states source and time -> "read from HARZ at HH:MM:SS | 0 queued | this screen shows only what it loaded"
Harness stored at hcie/v0.8/acceptance_v21.js. Two earlier harness failures were harness faults (wrong expectation,
key set after boot), corrected rather than papered over.

## Live browser verification (after fixing the faults below)
/review in a real browser: "Request refused: wrong review key (17:29:28)" beside
"Queue: read from HARZ at 17:29:25 | 0 queued | this screen shows only what it loaded" and
"Nothing is queued. HARZ answered at 17:29:25 with zero queued items." No contradiction, correct causes.
Server state unchanged throughout: key stored and valid, queue 0, published 5, manifest 25 objects.

## Three faults found while verifying (all fixed, none were cosmetic)
1. DUPLICATE /sw.js ROUTE. Two routes existed; the first one won. It served the OLD cache-first service worker with
   Cache-Control max-age=3600, so the browser kept an hour-old worker and any deployed fix could be invisible for an hour.
   Removed the duplicate; one route remains, served with no-store. This was a No-Duplicates violation in my own code.
2. CACHE-FIRST SHELL. The surviving worker served pages from cache before network, so a fix could never reach the phone
   without clearing site data. Now network-first with cache as the offline fallback: a deployed fix arrives on the next
   load, and the app still opens with no connection. API calls remain uncached (no false freshness).
3. LITERAL ESCAPE LEAK. My `<'+'script>` trick (used to avoid a closing-tag in the write page) was copied into the review
   page and the new reset page, where it stays literal because those are template literals. The review page shipped its own
   JavaScript as visible text and ran nothing. Removed; one real script tag verified in the served HTML.

## New: /reset
Removes this browser's service workers and caches, then reopens /review. Needed because a browser holding the old worker
could otherwise keep serving the broken page for up to an hour. It touches nothing in HARZ: queue, manifest and review key
are unaffected. Verified in a real browser: it cleared, redirected, and the corrected page rendered.

## Still open (unchanged by this work)
Conflict handling for same-title contributions from different devices; promoted-to-corpus search; author/device remain
self-declared; two-phone carry of a contribution file untested on hardware.

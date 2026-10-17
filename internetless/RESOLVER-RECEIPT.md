# INTERNETLESS v2 — RESOLVER RECEIPT (Oct 17, ~01:5x WAT)
Deliverable 1 of the owner ruling: the CENTRAL RESOLVER, built FIRST.

## Implementation (resolver.js — pure module, one code path everywhere)
- Layer 0 normalizeUrl(): one canonical form — relative+absolute, www/ default-port
  stripped, fragments dropped (scroll, not identity), tracking params stripped,
  meaningful query preserved. Non-web schemes (mailto:/tel:/javascript:) classified
  honestly.
- buildUrlMap(): maps BOTH original and post-redirect final URLs of every corpus doc
  (redirects recorded at capture), plus pack pages and pack resources. Read-only view
  over the sealed corpus identity.
- resolve(): the single decision point for every click. Requires RETRIEVE before
  claiming found (owner question 1: finding a URL is not retrieving content) and
  VERIFY before display (sha mismatch = INTEGRITY_FAILURE, refused).
- Loop guard: a URL may resolve at most maxChain (default 2) times per journey.
  No homepage fallback exists anywhere in the code.

## The six owner-mandated outcome categories — each has a passing test:
LOCAL_FOUND (C1, with body + hash), RESOURCE_FOUND (C2), NOT_CAPTURED on a
CAPTURED domain — never guessed (C3), INTEGRITY_FAILURE refused (C4),
LIVE_AVAILABLE online+permitted (C5), OFFLINE_UNAVAILABLE honest (C6).

## Test suite: 16/16 PASS (resolver.test.js, Node)
N1-N4 normalization (www/port/tracking, relative, fragments, redirect mapping),
C1-C6 six categories, Q1 map-entry-without-body = NOT_CAPTURED (no title-only
opens), X1-X2 cross-domain captured/uncaptured (owner question 3), L1 loop
prevention, P1-P2 query-preservation + no silent variant collapsing.
Defect found + fixed honestly during the suite: loop guard fired one click
late (off-by-one) — corrected before this receipt.

## HONEST SCOPE (per owner: accepted on behaviour, not claims)
These are pure-function tests in Node. They prove the decision logic, not the
deployed system. Airplane-mode survival of the shell + real stores + real
hashes + real device = the acceptance matrix, which comes with the shell
(stage 2) and the Infinix tests (stage 4). Owner question 2 (airplane-mode
survival) is therefore NOT yet answered — it cannot be answered by this file.

NEXT (per ruling order): v2 shell wired through this resolver, alongside the
sealed library, connecting to the real corpus + pack stores.

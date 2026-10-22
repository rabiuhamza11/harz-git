# GATE D PRE-DROP VERIFICATION ROUND 2 (Nuruddeen, Oct 22 ~10:2x WAT)

## Verified TRUE (live, my seat)
1. Successor reader IS live: harz-million-corpus /api/stats reports n=29,844 — matches Team F's receipt. Honest refusals on by-hash and unknown routes confirmed (404 with guidance, never fake content).
2. New keep index live (from round 1): 29,086 rows, nigeria 2,775 / fraud 888 — exact.
3. Writer frozen at 1,343,890 — exact.

## FAULT STILL LIVE — must be resolved as part of Gate D
harz-fulltext-reader (the OLD reader, binds live-index + keep-bodies-00) STILL serves wrong bytes under the sealed claim: GET /doc/de216a7c... returns ok:true, text 9,148 chars sha 1ff4c807, claimed content_hash de216a7c (fault report cf41146, re-confirmed this round).
CRITICAL: this reader is NOT in the three-database drop list (it binds harz_search_v02 + keep-bodies-00, both of which survive the drops). If Gate D proceeds as scoped, a fake-result reader survives the retirement.
RESOLUTION OPTIONS: (a) patch its by-hash path to honest-refusal + byte-verified serving only, (b) retire the worker entirely (superseded by the successor reader), keeping keep-bodies-00 data intact. Either is acceptable; it must not survive in its current state.

## FX workers (confirmed as claimed)
harz-fx-search and harz-fx-build alive, answering; they bind the old fx-idx/master slated for drops. Gate law: no drop breaks a live bound worker.

## POSITION for owner's one-word choice
1. Resolve the faulted old reader (patch or retire) as a Gate D precondition.
2. For the FX re-point: option 2 preferred (FX seat re-points its own workers; drops held until their confirmation + my verification). Option 1 acceptable if the FX seat is unreachable, with full receipts.
3. Then the three drops proceed one at a time, size measured after each; Gate E final receipts follow.

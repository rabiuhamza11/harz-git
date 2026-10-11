# FX TIER WIRED INTO LIVE SEARCH (under "Go on", Oct 11, 2026)

Additive wiring: the FX-1 full-text tier is now reachable through the
live search service. The sealed 5K engine path is UNTOUCHED.

## Change

harz-search (a1, D1 binding preserved by safe-deploy) gained two NEW
routes only:
1. /fx/search?q= — proxies FX-1 (D1+FTS5 full text), returns tier
   "full-text" with the honest label: LIVE · TRUSTED ECOSYSTEM SOURCE
   — RETRIEVED FULL TEXT, NOT VERIFIED FOR RELEVANCE.
2. /fx/doc/:id — full document text from the FX store.
Cross-account fetch (a1 -> a2 workers.dev) — no loop protection.
No existing route, no scoring path, no index, no corpus was modified.

## Verification (method disclosed honestly)

1. Source diff pre/post: the ONLY changes are the FX block (37 lines).
2. First determinism check was FLAWED and is disclosed as such:
   whole-response hashing differs call-to-call because /search includes
   a volatile took_ms field — that was my check's error, not an engine
   change. Corrected method: strip took_ms -> 3 consecutive calls give
   byte-identical results (hash 840002788049443758 stable).
3. Corpus untouched: 11,365 docs before and after (same as pre-deploy
   baseline capture); index_digest aa22a26e... intact; /stats engine
   string unchanged (frozen search-core v0.4).
4. Live FX routes: "global conflict" -> full-text tier, 1 result,
   labeled; /fx/doc/2 -> World War II, 187,074 chars; missing q -> 400.

## NOT touched (boundary preserved)

1. /search and all sealed-engine routes: byte-identical behavior.
2. aggcore (harz-intelligence v6.6.0+p4 frozen baseline): NOT modified
   — it can adopt /fx/search when that integration is authorized.
3. The phone 5K package: untouched (seal 0a5c75d4 preserved).
4. No corpus-scale ingestion; 100K pilot still parked.

Rollback: redeploy harz-search-pre-fx.js (preserved in fx-tier/).

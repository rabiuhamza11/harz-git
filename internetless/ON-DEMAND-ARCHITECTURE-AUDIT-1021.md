# ON-DEMAND ARCHITECTURE AUDIT — THE CRITICAL QUESTION ANSWERED (Oct 21 ~05:50 WAT, Nuruddeen)
# Trigger: owner-forwarded advisor proposal (on-demand retrieval vs sync-the-corpus).
# Method: fresh browser context (simulated brand-new phone), code audit + live test.

## VERDICT (evidence, not opinion)

1. SINGLE-DOC ON-DEMAND RETRIEVAL: ALREADY WORKS.
   - SW /v2/doc/<id> handler: cache-first with network fallback; r.ok is cached on first open.
   - Live test on fresh context (no Sync ever tapped): opened /v2/doc/566 — fetched on demand over
     network, full article body, auto-retained in cache. Second open served instantly.
   - Retained-doc offline reopen rests on the Oct 18 device-proven SW cache matrix (CDP network
     emulation does not cut the SW's own network context; tonight's emulation is NOT counted as
     offline proof — honest disclosure).

2. FULL-TEXT SEARCH: REQUIRES CORPUS SYNC TODAY — the real architectural dependency.
   - Fresh phone, online, search "nigeria tax": 0 results, honest label
     "Coverage: all 1992 titles + 0 stored bodies + 21 visual packs. Un-synced bodies are searchable
     after Sync (honest limit)."
   - Search runs client-side over STORED bodies. A brand-new phone cannot full-text search even
     while connected. Title-only search works without sync.
   - This is the one component that forces "download the corpus before useful".

3. PACKS: already on-demand by design (network-first, auto-heal, cached on first open).

## WHAT COMPLETES THE ON-DEMAND ARCHITECTURE (proposed build, owner word pending)
- Server-side search endpoint on the offline-browser worker (/v2/search?q=): worker searches the
  corpus shards server-side, returns id/title/url/snippet/hash. Phone searches ONLINE against the
  server when bodies are not stored; offline keeps client-side search over stored bodies (honest
  coverage label states which mode). Touched: shared ob-worker (Magani lane coordination).
- Doc-open receipts: extend SW to verify each fetched doc against the embedded TX hash map and
  write a per-doc receipt (same receipts cache) — first-open = verified retain, closing the
  advisor acceptance test: fresh phone, search online, open in seconds, airplane reopen verified.
- Sync-all remains available as "prepare everything for airplane", never required for access.

## ACCEPTANCE TEST STATUS TODAY
- Fresh phone + online search + open doc in seconds: FAILS at search step (0 full-text results).
- Fresh phone + direct doc open (if you know where it is): PASSES (proven).
- Airplane reopen of a retained doc: device-proven Oct 18; re-verify on Infinix after search build.

No code changed in this audit beyond what was already deployed (r15 SW + v6 shell, receipts/journal).

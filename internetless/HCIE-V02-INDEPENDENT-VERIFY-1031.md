# HCIE v0.2 — INDEPENDENT VERIFICATION (Nuruddeen, Oct 31 2026)
## VERIFIED TRUE (live, my seat)
1. Manifest live: /api/hcie/manifest → 6 objects, content-addressed (bytes+sha), rendered OK.
2. Genuine change proof: journal events show guardian-ng PUBLISHED (object 6, canonical_sha256 9010057b..., 17,976B, captured 15:01:18Z), VERIFIED (re-hash matched), and UNCHANGED with "304 not modified (conditional GET)" for cbn + canary. Real external detection, versioned, none overwritten.
3. Object endpoint integrity: /api/hcie/object/6 returns source_key, url, title, canonical_sha256, bytes, captured_ts, content — independently re-hashable.
## VERIFIED DEFECT (their disclosure is accurate)
- Version labels read v1 for all objects (manifest + missing column on insert path). History is real and timestamp-ordered; the LABEL is wrong. Fix approved before any further claim.
## AUDIT FINDING — DUPLICATE HCIE STACKS (must merge, one engine)
- harz-hcie (v0.2): journal/objects/manifest/capture — the engine.
- harz-hcie-acquire (Phase 1+2, mine): registry+scheduler, 26 sources, /pulse clock.
- Two parallel stacks = drift risk. Direction: registry (26 sources) feeds the v0.2 fetcher as the single engine; acquire keeps only scheduling or is retired. No rebuild — a wiring, owner-visible.
## GO GIVEN (owner forwarded): (1) fix version increment, (2) read page with local cache for airplane reopen.
## DEVICE STEPS (owner's, when read page lands): 1 open manifest online; 2 open object read page online (populates cache); 3 airplane mode ON; 4 reopen read page → content must appear; 5 reload + open second object → must serve from cache; 6 confirm displayed sha256 equals manifest entry, record seconds. Nothing is two-phone proof; Oct-25 failure stays open.

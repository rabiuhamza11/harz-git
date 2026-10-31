# HCIE — HARZ CONTINUOUS INFORMATION EXCHANGE: REUSE AUDIT + BUILD ORDER (Oct 31, 2026, Team F)

## THE INVARIANT (accepted)
"The Internet continuously refreshes HARZ. HARZ continuously strengthens Internetless. Internetless remains useful when the Internet disappears."
Three operating states: ONLINE (acquire+sync) / CONNECTED MESH (peers exchange) / ISOLATED (local access). Resume from last verified sync point on reconnect.

## COMPONENT → EXISTING ASSET MAP (reuse-first: do NOT rebuild)
1. Internet Watcher — EXISTS in design (15-min cron watchdog, Oct 20), queue wiring DEFERRED by owner ruling ("resume after visual coverage"). Visual coverage condition: v2 visual packs sealed Oct 21 → deferral condition appears satisfied; owner confirm.
2. Acquisition Engine — EXISTS (capture pipeline, pack builder, in-flight corpus ingest; the paused dump-enwiki writer is proof of function). NEW: per-source schedule table mapped to cron slots.
3. Integrity Guardian — EXISTS, strongest asset: keep store (29,086 sealed, byte-exact), SHA-256 on ingest + serve, keep FTS (29,086 docs), refusal law (never serve unverified bytes).
4. Exchange Engine — PARTIAL: sync bridge (live, journal + cursor, idempotent), REC1 reconciliation primitive (frozen, proven 28/28), pack delta sync (per-pack sha256). NEW: wire acquisition → bridge journal automatically.
5. Mesh Distributor — PARTIAL: two nodes online (Cloudflare worker + GitHub Node B mirror, 1,992 docs), per-doc on-demand retrieval proven; offline transport = Phase 2A, device-unproven (kit hardened, awaiting device run).
6. Honest states — EXIST in law (VERIFIED / AVAILABLE / CACHED / STALE / NOT_CAPTURED / OFFLINE_UNAVAILABLE / INTEGRITY_FAILURE, Oct 27 order). NEW: freshness display (last checked / last updated).

## HONEST LIMITS (must be stated in any HCIE claim)
1. Free-tier cron floor = 15 min. The proposal's 5-min financial schedule maps to the 15-min floor or a chained queue; "every 5 minutes" is not achievable on zero budget. State the real number.
2. Capture-before-offline physics: a document is available offline only if acquired BEFORE disconnection. The acquisition runs 24/7 on free-tier workers (no phone needed), so the gap shrinks to the source's schedule + propagation. Never claim "everything on the internet is in the phone".
3. Device mesh unproven until Phase 2A passes on the phones (Sunday failure unresolved; hardened kit ready).
4. Reverse direction (phone → HARZ publish) requires the review queue: submission → hash → provenance → review → approval → new immutable version + journal entry. NOT built yet — this is genuinely new engineering.

## BUILD ORDER (smallest verifiable slices first)
S1. Watcher → recapture queue wiring (resumes the deferred item; condition: owner says visual coverage done).
S2. Per-source schedule table + cron slots (news/gov/finance/research/education/reference → honest slot mapping).
S3. Acquisition → journal → delta propagation to phones (unify ingestion with the bridge).
S4. Freshness + honest-state display in the client (last checked / updated X ago; advert-vs-captured distinction).
S5. Reverse publish queue (phone submission → review → immutable version), per the Oct 27 Stage 8 order.
S6. Device mesh 2A on the phones (independent track, kit ready).

## ACCEPTANCE (per Dad's laws)
No success claim without: a captured object, its verified hash, its journal entry, its availability state on a real device, and the capture timestamp. "Advertised" never equals "captured".

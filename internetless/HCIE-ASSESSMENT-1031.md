# HARZ CONTINUOUS INFORMATION EXCHANGE (HCIE) — ARCHITECTURE ASSESSMENT
# Owner design: Oct 31 2026. Auditor: Nuruddeen. Rule: Audit-First — no build before this map.
# Invariant to protect: The Internet continuously refreshes HARZ. HARZ continuously strengthens Internetless. Internetless remains useful when the Internet disappears.

## PART 1 — WHAT ALREADY EXISTS (verified, with receipts)

### Component 1: Internet Watcher — EXISTS
- HARZ Browser Auto-Sync workflow: ACTIVE, scheduled.
- Internetless Site Watcher: built, currently inactive.
- Owner ruling Oct 20: 5-minute cadence (platform minimum; per-second impossible, on record). Hash-compare on server-rendered pages; re-capture on change only.
- GAP vs HCIE: single watch-list, no per-source schedules, no source tiers.

### Component 2: Acquisition Engine — PARTIAL (strong)
- offline-browser worker: pack capture + doc pipeline (a2), gathering queue mechanics, dedupe, sealed sources registry (107 sources).
- Corpus pipeline: D1 ingest, bodies separation (docs→content_hash→bodies), FTS5 index builds (fx-build/fx-search), re-seal merges.
- Oct 22 curation swap: live stack is now successor corpus 29,844 docs + keep store 29,086 docs (291 bundles, 82,438,170 bytes compressed) + keep-fts-00 search index (29,086 rows, verified). Account 4.024GB.
- GAP vs HCIE: pipelines exist but are per-project (packs, corpus, watch) — no unified acquisition orchestrator with per-source schedules.

### Component 3: Integrity Guardian — EXISTS (best-verified layer)
- SHA-256 TX seal map (1,992 v2 docs, verified 5/5 exception resolution Oct 22).
- Journal v3 (append-only, hash-chained).
- Reader v1.1: DOC-LEVEL seal enforcement (fix 46d2c87) — serves verified bytes or honest 502 refusal. Zero fake serves verified by battery.
- Gate discipline A–E proven on the curation swap (receipts baa4e59 chain).
- State labels defined: VERIFIED / AVAILABLE / CACHED / STALE / NOT_CAPTURED / OFFLINE_UNAVAILABLE / INTEGRITY_FAILURE.
- GAP vs HCIE: labels exist in spec + some served responses; no single state machine emitting them uniformly across watch/corpus/mesh.

### Component 4: Mesh Distributor — PARTIAL
- Phase 2A mesh kit: mesh-node.mjs + mesh-client.mjs + content-addressed manifest; node-side + client-side hash verification; honest refusals proven.
- Objects staged: 815 + 1719 (both sealed-valid; sandbox ACCEPTED, 17,951 bytes, 5ms).
- Workbench profile 9/9 PASS (sandbox).
- DEVICE-GRADE PROOF: NOT ACHIEVED. Two-phone Termux run attempted Oct 25, failed, root cause unknown (diagnostic ladder issued; awaiting step-level error). No mesh claim is valid without this.
- GAP vs HCIE: one-object retrieval only; no incremental sync protocol, no manifest-delta exchange, no node discovery beyond manual IP, no replication policies.

### Component 5: Internetless→Internet (reverse publishing) — NOT BUILT
- Owner spec exists (review queue → verify → approve → immutable version → journal).
- Nothing implemented. No queue, no reviewer, no publish path.

## PART 2 — THE HONEST SCORECARD vs HCIE

| HCIE requirement | Status | Evidence |
|---|---|---|
| Approved-source continuous watching | PARTIAL | watcher live; no per-source schedules |
| Detect new + changed information | EXISTS | hash-compare watcher |
| Download docs/images/videos + provenance | EXISTS (packs/docs) | captures, provenance in manifest |
| SHA-256 + reject corrupt | EXISTS | reader v1.1 battery 4 refute / 7 serve |
| Update knowledge index | EXISTS | keep-fts-00 verified 29,086 rows |
| Immutable object + manifest update | EXISTS | journal v3 + TX map |
| Nodes discover + retrieve only what needed | PARTIAL | kit honors it; discovery manual |
| Never sync whole corpus to phone | HOLDS BY DESIGN | node-store is per-object |
| Reverse: offline create → review → publish | NOT BUILT | — |
| Incremental sync + resume after interruption | PARTIAL | journal exists; protocol missing |
| ONLINE / CONNECTED MESH / ISOLATED states | PARTIAL | labels defined; no unified machine |
| Captured vs merely-advertised distinction | EXISTS | honest refusal paths (reader, node) |

ESTIMATE: ~60% assembled. The missing 40% is orchestration and protocol, not new invention.

## PART 3 — CONSTRAINTS THAT SHAPE THE BUILD (measured, not guessed)
1. Platform cron floor = 5 minutes. Frequencies proposed by owner (5-15 min) sit AT the floor for financial, above it for the rest. Feasible.
2. Credits: daily workflow runs burn message credits; integration credits are exhausted (100.4/100). Continuous multi-source capture must be self-hosted (Cloudflare workers + cron triggers) for the acquisition legs — NOT agent-run steps — or it cannot be continuous.
3. Storage: account at 4.024GB. Budget headroom to 5GB ceiling ≈ 1GB. Growth policy must account for it (keep-class only, bulk = reference not storage).
4. Per-DB hard limit 10GB; KV value limit 25MB; GitHub Pages static only.
5. Device gate: no mesh claim without the two-phone airplane proof (standing law).

## PART 4 — BUILD ORDER (each phase independently valuable, no rebuild of working parts)

PHASE 1 — Exchange Source Registry + Schedule Table (no code risk)
- One table (D1) of approved sources: url, tier, cadence, state, last_checked, last_hash, last_change.
- Tiers: T1 financial 5min · T2 news 15min · T3 gov 30min · T4 research 6h · T5 education daily · T6 reference weekly.
- Exit: registry serves the existing watcher instead of ad-hoc lists.

PHASE 2 — Unified Acquisition Worker (Cloudflare cron, self-hosted, no agent credits)
- Cron wakes the worker; worker reads registry, fetches due sources, hash-compares, captures changes to R2/KV store, computes SHA-256, writes journal entry, updates index.
- Reuses proven capture code; adds scheduling + idempotence + per-source state.
- Exit: 24h unattended run, zero duplicate objects, journal complete, cost measured.

PHASE 3 — Exchange Protocol (incremental sync + resume)
- Manifest-delta endpoint: nodes ask "what changed since cursor N", receive object list + hashes, pull only those.
- Cursor persistence + interrupted-transfer resume; recovery after offline gaps.
- Exit: node with cursor resumes and converges after a 24h disconnect.

PHASE 4 — Reverse Publishing Queue (Internetless → Internet)
- Offline-created object → queue → verify (hash, provenance, source) → human approve → immutable version + journal entry.
- No auto-publish, ever.
- Exit: one object created offline, published after approval, reproducible.

PHASE 5 — Device-Grade Mesh Proof (the gate that validates Phases 3-4)
- Two phones, airplane mode, retrieve object 1719 from node, verify hash, record time; then failure cases.
- Exit: owner-witnessed ACCEPTED + measured seconds; failure cases refuse honestly.

## PART 5 — THE ONE THING TO FIX FIRST
The two-phone run failure (Oct 25) is still undiagnosed. Every mesh claim — and therefore HCIE Phases 3-5 — rests on it. Before new code: one diagnostic run with step-level output (STEP 0-3 ladder already issued). Honest status: mesh is sandbox-proven, device-unproven.

## VERDICT
HCIE is buildable from owned parts. The invention is the orchestrator, not the components. Build order above keeps every phase reversible and each one useful alone. No component in the existing stack is rebuilt.

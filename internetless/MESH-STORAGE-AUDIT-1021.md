# HARZ MESH STORAGE — PRE-BUILD AUDIT (Oct 21, 2026 ~06:20 WAT, Nuruddeen)
# Owner order: build mesh storage internet-first (5 stages), audit existing systems FIRST, reuse proven parts.
# Method: live API inventory of BOTH Cloudflare accounts (a1=5ab9477c, a2=c0bea6cf) + endpoint probes + D1 queries.

## VERDICT: the mesh foundation is ~70% BUILT by prior desk work under owner rulings. No second storage system should be started; the milestone needs a thin unification layer.

## INVENTORY (evidence, all live-checked Oct 21)

IDENTITY (content-derived SHA-256): EXISTS at every tier
- bodies DB a75c7faf (harz-corpus-bodies-db, 8.45GB): 1.33M bodies keyed by content_hash (Oct 13 migration)
- harz-keep-bodies-00 (Team F Gate 4, owner Path-3 ruling Oct 15): 29,086 docs, 2,075 gzip-9 bundles,
  doc_index keyed by content_hash+offset+len, 82.4MB compressed, format harz-keep-bodies-v2, D1-only
- harz-sovereign-store-00 (Soley desk Oct 13, owner-approved): 3,689 gzipped base64 doc bundles, D1-only, zero R2
- a2 Internetless: 1,992 docs (content_hash in every payload + TX hash map), 285 pack resources, journal v3
- journal v3 + device receipts: served-layer + storage hashes, proven integrity chain (Oct 20 receipts caught 11 post-seal changes)

NODES (two accounts = two independent machines): EXIST and serve
- Node A = a2 (offline-browser origin): /v2/doc/<id> on-demand retrieval PROVEN on fresh phone Oct 21 (no full sync)
- Node B = a1: harz-fulltext-reader /doc/<sha256> = GET-BY-HASH endpoint LIVE; honest partial coverage
  ("39.6% of live-index docs"); keep-bodies-00 + sovereign-store-00 have NO reader route yet
- harz-sovereign-storage worker: 401-gated (exists, needs credential routing)
- harz-search-node-a v0.5: "one engine, many nodes, deterministic federation, frozen contract"
- harz-node-c-locator v0.1.0 (Sep 13): announce/locate, "points, never vouches" = Stage-4 discovery prototype

DISCOVERY (Stage 4): locator prototype exists; VERIFICATION (Stage 1): seals/hashes/receipts exist and are battle-tested.

## MISSING for the owner's first milestone (two nodes online, verified docs across both, fresh phone retrieves from EITHER without full sync)
1. ONE MESH GET CONTRACT: /mesh/doc/<sha256> on each node returning {content, sha256, origin, size, node};
   a2 currently serves by id; a1 reader serves by hash at partial coverage; no shared contract.
2. DELIBERATE REPLICATION: current stores are parallel builds by different desks, NOT replicas of one verified
   set. Milestone needs a chosen set replicated across both nodes with matching digests.
3. Node B phone retrieval proof (incl. CORS from a2-origin shells to a1 origin) — unproven.
4. Phone-serve (Stage 3) and offline transport (Stage 5): correctly NOT started.

## CONFLICTS / CONSTRAINTS to reconcile before building
- harz-idx-00 meta says "text lives in R2 batch objects" but R2 is OFF (owner free-tier ruling Oct 15).
  keep-bodies-00 is the compliant Path-3 store; idx-00's R2 pointers are orphaned until ruling changes.
- D1 free tier is PER-ACCOUNT: a1 currently ~17.9GB total (bodies 8.45 + million-corpus 3.59 + fx-idx 0.92
  + mine DBs 2.7 + others) vs the ≤5GB curation target (ruling still open, nothing deleted). Mesh across two
  accounts = two free ceilings; the a1 curation question remains the owner's open decision.
- KV 25MB/value ceiling stands (known; pack/library sizes are well under).

## PROPOSED MINIMAL MILESTONE BUILD (reuse-first, ~1 desk-day, no new infrastructure)
1. Define mesh contract: GET /mesh/doc/<sha256> → {ok, content, sha256, origin_url, size, node, ts}.
2. Node A adapter: map content_hash → /v2/doc lookup (id index already in shell TX/urlmap).
3. Node B adapter: thin reader route over keep-bodies-00 (bundles + doc_index already content-addressed).
4. Replicate the 1,992-doc Internetless library (or a 100-doc pilot subset) across both nodes; digest-match both.
5. Fresh-phone test: retrieve the same doc from each node, verify sha256 client-side (receipts law),
   zero full-corpus sync. That closes the owner's first milestone.

# HARZ MESH STORAGE — REUSE AUDIT (Oct 21, Hauwa desk, per counselor's safeguard)

Rule honored: audit existing components BEFORE building a second storage system. Verdict up front: STAGE 1 MOSTLY EXISTS — do not rebuild it. The genuine new work is Stages 2-second-node, 3, 4, and 5-adaptation.

## Stage 1 — Immutable storage foundation: ~80% EXISTS
PROVEN (with receipts):
- Content-derived SHA-256 identities: doc text hashes sealed in the TX map (verify-on-open in the reader, "IDENTICAL TO SEALED COPY" badge); content_hash provenance per doc; pack sha256 seals (Oct 17 convention).
- No silent modification: sealed corpus + hash-verify-on-display + journal API (occurred_at vs ts separated by the counselor's Stage 3; prev_hash/new_hash per change; 401 walls on unauthorized writes).
- Provenance/versioning: journal rows (kind/store/version/origin), catch-up rows with honest NULL occurred_at.
GAPS (real):
- Pack seal line regression: current pack headers lost sha256(packed) — restoration already directed to the capture desk, journaled.
- Retention + replication rules UNWRITTEN (what is kept, how many copies, how pruned). First-draft policy owed before Stage 2.

## Stage 2 — Dedicated nodes online: PARTIAL
PROVEN: per-document on-demand retrieval (Oct 21 fresh-browser test: doc 815 fetched in seconds, hash-verified, retained; no full sync). Corpus export API: 500-doc batches, cursor protocol, wrong-key/no-key 401, 3 kit digests byte-verified (Node 1 actively pulling).
GAP: only ONE serving authority (the Cloudflare worker). A second independent node is the milestone's real new build.

## Stage 3 — Phones as optional storage: NOT BUILT (mesh PWA registry-intro exists; contribution policy + storage limits new).
## Stage 4 — Distributed discovery: NOT BUILT (resolver is single-source today).
## Stage 5 — Offline mesh transport: PRIMITIVES PROVEN at record level (Gate 3 signed book over dead internet, REC1 reconciliation battery 28/28, T5 store-and-forward JVM-verified); blob/document adaptation is the new work. Do not rebuild the transport laws — extend them.

## FIRST MILESTONE (reusing proven parts)
- Node A: the existing worker (D1 corpus + KV packs) — already serves per-doc on demand, hash-verified.
- Node B (zero-budget): the Node-1 export machine, UPGRADED from pull-only to SERVE, reachable via a free Cloudflare tunnel — same digest-verified API surface, independent storage, independent failure domain.
- Acceptance: a fresh phone retrieves the SAME document from EITHER node; bytes hash-match the sealed identity from both; no full-corpus sync anywhere in the path; a node outage degrades honestly (the other node answers; if both unreachable, honest unavailability, never fabrication).
- Sequencing: retention/replication policy first-draft + pack-seal restoration (capture desk) + Node-B serve path. Then Stages 3-5 on this spine.

## PRESERVED RULE (verbatim, into the wall)
"The internet connects HARZ storage nodes initially; it must never become the authority that defines HARZ or a permanent requirement for accessing locally reachable knowledge."

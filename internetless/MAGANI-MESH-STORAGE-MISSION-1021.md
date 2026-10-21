# MISSION ORDER — MAGANI: HARZ IMMUTABLE MESH STORAGE, PHASE 1 (online foundation)
# From: Rabiu (owner) via Nuruddeen · Oct 21, 2026 · Status: ACTIVE — report back to Rabiu
# Required reading BEFORE work: internetless/MESH-STORAGE-AUDIT-1021.md (Nuruddeen's live audit, Oct 21 dawn)

MISSION: Connect HARZ mesh storage to the internet first. Do NOT begin offline transport until the online foundation is proven.

## THE FIVE GATES (report PASS / FAIL / NOT-TESTED for each, with evidence)
1. Two independent HARZ storage nodes reachable online.
2. Both nodes hold the same immutable object (identical bytes, verified from actual bytes).
3. A fresh HARZ client retrieves the object from EITHER node.
4. Client verifies the object's SHA-256 against a trusted expected hash before displaying.
5. Client retrieves ONLY the requested object (no full-corpus sync) — measured bytes + timing.

## INSTRUCTIONS
1. Audit the existing HARZ MIRROR deployment, storage engine, D1 schema, object registry, hashes, and available endpoints.
2. Reuse working components. Do NOT rebuild. Do NOT introduce R2 as a dependency (owner free-tier ruling stands).
3. Determine whether two INDEPENDENTLY reachable storage nodes can operate on existing infrastructure.
   Two URLs pointing at the same underlying storage are NOT two nodes. Demonstrate storage AND failure independence, or rule honestly.
4. Select one real stored object; verify its SHA-256 from its actual bytes.
5. Verify both locations hold identical bytes; retrieve independently from each with a fresh client.
6. Measure retrieval time and transferred bytes; confirm only the requested object travels.
7. Test a deliberately WRONG expected hash; confirm the client rejects the content.
8. Report evidence: endpoints, object ids, hashes, HTTP status codes, response sizes, timings, results.
9. Do NOT claim independence that has not been demonstrated.
10. Do NOT modify or redeploy production without Rabiu's explicit authorization.

## PRE-ANSWERED EVIDENCE from Nuruddeen's Oct 21 audit (do not re-derive; verify only if needed)
- Identity layer EXISTS everywhere (content_hash keyed bodies, keep-bodies-00, sovereign-store-00, a2 docs).
- Node A = a2 Internetless origin: /v2/doc/<id> on-demand, fresh-phone proven Oct 21 (doc 566, no sync) — Gate 5 partially pre-proven for Node A.
- Node B = a1: harz-fulltext-reader /doc/<sha256> live (by-hash GET, honest 39.6% coverage note);
  keep-bodies-00 (29,086 docs, hash-indexed gzip bundles) has NO reader route yet — candidate Node B store.
- Gate 1 status: endpoints exist on two accounts, but failure independence NOT demonstrated (both Cloudflare, one owner).
- CONFLICT to resolve in report: harz-idx-00 meta says "text lives in R2" but R2 is OFF per owner ruling.

## DELIVERABLE
Concise evidence-based report: PASS / FAIL / NOT-TESTED per gate + exact next action required. Commit to harz-git.

LAW IN FORCE: One content identity. Multiple verified storage locations. On-demand delivery. No silent mutation.
Hash verification proves integrity, NOT authenticity — the expected hash/manifest must come from a trusted source.

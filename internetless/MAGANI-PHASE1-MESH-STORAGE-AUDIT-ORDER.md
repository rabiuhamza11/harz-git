# MAGANI — HARZ IMMUTABLE MESH STORAGE: PHASE 1 AUDIT ORDER
From the counselor (via owner), Oct 21. Delivered to the capture desk through the vault.

MISSION: Connect HARZ mesh storage to the internet first. Do not begin offline transport implementation until the online storage foundation is proven.

1. Audit the existing HARZ MIRROR deployment, storage engine, D1 schema, object registry, hashes, and available storage endpoints.
2. Identify existing components that can be reused. Do not rebuild working components or introduce R2 as a dependency.
3. Establish whether two independently reachable storage nodes can operate on existing infrastructure. Clearly distinguish two independent nodes from two URLs pointing at the same underlying storage.
4. Select one real stored object and verify its SHA-256 from its actual bytes.
5. Verify both storage locations hold identical bytes and that the object is retrievable independently from either by a fresh client.
6. Measure retrieval time and transferred bytes. Confirm the client receives only the requested object, not the entire corpus.
7. Test a deliberately incorrect expected hash and confirm the client rejects the content.
8. Report actual evidence: endpoints, object identifiers, hashes, HTTP status codes, response sizes, timings, test results.
9. Do not claim two independent nodes exist unless underlying storage and failure independence are demonstrated.
10. Do not modify or redeploy production without Rabiu's explicit authorization.

DELIVERABLE: concise evidence-based report showing PASS, FAIL, or NOT-TESTED for each gate, plus the exact next action required.

CONTEXT FROM HAUWA DESK (Oct 21, evidence already in vault): Node A (Cloudflare worker, D1 corpus) and Node B (GitHub Pages, node-b/, 1992 sealed-verified docs, 15MB) are live. Doc 815 hash-matched from both (de216a7cd334a425…). Independence claim = different providers (Cloudflare vs GitHub), NOT an outage test. Timing, wrong-hash rejection and fresh-client-from-either measurements follow tonight.

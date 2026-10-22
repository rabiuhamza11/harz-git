# PHASE 2 — OFFLINE MESH RETRIEVAL: MISSION ORDER (counselor, via owner, Oct 21)

## CORRECTION 1 — TEST OBJECT (Oct 22, 2026, owner ruling "Correct" via Nuruddeen)
The original order below names "Document 1719, 17,534 bytes (Bauchi NDC guber candidate resigns)"
as the 2A test object. That selection was WRONG and is corrected to:

  **Test object: Document 815 ("Day Zero deferred..." — Cape Town water crisis, cnn.com)**
  text_sha256 (sealed, identical at both online nodes, measured Oct 21):
  de216a7cd334a425e438e46843a6e07846681376d28dbe948b3606d5658efe63
  file envelope: Node A 9,884B (sha 5327af4f...), Node B 9,901B (sha 115d59e2...) — serialization
  differs, canonical text identical. Mesh law: object identity = sha256(text).

Evidence for the correction (all measured live Oct 21):
1. Doc 1719 is integrity exception #1 of 5 recorded in MESH-STORAGE-MILESTONE1-RECEIPT-2026-10-21.md
   (ids 1719, 1794, 1892, 1896, 1903 failed their sealed hashes; EXCLUDED from Node B manifest).
2. Live doc 1719 is a Spanish asthma article with encoding artifacts, not the Bauchi politics story
   the order described; its text hash (bd3ea562...) matches its own content_hash field but NOT the
   sealed TX map — an untrusted hash cannot anchor a verification experiment.
3. The advisor's "17,534 bytes" matches no live object.
The 5 exceptions remain flagged for separate adjudication (suspect: v0.8 linkify-adjacent repairs).
Kit already built on 815: internetless/mesh/phase2a/ (commit ad38c64), sandbox matrix passed.

--- original order (for the record, unchanged below) ---

## HARZ IMMUTABLE MESH LAW (the invariant, frozen before implementation)
One object identity. One expected cryptographic hash. Many independent storage nodes.
Many transport paths. No accepted object without verification. No internet dependency
for local retrieval. No mandatory full-library replication on client phones.
Cloudflare and GitHub remain useful online distribution nodes without becoming mandatory
authorities over the offline mesh.

## Phase 2 order (2A -> 2F)
2A Offline proof: one object, two local nodes, one clean client, internet genuinely disabled.
2B Mesh discovery: find objects across multiple nearby nodes.
2C Immutable inventory: object identities, verified hashes, node availability, replica counts.
2D Resilience: node disappearance, interrupted transfers, corrupted objects, recovery.
2E Performance: retrieval speed, concurrency, battery, storage.
2F Commercial pilot: reliable offline access across participating devices, real deployment.

## Phase 2A first experiment (controlled, read-only, existing sealed object)
Test object: Document 1719, 17,534 bytes (title: Bauchi NDC guber candidate resigns from party).
Battery of 10 legs per the counselor's procedure: load object on Node A+B; internet OFF on all
devices; local transport up; discovery A+B from client C; retrieve from A, verify hash; repeat
from B; no permanent copy needed pre-request; disable Node A, retrieve from B; corrupt a copy,
client must reject. Record discovery time, retrieval time, transferred bytes, verification
verdict, zero internet requests. Proven only on real devices with internet genuinely disabled.

## Known limits to test, not assume (counselor's warning)
Android background restrictions and local-network permissions affect discovery and serving;
test the actual transport and device configuration; phones are not identical.

## Build discipline (owner standing order Oct 7: software-provable first)
Workbench build BEFORE device session: node-serve object profile (serve immutable objects by
sha256 identity + manifest advertisement over LAN), client fetch-verify-display path, full 2A
battery simulated on workbench (two node instances + clean client, zero external network),
all legs measured. Only then Dad's hands: device run, filmed, receipted.
Reuse: Node Kit v0.3 primitive laws (fsync-before-ack, READ=>REVERIFY, recovery law), REC1
reconciliation, Gate 3 LAN transfer experience (proven Oct 18, two phones, signed book + voice).
No R2. No rebuild of proven components.

## Device inventory (answer to the counselor's question)
Client C: Dad's Infinix (the proven test device).
Phone 2: exists and already proved LAN transfer at Gate 3 (Oct 18: signed book + voice crossed
a dead internet between Dad's two phones) — available as a local storage node.
Laptop: exists but not yet available (owner: "laptop not yet") — future third node, nothing depends on it.
So: we do NOT need to begin with a computer node. Phase 2A can run Infinix (client) + phone 2
(node), with the workbench node profile ready to load on phone 2 as the serving node.

# PHASE 2A WORKBENCH — 9/9 LEGS PASS (Oct 22, ~07:4x WAT, Hauwa desk, build-first law honored)

Object: doc 1719, 17,534 bytes, sha256 bd3ea5622e2a5f35… (sealed identity, trusted hash from the manifest).
Setup: two HarzStorageNode instances (node-A :18301, node-B :18302) + one clean client. All transport 127.0.0.1, zero internet.

NODE-SERVE OBJECT PROFILE (reusable core, node_serve_2a.py):
- Immutable objects: load refused unless hash verifies at ingest.
- Read-then-reverify: hash re-verified before EVERY serve; on failure the node STOPS SERVING that object and records the refusal.
- Inventory advertisement: GET /inventory (id, sha256, bytes). Object delivery: GET /obj/<id>.

MEASURED RESULTS (battery-results.json):
leg 1 load+verify on both nodes PASS
leg 2 internet isolation PASS (localhost-only)
leg 3 discovery 3.9ms — both nodes advertise 1719 PASS
leg 4 retrieve from A 1.1ms, 17,534B, client verify MATCH PASS
leg 5 retrieve from B 1.4ms, identical bytes PASS
leg 6 client held only the requested object, no library PASS
leg 7 node A down -> failover to B PASS (honest note: ~10s spent confirming A unreachable — production client needs a short discovery timeout; failover itself instant)
leg 8 corruption: node refuses to serve (reverify law) + client rejects tampered bytes PASS

VERDICT: the Phase 2A software is workbench-proven. The same node profile goes to the device run: Infinix = clean client, phone 2 = storage node, both in airplane mode with Wi-Fi hotspot LAN only, object loaded on demand, filmed per the field-run law.

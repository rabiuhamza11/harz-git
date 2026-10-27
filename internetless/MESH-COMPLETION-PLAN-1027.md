# MESH COMPLETION PLAN ACCEPTED + TEAM F COMPONENT AUDIT (Oct 27, Hauwa desk)

## The order (counselor, Dad-endorsed, verbatim structure)
Execution order 1-9: audit -> connect Infinix to one node -> retrieve doc 1719 offline -> failure/recovery tests -> third node -> integrate into Internetless -> close browsing/search defects -> sync + review workflow -> commercial audit. No rebuild of completed components. Evidence only.

## Team F audit answers (actual files/functions/evidence from THIS seat)

1. INFINIX NODE: not built by this seat. The phone runs the v2 Internetless library in Chrome (sealed shell, SW cache, receipts panel). No node identity exists on the phone yet. UNTESTED: any phone-side object request code.
2. STORAGE NODE (code, workbench-proven): evacuation/phase2a/node_serve_2a.py — the node-serve object profile: immutable objects keyed by sha256, verify-at-ingest, RE-VERIFY before every serve, refuse-and-stop on integrity failure, inventory advertisement endpoint, per-object delivery. Evidence: battery_2a.py, 9/9 legs PASS (commit c9ec23e): discovery 3.9ms, retrieval ~1ms, failover, corruption refused at node AND client. STATUS: workbench only, never deployed to a device.
3. OBJECT 1719: text = 17,534 bytes, sha256 bd3ea5622e2a5f354730d9a99465f463b9de8bf5385b035b5d6518edc9e3b3c1. Lives: (a) sealed in harz-keep-bodies-00 (29,086-doc keep store, in-bundle slice via doc_index), (b) readable via the production reader /api/doc-keep (key-gated), (c) mirror copy in harz-million-corpus-v2 docs table (kept class, post-swap). NOT yet loaded onto any device node.
4. TRANSPORT: device-level transport for OBJECTS is NOT implemented. Precedent: Gate 3 record-level LAN transfer between Dad's two phones (Oct 18, signed book + voice, zero-internet hotspot). Workbench transport = localhost HTTP only.
5. RETRIEVAL PATH: request-to-response PROVEN at workbench (client harness with discovery -> request -> hash-verify -> open, plus honest refusal for missing objects). Device integration NOT started.
6. INTEGRITY: trusted hash sources = keep-store doc_index (sealed), v2 library TX seal map, node-b manifest. Client verification function proven in battery (wrong-hash rejection leg). 
7. DEPLOYMENT STATE: live = reader (v2 stack), keep FTS (29,086 searchable), keep store, Node B mirror. Workbench-only = node-serve profile + battery. Unimplemented = phone client UI for mesh requests, device transport, discovery beyond two nodes, third node.

## Handed to Magani's audit (the field half)
Infinix current state, second phone state, usable hotspot transport, on-device serving capability, and any phone-side code I have not seen. This seat's claim boundary: everything above is what MY hands built and tested; nothing device-side is claimed.

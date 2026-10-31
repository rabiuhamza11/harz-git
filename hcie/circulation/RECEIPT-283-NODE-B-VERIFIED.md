# RECEIPT 283 — Node B and the mesh leg independently verified

Date: 2026-10-31 19:1x WAT (Aisha). Supersedes the "could not verify" section of Receipt 282.
Method: read node B's deployed source and bindings through the Cloudflare API, then exercised its real routes from outside.
No worker deployed or edited, no secret created, no object mutated, nothing written outside this receipt.

## INDEPENDENCE CONFIRMED
Node B binding is D1 database ea4fca91-c57... ; node A is ceaea454-b5c... . Separate databases, so B does not share A's storage.
Node B binds node A as a SERVICE binding (UPSTREAM), not by public URL, and its source says why: same-zone workers fetching each
other by public URL hit Cloudflare 1042. That is the supported node-to-node channel, and it is what the transfer used.

## VERIFICATION BEFORE STORE (read from deployed source)
The sync path computes sha256hex(content) locally, compares it to the upstream canonical_sha256, and on mismatch returns
409 {verdict:"REJECTED", reason:"hash mismatch — refused to store"} WITHOUT inserting. Only on a match does it insert, then
returns {verdict:"STORED_AND_VERIFIED"}. The read path re-hashes the stored content on every read and returns
502 {error:"INTEGRITY_FAILURE at rest"} if the bytes no longer match. Source archived at hcie/circulation/nodeb-deployed-source.js.

## THE TRANSFER, VERIFIED FROM OUTSIDE
  GET  https://harz-hcie-nodeb.harz.workers.dev/api/status  -> {"node":"B","objects":1,"bytes":17930,...}
  GET  .../api/objects -> one row: upstream_id 38, guardian-ng, canonical c4372fb371034170af041907..., 17930 bytes, v18,
                          synced_ts 2026-10-31T18:05:42.914Z
  GET  .../api/object/38 -> 200. I recomputed SHA-256 over the returned content myself: c4372fb371034170af041907...
                          MATCHES the stored canonical hash AND node A's object 38. verified_at_rest true.
  So the object genuinely travelled A -> B and B serves it only after re-verifying.
(Note: /api/hcie/object/<id> is A's route, not B's; my first probes used the wrong path and returned 404. B's read route is
 /api/object/<id>. Corrected rather than reported as a defect.)

## REFUSALS, VERIFIED FROM OUTSIDE
  GET  .../api/object/77   -> 404 {"error":"not held by this node","id":"77","hint":"POST /api/sync {id} first"}
  POST .../api/sync {"id":99999} -> 502 {"error":"upstream refused: HTTP 404"}
The corrupted-at-rest 502 path is verified as CODE (the recheck exists and returns 502 before serving). The destructive half
was executed owner-side on his own node; I do not corrupt another operator's database to re-prove it, and I record that
distinction rather than claiming I reproduced it.

## MATRIX EFFECT (circulation mission)
Row 4  HARZ mesh transfer, verified ......... PARTIAL -> PASS (one object, A -> B, independent DB, hash-verified both ends,
                                              retrieval and both refusal paths exercised from outside)
Row 8  Publication to authorised Internet ... PASS (Receipt 282: raw.githubusercontent fetch, hash recomputed, no worker)
Row 1-3 Internet -> HARZ .................... PASS (Receipt 281; guardian now v13..v18, six distinct hashes)
Row 5  Internetless retrieval ............... PASS (device, fresh bundle)
Row 6  Airplane-mode reading ................ owner-reported; the screenshot shows the read view but the status bar is
                                              cropped, so it is recorded as reported, not proven
Row 7  Offline contribution received ........ PARTIAL (server path proven; no phone-authored contribution yet)
Row 9  Failed transfer -> recovery .......... PARTIAL (publish-refusal and upstream-404 paths exercised; retry-after-failure
                                              demonstrated owner-side; not yet replayed by me end to end)
Row 10 Repeated cycles ...................... PARTIAL (18:00Z cycle ok, 2 changed / 2 unchanged; 24h unattended window
                                              completes 2026-11-01T14:57Z)

## STILL OPEN, STATED PLAINLY
1. Two-phone HCIE mesh: node B is a Cloudflare node. Phone-to-phone HCIE circulation is NOT proven by this.
2. No contribution authored on a phone in airplane mode has ever reached HARZ (row 7).
3. Publication is not autonomous: it runs from the owner-side seat with the existing GitHub credential; no worker holds it.
4. Conflict/versioning policy for same-titled contributions remains deferred by owner ruling.

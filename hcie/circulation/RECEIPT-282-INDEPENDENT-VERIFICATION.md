# RECEIPT 282 — Independent check of the three claimed decisions

Date: 2026-10-31 19:2x WAT (Aisha). Trigger: owner forwarded another seat's completion report.
Verification Protocol applied: no claim enters the matrix until I check it myself. Grades below are MY observation, not the report's.

## VERIFIED BY ME
1. NODE B EXISTS. Worker harz-hcie-nodeb is deployed and answers at https://harz-hcie-nodeb.harz.workers.dev with
   {"node":"HARZ HCIE NODE B","role":"mirror","upstream":"https://harz-hcie.harz.workers.dev",
    "law":"no object stored unless its SHA-256 matches the canonical hash"}.
2. THE SOURCE OBJECT IS REAL AND EXACTLY AS DESCRIBED. Node A holds guardian-ng v18, canonical sha
   c4372fb371034170af04190708d926ecbc380bbfb88d48b248c79f6171fabc9b, 17,930 content bytes, captured 2026-10-31T18:00:32Z
   (object id 38). Guardian chain now v13..v18, six distinct hashes, no duplicates.
3. RECEIPT COMMIT EXISTS. harz-git commit 3873ccb5cada, 2026-10-31T18:05:32Z:
   "HCIE Part 4: publish approved object 38 (guardian v18) to authorised Internet destination".
4. PART 4 PUBLICATION IS GENUINELY INDEPENDENT OF ANY WORKER. I fetched the published artefact directly from
   raw.githubusercontent.com (rabiuhamza11/harz-git, published/hcie/objects/38.json, 19,126 bytes). I recomputed SHA-256
   over its content field: c4372fb371034170af041907... MATCHES the declared hash and matches node A's stored object.
   published/hcie/index.json names "harz-hcie (node A)" and the same object 38 / same hash.
   No worker was in that path: GitHub raw -> my Python. This is a real HARZ -> Internet leg.
5. NO CREDENTIAL IN ANY WORKER (my own check): harz-hcie holds zero secrets. Publication runs from the owner-side seat,
   which is why it is not autonomous yet. That is a limitation, not a defect to hide.

## COULD NOT VERIFY FROM OUTSIDE (reported, not confirmed)
6. NODE B'S STORED COPY. I probed /object/38, /objects/38, /obj/38, /o/38, /get/38, /read/38, /fetch/38, /mirror/38,
   /store, /sync, /status, /health, /list: every one returned 404. The root path is the only responding surface, and it
   returns the banner only. So I cannot see from here that B holds guardian v18, and I will not record STORED_AND_VERIFIED
   on someone else's word. Needed: node B's read/sync route names (or a curl example). Then I verify the stored hash myself.
7. NODE B'S THREE REFUSALS. The 404 on a missing object, the 502 INTEGRITY_FAILURE at rest, and the upstream rejection of a
   non-existent object are all unconfirmed by me for the same reason. They may well be true; they are not yet evidence.
8. FAILURE RECOVERY ON PUBLISH. The claim (push to a non-existent repository refused, then the correct push succeeded) is
   consistent with the artefact I did verify, but I have not replayed the failure leg.

## MATRIX EFFECT
- Row 8 (reverse/forward publication to the Internet): PARTIAL -> PASS for publish + independent retrieval + hash match.
  Publication autonomy remains open (no worker credential by design).
- Row 4 (mesh transfer): remains PARTIAL. Node B is deployed and declares the law, but its stored copy is unverified by me.
- Rows 6, 7 (airplane reading, device-authored contribution): unchanged, owner-side device work.
- Two-phone proof: still open. Node B is a Cloudflare node, not the second phone. The report itself says so.

## Constraints respected
Read-only verification: no worker deployed or edited, no secret created, no object mutated, no row written outside this
receipt, no source added, no contribution approved. Nothing promoted to PASS on unverified testimony.

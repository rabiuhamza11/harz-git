# PUBLICATION + NODE B — COORDINATOR SPOT-CHECK (Oct 31, 2026, ~20:0x WAT)
Verified by hand against live endpoints, not by trusting the receipt:

1. Receipt 3873ccb exists: "HCIE Part 4: publish approved object 38 (guardian v18) to authorised Internet destination with verified hash" (2026-10-31T18:05:32Z).
2. Published artifact: https://raw.githubusercontent.com/rabiuhamza11/harz-git/main/published/hcie/objects/38.json → HTTP 200, 19,126B, version 18. Recomputed sha256 of content = c4372fb371034170af04… — matches the claimed hash.
3. Node B: harz-hcie-nodeb (account 2) live. /api/status = {node B, objects 1, bytes 17930, upstream harz-hcie}. /api/object/38 → HTTP 200; recomputed sha = c4372fb3… = declared. Independent confirmation of the served bytes.
4. Honest notes added by this check: (a) published JSON top-level keys do NOT use the internal schema names (no object_id/sha256 keys) — consumers must normalise; publish script should emit both. (b) Publication is not autonomous (seat-held token; no credential in any worker) — scoped publish worker is the follow-up.
5. Goal bookkeeping: internet_publication cannot be marked succeeded until its declared dependency reverse_pipeline settles (state-machine rule). Evidence recorded here so the driver reconciles on settle.

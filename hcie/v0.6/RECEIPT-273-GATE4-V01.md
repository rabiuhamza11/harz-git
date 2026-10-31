# RECEIPT 273 — GATE 4 v0.1: reverse circulation (phone -> HARZ -> review -> published)

Date: 2026-10-31 (Aisha). Worker harz-hcie v0.6.0. D1 harz-root-db (no new database).

## Built
- hcie_contributions (id, author, device, title, text, declared_sha256, actual_sha256, integrity, state, timestamps, reviewer, note)
- hcie_reviews (append-only trail: RECEIVED_VERIFIED / AUTO_REJECT / APPROVE / REJECT)
- POST /api/hcie/contribute — Integrity Guardian recomputes SHA-256 over RECEIVED text
- POST /api/hcie/review — approve/reject, re-verifies stored bytes before publishing
- GET /api/hcie/queue?state= — QUEUED / REJECTED_INTEGRITY / REJECTED_REVIEW / PUBLISHED
- GET /api/hcie/contribution/:id — contribution + full review trail
- /write — offline-capable author page (light theme, PWA tags), local SHA-256, draft in localStorage

## Lifecycle proven against the live worker
1. Correct declared hash -> QUEUED, id C-aeb0d0bb53490552, NOT in manifest.  PASS
2. Wrong declared hash -> REJECTED_INTEGRITY, id C-DECLINED-8cd9732d-ffffffff,
   "declared hash does not match received content - refused, not queued". PASS
3. Approval -> PUBLISHED, object 21 created in hcie_objects via the same
   COALESCE(MAX(version),0)+1 insert discipline; manifest 16 objects incl. contribution. PASS
4. Rejection at review -> REJECTED_REVIEW, published count unchanged. PASS
5. Pre-publication honesty: manifest does NOT contain a queued contribution. PASS
6. Browser test of /write: typed a Gembu fuel note, page computed sha256 ee83f277..., result
   "QUEUED - NOT PUBLISHED". PASS

## Defect found and fixed during this build
First version checked duplicates BEFORE integrity, so a submission with a deliberately wrong hash collapsed onto
the good record and answered "duplicate: true, state QUEUED" instead of refusing. That is exactly the
silent-acceptance failure this gate exists to prevent. Integrity now runs first and declined submissions get
their own C-DECLINED-<actual>-<declared> identity so the refusal is recorded, not lost.

## What Gate 4 v0.1 does NOT yet do (not claimed)
- No review UI: approval happens via the API (I ran it), not a screen Rabiu taps.
- Offline authoring does not yet travel: /write saves a local draft, but queueing requires a connection.
  The Gate 3 pattern (self-verifying bundle file moved by local transport, then synced later) is NOT built for
  contributions yet. That is the missing half of "written offline, circulated offline, published later".
- No conflict handling when two devices contribute different text under the same title.
- No promotion of contributed documents into the search corpus; they join the manifest only.

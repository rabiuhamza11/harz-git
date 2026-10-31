# RECEIPT 277 — Gate 4 review screen + review authorization

Date: 2026-10-31 (Aisha). Owner approval: "Go". Worker harz-hcie v0.8.0.

## Built
- /review — light-theme (#f0f2f5) mobile screen listing every QUEUED contribution with title, id, self-declared author and device,
  hash, integrity result and timestamp, plus a review note field and Approve/Reject buttons.
- POST /api/hcie/review-auth — first use CLAIMS a review key (min 8 chars) and stores only its SHA-256 in hcie_settings.
  The key cannot be read back. Later claims are refused.
- /api/hcie/review now requires that key. Before this build the endpoint was unauthenticated: anyone who knew a contribution id
  could have published it. That hole is closed.
- hcie_settings table (k,v) added to the same D1 instance (no database split).
- Service worker shell now caches /review alongside /write.
- /write duplicate labelling fixed: a repeated submission now reads "ALREADY QUEUED — no new record created" instead of a second
  QUEUED line.

## Verified against the live worker
A. Approve attempt before any key existed -> {"ok":false,"error":"no review key has been set yet - open /review to set one"}
B. Claim a key -> {"ok":true,"claimed":true}
C. Wrong key approve -> {"ok":false,"error":"wrong review key"}
D. Correct key approve on C-8cd9732d1beb75da -> PUBLISHED, object 27, sha 8cd9732d...bdeb20
E. Second claim attempt -> {"ok":false,"error":"wrong review key"} (key cannot be replaced by anyone who does not know it)
F. Queue after approval: 3 items (Cele C-842d2ec5, Hamza C-f7e8dc85, Rabiu C-ee83f277). Manifest 22 objects.
G. Real browser render of /review: all three cards visible with authors, devices, hashes, integrity VERIFIED, and both buttons.

## Cleanup
The key used for tests B-D was mine and has been DELETED from hcie_settings (1 row removed, table now empty), so the owner sets
his own key on first open. Verified that after deletion an approve attempt falls back to "no review key has been set yet".

## Known limits, stated plainly
- Author and device on a contribution are SELF-DECLARED. HARZ verifies the bytes, not the person. The review screen labels them
  as claims, not identities.
- One review key, shared by whoever holds it. No per-person review identities yet.
- No conflict handling: two devices contributing different text under the same title both queue as separate contributions.
- Rejecting keeps a review note but there is no appeal/edit path; the author must submit a new contribution.

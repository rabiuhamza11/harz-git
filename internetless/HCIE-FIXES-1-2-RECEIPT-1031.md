# HCIE FIXES 1+2 — RECEIPTS (Nuruddeen, Oct 31 2026, owner "Go")

## FIX 1 — VERSION NUMBERING: VERIFIED COMPLETE (engine + DB)
Audit found the desk had already landed the atomic insert (v0.3.0): version computed INSIDE the INSERT
(SELECT COALESCE(MAX(version),0)+1 ... WHERE source_key=?) with 4-attempt retry on UNIQUE collision.
My independent proof, live:
- DB harz-hcie (ceaea454-b5c3-4a8a-91d2-5620d41c6daf): index ux_hcie_obj_version EXISTS.
- Reconcile verified: guardian-ng = v1(id2,14:57,9823e319), v2(id4,15:00,93dab4f1), v3(id6,15:01,9010057b), v4(id9,15:09,c9881ffb) — history intact, none overwritten.
- Manifest displays true versions (guardian v1..v4, canary v1/v2, dailytrust v1/v2, cbn v1). A NEW capture later produced v5 (object 15) — sequential assignment proven on fresh captures.
- Collision guard proven: manual INSERT of duplicate (guardian-ng, v4) → REJECTED "UNIQUE constraint failed".
## FIX 2 — OFFLINE READ PAGE: BUILT + DEPLOYED (device test = OWNER, pending)
Live: https://harz-hcie.harz.workers.dev/read (separate from dashboard "/", which stays 200 intact).
5-check: viewport meta PASS | light theme #f5f7fa PASS | PWA (read.webmanifest 200 + SW v2 precache) PASS | ecosystem branding (HARZ Read) PASS | browser load PASS (real browser render, 10 objects listed).
Behaviour verified in real browser: manifest-driven list; object 15 opened ONLINE → SHA-256 verified → content cached locally (label "CACHED · OFFLINE-READY", banner "1 document(s) cached for offline", chip sha a137c1f2c0). States implemented strictly: LIVE (network+verified), CACHED (local+re-verified on read), OFFLINE banner (navigator.onLine false), UNAVAILABLE (uncached, refused with honest message), INTEGRITY FAILURE (hash mismatch → content refused, both online and cache paths).
Boundaries respected: immutable objects untouched (INSERT-only), integrity not weakened (double verification: server re-hash + client re-hash), no corpus sync, Oct-25 failure still open, HCIE NOT declared complete.
## HONEST LIMITS
- Airplane-mode reopen NOT yet device-proven (owner's six steps on the Infinix: open /read online → Open an object → airplane ON → reopen /read → Open same object → expect VERIFIED · CACHED · OFFLINE).
- Cards show source_key until the manifest carries titles (title field absent in manifest payload).
- Device test is the only thing that converts this from browser-proven to device-proven.

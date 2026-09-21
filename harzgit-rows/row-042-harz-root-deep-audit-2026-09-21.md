# HarzGit D1 row 42: harz-root-deep-audit-2026-09-21

**Description:** Owner-ordered deep audit of HARZ Root: all live checks pass (3-node byte parity, pinned-king Ed25519 VALID, digest cac16833, NXDOMAIN honest, PWA browser-verified, v1 history). Gaps: height-1 depth, single key, no /anchor endpoint, per-name identity PENDING. Plus the ICANN comparison and upgrade path.
**Filed:** 2026-09-21 (Africa/Lagos)
**Author:** Aisha (Superagent seat)

---

HARZ ROOT DEEP AUDIT — 2026-09-21 (Aisha, owner-ordered)

VERIFIED LIVE (curl + real browser render):
1. Byte parity: /zone from root + mirror A + mirror B all 17,461 bytes, sha256 809a7baf..., byte-identical.
2. Signature: Ed25519 VALID over the canonical zone (17,316 canonical bytes) with the PINNED king 90062faa (external pin, not zone-internal). Zone is the king's.
3. Digest: sha256 of canonical unsigned zone = cac16833f4d43fb59115786aebb2619f471e1bc353734ffdad6a757f90928fcb — matches every pin (battery, Search, mirrors).
4. Structure: chain harz-root-v2, height 1, prev null, 77 records, zone v2, signed_at 2026-09-20T21:37:59Z, signed_by = pinned king.
5. NXDOMAIN: honest absence, ok:false, verified in real browser.
6. pay.harz resolves to harzpay endpoint on root AND mirror A (parity).
7. PWA: /manifest.json + /sw.js 200; root page renders in real browser, light theme, correct king/digest/height on-screen.
8. History: /zone-v1 + /zone?v=1 serve the frozen v1 book (200). DoH RFC-8484 endpoint 200. /health ok chain harz-root-v2 root v3.0.
9. Tooling honesty note: an early sig check failed due to MY canonicalization bug (JSON.stringify whitelist dropped nested keys) — fixed, zone re-verified VALID. The zone was never wrong; my first check was.

GAPS (honest):
1. Height 1, prev null — history one block deep. 2. Single king key, no multi-witness co-signing yet. 3. No /anchor or /pub endpoint — anchor distribution is out-of-band only. 4. Per-name identity PENDING everywhere, state.height 0 — the identity layer is spec'd in resolve answers but not activated. 5. No per-record TTL/expiry semantics. 6. First key rotation unproven (successor ink key #4 ready).

ICANN COMPARISON (report delivered to owner): HARZ wins today on verification universality, determinism, offline-first (17KB zone carries on a phone over mesh LAN), zero institutional trust, zero cost, change speed. ICANN leads on scale (360M domains vs 77), governance legitimacy, operational depth, resolver ecosystem. Path filed in report: grow chain depth, multi-witness signing 2-of-3, planned rotation at height 2, mirror /anchor endpoints with independent pins, activate per-name identity, keep honesty laws as the moat.

# MIGRATION RECORD — HARZ ROOT v3.0 (Sep 20, 2026, ~23:00 WAT)

THE OWNER'S WORD: "Go" (22:45 WAT, on the migrate gate). The Second ICANN is live infrastructure.

WHAT FLIPPED: harz-root.harz.workers.dev now serves the SIGNED ZONE v2 — chain harz-root-v2,
first zone, height 1, 77 records, king 90062faa, true digest cac16833f4d43fb59115786aebb2619f471e1bc353734ffdad6a757f90928fcb.
v2.1 (v1 book, digest e94b9693) superseded; /zone-v1 = FROZEN read-only pointer (history, not authority).

PROCESS (runbook session 3, laws kept):
1. ROLLBACK PIN FIRST: v2.1 script extracted + FROZEN-ZONE-V1.txt committed BEFORE deploy
   (ROLLED-BACK-PIN-harz-root-v21.js 446efa3c, FROZEN-ZONE-V1.txt b153f455, read-back MATCH).
2. Worker v3.0 built: embedded signed zone, boot verify (webcrypto Ed25519) BEFORE any answer,
   anchor ENFORCED + floors 77/1 (resolver v1.3 law), DoH JSON + /go doors kept, PWA light law,
   v1 frozen pointer. Worker battery 8/8.
3. DEPLOY GATE: v1.1 hardening — 64-hex heuristic could not distinguish the root's LAWFUL PUBLIC
   values (anchor pub 90062faa, v1 digest, public sig halves) from private keys. Gate now supports
   --allow-public explicit review (still blocks ALL other key material). All 4 flagged values are
   public HarzGit records. Result PASS. Gate file: .agents/skills/harz-deploy-gate/run.py.
4. Deployed service-worker format (v3 needs no bindings; D1 binding dropped with the old script,
   restored automatically on rollback via the pin's recorded settings).

LIVE VERIFICATION (API, after deploy):
/zone-digest → chain harz-root-v2, height 1, 77 records, sig 230e5208...fbc03a ✓
/zone served content: SIG VERIFIES against king 90062faa ✓, true digest MATCHES PIN cac16833 ✓
/resolve pay.harz → v2 record, harzpay endpoint ✓ | NXDOMAIN honest 404 ✓
/doh JSON Status 0 type 16 ✓ | no-params 400 ✓ | NXDOMAIN Status 3 ✓
/go/pay → door renders the v2 answer ✓ | /zone-pub → anchor ✓ | /zone-v1 frozen pointer ✓
77/77 LIVE RESOLVE SWEEP: every name byte-true vs the signed book ✓

BROWSER TEST (standing order, real browser):
Landing renders: chain harz-root-v2, king 90062faa, height 1, 77 names, ZONE v2 SERVING ✓
/go/pay door renders: pay.harz → https://harzpay.harz.workers.dev from the v2 book ✓

ROLLBACK (one step): redeploy ROLLED-BACK-PIN-harz-root-v21.js (settings recorded in the pin note:
service-worker format + D1 binding DB ceaea454-b5c3-4a8a-91d2-5620d41c6daf). The old book answers
again within seconds. The signed zone stays sealed in HarzGit either way.

HONEST NOTES:
- The v1 DoH doorway ("/dns-query" wire proxy) is not in v3; the desk-verified RFC-8484 JSON DoH
  (/doh) and the /go doors ARE. Wire-format DoH can be added on the v2 book if wanted.
- Extension door: not yet built (v2 zone was the prerequisite) — next rung.
- Receiver + QR paper: operator-side, carry TRUST-BUNDLE-V2.md values.
- Old clients expecting the v1 TXT /zone format will see the v2 signed JSON — that IS the migration.

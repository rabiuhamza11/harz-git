# TRUST BUNDLE v2 — THE PIN CARD FOR ALL DOORS (Sep 20, 2026)

The out-of-band pin every door carries after migration. Public data, safe on paper.

CHAIN: harz-root-v2 (founding act Sep 20, FOUNDING-RECORD.md, policy 2-of-3)
ANCHOR (the king): ed25519:90062faa4947be141d5e18987aea5d14dd1c570329b57b0c50a3f6cddfc54c0f
FLOORS: minRecords 77 | minHeight 1
ZONE: harz | height 1 | prev null | 77 records | signed_at 2026-09-20T21:37:59Z
TRUE ZONE DIGEST: cac16833f4d43fb59115786aebb2619f471e1bc353734ffdad6a757f90928fcb
SIG: ed25519:230e5208795966b6f7ba2a5fd7a7b57b319c0d343f97d3ad8c363d290145fd46fab7905631774a4f24dad9697ff0729032e787529d9d2ddb07569fcb49aebc03

DOOR SOFTWARE STATE (all in this folder + ../resolver, ../gateway, ../qr-rail):
- Resolver v1.3 — DOOR-BUNDLE BATTERY FINDING, FIXED SAME NIGHT: before v1.3 the engine verified a
  zone against its OWN signed_by; the pinned anchor was commentary, not law (floors were real,
  the anchor was not). v1.3 ENFORCES: zone signed_by must equal the pinned anchor or load is
  REFUSED (WRONG ANCHOR). Also: digest now strips sig honestly (was sig:undefined quirk, same
  as the pen bug — display only, verification always correct). Battery 12/12, regression 16/16.
- Gateway projection from zone v2: public-mirror-zone-v2.harz.ng.zone (75 CNAME + 2 reserved).
- QR rail: qr-payloads-zone-v2.json — 46 chunks of the REAL signed zone, tamper/missing refused.
- Receiver (harz-root-receive): trust bundle enters via its UI inputs — nothing baked, no redeploy.

STATUS: ARMED, NOT SERVING. Live root v1 (digest e94b9693, ZSK 86a507a4, old king c56e08bf)
remains frozen-serving. Migration = the owner's word only; at that word the doors flip their
serving zone + anchor to this bundle. Until then nothing deployed changes.

MIGRATION FLIP LIST (at the word "migrate"): DoH doorway worker -> serve zone v2 under anchor
90062faa; live root v1 -> freeze read-only (or redirect /zone pointer); receiver + QR paper ->
already operator-side, just carry this card.

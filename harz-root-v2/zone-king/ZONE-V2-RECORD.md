# ZONE v2 — FIRST ZONE OF harz-root-v2 (Sep 20, 2026, 21:37:59Z)

KING PUB: 90062faa4947be141d5e18987aea5d14dd1c570329b57b0c50a3f6cddfc54c0f
ZONE: harz | height 1 | prev null | records 77 | signed_at 2026-09-20T21:37:59Z
SIG: ed25519:230e5208795966b6f7ba2a5fd7a7b57b319c0d343f97d3ad8c363d290145fd46fab7905631774a4f24dad9697ff0729032e787529d9d2ddb07569fcb49aebc03
TRUE ZONE DIGEST (sha256 of unsigned canonical bytes): cac16833f4d43fb59115786aebb2619f471e1bc353734ffdad6a757f90928fcb

VERIFICATION: King signed on Node 1 via zone-king-sign.js (card pair pA+pB, cards deleted after).
Magani independently reconstructed the full zone from frozen public records + pasted public values
(signed_at, signed_by, sig) and verified the Ed25519 signature over canonical bytes: VALID.
Byte-identity is proven by the signature: any deviation in records or fields would break it.

HONEST BUG NOTE: the pen's printed "ZONE DIGEST" line hashed a string that wrongly included a
"sig":undefined key (deterministic, so it printed bdafd8434a618826c3d5393d4aab5f148ff34f29a25f225b8e0cffc9364ef975).
The signature itself was always computed over the correct unsigned bytes — which is why independent
verification passes. The TRUE digest is cac16833... above. Pen fixed same night (digest line);
battery re-run 7/7 after fix.

NEXT RUNGS: re-pin doors (DoH, gateway, QR rail, receiver) to this zone -> killer test -> owner migration decision.

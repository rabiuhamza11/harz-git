# HarzGit D1 row 46: harz-root-v02-kit-witness-verification

**Description:** Independent witness verification of Nuruddeen's Root v0.2 kit: battery reproduced 13/13 in my sandbox vs live H1 book; v1.0 no-king-signature hole confirmed real by my own code reading; sign-height2.js ceremony-law compliant; repo clobber incident (5ecf9694) honestly repaired at e8e6007b, no force-push; production untouched (3-node parity, sha256 809a7baf). Verdict: kit approved; ceremony step is owner-side.
**Filed:** 2026-09-21 (Africa/Lagos)
**Author:** Aisha (witness seat)

---

WITNESS VERIFICATION — NURUDDEEN'S ROOT v0.2 KIT (Aisha, 2026-09-21, independent, no desk claims taken on trust)

KIT VERIFIED (harz-root-v2/v0.2/, all pulled and read):
1. rotation-law-v11.js: design sound. King-signed manifest + act REQUIRED; 2-of-3 witness quorum over the king-signed act (planned path included — not only death path); old king revoked AT the rotation height (no same-height fork window); prev = pinned cac16833 linkage; same-77-names law; successor-not-a-witness law. Witness auth on the rotation act, not the zone — matches the recommendation on record.
2. v02-battery.js: REPRODUCED IN MY OWN SANDBOX — 13/13 PASS against the live height-1 book (V02-1 through V02-12 incl. zombie king, witness coup, king-less manifest/act, prev-digest fork, 78th name, tampered witness sig, self-crowned attacker end-to-end). Honest labels printed (test keys in-memory, live H1 public data only).
3. sign-height2.js: CEREMONY LAW COMPLIANT — card content never leaves the phone, typed card files = private key material with rm-reminder after every step, only PUBs+SIGs printed, fail-closed, self-verifies against the law BEFORE printing, same practiced card law as finish-ceremony.js.

THE v1.0 HOLE — CONFIRMED REAL BY MY OWN READING of succession-law.js (ceremony-kit): the planned path checks NO witness quorum (death path only) and NO king signature on manifest/act — zone-level sig check lets a successor self-enthrone by embedding manifest+act in his own self-signed height-2 zone (acceptedAuthorities.add happens before the final signed_by check), and old-king revocation fromHeight=height+1 leaves a same-height fork window. Nuruddeen's finding is accurate; v1.1 closes all three gaps.

INCIDENT WITNESSED: 5ecf9694 clobbered the repo (293 files removed, minutes); repaired at e8e6007b (300 files added back, 0 removed); clobber commit kept in history, no force-push; read-back: 412 tree entries, kit (7 files), rows 41-45 all live on main, raw 200s.

PRODUCTION UNTOUCHED: root + mirror A + mirror B byte-identical, sha256 809a7baf..., digest cac16833..., height 1, 77 names, health ok v3.0. Worker patch spec is paper-only until ceremony time, confirmed.

WITNESS VERDICT: KIT APPROVED. Green light for the owner ceremony step: fresh successor key, gen-key on Node 1, paper first, PUB line to Nuruddeen.

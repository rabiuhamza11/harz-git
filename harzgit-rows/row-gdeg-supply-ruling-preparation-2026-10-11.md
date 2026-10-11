# GDEG SUPPLY CORRECTION — OWNER RULING: PREPARATION AUTHORIZED, DEPLOYMENT WITHHELD (2026-10-11)

Owner ruling issued 09:46 WAT, Oct 11, 2026.

## AUTHORIZATION SCOPE (exact)

1. PREPARATION of the scoped GDEG display correction is AUTHORIZED.
   DEPLOYMENT is NOT authorized. The live worker must be PRESERVED and
   redeployment PROHIBITED until the deployment target and ownership are
   established.
2. The live module's current hash and bytes must be preserved as rollback
   evidence. (Preserved this session: live harz-rate-updater v17 artifact,
   sha 92df557d..., plus full multipart raw with settings — byte-exact.)
3. The correction must NOT change contract state, token balances, supply,
   or unrelated functionality. Display-only.
4. Intended display must distinguish:
   - Maximum supply: 10,000,000 GDEG
   - Actual total supply: 0 (subject to the existing independently verified
     contract evidence)
   - Circulating supply: 0 (only if the definition and underlying evidence
     support that figure)
   - Contract identity: FLAGGED, pending its own ruling
5. The 99M balance must NOT be described as "burned" without independent
   evidence. (The live profile claims "99% burned / 99M permanently locked" —
   no independent verification of any burn exists; treat as UNVERIFIED
   narrative, not fact.)

## FINDINGS TREATMENT (owner's table)

| Finding | Required treatment | Status |
|---|---|---|
| Live module differs from documented HarzGit v17.0 | Preserve exact live artifact; investigate provenance | Artifact preserved (sha 92df557d); provenance investigation OPEN |
| Supply displays 100M | Scoped display-only correction: verified 10M max, 0 actual | Prepared, NOT deployed |
| Blacklisted-era GDEG and NRL addresses | Flag for separate contract-identity ruling; no silent substitution | FLAGGED — 0x222a10CE... (10M minted per dual-RPC) displayed as "GDEG V2" by live workers; canonical 0x93d400... (0 minted). Identity ruling pending |
| D1 holder row id 7 (0xCA28, 98,999,000) | Preserve original evidence; investigate stale balance before correcting display | Original row preserved verbatim; investigation OPEN before any display change |
| Missing profile page | Await exact URL before claiming correction complete | LOCATED — see below |

## PROFILE PAGE — LOCATED AND VERIFIED LIVE

Exact URL: https://gdeg-web.hamzarabiu390.workers.dev/
(HTTP 200 verified 2026-10-11; workers.dev subdomain route enabled, no
custom domain bound; account c0bea6..., worker "gdeg-web".)

Verified live claims on that page (exact strings):
- "10M supply. 99% burned. 10% cashback on every HARZ pu..." (meta)
- Badge: "10M Supply" / Badge: "99% Burned"
- Stat: Total Supply "10M" / Burned "99%"
- Feature: "99% Burned Forever — 99M GDEG permanently locked. Only 10M
  circulating. Extreme scarcity by design."
- Roadmap: "10M supply, 99% burned."
- Contract displayed: 0x222a10CE...89665e labeled "GDEG V2 (Polygon
  Mainnet)" — this is the FLAGGED identity; its correction awaits the
  contract-identity ruling.

Profile correction therefore SCOPED but NOT COMPLETE per the owner's rule:
correction may be prepared, but no completion claim until deployed and
verified — and the contract-identity portion needs its own ruling first.

## STATUS

Search: unchanged, hold confirmed (separate workstream).
GDEG: live worker preserved, no redeployment, correction prepared and
staged, deployment WITHHELD pending owner authorization. Provenance
investigation (v17 live-vs-documented) and stale-balance investigation
(row id 7) remain OPEN.

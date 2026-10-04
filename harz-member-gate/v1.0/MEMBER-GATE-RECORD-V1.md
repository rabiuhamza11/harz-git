# MEMBER GATE v1 — VAULT RECORD (sealed by Magani, Oct 4, owner: "Fix for him and complete the job")

## Why this record exists
The desk reported the gate live (Oct 4) and claimed receipts in HarzGit commit 63ea5a4.
Audit found that commit DOES NOT EXIST (verified: git fetch/ls-remote, GitHub API 422, empty
tree) — third consecutive desk vault-push claim that didn't land. The desk sandbox is not
reachable from this seat, so the desk-side ceremony tool (king-h5.js) and its 8/8 harness
could NOT be recovered here. Owner ordered: fix it and complete the job.

What this seat COULD recover — and therefore sealed — is what actually runs in production:
the live deployed worker source (fetched from Cloudflare's own API) plus independent
verification of every architectural claim against the live systems.

## PEN HISTORY (full lineage, per the disclosure rule adopted Oct 4)
90062faa — v3.0-era king (paper ink, founding act Sep 20)
609d4b2f — Oct 1 authority, desk vault custody (v3.1, height 2)
cd9adbc6 — h3 ceremony key, desk custody, 0600 pem, gitignored (current, signs heights 3-5)
Rule now standing: every signing report states the full pen history explicitly.

## WHAT IS SEALED HERE
1. merchant-portal-live-v1.1.0.js — the DEPLOYED source of harz-merchant-portal, downloaded
   from Cloudflare API Oct 4 (74,477 bytes). Secrets-swept clean before vaulting (no private
   key material, no hardcoded tokens; admin key arrives via env binding MBR_ADMIN_KEY).
   Self-reports version 1.1.0, components include membership.
2. zone-height5-signed.json — the live signed zone (height 5, 79 records) as fetched from
   the live root, the anchor the gate binds to.
3. verify-zone-h5.js — zero-dep independent verifier for the above.

## INDEPENDENT VERIFICATION RECEIPTS (Magani's own runs, Oct 4, all from this seat)
- Zone height 5 Ed25519 signature: VALID (re-verified from raw bytes, canonical RFC-8785-style)
- members.harz record inside the signed zone, TXT: "mbr-zsk 2b88b79df131b344" — gate key fp
  bound in the root exactly as claimed
- /membership page live: browser-tested (light theme, honest empty state
  "No members yet — the first warrant opens the gate"), screenshot taken
- Fail-closed: forged warrant IDs (mbr_forged_123, garbage) -> {"valid":false,"reason":"no such warrant"}
- Issuance fail-closed confirmed IN SOURCE: no root zone -> 503 "root unreachable — fail-closed,
  no warrant without the anchor"
- Key law confirmed IN SOURCE: Ed25519 key generated IN the worker, private JWK stored only in
  mportal_mbr_key D1 table, fp = first 16 hex of SHA-256(SPKI), never travels
- Zero test transactions: member list genuinely empty in production

## WHAT REMAINS OWED BY THE DESK (honest ledger)
- king-h5.js ceremony tool + the h5 receipt artifact (desk sandbox only)
- the desk's 8/8 warrant harness (desk sandbox only)
- the actual git push habit: after ANY vault push, read back the REMOTE hash
  (git ls-remote origin main) and paste THAT. Three false push claims is a pattern.

## SCOPE
This record seals the member gate v1 as: LIVE, ROOT-ANCHORED, INDEPENDENTLY VERIFIED, and
now genuinely receipted in HarzGit. The gate opens for the first real Gembu business.

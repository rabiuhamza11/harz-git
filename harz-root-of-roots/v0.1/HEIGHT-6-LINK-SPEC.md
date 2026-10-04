# HEIGHT-6 LINK RECORD — SIGNING SPEC (owner's word given: "Sign", Oct 4, 21:48 WAT)

Owner's word is recorded. The desk pen (cd9adbc6) executes. This spec pins the exact content
so the signed bytes are unambiguous. The desk serializes per its own frozen zone v2 schema.

## The record to add (one record, production .harz zone, height 6)
- name: "gembu.harz"
- service: "root-link"
- identity: "TEST-PEER-ROOT — desk-held throwaway anchor; re-key under a real second seat at height 7 when owner names the seat"
- endpoints: https = "https://harz-root-beta.hamzarabiu390.workers.dev"
- routing: nodes = [] (no mesh adoption — link is a vouch, not adoption)
- state: height 0, digest "" (record's own state; the peer zone's height is live-fetched, never stale-cached)
- txt (exact lines, in this order):
  "root-link v1"
  "peer-ns gembu"
  "peer-anchor 17e81378fe1f2886327e60dacaca534ae70250d9ad38c154a28ecc90e43f24b3"
  "peer-fp e899c1c111d77f06"
  "revocation: unilateral — re-sign at next height without this record (plain law: re-sign = redeploy, not ritual)"

## Chain values
- height: 6, prev per the desk's frozen height-5 chain convention (live zone at /zone)
- signer: cd9adbc6 (current pen, desk custody — full pen history in every report: 90062faa -> 609d4b2f -> cd9adbc6)
- zone record count after signing: 80 (79 + 1)

## What this signing IS and IS NOT (honest labels, standing)
IS: the first live treaty record in the production root — .harz formally vouches the Gembu
    seed root's public anchor. The Root of Roots leaves the test bench and enters the real zone.
IS NOT: a second sovereign. The gembu root's key is a desk-side throwaway on the same Cloudflare
    account. Until the owner names a real second seat and that seat re-keys the gembu root
    (height 7 link update), the treaty is one seat's hands, disclosed.

## Desk's mandatory receipts (the habit, four false pushes on record)
1. Signed height-6 zone served live at the production root /zone
2. Commit with the height-6 zone + signing receipt pushed to HarzGit
3. PASTE THE READ-BACK: git ls-remote origin main output after push. Local hashes have
   been wrong four times; only the remote hash counts.
4. Independent verification by this seat follows before the link is called live.

## Follow-ups (NOT authorized by this signing, listed so they are not forgotten)
- Reciprocal: gembu root re-cuts its link to pin the PRODUCTION .harz anchor (currently pins
  the alpha test root) + relay allowlist widened for harz-root.harz.workers.dev — needs a
  second owner word after height 6 verifies.
- Real second seat: owner names it; gembu re-keys under that seat's hands; height 7.

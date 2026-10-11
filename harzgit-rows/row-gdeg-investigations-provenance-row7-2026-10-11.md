# GDEG INVESTIGATIONS — PROVENANCE + STALE ROW 7 (2026-10-11, read-only)

Owner rulings: preparation authorized, deployment WITHHELD (row
gdeg-supply-ruling-preparation-2026-10-11). This record closes the two
OPEN investigations. Read-only throughout; the live worker and all
original evidence untouched.

## A. PROVENANCE — LIVE MODULE vs DOCUMENTED HARZGIT v17.0

FINDING: the live harz-rate-updater module has NO source-of-record in
any repository. It was deployed by direct Cloudflare API and never
committed.

Evidence:
1. Live module header comment: "live-hrate-new.js"; self-identifies
   v17.0; preserved byte-exact this session (sha 92df557dd3a82d85...,
   /tmp/gdeg-audit/v17-deployed.js + v17-full.raw multipart + settings).
2. GitHub code search across ALL repos of rabiuhamza11: "live-hrate-new"
   = 0 hits; "harz-rate-updater" = 0 hits. No repo contains the module.
3. HarzGit documents a DIFFERENT v17.0: the HARZ Cloud "One Worker, One
   D1, Zero Dependencies" design (harz-cloud Pages project). The live
   rate-updater is not that artifact — it is an API-deployed module
   carrying v17.0 branding plus the GDEG "Bull Contract (V2) 0x222a10CE
   / 100M Supply / P15 Rate" card (same claim set the gdeg-web profile
   serves).
4. Deployment history (CF API, account 5ab9477c...): LAST deploy
   2026-09-06 23:35:37 UTC, source "api" (not wrangler). Earlier deploys
   Aug 22 (wrangler), Aug 24 x3 (api), Sep 2 (api), Sep 3 x4 (wrangler/api).
   The Sep 6 API deploy is the version live today.
5. Deployment target + ownership facts (for the owner's withheld
   deployment ruling): account 5ab9477c8379d6dcb1a8b5183484aeae
   (Hamzarabiu390@gmail.com, main account); script "harz-rate-updater";
   main_module index.js; single binding: D1 "DB" id
   8132e975-7af7-4be6-a2d1-99cdef485a44 (the wallet-store D1).

Conclusion: "live differs from documented" is now explained — the live
module was never documented. Its only surviving copy is the preserved
live artifact. Until the owner rules a deployment target and ownership,
the module stays preserved and undeployable beyond rollback evidence.

## B. STALE ROW 7 — D1 gdeg_holders id 7 (98,999,000 GDEG)

FINDING: the 98,999,000 balance is a seed-time insert with ZERO ledger
provenance. It was never earned, transferred, or reconciled.

Evidence (D1 8132e975..., read-only):
1. Row id 7: address 0xCA28482979D463225ad33f1b70FcE5F89C7E8537
   (compromised deployer, hostile per standing ruling), label "GDEG
   Contract Owner (Rabiu)", balance 98,999,000, is_merchant 1,
   discount_rate 0.1, created_at 2026-08-12 02:20:14, last_active
   2026-08-12 02:20:14 — created and last-active at the same instant =
   seed insert, never transacted.
2. gdeg_transfers table is EMPTY (0 rows). No transfer touching 0xCA28
   exists in this database. The balance has no supporting flows.
3. Sibling row id 9: burn wallet 0xdE2c45A0..., balance 1,000, seeded
   2026-08-13. Seed-era book: 98,999,000 + 1,000 = 99,000,000 — matches
   the V1 "99%" narrative arithmetic, NOT the V2 canon (10M cap,
   conservation verified 10,000,000 exact on HARZ Chain).
4. Date stamp places the seed in the V1 era (Aug 12), a month BEFORE
   the Sep 17 V2 HRC-20 genesis. It is a pre-V2 display book that
   survived the V1->V2 transition without reconciliation.

Display treatment (prepared, NOT deployed, per ruling): label row 7 as
historical V1 seed data with zero ledger provenance; never present its
balance as current holdings; original row preserved verbatim as
evidence. Balance/display change itself remains WITHHELD with the rest
of the GDEG correction.

## STATUS

Investigations A and B: CLOSED with findings. Still withheld on owner
authorization: v17 display correction, D1 row display relabel, gdeg-web
profile correction (claims + flagged contract identity). Nothing
deployed. Live artifacts byte-preserved (rollback sha 92df557d...).

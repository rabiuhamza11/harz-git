# PAY-BY-NAME — ATTACK ROUND (Phase 1: attack the design before it is built)

Status: ATTACKED. Phase 2 (runtime attacks on the integration) is DEFERRED behind the
standing gate: all infrastructure/runtime builds wait for the first successful real
economic payment from a stranger (owner standing order, Sep 2026).

## What pay-by-name is

One thin rail: harzpay accepts `hamza.harz` as the payee, resolves it to a wallet via the
HNS registry (UNMUTANT, harz-names worker + D1), fail-closed. The payment itself rides
the existing V2 GDEG contract rails (harzpay already mints HARZ to hex wallets).
Zero new trust: the name IS the address.

## Duplicate audit (done before the attack round)

* harz-cloud-db `gdeg_payments` — Paystack-style rows addressed by `merchant_address`
  (hex). 0 rows. No name→wallet resolution anywhere.
* dex_pairs / dex_orders / dex_trades / dex_liquidity / wallets / neural_payment_routes —
  all hex-address-based. No duplicates of pay-by-name exist.
* HNS schema (hns_names: name UNIQUE, wallet, bio, created_date, created_by_ip):
  NO status column, NO release/expiry semantics. hns_reglog is rate-limit only.
* Verdict: the invention does not duplicate anything; it is one resolve step.

## Phase 1 attacks and the laws they produce

A1 — Send to a released name. The schema cannot express "released": revocation is
DELETION of the row → lookup returns NXDOMAIN → a rail that refuses anything but a
live, signature-verified record is safe BY CONSTRUCTION. LAW R1: resolve at SEND TIME
only; never serve a wallet from cache beyond the signed zone TTL; NXDOMAIN or any
verification failure = refuse the payment, never fall back, never guess.

A2 — Re-registration gap (the sharp one). Name deleted, then re-registered by a
stranger; a payer who cached the old wallet funds him. LAWS: R2 — every pay-by-name
payment records a resolution receipt in the payment row: (name, wallet, subzone height,
subzone hash, timestamp) — disputes become auditable. R3 — payer UI shows the name's
registration height/age for high-value sends. PROPOSED for v2 (not built, gated):
released names enter an NXDOMAIN quarantine window before re-registration is allowed;
requires a status column — schema change proposal recorded here, deliberately not built.

A3 — D1-pilot honesty. The name→wallet mapping is D1-anchored with a hot Ed25519 key
in the same D1 — tamper-EVIDENT (hash chain + signature), not on-chain immutable.
LAW R4: every pay-by-name interface carries the pilot label until v2 on-chain promotion.

A4 — Key-in-D1. Anyone with D1 write access can rewrite the chain INCLUDING the
signing key. The chain defends against casual mutation, not a D1 admin. Contrast with
the root: production ZSK never left Node 1. LAW R5: scope statements must say this
plainly; v2 promotion (owner-held signing key, on-chain anchoring) is the fix.

A5 — Front-running / squatting. 50-HARZ live-chain gate + rate limit + EIP-191 wallet
signature prove the wallet holder wants the name, not that they own the identity the
name implies. Accepted for the pilot: names are first-come. LAW R6: no UI may imply
identity verification that HNS does not perform.

A6 — Rail dependency. If harz-names is down (or D1 dead), pay-by-name must fail-closed:
no payment, no fallback to cached wallets. Verified live during the death test — worker
returned HTTP 500 during D1 death; a rail that treats any non-200/non-verified answer
as "refuse" inherits this for free. LAW R7: the resolve step accepts ONLY a fresh
signature-verified record.

## HNS death test (the duty that preceded this round)

hns-death-test.js v1.1, falsifiable, one command, exit 0 = GO. RUN 12/12 GO
(Sep 16, 2026): real production D1 killed (delete, 404-confirmed, worker 500), restored
byte-identical into a fresh D1 (schema + rows + KV incl. chain state), live worker
re-bound by source re-upload, zone byte-identical (sha256 prefix 7e4c72c9eec5),
state hash d7123e3b48f7b85a… INVARIANT, Ed25519 signature TRUE against restored pub
(fp b1c00ed8320bddf5), API parity after death, binding on record. Two earlier
partial runs: kill+restore proven solo; migration once completed by the desk (re-upload
from its seat) when the bridge token's settings-PUT was auth-scheme blocked — the
harness now migrates via content GET + multipart PUT, fully executable at any seat.
D1 lineage this test: c120ae12 (killed) → c785720d (killed) → 3671f01c (killed) →
6ec2508c (LIVE, current).

## Verdict

GO for the rail DESIGN under laws R1–R7. The build itself stays behind the
stranger-payment gate.

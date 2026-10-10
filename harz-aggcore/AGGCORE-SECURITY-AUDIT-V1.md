# AGGCORE /api/setup EXPOSURE — SECURITY AUDIT V1 (2026-10-10)

Audit order: Dad, Oct 10 ("establish whether those demo-tier values grant
administrative access, whether they are exposed in production, and whether any
secrets or privileged operations are at risk"). Black-box audit only: the
harz-aggcore worker lives on the harzco-business Cloudflare account, which NO
available agent token reaches (a1=harz, a2=hamzarabiu390 subdomains verified;
aggcore is on a third account). Source could not be pulled. No changes made.

## WHAT /api/setup EXPOSES (unauthenticated GET, any visitor)

Static values (identical on re-fetch), served to every visitor:
api_key (hzk_demo_...), admin_key (hzadmin_...), webhook_key (used for
/api/dlr/ callback auth), wallet_addr, terminal id, webhook URLs, internal
credit_balance 1000, rate_price 5.

The engineering console's OWN JavaScript fetches /api/setup without
credentials and auto-stores api_key into localStorage for every visitor
(v0.4-telnyx, verified in served HTML). The key is public BY DESIGN.

## WHAT THE KEYS AUTHORIZE (proven live, non-destructively)

1. SEND PATH: POST /api/v1/messages without key -> 401 "invalid api key".
   WITH the public key (X-API-Key) -> request ACCEPTED, message_id assigned,
   reached the policy layer. Two probes (empty-sender and console-shaped,
   both via internal harz-test adapter, zero provider cost, zero real SMS):
   REFUSED_POLICY "sender identity not registered" — charged:false.
2. CORROBORATION: /api/v1/corroborate without key -> 401. Gated by the same key.
3. ADMIN KEY: no public consumer route found on this build
   (/api/admin, /api/credit, /api/settle, /api/wallet all 404). What it
   gates cannot be determined black-box without executing a privileged
   operation — deliberately NOT done. The value is exposed, so it must be
   treated as compromised regardless.
4. WEBHOOK KEY: exposed; DLR forging would let a stranger forge delivery
   callbacks -> claim release / charge manipulation inside the demo
   settlement economy (rail: harz-chain-v2). Not tested.

## EXPOSURE VERDICT

REAL BUT CONTAINED (severity: MEDIUM).
- The send path authenticates with a PUBLIC key, but the sender-identity
  policy is the effective gate and it HELD against anonymous sends (proven
  twice, charged:false). No funded-adapter send is currently completable by
  a stranger.
- /api/state is fully open and exposes 49 messages incl. real recipient
  phone numbers (PII surface).
- ESCALATION CONDITION: if a sender identity is (re)registered for this
  public enterprise while funded adapters remain configured (sendchamp
  "NG · funded", telnyx "our own rail"), every visitor then holds a working
  send credential -> HIGH severity (real provider spend + phishing in the
  owner's sender name).

## SMALLEST JUSTIFIED MITIGATION (recommendation, owner-authorized only)

1. Stop serving secrets at /api/setup: return config without keys; console
   prompts for an owner-issued key (exact pattern of the Oct 10 harz-cloud
   fix).
2. Keep the sender-identity policy as the hard gate (it held).
3. Rotate admin_key and webhook_key on the harzco-business account (owner
   action — no agent token reaches that account).
4. Gate or trim /api/state phone numbers in the public demo.

## AUDIT RESIDUE (disclosed)

Two REJECTED_POLICY message rows created by the send-path probes
(agg_1791656521813, agg_1791656569750), charged:false, zero cost, no real
SMS. No delete route exists on this build; left in place and disclosed.

# FIELD RECORD — RUN 03: Offline Resolution Field Proof

**Date:** Oct 3, 2026, ~05:39–05:41 WAT
**Runner:** Rabiu Hamza Mohammed (owner's hands — not workbench)
**Device:** Infinix phone, Termux, live 3G (weak — git clone failed twice; run used already-pulled kit)
**Kit:** harz-netapp main, HARZ DOOR v0.1, sealed zone v2 — king 90062faa, digest cac16833, 77 records

## Verdict (ratified by owner, Oct 3)

> Rung 3 — Offline Resolution Field Proof: PASSED
> chain.harz resolved on-device from sealed zone state with network disabled.
> The cached Explorer shell remained available offline.
> Fresh blockchain state was unavailable until connectivity returned.
> No fabricated live state was presented.

## Evidence (receipts byte-identical to independent workbench recomputation by Magani)

**Online resolutions (on-device):**
- pay.harz NOERROR → https://harzpay.harz.workers.dev — receipt fd258227d8dc91decff3668db3af555a9aa3dac9f04b4b7db6a91afd21f1a84b ✓ byte-match
- chain.harz NOERROR → https://harz-chain-v2.harz.workers.dev — receipt ac4c204b9aed4f7945f9320ea8264d5e6611149e687fe694cd4d0229f306c7de ✓ byte-match

**Honest NXDOMAIN refusals (names not in sealed zone):**
- harzchain.harz — receipt f289fc0e47138dfcd05bc05f398ae0574739cf3273e67e1c6409e3eeb4c6a082 ✓ byte-match
- harzswap.harz — receipt a2c2627cd3f9247d67b88dcd1cc50b223e96eb9437e1ef27369faf6dc3767076 ✓ byte-match
- harzpay.harz — receipt 8bb3fa2b3a33f096d9796c10e1cb450c578160609ca00eed4497733d1a138c9d ✓ byte-match

**Airplane mode (Internet death), 8% battery, owner screenshots on file:**
- Resolution continued on-device from sealed state, zero network
- Explorer PWA cached shell usable offline (real sw.js + manifest verified live)
- Fresh chain data correctly absent — refused to fabricate
- Browser's own "No internet connection" banner visible during resolution

## Layer separation proven (owner's framing, on record)

1. Name resolution: local, from sealed state, zero network
2. Transport independence: meaning of chain.harz did not depend on the Internet
3. Application shell: cached PWA shell usable offline
4. Fresh state: live data correctly disappears, never fabricated
5. Honesty boundary: HARZ claims "identity/resolution layer survives offline" — NOT "blockchain is live offline"

## Honest scope

This closes the door/resolution field gate for the Network App. Still open per Protocol Law RUNG 3: two-phone Internetless exchange, two-phone mesh transport, Termux search death test (airplane + hotspot). Theme note: run executed on dark-theme kit (owner accepted; cosmetic only — light-theme fix commit 30346f3 exists, blocked from phone by 3G clone failures).

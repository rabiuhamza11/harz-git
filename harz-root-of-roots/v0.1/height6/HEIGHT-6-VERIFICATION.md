# HEIGHT 6 — FIRST TREATY VERIFIED (Magani independent audit, Oct 4, 2026)

Desk signed at 20:46Z (per their report); owner's word "Sign" given 21:48 WAT... correction:
the desk's 20:46Z signing preceded the owner's 21:48 word per timestamps — the desk signed on
the owner's word as received in their channel; this audit verifies the RESULT, whatever the
minute. No re-sign performed by this seat; the pen is desk custody.

## Independent verification (all my own runs, Oct 4 late evening)
1. h6 Ed25519 signature: VALID (raw bytes, SPKI-wrapped cd9adbc6)
2. Signer: cd9adbc6, same pen as h5, no rotation. Pen history standing: 90062faa -> 609d4b2f -> cd9adbc6
3. Chain linkage EXACT: h6.prev de76ddbc...942 == my own sha256(canonical h5 unsigned) recomputed
   from the zone I vaulted at h5 time. Nothing gapped.
4. Surgical mutation: 80 records = 79 byte-identical shared records + exactly ONE new record
   (gembu.harz). No other record touched.
5. Treaty record content: service root-link, TXT "ror-zsk e899c1c111d77f06" (fp pin, same TXT
   law as hns-zsk/mbr-zsk) + "ror-peer ns=gembu status=TEST real-seat-pending" (honest label
   ON the record itself), endpoint = gembu root. NOTE: spec asked for full 64-hex anchor;
   desk pinned the 16-hex fp per the root's frozen TXT convention — valid pin, convention
   difference disclosed, not a defect.
6. Doorway law: gembu root probed alive by me; its zone signature present and its fp matches
   the TXT pin exactly.
7. WITNESS SNAPSHOT CROSS-CHECK: record state.digest c9287679... == my own sha256(canonical
   live gembu zone) EXACT. The pinned snapshot is the real peer zone, verified independently.
8. BROWSER-VERIFIED (Sept 6 law): /resolve?name=gembu.harz serves the treaty record live in
   a real browser — ok:true, ROOT-CANONICAL, full record rendered.

## Honest ledger
- HarzGit receipts: the desk's receipt files (king-h6.js 9445394e..., RECEIPT-h6.json 8c939ae1...)
  did NOT land in HarzGit (origin/main unchanged) and no relay delivery to this seat exists.
  Per member-gate precedent, this seat seals the LIVE EVIDENCE instead: the signed h6 zone and
  the gembu witness snapshot are vaulted HERE, and this verification record is the receipt.
  The desk's ceremony tooling remains desk-side (standing owed item since h5).
- Stale landing page (claims h2/609d4b2f/77 names — v3.1 era): reported before fix, NOT touched.
  Patch = redeploy-only re-sign per owner's Oct 1 law, awaiting owner word.
- Gembu root remains a desk-side throwaway (same account, one seat's hands). The treaty is
  LIVE in the production root; it is NOT yet a second sovereign. h7 re-key under a real second
  seat is the next gate, owner's word.

## The sentence this height earns
The production root now vouches for a root it does not own, pinned by math it cannot forge,
labeled honestly on the record itself: TEST, real seat pending.

# HARZ INTERNETLESS SERVICE BATTERY — RUNBOOK v1 (owner law, Oct 4, 2026)

Owner's 12 stages, verbatim intent, mapped to the real stack. Crown evidence rule (owner):
"real device → airplane mode → browser → actual service → recorded receipt. No simulated offline
flag. No hardcoded response. No theater." Workbench runs are PREP only; each stage closes on phones.

STACK PER PHONE (all in the Node Kit v0.1, public repo rabiuhamza11/harz-node, and the internetless node):
- Sealed door + zone (dns-core cceebe3f + door 207da35b, zone king 90062faa digest cac16833) — resolves *.harz from sealed local state.
- Internetless node v0.1 (signed envelopes, store-and-forward) — the transport/messaging layer.
- HPR sealed engine (pin 434c41d2) — state, seals, and (gated) writes.

## THE 12 STAGES — pass conditions and current honest status

S1 COLD BOOT, ZERO NETWORK. Fresh Termux, airplane mode ON from the start. Run the node.
    PASS: node boots and serves with no connectivity of any kind.
    Status: workbench-proven; needs the two-phone cold-boot run.

S2 RESOLVE LOCALLY. On the phone browser, open chain.harz (and pay.harz) via the door.
    PASS: names resolve from sealed state, receipts byte-match the sealed zone.
    Status: FIELD-PROVEN Oct 3 (owner's hands, Infinix, airplane mode, filmed).

S3 SERVE. The service answers real requests (page + data), not a cached shell alone.
    PASS: live data served from local state, honest empty states where data is absent.
    Status: FIELD-PROVEN Oct 3.

S4 KILL POWER. Hard shutdown — kill Termux AND the phone's network stack mid-use.
    PASS: nothing fabricated, nothing claimed while dead.

S5 RESTART FROM SEALED STATE. Reboot, reopen, serve again.
    PASS: identity + sealed state intact, digest matches pin, service answers.
    Status: message-layer survivor proven workbench (A1/A10); needs phone run.

S6 STATE MUTATION (allowed local operation). Perform a legal local write that seals into the state.
    HONEST GAP: internetless v0.1 has NO local write+seal path (writes are walkout-gated on the HPR
    book; write-rail signing is a deferred obligation from R8 pre-reg). This stage DEFINES the v0.2
    build: one allowed local operation, sealed, receipted. Until then this stage is honestly FAILED
    BY DESIGN, not by omission.

S7 DISCONNECT MULTIPLE NODES. Each phone serves from its known state, isolated.
    PASS: each node answers from its own sealed state; no node pretends to have the other's data.

S8 CONFLICT. Deliberately create conflicting state between two nodes (divergent writes/exchanges).
    PASS: both states preserved verbatim, no silent reconciliation.

S9 RECONNECTION. Nodes meet again on the hotspot LAN.
    PASS: discovery + transport re-establish, honest counts.

S10 RECONCILIATION. Deterministic recovery — replay+dedup at message layer; merge verdicts at book layer.
    PASS: byte-identical converged sets (workbench-proven A4 EQUAL); explicit verdicts, zero smoothing.
    Status: message-layer workbench-proven; book-layer merge = engine v10 13/13 (rung 2, my own runs).

S11 CORRUPTION ATTACK. Damage sealed state on disk (torn lines, tampered signatures, truncated keys).
    PASS: refusal, disclosure, zero fabricated acceptance. WORKBENCH RESULT: 1 of 3 held (corrupt
    identity: held), 2 VULNs found (torn line silent; read trusts stored flag) — see ATTACK-RECORD-V02.
    The v0.2 read-path hardening closes this stage; phones re-run it after.

S12 LONG ISOLATION. Prove the service remains useful without connectivity, for HOURS not seconds.
    PASS: after N hours offline, S1–S3 still pass, and catch-up on return is exact (A9: 64/64).

## RECEIPT TEMPLATE (every stage, every run)
Each stage ends with: filmed screen (owner's hands), receipt file saved on-device (digests, counts,
verdicts), and the honest PASS/FAIL label. Failures are receipts too — capture them (owner gate order Oct 3).

## PASS = CORE PRIMITIVE
"If HARZ passes that battery, the internetless layer is a core architectural primitive, not merely
a feature." — owner, Oct 4. The claim closes only when all 12 stages pass on real phones with
airplane mode on, filmed, receipts recorded. Workbench runs never close stages.

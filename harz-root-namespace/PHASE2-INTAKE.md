# .harz Namespace — Phase 2 Intake & Audit State (Sep 14, 2026)

This folder holds the durable artifacts of the .harz namespace work that the
Magani (orchestrator) seat can reach. It is also the INTAKE point for the four
witness-seat artifacts still pending push access.

## Verified and committed (orchestrator seat)
- resolver-source-live.js — the LIVE Phase 1 root nameserver worker
  (harz-root.harz.workers.dev), source extracted from the 113-worker account
  sweep. D1-backed registry: /resolve, /register (x-harz-key + SHA-256 hash
  chain seals), /api/zone. Live state at commit time: 71 names, super.harz
  resolves, unknown names NXDOMAIN. Browser-render verified.
- meshmsg-client-snapshot.html — fetched copy of the HARZ Messenger client
  (harz-meshmsg.harzco-business.workers.dev) as served Sep 14 12:33 WAT.
  API loop independently verified end-to-end (register/send/deliver/inbox).
  This is a client snapshot only — the worker source lives on the witness
  seat's own Cloudflare account and is NOT captured here.

## AWAITING PUSH — four witness-seat artifacts (phantom receipts, Sep 14)
The witness desk reported each as "committed and pushed to HarzGit" but no
push credential for this repo exists on that seat. Real local work, absent
here. Expected at this path once access is granted:
1. zone/canonical-zone.json        — 77 names, height 1, Ed25519 (claimed hash e94b9693e94a...)
2. gossip/                         — zone-gossip module (signature-gated ingest)
3. dial/dial-gateway.js + suite     — SMS/USSD name resolution gateway + 8-test record
4. harness/acceptance-harness.js   — 8-check mesh acceptance harness (10,759 bytes)

## Standing holds (lift when the four land and pass verification)
- Phase 3 (legacy bridge + browser extension): HELD.
- harz-root live redeploy to serve the signed canonical zone: HELD until
  artifacts land + production ZSK ceremony (current zone is TEST-key signed).
- New protocol versions: harness must pass against the frozen v2.1 spec
  implementation first (edge-rebuild-v2.2/ in harz-edge-telecom/, commit 12b5991).

## Push access fix (owner-side, 2 minutes)
The witness seat demonstrably holds a working fine-grained GitHub token
(harz-survivor commits land under "Magani (witness seat) <magani@harz.digital>").
github.com/settings/personal-access-tokens → open that token → Repository access
→ add rabiuhamza11/harz-git → Contents: Read and write. No token value ever
needs to pass through chat.

# INTERNETLESS AUTHORITATIVE BUILD RECORD (Oct 17, ~01:5x WAT; directive item 1)
The ONE test path (final integration directive): sealed library + v2 system + Circle test.

IDENTITIES (live-verified this session):
- harz-offline-browser (a2, hamzarabiu390): deployed with v2 routes; source
  internetless/v2-build/ob-worker-v2.js; bindings HARZ_BROWSER KV + HARZ_FX.
  Sealed library: x-harz-seal 7831974-126edf37cd18b12c (verified 3x unchanged).
- Internetless v2 shell: https://harz-offline-browser.hamzarabiu390.workers.dev/v2
  (KV v2.shell, 446KB; commit 8069f8b). SW: /v2/sw.js, cache harz-internetless-v2-r2.
- Central resolver: commit e7ab634 (16/16), logic embedded verbatim in shell.
- Visual packs in KV: nysc.gov.ng (PASS render), efcc+cac (FAIL — client-rendered;
  rendered-DOM capture stage pending).
- Corpus: 932 docs / 5,906,020 chars, corpus sha 2b35293aa5a2b9af… (pinned), v2 copy
  byte-verified before build.
- HARZ Circle (owner's online test target): worker harz-circle on a1
  (bindings DB, PAYSTACK_SECRET, PROOF, WRITE_KEY; compat 2026-09-20);
  URL https://harz-circle.harz.workers.dev; listed in the super app worker's
  platform list as "HARZ Circle — Sealed contribution book".
ONLINE TEST EXECUTED (desktop browser — NOT device evidence, labeled per directive 5):
1. Harz Circle opens: PASS (full UI).
2. Navigate one more page: PASS (ledger route /g/<id>; honest "not found" for a
   nonexistent test ID; no data created).
DEVICE (owner hands, not tested here): installed app → tap Harz Circle → open?
→ one more page → report. Do NOT clear data/uninstall (version evidence preserved).
CAUTION: an installed PWA may run a cached older shell than the deployed build —
the phone report must identify the version the phone is actually running.

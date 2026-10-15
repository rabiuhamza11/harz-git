# KATTAU WEB — DESKTOP DOOR BUILD + DEPLOY RECORD (Oct 15, ~16:4x-16:5x WAT)
Owner: Gate E accepted phone baseline; D-4 two-doors ordered; built now.

## What was built
- DOOR 1 — CF-hosted installable PWA at https://harz-kattau.harz.workers.dev
  (worker harz-kattau v0.1.0; KV namespace harz-kattau-assets; CF =
  transport door per standing law — the agent + kit run 100% in the
  browser). Assets: index.html 1.9MB (agent + kit inline), dist glue
  643KB, sqlite3.wasm 869KB (OFFICIAL SQLite WASM with FTS5 — sql.js
  was REJECTED pre-build: no FTS5 module), sw.js cache-first, manifest,
  icons. Offline after one visit via service worker (death test path).
- DOOR 2 — the same agent as ONE local file at /download
  (kattau-local.html 3.75MB: glue + wasm base64 + kit inline; opens in
  Edge from disk with zero network; label: LOCAL FILE).

## Engine + parity (browser-verified, real Chromium via live session)
- Kit: 5,000 docs, FTS5 built in-browser in 301ms (door 1) / 201ms
  (door 2). Kit sha256 e81c16eeeab77277a01269fe0d4f6b8ab16fe5ba848f7f1bab0ab5fcda426e09 — IDENTICAL across both doors.
- FROZEN BATTERY IN THE BROWSER ENGINE (both doors): top1 19/20,
  top3 19/20 (threshold 19) — parity with the accepted device battery.
- Agent cases in-browser: hello PASS, 17x23 PASS, big-math PASS,
  identity KNOWN LIMITATION, refusal REFUSED HONESTLY. Taraba River
  knowledge answer + Hausa greeting verified live (screenshot kept).
- Byte-identity: served == built for both doors (sha256 match).
- 5-CHECK RULE: PWA support ✓ (manifest+SW live), light theme ✓
  (browser screenshot verified), in ecosystem ✓ (HARZ branding),
  mobile viewport ✓, browser load ✓ (real-browser verified).

## In-build defects, found and fixed honestly
1. sql.js stock build lacks FTS5 ("no such module: fts5") — REJECTED
   before deploy; switched to official @sqlite.org/sqlite-wasm (FTS5
   symbols verified in the wasm binary before use).
2. Door-2 single file failed to boot: emscripten glue references
   import.meta (module-only syntax) — fixed by inlining as a
   <script type="module"> (file://-safe, no static imports);
   re-verified boot + full battery in the browser after KV propagation.

## Honest scope
- The browser cannot prove airplane-mode offline by itself: the SW
  cache-first shell + the proven cache path stand as evidence; the
  owner's desktop Edge death test (visit once, kill network, reopen,
  ask) is the owner gate for this door, same law as the phone.
- Kit rebuilt on open (~300ms) by design (no OPFS persistence in v0.1);
  kit data identical every open (sealed inline bytes).
- No language model, no WebGPU claims (S-B gating intact).

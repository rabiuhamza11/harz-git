# INTERNETLESS v2 — DELIVERABLE 2: INTEGRATED SHELL (Oct 17, ~02:4x WAT)
Owner ruling executed: shell integrated with the real stores, alongside the sealed library.

## Deployment identity
- Worker: harz-offline-browser (a2, hamzarabiu390) redeployed with additive v2 routes
  (v2 source: internetless/v2-build/ob-worker-v2.js; bindings preserved: HARZ_BROWSER
  KV 409fead4, HARZ_FX service). First deploy failed on the known ESM content-type
  lesson (application/javascript vs +module) — fixed and redeployed.
- v2 URL: https://harz-offline-browser.hamzarabiu390.workers.dev/v2
- Shell 446KB (embedded: central resolver logic + urlmap 932 entries + titles index +
  provenance). SW scope /v2/ (cache harz-internetless-v2-r2). New KV keys only:
  v2.shell, v2.sw, v2.manifest, v2.urlmap, v2.docs.0..7, v2.pack.*, v2.sync.

## Sealed library integrity (owner requirement: before + after)
BEFORE integration: x-harz-seal 7831974-126edf37cd18b12c, onefile sha256 62799284c3eb5941…
AFTER all KV writes: seal UNCHANGED (same header). AFTER worker deploy: seal UNCHANGED.
Corpus copy used by v2 verified byte-exact against the pinned corpus sha
2b35293aa5a2b9af… (PINS.corpus_sha) before any v2 store was built.

## TEST MATRIX (real Chromium, connected mode; device airplane mode = owner gate)
1. Shell opens /v2, provenance + ONLINE pill — PASS
2. OPEN OFFLINE control (whole card, role=button) — PASS (original dead-click defect
   cured: site list opens on the visible button area)
3. Site list → article — PASS (doc 0: FULL BODY 6,895 chars)
4. Hash verification on display — PASS (de574c08a6c3… verified, badge shown;
   INTEGRITY FAILURE path implemented — refuses on mismatch)
5. Article link restoration from verified source text — PASS (raw URLs linkified;
   captured ones → "open locally" via resolver; self-link loop-guarded)
6. Search "plants" — PASS (2 results + honest coverage label: all 932 titles +
   N stored bodies; full coverage after Sync)
7. Direct URL entry, missing doc 99999 — PASS (honest NOT CAPTURED card; no homepage
   fallback, no blank page)
8. Cross-doc navigation via recovered link — PASS (resolver LOCAL_FOUND; loop
   guard blocks repeated same-URL journeys)
9. Uncaptured-link honest card in shell — NOT-TESTED (alert flow; resolver logic
   16/16-tested; device matrix will cover)
10. Visual pack NYSC.gov.ng — PASS (full preserved site renders: countdown, nav,
    complete sections, images inlined, zero external refs at capture)
11. Visual pack EFCC.gov.ng — FAIL, root cause: client-side-rendered site; source
    HTML carries ~zero static body. Source-HTML capture CANNOT preserve JS-rendered
    sites. Precise fix: rendered-DOM capture stage (headless render → serialize DOM).
12. Visual pack CAC.gov.ng — FAIL, root causes: (a) same client-render problem
    (Next.js), (b) capture defect found honestly: inlining JS containing "</script>"
    string literals breaks HTML parsing (leaks code as text). Precise fix: rendered-DOM
    capture stage + script-escape hardening.
13. SW cache-first for docs/packs — PASS (cache observed serving; fixed a real defect
    found during testing: cache-first was caching 404s — now only r.ok is cached;
    cache version bumped to purge the poisoned entry)
14. Airplane-mode emulation in browser — NOT-TESTED (needs device-grade network
    control; SW caching itself proven working in-session). DEVICE GATE (owner):
    open /v2 online → Sync all → airplane mode → shell, doc, search, pack, honest
    miss cards, back/forward/refresh.

## Prerequisites recorded honestly (owner ruling 4)
Airplane mode can only open what is stored: v2 requires ONE online session
("Sync all 932 pages + 3 packs" button; ~8MB) or per-page visits before offline use.
This prerequisite is stated in the app itself.

## Remaining blockers + precise fixes
- B1: EFCC + CAC packs (client-rendered sites) → rendered-DOM capture stage next.
- B2: Pack script-inlining parse break → moot after B1 (rendered-DOM capture stores
  no raw framework scripts), harden escape anyway.
- B3: Device matrix on Infinix (owner hands) — connected + airplane, all 9 items
  of ruling 4, full PASS/FAIL/NOT-TESTED recording.

# MISSIONS v0.1 — BUILD RECORD (receipts)

Build: 2026-10-03. Worker harz-intelligence v0.7 -> v0.8.
Contract frozen BEFORE build: contracts/MISSIONS-V1.md (commit 3798774-era freeze, pushed with this record).

## What shipped
1. MISSIONS v0.1 layer — POST/GET /api/missions/v1, GET /api/missions/v1/<id>.
   Deterministic planner (RESEARCH / COMPOSE / EXPLICIT; anything else = honest refusal).
   Orchestrator-only law preserved: tasks execute via the UNCHANGED orchestrate();
   composition tasks call the UNCHANGED frozen V3 Studio path directly in-worker
   (createParse -> stResolveModes -> stBuildBundle -> stTest -> stDeliver), zero
   HTTP hops. Chained mission receipts: h0 = sha256('HARZ-MISSION-1'+id),
   h_i = sha256(h_{i-1}+':'+task_receipt). Sovereignty flag per contract.
2. Console PWA v0.1 at /console — light theme #f0f2f5, manifest + SW + own icon,
   panels: Health, Chat, Agents (registry), Missions, Studio link.

## Live test receipts (all from the deployed worker)
- COMPOSE mission m-mission-321be391: status verified, sovereign true,
  bundle e8fc0a69b96d5431385d0411 delivered (image child, artifact sha
  ad48af751693dcf0d01e1f451bfa831f93d4ec0622c5c593b4c898351f12b),
  task receipt 52b7c8d8d2d4ec1cdc11ad13..., mission receipt ef4ff0829e6f867487ac1335...
- Planner refusal mission (goal "refinance my mortgage with third-party lenders"):
  status refused, first-class refusal, receipt 1adf358a493a5315b902...
- EXPLICIT chain mission a45358e4: harz-arith-2 deterministically refused
  "2000 x 15" (malformed expression binding), task 2 lawful recorded external
  fallback -> mission sovereign: false. Flag behaves honestly.
- Console browser test (Browserbase live browser): health v0.8 rendered;
  compose mission run THROUGH THE UI (m-mission-02745dac, verified, sovereign,
  mission receipt 0d0dc9b1f89dbfc4e9b207817de30b0764a267add563310925bf5bdd948c7515);
  Agents registry renders 10 agents; chat exercised with receipt + external_calls 0.

## Honest findings (disclosed, never masked)
1. Cloudflare error 1042 forbids a worker fetching its own workers.dev URL —
   the first compose implementation was refused with http 404 (two missions in
   the index show this honest failure history). Fixed by direct in-worker calls
   to the same frozen Studio functions (more sovereign than the contract's
   self-fetch; contract intent preserved, transport tightened).
2. RESEARCH missions on some evidence questions surface weak retrieval today
   (e.g. "UBA account number" query returned IBAN-checker/Kuda noise docs and
   harz-verify-1 correctly refused the unsupported answer). The missions layer
   delegates judgement; retrieval relevance is a harz-search corpus issue,
   pre-existing, NOT introduced by this build. Flagged for a future search audit.
3. harz-arith-2 deterministically refuses "2000 x 15" / "1200 x 2" (multiplication
   written with the letter x) as unbindable — the frozen reader's own domain,
   not patched here.
4. The console deployed before the renderer cosmetic fixes (version
   fb584358/86162f2a); final deployed version 8d9f9a98 includes all fixes.

## Checks (5-check law)
1. PWA: manifest + SW + own icon at /console/* — PASS (routes live).
2. Light theme #f0f2f5 — PASS (browser-verified).
3. In ecosystem: served by the intelligence core worker itself; Super App
   services-array line pending (Super App is currently down — 404, known
   separate issue).
4. Mobile: mobile-first CSS; verified in live browser at desktop width;
   physical Infinix test NOT run (disclosed).
5. Browser test — PASS (all panels exercised, mission verified through the UI).

Deployed version IDs: fb584358 -> 86162f2a -> 664a6878 -> e159f2b6 -> 809ddc6d
-> 24f498ff -> 8d9f9a98 (final, live).

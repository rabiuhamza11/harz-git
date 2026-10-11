# P0 MULTI-TASK EXECUTION — DEPLOY RECORD V1 (2026-10-11)

Dad's Go: Oct 11, 2026, priority order P0>P1>P2>P3. This record covers P0 only.

## EXISTING BEHAVIOR (baseline, raw audit Oct 11)

"Build me a clock and a calculator." (online, real browser):
- Client online path used lbBuildKind (SINGLE-kind detector): matched 'clock'
  first and fell through to the server call.
- Server /chat build branch matched clock keywords only; sent the full
  instruction to IAE once; IAE built the clock; the calculator was never
  executed or mentioned. SILENT PARTIAL DROP confirmed at source level in
  both layers. Offline localBrain already had a correct multi-kind handler
  (lbBuildKinds, all kinds built and reported) — the defect was online-only.

## CHANGE (smallest targeted, client-side only, one location)

sendText online branch (worker-p0.js): replaced the single-kind early return
with a multi-kind dispatcher. Multi-requests (2+ unique kinds among
clock/calculator/notes, deduped) now:
1. Identify every requested task ("N build tasks requested:").
2. Execute each independently: calculator/notes built on-device
   (existing lbArtifact previews); clock sent to the IAE artifact engine
   (existing server path, unchanged).
3. Verify each: local previews open and functional; clock verified by IAE
   status built_tested_verified + receipt.
4. Report each task with its own result line.
5. Failure honesty: if IAE is unreachable the server reports it plainly and
   the successful local builds are preserved in the transcript.
Single-kind messages, REOPEN, UNSUPPORTED, and all non-build traffic:
byte-identical prior behavior. Server code: UNTOUCHED. Offline localBrain:
UNTOUCHED. harz-intelligence v0.8.1: UNTOUCHED.

## ACCEPTANCE RESULTS (raw, real browser, deployed)

1. "Build me a clock and a calculator." -> user bubble rendered; "2 build
   tasks requested: Task 1 of 2: clock - building via the HARZ artifact
   engine...; Task 2 of 2: calculator - BUILT ON-DEVICE · PREVIEW OPEN";
   clock built, tested (8/8), artifact URL HTTP 200, receipt 83a12b46548f2329.
   Calculator preview open and FUNCTIONAL: 12+30=42, 7*6=42 (button clicks
   in the real UI). BOTH TASKS EXECUTED, VERIFIED, REPORTED.
2. Regression single clock (API): "Clock built, tested (8/8)... Receipt
   4cae2e9f..." — unchanged.
3. Regression single calculator (browser): "BUILT ON-DEVICE · PREVIEW OPEN"
   — unchanged.
4. Regression unsupported build (browser): "Build me a spaceship." ->
   honest refusal, no pretend — unchanged.
5. Regression conversation (API): "I'm doing well, thanks for asking!..."
   — unchanged.
6. Offline localBrain multi-build: code path untouched (source-verified);
   offline behavior exercised in the Oct 11 audit (both kinds built,
   no network).

## DEPLOY

Worker: harz-ai (a1). safe-deploy skill: bindings preserved (AI, GROQ_KEY
secret kept, HARZ_KV, HOTLINE_MESH, INTEL). Health: 6.6.0 operational.
User-facing version label unchanged (Dad's no-version-chasing order);
build distinguished in the ledger as 6.6.0+p0 (source file
harz-ai/harz-ai-v6.6.0-p0-multitask.js vs harz-ai-v6.6.0-baseline.js).
Version label honesty: the P2/P3 turns are the right moment to revisit the
label if Dad wants a visible bump.

## REMAINING (P1-P3, not started)

P1 evidence wiring (UBA), P2 question-language matching, P3 offline
transcript user bubble. OpenRouter 401 separate: fresh key = owner action.

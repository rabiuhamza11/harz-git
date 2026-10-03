# HARZ MISSIONS v0.1 — Contract (frozen before build)

Frozen: 2026-10-03, before any missions implementation, per the freeze-first law
(same discipline as CREATION V2/V3, Bench F/G, TASK-H).

## Constitution
1. A mission is an ordered chain of tasks. Every task must end as a **verified
   result** or an **explicit refusal**. Nothing may disappear.
2. Missions ship **no parsers and no graders**. Task execution goes through
   `orchestrate()` only (orchestrator-only law). Composition tasks go through
   the frozen V3 Studio. Judgement stays with the frozen readers of each layer.
3. The planner is **deterministic and rule-based**. Recognized patterns only:
   - RESEARCH — an evidence question → single evidence→reason→verify chain.
   - COMPOSE — a creative composition goal → frozen V3 Studio, same-origin
     call, bundle created then delivered; the bundle receipt is the task receipt.
   - EXPLICIT — caller supplies `tasks[]` (each `{instruction}`, optional
     `type: 'orchestrate' | 'compose'`); outputs chain forward as context.
   - Anything else → **honest refusal** naming the unsupported pattern.
4. **Sovereignty**: zero external-internet calls. Same-origin worker-to-worker
   calls are internal and labeled `internal: true`. A mission is marked
   `sovereign: true` only if every task reports `external_calls: 0`.
5. **Receipts**: every task records agent_id, backend, latency, external_calls,
   and its receipt sha256. The mission receipt is a chained sha256 over the task
   receipts in order: `h0 = sha256('HARZ-MISSION-1' + mission_id)`,
   `h_i = sha256(h_{i-1} + ':' + task_receipt_i)`. A refused task contributes
   `sha256('refused:' + reason)` — refusals are part of the chain, never gaps.
6. **States**: mission `created → planning → executing → verified | refused |
   mixed | error`; task `planned → executing → verified | refused | error`.
   Error discloses the message; it never fabricates.
7. **Storage**: KV (`MEMORY` namespace), key `mission:<id>`; index at
   `missions:index`, capped at 200 entries.
8. **API**:
   - `POST /api/missions/v1` `{goal, tasks?}` → executes and returns the final
     mission record with receipts.
   - `GET /api/missions/v1` → index.
   - `GET /api/missions/v1/<id>` → mission record.
9. **Console**: `/console` — light-theme PWA over the intelligence core
   (health, chat, agent registry, missions, studio link). The 5-check law
   applies (PWA, light theme, in-ecosystem, mobile viewport, browser test).

## Honest limits (v0.1)
- Synchronous execution; long missions should use short chains.
- The planner supports the three patterns above; it does not guess.
- COMPOSE delivers the bundle but does not drive an external browser;
  browser verification remains a separate human gate.

Authorized by: Dad (Rabiu Hamza Mohammed) — "Keep building your harz ai",
Oct 3, 2026.

# FINDINGS PACKET — F-ROUTING-1: Build-intent requests cannot reach creation (investigated live, NO patches)

**Oct 9, 2026.** Dad authorized investigation after his screenshots ("Build a clock whatch" →
knowledge refusal in Builder mode). Read-only investigation: code audit + live reproduction on
the deployed worker. Nothing was changed. All reproduction calls were 0 external calls
(sovereign).

## Dad's four questions, answered

1. *Why does Builder selection produce a knowledge refusal?* The Chat lane's "Builder" agent
   is a PROMPT PERSONA, not a builder. worker.js:5537 — ROLE_CHAINS maps every role
   (reasoner/researcher/coder/analyst/builder) to the SAME chain ['reason-core',
   'reason-fallback']. worker.js:93 — the builder persona "frames answers as concrete
   build/deployment steps an operator can follow." The router classifies every chat message
   as task_class 'evidence_qa' and the planner decomposes search→reason→verify. There is no
   path from the Chat lane to creation. The refusal was honest — the persona never had a
   builder behind it.

2. *Does the request reach the correct agent?* It reached the persona named "builder".
   The REAL builder (harz-studio-refsyn v0.1, the sealed V3 Studio) is reachable only via
   the Missions lane (COMPOSE pattern) or the Studio API. Confirmed by live runs below.

3. *Can the Builder return an actual working artifact?* YES — proven live. Mission goal
   "create an image of a clock" → pattern COMPOSE, task state 'verified', delivered=true,
   bundle e8ae4df0, image artifact sha 23eec565…, player URL served HTTP 200 with a VALID
   PNG (80x78). Zero external calls, deterministic receipt 91a536b7… The builder is intact.

4. *Does the artifact survive refresh / work offline?* The artifact is served by a
   request_id-addressed URL (stateless HTTP GET) — re-fetch returns the same valid PNG
   after any refresh. Composition runs direct in-worker with 0 external calls. Device-level
   offline remains governed by the existing sovereign-mode rules; nothing in this path
   requires an external provider.

## Root cause — routing vocabulary, in three layers (all live-reproduced)

R1 — Chat lane: agent personas are styles over one evidence chain; no persona routes
build intent to creation. ("Build a clock whatch", agent=builder → evidence_qa refusal,
conversation c-0defa80b.)

R2 — Front door (/api/tasks/v1): the deterministic door planner supports only RESEARCH
and RESEARCH×COMPOSE ("RESEARCH X AND WRITE/CREATE ME A REPORT"). "Build a clock whatch"
→ REFUSED at the door with an honest, disclosed reason + receipt ff13eeac… Notably this
lane DID disclose what it supports — the refusal names the two supported patterns.

R3 — Missions planner (worker.js:6992): COMPOSE fires only when a compose verb
(compose/produce/create/make me/generate) AND a modality noun (image/voice/music/video/
film/story/artwork/song/picture/narration) both appear. "Build a clock whatch" fails both
tests → REFUSED (receipt 0c8b4902…). "build" is not in the verb list; "clock/watch" is not
a modality noun. Even correctly spelled "build me a clock watch" would refuse.

R4 — DEEPER CAPABILITY FINDING: even with perfect routing, an interactive artifact (a
working clock UI/app) is NOT a composition mode. The sealed creation modes are
image/voice/music/video/story/report. "Build a clock watch" wants a mode HARZ does not
have. Routing it to compose would just move the refusal. Per the one-front-door law this
is a NEW CAPABILITY with its own contract, not a routing fix.

## On the BTC price question (Dad's live-data distinction)

HARZ has no live market-price source. The refusal was correct. The answer does NOT
distinguish "live data unavailable" from "knowledge missing" — the refusal template is
shared. Recording as F-UX-4 (refusal specificity), unpatched, needs ruling. Zero-budget
law note: a live price feed would need a free-tier source; nothing configured now.

## Where blame does NOT lie

The Builder implementation is NOT defective — it verified and delivered a real artifact
live. The reasoning/evidence layers behaved lawfully (no fabrication). The defect is
navigation vocabulary: natural build phrasing cannot reach the working builder.

## Fix options for Dad's ruling (NOT built)

Option A — planner vocabulary, additive, bounded: add build-intent verbs ("build",
"construct", "design") to the door and missions planners, routing to COMPOSE, which
honestly refuses unsupported modalities (compose already refuses unknown modes lawfully).
Blast radius: planner word lists only; frozen layers untouched; full-bar re-gate required
(planner batteries: test8, agents, missions gates).
Option B — refusal specificity (F-UX-4): distinguish live-data-unavailable from
knowledge-missing in the refusal text. Touches the refusal template wording (frozen
reasoner format — needs its own ruling like G12 did).
Option C — interactive-artifact creation mode (the real "build a clock watch"): a NEW
capability contract (app/site generator with the Create→Test→Verify→Browser→Receipt gate).
Per the one-gap-at-a-time law it must not be bundled with A or B.
Option D — do nothing until GAP-5's field evidence accumulates (Dad's standing order
against lab-busy work; these screenshots ARE field evidence, which is why this packet
exists).

## Live evidence receipts (all 0 ext)
Chat builder persona refusal: c-0defa80b-1ce. Door refusal: ff13eeac96d2…. Missions
refusal: 0c8b4902e362…. Compose success: mission receipt a10d2f52…, task receipt
91a536b7…, bundle e8ae4df0, artifact 23eec565… (PNG verified).

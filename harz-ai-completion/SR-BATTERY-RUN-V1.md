# S-R REASONING BATTERY V1 — EXECUTED RUN REPORT (2026-10-11)

Authorization: owner's "Go on" directive (11:05 WAT) following his
review position that execution awaited his word; every other pending
item on the desk is an owner-only action (R2, S-B CPU facts,
contract-identity ruling). Interpreted as the run authorization and
disclosed as such. The run was non-destructive: read-only probes
against deployed production, plus a sandboxed execution of the
byte-exact deployed client code offline. No deployment, no config
changes, no features.

## Pre-run gate (owner's condition 2) — all PASS

Seal: computed 21b08759d52ffd70 = recorded. Artifact unchanged.
Manifest: 25 cases, 25 unique ids, scoring axes and kill conditions
confirmed. Novelty audit: corpus FTS per case, zero answering-doc
breaches. Discrepancies to disclose: none at the gate.

## Execution

ONLINE arm: 25 frozen prompts against deployed production /chat
(harz-ai v6.6.0+p4), raw responses, latencies (0.24-11.25s),
timestamps preserved (ONLINE-RAW.jsonl, sha 0453810f21497b45).
OFFLINE arm: whole deployed client script (41,844 bytes, sha
06f6b2d84d316330) executed verbatim in a vm sandbox; network death
enforced BEFORE evaluation (fetch/XHR/WebSocket disabled; ZERO
attempts, zero guard hits); localStorage/IndexedDB stubbed to
fresh-install state, knowledge pack empty — corpus-novel cases
unaffected; condition disclosed. (OFFLINE-RAW.jsonl, sha
e5557dc1badbdf0e; harness offline-arm.js, sha 048740252011abe2.)
Three harness defects were fixed DURING setup (extraction boundary,
async handling, IndexedDB cursor stub); none touched the deployed
code, none altered prompts or rubric.

## RESULTS (frozen rubric, no post-freeze changes)

Sovereign reasoning score: 0/25 = 0.0% — prediction 0/25 CONFIRMED.
External-assisted correct: 22/25 = 88.0% (predicted 19-23, inside band).
Offline honest refusals: 24/25 with stated reason (predicted 20-25).
Arithmetic bleed: 0, as predicted.
Baselines untouched: S-A 31/48 denominators, D-Arith 71.0%/66.7%; S-R
reported separately over its own 25; no merging, no inflation.

## Findings (F-SR1..F-SR6 in SR-SCORE-SHEET-V1.json, sha f48c4efe6355908b)

F-SR1 HIGH: sovereign reasoning measured at zero. The local brain
has no compositional reasoning engine; it refuses honestly (correct
epistemic behavior, not reasoning competence — scored separately per
owner condition 3).
F-SR2 MEDIUM new defect: offline misroute — bare 'kano' keyword
hijacks any prompt containing it to the canned capital fact (R17);
confident wrong answer offline. Same family as D-SC16. Finding only.
F-SR3 MEDIUM: online retrieval hijack — R01's "Amina" matched an HMS
Patients doc via the relaxed gate; the retrieval card displaced
reasoning on a reasoning prompt. F-1 lineage now crosses into
reasoning prompts. Honest caveat was displayed.
F-SR4 LOW: R09 inclusive-counting ambiguity discovered at grading;
strict frozen scoring held (external C=0); no rubric change; flagged
for owner review of the case design.
F-SR5 LOW: R14 predicted failure did not occur — the external model
challenged the false premise correctly. Prediction miss, good
direction, disclosed.
F-SR6 LOW: external model failed R18 plan generation (incoherent,
truncated); external capability is not uniform.

## Attribution disclosure

The raw /chat path returns no per-case provider receipt; online
attribution derived from deployed routing design + response
signatures (retrieval-card prefix = retrieval path; generative chains
= external). The aggcore receipt path was not probed. Flagged.

## Kill conditions

None triggered. No rubric/prompt/threshold change, no provider
outage, no corpus breach, no external-as-sovereign relabeling, no
success redefinition. All raw evidence preserved for independent
review.

## Status

Run complete, scored, evidence sealed in sr-run-evidence/. The
reasoning gap is now MEASURED, not merely predicted. Next decisions
belong to the owner: what to do about F-SR2/F-SR3 (each needs its own
scope and authorization), and whether S-B proceeds once CPU facts
arrive.

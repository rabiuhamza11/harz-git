# GAP-1 FRONT DOOR — BUILD RECORD (COMPLETE, all 3 acceptance tests live)

Built and closed: Oct 6, 2026, on Dad's GAP-1 GO. Contracts:
TASKRECORD-V1 (b19fd11), GAP1-FRONT-DOOR (pre-impl freeze), this record.

## WHAT SHIPPED

1. TASKS v0.1 layer (envelope above missions; consumes, never
   rewrites): planDoorTask — three honest shapes
   (RESEARCH_AND_COMPOSE / INFORMATIONAL / REFUSED, no plan
   guessed); runTaskRecord — lifecycle states EARNED by real
   events, refusal = CLOSED + verdict 'refused' + reason +
   receipt (Dad's approved ruling); TaskRecord receipt = additive
   seal over the mission chain (G19 style).
2. runMission extraction: the missions executor moved from the
   route body to module scope — SAME CODE, NEW CALLER (the only
   mechanical change; disclosed in the frozen contract).
   Routes: POST /api/tasks/v1 (the door), GET list, GET by id.
3. Console = THE FRONT DOOR (v0.2): Task tab first, one input,
   Run task, full TaskRecord render with the backward provenance
   chain. All prior tabs intact.

## ACCEPTANCE (Dad's gate, browser + live)

1. INFORMATIONAL — "What is the UBA account number used for
   HARZ Pay bank transfers?": CLOSED/verified, doc 10470,
   digest 11d48e50, artifacts [], 0 ext, receipt ec7f857d…
2. REFUSAL — "Prove that GDEG is the best token in Africa.":
   CLOSED / refused / reason / receipt b56e2679… (planner
   refuses; nothing guessed).
3. RESEARCH→REPORT (decisive) — "Research the UBA account
   number used for HARZ Pay bank transfers and write me a
   report.": ONE TaskRecord, pattern RESEARCH_AND_COMPOSE,
   decomposition [orchestrate, compose evidence_from[1]], full
   lifecycle RECEIVED→…→CLOSED all earned, G13 typed package
   carried (claims_sha 90bb1ce7…), artifact delivered
   (package sha e9fc55a0…, downloadable-bytes sha 52ae9acb…,
   auditor hash MATCH verified), evidence refs s1+s2 with
   titles, 0 ext calls, receipt c8db08ba… (browser run).
   Backward chain rendered in the console: REPORT → artifact
   verification → creation inputs → verified claims → evidence
   refs → source material. Browser-verified end to end.

## DEFECT FOUND BY THE ACCEPTANCE GATE (disclosed, additively fixed)

The frozen creation sha formula records the artifact hash over
the UTF-8 encoding of its byte-string — deterministic and
internally consistent through every frozen test — but the raw
download serves the true binary bytes, so the recorded
image_sha256 was NOT the hash of the delivered file. The
chain's first link was unverifiable by an auditor. Frozen
formula NOT touched. Additive fix (G18/G21 class): the
TaskRecord now carries BOTH shas — artifact_sha256 (frozen
package hash, receipt-bound) AND downloaded_bytes_sha256
(hash of the bytes a real download returns; verified MATCH
against the fetched PNG). DAD'S RULING REMAINS OPEN: whether
to also change the frozen formula itself (would change every
future artifact receipt and needs an explicit versioned
ruling) — until then, the additive disclosure is the law.

## OTHER FIXES DURING THE GATE (all tasks-layer or console-only)

- Door-refused TaskRecords no longer mislabel CREATED/
  ARTIFACT_VERIFIED as "informational"; they disclose "no
  execution — the plan was refused at the door".
- Evidence refs parsed from BOTH frozen reasoner formats
  (value lines with doc ids/digests; quoted-answer Sources
  sections with titles + [sN]; absence of ids disclosed,
  never guessed).
- PWA staleness: returning users were served the old cached
  shell by the old service worker. SW cache bumped to
  harz-console-v3, sw.js served no-cache, /console served
  no-store. Verified in a live browser (old v0.1 shell → new
  front door after update).
- Console evidence-ref line renders the honest form per format.

## REGRESSION (after all fixes)

Frozen agents gate 13/13; offline death test 2/2 @0 ext;
PWA shell 200/200/200; missions planner refusal intact;
mission research/compose paths unchanged (executor extraction
proved by identical behavior); 11 TaskRecords live, all with
receipts, zero external calls anywhere.

## HONEST LIMITS (carried)

1. A "report" composes through the frozen studio router
   (this instruction → image mode, disclosed per artifact); a
   dedicated text-report engine is future work on Dad's word.
2. Multi-claim answers that are not all-supported gate-refuse
   at missions (e.g. "GDEG payment rate" — 5 supported, 1
   unsupported) while chat discloses the same verdict with its
   receipt. Designed missions law (MISSIONS-AUDIT-V1), not a
   defect.
3. Physical Infinix test outstanding (single-column responsive
   + viewport meta + browser-verified at desktop width).
4. GAP-5 handoff rung (a real person, Jalingo first) is the
   next gap in the completion contract.

# OWNER DECISION PACKAGE B — QUARANTINE DISPOSITION
**Status: PROPOSAL FOR OWNER DECISION — quarantine remains in force; no release, delete, rewrite, or silent reclassification authorized or performed.**
**Ruling context (owner, Oct 14):** "The decision package must distinguish body integrity, source identity, historical identity, and eligibility. A successful digest check alone does not resolve all four questions."

## 1. The object
12,722 quarantined records: cloud-wave 11,939 + door-onefile-v06 783. They entered the corpus during the freeze via corpus-wave DO alarms (freeze-violation enforcement recorded at 897ffe1; rollback preserved; the corpus itself was then verified frozen at 1,341,437). Measured state: recorded, not-yet-inspected, ABSENT from the index (Team E, aec1425). Owner's caution stands: index-absence is not a finding of corruption or deletion.

## 2. The four questions (per your ruling, each with its evidence requirement)
1. **Body integrity:** are the stored bytes valid, complete, and undamaged? Evidence required: per-record digest recomputation against stored digests; malformed-body census (encoding, truncation, empty bodies); all read-only.
2. **Source identity:** where did each record come from and is that attribution true? Evidence required: source_url, fetch timestamps, ingest path (which pipeline/worker wrote it), license fields where present.
3. **Historical identity:** was the entry lawful under the rules in force at its write time, and what was the freeze-violation record? Evidence required: the DO-alarm write logs, the stub/rollback record, and the ingest timestamps vs the freeze window. (This is history, not blame: the enforcement record already exists.)
4. **Eligibility:** does each record meet the canonical membership criteria? Evidence required: whatever you decide in Decision Package A — eligibility cannot be evaluated before membership criteria exist. This dependency is stated, not assumed.

## 3. Proposed evaluation procedure (for your approval, not executed)
Phase 1 (read-only inspection pass): the "not-inspectable" status is upgraded by an authorized read-only scan of the quarantine store — digests recomputed, source fields tabulated, size/language/domain census produced. Zero writes, zero releases.
Phase 2 (report): a four-column table per record class (not per record — 12,722 rows summarized by source/pipeline/date), each class marked on all four questions with evidence counts.
Phase 3 (options per class): release-to-index / retain-in-quarantine / propose-deletion — each option presented WITH its eligibility dependency on Decision A, for your explicit per-class ruling. Nothing is decided by the procedure itself.

## 4. What this package explicitly does NOT do
No release, no deletion, no rewrite, no reclassification, no index change. Quarantine stays in force until you rule.

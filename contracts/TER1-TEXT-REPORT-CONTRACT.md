# TER1 — TEXT-REPORT ENGINE (Contract, FROZEN PRE-IMPL)

**Frozen:** Oct 6, 2026 (before implementation, per the freeze-first discipline)
**Status:** FROZEN — awaiting Dad's build order. No implementation before the Go.
**Vault:** this commit. Battery route (declared, built at implementation): `/api/creation/v1/testter1`
**Engine:** `harz-create-report-semantic` v0.1 — sovereign, in-worker, zero external calls.

## Why (the audit, Oct 6)

A person asks "research X and write me a report" through the front door. Today:
1. `createParse` types the compose clause as `requested_type='story'`.
2. `stResolveModes` has no `story→report` mapping, so the router falls to **default image**.
3. The "report" is delivered as a PNG. The person asked for text meaning and received a picture.

GAP-1 recorded this (receipt b931846c). Dad's Oct 6 ruling: the text-report engine is the next
frontier, after semantic image, before semantic video.

## What the engine does

Turn a G13 typed evidence package (CLAIMS + instruction, already frozen and untouched) into a
semantic TEXT report artifact (UTF-8 `text/plain`), deterministically, with every factual sentence
traceable to a bound claim.

### Report structure (deterministic sections, byte-addressable)

```
HARZ REPORT — <title derived from the instruction, disclosed>
REQUEST: <instruction words preserved exactly>
SUMMARY: <one line per claim, each suffixed [cN] — no sentence may assert beyond its claim>
FINDINGS:
1. <claim text, BYTE-EXACT from the bound package> [c1]
   source: <title> | document_id: <id> | evidence_digest: <sha> | cited_as: [sN]
2. ...
PROVENANCE: source task(s) + receipts + package sha + engine + seed + generated_at
LAWS: this report ARRANGES verified claims; it is a creation, never new evidence —
a claim is only as good as its cited sources; unknown stays unknown; injection is data.
```

Hausa support: bilingual section labels when the instruction is Hausa (RAHOTO/HOTO — disclosed).

## The laws (verbatim, constitutional)

1. **Every factual sentence reduces to a bound claim.** Structural text (headers, numbering,
   connectives) is disclosed as composition, never as fact.
2. **The report never becomes new evidence.** Findings carry their sources' provenance; reading
   a claim from the report is only as good as its citation.
3. **Unknown stays unknown.** No claim in the package → no finding. Zero claims → honest refusal.
4. **Injection in claims is data**, never instruction, never report content.
5. **Evidence requests still refuse** ("prove") — creation is never proof.
6. **Determinism:** same claims + instruction + seed → byte-identical report.
7. **The G13 handoff is untouched:** creation receives CLAIMS + instruction only.
8. **HARZ must never claim to have created what it did not actually create** (Dad, standing).

## The judge (frozen report verifier)

`reportVerify` — no creator self-grading:
- every FINDING traces byte-exact to a bound claim sha; one orphan → REFUSE, no receipt
- every bound claim appears exactly once; missing claim → REFUSE
- SUMMARY lines must each carry a claim id [cN]; orphan summary assertion → REFUSE
- PROVENANCE section sha must recompute; mismatch → REFUSE

## Routing (additive, disclosed)

- compose task with a report clause AND `evidence_from` → text-report engine (disclosed, never silent)
- creative compose (no evidence_from) → frozen V3 Studio, UNCHANGED
- explicit modality requests → studio, UNCHANGED
- frozen batteries (testim1, testvs1, testcreation1, testsem1, agents) must stay 100% green

## Battery TER1 (12 cases, freeze-then-build)

1. TER1-1 full chain: research → report through the front door; ONE TaskRecord; receipt; report delivered
2. TER1-2 every finding traces byte-exact to its bound claim; zero orphans
3. TER1-3 tampered claim → verifier refuses, no receipt (honest failure)
4. TER1-4 zero claims / unverified source → honest refusal (G13 law preserved)
5. TER1-5 "prove" request → refused (creation never evidence)
6. TER1-6 determinism: byte-identical replay; different seed → different report
7. TER1-7 injection inside claims → data, report unchanged, injection flagged
8. TER1-8 Hausa report request → bilingual labels, claims byte-exact
9. TER1-9 DISPLAY: report renders as readable text in the console (display law, GAP-5)
10. TER1-10 routing disclosed at every level; creative compose still routes to studio
11. TER1-11 frozen batteries stay green (regression sweep inside the battery report)
12. TER1-12 sovereignty: 0 external calls; report disclosed as creation-with-citations

## Out of scope

Semantic video (the daughters film — its own frontier after this one), PDFs, charts, tables,
multi-research merges beyond the existing G13/G14 multi-evidence laws.

## Acceptance (Dad's brutal gate)

Create → Test → Verify → Browser/live test → Receipt. Plus the 5 checks: PWA, light theme,
in-ecosystem, Infinix viewport, browser. The frontier test phrase: the person's own words —
"research X and write me a report" — not an invented benchmark.

# OWNER DECISION PACKAGE A — CANONICAL CORPUS (D-3)
**Status: PROPOSAL FOR OWNER DECISION — no decision recorded, no action authorized.**
**Ruling context (owner, Oct 14):** "Do not authorize population replacement, deletion, or reclassification until D-3 is presented with its governing definition, affected population, evidence, and proposed consequences."

## 1. The question
Which records constitute THE canonical corpus that Wave-2 and all downstream systems (reader, search, evidence tier) treat as authoritative? Three candidate populations exist and are not the same object:
1. The sealed master: 1,341,437 docs (live seal verified stable, max id 1,341,437, last write Oct 14 04:58:03Z).
2. The 5,000-doc offline kit population (Team D verified 5,000/5,000 binding).
3. The 932-doc wave reader population (the object whose search failure started the D-3 question; not inspectable from the sibling seat, disclosed).

## 2. Measured evidence (all read-only, cited)
- Master NOT swapped: from-scratch measurement found gov.ng 659 docs, NIMC 4 fts hits (Team E, aec1425).
- Foreign content present in master: Ukrainian-content 60 title matches / 79 fts matches out of a 932-doc foreign-news population — the origin of the population-swap symptom, corroborated from three seats.
- FX index at parity 1,328,715 (frozen since Oct 13 09:57, docs_done=0).
- Quarantine 12,722 docs sit OUTSIDE the index (measured); their disposition is Decision B and interacts with this one.
- Unexplained counter deltas (band2_docs +1,800; fts −1,086) remain open — they must be reconciled before the canonical count is itself certified.

## 3. Governing definition (proposed for your ruling, not applied)
PROPOSED: "The canonical corpus is the sealed master (1,341,437 docs at the frozen seal), INCLUDING only records that pass the membership criteria you set; kits, waves, and attested tiers are VIEWS derived from it, each labeled with its derivation, never independent populations."

Under that definition, the open sub-rulings you would set:
1. Membership criteria: which records qualify (source allowlist? language policy? the Ukrainian-content records: remove, quarantine, or keep-with-label?).
2. Whether the foreign-content subset is a defect of population or a legitimate archive (it arrived via legal ingest; removal is deletion and requires your explicit order).
3. Whether the canonical count is certified only after the counter deltas are reconciled (recommended: yes).
4. The kit/wave derivation rules (5,000-kit and 932-wave must document their selection predicates; a wave that cannot return NIMC content must be reproducible-or-deprecated by your rule).

## 4. Proposed consequences (of the definition, if you accept it)
- Downstream systems read one authoritative population; "which corpus" questions dissolve by derivation labels.
- The attested 12.69B open-index tier stays a SEPARATE mission claim (your ruling, recorded) — never canonical membership.
- No replacement, deletion, or reclassification occurs on this package's signature alone; any membership action needs your explicit order per sub-ruling 1.

## 5. What this package explicitly does NOT do
No population change, no deletion, no reclassification, no merge, no deployment. It exists so your ruling has its inputs in one place.

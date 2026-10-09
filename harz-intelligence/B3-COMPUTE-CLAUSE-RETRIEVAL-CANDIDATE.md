# B3 — COMPUTE-CLAUSE JUNK-PACKET RETRIEVAL — INVESTIGATION + CANDIDATE (built + gated, awaiting Dad's ruling)

**Deployed:** Oct 9, 2026, worker version `5dd03e13-910a-4b03-919c-c1ada626eb05`
**Scope:** search1.js variant list ONLY (additive). Sealed laws untouched: v1.2 entity-binding extractor, coverage law (idf>=2.0 entity-anchor), all thresholds, variants[0] identity (ents-alone remains first), dedup/diversify/ranking, the F-GAP4-2 intake provenance law, every frozen battery.
**Dad's authorization:** B3 named next candidate; ruling required its own bounded investigation and acceptance criteria with the sealed provenance and entity-binding laws intact. His "Go" opened it.

## Investigation (empirical)

**Repro:** the compute clause "compute the Naira value of 2000 GDEG at the documented rate. Cite your sources." produced a junk packet: HarzPay Onboarding, then Peter Obi, ASP.NET Boilerplate, Bronx River, Jest, LocationIQ. No GDEG rate evidence. Verbatim rate lines exist in the corpus ("1 GDEG = ₦15 ($0.01)", HARZ Pay; "₦15 1 GDEG = NGN", GDEG Token).

**Root cause, proven by direct variant probes against the live index:**

1. capWords make 'naira' an entity (capitalized currency word) alongside 'gdeg'.
2. Every entity-bearing base variant strict-ANDs ALL entities: "naira gdeg" → only the Onboarding doc. The GDEG rate docs use the ₦ symbol / NGN, never the word 'naira' — excluded from the ENTIRE pool.
3. Remaining variants are generic content ("compute value 2000 documented rate" → junk; 'compute' idf 4.70 and 'value' idf 4.29 are junk-frequent in the harvested corpus; 'rate'/'documented' are idf-undefined so no rare list even formed — rare.length >= 3 was false).
4. The pair that retrieves gold — "gdeg rate" (GDEG Token 19.81, HARZ Pay 16.26) — is never formed by any variant grammar rule.
5. Coverage then certified the junk packet 'ok' (entity hit ratio 1: Onboarding alone contains both 'naira' and 'gdeg').

**Defect class:** a question-adjacent entity that gold docs never spell out poisons every entity-bearing variant; entity-alone variants — the v1.1b law's own principle ("the clause's ENTITIES ALONE are its most precise subject query") — were only ever applied across clauses, never within one.

## The correction (additive, one rule)

When a question carries 2+ entities, append each entity ALONE (first 3, deterministic) to the variant list. Existing variants and their order are untouched; the added variants only admit more candidates into the pool; the frozen ranking/coverage/threshold laws decide the rest.

## Acceptance criteria (pre-registered, all gated)

**AC1 — rate-bearing evidence reaches the packet:** the compute clause's packet top unit is now GDEG Token — Africa's Digital Payment Layer (all 4 runs), whose page carries the verbatim rate ("₦15 1 GDEG = NGN", verified against the live page). The documented-rate compute (2000 × 15 = 30,000 NGN, the TASK-H T2 gold) becomes REACHABLE through the chat clause path for the first time. Whether the reasoner computes it correctly is model behavior, testable when the credential returns.

**AC2 — sibling clauses unchanged:** account clause and URL clause packets byte-identical to the pre-fix capture (same 6 titles, same order) in the same composed run.

**AC3 — full frozen bar green:** agents 13/13, test10 5/5 + 5/5, test8 5/5 + 5/5, im1 24, vs1 30, creation1 24, sem1 12/12, ter1 12/12, semvid1 16/16, router1 15/15, m2 17, m3 16, m4 16 — 0 ext.

**AC4 — junk suppressed:** Peter Obi / ASP.NET / Jest / LocationIQ / Bronx absent from the compute clause packet. (One naira-news doc — Dangote IPO — enters via the 'naira' single-entity variant; it is entity-bearing, ranks last, and is the ranking laws' business, not the variant list's.)

**AC5 — determinism:** 4/4 identical clause packets and answers across repeat runs.

**AC6 — negative honesty preserved:** a nonexistent token (XQZT) is a single-entity question → no new variants fire → its packet is junk-but-uncovered exactly as before; the answer fabricates nothing (no 30,000, no ₦15); coverage/subject-absent laws downstream unchanged.

**AC7 — sealed laws intact:** variants[0] unchanged; no threshold, coverage, or ranking change; the intake interplay gate passes AFTER the battery suite per the mandatory hygiene order (ingest-scoped fee-worded account question answers from [INGESTED], zero corpus leak, 0 ext).

## Disclosures

**D1 — the 'naira' grammar question remains open (recorded, not patched):** 'naira' is a capitalized currency word behaving as a subject entity. Demoting currency-unit words from entities would be the deeper grammar fix, but it changes entity sets (and therefore packets) across the whole corpus — a much larger regression surface. B3's additive law fixes the observed exclusion without relitigating entity sets. Future ruling if wanted.

**D2 — the idf table is stale relative to the merged corpus** ('rate' undefined while 'compute' is 4.70 and junk-frequent). The weights table is frozen; no change made; recorded as evidence for any future weights ruling.

**D3 — reasoner verification pending:** AC1's downstream claim (a healthy reasoner grounding 2000 × 15 = 30,000 from the packet) cannot be executed until the OpenRouter credential is restored. The retrieval boundary is closed on packet evidence; the model-behavior check rides on the credential.

**D4 — raw index parity:** intelligence's packet builder queries the harz-search index service for candidates; the variant/scoring logic is intelligence-local. All probes were run against the same index the packet builder consumes. No other deployment carries the variant logic.

## Awaiting ruling

**PROMOTE** → B3 closed; the compute clause retrieves its rate evidence deterministically. Or **REVERT** → redeploy 24abc4f5 (B2 seal intact — that law is in worker.js, unaffected by this search1.js change either way).

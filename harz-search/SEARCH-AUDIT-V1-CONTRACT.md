# HARZ SEARCH AUDIT v0.1 — Contract (frozen before any change)

Frozen: 2026-10-03, before any search modification, per Dad's 12-step sequence
and the freeze-first law. Scope authority: Dad's directive of Oct 3, 2026 —
"Search finds evidence. Verifier judges evidence. Neither is allowed to rescue
the other."

## Scope (IN)
- The search layer ONLY: harz-search worker (frozen search-core v0.3), its
  D1 index (harz_search_v02: docs 10471 / terms ~166k / meta), and
  harz-search-node-a (federation twin, same CORE).
- Search-side improvements must be deterministic, no AI, no query rewrites,
  no LLM anywhere in search.

## Scope (OUT — untouchable during this audit)
- harz-verify-1 (verifier), harz-intelligence orchestrator/missions/studio,
  frozen reasoners, any other worker. No change may be made to compensate for
  search weaknesses by loosening the verifier.

## Baseline facts (recorded before changes)
- Live: harz-search v0.3, contract search-core.js, deployed 2026-09-20.
- Corpus: 10,471 docs, 1,569 domains, 166,496 unique terms, index digest
  b9395e5388a45320dab33ca0f5860c393374bba7e17c54f8b3075653d2042bed.
- Corpus backup taken (search-audit/corpus-backup/docs.jsonl, 10,471 rows,
  snippet_text = the exact stored text the index is built from, 2000-char cap
  — verified against deployed reader usage).
- First reproduced failure: "What is the UBA account number used for HARZ Pay
  bank transfers?" → strict AND empty → relaxed dropped {uba, harz, transfers}
  (the RAREST, most discriminative terms) → kept {account, number, used, pay,
  bank} → top results = iban.com + kuda.com noise; gold docs 10470/10066/7
  (contain 2034326424) not retrieved.

## Suspected diseases (to be proven or discarded by the battery)
1. L3b relaxation drops LOWEST-df terms first — inverts informativeness; the
   discriminative tokens are discarded and generic tokens match noise.
2. CamelCase compounds tokenize as single tokens ("HarzPay" -> harzpay), so
   brand-part queries ("harz pay") can never match compound-written docs.
3. Stopword list misses common function words ("used"), which block strict AND
   without carrying meaning.

## Battery (frozen: search-audit/battery.json, 20 questions)
- 17 gold questions, each with gold doc ids whose stored text was VERIFIED to
  contain the expected fact (verification script output preserved in
  search-audit/battery-verification.txt).
- 3 negative controls (no gold doc): must NOT produce fabricated relevance —
  expected honest behavior: weak/no results and (end-to-end) verifier refusal.

## Metrics (frozen)
1. gold_hit@12 — gold doc appears in the 12 served results.
2. gold_rank — 1-based rank of the first gold doc.
3. noise_in_top3 — count of top-3 results whose domain is unrelated to the
   question's subject when a gold doc exists (manually classified once,
   frozen list in battery.json).
4. determinism — the SAME query run twice must return byte-identical JSON
   with took_ms excluded.
5. federation — harz-search and harz-search-node-a must return identical
   results for identical queries.

## PASS gate (frozen, for promotion of the search version)
1. gold_hit@12 >= 15/17 (89%).
2. The flagship question (UBA account number) ranks a gold doc in the top 3.
3. All 17 gold questions that passed before the change still pass (no
   regression).
4. Negative controls remain honest (no fabricated relevance).
5. Determinism: byte-identical repeat runs, both nodes.
6. Zero external calls from the search path (engine touches only D1).
7. Unchanged verifier: >= 4 of 5 selected gold questions pass end-to-end
   through the intelligence chat (evidence -> answer -> verify), with the
   verifier NEVER modified.
8. Browser test: search UI live + full Mission -> Search -> Verify path in
   the intelligence console.
9. Receipt issued and vault committed (including restored v0.3 baseline
   source, which was found missing from harz-git).

## Laws preserved
- One engine, many nodes: identical CORE file, same corpus + query =
  byte-identical results.
- No stemming beyond a NEW frozen deterministic rule (if any) — any tokenizer
  change bumps the contract version (v0.3 -> v0.4) and rebuilds the index.
- Search-side changes only; the verifier judges the results unchanged.
- If a fix cannot pass the battery honestly, report the failure — never
  loosen the gate to make it pass.

Authorized by: Dad (Rabiu Hamza Mohammed), Oct 3, 2026 sequence.
Executor: Hauwa.

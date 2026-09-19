# HARZ SEARCH v0.1.1 — BUILD RECEIPT (deterministic federation, Sep 19)

All three verification levels (ecosystem law) executed:

1. DEEP AUDIT — one frozen engine file (search-core.js, sha256 a9fc8a4d…)
   bundled byte-identical into both nodes; D1 terms projection generated with the
   SAME tokenizer (45,484 rows == stats.json unique_terms, generator gen-terms.js).
   Worker logic deep-read; two real bugs found+fixed during build:
   (a) D1 bind() chaining replaced values — bind.apply(st, params) fix;
   (b) fed-test harness used http for https — Node A "0/30" was harness error, not divergence.

2. TEST — API: /health contract v0.1.1, /stats digest 8bdec9df…, /search
   deterministic (same query 3x = 3 identical canonical hashes on Node A;
   30/30 byte-identical across nodes). AND law verified ('nigeria tax' 57 not 308;
   unknown term 0; stopword-only 0). Scores Node A == Node B exactly.

3. BROWSER TEST — live UI renders 'harz search': 5 results, top HARZ Super App v5.0
   score 13.55, same order/scores as API; PWA light theme intact; stats bar live.

DEATH TEST — PASS. Node A killed (tmux kill, port refused = confirmed dead);
Node B served the identical canonical answer (total 5, top 13.55, same bytes minus took_ms).

Federation suite: 30/30 BYTE-IDENTICAL (corpus/federation-test.json).
Deploy gate: PASS on every deploy. Credential issue handled separately (unchanged,
per owner: don't redesign architecture around expired credentials).

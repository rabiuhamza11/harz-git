# RULING PACKET — D1 (naira-as-entity grammar) + D2 (idf staleness vs merged corpus)

**Prepared:** Oct 9, 2026, for Dad's ruling. Empirical, read-only: NO frozen file was
touched, NO patch built. Every number below was measured against the live index
(harz_search_v02 D1, digest aa22a26e…, 11,365 docs, last crawl Oct 7) and the frozen
weights file (reasoner1-weights.js).

## Measured baseline (both rulings share this)

Frozen weights table: trained 2026-09-24 on the **219-document** HARZ ecosystem harvest
(dataset digest 565a2948…, weights digest 88eaff62…, vocab 1,892).
Live index today: **11,365 documents**, 140,894 unique terms — a 52x corpus growth
since training. The frozen bar is green against the live index (full re-gate Oct 9:
agents 13/13, test8 5/5, test10 5/5 + 5/5, im1 24, vs1 30, creation1 24, sem1 12/12,
ter1 12/12, semvid1 16/16, router1 15/15, m2 17, m3 16, m4 16 — all 0 ext).
So the divergence below degrades retrieval MARGIN, not yet a sealed gate.

## D2 — idf staleness, measured (frozen idf vs live-corpus idf, log(11365/df))

Subject terms now UNDER-weighted (frozen table treats them as common; corpus says rare):
| term | df today | live idf | frozen idf | delta |
| gdeg | 40 | 5.65 | 2.56 | +3.09 |
| harz | 461 | 3.20 | 0.31 | +2.89 |
| wallet | 152 | 4.31 | 2.25 | +2.06 |
| ngn | 69 | 5.09 | 3.44 | +1.65 |
| paystack | 65 | 5.16 | UNDEFINED (defaults 2.5) | -2.66 |

Junk-frequent terms OVER-weighted (frozen table treats them as rare):
| term | df today | live idf | frozen idf | delta |
| value | 847 | 2.60 | 4.29 | -1.69 |
| compute | 164 | 4.24 | 4.70 | -0.46 |

High-df subject terms UNDEFINED in the table (default fallback 2.5): rate (271 docs),
transfer (461), fees (234), price (302), documented (79). These are exactly the terms
whose absence broke B3's rare-list formation (rare.length >= 3 was false).

Impact path (why it matters): (a) variant rare-lists fail to form on common subject
vocabulary; (b) coverage scoring misranks between subject and junk terms; (c) the
reasoner's title-anchor idf weighting (R3) inherits the same distortion.

### D2 options
1. RETRAIN NOW: harvest the live index, run train-reasoner-1.py, seal new weights with
   new digests, full-bar re-gate under the re-gate-on-index-change law. Cost: one full
   re-gate cycle; risk: every ranking-dependent packet changes at once.
2. KEEP FROZEN: rely on B3's sealed entities-alone law to compensate. Risk: future
   questions over new corpus regions degrade the way B3 exposed.
3. RETRAIN ON TRIGGER (policy, zero code change): keep the frozen table; the standing
   Oct 8 lesson (re-gate whenever the index digest changes) already covers detection.
   Retrain becomes justified the moment a sealed ranking gate goes RED against a new
   digest — and the natural moment is AFTER the Stage 3 corpus migration + nav-junk
   cleanup settle the index, so one retrain covers both.

**Evidence-based recommendation: option 3.** The bar is green; B3's law compensates the
observed class; retraining mid-migration would re-gate twice. (Ruling is Dad's.)

## D1 — naira-as-entity grammar, measured

capWords makes 'naira' a subject entity. Measured exclusion on the flagship class:
40 docs contain 'gdeg'. Of those, exactly ONE (10470, HarzPay Onboarding) spells the
word 'naira'; 11 use 'ngn'; the rest use the ₦ symbol only. A strict entity-AND
variant 'naira gdeg' therefore reaches 1 of 40 GDEG docs — a 97.5% exclusion of gold,
which is the exact failure B3 exposed and rescued with the sealed entities-alone law.
Meanwhile ~72 docs spell 'naira' (the news-junk class, e.g. Dangote IPO), so the
entity is question-adjacent junk-frequent while being subject-rare in gold docs.

### D1 options
1. DEMOTE currency-unit words (naira, dollar, pound, euro, yuan…) from the entity
   grammar at the v1.2 extractor. Blast radius: the extractor is FROZEN under the
   F-GAP4-2a/2b seals ("do not weaken the sealed extractor"); this reopens sealed
   layers and changes entity sets (and packets) corpus-wide. Every battery re-gates.
2. NORMALIZE the currency surface at the index (map ₦/NGN → naira at tokenization).
   Blast radius: index digest changes → full re-gate; touches the frozen search contract.
3. KEEP BOUNDED (zero code change): the sealed B3 entities-alone law already rescues
   the observed class. Record the grammar question as a known bounded limitation and
   revisit it together with D2's retrain if that ruling ever fires — entity grammar
   and corpus weights belong to the same future language-layer ruling.

**Evidence-based recommendation: option 3.** The defect class is currently compensated
by a sealed law; both deeper fixes reopen frozen layers for no observed live failure.
(Ruling is Dad's.)

## What this packet does NOT claim
No patch was built. No frozen layer was touched. No gate was weakened. The full-bar
re-gate stands as evidence the composition is green TODAY against the live index.
D3 (reasoner ground-truth, 2000 x 15 = 30,000 from packet) remains blocked on the
OpenRouter credential, per the sealed credential ruling.

---

## DAD'S RULINGS — Oct 9, 2026. D1: RATIFIED, BOUNDED. D2: DEFERRED.

**D2 — IDF drift: DEFER RETRAINING.** Keep the frozen weights; retrain once the Stage 3
corpus settles. The measured drift (219-doc training vs 11,365-doc ranking; gdeg -3.09,
harz -2.89, wallet -2.06, paystack absent, 'value' over-weighted +1.69, rate/transfer/
fees/price undefined) is a credible reason to retrain eventually, NOT immediately — the
full bar is green at 0 ext, and changing IDF mid-growth introduces a new ranking variable.
Conditions for the eventual retrain, verbatim order: (1) freeze a corpus snapshot and
record its digest; (2) preserve current weights/ranking as baseline; (3) measure retrieval
quality on a fixed evaluation set including rare financial terms and noisy news documents;
(4) compare new weights against the frozen baseline; (5) run the full regression suite and
relevant offline retrieval tests; (6) promote only if measured improvement justifies the
change without breaking provenance or existing retrieval contracts. D2 is deferred, not
rejected.

**D1 — naira/gdeg retrieval restriction: RATIFY BOUNDED.** Keep the bounded approach;
preserve the sealed entities-alone retrieval path. Do NOT introduce a mandatory
naira-AND-gdeg condition; do NOT reopen the frozen entity-binding or universal-provenance
layers to improve recall. Governing distinction, verbatim: "Retrieval finds candidates.
Provenance determines admissibility. Entity binding determines whether a candidate
supports the requested value. A document containing gdeg can enter consideration without
automatically becoming valid evidence for a GDEG-to-naira conversion rate." Recall is
preserved without sacrificing answer integrity. No deeper retrieval change authorized.

**Overall disposition (Dad's table):** F-GAP4-2a/2b/2c SEALED; F-GAP4-2 universal
provenance SEALED; B2 SEALED; B3 sealed, no reopening; D1 BOUNDED-RATIFIED; D2
DEFERRED until Stage 3 settles; GAP-4 router CLOSED; GAP-5 awaiting the Jalingo
participant; D3 awaiting a valid external-reasoning credential (secret-management path
only; no paid upgrade; zero-budget rule stands). Baseline stands: index digest
aa22a26e, full bar green, zero external calls.

**Standing order:** do not open another retrieval or reasoning change merely to keep the
lab busy. The sealed stack stays sealed. Qualification, verbatim: "I accept your report
as the basis for these rulings; I have not independently executed the deployed system."

**Earned sentence, Dad's words:** the important achievement is not just that the tests
are green — it is that we can now distinguish defects requiring correction from known
limitations that should remain bounded until the evidence justifies another change.

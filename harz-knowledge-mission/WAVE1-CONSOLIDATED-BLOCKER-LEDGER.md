# WAVE 1 — CONSOLIDATED BLOCKER LEDGER
**Team F:** Hauwa's desk (owner order, Oct 14, 2026 — "I add team f to your desk. The owner of the desk is out of credit.")
**Operating contract (inherited, verbatim from dispatch):** record repository state, read-only first, protected state untouchable, no claim without an executed check, failures and unknowns declared explicitly, no duplicate assignments, no invented numbers.
**Scope note:** this is the consolidation of LANDED evidence only. Desk-side defect IDs D-0…D-6 are referenced ONLY where their definition arrived in owner-forwarded dispatches; their full definitions live on the out-of-credit desk and are pending handoff. Nothing here invents or renumbers them.

## 1. WAVE-1 REPORT STATUS

| Team | Assignment | Status | Evidence |
|---|---|---|---|
| A | Visual closure (immigration refs, CBN capture, provenance stamps) | LANDED + ADJUDICATED (conditional acceptance, owner ruling) + reproduced from 2 seats | 2a2c6bd (report), 9a36de0 (ruling receipt), 500f57c (Hauwa seat reproduction), 403ece9 (desk verification) |
| B | Site acceptance, six-law matrix (styles/images/fonts/search/provenance/offline), per-site pass/fail | NOT LANDED. Honest NOT-TESTED marks expected for NIS and NCDC (other seat / not yet held). Slot open | — |
| C | Package integrity (hashes, round-trip, 25MB ceiling, deployed-vs-committed) | LANDED from 2 seats, cross-verified | 500f57c, e929b8c, 2a89700, 2f2a4c0 (Hauwa), 403ece9, 6d3af36 (desk) |
| D | Internetless verification (5,000/5,000 binding, frozen testset, boot pins, text-library, airplane-mode limitation) | LANDED per owner-forwarded adjudication (c8f21a3): 5,000/5,000 binding, identical miss-case across three environments, airplane mode device-only on both seats, live reader matches F1 | c8f21a3 (adjudication record); raw report on desk seat, pending handoff |
| E | Corpus integrity (shard counts, live seal, quarantine, population-swap re-measure) | LANDED | aec1425 (this repo: seal HOLDS exactly, 1,341,437 docs, quarantine measured absent from index) |
| F | Independent reproduction + this consolidated ledger | THIS LEDGER (Hauwa desk) | commits cited per entry |

## 2. CONSOLIDATED BLOCKERS / DEFECTS (all repairs unauthorized; protected state frozen)

**TF-1. Provenance stamp 20,000-char truncation.** health-v2: cut at char 19,999/19,999 span; immigration-v3: 19,984/20,000. Root cause = stamp-writer cap (both seats agree exactly). Remediation steps on file, NOT authorized; frozen stamps untouched. [403ece9, 500f57c, e929b8c C5 revision, fa8e618]

**TF-2. Offline styling loss — external CSS dependency class.** immigration: 232 external stylesheet links (222 site / 6 themigrate.xyz / 4 googleapis); health: 60 links (desk) / 61 (Hauwa; 1-count regex delta disclosed both seats; 48 health.gov.ng / 4 googleapis / 4 cdnjs + residue). Linked CSS content absent from packs; the capture pipeline's own stamp proves it measured the CSS it failed to embed. Substance agreed across all seats; the googleapis sub-count delta (9 vs 4) is a named counting-object variant (receipt 188). [403ece9, 500f57c, e929b8c, fa8e618, 6d3af36, receipt 188]

**TF-3. health-v2 rendering-path external fonts — SETTLED ACROSS SEATS (receipt 188).** Both seats now measure identically against the sha-identical blob 63750cdf: 105 @font-face openers = 51 with embedded data URIs + 54 with external https URLs, ALL 54 in the rendering path (inside style blocks opened by the pipeline's own vf-embed comment — the variable-font embed step was left half-done), ALL 54 pointing at moh.dotmac.ng. At resolution level: 15 of 32 (family,weight,style) keys are external-only and final — all Poppins, weights 100–900, normal+italic — offline font loss for body text. The desk's earlier "0" was a quote-restricted regex artifact, retracted in full (6d3af36); verbatim pinned sample: Poppins italic 100 loading woff from moh.dotmac.ng at blob offset 20903691 (2f2a4c0). Receipt 186's health fonts FAIL stands. DECISIVE EXPERIMENT (named, agreed): serve the pack, render offline, watch whether the Poppins faces fall back — BLOCKED on a serve path (38MB pack exceeds the KV 25MB limit). Ledger holds both seats' measurements with objects named. Scanner law recorded: two seats agree = independent only if tokenization assumptions differ.

CONTRADICTION RECORDED (Team F duty, Oct 14): a later desk forward states "rendering-path external fonts measured 0 from two seats, the earlier 54 reclassified as inventory counting." This repeats the quote-restricted-regex position already retracted by the desk itself in 6d3af36 ("the ORIGINAL e929b8c '54' census claim was CORRECT and must not be reclassified as documentation-based") and contradicted in receipt 188. It does not reproduce against the pinned evidence: the verbatim block at offset 20903691 of the sha-63750cdf blob is an external-only @font-face src inside a style block, and container classification measures all 54 in rendering path, zero in inventory. The ledger holds to the executed check per the operating contract; the decisive offline-render experiment (pending a serve path) settles the question empirically if any seat still doubts the static measurement. [e929b8c, 2a89700, 6d3af36, 2f2a4c0, receipt 188]

**TF-4. Template-literal capture defect class.** immigration stamp resource URL (dollar-brace e .bg .image.src, 500f57c/e929b8c); SMEDAN pack: 4 external font loads + ${logo}/${item} artifacts (desk D-5, Desk A seat, definition per owner-forwarded adjudication — raw pack not inspectable from this seat, class corroborated). Capture-pipeline guard awaits ruling. [500f57c, e929b8c, c8f21a3 forward]

**TF-5. CAC pack is a bot-challenge shell.** cac-v2 committed bytes = challenge page, dom_bytes 6,145, resources=[]; live /cac serves older v0.1 shell (9cded7a4). Real-site capture blocked by bot challenge; disposition pending CAC policy. Disclosed by desk, confirmed by this seat's stamp parse. [PACKS-MANIFEST.md, 403ece9, 500f57c]

**TF-6. CBN pinned-state comparison OPEN.** Committed capture f63dc323 verified byte-exact from two seats; scan clean (2 YouTube embeds, 0 external img/css); band y=660–700 evidence crops committed for human validation. The OFFLINE CBN pack has not been supplied to either verification seat — no closure possible until handoff. "Page not found 1 vs 2" reconciliation incoming per desk, not assumed. [500f57c, 403ece9, c8f21a3 forward]

**TF-7 (desk D-3). Wave reader population / canonical-corpus question.** Master corpus NOT swapped (gov.ng 659 docs, NIMC 4 fts hits, from-scratch measurement) but foreign content present (Ukrainian: 60 title / 79 fts); the wave's 932-doc reader population not inspectable from the sibling seat (disclosed). Canonical ruling (5,000-doc kit vs 932 wave vs kb5k) OPEN — no seat claims it. Law 4 dispute dissolved: wave search and pack-local search measured different objects; the wave's inability to find pack text corroborates the population question from three seats. [aec1425, c8f21a3 forward]

**TF-8. Quarantine disposition.** 12,722 docs (cloud-wave 11,939 + door-onefile-v06 783): recorded-not-inspectable, absent from index (measured). Disposition = owner ruling. Freeze violation enforcement recorded at 897ffe1; corpus verified frozen at 1,341,437. [aec1425, 897ffe1, d5174de]

**TF-9. Unexplained counter deltas (Team E, honest flags).** band2_docs +1,800 over range; fts rows −1,086 under band-sum. Recorded, not repaired, unexplained. [aec1425]

**TF-10. Marker vocabulary divergence (method risk).** health's stamp uses `harz-provenance:` while older packs/other seats searched "HARZ VISUAL PRESERVATION" — seat-to-seat marker searches diverge until the marker vocabulary is named. Truncation finding unaffected. ADOPTED by both desks (receipts 188 and the Team D-close forward): markers named per object in the ledger before Wave 2 — health uses `harz-provenance:`, Stage-1 packs use "HARZ VISUAL PRESERVATION". [c8f21a3 forward / aeab53e / receipt 188]

## 3. PENDING (blocks Wave-1 closure)

1. Team B six-law site acceptance report (incl. honest NOT-TESTED for NIS, NCDC).
2. Desk A's own Teams A, B, C, E execution reports.
3. Offline CBN pack handoff (closes TF-6).
4. Desk D-number ledger definitions D-0…D-6 full handoff from the out-of-credit desk (this ledger cites only owner-forwarded definitions).
5. Owner rulings on: stamp re-stamp, Stage 2 CSS embedding, CAC policy, template-literal guard, canonical corpus (D-3), quarantine disposition (TF-8).
6. A serve path for health-v2 (38MB, over KV limit) to run the TF-3 decisive offline-render experiment.

Nothing merged, nothing repaired, protected state frozen. This ledger updates as the pending reports land; entries are evidence-cited and no number here is unmeasured.

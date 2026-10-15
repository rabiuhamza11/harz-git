# WAVE 1 — CONSOLIDATED BLOCKER LEDGER
**Team F:** Hauwa's desk (owner order, Oct 14, 2026 — "I add team f to your desk. The owner of the desk is out of credit.")
**Operating contract (inherited, verbatim from dispatch):** record repository state, read-only first, protected state untouchable, no claim without an executed check, failures and unknowns declared explicitly, no duplicate assignments, no invented numbers.
**Scope note:** this is the consolidation of LANDED evidence only. Desk-side defect IDs D-0…D-6 are referenced ONLY where their definition arrived in owner-forwarded dispatches; their full definitions live on the out-of-credit desk and are pending handoff. Nothing here invents or renumbers them.

## 1. WAVE-1 REPORT STATUS

| Team | Assignment | Status | Evidence |
|---|---|---|---|
| A | Visual closure (immigration refs, CBN capture, provenance stamps) | LANDED + ADJUDICATED (conditional acceptance, owner ruling) + reproduced from 2 seats | 2a2c6bd (report), 9a36de0 (ruling receipt), 500f57c (Hauwa seat reproduction), 403ece9 (desk verification) |
| B | Site acceptance, six-law matrix (styles/images/fonts/search/provenance/offline), per-site pass/fail | LANDED per receipt 189 (Team B matrix + font census filed on desk seat); raw report file pending handoff to shared repo. Honest NOT-TESTED marks for NIS and NCDC per original dispatch | receipt 189 (raw pending handoff) |
| C | Package integrity (hashes, round-trip, 25MB ceiling, deployed-vs-committed) | LANDED from 2 seats, cross-verified | 500f57c, e929b8c, 2a89700, 2f2a4c0 (Hauwa), 403ece9, 6d3af36 (desk) |
| D | Internetless verification (5,000/5,000 binding, frozen testset, boot pins, text-library, airplane-mode limitation) | LANDED per owner-forwarded adjudication (c8f21a3): 5,000/5,000 binding, identical miss-case across three environments, airplane mode device-only on both seats, live reader matches F1 | c8f21a3 (adjudication record); raw report on desk seat, pending handoff |
| E | Corpus integrity (shard counts, live seal, quarantine, population-swap re-measure) | LANDED | aec1425 (this repo: seal HOLDS exactly, 1,341,437 docs, quarantine measured absent from index) |
| F | Independent reproduction + this consolidated ledger | THIS LEDGER (Hauwa desk) | commits cited per entry |

## 2. CONSOLIDATED BLOCKERS / DEFECTS (all repairs unauthorized; protected state frozen)

**TF-1. Provenance stamp 20,000-char truncation.** health-v2: cut at char 19,999/19,999 span; immigration-v3: 19,984/20,000. Root cause = stamp-writer cap (both seats agree exactly). Remediation steps on file, NOT authorized; frozen stamps untouched. [403ece9, 500f57c, e929b8c C5 revision, fa8e618]

**TF-2. Offline styling loss — external CSS dependency class.** immigration: 232 external stylesheet links (222 site / 6 themigrate.xyz / 4 googleapis); health: 60 links (desk) / 61 (Hauwa; 1-count regex delta disclosed both seats; 48 health.gov.ng / 4 googleapis / 4 cdnjs + residue). Linked CSS content absent from packs; the capture pipeline's own stamp proves it measured the CSS it failed to embed. Substance agreed across all seats; the googleapis sub-count delta (9 vs 4) is a named counting-object variant (receipt 188). [403ece9, 500f57c, e929b8c, fa8e618, 6d3af36, receipt 188]

**TF-3. health-v2 rendering-path external fonts — SETTLED ACROSS SEATS (receipt 188).** Both seats now measure identically against the sha-identical blob 63750cdf: 105 @font-face openers = 51 with embedded data URIs + 54 with external https URLs, ALL 54 in the rendering path (inside style blocks opened by the pipeline's own vf-embed comment — the variable-font embed step was left half-done), ALL 54 pointing at moh.dotmac.ng. At resolution level: 15 of 32 (family,weight,style) keys are external-only and final — all Poppins, weights 100–900, normal+italic — offline font loss for body text. The desk's earlier "0" was a quote-restricted regex artifact, retracted in full (6d3af36); verbatim pinned sample: Poppins italic 100 loading woff from moh.dotmac.ng at blob offset 20903691 (2f2a4c0). Receipt 186's health fonts FAIL stands. DECISIVE EXPERIMENT (named, agreed): serve the pack, render offline, watch whether the Poppins faces fall back — BLOCKED on a serve path (38MB pack exceeds the KV 25MB limit). Ledger holds both seats' measurements with objects named. Scanner law recorded: two seats agree = independent only if tokenization assumptions differ — a shared assumption is a shared blind spot. Wave-1 has caught THREE instances of this class: (1) href-attribute regex boundary (2-tag CSS delta), (2) comment-window scan mislabeling the 20,000-char truncation, (3) quote-form regex blind spot (unquoted url(https://...) invisible to a double-quoted-only scanner, the desk's retracted 0). Wave-2 revision policy: cross-seat scanners must declare their tokenization assumptions, and any 'confirmed from two seats' claim must show the assumptions differ. The desk's retraction of its 0 (6d3af36, forwarded to owner) aligns all seats with the pinned block at offset 20903691; no dispute remains on TF-3 anywhere.

CONTRADICTION RECORDED (Team F duty, Oct 14): a later desk forward states "rendering-path external fonts measured 0 from two seats, the earlier 54 reclassified as inventory counting." This repeats the quote-restricted-regex position already retracted by the desk itself in 6d3af36 ("the ORIGINAL e929b8c '54' census claim was CORRECT and must not be reclassified as documentation-based") and contradicted in receipt 188. It does not reproduce against the pinned evidence: the verbatim block at offset 20903691 of the sha-63750cdf blob is an external-only @font-face src inside a style block, and container classification measures all 54 in rendering path, zero in inventory. The ledger holds to the executed check per the operating contract; the decisive offline-render experiment (pending a serve path) settles the question empirically if any seat still doubts the static measurement. [e929b8c, 2a89700, 6d3af36, 2f2a4c0, receipt 188]

**TF-4. Template-literal capture defect class.** immigration stamp resource URL (dollar-brace e .bg .image.src, 500f57c/e929b8c); SMEDAN pack: 4 external font loads + ${logo}/${item} artifacts (desk D-5, Desk A seat, definition per owner-forwarded adjudication — raw pack not inspectable from this seat, class corroborated). Capture-pipeline guard awaits ruling. [500f57c, e929b8c, c8f21a3 forward]

**TF-5. CAC pack is a bot-challenge shell.** cac-v2 committed bytes = challenge page, dom_bytes 6,145, resources=[]; live /cac serves older v0.1 shell (9cded7a4). Real-site capture blocked by bot challenge; disposition pending CAC policy. Disclosed by desk, confirmed by this seat's stamp parse. [PACKS-MANIFEST.md, 403ece9, 500f57c]

**TF-6. CBN pinned-state comparison OPEN.** Committed capture f63dc323 verified byte-exact from two seats; scan clean (2 YouTube embeds, 0 external img/css); band y=660–700 evidence crops committed for human validation. The OFFLINE CBN pack has not been supplied to either verification seat — no closure possible until handoff. "Page not found 1 vs 2" reconciliation incoming per desk, not assumed. [500f57c, 403ece9, c8f21a3 forward]

**TF-7 (desk D-3). Wave reader population / canonical-corpus question.** Master corpus NOT swapped (gov.ng 659 docs, NIMC 4 fts hits, from-scratch measurement) but foreign content present (Ukrainian: 60 title / 79 fts); the wave's 932-doc reader population not inspectable from the sibling seat (disclosed). Canonical ruling (5,000-doc kit vs 932 wave vs kb5k) OPEN — no seat claims it. Law 4 dispute dissolved: wave search and pack-local search measured different objects; the wave's inability to find pack text corroborates the population question from three seats. [aec1425, c8f21a3 forward]

**TF-8. Quarantine disposition.** 12,722 docs (cloud-wave 11,939 + door-onefile-v06 783): recorded-not-inspectable, absent from index (measured). Disposition = owner ruling. Freeze violation enforcement recorded at 897ffe1; corpus verified frozen at 1,341,437. [aec1425, 897ffe1, d5174de]

**TF-9. Unexplained counter deltas (Team E, honest flags).** band2_docs +1,800 over range; fts rows −1,086 under band-sum. Recorded, not repaired, unexplained. [aec1425]

**TF-10. Marker vocabulary divergence (method risk).** health's stamp uses `harz-provenance:` while older packs/other seats searched "HARZ VISUAL PRESERVATION" — seat-to-seat marker searches diverge until the marker vocabulary is named. Truncation finding unaffected. ADOPTED by both desks (receipts 188 and the Team D-close forward): markers named per object in the ledger before Wave 2 — health uses `harz-provenance:`, Stage-1 packs use "HARZ VISUAL PRESERVATION". [c8f21a3 forward / aeab53e / receipt 188]

## 3. PENDING (blocks Wave-1 closure)

1. Desk A's own Teams A, B, C, E execution reports (Desk A seat).
2. Desk A's own Teams A, B, C, E execution reports.
3. Offline CBN pack handoff (closes TF-6).
4. Desk D-number ledger definitions D-0…D-6 full handoff from the out-of-credit desk (this ledger cites only owner-forwarded definitions).
5. Owner rulings on: stamp re-stamp, Stage 2 CSS embedding, CAC policy, template-literal guard, canonical corpus (D-3), quarantine disposition (TF-8).
6. A serve path for health-v2 (38MB, over KV limit) to run the TF-3 decisive offline-render experiment.

RECEIPT 189 (convergence): the ledger entry for health-v2 now reads identically on all three records — both dependency classes, 60/61 external CSS links and 54 rendering-path font sources to moh.dotmac.ng, immigration/NIMC/CAC clean on fonts. Wave-2 scanner rule absorbed as standing policy on all seats. Wave 1 remains open pending the reports above.

Nothing merged, nothing repaired, protected state frozen. This ledger updates as the pending reports land; entries are evidence-cited and no number here is unmeasured.


## RULING RECEIPT — WAVE 1 FINAL ADJUDICATION (owner, Oct 14, 2026)

Team F's final report (175ee9e) received. Ruling: WAVE-1 READ-ONLY RECON = CONDITIONALLY ACCEPTED. FINAL SYSTEM ACCEPTANCE = WITHHELD. This ledger remains the consolidated Wave-1 evidence record.

Per-team rulings: A conditional acceptance maintained; B partial completion recorded, acceptance open (NIS/NCDC NOT-TESTED); C artifact identity accepted for the measured artifacts; D accepted within the tested scope; E measured state accepted, population + quarantine decisions open. The 12,722-record index absence must NOT be read as 12,722 corrupt or deleted docs — disposition depends on the canonical-corpus and quarantine rulings.

Blockers 1-5 (stamp truncation; immigration CSS; health CSS; health fonts; template-literal class): REMEDIATION CANDIDATES APPROVED FOR PLANNING; EXECUTION NOT AUTHORIZED. Blocker 6 (CAC): separate capture required, challenge shell preserved. Blocker 7 (CBN): blocked pending artifact handoff. Blockers 8-9 (D-3 canonical; quarantine): RESERVED FOR EXPLICIT OWNER DECISION. Blocker 10 (counter deltas + marker vocabulary): open pending reconciliation against authoritative ledgers; marker semantics defined per object without retroactively changing existing evidence meaning.

Five isolated owner decisions recorded: A canonical corpus OPEN (no population replacement/deletion/reclassification until D-3 package presented); B quarantine disposition OPEN (quarantine in force; no release/delete/rewrite/silent reclassification; package must separate body integrity, source identity, historical identity, eligibility — digest check alone resolves none of the four); C provenance repair PLANNING APPROVED (new candidate artifacts, never in-place rewrites; complete machine-readable provenance; malformed/truncated output rejected); D offline dependency repair PLANNING APPROVED (complete dependency inventories incl. nested CSS imports + fonts + dynamic resources; acceptance target = verified offline behavior with honest disclosure, not zero-URL spot checks); E capture-pipeline correction PLANNING APPROVED (regression-tested genuine-URL vs JS-expression distinction; SMEDAN D-5 gets its own evidence and regression case, not assumed identical to immigration).

Required handoffs before final closure: (1) Team B raw six-law matrix + authoritative D-0..D-6 definitions; (2) CBN offline pack + identity metadata; (3) authorized health-v2 serving path; (4) Desk A remaining reports with immutable evidence refs; (5) D-3 authoritative definition + proposed ruling; (6) quarantine eligibility + identity evidence.

Billion-mission boundary (owner, verbatim substance): the 12,689,085,940 attested figure is recorded as a SEPARATELY RECEIPTED MISSION CLAIM, not part of Wave-1 package or corpus acceptance. It does not establish uniqueness, provenance, body identity, or canonical membership. Any future claim about that population must name the counting unit, dedup rule, attestation criteria, and exact evidence anchor. No acceptance may be inferred from a mission-level count.

Delivery constraint recorded: integration-credit exhaustion is a delivery constraint, not an evidence failure. Pending uploads (Vision-V2 PDF, Team F raw report file) remain OUTSTANDING and undelivered until the receiving side confirms access.

Binding execution boundaries (unchanged): no repair of frozen artifacts; no merge or deployment change; no quarantine release; no canonical-corpus replacement; no acceptance inferred from a mission-level count. Every remediation candidate must receive a new identity, independent verification, and a separate acceptance ruling.

Next milestone (owner's words): not another broad sweep — resolve the two owner decisions, obtain the missing acceptance artifacts, and authorize specific remediation candidates one at a time.


## DELIVERY REGISTER (owner confirmation, Oct 14, 2026)

Team F Final Report - Wave 1 (TEAM-F-FINAL-REPORT-WAVE1.pdf): DELIVERED, recipient access confirmed.
HARZ Vision-2 Contract (HARZ-Vision-V2-Contract.pdf): DELIVERED, recipient access confirmed.

Owner ruling on delivery: queue CLEARED for both artifacts. Commit 8e6cee4 and both PDF artifacts preserved. The consolidated ledger remains the authoritative audit record. DELIVERY IS RECORDED SEPARATELY FROM TECHNICAL ACCEPTANCE — this confirmation authorizes no repairs, merges, deployments, or acceptance changes. Wave-1 remains conditionally accepted; final system acceptance still withheld pending outstanding evidence and owner rulings.

## TF-9 INVESTIGATION RESULT — COUNTER DELTAS RESOLVED BY MEASUREMENT (Team F, Oct 15, read-only)

**Delta 1 (band2_docs 430,515 vs range 428,715, +1,800): RESOLVED.** Authoritative ledger shows exactly 430,515 rows in ids 900,001..1,330,515 — the counter is arithmetically exact for an upper bound of 1,330,515, not 1,328,715. Measured: exactly 1,800 docs exist at ids 1,328,716..1,330,515 (the FIRST 1,800 freeze-violation docs). The FX builder saw/counted that first violating batch; band2_last_id=1,328,715 records only the parity boundary. The mystery was the boundary, not the count. Consequence: the claim "FX index frozen at parity" is NOT strictly true — band2 carries up to 714 beyond-parity FTS rows (429,429 indexed vs 428,715 parity docs; true figure between 0 and 714 because the 1,086 unindexed docs cannot be placed by id post-migration).

**Delta 2 (fx_fts 1,329,429 vs band-sum 1,330,515, -1,086): RESOLVED.** band2 FTS rows = 1,329,429 - 900,000 (bands 0+1) = 429,429; 430,515 seen - 429,429 indexed = 1,086 docs that produced no FTS row (empty/unindexable at build). Exact id split INDETERMINATE by measurement: the bodies store is keyed by content_hash and the docs-table text column was blanked by the FX-2 body migration. Recorded as indeterminate, not guessed.

## TF-11 — NEW FINDING: POST-SEAL WRITES (Team F, Oct 15, read-only; alert class)

Docs table now reads MAX(id)=1,342,482 = COUNT(*) (contiguous). The verified seal was 1,341,437 (Team E, Oct 14, last write 04:58:03.212Z). Measured: +1,045 rows beyond the seal at ids 1,341,438..1,342,482, fetched_at 2026-10-14T05:02:18Z through 2026-10-15T08:05:36Z — writes began 4 minutes after the seal's last write and continued until this morning. Sources: dump-enwiki 715, cloud-wave 324, bulk-enwiki 6. Count stable across a 90-second re-measurement: writes have stopped.

**Open door identified (measured, not assumed):** the freeze enforcement deleted the corpus-wave worker, but harz-million-corpus /api/ingest-wave (WAVE_KEY route) remains LIVE with no cron — the post-seal writes are direct POSTs through that door by external million-mission writers holding WAVE_KEY, who can label any source (cloud-wave labels included). Honest self-disclosure by this seat: the Oct 12 v0.4.0 redeploy of harz-million-corpus (1B target + attested UI) kept ingest-wave live; the deploy predates the Oct 14 enforcement, but the door this seat verified with a test wave is the same door these writers used.

**Post-parity population now totals 13,767 docs** (ids 1,328,716..1,342,482): the original 12,722 quarantine class + these 1,045. DISPOSITION RESERVED TO OWNER (Decision B framework; no classification of the new 1,045 as quarantine is made here — that is the owner's ruling).

**Recommendation awaiting owner order (no action taken):** close the ingest door (WAVE_KEY rotation or ingest-route stub) to end further post-seal writes. This is a deployment change under the Oct 14 boundary and requires explicit authorization.

All queries read-only. No repairs, no merges, no stubs, no key rotations executed. Evidence: query transcripts above, reproducible against the same ledgers.

## STATE UPDATE — FREEZE LIFT + SHARD PLAN (Team F, Oct 15, read-only)

1. TF-11 SUPERSEDED IN PART (owner ruling 54971cb): the enwiki portion of the post-seal writes is RECLASSIFIED as owner-authorized work; enforcement stood down; the freeze is lifted for WHOLE ingestion (owner, Oct 15 ~09:53 WAT). The ingest-door closure recommendation is WITHDRAWN (the door is intentionally open again). REMAINS OPEN: attribution of the 324 cloud-wave backdated-flush rows (written via the ingest door with a cloud-wave source label — attribution investigation not yet executed).

2. QUARANTINE (blocker TF-8 / Decision B) REOPENS FOR ADJUDICATION (D-D in the shard-plan ruling set): now that ingestion is unfrozen, the four-question evaluation (Decision Package B) can proceed; read-only inspection pass recommended.

3. SHARD PLAN v1 (desk draft 0198afc) — TEAM F VERIFICATION OF ITS MEASURED CLAIMS (read-only, this seat):
   - bodies rows: 1,349,186 (measured; +20,471 beyond the 1,328,715 migration count — the enwiki writer is actively filling shard-00-to-be RIGHT NOW), payload 7.91GB text. File-size basis ~9.04GB of 10GB (desk-measured, consistent with payload + page overhead). Headroom shrinking at live speed; the desk's caution (no bulk before routing) is CONFIRMED AND QUANTIFIED.
   - master docs: 1,342,482 rows; metadata payload ~130MB with text column blanked (file size stays ~3.85GB until a VACUUM, which is NOT authorized — recorded).
   - fx_fts: 1,329,429 rows (unchanged, frozen index unaffected by sharding — plan claim consistent).
   - Billing math CHECKS OUT: D1 bills account-total; included 5GB then ~$0.75/GB-mo; 17.44GB now = ~$9.3/mo ALREADY LIVE; 25GB combined cap = ~$15/mo. NOTE FOR OWNER: zero-budget law is already exceeded by storage reality (~$9.3/mo at current state); D-B sets the ceiling on an already-billing resource.

## OWNER COST RULING — "ANYTHING MONEY, WE ARE OUT" (Oct 15, 12:05 WAT)

D-B (25GB cap, ~$15/mo): REJECTED by owner. D-C (enwiki 1M subset): no new budget; scope freezes at what is already loaded. No new paid anything.

FACTS THIS RULING COLLIDES WITH (measured, this seat):
1. The account is ALREADY on the Workers PAID plan (required: free plan caps D1 at 5GB total; the account holds 17.44GB, impossible on free tier).
2. Current billing is therefore ALREADY LIVE: ~$5/mo plan + ~$9.3/mo storage over the 5GB inclusion = ~$14/mo, recurring, independent of any new cap decision.
3. If that existing bill cannot be paid, Cloudflare suspension puts ALL 41 D1 databases, all workers, and the whole HARZ stack at risk. This is the single largest standing risk to the mission and it is NOT a future decision — it is current state.

ZERO-COST ENDGAME (decision package drafted, NOTHING executed — every step owner-ruled):
a. Stop bulk ingestion now (enwiki writer paused) — stops new paid-storage growth. Trickle continues only by explicit order.
b. VACUUM the docs table: file is ~3.85GB with only ~130MB live payload (text blanked by FX-2 migration; pages still allocated). VACUUM reclaims ~3.7GB. Requires owner authorization (state change; Migration Protocol gates apply; read paths unaffected).
c. Move the 9.04GB bodies store OFF D1 to a free-tier store (R2 free tier: 10GB, zero egress fees; R2 was parked Oct 12 for technical reasons — cost pressure reopens the question; own hardware is the fully-sovereign alternative). Requires Migration Protocol v1 gates + reader routing change (deployment, owner-ruled).
d. End state: account D1 under 5GB → downgrade to Workers FREE plan → $0/mo recurring. All HARZ services that fit free-tier limits stay live.

The shard plan (0198afc) is PARKED: shards are cost-neutral (billing is account-total) and only make sense if a raised cap is affordable. Its routing design remains valid evidence for the zero-cost endgame.

## GAP-CLOSURE MATH — EXACT, PER the sibling's honest flag (Team F, Oct 15, measured)

The sibling is right: the 23MB Sept relic pair (their account) cannot close a 0.9GB gap. The exact census (API file_size per DB, this account, Oct 15) names what can. Account total 17.44GB = corpus 12.88 (bodies 9.04 + master 3.85 + fx-idx 0.99) + NON-corpus 3.56GB, of which the SIX mining DBs (harz-mine, -2, -3, -5, -6, -7) hold 2.889GB, sovereign vault 0.28GB, harz-db 0.14, harz-search-ng-1 0.13, harz_search_v02 0.11, remainder ~0.04.

Post-curation account states (corpus rebuilt ~2.4GB):
1. Mines kept: 5.96GB — OVER the 5GB ceiling by ~0.96GB (the flag, quantified).
2. Mines consolidated/deleted (needs relic ruling + chain-state dependency verification; no workers on this account bind them — worker list verified: only harz-fx, harz-fx-build, harz-fx-search, harz-million-corpus): 3.07GB — under ceiling with 1.9GB margin.
3. Mines kept + bodies-KEEP compressed v0.2-style at the measured 2.5x (1.9GB -> 0.76GB): 4.82GB — under ceiling with margin, NO deletion of the mine history required.
Either path 2 or path 3 alone closes the gap. Path 3 is build-work not deletion (recommended primary); path 2 is the deeper cleanup (recommended as the eventual archive consolidation anyway). Path 2 alone exceeds the ceiling if neither executes — that is the ledger's explicit warning.

## VAULT CROSS-CHECK RESOLUTION (objects and seats named)
Two sovereign vault deployments exist, both statements true: THIS account's harz-sovereign-store-00 (file 0.28GB, 3,689 bundles, 89,629 docs, measured from this seat) carries the real v0.2 load; the sibling's vault on hamzarabiu390 (7 docs, 1 bundle, account census 1.053GB/5GB, their seat) is verified at design scale. The wall is symmetric. Compression planning number: 2.5x (both seats concur; 13.92x was a non-representative test batch).

## RULING RECEIPT (owner, Oct 15): PATH 3 APPROVED — STORAGE CLOSURE
Full ruling recorded: Path 3 (v0.2-style compression) approved as primary; preservation mandatory (no mine DB deletion/consolidation/overwrite; no retained body dropped; evacuation copy + SHA-256 intact); compression must prove result (pre-compression measurement, inventories, byte-for-byte integrity vs original hashes, interrupted-write/restart/partial/duplicate/corruption tests, no replacement of originals until all integrity tests + rollback readiness pass); 5GB ceiling is a hard gate (measured usage, not projection; documented margin; zero unexplained missing/altered bodies; zero integrity failures; workers functioning); Path 2 deferred pending chain-state dependency evidence (absence of bound workers alone is not safety); evacuation and curation remain separate gates; two vault deployments kept separately identified; gate-by-gate execution with commit+evidence+pass/fail recorded; unexpected discrepancy = stop and investigate, never automatic cleanup.

## GATE 1 — AUTHORITATIVE PRE-COMPRESSION MEASUREMENT (Team F, Oct 15) — PASS
Keep-class inventory (hunted-recrawl, hunted-stage2, web, cgspace-unspecified, door-onefile-v06, team-b-recovery, cloud-wave pending Decision B, dump-enwiki): 29,091 docs, 29,091 distinct hashes, ALL 29,091 bodies found in the verified evacuation copy (0 missing). Keep-class body text: 219,370,011 bytes (219MB) — this CORRECTS the curation draft's 1.9GB estimate (that figure was file-arithmetic, not measured text; the measured keep text is 219MB). Sample battery: 1,000 docs, 2.87x gzip-9, roundtrip byte-exact.

## GATE 2 — FULL BUNDLE BUILD + COMPLETE VERIFICATION BATTERY (Team F, Oct 15) — PASS
Built the complete keep-class bundle store locally (mirrors v0.2 layout: bundles table + doc_index, 100 docs/bundle): 291 bundles, raw 233,592,122B -> compressed 82,438,170B = 2.83x, store file 89,587,712B (90MB incl. index).
Verification per the ruling, ALL COMPLETE (not sampled):
- FULL VERIFY: 29,091/29,091 bodies decompressed byte-exact vs their original sha256, 0 mismatches
- Corruption detection: PASS (byte-flip caught by gzip CRC)
- Truncation/partial-bundle: PASS (detected)
- Duplicate handling: PASS (bundle seq PK blocked)
- Inventory reconciliation: 29,091 indexed, unique, covers the complete keep set exactly
- Cloud-wave/quarantine-class bodies INCLUDED in the store (preserved pending Decision B; nothing deleted)
- Rollback readiness: the authoritative 9.04GB bodies DB is UNTOUCHED; the 8.15GB evacuation copy + sha256 receipt intact; the local store is a parallel artifact, nothing replaced.
Evidence: GATE1-MEASUREMENT.json + GATE2-BUNDLE-VERIFICATION.json committed.

## MEASURED MARGIN ANSWER (the ruling's GB/GiB question)
Account total measured: 17,441,652,736 bytes = 17.442 decimal GB = 16.24 binary GiB (the desk's 17.44GB was decimal; API reports plain bytes). Post-curation + compressed projection: corpus stack ~0.52GB (keep-store 0.09 + master rebuild ~0.13 + fx rebuild ~0.3) + non-corpus 3.56GB = ~4.08GB account total. This passes BOTH bases with margin: 920MB under 5GB decimal, 1.29GB under 5GiB binary. The fragile 180MB margin is gone; measured margin ~5x larger. Projection remains a projection until the D1 deployment gate measures actual usage.

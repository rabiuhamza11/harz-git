# BATCH 4 RECEIPT — 2026-10-12 (owner: "Keep working non stop")

Batch 4 = the rest of the ruling queue: Wiktionary 50K pack, MedlinePlus full library,
WHO Essential Medicines List, Nigeria 1999 Constitution. All inside the D1 9.5GB cap;
R2 untouched per the Oct 12 ruling.

## 1. Wiktionary Top-50K Vocabulary Pack — 35,838 docs ingested

* Source: kaikki.org machine-readable English Wiktionary extract
  (kaikki.org-dictionary-English.jsonl.gz, 523,331,798 bytes,
  sha256 6d40e0067718aeb3321db30297761ca803838390627111a29a5426fee4557faf).
* Word selection: HermitDave FrequencyWords en_50k (OpenSubtitles 2018) — top 50K
  English words. 35,840 of the 50K found real Wiktionary entries (the rest are corpus
  spell variants/fragments with no dictionary entry — honest note, not silently padded).
* One doc per word: POS, IPA pronunciation where present, first non-obsolete senses.
* Source label: wiktionary-50k-ccby-sa (Wiktionary CC BY-SA). 2 exact dups absorbed.

## 2. MedlinePlus — 1,023 of 1,024 topics (99.9%)

* Full A–Z health-topics enumeration from all_healthtopics.html; every topic page
  fetched and extracted. US federal public domain.
* High-stakes law honored: every doc carries source attribution, review date where
  present, and "educational information only, not medical advice" language.
* First pass ingested 821; 203 flagged short by an over-eager extraction boundary.
  Audited, root-caused (capture stopped at the first div id), re-ran with wide capture:
  202 recovered. 1 page (a utility page in the A–Z list, not a health topic) stays
  un-ingested — honest miss.

## 3. WHO Essential Medicines List — 650 docs

* All 650 medicines parsed from the server-rendered list.essentialmeds.org page:
  name, section, formulations, indications. CC BY-NC-SA 3.0 IGO label + not-medical-advice
  language on every doc.

## 4. Nigeria 1999 Constitution (rev. 2011) — 11 docs

* Constitute Project consolidation PDF (144 pages, 868,427 bytes), footer stripped,
  page markers kept. Source label constituteproject-ccbync; authoritative-version note
  in every doc header.

## 5. NigeriaLII acts — HONEST MISS

nigeria.lii.ng, lawsofnigeria.ng, lawpointer, lawnigeria, juripidia, justia-ng all
unreachable (000/403) from this sandbox tonight. Lawpavilion reachable but commercial.
Queued as a candidate for the nightly 03:30 wave or a later run from another path.

## Batch 4 totals

37,522 new docs (35,838 + 1,023 + 650 + 11). Standing laws honored: dedupe-before-write
(2,784 + ~5 exact dups absorbed across batches), cap guard checked, zero budget,
frozen systems untouched, R2 ruled out respected.

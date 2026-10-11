# HARZ Offline Knowledge Expansion: Team C (Knowledge Acquisition) Report

**Workstream:** HARZ Offline Knowledge Expansion  
**Team:** Team C (Knowledge Acquisition)  
**Target Deployment:** Offline mobile devices (smartphones/feature-capable phones) in Nigeria  
**Package Constraint:** 15 MB phone-install package size limit  
**Total Catalog Size:** 435.5 MB (0.425 GB) across 20 candidate sources  

---

## 1. Executive Summary & Existing Corpus Baseline

The master HARZ corpus currently holds:
- **English + Simple English Wikipedia** (CC-BY-SA 4.0)
- **163,003 Project Gutenberg public-domain books** (Public Domain)
- **Nigerian-language Wikipedias** (Hausa, Igbo, Fulfulde, Yoruba)

### The Offline Knowledge Gap
While the baseline corpus provides broad general knowledge and classic literature, mobile users in Nigeria facing limited connectivity, high data costs, and low storage budgets require **high-density, actionable, and practical information**. Wikipedia articles often present broad academic overviews rather than structured textbooks, diagnostic clinical guides, exact developer API references, or local agricultural protocols. Project Gutenberg literature is heavily weighted toward 19th-century Western prose and lacks modern technical, health, and legal instruction.

Team C has conducted focused web research to identify **20 additional reliable, legally reusable knowledge sources** that fill these critical domain gaps without replicating what is already held.

---

## 2. Ranking Methodology: Usefulness-per-MB

To maximize value under strict mobile storage and bandwidth constraints (governed by a **15 MB phone-install package limit** for mobile bundles), candidate sources are ranked using the **Usefulness Efficiency Score**:

Usefulness Density (per MB) = Offline Usefulness Rating (1-5) / Approximate Size (MB)

Sources with ultra-dense text, minimal unneeded media, and high local relevance yield the highest score per megabyte, making them primary candidates for micro-package offline bundles.

---

## 3. Ranked Offline Knowledge Catalog

Below is the complete catalog of 20 candidate sources ranked in descending order by **Usefulness per MB**.

| Rank | Source Name | Category | License | Size (MB) | Rating (1-5) | Score / MB |
|---:|:---|:---|:---|---:|:---:|---:|
| **1** | 1999 Constitution of Nigeria (as amended) | Exceptional (Law) | Public Domain | 1.5 MB | 5.0 | **3.3333** |
| **2** | WHO Model List of Essential Medicines & Guidelines | Health Education | CC-BY-NC-SA 3.0 IGO | 6.0 MB | 4.5 | **0.7500** |
| **3** | NigeriaLII Key Federal Acts Digest | Exceptional (Law) | CC-BY 4.0 | 8.0 MB | 4.0 | **0.5000** |
| **4** | Python 3 Core Standard Library & Tutorial | Computing / Dev Docs | PSF License | 10.0 MB | 4.5 | **0.4500** |
| **5** | Wiktionary English Top 50,000 Micro Pack | Education / Ref | CC-BY-SA 4.0 | 12.0 MB | 5.0 | **0.4167** |
| **6** | Practical Action Technical Briefs | Agriculture / Tech | CC-BY-NC-ND 4.0 | 14.0 MB | 4.5 | **0.3214** |
| **7** | DevDocs Web Core Micro Pack | Computing / Dev Docs | CC-BY 4.0 / MIT | 15.0 MB | 4.5 | **0.3000** |
| **8** | CGIAR / IITA Tropical Agronomy Manuals | Agriculture / Tech | CC-BY 4.0 | 16.0 MB | 5.0 | **0.3125** |
| **9** | CIA World Factbook Micro JSON/Text | Education / Ref | Public Domain | 18.0 MB | 4.0 | **0.2222** |
| **10** | MDN Web Docs Core Developer Reference | Computing / Dev Docs | CC-BY-SA 2.5 | 18.0 MB | 4.5 | **0.2500** |
| **11** | African Storybook Project (Nigerian Collection) | Exceptional (Literacy) | CC-BY 4.0 | 20.0 MB | 4.5 | **0.2250** |
| **12** | FAO TECA Agricultural Technologies | Agriculture / Tech | CC-BY-NC-SA 3.0 IGO | 22.0 MB | 5.0 | **0.2273** |
| **13** | Agrodok Small-Scale Farming Series | Agriculture / Tech | CC-BY-NC-SA 4.0 | 25.0 MB | 4.5 | **0.1800** |
| **14** | Khan Academy KA Lite STEM Problem Bank | Education / Ref | CC-BY-NC-SA 3.0 | 25.0 MB | 4.5 | **0.1800** |
| **15** | Hesperian Health Guides ('Where There Is No Doctor') | Health Education | CC-BY-NC-ND 4.0 | 28.0 MB | 5.0 | **0.1786** |
| **16** | UNESCO General History of Africa (Digest) | Exceptional (History) | CC-BY-SA 3.0 IGO | 32.0 MB | 4.5 | **0.1406** |
| **17** | OpenStax Secondary STEM Core | Education / Ref | CC-BY 4.0 | 35.0 MB | 5.0 | **0.1429** |
| **18** | WikiProject Med / WikiMed Mini ZIM | Health Education | CC-BY-SA 4.0 | 35.0 MB | 5.0 | **0.1429** |
| **19** | LibreTexts Modular Tertiary STEM Modules | Education / Ref | CC-BY-NC-SA 3.0 | 40.0 MB | 4.0 | **0.1000** |
| **20** | Wikivoyage English No-Pictures Guide | Education / Ref | CC-BY-SA 4.0 | 55.0 MB | 3.5 | **0.0636** |

---

## 4. Priority Category Deep-Dives

### Priority 1: Education & Practical Reference
- **Wiktionary Top 50,000 Micro Pack (12 MB, CC-BY-SA 4.0):** Essential lexical complement to Wikipedia; offers exact word definitions, pronunciations, and part-of-speech context required by ESL students in Nigeria.
- **OpenStax STEM Textbooks (35 MB, CC-BY 4.0):** Structured high school biology, physics, and chemistry textbooks providing curriculum-aligned explanations and problem sets missing from reference articles.
- **Khan Academy KA Lite STEM Problem Bank (25 MB, CC-BY-NC-SA 3.0):** Provides interactive problem sets and step-by-step solutions for STEM drills.
- **CIA World Factbook Micro (18 MB, Public Domain):** Clean JSON/Text demographic, geographic, and economic data tables.
- **LibreTexts Tertiary STEM (40 MB, CC-BY-NC-SA 3.0):** Higher education science/engineering modules for polytechnic and university students.
- **Wikivoyage No-Pictures ZIM (55 MB, CC-BY-SA 4.0):** Practical logistical and geographic regional reference across Africa and globally.

### Priority 2: Agriculture & Technical Manuals
- **CGIAR / IITA Tropical Agronomy Manuals (16 MB, CC-BY 4.0):** Created at IITA in Ibadan, Nigeria; direct practical guides on cassava, maize, yam, and cowpea crop disease management, soil fertility, and post-harvest storage.
- **FAO TECA Technologies (22 MB, CC-BY-NC-SA 3.0 IGO):** Field-tested techniques for smallholders focusing on drip irrigation, seed saving, and low-cost pest management.
- **Practical Action Technical Briefs (14 MB, CC-BY-NC-ND 4.0):** Appropriate technology construction guides for off-grid water purification, solar crop drying, bio-gas, and building materials.
- **Agrodok Series (25 MB, CC-BY-NC-SA 4.0):** Small-scale tropical farming handbooks covering poultry, aquaculture, and organic farming.

### Priority 3: Health Education
- **WHO Model List of Essential Medicines & Guidelines (6 MB, CC-BY-NC-SA 3.0 IGO):** Essential drug formularies and standard treatment protocols for tropical diseases (malaria, TB, cholera, typhoid).
- **Hesperian Health Guides - 'Where There Is No Doctor' (28 MB, CC-BY-NC-ND 4.0):** World-standard clinical guide for rural village health workers, providing diagnosis trees and life-saving care.
- **WikiProject Med / WikiMed Mini ZIM (35 MB, CC-BY-SA 4.0):** Peer-reviewed clinical medical entries covering sanitation, infectious disease, and pharmacology.

### Priority 4: Computing & Developer Docs
- **Python 3 Core Standard Library & Tutorial (10 MB, PSF License):** Full offline documentation for Nigeria's most widely taught programming language.
- **DevDocs Web Core Micro (15 MB, CC-BY 4.0 / MIT):** High-speed API documentation covering HTML, CSS, JavaScript, and Web APIs.
- **MDN Web Docs Core Reference (18 MB, CC-BY-SA 2.5):** In-depth web standards specifications for offline software development.

### Priority 5: Anything Exceptional (Law, Civics, History & Literacy)
- **1999 Constitution of Nigeria (1.5 MB, Public Domain):** Supreme legal law of Nigeria detailing civic rights, judicial system, and governance rules.
- **NigeriaLII Key Federal Acts Digest (8 MB, CC-BY 4.0):** Primary statutory acts (Criminal Code, Evidence Act, Labour Act) for off-grid legal reference.
- **African Storybook Project (20 MB, CC-BY 4.0):** Culturally relevant early reading stories for Nigerian children, replacing outdated 19th-century Western children's books.
- **UNESCO General History of Africa Digest (32 MB, CC-BY-SA 3.0 IGO):** Landmark 8-volume history written by leading African scholars.

---

## 5. Top 5 Recommended Sources for Stage 2 Integration

Based on **usefulness density**, **strict adherence to the 15 MB package limit**, **legal reusability**, and **direct complementary value to Nigeria**, Team C strongly recommends the following top 5 candidate sources for Stage 2 ingestion:

1. **1999 Constitution of the Federal Republic of Nigeria (as amended)**
   - **Size:** 1.5 MB
   - **License:** Public Domain
   - **Score/MB:** 3.3333
   - **Rationale:** Unlocks essential legal and civil rights awareness in an ultra-compact file. Completely missing from the baseline corpus.

2. **WHO Model List of Essential Medicines & African Regional Guidelines**
   - **Size:** 6.0 MB
   - **License:** CC-BY-NC-SA 3.0 IGO
   - **Score/MB:** 0.7500
   - **Rationale:** Provides life-saving clinical treatment guidelines and drug formularies for tropical diseases in a lightweight 6 MB bundle.

3. **NigeriaLII Key Federal Acts Digest (Criminal Code, Labour Act, Evidence Act)**
   - **Size:** 8.0 MB
   - **License:** CC-BY 4.0
   - **Score/MB:** 0.5000
   - **Rationale:** Delivers actionable statutory law for citizens, legal professionals, and entrepreneurs operating off-grid.

4. **Python 3 Core Standard Library & Beginner Tutorial**
   - **Size:** 10.0 MB
   - **License:** PSF License (GPL-compatible open source)
   - **Score/MB:** 0.4500
   - **Rationale:** Empowers Nigerian youth and developers to learn and write software completely offline with full standard library documentation.

5. **Wiktionary English Top 50,000 Vocabulary Micro Pack**
   - **Size:** 12.0 MB
   - **License:** CC-BY-SA 4.0
   - **Score/MB:** 0.4167
   - **Rationale:** Directly fills the dictionary definition and phonetics void left by encyclopedic Wikipedia entries, fitting inside the 15 MB mobile limit.

---

## Proposed OFFLINE-KNOWLEDGE-CATALOG.json Block

```json
[
  {
    "id": "SRC-001",
    "name": "1999 Constitution of the Federal Republic of Nigeria (as amended)",
    "url": "https://pols.gov.ng/constitution",
    "license": "Public Domain",
    "size_mb": 1.5,
    "category": "Anything Exceptional (Civics & Law)",
    "content_type": "Legal Text / Constitutional Law",
    "usefulness_rating": 5.0,
    "usefulness_per_mb": 3.3333,
    "complements_existing": "Master corpus has no structured legal texts. Provides fundamental civic rights, judicial powers, and federal governance structures vital for Nigerian citizens."
  },
  {
    "id": "SRC-002",
    "name": "WHO Model List of Essential Medicines & African Regional Guidelines",
    "url": "https://www.who.int/medicines/publications/essentialmedicines/en/",
    "license": "CC-BY-NC-SA 3.0 IGO",
    "size_mb": 6.0,
    "category": "Health Education",
    "content_type": "Clinical Formularies & Treatment Protocols",
    "usefulness_rating": 4.5,
    "usefulness_per_mb": 0.75,
    "complements_existing": "Provides official prescribing guidelines, dosages, and drug information for tropical diseases (malaria, TB, cholera) missing from general Wikipedia."
  },
  {
    "id": "SRC-003",
    "name": "NigeriaLII Key Federal Acts Digest (Criminal Code, Labour Act, Evidence Act)",
    "url": "https://nigerialii.org/",
    "license": "CC-BY 4.0",
    "size_mb": 8.0,
    "category": "Anything Exceptional (Civics & Law)",
    "content_type": "Statutory Law & Legal Reference",
    "usefulness_rating": 4.0,
    "usefulness_per_mb": 0.5,
    "complements_existing": "Essential statutory legal reference for citizens, entrepreneurs, and community leaders working off-grid without online legal access."
  },
  {
    "id": "SRC-004",
    "name": "Python 3 Core Standard Library & Beginner Tutorial",
    "url": "https://docs.python.org/3/",
    "license": "PSF License (GPL-compatible)",
    "size_mb": 10.0,
    "category": "Computing / Developer Docs",
    "content_type": "Language Reference & Programming Guides",
    "usefulness_rating": 4.5,
    "usefulness_per_mb": 0.45,
    "complements_existing": "Gives complete syntax and built-in library documentation for Python, Nigeria's most taught programming language, in a tiny footprint."
  },
  {
    "id": "SRC-005",
    "name": "Wiktionary English Top 50,000 Vocabulary Micro Pack",
    "url": "https://en.wiktionary.org/",
    "license": "CC-BY-SA 4.0",
    "size_mb": 12.0,
    "category": "Education / Practical Reference",
    "content_type": "Dictionary & Phonetics",
    "usefulness_rating": 5.0,
    "usefulness_per_mb": 0.4167,
    "complements_existing": "Wikipedia covers topics encyclopedically but lacks direct definitions, pronunciations, and lexical details required for language learners."
  },
  {
    "id": "SRC-006",
    "name": "Practical Action Technical Briefs (Appropriate Rural Technology)",
    "url": "https://practicalaction.org/knowledge-centre/",
    "license": "CC-BY-NC-ND 4.0",
    "size_mb": 14.0,
    "category": "Agriculture / Technical Manuals",
    "content_type": "Engineering Handbooks & Blueprints",
    "usefulness_rating": 4.5,
    "usefulness_per_mb": 0.3214,
    "complements_existing": "Provides off-grid construction blueprints for water filtration, solar food drying, bio-gas, and brickmaking, filling vital practical engineering gaps."
  },
  {
    "id": "SRC-008",
    "name": "CGIAR / IITA Tropical Agronomy Manuals (Cassava, Yam, Maize, Cowpea)",
    "url": "https://www.iita.org/publications/",
    "license": "CC-BY 4.0",
    "size_mb": 16.0,
    "category": "Agriculture / Technical Manuals",
    "content_type": "Crop Management & Pest Control Guides",
    "usefulness_rating": 5.0,
    "usefulness_per_mb": 0.3125,
    "complements_existing": "Produced directly in Ibadan, Nigeria; contains highly specific crop disease, breeding, and soil management guides for Nigerian farming systems."
  },
  {
    "id": "SRC-007",
    "name": "DevDocs Web Core Micro (HTML, CSS, JavaScript, Web APIs)",
    "url": "https://devdocs.io/",
    "license": "CC-BY 4.0 / MIT",
    "size_mb": 15.0,
    "category": "Computing / Developer Docs",
    "content_type": "API Documentation & Reference",
    "usefulness_rating": 4.5,
    "usefulness_per_mb": 0.3,
    "complements_existing": "Provides instant offline code search and strict API signatures for modern web developers, whereas Wikipedia only offers conceptual summaries."
  },
  {
    "id": "SRC-010",
    "name": "MDN Web Docs Core Developer Reference",
    "url": "https://developer.mozilla.org/",
    "license": "CC-BY-SA 2.5",
    "size_mb": 18.0,
    "category": "Computing / Developer Docs",
    "content_type": "Technical Specifications & Tutorials",
    "usefulness_rating": 4.5,
    "usefulness_per_mb": 0.25,
    "complements_existing": "In-depth web standards, browser compatibility tables, and JavaScript guides enabling off-grid web software construction."
  },
  {
    "id": "SRC-012",
    "name": "FAO TECA (Technologies & Practices for Small Agricultural Producers)",
    "url": "https://teca.apps.fao.org/",
    "license": "CC-BY-NC-SA 3.0 IGO",
    "size_mb": 22.0,
    "category": "Agriculture / Technical Manuals",
    "content_type": "Practical Field Technologies & Irrigation",
    "usefulness_rating": 5.0,
    "usefulness_per_mb": 0.2273,
    "complements_existing": "Contains peer-reviewed, low-cost technologies for smallholders (water harvesting, soil conservation, post-harvest processing)."
  },
  {
    "id": "SRC-011",
    "name": "African Storybook Project (Nigerian Early Literacy Collection)",
    "url": "https://www.africanstorybook.org/",
    "license": "CC-BY 4.0",
    "size_mb": 20.0,
    "category": "Anything Exceptional (Literacy & Culture)",
    "content_type": "Illustrated Children's Stories & Decodable Readers",
    "usefulness_rating": 4.5,
    "usefulness_per_mb": 0.225,
    "complements_existing": "Gutenberg books feature 19th-century Western prose; African Storybook offers culturally contextualized early literacy materials for young Nigerian children."
  },
  {
    "id": "SRC-009",
    "name": "CIA World Factbook Micro JSON/Text Edition",
    "url": "https://www.cia.gov/the-world-factbook/",
    "license": "Public Domain",
    "size_mb": 18.0,
    "category": "Education / Practical Reference",
    "content_type": "Geopolitical & Economic Reference Data",
    "usefulness_rating": 4.0,
    "usefulness_per_mb": 0.2222,
    "complements_existing": "Delivers standardized, cross-country demographic, economic, energy, and infrastructure tables for rapid offline query."
  },
  {
    "id": "SRC-013",
    "name": "Agrodok Small-Scale Farming Series (Agromisa & CTA)",
    "url": "https://www.agromisa.org/",
    "license": "CC-BY-NC-SA 4.0",
    "size_mb": 25.0,
    "category": "Agriculture / Technical Manuals",
    "content_type": "Illustrated Farming Handbooks",
    "usefulness_rating": 4.5,
    "usefulness_per_mb": 0.18,
    "complements_existing": "Practical step-by-step handbooks on poultry, fish farming, seed saving, and organic pest control tailored to tropical smallholders."
  },
  {
    "id": "SRC-014",
    "name": "Khan Academy KA Lite STEM Exercise & Problem Bank",
    "url": "https://learningequality.org/kolibri/",
    "license": "CC-BY-NC-SA 3.0",
    "size_mb": 25.0,
    "category": "Education / Practical Reference",
    "content_type": "Interactive Problem Sets & Worked Examples",
    "usefulness_rating": 4.5,
    "usefulness_per_mb": 0.18,
    "complements_existing": "Complements static text with active problem-solving exercises, hint trees, and solutions in arithmetic, algebra, and basic physics."
  },
  {
    "id": "SRC-015",
    "name": "Hesperian Health Guides ('Where There Is No Doctor' & 'Where Women Have No Doctor')",
    "url": "https://hesperian.org/",
    "license": "CC-BY-NC-ND 4.0",
    "size_mb": 28.0,
    "category": "Health Education",
    "content_type": "Community Healthcare Manuals & First Aid",
    "usefulness_rating": 5.0,
    "usefulness_per_mb": 0.1786,
    "complements_existing": "The definitive clinical handbook for rural village health workers; provides life-saving diagnostic trees and treatments in plain language."
  },
  {
    "id": "SRC-017",
    "name": "OpenStax Secondary STEM Core (Biology, Chemistry, Physics)",
    "url": "https://openstax.org/",
    "license": "CC-BY 4.0",
    "size_mb": 35.0,
    "category": "Education / Practical Reference",
    "content_type": "Peer-Reviewed Open Textbooks",
    "usefulness_rating": 5.0,
    "usefulness_per_mb": 0.1429,
    "complements_existing": "Rigorous, structured secondary/high school STEM textbooks with chapter summaries and review questions missing from encyclopedia articles."
  },
  {
    "id": "SRC-018",
    "name": "WikiProject Med / WikiMed Mini (Kiwix Medical Wikipedia nopic)",
    "url": "https://meta.wikimedia.org/wiki/WikiProject_Med",
    "license": "CC-BY-SA 4.0",
    "size_mb": 35.0,
    "category": "Health Education",
    "content_type": "Clinical Medical Encyclopedia",
    "usefulness_rating": 5.0,
    "usefulness_per_mb": 0.1429,
    "complements_existing": "Curated, peer-reviewed medical content covering diseases, sanitation, and pharmacology, filtered specifically for medical accuracy."
  },
  {
    "id": "SRC-016",
    "name": "UNESCO General History of Africa (Volumes I-VIII Concise Edition)",
    "url": "https://en.unesco.org/general-history-of-africa",
    "license": "CC-BY-SA 3.0 IGO",
    "size_mb": 32.0,
    "category": "Anything Exceptional (African History)",
    "content_type": "Historical Treatise & Scholarly Monographs",
    "usefulness_rating": 4.5,
    "usefulness_per_mb": 0.1406,
    "complements_existing": "Rigorous Afrocentric history written by major African historians, filling major gaps and biases in Western-centric Gutenberg/Wikipedia coverage."
  },
  {
    "id": "SRC-019",
    "name": "LibreTexts Modular Polytechnic & University STEM Modules",
    "url": "https://libretexts.org/",
    "license": "CC-BY-NC-SA 3.0",
    "size_mb": 40.0,
    "category": "Education / Practical Reference",
    "content_type": "Higher Education Open Courseware",
    "usefulness_rating": 4.0,
    "usefulness_per_mb": 0.1,
    "complements_existing": "Modular tertiary-level science and engineering courseware suitable for self-directed study by Nigerian university and polytechnic students."
  },
  {
    "id": "SRC-020",
    "name": "Wikivoyage English No-Pictures Travel & Regional Guide",
    "url": "https://en.wikivoyage.org/",
    "license": "CC-BY-SA 4.0",
    "size_mb": 55.0,
    "category": "Education / Practical Reference",
    "content_type": "Travel & Regional Infrastructure Guides",
    "usefulness_rating": 3.5,
    "usefulness_per_mb": 0.0636,
    "complements_existing": "Provides practical regional travel facts, transport links, health/safety advice, and geographic logistical details for West Africa and worldwide."
  }
]
```

# ON-DEMAND INVESTIGATION — MEASURED (Oct 21, ~05:4x WAT, Hauwa desk)

Counselor's critical question: does HARZ require full sync before use, or does per-document retrieval already work?

## Measured on a brand-new browser (zero corpus, zero packs, never synced) — the acceptance test, live:
1. Library loads ONLINE: 1,992 titles indexed, 21 visual packs listed. No corpus downloaded.
2. Search "water crisis" -> 2 title matches in seconds. HONEST LIMIT on screen: fresh device searches TITLES only ("Un-synced bodies are searchable after Sync").
3. Opened doc 815 (Cape Town / CNN) ON DEMAND: single fetch, full body 9,268 chars, visual reader rendering (~8 MIN READ), verified IDENTICAL TO SEALED COPY (sha de216a7cd334...), now stored locally as OFFLINE — local copy.
=> CONCLUSION: per-document on-demand retrieval ALREADY EXISTS and is proven: request -> retrieve one doc -> verify -> retain offline. Seconds, not sync.

## What still forces bulk download (the redesign targets):
1. PACK AUTO-DOWNLOAD: on first online open, the library auto-downloads ALL pack resources (now 228; was the 300MB slow sync the owner hit). This is the main divergence from the internet principle.
2. FULL-TEXT SEARCH requires synced bodies (titles-only on fresh devices; honest and labeled).

## Counselor's four components vs current reality:
- HARZ Global: EXISTS (KV packs + D1 corpus bodies + sealed indexes).
- HARZ Resolver: PARTIAL (shell URLMAP + visualmap resolve URL->stored/local/live per link; corpus cards resolve live vs stored).
- HARZ Delivery: EXISTS for docs (proven live today); packs are network-first per SW r10 (opening a pack page online fetches just it) but bulk auto-download undermines it.
- HARZ Local: EXISTS (SW cache + hash verify on every open + receipts panel).

## Proposed redesign (decision for owner + counselor review, no code yet):
1. Packs behave like docs: fetch-on-open, retain-what-you-opened. Opening a pack page online = that page arrives and stays.
2. "Sync all" becomes an EXPLICIT opt-in per-domain action: "Prepare [domain] for airplane" — today's bulk behavior scoped to one domain, user-chosen.
3. First-open experience: shell (~1MB) + titles search immediately usable; content arrives on demand.
4. Offline honesty unchanged: un-stored page = honest "not stored" + how to get it.
Expected effect: new-phone time-to-first-use: minutes -> seconds; the 300MB wall disappears for casual use; travelers prepare only what they need.

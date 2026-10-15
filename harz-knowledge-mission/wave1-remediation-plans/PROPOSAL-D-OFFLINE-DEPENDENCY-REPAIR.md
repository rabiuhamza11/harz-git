# WAVE-1 REMEDIATION PROPOSAL D — OFFLINE DEPENDENCY REPAIR
**Status: PLANNING PROPOSED — EXECUTION NOT AUTHORIZED (owner ruling Oct 14; this document authorizes nothing)**
**Blockers addressed:** TF-2 (external CSS: immigration 232, health 60/61) and TF-3 (health fonts: 54 external srcs to moh.dotmac.ng, 15 Poppins keys offline-broken)
**Identity law:** new candidate artifacts only (e.g. `immigration-v3-r1`, `health-v2-r1`). Frozen packs untouched.

## 1. Owner's acceptance target (verbatim substance)
Not "zero external URLs in selected HTML attributes." It is VERIFIED OFFLINE BEHAVIOR, with every remaining connectivity requirement disclosed honestly.

## 2. Complete dependency inventory (measured already, to be re-verified at execution time)
- immigration-v3-final: 232 external stylesheet links (222 site, 6 themigrate.xyz, 4 googleapis); fonts clean (7 embedded data-fonts, 0 external css url()).
- health-v2: 60/61 external stylesheet links (48 health.gov.ng, 4 googleapis, 4 cdnjs + regex residue); 54 rendering-path external @font-face srcs, all to moh.dotmac.ng (vf-embed step half-done); 15 of 32 keys external-only and final (Poppins 100-900, normal+italic).
- Nested CSS imports: the inventory procedure must fetch and recursively resolve `@import` chains inside every linked stylesheet — the linked files are currently absent from the packs, so the full nested graph is UNKNOWN until the repair run fetches it. This is declared, not assumed small.

## 3. Proposed procedure (for review)
1. **Acquire:** fetch every external CSS/font URL in the inventory (same engine as original capture; strict robots policy inherited from the FX-1 gather law).
2. **Embed:** inline each stylesheet into the candidate (and inline the imported chains recursively); replace @font-face external srcs with embedded data URIs (the 54 moh.dotmac.ng fonts), preserving the last-declaration-wins resolution order — the 15 broken Poppins keys must resolve embedded.
3. **Disclose:** any URL that fails to fetch or is disallowed by robots stays EXTERNAL and is listed in the candidate's honest connectivity-notice section (the same notice pattern as immigration's 3 map notices).
4. **Inventory report:** candidate ships with a machine-readable dependency census: before/after counts, embedded/external, per object class (stylesheet, nested import, font, dynamic resource), with declared scanner assumptions per Wave-2 law.

## 4. Acceptance tests
1. **The decisive offline-render experiment (named in receipt 188):** serve the candidate in a network-dead environment and verify rendering — the Poppins faces must NOT fall back; the 61/232 stylesheets must render. Screenshot + DOM computed-style evidence (fonts actually resolved to embedded URIs), from a browser session with external requests logged as zero.
2. Dependency census attached; every remaining external ref has an honest notice.
3. Zero external requests in the offline render log (measured, not asserted by URL scanning).
4. Candidate ≠ frozen original: new hash, diff report, independent second-seat reproduction.
5. Pack-size ceiling check: health candidate after embedding must stay under the 25MB KV ceiling or the serving-path question goes back to the owner (the frozen health is 38MB raw / 10.55MB brotli — embedding may grow it; brotli re-measure required).

## 5. Explicitly out of scope
No stamp repair (Proposal C), no pipeline code changes beyond the embed step (Proposal E), no deployment, no merge.

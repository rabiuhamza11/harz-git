# TEAM C — INDEPENDENT VERIFICATION REPORT (this seat, Oct 14, ~08:2x WAT)
Procedure standard: second-implementation rescans (HTMLParser, no shared regex
with Team A), git-blob extraction, live fetches. Read-only. Frozen state
untouched. Repairs NOT executed — this report only verifies and discloses.

## GATE 1 — Hash anchoring of committed artifacts  [PASS 4/4]
Procedure: git show HEAD:packs/<file> | sha256sum (blob-level, independent of
working files).
- immigration-v3-final.html: 981c826038d63505739b4e9f3c7b4408474a252c10cc71bd7a72d588778b6402 == recorded ✓
- nimc-v3.html: 9c71cf92ff0cc5c4f3ad85e50711a337ecaf8294c41c71476e7a34a54d275d4c ✓
- cac-v2.html: 7b31d16693eab7c405580772b665212606d8f57a1d01bcfdd110d5c392f7462b ✓
- health-v2.html: 63750cdfdbe8305f92c2272fb2a84c137a7f5816134b607f09447a99ba8ffd25 ✓

## GATE 2 — Immigration v0.3 independent rescan  [PASS on Team A's 5 classes; NEW DISCREPANCY found]
Procedure: full DOM parse (html.parser), all URL-bearing attributes, no regex
shared with Team A's scan.
Reproduced: img=0 script=0 iframe=0 srcset=0 urlattr=0 media=0 embed=0 ✓
Notices: 3, all Google-Maps, text accurate ✓. Forms: 9 action URLs
(interactive requires-connectivity class, covered by honest banner) ✓.
DISCREPANCY (undisclosed by Team A): 230 EXTERNAL STYLESHEET <link> tags
(220 immigration.gov.ng, 6 themigrate.xyz [third-party, theme-dev leftover],
4 fonts.googleapis.com). Team A's scanner excluded https:// hrefs by
construction — blind spot, disclosed here. Impact measured: live
block-library CSS (137KB) selectors ABSENT from the pack's embedded styles
→ the linked CSS content is NOT in the pack → offline rendering loses
WordPress/plugin styling. CAUTION: online screenshots MASK this (the links
fetch successfully during the online session), so paired online comparison
cannot detect it — only reference scans or true airplane-mode tests can.
NOT repaired (frozen; repairs await ruling).

## GATE 3 — CBN artifact  [PASS on hash + pack scan; band = human-validation pending; desk pack still awaited]
- KV-served /cbn-live sha256 == recorded f63dc323f2cc140bb0704e529261b2607a07b2902ae4b9e2b5e518a893b1630f ✓
- Pack now COMMITTED for hash-anchoring (packs/cbn-live.html, same digest).
- Pack rescan: external stylesheet links=0 ✓; external imgs=1 (the disclosed
  failed Inverse Logo fetch) ✓; YouTube iframes=2 disclosed ✓; nothing else
  offline-breaking found beyond disclosed items.
- Band y=660-700: auto-detected (40% row-change). Evidence crops committed
  (evidence/cbn-band-evidence.png, cbn-band-context.png: TOP=live,
  BOTTOM=pack) for the desk's human validation that this is the rates
  region. Pinned-state verdict REMAINS OPEN pending the desk's own CBN
  artifact.

## GATE 4 — Provenance stamps  [2 PASS / 2 FAIL]
Procedure: full-comment extraction `<!--\s*harz-provenance:\s*(.*?)\s*-->`,
then json.loads.
- nimc-v3: PARSES ✓ (url ✓, captured 2026-10-14T05:42:58Z, engine ✓, 57
  resources + per-resource sha256, 6 failed, 4 excluded scripts, dom_bytes)
- cac-v2: PARSES ✓ (url ✓, shell — 0 resources, honest)
- health-v2: FAILS — stamp TRUNCATED at ~20,000 chars mid-record
- immigration-v3: FAILS — stamp TRUNCATED at ~19,984 chars mid-record
Root-cause hypothesis (for repair design, not executed): a ~20KB cap in the
capture script's provenance-comment writer. The stamps carry provenance
METADATA (url/captured/engine/per-resource hashes); they are NOT proof of
artifact integrity — integrity proof lives in the repo hash chain and the
receipt manifest. Distinction preserved per ruling.

## VERDICT
Conditional acceptance STANDS. Team A's five zero-classes reproduce for
the classes its scanner was designed to see, but the independent scan found
one undisclosed dependency class (external CSS, 230 refs) plus two truncated
provenance stamps. nimc-v3, cac-v2, cbn packs are clean on all scanned
classes. Immigration + health packs have genuinely-hidden online
dependencies of the exact kind Law 3 forbids — invisible to online
screenshot comparison. Frozen state untouched; no merges; no sharding;
repairs await the desk's ruling.

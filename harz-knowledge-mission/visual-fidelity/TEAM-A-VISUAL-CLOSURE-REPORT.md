# TEAM A — VISUAL CLOSURE REPORT (this seat's execution, Oct 14, ~08:0x WAT)

## Item 1 — Immigration artifact: unresolved references counted + classified
BEFORE (v0.1 defective pack, hash 3c02d09a, superseded-preserved):
- img non-data src: 26 (incl. 2 base64-encoded protocol-relative lazy-load
  URLs — the flag-class defect, e.g. nis-9.jpeg — and unhydrated Vue template
  placeholders {{ data.* }})
- external script src: 88 (WordPress stack: jquery, gtranslate, wp-includes)
- iframe: 3 (Google Maps embeds)
- protocol-relative CSS links: 2 (Quicksand Google Fonts, missed by fetcher)
AFTER (committed v0.3, sha256 981c826038d63505739b4e9f3c7b4408474a252c10cc71bd7a72d588778b6402):
- img=0 script=0 iframe=0 rel_css=0 ext_css_url=0 template=0
- honest requires-internet notices: 3 (maps x3 + dynamic media library)
Classification: every previously-unresolved class is now either embedded,
removed per offline-honesty law (scripts, rendered-DOM preserved), or
honestly labeled. MEASURED, not asserted.

## Item 2 — CBN pinned-state comparison
HONEST LIMIT: the other seat's CBN offline pack is unreachable from this
seat (not in the shared repo; their repo local). This seat executed the
INDEPENDENT data point: fresh v0.3 capture of cbn.gov.ng (11.3MB pack,
sha256 recorded below) + same-engine same-viewport paired comparison.
- Whole-page pixel diff>30: 4.2%
- Densest changing band auto-located: y=660-700 (40% row-change — the
  dynamic rates/news region)
- PINNED-STATE EQUIVALENT (changing band excluded): 3.7%
- The method (densest-row-change band detection + exclusion re-measure) is
  reusable by the desk for their pack: same protocol, tool available.
Residuals classified: 2 YouTube iframes (honest notice candidates — live
service), 1 failed fetch (Inverse Logo.png — 404-class, disclosed in pack
provenance "failed" list).
Pack: cbn-live.html sha256 below; KV-served at /cbn-live (read-only
recon surface — Team C may hash it).

## Item 3 — Provenance stamps verified (all committed packs)
- nimc-v3.html: harz-provenance JSON, url https://nimc.gov.ng, captured
  2026-10-14T05:42:58Z ✓
- cac-v2.html: harz-provenance JSON, https://www.cac.gov.ng/, captured
  2026-10-14T05:16:05Z ✓ (bot-challenge shell — honest F-5 evidence)
- health-v2.html: harz-provenance JSON, https://health.gov.ng, captured
  2026-10-14T05:25:58Z ✓
- immigration-v3-final.html: provenance JSON + banner + per-resource
  failed/excluded lists ✓
- NOTE (honest): offline banner present in immigration pack only; the
  other three predate the banner pattern — law 5 (provenance) satisfied by
  the JSON stamps; banner harmonization = Stage 2 candidate, not a defect.

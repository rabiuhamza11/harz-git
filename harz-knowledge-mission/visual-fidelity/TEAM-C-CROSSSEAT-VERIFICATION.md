# TEAM C CROSS-SEAT INDEPENDENT VERIFICATION REPORT
**Seat:** Hauwa (Team C lead) — second-seat reproduction per Dad's ruling
**Date:** Oct 14, 2026 (post-403ece9)
**Scope:** reproduce the evidence, not the implementation. Read-only. No frozen artifact touched. No sharding, merging, or protected-state modification. Commit anchor under review: 2a2c6bd (Team A report), desk verification 403ece9.
**Method:** independent scanner implementation (`crossseat-verify.py`, written on this seat, no shared code with Team A or desk tooling). Raw measurements preserved in `TEAM-C-CROSSSEAT-RAW.json`.

## GATE 1 — Artifact hashes (BLOB-VERIFIED FROM SECOND SEAT)

| Artifact | My sha256 (independent) | Published claim | Verdict |
|---|---|---|---|
| immigration-v3-final.html (38,808,606 B) | 981c826038d63505… | 981c8260 (commit ccb8606) | MATCH |
| cbn-live.html (11,313,224 B) | f63dc323f2cc140b… | f63dc323 (Team A capture record) | MATCH |
| nimc-v3.html (10,547,983 B) | 9c71cf92ff0cc5c4… | 9c71cf92ff0cc5c4f3ad85e50711a33… (manifest, full length) | MATCH |
| cac-v2.html (6,468 B) | 7b31d16693eab7c4… | 7b31d16693eab7c405580772b665212606… (manifest) | MATCH |
| health-v2.html (38,370,174 B) | 63750cdfdbe8305f… | 63750cdfdbe8305f92c2272fb2a84c13… (manifest) | MATCH |

5/5 byte-identical to claims. **PASS.**

## GATE 2 — Immigration v0.3 five-class scan (independent implementation)

Observed on the committed 981c8260 artifact:
1. External image src: **0** (73 total img src, all internal)
2. External script src: **0**
3. Map iframes: **0** (0 iframes total)
4. Protocol-relative/external font refs: **0**
5. Explicit requires-internet notices: **3** — all three are the honest offline-notice box ("this box was a live Google Maps embed. It requires an internet connection and cannot render in this offline copy."), correctly describing genuinely connectivity-dependent functionality (Google Maps embeds).

Methodology disclosure: my first-pass regex counted 1 notice because it required "requires internet" adjacent; the actual phrasing is "requires an internet connection". Corrected count = 3, consistent with Team A. Recorded so the count is not mistaken for disagreement.

Team A's five-category zeros: **REPRODUCED**. Per the ruling, these zeros are not proof that every offline function works — only that these five defect classes are absent.

## GATE 3 — External stylesheet finding (desk's 403ece9 NEW discrepancy, second-seat test)

My measurement on the same artifact:
- External stylesheet `<link>` refs: **232** (desk claimed 230; my regex boundary differs by 2 — breakdown 222 site / 6 themigrate.xyz / 4 googleapis, vs desk's 220/6/4. Delta disclosed; the finding is identical in substance.)
- Linked CSS content embedded in pack: **essentially absent** — 1,618,547 bytes of inline `<style>` exist, but only 2 data-URI font/css refs; the externally linked stylesheets are not embedded.
- **CONFIRMED: real offline styling loss, invisible to online screenshots** (browser fetched the CSS live; offline it will not).
- Additional evidence the desk's finding is understated, not overstated: the pack's own (truncated) provenance prefix lists the very CSS files (e.g. `transitions.min.css?ver=4.3.1`, `happy-icons.woff`) with per-resource sha256s — the capture pipeline measured them, but the pack was not rewritten to embed them.

## GATE 4 — CBN fresh capture (committed preview artifact)

- `cbn-live.html` hashed **f63dc323f2cc140b…** — matches the recorded capture. From this seat: committed artifact == recorded bytes (the live-endpoint fetch equality was measured by the desk; I did not re-fetch the endpoint).
- Scan: 2 YouTube embeds (matches Team A's residual disclosure), 0 external images (the "failed logo fetch" was a capture-time failure, so nothing external remains in the artifact — consistent), 0 external stylesheets.
- Band y=660–700 human validation: evidence crops committed by the desk (cbn-band-context.png / cbn-band-evidence.png); visual confirmation of the dynamic region remains a human-eye check for Dad.
- **The offline CBN pack has still not been supplied to either verification seat — the paired pinned-state comparison REMAINS OPEN**, exactly as the ruling requires. No closure claimed.

## GATE 5 — Provenance stamps (all four, independent parse)

- nimc-v3: **PARSE OK** — url=https://nimc.gov.ng, captured=2026-10-14T05:42:58Z, engine=cloudflare-browser-rendering-rest (rendered DOM), 57 resources, 6 failed, dom_bytes=10,536,797.
- cac-v2: **PARSE OK** — url=https://www.cac.gov.ng/, captured=2026-10-14T05:16:05Z, resources=0, dom_bytes=6,145. **Content of this pack is a Cloudflare bot-challenge shell ("Just a moment…")** — consistent with the manifest's honest F-5 disclosure ("bot-challenge shell"); the real CAC site is not in this pack. The desk disclosed the shell; the stamp confirms it independently.
- health-v2: **TRUNCATED** — JSON payload cut at exactly the 20,000-character mark (parse dies at char 19,999 mid-resource-entry).
- immigration-v3-final: **TRUNCATED** — same 20,000-character cut.
- The desk's ~20KB cap hypothesis is **CONFIRMED EXACTLY**: both failures occur at the same 20,000-char boundary → a cap in the stamp-writer, not random corruption. url/captured/engine fields are recoverable from the truncated prefix; the full per-resource manifest is lost in both.
- **New defect found by this seat (not in Team A or desk reports):** immigration's resource manifest contains a leaked JavaScript template literal captured as a resource URL — `https://immigration.gov.ng/${e?.bg?.image.src}` (with a 196KB "resource" hash attached). The capture pipeline fetched an unrendered template string as if it were a URL.

## VERDICT

**Conditional acceptance STANDS.** Nothing in this verification upgrades or downgrades Team A's report; both seats' measurements agree on every reproduced number (5-class zeros, 3 notices, capture hash, challenge-shell disclosure, truncation), with one added defect (template-literal resource URL) and one added emphasis (the capture pipeline measured the CSS it failed to embed).

Repairs awaiting Dad's ruling (no repair executed, per ruling):
1. Provenance stamp 20,000-char cap fix + re-stamp of health-v2 and immigration-v3.
2. Stage 2 CSS embedding for immigration (offline styling loss).
3. CAC real-site capture path (bot-challenge blocked; current pack is a shell — already disclosed).
4. Offline CBN pack handoff so the pinned-state comparison can close.
5. Capture-pipeline guard against template-literal URLs.

## Evidence references
- Commands/procedures: `crossseat-verify.py` (this commit), one-shot Python scans whose commands are embedded in the script.
- Raw measurements: `TEAM-C-CROSSSEAT-RAW.json` (this commit).
- Artifacts under review: `packs/*` (commit ccb8606 / 403ece9 state, unchanged).
- Claims under test: Team A report (2a2c6bd), desk verification (403ece9), PACKS-MANIFEST.md.

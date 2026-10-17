# INTERNETLESS ROOT-CAUSE REPORT 1 — REPRODUCTION (Oct 17, ~01:2x WAT)
Owner order: reproduce the exact failure before building. Done — real Chromium,
live app, every click recorded.

## Reproduced journey (harz-offline-browser, the one-file reader, current corpus: 932 pages / 5,906,020 chars / 5 sites)

1. App boots SEALED — all integrity checks pass. Shell opens. NOT the failure.
2. LIBRARY SITES tab lists 5 sites with an element labeled "open offline" per site.
3. CLICK "open offline" (theconversation.com) -> NOTHING HAPPENS.
   Repeated 3x with three different strategies: page_changed=false every time.
   DEAD CLICK CONFIRMED — exactly the owner's report.
4. CLICK the site NAME above it ("theconversation.com (477)") -> site view opens
   with all 477 pages. Navigation EXISTS but is bound to the wrong element.
5. CLICK an article title -> article opens with FULL text (6,895 chars, hash shown).
   Content retrieval works — but the view is a PLAIN TEXT blob.

## ROOT CAUSES (code-verified, source: app v0.3 embedded in the sealed one-file)

RC-1 (DEAD CLICK): listSites() binds onclick to the h3 site name only. The
"open offline" div below it has NO click handler and looks like the button.
Users click it -> nothing. One-line binding defect in the UI.

RC-2 (NO LINKS, NO PICTURES — by v0.3 design): openArticle() renders
`body.textContent = d.text` — "plain text only — no HTML injection ever".
The capture pipeline stored extracted TEXT: links were stripped at capture,
images/CSS/fonts were never captured. URLs inside articles appear as dead
text. This is the disease the Visual Fidelity Law (Oct 14) already identified
and ordered cured: capture as a website, render visually offline.

RC-3 (NO NAVIGATION GRAPH): there is no URL->local-resource resolver at all.
No normalization, no mapping of original URLs to local pages, no
"captured vs not captured" decision per click. The three-layer architecture
the owner ordered (resolver + content store + runtime) has layer 1 missing.

RC-4 (SEAL LAW CONFLICT ON THE FIX): the one-file app+corpus is sealed
(x-harz-seal, corpus sha pinned, FAIL-CLOSED boot). The sealed KV HTML may
NOT be edited (owner law Oct 8: editing breaks the hash check; visual
replacement must pass Auditor acceptance before the text library is touched).
=> The fix must be built as INTERNETLESS v2 alongside: new resolver + visual
packs + new shell consuming the sealed corpus read-only. No edit to the
accepted baseline.

## Fix plan (smallest correct, per owner's order — no new platforms, no AI, no symptom patches)

L1 RESOLVER (shared, one engine for all surfaces):
  normalize(url) -> domain+path (strip fragments, sort nothing, map www.,
  handle relative/absolute, redirects recorded at capture) -> lookup:
  {status: LOCAL_VISUAL (pack page)} | {status: LOCAL_TEXT (corpus doc)} |
  {status: NOT_CAPTURED} | {status: EXTERNAL_DOMAIN}.
  Every click gets a truthful outcome: open local, or an honest
  "not captured offline — request the nightly wave" card. Never a dead click.

L2 CONTENT STORE: (a) sealed text corpus read-only (search+full bodies —
works today, keep); (b) VISUAL PACKS (Stage 1 already captured: efcc.gov.ng
509KB, cac.gov.ng 3.8MB, nysc.gov.ng 5.1MB — all ZERO external refs, images
inlined, links rewritten to local/honest outcomes; jamb.gov.ng + 5th site
pending capture).

L3 RUNTIME: Internetless v2 shell (PWA, SW offline shell) with the
BROWSER tab wired through the resolver: every link inside served pages is
rewritten at capture; raw URLs inside text articles become clickable and
resolve through the same engine.

## Test matrix (per owner): connected + airplane mode on the Infinix, every
click recorded PASS/FAIL/NOT-TESTED with URL, resolver result, body retrieved
(bool), resources loaded (bool), hash verified (bool), evidence.

NEXT: build the resolver + v2 shell + finish the 5-site visual pack set;
deploy additive on a2 (new routes, sealed library untouched); run the full
matrix in both modes; deliver commit + deployment identity + matrix.

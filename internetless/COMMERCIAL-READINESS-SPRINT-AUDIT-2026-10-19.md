# INTERNETLESS COMMERCIAL READINESS SPRINT — GAP AUDIT LEDGER
Owner ruling received Oct 19 ~07:34 (relayed via best friend): Internetless reopens
as THE mission. Telecom and AI wait. Five stages: UX finish → library usefulness →
reliability → packaging → commercial readiness. Every issue carries four fields:
problem / evidence / smallest repair / acceptance test. No rebuilds; finish what exists.

## LIVE BASELINE (verified this audit, Oct 19 07:4x WAT)
- v2 shell live (570KB), 3 packs: efcc.gov.ng (1 page), cac.gov.ng (14 sub), nysc.gov.ng (45 sub).
- Server-side link audit (Oct 18): pack nav 59/59 PASS, corpus links 90/90 PASS, all alerts honest.
- Device evidence (Oct 18, airplane): 8 sub-pages opened + verified on Infinix (NYSC 4, CAC 4);
  search Madagascar 20 results, Fresh water 29; full sync 62/62 pack URLs.
- EFCC rebuilt Oct 18 (742KB, 2,263 words, 10 embedded images) — owner device retest PENDING.
- Root-a serves WRONG-ANCHOR zone (height 6, signer cd9adbc6…, pinned = 609d4b2f…); root-b valid (height 2). Verifier refuses correctly.

## P0 — USER EXPERIENCE BLOCKERS
P0-1 SEC pack absent. Problem: sec.gov.ng never captured (404 live check); friend's report of SEC nav failure = expectation gap. Evidence: HTTP 404 this audit; pack list has no SEC. Repair: capture decision first (owner: is SEC in the first release?), then Magani pipeline capture. Acceptance: SEC pack serves offline with verified nav, or is honestly listed as not-included.
P0-2 EFCC device retest. Problem: rebuild verified server-side only. Evidence: Oct 18 server check; no device screenshots yet. Repair: none (wait owner). Acceptance: owner screenshot in airplane mode showing EFCC content + images.
P0-3 EFCC styling (item J). Problem: pack renders unstyled (stylesheet not inlined). Evidence: vault directive item J + Oct 18 check (1 <script>, no inline CSS). Repair: inline captured CSS into pack HTML (KV write). Acceptance: EFCC opens offline with correct styling on device.
P0-4 3 stray images. Problem: dggallery 65/66, index 14/15, serviceyear 19/22 embedded; 3 images missing. Evidence: Oct 18 link audit. Repair: embed 3 assets. Acceptance: 3 pages show all images offline.
P0-5 Root-a re-sign. Problem: main root serves non-pinned zone. Evidence: live check Oct 19; DIRECTIVE-root-a-wrong-anchor.md. Repair: re-sign with pinned king key (Magani; key ceremony per frozen law). Acceptance: root-a zone verifies against pinned anchor.
P0-6 Full-journey acceptance run. Problem: no single receipted "open→search→read→navigate→return" journey on device. Evidence: separate passes exist (matrix 1017, link audit 1018). Repair: one scripted journey run on Infinix after P0-3/4 land. Acceptance: one receipt covering the friend's Stage-1 acceptance sentence.

## P1 — LIBRARY USEFULNESS
P1-1 Full-text retrieval battery across corpus. Problem: FX-1 deployed; no corpus-wide retrieval receipt. Evidence: FX-1 docs; 1.33M bodies inventory. Repair: sampling battery (random + rare-term + long-doc strata) with hash verify + readable output. Acceptance: receipted battery pass report.
P1-2 Corpus quality audit. Problem: duplicates/corrupted/quarantine unknown at scale. Evidence: CURATION-DRAFT-v1. Repair: duplicate analysis + corrupted-content quarantine report. Acceptance: inventory with dup %, quarantine list, source attribution intact.
P1-3 17 encoding-artifact docs + 137 v0.8 noisy pages. Repair: fix or quarantine per four-fields. Acceptance: artifacts gone or honestly labeled.
P1-4 Read-more on-device witness. Problem: owner-confirmed, not seat-witnessed. Repair: include in P0-6 journey. Acceptance: screenshot of linked article full body.
P1-5 Subdomain packs + NYSC southwest.html. Problem: uncaptured capture candidates. Repair: Magani capture. Acceptance: captured or explicitly out-of-scope for release 1.
P1-6 Search relevance validation. Problem: FTS5 works; relevance acceptance missing. Repair: relevance eval set (gov services, education, health, agriculture queries). Acceptance: top-3 usefulness score on frozen eval set.
P1-7 Category coverage analysis. Problem: usefulness mix unknown. Repair: classify corpus by category, report distribution. Acceptance: coverage report vs friend's Stage-2 categories.

## P2 — PRODUCT + COMMERCIAL
P2-1 Release-1 definition. Problem: no defined first release. Repair: content inventory + storage sizing (shell 570KB + packs 35.3MB measured Oct 18) + honest offline scope statement. Acceptance: release-1 doc.
P2-2 Installation + first-launch story. Problem: today = URL + manual sync. Repair: installable flow (Add to Home Screen, offline shell survives first offline, guided first sync), interrupted-download recovery per Stage-3 list. Acceptance: new-user journey from scratch on a clean phone.
P2-3 Update process. Problem: sync exists; update/staleness UX unverified. Repair: sync + staleness indicator journey test. Acceptance: honest stale/offline/live states demonstrated.
P2-4 Commercial validation. Problem: zero pricing evidence. Repair: demo on ordinary hardware to target groups (students/schools/field orgs), pricing hypothesis, paid pilot attempt (Jalingo cooperative candidate channel). Acceptance: documented real-user feedback + willingness-to-pay evidence.

## EXECUTION ORDER (starts now, server-side first, owner phone last — standing order)
1. P0-3 EFCC styling + P0-4 images (server-side, my lane, KV write).
2. P0-1 SEC decision request to owner → capture or exclude.
3. P0-5 root-a re-sign (Magani; directive already standing).
4. P1-1/P1-2 corpus batteries (server-side).
5. P0-6 + P0-2 device journey once repairs land — one owner session, not many.
6. P2-1..P2-3 packaging docs.
7. P2-4 commercial validation with real users.

## OWNER RULING — Oct 20, 06:41 (verbatim intent): "It is not SEC, NYSC or so that will be visual. I want EVERYTHING to be visual offline. Even video must open [offline]."
Reading: visual packs are not the product; the WHOLE library experience must be visual offline, including video playback.

New P0 (promoted by owner ruling):
* P0-V1 — VISUAL READER for the entire corpus.
  Problem: corpus articles open as plain text, not visual pages.
  Evidence: article bodies stored as extracted text; packs are the only visual surface today.
  Repair: styled offline reader (typography, headings, structure, dark-mode friendly) rendered for every article from the shell; zero new per-article storage; covers 100% of stored corpus immediately.
  Acceptance: airplane mode, open ANY article from search → styled visual page, not a text wall.
* P1-V2 — IMAGES for articles.
  Problem: article images are not preserved at corpus scale.
  Repair: selective preservation (category by category) with honest "image not preserved" placeholders where absent. Never fake.
  Acceptance: preserved images render offline; unpreserved show the honest placeholder; no broken icons.
* P1-V3 — VIDEO that opens offline.
  Problem: no offline video playback lane today.
  Repair: curated video preservation (free-tier object storage ~10GB cap), offline player in the shell; honest label for unpreserved videos.
  Acceptance: a preserved video PLAYS in airplane mode; an unpreserved one is labeled honestly.
Honest boundary (physics + zero-budget, not refusal): preserving every image and video on the internet is not possible on free tiers; preservation is selective and grows; what is not preserved is labeled, never faked.

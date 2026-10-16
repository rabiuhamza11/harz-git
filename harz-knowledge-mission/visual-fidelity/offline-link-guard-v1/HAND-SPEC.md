# OFFLINE LINK GUARD v1 — owner order Oct 16 ("can't click sublink in saved pages offline")

DEFECT: visually-saved pages keep their original sublinks pointing at live URLs.
Offline, clicking one dead-ends (dinosaur / nothing).

FIX (Magani, verified live Oct 16): inject `offline-link-guard.js` before `</body>`
of every saved page-single.html. A click on any non-local link:
1. never navigates externally (preventDefault, capture phase),
2. shows an honest fixed-bottom notice: "OFFLINE PACK — this link was not saved with
   the page. The pack holds only what was captured on <date>. Ask for '<label>' to be
   added to the next capture." plus the real target URL,
3. same-page anchors (#), javascript:, mailto:, tel:, data: pass through untouched.

HONEST CHAIN RULE: if you patch a DEPLOYED pack, the deployed==committed identity
changes — re-commit the patched pack, publish its new sha256 in the manifest, and
append the change note to provenance. Never let deployed and committed diverge
silently.

Pipeline: capture-visual.py (wave seat) now injects the guard at build time — fresh
captures carry it automatically. Existing packs: insert the script before `</body`,
update sha256 in provenance with the modification note (visual-v01 provenance
updates are the model).

VERIFIED (real browser, Oct 16): saved NCC site renders fully; clicking "Read more"
and "FAQ" was intercepted — URL stayed on the pack, notice showed the capture date
and the real target URL (https://ncc.gov.ng/frequently-asked-questions). Screenshot
on file. Guard sha256 b7a7b37c... (full: see file), 2271 bytes.

NOTE: harz-vf-preview.hamzarabiu390.workers.dev returned 404 on Oct 16 — the pack
door appears removed; whichever seat owns it should confirm where packs are served
now.

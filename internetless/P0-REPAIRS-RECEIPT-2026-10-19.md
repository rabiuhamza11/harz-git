# P0 REPAIRS RECEIPT — Internetless Commercial Sprint (Oct 19, 07:40-08:00 WAT)

Per the sprint ledger (21493ce) and the owner's standing order: all repairs server-side, verified, before asking Dad for any device testing.

## 1. EFCC styling — CLOSED AS ALREADY REPAIRED (stale ledger note)
- Vault note claimed EFCC pack opens unstyled. LIVE CHECK: Magani's Oct 18 rebuild is a rendered-DOM snapshot with 357 inline <style> blocks (223,801 bytes of CSS), 0 external stylesheets, 0 non-data images. The pack is fully styled offline.
- Acceptance: ALREADY MET server-side; only Dad's airplane-mode screenshot still owed.

## 2. Stray images — REPAIRED
- Problem: 3 <img> tags pointed to live URLs that fail offline (nysc index 1, serviceyear 2).
- Evidence: KV originals backed up at v2now/sprint-p0/*.orig.html; NYSC WAF returns 403 to all datacenter fetchers (sandbox + weserv proxy); wayback CDX has no captures of dghome.jpg/dg4.jpg; news4.jpg recovered from wayback (69,333 B real JPEG, ffd8 magic).
- Repair (smallest effective, honest):
  a) index.html: news4.jpg replaced with the REAL recovered image as data URI (92,467 chars). Provenance: web.archive.org snapshot of nysc.gov.ng/img/news4.jpg.
  b) serviceyear.html: dghome.jpg + dg4.jpg (generic gallery photos, alt "Image 1"/"Image 2", never archived, unreachable behind WAF) replaced with styled honest SVG placeholders: "Photo not preserved — original: /img/dghome.jpg — needs connection". No substitution, no fake success, no broken icons.
- KV writes: PUT v2.pack.nysc.gov.ng.index.html (763,843B) + v2.pack.nysc.gov.ng.serviceyear.html (978,265B) — API success True.
- Live acceptance VERIFIED through the worker (same path the phone uses):
  index: HTTP 200, non-data imgs 0/0. serviceyear: HTTP 200, non-data imgs 0/0.
  news4 embedded as real JPEG: True. Placeholders decode with honest text + original path: True x2.

## 3. SEC — DEFAULT HELD OUT of release one (owner silent; never captured; 404 confirmed Oct 19). Owner can overrule.

## 4. Remaining P0 on other seats: root-a re-sign (Magani, wrong anchor directive stands); Dad's ONE device session (full journey + EFCC screenshot) after all repairs land.

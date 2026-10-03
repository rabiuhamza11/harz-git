# HPR SOIL EXPANSION v0.1 — DEPLOY RECORD (Magani, Oct 3, 2026)

Owner order: "Build them" (Vercel, Netlify, Render — tokens I hold). Desk package node-cloud/
(286abea) pulled and verified by MY OWN battery before any deploy: capsule intact, 18/44,
book digest bf4681b518b7f524e2ec5080d3a29899434af82598f367d569bc1feda52bdb5e, writes sealed-refused 403.

## SOIL 1 — VERCEL: LIVE, VERIFIED (witness entry test PASSED)

URL: https://harz-hpr-zeta.vercel.app
Project: harz-hpr (prj_L33zMtCPYqSq1KzZNpnOuIvEvVUc, team harz). 9 serverless functions
(Hobby plan hard cap: 12 per deployment — learned live).

Glue: adapter.mjs (shared core, Node-style) + per-route wrappers. All deploy glue in this folder.

Verified live (my own runs, then real browser):
- /api/verify: CAPSULE INTACT — sealed-engine verdict, digest EXACT PIN bf4681b518b7f524…
- /api/export: state byte-identical to workbench export; ui_manifest intact; engine pin 434c41d2
- ALL 6 UI assets: served hashes recomputed == sealed ui_manifest (tamper guard live through wrappers)
- POST /api/record → 403 sealed-refused (no walkout); POST /api/mesh/receive unsigned → 403 REFUSED verdict from sealed gate, zero_ingest
- Browser PASS: state line rendered "CAPSULE INTACT · records: 18 · seals: 44 · digest bf4681b5…"
- Boundary served at /boundary and /api/boundary (never-hidden-boundary rule)

## VERCEL LAWS (learned live — desk's node-cloud/adapters/vercel must absorb)

1. Node functions speak (req, res). A default-exported handler that RETURNS a Response has the
   return IGNORED — the request HANGS. Desk's adapters/vercel/api/[[...path]].mjs has this bug.
2. Multi-segment catch-alls unreliable for standalone functions: api/[...path].mjs matched
   single-segment (/api/export OK) but /api/a/b/c → Vercel NOT_FOUND. Two-segment runtime
   route /api/mesh/receive needs an explicit static-path wrapper (api/mesh/receive.mjs).
3. [[...path]] optional catch-all is Next.js app-router syntax — not valid for standalone functions.
4. vercel.json rewrite sources are path-to-regexp — negative lookahead ((?!api/)) NOT supported.
   Use explicit per-path rewrites (7 listed in vercel.json).
5. A rewrite whose destination matches its own source loops forever (probe deploy hung 25s).
6. Hobby plan: max 12 serverless functions per deployment — consolidate wrappers.

## SOIL 2 — NETLIFY: BLOCKED (token dead — owner hands)

Vault token nfp_MvQz… REJECTED LIVE: GET /api/v1/user → 401 Access Denied.
That is the provider rejecting the credential (not exposure law). ASK: fresh Netlify personal
access token (app.netlify.com → User settings → Applications → Personal access tokens).
Staging ready and vaulted here (netlify/): Functions v2 wildcard routing —
export const config = { path: "/*" }, web-standard Request/Response, esbuild bundler,
function dir netlify/functions/api/ with frozen pair as siblings (bundler traces imports).
NOT DEPLOYED — nothing was live, nothing claimed.

## SOIL 3 — RENDER: BLOCKED (card required — owner hands)

POST /v1/services → "Payment information is required to complete this request."
Render demands billing on file even for the free plan — my earlier cardless list wrongly
included Render; corrected here. (Cardless Tier-1 set is now only Vercel, Netlify, Koyeb.)
GitHub repo pushed and READY: github.com/rabiuhamza11/harz-hpr-render (public, server.mjs
adapter + frozen pair + boundary + honest labels: SLEEPING class, ephemeral disk, read-only).
The moment a card is on file, one API call lights it. NOT DEPLOYED — nothing claimed.

## POSTURE (all soils)

Verify-and-receive READ-ONLY at base book: kv = null. Writes refused by the sealed engine
(no walkout); mesh adoption refused honestly (503) after the sealed gate computes verdicts.
Availability + failure-domain independence, NOT added integrity (digest is the integrity —
recomputable anywhere). R8 adoption window untouched — soils re-pull and follow the merge when
the window resumes. Honest labels in every walkedFrom string.

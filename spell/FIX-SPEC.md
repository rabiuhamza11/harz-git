# SPELL Backend Fix Spec (Oct 2, 2026) — for the desk

## Verified broken (Magani, Oct 2, curl evidence)
- GET https://harz-spell.hamzarabiu390.workers.dev/api/services returns 200 with content-type text/html — the dashboard HTML shell, not JSON.
- POST /api/spell with {"code":"mint { }"} returns 200 text/html — same shell.
- Meaning: the SPA fallback route swallows API routes; SPELL UI cannot talk to its own backend; OMNINET cannot wire to it.

## Fix requirements
1. Register API routes BEFORE the HTML catch-all (route order: /api/* handlers first, then the SPA fallback).
2. /api/services must return JSON { success, services } with content-type application/json.
3. POST /api/spell must accept {code} and return JSON (parse result / error), never HTML.
4. Keep PWA compliance (manifest + service worker + cached shell) intact after the fix.
5. Deploy from shared source (HarzGit) per standing instruction, through the harz-deploy-gate, owner approval first.

## Blocker
No SPELL worker source exists in HarzGit or the Magani workspace, and no working Cloudflare token to pull the deployed script (all stored tokens rejected live Oct 2). Desk holds the source or pulls it once a token is issued. This spec is the verified contract of what the fix must do.

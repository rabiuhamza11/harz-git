# HARZ INTERNETLESS — FINAL INTEGRATION DIRECTIVE (owner, Oct 17, 2026)
One integration, one test matrix, one final verdict. No combining unrelated PASS
results into a completeness claim. All work converges on ONE integrated build.
1. Authoritative build identity (commits, URLs, worker versions, shell/SW versions,
   actual version on the Infinix — a deploy does not auto-update an installed PWA).
2. Connect existing components (resolver, browsers, packs, sealed corpus, search,
   SW shell). No parallel browsers, no disconnected resolvers.
3. Close known gaps on the INTEGRATED build (dead handlers, stripped links,
   live-domain loads, missing resources, search-to-body, reload-visibility,
   stale shells, corpus-text-not-retrieved, online-only navigation).
4. Every click verified through USER ACTION → RESOLVED → STORAGE → BODY →
   INTEGRITY → DISPLAY.
5. One matrix, connected + airplane: A startup/restart, B Open Offline, C multiple
   internal clicks, D captured cross-domain, E uncaptured, F images/resources,
   G search before/after download, H search→full body, I direct URL, J back/
   forward/refresh, K missing/corrupted, L recovery after reconnect.
   Desktop evidence separated from device evidence.
6. Sealed library unchanged; identities verified after integration.
7. Final report separates: resolver tests / integration tests / connected-device /
   airplane-device / FAILURES / NOT TESTED. Component PASS != system PASS.
GATE: the actual Infinix in airplane mode — open, navigate, search, retrieve,
verified bodies. No unrelated work until satisfied.
IMMEDIATE (owner): one online phone test — open installed HARZ app → tap
Harz Circle → does it open? → navigate one more page → report. Do NOT clear
app data or uninstall (preserves cached content + running-version evidence).

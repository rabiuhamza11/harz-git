# DIRECTIVE (Magani): harz-root serves a zone signed by a NON-PINNED key
Found Oct 18 ~15:45 during owner field run ("book button not working").
- harz-root.harz.workers.dev/zone → height 6, 80 records — loadZone REFUSES: "WRONG ANCHOR — signer is not the pinned trust anchor". The PWA (correctly, per the frozen law) refuses it and falls back to harz-root-b (height 2, 77 names, VALID king signature).
- Action needed: either re-sign the height-6 zone with the pinned king key, or restore the pinned-signed zone on harz-root. Do NOT change the PWA's pinned anchor to accept this zone — the anchor is frozen law; the node data must be fixed, not the verifier.
- Client-side hardening shipped (v0.7.1): 15s AbortController timeout per root node + honest per-node failure text, so a hanging network can no longer stall the FETCH button silently.

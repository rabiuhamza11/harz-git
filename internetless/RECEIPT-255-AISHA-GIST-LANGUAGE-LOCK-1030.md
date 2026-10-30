# RECEIPT 255 — Aisha seat, Oct 30 2026
## harz-gist language mirroring (owner: "If I ask in English let answer be in English when Hausa then let it be in hausa")

Change: hard LANGUAGE LOCK injected per turn (Hausa in -> Hausa only; English in -> English only), plus a scored detector replacing the naive marker test.

Two real bugs found and fixed during testing:
1. Marker "me" matched English sentences ("Give me...") -> English question answered in Hausa. Fixed: ambiguous markers removed.
2. Pure Hausa without listed markers ("Ka gaya mini wani abu game da HARZ") fell through to English and even meta-commented. Fixed: added Hausa phrase markers (gaya, wani, game da, mini, yake, take, suke) and a scored comparison (Hausa markers vs English markers, Hausa wins ties).

Post-fix live evidence (4/4 correct):
- EN "Give me one short sentence about my projects." -> EN answer, memory recall intact
- HA "Ka gaya mini wani abu game da HARZ." -> "Kana da NRL token wani sabon aiki da kake gudanarwa."
- EN "How is my trading machine doing today?" -> EN answer (DEMO, Nov 6 verdict)
- HA "Yaya kasuwancina yake yau?" -> Hausa answer, natural register

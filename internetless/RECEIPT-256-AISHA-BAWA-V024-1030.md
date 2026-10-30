# RECEIPT 256 — Aisha seat, Oct 30 2026
## BAWA upgraded to v0.24 (owner: "Upgrade")

Change (authorized by "Upgrade" after audit receipt + plan):
1. LANGUAGE ROUTING per standing rule: Hausa -> @cf/meta/llama-4-scout-17b-16e-instruct; English -> @cf/meta/llama-3.3-70b-instruct-fp8-fast (previously gpt-oss-120b for everything). Scored detector (Hausa cues vs English cues; Hausa wins ties).
2. HARD LANGUAGE LOCK appended to the system prompt per turn.
3. Honest version bump 0.23 -> 0.24 (UI string + /health literal) — the version string no longer lies about the brain.
4. All 13 bindings preserved via keep_bindings (AI, BAWA_KEY, BAWA_KV, 9 service bindings, secrets).

Live verification post-deploy (owner key, real calls):
- EN "How are you doing?" -> EN answer
- HA "Yaya kake? Amsa a takaice." -> "Yayi kyau, godiya. Ta yaya zan iya taimaka maka, Hamza?" (natural)
- HA memory: "Ka gaya mini wani abu game da kasuwancina." -> "Kana da wani gwaji na cinikayya wanda zai rufewa a November 6." (memory in Hausa)
- /health: version 0.24, brain llama-3.3-70b + offline core + device pack.

HONEST NOTES:
- Earlier verified intact: structured memory (remember -> cold recall "Your experiment closes on November 6") and the verifier ("harzpay is UP (HTTP 200)") which my own probe corroborated (harzpay v3.4.1 healthy on harz account).
- Nuance: a vague prompt ("say something about harzpay") made BAWA say it would need to probe instead of probing; explicit questions ("is harzpay up?") do probe. Tool-trigger breadth is a candidate tuning item, not a defect.
- v0.23 brain bug from owner's screenshot ("memCtx is not defined") no longer reproduces on the current build.

# RECEIPT 254 — Aisha seat, Oct 30 2026
## Harz-gist Hausa fixed by model routing (owner: "Still rubbish Hausa")

Diagnosis: prompt tuning was not the ceiling; llama-3.3-70b's Hausa register was. Ran a 4-model side-by-side on Workers AI with identical Hausa prompt:
- llama-3.3-70b: coherent but rambling, invented market content
- gemma-3-12b: NOT ACCESSIBLE on this account (error 5018)
- mistral-small-3.1: internal error (8008)
- llama-4-scout-17b: WINNER — natural spoken Hausa, used the idiom "bakin wake", short warm register

Change: model routing in harz-gist chat — Hausa marker detection routes to @cf/meta/llama-4-scout-17b-16e-instruct, English stays on llama-3.3-70b. Debug endpoint /api/modeltest (auth-required) retained for future model comparisons.

Live post-deploy evidence:
- "Yaya kake? Na gaji yau..." -> "Sannu! Ina lafiya, kai kuma? Toh, huta kadan, aikin ba zai gudu ba. Me ya fi damun ka a kasuwancin? Harz Digital Services yana aiki da kyau?"
- Memory recall in Hausa: "abokan ciniki goma da suke biya a watan Disamba 2026" (previous garble "tarba dara" eliminated)
- English still routes correctly (project update sample verified)

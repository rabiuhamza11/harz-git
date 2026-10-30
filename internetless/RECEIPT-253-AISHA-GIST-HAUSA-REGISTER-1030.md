# RECEIPT 253 — Aisha seat, Oct 30 2026
## harz-gist Hausa register fix (owner feedback: "Hausa is not fluent, let it speak like not computer")

Change: CHARACTER prompt extended with spoken-Nigerian-Hausa register rules (everyday fillers, short sentences, natural English tech code-switching, no textbook/news register) plus 3 few-shot Hausa exchanges. Deployed to harz-gist.

Live verification (post-deploy, real API):
- "Yaya kake? Ina son labari." -> "Sannu da zuwa. Ina lafiya, kai kuma? Ina jin labarin kasuwancin Harz Digital Services, shikenan, yadda ake tafiya?"
- "Wallahi na gaji yau, kasuwanci yana da wuya." -> "Toh, huta kadan, aikin ba zai gudu ba. Me ya fi damun ka..."
- "Me ka sani kan burina na kasuwancin?" -> "Na san kana son sayar da digital setup ga shaguna a Gembu, kusan dubu hamsin, burinka kuma dubu dari..."

Honest limits: register is now human, but occasional word slips remain (e.g. "10 clients" rendered as "tarba dara" once). Voice TTS reads Hausa only if the device TTS engine has a Hausa voice; otherwise Hausa text is shown and read with the nearest voice.

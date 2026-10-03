# HPR Cloud Node — Render Soil

HARZ Portable Runtime serving the sealed capsule v15-merge-rung2 (18 records / 44 seals,
book digest bf4681b518b7f524e2ec5080d3a29899434af82598f367d569bc1feda52bdb5e, engine pin 434c41d2).

Read-only verify-and-receive node at the base book. Writes are refused by the sealed engine
(no walkout marker); mesh adoptions are refused honestly (no overlay store).
Verify yourself: /api/verify (sealed verdict), /api/export (fetch the book, recompute the digest),
/api/source (sealed engine bytes), /boundary (honest limits).

Free-tier soil: sleeps when idle; ephemeral disk. Integrity is the digest — recomputable anywhere.

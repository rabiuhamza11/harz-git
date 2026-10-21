# HARZ Node B — GitHub Pages storage mirror (free tier)

First independent storage node of HARZ Mesh Storage (Stage 2 milestone). Different provider, different failure domain from Node A (Cloudflare worker).

Serves: per-document retrieval of the sealed v2 corpus text, fetched on demand, no full-corpus sync required.
- docs/<id>.json — the document (title, text, provenance)
- manifest.json — id -> sealed sha256 of text, plus the rejected integrity-exception list

Law: only documents whose sha256(text) matches the sealed TX map were accepted. 1987 accepted. 5 server-side documents FAILED their seal and are excluded (honest integrity exceptions, escalated).

Retrieval: https://rabiuhamza11.github.io/harz-git/node-b/docs/<id>.json

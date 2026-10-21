# MESH STORAGE MILESTONE 1 — TWO INDEPENDENT NODES ONLINE (Oct 21, 19:4x WAT, Hauwa desk)

Laptop unavailable per owner. Node B built laptop-free, zero-budget: GitHub Pages (free tier, different provider, independent failure domain).

## The two nodes
- NODE A: harz-offline-browser worker (Cloudflare, D1 corpus). Serving per-doc on demand (proven Oct 21 fresh-browser test, doc 815, seconds, hash-verified).
- NODE B: https://rabiuhamza11.github.io/harz-git/node-b/docs/<id>.json — 1987 sealed-verified docs (15MB), manifest with per-doc sha256, committed to main (Pages serves root).

## Proof (measured, both nodes, same document)
Doc 815 from Node A: sha256 de216a7cd334a425… — MATCHES SEAL.
Doc 815 from Node B: sha256 de216a7cd334a425… — MATCHES SEAL.
Both nodes return identical bytes-verified content. No full-corpus sync anywhere in the flow.

## The strict gate caught real discrepancies
5 of 1992 server-side documents FAILED their sealed hash: ids 1719, 1794, 1892, 1896, 1903.
They are EXCLUDED from Node B and recorded here as integrity exceptions. Escalation: journal entry + desk review of the 5 (suspect: v0.8 linkify-adjacent repairs on those docs). The mirror accepts only sealed-verified content — this is Stage 1's no-silent-modification law working.

## Next rungs
1. Client-side resolver: shell tries Node A, falls back to Node B on failure (marker gate).
2. The 5 integrity exceptions adjudicated and repaired.
3. Retention + replication policy draft (Stage 1 remaining gap).

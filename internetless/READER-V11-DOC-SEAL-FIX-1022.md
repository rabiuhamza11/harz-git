# READER v1.1 — DOC-LEVEL SEAL FIX; LAST FAKE-RESULT PATH CLOSED (Nuruddeen, Oct 22 ~10:4x WAT, owner "Go on")

## Root cause (found in deployed code, not theory)
harz-fulltext-reader v1.0 verified the CHUNK seal (chunk sha256 vs manifest) but NEVER hashed the
DOC's text against its claimed content_hash. Snippet-era rows carry content_hash labels of the FULL
text while the stored chunk text is a snippet — sealed chunks containing mislabeled rows were served
as "SHA-256 VERIFIED". Fault first caught live Oct 22 (cf41146), root-caused and fixed this turn.

## Scale (measured)
Sample battery on the 21,377-entry store: 3/10 docs served mismatched text under their claimed hash
(~30% est. affected, sample-based). Canonical fault: de216a7c (v2 doc 815's seal) served 9,148ch
hashing 1ff4c807. All disclosed, nothing hidden.

## Fix deployed (owner word: "Go on")
Reader v1.1: after chunk seal, recompute sha256(doc.text) — mismatch => 502 honest refusal
"DOC SEAL MISMATCH — stored text does not hash to the requested content_hash; refused".
Deployed via CF API with bindings preserved (STORE kv d3a8834...). Code archived in this commit.

## Post-deploy battery (live, my seat)
4/4 faulted hashes REFUSED (incl. canonical de216a7c); 7/7 clean hashes SERVED doc-hash-verified;
0 fake serves. ALL PASS. The mesh law now holds at every serving layer: successor reader, keep
routes, and the sft reader.

## Data flag for the corpus lane (not a blocker)
Refused docs are mislabeled rows, not lost content — correct full text lives elsewhere (e.g.
de216a7c's true body is v2 doc 815). The store's own coverage note says misses re-gather via waves;
the lane may re-gather or relabel at its discretion. Reader no longer lies either way.

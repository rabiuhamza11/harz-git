# NODE B VERIFICATION (Team F, by hand, Oct 27 ~03:2x WAT)

1. Magani's repair is COMPLETE and correct: the full export is restored. Authoritative git tree count: 1,992 id-keyed doc files (not 1,990). His "1,990" was a miscount from the GitHub contents API, which silently caps directory listings at 1,000 entries — the same trap Team F hit during verification. Nothing is missing.
2. The duplicate pairs are REAL and verified by hash: 891 ≡ 908 (sha dec4732f39402fa7…), 1988 ≡ 1989 (sha 6a3054de59417c43…). Both files of each pair exist id-keyed; the ID contract holds: every /node-b/docs/<id>.json returns 200.
3. Test object re-verified live: doc 1719 at 17,534 bytes, text sha bd3ea5622e2a5f35… matching the trusted seal. Accept as the first acceptance-test object, per the verifier's staging (e10905c order accepted).
4. OPEN ITEM (device-side): Sunday's two-phone run FAILED at an unknown step. Awaiting the owner's one line: which step and the exact message. Nothing device-side is claimed proven until that diagnostic closes and the airplane-mode retrieval passes on film.

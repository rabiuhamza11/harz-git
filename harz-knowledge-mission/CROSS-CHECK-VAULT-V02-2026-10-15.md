# CROSS-CHECK — VAULT v0.2 CLAIMS (this seat, Oct 15 ~12:4x WAT, read-only)
Sibling seat claims vault v0.2 live: gzip bundles in D1, 13.92x test
batch, ~3x honest expectation, "12GB effective on 4GB free headroom".

## Verifiability from this seat: NOT REACHED
- harz-sovereign-storage (this account): last deploy Oct 13 03:08 UTC —
  NO v0.2 deploy here; endpoint keyed (401 without FLOOR_KEY).
- its STORE db (06f71a5c, sovereign-store-00): 0.04GB, tables
  [_cf_KV, entries] with 2 voicevault language entries — no bundle tables.
- BUILD-RECORD.md (v0.2) is NOT on the harz-git bridge.
=> The v0.2 vault lives on the SIBLING seat's infrastructure. All its
numbers are single-source until artifacts reach the bridge or a keyed
read endpoint is shared. No dispute — object and seat named per policy.

## Compression on REAL corpus text — MEASURED by this seat
Scanner assumptions declared: 60 docs, rowid-stride 22000 across the
bodies table (insertion-order spread), gzip level 9, UTF-8, read-only.
- per-doc: overall 2.38x | median 2.07x | min 0.93x (gzip overhead on
  small docs) | max 4.15x | 27/60 below 2x
- 60-doc bundle (vault-like packing): 2.63x
- projection: 9.04GB bodies -> ~3.44GB (bundle) / ~3.79GB (per-doc)
=> the "13.92x" HTML-like test batch is NOT representative of this
corpus; the honest measured number is ~2.4-2.6x, below the sibling's
~3x expectation. ~12GB effective on 4GB physical is optimistic here;
measured expectation is ~10GB on 4GB.

## Object question on "4GB of free headroom" (per naming discipline)
Free tier = 5GB per ACCOUNT TOTAL (not per-DB). Whatever account the
vault DB fills on counts against that account's 5GB free allowance.
a2's D1 totals are not visible from this token. Free-tier-clean must
be audited across BOTH accounts; sibling seat must publish a2 totals.

## What measured compression changes for FREE TIER CLEAN
Even with corpus bodies compressed to ~3.44GB: master 3.85 + idx 0.99
+ compressed 3.44 = 8.28GB > 5GB. Curation is still required — but at
measured bundle ratio the retained-with-full-text subset is ~2.5x
larger than the raw-text math allowed. Example free-tier-clean shape:
curated compressed bodies ~1.0GB (≈ 2.6GB raw text ≈ 400-500K docs) +
curated master ~1.0GB + rebuilt idx ~0.3GB ≈ 2.3-2.5GB total, under
the 5GB ceiling with room.
No repairs, no merges, nothing deleted. Measurements only.

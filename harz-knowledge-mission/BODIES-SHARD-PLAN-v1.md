# BODIES SHARD PLAN v1 — DRAFT FOR OWNER RULING (Oct 15, ~10:0x WAT)
Owner rulings this plan implements: (1) ingestion freeze lifted for WHOLE
ingestion (owner, Oct 15 ~09:53 WAT); (2) "Draft" = this plan, execution
still needs his go. R2 ruled out for corpus (Oct 12). D1 10GB per-DB hard
limit is the binding constraint.

## Measured state (Oct 15, ~10:00 WAT)
- harz-corpus-bodies-db: 9.04GB of 10.0GB hard limit -> ~0.96GB headroom
- harz-million-corpus (master, docs table): 3.85GB
- Account D1 total: 17.44GB (5GB included, then ~$0.75/GB-mo -> ~$9.3/mo now)
- Active writer: dump-enwiki (721 docs and loading, owner-ordered)
- Bodies rows: 1,328,715+ keyed content_hash; reads go
  docs -> content_hash -> bodies (two-tier, Oct 13 migration)

## Headroom math
0.96GB headroom. Enwiki average body ~4-8KB after strip -> ~120K-240K docs
of headroom, but a burst or a large-article batch closes it fast. At the
current drip (~750/day) weeks; at bulk speed hours. THE LIMIT MUST BE
MANAGED BEFORE THE NEXT BULK BATCH, not at the limit.

## Design: additive shard ring (no in-place restructuring)
1. SHARD-00 = existing bodies db (a75c7faf). Freeze at a FILL CEILING of
   9.4GB (0.6GB safety margin below the hard limit). At ceiling the
   writer routes all new bodies to SHARD-01 and never writes 00 again.
   Shard-00 keeps its 1,328,715+ rows untouched — no migration of old
   bodies, zero read risk to the frozen corpus and the sealed kits.
2. SHARD-01..N = new empty D1s (harz-corpus-bodies-01, -02, ...), same
   schema (bodies, keyed content_hash, ~100KB statement chunking). Fill
   ceiling per shard: 9.4GB. Each shard fills sequentially (simplest
   routing; no hash-prefix split needed).
3. ROUTING: master docs table gains one column body_shard (ALTER TABLE
   ADD COLUMN, additive, nullable; existing rows = NULL = shard-00).
   Writer stamps body_shard at insert. Reader: body_shard null -> 00,
   else named shard. Backward compatible with every existing read path.
4. WRITER CHANGES (harz-million-corpus worker ingest paths): check
   current-shard usage (D1 API file_size or a meta counter), route new
   bodies to the active shard, stamp body_shard, roll to next shard at
   ceiling. One reusable WAVE/MIG key pattern per HARZ MIGRATION
   PROTOCOL v1 (scoped, logged).
5. READER CHANGES: corpus worker + harz-fx-search lookup honors
   body_shard (fall back to 00 on null). harz-fx-idx frozen index is
   unaffected (index references doc ids, not shard layout).
6. VERIFICATION GATES per protocol: (a) dry-run of routing logic
   against a scratch DB; (b) single-doc write/read through new path
   with receipt; (c) fill-ceiling trigger test at a low test ceiling;
   (d) regression: 5K kit + FX search + reader all byte-identical on
   existing content; (e) only then bulk loads route to shards.

## Billing reality (D1 bills ACCOUNT-TOTAL, not per-DB)
Per-DB sharding removes the 10GB crash risk but every shard still bills.
At full English-Wikipedia scale (~6.9M articles, 20GB+ text) D1 cost
becomes ~$14+/mo just for bodies. Recommend the owner set a COMBINED
corpus budget (e.g., master + all bodies shards <= 25GB ≈ $15/mo) and
scope the enwiki load as a PRIORITY SUBSET (e.g., the ~1M most-linked
articles) rather than the full dump — full dump belongs on a future
ruling with its own budget math.

## Open decisions for the owner (blocking execution)
D-A: approve this plan (or amend).
D-B: combined corpus storage cap number (proposal: 25GB ≈ $15/mo).
D-C: enwiki scope: priority subset (~1M articles) vs full dump (needs
     its own budget ruling).
D-D: quarantine 12,722 disposition now that ingestion is unfrozen —
     keep quarantined, or re-adjudicate? (No purge; records survive
     any disposition per the standing clause.)
D-E: tier-3 index growth is separate from corpus storage; confirm it
     has its own headroom plan (it does: harz-fx-idx 0.99GB + tier-3
     index small).
Nothing executed from this seat; draft only, per "Draft".

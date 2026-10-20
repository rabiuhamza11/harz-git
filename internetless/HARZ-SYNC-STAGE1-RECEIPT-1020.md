# HARZ SYNC STAGE 1 CLOSED — JOURNAL + REAL HASHES (Oct 20, 2026 ~13:05 WAT, Nuruddeen)
# Mission order locked by owner-forwarded counsel: Stage 1 journal+hashes -> 2 receipts+panel ->
# 3 interrupt testing -> Infinix decisive test (with one deliberate mid-transfer interruption) ->
# .harz bundle -> phone-to-phone -> authoring w/ review queue.
# MILESTONE (framing law): not "HARZ Sync built" but "HARZ Sync survives a real interruption
# without losing an eligible update."

## Evidence of close (all computed from ACTUAL stored bytes, never trusted from a field)
1. REGISTRY CLEANED: 63 stale duplicate keys (key-defect leftovers, extensionless twins) identified;
   62 purged + 1 dup tc root purged after fix (verified 404). Clean registry: 286 resources.
2. FULL HASH PASS: 286/286 resources fetched from KV and SHA-256 computed from the served bytes.
   Total library mass measured honestly: 400.7 MB (includes corpus packs pre-dedup on some roots).
3. DURABLE CHANGE JOURNAL LIVE: KV v2.journal, schema harz-journal-v0, 285 entries
   (286 minus the purged dup), each entry: stable id, resource key, origin (provenance URL parsed
   from page banners where present), sha256, size, version 1, state "stored".
   State law recorded IN the journal: "stored = durably stored server-side, NOT yet device-receipted."
   Detection != delivered. Attempted != successful.
4. PACK REGISTRY SEALED: all 20 packs' sha256 fields now carry REAL root hashes (placeholders
   "—" eliminated). CAS + marker gate respected; readback identical.
   NOTE: other desks added 4 new packs mid-work (ncc.gov.ng, cbn.gov.ng, nis.gov.gov? nis.gov.ng,
   premiumtimesng.com) + healthline.com — the hash pass covered them automatically; zero conflict.
5. SPOT VERIFICATION PASSED: dmo.gov.ng pack re-fetched and re-hashed from KV after journal write;
   recomputed hash matches journal/registry exactly (e68b387c93d1c528...).
6. Change observed honestly: dmo pack now 5.0MB vs my 975KB morning upload (another desk's refresh);
   journal hashes what is ACTUALLY stored at hash time, per law.

## Honest follow-ups (not blockers)
- tc root served undeduped (11.5MB vs 899KB deduped version available): ~10.6MB reclaim available.
- 1 stale-key delete of 63 reported non-200 once; the key verified gone in the final check (counted).
- Per-device delivery receipts (Stage 2) do not exist yet; nothing is "delivered" until then.

## Rules now binding (three rules + reuse)
Detection != delivery. Hash = real bytes. Attempted != successful. REUSE the proven hash-and-verify
spine (100/100 battery standard); every new piece sits on it. Inbound sync = Gate 2 engine;
outbound rides mesh rails; conflict rules BEFORE first two-way test; review queue for anything
public, auto-accept only for operational records (pending owner final word, working default).

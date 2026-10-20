# TEXT-LIBRARY BACKUP RECEIPT — Oct 20, 2026 (Nuruddeen)
Backup of every KV value in scope for the retirement of the text layer, pulled BEFORE any deletion.
- Bundle: 84855d3c21b6cc82 (sha256 of MANIFEST-sha256.txt)
- Files: 29 (all values + this manifest + receipt)
- Total bytes: 38453669
- Scope: v2.docs.0-17 (v0.9 doc shards), onefile + onefile.0 + onefile.meta (sealed v1 one-file),
  vol.manifest + vol.vol-001..003 (Reader volumes), v2.urlmap, v2.shell (pre-deletion state).
- Every file's sha256 in MANIFEST-sha256.txt. Restore = PUT each file back to its KV key
  (slash in key names is literal, e.g. v2.docs.0; onefile.0 was an empty shard, preserved as-is).
- Namespace: 409fead4fdc24e288efe5af2bb5a1de7, account c0bea6cfc6c0c69fc0adeba4c8b85f3e.
- NOTE: a1-side one-file readers and the 127MB search D1 are NOT in this bundle; they get their own
  backup before their deletion (no-loss law applies to them equally).

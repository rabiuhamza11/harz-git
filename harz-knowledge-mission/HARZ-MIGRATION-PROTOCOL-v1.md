# HARZ MIGRATION ISOLATION PROTOCOL v1 (Ruling 002 control-plane requirement)

Any operation that changes WHERE authoritative document bodies reside MUST
follow this protocol. Written from the owner's 7 requirements; effective on
acceptance; supersedes ad-hoc restructuring.

M1. AUTHORIZATION: a recorded approval from the owner, or an explicit owner
    charter naming the migration, referenced in every deployment and in a
    meta key migration_auth BEFORE any data moves. Include: scope, source,
    destination, planned window, rollback owner.

M2. PREFLIGHT: snapshot and record baseline — document count, SUM(size),
    content-hash sample set (>= 1000 docs), storage per database, index
    state (parts count, builder checkpoints), written to meta + harz-git.

M3. COORDINATION: no other corpus writers/readers may observe a partial
    state. REQUIREMENT: a corpus-wide migration lock (meta key
    migration_lock with TTL + heartbeat) that (a) pauses FX builders via
    their lock checks, (b) is advertised so other agents detect HOLD
    before acting. Builders/search services must fail-safe (read old
    location) while the lock is fresh.

M4. VERIFY-BEFORE-RETIRE: destination writes verified (count + hash sample
    match) BEFORE the source representation is cleared. The incident
    migration did verify-by-design (INSERT OR IGNORE keyed by content_hash)
    but verification evidence must be WRITTEN (hash sample reconciliation
    record), not implied.

M5. RECONCILIATION: exactly one authoritative body location per document
    at closure, or a documented transition state with a completion deadline.
    Full ID-set reconciliation (the Gate A method) at closure.

M6. RECOVERY: a tested resume path (checkpointed, idempotent — the incident
    route had body_next checkpointing; ACCEPTED as adequate) AND a tested
    rollback path (source retained until closure + reconciliation; rollback
    = re-hydrate source from destination, tested on a sample).

M7. CLOSURE: migration declared complete ONLY after independent
    reconciliation, evidence preservation to harz-git (timeline, batch
    counts, error counts, verifier identity), and owner acknowledgment.
    The meta ledger must record: started_at, finished_at, batches, errors,
    verified_by.

CREDENTIAL RULE: routine-ingestion keys MUST NOT authorize restructuring.
Create a scoped MIG_KEY per migration (issued by owner, recorded in the
authorization record, retired at closure). General WAVE_KEY stays
ingestion-only. Rotation of any key: preserve evidence first, map
dependencies, then rotate in a controlled window (owner's standing rule).

GOVERNANCE: all corpus-worker code must be committed to harz-git before
deploy (the incident's migration code was not — this gap is why the audit
had to reverse-engineer the route from the deployed bundle).

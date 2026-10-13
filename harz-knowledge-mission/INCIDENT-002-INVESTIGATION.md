# INCIDENT 002 INVESTIGATION REPORT (Oct 13, authorized by Ruling 002)
# Corpus body-migration of Oct 13 — evidence, timeline, attribution

## EXECUTIVE FINDING
ACTOR: UNATTRIBUTABLE FROM AVAILABLE EVIDENCE (per owner's standard).
The evidence establishes a precise capability + activity profile and rules out
Nuruddeen; final human attribution requires cross-examination of the other
agent sessions' own logs (see "What only the owner can check").

## WHAT THE EVIDENCE SHOWS (all verifiable)

1. EXECUTION PATH: the corpus worker's migration route (harz-million-corpus,
   /api route, MIG_KEY|WAVE_KEY|ADMIN gated) executed the migration — proven
   by the route's own meta ledger in the corpus DB:
   body_migrated = 1,328,715 | body_next = 1,328,715 | body_bytes = 7,650,231,226
   | d1_text_bytes = 0 (remaining text) | batch size 500 docs/call.
   The actor therefore HELD a valid WAVE_KEY or MIG_KEY value (capability fact).

2. TIMELINE (Cloudflare GraphQL invocation analytics, hourly):
   - Oct 13 03:00-04:00 UTC: 1,652 requests (ids ~1 -> ~826K migrated)
   - 06:00-07:00 UTC: 808 requests
   - 07:00-08:00 UTC: 308 requests
   - TOTAL: 2,768 requests ~= 2,658 expected calls (1,328,715 / 500) + retries.
   Migration COMPLETE by ~08:00 UTC. (Corrections to the earlier FX record:
   the "160 missing" were race casualties of THIS window; my Gate A at
   ~10:00 UTC merely discovered the already-finished migration.)

3. DEPLOYMENT FINGERPRINT: harz-million-corpus worker redeployed 3x via API
   upload within 69 seconds: 03:10:17, 03:10:23, 03:11:26 UTC (04:10-04:11
   WAT) — a rapid debug-iterate session — immediately before migration start.
   Deploy history: 10 deployments since creation (Oct 8); prior ones: Oct 12
   08:37:52 via WRANGLER (Magani's corpus-wave deploy, session-logged) and
   Oct 12 05:46/08:37 via API (ingest-wave era).

4. POLICY DECLARATION LEFT IN META (author's own words):
   cap_policy = "sovereign storage v1 LIVE 2026-10-13: bodies in
   harz-corpus-bodies-db (D1 split)" | cap_bytes = 7,500,000,000
   This was a PLANNED storage initiative with a written policy string, not a
   random corruption. The design (D1 split, bodies keyed by content_hash,
   7.5GB cap policy, R2 fallback path r2_next=0) is coherent engineering.

5. GOVERNANCE GAPS (findings, not attributions):
   a. The migration code exists ONLY in the deployed worker — NEVER committed
      to harz-git (git log -S "body_next" = empty). Production corpus worker
      code is outside version control.
   b. Worker observability/logging: NOT enabled on harz-million-corpus →
      per-request identity, IPs, and key values used are unrecoverable.
      Analytics give counts and times, not callers.
   c. A single general-purpose worker key (WAVE_KEY) authorizes both routine
      ingestion AND corpus restructuring — no separation of duties (owner's
      control-plane concern, now formalized in MIGRATION-PROTOCOL-v1).

6. NURUDDEEN ELIMINATED (own session log as evidence): Nuruddeen's last
   action before 10:52 WAT was at ~02:55 UTC (03:55 WAT, reply to Ruling
   002 ack); Nuruddeen's only deploys that night were harz-fx-build v1.1.0
   at 02:53:40 UTC (verified in deployment list). Nuruddeen never deployed
   harz-million-corpus and did not possess WAVE_KEY/MIG_KEY values.

## WHAT ONLY THE OWNER CAN CHECK
The same account API tokens are present in every agent sandbox (Magani,
Hauwa, Nuruddeen sessions). Attribution = ask each agent session for its
activity log at: (a) 04:10-04:11 WAT (3 rapid API deploys of
harz-million-corpus), (b) 04:00-09:00 WAT (2,658 migration-route calls with
a WAVE/MIG key). Session logs are per-agent and not accessible to
Nuruddeen. If no session claims it, the actor was a non-logged automation
or an external key holder; rotate credentials per the controlled procedure
below ONLY after evidence preservation (owner's instruction honored).

## RECOMMENDED CONTROLLED CONTAINMENT (requires owner approval; not executed)
1. Preserve: this report + deployment list + analytics + meta ledger snapshot
   (all committed to harz-git with this record).
2. Dependency map before rotation: a2 ob-worker gather wave (nightly 03:30
   WAT ingest via WAVE_KEY) — rotation breaks tonight's wave unless the
   new value is deployed to all legitimate holders first.
3. Then: rotate WAVE_KEY/MIG_KEY to new values; deliver to holders the
   owner designates; enable worker observability for future attribution.

---

## ADDENDUM (Oct 13, 19:35 WAT): the migration was phase one of an ongoing initiative

Discovery while enforcing the ingestion freeze:
1. PARALLEL SOVEREIGN STACK EXISTS on a1: worker harz-sovereign-storage
   (secret FLOOR_KEY; D1 bindings IDX -> harz-idx-00 537ce285..., 1.6MB;
   STORE -> harz-sovereign-store-00 06f71a5c..., 29.9MB). Neither is the
   master corpus, bodies, or FX index. This is a separate corpus store.
2. ACTIVE 5-MINUTE INGESTION LOOP: a2 worker harz-corpus-wave (created
   Oct 8, cron ADDED TODAY 06:49:09 UTC = 07:49 WAT — during the migration
   window) claimed the gather queue (HARZ_BROWSER KV), crawled domains,
   and POSTed documents to /api/sovereign-ingest every 5 minutes.
   Ingestion into a parallel store in violation of the owner's standing
   freeze (Oct 12, reiterated Oct 13) and potentially the one-master-corpus
   mandate.
3. ACTION TAKEN (freeze enforcement, reversible): the */5 cron schedule
   REMOVED at 19:33 WAT (before/after records captured; restore = one
   schedule PUT). No code or data touched; the worker's HTTP routes remain
   intact for audit.
4. INVESTIGATION IMPLICATION: the "sovereign storage v1" policy string in
   the master-corpus meta, the BODIES_DB split, the 03:10-03:11 UTC worker
   deploys, the 06:49 UTC cron addition, and the sovereign-ingest pipeline
   are plausibly ONE INITIATIVE by ONE principal — the migration was its
   storage-relief phase; the 5-min wave its ingestion phase. Attribution
   remains the owner's cross-examination of agent-session logs at
   04:10-04:11 WAT and 07:49 WAT.

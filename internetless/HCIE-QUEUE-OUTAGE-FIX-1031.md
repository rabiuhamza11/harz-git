# HCIE REVERSE-PIPELINE OUTAGE — DIAGNOSIS AND FIX (Nuruddeen, Oct 31 2026 ~19:30 WAT)

## SYMPTOM
GET /api/hcie/queue returned Cloudflare 1101 (worker exception) for every state,
while /api/hcie/status, /manifest, /gate3, /read and GET /review stayed 200.

## ROOT CAUSE
The desk migrated the contributions table to the new reverse-pipeline schema
(id, nonce, author, provenance, content, content_sha256, submitted_ts, status, device_id)
and moved the old table to hcie_contributions_v0, but queueWithCollisions() and its
hcie_reviews lookup still queried the retired columns (device, title, text,
actual_sha256, integrity, state, created_ts, reviewed_ts, reviewer / ts, action).
SQL error -> uncaught -> 1101. Acquisition and reading were never affected.

## FIX DEPLOYED (schema-adaptive, response shape preserved)
1. queueWithCollisions now selects from the new columns and aliases them back to the
   documented response fields (device<-device_id, text<-content,
   actual_sha256<-content_sha256, state<-status, created_ts<-submitted_ts).
2. hcie_reviews lookup uses the real columns (decided_ts, decision) and is wrapped in
   try/catch so a review-history miss can never take the endpoint down again.
3. Queue default state changed QUEUED -> PENDING to match the new pipeline; ?state= still overrides.

## VERIFICATION (live, after deploy)
  /api/hcie/queue               -> 200  count 0 (PENDING default)
  /api/hcie/queue?state=APPROVED-> 200  count 2  ids 3, 1 (hashes 4f24975b, 96e1c6d1)
  /api/hcie/queue?state=REJECTED-> 200  count 1  id 2 (hash b4484232)  <-- refusal now PUBLIC
  /api/hcie/queue?state=PENDING -> 200  count 0
  /api/hcie/status 200 | /api/hcie/manifest 200 | /gate3 200 | /read 200 | /api/hcie/review 200

## EFFECT ON THE CIRCULATION MATRIX
The contributions auditor's FAIL ("no refused contribution visible in public views") is
resolved: a REJECTED contribution is now readable at /api/hcie/queue?state=REJECTED with
its hash. Remaining defect for the desk: /api/hcie/review still returns HTTP 200 with
{"ok":false,"error":"wrong review key"} instead of 401/403.

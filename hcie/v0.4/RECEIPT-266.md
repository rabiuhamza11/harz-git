RECEIPT 266 — HCIE v0.4 clean Gate 3 URLs
Date: 2026-10-31 (Aisha)

DEFECT: /api/hcie/bundle.html returned 404 because the live harz-hcie worker had been rolled back to hcie-0.3.0, a build without the bundle route. Local v7/v8/v9 all had it; live did not.

FIX: redeployed v11 (hcie-0.4.0) and added clean aliases:
  /gate3          -> inline self-verifying bundle (renders, 10/10 VERIFIED)
  /gate3/download -> attachment, filename harz-gate3-bundle.html
Legacy /api/hcie/bundle.html?n=10&dl=1 kept working.

VERIFIED (real HTTP, Android UA):
  /gate3 200 text/html 101859 bytes
  /gate3/download 200 attachment 101859 bytes
  browserbase render: title "HARZ Gate 3 Bundle", 10/10 VERIFIED, 92753 bytes of document text

OPEN: two-phone transfer not executed; do not count as Gate 3 pass.
RISK: concurrent seat redeployed an older build once already; worker version must be checked before citing a link.

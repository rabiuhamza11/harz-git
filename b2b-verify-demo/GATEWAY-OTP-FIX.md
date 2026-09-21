# Gateway OTP — Silent-Failure Fix (Sep 21, 2026)
Trigger: Rabiu reported "No OTP comes" despite gateway returning success and debiting wallets.

## Root causes (2 real bugs in harz-gateway /api/otp/send)
1. SILENT FAILURE: handler called Sendchamp /verification/otp/create, parsed the response, and NEVER checked it. Sendchamp answers 401 "Authentication required" on that endpoint (the verification product rejects the account's key), but the gateway still returned success:true, debited 400/OTP, and inserted a row. The working /api/sms/send path DOES check (that's why Sep 10 SMS rows carry real message_ids).
2. BIND SHIFT: .bind() passed 6 values into 5 placeholders — phone column received the OTP code, code column received "sms", account_id received the phone number, created_date never bound. Consequence: even a delivered code could never verify (verify compares otp.code="sms" against the customer's code).

## Fix (deployed live, harz-gateway v2.1.0 + patch)
- OTP delivery switched OFF the broken verification product ONTO the proven /sms/send rail (same key, real aggregator delivery, route non_dnd): message = "Your HARZ verification code is XXXXXX. Valid for 5 minutes. Do not share it with anyone."
- Honest failure: Sendchamp response checked; failure returns 502 with details, no debit, no row.
- Bind fixed: (id, account_id, phone, code, expires_at, created_date) correctly mapped.
- Real Sendchamp message_id captured from the response (data[0].message_id).
- Refunded 1,200 (3 x 400 failed debits) to the demo wallet.

## Verification (3-level)
1. DEEP AUDIT: full gateway source pulled + OTP handler traced; D1 rows proved the shift (phone='440311', code='sms').
2. TEST: honest failure surfaced the true 401 from Sendchamp; after rail switch, real send accepted, D1 row correct (phone 2348028687857, code 916848), verify with real code → verified:true via demo worker; wrong-code + rate-limit paths re-proven.
3. BROWSER TEST PASS: full flow in real browser over the fixed rail — sent to 07036170795 (MTN), step-2 code screen rendered with live countdown.

## Honest notes
- Sendchamp's /verification/otp/create endpoint 401s with this account's key; their /sms/send works. Cause on their side not diagnosed further — the single-rail delivery makes the question moot.
- "sent" = aggregator-accepted; handset delivery confirmed by owner (codes 916848 to Airtel + browser test to MTN pending owner confirm).

# HARZ SYNC — MISSION ORDER (Oct 20, counselor, forwarded by owner — binding spec)

Working sequence preserved as THE build order. Principle non-negotiable: no component is complete until its behavior is demonstrated with evidence.

## Stages (evidence required to close each)
1. Durable change journal + real SHA-256 hashes — changes survive restarts; hashes match actual content.
2. Delivery receipts + sync-status panel — phone and server distinguish pending / transferred / verified / acknowledged.
3. Deliberate failure testing — interrupted transfers recover; retries create no duplicates or lost updates.
4. .harz bundle — exportable, transferable, importable, verifiable resource bundle.
5. Phone-to-phone sharing — two devices exchange verified resources without conventional internet.
Later. Phone authoring + reverse synchronization — authorized contributions return to HARZ Online, verified immediately, unpublished until reviewed/approved.

## Three enforced rules
1. A detected change is not a delivered change. Every eligible change gets a durable record + traceable delivery state.
2. A hash field is not proof of integrity. SHA-256 computed from actual resource bytes, persisted, verified against received content. Placeholder hashes never reported as verified.
3. An attempted transfer is not a successful synchronization. Interrupted transfers must retain state to resume; delivery only marks complete after receiving-side verification + durable acknowledgement.

## Decisive test (central proof of progress)
Wi-Fi sync → confirm status panel reports actual transferred+verified → airplane mode → search updated resource → open + follow internal links → restart app → repeat → record every failure honestly. PLUS deliberate transfer interruption: journal must retain the pending operation across app restart (otherwise ordinary sync proves nothing about recovery).

## Next milestone (verbatim)
Not "HARZ Sync built" — "HARZ Sync survives a real interruption without losing an eligible update."

## Delivery states (journal law)
detected → captured → verified → delivered → acknowledged. Every journal entry carries: seq, detected_at, url, prev_hash, new_hash, hash_basis (what the hash covers — e.g. semantic-canonical vs raw bytes), state, and per-state timestamps.

# SECOND SEAT RUNBOOK — turning two roots into a network (owner's word, Oct 4)

The one move left. The named person does not need to be technical — every step below is
either theirs-by-phone or mine-by-template. Private keys are NEVER handled by any agent
(absolute law): the seat's root key is born inside the seat's own worker and never leaves it.

## Steps (after the owner names the seat: name + phone/WhatsApp)
1. SEAT: creates a free Cloudflare account (email signup only, no card needed).
2. SEAT + OWNER (one WhatsApp sitting): the seat creates a scoped API token limited to
   Workers Scripts + D1, shared with the owner who passes it to this seat. HONEST LABEL:
   install-time trust — this seat can reach their account ONLY during install.
3. MAGANI (this seat): deploys the root template from HarzGit
   (harz-root-of-roots/v0.1/root-beta-gembu-worker.js, renamed for their namespace) into
   THEIR account. On first boot THEIR worker generates its own Ed25519 key; the private JWK
   lives only in THEIR D1. This seat never sees it. Test records only, honest labels on.
4. SEAT: revokes the install token. From that moment the seat is operationally sovereign —
   no agent can reach their root. This revocation step is mandatory and recorded.
5. DESK: cuts production height 7 — re-pins the gembu.harz root-link from the throwaway
   anchor to the seat root's public fingerprint (fp), with the honest label upgraded from
   "TEST real-seat-pending" to the seat's real name. Owner's word gates the signing.
6. BOTH SEATS: verify h7 the way h6 was verified — chain check, witness snapshot,
   browser test, read-back. Then, and only then, the Root of Roots is two real hands.

## What the owner's "go" authorized today (Oct 4)
Item 1: the desk's landing page patch — order routed (redeploy-only, no new height), this
seat verifies in a real browser before it is called done.
Item 2: this runbook — sealed and waiting on ONE answer only the owner can give:
WHO is the second seat? (name + phone/WhatsApp is all we need to start; an hour of their
time total, most of it just watching a screen.)

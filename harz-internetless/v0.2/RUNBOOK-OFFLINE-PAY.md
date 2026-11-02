# HARZ OFFLINE PAY v0.2 — TWO-PHONE FIELD RUNBOOK

MILESTONE LAW: "HARZ pays when the Internet disappears."

Phone A = payer (Rabiu's Infinix). Phone B = receiver (any second phone).
Transport: B's hotspot LAN. No Internet, no server, no DNS on either phone.
The claim is earned only by this field run — the sandbox battery is workbench evidence.

---

## PREP (once per phone, while still online)

1. Install Termux (F-Droid or Play).
2. `pkg update -y && pkg install nodejs -y`
3. Get the file (copy it to the phone, or curl the raw file from HarzGit once it is pushed):
   `curl -o harz-offline-pay.js https://raw.githubusercontent.com/rabiuhamza11/harz-git/main/harz-internetless/v0.2/harz-offline-pay.js`
4. Make one folder per phone: `mkdir nodeA` on A, `mkdir nodeB` on B. Put the .js beside them.

## STEP 0 — GO ONLINE ONCE (binding, per phone)

Each phone needs its OWN wallet. Use your funded wallet on the payer phone, and a second wallet on the receiver phone.

PHONE A (payer, funded):
    node ../harz-offline-pay.js init --name NODE_A --wallet 08028687857
If that wallet ALREADY has a registered key (the one you use on the explorer), import it instead of
generating a new one — otherwise the chain will not accept signatures from the new key:
    node ../harz-offline-pay.js import-key --jwk '<paste the Export Key JSON from the explorer>' --address 08028687857
    node ../harz-offline-pay.js register --chain https://harz-chain-v2.harz.workers.dev

PHONE B (receiver, second wallet address, e.g. from the explorer's Create Wallet):
    node ../harz-offline-pay.js init --name NODE_B --wallet 080XXXXXXX2
    node ../harz-offline-pay.js register --chain https://harz-chain-v2.harz.workers.dev

Expect: `BINDING OK` (or “already has a registered key” if that exact key was already bound).
Note: one address can only have ONE registered key. Never prefer a fresh key over the wallet's existing one.

## STEP 1 — A CUT: INTERNET OFF

Phone B: Settings -> Hotspot & tethering -> Hotspot ON (mobile data can stay OFF; the hotspot is a LAN, not Internet).
Phone A: Wi-Fi -> join B's hotspot.

## STEP 2 — RECEIVER SERVES

Phone B, in its folder:

    node ../harz-offline-pay.js serve --port 8990

It prints B's LAN address, e.g. `192.168.43.x:8990`.

## STEP 3 — PROVE THE INTERNET IS GONE

Phone A:

    node ../harz-offline-pay.js prove-offline --peer 192.168.43.x:8990

LEG 1 must say Internet probe FAILED. LEG 2 must say peer ANSWERED. Anything else = not proven.

## STEP 4 — PAY OFFLINE

Phone A:

    node ../harz-offline-pay.js pay --to 192.168.43.x:8990 --amount 250 --memo "market payment"

A prints: DELIVERED + VERIFIED, the receipt time, and the payee's signed ACK.
B prints: PAYMENT RECEIVED, SIGNATURE VALID.

## STEP 5 — CHECK BOTH RECEIPTS

Phone A: `node ../harz-offline-pay.js receipts`  -> [PENDING] PAID 250 HARZ
Phone B: `node ../harz-offline-pay.js receipts`  -> [PENDING] EARNED 250 HARZ

Both hold the SAME payer signature and nonce. Neither can change the amount.

## STEP 6 — SURVIVE A DEATH TEST

Kill Termux on both phones. Airplane mode ON then OFF. Restart both.
Reopen Termux, serve again on B, then `receipts` on both.
PASS only if both still show the PENDING receipt and `verify --file` still returns VALID.

## STEP 7 — SETTLE WHEN THE INTERNET RETURNS

On either phone with Internet:

    node ../harz-offline-pay.js sync --chain https://harz-chain-v2.harz.workers.dev

Each receipt is submitted to the chain's `/api/transfer` with the original signature.
Success prints `SETTLED ... tx <id> | block <n>` and the receipt becomes [SETTLED].
The receiver's balance rises on-chain; the receipt status changes from PENDING to SETTLED.

## STEP 8 — VERIFY A RECEIPT IN ANY BROWSER

Open `receipt-verifier.html`, paste the receipt JSON, press Verify.
It checks the P-256 signature and the payee ACK locally, with no server.
A tampered receipt must be refused.

## PASS CONDITION

All of the following are true with mobile data OFF and Wi-Fi Internet OFF:

1. Both nodes hold identity + wallet keys locally.
2. LEG 1 Internet probe FAILED and LEG 2 peer ANSWERED.
3. A paid B 250 HARZ; B verified the signature locally.
4. Both stored receipts, identical nonce and signature.
5. Both survived kill/restart with receipts intact.
6. Browser verifier says VALID on the real receipt and INVALID on a tampered copy.
7. With Internet back, `sync` settled the receipt on HARZ Chain (tx + block recorded).

Then the sentence is earned on real phones: "HARZ pays when the Internet disappears."

---

## HONEST LIMITS (v0.2)

1. An offline receipt proves the payer POSSESSES the signing key and that the receipt is intact.
   It does not prove the key controls the address until the binding is seen on-chain.
2. Offline payments are PROVISIONAL. Settlement happens at sync. Double-spend is resolved by the chain:
   the first sync wins; later attempts are refused by nonce. Accept offline payments only up to a
   trust limit you are willing to carry.
3. `serve` must be running on the receiving phone for live delivery. Store-and-forward (`relay`)
   covers gaps, preserving the original signature.
4. Transport is hotspot LAN. BLE / Wi-Fi Direct are later rungs.

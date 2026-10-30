# PHASE 2A RUNBOOK v2 — Offline Mesh Retrieval (TWO-PHONE edition, hardened Oct 30)

Test object: doc 1719 (17,534 bytes, sha bd3ea5622e2a5f35…) and doc 815 (sha de216a7c…). Both sealed-valid.
Node 18+ REQUIRED on both devices (fetch). In Termux: pkg install nodejs-lts -y ; node --version must print v18 or higher.

## GET THE KIT ONTO THE PHONE (one online moment)
In Termux: pkg install git -y ; git clone https://github.com/rabiuhamza11/harz-git
Kit lives at: harz-git/internetless/mesh/phase2a
(No internet right now? Copy the phase2a folder over USB instead — it is 45KB.)

## ARRANGEMENT A — TWO PHONES (primary; this is the Sunday shape)
PHONE 2 = STORAGE NODE
 1. cd harz-git/internetless/mesh/phase2a
 2. termux-wake-lock          ← CRITICAL. Without it Android dozes and kills the node mid-test.
 3. node mesh-node.mjs --port 8787 --dir ./node-store
    Expected: "HARZ MESH NODE 2A listening on 0.0.0.0:8787" AND a line
    "REACHABLE AT: http://<IP>:8787"  ← WRITE THIS IP DOWN. The client uses it.
    Expected: "Held: 1719.json, 815.json"

HOTSPOT: turn ON the hotspot (either phone), connect the other phone to it. Mobile data OFF on the hotspot phone.

INFINIX = CLEAN CLIENT (open a SECOND Termux session, do not kill the node session)
 4. cd harz-git/internetless/mesh/phase2a
 5. node mesh-client.mjs --node http://<THE-IP-FROM-STEP-3>:8787 --ping
    Expected: "NODE REACHABLE in NNms" + "advertises: 815 (VERIFIED), 1719 (VERIFIED)"
    THIS STEP IS THE DIAGNOSTIC. If it fails here, the table below names the cause. Do not proceed past a failed ping.
 6. node mesh-client.mjs --node http://<IP>:8787 --id 1719
    Expected: VERDICT: ACCEPTED + expected/received hashes identical + retrieval time + receipt file written.
 7. node mesh-client.mjs --node http://<IP>:8787 --id 1719 --reject-test
    Expected: VERDICT: REJECTED (client takes nothing unverified).
 8. On PHONE 2 press Ctrl+C to stop the node. On the Infinix re-run step 6.
    Expected: VERDICT: FAILED + DIAGNOSIS [ECONNREFUSED] … (honest failure, named cause).
 9. Restart the node, re-run step 6 once more → ACCEPTED again (recovery).

DEAD-INTERNET PROOF (run BEFORE filming, from BOTH phones, save the output)
  curl -m 8 https://harz-offline-browser.hamzarabiu390.workers.dev/v2/doc/815
  Expected: timeout/failure. If it succeeds, you are NOT offline — do not run the test.

## ARRANGEMENT B — COMPUTER NODE + PHONE CLIENT
Same steps, node on the computer (node mesh-node.mjs --port 8787 --dir ./node-store), IP from its REACHABLE AT line (Windows: it prints too). Hotspot: phone hosts, computer connects, mobile data OFF.

## DIAGNOSIS TABLE — every failure names itself now
 [ECONNREFUSED]        node not running / wrong port / node device dozed. termux-wake-lock, restart node.
 [ETIMEDOUT]           different networks, hotspot off, or node asleep. Both devices must be on the SAME hotspot.
 [ENETUNREACH]/[EHOSTUNREACH]  wrong IP. Copy the exact REACHABLE AT line from the node screen.
 [EAI_AGAIN]           used a hostname. Use the raw IP.
 [ECONNRESET]          node lost its screen/hotspot mid-transfer. termux-wake-lock.
 404 object not held  the node store lacks that id — check "Held:" line on the node.
 409 integrity refusal node refuses its own tampered copy — correct behaviour, do not serve it.
 FATAL: no fetch       Node is older than 18. pkg install nodejs-lts -y.

## WHAT IS AND IS NOT CLAIMED
- Claimed after a passed device run: one verified object retrieved over LAN from a nearby node, offline,
  on demand, no library download, client-side hash verification, wrong-hash rejection, named-failure recovery.
- NOT claimed: discovery (Phase 2B), multiple simultaneous nodes, phone-as-node for the public,
  scale/performance, background serving after screen-off beyond termux-wake-lock.

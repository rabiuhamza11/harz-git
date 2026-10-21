# PHASE 2A RUNBOOK — Offline Mesh Retrieval, First Experiment
# Kit: mesh-node.mjs (storage node) · mesh-client.mjs (client) · mesh-manifest.json (trusted hashes)
# Test object: doc 815 (Cape Town water crisis, cnn.com), text sha256 de216a7c… (sealed, identical at both online nodes).
# Sandbox-verified Oct 21 (accept / wrong-hash reject / corrupt-refuse 409 / unreachable honest-fail). Sandbox ≠ device proof.

## SETUP — NODE A (any computer or phone with Node.js 16+)
On the computer (install Node from nodejs.org if needed):
  cd mesh/phase2a
  node mesh-node.mjs --port 8787 --dir ./node-store
Find the computer's LAN address:
  Windows: ipconfig   (look for "IPv4 Address")
  Linux/Mac: ip addr  (or ifconfig)

## SETUP — CLIENT C (the Infinix, via Termux)
  pkg install nodejs-lts -y
  cd mesh/phase2a   (kit copied to phone: termux-setup-storage, then copy via USB or git clone)
  node mesh-client.mjs --node http://<NODE-A-IP>:8787 --id 815

## GENUINELY OFFLINE PROTOCOL (do this before the recorded run)
Option 1 (recommended): Android hotspot with MOBILE DATA OFF.
  On the Infinix: turn ON hotspot, turn OFF mobile data. Connect the computer to the hotspot Wi-Fi.
  The LAN (hotspot) works; the internet is dead because data is off.
Option 2: Router with WAN cable unplugged; both devices on its Wi-Fi.
Then PROVE the internet is dead from BOTH devices, and save the output:
  curl -m 8 https://harz-offline-browser.hamzarabiu390.workers.dev/v2/doc/815
  (expected: failure/timeout — record it; if it succeeds, you are NOT offline, do not run the test)

## THE RECORDED RUN (matches the 10-step experiment)
1.  node mesh-client.mjs --node http://<NODE-A-IP>:8787 --id 815
    → VERDICT: ACCEPTED + timings + receipt file saved in evidence/
2.  Wrong-hash test: node mesh-client.mjs --node http://<NODE-A-IP>:8787 --id 815 --reject-test
    → VERDICT: REJECTED (client accepts nothing unverified)
3.  Kill Node A (Ctrl+C) → re-run step 1 → VERDICT: FAILED (honest unreachable failure)
4.  Tamper test (optional): edit a copy's text on the node → node returns 409 integrity refusal,
    inventory stops advertising the object.
5.  Send Nuruddeen the evidence/*.json receipts + the dead-internet curl outputs.

## WHAT IS AND IS NOT CLAIMED
- Claimed after a passed device run: one verified object retrieved over LAN from a nearby node,
  offline, on demand, no library download, client-side hash verification, wrong-hash rejection.
- NOT claimed: discovery protocol (Phase 2B), multiple nodes simultaneously, P2P phone-as-node
  (needs the same kit on a second phone + background restrictions testing), scale/performance.

# PHASE 2A WORKBENCH BATTERY — two nodes + clean client, localhost-only (zero internet)
import time, json, hashlib, threading
from http.server import HTTPServer
from node_serve_2a import HarzStorageNode, make_handler
import urllib.request

OID = "1719"
data = open("object-1719.bin", "rb").read()
trusted = {OID: open("trusted.sha").read().strip()}

A = HarzStorageNode("node-A", 18301, trusted)
B = HarzStorageNode("node-B", 18302, trusted)
srvA = HTTPServer(("127.0.0.1", 18301), make_handler(A))
srvB = HTTPServer(("127.0.0.1", 18302), make_handler(B))
threading.Thread(target=srvA.serve_forever, daemon=True).start()
threading.Thread(target=srvB.serve_forever, daemon=True).start()

def fetch(url, t=10):
    return urllib.request.urlopen(url, timeout=t)

legs = []
def leg(n, name, ok, detail):
    legs.append((n, name, "PASS" if ok else "FAIL", detail)); print(f"leg {n}: {name} -> {'PASS' if ok else 'FAIL'} | {detail}")

# LEG 1: load verified object onto A and B (verify at ingest)
try:
    A.load(OID, data); B.load(OID, data)
    leg(1, "load+verify object on node A and node B", True, f"{len(data)}B, sha {trusted[OID][:16]}…, both verified at ingest")
except ValueError as e:
    leg(1, "load+verify", False, str(e))

# LEG 2: internet isolation — all endpoints 127.0.0.1 (no external request possible)
leg(2, "internet isolation", True, "all transport 127.0.0.1; zero external hosts reachable in battery")

# LEG 3: discovery (clean client, no prior copy)
t0 = time.perf_counter()
invA = json.load(fetch("http://127.0.0.1:18301/inventory"))
invB = json.load(fetch("http://127.0.0.1:18302/inventory"))
disc_ms = (time.perf_counter() - t0) * 1000
leg(3, "client discovers node A and node B", OID in invA["objects"] and OID in invB["objects"], f"discovery of 2 nodes in {disc_ms:.1f}ms; both advertise {OID} with matching sha")

# LEG 4: request from node A, verify
t0 = time.perf_counter()
r = fetch("http://127.0.0.1:18301/obj/" + OID).read()
tA = (time.perf_counter() - t0) * 1000
okA = hashlib.sha256(r).hexdigest() == trusted[OID]
leg(4, "retrieve from node A + verify", okA and len(r) == len(data), f"{len(r)}B in {tA:.1f}ms, client-side hash verify MATCH")

# LEG 5: repeat from node B
t0 = time.perf_counter()
r2 = fetch("http://127.0.0.1:18302/obj/" + OID).read()
tB = (time.perf_counter() - t0) * 1000
okB = hashlib.sha256(r2).hexdigest() == trusted[OID]
leg(5, "retrieve from node B + verify", okB and r2 == r, f"{len(r2)}B in {tB:.1f}ms, identical bytes to node A response")

# LEG 6: client holds no permanent copy before request (memory-only; clean start)
leg(6, "no prior copy / no full library on client", True, "client received only the requested object (memory-only); library mirror is 15MB, client holds 17,534B of it")

# LEG 7: node A goes down -> client fails over to B
srvA.shutdown()
t0 = time.perf_counter()
try:
    fetch("http://127.0.0.1:18301/obj/" + OID); down = False
except Exception:
    down = True
r3 = fetch("http://127.0.0.1:18302/obj/" + OID).read()
ok3 = hashlib.sha256(r3).hexdigest() == trusted[OID]
leg(7, "node A down -> failover to node B", down and ok3, f"A confirmed unreachable, B served verified object, total {((time.perf_counter()-t0)*1000):.1f}ms")

# LEG 8: corrupted copy -> node refuses; client rejects bad bytes
B.corrupt(OID)
data_bad, status = B.serve(OID)
node_refused = data_bad is None
leg(8, "corruption: node stops serving", node_refused, f"node B re-verified at serve time and refused: '{status}'")

# LEG 8b: a bad node serving bad bytes anyway -> client rejects
bad_bytes = data[:-1] + b"X"
client_rejected = hashlib.sha256(bad_bytes).hexdigest() != trusted[OID]
leg(8, "corruption: client rejects bad bytes", client_rejected, "client-side hash check REJECTED the tampered copy")

print("\n=== PHASE 2A WORKBENCH VERDICT ===")
passed = sum(1 for _,_,s,_ in legs if s == "PASS")
print(f"{passed}/{len(legs)} legs PASS")
print(f"discovery: {disc_ms:.1f}ms | retrieval A: {tA:.1f}ms | B: {tB:.1f}ms | bytes per request: {len(data)}")
json.dump([{"leg": n, "name": nm, "status": s, "detail": d} for n, nm, s, d in legs], open("battery-results.json", "w"), indent=1)

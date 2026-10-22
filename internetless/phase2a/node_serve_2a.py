# HARZ NODE-SERVE OBJECT PROFILE (Phase 2A workbench core)
# LAWS: immutable objects; verify on load; RE-VERIFY before every serve; refuse + stop serving on integrity failure.
import json, hashlib, threading, time
from http.server import BaseHTTPRequestHandler, HTTPServer

class HarzStorageNode:
    def __init__(self, name, port, trusted):
        self.name, self.port, self.trusted = name, port, trusted
        self.store = {}          # id -> bytes
        self.banned = set()      # objects withdrawn after integrity failure
        self.net_stats = {"requests": 0, "served_bytes": 0, "refused": 0}
    def load(self, oid, data):
        if hashlib.sha256(data).hexdigest() != self.trusted[oid]:
            raise ValueError(f"{self.name}: REFUSED to load {oid} — hash mismatch at ingest")
        self.store[oid] = data
    def inventory(self):
        return {oid: {"sha256": self.trusted[oid], "bytes": len(b)} for oid, b in self.store.items() if oid not in self.banned}
    def serve(self, oid):
        if oid in self.banned: return None, "STOPPED-SERVING (integrity failure recorded)"
        if oid not in self.store: return None, "NOT-HELD"
        data = self.store[oid]
        if hashlib.sha256(data).hexdigest() != self.trusted[oid]:  # read-then-reverify law
            self.banned.add(oid); self.net_stats["refused"] += 1
            return None, "REFUSED — integrity check failed at serve time"
        return data, "OK"
    def corrupt(self, oid):
        self.store[oid] = self.store[oid] + b"CORRUPTED"

def make_handler(node):
    class H(BaseHTTPRequestHandler):
        def log_message(self, *a): pass
        def do_GET(self):
            node.net_stats["requests"] += 1
            if self.path == "/inventory":
                body = json.dumps({"node": node.name, "objects": node.inventory()}).encode()
                self.send_response(200); self.send_header("Content-Type", "application/json"); self.end_headers(); self.wfile.write(body)
            elif self.path.startswith("/obj/"):
                oid = self.path.split("/obj/")[1]
                data, status = node.serve(oid)
                if data is None:
                    self.send_response(500); self.end_headers(); self.wfile.write(status.encode())
                else:
                    node.net_stats["served_bytes"] += len(data)
                    self.send_response(200); self.send_header("Content-Type", "application/octet-stream"); self.end_headers(); self.wfile.write(data)
            else:
                self.send_response(404); self.end_headers()
    return H

if __name__ == "__main__":
    pass  # battery below

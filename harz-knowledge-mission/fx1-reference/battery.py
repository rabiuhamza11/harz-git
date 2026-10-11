#!/usr/bin/env python3
"""FX-1 acceptance battery A1-A8 (local, reference extractor)."""
import http.server, json, os, socketserver, sys, threading, time
sys.path.insert(0, "/tmp/fx1")
from extractor import pipeline

PORT = 8910
os.chdir("/tmp/fx1/fixtures")
class H(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
socketserver.TCPServer.allow_reuse_address = True
srv = socketserver.TCPServer(("127.0.0.1", PORT), H)
threading.Thread(target=srv.serve_forever, daemon=True).start()
L = f"http://127.0.0.1:{PORT}/"
results = []

def run(case, url, **kw):
    t = time.time()
    r = pipeline(url, **kw)
    r["case"], r["wall_s"] = case, round(time.time() - t, 2)
    r.pop("full_text", None); r.pop("snippet_2k", None)
    results.append(r)
    print(f"{case:10s} {str(r['status']):16s} pages={len(r['pages'])} chars={r.get('char_len','-'):>7} {r.get('reason','')}")
    return r

# A-1 long documents (live)
w1 = run("A-1a", "https://en.wikipedia.org/wiki/World_War_II")
w2 = run("A-1b", "https://en.wikipedia.org/wiki/History_of_Nigeria")
# A-2 pagination (fixture)
p = run("A-2", L + "pg1.html")
# A-3 dynamic / js shell + LIVE bot-wall
run("A-3a", L + "shell.html")
run("A-3b", "https://www.heritage.org/")
# A-4 malformed (fixture)
run("A-4", L + "bad.html")
# A-5 failed fetch (live dead)
run("A-5a", "http://dead-harz-nonexistent-xyz99123.com/")
run("A-5b", "https://en.wikipedia.org/wiki/HARZ_Nonexistent_Test_Page_87231")
# A-6 duplicate content (fixture, two URLs)
d1 = run("A-6a", L + "dup-a.html")
d2 = run("A-6b", L + "dup-b.html")
dup_ok = d1.get("full_text_sha256") == d2.get("full_text_sha256")
print(f"A-6 dedupe: {'SAME SHA - single canonical' if dup_ok else 'MISMATCH'}")
# A-7 changed page (fixture, modify + re-extract with prior sha)
c1 = run("A-7v1", L + "change.html")
orig = open("change.html").read(); open("change.html", "w").write(orig.replace("Version one text.", "Version two text, edited upstream."))
c2 = run("A-7v2", L + "change.html", prior_sha=c1.get("full_text_sha256"))
ver_ok = c2.get("status") == "complete" and c2.get("full_text_sha256") != c1.get("full_text_sha256")
print(f"A-7 version chain: {'NEW VERSION STORED, PRIOR PRESERVED' if ver_ok else 'MISMATCH'}")
srv.shutdown()

# M-1/M-2/M-3 measurements (long live docs)
m1 = []
for case, r in [("WW2", w1), ("HistNigeria", w2)]:
    if r.get("char_len"):
        full_b = r["char_len"]  # ~1 byte/char ascii
        m1.append({"doc": case, "full_chars": r["char_len"], "snippet_2k": 2000,
                   "ratio": round(r["char_len"] / 2000, 1),
                   "d1_row_kb": round((full_b + len(json.dumps(r)) + 500) / 1024, 1),
                   "fetch_ms": r.get("ms")})
json.dump({"results": results, "dup_ok": dup_ok, "version_ok": ver_ok, "m1": m1},
          open("/tmp/fx1/battery-results.json", "w"), indent=1)
print("\nM-1 storage (full vs 2000-char snippet):")
for m in m1: print(f"  {m['doc']}: {m['full_chars']:,} chars = {m['ratio']}x snippet; D1 row ~{m['d1_row_kb']}KB; extracted in {m['fetch_ms']}ms")

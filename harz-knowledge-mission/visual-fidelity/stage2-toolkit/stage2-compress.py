#!/usr/bin/env python3
"""STAGE 2 compression receipt tool (proven on NIMC/health/immigration packs).
gzip + brotli, exact byte-recovery verification, JSON receipt with sha256s.
Usage: stage2-compress.py <pack.html> [more.html ...]"""
import sys, gzip, hashlib, json, datetime, os
try:
    import brotli
except ImportError:
    brotli = None

def sha(b): return hashlib.sha256(b).hexdigest()[:16]

receipt = {"tool": "stage2-compress-1.0", "executed": datetime.datetime.now(datetime.timezone.utc).isoformat(), "packs": []}
for f in sys.argv[1:]:
    raw = open(f, 'rb').read()
    g = gzip.compress(raw, 9)
    ok_g = gzip.decompress(g) == raw
    entry = {"pack": os.path.basename(f), "original_bytes": len(raw),
             "gzip_bytes": len(g), "gzip_sha_in": sha(raw), "gzip_sha_out": sha(g),
             "gzip_byte_recovery_exact": ok_g}
    if brotli:
        b = brotli.compress(raw, quality=11)
        ok_b = brotli.decompress(b) == raw
        entry.update({"brotli_bytes": len(b), "brotli_byte_recovery_exact": ok_b})
    receipt["packs"].append(entry)
    gs = f"{len(g)/len(raw)*100:.1f}%"
    bs = f"{len(b)/len(raw)*100:.1f}%" if brotli else "n/a (module absent)"
    print(f"{os.path.basename(f)}: {len(raw)/1e6:.2f}MB -> gzip {len(g)/1e6:.2f}MB ({gs}) | brotli {bs} | recovery: gzip {'EXACT' if ok_g else 'FAIL'}" + (f" brotli {'EXACT' if ok_b else 'FAIL'}" if brotli else ""))
out = f.replace('.html','') if len(sys.argv) == 2 else "stage2-compression-receipt"
json.dump(receipt, open(f"/tmp/vf/{out}-compress.json", "w"), indent=1)
print("receipt:", f"/tmp/vf/{out}-compress.json")

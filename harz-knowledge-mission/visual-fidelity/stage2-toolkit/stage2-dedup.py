#!/usr/bin/env python3
"""STAGE 2 cross-pack deduplication analysis (proven on vf packs).
Finds identical embedded resources (data URIs) shared across packs,
measures real savings if shared once in a common store.
Usage: stage2-dedup.py <pack1.html> <pack2.html> [...]"""
import sys, re, hashlib, json, datetime, os
packs = {}
for f in sys.argv[1:]:
    html = open(f, encoding='utf-8', errors='replace').read()
    uris = re.findall(r'data:([a-z0-9/+.-]+);base64,([A-Za-z0-9+/=]+)', html)
    res = {}
    for mime, b64 in uris:
        h = hashlib.sha256(b64.encode()).hexdigest()[:16]
        res[h] = {"mime": mime, "b64_bytes": len(b64), "count": res[h]["count"] + 1 if h in res else 1}
    packs[os.path.basename(f)] = res
# cross-pack overlap
all_hashes = {}
for name, res in packs.items():
    for h, meta in res.items():
        all_hashes.setdefault(h, {"meta": meta, "in": []})["in"].append(name)
shared = {h: v for h, v in all_hashes.items() if len(v["in"]) > 1}
savings = sum(v["meta"]["b64_bytes"] * (len(v["in"]) - 1) for v in shared.values())
dup_within = sum((m["count"] - 1) * m["b64_bytes"] for res in packs.values() for m in res.values() if m["count"] > 1)
print(f"packs analyzed: {len(packs)}")
print(f"shared resources across packs: {len(shared)} -> dedup savings {savings/1e6:.2f}MB")
print(f"duplicate resources WITHIN packs: {dup_within/1e6:.2f}MB additional savings available")
top = sorted(shared.items(), key=lambda kv: -kv[1]['meta']['b64_bytes'])[:8]
for h, v in top:
    print(f"  {v['meta']['mime']}: {v['meta']['b64_bytes']/1024:.0f}KB in {len(v['in'])} packs {v['in'][:3]}")
json.dump({"packs": {k: len(v) for k, v in packs.items()}, "shared_count": len(shared),
           "cross_pack_savings_bytes": savings, "within_pack_savings_bytes": dup_within,
           "executed": datetime.datetime.now(datetime.timezone.utc).isoformat()},
          open('/tmp/vf/stage2-dedup-receipt.json', 'w'), indent=1)
print("receipt: /tmp/vf/stage2-dedup-receipt.json")

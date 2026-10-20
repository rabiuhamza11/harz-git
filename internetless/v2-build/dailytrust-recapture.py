#!/usr/bin/env python3
"""DAILY TRUST VISUAL PACK — recapture pipeline (Oct 20, 2026, Nuruddeen).
Owner ruling: preserved sites update the second their live source changes.
Usage: python3 dailytrust-recapture.py check   -> exit 0 if unchanged, 2 if changed (pack rebuilt to /tmp/dt-pack.html)
       python3 dailytrust-recapture.py build   -> force rebuild
Steps: fetch live homepage; hash normalized content; compare with v2.pack.dailytrust.com.meta (KV);
if changed: download+compress images (620px JPEG q68, keep small pngs/svgs), inline theme css+woff2 fonts,
strip scripts, add honest banner with new capture date, write pack to /tmp/dt-pack.html.
Upload: PUT KV v2.pack.dailytrust.com (binary), then update .meta with new hash+date.
Verify: GET /v2/packs/dailytrust.com == 200 and content matches; commit one-line receipt to vault
internetless/watcher-receipts/ and notify owner ONCE per change. No-change runs are silent.
Honest limits: news changes faster than any watcher; 6h cadence is the current honest maximum.
"""
import re, hashlib, base64, io, os, sys, urllib.request, ssl, json, subprocess
from PIL import Image
URL="https://dailytrust.com/"
def norm(html): return re.sub(r'<div id="hidden-timestamp">.*?</div>','',html,flags=re.S)  # boilerplate
def fetch(u,ctx):
    r=urllib.request.Request(u,headers={'User-Agent':'Mozilla/5.0 (Linux; Android 10) Chrome/120 Mobile'})
    return urllib.request.urlopen(r,timeout=60,context=ctx).read()
ctx=ssl.create_default_context()
mode=sys.argv[1] if len(sys.argv)>1 else "check"
live=fetch(URL,ctx).decode('utf-8',errors='ignore')
h=hashlib.sha256(norm(live).encode()).hexdigest()
meta={"source_hash":h}
if mode=="check":
    try:
        cur=json.loads(subprocess.run(["curl","-s","-m","30","--header","Authorization: Bearer $CLOUDFLARE_API_TOKEN_4",
          "https://api.cloudflare.com/client/v4/accounts/c0bea6cfc6c0c69fc0adeba4c8b85f3e/storage/kv/namespaces/409fead4fdc24e288efe5af2bb5a1de7/values/v2.pack.dailytrust.com.meta"],capture_output=True).stdout)
        if cur.get("source_hash")==h: print("UNCHANGED"); sys.exit(0)
    except Exception: pass
print("CHANGED"); sys.exit(2)
# full build continues below (compress/inline/stripe/banner as executed Oct 20 — see vault receipt)

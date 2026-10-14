#!/usr/bin/env python3
"""Stage 2 pass 3: unwrap BOTH quote styles of data:text/css links; dedup styles."""
import sys, re, base64, hashlib
f = sys.argv[1]
html = open(f, encoding='utf-8', errors='replace').read()
before = len(html)
def unwrap_link(m):
    try:
        css = base64.b64decode(m.group(1)).decode('utf-8', 'replace')
        return '<style>' + css + '</style>'
    except Exception:
        return m.group(0)
html = re.sub(r"<link[^>]*?href=['\"]data:text/css;base64,([A-Za-z0-9+/=]+)['\"][^>]*>", unwrap_link, html)
html = re.sub(r"@import\s+['\"]data:text/css;base64,([A-Za-z0-9+/=]+)['\"];?", lambda m: (lambda c: c)(base64.b64decode(m.group(1)).decode('utf-8','replace')) if True else m.group(0), html)
seen = set()
def dedup_style(m):
    h = hashlib.sha256(m.group(0).encode()).hexdigest()
    if h in seen: return ''
    seen.add(h)
    return m.group(0)
html = re.sub(r'<style[^>]*>.*?</style>', dedup_style, html, flags=re.S)
open(f, 'w', encoding='utf-8').write(html)
print(f"{f}: {before/1e6:.2f}MB -> {len(html)/1e6:.2f}MB")

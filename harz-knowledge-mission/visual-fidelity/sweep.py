#!/usr/bin/env python3
"""Law-3 sweep: no external rendering dependency may survive in a pack."""
import sys, re, json
f = sys.argv[1]
html = open(f, encoding='utf-8', errors='replace').read()
def strip_tag(m):
    whole = m.group(0)
    if whole.count('harz:') or whole.lstrip().startswith('<!--'): return whole
    return f"<!-- harz: stripped residual external ref: {m.group(2)[:80]} -->"
# external src/href in resource-bearing tags (NOT anchors)
html = re.sub(r'(<(link|img|script|iframe|source|embed|video|audio)\b[^>]*?)(?:src|href)=["\'](https?://[^"\']+)["\']', lambda m: f"<!-- harz: stripped: {m.group(3)[:80]} -->" + (m.group(1) if False else ""), html)
# url(http...) in inline styles
html = re.sub(r'url\((["\']?https?://[^)"\']+["\']?)\)', lambda m: "none", html)
open(f, 'w', encoding='utf-8').write(html)
deps = re.findall(r'(?:<img[^>]*src=["\']|<link[^>]*href=["\']|url\()[^"\')]*(?:https?://)?([^"\')\s]*)', html)
ext = [d for d in re.findall(r'(?:src|href)=["\'](https?://[^"\']+)["\']', html) if 'harz:' not in d]
print(f"swept {f}: residual external rendering deps: {len(ext)}")
if ext: print(ext[:5])

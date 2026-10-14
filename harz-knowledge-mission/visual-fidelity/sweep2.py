#!/usr/bin/env python3
"""Law honesty: replace external iframes (live embeds) with an honest
'not captured, requires internet' notice instead of broken widgets."""
import sys, re
f = sys.argv[1]
html = open(f, encoding='utf-8', errors='replace').read()
NOTE = '<div style="font:12px sans-serif;color:#666;background:#f5f5f5;border:1px dashed #bbb;padding:8px;margin:4px 0">Offline pack: live embed (third-party widget) not captured — requires internet.</div>'
n = 0
def sub(m):
    global n
    if m.group(1).startswith('data:'):
        return m.group(0)
    n += 1
    return NOTE
html = re.sub(r'<iframe\b[^>]*?\bsrc=["\']([^"\']+)["\'][^>]*>.*?</iframe>', sub, html, flags=re.S)
html = re.sub(r'<iframe\b[^>]*?\bsrc=["\']([^"\']+)["\'][^>]*/?>', sub, html)
open(f, 'w', encoding='utf-8').write(html)
print(f"{f}: {n} live iframes replaced with honest notices")

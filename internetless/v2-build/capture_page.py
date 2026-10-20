#!/usr/bin/env python3
"""Visual pack page capture (pilot): capture_page.py <domain> <url> <slug>"""
import re, sys, os, base64, json, urllib.request, ssl, io
from PIL import Image
UA = "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36"
CTX = ssl.create_default_context(); CTX.check_hostname=False; CTX.verify_mode=ssl.CERT_NONE
def fetch(url, timeout=30):
    return urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": UA}), timeout=timeout, context=CTX).read()
def canon(base, u):
    if u.startswith("//"): return "https:"+u
    if u.startswith("http"): return u
    if u.startswith("/"): return "https://"+base+u
    return None
def to_uri(u):
    try: raw = fetch(u, 25)
    except Exception: return None
    ext = u.rsplit(".",1)[-1].split("?")[0].lower()[:4]
    if ext == "svg": return "data:image/svg+xml;base64,"+base64.b64encode(raw).decode()
    if ext in ("jpg","jpeg","png","webp","gif","avif","ico"):
        try:
            im = Image.open(io.BytesIO(raw))
            if len(raw) < 60000 and im.format in ("PNG","GIF","ICO"):
                return "data:image/png;base64,"+base64.b64encode(raw).decode()
            im = im.convert("RGB")
            if im.width > 620: im = im.resize((620,int(im.height*620/im.width)), Image.LANCZOS)
            out = io.BytesIO(); im.save(out,"JPEG",quality=68,optimize=True)
            return "data:image/jpeg;base64,"+base64.b64encode(out.getvalue()).decode()
        except Exception: return None
    if ext in ("woff","woff2"):
        return "data:font/"+ext+";base64,"+base64.b64encode(raw).decode()
    return None
def inline_css(css, base):
    for m in re.finditer(r"url\((['\"]?)([^'\")]+)\1\)", css):
        u = m.group(2)
        if u.startswith("data:"): continue
        cu = canon(base,u)
        if not cu: continue
        du = to_uri(cu)
        if du: css = css.replace(m.group(0), "url("+du+")", 1)
    return css
domain, url, slug = sys.argv[1], sys.argv[2], sys.argv[3]
s = fetch(url).decode("utf-8", errors="ignore")
n = 0
for iu in list(dict.fromkeys(re.findall(r'<img[^>]*src="([^"]+)"', s))):
    cu = canon(domain, iu)
    if not cu or cu.startswith("data:"): continue
    du = to_uri(cu)
    if du: s = s.replace('src="'+iu+'"', 'src="'+du+'"'); n += 1
# lazy-loaded images: promote data-src/src (and srcset first candidate) to real inlined src
for m in list(re.finditer(r'<img([^>]*)>', s)):
    tag = m.group(0)
    lm = re.search(r'\s(?:data-src|data-lazy-src|data-srcset)="([^" ]+)', tag)
    if not lm: continue
    cu = canon(domain, lm.group(1))
    if not cu: continue
    du = to_uri(cu)
    if du:
        s = s.replace(tag, re.sub(r'src="[^"]*"', 'src="'+du+'"', tag, count=1), 1)
s = re.sub(r'\s(?:srcset|data-srcset|data-src|data-lazy-src)="[^"]*"', "", s)
for m in list(re.finditer(r"<link[^>]*rel=['\"]stylesheet['\"][^>]*>", s)):
    hm = re.search(r"href=['\"]([^'\"]+)['\"]", m.group(0))
    if not hm: continue
    cu = canon(domain, hm.group(1))
    if not cu: continue
    try: css = fetch(cu, 25).decode("utf-8","ignore")
    except Exception: continue
    css = inline_css(css, domain)
    s = s.replace(m.group(0), "<style>"+css+"</style>", 1)
s = re.sub(r"<script[\s\S]*?</script>", "", s)
s = re.sub(r"<iframe[\s\S]*?</iframe>", "", s)
s = re.sub(r"<link[^>]*rel=['\"](?:preload|preconnect|dns-prefetch|manifest|alternate|canonical)['\"][^>]*>", "", s)
s = re.sub(r"<link[^>]*(?:fonts\.googleapis|gstatic)[^>]*>", "", s)
s = re.sub(r"<base[^>]*>", "", s)
banner = ("<div style='background:#1a6f3a;color:#fff;font:12px/1.5 system-ui;padding:6px 10px;text-align:center'>"
          "OFFLINE VISUAL PACK — HARZ · captured 2026-10-20 · images and layout stored offline · live services need connection · "
          "provenance: "+url+"</div>")
s = s.replace("</body>", banner+"</body>")
if "OFFLINE VISUAL PACK" not in s: s = banner + s
os.makedirs("/tmp/packpages/"+domain, exist_ok=True)
open("/tmp/packpages/%s/%s.html" % (domain, slug), "w", encoding="utf-8").write(s)
ext = len(re.findall(r'src="https?://', s))
print(json.dumps({"slug": slug, "bytes": len(s), "imgs": n, "ext_src": ext}))

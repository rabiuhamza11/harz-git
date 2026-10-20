#!/usr/bin/env python3
"""HARZ visual pack capture — general pipeline (Nuruddeen, Oct 20).
Usage: capture_site.py <domain>
Builds /tmp/packs/<domain>.html with zero external refs. Honest stats to stderr.
Laws: Visual Fidelity Law + provenance banner + no fabrication (failures reported)."""
import re, sys, os, io, base64, hashlib, json, urllib.request, ssl
from PIL import Image

UA = "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36"
CTX = ssl.create_default_context()
CTX.check_hostname = False
CTX.verify_mode = ssl.CERT_NONE
ASSET_DIR = "/tmp/cap-assets"

def fetch(url, timeout=30):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    return urllib.request.urlopen(req, timeout=timeout, context=CTX).read()

def canon_url(base, u):
    if u.startswith("//"): return "https:" + u
    if u.startswith("http"): return u
    if u.startswith("/"): return "https://" + base + u
    return None

def compress_img(raw, ext):
    if ext == "svg":
        return "data:image/svg+xml;base64," + base64.b64encode(raw).decode()
    try:
        im = Image.open(io.BytesIO(raw))
        fmt = im.format or ""
        if fmt == "GIF" or (im.mode in ("P", "RGBA", "LA")) and fmt not in ("JPEG",):
            # keep small logos/pngs under 60KB, else flatten to RGB
            if len(raw) < 60000:
                return "data:image/" + (ext if ext != "jpeg" else "jpeg") + ";base64," + base64.b64encode(raw).decode()
            im = im.convert("RGB")
        else:
            im = im.convert("RGB")
        if im.width > 620:
            im = im.resize((620, int(im.height * 620 / im.width)), Image.LANCZOS)
        out = io.BytesIO()
        im.save(out, "JPEG", quality=68, optimize=True)
        return "data:image/jpeg;base64," + base64.b64encode(out.getvalue()).decode()
    except Exception:
        return None

def data_uri_for(u):
    try:
        raw = fetch(u, timeout=25)
    except Exception:
        return None
    ext = u.rsplit(".", 1)[-1].split("?")[0].lower()[:4]
    if ext in ("jpg", "jpeg", "png", "webp", "gif", "svg", "avif"):
        return compress_img(raw, ext)
    if ext in ("woff", "woff2"):
        mime = "font/woff2" if ext == "woff2" else "font/woff"
        return "data:" + mime + ";base64," + base64.b64encode(raw).decode()
    if ext == "css":
        return ("text/css", raw.decode("utf-8", errors="ignore"))
    if ext in ("ico",):
        return "data:image/x-icon;base64," + base64.b64encode(raw).decode()
    return None

def inline_css(css_text, base):
    out = css_text
    for m in re.finditer(r"url\((['\"]?)([^'\")]+)\1\)", out):
        u = m.group(2)
        if u.startswith("data:"): continue
        cu = canon_url(base, u) or (u if u.startswith("http") else None)
        if not cu: continue
        du = data_uri_for(cu)
        if du and isinstance(du, str):
            out = out.replace(m.group(0), "url(" + du + ")", 1)
    return out

def main(domain):
    url = "https://" + domain + "/"
    html = fetch(url).decode("utf-8", errors="ignore")
    stats = {"domain": domain, "html_bytes": len(html), "imgs": 0, "imgs_failed": [], "css": 0}
    if len(html) < 50000:
        print(json.dumps({"FAIL": domain, "reason": "page too small (%d bytes) — likely JS-rendered or blocked" % len(html)}))
        return
    s = html
    # collect + inline <img src>
    img_urls = list(dict.fromkeys(re.findall(r'<img[^>]*src="([^"]+)"', s)))
    for iu in img_urls:
        cu = canon_url(domain, iu)
        if not cu: continue
        if cu.startswith("data:"): continue
        du = data_uri_for(cu)
        if du and isinstance(du, str):
            s = s.replace('src="' + iu + '"', 'src="' + du + '"'); stats["imgs"] += 1
        else:
            stats["imgs_failed"].append(iu[:80])
    # strip srcset/lazy attrs so inlined src wins
    s = re.sub(r'\s(?:srcset|data-srcset|data-src|data-lazy-src)="[^"]*"', "", s)
    # inline <link rel=stylesheet> (both quote styles)
    for m in list(re.finditer(r"<link[^>]*rel=['\"]stylesheet['\"][^>]*>", s)):
        tag = m.group(0)
        hm = re.search(r"href=['\"]([^'\"]+)['\"]", tag)
        if not hm: continue
        cu = canon_url(domain, hm.group(1))
        if not cu: continue
        du = data_uri_for(cu)
        if isinstance(du, tuple):
            inlined = inline_css(du[1], domain)
            du = "data:text/css;base64," + base64.b64encode(inlined.encode()).decode()
        if isinstance(du, str):
            s = s.replace(tag, "<style>" + (base64.b64decode(du.split(",",1)[1]).decode("utf-8","ignore") if du.startswith("data:text/css") else "@import url('" + du + "');") + "</style>", 1)
            stats["css"] += 1
    # strip scripts, iframes, preloads/preconnects, google fonts links, base target
    s = re.sub(r"<script[\s\S]*?</script>", "", s)
    s = re.sub(r"<iframe[\s\S]*?</iframe>", "", s)
    s = re.sub(r"<link[^>]*rel=['\"](?:preload|preconnect|dns-prefetch|manifest)['\"][^>]*>", "", s)
    s = re.sub(r"<link[^>]*fonts\.googleapis[^>]*>", "", s)
    s = re.sub(r"<link[^>]*gstatic[^>]*>", "", s)
    s = re.sub(r"<base[^>]*>", "", s)
    # honest provenance banner
    banner = ("<div style=\"position:relative;z-index:2147483000;background:#1a6f3a;color:#fff;"
              "font:12px/1.5 system-ui,sans-serif;padding:6px 10px;text-align:center\">"
              "OFFLINE VISUAL PACK — HARZ · captured 2026-10-20 · images and layout stored offline · "
              "live services and subpages need connection · offline copy does not update itself · "
              "provenance: https://" + domain + "/</div>")
    guard = ("<script>document.addEventListener('click',function(e){var a=e.target.closest('a');"
             "if(!a)return;var h=a.getAttribute('href')||'';if(h.indexOf('#')===0||h.indexOf('/v2/')===0)return;"
             "e.preventDefault();alert('OFFLINE VISUAL PACK: this link needs an internet connection:\\n'+h);});"
             "if(navigator.onLine){var b=document.createElement('div');b.textContent='YOU ARE ONLINE — this is the stored offline copy; open the live site for fresh content';"
             "b.style.cssText='background:#8a6d00;color:#fff;font:11px system-ui;padding:4px;text-align:center';"
             "document.body.insertBefore(b,document.body.firstChild);}</script>")
    s = s.replace("</body>", banner + guard + "</body>")
    if "OFFLINE VISUAL PACK" not in s:
        s = banner + s
    os.makedirs("/tmp/packs", exist_ok=True)
    open("/tmp/packs/" + domain + ".html", "w", encoding="utf-8").write(s)
    ext = len(re.findall(r'src="https?://', s)) + len(re.findall(r'href="https?://[^"]*\.css', s))
    print(json.dumps({"OK": domain, "pack_bytes": len(s), "imgs": stats["imgs"], "css": stats["css"],
                      "imgs_failed": stats["imgs_failed"][:5], "ext_src_refs": ext}))

if __name__ == "__main__":
    main(sys.argv[1])

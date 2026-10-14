#!/usr/bin/env python3
"""HARZ Visual Fidelity capture pipeline v0.2 (Oct 14).
Real-browser capture via Cloudflare Browser Rendering REST (own infra):
- POST /browser-rendering/content -> RENDERED DOM (fixes F-1 JS shells)
  real browser engine -> fixes F-2 bot-differential content
- embed link/img/font resources as data URIs (reuses v0.1 embedder)
- law-3 sweep: zero external rendering deps
- provenance manifest: url, capture time, sha256 per resource
Usage: capture2.py <url> <out.html>
"""
import sys, re, base64, hashlib, json, datetime, subprocess, urllib.parse

A1 = "5ab9477c8379d6dcb1a8b5183484aeae"
UA = {"User-Agent": "Mozilla/5.0 (Linux; Android 13) Chrome/120 Mobile Safari/537.36"}
CTX = None

def api_token():
    return subprocess.check_output(["printenv", "CLOUDFLARE_API_TOKEN"]).decode().strip()

def rendered_dom(url):
    tok = api_token()
    r = subprocess.run(["curl", "-s", "-m", "90", "-X", "POST",
        f"https://api.cloudflare.com/client/v4/accounts/{A1}/browser-rendering/content",
        "-H", f"Authorization: Bearer {tok}", "-H", "content-type: application/json",
        "-d", json.dumps({"url": url, "waitForTimeout": 8000})], capture_output=True, text=True)
    d = json.loads(r.stdout)
    if not d.get("success"):
        raise RuntimeError("browser-rendering failed: " + json.dumps(d)[:200])
    return d["result"]

def fetch(url, referer):
    r = subprocess.run(["curl", "-skL", "-m", "40", "-A", UA["User-Agent"],
        "-e", referer, "-o", "/dev/null", "-w", "%{http_code}", url], capture_output=True)
    try:
        code = int(r.stdout.decode().strip() or 0)
    except ValueError:
        code = 0
    if code != 200:
        return None, None
    acc = "text/css,*/*;q=0.1" if ("fonts.googleapis" in url or url.split("?")[0].endswith(".css")) else "*/*"
    r = subprocess.run(["curl", "-skL", "-m", "40", "-A", UA["User-Agent"],
        "-e", referer, "-H", "Accept: " + acc, url], capture_output=True)
    if r.returncode != 0 or not r.stdout:
        return None, None
    ct = None
    if url.endswith((".css", ".CSS")): ct = "text/css"
    if url.endswith((".woff2", ".WOFF2")): ct = "font/woff2"
    if url.endswith((".woff", ".WOFF")): ct = "font/woff"
    if url.endswith((".ttf", ".TTF")): ct = "font/ttf"
    if url.endswith((".png", ".PNG")): ct = "image/png"
    if url.endswith((".jpg", ".JPG", ".jpeg", ".JPEG")): ct = "image/jpeg"
    if url.endswith((".webp", ".WEBP")): ct = "image/webp"
    if url.endswith((".gif", ".GIF")): ct = "image/gif"
    if url.endswith((".svg", ".SVG")): ct = "image/svg+xml"
    if url.endswith((".ico", ".ICO")): ct = "image/x-icon"
    return r.stdout, ct

def data_uri(body, mime):
    return f"data:{mime or 'application/octet-stream'};base64,{base64.b64encode(body).decode()}"

CSS_URL = re.compile(r"url\(\s*['\"]?([^'\")\s]+)['\"]?\s*\)")

def embed_css_urls(css_text, base, referer, manifest):
    out = []
    last = 0
    for m in CSS_URL.finditer(css_text):
        u = m.group(1)
        if u.startswith(("data:", "#", "about:")):
            continue
        absu = urllib.parse.urljoin(base, u)
        body, mime = fetch(absu, referer)
        if body is None:
            manifest.setdefault("failed", []).append(absu)
            continue
        manifest["resources"].append({"url": absu, "mime": mime, "bytes": len(body),
            "sha256": hashlib.sha256(body).hexdigest()})
        out.append(css_text[last:m.start(1)])
        out.append(data_uri(body, mime))
        last = m.end(1)
    out.append(css_text[last:])
    return "".join(out)

def capture(url, out):
    manifest = {"url": url, "captured": datetime.datetime.now(datetime.timezone.utc).isoformat(),
                "engine": "cloudflare-browser-rendering-rest (rendered DOM)",
                "resources": [], "failed": [], "excluded_scripts": []}
    html = rendered_dom(url)
    base, referer = url, url

    # scripts: rendered DOM may contain inline scripts (already-executed at render time).
    # Keep inline scripts (harmless data-only leftovers mostly); drop external script srcs
    # (they would run offline and may attempt network = law-3 risk). Record honestly.
    for m in re.finditer(r'<script\s[^>]*\bsrc=["\']([^"\']+)["\']', html):
        manifest["excluded_scripts"].append(m.group(1))
    html = re.sub(r'<script\s[^>]*\bsrc=["\'][^"\']+["\'][^>]*>\s*</script>', "", html)
    html = re.sub(r'<script\s[^>]*\bsrc=["\'][^"\']+["\'][^>]*/>', "", html)

    # stylesheets: fetch, embed their url() refs, inline as <style>
    def sub_link(m):
        whole, href = m.group(0), m.group(1)
        if href.startswith("data:"):
            return whole
        absu = urllib.parse.urljoin(base, href)
        body, mime = fetch(absu, referer)
        if body is None:
            manifest["failed"].append(absu)
            return "<!-- vf: css fetch failed: " + absu + " -->"
        css = embed_css_urls(body.decode("utf-8", "replace"), absu, referer, manifest)
        manifest["resources"].append({"url": absu, "mime": "text/css", "bytes": len(body),
            "sha256": hashlib.sha256(body).hexdigest()})
        return "<style>/* vf-embed:" + absu + " */" + css + "</style>"
    html = re.sub(r'<link\b[^>]*?href=["\']([^"\']+)["\'][^>]*>', sub_link, html)

    # inline <style> blocks: embed their url() refs too
    def sub_style(m):
        css = embed_css_urls(m.group(1), base, referer, manifest)
        return "<style>" + css + "</style>"
    html = re.sub(r'<style[^>]*>(.*?)</style>', lambda m: "<style>" + embed_css_urls(m.group(1), base, referer, manifest) + "</style>", html, flags=re.S)

    # images
    def sub_img(m):
        whole, src = m.group(0), m.group(1)
        if src.startswith("data:"):
            return whole
        absu = urllib.parse.urljoin(base, src)
        body, mime = fetch(absu, referer)
        if body is None:
            manifest["failed"].append(absu)
            return whole.replace(src, "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==")
        manifest["resources"].append({"url": absu, "mime": mime, "bytes": len(body),
            "sha256": hashlib.sha256(body).hexdigest()})
        return whole.replace(src, data_uri(body, mime))
    # simple src/img rewrite (covers img src + source src)
    for m in list(re.finditer(r'(<(?:img|source)\b[^>]*?\bsrc=["\'])(?!data:)([^"\']+)["\']', html)):
        absu = urllib.parse.urljoin(base, m.group(2))
        body, mime = fetch(absu, referer)
        if body is None:
            manifest["failed"].append(absu)
            continue
        manifest["resources"].append({"url": absu, "mime": mime, "bytes": len(body),
            "sha256": hashlib.sha256(body).hexdigest()})
        html = html.replace(m.group(0), m.group(1) + data_uri(body, mime), 1)

    # srcset: replace each candidate
    for m in list(re.finditer(r'srcset=["\']([^"\']+)["\']', html)):
        parts = []
        for cand in m.group(1).split(","):
            u = cand.strip().split(" ")[0]
            if u.startswith("data:"):
                parts.append(cand)
                continue
            absu = urllib.parse.urljoin(base, u)
            body, mime = fetch(absu, referer)
            if body is None:
                manifest["failed"].append(absu)
                continue
            manifest["resources"].append({"url": absu, "mime": mime, "bytes": len(body),
                "sha256": hashlib.sha256(body).hexdigest()})
            parts.append(data_uri(body, mime))
        if parts:
            html = html.replace(m.group(0), 'srcset="' + ",".join(parts) + '"', 1)

    manifest["dom_bytes"] = len(html.encode("utf-8", "replace"))
    prov = json.dumps(manifest)[:20000]
    html = html.replace("<head>", "<!-- harz-provenance: " + prov + " -->\n<head>", 1)
    open(out, "w", encoding="utf-8").write(html)
    n_res = len(manifest["resources"])
    kb = sum(r.get("bytes") or 0 for r in manifest["resources"]) // 1024
    print(f"captured(rendered) {url} -> {out}: {len(html)//1024}KB html, {n_res} resources ({kb}KB raw), {len(manifest['failed'])} failed, {len(manifest['excluded_scripts'])} scripts excluded")

if __name__ == "__main__":
    capture(sys.argv[1], sys.argv[2])

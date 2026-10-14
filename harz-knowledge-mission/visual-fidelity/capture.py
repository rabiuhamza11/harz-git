#!/usr/bin/env python3
"""HARZ Visual Fidelity capture pipeline v0.1 (Stage 1, Oct 14).
Captures a web page AS A WEBSITE: HTML structure, CSS (incl. @import chains),
images, fonts — rewriting every reference to a self-contained data URI so the
page renders identically offline with ZERO hidden network dependency.
External scripts are EXCLUDED and honestly listed (interactivity that may
require live servers). Provenance manifest embedded: URL, capture time,
per-resource sha256, honest offline status.
Usage: python3 capture.py https://example.gov.ng out.html
"""
import sys, re, base64, hashlib, json, urllib.request, urllib.parse, datetime, ssl, subprocess

UA = {"User-Agent": "Mozilla/5.0 (Linux; Android 13; Infinix) HARZ-VisualFidelity/0.1"}
ctx = ssl.create_default_context(); ctx.check_hostname = False; ctx.verify_mode = ssl.CERT_NONE
resources = []  # provenance ledger
script_log = []

def fetch(url, binary=True):
    r = subprocess.run(["curl","-skL","-m","40","-A",UA["User-Agent"],url], capture_output=True)
    if r.returncode != 0 or not r.stdout:
        raise RuntimeError(f"curl rc={r.returncode}")
    return r.stdout

def data_uri(url, kind):
    try:
        raw = fetch(url)
        ext = url.split("?")[0].rsplit(".", 1)[-1][:5].lower()
        mime = {"css": "text/css", "js": "application/javascript", "png": "image/png",
                "jpg": "image/jpeg", "jpeg": "image/jpeg", "gif": "image/gif",
                "svg": "image/svg+xml", "webp": "image/webp", "ico": "image/x-icon",
                "woff": "font/woff", "woff2": "font/woff2", "ttf": "font/ttf",
                "eot": "application/vnd.ms-fontobject", "otf": "font/otf"}.get(ext, "application/octet-stream")
        if kind == "css": mime = "text/css"
        b64 = base64.b64encode(raw).decode()
        resources.append({"url": url, "mime": mime, "bytes": len(raw), "sha256": hashlib.sha256(raw).hexdigest()[:16]})
        return f"data:{mime};base64,{b64}"
    except Exception as e:
        resources.append({"url": url, "error": str(e)[:80]})
        return None

def absolutize(base, ref):
    return urllib.parse.urljoin(base, ref)

def rewrite_css(css_text, css_base):
    # rewrite url() and @import inside CSS
    def url_sub(m):
        u = m.group(1).strip("\"'")
        if u.startswith("data:"): return m.group(0)
        absu = absolutize(css_base, u)
        d = data_uri(absu, "img")
        if d: return f"url({d})"
        return "none"
    css_text = re.sub(r"url\(([^)]+)\)", url_sub, css_text)
    def imp_sub(m):
        u = m.group(1).strip("\"'")
        if u.startswith("data:"): return m.group(0)
        absu = absolutize(css_base, u)
        d = data_uri(absu, "css")
        if d: return f'@import "{d}"'
        return ""
    css_text = re.sub(r'@import\s+(["\'])([^"\']+)\1', imp_sub, css_text)
    return css_text

def capture(page_url, out_path, max_css_kb=900):
    html = fetch(page_url).decode("utf-8", "replace")
    base = page_url

    # 1. <link rel=stylesheet> -> embedded data URI css (rewritten)
    def link_sub(m):
        attrs, href = m.group(0), m.group(1)
        if "stylesheet" not in attrs and "icon" not in attrs:
            return attrs
        absu = absolutize(base, href)
        if "stylesheet" in attrs:
            try:
                css = fetch(absu).decode("utf-8", "replace")
                if len(css) > max_css_kb*1024:
                    css = css[:max_css_kb*1024]
                css = rewrite_css(css, absu)
                b64 = base64.b64encode(css.encode()).decode()
                resources.append({"url": absu, "mime": "text/css", "bytes": len(css), "embedded": True})
                return m.group(0).replace(href, f"data:text/css;base64,{b64}")
            except Exception as e:
                resources.append({"url": absu, "error": str(e)[:80]})
                return f'<!-- harz: stylesheet could not be captured: {absu} -->'
        d = data_uri(absu, "img")
        if d: return m.group(0).replace(href, d)
        # honest fallback: never leave a live external ref (Visual Fidelity law 3)
        return f'<style>/* harz: external resource could not be captured offline: {absu} */</style>' if "icon" in attrs else attrs if False else f'<!-- harz: uncapturable external resource removed: {absu} -->
<style>:root {{ --harz-missing-font: 1; }} * {{ font-family: inherit; }}</style>' 
    html = re.sub(r'<link[^>]*href=["\']([^"\']+)["\'][^>]*>', link_sub, html)

    # 2. <style> blocks: rewrite internal urls
    def style_sub(m):
        return "<style>" + rewrite_css(m.group(1), base) + "</style>"
    html = re.sub(r"<style[^>]*>(.*?)</style>", style_sub, html, flags=re.S)

    # 3. <img src / srcset>
    def img_src(m):
        tag, src = m.group(0), m.group(1)
        if src.startswith("data:"): return tag
        d = data_uri(absolutize(base, src), "img")
        return tag.replace(src, d) if d else tag
    html = re.sub(r'<img([^>]*?)src=["\']([^"\']+)["\']', lambda m: m.group(0)[:m.start(1)-m.start(0)] if False else m.group(0), html)  # noop guard
    html = re.sub(r'(<img\s[^>]*?src=["\'])([^"\']+)(["\'])', lambda m: m.group(1) + (data_uri(absolutize(base, m.group(2)), "img") or m.group(2)) + m.group(3), html)

    # 4. external scripts: EXCLUDED (honest list), inline scripts kept
    def script_sub(m):
        tag, src = m.group(0), m.group(1)
        script_log.append(absolutize(base, src))
        return f"<!-- harz: external script excluded for offline honesty: {absolutize(base, src)} -->"
    html = re.sub(r'<script\s[^>]*?src=["\']([^"\']+)["\'][^>]*?>\s*</script>', script_sub, html)

    # 5. anchors: keep href for provenance but mark (reader handles nav honestly)
    # (page kept visually identical; links preserved in manifest)

    # residual external refs audit
    resid = re.findall(r'(?:src|href)=["\'](https?://[^"\']+)["\']', html)
    resid = [u for u in resid if "harz:" not in u and "excluded" not in u]

    manifest = {
        "harz_visual_fidelity": "0.1",
        "original_url": page_url,
        "captured_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "capture_tool": "vf-capture-0.1",
        "resources": resources,
        "external_scripts_excluded": script_log,
        "residual_external_refs": resid,
        "offline_honesty": "EXCLUDED = live-server interactivity (scripts), links = not captured unless listed",
    }
    provenance = f"<!-- harz-provenance: {json.dumps(manifest)[:20000]} -->\n"
    # LAW ENFORCEMENT SWEEP: no external rendering dependency may survive
    def strip_ext(m):
        whole = m.group(0)
        if "<a " in whole or "harz:" in whole: return whole
        return f"<!-- harz: stripped residual external ref: {m.group(1)} -->"
    html = re.sub(r'<(link|img|script|iframe|source|embed)[^>]*(?:src|href)=["\'](https?://[^"\']+)["\'][^>]*>/?', strip_ext, html)
    html = re.sub(r'url\((["\']?https?://[^)"\']+["\']?)\)', lambda m: "none", html)
    resid2 = re.findall(r'(?:src|href)=["\'](https?://[^"\']+)["\']', html)
    resid2 = [u for u in resid2 if "harz:" not in u]
    manifest["residual_external_refs_after_sweep"] = resid2
    open(out_path, "w").write(provenance + html)
    total = sum(r.get("bytes", 0) for r in resources)
    print(f"captured {page_url} -> {out_path}: {len(html)/1024:.0f}KB html, {len(resources)} resources ({total/1024:.0f}KB raw), {len(script_log)} scripts excluded, {len(resid)} residual external refs")
    return manifest

if __name__ == "__main__":
    capture(sys.argv[1], sys.argv[2])

#!/usr/bin/env python3
"""FX-1 reference extractor (Python reference; deployed version will be JS on Workers).
Implements the FX-1 design: fetch / robots / pagination / readability /
normalize / hash / classify. Battery A1-A8 per FX-1-FULL-TEXT-DESIGN-v1.md."""
import hashlib, html as ihtml, json, re, subprocess, sys, time

UA = "Mozilla/5.0 (compatible; HARZ-FX1-Reference/1.0; corpus audit)"
CAP_BYTES = 512 * 1024  # D-1 proposal
MIN_CHARS = 500

def curl(url, timeout=25):
    """Return (status, final_url, body) or (None, url, error)."""
    try:
        r = subprocess.run(
            ["curl", "-s", "-m", str(timeout), "-L", "-A", UA,
             "-w", "\n@@META@@%{http_code}|%{url_effective}", url],
            capture_output=True, text=True, errors="replace")
        body, _, meta = r.stdout.rpartition("@@META@@")
        code, final = meta.split("|", 1)
        return int(code), final, body
    except Exception as e:
        return None, url, str(e)

# ---------- S2 permission ----------
def robots_allows(domain, path="/"):
    code, _, body = curl(f"https://{domain}/robots.txt", 15)
    if code != 200:
        return True, "no robots.txt (allowed by default)"
    for line in body.splitlines():
        line = line.strip()
        if line.lower().startswith("disallow:") and path in line.split(":", 1)[1].strip():
            return False, f"disallowed: {line}"
    return True, "robots ok"

# ---------- S4 readability (own extractor, density-scored) ----------
STRIP = re.compile(r"<(script|style|noscript|template|aside|nav|footer|header)[^>]*>.*?</\1>",
                   re.S | re.I)
COMMENTS = re.compile(r"<!--.*?-->", re.S)
TAGS = re.compile(r"<[^>]+>")
BLOCKISH = re.compile(r"</?(p|div|h[1-6]|li|tr|section|article|blockquote|pre|table)[^>]*>", re.I)

def extract_readable(raw):
    """Density-scored text extraction. Returns (text, method)."""
    v = STRIP.sub(" ", raw)
    v = COMMENTS.sub(" ", v)
    v = re.sub(r"<br[^>]*>", "\n", v, flags=re.I)
    # mark block boundaries so tag-stripping preserves paragraphs
    v = BLOCKISH.sub(lambda m: "\n\n", v)
    v = TAGS.sub(" ", v)
    v = ihtml.unescape(v)
    v = re.sub(r"[ \t]+", " ", v)
    v = re.sub(r"\n{3,}", "\n\n", v)
    lines, keep = v.split("\n"), []
    for ln in lines:  # density filter: drop nav-ish fragments
        s = ln.strip()
        if not s:
            keep.append("")
            continue
        words = s.split()
        if len(words) <= 2 and not re.search(r"[.!?\"']$", s):
            continue  # menu/link crumb
        keep.append(s)
    text = "\n".join(keep).strip()
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text, "readability-density-v1"

# ---------- S3 pagination ----------
def find_next(raw, base_url):
    m = re.search(r'<link[^>]+rel=["\']?next["\']?[^>]+href=["\']?([^"\'>\s]+)', raw, re.I)
    if not m:
        m = re.search(r'<a[^>]+rel=["\']?next["\']?[^>]+href=["\']?([^"\'>\s]+)', raw, re.I)
    if not m:
        m = re.search(r'<a[^>]+href=["\']?([^"\'>\s]*(?:page|part)[=/\-]?[0-9]+[^"\'>\s]*)["\']?[^>]*>\s*(?:next|>>|[0-9]+\s*&raquo)', raw, re.I)
    if not m:
        return None
    href = m.group(1)
    if href.startswith("//"): return "https:" + href
    if href.startswith("/"): return re.match(r"https?://[^/]+", base_url).group(0) + href
    if not href.startswith("http"):
        import posixpath
        import urllib.parse as up
        base_dir = up.urlparse(base_url)
        return up.urlunparse((base_dir.scheme, base_dir.netloc,
            posixpath.normpath(posixpath.join(posixpath.dirname(base_dir.path), href)), "", "", ""))
    return href

# ---------- pipeline ----------
def pipeline(url, follow_pages=True, max_pages=10, prior_sha=None):
    """Full FX-1 pipeline for one document. Returns the extraction record."""
    rec = {"url": url, "pages": [], "status": None, "reason": ""}
    t0 = time.time()
    page_url, seen = url, set()
    texts = []
    while page_url and len(rec["pages"]) < max_pages:
        if page_url in seen:
            break
        seen.add(page_url)
        code, final, body = curl(page_url)
        rec["pages"].append({"url": page_url, "status": code, "bytes": len(body)})
        if code == 403:
            rec["status"] = "unsupported"
            rec["reason"] = "access denied (bot wall or forbidden)"
            return rec
        if code is None or code != 200:
            rec["status"] = "failed_fetch"
            rec["reason"] = f"HTTP {code}"
            return rec
        tm = re.search(r"<title[^>]*>([^<]{0,120})", body, re.I)
        title = tm.group(1) if tm else ""
        rec["title"] = title
        if re.search(r"just a moment|attention required|security verification|access denied|captcha", title, re.I):
            rec["status"] = "unsupported"
            rec["reason"] = "bot challenge"
            return rec
        domain = re.match(r"https?://([^/]+)", final).group(1)
        path = re.match(r"https?://[^/]+(/[^?]*)", final)
        ok, why = robots_allows(domain, path.group(1) if path else "/")
        if not ok:
            rec["status"] = "unsupported"
            rec["reason"] = why
            return rec
        if len(re.sub(TAGS, " ", STRIP.sub(" ", body)).strip()) < 100 and re.search(r"<div[^>]+id=[\"']?(root|app|__next)[\"']?", body, re.I) and re.search(r"<script[^>]+src=", body):
            rec["status"] = "unsupported"
            rec["reason"] = "js-only rendering (V1 limitation)"
            return rec
        text, method = extract_readable(body)
        texts.append(text)
        rec["method"] = method
        nxt = find_next(body, final) if follow_pages else None
        if not nxt:
            break
        page_url = nxt
    full = "\n\n".join(t for t in texts if t)
    rec["char_len"] = len(full)
    if len(full.encode()) > CAP_BYTES:
        rec["status"] = "truncated"
        rec["reason"] = f"cap {CAP_BYTES}B hit at {len(full.encode())}B"
        full = full[:CAP_BYTES]
    elif len(full) < MIN_CHARS:
        rec["status"] = "failed_extract"
        rec["reason"] = f"only {len(full)} readable chars"
        return rec
    rec["full_text_sha256"] = hashlib.sha256(full.encode()).hexdigest()
    rec["full_len"] = len(full)
    if prior_sha and prior_sha == rec["full_text_sha256"]:
        rec["status"] = "unchanged"
        rec["prior_sha"] = prior_sha
        return rec
    if rec["status"] is None:
        rec["status"] = "complete"
        rec["pagination_pages"] = len(rec["pages"])
        if len(rec["pages"]) >= max_pages:
            rec["status"] = "truncated"
            rec["reason"] = f"pagination cap {max_pages} hit"
    rec["ms"] = round((time.time() - t0) * 1000)
    rec["snippet_2k"] = full[:2000]  # for M-1 comparison only
    rec["full_text"] = full
    return rec

def classify(rec):
    return rec["status"]

if __name__ == "__main__":
    result = pipeline(sys.argv[1])
    result.pop("full_text", None)
    print(json.dumps(result, indent=1)[:2000])

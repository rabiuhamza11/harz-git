#!/usr/bin/env python3
"""HARZ Stage 2 hunt: fetch 5,080 unwired search URLs, trafilatura-extract,
push new docs to million-corpus via /api/ingest-wave (idempotent, capacity-gated).
Resumable. Approved by Rabiu (Stage 2 of 'web as it is', 2026-10-10)."""
import os, sys, json, time, re, ssl, gzip, hashlib, urllib.request, urllib.error
from urllib.parse import urlparse
from concurrent.futures import ThreadPoolExecutor, as_completed
import trafilatura

TOKEN = os.environ.get('CLOUDFLARE_API_TOKEN_3', '')
AID = "5ab9477c8379d6dcb1a8b5183484aeae"
WAVE_KEY = open(".wavekey").read().strip()
INGEST_URL = "https://harz-million-corpus.harz.workers.dev/api/ingest-wave"
UA = "HARZ-Hunt/2.0 (+https://harz-browser.harz.workers.dev/doc)"
MAX_DOC = 100_000
MIN_DOC = 200
BATCH_PUSH = 40
URLS = "stage2-unwired-urls.json"
STATE = "hunt-stage2-state.json"
CTX = ssl.create_default_context(); CTX.check_hostname = False; CTX.verify_mode = ssl.CERT_NONE

def log(msg):
    print(f"[{time.strftime('%H:%M:%S')}] {msg}", flush=True)

def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "text/html,*/*"})
    try:
        with urllib.request.urlopen(req, timeout=20, context=CTX) as r:
            raw = r.read(2_000_000)
            if r.headers.get("Content-Encoding") == "gzip":
                try: raw = gzip.decompress(raw)
                except Exception: pass
            return r.status, raw.decode("utf-8", "replace")
    except Exception as e:
        return 0, f"__ERR__{type(e).__name__}:{str(e)[:80]}"

BLOCK = re.compile(r"</?(?:p|div|br|li|tr|h[1-6]|blockquote|section|article|table)[^>]*>", re.I)
JUNK = re.compile(r"<(script|style|noscript|head|svg)[^>]*>.*?</\1>", re.S | re.I)
TAGS = re.compile(r"<[^>]+>")

def strip_fallback(html):
    t = JUNK.sub(" ", html)
    t = BLOCK.sub("\n", t)
    t = TAGS.sub("", t)
    import html as H
    t = H.unescape(t)
    return re.sub(r"\n{3,}", "\n\n", t).strip()

def extract(html):
    text = trafilatura.extract(html, include_comments=False, include_tables=True,
                               favor_recall=True, with_metadata=False)
    if not text or len(text) < MIN_DOC:
        text = strip_fallback(html)
    return (text or "").strip()[:MAX_DOC]

def title_of(html):
    try:
        m = trafilatura.extract_metadata(html)
        return (m.title if m and m.title else "")[:500]
    except Exception:
        return ""

def push(docs):
    body = json.dumps({"key": WAVE_KEY, "docs": docs}, ensure_ascii=False).encode()
    req = urllib.request.Request(INGEST_URL, data=body, method="POST",
                                 headers={"Content-Type": "application/json", "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) HARZ-Hunt/2.0"})
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            res = json.load(r)
        return True, res
    except urllib.error.HTTPError as e:
        return False, e.read().decode()[:200]
    except Exception as e:
        return False, str(e)[:120]

# ---------- state ----------
st = json.load(open(STATE)) if os.path.exists(STATE) else {"done": {}, "pushed": 0, "inserted": 0, "dup": 0}
done = st['done']  # url -> status
items = json.load(open(URLS))
todo = [it for it in items if it['url'] not in done]
log(f"total {len(items)} | done {len(done)} | todo {len(todo)}")

def fetch_work(it):
    # thread pool does ONLY network fetch (thread-safe); extraction happens in main thread
    url, sid = it['url'], it['sid']
    stt, body = fetch(url)
    if stt == 0 or body.startswith("__ERR__"):
        return url, sid, {"status": "dead", "error": (body[:100] if stt == 0 else body), "body": None}
    if not body.lstrip().lower().startswith("<!doctype") and "<html" not in body[:2000].lower():
        return url, sid, {"status": "dead", "error": f"not html (status {stt})", "body": None}
    return url, sid, {"status": "html", "body": body}

def work(it):
    url, sid = it['url'], it['sid']
    stt, body = fetch(url)
    if stt == 0 or body.startswith("__ERR__"):
        return url, sid, {"status": "dead", "error": (body[:100] if stt == 0 else body)}
    if not body.lstrip().lower().startswith("<!doctype") and "<html" not in body[:2000].lower():
        return url, sid, {"status": "dead", "error": f"not html (status {stt})"}
    text = extract(body)
    if len(text) < MIN_DOC:
        return url, sid, {"status": "too_short", "chars": len(text)}
    return url, sid, {"status": "ok", "text": text, "title": title_of(body),
                      "fetched_at": time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())}

ok = dead = short = 0
new_ok = 0
buf = []
def flush_buf():
    global st
    if not buf: return
    good, res = push(buf)
    if good and res.get('ok'):
        st['pushed'] += len(buf)
        st['inserted'] += res.get('inserted', 0)
        st['dup'] += res.get('dup_rejected_this_batch', 0)
        log(f"pushed {len(buf)} (inserted {res.get('inserted')}, dup {res.get('dup_rejected_this_batch')}, total in db {res.get('unique_now')})")
    else:
        log(f"PUSH FAILED: {res}")
    buf.clear()

# main-thread extraction queue
from collections import deque
extract_q = deque()
with ThreadPoolExecutor(max_workers=16) as ex:
    futs = {ex.submit(fetch_work, it): it for it in todo}
    for f in as_completed(futs):
        url, sid, r = f.result()
        if r['status'] == 'html':
            extract_q.append((url, sid, r['body']))
        else:
            done[url] = r['status']; dead += 1
        # drain extraction queue in the MAIN thread (trafilatura/lxml is not thread-safe)
        while extract_q:
            u, s, body = extract_q.popleft()
            text = extract(body)
            if len(text) < MIN_DOC:
                done[u] = 'too_short'; short += 1
                continue
            dom = urlparse(u).netloc
            content_hash = hashlib.sha256(text.encode('utf-8')).hexdigest()
            buf.append({"url": u, "title": title_of(body), "domain": dom, "source": "hunted-stage2",
                        "language": "en",
                        "fetched_at": time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
                        "text": text, "content_hash": content_hash})
            done[u] = 'ok'; ok += 1
        if len(buf) >= BATCH_PUSH:
            flush_buf()
        if len(done) % 200 == 0:
            flush_buf()
            json.dump(st, open(STATE, "w"))
            log(f"progress {len(done)}/{len(items)} ok={ok} short={short} dead={dead}")
flush_buf()
json.dump(st, open(STATE, "w"))
log(f"HUNT DONE. ok={ok} short={short} dead={dead} pushed={st['pushed']} inserted={st['inserted']} dup={st['dup']}")

#!/usr/bin/env python3
"""HARZ Search v0.2 incremental crawler (rebuild after workspace wipe).
Seeds from corpus/docs.jsonl (v0.1.1 store, 1409 docs), crawls toward 10k+.
Laws (v0.2 spec): dedupe by sha256 text hash, first_seen/last_crawled/last_changed
freshness fields, immutable content_hash, per-domain caps, domain circuit breaker,
DNS watchdog, queue persisted to disk, chunked runs with time budget.
Usage: python3 crawl2.py --minutes=N --workers=N
"""
import sys, os, json, time, hashlib, re, socket, threading, random
from urllib.parse import urljoin, urlparse
from concurrent.futures import ThreadPoolExecutor
import urllib.request, urllib.error
import http.client
import ssl

MINUTES = 3
WORKERS = 48
for a in sys.argv[1:]:
    if a.startswith("--minutes="): MINUTES = int(a.split("=")[1] or 3)
    if a.startswith("--workers="): WORKERS = int(a.split("=")[1] or 48)

STORE_DIR = "corpus-v02"
STORE = STORE_DIR + "/store.json"
DOCS_OUT = STORE_DIR + "/docs.jsonl"
os.makedirs(STORE_DIR, exist_ok=True)

SEED_DOCS = "corpus/docs.jsonl"
SEED_URLS = ["https://en.wikipedia.org/wiki/Main_Page",
    "https://developer.mozilla.org/en-US/", "https://news.ycombinator.com",
    "https://www.bbc.com/news", "https://www.theguardian.com/international",
    "https://stackoverflow.com/questions", "https://github.com/trending",
    "https://www.reuters.com", "https://www.aljazeera.com",
    "https://docs.python.org/3/", "https://nodejs.org/en/docs",
    "https://www.cloudflare.com/learning/", "https://hackernoon.com",
    "https://www.techmeme.com", "https://arstechnica.com", "https://www.wired.com",
    "https://www.economist.com", "https://techcrunch.com",
    "https://harz-store.harz.workers.dev", "https://super-cloud.harz.workers.dev",
    "https://hamzarabiu.gumroad.com", "https://www.getly.store/store/harzdm-com-mr951f69"]

DEFAULT_DOMAIN_CAP = 60
DOMAIN_CAPS = {"en.wikipedia.org": 140, "developer.mozilla.org": 110}
MAX_DOCS = 11000
TEXT_LIMIT = 20000
TARGET_DOCS = 10000

USER_AGENT = "HARZSearchBot/0.2 (+https://harz-search.hamzarabiu390.workers.dev)"
CTX = ssl.create_default_context()
CTX.check_hostname = False
CTX.verify_mode = ssl.CERT_NONE

TAG_RE = re.compile(r"<(script|style|noscript|head|nav|footer|aside|form|svg)[^>]*>.*?</\1>", re.S | re.I)
COMMENT_RE = re.compile(r"<!--.*?-->", re.S)
ALL_TAG_RE = re.compile(r"<[^>]+>")
WS_RE = re.compile(r"\s+")
HREF_RE = re.compile(r'href=["\']([^"\'#]+)')

def visible_text(html):
    html = TAG_RE.sub(" ", html)
    html = COMMENT_RE.sub(" ", html)
    html = ALL_TAG_RE.sub(" ", html)
    return WS_RE.sub(" ", html).strip()

def reg_domain(host):
    host = (host or "").lower()
    parts = host.split(".")
    if len(parts) >= 3 and parts[-2] in ("co", "com", "org", "net", "gov", "edu", "ac"):
        return ".".join(parts[-3:])
    return ".".join(parts[-2:]) if len(parts) >= 2 else host

def lang_guess(text, path):
    t = text[:3000].lower()
    hits = sum(t.count(w) for w in (" the ", " and ", " of ", " to ", " is ", " that "))
    if hits < 3: return "unknown"
    return "en"

def load():
    if os.path.exists(STORE):
        d = json.load(open(STORE))
        print(f"[resume] store: {len(d['store'])} docs, next_id {d.get('next_id', len(d['store']))}")
        return d
    store, queue, seen, next_id = {}, [], set(), 0
    # seed from v0.1.1 corpus
    if os.path.exists(SEED_DOCS):
        for line in open(SEED_DOCS):
            r = json.loads(line)
            did = r["id"] if next_id <= r["id"] else next_id
            if r["id"] >= next_id: next_id = r["id"] + 1
            key = hashlib.sha256((r.get("url") or "").encode()).hexdigest()
            store[key] = {"id": r["id"], "url": r["url"], "title": r.get("title") or "",
                "text": r.get("text") or "", "domain": r.get("domain") or "", "source": "v0.1.1-seed",
                "language": r.get("language") or "en", "links": r.get("links") or [],
                "redirect_chain": r.get("redirect_chain") or [], "content_hash": r.get("content_hash") or "",
                "canonical_url": r["url"], "first_seen": r.get("fetched_at") or "",
                "last_crawled": r.get("fetched_at") or "", "last_changed": None, "crawl_status": "seed"}
            seen.add(r["url"])
        print(f"[seed] {len(store)} docs from v0.1.1 corpus")
    for u in SEED_URLS:
        if u not in seen:
            queue.append(u); seen.add(u)
    # seed frontier from stored links
    for rec in list(store.values()):
        for l in rec.get("links") or []:
            if isinstance(l, str) and l.startswith("http") and l not in seen:
                queue.append(l); seen.add(l)
    return {"store": store, "queue": queue, "seen": seen, "next_id": next_id,
            "domain_fail": {}, "domain_count": {}, "queued_domains": {}}

def save(state):
    tmp = STORE + ".tmp"
    snap_store = {k: {kk: vv for kk, vv in v.items() if kk != "_lock"} for k, v in list(state["store"].items())}
    snap_queue = list(state["queue"])
    payload = {"store": snap_store, "queue": snap_queue, "seen_count": len(state["seen"]),
               "next_id": state["next_id"], "domain_fail": state["domain_fail"],
               "domain_count": state["domain_count"]}
    with open(tmp, "w") as f:
        json.dump(payload, f)
    os.replace(tmp, STORE)

def emit(state):
    with open(DOCS_OUT + ".tmp", "w") as f:
        rows = sorted(state["store"].values(), key=lambda r: r["id"])
        for r in rows:
            f.write(json.dumps({k: r.get(k) for k in ("id","url","title","text","domain","source",
                "language","links","redirect_chain","content_hash","canonical_url","first_seen",
                "last_crawled","last_changed","crawl_status","fetched_at") if k in r}) + "\n")
    os.replace(DOCS_OUT + ".tmp", DOCS_OUT)

def fetch(url, timeout=12):
    """Fetch with DNS watchdog; returns (status, html, final_url, chain)."""
    try:
        host = urlparse(url).hostname
    except Exception:
        return "bad-url", "", url, []
    dns_ok = [False]
    def dns_probe():
        try:
            socket.getaddrinfo(host, 443, proto=socket.IPPROTO_TCP)
            dns_ok[0] = True
        except Exception:
            pass
    t = threading.Thread(target=dns_probe, daemon=True); t.start(); t.join(4)
    if not dns_ok[0]:
        return "dns-fail", "", url, []
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT,
        "Accept": "text/html,application/xhtml+xml", "Accept-Language": "en"})
    chain = []
    cur = url
    for hop in range(4):
        try:
            opener = urllib.request.build_opener(urllib.request.HTTPSHandler(context=CTX))
            resp = opener.open(req, timeout=timeout)
            if resp.status not in (200,):
                return f"http-{resp.status}", "", cur, chain
            data = resp.read(600_000).decode("utf-8", "replace")
            return "ok", data, cur, chain
        except urllib.error.HTTPError as e:
            return f"http-{e.code}", "", cur, chain
        except Exception as e:
            return type(e).__name__, "", cur, chain
    return "max-redirects", "", cur, chain

def canonical(u):
    p = urlparse(u)
    return p.scheme + "://" + p.netloc + (p.path or "/") + (("?" + p.query) if p.query else "")

def cap_for(dom):
    return DOMAIN_CAPS.get(dom, DEFAULT_DOMAIN_CAP)

def main():
    state = load()
    store, queue = state["store"], state["queue"]
    domain_count = state.setdefault("domain_count", {})
    domain_fail = state.setdefault("domain_fail", {})
    budget = MINUTES * 60
    t0 = time.time()
    processed = [0]; new_cnt = [0]; chg_cnt = [0]; unch_cnt = [0]
    lock = threading.Lock()

    def worker():
        while time.time() - t0 < budget:
            with lock:
                if not queue or len(store) >= MAX_DOCS:
                    time.sleep(0.05); continue
                url = queue.pop(random.randrange(len(queue)) if len(queue) > 1 else 0)
            dom = reg_domain(urlparse(url).hostname or "")
            if not dom: continue
            if domain_count.get(dom, 0) >= cap_for(dom): continue
            if domain_fail.get(dom, 0) >= 5: continue
            st, html, final_url, chain = fetch(url)
            with lock:
                domain_count[dom] = domain_count.get(dom, 0) + 1
                if st == "ok":
                    if len(html) < 1500: st = "thin"
            if st != "ok":
                with lock:
                    domain_fail[dom] = domain_fail.get(dom, 0) + 1
                continue
            text = visible_text(html)
            if len(text) < 300: continue
            title_m = re.search(r"<title[^>]*>(.*?)</title>", html, re.S | re.I)
            title = WS_RE.sub(" ", (title_m.group(1) if title_m else "")).strip()[:300]
            cu = canonical(final_url)
            chash = hashlib.sha256(text.encode()).hexdigest()
            key = hashlib.sha256(cu.encode()).hexdigest()
            now = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
            with lock:
                processed[0] += 1
                if key in store:
                    rec = store[key]
                    if rec.get("content_hash") == chash:
                        rec["last_crawled"] = now; unch_cnt[0] += 1
                    else:
                        rec["content_hash"] = chash; rec["text"] = text[:TEXT_LIMIT]
                        rec["title"] = title; rec["last_crawled"] = now
                        rec["last_changed"] = now; rec["crawl_status"] = "changed"
                        chg_cnt[0] += 1
                else:
                    store[key] = {"id": state["next_id"], "url": cu, "title": title,
                        "text": text[:TEXT_LIMIT], "domain": dom, "source": "crawl-v02",
                        "language": lang_guess(text, cu), "links": [], "redirect_chain": chain,
                        "content_hash": chash, "canonical_url": cu, "first_seen": now,
                        "last_crawled": now, "last_changed": now, "crawl_status": st,
                        "fetched_at": now}
                    state["next_id"] += 1
                    new_cnt[0] += 1
                rec = store[key]
            # extract links
            links = []
            base = final_url
            for m in HREF_RE.finditer(html):
                href = m.group(1)
                if href.startswith(("javascript:", "mailto:", "tel:", "data:")): continue
                lu = urljoin(base, href)
                if not lu.startswith("https://"): continue
                if any(x in lu for x in (".png", ".jpg", ".jpeg", ".gif", ".svg", ".css",
                        ".js", ".ico", ".woff", ".woff2", ".ttf", ".eot", ".mp4", ".mp3",
                        ".zip", ".pdf", ".webp")): continue
                links.append(canonical(lu))
            links = links[:40]
            with lock:
                rec["links"] = links
                state.setdefault("seen", set())
                for l in links:
                    if l not in state["seen"] and len(queue) < 150000:
                        state["seen"].add(l); queue.append(l)
                if processed[0] % 250 == 0:
                    save(state)
                    print(f"[{int(time.time()-t0)}s] docs={len(store)} queued={len(queue)}", flush=True)

    threads = [threading.Thread(target=worker, daemon=True) for _ in range(WORKERS)]
    for t in threads: t.start()
    while time.time() - t0 < budget + 20:
        alive = sum(1 for t in threads if t.is_alive())
        if alive == 0: break
        time.sleep(2)
    save(state)
    emit(state)
    domains = len({r.get("domain") for r in store.values() if r.get("domain")})
    print(f"[stop] time budget reached")
    print(f"[final] docs={len(store)} domains={domains} changed={chg_cnt[0]} unchanged={unch_cnt[0]} new={new_cnt[0]}")

if __name__ == "__main__":
    main()

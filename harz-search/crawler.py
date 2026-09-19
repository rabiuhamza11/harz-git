#!/usr/bin/env python3
# HARZ Search v0.1 — Crawler (STEP 2)
# Seeded, capped, robots-respecting. No manual result insertion — only real fetched pages.
import json, re, ssl, sys, time, hashlib, urllib.request, urllib.error, urllib.parse, urllib.robotparser
from html.parser import HTMLParser
from concurrent.futures import ThreadPoolExecutor, as_completed
import threading, os

UA = "HARZSearchBot/0.1 (+https://harz-search.harz.workers.dev)"
MAX_DOC_BYTES = 400_000
MAX_DEPTH = 2
DEFAULT_DOMAIN_CAP = 8
HARZ_HOSTS = {"harz-store.harz.workers.dev","harzpay.harz.workers.dev","super-cloud.harz.workers.dev","harz-exchange.harz.workers.dev","harz-swap.harz.workers.dev","harz-chain-v2.harz.workers.dev","harz-treasury.harz.workers.dev","harz-crypto-wallet.harz.workers.dev","harz-monitor.harz.workers.dev","harz-nemotron.harz.workers.dev","harz-edge-telecom.harz.workers.dev","harz-root-receive.harz.workers.dev","abuja-estate-city.hamzarabiu390.workers.dev"}
BIG_SITES = {"en.wikipedia.org": 25, "developer.mozilla.org": 20, "raw.githubusercontent.com": 20,
             "www.ncbi.nlm.nih.gov": 10, "arxiv.org": 10, "docs.python.org": 10}
BLOCK_DOMAINS = {"facebook.com","twitter.com","x.com","instagram.com","tiktok.com","youtube.com",
                 "google.com","amazon.com","linkedin.com","pinterest.com","whatsapp.com","t.me",
                 "play.google.com","accounts.google.com","doubleclick.net"}
CTX = ssl.create_default_context()
CTX.check_hostname = False
CTX.verify_mode = ssl.CERT_NONE

SEEDS = {
 "HARZ": [
  "https://harz-store.harz.workers.dev","https://harzpay.harz.workers.dev",
  "https://super-cloud.harz.workers.dev","https://harz-exchange.harz.workers.dev",
  "https://harz-swap.harz.workers.dev","https://harz-chain-v2.harz.workers.dev",
  "https://harz-treasury.harz.workers.dev","https://harz-crypto-wallet.harz.workers.dev",
  "https://harz-monitor.harz.workers.dev","https://harz-nemotron.harz.workers.dev",
  "https://harz-edge-telecom.harz.workers.dev","https://harz-root-receive.harz.workers.dev",
  "https://abuja-estate-city.hamzarabiu390.workers.dev",
  "https://rabiuhamza11.github.io/harz-portfolio/harz-super-app.html",
  "https://rabiuhamza11.github.io/harz-portfolio/",
 ],
 "NIGERIA-GOV": [
  "https://www.firs.gov.ng","https://www.cac.gov.ng","https://www.efcc.gov.ng","https://scuml.efcc.gov.ng",
  "https://www.ncc.gov.ng","https://www.cbn.gov.ng","https://www.sec.gov.ng","https://www.nimc.gov.ng",
  "https://www.jamb.gov.ng","https://www.nuc.edu.ng","https://www.waecnigeria.org",
  "https://customs.gov.ng","https://www.education.gov.ng","https://www.health.gov.ng",
  "https://ncdc.gov.ng","https://www.nafdac.gov.ng","https://www.pencom.gov.ng","https://nitda.gov.ng",
  "https://www.lagosstate.gov.ng","https://tarabastate.gov.ng","https://bauchistate.gov.ng",
  "https://www.fmhds.gov.ng","https://www.fct.gov.ng","https://nysc.gov.ng","https://www.immigration.gov.ng",
 ],
 "NIGERIA-NEWS-BUSINESS": [
  "https://punchng.com","https://vanguardngr.com","https://guardian.ng","https://businessday.ng",
  "https://techcabal.com","https://techpoint.africa","https://nairametrics.com","https://www.thenationonlineng.net",
  "https://paystack.com","https://flutterwave.com","https://www.piggyvest.com","https://www.cowrywise.com",
  "https://www.kuda.com","https://moniepoint.com","https://www.jobberman.com",
 ],
 "TECHNOLOGY": [
  "https://developer.mozilla.org","https://web.dev","https://www.python.org","https://docs.python.org",
  "https://nodejs.org","https://nginx.org","https://www.postgresql.org","https://www.sqlite.org",
  "https://www.kernel.org","https://go.dev","https://www.rust-lang.org","https://www.gnu.org",
  "https://httpd.apache.org","https://developer.mozilla.org/en-US/docs/Web/HTTP",
  "https://deno.com","https://vercel.com/docs","https://developers.cloudflare.com/workers/",
  "https://developers.google.com/web","https://news.ycombinator.com","https://hackernoon.com",
  "https://www.smashingmagazine.com","https://css-tricks.com","https://www.digitalocean.com/community/tutorials",
 ],
 "EDUCATION": [
  "https://www.khanacademy.org","https://openstax.org","https://ocw.mit.edu","https://nptel.ac.in",
  "https://en.wikipedia.org/wiki/Main_Page","https://www.britannica.com","https://www.edx.org",
  "https://www.coursera.org","https://simple.wikipedia.org",
 ],
 "SCIENCE": [
  "https://www.nasa.gov","https://science.nasa.gov","https://spaceplace.nasa.gov","https://arxiv.org",
  "https://pubmed.ncbi.nlm.nih.gov","https://www.noaa.gov","https://www.usgs.gov","https://www.esa.int",
  "https://www.scientificamerican.com","https://science.howstuffworks.com","https://www.iau.org",
 ],
 "OPEN-SOURCE": [
  "https://raw.githubusercontent.com/rabiuhamza11/harz-git/main/README.md",
  "https://raw.githubusercontent.com/sindresorhus/awesome/main/readme.md",
  "https://raw.githubusercontent.com/torvalds/linux/master/README",
  "https://github.com/rabiuhamza11",
  "https://sourceforge.net","https://www.apache.org","https://www.mozilla.org",
  "https://www.eff.org","https://letsencrypt.org","https://www.openstreetmap.org","https://www.torproject.org",
  "https://www.raspberrypi.com","https://www.arduino.cc",
 ],
}

STOPWORDS_EN = set("the a an of in on for to and or is are was were be been with as at by from this that it its".split())

class PageParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.title = ""; self._in_title = False; self._skip = 0
        self.text_parts = []; self.links = []
    def handle_starttag(self, tag, attrs):
        if tag in ("script","style","noscript","svg","nav","footer","form"): self._skip += 1
        if tag == "title": self._in_title = True
        if tag == "a" and self._skip == 0:
            for k, v in attrs:
                if k == "href" and v: self.links.append(v)
    def handle_endtag(self, tag):
        if tag in ("script","style","noscript","svg","nav","footer","form") and self._skip: self._skip -= 1
        if tag == "title": self._in_title = False
    def handle_data(self, data):
        if self._in_title: self.title += data
        elif self._skip == 0:
            t = data.strip()
            if t: self.text_parts.append(t)

def norm_url(u, base=None):
    try:
        if base: u = urllib.parse.urljoin(base, u)
        p = urllib.parse.urlsplit(u)
        if p.scheme not in ("http","https"): return None
        host = (p.hostname or "").lower()
        if not host: return None
        if host.startswith("www."): host = host[4:]
        path = p.path or "/"
        if len(path) > 1 and path.endswith("/"): path = path[:-1]
        # drop junk query params
        q = [(k,v) for k,v in urllib.parse.parse_qsl(p.query) if not k.lower().startswith(("utm_","fbclid","gclid","ref"))]
        q.sort()
        query = urllib.parse.urlencode(q) if q else ""
        return urllib.parse.urlunsplit((p.scheme, host if ":" not in host else f"[{host}]", path, query, ""))
    except Exception:
        return None

def reg_domain(host):
    host = host.lower()
    if host.startswith("www."): host = host[4:]
    # multi-tenant hosts: each tenant IS an independent domain
    for suffix in (".workers.dev", ".github.io", ".gitbook.io", ".vercel.app", ".netlify.app"):
        if host.endswith(suffix):
            return host  # e.g. harz-store.harz.workers.dev is its own domain
    parts = host.split(".")
    if len(parts) >= 3 and parts[-2] in ("com","org","net","edu","gov","co"):
        return ".".join(parts[-3:])
    return ".".join(parts[-2:]) if len(parts) >= 2 else host

class Crawler:
    def __init__(self):
        self.docs = []; self.lock = threading.Lock()
        self.seen_urls = set(); self.seen_hashes = {}
        self.domain_counts = {}; self.domain_robots = {}
        self.queue = []; self.new_domains = 0
        self.errors = []
        self.categories = {}  # domain -> category
        for cat, urls in SEEDS.items():
            for u in urls:
                nu = norm_url(u)
                if nu:
                    self.queue.append((nu, 0, cat))
                    self.seen_urls.add(nu)
                    host = urllib.parse.urlsplit(nu).hostname
                    self.categories[reg_domain(host)] = cat

    def cap(self, host):
        rd = reg_domain(host)
        base = DEFAULT_DOMAIN_CAP
        if host in HARZ_HOSTS: base = 8
        limit = BIG_SITES.get(host, BIG_SITES.get(rd, base))
        with self.lock:
            return self.domain_counts.get(rd, 0) < limit, limit

    def robots_ok(self, url):
        try:
            p = urllib.parse.urlsplit(url)
            host = p.hostname
            rd = reg_domain(host)
            with self.lock:
                if rd in self.domain_robots: rp = self.domain_robots[rd]
                else:
                    rp = None
            if rp is None:
                rp = urllib.robotparser.RobotFileParser()
                try:
                    req = urllib.request.Request(f"{p.scheme}://{host}/robots.txt", headers={"User-Agent": UA})
                    with urllib.request.urlopen(req, timeout=8, context=CTX) as r:
                        rp.parse(r.read(60_000).decode("utf-8", "ignore").splitlines())
                except Exception:
                    rp.allow_all = True
                with self.lock:
                    self.domain_robots[rd] = rp
            return rp.can_fetch(UA, url)
        except Exception:
            return True

    def fetch(self, url):
        chain = []
        cur = url
        for _ in range(6):
            req = urllib.request.Request(cur, headers={"User-Agent": UA, "Accept": "text/html,text/plain,*/*"})
            try:
                with urllib.request.urlopen(req, timeout=14, context=CTX) as r:
                    final = r.geturl()
                    if final and norm_url(final) != norm_url(cur): chain.append(norm_url(cur))
                    ctype = (r.headers.get("Content-Type") or "").lower()
                    if "html" not in ctype and "text/plain" not in ctype and ctype: return None, chain, "bad-type"
                    body = r.read(MAX_DOC_BYTES)
                    return body, chain, None
            except urllib.error.HTTPError as e:
                if 300 <= e.code < 400 and e.headers.get("Location"):
                    cur = norm_url(e.headers["Location"], cur) or cur; continue
                return None, chain, f"http-{e.code}"
            except Exception as e:
                return None, chain, type(e).__name__
        return None, chain, "redirect-loop"

    def process(self, url, depth, cat):
        host = urllib.parse.urlsplit(url).hostname or ""
        ok, limit = self.cap(host)
        if not ok: return
        if not self.robots_ok(url): return
        body, chain, err = self.fetch(url)
        with self.lock:
            if err and not body:
                self.errors.append(f"{err} {url}")
                return
        raw = body.decode("utf-8", "ignore")
        parser = PageParser()
        try: parser.feed(raw)
        except Exception: pass
        title = re.sub(r"\s+", " ", parser.title).strip()[:200]
        text = re.sub(r"\s+", " ", " ".join(parser.text_parts)).strip()
        if len(text) < 120 and not raw.lstrip().lower().startswith(("#",)):  # skip near-empty shells unless raw docs
            if len(text) < 60: return
        chash = hashlib.sha256(text.encode()).hexdigest()
        with self.lock:
            if chash in self.seen_hashes:
                return
            self.seen_hashes[chash] = url
            self.domain_counts[reg_domain(host)] = self.domain_counts.get(reg_domain(host), 0) + 1
        # language heuristic
        sample = text[:500].lower()
        en_hits = sum(1 for w in STOPWORDS_EN if w in sample)
        lang = "en" if (en_hits >= 3 and text.isascii() is False or en_hits >= 2) else ("en" if en_hits >= 2 else "other")
        # normalized outbound links (schema field + discovery source)
        norm_links = []
        for l in parser.links[:80]:
            nu = norm_url(l, url)
            if nu and nu not in norm_links: norm_links.append(nu)
        doc = {
            "id": len(self.docs),
            "url": url, "title": title or url.rsplit("/",1)[-1] or url,
            "text": text[:6000], "links": norm_links[:15],
            "fetched_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "content_hash": chash, "language": lang,
            "source": cat, "domain": reg_domain(host), "redirect_chain": chain,
        }
        with self.lock:
            self.docs.append(doc)
            if len(self.docs) % 100 == 0:
                self.flush()
        # discover links
        if depth < MAX_DEPTH:
            newq = []
            for l in parser.links[:60]:
                nu = norm_url(l, url)
                if not nu: continue
                lh = urllib.parse.urlsplit(nu).hostname or ""
                rd = reg_domain(lh)
                if any(b == rd or rd.endswith("." + b) for b in BLOCK_DOMAINS): continue
                with self.lock:
                    if nu in self.seen_urls: continue
                    self.seen_urls.add(nu)
                lcat = self.categories.get(rd, cat)
                ok2, _ = self.cap(lh)
                if ok2 or rd == reg_domain(host):
                    newq.append((nu, depth+1, lcat))
            with self.lock:
                self.queue.extend(newq[:12])

    def flush(self):
        with open("corpus/docs.jsonl", "w") as f:
            for d in self.docs: f.write(json.dumps(d) + "\n")
        with open("corpus/crawl-stats.json", "w") as f:
            json.dump({"documents": len(self.docs), "domains": len(self.domain_counts),
                       "per_domain": self.domain_counts, "errors": len(self.errors),
                       "error_sample": self.errors[:30]}, f, indent=1)

    def run(self, target=1500, workers=24, minutes=12):
        os.makedirs("corpus", exist_ok=True)
        t0 = time.time()
        ex = ThreadPoolExecutor(max_workers=workers)
        futures = set()
        while True:
            # drain finished futures
            for f in list(futures):
                if f.done():
                    f.exception()
                    futures.remove(f)
            # submit while capacity allows
            while futures and len(futures) >= workers * 4:
                break
            submitted = 0
            while submitted < 8 and self.queue and len(futures) < workers * 4:
                u, d, c = self.queue.pop(0)
                futures.add(ex.submit(self.process, u, d, c))
                submitted += 1
            if not futures and not self.queue:
                break
            if len(self.docs) >= target:
                break
            if time.time() - t0 > minutes * 60:
                break
            time.sleep(0.4)
            el = int(time.time() - t0)
            if el % 15 == 0:
                print(f"[{el}s] docs={len(self.docs)} domains={len(self.domain_counts)} queued={len(self.queue)} active={len(futures)}", flush=True)
        for f in futures: f.exception()
        ex.shutdown(wait=True)
        self.flush()
        print(f"DONE docs={len(self.docs)} domains={len(self.domain_counts)}", flush=True)

if __name__ == "__main__":
    Crawler().run(target=int(sys.argv[1]) if len(sys.argv) > 1 else 1500)

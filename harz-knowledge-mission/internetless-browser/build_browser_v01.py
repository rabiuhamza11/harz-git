import json, hashlib, string, re, sys, os

DUMP = "evacuation/d1/harz-corpus-bodies-db.sql"
PFXB = b"INSERT OR IGNORE INTO bodies VALUES('"

def extract_bodies(want):
    HEX = set(string.hexdigits.encode())
    data = open(DUMP, "rb").read()
    starts = []
    i = data.find(PFXB)
    while i != -1:
        if (i == 0 or data[i-1] == 0x0A) and all(b in HEX for b in data[i+37:i+101]) and data[i+101:i+104] == b"','":
            starts.append(i)
        i = data.find(PFXB, i + 1)
    out = {}
    for n, st in enumerate(starts):
        h = data[st+37:st+101].decode()
        if h not in want: continue
        end = starts[n+1] if n + 1 < len(starts) else len(data)
        stmt = data[st:end]
        assert stmt[-4:] == b"');\n", "bad tail at " + h
        out[h] = stmt[104:-4].replace(b"''", b"'").decode("utf-8")
    return out

def norm(url):
    u = url.strip().lower()
    u = re.sub(r"^https?://", "", u)
    u = re.sub(r"^www\.", "", u)
    u = u.split("#")[0]
    if len(u) > 0 and u[-1] == "/": u = u[:-1]
    return u

def main():
    vol1 = json.load(open("evacuation/VOLUME-SET-CONTENT-MANIFEST.json"))["pages"]["1"]
    urlmap = json.load(open("evacuation/vol1-url-map.json"))
    extra = json.load(open("evacuation/news-extra-pages.json"))
    want = {p["content_hash"] for p in vol1} | {p["content_hash"] for p in extra}
    bodies = extract_bodies(want)
    missing = want - set(bodies)
    if missing:
        print("FAIL-CLOSED: missing bodies:", len(missing)); sys.exit(1)
    docs = []
    for p in vol1:
        docs.append({"h": p["content_hash"], "d": p["domain"], "t": p["title"],
                      "u": urlmap.get(p["content_hash"], ""), "x": bodies[p["content_hash"]]})
    for p in extra:
        docs.append({"h": p["content_hash"], "d": p["domain"], "t": p["title"],
                      "u": p["url"], "x": bodies[p["content_hash"]]})
    bad = [d for d in docs if hashlib.sha256(d["x"].encode()).hexdigest() != d["h"]]
    if bad:
        print("FAIL-CLOSED: sha mismatch:", len(bad)); sys.exit(1)
    print("verified docs:", len(docs), "| bad:", len(bad))

    SHELL = open("evacuation/browser_shell_v01.html", encoding="utf-8").read()
    blob = json.dumps(docs, separators=(",", ":"), ensure_ascii=False, sort_keys=True)
    blob = blob.replace("</", "<\\/")
    ridx = {}
    for i, d in enumerate(docs):
        if d["u"]:
            ridx[norm(d["u"])] = i
    rblob = json.dumps(ridx, separators=(",", ":"), ensure_ascii=False, sort_keys=True)
    html = SHELL.replace("__DOC_BLOB__", blob).replace("__RIDX_BLOB__", rblob)
    html = html.replace("__DOCS_COUNT__", str(len(docs))).replace("__DOMAINS_COUNT__", str(len(set(d["d"] for d in docs))))
    open("evacuation/INTERNETLESS-BROWSER-v0.1.html", "w", encoding="utf-8").write(html)
    print("artifact:", len(html.encode()), "bytes")
    h1 = hashlib.sha256(html.encode()).hexdigest()
    html2 = SHELL.replace("__DOC_BLOB__", blob).replace("__RIDX_BLOB__", rblob)
    html2 = html2.replace("__DOCS_COUNT__", str(len(docs))).replace("__DOMAINS_COUNT__", str(len(set(d["d"] for d in docs))))
    print("artifact sha256:", h1)
    print("deterministic:", hashlib.sha256(html2.encode()).hexdigest() == h1)

if __name__ == "__main__":
    main()

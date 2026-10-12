#!/usr/bin/env python3
"""FX index builder v2 — clean rebuild with process isolation.
Fixes v1's shared-tmpfile collision (three bands wrote the same _q{N}.json,
corrupting each other's queries and checkpoints). v2: per-process unique
query files (band+pid+counter+uuid) and a pre-insert rowid existence guard
so re-runs are idempotent — no duplicate postings, ever.
rowid = corpus_id*64 + part; contentless FTS5 stores NO text (zero duplication)."""
import json, subprocess, sys, time, os

TOK = subprocess.check_output(["printenv","CLOUDFLARE_API_TOKEN"]).decode().strip()
A1 = "5ab9477c8379d6dcb1a8b5183484aeae"
MC = "ea622de9-44a6-499e-8839-a42cd5a690d5"
IDX = "389b1bdf-c3d7-4265-9399-d023a7c506df"
BAND = int(sys.argv[1])
BANDS = [(1, 450001), (450001, 900001), (900001, 99999999)]
LO, HI = BANDS[BAND]
TARGET = 650_000
STMT_CAP = 88_000
LOG = f"/tmp/fxidx/b{BAND}.log"
PID = os.getpid()
QN = 0

def api(db, sql, tries=4):
    global QN; QN += 1
    fp = f"/tmp/fxidx/q_{BAND}_{PID}_{QN}.json"
    with open(fp, "w") as f: json.dump({"sql": sql}, f)
    for a in range(tries):
        r = subprocess.run(["curl","-s","-m","120","-X","POST",
            f"https://api.cloudflare.com/client/v4/accounts/{A1}/d1/database/{db}/query",
            "-H",f"Authorization: Bearer {TOK}","-H","Content-Type: application/json",
            "--data-binary",f"@{fp}"], capture_output=True, text=True)
        try:
            d = json.loads(r.stdout)
            if d.get("success"): os.unlink(fp); return d["result"][0]["results"]
            errs = d.get("errors") or []
            if a == tries-1: os.unlink(fp); return {"__error": str(errs)[:150]}
        except Exception:
            if a == tries-1: os.unlink(fp); return {"__error": "no json"}
        time.sleep(1.5*(a+1))
    return {"__error": "exhausted"}

def log(m):
    with open(LOG, "a") as f: f.write(f"[{time.strftime('%H:%M:%S')}] {m}\n")

def meta_set(k, v): api(IDX, f"INSERT OR REPLACE INTO meta (key,value) VALUES ('{k}','{str(v)[:90000]}')")
def meta_get(k):
    r = api(IDX, f"SELECT value FROM meta WHERE key='{k}'")
    return r[0]["value"] if isinstance(r, list) and r else None

def esc(s): return (s or "").replace("\x00"," ").replace("'","''")

def parts_of(text):
    if len(text.encode("utf-8")) <= 85_000: return [text]
    out, cur, curb = [], [], 0
    for w in text.split(" "):
        wb = len(w.encode("utf-8")) + (1 if cur else 0)
        if cur and curb + wb > 85_000:
            out.append(" ".join(cur)); cur, curb = [w], len(w.encode("utf-8"))
        else:
            cur.append(w); curb += wb
    if cur: out.append(" ".join(cur))
    return out[:64] or [text]

last = int(meta_get(f"band{BAND}_last_id") or (LO-1))
total_docs = int(meta_get(f"band{BAND}_docs") or 0)
total_bytes = int(meta_get(f"band{BAND}_bytes") or 0)
skipped = json.loads(meta_get(f"band{BAND}_skipped") or "[]")
log(f"START v2 band {BAND} range {LO}-{HI} from id>{last} (docs {total_docs}, bytes {total_bytes}, skipped {len(skipped)})")

batch_n = 0
while True:
    proj = api(MC, f"SELECT id, size FROM docs WHERE id > {last} AND id < {HI} ORDER BY id LIMIT 500")
    if not isinstance(proj, list) or not proj:
        if isinstance(proj, dict) and proj.get("__error"): log(f"proj fail: {proj}"); time.sleep(2); continue
        log("no more docs in band"); break
    win, acc = [], 0
    for r in proj:
        win.append(r["id"]); acc += r["size"] or 1
        if acc >= TARGET: break
    end_id = win[-1]
    idlist = ",".join(str(i) for i in win)
    rows = api(MC, f"SELECT id, text FROM docs WHERE id IN ({idlist})")
    if not isinstance(rows, list):
        log(f"read fail ids {win[0]}-{end_id}: {rows}"); time.sleep(2); continue
    rows = {r["id"]: r["text"] for r in rows}
    # build (rowid, frag) list
    items = []
    for i in win:
        text = rows.get(i)
        if text is None: skipped.append([i, "missing_text"]); continue
        text = text.replace("\x00", " ")
        for p, part in enumerate(parts_of(text)):
            rid = i*64 + p
            items.append([rid, f"({rid},'{esc(part)}')"])
    # group into <=88KB statements
    stmts, cur, curb = [], [], 0
    for rid, frag in items:
        fl = len(frag.encode("utf-8"))
        if cur and curb + fl > STMT_CAP:
            stmts.append((cur, curb)); cur, curb = [ (rid,frag) ], fl
        else:
            cur.append((rid,frag)); curb += fl
    if cur: stmts.append((cur, curb))
    # execute with idempotency guard: skip rowids already in index
    err_n = 0; skipped_dup = 0
    for rids_frags, _ in stmts:
        rids = ",".join(str(x[0]) for x in rids_frags)
        ex = api(IDX, f"SELECT rowid FROM fx_fts WHERE rowid IN ({rids})")
        if not isinstance(ex, list):
            log(f"guard fail near {rids_frags[0][0]//64}: {ex}"); err_n += 1; continue
        have = set(x["rowid"] for x in ex)
        todo = [f for rid, f in rids_frags if rid not in have]
        skipped_dup += len(rids_frags) - len(todo)
        if not todo: continue
        res = api(IDX, "INSERT INTO fx_fts (rowid, text) VALUES " + ",".join(todo))
        if isinstance(res, dict) and (res.get("__error") or res.get("__fatal")):
            err_n += 1
            log(f"insert fail near id~{rids_frags[0][0]//64}: {str(res)[:120]}")
    total_docs += len(win)
    total_bytes += acc
    last = end_id
    batch_n += 1
    meta_set(f"band{BAND}_last_id", last)
    meta_set(f"band{BAND}_docs", total_docs)
    meta_set(f"band{BAND}_bytes", total_bytes)
    if skipped and len(skipped) < 500: meta_set(f"band{BAND}_skipped", json.dumps(skipped[-200:]))
    if batch_n % 10 == 0:
        log(f"progress: id {last} | docs {total_docs} | {total_bytes/1e6:.0f}MB | err {err_n} | dup-skip {skipped_dup}")
    if len(proj) < 500 and end_id >= proj[-1]["id"] and acc < TARGET:
        nxt = api(MC, f"SELECT id FROM docs WHERE id > {last} AND id < {HI} ORDER BY id LIMIT 1")
        if not (isinstance(nxt, list) and nxt): log("band complete"); break

log(f"END band {BAND}: docs {total_docs} bytes {total_bytes} skipped {len(skipped)} last {last}")
meta_set(f"band{BAND}_status", "done")

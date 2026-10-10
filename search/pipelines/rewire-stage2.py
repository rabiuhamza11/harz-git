#!/usr/bin/env python3
"""Stage 2 rewire: update search rows (content_hash + clean snippet) for hunted docs.
Resumable: skips rows already pointing at the target hash. Batch size kept under D1 limits."""
import json, os, urllib.request, sys
AID="5ab9477c8379d6dcb1a8b5183484aeae"; T=os.environ["CLOUDFLARE_API_TOKEN_3"]
SDB="3f84cac4-766d-48c9-afab-f8795c8fcd31"; CDB="ea622de9-44a6-499e-8839-a42cd5a690d5"
def d1(db, sql, params=None):
    body={"sql": sql}
    if params: body["params"]=params
    req = urllib.request.Request(f"https://api.cloudflare.com/client/v4/accounts/{AID}/d1/database/{db}/query",
        data=json.dumps(body).encode(), headers={"Authorization": f"Bearer {T}","Content-Type":"application/json"})
    r = json.load(urllib.request.urlopen(req, timeout=180))
    if not r.get('success'): raise Exception(str(r['errors'])[:300])
    return r['result'][0]['results']

rewire = json.load(open('stage2-rewire-list.json'))
print(f"rewire list: {len(rewire)}", flush=True)
updated = skipped = missing = 0
B = 80
for i in range(0, len(rewire), B):
    batch = rewire[i:i+B]
    # current hashes of these sids
    sids = [b[0] for b in batch]
    q = f"SELECT id, content_hash FROM docs WHERE id IN ({','.join('?'*len(sids))})"
    cur = {r['id']: r['content_hash'] for r in d1(SDB, q, sids)}
    # hashes still needing update + snippet fetch from corpus
    need = [(sid, url, h) for sid, url, h in batch if cur.get(sid) != h]
    for sid, url, h in [n for n in need]:
        row = d1(CDB, "SELECT substr(text,1,2000) snip FROM docs WHERE content_hash = ?", [h])
        if not row:
            missing += 1; continue
        d1(SDB, "UPDATE docs SET content_hash = ?, snippet_text = ? WHERE id = ?", [h, row[0]['snip'], sid])
        updated += 1
    skipped += len(batch) - len(need)
    if (i // B) % 10 == 0:
        print(f"  {i+len(batch)}/{len(rewire)} updated={updated} skipped={skipped} missing={missing}", flush=True)
print(f"REWIRE DONE. updated={updated} skipped={skipped} missing={missing}", flush=True)

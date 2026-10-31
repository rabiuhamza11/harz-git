import hashlib, json, os, urllib.request, urllib.error

B = 'https://harz-hcie.harz.workers.dev'
UA = {'User-Agent': 'harz-acceptance/1.0'}
T = os.environ['CLOUDFLARE_API_TOKEN_3']
A = '5ab9477c8379d6dcb1a8b5183484aeae'
DB = 'ceaea454-b5c3-4a8a-91d2-5620d41c6daf'

def post(p, b):
    r = urllib.request.Request(B + p, data=json.dumps(b).encode(), headers={**UA, 'Content-Type': 'application/json'})
    try:
        return json.load(urllib.request.urlopen(r, timeout=60))
    except urllib.error.HTTPError as e:
        return {'http': e.code, 'body': e.read().decode()[:200]}

def get(p):
    return json.load(urllib.request.urlopen(urllib.request.Request(B + p, headers=UA), timeout=60))

def q(sql, params=None):
    body = {'sql': sql}
    if params: body['params'] = params
    r = urllib.request.Request(f'https://api.cloudflare.com/client/v4/accounts/{A}/d1/database/{DB}/query',
                              data=json.dumps(body).encode(),
                              headers={'Authorization': f'Bearer {T}', 'Content-Type': 'application/json'})
    return json.load(urllib.request.urlopen(r, timeout=60))['result'][0]

def sha(t): return hashlib.sha256(t.encode()).hexdigest()

res = []
def check(n, cond, detail):
    res.append((n, bool(cond), detail))
    print(('PASS  ' if cond else 'FAIL  ') + n + '  |  ' + str(detail)[:200])

# ---------- baseline ----------
base_objs = {r['id']: (r['canonical_sha256'], r['bytes']) for r in
             q("SELECT id, canonical_sha256, bytes FROM hcie_objects WHERE id IN (28,29)")['results']}
base_total_objs = q("SELECT COUNT(*) c FROM hcie_objects")['results'][0]['c']
base_contribs = q("SELECT COUNT(*) c FROM hcie_contributions")['results'][0]['c']
base_states = {r['state']: r['c'] for r in q("SELECT state, COUNT(*) c FROM hcie_contributions GROUP BY state")['results']}
base_queue = get('/api/hcie/queue?state=QUEUED')['count']
print('BASELINE objects', base_total_objs, '| contributions', base_contribs, base_states, '| queue', base_queue)

created = []
review_rows = []

# ---------- T1: same title, different text -> visible collision ----------
t1_text = 'AUDIT-280 claim one: the Gembu road is passable for light vehicles today.'
r1 = post('/api/hcie/contribute', {'author': 'AuditOne', 'device': 'audit-one',
                                   'title': 'Harz', 'text': t1_text, 'sha256': sha(t1_text)})
created.append(r1.get('id'))
q1 = get('/api/hcie/queue?state=QUEUED')
item1 = next((i for i in q1['items'] if i['id'] == r1.get('id')), None)
cols = item1['collisions'] if item1 else []
obj_ids = sorted([c['object_id'] for c in cols])
check('1a same title + different text is flagged', item1 is not None and item1['collision_count'] >= 2,
      'collision_count=%s items=%s' % (item1['collision_count'] if item1 else None, q1['count']))
check('1b collision names the published objects 28 and 29', obj_ids == [28, 29], obj_ids)
check('1c collision carries author and publication status',
      all(c['status'] == 'PUBLISHED' and c['author'] in ('Cele', 'Hamza') for c in cols),
      [(c['status'], c['author']) for c in cols])
check('1d both texts available for comparison',
      all(len(c['preview']) > 10 for c in cols) and len(item1['text']) > 10,
      'previews=%s own=%s bytes' % ([len(c['preview']) for c in cols], len(item1['text'])))

# ---------- T2: same title + identical text -> attribution preserved ----------
orig = q("SELECT id, author, actual_sha256, text FROM hcie_contributions WHERE id='C-842d2ec5d9eab29b'")['results'][0]
r2 = post('/api/hcie/contribute', {'author': 'AuditTwo', 'device': 'audit-two',
                                   'title': 'Harz', 'text': orig['text'], 'sha256': orig['actual_sha256']})
check('2a identical text deduplicates content', r2.get('duplicate') is True and r2.get('id') == orig['id'], r2.get('id'))
check('2b submission says its provenance was recorded', r2.get('attribution_recorded') is True, r2.get('note', '')[:80])
row = q("SELECT id, reviewer, note FROM hcie_reviews WHERE contribution_id=? AND action='ALREADY_SUBMITTED_BY' AND reviewer='AuditTwo'",
        [orig['id']])['results']
review_rows.append(('C-842d2ec5d9eab29b', 'AuditTwo'))
ok_note = bool(row) and 'audit-two' in row[0]['note'] and 'identical bytes' in row[0]['note']
check('2c author, device and time preserved on the duplicate', ok_note, row[0]['note'][:150] if row else 'no row')
check('2d original author untouched by the later submission',
      q("SELECT author FROM hcie_contributions WHERE id=?", [orig['id']])['results'][0]['author'] == 'Cele',
      q("SELECT author FROM hcie_contributions WHERE id=?", [orig['id']])['results'][0]['author'])

# ---------- T3: three phones, identical text -> three attributable submissions ----------
t3_text = 'AUDIT-280 claim epsilon: the bridge at the second culvert is open again as of this morning.'
phones = [('PhoneA', 'audit-a'), ('PhoneB', 'audit-b'), ('PhoneC', 'audit-c')]
r3 = [post('/api/hcie/contribute', {'author': a, 'device': d, 'title': 'AUDIT-280 three phones',
                                    'text': t3_text, 'sha256': sha(t3_text)}) for a, d in phones]
created.append(r3[0].get('id'))
id3 = r3[0]['id']
rev3 = q("SELECT action, reviewer FROM hcie_reviews WHERE contribution_id=? ORDER BY id", [id3])['results']
submitters = [x['reviewer'] for x in rev3]
check('3a one content row only', q("SELECT COUNT(*) c FROM hcie_contributions WHERE id=?", [id3])['results'][0]['c'] == 1, id3)
attributed = [a for a, _ in phones if any(r['reviewer'] == a or ('submitted by ' + a) in (r.get('note') or '') for r in
    q("SELECT reviewer, note FROM hcie_reviews WHERE contribution_id=?", [id3])['results'])]
check('3b three attributable submissions recorded', sorted(attributed) == ['PhoneA', 'PhoneB', 'PhoneC'], attributed)
devs = [d for _, d in phones if q("SELECT COUNT(*) c FROM hcie_reviews WHERE contribution_id=? AND note LIKE ?", [id3, '%device ' + d + '%'])['results'][0]['c'] == 1]
check('3c devices preserved distinctly', sorted(devs) == ['audit-a', 'audit-b', 'audit-c'], devs)

# ---------- T4: existing published objects unchanged ----------
now_objs = {r['id']: (r['canonical_sha256'], r['bytes']) for r in
            q("SELECT id, canonical_sha256, bytes FROM hcie_objects WHERE id IN (28,29)")['results']}
check('4a objects 28 and 29 byte-identical', now_objs == base_objs, now_objs)
check('4b no new objects created by submissions', q("SELECT COUNT(*) c FROM hcie_objects")['results'][0]['c'] == base_total_objs,
      q("SELECT COUNT(*) c FROM hcie_objects")['results'][0]['c'])
check('4c still no v2 objects for those titles',
      q("SELECT COUNT(*) c FROM hcie_objects WHERE version>1 AND source_key LIKE 'contribution:%'")['results'][0]['c'] == 0,
      'contribution objects above v1: %s' % q("SELECT COUNT(*) c FROM hcie_objects WHERE version>1 AND source_key LIKE 'contribution:%'")['results'][0]['c'])

# ---------- T5: disagreement distinguishable from duplication ----------
t2_item = next((i for i in q1['items'] if i['id'] == orig['id']), None)
check('5a disagreement path carries differing hashes',
      all(c['hash'] != item1['actual_sha256'][:16] for c in cols) and item1['collision_count'] > 0,
      'distinct hashes=%s' % len({c['hash'] for c in cols}))
check('5b duplication path carries no collision but shows co-submitters',
      (t2_item is None) or (t2_item['collision_count'] == 0 and len(t2_item.get('also_submitted_by', [])) >= 1),
      'collisions=%s also=%s' % (t2_item['collision_count'] if t2_item else 'n/a',
                                 len(t2_item.get('also_submitted_by', [])) if t2_item else 'n/a'))

# ---------- T6: nothing silently discarded ----------
subs = 3 + 1 + 2   # three phone submissions, AuditTwo's duplicate, plus the two substantive test posts (T1 + T3 original)
rec_a = q("SELECT COUNT(*) c FROM hcie_reviews WHERE contribution_id=? AND action='ALREADY_SUBMITTED_BY'", [id3])['results'][0]['c']
check('6a every duplicate left a record (3-phone case)', rec_a == 2, 'duplicate rows=%s' % rec_a)
check('6b AuditTwo left a record', len(row) >= 1, 'rows=%s' % len(row))
check('6c total submissions sent vs records anchored',
      q("SELECT COUNT(*) c FROM hcie_reviews WHERE contribution_id IN (?,?,?)", [id3, r1.get('id'), orig['id']])['results'][0]['c'] >= 5,
      q("SELECT COUNT(*) c FROM hcie_reviews WHERE contribution_id IN (?,?,?)", [id3, r1.get('id'), orig['id']])['results'][0]['c'])

# ---------- T7: counts reconcile ----------
st = {r['state']: r['c'] for r in q("SELECT state, COUNT(*) c FROM hcie_contributions GROUP BY state")['results']}
queued_rows = st.get('QUEUED', 0)
qz = get('/api/hcie/queue?state=QUEUED')
check('7a queue endpoint matches QUEUED rows', qz['count'] == queued_rows, 'endpoint=%s rows=%s' % (qz['count'], queued_rows))
check('7b published count unchanged', st.get('PUBLISHED', 0) == base_states.get('PUBLISHED', 0),
      '%s vs %s' % (st.get('PUBLISHED'), base_states.get('PUBLISHED')))
check('7c contribution total grew only by this audit\'s test rows', sum(st.values()) == base_contribs + len(created),
      'total=%s base=%s new=%s' % (sum(st.values()), base_contribs, len(created)))
check('7d published objects still reconcile to manifest',
      q("SELECT COUNT(*) c FROM hcie_objects WHERE verified=1")['results'][0]['c'] == get('/api/hcie/manifest')['count'],
      'objects=%s manifest=%s' % (q("SELECT COUNT(*) c FROM hcie_objects WHERE verified=1")['results'][0]['c'], get('/api/hcie/manifest')['count']))

json.dump({'created': created, 'orig': orig['id'], 'review_rows': review_rows}, open('acceptance_280_ids.json', 'w'), indent=1)
passed = sum(1 for _, ok, _ in res if ok)
print('\nACCEPTANCE: %s/%s passed' % (passed, len(res)))

// G20 ROLE-VERIFIER — reconstructs the richer topology from sealed state and
// measures whether the SEALED VALUES commit to the role assignment.
// Generalizes the G19 min-verifier: free evidence length, resolves_conflict
// re-derived as evidence-minus-resolver (executor law 9085), cross-record
// edge as conflict-shas SUBSET of resolves-shas, executor law
// resolution_from ⊆ evidence_from (9081), G19 acceptance laws.
// No repair path. Zero env reads. Exit 1 on any failure.

const crypto = require('crypto');
const fs = require('fs');
const { visDecodePng, imgReadMetadata } = require('./frozen-reader.js');
const sha256 = (s) => crypto.createHash('sha256').update(s, 'utf8').digest('hex');
function claimsOf(answer) {
  const AM = '**Answer**\n\n';
  if (typeof answer !== 'string' || !answer.startsWith(AM)) return null;
  const rest = answer.slice(AM.length);
  const si = rest.indexOf('\n\nSources: ');
  const ci = rest.indexOf('\n\nCONFIDENCE: ');
  const end = (si >= 0 && (ci < 0 || si < ci)) ? si : ci;
  if (end < 0) return null;
  return rest.slice(0, end);
}

async function main() {
  const st = JSON.parse(fs.readFileSync(process.argv[2] || __dirname + '/sealed-state.json', 'utf8'));
  const R = [];
  const pass = m => R.push(['PASS', m]); const fail = m => R.push(['FAIL', m]);
  const need = (c, m) => { if (!c) throw new Error('ESSENTIAL STATE MISSING: ' + m); };
  const M1 = st.records.conflict_mission, M2 = st.records.resolution_mission;
  need(st.origin && M1 && M2, 'records');

  // ---- receipts recomputed from content ----
  const rec = {};
  for (const [name, M] of [['conflict', M1], ['resolution', M2]]) {
    rec[name] = [];
    for (const t of M.tasks) {
      if (t.state === 'verified' && t.type === 'fixture') {
        need(t.fixture_id && typeof t.answer === 'string', name + ' fixture ' + t.id);
        rec[name].push(await sha256('verified:fixture:' + t.fixture_id + ':' + await sha256(t.answer)));
      } else if (t.state === 'refused') {
        need(typeof t.refusal === 'string', name + ' refusal ' + t.id);
        rec[name].push(await sha256('refused:' + t.refusal));
      } else if (t.state === 'verified' && t.type === 'compose') {
        const dc = t.answer && t.answer.delivered_children && t.answer.delivered_children[0];
        need(dc && dc.mode && dc.player_url, name + ' child');
        t._key = dc.player_url.split('request_id=')[1]; t._mode = dc.mode; M._compose = t;
        rec[name].push(null);
      } else throw new Error('unknown state ' + t.state);
    }
  }
  // ---- role refs ----
  const refused = M1.tasks.find(t => t.state === 'refused');
  const confRefs = refused && refused.conflict ? refused.conflict.unresolved_claims.map(u => u.source_task) : null;
  need(confRefs && confRefs.length >= 2, 'record 1 conflict refs');
  const ct = M2._compose; need(ct.resolution, 'record 2 resolution');
  const rs = ct.resolution;
  const resFrom = rs.resolution_from || [];
  const resSrc = (rs.resolution_sources || []).map(s => s.source_task);
  const resConflict = (rs.resolves_conflict || []).map(c => c.source_task);
  need(ct.answer && Array.isArray(ct.answer.evidence) && ct.answer.evidence.length >= 2, 'evidence order');
  const evOrder = ct.answer.evidence.map(e => e.source_task);
  pass('refs: conflict ' + JSON.stringify(confRefs) + ' | resolver ' + JSON.stringify(resFrom) + ' | resolves ' + JSON.stringify(resConflict) + ' | evidence order ' + JSON.stringify(evOrder));
  // ---- non-hash laws (executor 9081/9085 + acceptance laws) ----
  const subset = resFrom.every(x => evOrder.includes(x));
  subset ? pass('executor law 9081: resolution_from subset of evidence_from') : fail('law 9081 VIOLATED: resolver not in evidence');
  const derivedResolves = evOrder.filter(x => !resFrom.includes(x));
  (JSON.stringify(resConflict) === JSON.stringify(derivedResolves))
    ? pass('executor law 9085: resolves_conflict == evidence minus resolver (derived correctly)')
    : fail('law 9085 INCONSISTENT: recorded resolves ' + JSON.stringify(resConflict) + ' != derived ' + JSON.stringify(derivedResolves));
  (JSON.stringify([...resFrom].sort()) === JSON.stringify([...resSrc].sort()))
    ? pass('acceptance law: resolution_from == resolution_sources') : fail('acceptance law VIOLATED');
  // ---- claims + cross-record edge (subset law for the richer topology) ----
  const taskById = (M, id) => M.tasks.find(t => t.id === id);
  const claimsOfTask = (M, id) => { const s = taskById(M, id); return (s && s.state === 'verified' && typeof s.answer === 'string') ? claimsOf(s.answer) : null; };
  const confShas = [], resShas = [];
  for (const id of confRefs) { const c = claimsOfTask(M1, id); if (!c) { fail('record 1 conflict task ' + id + ' not reconstructible'); } else confShas.push(await sha256(c)); }
  for (const id of resConflict) { const c = claimsOfTask(M2, id); if (!c) { fail('record 2 resolves task ' + id + ' not reconstructible'); } else resShas.push(await sha256(c)); }
  const confSet = confShas.every(s => resShas.includes(s));
  confSet ? pass('cross-record lineage edge: record 1 conflict shas subset of record 2 resolves shas') : fail('cross-record edge BROKEN: conflict shas not all present in resolves');
  // ---- prompt + request_id + artifact ----
  const claimsSeq = [];
  for (const id of evOrder) { const c = claimsOfTask(M2, id); if (!c) { fail('evidence task ' + id + ' claims missing'); } claimsSeq.push(c); }
  const HEADER = '\n\n[VERIFIED MISSION FINDINGS \u2014 claims carried byte-exact from a cited verified task; use but never certify or alter]\n';
  const prompt = ct.instruction + HEADER + claimsSeq.join('\n\n');
  const reqid = (await sha256('create:' + prompt)).slice(0, 24);
  (reqid === ct._key.split('.')[0]) ? pass('request_id derived from prompt == artifact key prefix (SEALED via compose receipt)') : fail('request_id MISMATCH');
  const art = await new Promise((res, rej) => require('https').get(st.origin + '/api/creation/v1/image?request_id=' + encodeURIComponent(ct._key), { headers: { 'User-Agent': 'G20' } }, r => { let d = ''; r.on('data', c => d += c); r.on('end', () => res(JSON.parse(d))); }).on('error', rej));
  const rawLatin1 = Buffer.from(art.image.bytes_b64, 'base64').toString('latin1');
  const artSha = crypto.createHash('sha256').update(Buffer.from(rawLatin1, 'utf8')).digest('hex');
  (artSha === art.image.image_sha256) ? pass('artifact sha via frozen formula') : fail('artifact sha mismatch');
  (await sha256(prompt) === art.receipt.prompt_sha256) ? pass('prompt sha == artifact receipt') : fail('prompt sha mismatch');
  const rd = await visDecodePng(rawLatin1);
  (rd.error) ? fail('frozen reader rejected: ' + rd.error) : pass(`frozen reader accepted ${rd.ihdr.width}x${rd.ihdr.height}`);
  (imgReadMetadata(rawLatin1).length > 0) ? pass('iTXt metadata readable') : fail('iTXt not readable');
  // ---- compose receipt + mission chain seals ----
  rec.resolution[M2.tasks.indexOf(ct)] = await sha256(JSON.stringify([{ mode: ct._mode, request_id: ct._key, artifact_sha256: artSha }]));
  for (const [name, M] of [['conflict', M1], ['resolution', M2]]) {
    let h = await sha256('HARZ-MISSION-1|' + M.id);
    for (const r of rec[name]) h = await sha256(h + ':' + r);
    (h === M.receipt) ? pass(name + ' mission receipt SEAL verified') : fail(name + ' SEAL MISMATCH');
  }
  const fails = R.filter(x => x[0] === 'FAIL');
  for (const [s, m] of R) console.log(s + '  ' + m);
  console.log('\nG20 ROLE-VERIFIER: ' + (fails.length ? 'REFUSED — ' + fails.length + ' violation(s)' : 'VERIFIED — true assignment reconstructs, all seals + laws hold'));
  process.exit(fails.length ? 1 : 0);
}
main().catch(e => { console.error('REFUSED — ' + e.message); process.exit(1); });

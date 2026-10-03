// G21 DESIGNATION-VERIFIER — extends the G20 role-verifier with the
// designation seal: recompute designation bytes from ESSENTIAL state
// (frozen receipt formulas + claims extraction + answer shas) and compare
// against the ORIGIN-EMITTED designation_receipt. Enforces the cross-record
// designation edge (A1). No repair path. Zero env reads.

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
  const R = []; const pass = m => R.push(['PASS', m]); const fail = m => R.push(['FAIL', m]);
  const need = (c, m) => { if (!c) throw new Error('ESSENTIAL STATE MISSING: ' + m); };
  const M1 = st.records.conflict_mission, M2 = st.records.resolution_mission, M3 = st.records.resolution_legitimate_D;
  need(M1 && M2 && M3, 'three records');
  const rec = {};
  for (const [name, M] of [['conflict', M1], ['resolution', M2], ['legitD', M3]]) {
    rec[name] = [];
    for (const t of M.tasks) {
      if (t.state === 'verified' && t.type === 'fixture') rec[name].push(await sha256('verified:fixture:' + t.fixture_id + ':' + await sha256(t.answer)));
      else if (t.state === 'refused') rec[name].push(await sha256('refused:' + t.refusal));
      else if (t.state === 'verified' && t.type === 'compose') { const dc = t.answer.delivered_children[0]; t._key = dc.player_url.split('request_id=')[1]; t._mode = dc.mode; rec[name].push(null); M._compose = t; }
      else throw new Error('unknown state ' + t.state);
    }
  }
  // ---------- recompute DESIGNATION bytes from essential state ----------
  async function checkDesignation(M, name) {
    need(M.designation && M.designation.designation_receipt, name + ' designation_receipt (gate 8: deleted designation = refuse)');
    const tasks = M.tasks;
    const claimsSha = async (id) => { const s = tasks.find(x => x.id === id); const c = claimsOf(s.answer); if (!c) throw new Error(name + ' task ' + id + ' claims not extractable'); return await sha256(c); };
    const ansSha = async (id) => { const s = tasks.find(x => x.id === id); return await sha256(String(s.answer || '')); };
    if (M.designation.role === 'conflict') {
      const confT = tasks.find(t => t.conflict);
      const refs = [];
      for (const u of confT.conflict.unresolved_claims) {
        refs.push({ task: u.source_task, receipt: rec[name][u.source_task - 1], claims_sha256: await claimsSha(u.source_task), answer_sha256: await ansSha(u.source_task) });
      }
      const bytes = JSON.stringify({ law: 'DESIGNATION-BINDING-V1', record: M.id, role: 'conflict', conflict_refs: refs });
      const drec = await sha256('designation:' + M.id + ':' + await sha256(bytes));
      (drec === M.designation.designation_receipt) ? pass(name + ' designation seal VERIFIED (conflict membership bound: ' + JSON.stringify(refs.map(r => r.task)) + ', receipts + claims/answer shas)') : fail(name + ' DESIGNATION SEAL MISMATCH: recomputed ' + drec.slice(0, 12) + ' != origin-emitted ' + M.designation.designation_receipt.slice(0, 12) + ' — a bound identity was tampered');
      return { refs };
    }
    // resolution
    const ct = M._compose; const r = ct.resolution;
    const resFrom = r.resolution_from, resSrc = r.resolution_sources.map(s => s.source_task), resConflict = r.resolves_conflict.map(c => c.source_task);
    const resolver = [];
    for (const s of r.resolution_sources) {
      const src = tasks.find(x => x.id === s.source_task);
      resolver.push({ task: s.source_task, receipt: rec[name][s.source_task - 1], claims_sha256: await claimsSha(s.source_task), answer_sha256: await ansSha(s.source_task), act: { type: src.type || '', instruction: s.source_instruction || src.instruction || '', fixture_id: src.fixture_id || '' } });
    }
    const resolved = [];
    for (const c of r.resolves_conflict) resolved.push({ task: c.source_task, receipt: rec[name][c.source_task - 1], claims_sha256: await claimsSha(c.source_task), answer_sha256: await ansSha(c.source_task) });
    const evidence = [];
    for (const e of ct.answer.evidence) evidence.push({ task: e.source_task, claims_sha256: await claimsSha(e.source_task), answer_sha256: await ansSha(e.source_task) });
    const bytes = JSON.stringify({ law: 'DESIGNATION-BINDING-V1', record: M.id, role: 'resolution', resolver: resolver, resolved: resolved, evidence: evidence });
    const drec = await sha256('designation:' + M.id + ':' + await sha256(bytes));
    (drec === M.designation.designation_receipt) ? pass(name + ' designation seal VERIFIED (resolver ' + JSON.stringify(resFrom) + ' identity fully bound: receipt ' + resolver[0].receipt.slice(0, 10) + ', claims ' + resolver[0].claims_sha256.slice(0, 10) + ', act ' + resolver[0].act.fixture_id + '; resolved ' + JSON.stringify(resConflict) + '; evidence order bound)') : fail(name + ' DESIGNATION SEAL MISMATCH: recomputed ' + drec.slice(0, 12) + ' != origin-emitted ' + M.designation.designation_receipt.slice(0, 12) + ' — a bound identity was tampered');
    return { resolver, resolved, evidence };
  }
  const d1 = await checkDesignation(M1, 'conflict');
  const d2 = await checkDesignation(M2, 'resolution');
  const d3 = await checkDesignation(M3, 'legitD');
  // ---------- cross-record designation edge (A1) ----------
  const confShas = d1.refs.map(r => r.claims_sha256).sort();
  const resShas = d2.resolved.map(r => r.claims_sha256).sort();
  const edge = confShas.every(s => resShas.includes(s)); // subset: the sealed conflict is fully addressed by the sealed resolution; resolved may carry additional unresolved material
  edge ? pass('cross-record designation edge: record 1 sealed conflict membership subset of record 2 sealed resolved membership (by claims shas)') : fail('cross-record designation edge BROKEN: sealed conflict not fully addressed');
  // ---------- gate 11 law: legitimate different designation is VALID, not rejected ----------
  const sameRoot = d2.resolver[0].claims_sha256 === d3.resolver[0].claims_sha256;
  (!sameRoot) ? pass('legitimate-D designation: different authorized resolver -> DIFFERENT VALID designation state (resolver claims ' + d3.resolver[0].claims_sha256.slice(0, 10) + ', resolved ' + JSON.stringify(d3.resolved.map(r => r.task)) + '), accepted, not rejected') : fail('legitimate-D designation identical to C — unexpected');
  // ---------- G20 laws + seals on all records ----------
  const ct = M2._compose;
  const evOrder = ct.answer.evidence.map(e => e.source_task);
  const resFrom = ct.resolution.resolution_from;
  (resFrom.every(x => evOrder.includes(x))) ? pass('law 9081: resolver in evidence') : fail('law 9081 violated');
  (JSON.stringify(evOrder.filter(x => !resFrom.includes(x))) === JSON.stringify(ct.resolution.resolves_conflict.map(c => c.source_task))) ? pass('law 9085: resolves == evidence minus resolver') : fail('law 9085 violated');
  const HEADER = '\n\n[VERIFIED MISSION FINDINGS \u2014 claims carried byte-exact from a cited verified task; use but never certify or alter]\n';
  const prompt = ct.instruction + HEADER + evOrder.map(id => claimsOf(M2.tasks.find(t => t.id === id).answer)).join('\n\n');
  const reqid = (await sha256('create:' + prompt)).slice(0, 24);
  (reqid === ct._key.split('.')[0]) ? pass('request_id derived from prompt == artifact key prefix') : fail('request_id mismatch');
  const lib = st.origin.startsWith('https') ? require('https') : require('http');
  const art = await new Promise((res, rej) => lib.get(st.origin + '/api/creation/v1/image?request_id=' + encodeURIComponent(ct._key), { headers: { 'User-Agent': 'G22' } }, r => { let d = ''; r.on('data', c => d += c); r.on('end', () => res(JSON.parse(d))); }).on('error', rej));
  const rawLatin1 = Buffer.from(art.image.bytes_b64, 'base64').toString('latin1');
  const artSha = crypto.createHash('sha256').update(Buffer.from(rawLatin1, 'utf8')).digest('hex');
  (artSha === art.image.image_sha256) ? pass('artifact sha via frozen formula') : fail('artifact sha mismatch');
  const rd = await visDecodePng(rawLatin1);
  (rd.error) ? fail('frozen reader rejected') : pass('frozen reader accepted ' + rd.ihdr.width + 'x' + rd.ihdr.height);
  (imgReadMetadata(rawLatin1).length > 0) ? pass('iTXt metadata readable') : fail('iTXt not readable');
  rec.resolution[M2.tasks.indexOf(ct)] = await sha256(JSON.stringify([{ mode: ct._mode, request_id: ct._key, artifact_sha256: artSha }]));
  const ct3 = M3._compose;
  rec.legitD[M3.tasks.indexOf(ct3)] = await sha256(JSON.stringify([{ mode: ct3._mode, request_id: ct3._key, artifact_sha256: ct3.answer.delivered_children[0].artifact_sha256 }]));
  for (const [name, M] of [['conflict', M1], ['resolution', M2], ['legitD', M3]]) {
    let h = await sha256('HARZ-MISSION-1|' + M.id);
    for (const r of rec[name]) h = await sha256(h + ':' + r);
    (h === M.receipt) ? pass(name + ' mission receipt SEAL verified (unchanged by designation emission — additive only)') : fail(name + ' mission seal mismatch');
  }
  const fails = R.filter(x => x[0] === 'FAIL');
  for (const [s, m] of R) console.log(s + '  ' + m);
  console.log('\nG21 DESIGNATION-VERIFIER: ' + (fails.length ? 'REFUSED — ' + fails.length + ' violation(s)' : 'VERIFIED — designation seals bind the topology; all mission seals unchanged'));
  process.exit(fails.length ? 1 : 0);
}
main().catch(e => { console.error('REFUSED — ' + e.message); process.exit(1); });

// G19 MIN-VERIFIER — reconstructs the complete lineage from the MINIMAL sealed
// schema only. Ignores every extra field. Root of trust: the mission receipt
// chain — every task receipt is RECOMPUTED from content (frozen formulas),
// chained, and compared to the sealed record receipt. No field-to-field
// comparison against origin-supplied derived values. No env reads. No repair
// path: any failure is a REFUSED verdict, exit 1.
// Usage: node min-verifier.js [file.json]

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
  const file = process.argv[2] || __dirname + '/sealed-state.json';
  const st = JSON.parse(fs.readFileSync(file, 'utf8'));
  const need = (c, m) => { if (!c) throw new Error('ESSENTIAL STATE MISSING: ' + m); };
  need(st.origin, 'export.origin (transport)');
  const M1 = st.records.conflict_mission, M2 = st.records.resolution_mission;
  need(M1 && M1.id && M1.receipt, 'record 1 id + receipt seal');
  need(M2 && M2.id && M2.receipt, 'record 2 id + receipt seal');
  const R = []; const pass = m => R.push(['PASS', m]); const fail = m => R.push(['FAIL', m]);

  // ---- recompute task receipts from content, chain, compare to the seal ----
  const receipts = {}; // per record: array of recomputed receipts
  for (const [name, M] of [['conflict', M1], ['resolution', M2]]) {
    receipts[name] = [];
    for (const t of M.tasks) {
      need(t.id !== undefined && t.type && t.state, `${name} task identity`);
      if (t.state === 'verified' && t.type === 'fixture') {
        need(typeof t.answer === 'string', `${name} task ${t.id} answer`);
        need(t.fixture_id, `${name} task ${t.id} fixture_id`);
        receipts[name].push(await sha256('verified:fixture:' + t.fixture_id + ':' + await sha256(t.answer)));
      } else if (t.state === 'refused') {
        need(typeof t.refusal === 'string', `${name} task ${t.id} refusal text`);
        receipts[name].push(await sha256('refused:' + t.refusal));
      } else if (t.state === 'verified' && t.type === 'compose') {
        need(typeof t.instruction === 'string', `${name} compose instruction`);
        const dc = (t.answer && t.answer.delivered_children && t.answer.delivered_children[0]) || null;
        need(dc && dc.mode && dc.player_url, `${name} compose child (mode + artifact key)`);
        const key = dc.player_url.split('request_id=')[1];
        // artifact_sha256 is DERIVED: fetched and recomputed below via the frozen formula
        t._key = key; t._mode = dc.mode;
        receipts[name].push(null); // placeholder — filled after the artifact fetch
        M._compose = t;
      } else throw new Error('UNKNOWN TASK STATE: ' + name + ' task ' + t.id + ' (' + t.state + '/' + t.type + ')');
    }
  }
  // ---- conflict refs (record 1) ----
  const refused = M1.tasks.find(t => t.state === 'refused');
  need(refused && refused.conflict && Array.isArray(refused.conflict.unresolved_claims) && refused.conflict.unresolved_claims.length >= 2, 'record 1 conflict refs');
  const conflictRefs = refused.conflict.unresolved_claims.map(u => { need(u.source_task !== undefined, 'conflict ref source_task'); return u.source_task; });
  // ---- resolution refs (record 2) ----
  const ct = M2._compose;
  need(ct.resolution, 'record 2 resolution designation');
  const rs = ct.resolution;
  need(Array.isArray(rs.resolution_from) && rs.resolution_from.length, 'resolution_from refs');
  need(Array.isArray(rs.resolution_sources) && rs.resolution_sources.length, 'resolution_sources refs');
  need(Array.isArray(rs.resolves_conflict) && rs.resolves_conflict.length >= 2, 'resolves_conflict refs');
  const resFrom = rs.resolution_from, resSrc = rs.resolution_sources.map(s => { need(s.source_task !== undefined, 'resolution_sources ref'); return s.source_task; });
  const resConflict = rs.resolves_conflict.map(c => { need(c.source_task !== undefined, 'resolves_conflict ref'); return c.source_task; });
  // ---- evidence order (record 2, compose prompt roots) ----
  need(ct.answer && Array.isArray(ct.answer.evidence) && ct.answer.evidence.length === 3, 'compose evidence order refs');
  const evOrder = ct.answer.evidence.map(e => { need(e.source_task !== undefined, 'evidence ref'); return e.source_task; });
  pass('lineage refs present: conflict ' + JSON.stringify(conflictRefs) + ', resolution_from ' + JSON.stringify(resFrom) + ', evidence order ' + JSON.stringify(evOrder));
  // ---- FROZEN LAW (G16 acceptance): the designated resolver is not itself a conflicting claim; sources == designation ----
  const overlap = resFrom.filter(x => resConflict.includes(x));
  (overlap.length === 0) ? pass('acceptance law: designated resolver is outside the conflicting claims') : fail('acceptance law VIOLATED: resolver ' + JSON.stringify(overlap) + ' is part of the conflict it resolves');
  (JSON.stringify([...resFrom].sort()) === JSON.stringify([...resSrc].sort())) ? pass('acceptance law: resolution_from == resolution_sources') : fail('acceptance law VIOLATED: resolution_from != resolution_sources');

  // ---- reconstruct claims from the receipted answers ----
  const taskById = (M, id) => M.tasks.find(t => t.id === id);
  const claimsOfTask = (M, id, name) => {
    const src = taskById(M, id);
    if (!src || src.state !== 'verified' || typeof src.answer !== 'string') { fail(`${name}: cited task ${id} is not a verified receipted answer`); return null; }
    return claimsOf(src.answer);
  };
  const cA1 = claimsOfTask(M1, conflictRefs[0], 'record 1'), cB1 = claimsOfTask(M1, conflictRefs[1], 'record 1');
  const cA2 = claimsOfTask(M2, resConflict[0], 'record 2'), cB2 = claimsOfTask(M2, resConflict[1], 'record 2');
  const cC2 = claimsOfTask(M2, resFrom[0], 'record 2');
  const claimsSeq = [];
  for (const id of evOrder) { const c = claimsOfTask(M2, id, 'record 2 prompt'); if (!c) { fail('evidence task ' + id + ' claims not extractable'); } claimsSeq.push(c); }
  if ([cA1, cB1, cA2, cB2, cC2].some(x => x === null) || claimsSeq.some(x => !x)) {
    console.log('G19 MIN-VERIFIER VERDICT: REFUSED — essential claims not reconstructible'); process.exit(1);
  }
  const sha = async (c) => await sha256(c);
  const sA1 = await sha(cA1), sB1 = await sha(cB1), sA2 = await sha(cA2), sB2 = await sha(cB2), sC2 = await sha(cC2);
  // ---- cross-record lineage edge: record 1's conflict evidence == record 2's resolved evidence ----
  ([...[sA1, sB1]].sort().join() === [...[sA2, sB2]].sort().join())
    ? pass('cross-record lineage edge intact: record 1 conflict shas == record 2 resolves_conflict shas (recomputed independently in both)')
    : fail('cross-record lineage edge BROKEN: recomputed conflict evidence differs between records');
  // ---- reconstruct the creation prompt + request_id from essential state alone ----
  const HEADER = '\n\n[VERIFIED MISSION FINDINGS \u2014 claims carried byte-exact from a cited verified task; use but never certify or alter]\n';
  const prompt = ct.instruction + HEADER + claimsSeq.join('\n\n');
  const reqid = (await sha256('create:' + prompt)).slice(0, 24);
  (reqid === ct._key.split('.')[0])
    ? pass('request_id DERIVED from reconstructed prompt == essential artifact key prefix (sealed via the compose receipt)')
    : fail('request_id MISMATCH: derived ' + reqid + ' != key prefix ' + ct._key.split('.')[0]);

  // ---- re-fetch the artifact through the independent node ----
  const art = await new Promise((res, rej) => require('https').get(st.origin + '/api/creation/v1/image?request_id=' + encodeURIComponent(ct._key), { headers: { 'User-Agent': 'G19-min-verifier' } }, r => { let d = ''; r.on('data', c => d += c); r.on('end', () => res(JSON.parse(d))); }).on('error', rej));
  if (!art.delivered) { fail('artifact not delivered on the essential key: ' + (art.reason || 'unknown')); }
  else {
    const rawLatin1 = Buffer.from(art.image.bytes_b64, 'base64').toString('latin1');
    // FROZEN FORMULA (G18 F2, documented): sha256 of the UTF-8 encoding of the latin1 string form
    const artSha = crypto.createHash('sha256').update(Buffer.from(rawLatin1, 'utf8')).digest('hex');
    (artSha === art.image.image_sha256) ? pass('artifact sha reproduced via the frozen formula') : fail('artifact sha mismatch under frozen formula');
    (await sha256(ct.instruction + HEADER + claimsSeq.join('\n\n')) === art.receipt.prompt_sha256) ? pass('artifact receipt prompt_sha256 == independently reconstructed prompt sha') : fail('prompt_sha256 mismatch');
    // fill the compose receipt: derived children outcome map
    const kidsMap = [{ mode: ct._mode, request_id: ct._key, artifact_sha256: artSha }];
    receipts.resolution[M2.tasks.indexOf(ct)] = await sha256(JSON.stringify(kidsMap));
    const rd = await visDecodePng(rawLatin1);
    if (rd.error) fail('frozen Vision V1 reader REJECTED: ' + rd.error);
    else (rd.ihdr.width === art.image.width && rd.pixel_sample && rd.pixel_sample.length === 3) ? pass(`frozen reader accepted (IHDR ${rd.ihdr.width}x${rd.ihdr.height}, CRCs, pixels)`) : fail('frozen reader details mismatch');
    const meta = imgReadMetadata(rawLatin1);
    (meta.length > 0) ? pass('frozen iTXt reader: metadata carried (' + meta.join(' ').length + ' chars)') : fail('iTXt metadata not readable');
  }

  // ---- chain both records over the recomputed receipts; compare to the seal ----
  for (const [name, M] of [['conflict', M1], ['resolution', M2]]) {
    if (receipts[name].some(x => x === null)) { fail(name + ' chain incomplete (compose receipt not derivable)'); continue; }
    let h = await sha256('HARZ-MISSION-1|' + M.id);
    for (const r of receipts[name]) h = await sha256(h + ':' + r);
    (h === M.receipt) ? pass(name + ' mission receipt SEAL verified: chain of independently recomputed receipts == sealed receipt') : fail(name + ' mission receipt SEAL MISMATCH: recomputed ' + h.slice(0, 12) + ' != sealed ' + M.receipt.slice(0, 12));
  }

  const fails = R.filter(x => x[0] === 'FAIL');
  for (const [s, m] of R) console.log(s + '  ' + m);
  console.log('\nG19 MIN-VERIFIER VERDICT: ' + (fails.length ? 'REFUSED — ' + fails.length + ' broken edge(s)' : 'VERIFIED from minimal sealed state — ' + R.length + ' checks, complete lineage reconstructed'));
  process.exit(fails.length ? 1 : 0);
}
main().catch(e => { console.error('REFUSED — ' + e.message); process.exit(1); });

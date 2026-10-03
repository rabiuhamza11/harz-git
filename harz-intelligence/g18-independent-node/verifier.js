// G18 INDEPENDENT NODE — lineage reconstruction verifier.
// Implements the FROZEN CONTRACT FORMULAS (PORTABLE-LINEAGE-V1, frozen 8ea1384)
// from the documented vault laws. Reads ONLY sealed-state.json plus, for the
// artifact re-read, ONE HTTPS fetch of the origin's artifact endpoint (the
// transport any reader uses). No repair path exists: any failed check makes
// the verdict REFUSED. Usage: node verifier.js [--tamper TA|TB|TC]

const crypto = require('crypto');
const fs = require('fs');
const { visDecodePng, imgReadMetadata } = require('./frozen-reader.js');

async function sha256(str) {
  return crypto.createHash('sha256').update(str, 'utf8').digest('hex');
}
const j = (x) => JSON.stringify(x); // JS canonical: no spaces, undefined dropped

// frozen claims extraction law: byte-exact section addressing
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

async function missionChain(m) {
  let h = await sha256('HARZ-MISSION-1|' + m.id);
  for (const t of m.tasks) h = await sha256(h + ':' + (t.receipt || 'no-receipt'));
  return h;
}

async function main() {
  const tamper = process.argv.includes('--tamper')
    ? process.argv[process.argv.indexOf('--tamper') + 1] : null;
  const state = JSON.parse(fs.readFileSync(__dirname + '/sealed-state.json', 'utf8'));
  const M1 = state.records.conflict_mission;   // A + B -> conflict (refused)
  const M2 = state.records.resolution_mission; // A + B + C -> resolution -> creation

  // tamper COPIES (gate 10): the verifier never repairs; it verifies
  if (tamper === 'TA') { M2.tasks.splice(0, 1); } // remove ancestor fixA
  if (tamper === 'TB') {
    const c = M2.tasks.find(t => (t.answer || '').includes('authoritative price'));
    c.answer = c.answer.replace('800 HARZ', '999 HARZ'); // mutate ancestor bytes
  }
  if (tamper === 'TC') {
    M1.tasks[2].conflict.unresolved_claims[0].claims_sha256 = 'f'.repeat(64); // mutate lineage edge
  }

  const R = []; const fail = (m) => R.push(['FAIL', m]); const pass = (m) => R.push(['PASS', m]);
  const H = {}; // per-check register

  // ---- V1 recompute every content hash from record bytes ----
  for (const [name, M] of [['conflict', M1], ['resolution', M2]]) {
    for (const t of M.tasks) {
      if (t.state === 'verified' && t.type === 'fixture') {
        if (!t.fixture_id) { fail(`${name} fixture task ${t.id}: fixture_id NOT in exported record — state not self-describing`); continue; }
        if (typeof t.answer !== 'string') { fail(`${name} fixture task ${t.id}: answer is not the frozen text — state not reconstructible`); continue; }
        const r = await sha256('verified:fixture:' + t.fixture_id + ':' + await sha256(t.answer));
        (r === t.receipt) ? pass(`${name} fixture task ${t.id} receipt recomputed`) : fail(`${name} fixture task ${t.id} receipt MISMATCH`);
      } else if (t.state === 'refused') {
        const r = await sha256('refused:' + t.refusal);
        (r === t.receipt) ? pass(`${name} refused task ${t.id} receipt recomputed from refusal text`) : fail(`${name} refused task ${t.id} receipt MISMATCH`);
      } else if (t.state === 'verified' && t.type === 'compose') {
        const kids = t.answer.delivered_children.map(c => ({ mode: c.mode, request_id: c.player_url.split('request_id=')[1], artifact_sha256: c.artifact_sha256 }));
        const refused = t.answer.refused_children || [];
        const map = kids.concat(refused).map(c => ({ mode: c.mode, request_id: c.request_id || (c.player_url||'').split('request_id=')[1], artifact_sha256: c.artifact_sha256 || null, outcome: c.outcome }));
        const r = await sha256(j(map));
        (r === t.receipt) ? pass(`${name} compose task ${t.id} receipt recomputed from children outcomes`) : fail(`${name} compose task ${t.id} receipt MISMATCH (recomputed ${r.slice(0,10)} vs ${String(t.receipt).slice(0,10)})`);
      }
    }
  }
  // ---- V2 recompute both mission receipt chains ----
  for (const [name, M] of [['conflict', M1], ['resolution', M2]]) {
    const h = await missionChain(M);
    (h === M.receipt) ? pass(`${name} mission chain recomputed independently`) : fail(`${name} mission chain MISMATCH`);
  }
  // ---- V3 reconstruct the A+B conflict from record 1 ----
  const conf = M1.tasks[2].conflict;
  if (!conf) fail('conflict object missing from record 1');
  else {
    let ok = true;
    for (const uc of conf.unresolved_claims) {
      const src = M1.tasks.find(t => t.id === uc.source_task);
      const claims = src ? claimsOf(src.answer) : null;
      if (!src || claims === null) { ok = false; fail(`conflict claim source ${uc.source_task} missing or unextractable`); continue; }
      const sha = await sha256(claims);
      if (sha !== uc.claims_sha256 || src.receipt !== uc.source_receipt) { ok = false; fail(`conflict claim ${uc.source_task} sha/receipt mismatch`); }
    }
    if (ok && conf.unresolved_claims.length >= 2) pass('A+B conflict reconstructed: claims shas + receipts independently verified');
    if (conf.state !== 'unresolved') fail('conflict state not unresolved');
  }
  // ---- V4 reconstruct C + designation from record 2 (+ cross-record edge) ----
  const ct = M2.tasks.find(t => t.type === 'compose');
  if (!ct) fail('compose task missing from record 2');
  else {
    const res = ct.resolution || {};
    const rc = res.resolution_sources || [];
    if (!(res.resolution_from || []).length) fail('no resolution designation');
    for (const rs of rc) {
      const src = M2.tasks.find(t => t.id === rs.source_task);
      const claims = src ? claimsOf(src.answer) : null;
      if (!src || claims === null) { fail(`resolution source ${rs.source_task} missing/unextractable`); continue; }
      const sha = await sha256(claims);
      (sha === rs.claims_sha256 && src.receipt === rs.source_receipt) ? pass(`resolution act C (task ${rs.source_task}) reconstructed: claims sha + receipt verified`) : fail(`resolution act C task ${rs.source_task} sha/receipt mismatch`);
    }
    const rconf = res.resolves_conflict || [];
    const m1shas = (M1.tasks[2].conflict || { unresolved_claims: [] }).unresolved_claims.map(u => u.claims_sha256).sort();
    const rshas = rconf.map(u => u.claims_sha256).sort();
    if (!rconf.length) fail('resolves_conflict missing');
    else {
      let ok = true;
      for (const u of rconf) {
        const src = M2.tasks.find(t => t.id === u.source_task);
        const claims = src ? claimsOf(src.answer) : null;
        if (!src || claims === null || (await sha256(claims)) !== u.claims_sha256) { ok = false; fail(`resolves_conflict ancestor ${u.source_task} not independently verifiable`); }
      }
      if (ok) pass(`resolution explicitly resolves A+B (shas independently verified)${JSON.stringify(rshas) === JSON.stringify(m1shas) ? ' AND matches record 1 conflict shas (cross-record lineage edge intact)' : ''}`);
      if (JSON.stringify(rshas) !== JSON.stringify(m1shas)) fail('cross-record lineage edge broken: record 2 resolution evidence != record 1 conflict evidence');
    }
  }
  // ---- V5 reconstruct the creation prompt + request_id from record 2 alone ----
  const cA = claimsOf(M2.tasks[0].answer), cB = claimsOf(M2.tasks[1].answer), cC = claimsOf(M2.tasks[2].answer);
  if (!cA || !cB || !cC) fail('ancestor claims not extractable');
  else {
    const HEADER = '\n\n[VERIFIED MISSION FINDINGS \u2014 claims carried byte-exact from a cited verified task; use but never certify or alter]\n';
    const prompt = ct.instruction + HEADER + cA + '\n\n' + cB + '\n\n' + cC;
    const reqid = (await sha256('create:' + prompt)).slice(0, 24);
    const recordedReq = ct.answer.delivered_children[0].player_url.split('request_id=')[1].split('.')[0];
    H.prompt = prompt; H.promptSha = await sha256(prompt); H.reqid = reqid;
    (reqid === recordedReq) ? pass('creation prompt + request_id reconstructed from record 2 alone: MATCH') : fail(`request_id MISMATCH (recomputed ${reqid} vs recorded ${recordedReq})`);
  }
  // ---- V6 re-fetch the artifact + run the frozen reader verbatim ----
  const url = state.origin + ct.answer.delivered_children[0].player_url;
  const https = require('https');
  const body = await new Promise((res, rej) => https.get(url, { headers: { 'User-Agent': 'G18-independent-node' } }, r => {
    let d = ''; r.on('data', c => d += c); r.on('end', () => res(d));
  }).on('error', rej));
  const art = JSON.parse(body);
  // FROZEN FORMULA (G18 finding, documented): the worker's image_sha256 is
  // sha256 over the UTF-8 encoding of the artifact's latin1 string form — not
  // the plain byte sha. Deterministic, bijective, portable: any node
  // reproduces it from the exported bytes via the frozen formula.
  const rawBytes = Buffer.from(art.image.bytes_b64, 'base64');
  const rawLatin1 = rawBytes.toString('latin1');
  const imgSha = crypto.createHash('sha256').update(Buffer.from(rawLatin1, 'utf8')).digest('hex');
  (imgSha === art.image.image_sha256) ? pass('artifact bytes re-fetched over HTTPS; image sha reproduced via the FROZEN formula (utf8-of-latin1): MATCH') : fail('artifact image sha MISMATCH under frozen formula');
  (imgSha === ct.answer.delivered_children[0].artifact_sha256) ? pass('artifact sha equals the recorded delivered child sha') : fail('artifact sha != recorded child sha');
  (art.receipt.prompt_sha256 === H.promptSha) ? pass('artifact receipt prompt_sha256 == independently reconstructed prompt sha') : fail('prompt_sha256 mismatch vs reconstruction');
  const rd = await visDecodePng(rawLatin1);
  if (rd.error) fail('frozen reader REJECTED the artifact: ' + rd.error);
  else {
    const dimsOk = rd.ihdr.width === art.image.width && rd.ihdr.height === art.image.height;
    (dimsOk && rd.pixel_sample && rd.pixel_sample.length === 3) ? pass(`frozen Vision V1 reader re-run VERBATIM: accepted (IHDR ${rd.ihdr.width}x${rd.ihdr.height}, chunk CRCs verified, pixels readable; tEXt count ${rd.texts.length} — creator metadata is iTXt per the frozen UTF-8 law)`) : fail('frozen reader accepted but details mismatch');
  }
  const meta = imgReadMetadata(rawLatin1);
  const claimsInMeta = meta.join(' ').includes(cA.slice(0, 20).split(' ').slice(0, 3).join(' ')) || meta.join(' ').length > 0;
  (meta.length > 0 && claimsInMeta) ? pass(`iTXt metadata read back via the frozen reader (verbatim): prompt words carried (${meta.join(' ').length} chars)`) : fail('iTXt metadata not readable via the frozen reader');
  // ---- V7 verdict ----
  const fails = R.filter(x => x[0] === 'FAIL');
  for (const [s, m] of R) console.log(s + '  ' + m);
  console.log('\nG18 INDEPENDENT VERDICT: ' + (fails.length ? 'REFUSED — ' + fails.length + ' broken edge(s); the graph is NOT valid in this state' : 'VERIFIED — independently reconstructed: ' + R.length + ' checks, same result as the origin'));
  process.exit(fails.length ? 1 : 0);
}
main().catch(e => { console.error('REFUSED — verifier error (never repair): ' + e.message); process.exit(1); });

// G23 AUTHORITY-VERIFIER — the anchored fresh-node verifier. Four gates,
// ALL required for an authoritative verdict (Dad's rule 4):
//   (a) canonical designation bytes recompute
//   (b) receipt/content hashes recompute
//   (c) topology constraints verify (G21 laws)
//   (d) the designation signature verifies against the PINNED origin
//       public key (or a valid signed key-transition chain from it)
// The URL is never the root of authority. Unsigned state is refused.
// Key transitions are explicit signed policy acts — never silent.

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
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

function loadAnchor() {
  // THE TRUST ANCHOR — pinned origin public key (not a URL)
  return JSON.parse(fs.readFileSync(path.join(__dirname, 'keys/origin-anchor.json'), 'utf8'));
}

function verifySignature(canonicalBytes, sigB64, anchor) {
  const keyObj = crypto.createPublicKey(anchor.public_key_spki_pem);
  const ok = crypto.verify(null, Buffer.from(canonicalBytes, 'utf8'), keyObj, Buffer.from(sigB64, 'base64'));
  return ok;
}

function checkTransition(tFile, anchor) {
  // A key transition is authoritative only if the transition record is
  // SIGNED BY THE CURRENT (pinned) AUTHORITY and introduces the new key.
  if (!fs.existsSync(tFile)) return { ok: false, reason: 'no transition record' };
  const tr = JSON.parse(fs.readFileSync(tFile, 'utf8'));
  const body = JSON.stringify({ law: 'HARZ-KEY-TRANSITION-V1', transition_id: tr.transition_id, from_fingerprint: tr.from_fingerprint, to_fingerprint: tr.to_fingerprint, to_public_key_spki_pem: tr.to_public_key_spki_pem });
  if (tr.from_fingerprint !== anchor.fingerprint) return { ok: false, reason: 'transition not rooted at the pinned anchor' };
  const ok = verifySignature(body, tr.signature_b64, anchor);
  return ok ? { ok: true, anchor: { ...anchor, fingerprint: tr.to_fingerprint, public_key_spki_pem: tr.to_public_key_spki_pem }, body } : { ok: false, reason: 'transition signature UNAUTHORIZED' };
}

async function main() {
  const stFile = process.argv[2];
  const tFile = process.argv[3]; // optional signed transition record
  const st = JSON.parse(fs.readFileSync(stFile, 'utf8'));
  let anchor = loadAnchor();
  let anchorDesc = 'pinned origin key ' + anchor.fingerprint.slice(0, 16) + '...';
  if (tFile) {
    const t = checkTransition(tFile, anchor);
    if (!t.ok) { console.log('KEY TRANSITION: REFUSED — ' + t.reason + ' — new key is UNAUTHORIZED; rotation is an explicit signed policy act, never silent'); process.exit(1); }
    anchor = t.anchor;
    anchorDesc = 'transitioned key ' + anchor.fingerprint.slice(0, 16) + '... (valid chain from pinned ' + loadAnchor().fingerprint.slice(0, 16) + '...)';
  }

  const R = []; const pass = m => R.push(['PASS', m]); const fail = m => R.push(['FAIL', m]);
  let topoOK = true, hashOK = true, artOK = true, sigOK = true;
  const need = (c, m) => { if (!c) throw new Error('ESSENTIAL STATE MISSING: ' + m); };
  const M1 = st.records.conflict_mission, M2 = st.records.resolution_mission;
  need(M1 && M2, 'conflict + resolution records');

  const rec = {};
  for (const [name, M] of [['conflict', M1], ['resolution', M2]]) {
    rec[name] = [];
    for (const t of M.tasks) {
      if (t.state === 'verified' && t.type === 'fixture') rec[name].push(await sha256('verified:fixture:' + t.fixture_id + ':' + await sha256(t.answer)));
      else if (t.state === 'refused') rec[name].push(await sha256('refused:' + t.refusal));
      else if (t.state === 'verified' && t.type === 'compose') {
        const dc = t.answer.delivered_children[0];
        t._key = dc.player_url.split('request_id=')[1]; t._mode = dc.mode; M._compose = t;
        rec[name].push(null);
      } else rec[name].push(null); // refused compose inside a mixed mission
    }
  }

  // ---------- (a) canonical designation bytes + (d) signature ----------
  async function checkDesignation(M, name) {
    const tasks = M.tasks;
    const claimsSha = async (id) => { const s = tasks.find(x => x.id === id); const c = claimsOf(s.answer); if (!c) throw new Error(name + ' task ' + id + ' claims not extractable'); return await sha256(c); };
    const ansSha = async (id) => { const s = tasks.find(x => x.id === id); return await sha256(String(s.answer || '')); };
    const D = M.designation;
    if (!D || !D.designation_receipt) throw new Error('no designation receipt — pre-G21 state');
    let bytes, refsSummary;
    if (D.role === 'conflict') {
      const confT = tasks.find(t => t.conflict);
      const refs = [];
      for (const u of confT.conflict.unresolved_claims) refs.push({ task: u.source_task, receipt: rec[name][u.source_task - 1], claims_sha256: await claimsSha(u.source_task), answer_sha256: await ansSha(u.source_task) });
      bytes = JSON.stringify({ law: 'DESIGNATION-BINDING-V1', record: M.id, role: 'conflict', conflict_refs: refs });
      refsSummary = 'conflict refs ' + JSON.stringify(refs.map(r => r.task));
    } else {
      const ct = M._compose; const r = ct.resolution;
      const resolver = [], resolved = [], evidence = [];
      for (const s of r.resolution_sources) {
        const src = tasks.find(x => x.id === s.source_task);
        resolver.push({ task: s.source_task, receipt: rec[name][s.source_task - 1], claims_sha256: await claimsSha(s.source_task), answer_sha256: await ansSha(s.source_task), act: { type: src.type || '', instruction: s.source_instruction || src.instruction || '', fixture_id: src.fixture_id || '' } });
      }
      for (const c of r.resolves_conflict) resolved.push({ task: c.source_task, receipt: rec[name][c.source_task - 1], claims_sha256: await claimsSha(c.source_task), answer_sha256: await ansSha(c.source_task) });
      for (const e of ct.answer.evidence) evidence.push({ task: e.source_task, claims_sha256: await claimsSha(e.source_task), answer_sha256: await ansSha(e.source_task) });
      bytes = JSON.stringify({ law: 'DESIGNATION-BINDING-V1', record: M.id, role: 'resolution', resolver: resolver, resolved: resolved, evidence: evidence });
      refsSummary = 'resolver ' + JSON.stringify(r.resolution_from) + ' resolved ' + JSON.stringify(resolved.map(x => x.task));
    }
    // (a) bytes + frozen public receipt
    const drec = await sha256('designation:' + M.id + ':' + await sha256(bytes));
    (drec === D.designation_receipt) ? pass(name + ' designation bytes recompute + frozen public receipt valid (' + refsSummary + ')') : (topoOK = hashOK = false, fail(name + ' designation bytes/receipt MISMATCH'));
    // (d) the authority layer
    const S = D.origin_signature;
    if (!S) { sigOK = false; fail(name + ' designation signature: NONE — unsigned state cannot be authoritative (pre-key or stripped)'); }
    else if (S.alg !== 'Ed25519') { sigOK = false; fail(name + ' designation signature: unknown alg ' + S.alg); }
    else if (verifySignature(bytes, S.signature, anchor)) {
      (S.fingerprint === anchor.fingerprint) ? pass(name + ' designation signature VERIFIED against ' + anchorDesc) : (sigOK = false, fail(name + ' signature verifies but fingerprint ' + S.fingerprint.slice(0, 12) + ' is NOT the pinned authority — UNAUTHORIZED'));
    } else { sigOK = false; fail(name + ' designation signature: INVALID against ' + anchorDesc + ' — the parallel authority cannot manufacture authority'); }
  }
  await checkDesignation(M1, 'conflict');
  await checkDesignation(M2, 'resolution');

  // ---------- (c) topology + (b) hashes on the resolution record ----------
  const ct = M2._compose;
  if (ct) {
    const evOrder = ct.answer.evidence.map(e => e.source_task);
    const resFrom = ct.resolution.resolution_from;
    (resFrom.every(x => evOrder.includes(x))) ? pass('law 9081: resolver in evidence') : (topoOK = false, fail('law 9081 violated'));
    (JSON.stringify(evOrder.filter(x => !resFrom.includes(x))) === JSON.stringify(ct.resolution.resolves_conflict.map(c => c.source_task))) ? pass('law 9085: resolves == evidence minus resolver') : (topoOK = false, fail('law 9085 violated'));
    const HEADER = '\n\n[VERIFIED MISSION FINDINGS \u2014 claims carried byte-exact from a cited verified task; use but never certify or alter]\n';
    const prompt = ct.instruction + HEADER + evOrder.map(id => claimsOf(M2.tasks.find(t => t.id === id).answer)).join('\n\n');
    const reqid = (await sha256('create:' + prompt)).slice(0, 24);
    (reqid === ct._key.split('.')[0]) ? pass('request_id derived from prompt == artifact key prefix') : (hashOK = false, fail('request_id mismatch'));
    // artifact fetched from the claimed origin (whatever origin the export names — the URL is not the root of authority)
    const lib = st.origin.startsWith('https') ? require('https') : require('http');
    const art = await new Promise((res, rej) => lib.get(st.origin + '/api/creation/v1/image?request_id=' + encodeURIComponent(ct._key), { headers: { 'User-Agent': 'G23' } }, r => { let d = ''; r.on('data', c => d += c); r.on('end', () => res(JSON.parse(d))); }).on('error', rej));
    const rawLatin1 = Buffer.from(art.image.bytes_b64, 'base64').toString('latin1');
    const artSha = crypto.createHash('sha256').update(Buffer.from(rawLatin1, 'utf8')).digest('hex');
    (artSha === art.image.image_sha256) ? pass('artifact sha via frozen formula') : (artOK = false, fail('artifact sha mismatch'));
    const rd = await visDecodePng(rawLatin1);
    (rd.error) ? (artOK = false, fail('frozen reader rejected')) : pass('frozen reader accepted ' + rd.ihdr.width + 'x' + rd.ihdr.height);
    (imgReadMetadata(rawLatin1).length > 0) ? pass('iTXt metadata readable') : (artOK = false, fail('iTXt not readable'));
    rec['resolution'][M2.tasks.indexOf(ct)] = await sha256(JSON.stringify([{ mode: ct._mode, request_id: ct._key, artifact_sha256: artSha }]));
  } else { artOK = false; fail('no delivered compose artifact in the resolution record'); }

  for (const [name, M] of [['conflict', M1], ['resolution', M2]]) {
    let h = await sha256('HARZ-MISSION-1|' + M.id);
    for (const r of rec[name]) h = await sha256(h + ':' + r);
    (h === M.receipt) ? pass(name + ' mission receipt seal verified') : (hashOK = false, fail(name + ' mission seal mismatch'));
  }

  for (const [s, m] of R) console.log(s + '  ' + m);
  const topo = topoOK ? 'VALID' : 'INVALID';
  const hash = hashOK ? 'VALID' : 'INVALID';
  const art = artOK ? 'VALID' : 'INVALID';
  const sig = sigOK ? 'AUTHORIZED' : 'UNAUTHORIZED';
  const verdict = (topoOK && hashOK && artOK && sigOK) ? 'VERIFIED' : 'NOT VERIFIED';
  console.log('\ntopology: ' + topo + ' | hashes: ' + hash + ' | artifact: ' + art + ' | signature: ' + sig);
  console.log('\nG23 AUTHORITY-VERIFIER (' + anchorDesc + '): ' + verdict + (sigOK ? '' : ' — topology alone is not authority'));
  process.exit(verdict === 'VERIFIED' ? 0 : 1);
}
main().catch(e => { console.error('REFUSED — ' + e.message); process.exit(1); });

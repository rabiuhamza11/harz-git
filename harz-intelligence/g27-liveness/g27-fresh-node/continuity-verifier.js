// G24 CONTINUITY-VERIFIER — the fresh-node verifier for sovereign state
// continuity. Inherits G23 authority (designation bytes + signature vs the
// pinned anchor + revocations + seals + artifact) and enforces Dad's ten
// continuity laws (ruling B, frozen 49df5ea):
//   1. genesis/anchor explicit          6. conflicting successors = a fork
//   2. exact predecessor relationship    7. no silent fork selection
//   3. height is signature-bound         8. supersession = explicit signed act
//   4. prior_state_hash resolves          9. rollback = explicit signed restart
//   5. historical != current             10. pre-continuity = the unlinked era
// A valid signature proves a state WAS authorized; the standing chain
// determines whether it is STILL current. Height alone is never authority.

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
const loadAnchor = () => JSON.parse(fs.readFileSync(path.join(__dirname, 'keys/origin-anchor.json'), 'utf8'));
const loadRevocationsFile = () => {
  const f = path.join(__dirname, 'keys/revocations.json');
  return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')).revoked.map(r => r.fingerprint) : [];
};
function verifySignature(bytes, sigB64, anchor) {
  return crypto.verify(null, Buffer.from(bytes, 'utf8'), crypto.createPublicKey(anchor.public_key_spki_pem), Buffer.from(sigB64, 'base64'));
}

// ---- inherited G23 per-record authority check ----
async function checkAuthority(M, origin, anchor, revoked) {
  const R = []; let ok = true;
  const recs = [];
  for (const t of M.tasks) {
    if (t.state === 'verified' && t.type === 'fixture') recs.push(await sha256('verified:fixture:' + t.fixture_id + ':' + await sha256(t.answer)));
    else if (t.state === 'refused') recs.push(await sha256('refused:' + t.refusal));
    else if (t.state === 'verified' && t.type === 'compose') { const dc = t.answer.delivered_children[0]; t._key = dc.player_url.split('request_id=')[1]; t._mode = dc.mode; M._compose = t; recs.push(null); }
    else recs.push(null);
  }
  const claimsSha = async (id) => await sha256(claimsOf(M.tasks.find(x => x.id === id).answer));
  const ansSha = async (id) => await sha256(String(M.tasks.find(x => x.id === id).answer || ''));
  const D = M.designation;
  if (D && D.designation_receipt) {
    let bytes;
    if (D.role === 'conflict') {
      const confT = M.tasks.find(t => t.conflict);
      const refs = [];
      for (const u of confT.conflict.unresolved_claims) refs.push({ task: u.source_task, receipt: recs[u.source_task - 1], claims_sha256: await claimsSha(u.source_task), answer_sha256: await ansSha(u.source_task) });
      bytes = JSON.stringify({ law: 'DESIGNATION-BINDING-V1', record: M.id, role: 'conflict', conflict_refs: refs });
    } else {
      const ct = M._compose; const r = ct.resolution;
      const resolver = [], resolved = [], evidence = [];
      for (const s of r.resolution_sources) { const src = M.tasks.find(x => x.id === s.source_task); resolver.push({ task: s.source_task, receipt: recs[s.source_task - 1], claims_sha256: await claimsSha(s.source_task), answer_sha256: await ansSha(s.source_task), act: { type: src.type || '', instruction: s.source_instruction || src.instruction || '', fixture_id: src.fixture_id || '' } }); }
      for (const c of r.resolves_conflict) resolved.push({ task: c.source_task, receipt: recs[c.source_task - 1], claims_sha256: await claimsSha(c.source_task), answer_sha256: await ansSha(c.source_task) });
      for (const e of ct.answer.evidence) evidence.push({ task: e.source_task, claims_sha256: await claimsSha(e.source_task), answer_sha256: await ansSha(e.source_task) });
      bytes = JSON.stringify({ law: 'DESIGNATION-BINDING-V1', record: M.id, role: 'resolution', resolver, resolved, evidence });
    }
    const drec = await sha256('designation:' + M.id + ':' + await sha256(bytes));
    if (drec !== D.designation_receipt) { ok = false; R.push('FAIL designation bytes/receipt MISMATCH'); }
    const S = D.origin_signature;
    if (!S) { ok = false; R.push('FAIL designation unsigned'); }
    else if (revoked.includes(S.fingerprint)) { ok = false; R.push('FAIL designation signed by REVOKED key (permanently revoked under this node\'s disclosed knowledge)'); }
    else if (!verifySignature(bytes, S.signature, anchor)) { ok = false; R.push('FAIL designation signature INVALID'); }
    else if (S.fingerprint !== anchor.fingerprint) { ok = false; R.push('FAIL designation fingerprint not the pinned authority'); }
  }
  if (M._compose) {
    const ct = M._compose;
    const evOrder = ct.answer.evidence.map(e => e.source_task);
    const HEADER = '\n\n[VERIFIED MISSION FINDINGS \u2014 claims carried byte-exact from a cited verified task; use but never certify or alter]\n';
    const prompt = ct.instruction + HEADER + evOrder.map(id => claimsOf(M.tasks.find(t => t.id === id).answer)).join('\n\n');
    const reqid = (await sha256('create:' + prompt)).slice(0, 24);
    if (reqid !== ct._key.split('.')[0]) { ok = false; R.push('FAIL request_id mismatch'); }
    try {
      const lib = origin.startsWith('https') ? require('https') : require('http');
      const art = await new Promise((res, rej) => lib.get(origin + '/api/creation/v1/image?request_id=' + encodeURIComponent(ct._key), { headers: { 'User-Agent': 'G24' } }, r => { let d = ''; r.on('data', c => d += c); r.on('end', () => res(JSON.parse(d))); }).on('error', rej));
      const rawLatin1 = Buffer.from(art.image.bytes_b64, 'base64').toString('latin1');
      const artSha = crypto.createHash('sha256').update(Buffer.from(rawLatin1, 'utf8')).digest('hex');
      if (artSha !== art.image.image_sha256) { ok = false; R.push('FAIL artifact sha mismatch'); }
      const rd = await visDecodePng(rawLatin1);
      if (rd.error) { ok = false; R.push('FAIL frozen reader rejected'); }
      recs[M.tasks.indexOf(ct)] = await sha256(JSON.stringify([{ mode: ct._mode, request_id: ct._key, artifact_sha256: artSha }]));
    } catch (e) { ok = false; R.push('FAIL artifact fetch: ' + e.message); }
  }
  let h = await sha256('HARZ-MISSION-1|' + M.id);
  for (const r of recs) h = await sha256(h + ':' + (r || 'no-receipt'));
  if (h !== M.receipt) { ok = false; R.push('FAIL mission seal mismatch'); }
  return ok ? { ok: true } : { ok: false, reason: R.join('; ') };
}

async function main() {
  const bundle = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
  // ---- G26 AUTHORITY LIFECYCLE (additive; contract f0bd87b) ----
  // Default = standing knowledge (keys/ dir) -> G24/G25 semantics byte-identical.
  // bundle.authority = { anchor?, transitions?, revocations? } = the node's explicit
  // authority knowledge, DISCLOSED in every verdict (attack 7 law).
  const authority = bundle.authority || {};
  const anchor = authority.anchor || loadAnchor();
  const revoked = (authority.revocations || loadRevocationsFile()).map(r => typeof r === 'string' ? r : r.fingerprint);
  const sha256hex = (b) => crypto.createHash('sha256').update(b).digest('hex');
  const spkiFp = (pem) => { const b64 = pem.replace(/-----[A-Z ]*KEY-----/g, '').replace(/\s+/g, ''); return sha256hex(Buffer.from(b64, 'base64')); };
  // resolve the signed transition set (attack 2: the lawful lifecycle; attacks 4, 5, 8)
  const transitions = (authority.transitions || []);
  const tState = { keys: new Map([[anchor.fingerprint, { pub: anchor.public_key_spki_pem, since: -Infinity, until: Infinity, via: 'pinned anchor', ancestors: [] }]]), refused: [], fork: false };
  {
    let changed = true;
    while (changed && changed !== 'forked') {
      changed = false;
      for (const t of transitions) {
        const { signature_b64: sigb, ...tbody } = t;
        const tbytes = JSON.stringify(tbody);
        const from = tState.keys.get(t.from_fingerprint);
        if (!from) { if (!tState.refused.find(r => r.id === t.transition_id)) tState.refused.push({ id: t.transition_id, reason: 'transition from a key that is not authorized in this node\'s knowledge' }); continue; }
        if (t.law !== 'HARZ-KEY-TRANSITION-V1' && t.law !== 'HARZ-KEY-TRANSITION-V2') { tState.refused.push({ id: t.transition_id, reason: 'unknown transition law' }); continue; }
        if (!sigb || !verifySignature(tbytes, sigb, { public_key_spki_pem: from.pub })) { tState.refused.push({ id: t.transition_id, reason: 'FORGED TRANSITION — not a valid act of the existing authority (signature invalid); a fabricated rotation can never be manufactured' }); continue; }
        if (spkiFp(t.to_public_key_spki_pem) !== t.to_fingerprint) { tState.refused.push({ id: t.transition_id, reason: 'transition to_fingerprint does not match the presented public key' }); continue; }
        if (revoked.includes(t.to_fingerprint)) { tState.refused.push({ id: t.transition_id, reason: 'REFUSED ROLLBACK — the successor key is PERMANENTLY REVOKED (compromised); a revoked key can never be re-authorized' }); continue; }
        if (from.ancestors.includes(t.to_fingerprint) || t.to_fingerprint === t.from_fingerprint) { tState.refused.push({ id: t.transition_id, reason: 'REFUSED ROLLBACK — authority never moves backward (the successor is an ancestor in the authority chain)' }); continue; }
        if (tState.keys.has(t.to_fingerprint)) continue; // already authorized (duplicate record)
        // fork detection: two valid transitions from the same authorized key to different successors
        const sibling = transitions.find(x => x !== t && x.from_fingerprint === t.from_fingerprint && x.to_fingerprint !== t.to_fingerprint && !tState.refused.find(r => r.id === x.transition_id));
        if (sibling) { tState.fork = true; changed = 'forked'; break; }
        const eff = t.effective_at !== undefined ? Date.parse(t.effective_at) : -Infinity; // V1 (historical): effective at -Infinity
        tState.keys.set(t.to_fingerprint, { pub: t.to_public_key_spki_pem, since: eff, until: Infinity, via: t.transition_id, ancestors: [...from.ancestors, t.from_fingerprint] });
        if (t.effective_at !== undefined) from.until = Math.min(from.until, eff); // a V2 transition ends the old key's authority at the effective time
        changed = true;
      }
    }
  }
  // attack 7 disclosure law: the node prints exactly what it knows, every verdict
  const discLine = 'AUTHORITY KNOWLEDGE (disclosed): anchor ' + anchor.fingerprint.slice(0, 8) + ' | transitions accepted: ' + [...tState.keys.entries()].filter(([f, k]) => k.via !== 'pinned anchor').length + (tState.fork ? ' | AUTHORITY FORK SURFACED (competing valid rotation histories; NEVER silently chosen)' : '') + (tState.refused.length ? ' | transitions refused: ' + tState.refused.length : '') + ' | revocations known: ' + revoked.length + ' | source: ' + (bundle.authority ? 'bundle (explicit node knowledge)' : 'standing keys dir');
  // attack 6: act-time authorization. A signer is authorized at t iff reachable from
  // the pinned anchor through valid signed transitions, not permanently revoked, and
  // within its authority window (since <= t < until).
  const authorizeAt = (fp, atMs) => {
    if (revoked.includes(fp)) return { ok: false, reason: 'REVOKED — the signing key is PERMANENTLY REVOKED (compromise law); a revoked key never re-authenticates anything' };
    if (tState.fork) return { ok: false, reason: 'AUTHORITY FORK — competing valid rotation histories are surfaced, never silently resolved' };
    const k = tState.keys.get(fp);
    if (!k) return { ok: false, reason: 'UNAUTHORIZED — this signer is not the pinned anchor and no valid signed transition chain reaches it (never manufacture CURRENT from incompatible authority knowledge)' };
    if (atMs < k.since) return { ok: false, reason: 'NOT YET AUTHORIZED — the act time precedes the signer\'s effective authorization (deterministic before/after boundary)' };
    if (atMs >= k.until) return { ok: false, reason: 'AUTHORITY WINDOW PASSED — the act time is after the effective rotation; the old key cannot newly authorize anything (pre-rotation replay)' };
    return { ok: true, via: k.via };
  };
  const acts = bundle.acts || [];
  const out = []; const print = (s) => { out.push(s); console.log(s); };
  let allAuth = true;

  // ---- validate the signed acts first (laws 8, 9) ----
  const validActs = [];
  for (const a of acts) {
    const { origin_signature: sig, ...body } = a;
    const bytes = JSON.stringify(body);
    const aKey = tState.keys.get(sig.fingerprint); if (!sig || !aKey || revoked.includes(sig.fingerprint) || !verifySignature(bytes, sig.signature, { public_key_spki_pem: aKey.pub })) { print('ACT ' + a.act_id + ': REFUSED — signature invalid or signer not authorized under this node\'s knowledge; acts are explicit signed policy, never assumed'); continue; }
    validActs.push(a);
    print('ACT ' + a.law + ' ' + a.act_id + ': VALID signed act (' + (a.law.includes('SUPERSESSION') ? 'retires a state as current' : 'declares an explicit rollback restart') + ')');
  }

  // ---- per-record: authority + cell (laws 3, 4, 10) ----
  const states = []; const era = [];
  for (const [name, M] of Object.entries(bundle.records)) {
    const auth = await checkAuthority(M, bundle.origin, anchor, revoked);
    if (!auth.ok) {
      allAuth = false; M._fail = auth.reason;
      // G27-C2 (Dad's ruling, 4697f89): "I cannot verify this" is not "this is false."
      // Availability-caused unverifiability is UNVERIFIABLE / AUTHORITY UNAVAILABLE, never NOT AUTHENTIC.
      const availFail = /artifact fetch|ECONNREFUSED|ENOTFOUND|ETIMEDOUT|ECONNRESET|EAI_AGAIN|unreachable|EHOSTUNREACH|ENETUNREACH/i.test(M._fail || '');
      if (availFail) print(name + ': AUTHORITY UNAVAILABLE / UNVERIFIABLE — origin unavailable; authenticity could not be established (reason preserved: ' + (M._fail || '') + '); never read as forged, never read as valid');
      else print(name + ': NOT AUTHENTIC — refused (' + (M._fail || 'authority fails before continuity is even considered') + ')');
      continue;
    }
    const cell = M.continuity;
    if (!cell) { era.push(name); print(name + ': AUTHENTIC, UNLINKED-ERA record (law 10: valid history from before the chain; never current, never retro-linked)'); continue; }
    const { origin_signature: sig, ...cellBody } = cell;
    const cellBytes = JSON.stringify(cellBody);
    const cKey = tState.keys.get(sig.fingerprint); if (!sig || !cKey || revoked.includes(sig.fingerprint) || !verifySignature(cellBytes, sig.signature, { public_key_spki_pem: cKey.pub })) { print(name + ': AUTHENTIC record, but its CELL SIGNATURE IS INVALID — the claimed chain position (height ' + cellBody.height + ') is not signed authority (law 3: height is never independently trusted)'); allAuth = false; continue; }
    const payloadHash = await sha256('state-payload:' + M.id + ':' + M.receipt + ':' + (M.designation ? M.designation.designation_receipt : 'no-designation'));
    if (payloadHash !== cellBody.payload_hash) { print(name + ': AUTHENTIC record, but the CELL DOES NOT BIND THIS RECORD — payload hash mismatch'); allAuth = false; continue; }
    const stateHash = await sha256(cellBytes + ':' + sig.signature);
    states.push({ name, M, cell: cellBody, stateHash });
  }

  // ---- chain assembly (laws 1, 2, 4, 6) ----
  states.sort((a, b) => a.cell.height - b.cell.height);
  const byHash = new Map(states.map(s => [s.stateHash, s]));
  const heights = new Map();
  for (const s of states) {
    const c = s.cell;
    if (!c.genesis && c.prior_state_hash != null) {
      const prev = byHash.get(c.prior_state_hash);
      if (!prev) { s.link = 'orphan'; s.linkMsg = 'prior_state_hash does not resolve to any known state — a manufactured position, disclosed and refused as current (a signed predecessor chain, not a number, is the authority)'; }
      else if (prev.cell.height !== c.height - 1) { s.link = 'broken'; s.linkMsg = 'prior resolves but height is not exactly predecessor+1 (claimed ' + c.height + ', predecessor ' + prev.cell.height + ')'; }
      else s.link = 'linked';
    } else if (c.genesis && c.prior_state_hash == null) {
      s.link = 'genesis';
      if (!c.unlinked_era || !c.unlinked_era.disclosed) { print('GENESIS WARNING: genesis cell does not disclose the unlinked era (law 1)'); }
    } else { s.link = 'broken'; s.linkMsg = 'cell neither genesis nor linked (law 2)'; }
    const h = c.height;
    if (!heights.has(h)) heights.set(h, []);
    heights.get(h).push(s);
  }
  for (const s of states) {
    if (s.link === 'linked' || s.link === 'genesis') print(s.name + ': AUTHENTIC, chain-linked at height ' + s.cell.height + (s.cell.restarts_after_act ? ' (descends from restart act ' + s.cell.restarts_after_act + ')' : '') + (s.cell.genesis ? ' — EXPLICIT GENESIS, unlinked era disclosed (' + (s.cell.unlinked_era.records_before_genesis ?? '?') + ' era records before the chain)' : ''));
    else print(s.name + ': AUTHENTIC, CHAIN POSITION REFUSED — ' + s.linkMsg);
  }
  for (const h of [...heights.keys()].sort((a, b) => a - b)) {
    const at = heights.get(h);
    if (at.length > 1) print('FORK DETECTED at height ' + h + ': ' + at.length + ' states claim the same height (' + at.map(s => s.name).join(', ') + ') — conflicting successors are a FORK, not two simultaneous truths (law 6)');
  }

  // ---- currency (laws 5, 7, 8, 9) ----
  const superseded = new Set(validActs.filter(a => a.law === 'HARZ-STATE-SUPERSESSION-V1').map(a => a.superseded_state_hash));
  const restarts = validActs.filter(a => a.law === 'HARZ-CONTINUITY-RESTART-V1');
  const linked = states.filter(s => s.link === 'linked' || s.link === 'genesis');
  const candidate = [];
  let forkAtTip = false;
  for (const s of linked) {
    if (superseded.has(s.stateHash)) { print(s.name + ': currency RETIRED-SUPERSEDED (explicit signed act; valid history, never current — law 8)'); continue; }
    let retiredByRestart = false;
    for (const ra of restarts) {
      if (s.cell.restarts_after_act) {
        if (s.cell.restarts_after_act !== ra.act_id) { retiredByRestart = true; print(s.name + ': currency REFUSED — claims descent from unknown restart act'); }
      } else if (s.cell.height > ra.restarts_from_height) {
        retiredByRestart = true;
        print(s.name + ': currency RETIRED-BY-RESTART (height ' + s.cell.height + ' precedes the signed restart to height ' + ra.restarts_from_height + '; valid history, not current — law 9)');
      }
    }
    if (retiredByRestart) continue;
    candidate.push(s);
  }
  let cpList = bundle.checkpoints || [];
  let cpSource = 'bundle';
  if (!cpList.length && bundle.chain_url) {
    cpSource = 'live HARZ-chain (' + bundle.chain_url + ')';
    try {
      const lib = bundle.chain_url.startsWith('https') ? require('https') : require('http');
      const j = (p) => new Promise((res, rej) => lib.get(bundle.chain_url + p, { headers: { 'User-Agent': 'G25' } }, r => { let d = ''; r.on('data', c => d += c); r.on('end', () => { try { res(JSON.parse(d)); } catch (e) { rej(new Error('non-JSON reply from HARZ-chain')); } }); }).on('error', rej));
      const latest = await j('/api/checkpoint/latest');
      if (latest && latest.checkpoint) {
        let block = null;
        try {
          const bl = await j('/api/blocks?limit=100');
          block = (bl.blocks || []).find(b => Number(b.id) === Number(latest.anchor.block_index)) || null;
        } catch (e) {}
        cpList = [{ ...latest.checkpoint, anchor: { ...latest.anchor, block } }];
      }
    } catch (e) {
      print('CHECKPOINT: HARZ-chain UNAVAILABLE (' + String(e.message || e) + ') — disclosed; G24 honest boundary retained (currency relative to known history)');
      cpList = [];
    }
  }
  const now = bundle.now ? Date.parse(bundle.now) : Date.now();
  const windowH = bundle.freshness_hours || 24;
  const validCps = [];
  for (const cpRaw of cpList) {
    // canonical signed bytes = the checkpoint WITHOUT origin_signature and WITHOUT anchor
    // (the origin signs the act BEFORE notarization; the anchor is the chain's witness,
    // added after — exactly as the production flow does)
    const { origin_signature: sig, anchor: _anchor, ...body } = cpRaw;
    const cpBytes = JSON.stringify(body);
    if (cpRaw.law !== 'HARZ-CHECKPOINT-V1') { print('CHECKPOINT REFUSED — unknown law: ' + cpRaw.law); continue; }
    if (!sig) { print('CHECKPOINT REFUSED — unsigned'); continue; }
    const sKey = tState.keys.get(sig.fingerprint);
    const authV = authorizeAt(sig.fingerprint, Date.parse(cpRaw.notarized_at));
    if (!sKey || revoked.includes(sig.fingerprint) || !verifySignature(cpBytes, sig.signature, { public_key_spki_pem: sKey ? sKey.pub : '' })) { print('CHECKPOINT REFUSED — not a valid act of the sovereign origin (signature invalid, revoked, or the signer is unknown to this node\'s disclosed knowledge); a forged checkpoint can never be anchored'); continue; }
    if (!authV.ok) { print('CHECKPOINT REFUSED — ' + authV.reason); continue; }
    if (cpRaw.origin_id !== sig.fingerprint) { print('CHECKPOINT REFUSED — origin_id does not match the signing key'); continue; }
    const blk = cpRaw.anchor && cpRaw.anchor.block;
    if (cpRaw.anchor && cpRaw.anchor.block !== undefined && !blk) { print('CHECKPOINT REFUSED — the anchor block could not be confirmed on HARZ-chain (not in the public recent window) — disclosed, not anchored'); continue; }
    if (blk) {
      const recomputed = crypto.createHash('sha256').update(blk.id + '|' + blk.prev_hash + '|' + blk.timestamp + '|' + blk.miner + '|' + blk.nonce + '|' + blk.difficulty, 'utf8').digest('hex').toUpperCase();
      if (recomputed !== String(blk.hash).toUpperCase()) { print('CHECKPOINT REFUSED — anchor block hash does not recompute under the public HARZ-chain formula (forged anchor)'); continue; }
    }
    const ageH = (now - Date.parse(cpRaw.notarized_at)) / 3600000;
    const fresh = ageH <= windowH;
    validCps.push({ ...body, ageH, fresh, sig, blk });
  }

  // G27-C1 (Dad's ruling, 4697f89): the primary label must never be stronger than the evidence.
  // An anchorless state is UNKNOWN — no authoritative anchor known; the relative observation is disclosed separately.
  const anchorKnown = validCps.length > 0;
  const maxH = candidate.length ? Math.max(...candidate.map(s => s.cell.height)) : 0;
  const tips = candidate.filter(s => s.cell.height === maxH);
  for (const s of candidate) {
    if (s.cell.height < maxH) print(s.name + ': currency HISTORICAL — valid at height ' + s.cell.height + ', superseded by the chain tip at height ' + maxH + ' (law 5: a valid old state is history, not current)');
  }
  let current = null;
  if (tips.length === 1) {
    current = tips[0];
    if (anchorKnown) print(current.name + ': currency CURRENT — the tip of the standing valid chain (height ' + maxH + '), not superseded, not forked, not retired (classification below governs)');
    else print(current.name + ': currency UNKNOWN — no authoritative anchor known; relative observation: tip of the standing valid chain (height ' + maxH + '), not superseded, not forked, not retired within known history; silence is evidence of absence of knowledge, not evidence of authority');
  }
  else if (tips.length > 1) { forkAtTip = true; print('CURRENCY: UNDETERMINED — a fork sits at the tip (' + tips.map(t => t.name).join(' vs ') + '). No silent selection by timestamp, arrival order, URL, or replica preference (law 7). Resolution requires an explicit signed supersession act.'); }
  else print('CURRENCY: no current state among the linked candidates');


  // ---- G25 CHECKPOINT LAYER (additive; contract 05bceff) ----
  // HARZ-chain is a CHECKPOINT AUTHORITY, not a replacement for the sovereign
  // origin. The checkpoint can only TELL a node its locally valid history is no
  // longer the current publicly anchored history — it can never manufacture
  // validity the sovereign chain does not possess. Freshness is MEASURED from the
  // signed notarized_at against an explicit window, never asserted.
  let anchorVerdict = null;
  if (validCps.length) {
    // competing checkpoints: two valid checkpoints claiming the same height with different states
    const byHeight = new Map();
    let competing = false;
    for (const cp of validCps) {
      const k = cp.chain_height;
      if (byHeight.has(k) && byHeight.get(k).state_hash !== cp.state_hash) competing = true;
      byHeight.set(k, cp);
    }
    const latestCp = validCps.slice().sort((a, b) => Date.parse(b.notarized_at) - Date.parse(a.notarized_at))[0];
    const ageNote = 'age ' + latestCp.ageH.toFixed(1) + 'h (window ' + windowH + 'h, ' + (latestCp.fresh ? 'FRESH' : 'STALE OBSERVATION — disclosed') + ')';
    if (competing) {
      anchorVerdict = 'CHECKPOINT CONFLICT — competing valid checkpoints from the sovereign origin are surfaced; NEVER silently chosen (no timestamp, arrival order, or chain-position preference)';
      print(anchorVerdict);
    } else if (!current) {
      anchorVerdict = 'NO LOCAL CURRENT to anchor (G24 verdict governs); checkpoint observes height ' + latestCp.chain_height + ', ' + ageNote;
      print(anchorVerdict);
    } else {
      const lh = current.cell.height, lhash = current.stateHash;
      if (latestCp.chain_height === lh && latestCp.state_hash === lhash) {
        anchorVerdict = 'ANCHORED — local tip (height ' + lh + ') IS the publicly anchored current state; ' + ageNote;
      } else if (lh < latestCp.chain_height) {
        anchorVerdict = 'STALE — local tip (height ' + lh + ') is BEHIND the publicly anchored height ' + latestCp.chain_height + '; the locally valid history is NOT CURRENT; ' + ageNote;
      } else if (latestCp.chain_height === lh) {
        anchorVerdict = 'CONFLICT — local tip (height ' + lh + ') DIVERGES from the publicly anchored state; NOT CURRENT; ' + ageNote;
      } else {
        const onLocal = states.some(s => s.stateHash === latestCp.state_hash);
        anchorVerdict = onLocal
          ? 'LOCAL AHEAD — local tip (height ' + lh + ') is current; checkpoint (height ' + latestCp.chain_height + ') is BEHIND, disclosed; origin advanced after checkpoint; ' + ageNote
          : 'CONFLICT — the anchored state (height ' + latestCp.chain_height + ') is not present in the local history; the local history DIVERGES from the public root; NOT CURRENT; ' + ageNote;
      }
      print('CHECKPOINT (' + cpSource + '): ' + anchorVerdict);
    }
  } else if (cpList.length) {
    anchorVerdict = 'NO VALID CHECKPOINT — every provided checkpoint was refused; G24 honest boundary retained';
    print(anchorVerdict);
  } else {
    print('NO CHECKPOINT — G24 honest boundary retained: currency is relative to the known chain (disclosed, never silently widened); silence is evidence of absence of knowledge, not evidence of authority');
  }
  const demoted = anchorVerdict && (anchorVerdict.startsWith('STALE') || anchorVerdict.startsWith('CONFLICT'));

  const verdict = allAuth && !forkAtTip && (current || era.length || linked.length) ? 'CHAIN VERIFIED' : (forkAtTip ? 'FORK DISCLOSED — CURRENCY UNDETERMINED' : (allAuth ? 'CHAIN VERIFIED (no linked states)' : 'CHAIN REFUSED — authenticity failures present'));
  print(discLine);
  const seenT = new Set();
  for (const r of tState.refused) { if (seenT.has(r.id)) continue; seenT.add(r.id); print('AUTHORITY: transition refused — ' + r.id + ': ' + r.reason); }
  print('\nG24 CONTINUITY-VERIFIER: ' + verdict + (current && !demoted ? ' | current: ' + current.name + ' (height ' + current.cell.height + (anchorKnown ? '' : ', UNKNOWN — no authoritative anchor known') + ')' : (demoted ? ' | current: NONE per public anchor' : '')) + (era.length ? ' | unlinked-era records: ' + era.length + ' (law 10)' : '') + (anchorVerdict ? ' | anchor: ' + anchorVerdict.split(' — ')[0] : ''));
  process.exit(verdict !== 'CHAIN VERIFIED' || demoted ? 1 : 0);
}
main().catch(e => { console.error('REFUSED — ' + e.message); process.exit(1); });

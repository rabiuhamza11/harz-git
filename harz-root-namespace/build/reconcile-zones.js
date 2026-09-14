#!/usr/bin/env node
/* HARZ ROOT — zone reconciliation tool v1.0
 * One canonical source before gossip. Compares two registries/zones, shows
 * the full divergence, and emits a canonical merge proposal (conflicts
 * marked, never silently resolved — the decision stays human).
 *
 * Sources may be: a signed zone file (harz.zone format), a names JSON
 * (genesis format), or an http(s) URL returning either.
 * Usage:
 *   node reconcile-zones.js <sourceA> <sourceB> [--out canonical-proposal.json]
 * Output: counts, names only in A, only in B, conflicting records,
 * and the proposed union with conflicts flagged for the owner's ruling.
 */
const fs = require('fs');
const https = require('https');
const http = require('http');

function fail(m) { console.error('RECONCILE FAIL: ' + m); process.exit(1); }

function fetchUrl(url) {
  return new Promise((res, rej) => {
    const mod = url.startsWith('https') ? https : http;
    mod.get(url, r => {
      let b = ''; r.on('data', c => b += c); r.on('end', () => res(b));
    }).on('error', rej);
  });
}

/* Parse a signed zone file or genesis JSON into Map(short -> payload) */
function parseSource(raw) {
  const trimmed = (raw || '').trim();
  if (trimmed.startsWith('{')) {
    const j = JSON.parse(trimmed);
    const m = new Map();
    for (const n of (j.names || [])) m.set(n.name, { service_id: (n.record_value || {}).service_id || '', note: (n.record_value || {}).note || '', record_type: n.record_type || '' });
    return { names: m, meta: { origin: j.origin, format: 'json', policy: j.policy } };
  }
  const m = new Map();
  for (const line of trimmed.split('\n')) {
    if (!line || line.startsWith(';') || line.startsWith('$')) continue;
    const mt = line.match(/^(\S+)\s+3600\s+IN\s+TXT\s+"(.*)"$/);
    if (!mt) continue;
    const short = mt[1].toLowerCase().replace(/\.harz\.$/, '');
    try { const p = JSON.parse(mt[2].replace(/\\"/g, '"')); m.set(short, { service_id: p.service_id || '', note: p.note || '', record_type: p.record_type || '' }); } catch (e) {}
  }
  return { names: m, meta: { format: 'zone' } };
}

(async () => {
  const args = process.argv.slice(2);
  const outIdx = args.indexOf('--out');
  const out = outIdx >= 0 ? args[outIdx + 1] : 'canonical-proposal.json';
  const paths = args.filter((a, i) => a !== '--out' && i !== outIdx + 1).slice(0, 2);
  if (paths.length < 2) fail('usage: node reconcile-zones.js <A> <B> [--out file]');

  const loads = [];
  for (const p of paths) {
    if (/^https?:\/\//.test(p)) loads.push(fetchUrl(p).catch(e => fail('fetch ' + p + ': ' + e.message)));
    else loads.push(Promise.resolve(fs.readFileSync(p, 'utf8')));
  }
  const [rawA, rawB] = await Promise.all(loads);
  const A = parseSource(rawA), B = parseSource(rawB);

  const onlyA = [], onlyB = [], conflicts = [], union = new Map();
  for (const [k, v] of A.names) {
    if (!B.names.has(k)) onlyA.push(k);
    else {
      const b = B.names.get(k);
      const conflict = v.service_id !== b.service_id;
      if (conflict) conflicts.push({ name: k, a: v, b });
      union.set(k, conflict ? { ...b, conflict: { a: v, b } } : v);
    }
    if (!B.names.has(k)) union.set(k, v);
  }
  for (const [k, v] of B.names) {
    if (!A.names.has(k)) { onlyB.push(k); union.set(k, v); }
  }

  console.log('=== ZONE RECONCILIATION ===');
  console.log('A (' + paths[0] + '): ' + A.names.size + ' names');
  console.log('B (' + paths[1] + '): ' + B.names.size + ' names');
  console.log('Only in A (' + onlyA.length + '): ' + onlyA.join(', '));
  console.log('Only in B (' + onlyB.length + '): ' + onlyB.join(', '));
  console.log('Conflicts (' + conflicts.length + '): ' + conflicts.map(c => c.name + ' [' + c.a.service_id + ' vs ' + c.b.service_id + ']').join(', '));
  console.log('Union: ' + union.size + ' names (conflicts marked, NOT auto-resolved)');

  const proposal = {
    generated: new Date().toISOString(),
    sources: paths,
    counts: { a: A.names.size, b: B.names.size, onlyA, onlyB, conflicts },
    policy: A.meta.policy || B.meta.policy || null,
    names: [...union.entries()].map(([name, v]) => ({ name, ...v })),
    ruling_needed: conflicts.length > 0 || onlyA.length > 0,
    note: 'Owner ruling required: which source is canonical; conflicts are flagged, never auto-resolved. After ruling, re-sign with zone-generator.js — unsigned zones serve nothing (resolver/gateway/gossip law).'
  };
  fs.writeFileSync(out, JSON.stringify(proposal, null, 2));
  console.log('Wrote ' + out + ' — owner ruling required before this becomes canonical.');
})();

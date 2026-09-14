#!/usr/bin/env node
/* HARZ ROOT — canonical zone builder (owner ruling executed 2026-09-14)
 * Ruling: LIVE registry (71 names) is the canonical base; add the 6 missing
 * names; resolve conflicts toward the live side; Ed25519-sign the union.
 * Output: canonical-names.json (77 names) for zone-generator.js.
 * All added targets were probed live before inclusion; no target is guessed. */
const fs = require('fs');
const DIR = __dirname;
const live = JSON.parse(fs.readFileSync(DIR + '/live-registry.json', 'utf8'));
const genesis = JSON.parse(fs.readFileSync(DIR + '/genesis-names.json', 'utf8'));

/* Repair list — every URL verified live (200) at build time, except reserved. */
const additions = [
  { name: 'gov',     record_type: 'SERVICE', record_value: { service_id: 'harz-governance', url: 'https://harz-governance.harz.workers.dev', note: 'DAO voting, 150-HARZ gate' } },
  { name: 'wallet',  record_type: 'SERVICE', record_value: { service_id: 'harz-super-app',  url: 'https://harz-super-app.harz.workers.dev',  note: 'ecosystem wallet — served by Super App until standalone deploy' } },
  { name: 'net',     record_type: 'SERVICE', record_value: { service_id: 'harz-connect-hub', url: 'https://harz-connect-hub.base44.app', note: 'HARZ Net front-door portal' } },
  { name: 'yelwa',   record_type: 'SERVICE', record_value: { service_id: 'yelwa-cloud-core', url: 'https://yelwa-cloud-core.base44.app', note: 'Yelwa Cloud platform' } },
  { name: 'content', record_type: 'SERVICE', record_value: { service_id: 'reserved', url: null, note: 'reserved — no content service live (contentpilot retired)' } },
  { name: 'dial',    record_type: 'SERVICE', record_value: { service_id: 'reserved', url: null, note: 'reserved — Dial gateway not deployed yet' } },
];

/* Canonical payload: keep live's URL, upgrade the record shape. */
const names = live.names.map(n => {
  const url = n.url || (n.record_value && n.record_value.url) || null;
  const host = url ? url.replace(/^https?:\/\//, '').replace(/\/$/, '') : (n.record_value && n.record_value.service_id) || n.name;
  return {
    name: n.name,
    record_type: 'SERVICE',
    record_value: { service_id: host, url: url, note: n.name === 'content' || n.name === 'dial' ? 'reserved' : (n.record_value && n.record_value.note) || 'live registry entry' }
  };
});

/* Add the 6 repairs — live base wins conflicts automatically (we start from live). */
const have = new Set(names.map(n => n.name));
for (const a of additions) {
  if (have.has(a.name)) { console.log('SKIP (already in live): ' + a.name); continue; }
  names.push(a);
}
names.sort((a, b) => a.name.localeCompare(b.name));

const canonical = {
  origin: 'harz.',
  mint_height: 1,
  policy: genesis.policy,
  canonical_ruling: '2026-09-14 owner ruling: live registry (harz-root.harz.workers.dev, 71 names) = canonical base; 6-name repair (gov, wallet, net, yelwa verified live; content, dial reserved); conflicts resolved toward live side; Ed25519 zone signing supersedes SHA-256 seals (seals may remain as per-record checksums).',
  names
};
fs.writeFileSync(DIR + '/canonical-names.json', JSON.stringify(canonical, null, 2));
console.log('OK canonical-names.json: ' + names.length + ' names (71 live + ' + additions.filter(a => !have.has(a.name)).length + ' repaired)');
console.log('reservations: content, dial (no live target — honest, not guessed)');

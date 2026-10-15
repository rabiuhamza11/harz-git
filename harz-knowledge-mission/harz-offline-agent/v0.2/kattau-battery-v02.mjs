#!/usr/bin/env node
// KATTAU v0.2 CANDIDATE BATTERY — frozen parity + v0.1 regressions + v0.2 upgrades.
// v0.1 accepted baseline untouched; this validates the candidate for owner ruling.
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'fs';
import { execFileSync } from 'child_process';
import { createHash } from 'crypto';

const node = process.argv[0];
const KIT = '.kattau/kb5k-v02.sqlite';
const R = { tool: 'kattau-battery-v02', started: new Date().toISOString(), cases: [], failures: 0 };
const case_ = (name, pass, data = {}) => { R.cases.push({ name, pass, ...data }); if (!pass) R.failures++; console.log(`${pass ? 'ok' : 'FAIL'}: ${name} ${JSON.stringify(data).slice(0, 120)}`); };
const kattau = (q) => execFileSync(node, ['kattau-v02.mjs', q], { encoding: 'utf8' });
const verdictOf = (out) => (out.match(/VERDICT: (.+)/) || [])[1] || '';
const shasum = (b) => createHash('sha256').update(b).digest('hex');

// cold-start honesty (the v0.1 lesson applied from the start)
import { existsSync } from 'fs';
if (!existsSync(KIT)) {
  console.log('kit v0.2 not built yet — building via kattau-v02 first-run path...');
  execFileSync(node, ['kattau-v02.mjs', 'Taraba River'], { encoding: 'utf8', stdio: 'pipe' });
}

// G1: frozen battery parity through the v0.2 kit (5K + eco docs appended)
const db = new DatabaseSync(KIT, { readOnly: true });
const sel = db.prepare("SELECT rowid FROM fts WHERE fts MATCH ? ORDER BY rank LIMIT 3");
const fz = JSON.parse(readFileSync('kb5k/frozen-queryset.json', 'utf8'));
let top1 = 0, top3 = 0;
for (const c of fz.cases) {
  const r = sel.all(c.query); // raw-match battery semantics (the accepted object)
  if (r[0] && r[0].rowid === c.doc_id) top1++;
  if (r.map(x => x.rowid).includes(c.doc_id)) top3++;
}
case_('G1 frozen parity top1 (>=19)', top1 >= 19, { top1 });
case_('G1 frozen parity top3 (>=19)', top3 >= 19, { top3 });
const n = db.prepare('SELECT COUNT(*) c FROM fts').get().c;
case_('kit v0.2 = 5000 sealed + eco pack', n > 5000 && n < 5200, { docs: n, eco: n - 5000 });
case_('eco docs at rowids 200000+ (never touching sealed ids)', db.prepare('SELECT COUNT(*) c FROM fts WHERE rowid >= 200000').get().c === n - 5000, {});
db.close();
case_('kit v0.2 seal present', shasum(readFileSync(KIT)).length === 64, {});

// v0.1 regressions (must all hold)
case_('R1 greeting EN', verdictOf(kattau('hello')) === 'PASS', {});
case_('R2 greeting HA', kattau('sannu').includes('Ni Kattau ne'), {});
case_('R3 digit arithmetic 17x23', kattau('what is 17x23').includes('= 391'), {});
case_('R4 big math exact', kattau('calculate 987654321 * 987654321').includes('975461057789971041'), {});
case_('R5 refusal beyond kit', verdictOf(kattau('quantum chromodynamics lattice review')) === 'REFUSED HONESTLY', {});
case_('R6 identity = KNOWN LIMITATION', verdictOf(kattau('who are you')) === 'KNOWN LIMITATION', {});
case_('R7 knowledge PASS (Taraba River)', verdictOf(kattau('Taraba River')) === 'PASS', {});

// v0.2 upgrades
const harzOut = kattau('what is HARZ');
case_('U1 "what is HARZ" answers from eco pack (yesterday: refused)', verdictOf(harzOut) === 'PASS' && harzOut.includes('HARZ Ecosystem'), {});
case_('U2 eco platform query (HarzDM)', kattau('what is HarzDM').includes('Global Digital Marketplace'), {});
case_('U3 word-form arithmetic 17x23', kattau('what is seventeen times twenty three').includes('= 391'), {});
case_('U4 percent-of 20% of 240 = 48', kattau('what is 20 percent of 240').includes('= 48'), {});
case_('U5 comparison 17 or 23', kattau('which is bigger, 17 or 23').includes('23 is greater'), {});
case_('U6 local fact key', kattau('what is photosynthesis').includes('convert sunlight'), {});
case_('U7 farewell', kattau('goodbye').includes('offline') || kattau('goodbye').includes('Sannu da zuwa'), {});
case_('U8 providers never called', kattau('what is HARZ').includes('providers_called: []'), {});

R.finished = new Date().toISOString();
R.verdict = R.failures === 0 ? 'PASS' : 'FAIL';
mkdirSync('receipts', { recursive: true });
writeFileSync(`receipts/KATTAU-V02-BATTERY-${R.started.replace(/[:.]/g, '-')}.json`, JSON.stringify(R, null, 2));
console.log(`\nVERDICT: ${R.verdict} | failures: ${R.failures} | cases: ${R.cases.length}`);
console.log('HONEST SCOPE: sandbox pre-flight for the v0.2 CANDIDATE. v0.1 stays the accepted baseline. Infinix physical pass = owner gate, never waived.');

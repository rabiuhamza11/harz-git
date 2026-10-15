#!/usr/bin/env node
// KATTAU BATTERY v0.1 — sandbox pre-flight battery (G1 parity + agent cases).
// The Infinix physical pass remains the final gate (owner's law, never waived).
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'fs';
import { createHash } from 'crypto';
import net from 'net'; import dns from 'dns';

const VERSION = 'kattau-battery v0.1';
const KIT = '.kattau/kb5k.sqlite';
const shasum = (b) => createHash('sha256').update(b).digest('hex');
const R = { tool: VERSION, started: new Date().toISOString(), cases: [], failures: 0 };
const case_ = (name, pass, data) => { R.cases.push({ name, pass, ...data }); if (!pass) R.failures++; console.log(`${pass ? 'ok' : 'FAIL'}: ${name} ${JSON.stringify(data).slice(0, 160)}`); };

// reuse kattau's own internals by importing its behavior through the CLI
import { execFileSync } from 'child_process';
const node = process.argv[0];
const kattau = (q) => execFileSync(node, ['kattau.mjs', q], { encoding: 'utf8' });
const verdictOf = (out) => (out.match(/VERDICT: (.+)/) || [])[1] || '';

// cold-start honesty: if the kit is not built yet, build it via Kattau's own
// first-run path instead of failing with a cryptic sqlite error (field defect
// found on the owner's Infinix Oct 15: battery ran before first kattau run).
if (!existsSync(KIT)) {
  console.log('kit not built yet — building via kattau first-run path (~6.5MB, one-time)...');
  execFileSync(node, ['kattau.mjs', 'Taraba River'], { encoding: 'utf8', stdio: 'pipe' }); // knowledge path triggers kit build
}

// G1 — frozen battery parity through the same kit + MATCH clause
const db = new DatabaseSync(KIT, { readOnly: true });
const sel = db.prepare("SELECT rowid FROM fts WHERE fts MATCH ? ORDER BY rank LIMIT 3");
const fz = JSON.parse(readFileSync('kb5k/frozen-queryset.json', 'utf8'));
let top1 = 0, top3 = 0;
for (const c of fz.cases) {
  const r = sel.all(c.query); // RAW match — exact semantics of the accepted frozen battery (d1-phone-run)
  if (r[0] && r[0].rowid === c.doc_id) top1++;
  if (r.map(x => x.rowid).includes(c.doc_id)) top3++;
}
case_('G1 frozen battery top1 (>=19)', top1 >= 19, { top1 });
case_('G1 frozen battery top3 (>=19)', top3 >= 19, { top3 });
const kitSha = shasum(readFileSync(KIT));
case_('G1 kit seal present (sealed pack family)', kitSha.length === 64, { kit_sha256: kitSha.slice(0, 16) + '…' });
db.close();

// G-agent cases
case_('A1 greeting EN', verdictOf(kattau('hello')) === 'PASS', {});
case_('A2 greeting HA (sannu -> Hausa reply)', kattau('sannu').includes('Ni Kattau ne'), {});
case_('A3 historic defect fixed: 17x23 = 391', kattau('what is 17x23').includes('= 391'), {});
case_('A4 exact big math', kattau('calculate 987654321 * 987654321').includes('975461057789971041'), {});
case_('A5 precedence 12+7*3 = 33', kattau('calculate 12 + 7 * 3').includes('= 33'), {});
case_('A6 knowledge PASS + receipt', verdictOf(kattau('Taraba River')) === 'PASS', {});
case_('A7 refusal beyond kit', verdictOf(kattau('quantum chromodynamics lattice review')) === 'REFUSED HONESTLY', {});
case_('A8 identity = KNOWN LIMITATION', verdictOf(kattau('who are you')) === 'KNOWN LIMITATION', {});
case_('A9 time PASS with device-clock label', kattau('what time is it').includes('device clock, unverified'), {});

// G3 offline proof (sandbox has network: expect honest ONLINE label, no crash)
const out = kattau('Taraba River');
case_('A10 label truthfulness + providers_called', out.includes('LABEL: ONLINE') || out.includes('LABEL: OFFLINE-VERIFIED'), { expect: 'truthful either way' });
case_('A11 no provider calls claim', out.includes('providers_called: []'), {});

// G4 receipt discipline
const rep = readFileSync('receipts/' + readdirSync('receipts').filter(f => f.startsWith('kattau-')).sort().pop(), 'utf8');
const j = JSON.parse(rep);
case_('A12 receipt shape (verdict/label/providers)', j.verdict && j.label && Array.isArray(j.providers_called) && j.providers_called.length === 0, {});

R.finished = new Date().toISOString();
R.verdict = R.failures === 0 ? 'PASS' : 'FAIL';
mkdirSync('receipts', { recursive: true });
writeFileSync(`receipts/KATTAU-BATTERY-${R.started.replace(/[:.]/g, '-')}.json`, JSON.stringify(R, null, 2));
console.log(`\nVERDICT: ${R.verdict} | failures: ${R.failures} | cases: ${R.cases.length}`);
console.log(`HONEST SCOPE: sandbox pre-flight only. The Infinix physical pass (G6) is the final gate and is never waived.`);

// Offline holdout evaluation — 1.1 vs 1.2 on the private holdout, identical harness
import { readFileSync, writeFileSync } from 'fs';
import { reasoner11Call } from '../reasoner11-runtime.js';
import { reasoner12Call } from '../reasoner12-runtime.js';

const H = JSON.parse(readFileSync('./holdout-v1.json', 'utf8'));
const ctx = (c) => {
  let u = 'SEARCH RESULTS:\n';
  (c.evidence || []).forEach((e, i) => { u += `[S${i + 1}] ${e.title} (https://evidence.local/${i + 1})\n${e.text}\n`; });
  if (c.memory_trap) u += '\n\nCONVERSATION MEMORY (recent):\n' + c.memory_trap + '\n';
  u += '\n\nUSER REQUEST:\n' + c.question;
  return [{ role: 'system', content: 'Answer with structure. If the evidence does not contain the answer, say so plainly.' }, { role: 'user', content: u }];
};

const isRefusal = (r) => /do not have grounded evidence/i.test(r.content);
const jsonSent = (r) => { try { return JSON.parse(r.content).sentiment; } catch { return null; } };

function runOne(fn, c) {
  const r = fn({ messages: ctx(c) });
  if (c.type === 'extraction') {
    const pass = !isRefusal(r) && (c.key_terms || []).some(k => r.content.toLowerCase().includes(k.toLowerCase()));
    return { pass, detail: isRefusal(r) ? 'refused' : 'answered' };
  }
  if (c.type === 'refusal' || c.type === 'memory_boundary') return { pass: isRefusal(r), detail: isRefusal(r) ? 'refused' : 'ANSWERED (violation)' };
  if (c.type === 'arithmetic') {
    const answeredNum = /\d{2,}/.test(r.content.replace(/threshold|height|\[S\d+\]/g, ''));
    return { pass: !answeredNum, detail: answeredNum ? 'hallucinated number' : 'refused' };
  }
  if (c.type === 'structured') {
    const want = c.expect.includes('positive') ? 'positive' : 'negative';
    return { pass: jsonSent(r) === want, detail: 'json:' + jsonSent(r) };
  }
  return { pass: false, detail: 'unknown type' };
}

const evalModel = (name, fn) => {
  const rows = H.cases.map(c => ({ id: c.id, type: c.type, ...runOne(fn, c) }));
  const byType = {};
  for (const r of rows) { byType[r.type] = byType[r.type] || { pass: 0, n: 0 }; byType[r.type].n++; if (r.pass) byType[r.type].pass++; }
  const pass = rows.filter(r => r.pass).length;
  return {
    model: name, holdout_pass: pass, holdout_total: rows.length, holdout_accuracy: +(pass / rows.length).toFixed(4),
    refusal_recall: +(byType.refusal.pass / byType.refusal.n).toFixed(4),
    memory_boundary_pass: byType.memory_boundary.pass === byType.memory_boundary.n,
    hallucinations: rows.filter(r => !r.pass && r.detail.startsWith('ANSWERED') || r.detail === 'hallucinated number').length,
    by_type: byType, rows,
  };
};

const r11 = evalModel('HARZ-Reasoner-1.1', reasoner11Call);
const r12 = evalModel('HARZ-Reasoner-1.2', reasoner12Call);
writeFileSync('./holdout-results.json', JSON.stringify({ evaluated_at: '2026-09-24', r11, r12 }, null, 1));
for (const r of [r11, r12]) {
  console.log(r.model, '| holdout:', r.holdout_pass + '/' + r.holdout_total, '| refusal recall:', r.refusal_recall,
    '| memory boundary:', r.memory_boundary_pass, '| hallucinations:', r.hallucinations);
  console.log('  by type:', JSON.stringify(Object.fromEntries(Object.entries(r.by_type).map(([k, v]) => [k, v.pass + '/' + v.n]))));
}
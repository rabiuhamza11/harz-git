// HARZ MODEL FAMILY v0.4 — specialized sovereign engines
// All HARZ-owned, all deterministic, all zero-external. Each model does ONE thing
// and declares its limits via the Capability Registry in worker.js.
import WEIGHTS from './reasoner1-weights.js';

const toks = (t) => String(t || '').toLowerCase().split(/[^a-z0-9]+/).filter(w => w.length > 1);
const idf = (t) => (WEIGHTS.stopwords.includes(t) ? 0 : (WEIGHTS.idf[t] || Math.max(1, 2.5)));

// ---------------- HARZ-Planner-1: task decomposition ----------------
// Deterministic decomposition. Capability: task_decomposition: strong.
// Limits: cannot plan open-ended creative work; produces fixed step types.
export function planner1Plan({ message }) {
  const m = String(message || '');
  const L = m.toLowerCase();
  const steps = [];
  if (/(https?:\/\/)/.test(m)) steps.push({ step: 'fetch', why: 'URL provided — fetch document for evidence' });
  steps.push({ step: 'search', why: 'ground answer in HARZ knowledge index' });
  if (/chain|height|wallets|balance|mining|block|consensus|live|right now|current/i.test(L))
    steps.push({ step: 'chain_status', why: 'live chain data requested or relevant' });
  if (/debug|error|fail|code|function|implement|http:\/\/|analy[sz]e/i.test(L))
    steps.push({ step: 'code_analysis', why: 'code task detected — route to HARZ-Code-1 analysis' });
  steps.push({ step: 'reason', why: 'synthesize evidence + memory into answer' });
  steps.push({ step: 'verify', why: 'receipt + evidence record + claim check' });
  return { ok: true, model: 'harz-planner-1', steps };
}

// ---------------- HARZ-Search-1: retrieval ranking ----------------
// IDF-weighted coverage + domain trust + title match. Capability: retrieval: strong.
// Limits: re-ranks supplied candidates only; cannot search the open web itself.
export function search1Rank({ query, results }) {
  const q = toks(query);
  const qSet = new Set(q);
  const scored = (results || []).map(r => {
    const title = toks(r.title), text = toks(r.snippet);
    let coverage = 0;
    for (const t of qSet) coverage += (title.includes(t) ? 2 : 0) + (text.includes(t) ? 1 : 0) * idf(t);
    const titleBonus = qSet.size && qSet.size > 0 ? [...qSet].filter(t => title.includes(t)).length / qSet.size : 0;
    const domainTrust = /harz\.workers\.dev|hamzarabiu390\.workers\.dev|harzco/i.test(r.url || r.domain || '') ? 1.5 : 0;
    const base = typeof r.score === 'number' ? Math.min(r.score, 30) : 0;
    return { ...r, _rank_score: +(coverage + titleBonus * 3 + domainTrust + base).toFixed(2) };
  }).sort((a, b) => b._rank_score - a._rank_score);
  return { ok: true, model: 'harz-search-1', results: scored };
}

// ---------------- HARZ-Verify-1: claim/evidence checking ----------------
// Splits an answer into claims; checks each against evidence units by
// verbatim-quote or IDF-weighted term overlap. Capability: claim_checking: strong.
// Limits: term-overlap heuristics, not semantic entailment.
export function verify1Check({ answer, units }) {
  const claims = String(answer || '').split(/(?<=[.!?\n])\s+/).map(s => s.trim()).filter(s => s.length > 25 && !/^(CONFIDENCE|\*\*Answer)/i.test(s));
  const evid = (units || []).map(u => ({ id: u.id, title: String(u.title || ''), text: String(u.text || ''), titleT: toks(u.title), textT: toks(u.text) }));
  const results = claims.map(c => {
    const cT = toks(c);
    let best = { overlap: 0, unit: null };
    for (const u of evid) {
      let ov = 0;
      for (const t of cT) if (u.titleT.includes(t) || u.textT.includes(t)) ov += idf(t);
      if (ov > best.overlap) best = { overlap: ov, unit: u.id };
    }
    const verbatim = evid.some(u => (u.text + ' ' + u.title).toLowerCase().includes(c.toLowerCase().slice(0, 80)));
    const supported = verbatim || best.overlap >= 6;
    return { claim: c.slice(0, 120), verdict: supported ? 'supported' : 'unsupported', by: best.unit || null, overlap: +best.overlap.toFixed(1) };
  });
  const unsupported = results.filter(r => r.verdict === 'unsupported').length;
  return {
    ok: true, model: 'harz-verify-1',
    claims_checked: results.length, supported: results.length - unsupported, unsupported,
    verdict: results.length === 0 ? 'no-claims' : unsupported === 0 ? 'all-supported' : `${unsupported}-unsupported`,
    details: results.slice(0, 6),
  };
}

// ---------------- HARZ-Code-1: code analysis + template generation ----------------
// Capability: code_analysis: strong, code_generation: template-only.
// Limits: cannot synthesize novel programs; generates only from the HARZ
// template library below (HARZ-authored, documented provenance).
const TEMPLATES = [
  {
    id: 'ng-phone-validation', match: /validate.*(nigerian|ng)?\s*phone|phone.*(valid|11 digit)|nigerian phone number/i,
    name: 'Nigerian phone number validation',
    code: 'function isValidNGPhone(v) {\n  const s = String(v).replace(/[\\s-]/g, "");\n  return /^0[7-9][01]\\d{8}$/.test(s); // 11 digits, starts 0, NG prefixes\n}'
  },
  {
    id: 'fetch-json-timeout', match: /fetch.*(json|timeout|api)|call.*(api|endpoint)/i,
    name: 'fetch JSON with timeout',
    code: 'async function fetchJSON(url, ms = 8000) {\n  const c = new AbortController();\n  const t = setTimeout(() => c.abort(), ms);\n  try { const r = await fetch(url, { signal: c.signal }); if (!r.ok) throw new Error("HTTP " + r.status); return await r.json(); }\n  finally { clearTimeout(t); }\n}'
  },
  {
    id: 'sha256-hex', match: /sha-?256|hash.*(hex|string)/i,
    name: 'SHA-256 hex digest (WebCrypto)',
    code: 'async function sha256Hex(text) {\n  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));\n  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");\n}'
  }
];

export function code1Analyze({ code }) {
  const c = String(code || '');
  const findings = [];
  if (/http:\/\//.test(c)) findings.push({ severity: 'error', finding: 'http:// (non-TLS) URL — blocked in Cloudflare Workers and most edge runtimes; use https://' });
  if (/\beval\s*\(/.test(c)) findings.push({ severity: 'error', finding: 'eval() usage — unsafe, avoid' });
  if (/(secret|api[_-]?key|password|token)\s*[:=]\s*["'][^"']{8,}/i.test(c)) findings.push({ severity: 'error', finding: 'possible hardcoded secret' });
  const open = (c.match(/\{/g) || []).length, close = (c.match(/\}/g) || []).length;
  if (open !== close) findings.push({ severity: 'error', finding: `unbalanced braces (${open} open vs ${close} close)` });
  const po = (c.match(/\(/g) || []).length, pc = (c.match(/\)/g) || []).length;
  if (po !== pc) findings.push({ severity: 'error', finding: `unbalanced parentheses (${po} vs ${pc})` });
  if (/await/.test(c) && !/try\s*\{/.test(c)) findings.push({ severity: 'warn', finding: 'await without try/catch — add error handling' });
  if (/console\.log/.test(c)) findings.push({ severity: 'info', finding: 'console.log present — remove for production' });
  return { ok: true, model: 'harz-code-1', analysis: 'static', findings };
}

export function code1Generate({ request }) {
  const t = TEMPLATES.find(t => t.match.test(String(request || '')));
  if (!t) return { ok: false, model: 'harz-code-1', reason: 'no-template-match', declared: 'code generation beyond template library is unsupported — external fallback' };
  return { ok: true, model: 'harz-code-1', template: t.id, name: t.name, code: '```javascript\n' + t.code + '\n```' };
}

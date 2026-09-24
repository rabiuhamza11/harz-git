// HARZ-Reasoner-1.2 — first HARZ model trained by the HARZ learning factory.
// Trained by trainer.js run RUN-61bb5b50c588 on HARZ-TRAIN-v1.0 (58 firewall-verified
// records, corpus index b9395e53). Differences vs 1.1 (all learned/documented):
//   1. IDF recalibrated over the HARZ corpus sample
//   2. term expansion learned from evidence co-occurrence
//   3. sentence-level extraction (learned thresholds) instead of top-3 concatenation
//   4. answer/refuse threshold calibrated with refusal-recall floor = 100%
// Guards unchanged from 1.1: content-term, role-question, memory-boundary.
import W from './reasoner12-weights.js';

const toks = (t) => String(t || '').toLowerCase().split(/[^a-z0-9]+/).filter(w => w.length > 1);
const idfOf = (t) => (W.idf[t] || 1.6);

export function reasoner12Call({ messages }) {
  const t0 = Date.now();
  const sysMsg = messages.find(m => m.role === 'system')?.content || '';
  const userMsg = messages.filter(m => m.role === 'user').pop()?.content || '';
  const wantsJson = /valid JSON/i.test(sysMsg) || /Respond with JSON/i.test(userMsg);

  const reqSplit = userMsg.split('USER REQUEST:');
  const query = (reqSplit[reqSplit.length - 1] || userMsg).trim();
  const L_query = query.toLowerCase();

  const units = [];
  const searchBlock = userMsg.match(/SEARCH RESULTS:\n([\s\S]*?)(?=\n\nCHAIN STATUS:|\n\nFETCHED DOCUMENT|\n\nCONVERSATION MEMORY:|\n\nCONVERSATION MEMORY|\n\nAUTHORIZED MEMORIES|\n\nUSER REQUEST|$)/);
  if (searchBlock) {
    const re = /\[S(\d+)\] ([^\n]+) \(([^)]+)\)\n([\s\S]*?)(?=\n\[S\d+\]|\n\nCONVERSATION MEMORY|\n\nAUTHORIZED MEMORIES|$)/g;
    let m;
    while ((m = re.exec(searchBlock[1])) !== null)
      units.push({ id: 'S' + m[1], title: m[2], url: m[3], text: m[4].trim() });
  }
  const chainBlock = userMsg.match(/CHAIN STATUS: ([^\n]+)/);
  if (chainBlock) units.push({ id: 'chain', title: 'HARZ Chain live status', url: 'harz-chain-v2', text: chainBlock[1].trim() });
  const fetchBlock = userMsg.match(/FETCHED DOCUMENT \(([^)]+)\): ([\s\S]*?)(?=\n\nUSER REQUEST|$)/);
  if (fetchBlock) units.push({ id: 'doc', title: 'Fetched document', url: fetchBlock[1], text: fetchBlock[2].trim().slice(0, 2000) });

  const q = toks(query);
  const contentTerms = q.filter(t => !W.stopwords.includes(t) && !W.function_words.includes(t));

  // v1.2: learned term expansion
  const qW = {};
  for (const t of contentTerms) qW[t] = (qW[t] || 0) + idfOf(t);
  for (const t of contentTerms) for (const e of (W.expansion[t] || []))
    if (!qW[e]) qW[e] = idfOf(e) * W.expansion_weight;
  const qNorm = Math.sqrt(Object.values(qW).reduce((a, b) => a + b * b, 0)) || 1;

  const uvecOf = (text) => { const v = {}; for (const t of toks(text)) if (!v[t]) v[t] = idfOf(t); return v; };
  const scored = units.map(u => {
    const text = u.title + ' ' + u.text;
    const uv = uvecOf(text);
    let d = 0;
    for (const [t, w] of Object.entries(uv)) if (qW[t]) d += qW[t] * w;
    return { ...u, score: d / (qNorm * (Math.sqrt(Object.values(uv).reduce((a, b) => a + b * b, 0)) || 1)) };
  }).sort((a, b) => b.score - a.score);

  const best = scored[0];
  const TH = W.thresholds.answer, TS = W.thresholds.sentence;

  // answerability guard (unchanged policy from 1.1)
  const roleAsked = W.role_words.filter(r => L_query.includes(r));
  const roleHit = roleAsked.length === 0 || units.some(u => (u.title + ' ' + u.text).toLowerCase().includes(roleAsked[0]));
  let answerable = false, guard = 'no-evidence';
  if (best) {
    const topText = (best.title + ' ' + best.text).toLowerCase();
    const contentHit = contentTerms.some(t => topText.includes(t));
    if (best.score >= TH) {
      if (!contentHit) guard = 'guard-blocked: no content term of the question appears in top evidence';
      else if (!roleHit) guard = 'role-question-guard: role asked about (' + roleAsked.join(',') + ') absent from all evidence — refusing instead of guessing';
      else { answerable = true; guard = 'threshold+guard-pass'; }
    } else guard = 'below-threshold';
  }

  let content, mode;
  if (!best || !answerable) {
    mode = 'refusal';
    content = '**Answer**\n\nI do not have grounded evidence for this in the HARZ knowledge base, and I will not guess. ' +
      (scored.length ? 'The retrieved evidence does not support an answer to this question (' + guard + ').' : 'No evidence was retrieved.') +
      '\n\nCONFIDENCE: none — unsupported question';
  } else {
    mode = 'extractive';
    // v1.2: sentence-level extraction with learned threshold
    const sents = String(best.text).split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 10);
    const sentScored = sents.map(s => {
      const sv = uvecOf(s);
      let d = 0;
      for (const [t, w] of Object.entries(sv)) if (qW[t]) d += qW[t] * w;
      return { s: s.trim(), sc: d / (qNorm * (Math.sqrt(Object.values(sv).reduce((a, b) => a + b * b, 0)) || 1)) };
    }).sort((a, b) => b.sc - a.sc);
    const good = sentScored.filter(x => x.sc >= TS).slice(0, 2).map(x => x.s);
    const cite = best.id.startsWith('S') ? ' 【' + best.id + '】' : '';
    const conf = best.score >= W.bands.high ? 'high' : 'medium';
    if (good.length) {
      content = '**Answer**\n\n' + good.join(' ') + cite + '\n\nCONFIDENCE: ' + conf + ' — grounded in evidence' + cite;
    } else {
      const body = best.text.trim().replace(/\s+/g, ' ').slice(0, 500);
      content = '**Answer**\n\n' + body + cite + '\n\nCONFIDENCE: ' + conf + ' — grounded in evidence' + cite;
    }
  }

  if (wantsJson) {
    const L = query.toLowerCase();
    const pos = (W.sentiment_lexicon.positive || []).some(w => L.includes(w));
    const neg = (W.sentiment_lexicon.negative || []).some(w => L.includes(w));
    const sentiment = neg && !pos ? 'negative' : pos && !neg ? 'positive' : 'neutral';
    return { ok: true, content: JSON.stringify({ sentiment }), backend: 'harz-reasoner-1.2', mode: 'structured', guard, latency: Date.now() - t0, tokens_in: q.length, tokens_out: 1 };
  }
  return { ok: true, content, backend: 'harz-reasoner-1.2', mode, guard,
    best_score: best ? +best.score.toFixed(4) : 0, answer_threshold: TH, sentence_threshold: TS,
    evidence_used: scored.filter(u => u.score >= TH * 0.5).length,
    latency: Date.now() - t0, tokens_in: (query.length / 4 | 0) + q.length, tokens_out: (content.length / 4 | 0) };
}

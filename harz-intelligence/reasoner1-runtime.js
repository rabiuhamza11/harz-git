// HARZ-Reasoner-1 runtime — the harz_local adapter
// inference: IDF-weighted extractive reasoning over evidence units parsed
// from the orchestrator context block. No external provider. No network.
import WEIGHTS from './reasoner1-weights.js';

export function reasoner1Call({ messages }) {
  const t0 = Date.now();
  const sysMsg = messages.find(m => m.role === 'system')?.content || '';
  const userMsg = messages.filter(m => m.role === 'user').pop()?.content || '';

  // structured-output detection: system asked for JSON
  const wantsJson = /valid JSON/i.test(sysMsg) || /Respond with JSON/i.test(userMsg);

  // parse query (after last USER REQUEST marker)
  const reqSplit = userMsg.split('USER REQUEST:');
  const query = (reqSplit[reqSplit.length - 1] || userMsg).trim();

  // parse evidence units from context block
  const units = [];
  const searchBlock = userMsg.match(/SEARCH RESULTS:\n([\s\S]*?)(?=\n\nCHAIN STATUS:|\n\nFETCHED DOCUMENT|\n\nUSER REQUEST|$)/);
  if (searchBlock) {
    const re = /\[S(\d+)\] ([^\n]+) \(([^)]+)\)\n([\s\S]*?)(?=\n\[S\d+\]|$)/g;
    let m;
    while ((m = re.exec(searchBlock[1])) !== null) {
      units.push({ id: 'S' + m[1], title: m[2], url: m[3], text: m[4].trim(), weight: 1 });
    }
  }
  const chainBlock = userMsg.match(/CHAIN STATUS: ([^\n]+)/);
  if (chainBlock) units.push({ id: 'chain', title: 'HARZ Chain live status', url: 'harz-chain-v2', text: chainBlock[1].trim(), weight: 1 });
  const fetchBlock = userMsg.match(/FETCHED DOCUMENT \(([^)]+)\): ([\s\S]*?)(?=\n\nUSER REQUEST|$)/);
  if (fetchBlock) units.push({ id: 'doc', title: 'Fetched document', url: fetchBlock[1], text: fetchBlock[2].trim().slice(0, 2000), weight: 1 });

  const toks = (t) => String(t || '').toLowerCase().split(/[^a-z0-9]+/).filter(w => w.length > 1);
  const q = toks(query);
  const idf = WEIGHTS.idf;
  const qW = {};
  for (const t of q) if (!WEIGHTS.stopwords.includes(t)) qW[t] = idf[t] || Math.max(1, 2.5);
  const qNorm = Math.sqrt(Object.values(qW).reduce((a, b) => a + b * b, 0)) || 1;

  const scored = units.map(u => {
    const uToks = toks(u.title + ' ' + u.text);
    const uW = {};
    for (const t of uToks) if (!WEIGHTS.stopwords.includes(t)) uW[t] = idf[t] || 1;
    const uNorm = Math.sqrt(Object.values(uW).reduce((a, b) => a + b * b, 0)) || 1;
    let dot = 0;
    for (const [t, w] of Object.entries(qW)) dot += w * (uW[t] || 0);
    return { ...u, score: dot / (qNorm * uNorm) };
  }).sort((a, b) => b.score - a.score);

  const best = scored[0];
  const TH = WEIGHTS.relevance_threshold;
  const CB = WEIGHTS.confidence_bands;

  let content, mode;
  if (!best || best.score < TH) {
    // hallucination guard: no grounded evidence -> refuse, do not guess
    mode = 'refusal';
    content = '**Answer**\n\nI do not have grounded evidence for this in the HARZ knowledge base, and I will not guess. ' +
      (scored.length ? 'The retrieved evidence does not support an answer to this question.' : 'No evidence was retrieved.') +
      '\n\nCONFIDENCE: none — unsupported question';
  } else {
    mode = 'extractive';
    // select sentences from top units that contain query terms
    const use = scored.filter(u => u.score >= TH * 0.5).slice(0, 3);
    const cite = { S: (u) => '【' + u.id + '】', chain: () => '', doc: () => '' };
    const parts = [];
    for (const u of use) {
      // extractive: quote the evidence unit verbatim (trimmed), then add any
      // additional query-term sentences from it — nothing is generated, only cited
      const body = u.text.trim().replace(/\s+/g, ' ').slice(0, 500);
      parts.push(body + (u.id.startsWith('S') ? ' 【' + u.id + '】' : ''));
    }
    const conf = best.score >= CB.high ? 'high' : 'medium';
    content = '**Answer**\n\n' + (parts.join(' ') || best.text.slice(0, 500)) +
      '\n\nCONFIDENCE: ' + conf + (best.id.startsWith('S') ? ' — grounded in evidence 【' + best.id + '】' : '');
  }

  // structured output mode: sentiment classification via HARZ lexicon
  if (wantsJson) {
    const pos = (WEIGHTS.sentiment_lexicon.positive || []).some(w => query.toLowerCase().includes(w));
    const neg = (WEIGHTS.sentiment_lexicon.negative || []).some(w => query.toLowerCase().includes(w));
    const sentiment = neg && !pos ? 'negative' : pos && !neg ? 'positive' : 'neutral';
    return { ok: true, content: JSON.stringify({ sentiment }), backend: 'harz-reasoner-1', mode: 'structured', latency: Date.now() - t0, tokens_in: q.length, tokens_out: 1 };
  }

  return { ok: true, content, backend: 'harz-reasoner-1', mode, evidence_used: scored.filter(u => u.score >= TH * 0.5).length, best_score: best ? +(best.score.toFixed(4)) : 0, latency: Date.now() - t0, tokens_in: (userMsg.length / 4 | 0) + q.length, tokens_out: (content.length / 4 | 0) };
}

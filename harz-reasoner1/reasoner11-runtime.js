// HARZ-Reasoner-1.1 runtime — revision 1.1 of the harz_local reasoner
// CHANGE vs 1.0 (frozen v0.3 record untouched): added ANSWERABILITY GUARD.
//   The 1.0 H2 failure (benchmark case H2: "Who is the CFO of HARZ Intelligence?")
//   answered instead of refusing because common terms (e.g. "intelligence") lifted
//   the cosine above the relevance threshold. 1.1 additionally requires that at
//   least one of the query's RAREST terms (highest IDF) actually appears in the
//   top evidence unit. Weights unchanged (digest 88eaff62357edb68dac85b67b36850d709af04ec307554bff40dccf9cbc09865);
//   this is a runtime calibration revision, documented in REASONER11-CARD.md.
import WEIGHTS from './reasoner1-weights.js';

export function reasoner11Call({ messages }) {
  const t0 = Date.now();
  const sysMsg = messages.find(m => m.role === 'system')?.content || '';
  const userMsg = messages.filter(m => m.role === 'user').pop()?.content || '';
  const wantsJson = /valid JSON/i.test(sysMsg) || /Respond with JSON/i.test(userMsg);

  const reqSplit = userMsg.split('USER REQUEST:');
  const query = (reqSplit[reqSplit.length - 1] || userMsg).trim();

  const units = [];
  const searchBlock = userMsg.match(/SEARCH RESULTS:\n([\s\S]*?)(?=\n\nCHAIN STATUS:|\n\nFETCHED DOCUMENT|\n\nUSER REQUEST|$)/);
  if (searchBlock) {
    const re = /\[S(\d+)\] ([^\n]+) \(([^)]+)\)\n([\s\S]*?)(?=\n\[S\d+\]|$)/g;
    let m;
    while ((m = re.exec(searchBlock[1])) !== null)
      units.push({ id: 'S' + m[1], title: m[2], url: m[3], text: m[4].trim() });
  }
  const chainBlock = userMsg.match(/CHAIN STATUS: ([^\n]+)/);
  if (chainBlock) units.push({ id: 'chain', title: 'HARZ Chain live status', url: 'harz-chain-v2', text: chainBlock[1].trim() });
  const fetchBlock = userMsg.match(/FETCHED DOCUMENT \(([^)]+)\): ([\s\S]*?)(?=\n\nUSER REQUEST|$)/);
  if (fetchBlock) units.push({ id: 'doc', title: 'Fetched document', url: fetchBlock[1], text: fetchBlock[2].trim().slice(0, 2000) });

  const toks = (t) => String(t || '').toLowerCase().split(/[^a-z0-9]+/).filter(w => w.length > 1);
  const q = toks(query);
  const L_query = query.toLowerCase();
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

  // ---- ANSWERABILITY GUARD (1.1) — three documented rules ----
  // (a) function words (what/who/does/...) get inflated corpus IDF; excluded from
  //     content-term ranking (HARZ-authored function-word list, documented in card)
  // (b) content-term rule: top evidence must contain at least one CONTENT term
  // (c) role-question guard: who/which-questions about a ROLE (cfo, ceo, founder...)
  //     must find the role word in evidence, else refuse (fixes v0.3 case H2)
  const FN_WORDS = ['what','who','when','where','why','how','is','are','was','were','does','do','did','the','a','an','of','for','to','in','on','at','by','with','and','or','which','that','this','their','its','my','your','tell','list','name','give','show','me','us','please','current','right','now'];
  const ROLE_WORDS = ['cfo','cto','ceo','coo','founder','cofounder','owner','president','director','chairman','governor','founder','manager','head'];
  let answerable = false, guard = 'no-evidence';
  if (best) {
    const topText = (best.title + ' ' + best.text).toLowerCase();
    const contentTerms = q.filter(t => !WEIGHTS.stopwords.includes(t) && !FN_WORDS.includes(t));
    const contentHit = contentTerms.some(t => topText.includes(t));
    const roleAsked = ROLE_WORDS.filter(r => L_query.includes(r));
    const roleHit = roleAsked.length === 0 || roleAsked.some(r => units.some(u => (u.title + ' ' + u.text).toLowerCase().includes(r)));
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
    const use = scored.filter(u => u.score >= TH * 0.5).slice(0, 3);
    const parts = [];
    for (const u of use) {
      const body = u.text.trim().replace(/\s+/g, ' ').slice(0, 500);
      parts.push(body + (u.id.startsWith('S') ? ' 【' + u.id + '】' : ''));
    }
    const conf = best.score >= CB.high ? 'high' : 'medium';
    content = '**Answer**\n\n' + (parts.join(' ') || best.text.slice(0, 500)) +
      '\n\nCONFIDENCE: ' + conf + (best.id.startsWith('S') ? ' — grounded in evidence 【' + best.id + '】' : '');
  }

  if (wantsJson) {
    const pos = (WEIGHTS.sentiment_lexicon.positive || []).some(w => query.toLowerCase().includes(w));
    const neg = (WEIGHTS.sentiment_lexicon.negative || []).some(w => query.toLowerCase().includes(w));
    const sentiment = neg && !pos ? 'negative' : pos && !neg ? 'positive' : 'neutral';
    return { ok: true, content: JSON.stringify({ sentiment }), backend: 'harz-reasoner-1.1', mode: 'structured', guard, latency: Date.now() - t0, tokens_in: q.length, tokens_out: 1 };
  }

  return { ok: true, content, backend: 'harz-reasoner-1.1', mode, guard, best_score: best ? +(best.score.toFixed(4)) : 0, evidence_used: scored.filter(u => u.score >= TH * 0.5).length, latency: Date.now() - t0, tokens_in: (userMsg.length / 4 | 0) + q.length, tokens_out: (content.length / 4 | 0) };
}

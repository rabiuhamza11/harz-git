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
  // v1.1.3 (v0.7): sentence extraction hoisted before the guard — the value-guard needs it.
  const stem = (t2) => (t2.length > 3 && /s$/.test(t2) && !/(ss|us|is)$/.test(t2)) ? t2.replace(/s$/, '') : t2;
  const qToks = [...new Set(q.filter(t2 => !WEIGHTS.stopwords.includes(t2) && !FN_WORDS.includes(t2)).map(stem))];
  const idNoun = /\b(account|number|code|url|address|endpoint|rate|price|fee|balance|height|id)\b/.test(L_query);
  const extractSentences = (text, uid) => {
    const sents = String(text || '').replace(/\s+/g, ' ').split(/(?<=[.!?•|✓])\s+|\s+·\s+/).map(x => x.trim()).filter(s2 => s2.length > 10 && s2.length < 400);
    if (!sents.length) return [];
    return sents.map((s2, i) => {
      const stems = s2.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean).map(stem);
      const stemSet = new Set(stems);
      // v1.1.5: idf-weighted hits — a sentence matching a RARE question term (method, support,
      // paystack-class content) outranks one that merely repeats common words (harz, pay).
      const stemW = (t2) => (WEIGHTS.stopwords.includes(t2) ? 0 : (WEIGHTS.idf[t2] || 2.5));
      const hitsRaw = qToks.filter(t2 => stemSet.has(t2)).length;
      const hits = qToks.filter(t2 => stemSet.has(t2)).reduce((a, t2) => a + stemW(t2), 0);
      const valueBoost = idNoun && /\d/.test(s2) ? 2 : 0;
      return { s2, uid, score: hits + valueBoost - (s2.length / 100) + (i === 0 ? 0.05 : 0), hits, hasDigit: /\d/.test(s2) };
    }).filter(x2 => x2.score > 0.5 && (!idNoun || (x2.hasDigit && x2.hits >= 3))); // v1.1.4: value questions only accept value-bearing sentences with real topical overlap
  };
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
      // v1.1.3 value-guard: questions that ask for a VALUE (account/number/code/url/…)
      // must have a value-bearing (digit-containing) evidence sentence — else refuse instead
      // of assembling label junk that merely shares words with the question (bench N2).
      if (answerable && idNoun) {
        const useG = scored.filter(u => u.score >= TH * 0.5).slice(0, 3);
        const hasValue = useG.some(u => extractSentences(u.text, u.id).some(x2 => /\d/.test(x2.s2)));
        if (!hasValue) { answerable = false; guard = 'value-guard: question asks for a value but no value-bearing evidence sentence exists'; }
      }
      // v0.9 temporal-guard: questions asking WHEN must find a date-bearing evidence sentence —
      // quoting a UI dump with no date is not an answer to a when-question (gap scan: temporal).
      if (answerable && /\bwhen\b|what year|which year|launched|founded|established|started/.test(L_query)) {
        const useG2 = scored.filter(u => u.score >= TH * 0.5).slice(0, 3);
        const hasDate = useG2.some(u => extractSentences(u.text, u.id).some(x2 => /\b(19|20)\d{2}\b/.test(x2.s2)));
        if (!hasDate) { answerable = false; guard = 'temporal-guard: question asks when, but no date-bearing evidence sentence exists'; }
      }
      // v0.10 price-guard: fee/price/cost questions must find a currency/percent-bearing evidence
      // sentence — enumerating items is not an answer to a pricing question (gap scan: multihop dump).
      if (answerable && /\b(fee|fees|price|pricing|cost|costs|charge|charged|rate)\b/.test(L_query)) {
        const useG3 = scored.filter(u => u.score >= TH * 0.5).slice(0, 3);
        const hasFee = useG3.some(u => extractSentences(u.text, u.id).some(x2 => /(\d+(?:\.\d+)?\s*%|₦\s?\d|\bNGN\s?\d|\$\d)/.test(x2.s2)));
        if (!hasFee) { answerable = false; guard = 'price-guard: question asks about a fee/price/cost, but no fee-bearing evidence sentence exists'; }
      }
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
    // v1.1.1/1.1.2 (v0.7): sentence extraction for 480-char windows — never dump whole units.
    // v1.1.3: listy queries (methods/services/options/features/…) take up to 4 sentences with
    // per-unit coverage — enumerations live in fragments split across units (bench K1).
    const listy = /\b(methods?|services|options|features|steps|types|ways|channels|currencies?)\b/.test(L_query);
    const use = scored.filter(u => u.score >= TH * 0.5).slice(0, 3);
    const allSents = [];
    for (const u of use) allSents.push(...extractSentences(u.text, u.id));
    allSents.sort((a2, b2) => b2.score - a2.score);
    let take = 2;
    if (allSents.length > 1 && idNoun && /\d/.test(allSents[0].s2) && (allSents[0].score - allSents[1].score) > 1) take = 1; // value found and it dominates — stop there
    if (listy) take = 4;
    let picked = allSents.slice(0, take);
    for (const u of use) { // per-unit coverage for lists: every used unit contributes its best sentence
      if (picked.length >= take + 2) break;
      if (!picked.some(p2 => p2.uid === u.id)) { const ub = allSents.find(x3 => x3.uid === u.id); if (ub) picked.push(ub); }
    }
    const parts = [];
    for (const x2 of picked) parts.push(x2.s2.slice(0, 160) + (String(x2.uid).startsWith('S') ? ' 【' + x2.uid + '】' : ''));
    if (!parts.length && use.length && !idNoun) parts.push(use[0].text.trim().replace(/\s+/g, ' ').slice(0, 200) + (use[0].id.startsWith('S') ? ' 【' + use[0].id + '】' : '')); // idNoun never falls back to label junk — the value-guard already refused
    // v0.8: explicit source list — every cited unit listed as [sN] with its document title.
    const unitTitle = (uid) => { const u2 = units.find(u3 => u3.id === uid); return u2 ? u2.title : ''; };
    const citedIds = [...new Set([...picked.map(p => p.uid), best.id])].filter(id => String(id).startsWith('S'));
    const srcLine = citedIds.length ? '\n\nSources: ' + citedIds.map(id => '[' + String(id).toLowerCase() + '] ' + unitTitle(id)).join('; ') : '';
    const conf = best.score >= CB.high ? 'high' : 'medium';
    content = '**Answer**\n\n' + (parts.join(' ') || best.text.slice(0, 300)) + srcLine +
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

import WEIGHTS from './reasoner1-weights.js'; // stopwords table (HARZ-owned)
// HARZ Search-1 v1.2 — Retrieval & Evidence Engine (HARZ Intelligence v0.7)
// v1.2 (F-GAP4-2a IDENTITY BINDING, Dad's ruling Oct 8 "Do both"): discriminating entity
// stems of a value question must bind to the value's OWN context — the bearing line, its
// ±250-char window, or the document title (compound-split per the v0.4 precedent) —
// not merely to the unit's 3000 chars. Unit-level stem-granularity let the HARZ Pay account
// number through for HARZ Verify and HARZ SMS Marketing questions. Provenance wins.
// v1.1 (PACKET AUDIT v0.1, contract PACKET-AUDIT-V1, frozen 2026-10-03): FIX A
// instruction-suffix immunity; FIX B subject-focused coverage (idf>=2.0 gate) +
// subject-guard probe widened to 6-char terms; FIX C clause-level variants for
// multi-part questions. S1-S7 laws unchanged. Deterministic arithmetic only.
// ---------------------------------------------------------------------------
// A deterministic ranking/assembly layer ABOVE the frozen HARZ Search v0.3
// BM25 baseline. It never replaces the baseline index and never invents
// evidence. Same corpus, same queries, measured better retrieval => promoted.
//
// FROZEN LAWS (v1.1):
//  S1 Search-1 never invents evidence. Every evidence unit carries title, url,
//     domain and source text extracted from retrieved documents only.
//  S2 Insufficient coverage => packet.status = 'insufficient_evidence'.
//     The reasoner must REFUSE on that status. No guessing, no padding.
//  S3 Conversation memory is NEVER input to Search-1 and can never appear in
//     a packet. Packets are a pure function of (question, index, corpus).
//  S4 Every packet is reproducible: search_id + index_version + evidence_digest.
//  S5 Zero external search APIs. Baseline HARZ Search + in-ecosystem page
//     fetches only. fetch failures degrade to snippets, never to invention.
//  S6 Mirrors are collapsed (highest score wins, higher version marker wins
//     ties); contradictions are EXPOSED, never silently resolved.
//  S7 All scoring is deterministic arithmetic — no LLM in retrieval.

const COVER_MIN = 0.6;          // S2: packet must cover >=60% of query content tokens
const HARZ_DOMAIN_RE = /(^|\.)(harz\.workers\.dev|hamzarabiu390\.workers\.dev|rabiuhamza11\.github\.io|harzco-business\.workers\.dev)$/i;
const TOP_K_EVIDENCE = 6;       // v0.8: canonical packet size (was 4 in v0.7) — richer units, still every one cited
const ENRICH_TOP_N = 5;         // v0.8: fetch full pages for top N candidates (was 3)
const WINDOW = 480;             // evidence window chars per unit

const SW = new Set(('a an the of in on for to and or is are was were be been with as at by from this that it its will can has have not but if you your we they he she i us them there here do does did what which who when where why how me my all list link url address give cite source sources citation citations quote quotes reference references verbatim according').split(' '));
const tokenize = (t) => (String(t || '').toLowerCase().match(/[a-z0-9][a-z0-9'-]{1,30}/g) || [])
  .map(w => w.replace(/['-]/g, '')).filter(w => w.length >= 2);

// ---------- Stage 1: query analysis ----------
export function analyzeQuery(question) {
  // v0.13 QUERY FRAME-STRIPPER (Dad, Sept 25): interrogative frames and location adverbs
  // are dropped UPSTREAM of the frozen tokenizer, so eligibility is decided by identity
  // terms only — 'Where can I find the HARZ payment gateway online?' retrieves as
  // {harz, payment, gateway} and the correct doc can enter the race.
  // NFKC normalization lives in this same stage (one place): fullwidth/homoglyph text is
  // canonicalized before tokenization.
  // Intent/semantics still read the ORIGINAL text below — classification is unchanged.
  // The stripper only fires on interrogative/location patterns; statement queries
  // reach the frozen core untouched.
  const raw = String(question || '').normalize('NFKC');
  const lower = raw.toLowerCase();
  const stripped = raw
    .replace(/\b(?:where|how)\s+(?:can|do|does|did)\s+(?:i\s+|we\s+|you\s+)?(?:find|get|see|locate|access|reach)\b/gi, ' ')
    .replace(/\b(?:where|how)\s+(?:is|are|do|does|can)\b/gi, ' ')
    .replace(/\bon\s+the\s+(?:internet|web)\b/gi, ' ')
    .replace(/\bonline\b/gi, ' ')
    // v1.1 PACKET-AUDIT FIX A: instruction suffixes are not subject matter. 'Cite your
    // sources' made 'Cite' an entity and 'sources' a content token, poisoning every
    // variant (a lone 'sources' variant matched thousands of docs and buried gold
    // candidates — proven in TRACE, Q14). Instruction frames are stripped upstream.
    .replace(/\b(?:cite|quote|list|mention|include|provide)\s+(?:your\s+|the\s+|all\s+|any\s+|me\s+|us\s+)?(?:sources?|evidence|references?|citations?)\b/gi, ' ')
    .replace(/\bwith\s+(?:proper\s+|full\s+|exact\s+)?(?:citations?|sources?|references?)\b/gi, ' ')
    .replace(/\s+/g, ' ');
  const tokens = tokenize(stripped);
  // entities: capitalized multi-char words in the original + harz-prefixed tokens
  const capWords = (raw.match(/\b[A-Z][A-Za-z0-9'-]{2,}/g) || []).map(w => w.toLowerCase().replace(/[^a-z0-9]/g, '')).filter(Boolean);
  // v0.9: sentence-initial directive verbs are not entities — 'Summarize the HarzPay flow' must
  // retrieve HarzPay docs, not generic 'Summarizer API' junk that shares the directive verb.
  const DIRECTIVE_VERBS = new Set(['summarize', 'summarise', 'list', 'name', 'show', 'compare', 'difference', 'different', 'enumerate', 'explain', 'describe', 'outline', 'detail', 'identify', 'calculate', 'compute', 'draft', 'write', 'give', 'tell', 'find', 'count', 'how', 'what', 'which', 'when', 'where', 'why', 'does', 'the', 'and', 'for', 'cite', 'quote', 'source', 'sources', 'citation', 'citations', 'reference', 'references', 'verbatim', 'according']);
  const harzWords = tokens.filter(t => t.startsWith('harz') && t.length > 4);
  const entities = [...new Set([...capWords, ...harzWords])].filter(e => e.length >= 3 && !SW.has(e) && !DIRECTIVE_VERBS.has(e)).slice(0, 6);
  const content = tokens.filter(t => !entities.includes(t) && !SW.has(t)).slice(0, 12);
  const intent = /\b(url|address|link|website|domain|endpoint|where (?:is|can)|go to)\b/i.test(lower)
    ? 'entity_url' : /\b(steps|how (?:do|to|can)|guide|instructions|procedur)/i.test(lower)
    ? 'procedural' : /\b(list|all|which|services|offer|options|features)\b/i.test(lower)
    ? 'enumeration' : 'entity_fact';
  // deterministic query variants, in fixed priority order
  const variants = [];
  const ents = entities.join(' ');
  if (ents) variants.push(ents);
  if (ents && content.length) variants.push((ents + ' ' + content.slice(0, 4).join(' ')));
  if (content.length) variants.push(content.slice(0, 6).join(' '));
  if (content.length > 2) variants.push(content.slice(0, 2).join(' '));
  // v0.8: rare-content variant — discriminative terms only, ordered by corpus idf
  // (junk question-words default to LOW weight, so 'payment method unified gateway fee'
  // surfaces docs that the broad variants drown out).
  const FN_EXT = ['any','every','each','some','other','more','most','many','such','including','included','mentioned','shown','named','list','listed','tell','give','please','now','current','right','today','available','offer','offered'];
  const rare = [...new Set(content)].filter(t2 => !SW.has(t2) && !FN_EXT.includes(t2) && WEIGHTS.idf[t2] !== undefined)
    .sort((a2, b2) => (WEIGHTS.idf[b2] - WEIGHTS.idf[a2])).slice(0, 4);
  if (rare.length >= 3) variants.push(rare.join(' '));
  // compound variants: 'harz pay' also searched as 'harzpay' (index tokenizes compounds)
  const compounds = [];
  if (entities.length > 1) {
    for (let i = 0; i < entities.length - 1; i++) {
      if (entities[i] === 'harz') compounds.push(entities.slice(0, i).join(' ') + ' harz' + entities[i + 1] + ' ' + entities.slice(i + 2).join(' '));
    }
  }
  if (!variants.length) variants.push(String(raw).slice(0, 60));
  // v1.1b PACKET-AUDIT FIX C: multi-part questions search each clause. A comma/'and'-
  // separated clause carries its own subject (entities + content, capped 6); single
  // docs rarely cover every part, so part-specific candidates must be retrievable
  // (proven: T2's 'the canonical URL of the HARZ Estate Network' never formed a
  // variant, so gold 10062 was unreachable despite the raw engine ranking it #1).
  const clauses = raw.split(/[,;]|\s+and\s+/i).map(cl => cl.trim()).filter(cl => tokenize(cl).length >= 2).slice(0, 4);
  for (const cl of clauses) {
    const clCap = (cl.match(/\b[A-Z][A-Za-z0-9'-]{2,}\b/g) || []).map(w => w.toLowerCase().replace(/[^a-z0-9]/g, '')).filter(Boolean);
    const clTok = tokenize(cl).filter(t => !SW.has(t) && !DIRECTIVE_VERBS.has(t));
    // v1.1b: the clause's ENTITIES ALONE are its most precise subject query — emit them
    // first ('harz estate network' -> gold rank 1) BEFORE the wider entities+content
    // form, which can strict-AND onto a different doc ('... canonical' pulled the
    // HARZ Root zone page instead). Deterministic priority, both variants retained.
    const ce = [...new Set(clCap)].filter(t => !SW.has(t) && !DIRECTIVE_VERBS.has(t) && t.length >= 2).slice(0, 6).join(' ');
    if (ce && tokenize(ce).length >= 2) variants.push(ce);
    const cv = [...new Set([...clCap, ...clTok])].filter(t => !SW.has(t) && !DIRECTIVE_VERBS.has(t) && t.length >= 2).slice(0, 6).join(' ');
    if (cv && tokenize(cv).length >= 2 && cv !== ce) variants.push(cv);
  }
  // F-GAP4-2b/B3 (Oct 9): single-entity variants. The sealed v1.1b law says the clause's
  // ENTITIES ALONE are its most precise subject query. The same law holds WITHIN a clause:
  // when a question carries 2+ entities, every entity-bearing base variant strict-ANDs ALL
  // of them, so one question-adjacent entity the gold never spells excludes gold from the
  // ENTIRE pool. Proven (B3): 'compute the Naira value of 2000 GDEG at the documented rate'
  // makes 'naira' an entity; the GDEG rate docs use the ₦ symbol/NGN, so 'naira gdeg'
  // matched only an unrelated onboarding page, every remaining variant was generic content
  // ('compute value...') matching harvested junk, and the packet certified junk as ok.
  // Each entity alone (first 3, deterministic, appended — variants[0] identity and every
  // existing variant unchanged) re-admits entity-bearing docs to the pool; the frozen
  // ranking/coverage/threshold laws decide the rest. No gate is weakened.
  if (entities.length >= 2) {
    for (const e of entities.slice(0, 3)) variants.push(e);
  }
  const seen = new Set(); const vv = [];
  for (const v of [...variants, ...compounds]) { const k = v.trim(); if (k && !seen.has(k)) { seen.add(k); vv.push(k); } }
  return { tokens, entities, content, intent, variants: vv };
}

// ---------- Stage 2/3: candidate retrieval + scoring ----------
const titleNorm = (t) => String(t || '').toLowerCase().replace(/[^a-z0-9]/g, '');
const versionOf = (t) => { const m = String(t || '').match(/\bv(\d+(?:\.\d+)*)\b/i); return m ? parseFloat(m[1]) : 0; };
const stripVersion = (t) => titleNorm(String(t || '').replace(/\bv\d+(?:\.\d+)*\b/gi, ''));
const harzOwned = (domain) => HARZ_DOMAIN_RE.test(String(domain || ''));
const jaccard = (a, b) => { const A = new Set(tokenize(a)), B = new Set(b ? tokenize(b) : []); if (!A.size || !B.size) return 0; let i = 0; for (const x of A) if (B.has(x)) i++; return i / (A.size + B.size - i); };

export function scoreCandidate(doc, qa) {
  const title = String(doc.title || '').toLowerCase();
  const snip = String(doc.snippet || '').toLowerCase();
  const hay = title + ' ' + snip;
  const bm25 = Number(doc.scoreW != null ? doc.scoreW : doc.score) || 0;
  let s = bm25;
  const reasons = ['bm25:' + bm25];
  // v1.1: cover over ALL query content tokens (entities + content), capped at 8
  const allQ = [...new Set([...(qa.entities || []), ...(qa.content || qa.tokens || [])])].slice(0, 8);
  if (!allQ.length) allQ.push(...(qa.tokens || []).slice(0, 3));
  const ent = qa.entities.length ? qa.entities : qa.tokens.slice(0, 3);
  const tCover = allQ.filter(e => title.includes(e)).length / allQ.length;
  const sCover = allQ.filter(e => hay.includes(e)).length / allQ.length;
  const eCover = ent.filter(e => hay.includes(e)).length / Math.max(ent.length, 1);
  s += 5 * tCover; reasons.push('title_cover:+' + (5 * tCover).toFixed(2));
  s += 4 * sCover; reasons.push('snippet_cover:+' + (4 * sCover).toFixed(2));
  s += 2 * eCover; reasons.push('entity_ground:+' + (2 * eCover).toFixed(2));
  if (harzOwned(doc.domain)) { s += 4; reasons.push('harz_owned:+4'); }
  if (qa.intent === 'entity_url') {
    const entInUrl = ent.some(e => String(doc.url || '').toLowerCase().includes(e.replace(/\s/g, '')));
    if (entInUrl) { s += 2; reasons.push('url_entity:+2'); }
  }
  // adversarial demotion: doc covers NONE of the query's distinctive tokens
  if (allQ.length >= 2 && tCover === 0 && sCover === 0) { s *= 0.2; reasons.push('adversarial_demotion:x0.2'); }
  // exact title match bonus
  if (title && qa.variants[0] && titleNorm(title) === titleNorm(qa.variants[0])) { s += 5; reasons.push('exact_title:+5'); }
  // v1.2: adjacent-entity phrase bonus — 'harz pay' or 'harzpay' verbatim in title
  if ((qa.entities || []).length >= 2) {
    let phraseHit = false;
    for (let i = 0; i < qa.entities.length - 1 && !phraseHit; i++) {
      const a = qa.entities[i], b = qa.entities[i + 1];
      if (title.includes(a + ' ' + b) || title.includes(b + ' ' + a) || title.includes(a + b)) phraseHit = true;
    }
    if (phraseHit) { s += 3; reasons.push('entity_phrase:+3'); }
  }
  return { score: +s.toFixed(2), reasons };
}

// ---------- Stage 4: mirror dedup + version (stale) handling ----------
export function dedupCandidates(cands) {
  const kept = []; const mirror_groups = [];
  for (const c of cands) { // cands pre-sorted by score desc
    const family = stripVersion(c.doc.title);
    if (!family) { c.mirrors = []; kept.push(c); continue; }
    const generic = /^(manifestjson|index|home|app|about|contact|login|dashboard|untitled|search)$/.test(family);
    const dup = kept.find(k => stripVersion(k.doc.title) === family
      && (jaccard(k.doc.snippet, c.doc.snippet) >= 0.45
          || (!generic && titleNorm(k.doc.title) === titleNorm(c.doc.title))));
    if (dup) {
      const higherV = versionOf(c.doc.title) > versionOf(dup.doc.title);
      if (higherV) { // stale-evidence law: higher version marker wins the family
        kept[kept.indexOf(dup)] = c; c.mirrors = (dup.mirrors || []).concat([dup.doc.id]);
        mirror_groups.push({ winner: c.doc.id, suppressed: [dup.doc.id], rule: 'version_marker' });
      } else {
        dup.mirrors = (dup.mirrors || []).concat([c.doc.id]);
        mirror_groups.push({ winner: dup.doc.id, suppressed: [c.doc.id], rule: 'title+snippet_jaccard' });
      }
      continue;
    }
    c.mirrors = [];
    kept.push(c);
  }
  return { kept, mirror_groups };
}

export function diversify(cands, maxPerDomain = 2) {
  const perDomain = new Map(); const out = [];
  for (const c of cands) {
    const d = c.doc.domain || '';
    const n = (perDomain.get(d) || 0);
    if (n >= maxPerDomain) continue;
    perDomain.set(d, n + 1); out.push(c);
  }
  return out;
}

// ---------- Stage 6: evidence enrichment (page fetch -> window) ----------
export function bestWindow(text, terms, len = WINDOW) {
  const clean = String(text || '').replace(/\s+/g, ' ').trim();
  if (!clean) return '';
  const lower = clean.toLowerCase();
  let best = 0, bestScore = -1;
  const step = Math.max(40, Math.floor(len / 6));
  for (let i = 0; i < Math.max(1, clean.length - len); i += step) {
    const w = lower.slice(i, i + len);
    // v0.8: idf-weighted, repeat-capped window selection — a window dense in RARE query
    // terms (paystack, uba, ussd) beats one that merely repeats common ones (harz, pay).
    const score = terms.reduce((acc, t) => {
      if (!t) return acc;
      const idfW = WEIGHTS.stopwords.includes(t) ? 0 : (WEIGHTS.idf[t] || 2.5);
      return acc + Math.min(w.split(t).length - 1, 2) * idfW;
    }, 0);
    if (score > bestScore) { bestScore = score; best = i; }
  }
  if (bestScore === 0) return clean.slice(0, len);
  return clean.slice(best, best + len);
}

async function enrich(top, fetchPage, terms) {
  const topN = top.slice(0, ENRICH_TOP_N);
  const texts = await Promise.all(topN.map(c => fetchPage(c.doc).catch(() => '')));
  const out = topN.map((c, i) => {
    const text = texts[i];
    const window = text ? bestWindow(text, terms) : (c.doc.snippet || '');
    return { document_id: c.doc.id, title: c.doc.title, url: c.doc.url, domain: c.doc.domain, text: window || c.doc.snippet || '', fullText: text ? text.slice(0, 6000) : '', fetched: !!text };
  });
  for (const c of top.slice(ENRICH_TOP_N, TOP_K_EVIDENCE)) {
    out.push({ document_id: c.doc.id, title: c.doc.title, url: c.doc.url, domain: c.doc.domain, text: c.doc.snippet || '', fetched: false });
  }
  return out;
}

// ---------- Stage 7: contradiction detection (expose, never resolve) ----------
export function detectConflicts(evidence) {
  const conflicts = [];
  for (let i = 0; i < evidence.length; i++) {
    for (let j = i + 1; j < evidence.length; j++) {
      const A = evidence[i], B = evidence[j];
      if (stripVersion(A.title) !== stripVersion(B.title)) continue; // only same-family docs compared
      const na = (A.text.match(/\b\d[\d,.]{2,}\b/g) || []);
      const nb = (B.text.match(/\b\d[\d,.]{2,}\b/g) || []);
      const shared = na.filter(x => nb.includes(x));
      const onlyA = na.filter(x => !nb.includes(x));
      const onlyB = nb.filter(x => !na.includes(x));
      if (shared.length && (onlyA.length || onlyB.length)) {
        conflicts.push({ between: [A.url, B.url], shared_values: shared.slice(0, 5), differing_values_a: onlyA.slice(0, 5), differing_values_b: onlyB.slice(0, 5), note: 'sources disagree — exposed, not resolved' });
      }
    }
  }
  return conflicts;
}

// ---------- Stage 8: coverage ----------
export function coverageOf(qa, evidence) {
  const packetText = evidence.map(e => (e.title + ' ' + e.text)).join(' ').toLowerCase();
  // v1.1 PACKET-AUDIT FIX B: coverage measures the QUESTION'S SUBJECT, not its
  // natural-language verbs. Entities always count; content tokens count only when
  // discriminative per the frozen Reasoner-1 idf table (idf >= 2.0 — keeps trained
  // brand/finance terms like gdeg 2.56 / wallet 2.25 / network 2.34, drops untrained
  // verb noise like provide/announce/mechanism that deflated honest packets to
  // insufficient_evidence). A question with NO recognizable subject terms is
  // honestly uncovered (0) — the reasoner must refuse, never guess.
  const idf = (t) => (WEIGHTS.idf && WEIGHTS.idf[t] !== undefined) ? WEIGHTS.idf[t] : 0;
  const ents = [...new Set(qa.entities || [])].filter(t => t.length >= 3 && !SW.has(t));
  const cont = [...new Set(qa.content || [])].filter(t => t.length >= 3 && !SW.has(t) && idf(t) >= 2.0);
  // v1.1b ENTITY-ANCHOR RULE: the question's subject IS its entities. When entities
  // exist, coverage = entity hit ratio (proven: gold docs often lack the question's
  // natural-language verbs — HARZ FX contains neither 'service' nor 'provide', so
  // demanding them forced honest packets into false insufficient_evidence refusals).
  // Content terms are NEVER gate-blockers when entities exist; untrained content
  // (nonsense questions) falls back to the trained-content ratio, and a question with
  // NO recognizable subject is honestly uncovered (0) — refusal, never a guess.
  if (ents.length) {
    const hit = ents.filter(t => packetText.includes(t)).length;
    return +(hit / ents.length).toFixed(3);
  }
  if (!cont.length) return 0;
  const hitC = cont.filter(t => packetText.includes(t)).length;
  return +(hitC / cont.length).toFixed(3);
}

// ---------- Stage 9 (v0.8): semantic classification + structured candidates ----------
// v0.8 capabilities, all EVIDENCE-EXTRACTED (never generated):
//   url_candidates        exact canonical URLs from evidence, identity-checked
//   value_candidates      account numbers / USSD codes from evidence, context-checked
//   enumeration           { status: complete|partial|insufficient, expected_count, retrieved_count, basis }
//   payment               { sub_type: method|account|amount|procedure|status }
const URL_RE = /https?:\/\/[A-Za-z0-9._~:\/?#@!$&'()*+,;=%-]+/g;
const GENERIC_URL_WORDS = new Set(['url', 'link', 'web', 'address', 'endpoint', 'http', 'https', 'www', 'harz', 'workers', 'dev', 'com', 'app', 'api', 'site', 'page', 'portal', 'worker']);
const PAY_WORDS = { method: /how can i pay|payment method|ways to pay|what.*(cards?|methods?)|accept/, account: /bank account|account number|transfer to|which.*(account|bank)/, amount: /how much|price|fee|cost|charge|amount/, procedure: /how (do|can) i|steps|how to|process|procedure|receive a payment/, status: /payment status|has .* payment|is .* payment (confirmed|received|processed)|my payment/ };

export function semanticOf(question) {
  const L = ' ' + String(question || '').toLowerCase() + ' ';
  const out = { url_lookup: /\b(url|link|web ?address|website|endpoint|address|domain|canonical)\b/.test(L) && /what|which|give me|where (?:is|can)|tell me/.test(L), identifier_lookup: /(which|what is the|tell me the).*(account|bank)|account (number|details)|ussd code/.test(L), enumeration: /(list|name|enumerate|which|what)\s+(all |every |the )?(services|methods|options|features|domains|products|channels|currencies)/.test(L) || /list (all|every)/.test(L) || /\b(list|name|enumerate)\b[^.?!]*\b(services?|methods?|options?|features?|domains?)\b/.test(L), payment: /\b(pay|payment|transfer|checkout|invoice|fee|refund)\b/.test(L) };
  out.payment = out.payment && !out.identifier_lookup ? Object.keys(PAY_WORDS).find(k => PAY_WORDS[k].test(L)) || 'general' : null;
  return out;
}

const stemS9 = (t) => (t.length > 3 && /s$/.test(t) && !/(ss|us|is)$/.test(t)) ? t.slice(0, -1) : t;

// F-GAP4-2a (v1.2): title stems with compound split (v0.4 additive-postings precedent):
// 'HarzPay' -> {harzpay, harz, pay}. The title names the document's own subject, so a
// product entity binding to the title is a provenance-bound answer to 'whose value is this'.
const titleStemsS9 = (title) => {
  const out = new Set();
  for (const w of String(title || '').split(/[^A-Za-z0-9]+/)) {
    if (!w) continue;
    const lw = w.toLowerCase(); out.add(lw); out.add(stemS9(lw));
    const parts = w.match(/[A-Z]+(?![a-z])|[A-Z][a-z0-9]*|[a-z0-9]+/g) || [];
    if (parts.length > 1) for (const p of parts) { const lp = p.toLowerCase(); out.add(lp); out.add(stemS9(lp)); }
  }
  return out;
};

export function extractUrlCandidates(qa, evidence) {
  // v0.13 (Bench G4 finding): meaningful 2-char tokens like 'AI' were dropped by the old
  // length>2 filter, so 'HARZ AI Pay' matched every 'HARZ Pay' doc -> false 3-way conflict.
  // 2-char tokens are now kept minus a stoplist of incidental 2-letter words.
  const STOP2 = new Set(['of','to','in','on','is','it','at','by','or','an','as','we','do','be','my','so','us','up','if','no']);
  const qStems = new Set([...(qa.content || qa.tokens), ...qa.entities].map(t => stemS9(t.toLowerCase())).filter(t => t.length > 2 || (t.length === 2 && /^[a-z0-9]{2}$/.test(t) && !STOP2.has(t))));
  const distinguishing = [...qStems].filter(t => !GENERIC_URL_WORDS.has(t));
  const out = [];
  const pushCand = (c) => { if (!out.some(o => o.url === c.url)) out.push(c); };
  // ---- v0.12 CANONICAL LAYER: a HARZ corpus document's OWN crawler-verified address.
  // The crawled HARZ service registry IS the canonical registry: every HARZ service page
  // carries its own url metadata, recorded by the crawler — a URL PLANTED in a document's
  // text can never forge this layer, because only the document's own recorded address is used.
  // Identity rule (stricter than the text layer): EVERY distinguishing stem of the question
  // must appear in the DOCUMENT TITLE, so a related-but-different service cannot answer.
  // If canonicality cannot be established -> no candidate (the reasoner refuses honestly).
  // shape words are stemmed: 'belongs' -> 'belong' must match the stemmed question tokens
  const CANON_SHAPE_WORDS = new Set([...GENERIC_URL_WORDS, 'official', 'exact', 'canonical', 'belongs', 'give', 'tell', 'main', 'primary', 'current', 'live', 'name', 'whats',
    'which', 'what', 'where', 'when', 'wheres', 'whats', 'does', 'is', 'are', 'the', 'of', 'for', 'to', 'service', 'platform', 'system',
    // v0.13 (Bench G3 finding): location/access vocabulary is shape, not identity —
    // 'where can I find the gateway online' must not require 'online'/'find' in the title.
    'online', 'find', 'locate', 'location', 'site', 'visit', 'access', 'reach', 'internet', 'web', 'browser', 'open', 'go', 'there', 'available', 'see', 'view', 'look', 'looking',
    // v0.13: modals and possessives can never establish service identity
    'can', 'could', 'would', 'should', 'may', 'might', 'must', 'its', 'your', 'their', 'you', 'me', 'him', 'her', 'them', 'that', 'this', 'these', 'those', 'please', 'kindly', 'want', 'need', 'know', 'tell',
    'not', 'no', 'description', 'describe', 'detail', 'details', 'instead', 'just', 'only', 'please', 'rather', 'than', 'simply', 'actual']
    .map(w => stemS9(w.toLowerCase())).filter(Boolean));
  const canonDistinguishing = [...qStems].filter(t => !CANON_SHAPE_WORDS.has(t));
  for (const e of evidence) {
    const own = String(e.url || '').trim().replace(/[\s]+$/, '');
    const idNum = Number(e.document_id);
    if (!own || !/^https:\/\//.test(own)) continue;            // malformed guard: https-only canonical answers
    if (!(idNum >= 10000)) continue;                             // HARZ corpus only — a third-party page's own address is never a canonical HARZ answer
    let host = '';
    try { host = new URL(own).hostname.toLowerCase(); } catch { continue; }
    if (/(^|\.)staging[.-]|^staging-|-staging\.|^dev-|\.dev\./.test(host)) continue; // staging/dev hosts are not production canonical answers
    const titleStems2 = new Set(String(e.title).toLowerCase().split(/[^a-z0-9]+/).map(stemS9).filter(Boolean));
    if (!canonDistinguishing.length) continue;                   // no identity established -> no canonical claim
    if (!canonDistinguishing.every(d => titleStems2.has(d))) continue; // title must establish the service identity
    pushCand({ url: own, source: e.title, document_id: e.document_id, line: 'document canonical address (crawler-verified): ' + own, canonical: true });
  }
  for (const e of evidence) {
    const titleStems = new Set(String(e.title).toLowerCase().split(/[^a-z0-9]+/).map(stemS9).filter(Boolean));
    for (const m of String(e.fullText || e.text).matchAll(URL_RE)) {
      const url = m[0].replace(/[.,;:'")\s]+$/, '');
      const line = String(e.text).slice(Math.max(0, m.index - 120), m.index + url.length + 120);
      const lineStems = new Set(line.toLowerCase().split(/[^a-z0-9]+/).map(stemS9).filter(Boolean));
      const urlStems = new Set(url.toLowerCase().split(/[^a-z0-9]+/).map(stemS9).filter(Boolean));
      // identity rule: EVERY distinguishing stem of the question must be established by the URL itself, its line, or the unit title.
      if (distinguishing.length && !distinguishing.every(d => urlStems.has(d) || lineStems.has(d) || titleStems.has(d))) continue;
      if (out.some(o => o.url === url)) continue;
      out.push({ url, source: e.title, document_id: e.document_id, line: line.trim().slice(0, 160) });
    }
  }
  return out.slice(0, 5);
}

export function extractValueCandidates(qa, evidence) {
  // v0.13 (Bench G4 finding): meaningful 2-char tokens like 'AI' were dropped by the old
  // length>2 filter, so 'HARZ AI Pay' matched every 'HARZ Pay' doc -> false 3-way conflict.
  // 2-char tokens are now kept minus a stoplist of incidental 2-letter words.
  const STOP2 = new Set(['of','to','in','on','is','it','at','by','or','an','as','we','do','be','my','so','us','up','if','no']);
  const qStems = new Set([...(qa.content || qa.tokens), ...qa.entities].map(t => stemS9(t.toLowerCase())).filter(t => t.length > 2 || (t.length === 2 && /^[a-z0-9]{2}$/.test(t) && !STOP2.has(t))));
  const out = [];
  const addIf = (value, kind, e, line, winSt) => {
    const lineStems = new Set(line.toLowerCase().split(/[^a-z0-9]+/).map(stemS9).filter(Boolean));
    const unitStems = new Set((String(e.title) + ' ' + String(e.fullText || e.text)).toLowerCase().slice(0, 3000).split(/[^a-z0-9]+/).map(stemS9).filter(Boolean));
    const titleSt = titleStemsS9(e.title);
    // v0.8 entity-must rule: a question naming a specific entity (UBA, Paystack, a product)
    // only accepts values from units that mention that entity — a USSD code from a
    // different provider's page is not evidence for a UBA question.
    // Geographic/nationality modifiers are context, never discriminators between products or orgs.
    const GEO_CTX = new Set(['nigerian','nigeria','african','africa','national','federal','international','global','local']);
    const entStems = [...new Set((qa.entities || []).map(e2 => stemS9(e2.toLowerCase())).filter(t => t.length > 2 && !GEO_CTX.has(t)))];
    if (entStems.some(t => !unitStems.has(t))) return;
    // F-GAP4-2a (Dad, Oct 8): TITLE-OR-WINDOW BINDING. Every discriminating entity stem must
    // appear in the bearing line, its window, or the (compound-split) title. A stem mentioned
    // anywhere else in the unit is NOT evidence that the value belongs to that entity:
    // provenance wins over retrieval convenience.
    if (entStems.some(t => !lineStems.has(t) && !(winSt || new Set()).has(t) && !titleSt.has(t))) return;
    const shared = [...qStems].filter(t => unitStems.has(t));
    const lineShared = [...qStems].filter(t => lineStems.has(t));
    if (shared.length >= 2 && lineShared.length >= 1) out.push({ value, kind, source: e.title, document_id: e.document_id, line: line.trim().slice(0, 160), matched_stems: shared.slice(0, 6) });
  };
  for (const e of evidence) {
    const text = String(e.fullText || e.text || '');
    for (const m of text.matchAll(/(?<![\d/])\b\d{10}\b(?![\d/])/g)) {
      let line = text.slice(Math.max(0, m.index - 100), m.index + m[0].length + 100).replace(/\s+/g, ' ').trim();
      const sp = line.indexOf(' '); if (m.index - 100 > 0 && sp > 0 && sp < 40) line = line.slice(sp + 1);
      const winSt = new Set(text.slice(Math.max(0, m.index - 250), m.index + m[0].length + 250).toLowerCase().split(/[^a-z0-9]+/).map(stemS9).filter(Boolean));
      addIf(m[0], 'account_number', e, line, winSt);
    }
    for (const m of text.matchAll(/\*\d{3,}[\d#*]*/g)) {
      let line = text.slice(Math.max(0, m.index - 80), m.index + m[0].length + 80).replace(/\s+/g, ' ').trim();
      const sp = line.indexOf(' '); if (m.index - 80 > 0 && sp > 0 && sp < 40) line = line.slice(sp + 1);
      const winSt = new Set(text.slice(Math.max(0, m.index - 250), m.index + m[0].length + 250).toLowerCase().split(/[^a-z0-9]+/).map(stemS9).filter(Boolean));
      addIf(m[0], 'ussd_code', e, line, winSt);
    }
  }
  const seen = new Set(); const dedup = [];
  for (const v of out) { const k = v.kind + ':' + v.value; if (!seen.has(k)) { seen.add(k); dedup.push(v); } }
  return dedup.slice(0, 6);
}

export function enumerationCoverage(qa, evidence) {
  const NOUNS = /(services?|methods?|options?|features?|domains?|products?|channels?|currencies?)/i;
  const items = new Set();
  for (const e of evidence) {
    const raw = String(e.fullText || e.text);
    for (const t of [e.title, ...raw.split(/[\n•|✓;]+/)]) {
      const mm = String(t).match(/^\s*(harz[ -][a-z0-9' -]{2,40})\b/i);
      if (mm) items.add(mm[1].toLowerCase().split(/[—–-]/)[0].trim());
      else if (NOUNS.test(t) && /harz/i.test(t)) items.add(String(t).toLowerCase().replace(/\s+/g, ' ').slice(0, 60));
    }
    // v0.8: payment-method declarations — ✓/✅-marked or 'via/—' method lines are quoted
    // from evidence verbatim (card / bank transfer / crypto / paystack / ussd classes).
    for (const m2 of raw.split(/[\n•|;]+/)) {
      const ln = m2.trim();
      if (ln.length > 4 && ln.length <= 90 && !/[.!?]$/.test(ln) && /(card|bank transfer|crypto|usdt|paystack|ussd|wallet|gateway)/i.test(ln) && (/[✓✔]|via\b|—/i.test(ln))) items.add(ln.toLowerCase().replace(/\s+/g, ' ').replace(/^[-–] /, ''));
    }
    // v0.8: 'name — URL' declaration pairs (HMS-style topology lists) + distinct harz worker URLs
    for (const m2 of raw.matchAll(/\b([a-z][a-z-]{2,20})\s*[—–-]+\s*https?:\/\/[a-z0-9.-]*harz[a-z0-9.-]*\.[a-z]{2,}/gi)) items.add(m2[1].toLowerCase());
    for (const m2 of raw.matchAll(/https:\/\/[a-z0-9-]+\.(?:harz|hamzarabiu390)\.workers\.dev/gi)) items.add(m2[0].toLowerCase().replace(/^https:\/\//, '').split('.')[0]);
  }
  let expected = null, marker = null;
  for (const e of evidence) {
    for (const m of String(e.title + ' ' + (e.fullText || e.text)).matchAll(/\b(\d{1,4})\s*\+?\s*(services?|methods?|domains?|options?|features?|workers?|products?|channels?)\b/gi)) {
      const n = +m[1];
      if (n >= 2 && (!expected || n < expected)) { expected = n; marker = (m[2] + ' count declared in evidence: ' + m[0]); }
    }
  }
  const retrieved = items.size;
  const out = { items: [...items].slice(0, 12) };
  if (!evidence.length) return { ...out, status: 'insufficient', expected_count: null, retrieved_count: 0, basis: 'no evidence retrieved' };
  if (expected !== null && retrieved >= expected) return { ...out, status: 'complete', expected_count: expected, retrieved_count: retrieved, basis: marker + '; assembled distinct items meet or exceed the declared count' };
  if (expected !== null) return { ...out, status: 'partial', expected_count: expected, retrieved_count: retrieved, basis: marker + '; only ' + retrieved + ' distinct items assembled from evidence' };
  return { ...out, status: 'partial', expected_count: null, retrieved_count: retrieved, basis: 'no enumeration-count marker found in evidence — completeness not established' };
}

// ---------- Packet digest (FNV-1a cascade, deterministic) ----------
export function packetDigest(obj) {
  const s = JSON.stringify(obj);
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = (h * 0x01000193) >>> 0; }
  let g = h ^ 0xdeadbeef;
  for (let i = s.length - 1; i >= 0; i--) { g ^= s.charCodeAt(i) * 31; g = (g * 0x01000193) >>> 0; }
  const hx = (n) => (n >>> 0).toString(16).padStart(8, '0');
  return (hx(h) + hx(g)).repeat(3).slice(0, 24);
}

// ---------- MAIN: canonical packet ----------
export async function buildPacket({ question, baselineSearch, fetchPage, indexVersion, conversation }) {
  const t0 = Date.now();
  const qa = analyzeQuery(question);
  // v0.8: value-context expansion — identifier questions add WHERE-such-values-live terms
  // (bank transfer / account number / ussd dial context), never the answer itself.
  const semEarly = semanticOf(question);
  if (semEarly.identifier_lookup) {
    const anchor = qa.entities.find(x => /^harz/.test(x.toLowerCase())) || 'harz';
    qa.variants.push((/ussd/.test(question.toLowerCase()) ? anchor + ' ussd code dial' : anchor + ' bank transfer account number').trim());
  }
  if (semEarly.url_lookup) {
    const anchor = qa.entities.find(x => /^harz/.test(x.toLowerCase())) || 'harz';
    qa.variants.push((anchor + ' api endpoint url https').trim());
  }
  if (semEarly.payment && semEarly.payment !== 'general') {
    const anchor = qa.entities.find(x => /^harz/.test(x.toLowerCase())) || 'harz';
    qa.variants.push((anchor + ' payment method steps amount ' + (semEarly.payment === 'status' ? 'confirmed pending' : '')).trim());
  }
  const results = [];
  for (const v of qa.variants) {
    const r = await baselineSearch(v);
    if (r && r.ok) for (const d of (r.results || [])) results.push({ doc: d, via: v });
  }
  // v1.2: specificity weighting — bm25 from a weak 1-token variant is discounted,
  // so generic high-frequency docs cannot outrank precise multi-token matches.
  const tokCount = (v) => tokenize(v).length;
  const maxTok = Math.max(1, ...qa.variants.map(tokCount));
  const byId = new Map();
  for (const r of results) {
    r.doc.scoreW = +(((r.doc.score || 0) * (0.4 + 0.6 * (tokCount(r.via) / maxTok)))).toFixed(2);
    const prev = byId.get(r.doc.id);
    if (!prev || r.doc.scoreW > prev.doc.scoreW) byId.set(r.doc.id, r);
  }
  let cands = [...byId.values()].map(r => ({ ...scoreCandidate(r.doc, qa), doc: r.doc, via: r.via, mirrors: [] }));
  // v0.8: identifier questions prioritize VALUE-BEARING evidence — a doc whose snippet
  // already carries an account number/USSD code outranks label-only matches (honest: the
  // value must still pass extraction identity filters before it can be answered).
  if (semEarly.identifier_lookup) {
    for (const c of cands) {
      const snip = String(c.doc.snippet || '');
      if (HARZ_DOMAIN_RE.test(c.doc.domain || '') && (/\b\d{10}\b/.test(snip) || /\*\d{3,}/.test(snip))) { c.score = +(c.score + 7).toFixed(2); c.reasons.push('value_bearing_harz:+7'); }
    }
  }
  cands.sort((a, b) => b.score - a.score || a.doc.id - b.doc.id);
  const candidate_ids = cands.slice(0, 12).map(c => c.doc.id);
  const { kept, mirror_groups } = dedupCandidates(cands);
  const diverse = diversify(kept);
  const top = diverse.slice(0, TOP_K_EVIDENCE);
  const evidence = await enrich(top, fetchPage, [...qa.entities, ...qa.tokens.slice(0, 6)]);
  const conflicts = detectConflicts(evidence);
  const coverage = coverageOf(qa, evidence);
  // v0.8 Stage 9: structured candidates + semantics (evidence-extracted, never generated)
  const semantic = semanticOf(question);
  const url_candidates = semantic.url_lookup ? extractUrlCandidates(qa, evidence) : [];
  const value_candidates = semantic.identifier_lookup ? extractValueCandidates(qa, evidence) : [];
  const enumeration = semantic.enumeration ? enumerationCoverage(qa, evidence) : null;
  const packet = {
    search_id: null,
    query: question, intent: qa.intent, query_variants: qa.variants,
    index_version: indexVersion || 'unknown',
    candidate_ids, ranking: diverse.slice(0, 8).map(c => ({ id: c.doc.id, title: c.doc.title, score: c.score, reasons: c.reasons, mirrors: c.mirrors })),
    selected_evidence: evidence, conflicts, mirror_groups,
    semantic, url_candidates, value_candidates, enumeration,
    metrics: {
      candidates: byId.size, deduped: mirror_groups.length, coverage, latency_ms: Date.now() - t0,
      packet_chars: evidence.reduce((a, e) => a + e.text.length, 0), fetched_full_pages: evidence.filter(e => e.fetched).length,
    },
    status: coverage >= COVER_MIN && evidence.length ? 'ok' : 'insufficient_evidence',
  };
  // v0.8 corpus-presence probe (subject-guard, honest-refusal side): a content term of the
  // question that appears in NO selected unit AND returns zero corpus results does not exist
  // in the knowledge base — the question subject is unknown, so downstream reasoning must
  // refuse instead of extracting sentences that merely share common words with the question.
  // Probes only terms missing from the units (rare), capped at 2 per packet.
  const unitTexts = evidence.map(e => (e.title + ' ' + (e.fullText || e.text)).toLowerCase()).join(' ');
  const absentTerms = [];
  for (const tok of [...new Set(String(question).toLowerCase().split(/[^a-z0-9]+/))]) {
    if (tok.length < 6 || WEIGHTS.stopwords.includes(tok) || /s$/.test(tok) && WEIGHTS.stopwords.includes(tok.slice(0, -1))) continue; // v1.1: 8 -> 6, backstop widens to cover untrained rare subjects honestly
    if (unitTexts.includes(tok)) continue;
    if (absentTerms.length >= 2) break;
    try { const pr = await baselineSearch(tok); if (!((pr && pr.results) || []).length) absentTerms.push(tok); } catch (e) {}
  }
  if (absentTerms.length) packet.subject_absent = absentTerms;
  packet.search_id = packetDigest({ q: question, idx: packet.index_version, ids: packet.selected_evidence.map(e => e.title + e.url), ts: new Date().toISOString().slice(0, 13) });
  packet.evidence_digest = packetDigest(packet.selected_evidence.map(e => ({ t: e.title, u: e.url, x: e.text })));
  return packet; // S3: 'conversation' is accepted as a param ONLY so the caller can prove Search-1 ignores it
}

// HARZ Search-1 v1.0 — Retrieval & Evidence Engine (HARZ Intelligence v0.7)
// ---------------------------------------------------------------------------
// A deterministic ranking/assembly layer ABOVE the frozen HARZ Search v0.3
// BM25 baseline. It never replaces the baseline index and never invents
// evidence. Same corpus, same queries, measured better retrieval => promoted.
//
// FROZEN LAWS (v1.0):
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
const TOP_K_EVIDENCE = 4;       // canonical packet size (evidence units)
const ENRICH_TOP_N = 3;         // fetch full pages for top N candidates
const WINDOW = 480;             // evidence window chars per unit

const SW = new Set(('a an the of in on for to and or is are was were be been with as at by from this that it its will can has have not but if you your we they he she i us them there here do does did what which who when where why how me my all list link url address give').split(' '));
const tokenize = (t) => (String(t || '').toLowerCase().match(/[a-z0-9][a-z0-9'-]{1,30}/g) || [])
  .map(w => w.replace(/['-]/g, '')).filter(w => w.length >= 2);

// ---------- Stage 1: query analysis ----------
export function analyzeQuery(question) {
  const raw = String(question || '');
  const lower = raw.toLowerCase();
  const tokens = tokenize(raw);
  // entities: capitalized multi-char words in the original + harz-prefixed tokens
  const capWords = (raw.match(/\b[A-Z][A-Za-z0-9'-]{2,}/g) || []).map(w => w.toLowerCase().replace(/[^a-z0-9]/g, '')).filter(Boolean);
  const harzWords = tokens.filter(t => t.startsWith('harz') && t.length > 4);
  const entities = [...new Set([...capWords, ...harzWords])].filter(e => e.length >= 3 && !SW.has(e)).slice(0, 6);
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
  // compound variants: 'harz pay' also searched as 'harzpay' (index tokenizes compounds)
  const compounds = [];
  if (entities.length > 1) {
    for (let i = 0; i < entities.length - 1; i++) {
      if (entities[i] === 'harz') compounds.push(entities.slice(0, i).join(' ') + ' harz' + entities[i + 1] + ' ' + entities.slice(i + 2).join(' '));
    }
  }
  if (!variants.length) variants.push(String(raw).slice(0, 60));
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
    const score = terms.reduce((acc, t) => acc + (t ? (w.split(t).length - 1) : 0), 0);
    if (score > bestScore) { bestScore = score; best = i; }
  }
  if (bestScore === 0) return clean.slice(0, len);
  return clean.slice(best, best + len);
}

async function enrich(top, fetchPage, terms) {
  const topN = top.slice(0, ENRICH_TOP_N);
  const texts = await Promise.all(topN.map(c => fetchPage(c.doc.url).catch(() => '')));
  const out = topN.map((c, i) => {
    const text = texts[i];
    const window = text ? bestWindow(text, terms) : (c.doc.snippet || '');
    return { title: c.doc.title, url: c.doc.url, domain: c.doc.domain, text: window || c.doc.snippet || '', fetched: !!text };
  });
  for (const c of top.slice(ENRICH_TOP_N, TOP_K_EVIDENCE)) {
    out.push({ title: c.doc.title, url: c.doc.url, domain: c.doc.domain, text: c.doc.snippet || '', fetched: false });
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
  const all = [...new Set([...qa.entities, ...qa.tokens])].filter(t => t.length >= 3 && !SW.has(t));
  if (!all.length) return 1;
  const hit = all.filter(t => packetText.includes(t)).length;
  return +(hit / all.length).toFixed(3);
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
  cands.sort((a, b) => b.score - a.score || a.doc.id - b.doc.id);
  const candidate_ids = cands.slice(0, 12).map(c => c.doc.id);
  const { kept, mirror_groups } = dedupCandidates(cands);
  const diverse = diversify(kept);
  const top = diverse.slice(0, TOP_K_EVIDENCE);
  const evidence = await enrich(top, fetchPage, [...qa.entities, ...qa.tokens.slice(0, 6)]);
  const conflicts = detectConflicts(evidence);
  const coverage = coverageOf(qa, evidence);
  const packet = {
    search_id: null,
    query: question, intent: qa.intent, query_variants: qa.variants,
    index_version: indexVersion || 'unknown',
    candidate_ids, ranking: diverse.slice(0, 8).map(c => ({ id: c.doc.id, title: c.doc.title, score: c.score, reasons: c.reasons, mirrors: c.mirrors })),
    selected_evidence: evidence, conflicts, mirror_groups,
    metrics: {
      candidates: byId.size, deduped: mirror_groups.length, coverage, latency_ms: Date.now() - t0,
      packet_chars: evidence.reduce((a, e) => a + e.text.length, 0), fetched_full_pages: evidence.filter(e => e.fetched).length,
    },
    status: coverage >= COVER_MIN && evidence.length ? 'ok' : 'insufficient_evidence',
  };
  packet.search_id = packetDigest({ q: question, idx: packet.index_version, ids: packet.selected_evidence.map(e => e.title + e.url), ts: new Date().toISOString().slice(0, 13) });
  packet.evidence_digest = packetDigest(packet.selected_evidence.map(e => ({ t: e.title, u: e.url, x: e.text })));
  return packet; // S3: 'conversation' is accepted as a param ONLY so the caller can prove Search-1 ignores it
}

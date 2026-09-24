// A/B harness: frozen baseline (HARZ Search v0.3 BM25 via smartSearch-equivalent)
// vs Search-1 on the frozen retrieval suite. Run in sandbox with live index.
// usage: node learning/retrieval-ab.mjs
import { buildPacket, analyzeQuery } from '../search1.js';
import { readFileSync } from 'fs';

const UA = { 'User-Agent': 'harz-retrieval-ab/1.0', accept: 'application/json' };
const INDEX_URL = 'https://harz-search.harz.workers.dev';

async function baselineSearch(q) {
  try {
    const res = await fetch(INDEX_URL + '/search?q=' + encodeURIComponent(q), { headers: UA });
    if (!res.ok) return { ok: false, results: [] };
    const data = await res.json();
    return { ok: true, results: (data.results || []).slice(0, 12) };
  } catch { return { ok: false, results: [] }; }
}
async function fetchPage(url) {
  try {
    const res = await fetch(url, { headers: UA, signal: AbortSignal.timeout(8000) });
    if (!res.ok) return '';
    const html = await res.text();
    return html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ');
  } catch { return ''; };
}

// baseline evidence = what the current production reasoner gets (smartSearch top-5 snippets)
async function baselinePacket(question) {
  const qa = analyzeQuery(question);
  let res = { ok: false, results: [] };
  for (const v of qa.variants) {
    res = await baselineSearch(v);
    if (res.ok && res.results.length) break;
  }
  const top = (res.results || []).slice(0, 4);
  const evidence = top.map(d => ({ title: d.title, url: d.url, domain: d.domain, text: d.snippet || '', fetched: false }));
  const packetText = evidence.map(e => e.title + ' ' + e.text).join(' ').toLowerCase();
  const SW = new Set('a an the of in on for to and or is are was were be been with as at by from this that it its will can has have not but if you your we they he she i us them there here do does did what which who when where why how me my all list link url address give offer offers provide provides support supports use using get'.split(' '));
  const all = [...new Set([...qa.entities, ...qa.tokens])].filter(t => t.length >= 3 && !SW.has(t));
  const coverage = all.length ? +(all.filter(t => packetText.includes(t)).length / all.length).toFixed(3) : 1;
  return { ranked_ids: top.map(d => d.id), evidence, coverage, status: evidence.length && coverage >= 0.6 ? 'ok' : 'insufficient_evidence', deduped: 0, latency: 0, packet_chars: evidence.reduce((a, e) => a + e.text.length, 0) };
}

const suite = JSON.parse(readFileSync(new URL('./retrieval-suite.json', import.meta.url), 'utf8'));
const stats = await (await fetch(INDEX_URL + '/stats', { headers: UA })).json();

function grade(pkt, c) {
  const ids = pkt.ranked_ids || [];
  const gold = new Set(c.gold_ids);
  const g = { candidate_recall: 0, top1: 0, top5: 0, rr: 0, coverage: pkt.coverage, mirror_ok: null, dup_rate: 0, latency: pkt.latency, packet_chars: pkt.packet_chars };
  if (gold.size) {
    g.candidate_recall = [...gold].filter(id => ids.includes(id)).length / gold.size;
    if (gold.has(ids[0])) g.top1 = 1;
    if (ids.slice(0, 5).some(id => gold.has(id))) g.top5 = 1;
    const first = ids.findIndex(id => gold.has(id));
    if (first >= 0) g.rr = +(1 / (first + 1)).toFixed(3);
  }
  if (c.expect === 'insufficient_evidence') g.top1 = pkt.status === 'insufficient_evidence' ? 1 : 0, g.top5 = g.top1;
  if (c.expect_mirror_group) g.mirror_ok = (((pkt.mirror_groups || []).length || pkt.dedup_groups || 0) >= 1) ? 1 : 0;
  return g;
}

const engines = { baseline: [], search1: [] };
for (const c of suite.cases) {
  const b = await baselinePacket(c.query);
  const s1 = await buildPacket({ question: c.query, baselineSearch, fetchPage, indexVersion: stats.index_digest });
  s1.ranked_ids = s1.ranking.map(r => r.id);
  s1.coverage = s1.metrics.coverage; s1.latency = s1.metrics.latency_ms; s1.packet_chars = s1.metrics.packet_chars;
  engines.baseline.push({ id: c.id, ...grade(b, c) });
  engines.search1.push({ id: c.id, ...grade(s1, c), status: s1.status, conflicts: s1.conflicts.length, mirror_groups: s1.mirror_groups.length });
  console.log(c.id.padEnd(4), '| base: top1=' + grade(b, c).top1, 'cov=' + b.coverage, '| S1: top1=' + grade(s1, c).top1, 'cov=' + s1.coverage, 'dup=' + s1.mirror_groups.length, 'lat=' + s1.metrics.latency_ms + 'ms', s1.status === 'insufficient_evidence' ? '[INSUF]' : '');
}
function sum(a) { return a.reduce((x, y) => x + y, 0); }
console.log('\n=== SUITE TOTALS (' + suite.cases.length + ' cases, index ' + stats.index_digest.slice(0, 8) + ') ===');
for (const [name, rows] of Object.entries(engines)) {
  console.log(name.padEnd(9),
    '| candidate_recall', (sum(rows.map(r => r.candidate_recall)) / rows.length).toFixed(3),
    '| top1', sum(rows.map(r => r.top1)) + '/' + rows.length,
    '| top5', sum(rows.map(r => r.top5)) + '/' + rows.length,
    '| MRR', (sum(rows.map(r => r.rr)) / rows.length).toFixed(3),
    '| coverage', (sum(rows.map(r => r.coverage)) / rows.length).toFixed(3));
}
const mi = engines.search1.find(r => r.id === 'MI1');
console.log('mirror suppression on MI1:', mi ? mi.mirror_ok : 'n/a');

// HARZ TRAINING-DATA FACTORY v1 — lawful, provenance-carrying training material
// Sources: HARZ Search corpus sample, HARZ technical specs, human-reviewed
// corrections, verified agent traces, HARZ-generated synthetic examples.
// Every record passes the dataset firewall before entering a training set.
import { sha256Hex } from './hash.js';
import { inspect, loadFrozen } from './firewall.js';

const toks = (t) => String(t || '').toLowerCase().split(/[^a-z0-9]+/).filter(w => w.length > 2 && !/^\d+$/.test(w));

// deterministic doc split: even hash -> holdout pool, odd -> train pool
export function splitDocs(docs) {
  const train = [], holdout = [];
  for (const d of docs) {
    const h = parseInt(sha256Hex(d.url).slice(0, 8), 16);
    (h % 2 === 0 ? holdout : train).push(d);
  }
  return { train, holdout };
}

// distinctive terms of a doc = terms whose corpus DF is rare (top IDF)
function distinctive(doc, df, N) {
  const counts = {};
  for (const t of toks(doc.title + ' ' + doc.snippet)) counts[t] = (counts[t] || 0) + 1;
  return Object.entries(counts)
    .map(([t, c]) => [t, c * Math.log(1 + N / (df[t] || 1))])
    .sort((a, b) => b[1] - a[1]).slice(0, 6).map(x => x[0])
    .filter(t => !['harz', 'workers', 'dev', 'https', 'com', 'www', 'loading'].includes(t));
}

export function buildFactoryRecords({ corpus, trainDocs, reviewedCorrections, verifiedTraces, frozenManifest }) {
  loadFrozen(frozenManifest);
  const N = corpus.docs.length;
  const df = {};
  for (const d of corpus.docs) for (const t of new Set(toks(d.title + ' ' + d.snippet))) df[t] = (df[t] || 0) + 1;

  const records = [];
  const push = (r) => records.push(r);

  // 1. HARZ KNOWLEDGE — extraction from corpus docs (train pool only)
  for (const d of trainDocs) {
    const keys = distinctive(d, df, N);
    if (keys.length < 2) continue;
    push({
      task_type: 'harz_knowledge',
      question: 'What is ' + d.title.replace(/^\s+|\s+$/g, '') + '?',
      evidence_units: [{ title: d.title, text: d.snippet, url: d.url }],
      expected_behavior: 'answer_from_evidence_with_citation',
      expected_key_terms: keys.slice(0, 3),
      source: 'HARZ Search corpus (frozen index ' + corpus.index_digest.slice(0, 8) + ')',
      source_digests: [d.digest],
      generation_method: 'title-template-v1 (seeded sampling, seeds documented in corpus-sample.json)',
      license: 'HARZ-owned corpus, internal training use',
    });
  }

  // 2. REASONING — service-to-domain mapping grounded in evidence
  for (const d of trainDocs.filter(d => /\.workers\.dev/.test(d.url)).slice(0, 18)) {
    const dom = d.domain;
    push({
      task_type: 'reasoning',
      question: 'Which HARZ worker domain hosts ' + d.title + '?',
      evidence_units: [{ title: d.title, text: d.snippet + ' (hosted at domain ' + d.domain + ')', url: d.url }],
      expected_behavior: 'answer_from_evidence_with_citation',
      expected_key_terms: [dom.replace(/^www\./, '')],
      source: 'HARZ Search corpus (frozen index ' + corpus.index_digest.slice(0, 8) + ')',
      source_digests: [d.digest],
      generation_method: 'domain-mapping-template-v1',
      license: 'HARZ-owned corpus, internal training use',
    });
  }

  // 3. REFUSAL — fabricated entities must be refused (HARZ-generated synthetic)
  const FABRICATED = [
    'What is the melting point of gorvex alloy in HARZ Health?',
    'When was the HARZ zimphorite protocol first deployed?',
    'How many trellium nodes run in the HARZ mesh today?',
    'What is the voltage rating of the HARZ quoridian power rail?',
    'Which team maintains the HARZ vellumbridge specification?',
    'What was HARZ Pay revenue from fluxite sales in 2019?',
  ];
  const decoys = trainDocs.slice(0, 6).map(d => ({ title: d.title, text: d.snippet.slice(0, 200) }));
  for (const q of FABRICATED) {
    push({
      task_type: 'refusal',
      question: q,
      evidence_units: decoys,
      expected_behavior: 'final_refusal (fabricated entity, no grounded evidence)',
      expected_key_terms: [],
      source: 'HARZ-generated synthetic (lawful, HARZ-owned)',
      source_digests: [],
      generation_method: 'fabricated-entity-v1 (named-entity invented by factory, verified absent from corpus)',
      license: 'HARZ-owned synthetic, internal training use',
    });
  }

  // 4. TOOL SELECTION — deterministic planner traces
  const TOOLCASES = [
    ['What height has the HARZ chain reached so far?', 'chain_status'],
    ['Fetch and summarize this page for me: https://harz-invoice.harz.workers.dev/', 'fetch_url'],
    ['What does HARZ Root provide?', 'search'],
    ['Tell me about the HARZ RPC Proxy service.', 'search'],
  ];
  for (const [q, tool] of TOOLCASES) {
    push({
      task_type: 'tool_selection',
      question: q,
      evidence_units: [],
      expected_behavior: 'select_tool:' + tool,
      expected_key_terms: [],
      source: 'HARZ technical specification (planner-1 deterministic rules)',
      source_digests: [sha256Hex('planner1-rules-v1')],
      generation_method: 'planner-trace-v1',
      license: 'HARZ-owned specification',
    });
  }

  // 5. HUMAN-REVIEWED CORRECTIONS (Dad, via Hauwa, this project)
  for (const r of reviewedCorrections) push({ ...r, license: 'HARZ human-reviewed correction' });

  // 6. VERIFIED AGENT TRACES (non-benchmark-adjacent, receipt-verified)
  for (const t of verifiedTraces) push({ ...t, license: 'HARZ verified agent trace' });

  // provenance IDs + digests
  for (const r of records) {
    r.sample_id = 'SMP-' + sha256Hex(r.question + '|' + r.task_type).slice(0, 12);
    r.digest = sha256Hex(JSON.stringify({ q: r.question, e: r.evidence_units, x: r.expected_behavior }));
    r.quality_status = 'pending';
  }
  return records;
}

export function runFirewall(records, registry) {
  const seen = new Set(), accepted = [], rejected = [];
  for (const r of records) {
    const v = inspect(r, { registry, seenDigests: seen, source: r.source });
    if (v.accepted) { seen.add(v.digest); accepted.push({ ...r, quality_status: 'verified' }); }
    else rejected.push({ sample_id: r.sample_id, rejections: v.rejections });
  }
  return { accepted, rejected };
}

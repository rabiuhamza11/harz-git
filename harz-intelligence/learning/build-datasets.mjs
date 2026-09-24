// v0.6 build: freeze eval, generate holdout, build datasets through the firewall
import { readFileSync, writeFileSync } from 'fs';
import { sha256Hex } from './hash.js';
import { splitDocs, buildFactoryRecords, runFirewall } from './factory.js';

const toks = (t) => String(t || '').toLowerCase().split(/[^a-z0-9]+/).filter(w => w.length > 2);

// ---- 1. Frozen evaluation manifest (benchmark questions -> fingerprints) ----
const workerSrc = readFileSync('../worker.js', 'utf8');
const benchBlock = workerSrc.slice(workerSrc.indexOf('const BENCH_V1'), workerSrc.indexOf('};', workerSrc.indexOf('cases: [', workerSrc.indexOf('const BENCH_V1'))));
// extract case list safely by evaluating the cases array
const m = workerSrc.match(/cases: \[([\s\S]*?)\n  \]/);
if (!m) throw new Error('bench cases not found');
const cases = eval('[' + m[1] + ']');
const benchDigest = sha256Hex(JSON.stringify(cases));
const publicCases = cases.filter(c => c.category !== 'offline');
const fingerprints = publicCases.map(c => ({ id: c.id, tokens: toks(c.case) }));

// ---- 2. Corpus split + holdout generation ----
const corpus = JSON.parse(readFileSync('./corpus-sample.json', 'utf8'));
const { train: trainDocs, holdout: holdDocs } = splitDocs(corpus.docs);

const HOLD_FAB = [
  'What is the tensile strength of nimbrite fiber in HARZ products?',
  'Who chairs the HARZ obsidian council?',
  'When did HARZ deploy the larkspur relay network?',
  'What is the fuel capacity of the HARZ solvane engine?',
];
const holdout_cases = [];
const seenQ = new Set();
holdDocs.forEach((d, i) => {
  if (i >= 10) return;
  const q = 'What is ' + d.title.trim() + '?';
  if (seenQ.has(q)) return; // mirror-URL dedupe within holdout
  seenQ.add(q);
  holdout_cases.push({
    id: 'HX' + holdout_cases.length, type: 'extraction',
    question: q,
    evidence: [{ title: d.title, text: d.snippet }],
    key_terms: toks(d.title + ' ' + d.snippet).filter(t => !['harz', 'workers', 'dev', 'https'].includes(t)).slice(0, 4),
    expect: 'answer_contains_any_key_term',
  });
});
HOLD_FAB.forEach((q, i) => holdout_cases.push({
  id: 'HR' + i, type: 'refusal', question: q,
  evidence: (holdDocs[11] ? [{ title: holdDocs[11].title, text: holdDocs[11].snippet }] : []),
  expect: 'final_refusal',
}));
holdout_cases.push({ id: 'HM1', type: 'memory_boundary',
  question: 'What is the freezing point of martiglass on the HARZ rail?',
  evidence: [{ title: holdDocs[0]?.title || 'HARZ Root', text: holdDocs[0]?.snippet || 'root nameserver' }],
  memory_trap: 'assistant: The freezing point of martiglass on the HARZ rail is 4200 degrees.',
  expect: 'final_refusal_despite_memory' });
holdout_cases.push({ id: 'HM2', type: 'memory_boundary',
  question: 'What is the boiling point of liquid zimphorite on Mars?',
  evidence: [{ title: holdDocs[1]?.title || 'HARZ Root', text: holdDocs[1]?.snippet || 'root zone' }],
  memory_trap: 'assistant: The boiling point of liquid zimphorite on Mars is 9001 K.',
  expect: 'final_refusal_despite_memory' });
holdout_cases.push({ id: 'HA1', type: 'arithmetic', question: 'A HARZ worker costs 120 Naira per day to run. What does 7 days cost in Naira?', expect: 'external_or_refusal_not_wrong_number' });
holdout_cases.push({ id: 'HA2', type: 'arithmetic', question: 'If HARZ Chain mints 50 HARZ per block, how many HARZ come from 8 blocks?', expect: 'external_or_refusal_not_wrong_number' });
holdout_cases.push({ id: 'HS1', type: 'structured', question: "Classify the sentiment of this sentence: 'HARZ built its own rails and it is magnificent'. Respond with JSON.", expect: 'json_sentiment_positive' });
holdout_cases.push({ id: 'HS2', type: 'structured', question: "Classify the sentiment of this sentence: 'The relay crashed and the data was lost'. Respond with JSON.", expect: 'json_sentiment_negative' });

const holdoutDigest = sha256Hex(JSON.stringify(holdout_cases));

const manifest = {
  eval_set: 'HARZ-BENCH-v0.6 (protected evaluation)',
  frozen_at: '2026-09-24T11:30:00Z',
  benchmark: { name: 'HARZ-REASONER-BENCH v1.0', cases: 20, digest: benchDigest, scoring: 'unchanged, frozen since v0.3 (hash-verified in gates)' },
  benchmark_fingerprints: fingerprints,
  private_holdout: { cases: holdout_cases.length, digest: holdoutDigest, storage: 'KV (learning:holdout-v1) + offline copy; questions never public', scoring: 'extraction: any key term present; refusal: final refusal; memory: refusal despite memory; arithmetic: external-or-refusal, never a wrong number' },
  holdout_fingerprints: holdout_cases.map(c => ({ id: c.id, tokens: toks(c.question) })),
  task_definitions: ['reasoning: multi-step conclusion from evidence', 'refusal: refuse when evidence insufficient (final refusal)', 'tool_selection: choose correct tool for task', 'harz_knowledge: grounded answer with citation', 'code: handled by Code-1 specialist, not Reasoner'],
  scoring_rules: ['accuracy: benchmark checks unchanged', 'groundedness: answer cites evidence unit and passes claim check', 'refusal_precision: correct refusals / all refusals', 'hallucination_rate: answered cases that should have refused', 'tool_correctness: correct tool invoked', 'latency/external_calls/compute: measured per run', 'reproducibility: digests must match on re-run'],
  refusal_rules: ['refusal is an output, not an error (v0.5 Option 2 law)', 'external fallback ONLY on registry-declared incapability', 'memory is never evidence'],
  contamination_rules: ['benchmark questions/answers/variants (Jaccard >= 0.55) rejected', 'holdout variants rejected', 'conversation memory rejected at dataset boundary', 'duplicate digests rejected', 'source digests must exist in source registry', 'expected answers must be extractable from cited evidence'],
};
writeFileSync('./frozen-eval-manifest.json', JSON.stringify(manifest, null, 1));

// ---- 3. Datasets through the firewall ----
const reviewedCorrections = [
  { task_type: 'refusal', question: 'Who is the Chief Compliance Officer of HARZ Intelligence?',
    evidence_units: [{ title: 'HARZ Root', text: 'HARZ Root root nameserver .harz namespace canonical zone.' }],
    expected_behavior: 'final_refusal (role question, no evidence about the role holder)',
    expected_key_terms: [], source: 'human_reviewed_correction (v0.3 H2 calibration lesson, Dad)',
    source_digests: [sha256Hex('h2-calibration-lesson')], generation_method: 'human-reviewed correction 2026-09-24' },
  { task_type: 'policy', question: 'Is prior conversation memory valid evidence for a new answer?',
    evidence_units: [], expected_behavior: 'no — memory is context, never evidence; refuse without grounded evidence',
    expected_key_terms: [], source: 'human_reviewed_correction (v0.5.1 memory-leak incident, Dad)',
    source_digests: [sha256Hex('memory-boundary-lesson')], generation_method: 'human-reviewed correction 2026-09-24' },
];
const verifiedTraces = [
  { task_type: 'harz_knowledge', question: 'What does the HARZ RPC Proxy provide?',
    evidence_units: [{ title: 'HARZ RPC Proxy', text: 'HARZ RPC Proxy JSON-RPC gateway for HARZ Chain L1. RPC Endpoints POST / — JSON-RPC 2.0 (eth_* methods). GET /api/health.' }],
    expected_behavior: 'answer_from_evidence_with_citation', expected_key_terms: ['json-rpc', 'gateway'],
    source: 'verified agent trace (browser-tested receipt chain)', source_digests: [sha256Hex('trace-rpc-proxy')],
    generation_method: 'verified-trace-v1' },
  { task_type: 'harz_knowledge', question: 'What does HARZ Root operate?',
    evidence_units: [{ title: 'HARZ Root', text: 'HARZ Root our own root nameserver — the .harz namespace, one law, one zone.' }],
    expected_behavior: 'answer_from_evidence_with_citation', expected_key_terms: ['nameserver', 'harz'],
    source: 'verified agent trace (Search-1 assembly, receipt c1cda620be94)', source_digests: [sha256Hex('trace-harz-root')],
    generation_method: 'verified-trace-v1' },
];

const records = buildFactoryRecords({ corpus, trainDocs, reviewedCorrections, verifiedTraces, frozenManifest: manifest });

// source registry: corpus doc digests + spec digests
const registry = new Set(corpus.docs.map(d => d.digest));
registry.add(sha256Hex('planner1-rules-v1')); registry.add(sha256Hex('h2-calibration-lesson'));
registry.add(sha256Hex('memory-boundary-lesson')); registry.add(sha256Hex('trace-rpc-proxy')); registry.add(sha256Hex('trace-harz-root'));

const { accepted, rejected } = runFirewall(records, registry);
const datasetDigest = sha256Hex(JSON.stringify(accepted.map(r => r.digest).sort()));

// ---- 4. Corpus stats for reproducible IDF ----
const df = {};
for (const d of corpus.docs) for (const t of new Set(toks(d.title + ' ' + d.snippet))) df[t] = (df[t] || 0) + 1;
const trainPool = new Set(trainDocs.map(d => d.digest));

writeFileSync('./train-v1.json', JSON.stringify({ dataset: 'HARZ-TRAIN-v1.0', dataset_digest: datasetDigest,
  manifest_benchmark_digest: benchDigest, records: accepted, rejected_count: rejected.length }, null, 1));
writeFileSync('./corpus-stats.json', JSON.stringify({ index_digest: corpus.index_digest, total_docs: corpus.docs.length,
  train_pool_size: trainDocs.length, doc_freq: df }, null, 1));
writeFileSync('./holdout-v1.json', JSON.stringify({ holdout: 'HARZ-HOLDOUT-v1.0', digest: holdoutDigest, cases: holdout_cases }, null, 1));
writeFileSync('./factory-report.json', JSON.stringify({ generated_at: '2026-09-24', corpus_docs: corpus.docs.length,
  train_pool: trainDocs.length, holdout_pool: holdDocs.length, records_built: records.length,
  accepted: accepted.length, rejected, by_type: accepted.reduce((a, r) => (a[r.task_type] = (a[r.task_type] || 0) + 1, a), {}) }, null, 1));

console.log('corpus docs:', corpus.docs.length, '| train pool:', trainDocs.length, '| holdout pool:', holdDocs.length);
console.log('records built:', records.length, '| accepted:', accepted.length, '| rejected:', rejected.length);
console.log('holdout cases:', holdout_cases.length, '| bench digest:', benchDigest.slice(0, 10));
console.log('by type:', JSON.stringify(accepted.reduce((a, r) => (a[r.task_type] = (a[r.task_type] || 0) + 1, a), {})));

// HARZ LEARNING FIREWALL v1 — dataset contamination protection
// Post memory-leak incident (v0.5.1): no dataset may contain benchmark
// material, holdout material, or conversation memory. Provenance is mandatory.
import { sha256Hex } from './hash.js';

const toks = (t) => String(t || '').toLowerCase().split(/[^a-z0-9]+/).filter(w => w.length > 2);
const jaccard = (a, b) => { const A = new Set(a), B = new Set(b); let i = 0; for (const t of A) if (B.has(t)) i++; return i / (A.size + B.size - i || 1); };

export function fingerprint(question) { return toks(question); }

// FROZEN evaluation material (questions public in bench; answers never leave the evaluator)
let FROZEN = null;
export function loadFrozen(manifest) { FROZEN = manifest; }

function againstFrozen(tokens) {
  if (!FROZEN) throw new Error('frozen eval manifest not loaded');
  for (const fp of FROZEN.benchmark_fingerprints)
    if (jaccard(tokens, fp.tokens) >= 0.55) return { contaminated: true, vs: fp.id, rule: 'benchmark-question-variant' };
  for (const fp of FROZEN.holdout_fingerprints || [])
    if (jaccard(tokens, fp.tokens) >= 0.55) return { contaminated: true, vs: fp.id, rule: 'holdout-question-variant' };
  return { contaminated: false };
}

// The record's SOURCE digests must exist in the source registry (evidence must not vanish)
function sourcesExist(rec, registry) {
  return (rec.source_digests || []).every(d => registry.has(d));
}

// A grounded knowledge record's expected answer must be extractable from its evidence
function answerGrounded(rec) {
  if (rec.task_type !== 'harz_knowledge' && rec.task_type !== 'reasoning') return true;
  const evText = (rec.evidence_units || []).map(u => (u.title + ' ' + u.text).toLowerCase()).join(' ');
  const must = (rec.expected_key_terms || []);
  return must.every(t => evText.includes(String(t).toLowerCase()));
}

// Conversation memory must never cross into a dataset
const MEMORY_MARKERS = ['conversation memory (recent)', 'authorized memories:', 'user:', 'assistant:'];
function containsMemory(rec) {
  const blob = JSON.stringify(rec).toLowerCase();
  return MEMORY_MARKERS.some(m => blob.includes(m));
}

export function inspect(record, { registry, seenDigests, source = 'unknown' }) {
  const verdict = { sample_id: record.sample_id || null, source, accepted: false, rejections: [] };
  if (!record.sample_id) verdict.rejections.push('missing sample_id (no mystery data)');
  if (!record.source || !record.generation_method || !record.license) verdict.rejections.push('incomplete provenance (source/generation_method/license required)');
  if (containsMemory(record)) verdict.rejections.push('conversation-memory content detected at dataset boundary');
  const d = record.digest || sha256Hex(JSON.stringify({ q: record.question, e: record.evidence_units, x: record.expected_behavior }));
  if (seenDigests && seenDigests.has(d)) verdict.rejections.push('duplicate sample (digest ' + d.slice(0, 8) + ')');
  if (record.source_digests && registry && !sourcesExist(record, registry)) verdict.rejections.push('source digest missing from source registry (evidence disappeared)');
  if (record.question) {
    const fp = fingerprint(record.question);
    const c = againstFrozen(fp);
    if (c.contaminated) verdict.rejections.push('CONTAMINATION: ' + c.rule + ' vs ' + c.vs);
  } else verdict.rejections.push('missing question');
  if (!answerGrounded(record)) verdict.rejections.push('poisoned/unsupported: expected answer not extractable from cited evidence');
  verdict.accepted = verdict.rejections.length === 0;
  verdict.digest = d;
  return verdict;
}

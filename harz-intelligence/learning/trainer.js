// HARZ TRAINER v1 — deterministic weight training for Reasoner-1.2
// Trains a lexical reasoner the honest way: IDF recalibration over the HARZ
// corpus, learned term-expansion from co-occurrence, sentence-level extraction
// thresholds, and answer/refuse decision calibration with a hard constraint:
// refusal recall on refusal training records must be 100% (the model may get
// more capable; it may never become less willing to refuse).
// Pure JS, zero external calls, byte-identical output for identical inputs.
import { sha256Hex } from './hash.js';

const STOP = ['what','who','when','where','why','how','is','are','was','were','does','do','did','the','a','an','of','for','to','in','on','at','by','with','and','or','which','that','this','their','its','my','your','tell','list','name','give','show','me','us','please','current','right','now'];
const FN = ['what','who','when','where','why','how','is','are','was','were','does','do','did','the','a','an','of','for','to','in','on','at','by','with','and','or','which','that','this','their','its','my','your','tell','list','name','give','show','me','us','please','current','right','now','harz'];
const ROLES = ['cfo','cto','ceo','coo','founder','cofounder','owner','president','director','chairman','governor','manager','head'];

const toks = (t) => String(t || '').toLowerCase().split(/[^a-z0-9]+/).filter(w => w.length > 1 && !/^\d+$/.test(w));
const content = (t) => toks(t).filter(w => !STOP.includes(w) && !FN.includes(w));

export const TRAIN_CONFIG = {
  id: 'train-cfg-v1', seed: 7701,
  threshold_grid: [0.16, 0.18, 0.20, 0.22, 0.24, 0.26, 0.28, 0.30, 0.32, 0.34, 0.36, 0.38, 0.40],
  sentence_grid: [0.10, 0.12, 0.14, 0.16, 0.18, 0.20, 0.24, 0.28],
  expansion: { max_per_term: 3, min_co: 2, weight: 0.4, max_terms: 4000 },
  refusal_recall_floor: 1.0,
  external_calls_allowed: 0,
};

export function train({ dataset, corpusStats }) {
  const t0 = Date.now();
  if (dataset.dataset !== 'HARZ-TRAIN-v1.0') throw new Error('unexpected dataset');
  const records = dataset.records;
  const N = corpusStats.total_docs;
  const df = corpusStats.doc_freq;
  const idf = {};
  for (const [t, d] of Object.entries(df)) idf[t] = +(Math.log(1 + N / d).toFixed(4));

  // ---- learned term expansion (co-occurrence within evidence/training docs) ----
  const co = {};
  const feed = (text) => {
    const ts = [...new Set(content(text))];
    for (const a of ts) {
      co[a] = co[a] || {};
      for (const b of ts) if (a !== b) co[a][b] = (co[a][b] || 0) + 1;
    }
  };
  for (const r of records) for (const u of r.evidence_units || []) feed(u.title + ' ' + u.text);
  const expansion = {};
  for (const [a, partners] of Object.entries(co)) {
    const top = Object.entries(partners).filter(([, c]) => c >= TRAIN_CONFIG.expansion.min_co)
      .sort((x, y) => y[1] - x[1] || (x[0] < y[0] ? -1 : 1)).slice(0, TRAIN_CONFIG.expansion.max_per_term)
      .map(([b]) => b);
    if (top.length) expansion[a] = top;
  }

  // ---- scoring with expansion (mirrors runtime 1.2) ----
  const idfOf = (t) => idf[t] || 1.6;
  const qvec = (q) => {
    const v = {}; const base = content(q);
    for (const t of base) v[t] = (v[t] || 0) + idfOf(t);
    for (const t of base) for (const e of (expansion[t] || []))
      if (!v[e]) v[e] = idfOf(e) * TRAIN_CONFIG.expansion.weight;
    return v;
  };
  const uvec = (text) => { const v = {}; for (const t of toks(text)) if (!v[t]) v[t] = idfOf(t); return v; };
  const dot = (qv, uv) => { let d = 0; for (const [t, w] of Object.entries(uv)) if (qv[t]) d += qv[t] * w; return d; };
  const norm = (v) => Math.sqrt(Object.values(v).reduce((a, b) => a + b * b, 0)) || 1;
  const score = (qv, u) => dot(qv, uvec(u.title + ' ' + u.text)) / (norm(qv) * norm(uvec(u.title + ' ' + u.text)));

  const knowledge = records.filter(r => r.task_type === 'harz_knowledge' || r.task_type === 'reasoning');
  const refusals = records.filter(r => r.task_type === 'refusal');

  const evalThreshold = (T, Ts) => {
    let kOk = 0, rOk = 0, rBad = 0;
    for (const r of knowledge) {
      const qv = qvec(r.question);
      const best = (r.evidence_units || []).map(u => ({ u, s: score(qv, u) })).sort((a, b) => b.s - a.s)[0];
      if (!best) continue;
      const text = (best.u.title + ' ' + best.u.text).toLowerCase();
      const hit = content(r.question).some(t => text.includes(t));
      const answerable = best.s >= T && hit;
      if (answerable) {
        const sents = String(best.u.text).split(/(?<=[.!?])\s+/);
        let bestS = null, bs = 0;
        for (const s of sents) { const sv = score(qv, { title: '', text: s }); if (sv > bs) { bs = sv; bestS = s; } }
        const okSent = bestS && (Ts === 0 || bs >= Ts) &&
          (r.expected_key_terms || []).some(k => bestS.toLowerCase().includes(String(k).toLowerCase()));
        const okText = (r.expected_key_terms || []).some(k => text.includes(String(k).toLowerCase()));
        if (okSent || okText) kOk++;
      }
    }
    for (const r of refusals) {
      const qv = qvec(r.question);
      const best = (r.evidence_units || []).map(u => score(qv, u)).sort((a, b) => b - a)[0] || 0;
      const text = (r.evidence_units || []).map(u => (u.title + ' ' + u.text).toLowerCase()).join(' ');
      const hit = content(r.question).some(t => text.includes(t));
      if (!(best >= T && hit)) rOk++;
    }
    return { kOk, kN: knowledge.length, rOk, rN: refusals.length, rBad: refusals.length - rOk };
  };

  // grid search: constraint refusal recall = 100%, maximize knowledge accuracy
  let best = null;
  for (const T of TRAIN_CONFIG.threshold_grid) {
    const e = evalThreshold(T, 0);
    const acc = (e.kOk + e.rOk) / (e.kN + e.rN);
    if (e.rOk === e.rN && (!best || acc > best.acc || (acc === best.acc && e.kOk > best.kOk)))
      best = { T, acc, ...e };
  }
  if (!best) throw new Error('no threshold satisfies the refusal-recall floor');
  // sentence threshold on top of chosen T
  let bestS = { Ts: 0, kOk: best.kOk };
  for (const Ts of TRAIN_CONFIG.sentence_grid) {
    const e = evalThreshold(best.T, Ts);
    if (e.rOk === e.rN && e.kOk >= bestS.kOk) bestS = { Ts, kOk: e.kOk };
  }
  const final = evalThreshold(best.T, bestS.Ts);

  const bands = { high: +(best.T * 1.35).toFixed(3), medium: best.T };

  const weights = {
    version: '1.2', corpus_index_digest: corpusStats.index_digest, train_dataset: 'HARZ-TRAIN-v1.0',
    train_dataset_digest: dataset.dataset_digest,
    stopwords: STOP, function_words: FN, role_words: ROLES,
    idf, expansion, expansion_weight: TRAIN_CONFIG.expansion.weight,
    thresholds: { answer: best.T, sentence: bestS.Ts }, bands,
    relevance_threshold: best.T, confidence_bands: bands,
    sentiment_lexicon: dataset.records.length ? SENTIMENT : null,
  };
  const weightsDigest = sha256Hex(JSON.stringify(weights));
  const runId = sha256Hex(JSON.stringify({ cfg: TRAIN_CONFIG, dd: dataset.dataset_digest }));
  return {
    run_id: 'RUN-' + runId.slice(0, 12), model: 'HARZ-Reasoner-1.2',
    config: TRAIN_CONFIG, dataset_digest: dataset.dataset_digest,
    corpus_index_digest: corpusStats.index_digest,
    weights_digest: weightsDigest, weights,
    train_metrics: {
      knowledge_accuracy: +(final.kOk / final.kN).toFixed(4),
      refusal_recall: +(final.rOk / final.rN).toFixed(4),
      answer_threshold: best.T, sentence_threshold: bestS.Ts,
      train_records: records.length, pipeline_external_calls: 0,
    },
    latency_ms: Date.now() - t0,
  };
}

const SENTIMENT = {
  positive: ['love','great','magnificent','excellent','happy','strong','reliable','fast','beautiful','amazing','secure','proud','win','success'],
  negative: ['failed','fail','lost','crash','crashed','broken','slow','angry','bad','terrible','scam','fraud','down','error'],
};

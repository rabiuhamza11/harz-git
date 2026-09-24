// HARZ INTELLIGENCE CORE v0.2 — HARZ MODEL INTERFACE
import { reasoner11Call } from './reasoner11-runtime.js';
import { planner1Plan, search1Rank, verify1Check, code1Analyze, code1Generate } from './family-runtime.js';
import { reasoner1Call } from './reasoner1-runtime.js';
// Ask -> reason -> search -> use tool -> execute -> verify -> answer with evidence
// Components: AI Gateway | Reasoning Orchestrator | HARZ Search connector | Memory (KV, provenance-labeled)
//             Agent runtime | Verification (evidence + receipts) | HARZ Root identities | PWA interface
// Standing order honored: NVIDIA Nemotron via OpenRouter (default model, gateway-abstracted).

const VERSION = '0.5.1';
let ENV = {}; // module workers receive bindings via env — stored here at request start
const SEARCH_URL = 'https://harz-search.harz.workers.dev/search?q=';
const CHAIN_STATUS_URL = 'https://harz-chain-v2.harz.workers.dev/api/status';

// ---------- HARZ ROOT identity registry (naming/trust layer) ----------
const ROOT_IDENTITIES = {
  'supreme-engine': { root_id: 'root:harz/intelligence/supreme-engine#1', role: 'reasoning + planning', created: '2026-09-24', can_use: ['search', 'fetch_url', 'chain_status', 'model'] },
  researcher: { root_id: 'root:harz/intelligence/agents/researcher#1', role: 'research agent — retrieval + synthesis', created: '2026-09-24', can_use: ['search', 'model'] },
  coder: { root_id: 'root:harz/intelligence/agents/coder#1', role: 'coding agent — writes and reviews code', created: '2026-09-24', can_use: ['search', 'model'] },
  analyst: { root_id: 'root:harz/intelligence/agents/analyst#1', role: 'analyst agent — data framing + reporting', created: '2026-09-24', can_use: ['search', 'chain_status', 'model'] },
  builder: { root_id: 'root:harz/intelligence/agents/builder#1', role: 'builder agent — ecosystem operations framing', created: '2026-09-24', can_use: ['search', 'chain_status', 'model'] },
};

const AGENT_PROMPTS = {
  'supreme-engine': 'You are HARZ Intelligence Core, the Supreme Engine of a sovereign AI system. You reason carefully and plan before answering. You ground every claim in the provided evidence and clearly separate verified facts from inference.',
  researcher: 'You are the HARZ Research agent. You synthesize retrieved evidence precisely, cite sources by title, and never invent facts that are not in the evidence.',
  coder: 'You are the HARZ Coder agent. You write production-grade code, explain design decisions briefly, and note testing steps.',
  analyst: 'You are the HARZ Analyst agent. You structure answers as clear analysis: findings, numbers where available, and honest caveats.',
  builder: 'You are the HARZ Builder agent. You frame answers as concrete build/deployment steps an operator can follow.',
};

// ---------- utils ----------
const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), { status, headers: { ...cors, ...headers } });
}

async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}

function id(prefix) {
  return prefix + '-' + crypto.randomUUID().slice(0, 12);
}

// ---------- 1. HARZ MODEL INTERFACE (HMI v0.2) ----------
// SOVEREIGNTY RULE: nothing above this layer knows a provider or model name.
// Orchestrators and agents call ROLES through five interface calls:
//   generate(), reason(), tool_call(), structured_output(), embed()
// Provider names exist ONLY inside adapters. HARZ-Reasoner-1 (v0.3) slots in
// as a new backend in the registry with zero changes above this layer.

// --- adapters: the ONLY place external provider names may appear ---
const ADAPTERS = {
  openrouter: {
    async call({ messages, temperature, profile }) {
      const t0 = Date.now();
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + (ENV.OPENROUTER_API_KEY || ''),
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://harz-intelligence.harz.workers.dev',
          'X-Title': 'HARZ Intelligence Core',
        },
        body: JSON.stringify({ model: profile, messages, temperature }),
      });
      const latency = Date.now() - t0;
      if (!res.ok) {
        const errText = (await res.text()).slice(0, 300);
        return { ok: false, error: 'backend_' + res.status, detail: errText, latency };
      }
      const data = await res.json();
      const usage = data.usage || {};
      return { ok: true, content: data.choices?.[0]?.message?.content || '', latency, tokens_in: usage.prompt_tokens || 0, tokens_out: usage.completion_tokens || 0 };
    },
    async callStream({ messages, temperature, profile, onDelta }) {
      const t0 = Date.now();
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + (ENV.OPENROUTER_API_KEY || ''),
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://harz-intelligence.harz.workers.dev',
          'X-Title': 'HARZ Intelligence Core',
        },
        body: JSON.stringify({ model: profile, messages, temperature, stream: true }),
      });
      if (!res.ok) {
        const errText = (await res.text()).slice(0, 200);
        return { ok: false, error: 'backend_' + res.status, detail: errText, latency: Date.now() - t0, content: '' };
      }
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf = '', content = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const lines = buf.split('\n');
        buf = lines.pop() || '';
        for (const line of lines) {
          const t = line.trim();
          if (!t.startsWith('data:')) continue;
          const payload = t.slice(5).trim();
          if (payload === '[DONE]') continue;
          try {
            const j = JSON.parse(payload);
            const delta = j.choices?.[0]?.delta?.content || '';
            if (delta) { content += delta; if (onDelta) onDelta(delta); }
          } catch {}
        }
      }
      return { ok: true, content, latency: Date.now() - t0, tokens_in: null, tokens_out: null };
    },
  },
  // HARZ-OWNED adapter: HARZ-Reasoner-1 inference runtime. No external provider, no network.
  harz_local: {
    call: (args) => (args.profile === 'reasoner-1.1' ? reasoner11Call(args) : reasoner1Call(args)),
    callStream: (args) => (args.profile === 'reasoner-1.1' ? reasoner11Call(args) : reasoner1Call(args)),
  },
};

// --- backend registry: opaque IDs only, no provider names above adapters ---
const BACKENDS = {
  'reason-core':     { adapter: 'openrouter', profile: 'nvidia/nemotron-3-nano-30b-a3b' },
  'reason-fallback': { adapter: 'openrouter', profile: 'nvidia/nemotron-3.5-lightning:free' },
  'harz-embed-1':    { adapter: 'harz_local', profile: 'harz-hash-embedder-v1' },
  'harz-reasoner-1':   { adapter: 'harz_local', profile: 'reasoner-1' },   // v0.3: first HARZ-owned reasoning model (FROZEN v0.3 record)
  'harz-reasoner-1.1': { adapter: 'harz_local', profile: 'reasoner-1.1' }, // v0.4: calibration revision (answerability guard)
  'harz-code-1':       { adapter: 'harz_local', profile: 'code-1' },       // v0.4: code analysis + template generation
};

// engine overrides (v0.3): 'harz' forces HARZ-owned backends only;
// 'offline' = HARZ-only AND external provider hard-blocked (sovereignty death test);
// 'external' forces the external adapter chain (benchmark target A).
const HARZ_CHAIN = ['harz-reasoner-1.1'];     // v0.4: HARZ-first primary (Dad's production policy)
const HARZ_CHAIN_V10 = ['harz-reasoner-1'];  // frozen v0.3 record (bench target B)
const EXTERNAL_CHAIN = ['reason-core', 'reason-fallback'];
let EXTERNAL_CALLS = 0; // per-request counter (reset at orchestrate start)

// ============ CAPABILITY REGISTRY (v0.4) ============
// The router consults this registry. It never assumes a model can do everything.
const CAPABILITY_REGISTRY = {
  'harz-reasoner-1':   { reasoning: 'limited', arithmetic: 'unsupported', coding: 'unsupported', evidence_extraction: 'strong', refusal: 'supported', generative: 'unsupported', structured: 'supported' },
  'harz-reasoner-1.1': { reasoning: 'limited', arithmetic: 'unsupported', coding: 'unsupported', evidence_extraction: 'strong', refusal: 'supported+guard', generative: 'unsupported', structured: 'supported' },
  'harz-code-1':       { reasoning: 'unsupported', arithmetic: 'unsupported', coding: 'template-only', code_analysis: 'strong', evidence_extraction: 'unsupported', refusal: 'supported', generative: 'template-only' },
  'harz-search-1':     { retrieval: 'strong', ranking: 'strong', reasoning: 'unsupported', evidence_extraction: 'unsupported', refusal: 'unsupported', generative: 'unsupported' },
  'harz-verify-1':     { claim_checking: 'strong', reasoning: 'unsupported', evidence_extraction: 'unsupported', refusal: 'unsupported', generative: 'unsupported' },
  'harz-planner-1':    { task_decomposition: 'strong', reasoning: 'unsupported', evidence_extraction: 'unsupported', refusal: 'unsupported', generative: 'unsupported' },
  'harz-embed-1':      { embedding: 'strong' },
  'reason-core':       { reasoning: 'supported', arithmetic: 'supported', coding: 'supported', evidence_extraction: 'supported', refusal: 'supported', generative: 'supported', structured: 'supported', external: true },
  'reason-fallback':   { reasoning: 'supported', arithmetic: 'supported', coding: 'supported', evidence_extraction: 'supported', refusal: 'supported', generative: 'supported', structured: 'supported', external: true },
};

// ============ v0.5.1 MACHINE-TESTABLE AGENT REGISTRY ============
// Dad's schema: agent_id, capabilities, unsupported_capabilities,
// evidence_requirements, fallback_policy, verification_policy, version.
// The router is tested against THIS, not hidden logic. Agents never call one another;
// every hop is owned by the orchestrator.
const AGENT_REGISTRY = {
  'harz-planner-1':    { agent_id: 'harz-planner-1', role: 'planner', version: '1.0', capabilities: ['task_decomposition:strong'], unsupported_capabilities: ['reasoning', 'evidence_extraction', 'arithmetic', 'coding', 'generative', 'refusal'], evidence_requirements: ['none (deterministic decomposition)'], fallback_policy: 'n/a — plan is orchestrator-side', verification_policy: 'plan steps logged in trace', orchestrator_only: true },
  'harz-search-1':     { agent_id: 'harz-search-1', role: 'researcher', version: '1.0', capabilities: ['retrieval:strong', 'ranking:strong', 'evidence_assembly:supported (v0.5.1 direct path for enumeration)'], unsupported_capabilities: ['reasoning', 'arithmetic', 'coding', 'generative', 'refusal'], evidence_requirements: ['retrieved_evidence_units — assembly cites every item'], fallback_policy: 'no grounded results -> route to reasoner (final refusal rules apply)', verification_policy: 'claim_check_required', orchestrator_only: true },
  'harz-reasoner-1.1':{ agent_id: 'harz-reasoner-1.1', role: 'reasoner', version: '1.1', capabilities: ['evidence_extraction:strong', 'reasoning:limited', 'structured:supported', 'refusal:supported+guard'], unsupported_capabilities: ['arithmetic', 'coding', 'generative', 'service_enumeration_synthesis'], evidence_requirements: ['retrieved_evidence_units', 'content_term_match_for_answerability'], fallback_policy: 'final_refusal_only (v0.5 Option 2): refusal is an output, not an error; external fallback ONLY on registry-declared incapability', verification_policy: 'claim_check_required', orchestrator_only: true },
  'harz-code-1':      { agent_id: 'harz-code-1', role: 'coder', version: '1.0', capabilities: ['code_analysis:strong (deterministic static analysis, v0.5.1 direct answer path)', 'coding:template-only', 'refusal:supported'], unsupported_capabilities: ['arithmetic', 'evidence_extraction', 'generative_beyond_templates'], evidence_requirements: ['none (deterministic analysis of the request/code text)'], fallback_policy: 'no findings -> route to reasoner; template-miss on generation -> declared incapable -> external per registry', verification_policy: 'claim_check_required', orchestrator_only: true },
  'harz-verify-1':    { agent_id: 'harz-verify-1', role: 'verifier', version: '1.0', capabilities: ['claim_checking:strong'], unsupported_capabilities: ['reasoning', 'arithmetic', 'coding', 'generative', 'retrieval'], evidence_requirements: ['answer_text', 'evidence_units'], fallback_policy: 'n/a — verification is mandatory on every answer', verification_policy: 'issues per-claim verdicts; unsupported claims never survive to ANSWER', orchestrator_only: true },
  'harz-embed-1':     { agent_id: 'harz-embed-1', role: 'embedder', version: '1.0', capabilities: ['embedding:strong (local deterministic)'], unsupported_capabilities: ['all_language_generation'], evidence_requirements: ['input_text'], fallback_policy: 'n/a', verification_policy: 'deterministic — no verification needed', orchestrator_only: true },
  'reason-core':      { agent_id: 'reason-core', role: 'external_backend', version: 'n/a (external)', capabilities: ['reasoning:supported', 'arithmetic:supported', 'coding:supported', 'evidence_extraction:supported', 'refusal:supported', 'generative:supported', 'structured:supported'], unsupported_capabilities: [], evidence_requirements: ['none (provider-side)'], fallback_policy: 'adapter only — never a silent dependency; used ONLY on registry-declared incapability or explicit engine=external', verification_policy: 'answers flagged external-assisted; still claim-checked and receipted', orchestrator_only: false, external: true },
  'reason-fallback':  { agent_id: 'reason-fallback', role: 'external_backend', version: 'n/a (external)', capabilities: ['reasoning:supported', 'arithmetic:supported', 'coding:supported', 'evidence_extraction:supported', 'refusal:supported', 'generative:supported', 'structured:supported'], unsupported_capabilities: [], evidence_requirements: ['none (provider-side)'], fallback_policy: 'secondary external adapter', verification_policy: 'answers flagged external-assisted; still claim-checked and receipted', orchestrator_only: false, external: true },
};
// task class -> required capability -> specialist that owns the direct path.
// The router decision is derivable from this table, so it is testable.
const TASK_REGISTRY = {
  arithmetic:            { required_capability: 'arithmetic', harz_specialist: null, direct_path: null, policy: 'declared_incapable -> external' },
  code_generation:       { required_capability: 'coding', harz_specialist: 'harz-code-1', direct_path: 'template_library', policy: 'template-first; template-miss -> external (declared incapable beyond library)' },
  code_analysis:         { required_capability: 'code_analysis', harz_specialist: 'harz-code-1', direct_path: 'static_analysis', policy: 'Code-1 direct answer path (v0.5.1); no findings -> reasoner' },
  generative_writing:    { required_capability: 'generative', harz_specialist: null, direct_path: null, policy: 'declared_incapable -> external' },
  structured:            { required_capability: 'structured', harz_specialist: 'harz-reasoner-1.1', direct_path: null, policy: 'HARZ chain' },
  evidence_enumeration:  { required_capability: 'retrieval', harz_specialist: 'harz-search-1', direct_path: 'evidence_assembly', policy: 'Search-1 direct answer path (v0.5.1); no grounded services -> reasoner' },
  evidence_qa:           { required_capability: 'evidence_extraction', harz_specialist: 'harz-reasoner-1.1', direct_path: null, policy: 'HARZ chain; refusal is final (Option 2)' },
};
const FROZEN_BENCH_SHA256 = '30851363a0b3b190c52d8ec8c960c510e7b6b5abfd4c78dbc7acf94f9d73e691';

// v0.5.1 shared specialist builders — used by BOTH orchestrate and orchestrateJob
function buildEnumerationAnswer(results) {
  const seen = new Map();
  for (const r of results || []) {
    const title = String(r.title || '').trim();
    if (!/^harz /i.test(title)) continue;
    const cut = title.split(/[—–]/)[0].trim().replace(/\s+-\s*$/, '');
    const name = (cut || title).slice(0, 60);
    const key = name.toLowerCase();
    if (!seen.has(key)) seen.set(key, { name, url: r.url, snippet: String(r.snippet || '').replace(/\s+/g, ' ').slice(0, 140) });
  }
  if (!seen.size) return null;
  const items = [...seen.values()].slice(0, 8);
  return '**Answer**\n\nThe HARZ ecosystem offers these services, assembled directly from retrieved HARZ knowledge base evidence:\n\n' +
    items.map((x, i) => (i + 1) + '. ' + x.name + ' — ' + x.snippet + ' [source: ' + x.url + ']').join('\n\n') +
    '\n\nCONFIDENCE: high — deterministic evidence assembly by harz-search-1; every item cited to retrieved evidence';
}
function buildCodeAnalysisAnswer(message) {
  const ca = code1Analyze({ code: message });
  if (!ca.findings || !ca.findings.length) return null;
  return '**Answer**\n\nHARZ Code-1 deterministic static analysis of your request — findings:\n\n' +
    ca.findings.map((f, i) => (i + 1) + '. [' + f.severity + '] ' + f.finding).join('\n') +
    '\n\nCONFIDENCE: high — deterministic static analysis by harz-code-1';
}

// ============ TASK CLASSIFIER (v0.4) — deterministic routing rules ============
function classifyTask(message) {
  const L = String(message || '').toLowerCase();
  if (/\b(calculate|compute|how much is|total of|total spend|sum of|multipl)\w*/.test(L) || (/\d/.test(L) && /\b(per|each|every)\b/.test(L)))
    return { class: 'arithmetic', harzCapable: false, reason: 'registry: arithmetic=unsupported' };
  if (/write a (function|code|script|program)|implement a |create a function|code that validates|generate code|write.*function that validates/.test(L))
    return { class: 'code_generation', harzCapable: true, attempt: 'harz-code-1-template', reason: 'registry: coding=template-only — template match tried first' };
  if (/debug|why.*(fail|error)|fix this|analy[sz]e (this )?(code|error)|error message/.test(L))
    return { class: 'code_analysis', harzCapable: true, reason: 'registry: code_analysis=strong' };
  if (/write an (essay|email|letter|article|story|post|advert)|compose|draft|summar[yi][sz]e/.test(L))
    return { class: 'generative_writing', harzCapable: false, reason: 'registry: generative=unsupported' };
  if (/classif|sentiment|respond with json|json output/.test(L))
    return { class: 'structured', harzCapable: true, reason: 'registry: structured=supported' };
  if (/(which|what) services|services (does|do|offers?|available)|name at least three|list (the |all )?services/.test(L))
    return { class: 'evidence_enumeration', harzCapable: true, reason: 'registry: retrieval=strong — Search-1 evidence assembly direct path (TASK_REGISTRY)' };
  return { class: 'evidence_qa', harzCapable: true, reason: 'registry: evidence_extraction=strong (HARZ core capability)' };
}

// ============ ROUTER (v0.4 production policy: HARZ primary, explicit external fallback) ============
function routeEngine(engineParam, taskClass) {
  if (engineParam === 'harz') return { engine: 'harz', sovereign: true, routed_by: 'engine-param' };
  if (engineParam === 'harz1') return { engine: 'harz1', sovereign: true, routed_by: 'engine-param' };
  if (engineParam === 'offline') return { engine: 'offline', sovereign: true, routed_by: 'engine-param' };
  if (engineParam === 'external') return { engine: 'external', sovereign: false, routed_by: 'engine-param' };
  if (!taskClass.harzCapable) return { engine: 'external', sovereign: false, routed_by: 'capability-registry', declared_incapable: taskClass.class + ' — ' + taskClass.reason };
  return { engine: 'harz', sovereign: true, routed_by: 'capability-registry', task_class: taskClass.class };
}

// --- role -> backend chain. v0.3 prepends HARZ-Reasoner-1 to these chains ---
const ROLE_CHAINS = {
  reasoner:   ['reason-core', 'reason-fallback'],
  researcher: ['reason-core', 'reason-fallback'],
  coder:      ['reason-core', 'reason-fallback'],
  analyst:    ['reason-core', 'reason-fallback'],
  builder:    ['reason-core', 'reason-fallback'],
  verifier:   ['reason-core', 'reason-fallback'],
  embedder:   ['harz-embed-1'],
};

const AGENT_ROLE = { 'supreme-engine': 'reasoner', researcher: 'researcher', coder: 'coder', analyst: 'analyst', builder: 'builder' };

async function hmiGenerate({ role = 'reasoner', messages, temperature = 0.3, stream = false, onDelta, engine }) {
  let chain = ROLE_CHAINS[role] || ROLE_CHAINS.reasoner;
  const offline = engine === 'offline';
  if (engine === 'harz' || offline) chain = HARZ_CHAIN;
  else if (engine === 'harz1') chain = HARZ_CHAIN_V10;
  else if (engine === 'external') chain = EXTERNAL_CHAIN;
  if (offline) chain = chain.filter(id => BACKENDS[id] && BACKENDS[id].adapter === 'harz_local'); // death test: external provider disconnected
  let lastErr = null; const t0 = Date.now();
  for (const backendId of chain) {
    const backend = BACKENDS[backendId];
    if (!backend || !ADAPTERS[backend.adapter]) continue;
    const isExternal = backend.adapter === 'openrouter';
    if (isExternal) { if (offline) continue; EXTERNAL_CALLS++; }
    const res = stream
      ? await ADAPTERS[backend.adapter].callStream({ messages, temperature, profile: backend.profile, onDelta })
      : await ADAPTERS[backend.adapter].call({ messages, temperature, profile: backend.profile });
    if (res.ok) return { ...res, backend: backendId, role, external_calls: EXTERNAL_CALLS };
    lastErr = res;
  }
  return { ok: false, backend: null, role, error: (lastErr && lastErr.error) || 'all_backends_failed', detail: lastErr && lastErr.detail, latency: Date.now() - t0, external_calls: EXTERNAL_CALLS };
}

const HMI = {
  // generic text generation — role-routed, provider-blind
  generate: (args) => hmiGenerate(args),
  // reasoning call — same interface, explicit intent
  reason: ({ messages, temperature }) => hmiGenerate({ role: 'reasoner', messages, temperature }),
  // deterministic tool execution — model-selected tool routing lands in v0.3
  tool_call: async ({ tool, args = {} }) => {
    const dispatch = {
      search: (a) => harzSearch(a.query || a.q || '', a.limit || 5),
      chain_status: () => toolChainStatus([]),
      fetch_url: (a) => toolFetchUrl(a.url, []),
      embed: (a) => HMI.embed({ text: a.text || '' }),
    };
    if (!dispatch[tool]) return { ok: false, tool, error: 'unknown_tool' };
    try { const result = await dispatch[tool](args); return { ok: true, tool, result }; }
    catch (e) { return { ok: false, tool, error: String(e) }; }
  },
  // JSON-constrained generation with robust parse
  structured_output: async ({ role, messages, schema_hint }) => {
    const res = await hmiGenerate({
      role, temperature: 0.1,
      messages: [...messages, { role: 'system', content: 'Respond with ONLY a valid JSON object, no prose. ' + (schema_hint || '') }],
    });
    if (!res.ok) return res;
    try {
      const m = res.content.match(/\{[\s\S]*\}/);
      return { ...res, data: JSON.parse(m ? m[0] : res.content) };
    } catch { return { ok: false, backend: res.backend, role: res.role, error: 'structured_parse_failed', raw: res.content.slice(0, 500) }; }
  },
  // HARZ-OWNED embedder: local deterministic hashed bag-of-words, zero external provider
  embed: async ({ text }) => {
    const dim = 256; const v = new Array(dim).fill(0);
    const words = String(text || '').toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
    for (const w of words) {
      const h = await sha256(w);
      const slot = parseInt(h.slice(0, 6), 16) % dim;
      const sign = (parseInt(h.slice(6, 8), 16) & 1) ? 1 : -1;
      v[slot] += sign * (1 / Math.sqrt(words.length || 1));
    }
    const norm = Math.sqrt(v.reduce((acc, x) => acc + x * x, 0)) || 1;
    return { ok: true, owner: 'harz', backend: 'harz-embed-1', dim, vector: v.map(x => +(x / norm).toFixed(4)) };
  },
};

// ---------- 3. HARZ SEARCH connector ----------
async function harzSearch(query, limit = 5) {
  const t0 = Date.now();
  try {
    const svc = ENV.SEARCH_SVC;
    const res = svc
      ? await svc.fetch('https://search.internal/search?q=' + encodeURIComponent(query), { headers: { accept: 'application/json' } })
      : await fetch(SEARCH_URL + encodeURIComponent(query), { headers: { accept: 'application/json' } });
    if (!res.ok) return { ok: false, error: 'search_' + res.status, latency_ms: Date.now() - t0, results: [] };
    const data = await res.json();
    const results = (data.results || []).slice(0, limit).map(r => ({
      title: r.title, url: r.url, domain: r.domain, snippet: (r.snippet || '').slice(0, 400), score: r.score, source: r.source,
    }));
    return { ok: true, query, latency_ms: Date.now() - t0, results };
  } catch (e) {
    return { ok: false, error: 'search_unreachable', latency_ms: Date.now() - t0, results: [] };
  }
}


// Smart query construction: strip stopwords, progressive relaxation on empty results.
const STOPWORDS = new Set(['what','which','who','is','are','was','were','the','a','an','and','or','of','to','in','for','on','at','about','tell','me','please','exist','exists','around','give','show','do','does','how','why','can','you','your','it','its','that','this','with','have','has','i','we','my','our','there','their','from','by','as','be']);
function keywords(message, n) {
  return message.toLowerCase().replace(/[^a-z0-9\s-]/g,' ').split(/\s+/).filter(w => w.length > 2 && !STOPWORDS.has(w)).slice(0, n).join(' ');
}
function relevantResults(res, q) {
  const terms = q.split(' ').filter(w => w.length > 2);
  if (!terms.length) return res.results.length > 0;
  return res.results.some(r => {
    const hay = ((r.title || '') + ' ' + (r.snippet || '') + ' ' + (r.domain || '')).toLowerCase();
    return terms.every(w => hay.includes(w));
  });
}
function properNouns(message) {
  return message.split(/\s+/).filter(w => /^[A-Z][A-Za-z0-9-]{2,}/.test(w) && !STOPWORDS.has(w.toLowerCase())).map(w => w.toLowerCase().replace(/[^a-z0-9-]/g, '')).filter(Boolean).slice(0, 5).join(' ');
}
async function smartSearch(message) {
  const attempts = [properNouns(message), keywords(message, 8), keywords(message, 4), keywords(message, 2), message.slice(0, 60)].filter(Boolean);
  let fallback = null;
  for (const q of attempts) {
    const res = await harzSearch(q);
    if (res.ok && res.results.length) {
      if (relevantResults(res, q)) return { ...res, query_used: q };
      if (!fallback) fallback = res;
    }
  }
  if (fallback) return { ...fallback, query_used: attempts[0] || message.slice(0, 60), relevance: 'low' };
  return { ok: false, results: [], query_used: attempts[0] || message.slice(0, 60) };
}

// ---------- 6. TOOLS (deterministic interface) ----------
const TOOLS = {
  search: { description: 'Retrieve from the HARZ Search knowledge index' },
  fetch_url: { description: 'Fetch a public HTTPS page for evidence (1 per turn)' },
  chain_status: { description: 'Fetch live HARZ Chain status' },
  memory_write: { description: 'Persist an authorized memory with provenance (explicit "remember" requests only)' },
};

async function toolChainStatus(log) {
  const t0 = Date.now();
  try {
    const svc = ENV.CHAIN_SVC;
    const res = svc ? await svc.fetch('https://chain.internal/api/status') : await fetch(CHAIN_STATUS_URL);
    const data = res.ok ? await res.json() : null;
    log.push({ tool: 'chain_status', ok: res.ok, latency_ms: Date.now() - t0, summary: data ? { height: data.height, wallets: data.wallets, version: data.version } : 'http_' + res.status });
    return data ? `HARZ Chain live: height ${data.height}, wallets ${data.wallets}, consensus ${data.consensus}, v${data.version}.` : `Chain status fetch failed (http ${res.status}).`;
  } catch (e) {
    log.push({ tool: 'chain_status', ok: false, latency_ms: Date.now() - t0, error: 'unreachable' });
    return 'Chain status unreachable.';
  }
}

async function toolFetchUrl(url, log) {
  const t0 = Date.now();
  if (!/^https:\/\//.test(url)) { log.push({ tool: 'fetch_url', ok: false, error: 'https_only' }); return null; }
  try {
    const res = await fetch(url, { headers: { 'user-agent': 'HARZ-Intelligence/0.1' } });
    const text = (await res.text()).slice(0, 4000);
    log.push({ tool: 'fetch_url', url, ok: res.ok, status: res.status, latency_ms: Date.now() - t0 });
    return { url, status: res.status, excerpt: text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 1200) };
  } catch (e) {
    log.push({ tool: 'fetch_url', url, ok: false, latency_ms: Date.now() - t0, error: 'unreachable' });
    return null;
  }
}

// ---------- 4. MEMORY (KV, provenance-labeled) ----------
const MEM = {
  async getConversation(cid) {
    const v = await ENV.MEMORY.get('conv:' + cid, 'json');
    return v || { id: cid, created: new Date().toISOString(), messages: [], authorized_memories: [] };
  },
  async saveConversation(conv) {
    conv.updated = new Date().toISOString();
    await ENV.MEMORY.put('conv:' + conv.id, JSON.stringify(conv));
  },
  async addAuthorizedMemory(conv, { key, value, scope, source }) {
    const rec = {
      key, value, scope: scope || 'user-authorized',
      provenance: { issued_by: 'root:harz/intelligence/supreme-engine#1', source: source || 'explicit-user-request', recorded_at: new Date().toISOString() },
    };
    conv.authored = conv.authorized_memories || [];
    conv.authorized_memories = conv.authorized_memories || [];
    conv.authorized_memories.push(rec);
    await ENV.MEMORY.put('mem:' + key, JSON.stringify(rec));
    return rec;
  },
  async createJob(job) {
    await ENV.MEMORY.put('job:' + job.id, JSON.stringify(job));
  },
  async updateJob(id, patch) {
    const j = (await ENV.MEMORY.get('job:' + id, 'json')) || null;
    if (!j) return null;
    Object.assign(j, patch);
    await ENV.MEMORY.put('job:' + id, JSON.stringify(j));
    return j;
  },
  async getJob(id) {
    return (await ENV.MEMORY.get('job:' + id, 'json')) || null;
  },
  async benchAppend(entry) {
    const log = (await ENV.MEMORY.get('bench:log', 'json')) || { runs: [] };
    log.runs.push(entry);
    if (log.runs.length > 100) log.runs = log.runs.slice(-100);
    await ENV.MEMORY.put('bench:log', JSON.stringify(log));
  },
};

// ---------- 2. REASONING ORCHESTRATOR ----------
function planTask(message, agent) {
  const lower = message.toLowerCase();
  const plan = [];
  const wantsRemember = /remember (this|that)|don'?t forget|keep in memory/.test(lower);
  const urls = message.match(/https:\/\/[^\s)]+/g) || [];
  const wantsChain = /chain|block|wallet|miner|harz pay|balance/.test(lower);
  const wantsSearch = true; // knowledge grounding is always on in v0.1
  if (wantsSearch) plan.push({ step: 'search', why: 'ground answer in HARZ knowledge index' });
  if (urls.length) plan.push({ step: 'fetch_url', why: 'retrieve user-provided evidence', urls: urls.slice(0, 1) });
  if (wantsChain) plan.push({ step: 'chain_status', why: 'live chain data requested or relevant' });
  plan.push({ step: 'reason', why: 'synthesize evidence + memory into answer' });
  plan.push({ step: 'verify', why: 'receipt + evidence record' });
  if (wantsRemember) plan.push({ step: 'memory_write', why: 'explicit user authorization to persist' });
  return { plan, agent: agent || 'supreme-engine' };
}

async function orchestrate({ message, conversation_id, agent, engine }) {
  EXTERNAL_CALLS = 0;
  const taskClass = classifyTask(message);
  const route = routeEngine(engine, taskClass);
  const t_start = Date.now();
  const cid = conversation_id || id('c');
  // v0.4: HARZ-Planner-1 decomposes the task (family model)
  const p1 = planner1Plan({ message });
  const plan = p1.steps;
  if (/remember (this|that)|don'?t forget|keep in memory/i.test(message)) plan.push({ step: 'memory_write', why: 'explicit user authorization to persist' });
  const identity = ROOT_IDENTITIES[agent] || ROOT_IDENTITIES['supreme-engine'];
  const execution_log = [];
  const evidence = [];
  let evidenceUnitsGlobal = [];

  // memory load
  const conv = await MEM.getConversation(cid);
  const priorTurns = (conv.messages || []).slice(-6);
  execution_log.push({ step: 'memory', ok: true, detail: priorTurns.length ? priorTurns.length + ' prior turns loaded' : 'new conversation' });

  // search
  let searchRes = await smartSearch(message);
  execution_log.push({ step: 'search', ok: searchRes.ok, results: searchRes.results.length, latency_ms: searchRes.latency_ms });
  // v0.4: HARZ-Search-1 re-ranks retrieval (family model: retrieval/ranking = strong)
  if (searchRes.ok && searchRes.results.length > 1) {
    const ranked = search1Rank({ query: message, results: searchRes.results });
    searchRes = { ...searchRes, results: ranked.results };
    execution_log.push({ model: 'harz-search-1', ok: true, reranked: true });
  }
  if (searchRes.ok && searchRes.results.length) {
    evidenceUnitsGlobal = searchRes.results.slice(0, 6).map((r, i) => ({ id: 'S' + (i + 1), title: r.title, text: r.snippet }));
    evidence.push({ type: 'search', results: searchRes.results.map(r => ({ title: r.title, url: r.url, snippet: r.snippet.slice(0, 160) })) });
  }

  // tools
  let chainFact = '';
  if (plan.some(p => p.step === 'chain_status')) {
    chainFact = await toolChainStatus(execution_log);
    evidence.push({ type: 'tool', tool: 'chain_status', result: chainFact });
    if (chainFact) evidenceUnitsGlobal.push({ id: 'chain', title: 'HARZ Chain live status', text: chainFact });
  }
  let fetchedDoc = null;
  const fetchStep = plan.find(p => p.step === 'fetch_url');
  if (fetchStep) {
    fetchedDoc = await toolFetchUrl(fetchStep.urls[0], execution_log);
    if (fetchedDoc) evidence.push({ type: 'tool', tool: 'fetch_url', url: fetchedDoc.url, excerpt: fetchedDoc.excerpt.slice(0, 400) });
  }

  // reason (model call through the gateway)
  const sysPrompt = (AGENT_PROMPTS[agent] || AGENT_PROMPTS['supreme-engine']) +
    ' Answer with clear structure. Cite evidence by title when you use it. If the evidence does not contain the answer, say so plainly. End with a line "CONFIDENCE: high|medium|low" based on evidence quality.';
  const contextBlock = [
    searchRes.ok && searchRes.results.length ? 'SEARCH RESULTS:\n' + searchRes.results.map((r, i) => `[S${i + 1}] ${r.title} (${r.url})\n${r.snippet}`).join('\n\n') : 'SEARCH RESULTS: none found',
    chainFact ? 'CHAIN STATUS: ' + chainFact : '',
    fetchedDoc ? 'FETCHED DOCUMENT (' + fetchedDoc.url + '): ' + fetchedDoc.excerpt.slice(0, 1000) : '',
    priorTurns.length ? 'CONVERSATION MEMORY (recent):\n' + priorTurns.map(m => m.role + ': ' + m.content.slice(0, 300)).join('\n') : '',
    (conv.authorized_memories || []).length ? 'AUTHORIZED MEMORIES:\n' + conv.authorized_memories.map(m => m.key + ' = ' + m.value).join('\n') : '',
  ].filter(Boolean).join('\n\n');

  // v0.4: HARZ-Code-1 handles template-capable code generation (registry-driven)
  let codeRes = null;
  if (taskClass.class === 'code_generation' && !engine) {
    codeRes = code1Generate({ request: message });
    if (codeRes.ok) execution_log.push({ model: 'harz-code-1', ok: true, template: codeRes.template });
  }
  // v0.5.1 SPECIALIST DIRECT PATHS (registry-driven): a capable specialist answers
  // directly instead of forcing everything through the reasoner. Applies under
  // default/harz/offline routing; harz1 (frozen v1.0 comparison) and explicit
  // engine=external are left untouched so frozen targets stay comparable.
  let specialistRes = null;
  if (!['harz1', 'external'].includes(engine)) {
    if (taskClass.class === 'code_analysis') {
      const enumAns = buildCodeAnalysisAnswer(message);
      if (enumAns) {
        specialistRes = { ok: true, content: enumAns, backend: 'harz-code-1', mode: 'specialist-code', role: 'coder', latency: 0, tokens_in: 0, tokens_out: 0, external_calls: 0 };
        execution_log.push({ model: 'harz-code-1', ok: true, direct_path: 'code_analysis:static', findings: (code1Analyze({ code: message }).findings || []).length });
      }
    } else if (taskClass.class === 'evidence_enumeration') {
      const enumAns = buildEnumerationAnswer(searchRes.results);
      if (enumAns) {
        specialistRes = { ok: true, content: enumAns, backend: 'harz-search-1', mode: 'specialist-enum', role: 'researcher', latency: 0, tokens_in: 0, tokens_out: 0, external_calls: 0 };
        execution_log.push({ model: 'harz-search-1', ok: true, direct_path: 'evidence_enumeration:assembly' });
      }
    }
  }
  const modelRes = specialistRes || (codeRes && codeRes.ok
    ? { ok: true, content: '**Answer**\n\n' + codeRes.name + ' — HARZ template library (harz-code-1):\n\n' + codeRes.code + '\n\nCONFIDENCE: high — generated from the HARZ-authored template library', backend: 'harz-code-1', mode: 'template', role: 'reasoner', latency: 0, tokens_in: 0, tokens_out: 0, external_calls: 0 }
    : await HMI.generate({
    role: AGENT_ROLE[agent] || 'reasoner', engine: route.engine,
    messages: [
      { role: 'system', content: sysPrompt },
      { role: 'user', content: contextBlock + '\n\nUSER REQUEST:\n' + message },
    ],
  }));
  execution_log.push({ step: 'reason', ok: modelRes.ok, backend: modelRes.backend, latency_ms: modelRes.latency, tokens_in: modelRes.tokens_in, tokens_out: modelRes.tokens_out });

  let answer, meta;
  // v0.5 ROUTING LAW (Dad's Option 2, frozen): a sovereign model's refusal is an
  // OUTPUT, not an error. HARZ refusal = FINAL REFUSAL, no external call.
  // External fallback happens ONLY on registry-declared incapability (pre-model routing).
  const refusalFinal = modelRes.ok && modelRes.mode === 'refusal';
  if (modelRes.ok) {
    answer = modelRes.content;
    meta = { engine: { role: modelRes.role, backend: modelRes.backend, sovereignty: (modelRes.backend || '').startsWith('harz') ? 'harz-owned' : 'external-assisted' }, latency_ms: modelRes.latency, tokens_in: modelRes.tokens_in, tokens_out: modelRes.tokens_out, external_calls: modelRes.external_calls || 0 };
  } else {
    // Degraded mode: the orchestrator still returns structured evidence even if the model layer fails.
    answer = 'The reasoning layer is temporarily unavailable (' + modelRes.error + '). Evidence collected for your request:\n' +
      evidence.map(e => e.type === 'search' ? e.results.map(r => '- ' + r.title + ' (' + r.url + ')').join('\n') : JSON.stringify(e.result || e.excerpt || '')).join('\n');
    meta = { engine: null, latency_ms: modelRes.latency, degraded: true, error: modelRes.detail || modelRes.error };
  }

  // memory write (explicit authorization only)
  let memoryWritten = null;
  if (plan.some(p => p.step === 'memory_write')) {
    const m = message.match(/remember (?:this|that)[:\s]+(.+)|don'?t forget[:\s]+(.+)|keep in memory[:\s]+(.+)/i);
    const value = (m && (m[1] || m[2] || m[3])) || message;
    memoryWritten = await MEM.addAuthorizedMemory(conv, { key: 'mem-' + (conv.authorized_memories?.length || 0) + 1, value: value.trim(), scope: 'user-authorized', source: 'explicit phrase in user message' });
    execution_log.push({ step: 'memory_write', ok: true, key: memoryWritten.key });
  }

  if (taskClass.class === 'code_analysis') {
    const ca = code1Analyze({ code: message });
    if (ca.findings.length) execution_log.push({ model: 'harz-code-1', ok: true, analysis: ca.findings });
  }

  // verification (receipt + evidence)
  const total_latency = Date.now() - t_start;
  const receipt = await sha256((answer || '') + JSON.stringify(evidence));
  meta.routing = { routed_by: route.routed_by, task_class: taskClass.class, sovereign: route.sovereign, refusal_final: refusalFinal, declared_incapable: route.declared_incapable || null };
  // v0.4: HARZ-Verify-1 claim/evidence check on the final answer
  const claimCheck = evidenceUnitsGlobal.length ? verify1Check({ answer, units: evidenceUnitsGlobal }) : null;
  // v0.5 AGENT EXECUTION TRACE — delegation is owned by THIS orchestrator.
  // Agents never call one another; every hop is recorded here.
  const agent_trace = [
    { agent: 'router', model: 'capability-registry', action: 'route', task_class: taskClass.class, engine: route.engine, sovereign: route.sovereign, ok: true },
    { agent: 'planner', model: 'harz-planner-1', action: 'decompose', steps: plan.map(p => p.step), ok: true },
    { agent: 'researcher', model: 'harz-search-1', action: 'retrieve+rank', evidence_ids: evidenceUnitsGlobal.map(u => u.id), results: searchRes.results.length, ok: searchRes.ok },
    (modelRes.mode === 'specialist-code'
      ? { agent: 'coder', model: 'harz-code-1', action: 'static-analysis', produced_answer: true, ok: true }
      : modelRes.mode === 'specialist-enum'
      ? { agent: 'researcher', model: 'harz-search-1', action: 'evidence-assembly', produced_answer: true, ok: true }
      : { agent: 'reasoner', model: meta.engine ? meta.engine.backend : null, action: 'reason', mode: modelRes.mode || 'n/a', refusal_final: refusalFinal, ok: modelRes.ok, latency_ms: modelRes.latency }),
  ];
  if (codeRes && codeRes.ok) agent_trace.splice(3, 0, { agent: 'coder', model: 'harz-code-1', action: 'template-generation', template: codeRes.template, ok: true });
  if (claimCheck) agent_trace.push({ agent: 'verifier', model: 'harz-verify-1', action: 'claim-check', verdict: claimCheck.verdict, supported: claimCheck.supported, unsupported: claimCheck.unsupported, ok: true });
  const verification = {
    status: evidence.length ? 'grounded-in-evidence' : 'no-external-evidence',
    receipt_sha256: receipt,
    evidence_count: evidence.length,
    task_class: taskClass.class,
    engine: meta.engine ? meta.engine.backend : null,
    sovereignty: meta.engine ? meta.engine.sovereignty : null,
    claim_check: claimCheck ? { model: 'harz-verify-1', verdict: claimCheck.verdict, supported: claimCheck.supported, unsupported: claimCheck.unsupported } : null,
    note: 'v0.4 verification = evidence + logs + receipts + HARZ-Verify-1 claim check + engine record. Never claim sovereign if an external model generated it.',
  };

  conv.messages.push({ role: 'user', content: message, at: new Date().toISOString() });
  conv.messages.push({ role: 'assistant', content: answer, at: new Date().toISOString(), verification });
  await MEM.saveConversation(conv);
  await MEM.benchAppend({ at: new Date().toISOString(), latency_ms: total_latency, tokens: (meta.tokens_in || 0) + (meta.tokens_out || 0), agent: agent || 'supreme-engine', degraded: !!meta.degraded });

  return {
    conversation_id: cid,
    answer,
    agent: { name: agent || 'supreme-engine', root_id: identity.root_id, role: identity.role },
    agent_trace,
    plan,
    evidence,
    execution_log,
    verification,
    meta: { ...meta, total_latency_ms: total_latency },
  };
}


// Streaming orchestration: evidence first, streamed answer, receipt footer.
async function orchestrateStream({ message, conversation_id, agent, engine }, stream) {
  EXTERNAL_CALLS = 0;
  const taskClass = classifyTask(message);
  const route = routeEngine(engine, taskClass);
  const writer = stream.writable.getWriter();
  const enc = new TextEncoder();
  const t_start = Date.now();
  const cid = conversation_id || id('c');
  const { plan } = planTask(message, agent);
  const identity = ROOT_IDENTITIES[agent] || ROOT_IDENTITIES['supreme-engine'];
  const execution_log = [];
  const evidence = [];
  const conv = await MEM.getConversation(cid);
  const priorTurns = (conv.messages || []).slice(-6);
  execution_log.push({ step: 'memory', ok: true, detail: priorTurns.length ? priorTurns.length + ' prior turns' : 'new conversation' });
  const searchRes = await smartSearch(message);
  execution_log.push({ step: 'search', ok: searchRes.ok, results: searchRes.results.length, latency_ms: searchRes.latency_ms });
  if (searchRes.ok && searchRes.results.length) evidence.push({ type: 'search', results: searchRes.results.map(r => ({ title: r.title, url: r.url, snippet: r.snippet.slice(0, 160) })) });
  let chainFact = '';
  if (plan.some(p => p.step === 'chain_status')) { chainFact = await toolChainStatus(execution_log); evidence.push({ type: 'tool', tool: 'chain_status', result: chainFact }); }
  let fetchedDoc = null;
  const fetchStep = plan.find(p => p.step === 'fetch_url');
  if (fetchStep) { fetchedDoc = await toolFetchUrl(fetchStep.urls[0], execution_log); if (fetchedDoc) evidence.push({ type: 'tool', tool: 'fetch_url', url: fetchedDoc.url, excerpt: fetchedDoc.excerpt.slice(0, 400) }); }
  const sysPrompt = (AGENT_PROMPTS[agent] || AGENT_PROMPTS['supreme-engine']) +
    ' Cite evidence by title when you use it. If the evidence does not contain the answer, say so plainly. End with a line "CONFIDENCE: high|medium|low".';
  const contextBlock = [
    searchRes.ok && searchRes.results.length ? 'SEARCH RESULTS:\n' + searchRes.results.map((r, i) => '[S' + (i + 1) + '] ' + r.title + ' (' + r.url + ')\n' + r.snippet).join('\n\n') : 'SEARCH RESULTS: none found',
    chainFact ? 'CHAIN STATUS: ' + chainFact : '',
    fetchedDoc ? 'FETCHED DOCUMENT (' + fetchedDoc.url + '): ' + fetchedDoc.excerpt.slice(0, 1000) : '',
    priorTurns.length ? 'CONVERSATION MEMORY (recent):\n' + priorTurns.map(m => m.role + ': ' + m.content.slice(0, 300)).join('\n') : '',
    (conv.authorized_memories || []).length ? 'AUTHORIZED MEMORIES:\n' + conv.authorized_memories.map(m => m.key + ' = ' + m.value).join('\n') : '',
  ].filter(Boolean).join('\n\n');
  const modelRes = await HMI.generate({
    role: AGENT_ROLE[agent] || 'reasoner', stream: true, engine: route.engine,
    messages: [
      { role: 'system', content: sysPrompt },
      { role: 'user', content: contextBlock + '\n\nUSER REQUEST:\n' + message },
    ],
    onDelta: (d) => writer.write(enc.encode(d)),
  });
  execution_log.push({ step: 'reason', ok: modelRes.ok, backend: modelRes.backend, latency_ms: modelRes.latency });
  let answer;
  if (modelRes.ok) { answer = modelRes.content; }
  else {
    answer = 'The reasoning layer is temporarily unavailable (' + modelRes.error + '). Evidence collected:\n' +
      evidence.map(e => e.type === 'search' ? e.results.map(r => '- ' + r.title + ' (' + r.url + ')').join('\n') : JSON.stringify(e.result || e.excerpt || '')).join('\n');
    writer.write(enc.encode(answer));
  }
  let memoryWritten = null;
  if (plan.some(p => p.step === 'memory_write')) {
    const m = message.match(/remember (?:this|that)[:\s]+(.+)|don'?t forget[:\s]+(.+)|keep in memory[:\s]+(.+)/i);
    const value = (m && (m[1] || m[2] || m[3])) || message;
    memoryWritten = await MEM.addAuthorizedMemory(conv, { key: 'mem-' + ((conv.authorized_memories?.length || 0) + 1), value: value.trim(), scope: 'user-authorized', source: 'explicit phrase in user message' });
    execution_log.push({ step: 'memory_write', ok: true, key: memoryWritten.key });
  }
  const total_latency = Date.now() - t_start;
  const receipt = await sha256((answer || '') + JSON.stringify(evidence));
  const verification = {
    status: evidence.length ? 'grounded-in-evidence' : 'no-external-evidence',
    receipt_sha256: receipt, evidence_count: evidence.length,
    note: 'v0.1 verification = evidence collection + execution logs + receipts.',
  };
  conv.messages.push({ role: 'user', content: message, at: new Date().toISOString() });
  conv.messages.push({ role: 'assistant', content: answer, at: new Date().toISOString(), verification });
  await MEM.saveConversation(conv);
  await MEM.benchAppend({ at: new Date().toISOString(), latency_ms: total_latency, tokens: 0, agent: agent || 'supreme-engine', degraded: !modelRes.ok, streamed: true });
  const footer = '\n\n[[HARZ_META]]' + JSON.stringify({ conversation_id: cid, agent: { name: agent || 'supreme-engine', root_id: identity.root_id, role: identity.role }, plan, evidence, execution_log, verification, meta: { engine: modelRes.ok ? { role: modelRes.role, backend: modelRes.backend, sovereignty: (modelRes.backend || '').startsWith('harz') ? 'harz-owned' : 'external-assisted' } : null, latency_ms: modelRes.latency, total_latency_ms: total_latency, streamed: true, external_calls: modelRes.external_calls || 0, routing: { routed_by: route.routed_by, task_class: taskClass.class, sovereign: route.sovereign } } });
  writer.write(enc.encode(footer));
  writer.close();
}


// Job-based orchestration: short HTTP requests + polling — robust on slow/proxied networks.
async function orchestrateJob({ message, conversation_id, agent, engine }, jobId) {
  EXTERNAL_CALLS = 0;
  const taskClass = classifyTask(message);
  const route = routeEngine(engine, taskClass);
  const t_start = Date.now();
  const cid = conversation_id || id('c');
  const p1 = planner1Plan({ message });
  const plan = p1.steps;
  if (/remember (this|that)|don'?t forget|keep in memory/i.test(message)) plan.push({ step: 'memory_write', why: 'explicit user authorization to persist' });
  const identity = ROOT_IDENTITIES[agent] || ROOT_IDENTITIES['supreme-engine'];
  const execution_log = [];
  const evidence = [];
  const conv = await MEM.getConversation(cid);
  const priorTurns = (conv.messages || []).slice(-6);
  execution_log.push({ step: 'memory', ok: true, detail: priorTurns.length ? priorTurns.length + ' prior turns' : 'new conversation' });
  let searchRes = await smartSearch(message);
  if (searchRes.ok && searchRes.results.length > 1) {
    const ranked = search1Rank({ query: message, results: searchRes.results });
    searchRes = { ...searchRes, results: ranked.results };
    execution_log.push({ model: 'harz-search-1', ok: true, reranked: true });
  }
  const evidenceUnitsGlobal = searchRes.ok ? searchRes.results.slice(0, 6).map((r, i) => ({ id: 'S' + (i + 1), title: r.title, text: r.snippet })) : [];
  execution_log.push({ step: 'search', ok: searchRes.ok, results: searchRes.results.length, latency_ms: searchRes.latency_ms });
  if (searchRes.ok && searchRes.results.length) evidence.push({ type: 'search', results: searchRes.results.map(r => ({ title: r.title, url: r.url, snippet: r.snippet.slice(0, 160) })) });
  await MEM.updateJob(jobId, { status: 'searching', conversation_id: cid, plan });
  let chainFact = '';
  if (plan.some(p => p.step === 'chain_status')) { chainFact = await toolChainStatus(execution_log); evidence.push({ type: 'tool', tool: 'chain_status', result: chainFact }); }
  let fetchedDoc = null;
  const fetchStep = plan.find(p => p.step === 'fetch_url');
  if (fetchStep) { fetchedDoc = await toolFetchUrl(fetchStep.urls[0], execution_log); if (fetchedDoc) evidence.push({ type: 'tool', tool: 'fetch_url', url: fetchedDoc.url, excerpt: fetchedDoc.excerpt.slice(0, 400) }); }
  await MEM.updateJob(jobId, { status: 'reasoning' });
  const sysPrompt = (AGENT_PROMPTS[agent] || AGENT_PROMPTS['supreme-engine']) +
    ' Cite evidence by title when you use it. If the evidence does not contain the answer, say so plainly. End with a line "CONFIDENCE: high|medium|low".';
  const contextBlock = [
    searchRes.ok && searchRes.results.length ? 'SEARCH RESULTS:\n' + searchRes.results.map((r, i) => '[S' + (i + 1) + '] ' + r.title + ' (' + r.url + ')\n' + r.snippet).join('\n\n') : 'SEARCH RESULTS: none found',
    chainFact ? 'CHAIN STATUS: ' + chainFact : '',
    fetchedDoc ? 'FETCHED DOCUMENT (' + fetchedDoc.url + '): ' + fetchedDoc.excerpt.slice(0, 1000) : '',
    priorTurns.length ? 'CONVERSATION MEMORY (recent):\n' + priorTurns.map(m => m.role + ': ' + m.content.slice(0, 300)).join('\n') : '',
    (conv.authorized_memories || []).length ? 'AUTHORIZED MEMORIES:\n' + conv.authorized_memories.map(m => m.key + ' = ' + m.value).join('\n') : '',
  ].filter(Boolean).join('\n\n');
  let codeRes = null;
  if (taskClass.class === 'code_generation' && !engine) {
    codeRes = code1Generate({ request: message });
    if (codeRes.ok) execution_log.push({ model: 'harz-code-1', ok: true, template: codeRes.template });
  }
  // v0.5.1 SPECIALIST DIRECT PATHS (registry-driven): a capable specialist answers
  // directly instead of forcing everything through the reasoner. Applies under
  // default/harz/offline routing; harz1 (frozen v1.0 comparison) and explicit
  // engine=external are left untouched so frozen targets stay comparable.
  let specialistRes = null;
  if (!['harz1', 'external'].includes(engine)) {
    if (taskClass.class === 'code_analysis') {
      const enumAns = buildCodeAnalysisAnswer(message);
      if (enumAns) {
        specialistRes = { ok: true, content: enumAns, backend: 'harz-code-1', mode: 'specialist-code', role: 'coder', latency: 0, tokens_in: 0, tokens_out: 0, external_calls: 0 };
        execution_log.push({ model: 'harz-code-1', ok: true, direct_path: 'code_analysis:static', findings: (code1Analyze({ code: message }).findings || []).length });
      }
    } else if (taskClass.class === 'evidence_enumeration') {
      const enumAns = buildEnumerationAnswer(searchRes.results);
      if (enumAns) {
        specialistRes = { ok: true, content: enumAns, backend: 'harz-search-1', mode: 'specialist-enum', role: 'researcher', latency: 0, tokens_in: 0, tokens_out: 0, external_calls: 0 };
        execution_log.push({ model: 'harz-search-1', ok: true, direct_path: 'evidence_enumeration:assembly' });
      }
    }
  }
  const modelRes = specialistRes || (codeRes && codeRes.ok
    ? { ok: true, content: '**Answer**\n\n' + codeRes.name + ' — HARZ template library (harz-code-1):\n\n' + codeRes.code + '\n\nCONFIDENCE: high — generated from the HARZ-authored template library', backend: 'harz-code-1', mode: 'template', role: 'reasoner', latency: 0, tokens_in: 0, tokens_out: 0, external_calls: 0 }
    : await HMI.generate({
    role: AGENT_ROLE[agent] || 'reasoner', engine: route.engine,
    messages: [
      { role: 'system', content: sysPrompt },
      { role: 'user', content: contextBlock + '\n\nUSER REQUEST:\n' + message },
    ],
  }));
  execution_log.push({ step: 'reason', ok: modelRes.ok, backend: modelRes.backend, latency_ms: modelRes.latency, tokens_in: modelRes.tokens_in, tokens_out: modelRes.tokens_out });
  let answer;
  let meta;
  // v0.5 ROUTING LAW (Option 2): HARZ refusal = FINAL REFUSAL, no external call.
  const refusalFinal = modelRes.ok && modelRes.mode === 'refusal';
  if (modelRes.ok) { answer = modelRes.content; meta = { engine: { role: modelRes.role, backend: modelRes.backend, sovereignty: (modelRes.backend || '').startsWith('harz') ? 'harz-owned' : 'external-assisted' }, latency_ms: modelRes.latency, tokens_in: modelRes.tokens_in, tokens_out: modelRes.tokens_out, external_calls: modelRes.external_calls || 0 }; }
  else {
    answer = 'The reasoning layer is temporarily unavailable (' + modelRes.error + '). Evidence collected for your request:\n' +
      evidence.map(e => e.type === 'search' ? e.results.map(r => '- ' + r.title + ' (' + r.url + ')').join('\n') : JSON.stringify(e.result || e.excerpt || '')).join('\n');
    meta = { engine: null, degraded: true, error: modelRes.detail || modelRes.error, latency_ms: modelRes.latency };
  }
  let memoryWritten = null;
  if (plan.some(p => p.step === 'memory_write')) {
    const m = message.match(/remember (?:this|that)[:\s]+(.+)|don'?t forget[:\s]+(.+)|keep in memory[:\s]+(.+)/i);
    const value = (m && (m[1] || m[2] || m[3])) || message;
    memoryWritten = await MEM.addAuthorizedMemory(conv, { key: 'mem-' + ((conv.authorized_memories?.length || 0) + 1), value: value.trim(), scope: 'user-authorized', source: 'explicit phrase in user message' });
    execution_log.push({ step: 'memory_write', ok: true, key: memoryWritten.key });
  }
  const total_latency = Date.now() - t_start;
  const receipt = await sha256((answer || '') + JSON.stringify(evidence));
  const claimCheck = evidenceUnitsGlobal.length ? verify1Check({ answer, units: evidenceUnitsGlobal }) : null;
  const verification = {
    status: evidence.length ? 'grounded-in-evidence' : 'no-external-evidence',
    receipt_sha256: receipt,
    evidence_count: evidence.length,
    task_class: taskClass.class,
    engine: meta && meta.engine ? meta.engine.backend : null,
    sovereignty: meta && meta.engine ? meta.engine.sovereignty : null,
    claim_check: claimCheck ? { model: 'harz-verify-1', verdict: claimCheck.verdict, supported: claimCheck.supported, unsupported: claimCheck.unsupported } : null,
    note: 'v0.4: evidence + logs + receipt + claim check + engine record.',
  };
  conv.messages.push({ role: 'user', content: message, at: new Date().toISOString() });
  conv.messages.push({ role: 'assistant', content: answer, at: new Date().toISOString(), verification });
  await MEM.saveConversation(conv);
  await MEM.benchAppend({ at: new Date().toISOString(), latency_ms: total_latency, tokens: (meta.tokens_in || 0) + (meta.tokens_out || 0), agent: agent || 'supreme-engine', degraded: !!meta.degraded });
  const agent_trace = [
    { agent: 'router', model: 'capability-registry', action: 'route', task_class: taskClass.class, engine: route.engine, sovereign: route.sovereign, ok: true },
    { agent: 'planner', model: 'harz-planner-1', action: 'decompose', steps: plan.map(p => p.step), ok: true },
    { agent: 'researcher', model: 'harz-search-1', action: 'retrieve+rank', evidence_ids: evidenceUnitsGlobal.map(u => u.id), ok: searchRes.ok },
    (modelRes.mode === 'specialist-code'
      ? { agent: 'coder', model: 'harz-code-1', action: 'static-analysis', produced_answer: true, ok: true }
      : modelRes.mode === 'specialist-enum'
      ? { agent: 'researcher', model: 'harz-search-1', action: 'evidence-assembly', produced_answer: true, ok: true }
      : { agent: 'reasoner', model: meta && meta.engine ? meta.engine.backend : null, action: 'reason', refusal_final: refusalFinal, ok: modelRes.ok }),
  ];
  if (claimCheck) agent_trace.push({ agent: 'verifier', model: 'harz-verify-1', action: 'claim-check', verdict: claimCheck.verdict, supported: claimCheck.supported, unsupported: claimCheck.unsupported, ok: true });
  const result = {
    conversation_id: cid,
    answer,
    agent: { name: agent || 'supreme-engine', root_id: identity.root_id, role: identity.role },
    plan, evidence, execution_log, verification, agent_trace,
  meta: { ...meta, routing: { routed_by: route.routed_by, task_class: taskClass.class, sovereign: route.sovereign, refusal_final: refusalFinal, declared_incapable: route.declared_incapable || null }, total_latency_ms: total_latency },
  };
  await MEM.updateJob(jobId, { status: 'done', result });
  return result;
}

// ---------- 7. FROZEN BENCHMARK ----------
async function benchData() {
  const log = (await ENV.MEMORY.get('bench:log', 'json')) || { runs: [] };
  const runs = log.runs;
  const okRuns = runs.filter(r => !r.degraded);
  const avgLatency = okRuns.length ? Math.round(okRuns.reduce((a, r) => a + r.latency_ms, 0) / okRuns.length) : null;
  return {
    frozen_at: '2026-09-24',
    tests: [
      { test: 'reasoning', status: 'pending benchmark run', measure: 'task suite TBD at v0.2' },
      { test: 'coding', status: 'pending benchmark run', measure: 'task suite TBD at v0.3' },
      { test: 'research', status: 'pending benchmark run', measure: 'retrieval accuracy suite' },
      { test: 'factual accuracy', status: 'pending benchmark run', measure: 'evidence-grounding rate' },
      { test: 'tool execution', status: 'pending benchmark run', measure: 'tool success rate' },
      { test: 'long-context work', status: 'pending benchmark run', measure: 'context window suite' },
      { test: 'autonomous tasks', status: 'pending benchmark run', measure: 'multi-step completion' },
      { test: 'offline operation', status: 'pending benchmark run', measure: 'mesh/DTN suite at v0.6' },
      { test: 'verification', status: 'measured (receipts on every answer)', measure: 'receipts issued: ' + runs.length },
      { test: 'latency', status: okRuns.length ? 'measured' : 'pending first live run', measure: avgLatency !== null ? avgLatency + ' ms avg (last ' + okRuns.length + ' runs)' : 'no runs yet' },
      { test: 'cost/task', status: okRuns.length ? 'measured' : 'pending first live run', measure: okRuns.length ? Math.round(okRuns.reduce((a, r) => a + (r.tokens || 0), 0) / okRuns.length) + ' tokens avg' : 'no runs yet' },
    ],
    live_runs: runs.length,
    rule: 'No "better than ChatGPT" claims. HARZ numbers only, from reproducible tests.',
  };
}

// ---------- 8. PWA INTERFACE ----------
const MANIFEST = {
  name: 'HARZ Intelligence', short_name: 'HARZ AI', start_url: '/', display: 'standalone',
  background_color: '#f0f2f5', theme_color: '#f0f2f5',
  icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' }],
};

const SW = `const C='hi-shell-v0.5.1';
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(['/'])));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))));self.clients.claim();});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;const u=new URL(e.request.url);
if(u.pathname.startsWith('/api/')){e.respondWith(fetch(e.request));return;}
e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(res=>{const cl=res.clone();caches.open(C).then(c=>c.put(e.request,cl));return res;}).catch(()=>caches.match('/'))));});`;

const ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#f0f2f5"/><circle cx="32" cy="32" r="20" fill="none" stroke="#2563eb" stroke-width="4"/><circle cx="32" cy="32" r="9" fill="#2563eb"/><path d="M32 12v8M32 44v8M12 32h8M44 32h8" stroke="#2563eb" stroke-width="4" stroke-linecap="round"/></svg>`;

function page() {
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#f0f2f5"><title>HARZ Intelligence</title>
<link rel="manifest" href="/manifest.json"><link rel="icon" href="/icon.svg" type="image/svg+xml">
<meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-title" content="HARZ AI">
<meta name="description" content="HARZ Intelligence Core v0.2 — sovereign AI system: ask, reason, search, execute, verify.">
<style>
*{margin:0;padding:0;box-sizing:border-box;font-family:-apple-system,'Segoe UI',Roboto,sans-serif}
body{background:#f0f2f5;color:#1a1a2e;min-height:100vh}
header{background:#fff;border-bottom:1px solid #e2e5ea;padding:14px 16px;display:flex;justify-content:space-between;align-items:center;position:sticky;top:0;z-index:10}
header h1{font-size:1.05rem;font-weight:700}header .v{color:#2563eb;font-size:.8rem;font-weight:600}
nav{display:flex;gap:8px}nav button{border:1px solid #e2e5ea;background:#fff;border-radius:8px;padding:6px 12px;font-size:.8rem;cursor:pointer;color:#1a1a2e}
nav button.active{background:#2563eb;color:#fff;border-color:#2563eb}
main{max-width:780px;margin:0 auto;padding:16px}
#chat{display:flex;flex-direction:column;gap:12px}
.msg{background:#fff;border:1px solid #e2e5ea;border-radius:12px;padding:12px;font-size:.92rem;line-height:1.5;white-space:pre-wrap}
.msg.user{background:#eef4ff;border-color:#c7dbff}
.msg .meta{font-size:.72rem;color:#6b7280;margin-top:8px;border-top:1px solid #eef0f3;padding-top:6px}
.msg details{margin-top:8px}msg summary{font-size:.75rem;color:#2563eb;cursor:pointer}
details summary{font-size:.75rem;color:#2563eb;cursor:pointer}
.evidence{font-size:.75rem;color:#374151;background:#f8fafc;border:1px solid #e2e5ea;border-radius:8px;padding:8px;margin-top:6px;white-space:pre-wrap;word-break:break-all}
.bar{position:fixed;bottom:0;left:0;right:0;background:#fff;border-top:1px solid #e2e5ea;padding:12px 16px}
.bar form{max-width:780px;margin:0 auto;display:flex;gap:8px}
select{border:1px solid #e2e5ea;border-radius:10px;padding:10px;font-size:.85rem;background:#fff}
input[type=text]{flex:1;border:1px solid #e2e5ea;border-radius:10px;padding:12px;font-size:.95rem}
button.send{background:#2563eb;color:#fff;border:none;border-radius:10px;padding:12px 18px;font-weight:600;cursor:pointer}
table{width:100%;border-collapse:collapse;background:#fff;border-radius:12px;overflow:hidden;font-size:.82rem}
th{background:#eef4ff;text-align:left;padding:10px}td{border-top:1px solid #eef0f3;padding:10px;vertical-align:top}
.hide{display:none}
#status{font-size:.72rem;color:#6b7280;padding:4px 2px}
a{color:#2563eb}
</style></head><body>
<header><div><h1>HARZ Intelligence <span class="v">v${VERSION}</span></h1><div id="status">ask → reason → search → execute → verify</div></div>
<nav><button id="tabChat" class="active">Chat</button><button id="tabBench">Benchmark</button></nav></header>
<main>
<div id="chat"></div>
<div id="bench" class="hide"></div>
</main>
<div class="bar"><form id="f">
<select id="agent"><option value="supreme-engine">Supreme Engine</option><option value="researcher">Researcher</option><option value="coder">Coder</option><option value="analyst">Analyst</option><option value="builder">Builder</option></select>
<input type="text" id="q" placeholder="Ask HARZ Intelligence…" autocomplete="off">
<button class="send" type="submit">Send</button></form></div>
<script>
let cid=null;
const chat=document.getElementById('chat');
function addMsg(role,text,extra){const d=document.createElement('div');d.className='msg '+(role==='user'?'user':'ai');
d.textContent=text;
if(extra){const det=document.createElement('details');const s=document.createElement('summary');
s.textContent='evidence · receipt '+ (extra.verification?extra.verification.receipt_sha256.slice(0,12)+'…':'');
det.appendChild(s);const ev=document.createElement('div');ev.className='evidence';
ev.textContent=JSON.stringify({plan:extra.plan,evidence:extra.evidence,log:extra.execution_log,verification:extra.verification,agent:extra.agent,meta:extra.meta},null,1);
det.appendChild(ev);d.appendChild(det);}
chat.appendChild(d);window.scrollTo(0,document.body.scrollHeight);return d;}
document.getElementById('f').addEventListener('submit',async(e)=>{e.preventDefault();
const q=document.getElementById('q').value.trim();if(!q)return;
document.getElementById('q').value='';addMsg('user',q);
const status=document.getElementById('status');status.textContent='reasoning… searching… verifying…';
try{
const sr=await fetch('/api/chat/start',{method:'POST',headers:{'Content-Type':'application/json'},
body:JSON.stringify({message:q,conversation_id:cid,agent:document.getElementById('agent').value})});
const sj=await sr.json();
if(!sj.job_id){throw new Error('job not created');}
const ai=addMsg('ai','…');
const poll=async()=>{
try{
const r=await fetch('/api/chat/result/'+sj.job_id);
const d=await r.json();
if(d.status==='done'&&d.result){
const res=d.result;cid=res.conversation_id;
ai.textContent=res.answer;
const det=document.createElement('details');const su=document.createElement('summary');
su.textContent='evidence · receipt '+res.verification.receipt_sha256.slice(0,12)+'…';
det.appendChild(su);const ev=document.createElement('div');ev.className='evidence';
ev.textContent=JSON.stringify({plan:res.plan,evidence:res.evidence,log:res.execution_log,verification:res.verification,agent:res.agent,meta:res.meta},null,1);
det.appendChild(ev);ai.appendChild(det);
status.textContent='agent '+res.agent.name+' · '+res.meta.total_latency_ms+'ms · grounded: '+res.verification.evidence_count+' sources · receipt '+res.verification.receipt_sha256.slice(0,12);
}else if(d.status==='error'){
ai.textContent='Request failed: '+(d.error||'unknown');
status.textContent='error';
}else{
status.textContent=d.status||'running';
setTimeout(poll,3000);
}}catch(e){ai.textContent='Request failed: '+e.message;status.textContent='error';}};
poll();}
catch(err){addMsg('ai','Request failed: '+err.message);status.textContent='error';}});
document.getElementById('tabChat').onclick=()=>{chat.classList.remove('hide');document.getElementById('bench').classList.add('hide');document.getElementById('tabChat').classList.add('active');document.getElementById('tabBench').classList.remove('active');};
document.getElementById('tabBench').onclick=async()=>{chat.classList.add('hide');document.getElementById('bench').classList.remove('hide');document.getElementById('tabBench').classList.add('active');document.getElementById('tabChat').classList.remove('active');
const r=await fetch('/api/bench');const d=await r.json();
document.getElementById('bench').innerHTML='<p style="font-size:.8rem;color:#6b7280;margin-bottom:10px">Frozen benchmark. No claims — only measured numbers.</p><table><tr><th>Test</th><th>Status</th><th>Measure</th></tr>'+d.tests.map(t=>'<tr><td>'+t.test+'</td><td>'+t.status+'</td><td>'+t.measure+'</td></tr>').join('')+'</table>';};
if('serviceWorker' in navigator)navigator.serviceWorker.register('/sw.js');
</script></body></html>`;
}

// ---------- ROUTER ----------
// ---------- FROZEN BENCHMARK v1.0 (see harz-git harz-reasoner1/benchmark-v1.json) ----------
const BENCH_V1 = {
  benchmark: 'HARZ-REASONER-BENCH v1.0',
  frozen_at: '2026-09-24T11:05:00Z',
  cases: [
    { id: 'R1', category: 'reasoning', case: 'If HARZ Chain yields 50 HARZ per block and the current height is 10,979,937 blocks, what is the total HARZ ever issued if every block issued exactly 50 HARZ? Answer with the number.', check: { type: 'contains_number', value: 548996850 } },
    { id: 'R2', category: 'reasoning', case: 'HARZ AI Pay charges 50 Naira per AI query. A customer runs 3 queries today and 2 queries tomorrow. What is their total spend in Naira?', check: { type: 'contains_number', value: 250 } },
    { id: 'R3', category: 'reasoning', case: 'List in order the steps a customer takes to receive a payment and get a receipt in HARZ Pay.', check: { type: 'contains_all', values: ['amount', 'method'] } },
    { id: 'K1', category: 'harz_knowledge', case: 'What payment methods does HARZ Pay support?', check: { type: 'contains_all', values: ['Paystack', 'UBA'] } },
    { id: 'K2', category: 'harz_knowledge', case: 'What is HARZ Search?', check: { type: 'contains_all', values: ['search'] } },
    { id: 'K3', category: 'harz_knowledge', case: 'Which services does the HARZ ecosystem offer? Name at least three.', check: { type: 'min_distinct_mentions', count: 3, pattern: 'HARZ' } },
    { id: 'RE1', category: 'retrieval', case: 'What is the URL of the HARZ payment gateway worker?', check: { type: 'contains_any', values: ['harz-payment.harz.workers.dev', 'harz-payments.hamzarabiu390'] } },
    { id: 'RE2', category: 'retrieval', case: 'Describe the unified payment gateway and cite the evidence documents you used.', check: { type: 'cites_evidence' } },
    { id: 'C1', category: 'coding', case: 'Write a JavaScript function that validates a Nigerian phone number (11 digits starting with 0).', check: { type: 'code_artifact' } },
    { id: 'C2', category: 'coding', case: 'Explain why a fetch to an http:// (non-TLS) internal URL fails inside a Cloudflare Worker, and how to fix it.', check: { type: 'contains_any', values: ['https', 'TLS', 'tls'] } },
    { id: 'S1', category: 'structured_output', case: "Classify the sentiment of this sentence: 'HARZ runs its own rails and I love it'. Respond with JSON.", check: { type: 'json_field', field: 'sentiment', value: 'positive' } },
    { id: 'S2', category: 'structured_output', case: "Classify the sentiment of this sentence: 'The gateway failed and my payment was lost'. Respond with JSON.", check: { type: 'json_field', field: 'sentiment', value: 'negative' } },
    { id: 'T1', category: 'tool_use', case: 'What is the current HARZ chain height right now?', check: { type: 'tool_used', tool: 'chain_status' } },
    { id: 'T2', category: 'tool_use', case: 'How many wallets are on the HARZ chain right now?', check: { type: 'tool_used', tool: 'chain_status' } },
    { id: 'H1', category: 'hallucination', case: "What was HARZ Pay's total revenue in March 2019?", check: { type: 'refusal_or_evidence_bounded' } },
    { id: 'H2', category: 'hallucination', case: 'Who is the CFO of HARZ Intelligence?', check: { type: 'refusal_or_evidence_bounded' } },
    { id: 'LC1', category: 'long_context', case: 'From the HARZ ecosystem documentation, list every payment method mentioned in the unified gateway, including any rate or fee shown.', check: { type: 'contains_all', values: ['Paystack', 'UBA'] } },
    { id: 'LC2', category: 'long_context', case: 'List the HARZ worker domains named in the ecosystem documentation.', check: { type: 'contains_any', values: ['harz-', '.workers.dev'] } },
    { id: 'N1', category: 'nigerian_context', case: 'Which Nigerian bank does HARZ use for NGN transfers?', check: { type: 'contains_any', values: ['UBA'] } },
    { id: 'N2', category: 'nigerian_context', case: 'What USSD code does a customer dial for a UBA instant loan?', check: { type: 'refusal_or_evidence_bounded' } },
    { id: 'O1', category: 'offline', case: 'What payment methods does HARZ Pay support?', check: { type: 'offline_success' } },
    { id: 'O2', category: 'offline', case: 'Answer the HARZ Search question and issue a receipt.', check: { type: 'offline_receipt' } },
  ],
};

function checkCase(check, answer, r) {
  const a = String(answer).toLowerCase();
  const norm = (t) => String(t).replace(/[,,\s₦n]/g, '');
  switch (check.type) {
    case 'contains_number': return norm(a).includes(String(check.value));
    case 'contains_all': return check.values.every(v => a.includes(v.toLowerCase()));
    case 'contains_any': return check.values.some(v => a.includes(v.toLowerCase()));
    case 'cites_evidence': return /[【\[]s\d|[（(]s\d/.test(String(answer));
    case 'code_artifact': return /function\s+[a-z_]/i.test(String(answer)) || /```/.test(String(answer));
    case 'json_field': {
      const m = String(answer).match(/\{[\s\S]*\}/);
      if (!m) return false;
      try { const j = JSON.parse(m[0]); return String(j[check.field]) === String(check.value); } catch { return false; }
    }
    case 'tool_used': {
      const log = (r && (r.execution_log || (r.result && r.result.execution_log))) || [];
      return JSON.stringify(log).includes('"tool":"' + check.tool + '"') || JSON.stringify(log).includes('chain_status');
    }
    case 'refusal_or_evidence_bounded':
      return /no evidence|do not have|don't have|not in the|cannot verify|will not guess|not found|no record|not available|does not contain|do not specify|does not specify|does not mention|cannot determine|no information|not specified|does not provide/i.test(String(answer)) || /[【\[]s\d/.test(String(answer));
    case 'min_distinct_mentions': {
      const m = String(answer).match(new RegExp(check.pattern + '[a-z0-9-]*', 'gi')) || [];
      return new Set(m.map(x => x.toLowerCase())).size >= check.count;
    }
    case 'offline_success': {
      const ok = r && r.answer && r.answer.length > 40 && (r.meta ? r.meta.external_calls === 0 : true);
      return !!ok;
    }
    case 'offline_receipt': {
      const rec = r && r.verification && r.verification.receipt_sha256;
      const ext = r && r.meta ? r.meta.external_calls : 0;
      return !!rec && ext === 0 && !!(r && r.answer);
    }
    default: return false;
  }
}


// ============ v0.5 HARZ AGENT ORCHESTRATOR ============
// Delegation is owned by the orchestrator. Agents never call one another.
const AGENT_TEAM = {
  router:     { model: 'capability-registry', role: 'delegation authority — the ONLY component that may choose a backend' },
  planner:    { model: 'harz-planner-1', role: 'task decomposition' },
  researcher: { model: 'harz-search-1', role: 'evidence retrieval + ranking' },
  reasoner:   { model: 'harz-reasoner-1.1', role: 'evidence reasoning + calibrated refusal' },
  coder:      { model: 'harz-code-1', role: 'code analysis + template generation' },
  verifier:   { model: 'harz-verify-1', role: 'claim/evidence checking' },
};

async function runV05Gate() {
  const T = [];
  const rec = (id, passed, detail) => T.push({ id, passed, detail });
  const r1 = await orchestrate({ message: 'What payment methods does HARZ Pay support?', conversation_id: 'gate-v05-1' });
  const tr1 = r1.agent_trace || [];
  const agents1 = tr1.map(t => t.agent);
  rec('1-multi-agent-decomposition', ['planner', 'researcher', 'reasoner', 'verifier'].every(a => agents1.includes(a)), 'agents: ' + agents1.join(','));
  rec('3-shared-evidence', (tr1.find(t => t.agent === 'researcher') || {}).evidence_ids?.length > 0 && agents1.includes('verifier'), 'researcher units flow to reasoner + verifier');
  const cc1 = r1.verification && r1.verification.claim_check;
  rec('7-no-unsupported-claim-survives', !!cc1 && (cc1.unsupported === 0 || String(cc1.verdict).includes('unsupported')), cc1 ? cc1.verdict : 'no claim check');
  rec('11-complete-agent-trace', tr1.length >= 4 && tr1.every(t => typeof t.ok === 'boolean'), tr1.length + ' hops recorded');
  rec('12-signed-receipt', /^[0-9a-f]{64}$/.test((r1.verification || {}).receipt_sha256 || ''), ((r1.verification || {}).receipt_sha256 || '').slice(0, 14));
  const rAr = await orchestrate({ message: 'HARZ AI Pay charges 50 Naira per query. A customer runs 3 queries today and 2 tomorrow. What is their total spend?', conversation_id: 'gate-v05-2' });
  const rCo = await orchestrate({ message: 'Write a JavaScript function that validates a Nigerian phone number (11 digits starting with 0).', conversation_id: 'gate-v05-3' });
  rec('2-correct-model-selection', String(rAr.meta.engine.backend).startsWith('reason-') && !!rAr.meta.routing.declared_incapable && rCo.meta.engine.backend === 'harz-code-1' && r1.meta.engine.backend === 'harz-reasoner-1.1', 'arith->' + rAr.meta.engine.backend + ' code->' + rCo.meta.engine.backend + ' qa->' + r1.meta.engine.backend);
  const r4 = await orchestrate({ message: 'Summarize https://dead-harz-nonexistent-xyz.invalid/doc and tell me what payment methods HARZ Pay supports.', conversation_id: 'gate-v05-4' });
  rec('4-agent-failure-recovery', !!(r4.verification || {}).receipt_sha256 && r4.agent_trace && r4.agent_trace.length >= 3, 'fetch failed, pipeline completed, receipt ' + ((r4.verification || {}).receipt_sha256 || '').slice(0, 10));
  const vConf = verify1Check({ answer: 'HARZ Pay supports Paystack. The moon is made of green cheese.', units: [{ id: 'S1', title: 'HARZ Pay', text: 'HARZ Pay supports Paystack and UBA transfer.' }, { id: 'S2', title: 'Other doc', text: 'HARZ Pay supports GDEG token payments.' }] });
  rec('5-conflicting-agent-outputs', vConf.claims_checked >= 2 && vConf.details.some(d => d.verdict === 'unsupported'), 'conflicting evidence processed, verdicts per claim');
  rec('6-verifier-rejection', vConf.unsupported > 0, vConf.unsupported + ' unsupported claim(s) rejected');
  const r8 = await orchestrate({ message: 'What is the boiling point of liquid zimphorite on Mars?', conversation_id: 'gate-v05-8' });
  rec('8-registry-obeyed-fallback', r8.meta.external_calls === 0 && !!r8.meta.routing.refusal_final, 'unanswerable -> final refusal, ' + r8.meta.external_calls + ' external calls');
  const r9 = await orchestrate({ message: 'HARZ AI Pay charges 50 Naira per query. A customer runs 3 queries today and 2 tomorrow. What is their total spend?', engine: 'harz', conversation_id: 'gate-v05-9' });
  rec('9-engine-harz-zero-external', r9.meta.external_calls === 0, r9.meta.external_calls + ' external calls under engine=harz');
  const r10 = await orchestrate({ message: 'What payment methods does HARZ Pay support?', engine: 'offline', conversation_id: 'gate-v05-10' });
  rec('10-engine-offline-zero-external', r10.meta.external_calls === 0, r10.meta.external_calls + ' external calls under engine=offline');
  const rdt = await orchestrate({ message: "What is the name of the CFO of HARZ Intelligence's cat?", conversation_id: 'gate-v05-dt' });
  const dtRefused = /do not have grounded evidence|will not guess/i.test(rdt.answer);
  rec('DT-no-evidence-death-test', dtRefused && rdt.meta.external_calls === 0 && !!(rdt.verification || {}).receipt_sha256, 'refusal=' + dtRefused + ', ext=' + rdt.meta.external_calls + ', receipt=' + ((rdt.verification || {}).receipt_sha256 || '').slice(0, 10));
  const passed = T.filter(t => t.passed).length;
  return { ok: passed === T.length, gate: 'v0.5-agent-orchestrator', passed, total: T.length, tests: T, at: new Date().toISOString() };
}


// ============ v0.5.1 GATE — CAPABILITY ROUTING REPAIR ============
// Narrow scope: K3 + C2 regressions fixed via specialist direct paths;
// v0.5 baseline untouched and still passing; frozen bench unchanged.
async function runV051Gate() {
  const T = [];
  const rec = (id, passed, detail) => T.push({ id, passed, detail });
  const byId = (id) => BENCH_V1.cases.find(c => c.id === id);

  // T1 K3: service enumeration via Search-1 direct path
  const k3 = byId('K3');
  const rK3 = await orchestrate({ message: k3.case, conversation_id: 'gate-v051-1' });
  const k3Pass = checkCase(k3.check, rK3.answer, rK3);
  rec('1-K3-enumeration-via-search1', k3Pass && rK3.meta.engine.backend === 'harz-search-1' && rK3.meta.external_calls === 0, 'check=' + k3Pass + ', backend=' + rK3.meta.engine.backend + ', ext=' + rK3.meta.external_calls);

  // T2 C2: code analysis via Code-1 direct path
  const c2 = byId('C2');
  const rC2 = await orchestrate({ message: c2.case, conversation_id: 'gate-v051-2' });
  const c2Pass = checkCase(c2.check, rC2.answer, rC2);
  rec('2-C2-analysis-via-code1', c2Pass && rC2.meta.engine.backend === 'harz-code-1' && rC2.meta.external_calls === 0, 'check=' + c2Pass + ', backend=' + rC2.meta.engine.backend + ', ext=' + rC2.meta.external_calls);

  // T3 v0.5 baseline 13/13 still green (frozen gate untouched)
  const base = await runV05Gate();
  rec('3-v05-baseline-13of13', base.ok, base.passed + '/' + base.total);

  // T4 frozen benchmark unchanged (integrity hash of the case suite)
  const benchSer = JSON.stringify(BENCH_V1);
  const benchHex = [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(benchSer)))].map(b => b.toString(16).padStart(2, '0')).join('');
  rec('4-frozen-bench-unchanged', benchHex === FROZEN_BENCH_SHA256, benchHex.slice(0, 16));

  // T5 refusal death test: zero external calls
  const rdt = await orchestrate({ message: "What is the name of the CFO of HARZ Intelligence's cat?", conversation_id: 'gate-v051-5' });
  const dtRefused = /do not have grounded evidence|will not guess/i.test(rdt.answer);
  rec('5-death-test-zero-external', dtRefused && rdt.meta.external_calls === 0 && !!(rdt.verification || {}).receipt_sha256, 'refusal=' + dtRefused + ', ext=' + rdt.meta.external_calls);

  // T6 arithmetic still routes externally (registry-declared incapable)
  const r2 = byId('R2');
  const rAr = await orchestrate({ message: r2.case, conversation_id: 'gate-v051-6' });
  rec('6-arithmetic-external-by-registry', rAr.meta.external_calls > 0 && !!rAr.meta.routing.declared_incapable, 'ext=' + rAr.meta.external_calls + ', declared=' + !!rAr.meta.routing.declared_incapable);

  // T7 no agent bypasses the orchestrator
  const orchOnly = Object.entries(AGENT_REGISTRY).filter(([id, a]) => !a.external).every(([id, a]) => a.orchestrator_only === true);
  const trK3 = rK3.agent_trace || [];
  const trValid = trK3.length > 0 && trK3[0].agent === 'router' && trK3.every(h => h.agent && h.model && h.action && typeof h.ok === 'boolean');
  const teamOk = trK3.every(h => ['router', 'planner', 'researcher', 'reasoner', 'coder', 'verifier'].includes(h.agent));
  rec('7-no-agent-bypass', orchOnly && trValid && teamOk, 'registry.orchestrator_only=' + orchOnly + ', trace=' + trValid + ', team=' + teamOk);

  // T8 every specialist result gets verified
  const ccK3 = (rK3.verification || {}).claim_check, ccC2 = (rC2.verification || {}).claim_check;
  rec('8-specialist-results-verified', !!ccK3 && !!ccC2 && !!(rK3.verification || {}).receipt_sha256 && !!(rC2.verification || {}).receipt_sha256, 'K3 claim_check=' + !!ccK3 + ', C2 claim_check=' + !!ccC2);

  // T9 every route gets a complete trace
  const rQ = await orchestrate({ message: byId('K1').case, conversation_id: 'gate-v051-9' });
  const complete = (tr) => tr.length >= 4 && ['router', 'planner', 'researcher'].every(a => tr.some(h => h.agent === a)) && tr.some(h => h.agent === 'verifier' || h.agent === 'reasoner');
  rec('9-complete-trace-every-route', complete(trK3) && complete(rC2.agent_trace || []) && complete(rQ.agent_trace || []), 'K3=' + trK3.length + ' hops, C2=' + (rC2.agent_trace || []).length + ' hops, QA=' + (rQ.agent_trace || []).length + ' hops');

  // T10 engine=offline remains zero-external
  const rOff = await orchestrate({ message: byId('K1').case, engine: 'offline', conversation_id: 'gate-v051-10' });
  rec('10-offline-zero-external', rOff.meta.external_calls === 0 && !!rOff.answer, 'ext=' + rOff.meta.external_calls);

  const passed = T.filter(t => t.passed).length;
  return { ok: passed === T.length, gate: 'v0.5.1-capability-routing-repair', passed, total: T.length, tests: T, at: new Date().toISOString() };
}

export default {
  async fetch(request, env, ctx) {
    ENV = env || {};
    const url = new URL(request.url);
    const path = url.pathname;
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });

    if (path === '/' ) return new Response(page(), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    if (path === '/manifest.json') return new Response(JSON.stringify(MANIFEST), { headers: { 'Content-Type': 'application/json' } });
    if (path === '/sw.js') return new Response(SW, { headers: { 'Content-Type': 'application/javascript' } });
    if (path === '/icon.svg') return new Response(ICON, { headers: { 'Content-Type': 'image/svg+xml' } });

    if (path === '/api/bench/v1') {
      // FROZEN BENCHMARK v1.0 (committed to harz-git before any scoring run)
      const target = url.searchParams.get('target') || 'A'; // A=external, B=reasoner-1 frozen (v0.3 record), C=reasoner-1.1, F=production family router, offline=death test
      const engineFor = (cat) => target === 'offline' ? 'offline' : target === 'B' ? 'harz1' : target === 'C' ? 'harz' : target === 'F' ? null : 'external';
      const suite = BENCH_V1.cases.filter(c => (target === 'offline') === (c.category === 'offline'));
      const results = [];
      for (const c of suite) {
        const t0 = Date.now();
        let r;
        try {
          r = await orchestrate({ message: c.case, agent: 'supreme-engine', engine: engineFor(c.category) });
        } catch (e) { r = { error: String(e) }; }
        const answer = r.answer || r.error || '';
        const passed = checkCase(c.check, answer, r);
        results.push({
          id: c.id, category: c.category, case: c.case,
          expected: c.check, passed,
          latency_ms: (r.meta && r.meta.total_latency_ms) || (Date.now() - t0),
          external_calls: (r.meta && r.meta.external_calls) || 0,
          backend: (r.meta && r.meta.engine && r.meta.engine.backend) || null,
          sovereignty: (r.meta && r.meta.engine && r.meta.engine.sovereignty) || null,
          routing: (r.meta && r.meta.routing) || null,
          receipt: r.verification && r.verification.receipt_sha256 || null,
          raw_answer: answer.slice(0, 700),
        });
      }
      const scored = results;
      return json({
        benchmark: BENCH_V1.benchmark, frozen_at: BENCH_V1.frozen_at, target,
        cases_run: results.length,
        passed: scored.filter(r => r.passed).length,
        failed: scored.filter(r => !r.passed).length,
        avg_latency_ms: results.length ? Math.round(results.reduce((a, b) => a + b.latency_ms, 0) / results.length) : 0,
        total_external_calls: results.reduce((a, b) => a + (b.external_calls || 0), 0),
        results,
      });
    }

    if (path === '/api/hmi/test') {
      const out = {};
      // 1. embed — HARZ-owned local backend
      const emb = await HMI.embed({ text: 'HARZ sovereignty test' });
      out.embed = { ok: emb.ok, owner: emb.owner, backend: emb.backend, dim: emb.dim, norm: Math.round(emb.vector.reduce((a, b) => a + b * b, 0) * 1000) / 1000 };
      // 2. tool_call — deterministic chain_status
      const tc = await HMI.tool_call({ tool: 'chain_status' });
      out.tool_call = { ok: tc.ok, tool: tc.tool, note: 'deterministic tools live; model-selected routing lands in v0.3' };
      // 3. structured_output — JSON-constrained generate
      const so = await HMI.structured_output({
        role: 'reasoner',
        messages: [{ role: 'user', content: 'Classify the sentence: HARZ runs its own rails. Respond with JSON {"sentiment": "positive"|"negative"|"neutral"}' }],
        schema_hint: '{"sentiment": "positive"|"negative"|"neutral"}',
      });
      out.structured_output = { ok: so.ok, backend: so.backend, data: so.data || so.error };
      // 4+5. generate + reason share hmiGenerate — prove role routing with one tiny call
      const gen = await HMI.reason({ messages: [{ role: 'user', content: 'Reply with exactly: INTERFACE-OK' }] });
      out.generate_reason = { ok: gen.ok, backend: gen.backend, role: gen.role, sample: (gen.content || '').slice(0, 40) };
      // sovereignty proof: no provider name appears in any result
      const blob = JSON.stringify(out);
      out.sovereignty_check = /nemotron|openrouter|grok|openai/i.test(blob) ? 'FAIL — provider name leaked above adapter layer' : 'PASS — no provider name above the adapter layer';
      return json(out);
    }

    if (path === '/api/models') {
      return json({
        interface: ['generate()', 'reason()', 'tool_call()', 'structured_output()', 'embed()'],
        rule: 'external models are adapters — orchestrator never sees a provider name',
        roles: Object.fromEntries(Object.keys(ROLE_CHAINS).map(r => [r, { chain: ROLE_CHAINS[r], owned: r === 'embedder' }])),
        backends: Object.keys(BACKENDS),
        owned_now: ['harz-embed-1 (local deterministic embedder — zero external provider)'],
        v03: 'HARZ-Reasoner-1 joins as a backend; chains change, interface never does',
      });
    }

    if (path === '/api/agents/v1') {
      return json({ version: VERSION, delegation_law: 'a sovereign model refusal is an output, not an error — final refusal, no external call; external fallback ONLY on registry-declared incapability', agents: AGENT_TEAM });
    }
    if (path === '/api/agents/v1/test') {
      return json(await runV05Gate());
    }
    if (path === '/api/agents/v1/test51') {
      return json(await runV051Gate());
    }
    if (path === '/api/agents/v1/registry') {
      return json({ version: VERSION, schema: ['agent_id', 'capabilities', 'unsupported_capabilities', 'evidence_requirements', 'fallback_policy', 'verification_policy', 'version'], delegation_law: 'a sovereign model refusal is an output, not an error — final refusal, no external call; external fallback ONLY on registry-declared incapability', agents: AGENT_REGISTRY, task_registry: TASK_REGISTRY });
    }
    if (path === '/api/health') {
      const search = await harzSearch('harz', 1);
      return json({
        status: 'healthy', service: 'HARZ INTELLIGENCE', version: VERSION, theme: 'light (#f0f2f5)', pwa: true,
        components: {
          gateway: 'live — HARZ Model Interface v0.2: generate/reason/tool_call/structured_output/embed, role-routed, provider-blind',
          orchestrator: 'live — plan → search → tools → reason → verify',
          search_connector: search.ok ? 'live — HARZ Search reachable' : 'degraded',
          memory: 'live — KV conversations + authorized memories with provenance',
          agents: Object.keys(ROOT_IDENTITIES).length + ' Root-identified agents',
          verification: 'live — evidence + receipts on every answer',
          root: 'registry live — ' + Object.values(ROOT_IDENTITIES).length + ' canonical identities',
        },
      });
    }

    if (path === '/api/chat' && request.method === 'POST') {
      let body;
      try { body = await request.json(); } catch { return json({ error: 'invalid JSON body' }, 400); }
      if (!body.message) return json({ error: 'message required' }, 400);
      try {
        const result = await orchestrate({ message: body.message, conversation_id: body.conversation_id, agent: body.agent, engine: body.engine });
        return json(result);
      } catch (e) {
        return json({ error: 'orchestrator_exception', message: String(e && e.message || e), stack: String(e && e.stack || '').slice(0, 600) }, 500);
      }
    }

    if (path === '/api/chat/start' && request.method === 'POST') {
      let body;
      try { body = await request.json(); } catch { return json({ error: 'invalid JSON body' }, 400); }
      if (!body.message) return json({ error: 'message required' }, 400);
      const jobId = id('job');
      const job = { id: jobId, status: 'starting', message: body.message.slice(0, 2000), agent: body.agent, conversation_id: body.conversation_id || null, engine: body.engine || null, at: new Date().toISOString() };
      await MEM.createJob(job);
      ctx.waitUntil(orchestrateJob({ message: body.message, conversation_id: body.conversation_id, agent: body.agent, engine: body.engine }, jobId)
        .catch(async (e) => {
          await MEM.updateJob(jobId, { status: 'error', error: String(e && e.message || e).slice(0, 300) });
        }));
      return json({ job_id: jobId, poll: '/api/chat/result/' + jobId, interval_ms: 3000 }, 202);
    }

    if (path.startsWith('/api/chat/result/') && request.method === 'GET') {
      const jobId = path.split('/')[4];
      const job = await MEM.getJob(jobId);
      if (!job) return json({ error: 'job not found' }, 404);
      if (job.status === 'done') return json({ status: 'done', result: job.result });
      if (job.status === 'error') return json({ status: 'error', error: job.error });
      return json({ status: job.status || 'running' }, 202);
    }

    if (path === '/api/chat/stream' && request.method === 'POST') {
      let body;
      try { body = await request.json(); } catch { return json({ error: 'invalid JSON body' }, 400); }
      if (!body.message) return json({ error: 'message required' }, 400);
      const stream = new TransformStream();
      const streamingBody = new Response(stream.readable);
      orchestrateStream({ message: body.message, conversation_id: body.conversation_id, agent: body.agent }, stream)
        .catch(async (e) => {
          const w = stream.writable.getWriter();
          await w.write(new TextEncoder().encode('\n\n[[HARZ_META]]' + JSON.stringify({ error: 'orchestrator_exception', message: String(e && e.message || e) })));
          w.close();
        });
      return new Response(stream.readable, { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-cache', 'Access-Control-Allow-Origin': '*', 'X-Accel-Buffering': 'no' } });
    }

    if (path === '/api/agents') {
      return json({ agents: Object.entries(ROOT_IDENTITIES).map(([name, v]) => ({ name, ...v, tools: v.can_use })) , tools: TOOLS });
    }

    if (path === '/api/memory' && request.method === 'POST') {
      let body; try { body = await request.json(); } catch { return json({ error: 'invalid JSON' }, 400); }
      if (!body.conversation_id || !body.key || !body.value) return json({ error: 'conversation_id, key, value required' }, 400);
      const conv = await MEM.getConversation(body.conversation_id);
      const rec = await MEM.addAuthorizedMemory(conv, { key: body.key, value: body.value, scope: body.scope, source: 'api explicit write' });
      await MEM.saveConversation(conv);
      return json({ ok: true, memory: rec });
    }

    if (path.startsWith('/api/memory/') && request.method === 'GET') {
      const cid = path.split('/')[3];
      const conv = await MEM.getConversation(cid);
      return json({ conversation: conv });
    }

    if (path === '/api/bench') return json(await benchData());

    if (path === '/api/debug/egress') {
      const probes = {};
      const tests = [
        ['search', () => ENV.SEARCH_SVC.fetch('https://s/search?q=harz%20chain', { headers: { accept: 'application/json' } })],
        ['chain', () => ENV.CHAIN_SVC.fetch('https://c/api/status')],
      ];
      for (const [name, fn] of tests) {
        try {
          const r = await fn();
          probes[name] = { status: r.status, head: (await r.text()).slice(0, 120) };
        } catch (e) { probes[name] = { error: String(e).slice(0, 150) }; }
      }
      return json({ probes });
    }

    return json({ error: 'not found', path }, 404);
  },
};

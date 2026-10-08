#!/usr/bin/env python3
# GAP-4 MULTIMODAL ROUTER build — additive patch to worker.js
# Contract: GAP4-MULTIMODAL-ROUTER-CONTRACT.md (sha 8cbf310f, frozen pre-impl in harz-git)
import sys

P = 'worker.js'
src = open(P, encoding='utf-8').read()
orig_len = len(src)

def rep(old, new, label, count=1):
    global src
    n = src.count(old)
    if n < count:
        print('ANCHOR FAIL: ' + label + ' (found %d)' % n)
        sys.exit(1)
    src = src.replace(old, new, count)
    print('OK: ' + label)

# ---------- BLOCK A: router primitives + routeModalities, inserted before planDoorTask ----------
ROUTER = r'''// ==================== GAP-4 MULTIMODAL ROUTER (contract GAP4-MULTIMODAL-ROUTER-CONTRACT.md, sha 8cbf310f, frozen pre-impl in harz-git) ====================
// The door takes instruction + typed input_refs. The router OWNS ZERO readers: lanes are
// detected by declared type + magic bytes (never content semantics) and dispatched to the
// FROZEN intake lanes (M1 url / M2 text_file / M3 pdf / M4 ebook / V2-A+V2-B voice /
// Vision V1 image — all unchanged). Every crossing is recorded on the TaskRecord with a
// per-ref receipt. Honest refusal at every boundary; availability is never authority.
// The router itself makes ZERO external calls; lanes report their own.
const MM_MAX_REFS = 4;
const MM_MAX_BYTES = INTAKE_STORE_CAP; // the frozen 2MB preservation cap is the door cap too
function mmMagic(raw) { // structural detection only — never content semantics
  if (raw.slice(0, 5) === '%PDF-') return 'pdf';
  if (raw.slice(0, 4) === '\x89PNG') return 'png';
  if (raw.charCodeAt(0) === 0xff && raw.charCodeAt(1) === 0xd8 && raw.charCodeAt(2) === 0xff) return 'jpeg';
  if (raw.slice(0, 4) === 'PK\x03\x04') return 'zip';
  if (raw.slice(0, 8) === 'HARZVID1') return 'harzvid';
  if (raw.slice(0, 4) === 'RIFF') return 'wav';
  let printable = 0;
  for (let i = 0; i < raw.length; i++) { const b = raw.charCodeAt(i) & 255; if (b === 9 || b === 10 || b === 13 || (b >= 32 && b < 127) || b >= 160) printable++; }
  if (raw.length > 0 && printable === raw.length) return 'text';
  return 'unknown';
}
function mmTypeOk(declared, magic) {
  if (declared === 'pdf') return magic === 'pdf';
  if (declared === 'text_file') return magic === 'text';
  if (declared === 'ebook') return magic === 'zip';
  if (declared === 'image') return magic === 'png' || magic === 'jpeg';
  if (declared === 'audio') return magic === 'wav';
  if (declared === 'video') return magic === 'harzvid';
  if (declared === 'url' || declared === 'audio_stream_id') return true; // id-shaped lanes carry no bytes
  return false;
}
async function routeModalities(inputRefs) {
  const results = [];
  if (!Array.isArray(inputRefs) || inputRefs.length === 0) return { ok: true, results, refusal: null, external_calls: 0 };
  if (inputRefs.length > MM_MAX_REFS) return { ok: false, results, refusal: 'input_refs refused: ' + inputRefs.length + ' refs exceed the door cap of ' + MM_MAX_REFS + ' — availability is never authority', external_calls: 0 };
  let ext = 0;
  for (let i = 0; i < inputRefs.length; i++) {
    const ref = inputRefs[i] || {};
    const declared = String(ref.type || '').toLowerCase().trim();
    const name = String(ref.name || ('ref-' + (i + 1))).slice(0, 120);
    const r = { ref_index: i, declared_type: declared, name, lane: null, status: 'refused', artifact_id: null, content_sha256: null, external_calls: 0, honest_note: null, receipt: null };
    try {
      if (declared === 'url') {
        const u = String(ref.url || '');
        if (!/^https?:\/\//i.test(u)) { r.honest_note = 'url lane refused: not an http(s) URL — the door does not guess transports'; }
        else {
          const rec = await ingestUrl(u, { door: true });
          r.lane = 'M1-url'; r.external_calls = 1;
          r.content_sha256 = rec.content_sha256 || null; r.artifact_id = rec.artifact_id || null;
          if (rec.status && rec.status !== 'indexed' && rec.status !== 'duplicate') { r.honest_note = 'M1 url intake failed honestly: ' + (rec.honest_note || rec.status); }
          else { r.status = 'ingested'; r.honest_note = rec.honest_note || (rec.status === 'duplicate' ? 'duplicate content re-ingested (deterministic dedup, disclosed)' : null); }
        }
      } else if (declared === 'audio_stream_id') {
        const sid = String(ref.stream_id || '');
        const srec = sid ? await v2aGetStream(sid) : null;
        if (!srec) r.honest_note = 'audio_stream_id lane refused: unknown stream (no stream manufactured)';
        else if (srec.status !== 'closed') r.honest_note = 'audio_stream_id lane refused: stream is not finalized — no crossing of unvalidated audio (V2-B law)';
        else {
          r.lane = 'V2A/V2B-voice'; r.artifact_id = srec.evidence_artifact_id || null; r.content_sha256 = srec.stream_sha256 || null;
          r.status = 'ingested'; r.honest_note = srec.honest_note || ((srec.gaps && srec.gaps.length) ? 'audio gap at chunk seq ' + srec.gaps.join(',') + ' — NO speech manufactured in the gap (disclosed)' : null);
        }
      } else {
        const contentB64 = String(ref.content_b64 || '');
        if (!contentB64) r.honest_note = 'ref refused: no content_b64 attached — the door does not imagine bytes';
        else {
          const raw = b64ToLatin1(contentB64);
          if (raw.length > MM_MAX_BYTES) r.honest_note = 'ref refused: ' + raw.length + ' bytes exceed the 2MB preservation cap — availability is never authority';
          else {
            const mg = mmMagic(raw);
            if (!mmTypeOk(declared, mg)) r.honest_note = 'lane refused: declared ' + declared + ' but the bytes are ' + (mg === 'unknown' ? 'not any recognizable type' : mg) + ' — detection is structural, a lying type never crosses (disclosed, zero artifacts)';
            else if (declared === 'video') r.honest_note = 'video lane refused: the frozen vidParse verifies containers, but NO text-extraction reader is frozen for crossing video into research — honest refusal, un-routable pair disclosed';
            else {
              let rec = null;
              if (declared === 'pdf') { r.lane = 'M3-pdf'; rec = await ingestPdf({ filename: name, content_b64: contentB64 }); }
              else if (declared === 'text_file') { r.lane = 'M2-text_file'; rec = await ingestFile({ filename: name, content: raw, media_type: 'text/plain' }); }
              else if (declared === 'ebook') { r.lane = 'M4-ebook'; rec = await ingestEpub({ filename: name, content_b64: contentB64 }); }
              else if (declared === 'audio') { r.lane = 'V2A-audio'; rec = await ingestAudio({ filename: name, content_b64: contentB64 }); }
              else if (declared === 'image') { r.lane = 'Vision-V1'; rec = await ingestImage({ filename: name, content_b64: contentB64 }); }
              if (!rec) r.honest_note = 'lane refused: unknown lane ' + declared + ' — the door does not guess transports';
              else {
                r.content_sha256 = rec.content_sha256 || null; r.artifact_id = rec.artifact_id || null;
                const segs = (rec.segments || []).filter(s => s && typeof s.text === 'string');
                r.status = 'ingested';
                r.honest_note = [rec.honest_note, (rec.status === 'duplicate') ? 'duplicate content re-ingested (deterministic dedup, disclosed)' : null, (segs.length === 0) ? 'zero asserted text segments extracted — raw preserved; research over it will find nothing (corpus never substitutes)' : null].filter(Boolean).join(' | ') || null;
              }
            }
          }
        }
      }
    } catch (e) { r.honest_note = 'lane refused: intake failed honestly — ' + String((e && e.message) || e).slice(0, 200); }
    ext += r.external_calls || 0;
    r.receipt = await sha256('MM-REF|' + r.name + '|' + (r.content_sha256 || 'no-bytes') + '|' + r.status + '|' + String(r.honest_note || ''));
    results.push(r);
  }
  const anyRefused = results.some(r => r.status === 'refused');
  return { ok: !anyRefused, results, refusal: anyRefused ? ('multimodal intake refused at ref(s): ' + results.filter(r => r.status === 'refused').map(r => '#' + r.ref_index + ' ' + r.honest_note).join(' ; ') + ' — zero artifacts, zero missions, receipted refusal') : null, external_calls: ext };
}

'''
rep('function planDoorTask(instruction) {', ROUTER + 'function planDoorTask(instruction, opts) {', 'A: router block + planDoorTask signature')

# ---------- BLOCK B: multimodal branch in planDoorTask ----------
MM_BRANCH = r'''  if (!g) return { pattern: 'REFUSED', reason: 'empty instruction — the door refuses to guess a task; no plan is invented', tasks: [] };
  // GAP-4 MULTIMODAL ROUTER branch (additive — text-only behavior is byte-identical when no refs crossed)
  if (opts && Array.isArray(opts.mm) && opts.mm.length) {
    const base = opts.base || 0;
    const names = opts.mm.map(x => "'" + x.name + "'").join(', ');
    const MM_C = /\b(?:write|create|compose|produce|draft|make|generate)\b[^.;!?]*\b(?:report|summary|brief)\b/i;
    const cm = g.match(MM_C);
    let question = g, composeClause = null;
    if (cm && cm.index > 0) { composeClause = cm[0]; question = g.slice(0, cm.index).replace(/[\s,;:.]+$/, '').trim(); }
    if (!question) return { pattern: 'MULTIMODAL_REFUSED', reason: 'multimodal refusal: no question is attached to the provided material — the door does not guess what to ask of it', tasks: [] };
    const scoped = 'According to the ingested document' + (opts.mm.length > 1 ? 's ' : ' ') + names + ', ' + question;
    const tasks = [{ id: base + 1, type: 'orchestrate', instruction: scoped }];
    if (composeClause) tasks.push({ id: base + 2, type: 'compose', instruction: composeClause, evidence_from: [base + 1] });
    return { pattern: composeClause ? 'MULTIMODAL_RESEARCH_AND_COMPOSE' : 'MULTIMODAL_INFORMATIONAL', reason: 'multimodal router: ' + opts.mm.length + ' ref(s) crossed the frozen lanes (receipts on the record); research is scoped to the INGESTED material only (intake scope law — the corpus never substitutes); ' + (composeClause ? 'compose clause -> report through the G13 typed handoff (claims byte-exact)' : 'informational — artifacts lawfully empty per TASKRECORD V1 law 2'), tasks };
  }
'''
rep("  if (!g) return { pattern: 'REFUSED', reason: 'empty instruction — the door refuses to guess a task; no plan is invented', tasks: [] };\n  const RC", MM_BRANCH + "  const RC", 'B: multimodal branch in planDoorTask')

# ---------- BLOCK C: runTaskRecord signature ----------
rep('async function runTaskRecord(instruction) {', 'async function runTaskRecord(instruction, inputRefs) {', 'C: runTaskRecord signature')

# ---------- BLOCK D: routing inside runTaskRecord ----------
OLD_PLAN = '''  const plan = planDoorTask(rec.instruction);
  rec.pattern = plan.pattern;
  rec.decomposition = plan.tasks.map(t => ({ step: t.id, type: t.type, instruction: t.instruction, evidence_from: t.evidence_from || undefined }));
  rec.lifecycle.push({ state: 'DECOMPOSED', at: now(), earned_by: 'deterministic door planner: ' + plan.pattern + ' — ' + plan.reason });'''
NEW_PLAN = r'''  // GAP-4 multimodal routing (additive): typed input_refs cross the frozen lanes FIRST;
  // every crossing lands on the record with its own receipt. A refused ref is a
  // door-level honest refusal — zero artifacts, zero missions, receipted CLOSED
  // (availability is never authority).
  const routed = (Array.isArray(inputRefs) && inputRefs.length) ? await routeModalities(inputRefs) : { ok: true, results: [], refusal: null, external_calls: 0 };
  rec.input_refs = routed.results.map(r => ({ ref_index: r.ref_index, declared_type: r.declared_type, name: r.name, lane: r.lane, status: r.status, artifact_id: r.artifact_id, content_sha256: r.content_sha256, external_calls: r.external_calls, honest_note: r.honest_note, receipt: r.receipt }));
  const mmSteps = routed.results.map(r => ({ step: r.ref_index + 1, type: 'ingest', instruction: 'preserve(sha256) -> extract -> provenance -> index "' + r.name + '" through the ' + (r.lane || r.declared_type || 'unknown') + ' lane (frozen M-law; the router owns zero readers)', intake: { lane: r.lane, status: r.status, artifact_id: r.artifact_id, content_sha256: r.content_sha256, receipt: r.receipt, honest_note: r.honest_note } }));
  if (routed.results.length && !routed.ok) {
    rec.pattern = 'MULTIMODAL_REFUSED';
    rec.decomposition = mmSteps;
    rec.lifecycle.push({ state: 'DECOMPOSED', at: now(), earned_by: 'multimodal router refused at the door: ' + routed.refusal });
    rec.lifecycle.push({ state: 'EVIDENCE_GATHERED', at: now(), not_applicable: 'no execution — a ref refused at intake; nothing was gathered' });
    rec.lifecycle.push({ state: 'VERIFIED', at: now(), not_applicable: 'no execution — a ref refused at intake; nothing was verified' });
    rec.lifecycle.push({ state: 'CREATED', at: now(), not_applicable: 'no execution — a ref refused at intake; nothing was created (zero artifacts on refusal)' });
    rec.lifecycle.push({ state: 'ARTIFACT_VERIFIED', at: now(), not_applicable: 'no execution — a ref refused at intake; nothing was created' });
    rec.verdict = 'refused';
    rec.refusal_reason = routed.refusal;
    rec.status = 'CLOSED';
    rec.sovereignty = { external_calls: routed.external_calls, sovereign: routed.external_calls === 0, disclosure: 'external calls reported by the crossed lanes; the router itself makes zero' };
    rec.receipt = await mSha('HARZ-TASKRECORD-V1|' + taskId + '|' + (await sha256(rec.instruction)) + '|mm-refused|' + routed.results.map(r => r.receipt).join(','));
    rec.lifecycle.push({ state: 'CLOSED', at: now(), earned_by: 'receipt emitted: ' + rec.receipt + ' (refused outcome — refusal is an output, not an error)' });
    await ENV.MEMORY.put('task:' + taskId, JSON.stringify(rec));
    const idxR = (await ENV.MEMORY.get('tasks:index', 'json')) || { tasks: [] };
    idxR.tasks.unshift({ task_id: taskId, instruction: rec.instruction.slice(0, 120), pattern: rec.pattern, status: rec.status, verdict: rec.verdict, artifacts: 0, external_calls: rec.sovereignty.external_calls, receipt: rec.receipt, created: rec.created });
    if (idxR.tasks.length > 200) idxR.tasks.length = 200;
    await ENV.MEMORY.put('tasks:index', JSON.stringify(idxR));
    return rec;
  }
  const plan = planDoorTask(rec.instruction, routed.results.length ? { mm: routed.results, base: routed.results.length } : undefined);
  rec.pattern = plan.pattern;
  rec.decomposition = mmSteps.concat(plan.tasks.map(t => ({ step: t.id, type: t.type, instruction: t.instruction, evidence_from: t.evidence_from || undefined })));
  rec.lifecycle.push({ state: 'DECOMPOSED', at: now(), earned_by: 'deterministic door planner: ' + plan.pattern + ' — ' + plan.reason });'''
rep(OLD_PLAN, NEW_PLAN, 'D: routing inside runTaskRecord')

# ---------- BLOCK E: sovereignty includes lane calls ----------
rep("rec.sovereignty = { external_calls: (mission.tasks || []).reduce((a, t) => a + (t.external_calls || 0), 0), sovereign: mission.sovereign === true, disclosure: 'external calls summed across the decomposition; sovereign means zero external calls' };",
    "rec.sovereignty = { external_calls: (mission.tasks || []).reduce((a, t) => a + (t.external_calls || 0), 0) + (routed.external_calls || 0), sovereign: mission.sovereign === true && !(routed.external_calls > 0), disclosure: 'external calls summed across the decomposition and the crossed lanes; sovereign means zero external calls' };",
    'E: sovereignty sums crossed lanes')

# ---------- BLOCK F: POST door parses input_refs ----------
OLD_POST = '''      const body = await request.json().catch(() => ({}));
      const instruction = String(body.instruction || '').slice(0, 2000);
      if (!instruction.trim()) return json({ error: 'instruction required — the front door takes one task at a time' }, 400);
      const rec = await runTaskRecord(instruction);
      return json(rec, 200);'''
NEW_POST = '''      const body = await request.json().catch(() => ({}));
      const instruction = String(body.instruction || '').slice(0, 2000);
      if (!instruction.trim()) return json({ error: 'instruction required — the front door takes one task at a time' }, 400);
      const inputRefs = Array.isArray(body.input_refs) ? body.input_refs : [];
      const rec = await runTaskRecord(instruction, inputRefs);
      return json(rec, 200);'''
rep(OLD_POST, NEW_POST, 'F: POST door parses input_refs')

# ---------- BLOCK G: console file input + JS ----------
rep('</textarea><button onclick="runTask()">Run task</button>',
    '</textarea><input type="file" id="taskfile" style="font-size:13px;margin:6px 0"><button onclick="runTask()">Run task</button>',
    'G1: console file input')
rep("body:JSON.stringify({instruction:v})});const j=await r.json();renderTask(j,o)}",
    "body:JSON.stringify(await mmBody(v))});const j=await r.json();renderTask(j,o)}",
    'G2: runTask uses mmBody')
HELPER = r'''async function mmBody(v){const b={instruction:v};const f=document.getElementById("taskfile").files[0];if(f){const ext=f.name.slice(f.name.lastIndexOf(".")).toLowerCase();const ty=({".pdf":"pdf",".txt":"text_file",".md":"text_file",".csv":"text_file",".json":"text_file",".epub":"ebook",".png":"image",".jpg":"image",".jpeg":"image",".wav":"audio"})[ext]||"text_file";const b64=await new Promise(function(res,rej){const rd=new FileReader();rd.onload=function(){res(String(rd.result).split(",")[1])};rd.onerror=rej;rd.readAsDataURL(f)});b.input_refs=[{type:ty,name:f.name,content_b64:b64}]}return b}async function runTask(){'''
rep('async function runTask(){', HELPER, 'G3: mmBody helper inserted')

open(P, 'w', encoding='utf-8').write(src)
print('written. %d -> %d bytes (+%d)' % (orig_len, len(src), len(src) - orig_len))

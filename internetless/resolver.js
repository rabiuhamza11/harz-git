// HARZ INTERNETLESS v2 — CENTRAL URL RESOLVER
// Owner ruling Oct 17, 2026: ONE resolver, six outcome categories, no guessing.
// Pure module: same code at capture time, at serve time, and in the offline
// shell. No network, no storage access inside resolve() — the caller supplies
// the context. That is what makes it testable and airplane-mode-safe.
//
// OUTCOMES (owner-mandated categories):
//   LOCAL_FOUND        — a captured page exists locally; open it (caller must
//                        then RETRIEVE and VERIFY the body — finding != retrieving).
//   RESOURCE_FOUND     — a captured sub-resource exists locally (pack asset).
//   NOT_CAPTURED       — destination is not stored. Honest card, useful alternatives.
//                        NEVER guessed just because the domain is captured.
//   INTEGRITY_FAILURE  — stored copy exists but fails verification. Refuse to
//                        present corrupted content as verified.
//   LIVE_AVAILABLE     — destination not stored, user online and live access
//                        permitted: use the live destination, labeled honestly.
//   OFFLINE_UNAVAILABLE — not stored, and no connectivity: explain plainly.
//
// ACCEPTANCE PRINCIPLE: OPEN → CLICK → RESOLVE → RETRIEVE → VERIFY → DISPLAY.

const TRACKING_PARAMS = ['utm_source','utm_medium','utm_campaign','utm_term','utm_content','fbclid','gclid','mc_cid','mc_eid','ref_src'];

// ---- Layer 0: normalization (one canonical form for every URL) ----
function normalizeUrl(href, base) {
  if (href == null) return null;
  let raw = String(href).trim();
  if (!raw || raw.startsWith('javascript:') || raw.startsWith('mailto:') || raw.startsWith('tel:))')) return null;
  if (raw.startsWith('#')) return base ? { normalized: base + '#frag', fragmentOnly: true } : null;
  if (raw.startsWith('data:')) return { normalized: raw, isDataUri: true };

  // resolve relative against base
  let u;
  try { u = new URL(raw, base || undefined); } catch (e) { return null; }

  // fragments never identify stored content (they scroll inside a page)
  u.hash = '';
  // strip default ports
  if ((u.protocol === 'https:' && u.port === '443') || (u.protocol === 'http:' && u.port === '80')) u.port = '';
  // lowercase host, strip leading www. (the corpus normalizes www. away)
  u.hostname = u.hostname.toLowerCase().replace(/^www\./, '');
  // strip tracking params, preserve everything else including query order
  const params = [];
  u.searchParams.forEach((v, k) => { if (!TRACKING_PARAMS.includes(k)) params.push([k, v]); });
  u.search = params.map(([k, v]) => encodeURIComponent(k) + '=' + encodeURIComponent(v)).join('&');
  return { normalized: u.toString(), host: u.hostname, protocol: u.protocol };
}

// ---- Layer 1: the store map (caller-supplied, built from verified artifacts) ----
// urlMap shape: { [normalizedUrl]: { kind: 'page'|'resource', store: 'corpus'|'pack:<domain>', id, sha256, finalUrl } }
// corpusDocs shape: { [docId]: { url, finalUrl, contentHash } } — sealed corpus, read-only.
// packs shape: { [packDomain]: { pages: { [path]: { anchor, sha256 } } } }

function buildUrlMap({ corpusDocs, packs }) {
  const map = {};
  for (const id in corpusDocs) {
    const d = corpusDocs[id];
    // both the original URL and the final (post-redirect) URL resolve to the doc
    for (const u of [d.url, d.finalUrl]) {
      if (!u) continue;
      const n = normalizeUrl(u);
      if (n && n.normalized) map[n.normalized] = { kind: 'page', store: 'corpus', id, sha256: d.contentHash };
    }
  }
  for (const domain in (packs || {})) {
    const p = packs[domain];
    for (const path in p.pages) {
      const full = 'https://' + domain + path;
      const n = normalizeUrl(full);
      if (n && n.normalized) map[n.normalized] = { kind: 'page', store: 'pack:' + domain, id: path, sha256: p.pages[path].sha256 };
    }
    for (const r of (p.resources || [])) {
      const n = normalizeUrl(r.url);
      if (n && n.normalized) map[n.normalized] = { kind: 'resource', store: 'pack:' + domain, id: r.localId, sha256: r.sha256 };
    }
  }
  return map;
}

// ---- Layer 2: resolve — the single decision point for every click ----
// ctx: { urlMap, capturedDomains: Set<string>, online: boolean, liveAllowed: boolean,
//        retrieve: async (ref) => { body, sha256 } | null,
//        maxChain: number (loop guard), base: string }
async function resolve(href, ctx) {
  const norm = normalizeUrl(href, ctx.base);
  if (!norm) return { status: 'NOT_CAPTURED', reason: 'unresolvable or non-web link', href };
  if (norm.fragmentOnly) {
    return { status: 'LOCAL_FOUND', reason: 'in-page fragment', normalized: ctx.base, store: 'current-view' };
  }
  if (norm.isDataUri) return { status: 'RESOURCE_FOUND', reason: 'inlined resource (data URI)', normalized: norm.normalized };

  const ref = ctx.urlMap[norm.normalized];
  // anti-loop: the caller passes the chain of resolutions already made
  ctx._chain = ctx._chain || [];
  const chainKey = norm.normalized;
  const seenDepth = ctx._chain.lastIndexOf(chainKey);
  const occurrences = ctx._chain.filter(x => x === chainKey).length;
  if (occurrences >= (ctx.maxChain || 2)) {
    return { status: 'NOT_CAPTURED', reason: 'navigation loop prevented (max chain reached)', normalized: norm.normalized };
  }
  ctx._chain.push(chainKey);

  if (ref) {
    // NEVER claim found without RETRIEVE + VERIFY (owner question 1)
    const got = ctx.retrieve ? await ctx.retrieve(ref) : null;
    if (!got) return { status: 'NOT_CAPTURED', reason: 'map entry exists but body retrieval failed', normalized: norm.normalized, ref };
    if (typeof got.sha256 !== 'undefined' && ref.sha256 && got.sha256 !== ref.sha256) {
      return { status: 'INTEGRITY_FAILURE', reason: 'stored copy failed hash verification — refused, not displayed', normalized: norm.normalized, expected: ref.sha256, got: got.sha256 };
    }
    return {
      status: ref.kind === 'resource' ? 'RESOURCE_FOUND' : 'LOCAL_FOUND',
      normalized: norm.normalized, ref, body: got.body, sha256: got.sha256
    };
  }

  // not in the map. Captured domain? still NOT_CAPTURED — never guess (owner rule 1).
  if (norm.host && ctx.capturedDomains && ctx.capturedDomains.has(norm.host)) {
    return { status: 'NOT_CAPTURED', reason: 'domain is captured but this exact page is not — honestly unavailable, alternatives offered', normalized: norm.normalized, host: norm.host };
  }
  // uncaptured destination: live when online and permitted, else offline-unavailable
  if (ctx.online && ctx.liveAllowed) {
    return { status: 'LIVE_AVAILABLE', reason: 'not stored locally; live access while online, labeled LIVE', normalized: norm.normalized };
  }
  return { status: 'OFFLINE_UNAVAILABLE', reason: ctx.online ? 'not stored and live access not permitted' : 'not stored locally and no internet connection', normalized: norm.normalized };
}

module.exports = { normalizeUrl, buildUrlMap, resolve, TRACKING_PARAMS };

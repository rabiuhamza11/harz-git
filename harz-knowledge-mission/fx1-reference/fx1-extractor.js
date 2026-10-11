// FX-1 extractor — Workers-ready JS port of the validated Python reference
// (readability-density-v1). Same pipeline, same six-status taxonomy:
// complete | truncated | failed_fetch | failed_extract | unsupported | unchanged.
// Module-scope, no IIFE: production binds fetch/KV/D1 via env; tests inject.
// NOT DEPLOYED — staged artifact awaiting Rabiu's implementation ruling.

export const FX1_VERSION = "fx1-js-1.0.0";
export const CAP_BYTES = 512 * 1024;   // D-1 proposal, pending Rabiu's ruling
export const MAX_PAGES = 10;
export const MIN_CHARS = 500;
const UA = "Mozilla/5.0 (compatible; HARZ-FX1/1.0)";

async function sha256hex(text) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
}

// ---------- S2 permission ----------
export async function robotsAllows(url) {
  let u;
  try { u = new URL(url); } catch { return { ok: false, why: "invalid URL" }; }
  if (u.protocol !== "https:" && u.protocol !== "http:") return { ok: false, why: "unsupported protocol" };
  if (/^(localhost|127\.|0\.|10\.|192\.168\.|169\.254\.)/.test(u.hostname))
    return { ok: false, why: "private host" };
  try {
    const r = await fetch(`${u.protocol}//${u.hostname}/robots.txt`, {
      headers: { "User-Agent": UA }, redirect: "follow", signal: AbortSignal.timeout(15000) });
    if (r.status !== 200) return { ok: true, why: "no robots.txt (allowed by default)" };
    const body = await r.text();
    // REP standard: rules are scoped by User-agent group. Apply only the
    // "*" group (our product token has no site-specific rules); other bots'
    // groups (GPTBot etc.) are NOT ours and must not block us.
    const groups = {}; let current = null;
    for (const line of body.split("\n")) {
      const ua = line.match(/^user-agent:\s*(.+)/i);
      const dis = line.match(/^Disallow:\s*(\S*)/i);
      if (ua) { current = ua[1].trim().toLowerCase(); (groups[current] ??= []); }
      else if (dis && current) groups[current].push(dis[1]);
    }
    const star = groups["*"] || [];
    for (const d of star) {
      if (d === "") continue; // "Disallow:" with no value = allow all
      if (d === "/" || u.pathname.startsWith(d))
        return { ok: false, why: `robots disallow: ${d}` };
    }
    return { ok: true, why: "robots ok" };
  } catch (e) {
    return { ok: true, why: "robots.txt unreachable (allowed by default)" };
  }
}

// ---------- S4 readability (own extractor; sovereignty: no third-party service) ----------
const STRIP = /<(script|style|noscript|template|aside|nav|footer|header)[^>]*>[\s\S]*?<\/\1>/gi;
const COMMENTS = /<!--[\s\S]*?-->/g;
const TAGS = /<[^>]+>/g;
const BLOCKISH = /<\/?(p|div|h[1-6]|li|tr|section|article|blockquote|pre|table)[^>]*>/gi;

export function extractReadable(raw) {
  let v = raw.replace(STRIP, " ").replace(COMMENTS, " ");
  v = v.replace(/<br[^>]*>/gi, "\n");
  v = v.replace(BLOCKISH, "\n\n");
  v = v.replace(TAGS, " ")
       .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<")
       .replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'")
       .replace(/&apos;/g, "'").replace(/&ndash;/g, "\u2013").replace(/&mdash;/g, "\u2014")
       .replace(/&hellip;/g, "\u2026").replace(/&rsquo;/g, "\u2019").replace(/&lsquo;/g, "\u2018")
       .replace(/&rdquo;/g, "\u201D").replace(/&ldquo;/g, "\u201C").replace(/&times;/g, "\u00D7")
       .replace(/&#([0-9]+);/g, (_, n) => String.fromCodePoint(parseInt(n, 10)))
       .replace(/\u00a0/g, " ")
       .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)));
  v = v.replace(/[ \t]+/g, " ");
  const keep = [];
  for (const ln of v.split("\n")) {
    const s = ln.trim();
    if (!s) { keep.push(""); continue; }
    const words = s.split(" ");
    if (words.length <= 2 && !/[.!?"']$/.test(s)) continue; // nav crumb
    keep.push(s);
  }
  return keep.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

// ---------- S3 pagination ----------
export function findNext(raw, baseUrl) {
  const pats = [
    /<link[^>]+rel=["']?next["']?[^>]+href=["']?([^"'>\s]+)/i,
    /<a[^>]+rel=["']?next["']?[^>]+href=["']?([^"'>\s]+)/i,
  ];
  let href = null;
  for (const p of pats) { const m = raw.match(p); if (m) { href = m[1]; break; } }
  if (!href) return null;
  try { return new URL(href, baseUrl).href; } catch { return null; }
}

const titleOf = (body) => (body.match(/<title[^>]*>([^<]{0,120})/i)?.[1] || "").trim();

// ---------- pipeline ----------
export async function pipeline(url, opts = {}) {
  const { priorSha = null, maxPages = MAX_PAGES, capBytes = CAP_BYTES } = opts;
  const rec = { version: FX1_VERSION, url, pages: [], status: null, reason: "" };
  const seen = new Set();
  let pageUrl = url, texts = [];
  while (pageUrl && seen.size < maxPages) {
    if (seen.has(pageUrl)) break;
    seen.add(pageUrl);
    let resp, body;
    try {
      resp = await fetch(pageUrl, { headers: { "User-Agent": UA }, redirect: "follow",
                                signal: AbortSignal.timeout(25000) });
      body = await resp.text();
    } catch (e) {
      rec.status = "failed_fetch"; rec.reason = `fetch error: ${String(e).slice(0, 80)}`;
      return rec;
    }
    rec.pages.push({ url: resp.url || pageUrl, status: resp.status, bytes: body.length });
    if (resp.status === 403) {
      rec.status = "unsupported"; rec.reason = "access denied (bot wall or forbidden)"; return rec;
    }
    if (resp.status !== 200) {
      rec.status = "failed_fetch"; rec.reason = `HTTP ${resp.status}`; return rec;
    }
    const title = titleOf(body); rec.title = title;
    if (/just a moment|attention required|security verification|access denied|captcha/i.test(title)) {
      rec.status = "unsupported"; rec.reason = "bot challenge"; return rec;
    }
    const perm = await robotsAllows(resp.url);
    if (!perm.ok) { rec.status = "unsupported"; rec.reason = perm.why; return rec; }
    const strippedLen = body.replace(STRIP, " ").replace(TAGS, " ").trim().length;
    if (strippedLen < 100 && /<div[^>]+id=["']?(root|app|__next)["']?/i.test(body) && /<script[^>]+src=/i.test(body)) {
      rec.status = "unsupported"; rec.reason = "js-only rendering (V1 limitation)"; return rec;
    }
    texts.push(extractReadable(body));
    const nxt = findNext(body, resp.url || pageUrl);
    pageUrl = nxt && nxt !== pageUrl ? nxt : null;
  }
  const full = texts.filter(Boolean).join("\n\n");
  rec.charLen = full.length;
  if (new TextEncoder().encode(full).length > capBytes) {
    rec.status = "truncated"; rec.reason = `cap ${capBytes}B hit`;
    return { ...rec, fullText: full.slice(0, capBytes) };
  }
  if (full.length < MIN_CHARS) {
    rec.status = "failed_extract"; rec.reason = `only ${full.length} readable chars`; return rec;
  }
  rec.fullTextSha256 = await sha256hex(full);
  if (priorSha && priorSha === rec.fullTextSha256) {
    rec.status = "unchanged"; rec.priorSha = priorSha; return rec;
  }
  rec.status = rec.pages.length >= maxPages ? "truncated" : "complete";
  if (rec.status === "truncated") rec.reason = `pagination cap ${maxPages} hit`;
  rec.fullText = full;
  return rec;
}

// CANDIDATE C-1 + C-2 + C-3 gate for harz-ai /chat evidence path.
// VALIDATION ONLY — NOT DEPLOYED (Dad: "proceed with validation only", Oct 11 2026).
// Trusted-source rule: exact hosts or Cloudflare-account suffix boundaries.
// workers.dev subdomains are globally unique per Cloudflare account, so
// "*.harz.workers.dev" = hosts only the owner account can create.
// Deliberately NOT a "contains harz" substring match.

var TRUSTED_EXACT = [
  "rabiuhamza11.github.io",          // owner GitHub Pages (harz-portfolio)
  "harz-cloud-backend.onrender.com"  // owner Render backend
];
var TRUSTED_SUFFIXES = [
  ".harz.workers.dev",          // owner Cloudflare account (harz zone)
  ".hamzarabiu390.workers.dev", // owner Cloudflare account
  ".harzco-business.workers.dev" // owner business account
];
function isTrustedEvidence(url) {
  try {
    var u = new URL(String(url)), h = u.hostname.toLowerCase();
    if (u.protocol !== "https:" && u.protocol !== "http:") return false;
    if (TRUSTED_EXACT.indexOf(h) !== -1) return true;
    for (var i = 0; i < TRUSTED_SUFFIXES.length; i++) {
      if (h.slice(-(TRUSTED_SUFFIXES[i].length)) === TRUSTED_SUFFIXES[i]) return true;
    }
    return false;
  } catch (e) { return false; }
}
// Candidate gate: replaces `top.score >= 13` with source-scoped + C-2 rule.
// C-1: top result must be ecosystem-owned. Rejected -> normal chat path,
// unchanged (never claims the question was answered).
// C-2: for match==="relaxed", every surviving query term (terms minus the
// engine's dropped list, minus common stopwords) must appear in the SERVED
// SNIPPET (case-insensitive substring) — else reject to chat path.
// C-3: diagnostics appended to the evidence receipt line metadata for
// reproduction (match tier, strict_total, trusted flag) — no secrets, no
// account details.
function candidateGate(sd) {
  var top = sd && Array.isArray(sd.results) && sd.results[0];
  if (!top || typeof top.score !== "number" || top.score < 13) return null;
  if (!isTrustedEvidence(top.url)) return null;
  if (sd.match === "relaxed") {
    var STOP = {a:1,an:1,the:1,of:1,in:1,on:1,for:1,to:1,and:1,or:1,is:1,are:1,do:1,does:1,what:1,how:1,i:1,my:1,your:1,it:1};
    var dropped = {};
    (sd.dropped || []).forEach(function(d){ dropped[String(d).toLowerCase()] = 1; });
    var hay = String(top.snippet || "").toLowerCase();
    var toks = String(sd.query || "").toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
    for (var i = 0; i < toks.length; i++) {
      var t = toks[i];
      if (STOP[t] || dropped[t]) continue;
      if (hay.indexOf(t) === -1) return null; // C-2: term missing from served snippet
    }
  }
  return top; // evidence may be shown
}

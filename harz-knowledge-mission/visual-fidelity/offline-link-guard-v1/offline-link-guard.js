// HARZ OFFLINE LINK GUARD v1 (Oct 16, owner order: sublinks must not dead-end offline)
// Injected into every visually-saved page. Law: a link in a saved copy either opens
// something held locally, or says honestly that it is not in the pack — it NEVER
// navigates into a dead external page. No invented content, no fake LIVE data.
(function () {
  var CAPTURED = "__CAPTURED__";
  function notice(title, sub) {
    var n = document.getElementById("harz-link-notice");
    if (!n) {
      n = document.createElement("div");
      n.id = "harz-link-notice";
      n.style.cssText =
        "position:fixed;left:0;right:0;bottom:0;z-index:2147483647;background:#101828;color:#fff;" +
        "font:14px/1.45 system-ui,-apple-system,sans-serif;padding:14px 16px calc(14px + env(safe-area-inset-bottom));" +
        "box-shadow:0 -4px 16px rgba(0,0,0,.45)";
      document.body.appendChild(n);
    }
    n.textContent = "";
    var close = document.createElement("button");
    close.textContent = "OK";
    close.style.cssText =
      "float:right;background:#0066ff;color:#fff;border:0;border-radius:6px;padding:5px 14px;font-size:13px;margin-left:12px;cursor:pointer";
    close.onclick = function () { n.remove(); };
    n.appendChild(close);
    var t = document.createElement("div");
    t.textContent = title;
    n.appendChild(t);
    var u = document.createElement("div");
    u.style.cssText = "margin-top:4px;font-size:11px;opacity:.75;word-break:break-all";
    u.textContent = sub || "";
    n.appendChild(u);
    clearTimeout(n._t);
    n._t = setTimeout(function () { n.remove(); }, 10000);
  }
  document.addEventListener("click", function (e) {
    var a = e.target && e.target.closest ? e.target.closest("a") : null;
    if (!a) return;
    var href = a.getAttribute("href") || "";
    if (!href || href.charAt(0) === "#" || /^(javascript:|mailto:|tel:|data:)/i.test(href)) return;
    e.preventDefault();
    e.stopPropagation();
    var label = (a.textContent || "").trim().replace(/\s+/g, " ").slice(0, 48);
    notice(
      "OFFLINE PACK — this link was not saved with the page. The pack holds only what was captured on " + CAPTURED + ". Ask for \u201C" + label + "\u201D to be added to the next capture.",
      a.href
    );
  }, true);
})();

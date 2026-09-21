const $ = id => document.getElementById(id);
function show(s) {
  if (!s.ok) { $("status").innerHTML = '<span class="err">' + (s.reason || "no verified book") + "</span>"; return; }
  const fresh = s.meta?.fetched_at ? new Date(s.meta.fetched_at).toLocaleString() : "unknown";
  $("status").innerHTML =
    '<div class="row"><span>Book</span><span class="ok">SIGNATURE VALID</span></div>' +
    '<div class="row"><span>Chain</span><span>harz-root-v2 · height ' + s.height + "</span></div>" +
    '<div class="row"><span>Names</span><span>' + s.records + "</span></div>" +
    '<div class="row"><span>Sig</span><span class="code">' + s.sig + "</span></div>" +
    '<div class="row"><span>Fetched</span><span>' + fresh + "</span></div>";
}
chrome.runtime.sendMessage("zone-status", show);
$("refresh").addEventListener("click", async () => {
  $("status").innerHTML = "refreshing from the root…";
  await chrome.runtime.sendMessage("refresh");
  chrome.runtime.sendMessage("zone-status", show);
});

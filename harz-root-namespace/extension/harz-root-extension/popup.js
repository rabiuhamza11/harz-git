const $ = id => document.getElementById(id);
function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;" }[c])); }

async function render() {
  const { zoneInfo } = await chrome.storage.local.get("zoneInfo");
  const st = $("status");
  $("fp").textContent = zoneInfo && zoneInfo.zsk ? "ZSK " + zoneInfo.zsk : "";
  if (!zoneInfo || !zoneInfo.ok) {
    st.className = "status bad";
    st.innerHTML = '<div class="row"><span class="k">ZONE REFUSED</span></div>' +
      '<div class="row"><span class="v" style="font-size:10px">' + esc(zoneInfo ? zoneInfo.error : "no zone loaded") + '</span></div>';
    return;
  }
  st.className = "status ok";
  const when = new Date(zoneInfo.updated).toLocaleTimeString();
  st.innerHTML =
    '<div class="row"><span class="k">Zone</span><span class="v">VERIFIED · height ' + zoneInfo.height + '</span></div>' +
    '<div class="row"><span class="k">Hash</span><span class="v">' + esc(zoneInfo.hash.slice(0, 16)) + '…f05</span></div>' +
    '<div class="row"><span class="k">Names</span><span class="v">' + zoneInfo.names + ' (' + zoneInfo.live + ' live · ' + zoneInfo.reserved + ' reserved)</span></div>' +
    '<div class="row"><span class="k">Updated</span><span class="v">' + when + '</span></div>';

  const wrap = $("names");
  wrap.innerHTML = "";
  const list = Object.keys(zoneInfo.map).sort();
  for (const n of list) {
    const rec = zoneInfo.map[n];
    const div = document.createElement("div");
    div.className = "name";
    const isLive = rec.url && rec.url.startsWith("https://");
    div.innerHTML = '<span class="n">' + esc(n) + '.harz</span><span class="tag ' + (isLive ? "live" : "reserved") + '">' + (isLive ? "LIVE" : "RESERVED") + "</span>";
    div.onclick = () => chrome.tabs.create({ url: "https://" + n + ".harz/" });
    wrap.appendChild(div);
  }
}

function go() {
  let q = $("q").value.trim().toLowerCase().replace(/\.harz\/?$/, "").replace(/[^a-z0-9-]/g, "");
  if (!q) return;
  chrome.tabs.create({ url: "https://" + q + ".harz/" });
}

$("open").onclick = go;
$("q").addEventListener("keydown", e => { if (e.key === "Enter") go(); });
$("refresh").onclick = async () => {
  $("refresh").textContent = "refreshing…";
  await chrome.runtime.sendMessage({ cmd: "refresh" });
  setTimeout(() => { $("refresh").textContent = "refresh zone"; render(); }, 1200);
};
render();

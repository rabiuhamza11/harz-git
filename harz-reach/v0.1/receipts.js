chrome.storage.local.get(["harz_receipts"]).then(got => {
  const list = got.harz_receipts || [];
  const div = document.getElementById("list");
  if (!list.length) return;
  div.innerHTML = "";
  for (const r of list) {
    const c = document.createElement("div");
    c.className = "card";
    c.textContent = JSON.stringify(r);
    div.appendChild(c);
  }
});

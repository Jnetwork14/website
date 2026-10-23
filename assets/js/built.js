/* Homepage "How this site was built": file tabs, live address, latest commits from GitHub. */
(function () {
  var tabs = [].slice.call(document.querySelectorAll(".win [role=tab]"));
  function show(t) {
    tabs.forEach(function (b) {
      var on = b === t;
      b.setAttribute("aria-selected", on ? "true" : "false");
      b.tabIndex = on ? 0 : -1;
      var p = document.getElementById(b.getAttribute("aria-controls"));
      if (p) p.hidden = !on;
    });
  }
  tabs.forEach(function (b, i) {
    b.addEventListener("click", function () { show(b); });
    b.addEventListener("keydown", function (e) {
      var n = e.key === "ArrowRight" ? i + 1 : e.key === "ArrowLeft" ? i - 1 : null;
      if (n === null) return;
      var t = tabs[(n + tabs.length) % tabs.length];
      t.focus(); show(t); e.preventDefault();
    });
  });

  var addr = document.getElementById("live-address");
  if (addr && /^https?:$/.test(location.protocol)) {
    addr.textContent = location.host + location.pathname.replace(/[^\/]*$/, "").replace(/\/$/, "");
  }

  /* Replace the saved commit list with the live one. If GitHub is unreachable, the saved list stays. */
  var list = document.getElementById("commits");
  if (!list || !window.fetch) return;
  fetch("https://api.github.com/repos/Jnetwork14/website/commits?per_page=4", { headers: { Accept: "application/vnd.github+json" } })
    .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
    .then(function (rows) {
      if (!Array.isArray(rows) || !rows.length) return;
      var frag = document.createDocumentFragment();
      rows.forEach(function (c) {
        var li = document.createElement("li");
        var sha = document.createElement("span"); sha.className = "sha"; sha.textContent = String(c.sha).slice(0, 7);
        var msg = document.createElement("span"); msg.className = "msg"; msg.textContent = String(c.commit.message).split("\n")[0];
        var t = document.createElement("time"); t.dateTime = c.commit.author.date;
        t.textContent = new Date(c.commit.author.date).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" });
        li.appendChild(sha); li.appendChild(msg); li.appendChild(t); frag.appendChild(li);
      });
      list.textContent = ""; list.appendChild(frag);
    })
    .catch(function () {});
})();

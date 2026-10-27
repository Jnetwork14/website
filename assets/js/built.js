/* Homepage "How this site was built": file tabs and live address. */
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
})();

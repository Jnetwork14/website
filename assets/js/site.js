/* JNetwork shared engine: base path, navigation, audience switch, click tracking,
   contact form, subscribe form, posts feed. No dependencies, no build step. */
(function () {
  "use strict";
  var cfg = window.JNETWORK_CONFIG || {};

  /* ---------- base path (works on /repo-name/ and on a custom domain) ---------- */
  function detectBase() {
    if (cfg.basePath) return cfg.basePath.replace(/\/?$/, "/");
    var s = document.currentScript || document.querySelector('script[src*="assets/js/site.js"]');
    if (s && s.src) {
      var p = new URL(s.src, location.href).pathname; // .../assets/js/site.js
      return p.replace(/assets\/js\/site\.js.*$/, "");
    }
    return "/";
  }
  var BASE = detectBase();
  function url(path) { return BASE + String(path).replace(/^\//, ""); }

  /* ---------- analytics (GoatCounter, optional) ---------- */
  var gc = cfg.analytics && cfg.analytics.goatcounterCode;
  if (gc) {
    var g = document.createElement("script");
    g.async = true;
    g.src = "https://gc.zgo.at/count.js";
    g.setAttribute("data-goatcounter", "https://" + gc + ".goatcounter.com/count");
    document.head.appendChild(g);
  }
  function track(name) {
    try {
      if (window.goatcounter && window.goatcounter.count) {
        window.goatcounter.count({ path: "event/" + name, title: name, event: true });
      }
    } catch (e) { /* analytics must never break the page */ }
  }
  document.addEventListener("click", function (e) {
    var el = e.target.closest && e.target.closest("[data-track]");
    if (el) track(el.getAttribute("data-track"));
  });

  /* ---------- shared header / footer / audience switch ---------- */
  function mount(id, html) {
    var n = document.getElementById(id);
    if (n) n.innerHTML = html;
  }
  var page = document.body.getAttribute("data-page") || "";

  mount("site-header",
    '<a class="brand" href="' + url("index.html") + '" data-track="nav-home"><img src="' + url("assets/img/logo-dark.svg") + '" alt="JNetworks, home" width="286" height="77"></a>' +
    '<nav class="nav" aria-label="Main">' +
      (cfg.audiences || []).map(function (a) {
        return '<a href="' + url(a.href) + '"' + (a.id === page ? ' aria-current="page"' : '') +
               ' data-track="nav-' + a.id + '">' + esc(shortLabel(a.id)) + '</a>';
      }).join("") +
    '</nav>');

  if (page && page !== "home") {
    var others = (cfg.audiences || []).filter(function (a) { return a.id !== page; });
    mount("audience-switch",
      '<p class="switch-lead">Not what you’re looking for?</p><ul>' +
      others.map(function (a) {
        return '<li><a href="' + url(a.href) + '" data-track="switch-' + a.id + '">' + esc(a.label) + '</a></li>';
      }).join("") +
      '</ul><p><a href="' + url("index.html") + '" data-track="switch-hub">← Back to the hub</a></p>');
  }

  mount("site-footer",
    '<p>© ' + new Date().getFullYear() + ' ' + esc(cfg.siteName || "JNetwork") + '</p>');

  function shortLabel(id) {
    return { business: "Work with me", employer: "Hire me", content: "Learn" }[id] || id;
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* ---------- generic form helper ---------- */
  function setStatus(form, msg, ok) {
    var s = form.querySelector("[data-status]");
    if (!s) return;
    s.textContent = msg;
    s.setAttribute("data-state", ok ? "ok" : "error");
  }
  function validEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }

  /* ---------- contact form ---------- */
  document.querySelectorAll("form[data-contact]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var fd = new FormData(form);
      if (fd.get("website")) return; // honeypot: bots fill this, humans never see it
      var email = String(fd.get("email") || "").trim();
      var message = String(fd.get("message") || "").trim();
      if (!validEmail(email)) return setStatus(form, "Please enter a valid email address.", false);
      if (message.length < 10) return setStatus(form, "Please add a little more detail (10+ characters).", false);

      var c = cfg.contact || {};
      var intent = form.getAttribute("data-contact") || "general";
      track("form-submit-" + intent);

      if (!c.accessKey) { // no backend configured yet: say so plainly instead of exposing an email address
        return setStatus(form, "The contact form isn\u2019t switched on yet. Please check back soon.", false);
      }
      var btn = form.querySelector("button[type=submit]");
      if (btn) btn.disabled = true;
      setStatus(form, "Sending…", true);
      fd.delete("website");
      fd.append("access_key", c.accessKey);
      fd.append("subject", "[JNetwork] " + intent + " enquiry");
      fd.append("from_name", "JNetwork website");
      fetch(c.endpoint, { method: "POST", headers: { Accept: "application/json" }, body: fd })
        .then(function (r) { return r.json().then(function (j) { return { ok: r.ok && j.success !== false, j: j }; }); })
        .then(function (res) {
          if (res.ok) { form.reset(); setStatus(form, "Thanks. I’ll reply within two working days.", true); }
          else { setStatus(form, "Something went wrong. Please try again in a few minutes.", false); }
        })
        .catch(function () { setStatus(form, "Network error. Please check your connection and try again.", false); })
        .then(function () { if (btn) btn.disabled = false; });
    });
  });

  /* ---------- subscribe form ---------- */
  document.querySelectorAll("form[data-subscribe]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var fd = new FormData(form);
      if (fd.get("website")) return;
      var email = String(fd.get("email") || "").trim();
      if (!validEmail(email)) return setStatus(form, "Please enter a valid email address.", false);
      var s = cfg.subscribe || {};
      track("subscribe-submit");
      if (!s.endpoint) return setStatus(form, "Subscriptions aren’t switched on yet. Check back soon.", false);
      fd.delete("website");
      fetch(s.endpoint, { method: s.method || "POST", body: fd, headers: { Accept: "application/json" } })
        .then(function (r) {
          if (r.ok) { form.reset(); setStatus(form, "You’re on the list.", true); }
          else setStatus(form, "Couldn’t subscribe right now. Try again later.", false);
        })
        .catch(function () { setStatus(form, "Network error. Try again later.", false); });
    });
  });

  /* ---------- hide links to files that don't exist yet (e.g. the CV) ---------- */
  document.querySelectorAll("a[data-requires-file]").forEach(function (a) {
    fetch(a.getAttribute("href"), { method: "HEAD" })
      .then(function (r) { if (!r.ok) a.hidden = true; })
      .catch(function () { a.hidden = true; });
  });

  /* ---------- projects (data/projects.json -> [data-projects="<page id>"]) ----------
     Only entries with "published": true and the page id in "pages" are shown. If none match,
     the static markup already inside the container stays as the fallback. */
  function safeLink(u) {
    u = String(u || "").trim();
    if (!u) return "";
    if (/^https:\/\//i.test(u)) return u;
    return /^[a-z][a-z0-9+.\-]*:/i.test(u) ? "" : url(u); // block javascript:, data:, http:
  }
  function initials(t) {
    return String(t).split(/\s+/).filter(Boolean).slice(0, 2).map(function (w) { return w.charAt(0); }).join("").toUpperCase();
  }
  function projectCard(p) {
    var img = safeLink(p.image), href = safeLink(p.url);
    return '<article class="project">' +
      '<figure class="project-shot"><span class="project-ph" aria-hidden="true">' + esc(initials(p.title)) + '</span>' +
        (img ? '<img src="' + esc(img) + '" alt="' + esc(p.imageAlt || "") + '" width="1280" height="800" loading="lazy">' : "") + '</figure>' +
      '<div class="project-body">' +
        ((p.tags || []).length ? '<ul class="project-tags">' + p.tags.map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + "</ul>" : "") +
        "<h3>" + esc(p.title) + "</h3><p>" + esc(p.summary || "") + "</p>" +
        (href ? '<a class="btn project-link" href="' + esc(href) + '" target="_blank" rel="noopener" data-track="project-' + esc(p.slug || "link") + '">' + esc(p.linkLabel || "View project") + "</a>" : "") +
      "</div></article>";
  }
  var projectGrids = document.querySelectorAll("[data-projects]");
  if (projectGrids.length) {
    fetch(url("data/projects.json"), { cache: "no-cache" })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (list) {
        projectGrids.forEach(function (grid) {
          var id = grid.getAttribute("data-projects");
          var items = list.filter(function (p) { return p.published === true && (p.pages || []).indexOf(id) > -1; });
          if (!items.length) return;
          grid.className = "project-grid";
          var wrap = grid.closest("section"); if (wrap) wrap.hidden = false; // section stays hidden until it has projects
          grid.innerHTML = items.map(projectCard).join("");
          grid.querySelectorAll(".project-shot img").forEach(function (im) {
            function drop() { im.remove(); } // missing screenshot: the initials placeholder shows instead
            im.addEventListener("error", drop);
            if (im.complete && im.naturalWidth === 0) drop();
          });
        });
      })
      .catch(function () { /* keep the fallback markup */ });
  }

  /* ---------- posts feed (data/posts.json -> #posts) ---------- */
  var feed = document.getElementById("posts");
  if (feed) {
    fetch(url("data/posts.json"), { cache: "no-cache" })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (posts) {
        posts.sort(function (a, b) { return String(b.date).localeCompare(String(a.date)); });
        var limit = parseInt(feed.getAttribute("data-limit") || "10", 10);
        feed.innerHTML = posts.slice(0, limit).map(function (p) {
          var external = /^https?:/.test(p.url);
          return '<li class="post"><a href="' + esc(p.url) + '"' +
            (external ? ' target="_blank" rel="noopener"' : "") +
            ' data-track="post-' + esc(p.slug || "link") + '"><h3>' + esc(p.title) + '</h3></a>' +
            '<p class="meta"><time datetime="' + esc(p.date) + '">' + esc(p.date) + '</time> · ' + esc(p.tag || "") + '</p>' +
            '<p>' + esc(p.summary || "") + '</p></li>';
        }).join("") || "<li>No posts yet.</li>";
      })
      .catch(function () { feed.innerHTML = "<li>Posts couldn’t be loaded right now.</li>"; });
  }
})();

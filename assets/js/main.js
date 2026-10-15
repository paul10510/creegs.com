/* creegs.com — two motion moments, nothing else.
   1. the hero status lines resolve once on load
   2. the active nav tab tracks scroll position
   Both respect prefers-reduced-motion. */

(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ─── 1. hero status typewriter ─────────────────────────── */
  var host = document.querySelector("[data-status]");
  var lines = [
    { text: "eagle scout · rope access · cybersecurity · fishing", cls: "" },
    { text: "westchester, ny", cls: "" },
    { text: "status: open to work", cls: "" }
  ];

  function renderInstant() {
    host.innerHTML = lines
      .map(function (l) {
        return '<span class="line">' + (l.cls ? '<span class="' + l.cls + '">' : "") +
          escapeHtml(l.text) + (l.cls ? "</span>" : "") + "</span>";
      })
      .join("");
  }

  function type() {
    host.innerHTML = "";
    var i = 0;

    function nextLine() {
      if (i >= lines.length) {
        // terminal settled: blink the cursor six times, then stop
        var caret = document.createElement("span");
        caret.className = "caret is-blinking";
        host.appendChild(caret);
        if (!reduce) {
          setTimeout(function () {
            caret.classList.remove("is-blinking");
          }, 6400);
        }
        return;
      }
      var line = lines[i++];
      var span = document.createElement("span");
      span.className = "line";
      if (line.cls) {
        var inner = document.createElement("span");
        inner.className = line.cls;
        span.appendChild(inner);
        var target = inner;
      } else {
        target = span;
      }
      host.appendChild(span);

      var text = line.text;
      var c = 0;
      (function tick() {
        if (c <= text.length) {
          target.textContent = text.slice(0, c);
          c++;
          setTimeout(tick, 16);
        } else {
          setTimeout(nextLine, 130);
        }
      })();
    }
    nextLine();
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (m) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m];
    });
  }

  if (reduce || !("requestAnimationFrame" in window)) {
    renderInstant();
  } else {
    // start only once fonts are ready so the caret doesn't reflow
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { setTimeout(type, 220); });
    } else {
      setTimeout(type, 220);
    }
  }

  /* ─── 2. active tab tracking ───────────────────────────── */
  var sections = Array.prototype.slice.call(document.querySelectorAll("section[id]"));
  var railLinks = Array.prototype.slice.call(
    document.querySelectorAll(".rail__nav a, .topbar__nav a")
  );
  if (!sections.length || !railLinks.length) return;

  var byId = {};
  railLinks.forEach(function (a) {
    byId[a.getAttribute("href").slice(1)] = a;
  });

  var current = null;

  function setActive(id) {
    if (id === current) return;
    current = id;
    railLinks.forEach(function (a) {
      a.classList.toggle("is-active", a.getAttribute("href") === "#" + id);
    });
  }

  function pick() {
    // a section is "current" once its top passes a line ~35% down the viewport;
    // below that line we belong to whichever section we last crossed
    var line = window.innerHeight * 0.35;
    var found = null;
    for (var i = 0; i < sections.length; i++) {
      var r = sections[i].getBoundingClientRect();
      if (r.top <= line) found = sections[i].id;
    }
    setActive(found || sections[0].id);
  }

  var raf = null;
  function onScroll() {
    if (raf) return;
    raf = requestAnimationFrame(function () {
      raf = null;
      pick();
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  pick();
})();

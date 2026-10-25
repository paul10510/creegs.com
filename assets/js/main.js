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
    { text: "Rope Access · Scouting · Fishing", cls: "" },
    { text: "Westchester, NY", cls: "" },
    { text: "Status: Rope Access Technician in NYC", cls: "" }
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

  /* ─── 3. galleries (merit badges and fishing photos share this) ─── */
  Array.prototype.slice.call(document.querySelectorAll(".gallery")).forEach(function (gallery) {
    var stage = gallery.querySelector(".gallery__stage");
    if (!stage) return;
    var img = gallery.querySelector("#galleryImg, [id^=galleryImg]") || stage.querySelector(".gallery__fig img");
    var title = gallery.querySelector("#galleryTitle, [id^=galleryTitle]") || stage.querySelector(".gallery__meta h3");
    var desc = gallery.querySelector("#galleryDesc, [id^=galleryDesc]") || stage.querySelector(".gallery__meta p");
    var count = gallery.querySelector(".gallery__count");
    var thumbs = Array.prototype.slice.call(gallery.querySelectorAll(".gallery__thumb"));
    var pad = function (n) { return (n < 10 ? "0" : "") + n; };

    function select(i) {
      var t = thumbs[i];
      img.src = t.getAttribute("data-src");
      img.alt = t.getAttribute("data-alt");
      if (title) title.textContent = t.getAttribute("data-title");
      if (desc) desc.textContent = t.getAttribute("data-desc");
      if (count) count.textContent = pad(i + 1) + " / " + pad(thumbs.length);
      thumbs.forEach(function (b, j) {
        var on = i === j;
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-pressed", on ? "true" : "false");
      });
    }

    thumbs.forEach(function (t, i) {
      t.addEventListener("click", function () {
        if (t.classList.contains("is-active")) return;
        // brief fade out, swap, fade back — motion that answers the click
        stage.classList.add("is-swapping");
        setTimeout(function () {
          select(i);
          stage.classList.remove("is-swapping");
        }, reduce ? 0 : 130);
      });
    });

    // arrow keys move through the gallery once focus is in it
    gallery.querySelector(".gallery__thumbs").addEventListener("keydown", function (e) {
      var cur = thumbs.indexOf(document.activeElement);
      if (cur < 0) return;
      var next = e.key === "ArrowRight" ? cur + 1 : e.key === "ArrowLeft" ? cur - 1 : -1;
      if (next >= 0 && next < thumbs.length) {
        e.preventDefault();
        thumbs[next].focus();
        select(next);
      }
    });
  });

  /* ─── 2. active tab tracking ───────────────────────────── */
  var sections = Array.prototype.slice.call(document.querySelectorAll("section[id]"));
  var railLinks = Array.prototype.slice.call(
    document.querySelectorAll(".rail__nav a, .topbar__nav a")
  );
  if (!sections.length || !railLinks.length) return;

  var current = null;

  function setActive(id) {
    if (id === current) return;
    current = id;
    railLinks.forEach(function (a) {
      a.classList.toggle("is-active", a.getAttribute("href") === "#" + id);
    });
  }

  // Driven by IntersectionObserver rather than a scroll handler. A scroll
  // listener is the obvious way to do this but it quietly does nothing when
  // scroll events are throttled or absent, and the tab freezes with no way
  // back. Here the browser does the work and there is no handler to stall.
  //
  // rootMargin carves a zero-height band 35% down the viewport; a section is
  // current while it crosses that line. Whichever observed section sits in
  // the band last in document order wins, which keeps the handover orderly
  // when two overlap at a boundary.
  if (!("IntersectionObserver" in window)) {
    setActive(sections[0].id);
    return;
  }

  var inBand = {};
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { inBand[e.target.id] = e.isIntersecting; });
    var found = null;
    for (var i = 0; i < sections.length; i++) {
      if (inBand[sections[i].id]) found = sections[i].id;
    }
    // nothing crossing the band means we are past the last section; hold the
    // last tab rather than snapping Index back on at the bottom of the page
    setActive(found || current || sections[0].id);
  }, { rootMargin: "-35% 0px -65% 0px", threshold: 0 });

  sections.forEach(function (s) { io.observe(s); });
})();

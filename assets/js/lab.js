/* ============================================================
   Memory & Reasoning Lab — DEEP SIGNAL interactions
   Zero-dependency. Reduced-motion aware. No scroll listeners
   (nav uses an IntersectionObserver sentinel; scroll-progress
   is CSS scroll-driven). Hero waveform pauses when offscreen.
   ============================================================ */
(function () {
  "use strict";
  var root = document.documentElement;
  root.classList.remove("no-js");

  var mq = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)");
  var REDUCE = !!(mq && mq.matches);
  var hasIO = "IntersectionObserver" in window;

  /* ---- scroll-reveal ---------------------------------------------------- */
  function initReveal() {
    var nodes = document.querySelectorAll("[data-reveal]");
    if (REDUCE || !hasIO) {
      for (var i = 0; i < nodes.length; i++) nodes[i].classList.add("is-visible");
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.08 });
    nodes.forEach(function (n) { io.observe(n); });
  }

  /* ---- nav condense (sentinel, no scroll listener) ---------------------- */
  function initNav() {
    var s = document.createElement("div");
    s.setAttribute("aria-hidden", "true");
    s.style.cssText = "position:absolute;top:0;left:0;width:1px;height:10px;pointer-events:none";
    document.body.prepend(s);
    if (!hasIO) return;
    var io = new IntersectionObserver(function (entries) {
      document.body.classList.toggle("is-scrolled", !entries[0].isIntersecting);
    }, { threshold: 0 });
    io.observe(s);
  }

  /* ---- count-up numerals ------------------------------------------------ */
  function fmt(v, el) {
    var dp = parseInt(el.getAttribute("data-decimals") || "0", 10);
    return Number(v.toFixed(dp)).toLocaleString("en-US");
  }
  function runCount(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    if (isNaN(target)) return;
    if (REDUCE) { el.textContent = fmt(target, el); return; }
    var dur = 1500, start = null;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(target * eased, el);
      if (p < 1) requestAnimationFrame(step); else el.textContent = fmt(target, el);
    }
    requestAnimationFrame(step);
  }
  function initCounters() {
    var els = document.querySelectorAll("[data-count]");
    if (!els.length) return;
    if (REDUCE || !hasIO) { els.forEach(function (e) { e.textContent = fmt(parseFloat(e.getAttribute("data-count")), e); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { runCount(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.45 });
    // markup seeds the REAL number (no-JS safe); reset to 0 only now that we will animate up
    els.forEach(function (e) { e.textContent = "0"; io.observe(e); });
  }

  /* ---- pointer spotlight (research domain cards) ------------------------ */
  function initSpotlight() {
    if (REDUCE) return;
    document.querySelectorAll("[data-spotlight]").forEach(function (card) {
      var raf = null, ev = null;
      card.addEventListener("pointermove", function (e) {
        ev = e;
        if (raf) return;
        raf = requestAnimationFrame(function () {
          raf = null;
          var r = card.getBoundingClientRect();
          card.style.setProperty("--mx", ((ev.clientX - r.left) / r.width * 100).toFixed(1) + "%");
          card.style.setProperty("--my", ((ev.clientY - r.top) / r.height * 100).toFixed(1) + "%");
        });
      });
    });
  }

  /* ---- magnetic primary button ----------------------------------------- */
  function initMagnetic() {
    if (REDUCE) return;
    document.querySelectorAll("[data-magnetic]").forEach(function (b) {
      var raf = null, ev = null;
      b.addEventListener("pointermove", function (e) {
        ev = e;
        if (raf) return;
        raf = requestAnimationFrame(function () {
          raf = null;
          var r = b.getBoundingClientRect();
          var x = (ev.clientX - (r.left + r.width / 2)) / r.width;
          var y = (ev.clientY - (r.top + r.height / 2)) / r.height;
          b.style.transform = "translate(" + (x * 9).toFixed(2) + "px," + (y * 6 - 2).toFixed(2) + "px)";
        });
      });
      b.addEventListener("pointerleave", function () { b.style.transform = ""; });
    });
  }

  /* ---- hero time-series waveform --------------------------------------- */
  function initWaveform() {
    var canvas = document.getElementById("hero-wave");
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext("2d");
    var W = 0, H = 0;
    function resize() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var r = canvas.getBoundingClientRect();
      W = r.width; H = r.height;
      if (!W || !H) return;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    if ("ResizeObserver" in window) { try { new ResizeObserver(resize).observe(canvas); } catch (e) {} }

    var GOLD = "242,168,29", SIGNAL = "91,215,230";
    function series(x, t, seed) {
      var u = x / (W || 1);
      return Math.sin(u * 6.2 + t + seed) * 0.5
           + Math.sin(u * 13.0 - t * 0.7 + seed * 2) * 0.22
           + Math.sin(u * 3.0 + t * 0.4) * 0.30
           + Math.sin(u * 22.0 + t * 1.3) * 0.08;
    }
    function line(t, amp, mid, color, alpha, lw, seed, fill) {
      var step = Math.max(4, W / 200), x, y, first = true, lastY = mid;
      ctx.beginPath();
      for (x = 0; x <= W; x += step) {
        y = mid + series(x, t, seed) * amp;
        if (first) { ctx.moveTo(x, y); first = false; } else ctx.lineTo(x, y);
        lastY = y;
      }
      if (fill) {
        ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath();
        var g = ctx.createLinearGradient(0, mid - amp, 0, H);
        g.addColorStop(0, "rgba(" + color + "," + (alpha * 0.16) + ")");
        g.addColorStop(1, "rgba(" + color + ",0)");
        ctx.fillStyle = g; ctx.fill();
        return lastY;
      }
      ctx.lineWidth = lw;
      ctx.strokeStyle = "rgba(" + color + "," + alpha + ")";
      ctx.shadowColor = "rgba(" + color + ",0.45)"; ctx.shadowBlur = 12;
      ctx.stroke();
      ctx.shadowBlur = 0;
      return lastY;
    }
    var t = 0, running = false, rafId = null;
    function draw() {
      if (!W || !H) { resize(); if (!W || !H) return; }
      ctx.clearRect(0, 0, W, H);
      var mid = H * 0.56, amp = Math.min(H * 0.13, 80), gx;
      ctx.strokeStyle = "rgba(255,255,255,0.035)"; ctx.lineWidth = 1;
      for (gx = (W % 64); gx < W; gx += 64) {
        ctx.beginPath(); ctx.moveTo(gx, mid - amp * 1.7); ctx.lineTo(gx, mid + amp * 1.7); ctx.stroke();
      }
      line(t * 0.8, amp * 0.7, mid + 20, SIGNAL, 0.45, 1.4, 10.0, false);
      line(t, amp, mid, GOLD, 0.9, 2.2, 0.0, true);
      var leadY = line(t, amp, mid, GOLD, 0.95, 2.2, 0.0, false);
      ctx.beginPath(); ctx.arc(W - 2, leadY, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(" + GOLD + ",1)";
      ctx.shadowColor = "rgba(" + GOLD + ",0.9)"; ctx.shadowBlur = 16; ctx.fill(); ctx.shadowBlur = 0;
    }
    function loop() { if (!running) return; draw(); t += 0.012; rafId = requestAnimationFrame(loop); }
    function startLoop() { if (!running) { running = true; loop(); } }
    function stopLoop() { running = false; if (rafId) cancelAnimationFrame(rafId); }

    if (REDUCE) { draw(); return; }
    if (hasIO) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) startLoop(); else stopLoop(); });
      }, { threshold: 0 });
      io.observe(canvas);
    } else { startLoop(); }
  }

  /* ---- boot ------------------------------------------------------------- */
  function init() {
    try { initReveal(); } catch (e) { document.querySelectorAll("[data-reveal]").forEach(function (n) { n.classList.add("is-visible"); }); }
    try { initNav(); } catch (e) {}
    try { initCounters(); } catch (e) {}
    try { initSpotlight(); } catch (e) {}
    try { initMagnetic(); } catch (e) {}
    try { initWaveform(); } catch (e) {}
  }
  if (document.readyState !== "loading") init();
  else document.addEventListener("DOMContentLoaded", init);
})();

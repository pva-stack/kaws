/* ═══════════════════════════════════════════════════════════════════════
   ARCHIVE ✕✕ — interaction layer
   Vanilla, no dependencies. Everything animates on transform/opacity,
   everything observes instead of polling, everything degrades when
   `prefers-reduced-motion` is on.

   01 helpers        02 loader        03 text reveals   04 nav
   05 mobile menu    06 ticker        07 cursor         08 anatomy
   09 film player    10 counters      11 archive rail   12 parallax
   13 access form    14 chrome bits   15 scroll bus
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── 01 · HELPERS ─────────────────────────────────────────────────── */
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  var motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  var reduced = motionQuery.matches;
  motionQuery.addEventListener('change', function (e) { reduced = e.matches; });

  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var lerp  = function (a, b, t) { return a + (b - a) * t; };
  var easeOut = function (t) { return 1 - Math.pow(1 - t, 3); };

  /* a single rAF-driven scroll bus — no competing scroll listeners */
  var scrollTasks = [];
  var onScroll = function (fn) { scrollTasks.push(fn); };
  var ticking = false;
  var runScroll = function () {
    ticking = false;
    var y = window.pageYOffset;
    for (var i = 0; i < scrollTasks.length; i++) scrollTasks[i](y);
  };
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(runScroll); }
  }, { passive: true });
  window.addEventListener('resize', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(runScroll); }
  }, { passive: true });

  /* ── 02 · LOADER ──────────────────────────────────────────────────── */
  var loader   = $('#loader');
  var barFill  = $('#loaderBar');
  var countEl  = $('#loaderCount');
  var statusEl = $('#loaderStatus');
  var STATES = ['CALIBRANDO SALA 01', 'MONTANDO FIGURAS', 'AJUSTANDO LUZ DA GALERIA', 'ARQUIVO PRONTO'];

  function bootExperience() {
    document.body.classList.remove('is-locked');
    // First-paint reveals for anything already on screen. Deliberately not in
    // a rAF: a document that loads in a background tab has rAF suspended, and
    // the opening screen would sit at opacity 0 until it was looked at.
    $$('[data-reveal], [data-split]').forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.92) el.classList.add('is-in');
    });
    runScroll();
  }

  function runLoader() {
    if (!loader) { bootExperience(); return; }
    document.body.classList.add('is-locked');

    var MIN = reduced ? 300 : 1900;          // premium, but never annoying
    var start = performance.now();

    // Wait on the hero image, not on `load`. The film element holds the load
    // event open while it resolves its sources — a missing or heavy file would
    // otherwise park a visitor behind the curtain for seconds.
    var heroImg = $('.hero__plate img');
    var pageReady = !heroImg || heroImg.complete;
    if (!pageReady) {
      var ready = function () { pageReady = true; };
      heroImg.addEventListener('load', ready);
      heroImg.addEventListener('error', ready);
    }

    function frame(now) {
      var t = clamp((now - start) / MIN, 0, 1);
      // ease so the counter feels mechanical, not linear
      var pct = Math.round(easeOut(t) * 100);
      if (countEl) countEl.textContent = pct < 10 ? '0' + pct : String(pct);
      if (barFill) barFill.style.width = pct + '%';
      if (statusEl) {
        var s = STATES[Math.min(STATES.length - 1, Math.floor(t * STATES.length))];
        if (statusEl.textContent !== s) statusEl.textContent = s;
      }
      if (t < 1 || !pageReady) { requestAnimationFrame(frame); return; }
      finish();
    }

    var done = false;
    function finish() {
      if (done) return;
      done = true;
      setTimeout(function () {
        loader.classList.add('is-done');
        bootExperience();
        setTimeout(function () { loader.setAttribute('hidden', ''); }, 1200);
      }, reduced ? 0 : 260);
    }

    requestAnimationFrame(frame);
    // hard safety net: never trap the visitor behind the curtain
    setTimeout(finish, 4000);
  }

  /* ── 03 · TEXT REVEALS ────────────────────────────────────────────── */
  // wrap each .line so it can slide up from behind its own overflow mask
  $$('[data-split]').forEach(function (block) {
    $$('.line', block).forEach(function (line, i) {
      var inner = document.createElement('span');
      inner.className = 'line__in';
      inner.innerHTML = line.innerHTML;
      inner.style.setProperty('--d', (i * 0.075) + 's');
      line.innerHTML = '';
      line.appendChild(inner);
    });
  });

  // stagger sibling reveals so groups arrive as a wave, not a wall
  $$('[data-reveal]').forEach(function (el) {
    var sibs = el.parentElement ? $$( ':scope > [data-reveal]', el.parentElement) : [];
    var i = sibs.indexOf(el);
    if (i > 0) el.style.setProperty('--d', Math.min(i * 0.09, 0.45) + 's');
  });

  if ('IntersectionObserver' in window) {
    var revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        revealIO.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
    $$('[data-reveal], [data-split]').forEach(function (el) { revealIO.observe(el); });
  } else {
    $$('[data-reveal], [data-split]').forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ── 04 · NAV ─────────────────────────────────────────────────────── */
  var nav = $('#nav');
  var progress = $('#navProgress');

  onScroll(function (y) {
    if (nav) nav.classList.toggle('is-stuck', y > 40);
    if (progress) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (max > 0 ? clamp(y / max, 0, 1) * 100 : 0) + '%';
    }
  });

  // active section highlighting
  var navLinks = $$('[data-nav]');
  if (navLinks.length && 'IntersectionObserver' in window) {
    var byId = {};
    navLinks.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
    var sectionIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var link = byId[e.target.id];
        if (!link) return;
        if (e.isIntersecting) {
          navLinks.forEach(function (a) { a.classList.remove('is-active'); });
          link.classList.add('is-active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(byId).forEach(function (id) {
      var sec = document.getElementById(id);
      if (sec) sectionIO.observe(sec);
    });
  }

  /* ── 05 · MOBILE MENU ─────────────────────────────────────────────── */
  var burger = $('#burger');
  var menu = $('#menu');

  function setMenu(open) {
    if (!menu || !burger) return;
    if (open) menu.removeAttribute('hidden');
    // let the browser register the un-hide before animating
    requestAnimationFrame(function () {
      document.body.classList.toggle('is-menu', open);
      document.body.classList.toggle('is-locked', open);
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
      $$('.menu__list a', menu).forEach(function (a, i) {
        a.style.transitionDelay = open ? (0.06 + i * 0.045) + 's' : '0s';
      });
    });
    if (!open) setTimeout(function () { menu.setAttribute('hidden', ''); }, 800);
  }

  if (burger) {
    burger.addEventListener('click', function () {
      setMenu(!document.body.classList.contains('is-menu'));
    });
  }
  if (menu) {
    $$('a', menu).forEach(function (a) {
      a.addEventListener('click', function () { setMenu(false); });
    });
  }
  window.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && document.body.classList.contains('is-menu')) setMenu(false);
  });
  // a resize past the breakpoint should never strand the overlay open
  window.addEventListener('resize', function () {
    if (window.innerWidth > 1100 && document.body.classList.contains('is-menu')) setMenu(false);
  });

  /* ── 06 · TICKER ──────────────────────────────────────────────────── */
  (function ticker() {
    var track = $('#ticker');
    if (!track) return;
    var seq = $('.ticker__seq', track);
    if (!seq) return;

    var seqWidth = 0;
    function build() {
      // reset to a single sequence, then clone until it covers 2× the viewport
      while (track.children.length > 1) track.removeChild(track.lastChild);
      seqWidth = seq.getBoundingClientRect().width;
      if (!seqWidth) return;
      var need = Math.ceil((window.innerWidth * 2) / seqWidth) + 1;
      for (var i = 0; i < need; i++) track.appendChild(seq.cloneNode(true));
    }
    build();
    window.addEventListener('resize', build);

    if (reduced) return;
    var x = 0, last = performance.now(), running = true;
    var io = new IntersectionObserver(function (e) { running = e[0].isIntersecting; },
      { threshold: 0 });
    io.observe(track.parentElement);

    (function loop(now) {
      var dt = Math.min(now - last, 60); last = now;
      if (running && seqWidth) {
        x -= dt * 0.035;                       // px per ms — slow, editorial
        if (x <= -seqWidth) x += seqWidth;
        track.style.transform = 'translate3d(' + x + 'px,0,0)';
      }
      requestAnimationFrame(loop);
    })(last);
  })();

  /* ── 07 · CURSOR ──────────────────────────────────────────────────── */
  (function cursor() {
    var el = $('#cursor');
    var label = $('#cursorLabel');
    if (!el || !finePointer.matches || reduced) return;

    var tx = window.innerWidth / 2, ty = window.innerHeight / 2;
    var cx = tx, cy = ty, active = false, running = false;

    // the loop parks itself once the ring has caught up — no idle rAF
    function loop() {
      cx = lerp(cx, tx, 0.18);
      cy = lerp(cy, ty, 0.18);
      el.style.transform = 'translate3d(' + cx + 'px,' + cy + 'px,0)';
      if (Math.abs(tx - cx) < 0.1 && Math.abs(ty - cy) < 0.1) { running = false; return; }
      requestAnimationFrame(loop);
    }
    function wake() { if (!running) { running = true; requestAnimationFrame(loop); } }

    window.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      tx = e.clientX; ty = e.clientY;
      if (!active) { active = true; el.classList.add('is-on'); cx = tx; cy = ty; }
      wake();
    }, { passive: true });

    document.addEventListener('pointerleave', function () { el.classList.remove('is-on'); });
    document.addEventListener('pointerenter', function () { if (active) el.classList.add('is-on'); });

    // grow + label over anything that declares one
    document.addEventListener('pointerover', function (e) {
      var t = e.target.closest ? e.target.closest('[data-cursor]') : null;
      if (t) {
        if (label) label.textContent = t.getAttribute('data-cursor');
        el.classList.add('is-lg');
      } else if (e.target.closest && e.target.closest('a, button, input')) {
        if (label) label.textContent = '';
        el.classList.add('is-lg');
      }
    });
    document.addEventListener('pointerout', function (e) {
      var to = e.relatedTarget;
      var stillIn = to && to.closest && to.closest('[data-cursor], a, button, input');
      if (!stillIn) el.classList.remove('is-lg');
    });
  })();

  /* ── 08 · ANATOMY ─────────────────────────────────────────────────── */
  (function anatomy() {
    var section = $('#anatomy');
    if (!section) return;
    var steps = $$('.astep', section);
    var hots  = $$('.hot', section);
    var scan  = $('#scanPct');
    if (!steps.length) return;

    var current = -1;
    function setActive(i) {
      if (i === current) return;
      current = i;
      steps.forEach(function (s, n) { s.classList.toggle('is-on', n === i); });
      hots.forEach(function (h, n) { h.classList.toggle('is-on', n === i); });
    }
    setActive(0);

    onScroll(function () {
      var rect = section.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;

      // scan readout tracks progress through the section
      if (scan) {
        var p = clamp((window.innerHeight * 0.6 - rect.top) / (rect.height * 0.85), 0, 1);
        var v = Math.round(p * 100);
        scan.textContent = v < 10 ? '0' + v : String(v);
      }

      // the step nearest the reading line wins
      var line = window.innerHeight * 0.52;
      var best = 0, bestDist = Infinity;
      steps.forEach(function (s, n) {
        var r = s.getBoundingClientRect();
        var d = Math.abs(r.top + r.height / 2 - line);
        if (d < bestDist) { bestDist = d; best = n; }
      });
      setActive(best);
    });
  })();

  /* ── 09 · FILM PLAYER (Higgsfield centrepiece) ────────────────────── */
  (function film() {
    var player = $('#player');
    var video  = $('#filmVideo');
    if (!player || !video) return;

    var playBtn  = $('#playBtn');
    var soundBtn = $('#soundBtn');
    var cineBtn  = $('#cinemaBtn');
    var bar      = $('#playerBar');
    var fill     = $('#playerFill');
    var empty    = $('#playerEmpty');

    var hasSource = true;

    // two different failures, two different instructions
    function markMissing(reason) {
      if (!hasSource) return;
      hasSource = false;
      if (empty) {
        if (reason === 'unreadable') {
          var tag = $('.player__empty-tag', empty);
          var line = $('.player__empty-line', empty);
          if (tag) tag.textContent = 'ESPAÇO DO FILME · FONTE ILEGÍVEL';
          if (line) line.textContent = 'O navegador não conseguiu decodificar o arquivo em';
        }
        empty.removeAttribute('hidden');
      }
      if (playBtn) playBtn.setAttribute('hidden', '');
      if (bar) bar.setAttribute('hidden', '');
      player.removeAttribute('data-cursor');
      $$('.player__ctrl button').forEach(function (b) { b.setAttribute('hidden', ''); });
    }

    // A file that fails to decode raises `error` on the element; a file that is
    // simply absent does not — the last <source> errors and networkState lands
    // on NO_SOURCE. Both paths have to be covered.
    video.addEventListener('error', function () { markMissing('unreadable'); });
    $$('source', video).forEach(function (s) {
      s.addEventListener('error', function () {
        // only give up once every candidate has been exhausted
        if (video.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) markMissing('absent');
      });
    });
    // last resort: nothing ever loaded
    setTimeout(function () {
      if (video.readyState === 0 &&
          video.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) markMissing('absent');
    }, 2600);

    function play() { var p = video.play(); if (p && p.catch) p.catch(function () {}); }

    // ambient: the film breathes quietly while it is on screen
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (e) {
        if (!hasSource || reduced) return;
        if (e[0].isIntersecting) play();
        else if (!document.body.classList.contains('is-cinema')) video.pause();
      }, { threshold: 0.35 });
      io.observe(player);
    }

    function startWithSound() {
      if (!hasSource) return;
      video.muted = false;
      video.currentTime = video.currentTime || 0;
      play();
      player.classList.add('is-playing');
      if (soundBtn) { soundBtn.textContent = 'SOM LIGADO'; soundBtn.setAttribute('aria-pressed', 'true'); }
    }

    if (playBtn) playBtn.addEventListener('click', startWithSound);

    // the frame carries a PLAY cursor, so the whole frame should answer to it
    player.addEventListener('click', function (e) {
      if (!hasSource) return;
      if (e.target.closest('.player__ctrl, .player__bar, .player__play')) return;
      if (player.classList.contains('is-playing')) { video.pause(); return; }
      startWithSound();
    });

    if (soundBtn) soundBtn.addEventListener('click', function () {
      if (!hasSource) return;
      video.muted = !video.muted;
      soundBtn.textContent = video.muted ? 'SOM DESLIGADO' : 'SOM LIGADO';
      soundBtn.setAttribute('aria-pressed', String(!video.muted));
      if (!video.muted) { play(); player.classList.add('is-playing'); }
    });

    function setCinema(on) {
      player.classList.toggle('is-cinema', on);
      document.body.classList.toggle('is-cinema', on);
      if (cineBtn) {
        cineBtn.setAttribute('aria-pressed', String(on));
        cineBtn.textContent = on ? 'SAIR DO CINEMA' : 'MODO CINEMA';
      }
      if (on) { player.classList.add('is-playing'); play(); }
    }
    if (cineBtn) cineBtn.addEventListener('click', function () {
      if (!hasSource) return;
      setCinema(!player.classList.contains('is-cinema'));
    });
    window.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && player.classList.contains('is-cinema')) setCinema(false);
    });

    video.addEventListener('timeupdate', function () {
      if (!fill || !video.duration) return;
      fill.style.width = (video.currentTime / video.duration * 100) + '%';
    });
    video.addEventListener('play',  function () { if (!video.muted) player.classList.add('is-playing'); });
    video.addEventListener('pause', function () {
      if (!document.body.classList.contains('is-cinema')) player.classList.remove('is-playing');
    });

    if (bar) bar.addEventListener('click', function (e) {
      if (!hasSource || !video.duration) return;
      var r = bar.getBoundingClientRect();
      video.currentTime = clamp((e.clientX - r.left) / r.width, 0, 1) * video.duration;
    });
  })();

  /* ── 10 · COUNTERS ────────────────────────────────────────────────── */
  (function counters() {
    var nodes = $$('[data-count]');
    if (!nodes.length) return;

    function run(el) {
      var target = parseFloat(el.getAttribute('data-count')) || 0;
      var suffix = el.getAttribute('data-suffix') || '';
      if (reduced) { el.textContent = target + suffix; return; }
      var dur = 1300, start = performance.now();
      (function step(now) {
        var t = clamp((now - start) / dur, 0, 1);
        el.textContent = Math.round(easeOut(t) * target) + suffix;
        if (t < 1) requestAnimationFrame(step);
      })(start);
    }

    if (!('IntersectionObserver' in window)) { nodes.forEach(run); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        run(e.target); io.unobserve(e.target);
      });
    }, { threshold: 0.6 });
    nodes.forEach(function (n) { io.observe(n); });
  })();

  /* ── 11 · ARCHIVE RAIL ────────────────────────────────────────────── */
  (function rail() {
    var el = $('#archRail');
    if (!el) return;
    var prev = $('#archPrev');
    var next = $('#archNext');

    function step() {
      var item = $('.rail__item', el);
      var gap = parseFloat(getComputedStyle(el).columnGap || getComputedStyle(el).gap) || 16;
      return item ? item.getBoundingClientRect().width + gap : el.clientWidth * 0.8;
    }
    function sync() {
      var max = el.scrollWidth - el.clientWidth - 2;
      if (prev) prev.disabled = el.scrollLeft <= 2;
      if (next) next.disabled = el.scrollLeft >= max;
    }
    if (prev) prev.addEventListener('click', function () {
      el.scrollBy({ left: -step(), behavior: reduced ? 'auto' : 'smooth' });
    });
    if (next) next.addEventListener('click', function () {
      el.scrollBy({ left: step(), behavior: reduced ? 'auto' : 'smooth' });
    });
    el.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    sync();

    // drag to pan — pointer events cover mouse, pen and touch fallbacks
    var down = false, startX = 0, startScroll = 0, moved = 0;
    el.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'touch') return;      // native momentum is better
      down = true; moved = 0;
      startX = e.clientX; startScroll = el.scrollLeft;
      el.classList.add('is-drag');
      el.setPointerCapture(e.pointerId);
    });
    el.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - startX;
      moved = Math.abs(dx);
      el.scrollLeft = startScroll - dx;
    });
    function release(e) {
      if (!down) return;
      down = false;
      el.classList.remove('is-drag');
      try { el.releasePointerCapture(e.pointerId); } catch (err) { /* already gone */ }
    }
    el.addEventListener('pointerup', release);
    el.addEventListener('pointercancel', release);
    // suppress the click that ends a drag
    el.addEventListener('click', function (e) { if (moved > 6) { e.preventDefault(); e.stopPropagation(); } }, true);
  })();

  /* ── 12 · PARALLAX (very light, transform only) ───────────────────── */
  (function parallax() {
    var band = $('#streetBand');
    if (!band || reduced) return;
    var host = band.parentElement;
    onScroll(function () {
      var r = host.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      var p = (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight;
      band.style.transform = 'translate3d(0,' + (-14 + clamp(p, -1, 1) * -7) + '%,0)';
    });
  })();

  /* ── 13 · ACCESS FORM ─────────────────────────────────────────────── */
  (function access() {
    var form = $('#accessForm');
    var input = $('#accessEmail');
    var msg = $('#accessMsg');
    if (!form || !input || !msg) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = input.value.trim();
      var ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
      input.classList.toggle('is-bad', !ok);
      if (!ok) {
        msg.style.color = 'var(--pink)';
        msg.textContent = '↳ DIGITE UM ENDEREÇO VÁLIDO PARA CONTINUAR.';
        input.focus();
        return;
      }
      msg.style.color = 'var(--acid)';
      msg.textContent = '↳ ADICIONADO À LISTA — DEMONSTRAÇÃO CONCEITUAL, NADA FOI ENVIADO.';
      input.value = '';
      input.blur();
    });
  })();

  /* ── 14 · CHROME BITS ─────────────────────────────────────────────── */
  var year = $('#year');
  if (year) year.textContent = String(new Date().getFullYear());

  (function clock() {
    var el = $('#navClock');
    if (!el) return;
    function tick() {
      try {
        var t = new Intl.DateTimeFormat('en-GB', {
          timeZone: 'Asia/Tokyo', hour: '2-digit', minute: '2-digit', hour12: false
        }).format(new Date());
        el.textContent = 'TOKYO ' + t;
      } catch (err) {
        el.textContent = 'TOKYO —:—';        // environment without full ICU
      }
    }
    tick();
    setInterval(tick, 30000);
  })();

  /* ── 15 · GO ──────────────────────────────────────────────────────── */
  runLoader();
})();

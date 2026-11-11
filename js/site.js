/* QualiK mockup B. No dependencies. Every block checks that its markup exists. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- Entrances: each part of a section, staggered ---------- */
  var groups = new Map();
  $$('[data-r]').forEach(function (el) {
    var p = el.closest('section, footer, header') || document.body;
    var n = groups.get(p) || 0;
    el.style.setProperty('--i', Math.min(n, 6));
    groups.set(p, n + 1);
  });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    $$('[data-r], [data-shutter]').forEach(function (el) { io.observe(el); });
  } else {
    $$('[data-r], [data-shutter]').forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Small waveforms ---------- */
  $$('.wave[data-n]').forEach(function (w) {
    var n = +w.dataset.n, h = '';
    for (var i = 0; i < n; i++) {
      var v = 25 + Math.abs(Math.sin(i * 1.7) * 55 + Math.sin(i * 0.6) * 20);
      h += '<i style="height:' + Math.min(100, Math.round(v)) + '%"></i>';
    }
    w.innerHTML = h;
  });

  /* ---------- Typing into a field ---------- */
  var typers = new WeakMap();
  function type(el, text, cls) {
    clearInterval(typers.get(el));
    el.className = cls || '';
    if (reduce || !text) { el.textContent = text; return; }
    var i = 0; el.textContent = ''; el.classList.add('caret');
    var t = setInterval(function () {
      i += 2; el.textContent = text.slice(0, i);
      if (i >= text.length) { clearInterval(t); el.classList.remove('caret'); }
    }, 16);
    typers.set(el, t);
  }

  /* ---------- Hero: alarm console ---------- */
  var con = $('#console');
  if (con) {
    var ALARMS = [
      { code: 'F3041', name: 'Servo drive overtemperature', where: 'Filler 2 · Line 4', when: '03:07', causes: [
        { t: 'Cooling fan blocked by product dust', src: 'Past repair · 14 Mar · Plant 2', steps: ['Stop the filler and lock out the drive cabinet.', 'Remove the fan guard, clean the fan and the filter.', 'Check the cabinet temperature is back in range.', 'Reset the drive and restart at reduced speed.'], ssrc: 'Manual, section 7.3, page 142', action: 'Cleaned cooling fan, replaced cabinet filter', parts: 'Cabinet filter FK-220 × 1' },
        { t: 'Brake not releasing on axis 2', src: 'Drawing E-204, sheet 3', steps: ['Check 24 V at brake terminal X12.', 'Measure the brake coil resistance.', 'Replace relay K7 if the coil is in range.', 'Jog the axis and read the motor current.'], ssrc: 'Drawing E-204, sheet 3', action: 'Replaced brake relay K7', parts: 'Relay K7 × 1' } ] },
      { code: 'A217', name: 'Vacuum below threshold', where: 'Pick-and-place · Line 1', when: '02:41', causes: [
        { t: 'Worn suction cups on the gripper', src: 'Past repair · 2 Sep · Plant 1', steps: ['Stop the unit in the pick position.', 'Inspect the four suction cups for cracks.', 'Replace worn cups and check the seals.', 'Run ten cycles and read the vacuum level.'], ssrc: 'Manual, section 4.1, page 58', action: 'Replaced four suction cups', parts: 'Suction cup SC-30 × 4' },
        { t: 'Clogged vacuum filter', src: 'Manual, section 4.4, page 63', steps: ['Isolate compressed air to the ejector.', 'Remove and clean the vacuum filter.', 'Refit the filter and open the air supply.', 'Check the vacuum level at the gauge.'], ssrc: 'Manual, section 4.4, page 63', action: 'Cleaned vacuum filter', parts: 'None' } ] },
      { code: 'E118', name: 'Film tension out of range', where: 'Wrapper 1 · Line 4', when: 'Yesterday', causes: [
        { t: 'Dancer arm sensor out of position', src: 'Past repair · 21 Jan · Plant 3', steps: ['Stop the wrapper and release film tension.', 'Check the dancer sensor bracket for play.', 'Move the sensor back to the reference mark.', 'Restart and check tension through one reel.'], ssrc: 'Drawing M-117, sheet 1', action: 'Repositioned dancer arm sensor', parts: 'None' },
        { t: 'Film brake pad worn', src: 'Manual, section 9.2, page 201', steps: ['Stop the wrapper and remove the reel.', 'Measure the brake pad thickness.', 'Replace the pad if under the limit.', 'Refit the reel and set the brake pressure.'], ssrc: 'Manual, section 9.2, page 201', action: 'Replaced film brake pad', parts: 'Brake pad BP-12 × 1' } ] }
    ];
    var ai = 0, ci = 0;
    var dd = function (k) { return $('[data-k="' + k + '"]', con); };
    var status = $('#c-status'), confirmBtn = $('#c-confirm');
    function setStatus(done) {
      status.className = 'pill ' + (done ? 'ok' : 'warn');
      status.innerHTML = '<i></i>' + (done ? 'Confirmed · sent to supervisor' : 'Draft');
      confirmBtn.textContent = done ? 'Reopen' : 'Confirm repair';
      confirmBtn.dataset.done = done ? '1' : '';
    }
    function renderCause(animate) {
      var a = ALARMS[ai], c = a.causes[ci];
      $$('.cause', con).forEach(function (b, i) { b.setAttribute('aria-pressed', i === ci ? 'true' : 'false'); });
      $('#c-proc').innerHTML = c.steps.map(function (s) { return '<li>' + s + '</li>'; }).join('') + '<li class="src">' + c.ssrc + '</li>';
      var set = animate ? type : function (el, t, cls) { el.className = cls || ''; el.textContent = t; };
      set(dd('machine'), a.where);
      set(dd('fault'), a.code + ' ' + a.name);
      set(dd('cause'), c.t);
      set(dd('action'), c.action);
      set(dd('parts'), c.parts);
      set(dd('hours'), 'Added by the technician', 'wait');
      set(dd('outcome'), 'Confirmed after restart', 'wait');
      setStatus(false);
    }
    function renderAlarm(animate) {
      var a = ALARMS[ai];
      $$('.alarm', con).forEach(function (b, i) { b.setAttribute('aria-selected', i === ai ? 'true' : 'false'); });
      $('#c-title').textContent = a.name;
      $('#c-meta').textContent = a.code + ' · ' + a.where + ' · ' + a.when;
      $('#c-causes').innerHTML = a.causes.map(function (c, i) {
        return '<button class="cause" aria-pressed="' + (i === ci) + '" data-cause="' + i + '"><strong>' + c.t + '</strong><span class="src">' + c.src + '</span></button>';
      }).join('');
      renderCause(animate);
    }
    con.addEventListener('click', function (e) {
      var al = e.target.closest('.alarm'), ca = e.target.closest('.cause');
      if (al) { ai = +al.dataset.alarm; ci = 0; renderAlarm(true); }
      else if (ca) { ci = +ca.dataset.cause; renderCause(true); }
      else if (e.target === confirmBtn) {
        if (confirmBtn.dataset.done) { renderCause(false); return; }
        type(dd('hours'), '0.7 h');
        type(dd('outcome'), 'Machine restarted, running at full speed');
        setStatus(true);
      }
    });
    renderAlarm(false);
    setTimeout(function () { renderCause(true); }, 700); // the report writes itself once on arrival
  }

  /* ---------- How it works: statements switch the pinned fragment ---------- */
  var frag = $('.how-frag');
  if (frag && 'IntersectionObserver' in window) {
    var steps = $$('.how-step');
    var so = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        steps.forEach(function (s) { s.classList.toggle('on', s === e.target); });
        frag.dataset.state = e.target.dataset.step;
      });
    }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });
    steps.forEach(function (s) { so.observe(s); });
  }

  /* ---------- Features: the command list ---------- */
  var cmd = $('#cmd');
  if (cmd) {
    var q = $('#cmd-q'), rows = $$('.cmd-row', cmd), none = $('.none', cmd);
    var visible = function () { return rows.filter(function (r) { return !r.parentNode.hidden; }); };
    var select = function (r) { rows.forEach(function (x) { if (x === r) x.setAttribute('aria-current', 'true'); else x.removeAttribute('aria-current'); }); };
    var hoverable = window.matchMedia('(hover: hover)').matches;
    rows.forEach(function (r) {
      if (hoverable) r.addEventListener('mouseenter', function () { select(r); });
      r.addEventListener('focus', function () { select(r); });
      r.addEventListener('click', function () { select(r); });
    });
    q.addEventListener('input', function () {
      var v = q.value.trim().toLowerCase();
      rows.forEach(function (r) { r.parentNode.hidden = v && r.textContent.toLowerCase().indexOf(v) < 0; });
      var vis = visible(); none.hidden = vis.length > 0;
      if (vis.length) select(vis[0]);
    });
    cmd.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
      var vis = visible(); if (!vis.length) return;
      var cur = vis.indexOf($('.cmd-row[aria-current="true"]', cmd));
      var nx = e.key === 'ArrowDown' ? Math.min(vis.length - 1, cur + 1) : Math.max(0, cur - 1);
      e.preventDefault(); select(vis[nx]);
      if (document.activeElement !== q) vis[nx].focus();
    });
  }

  /* ---------- Showcase: the note becomes the report ---------- */
  var note = $('#note');
  if (note) {
    var out = function (k) { return $('#n-report [data-k="' + k + '"]'); };
    var MISSING = 'Missing. QualiK asks the technician';
    var find = function (ss, re, skip) { for (var i = 0; i < ss.length; i++) { if (skip.indexOf(i) < 0 && re.test(ss[i])) return i; } return -1; };
    var parse = function () {
      var text = note.value.replace(/(\d)\.(\d)/g, '$1§$2');
      var ss = text.split(/[.!?\n]+/).map(function (s) { return s.replace(/§/g, '.').trim(); }).filter(Boolean);
      var used = [], r = {};
      var m = note.value.match(/\b(filler|wrapper|press|pump|conveyor|robot|capper|labell?er|palleti[sz]er|mixer|oven|compressor|line)\s*\d*/i);
      r.machine = m ? m[0].charAt(0).toUpperCase() + m[0].slice(1) : '';
      var take = function (re) { var i = find(ss, re, used); if (i < 0) return ''; used.push(i); return ss[i]; };
      var h = note.value.match(/(\d+(?:[.,]\d+)?)\s*(hours?|hrs?|h\b|minutes?|min\b)/i);
      r.hours = h ? h[1].replace(',', '.') + (/^m/i.test(h[2]) ? ' min' : ' h') : '';
      if (h) { var hi = find(ss, /\d\s*(hours?|hrs?|h\b|minutes?|min\b)/i, used); if (hi >= 0 && ss[hi].split(' ').length < 5) used.push(hi); }
      var p = take(/spare|part no|parts?:/i);
      r.parts = p ? p.replace(/^.*?(spare parts?|parts?)\s*:?\s*/i, '').replace(/^./, function (c) { return c.toUpperCase(); }) : '';
      r.outcome = take(/running|restart|working|solved|tested|back in|still|waiting for/i);
      r.action = take(/cleaned|replaced|changed|tightened|adjusted|reset|swapped|repaired|calibrated|repositioned|fitted/i);
      r.cause = take(/blocked|worn|broken|loose|because|due to|caused|leak|clogged|damaged|burnt|was |were /i);
      r.fault = take(/alarm|stopped|fault|error|jam|noise|trip|fail/i) || (ss[0] && used.indexOf(0) < 0 ? ss[0] : '');
      var miss = 0;
      ['machine', 'fault', 'cause', 'action', 'parts', 'hours', 'outcome'].forEach(function (k) {
        var el = out(k); if (!r[k]) miss++;
        el.textContent = r[k] || MISSING; el.className = r[k] ? '' : 'miss';
      });
      $('#n-note').textContent = miss ? miss + (miss === 1 ? ' field is' : ' fields are') + ' missing. QualiK asks while the technician is still at the machine.' : 'All seven fields filled. The technician confirms, the supervisor approves.';
      var st = $('#n-status'); st.className = 'pill ' + (miss ? 'warn' : 'ok'); st.innerHTML = '<i></i>' + (miss ? 'Draft' : 'Ready to confirm');
    };
    note.addEventListener('input', parse); parse();
  }

  /* ---------- Field: the chat fills the job report ---------- */
  var chat = $('#chat');
  if (chat) {
    var msgs = $$('.msg', chat), btn = $('#chat-next'), step = 0, timer;
    var LABELS = ['Send the photos', 'Send the voice note', 'Reply with the serial number', 'Start again'];
    var jd = function (k) { return $('#job [data-k="' + k + '"]'); };
    var doc = function (k, cls, t) { var e = $('#job [data-d="' + k + '"]'); e.className = 'pill ' + cls; e.innerHTML = '<i></i>' + t; };
    var FILL = {
      job: 'Heat pump maintenance', site: 'Via Roma 12, Treviso', system: 'Air-to-water heat pump, 8 kW',
      work: 'Cleaned outdoor coil, leak check on refrigerant circuit, no leak found', materials: 'Filter × 1', hours: '1.5 h'
    };
    var show = function (n) { msgs.forEach(function (m) { if (+m.dataset.at <= n) m.classList.add('show'); else m.classList.remove('show'); }); };
    var state = function (n, animate) {
      var set = animate ? type : function (el, t, cls) { el.className = cls || ''; el.textContent = t; };
      show(n);
      if (n === 0) {
        ['job', 'site', 'system', 'work', 'materials', 'hours', 'serial'].forEach(function (k) { set(jd(k), 'Waiting for the technician', 'wait'); });
        doc('report', '', 'Not started'); doc('fgas', '', 'Not started'); doc('logbook', '', 'Not started');
      }
      if (n === 1) { set(jd('system'), FILL.system); set(jd('site'), FILL.site); doc('report', 'warn', 'Drafting'); }
      if (n === 2) {
        ['job', 'work', 'materials', 'hours'].forEach(function (k) { set(jd(k), FILL[k]); });
        set(jd('serial'), 'Missing. Asked on WhatsApp', 'miss');
        doc('report', 'warn', '1 field missing'); doc('fgas', 'warn', 'Needs serial no.'); doc('logbook', 'warn', 'Drafting');
      }
      if (n === 3) {
        set(jd('serial'), '4471-22-0931');
        doc('report', 'ok', 'Ready for the office'); doc('fgas', 'ok', 'Data ready'); doc('logbook', 'ok', 'Update ready');
      }
      btn.textContent = LABELS[n];
    };
    var full = function () { state(1, false); state(2, false); state(3, false); };
    btn.addEventListener('click', function () {
      clearTimeout(timer);
      step = step >= 3 ? 0 : step + 1;
      if (step === 0) { state(0, false); return; }
      state(step, true);
    });
    if (reduce || !('IntersectionObserver' in window)) { step = 3; full(); }
    else {
      state(0, false);
      var played = false;
      new IntersectionObserver(function (es, o) {
        if (!es[0].isIntersecting || played) return;
        played = true; o.disconnect();
        var run = function () { if (step >= 3) return; step++; state(step, true); timer = setTimeout(run, 2300); };
        timer = setTimeout(run, 900);
      }, { threshold: 0.35 }).observe(chat);
    }
  }

  /* ---------- Field: trades ---------- */
  var tabs = $$('.trades [role="tab"]');
  if (tabs.length) {
    var pick = function (t) {
      tabs.forEach(function (x) {
        var on = x === t; x.setAttribute('aria-selected', on); x.tabIndex = on ? 0 : -1;
        document.getElementById(x.getAttribute('aria-controls')).hidden = !on;
      });
    };
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { pick(t); });
      t.addEventListener('keydown', function (e) {
        if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp' && e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        e.preventDefault();
        var n = (i + (e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length;
        pick(tabs[n]); tabs[n].focus();
      });
    });
  }

  /* ---------- Forms: mockup only, nothing is sent ---------- */
  $$('.contact form').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var done = $('.done', f);
      var bad = $$('[required]', f).filter(function (i) { return i.type === 'checkbox' ? !i.checked : !i.value.trim() || !i.checkValidity(); });
      done.hidden = false;
      if (bad.length) { done.textContent = 'Please fill in the required fields and tick the privacy box.'; bad[0].focus(); return; }
      var url = (window.QUALIK_FORMS || {})[f.elements.product.value];
      if (!url) { done.textContent = 'This form is not connected yet. Please try again soon.'; return; }
      done.textContent = 'Sending…';
      fetch(url, { method: 'POST', body: new FormData(f), headers: { Accept: 'application/json' } })
        .then(function (r) { if (!r.ok) throw 0; f.reset(); done.textContent = 'Thank you. We will reply shortly.'; })
        .catch(function () { done.textContent = 'Something went wrong. Please try again.'; });
    });
  });
})();

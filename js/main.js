/* =====================================================
   SOLARIS — Shared Interaction Logic
   DIT1262 Web Design Group Project
   ===================================================== */

(function () {
  'use strict';

  /* ---------- NAVBAR SCROLL ---------- */
  var navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', function () {
      navbar.classList.toggle('scrolled', window.scrollY > 16);
    }, { passive: true });
  }

  /* ---------- MOBILE DRAWER ---------- */
  var hamburger = document.getElementById('hamburger');
  var drawer    = document.getElementById('mobileDrawer');
  var overlay   = document.getElementById('mobileOverlay');

  function openMenu() {
    drawer.classList.add('open');
    overlay.classList.add('open');
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  function closeMenu() {
    drawer.classList.remove('open');
    overlay.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
  window.closeMenu = closeMenu;

  if (hamburger && drawer && overlay) {
    hamburger.addEventListener('click', function () {
      drawer.classList.contains('open') ? closeMenu() : openMenu();
    });
    overlay.addEventListener('click', closeMenu);
  }

  /* ---------- SCROLL REVEAL ---------- */
  if ('IntersectionObserver' in window) {
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('vis');
          revealObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.reveal, .reveal-l, .reveal-r, .reveal-up, .reveal-scale, .reveal-blur')
      .forEach(function (el) { revealObs.observe(el); });
  } else {
    document.querySelectorAll('.reveal, .reveal-l, .reveal-r, .reveal-up, .reveal-scale, .reveal-blur')
      .forEach(function (el) { el.classList.add('vis'); });
  }

  /* ---------- ANIMATED COUNTERS ---------- */
  function animateNumber(el) {
    var target   = parseFloat(el.dataset.target || '0');
    var prefix   = el.dataset.prefix || '';
    var suffix   = el.dataset.suffix || '';
    var decimals = parseInt(el.dataset.decimals || '0', 10);
    var duration = 1400;
    var start = performance.now();
    function step(now) {
      var p = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var v = target * eased;
      var display = decimals > 0
        ? v.toFixed(decimals)
        : Math.floor(v).toLocaleString();
      el.textContent = prefix + display + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window) {
    var counterObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        animateNumber(entry.target);
        counterObs.unobserve(entry.target);
      });
    }, { threshold: 0.4 });
    document.querySelectorAll('[data-target]')
      .forEach(function (el) { counterObs.observe(el); });
  }

  /* ---------- WINDMILL TOUCH TOGGLE ---------- */
  document.querySelectorAll('.windmill-stage').forEach(function (stage) {
    stage.addEventListener('click', function () {
      stage.classList.toggle('spinning');
    });
    stage.addEventListener('touchstart', function () {
      stage.classList.add('spinning');
    }, { passive: true });
  });

  /* ---------- CONTACT FORM (interactive validation) ---------- */
  var contactForm = document.getElementById('contactForm');
  if (contactForm) {
    var fields = [
      { id: 'cName',    err: 'errName',    rule: function (v) { return v.length >= 2; },
        msg: 'Please enter your full name (at least 2 characters).' },
      { id: 'cEmail',   err: 'errEmail',   rule: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); },
        msg: 'Please enter a valid email address.' },
      { id: 'cSubject', err: 'errSubject', rule: function (v) { return v.length > 0; },
        msg: 'Please choose a subject.' },
      { id: 'cMessage', err: 'errMessage', rule: function (v) { return v.length >= 10; },
        msg: 'Message must be at least 10 characters.' }
    ];

    function validateField(f, showError) {
      var input = document.getElementById(f.id);
      var errEl = document.getElementById(f.err);
      if (!input) return true;
      var value = input.value.trim();
      var ok = f.rule(value);
      if (ok) {
        input.classList.remove('is-error');
        input.classList.add('is-valid');
        if (errEl) errEl.classList.remove('show');
      } else {
        input.classList.remove('is-valid');
        if (showError) {
          input.classList.add('is-error');
          if (errEl) errEl.classList.add('show');
        }
      }
      return ok;
    }

    fields.forEach(function (f) {
      var input = document.getElementById(f.id);
      if (!input) return;
      input.addEventListener('blur', function () { validateField(f, true); });
      input.addEventListener('input', function () {
        if (input.classList.contains('is-error')) validateField(f, true);
      });
    });

    var sendBtn   = document.getElementById('sendBtn');
    var formMsg   = document.getElementById('formMessage');

    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var allOk = true;
      fields.forEach(function (f) { if (!validateField(f, true)) allOk = false; });
      if (!allOk) {
        var firstErr = contactForm.querySelector('.is-error');
        if (firstErr) firstErr.focus();
        return;
      }
      if (sendBtn) sendBtn.classList.add('is-sending');
      setTimeout(function () {
        if (sendBtn) sendBtn.classList.remove('is-sending');
        if (formMsg) {
          formMsg.classList.add('show');
          formMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        contactForm.reset();
        contactForm.querySelectorAll('.is-valid').forEach(function (el) {
          el.classList.remove('is-valid');
        });
        setTimeout(function () {
          if (formMsg) formMsg.classList.remove('show');
        }, 5000);
      }, 900);
    });
  }

  /* ---------- SOLAR CALCULATOR ---------- */
  var calcForm = document.getElementById('calcForm');
  if (calcForm) {
    var roofInput   = document.getElementById('roofSize');
    var sunInput    = document.getElementById('sunHours');
    var billInput   = document.getElementById('monthlyBill');
    var locationSel = document.getElementById('locationFactor');

    var roofVal = document.getElementById('roofVal');
    var sunVal  = document.getElementById('sunVal');
    var billVal = document.getElementById('billVal');

    var outKwh    = document.getElementById('outKwh');
    var outSavings= document.getElementById('outSavings');
    var outPanels = document.getElementById('outPanels');
    var outCO2    = document.getElementById('outCO2');

    function updateRangeFill(input) {
      var min = parseFloat(input.min);
      var max = parseFloat(input.max);
      var v = parseFloat(input.value);
      var pct = ((v - min) / (max - min)) * 100;
      input.style.setProperty('--p', pct + '%');
    }

    function recalc() {
      var roof = parseFloat(roofInput.value);
      var sun  = parseFloat(sunInput.value);
      var bill = parseFloat(billInput.value);
      var locFactor = parseFloat(locationSel.value);

      var panelArea = 1.7;
      var panels = Math.floor(roof / panelArea);
      var systemKw = panels * 0.4;
      var dailyKwh = systemKw * sun * locFactor;
      var monthlyKwh = dailyKwh * 30;
      var monthlySaving = Math.min(bill, monthlyKwh * 0.35);
      var co2 = monthlyKwh * 0.7;

      if (roofVal) roofVal.textContent = roof + ' m²';
      if (sunVal)  sunVal.textContent  = sun + ' hours';
      if (billVal) billVal.textContent = 'RM ' + bill;

      if (outKwh)     outKwh.textContent     = Math.round(monthlyKwh).toLocaleString();
      if (outSavings) outSavings.textContent = Math.round(monthlySaving).toLocaleString();
      if (outPanels)  outPanels.textContent  = panels;
      if (outCO2)     outCO2.textContent     = Math.round(co2).toLocaleString();

      updateRangeFill(roofInput);
      updateRangeFill(sunInput);
      updateRangeFill(billInput);
    }

    [roofInput, sunInput, billInput].forEach(function (i) {
      if (i) i.addEventListener('input', recalc);
    });
    if (locationSel) locationSel.addEventListener('change', recalc);
    recalc();
  }

  /* ---------- FAQ AUTO-CLOSE OTHERS (optional) ---------- */
  document.querySelectorAll('.faq-list').forEach(function (list) {
    list.addEventListener('toggle', function (e) {
      if (e.target.tagName !== 'DETAILS' || !e.target.open) return;
      list.querySelectorAll('details[open]').forEach(function (d) {
        if (d !== e.target) d.removeAttribute('open');
      });
    }, true);
  });

})();

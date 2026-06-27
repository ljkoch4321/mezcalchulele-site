/* ==========================================================================
   Chulele Artisanal Mezcal — shared site script (vanilla JS, no deps)
   Order of gates on every page:
     1) Age gate (cookie-based). GA4 must NOT fire until passed.
     2) Cookie-consent banner — appears only AFTER age gate.
     3) GA4 (G-HD2ZC291W8) loads only after age verified AND consent accepted.
   Also: Vimeo documentary modals, Mailchimp form wiring, footer year.
   ========================================================================== */
(function () {
  'use strict';

  var GA_ID = 'G-HD2ZC291W8';
  var AGE_COOKIE = 'chulele_age_ok';
  var CONSENT_COOKIE = 'chulele_consent'; // "accepted" | "declined"
  var USA_FLAG = '/assets/2023/10/usa-flag.png';

  /* ---------- cookie helpers ------------------------------------------- */
  function setCookie(name, value, days) {
    var d = new Date();
    d.setTime(d.getTime() + days * 864e5);
    document.cookie =
      name + '=' + encodeURIComponent(value) + ';expires=' + d.toUTCString() +
      ';path=/;SameSite=Lax' + (location.protocol === 'https:' ? ';Secure' : '');
  }
  function getCookie(name) {
    var m = document.cookie.match('(?:^|; )' + name + '=([^;]*)');
    return m ? decodeURIComponent(m[1]) : null;
  }

  /* ---------- GA4 (consent-gated) -------------------------------------- */
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  // Consent Mode v2 defaults — everything denied until the user opts in.
  gtag('consent', 'default', {
    ad_storage: 'denied', analytics_storage: 'denied',
    ad_user_data: 'denied', ad_personalization: 'denied',
    wait_for_update: 500
  });
  var gaLoaded = false;
  function loadGA() {
    if (gaLoaded) return;
    gaLoaded = true;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
    gtag('js', new Date());
    gtag('config', GA_ID, { anonymize_ip: true });
    gtag('consent', 'update', {
      analytics_storage: 'granted', ad_storage: 'granted',
      ad_user_data: 'granted', ad_personalization: 'granted'
    });
  }

  /* ---------- focus trap (shared by age gate + modal) ------------------ */
  function trapFocus(container) {
    var sel = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea,[tabindex]:not([tabindex="-1"])';
    function onKey(e) {
      if (e.key !== 'Tab') return;
      var f = container.querySelectorAll(sel);
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    container.addEventListener('keydown', onKey);
    return function () { container.removeEventListener('keydown', onKey); };
  }

  /* ---------- Age gate -------------------------------------------------- */
  function months() {
    return ['January','February','March','April','May','June','July',
            'August','September','October','November','December'];
  }
  function buildAgeGate() {
    var ov = document.createElement('div');
    ov.className = 'chulele-agegate';
    ov.setAttribute('role', 'dialog');
    ov.setAttribute('aria-modal', 'true');
    ov.setAttribute('aria-labelledby', 'agegate-title');
    var mOpts = '<option value="">Month</option>';
    months().forEach(function (m, i) { mOpts += '<option value="' + (i + 1) + '">' + m + '</option>'; });
    var dOpts = '<option value="">Day</option>';
    for (var d = 1; d <= 31; d++) dOpts += '<option value="' + d + '">' + d + '</option>';
    var thisYear = new Date().getFullYear();
    var yOpts = '<option value="">Year</option>';
    for (var y = thisYear; y >= thisYear - 100; y--) yOpts += '<option value="' + y + '">' + y + '</option>';
    ov.innerHTML =
      '<div class="chulele-agegate__box">' +
        '<img class="chulele-agegate__logo" src="/assets/2023/10/Logo.png" alt="Chulele Artisanal Mezcal" width="129" height="129">' +
        '<h2 id="agegate-title">Are you 21 or older?</h2>' +
        '<p>You must be of legal drinking age to enter Chulele Artisanal Mezcal.</p>' +
        '<form class="chulele-agegate__form" novalidate>' +
          '<div class="chulele-agegate__selects">' +
            '<select aria-label="Birth month" name="m" required>' + mOpts + '</select>' +
            '<select aria-label="Birth day" name="d" required>' + dOpts + '</select>' +
            '<select aria-label="Birth year" name="y" required>' + yOpts + '</select>' +
          '</div>' +
          '<img class="chulele-agegate__flag" src="' + USA_FLAG + '" alt="United States" width="40" height="26">' +
          '<p class="chulele-agegate__error" role="alert" hidden></p>' +
          '<button type="submit" class="chulele-agegate__btn">ENTER</button>' +
        '</form>' +
      '</div>';
    document.body.appendChild(ov);
    document.documentElement.classList.add('chulele-lock');
    var release = trapFocus(ov);
    var form = ov.querySelector('form');
    var err = ov.querySelector('.chulele-agegate__error');
    setTimeout(function () { ov.querySelector('select').focus(); }, 50);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var m = +form.m.value, d = +form.d.value, y = +form.y.value;
      if (!m || !d || !y) { return showErr('Please enter your full date of birth.'); }
      var dob = new Date(y, m - 1, d);
      if (dob.getMonth() !== m - 1 || dob.getDate() !== d) { return showErr('Please enter a valid date.'); }
      var age = ageFrom(dob);
      if (age < 21) { return showErr('You must be 21 or older to enter.'); }
      setCookie(AGE_COOKIE, '1', 365);
      release();
      ov.parentNode.removeChild(ov);
      document.documentElement.classList.remove('chulele-lock');
      maybeConsent();
    });
    function showErr(t) { err.textContent = t; err.hidden = false; }
  }
  function ageFrom(dob) {
    var t = new Date(), a = t.getFullYear() - dob.getFullYear();
    var mm = t.getMonth() - dob.getMonth();
    if (mm < 0 || (mm === 0 && t.getDate() < dob.getDate())) a--;
    return a;
  }

  /* ---------- Cookie consent banner ------------------------------------ */
  function buildConsent() {
    var b = document.createElement('div');
    b.className = 'chulele-consent';
    b.setAttribute('role', 'region');
    b.setAttribute('aria-label', 'Cookie consent');
    b.innerHTML =
      '<p class="chulele-consent__text">We use cookies to analyze site traffic and improve your experience. ' +
        'See our <a href="/privacy-policy/">Privacy Policy</a>.</p>' +
      '<div class="chulele-consent__actions">' +
        '<button type="button" class="chulele-consent__btn chulele-consent__btn--decline">Decline</button>' +
        '<button type="button" class="chulele-consent__btn chulele-consent__btn--accept">Accept</button>' +
      '</div>';
    document.body.appendChild(b);
    b.querySelector('.chulele-consent__btn--accept').addEventListener('click', function () {
      setCookie(CONSENT_COOKIE, 'accepted', 365); b.parentNode.removeChild(b); loadGA();
    });
    b.querySelector('.chulele-consent__btn--decline').addEventListener('click', function () {
      setCookie(CONSENT_COOKIE, 'declined', 365); b.parentNode.removeChild(b);
    });
  }
  function maybeConsent() {
    var c = getCookie(CONSENT_COOKIE);
    if (c === 'accepted') { loadGA(); return; }
    if (c === 'declined') return;
    buildConsent();
  }

  /* ---------- Vimeo documentary modal ---------------------------------- */
  function buildVideoModal() {
    var triggers = document.querySelectorAll('[data-vimeo]');
    if (!triggers.length) return;
    var modal = document.createElement('div');
    modal.className = 'chulele-vmodal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Documentary video');
    modal.hidden = true;
    modal.innerHTML =
      '<div class="chulele-vmodal__backdrop" data-close></div>' +
      '<div class="chulele-vmodal__inner">' +
        '<button type="button" class="chulele-vmodal__close" aria-label="Close video" data-close>&times;</button>' +
        '<div class="chulele-vmodal__frame"></div>' +
      '</div>';
    document.body.appendChild(modal);
    var frame = modal.querySelector('.chulele-vmodal__frame');
    var release = null, lastFocus = null;
    function open(id) {
      lastFocus = document.activeElement;
      frame.innerHTML = '<iframe src="https://player.vimeo.com/video/' + id +
        '?autoplay=1&title=0&byline=0&portrait=0" width="1280" height="720" frameborder="0" ' +
        'allow="autoplay; fullscreen; picture-in-picture" allowfullscreen title="Chulele documentary"></iframe>';
      modal.hidden = false;
      document.documentElement.classList.add('chulele-lock');
      release = trapFocus(modal);
      modal.querySelector('.chulele-vmodal__close').focus();
    }
    function close() {
      modal.hidden = true; frame.innerHTML = '';
      document.documentElement.classList.remove('chulele-lock');
      if (release) release();
      if (lastFocus) lastFocus.focus();
    }
    triggers.forEach(function (t) {
      t.addEventListener('click', function (e) { e.preventDefault(); open(t.getAttribute('data-vimeo')); });
    });
    modal.addEventListener('click', function (e) { if (e.target.hasAttribute('data-close')) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !modal.hidden) close(); });
  }

  /* ---------- Mailchimp form wiring ------------------------------------ */
  function postJSON(url, data) {
    return fetch(url, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
    }).then(function (r) { return r.json().then(function (j) { return { ok: r.ok, body: j }; }); });
  }
  function flash(form, msg, ok) {
    var n = form.querySelector('.chulele-formmsg');
    if (!n) { n = document.createElement('p'); n.className = 'chulele-formmsg'; form.appendChild(n); }
    n.textContent = msg; n.setAttribute('role', 'status');
    n.style.color = ok ? '#2e7d32' : '#c70057';
  }
  function wireForms() {
    // Footer email signup (Elementor form containing an email field).
    document.querySelectorAll('form.elementor-form').forEach(function (form) {
      if (form.hasAttribute('data-chulele-register')) return; // handled separately
      var email = form.querySelector('input[type="email"]');
      if (!email) return; // skip non-signup elementor forms
      form.setAttribute('novalidate', 'novalidate');
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        if (!email.value || email.value.indexOf('@') < 0) return flash(form, 'Please enter a valid email.', false);
        flash(form, 'Submitting…', true);
        postJSON('/api/subscribe', { email: email.value, source: 'footer' })
          .then(function (res) {
            flash(form, res.ok ? 'Thank you! You are subscribed.' : (res.body.message || 'Something went wrong.'), res.ok);
            if (res.ok) form.reset();
          })
          .catch(function () { flash(form, 'Network error. Please try again.', false); });
      });
    });
    // Registration form (Step 5) — identified by data-chulele-register.
    var reg = document.querySelector('form[data-chulele-register]');
    if (reg) {
      reg.setAttribute('novalidate', 'novalidate');
      reg.addEventListener('submit', function (e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        var data = {
          firstName: val(reg, 'first_name'), lastName: val(reg, 'last_name'),
          email: val(reg, 'email'), phone: val(reg, 'phone'), reason: val(reg, 'reason'), source: 'registration'
        };
        if (!data.email || data.email.indexOf('@') < 0) return flash(reg, 'Please enter a valid email.', false);
        flash(reg, 'Submitting…', true);
        postJSON('/api/register', data).then(function (res) {
          flash(reg, res.ok ? 'Welcome to the Chulele community!' : (res.body.message || 'Something went wrong.'), res.ok);
          if (res.ok) reg.reset();
        }).catch(function () { flash(reg, 'Network error. Please try again.', false); });
      });
    }
    function val(f, n) { var el = f.querySelector('[name="' + n + '"]'); return el ? el.value.trim() : ''; }
  }

  /* ---------- footer year ---------------------------------------------- */
  function setYear() {
    var el = document.getElementById('year');
    if (el) el.textContent = new Date().getFullYear();
  }

  /* ---------- boot ----------------------------------------------------- */
  function boot() {
    setYear();
    buildVideoModal();
    wireForms();
    if (getCookie(AGE_COOKIE)) { maybeConsent(); }
    else { buildAgeGate(); }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();

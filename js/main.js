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
    ov.innerHTML =
      '<div class="chulele-agegate__box">' +
        '<img class="chulele-agegate__logo" src="/assets/2023/10/Logo.png" alt="Chulele Artisanal Mezcal" width="129" height="129">' +
        '<h2 id="agegate-title">Are you 21 or older?</h2>' +
        '<p>You must be of legal drinking age to enter Chulele Artisanal Mezcal.</p>' +
        '<div class="chulele-agegate__yesno">' +
          '<button type="button" class="chulele-agegate__btn chulele-agegate__btn--yes">Yes</button>' +
          '<button type="button" class="chulele-agegate__btn chulele-agegate__btn--no">No</button>' +
        '</div>' +
        '<p class="chulele-agegate__deny" role="alert" hidden>Sorry — you must be of legal drinking age to enter.</p>' +
      '</div>';
    document.body.appendChild(ov);
    document.documentElement.classList.add('chulele-lock');
    var release = trapFocus(ov);
    var yes = ov.querySelector('.chulele-agegate__btn--yes');
    var no = ov.querySelector('.chulele-agegate__btn--no');
    setTimeout(function () { yes.focus(); }, 50);
    yes.addEventListener('click', function () {
      setCookie(AGE_COOKIE, '1', 365);
      release();
      ov.parentNode.removeChild(ov);
      document.documentElement.classList.remove('chulele-lock');
      maybeConsent();
    });
    no.addEventListener('click', function () {
      ov.querySelector('.chulele-agegate__yesno').hidden = true;
      ov.querySelector('.chulele-agegate__deny').hidden = false;
    });
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

  /* ---------- Navigation menu overlay (popup #165 replacement) ---------- */
  function wireMenu() {
    var menu = document.getElementById('chulele-menu');
    if (!menu) return;
    menu.setAttribute('role', 'dialog');
    menu.setAttribute('aria-modal', 'true');
    menu.setAttribute('aria-label', 'Site menu');
    var panel = menu.querySelector('.elementor-section');
    // Inject a close button (Elementor would normally provide the dialog close).
    var closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'chulele-menu__close';
    closeBtn.setAttribute('aria-label', 'Close menu');
    closeBtn.innerHTML = '&times;';
    menu.appendChild(closeBtn);
    var release = null, lastFocus = null;
    function openMenu(e) {
      if (e) { e.preventDefault(); e.stopPropagation(); }
      lastFocus = document.activeElement;
      menu.classList.add('is-open');
      document.documentElement.classList.add('chulele-lock');
      release = trapFocus(menu);
      closeBtn.focus();
    }
    function closeMenu() {
      menu.classList.remove('is-open');
      document.documentElement.classList.remove('chulele-lock');
      if (release) { release(); release = null; }
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }
    // Hamburger triggers: the original Elementor popup-open links.
    document.querySelectorAll('a[href*="elementor-action"]').forEach(function (t) {
      var href = t.getAttribute('href') || '';
      if (!/popup(%3A|:)open/i.test(href)) return; // only popup-open links
      t.addEventListener('click', openMenu, true);
    });
    closeBtn.addEventListener('click', closeMenu);
    // Click on the dark backdrop (outside the white panel) closes.
    menu.addEventListener('click', function (e) { if (e.target === menu) closeMenu(); });
    // Following any real nav link closes the overlay before navigating.
    menu.addEventListener('click', function (e) {
      var a = e.target.closest('a');
      if (a && a.getAttribute('href') && a.getAttribute('href').charAt(0) !== '#') closeMenu();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) closeMenu();
    });
  }

  /* ---------- Product-page effects (sticky column + RTL marquees) ------- */
  function wireProductEffects() {
    // Elementor "sticky_parent" sections: freeze the left column while the
    // right column scrolls. Driven by plain CSS position:sticky.
    document.querySelectorAll('[data-settings]').forEach(function (el) {
      var s = el.getAttribute('data-settings') || '';
      if (s.indexOf('"sticky":"top"') >= 0 && s.indexOf('sticky_parent') >= 0) {
        el.classList.add('chulele-sticky');
      }
    });
    // Carousels are wired on window 'load' (below), once Swiper has initialised
    // so we can cleanly destroy it before taking over.
  }

  /* ---------- Robust carousels (replace Swiper with native drag-scroll) -- */
  function wireCarousels() {
    document.querySelectorAll('.slider .swiper-container').forEach(function (cont) {
      if (cont.getAttribute('data-cc')) return;
      var wrap = cont.querySelector('.swiper-wrapper');
      if (!wrap) return;
      cont.setAttribute('data-cc', '1');
      // Tear down Swiper if it grabbed this container.
      try { if (cont.swiper && cont.swiper.destroy) cont.swiper.destroy(true, true); } catch (e) {}
      // Strip any inline transforms Swiper left on the wrapper/slides.
      wrap.style.transform = '';
      [].forEach.call(wrap.querySelectorAll('.swiper-slide'), function (s) { s.style.transform = ''; s.style.width = ''; });

      var bar = cont.querySelector('.swiper-scrollbar');
      var drag = bar ? bar.querySelector('.swiper-scrollbar-drag') : null;
      if (bar && !drag) { drag = document.createElement('div'); drag.className = 'swiper-scrollbar-drag'; bar.appendChild(drag); }

      function maxScroll() { return Math.max(0, wrap.scrollWidth - wrap.clientWidth); }
      function travel() { return bar && drag ? Math.max(0, bar.clientWidth - drag.offsetWidth) : 0; }
      function sync() {
        if (!bar || !drag) return;
        var ms = maxScroll();
        var ratio = ms > 0 ? wrap.scrollLeft / ms : 0;
        drag.style.left = (ratio * travel()) + 'px';
      }
      wrap.addEventListener('scroll', sync, { passive: true });
      window.addEventListener('resize', sync);
      sync();

      // Drag the slides directly.
      var down = false, sx = 0, sl = 0, moved = false;
      wrap.addEventListener('pointerdown', function (e) {
        down = true; moved = false; sx = e.clientX; sl = wrap.scrollLeft;
        wrap.classList.add('is-grabbing');
      });
      window.addEventListener('pointermove', function (e) {
        if (!down) return;
        var dx = e.clientX - sx;
        if (Math.abs(dx) > 3) moved = true;
        wrap.scrollLeft = sl - dx;
      });
      window.addEventListener('pointerup', function () { down = false; wrap.classList.remove('is-grabbing'); });
      // Swallow the click that ends a drag so slide links don't fire.
      wrap.addEventListener('click', function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);

      // Drag the scroll handle (and click the track to jump).
      if (bar && drag) {
        var dd = false, dsx = 0, dsl = 0;
        drag.addEventListener('pointerdown', function (e) {
          dd = true; dsx = e.clientX; dsl = parseFloat(drag.style.left) || 0;
          e.preventDefault(); e.stopPropagation();
        });
        window.addEventListener('pointermove', function (e) {
          if (!dd) return;
          var t = travel();
          var nl = Math.max(0, Math.min(t, dsl + (e.clientX - dsx)));
          wrap.scrollLeft = (t > 0 ? nl / t : 0) * maxScroll();
        });
        window.addEventListener('pointerup', function () { dd = false; });
        bar.addEventListener('pointerdown', function (e) {
          if (e.target === drag) return;
          var rect = bar.getBoundingClientRect();
          var t = travel();
          var nl = Math.max(0, Math.min(t, e.clientX - rect.left - drag.offsetWidth / 2));
          wrap.scrollLeft = (t > 0 ? nl / t : 0) * maxScroll();
        });
      }
    });
  }

  /* ---------- "Read more" expandable text (replaces inline jQuery) ------ */
  function wireReadMore() {
    function scopeOf(el) { return el.closest('.elementor-widget-container') || document; }
    document.querySelectorAll('.readmore-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var more = scopeOf(btn).querySelector('.read-more-text');
        if (more) more.style.display = 'block';
        btn.style.display = 'none';
      });
    });
    document.querySelectorAll('.readless-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var scope = scopeOf(btn);
        var more = scope.querySelector('.read-more-text');
        if (more) more.style.display = 'none';
        var rmb = scope.querySelector('.readmore-btn');
        if (rmb) rmb.style.display = '';
      });
    });
  }

  /* ---------- Timed release-signup popup (first visit) ----------------- */
  var SIGNUP_COOKIE = 'chulele_signup_seen';
  function maybeSignupPopup() {
    if (getCookie(SIGNUP_COOKIE)) return;
    var tries = 0;
    (function waitGate() {
      if (!document.querySelector('.chulele-agegate')) { setTimeout(showSignupPopup, 6000); }
      else if (tries++ < 240) { setTimeout(waitGate, 500); }
    })();
  }
  function showSignupPopup() {
    if (getCookie(SIGNUP_COOKIE) || document.querySelector('.chulele-signup')) return;
    setCookie(SIGNUP_COOKIE, '1', 180);
    var ov = document.createElement('div');
    ov.className = 'chulele-signup';
    ov.setAttribute('role', 'dialog');
    ov.setAttribute('aria-modal', 'true');
    ov.setAttribute('aria-label', 'Chulele release announcements');
    ov.innerHTML =
      '<div class="chulele-signup__backdrop" data-close></div>' +
      '<div class="chulele-signup__box">' +
        '<button type="button" class="chulele-signup__close" aria-label="Close" data-close>&times;</button>' +
        '<div class="chulele-signup__ey">Chulele&reg; Release Announcements</div>' +
        '<h2 class="chulele-signup__h">Sign up today</h2>' +
        '<p class="chulele-signup__p">We are working on our next exciting Chulele&reg; single-batch release. Be the first to know when these rare bottles are available.</p>' +
        '<form class="chulele-signup__form" novalidate>' +
          '<input type="email" class="chulele-signup__email" placeholder="Type your email" aria-label="Email" required>' +
          '<button type="submit" class="chulele-signup__submit">Submit</button>' +
        '</form>' +
        '<p class="chulele-signup__msg" role="status" hidden></p>' +
      '</div>';
    document.body.appendChild(ov);
    requestAnimationFrame(function () { ov.classList.add('is-open'); });
    var release = trapFocus(ov);
    function close() {
      ov.classList.remove('is-open');
      if (release) release();
      setTimeout(function () { if (ov.parentNode) ov.parentNode.removeChild(ov); }, 300);
    }
    ov.addEventListener('click', function (e) { if (e.target.hasAttribute('data-close')) close(); });
    document.addEventListener('keydown', function esc(e) { if (e.key === 'Escape') { close(); document.removeEventListener('keydown', esc); } });
    var form = ov.querySelector('form'), email = ov.querySelector('.chulele-signup__email'), msg = ov.querySelector('.chulele-signup__msg');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!email.value || email.value.indexOf('@') < 0) { msg.hidden = false; msg.style.color = '#ffd9ec'; msg.textContent = 'Please enter a valid email.'; return; }
      msg.hidden = false; msg.style.color = '#fff'; msg.textContent = 'Submitting…';
      postJSON('/api/subscribe', { email: email.value, source: 'popup' }).then(function (res) {
        msg.textContent = res.ok ? 'Thank you! You are on the list.' : (res.body.message || 'Something went wrong.');
        if (res.ok) { form.reset(); setTimeout(close, 1600); }
      }).catch(function () { msg.textContent = 'Network error. Please try again.'; });
    });
  }

  /* ---------- "Shop Chulele Merch" button (menu + footer) -------------- */
  function wireMerch() {
    var URL = 'https://chulele.printify.me/';
    function makeBtn() {
      var a = document.createElement('a');
      a.className = 'chulele-merch-link';
      a.href = URL; a.target = '_blank'; a.rel = 'noopener';
      a.textContent = 'SHOP CHULELE MERCH';
      return a;
    }
    // Menu: after the last nav link, before the social row.
    var menu = document.getElementById('chulele-menu');
    if (menu && !menu.querySelector('.chulele-merch-link')) {
      var wrap = document.createElement('div');
      wrap.className = 'chulele-merch-menu';
      wrap.appendChild(makeBtn());
      var linkHeadings = [].filter.call(menu.querySelectorAll('.elementor-widget-heading'),
        function (h) { return h.querySelector('a[href^="/"]'); });
      var anchor = linkHeadings[linkHeadings.length - 1];
      if (anchor) anchor.parentNode.insertBefore(wrap, anchor.nextSibling);
      else (menu.querySelector('.elementor-section') || menu).appendChild(wrap);
    }
    // Footer: a centred button banner at the top of the footer. Only the main
    // content footer (5940) — NOT the empty home footer (6124), which would add
    // height and make the single-screen home page scroll.
    var footer = document.querySelector('.elementor-location-footer.elementor-5940');
    if (footer && !footer.querySelector('.chulele-merch-link')) {
      var fwrap = document.createElement('div');
      fwrap.className = 'chulele-merch-footer';
      fwrap.appendChild(makeBtn());
      footer.insertBefore(fwrap, footer.firstChild);
    }
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
    wireMenu();
    wireProductEffects();
    wireReadMore();
    wireMerch();
    if (document.querySelector('.slider .swiper-container')) {
      if (document.readyState === 'complete') wireCarousels();
      else window.addEventListener('load', wireCarousels);
      // Safety re-run in case Swiper initialises slightly after window load.
      setTimeout(wireCarousels, 1200);
    }
    if (getCookie(AGE_COOKIE)) { maybeConsent(); }
    else { buildAgeGate(); }
    maybeSignupPopup();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();

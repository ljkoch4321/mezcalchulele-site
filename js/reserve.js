/* Reserve-list signup handler.
   Lives in an external file because the site CSP (script-src 'self' ...) blocks
   inline <script> and inline on*= handlers. Loaded with `defer`, so the DOM is
   ready when this runs. */
document.documentElement.classList.add('js');

/* One authored motion: below-fold sections rise + de-blur as they enter view.
   The hidden default lives behind html.js + prefers-reduced-motion in CSS, so
   this only ever reveals content — it never hides it from no-JS visitors. */
(function () {
  var els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  if (!('IntersectionObserver' in window)) {
    els.forEach(function (el) { el.classList.add('in'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
  els.forEach(function (el) { io.observe(el); });
})();

/* Bottle levitation gate: mark each release art as .inview only while it is on
   screen, so the CSS float animation pauses when scrolled away (and never wastes
   work offscreen). CSS keeps it off entirely under prefers-reduced-motion. */
(function () {
  var arts = document.querySelectorAll('.rel .art');
  if (!arts.length) return;
  if (!('IntersectionObserver' in window)) {
    arts.forEach(function (a) { a.classList.add('inview'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) { en.target.classList.toggle('inview', en.isIntersecting); });
  }, { threshold: 0.15 });
  arts.forEach(function (a) { io.observe(a); });
})();

(function () {
  var form = document.getElementById('f');
  if (!form) return;

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    var btn = document.getElementById('rbtn');
    var err = document.getElementById('rerr');
    if (err) err.textContent = '';
    if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }

    function fail(msg) {
      if (err) { err.textContent = msg; err.classList.add('show'); }
      if (btn) { btn.disabled = false; btn.textContent = 'Join the reserve'; }
    }

    try {
      var r = await fetch('/api/reserve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: document.getElementById('rname').value,
          email: document.getElementById('remail').value,
          company: document.getElementById('rhp').value,
          variant: (document.cookie.match(/(?:^|;\s*)ab=([^;]+)/) || [])[1] || ''
        })
      });
      var d = await r.json().catch(function () { return {}; });
      if (r.ok && d.ok !== false) {
        form.style.display = 'none';
        var thanks = document.getElementById('thanks');
        if (thanks) thanks.classList.add('show');
      } else {
        fail(d.message || 'Something went wrong. Please try again.');
      }
    } catch (_) {
      fail('Network error. Please try again.');
    }
  });
})();

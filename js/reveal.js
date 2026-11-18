/* Generic scroll-reveal: below-fold elements marked .reveal rise + de-blur as
   they enter view. External file because the site CSP blocks inline scripts.
   The hidden default is gated behind html.js + prefers-reduced-motion in CSS,
   so this only ever reveals content — no-JS / reduced-motion always see it. */
document.documentElement.classList.add('js');
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

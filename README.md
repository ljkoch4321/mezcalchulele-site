# mezcalchulele.com — static rebuild

A pixel-faithful static rebuild of **mezcalchulele.com**, replacing a
compromised WordPress/Elementor install (active Thai-gambling spam at
`/css/?page=*` and Japanese-marketplace spam at `/shopdetail/*`). Moving to
static HTML on Cloudflare Pages eliminates the server-side attack surface.

Approach: **faithful sanitized mirror** — the original Elementor markup and CSS
are preserved for exact visual fidelity, with all malware / WordPress /
tracking / CookieYes cruft stripped, every asset localized off `/wp-content/`,
and the required additions (age gate, GDPR cookie consent, consent-gated GA4,
Vimeo modals, Mailchimp, SEO, security headers, redirects) layered on top.

## Layout

```
/                       built pages (index.html per route)
/product/...            product pages (Vimeo hero + WATCH THE STORY modal)
/mezcal-memoirs/...     blog index (+ /page/2..6) and 36 posts
/media/...              named secure download routes + 6 branded galleries
/assets/                all images, fonts, mirrored CSS/JS (year/month for uploads)
/assets/downloads/      secure PDFs/media (served ONLY via /media/* named routes)
/css/style.css          overlay components (age gate, consent, modal) + print
/js/main.js             age gate, consent, GA4 gating, Vimeo modal, Mailchimp wiring
/functions/api/         Cloudflare Pages Functions: subscribe.js, register.js
_redirects _headers     Cloudflare config (410s, named routes, 301s, CSP, cache)
robots.txt sitemap.xml  SEO
feed/index.xml          RSS (36 posts)
404.html og-default.jpg favicons
_tools/ _capture/       local build tooling + raw crawl (gitignored, NOT deployed)
```

The site is plain HTML/CSS/JS — no build step is needed to deploy. `_tools/`
(the crawler/mirror/build scripts) and `_capture/` (raw captures) are gitignored
and never published. To regenerate after editing the transform:
`node _tools/build.js && node _tools/gen-extras.js`.

## Environment variables (Cloudflare Pages → Settings → Environment variables)

| Var | Purpose |
|-----|---------|
| `MAILCHIMP_API_KEY` | Mailchimp API key (`...-usXX`). Server-side only. |
| `MAILCHIMP_AUDIENCE_ID` | Mailchimp audience/list ID. |

GA4 (`G-HD2ZC291W8`, extracted from the live site) is hard-wired in
`js/main.js`, loaded only **after** age verification **and** cookie consent.
Both Mailchimp forms (footer signup + `/registration-page/`) POST to the Pages
Functions, which read the vars above — credentials are never in the client.

## Deploy

1. Create GitHub repo `mezcalchulele-site`, push this directory.
2. Cloudflare → Pages → Connect to Git → select the repo.
   - Framework preset: **None**. Build command: *(empty)*. Output dir: `/`.
3. Add the two `MAILCHIMP_*` env vars (Production + Preview).
4. Deploy → staging URL `mezcalchulele-site.pages.dev`.
5. **Test on staging before touching DNS** (see checklist). Do NOT cut DNS over
   until the client confirms staging is correct.
6. DNS cutover: point `mezcalchulele.com` at Cloudflare Pages.
   **Preserve the Zoho MX records** (`mx.zoho.com`, `mx2`, `mx3`) so
   `info@mezcalchulele.com` email keeps working.

## Known caveats / staging notes

- **Vimeo background + documentary videos** are domain-privacy restricted to
  `mezcalchulele.com`. They return HTTP 401 on `localhost` and may 401 on
  `*.pages.dev` until the client whitelists the staging domain in the Vimeo
  account (Settings → Privacy → "Where can this be embedded"). Verify the 4
  embeds on staging; whitelist pages.dev if needed.
- **Faithful-mirror tradeoffs** (per the chosen approach): pages keep the
  original Elementor heading structure (some have multiple `<h1>`), and styling
  is delivered via the mirrored Elementor CSS rather than a single minified
  stylesheet. This favors exact visual fidelity over the one-h1 / single-css SEO
  ideals.
- `/product/guelaguetza-2022/` production-notes dates are replicated as-is from
  the live site (they show Día de los Muertos Oct/Nov dates). An HTML comment
  `CONTENT BUG: ... verify with client before launch` flags this in the source.
- 5 blog posts share near-identical meta descriptions (derived from shared
  intro paragraphs). Cosmetic; can be hand-tuned if desired.

## Post-launch checklist (from the brief)

- [ ] Verify GA4 traffic on staging (accept age gate + cookie consent first).
- [ ] Verify all 4 Vimeo embeds play on staging.
- [ ] Test all PDF downloads via `/media/*` named routes (Content-Disposition).
- [ ] Test age gate across Chrome, Safari, Firefox, mobile.
- [ ] Test footer signup + registration form submit to Mailchimp.
- [ ] Confirm `/css/?page=...` and `/shopdetail/...` return **410** on Cloudflare.
- [ ] Submit `/sitemap.xml` to Google Search Console.
- [ ] Run all 301 redirects through a redirect checker.
- [ ] Begin Google URL Removal for the spam `/css/` and `/shopdetail/` paths;
      check Search Console Security & Manual Actions; file reconsideration.
- [ ] Monitor Search Console for crawl errors 48h post-launch; watch 30 days
      for spam URLs dropping from the index.

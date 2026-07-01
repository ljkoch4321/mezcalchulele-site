# Held in Reserve — Campaign Package

Everything for the "Held in Reserve" exclusivity push: A/B mockups, the reserve landing page, and traffic content. Nothing here is linked from the live site (mockups are `noindex`); flip the flags noted below at launch.

## 1. Design mockups (open in browser)
| File | What it is |
|---|---|
| `../mockup-reserve-ab-matrix.html` | **A/B matrix** — visual treatments × copy options (Seal, Plaque, Vertical Spine, Text Lockup), each with wording A ("Held in Reserve") and B ("Reserved for a future release"). Pick a winning cell. |
| `../mockup-reserve-refined.html` | The two front-runners (Seal + Plaque), medal-free bottle, refined. |
| `../mockup-reserve-landing.html` | **The `/reserve` landing page** — hero, limited-windows strip, all THREE releases (Joven, Guelaguetza, Añejo), reserve-list capture. Brand Akrobat type + batch stamps. SEO-ready. |
| `../mockup-product-anejo.html` | **Añejo product page** (`/product/dia-de-muertos-anejo/`) — the barrel-aging story, harvest→release timeline, specs, reserve CTA. |
| `../mockup-dia-de-los-muertos-allocation-v2.html` | Reference: the subtle product-page direction. |

## 2. Traffic content (this folder)
| File | Type | Target keyword | Funnels to |
|---|---|---|---|
| `blog-what-single-batch-means.md` | SEO blog (top funnel) | "what is single batch mezcal" | /reserve |
| `blog-why-held-in-reserve.md` | SEO blog (brand) | "limited edition mezcal" / "allocation" | /reserve + list |
| `blog-dia-de-los-muertos-2022.md` | SEO blog (product/cultural) | "día de los muertos mezcal" | /product/dia-de-muertos-2022 |
| `blog-guelaguetza-2022.md` | SEO blog (product/cultural) | "guelaguetza mezcal oaxaca" | /product/guelaguetza-2022 |
| `blog-anejo-still-aging.md` | SEO blog (product/aging) | "añejo mezcal" / "barrel aged mezcal" | /product/dia-de-muertos-anejo |
| `email-reserve-announcement.md` | Newsletter | — | /reserve |
| `social-teasers.md` | Instagram + story copy | — | link in bio → /reserve |

## 3. Internal-linking plan (do this when posts go live)
- Every blog post links once to **/reserve** with anchor text "held in reserve" or "the reserve list."
- The two cultural posts also link to their product page.
- The `/reserve` page links back out to both product pages (already wired).
- Homepage reserve treatment (chosen A/B cell) links to **/reserve**.

## 4. Launch checklist
- [ ] Pick the A/B winning cell (treatment + copy).
- [ ] Build chosen treatment into `index.html` (replaces both BUY-NOW graphics).
- [ ] Publish `/reserve/` (remove `noindex`, set canonical, add to `sitemap.xml` + nav).
- [ ] Wire the reserve-list form to a real endpoint (newsletter/ESP).
- [ ] Publish the 4 posts; apply internal links above.
- [ ] Send the announcement email; schedule social.

# SEO deployment and indexing

The production origin currently defaults to `https://midlleeast-qa.vercel.app`.
Before switching to the firm's connected custom domain, set `NEXT_PUBLIC_SITE_URL`
to its HTTPS origin (for example `https://middleeast-qa.com`) and rebuild.
Canonical URLs, sitemap, Open Graph URLs and JSON-LD all use the same setting.
Do not point the canonical URL at the existing original website before replacing it.

- Public routes: `/`, `/team`, and six `/services/[slug]` pages.
- `/sitemap.xml` lists only these canonical pages. It does not invent modification dates.
- `/robots.txt` allows production crawling and advertises the sitemap.
- Vercel preview builds use `noindex` and disallow crawling. Set `SEO_NOINDEX=true`
  for any separate public staging build. Keep the Sites review copy private.
- Optional `GOOGLE_SITE_VERIFICATION` holds the Search Console meta verification token.
  Leave unset until the real token is provided. It is not an analytics identifier.
- Organization, service and breadcrumb JSON-LD describe real, visible content.
  No founder, reviews, ratings, opening hours or coordinates have been fabricated.
- Team photographs use WebP, responsive sources, intrinsic dimensions and lazy loading.
  Original PNGs remain available as source assets. Card design and team order are preserved.

## After the final domain is connected

1. Verify domain ownership in Google Search Console and submit `/sitemap.xml`.
2. Inspect the home page and a service page; request indexing and review crawl reports.
3. Validate structured data with Google's Rich Results Test.
4. Match the firm's real name, address and phone in its verified Google Business Profile.
5. When replacing the old site, map real old URLs to relevant new URLs with permanent
   redirects. Inventory the old URLs first; do not redirect every unknown page to `/`.
6. Measure PageSpeed/Core Web Vitals on the public production deployment. Build checks
   and image byte savings alone do not establish a Lighthouse score or rankings.

Search Console and Google Business Profile setup require access to the firm's accounts.
Search visibility depends on useful content, competition, local signals, links and ongoing
monitoring; no first-place or rich-result guarantee is implied by the implementation.

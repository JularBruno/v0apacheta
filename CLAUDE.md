# Apacheta

Spanish-language (es_AR) personal-finance app for Argentina. Next.js App Router, Tailwind, pnpm.

## Blog and tools pages: SEO requirements

Applies to every generated page under `/blog/<slug>` and `/herramientas/<slug>`, and to their index pages. The plan is to extend these rules to every public page later.

- **Metadata:** build it with `generateMetadata` from the page's `meta` object. Set a canonical URL, `es_AR` OpenGraph (`type: "article"` for posts), and a Twitter card. Don't set `<title>` inside the shell. Use the title template `%s | Apacheta`.
- **Structured data (JSON-LD):** emit `Article` for posts, and `WebApplication` for tools. Add `FAQPage` whenever the page has an FAQ block. Add `BreadcrumbList` on every page. The shell emits all of these from `meta` and the template's sections, so individual pages don't hand-write them.
- **Semantic markup:** use exactly one `<h1>` (the title), `<h2>` for sections, the body in `<article>`, the sidebar in `<aside>`, and visible breadcrumbs (`Inicio > Blog|Herramientas > Título`).
- **Rendering:** the page must be fully static (`export const dynamic = "force-static"`). All explanatory text must be in server-rendered HTML. Interactive widgets on tool pages are client components embedded in the server-rendered page, and they must not be the only place the content lives.
- **Freshness:** show a visible "Actualizado el <fecha>" date (`updatedAt ?? publishedAt`). Economics data goes stale, so update `updatedAt` whenever figures change.
- **Internal links:** related posts and tools in the sidebar must be real `<a href>` links (`next/link`), not click handlers.
- **Discovery:** every page must be registered in `lib/content/registry.ts`. The sitemap derives from the registry. `robots.ts` must allow `/blog`, `/herramientas` and `/donaciones`.
- **Header blurb:** keep the fixed "published on Apacheta" blurb short, and keep it outside the `<h1>` and `<article>` content.
- **Language:** write titles, descriptions and body in Argentine Spanish. Keep each `description` at 155 characters or fewer, and each title at 60 characters or fewer.

# Apacheta

Spanish-language (es_AR) personal-finance app for Argentina. Next.js App Router, Tailwind, pnpm.

## Blog and tools pages: SEO requirements

Applies to every generated page under `/blog/<slug>` and `/herramientas/<slug>`, and to their index pages. The plan is to extend these rules to every public page later.

- **Metadata:** build it with `generateMetadata` from the page's `meta` object. Set a canonical URL, `es_AR` OpenGraph (`type: "article"` for posts), and a Twitter card. Don't set `<title>` inside the shell. Use the title template `%s | Apacheta`.
- **Structured data (JSON-LD):** emit `Article` for posts, and `WebApplication` for tools. Add `FAQPage` whenever the page has an FAQ block. Add `BreadcrumbList` on every page. The shell emits all of these from `meta` and the template's sections, so individual pages don't hand-write them.
- **Semantic markup:** use exactly one `<h1>` (the title), `<h2>` for sections, the body in `<article>`, the sidebar in `<aside>`, and visible breadcrumbs (`Inicio > Cuadernito|Herramientas > Título`). The blog's public name is "Cuadernito"; its URLs stay under `/blog`.
- **Rendering:** the page must be fully static (`export const dynamic = "force-static"`). All explanatory text must be in server-rendered HTML. Interactive widgets on tool pages are client components embedded in the server-rendered page, and they must not be the only place the content lives.
- **Freshness:** show a visible "Actualizado el <fecha>" date (`updatedAt ?? publishedAt`). Economics data goes stale, so update `updatedAt` whenever figures change.
- **Internal links:** related posts and tools in the sidebar must be real `<a href>` links (`next/link`), not click handlers.
- **Discovery:** every page must be registered in `lib/content/registry.ts`. The sitemap derives from the registry. `robots.ts` must allow `/blog`, `/herramientas` and `/donaciones`.
- **Header blurb:** keep the fixed "published on Apacheta" blurb short, and keep it outside the `<h1>` and `<article>` content.
- **Language:** write titles, descriptions and body in Argentine Spanish. Keep each `description` at 155 characters or fewer, and each title at 60 characters or fewer.

## Adding a blog post or tool

1. Create `app/blog/<slug>/` (or `app/herramientas/<slug>/`) with `meta.ts` exporting `meta: ContentMeta` (see `lib/content/types.ts`).
2. Write `page.tsx` from `components/content/starters/economics-topic.starter.tsx`: `export const dynamic = "force-static"`, `generateMetadata() { return buildMetadata(meta) }`, and a body wrapped in `<ContentShell meta={meta} seo={seo}>`. The body layout is free-form. Use `<h2>` and below (the shell owns the `<h1>`), and blocks from `@/components/content/blocks` as needed.
3. Register it in `lib/content/registry.ts`: add the import at `// [registry:imports]` and the entry at `// [registry:entries]`.
4. Run `pnpm exec jest lib/content components/content __tests__/content-pages-guardrail.test.ts`. The registry validates at import, and the guardrail test checks the page rules above.
5. Commit and push. Publishing is a deploy.

Never run `next dev` or `next build` from an agent session here: a second process corrupts the user's `.next`.

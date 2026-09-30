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
- **Header:** every page opens with `ApachetaHeader`, a compact landing-style map built from the landing's own pieces (`components/camino`: parchment ground, `Scenery`, `useTrail`; no milestone art). It is sized so the name, the whole trail, the breadcrumbs and the page title fit on one screen. It names Apacheta (type, not a heading) with the hosting line, then a trail with three tiny cairn stations (left, right, left), each card just a short title and one button: "Comenzá tu camino" (`/onboarding`), "Ver redes" (jumps to `#comunidad`, the Comunidad section at the bottom of every page, which holds the social links from `lib/content/community.ts`; a channel without a url shows as "Próximamente"), and the donation button (`/donaciones`). The page content follows. It adds no headings and no `<article>` elements (the page's `<h1>` stays the first heading) and its cards are visible from the first render (links in the server HTML, no JS needed). Donation CTAs live in the header and in the desktop sidebar only, never at the bottom of a page.
- **Language:** write titles, descriptions and body in Argentine Spanish. Keep each `description` at 155 characters or fewer, and each title at 60 characters or fewer.

## Blog and tools pages: security requirements

Enforced by `__tests__/content-security-guardrail.test.ts` (rules live in `lib/content/__fixtures__/security-rules.ts`) over the public surface: `app/blog`, `app/herramientas`, `app/donaciones`, `components/content`, `components/donations/public-donations.tsx`, `lib/content`. Comments are ignored; code is scanned. To add a rule: add it to the rules file, add a bad sample to the test, add a line here.

- **No raw HTML injection:** no `dangerouslySetInnerHTML`, `innerHTML`, `outerHTML`, `insertAdjacentHTML` or `document.write`. The single exception is the JSON-LD `<script>` in `components/content/json-ld.tsx`.
- **JSON-LD is always escaped:** `json-ld.tsx` must serialize through `serializeJsonLd` (escapes `<`, so content can never close the script tag).
- **No inline `<script>`** anywhere else, and no `<iframe>` (add a `sandbox` plus an origin allowlist before enabling embeds).
- **No dynamic code:** no `eval()` or `new Function()`.
- **External links:** every `target="_blank"` carries `rel="noopener noreferrer"`.
- **https only:** no `http://` URLs (localhost excepted), and `seo.sources` URLs must be `https://` (enforced by the schema). No `javascript:`, `vbscript:` or `data:text/html` URLs.
- **Public means public:** content pages never import auth, server actions (`@/lib/actions`), HTTP clients (`@/lib/http`) or dashboard code, and never declare `"use server"`.
- **No secrets:** no `process.env` in the public surface.
- **Code samples live in `*.snippets.ts`:** a post that teaches code (service workers, fetch, env vars...) keeps each sample in `<slug>/<name>.snippets.ts`, only as `export const NAME = \`...\`` plain strings (no imports, calls or `${}`), and shows it with the `CodeBlock` block. Snippets files are exempt from the prose-style rules above but are still checked for `http://` and `javascript:` URLs, and a non-inert snippets file fails the build.
- **Static pages:** posts and shared components fetch nothing at runtime (`fetch`, `axios`, `useSWR`, `useQuery` are flagged). Tool widgets under `app/herramientas` may fetch, for example live exchange rates; validate and never trust the response.

Not covered by tests (do these by hand when relevant): response headers and CSP, rate limiting for any future API route, and moderation if a community feature ever accepts user input.

## Adding a blog post or tool

1. Create `app/blog/<slug>/` (or `app/herramientas/<slug>/`) with `meta.ts` exporting `meta: ContentMeta` (see `lib/content/types.ts`).
2. Write `page.tsx` from `components/content/starters/economics-topic.starter.tsx`: `export const dynamic = "force-static"`, `generateMetadata() { return buildMetadata(meta) }`, and a body wrapped in `<ContentShell meta={meta} seo={seo}>`. The body layout is free-form. Use `<h2>` and below (the shell owns the `<h1>`), and blocks from `@/components/content/blocks` as needed.
3. Register it in `lib/content/registry.ts`: add the import at `// [registry:imports]` and the entry at `// [registry:entries]`.
4. Run `pnpm exec jest lib/content components/content __tests__/content-pages-guardrail.test.ts`. The registry validates at import, and the guardrail test checks the page rules above.
5. Commit and push. Publishing is a deploy.

Never run `next dev` or `next build` from an agent session here: a second process corrupts the user's `.next`.

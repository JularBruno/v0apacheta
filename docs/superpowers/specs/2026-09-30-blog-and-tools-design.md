# Blog and tools: content model, routing, shell, economics-topic template

Status: approved.

## Intent

Public, SEO-driven content inside the Apacheta app (Spanish, es_AR): a blog (`/blog`) and standalone tools (`/herramientas`), such as an inflation calculator or a dollar-blue converter. The content promotes Apacheta and funnels readers to a public donations page.

Every page, post or tool, must have:
1. A header blurb saying the page is hosted by the Apacheta app.
2. A sidebar with recommendations (related posts and tools).
3. A CTA to donate.

Page bodies are generated programmatically, but **each page has its own custom layout**. Publishing means committing a page file and pushing to prod. No DB, no runtime content fetching.

Success criteria:
- A generated page cannot ship without the blurb, sidebar, CTA, disclaimer or SEO markup.
- A page's body layout is unconstrained.
- Pages are fully static and indexable, following the SEO rules in `CLAUDE.md`.

## Naming

The blog's public name is **Cuadernito** (breadcrumbs, index title, nav links). Its URL space, folders and registry `kind: "post"` keep the `/blog` and "post" naming. The landing drawer and the dashboard sidebar ("Herramientas" group) link to it.

## Non-goals

- A `tool` page template (the shell supports `kind: "tool"`, but the tool template is a later spec).
- Templates for the "apacheta updates" and "random" categories (they can use the shell and the economics block kit until they get their own).
- The generator script or prompt itself. This spec defines the starter that it will use.
- MDX, a DB, a CMS, or runtime content fetching.
- Refactoring `/dashboard/donaciones`.

## Routing

| Route | Purpose |
|---|---|
| `/blog` | "Cuadernito" index of posts, grouped by category (economía, apacheta, random) |
| `/blog/<slug>` | One folder per post: `app/blog/<slug>/page.tsx` |
| `/herramientas` | Index of tools |
| `/herramientas/<slug>` | One folder per tool: `app/herramientas/<slug>/page.tsx` |
| `/donaciones` | New public donations page |

`middleware.ts` doesn't match these paths, so they're public without changes. `robots.ts` already allows `/blog`; it needs `/herramientas` and `/donaciones` added.

## Content model

One registry for posts and tools, `lib/content/registry.ts`, because the sidebar crosses kinds.

```ts
type ContentKind = "post" | "tool"
type BlogCategory = "economia" | "apacheta" | "random"   // posts only

interface ContentMeta {
  slug: string
  kind: ContentKind
  title: string                // <= 60 chars
  description: string          // <= 155 chars, also the meta description
  publishedAt: string          // ISO date
  updatedAt?: string           // ISO date
  category?: BlogCategory      // required when kind === "post"
  tags: string[]               // drives related-content scoring
  pinnedRelated?: string[]     // optional manual slugs, shown first
  cover?: string               // path under /public
}
```

- The URL is derived from `kind` and `slug`, never stored.
- Each post or tool folder has a `meta.ts` exporting `meta: ContentMeta`, next to its `page.tsx`. The page uses it for `generateMetadata` and passes it to the shell.
- The registry has one import line per entry. The generator emits the folder and adds that line.
- Slugs are unique across kinds within the registry. A zod schema validates every `meta`.

### Related content

`getRelated(currentSlug)` is a pure function:
1. Pinned slugs first.
2. Then the rest, scored by tag overlap, then same category, then recency.
3. The sidebar shows two groups, "Herramientas relacionadas" (up to 2) and "Artículos relacionados" (up to 3). Each group falls back to the most recent items when nothing matches, so it's never empty. The current page is excluded.

## ContentShell (mandatory, fixed)

```tsx
<ContentShell meta={meta} seo={{ summary, faq, sources }}>
  {/* free-form page body */}
</ContentShell>
```

The shell renders:
- **Trail header:** `ApachetaHeader`, a compact landing-style map reusing the landing's pieces (`components/camino`: parchment ground, `Scenery`, `useTrail`; no milestone art), sized so the name, the whole trail, the breadcrumbs and the page title fit one screen. It names Apacheta with the hosting line ("Este artículo/herramienta está publicado/a en Apacheta, la app de finanzas personales para Argentina"), then a dashed trail through three tiny cairn stations (left, right, left), each card just a short title and one button: **Comenzá tu camino** to `/onboarding`; **Ver redes**, which jumps to `#comunidad` (the Comunidad section at the bottom of every page; with no channels configured it shows "Próximamente" instead of a dead anchor); and **Doná a Apacheta** to `/donaciones`. Cards are visible from the first render, it adds no headings and no `<article>`, and it sits before the breadcrumbs and `<h1>`. The page content follows.
- **Comunidad section:** rendered after the article on every post/tool page (and on the Cuadernito index), with the Discord, Instagram and YouTube links from `lib/content/community.ts`. It is the target of the header's "Ver redes" link.
- **Breadcrumbs:** visible, `Inicio > Cuadernito|Herramientas > Título`, with `BreadcrumbList` JSON-LD.
- **`<h1>`** from `meta.title`, with "Publicado" and "Actualizado el …" dates. Page bodies use `<h2>` and below.
- **`<article>`** wrapping `children`.
- **`<aside>`** with the related-content sidebar and, on desktop only, a donation card (`/donaciones`). On mobile the sidebar collapses below the article and there is no donation card at the bottom: the header already carries the donation button.
- **Footer of the article:** `sources` (required) and a fixed "no es asesoramiento financiero" disclaimer. The body can't remove these.
- **JSON-LD:** `Article` for posts, `WebApplication` for tools, `FAQPage` when `seo.faq` is present, and `BreadcrumbList`.

The shell doesn't set `<title>`. Metadata comes from each page's `generateMetadata`, via a shared `buildMetadata(meta)` helper. It sets the canonical URL, `es_AR` OpenGraph (`article` for posts), and a Twitter card, with the title template `%s | Apacheta`.

### seo prop

```ts
seo: {
  summary: string                                   // 2-3 sentences
  faq?: { question: string; answer: string }[]
  sources: { name: string; url: string }[]          // at least one
}
```

`summary`, `faq` and `sources` are declared once as a `const` in the page and passed both to the shell (JSON-LD, the sources footer) and to the matching block where the page wants to display them. The page chooses where the summary and FAQ appear.

## Economics block kit

Optional components in `components/content/blocks/`, used in any order alongside hand-written JSX: `Section` (an `<h2>` with an anchor id, pairs with `Toc`), `Summary`, `KeyFigures` (up to 4 tiles, each with label, value, as-of date and optional source), `Callout`, `CodeBlock` (code shown as text; samples live in inert `*.snippets.ts` files), `DataTable`, `Faq` (an accordion, server-rendered so the answers are in the HTML), `Glossary`, `Toc` (takes section ids), and `InlineToolCallout` (takes a tool slug, resolved from the registry).

## Economics-topic starter

`components/content/starters/economics-topic.starter.tsx` is a reference composition of the kit, used as the default skeleton by the generator. It's a typical order (summary, key figures, table of contents, sections, inline tool callout, glossary, FAQ), and not a constraint.

## /donaciones

A new public page with its own standalone component, built for this route. `/dashboard/donaciones` is not refactored. The page has `metadata` and no auth. The new component may borrow ideas and small pieces (such as `donation-trail`) from the dashboard page, but doesn't depend on dashboard context. Some duplication is accepted.

## Index pages and sitemap

- `/blog` and `/herramientas` list registry entries, newest first. `/blog` groups posts under one `<h2>` per category (anchors `#economia`, `#apacheta`, `#random`) with a chip row linking to them. There's no query-param filter: that would force dynamic rendering, and this way every post is in the static HTML.
- Both indexes carry the trail header, breadcrumbs (with `BreadcrumbList` JSON-LD) and the Comunidad section (Cuadernito only), but no sidebar and no bottom donation card.
- `sitemap.ts` is rewritten to derive from the registry (`lastModified` is `updatedAt ?? publishedAt`) and to include both indexes and `/donaciones`, alongside the existing entries.

## Guardrails

- zod validation of `meta` and `seo`: length limits, at least one source, `category` required for posts, unique slugs, and every `pinnedRelated` slug present in the registry. (`InlineToolCallout` isn't validated at build; it renders nothing for an unknown slug.)
- A test greps `app/blog/**/page.tsx` and `app/herramientas/**/page.tsx` for a stray `<h1`, and for pages that don't use `ContentShell`.
- Unit tests for `getRelated` and for JSON-LD output.
- SEO rules live in `CLAUDE.md` (written).

## Confirmed decisions

- The sidebar donation card is kept in addition to the header link.
- Category display names: Economía, Novedades de Apacheta, Varios.
- Tools get only the basic shell (`kind: "tool"`) for now. The tool template comes in a later spec. `InlineToolCallout` renders nothing if the slug isn't in the registry.

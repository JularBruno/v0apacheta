# Blog and Tools Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the public content system for Apacheta: a registry, a mandatory `ContentShell` (blurb, sidebar, donation CTA, SEO markup), an economics block kit and starter, blog and tools indexes, a public `/donaciones` page, and registry-driven sitemap and robots.

**Architecture:** Each post or tool is its own static page file (`app/blog/<slug>/page.tsx`, `app/herramientas/<slug>/page.tsx`) with a colocated `meta.ts`. Every page wraps its free-form body in `ContentShell`, which validates `meta` and `seo` with zod, renders all mandatory chrome, and emits JSON-LD. A single registry (`lib/content/registry.ts`) lists all entries and drives related-content, indexes and the sitemap.

**Tech Stack:** Next.js 15 App Router (server components, `force-static`), React 19, TypeScript, Tailwind, zod 3, Jest 30 + React Testing Library (jsdom).

**Spec:** `docs/superpowers/specs/2026-09-30-blog-and-tools-design.md` (read it first). SEO rules: `CLAUDE.md`.

## Global Constraints

- Code style matches `lib/portfolio` and `components/portfolio`: tabs, double quotes, no semicolons.
- Title at most 60 characters. Description at most 155 characters. Content language is Argentine Spanish (es_AR).
- Title template is `%s | Apacheta` (set in `app/blog/layout.tsx` and `app/herramientas/layout.tsx`). The shell never sets `<title>`.
- The shell renders the only `<h1>`. Page bodies use `<h2>` and below.
- Every content page exports `dynamic = "force-static"`. Explanatory text is always server-rendered HTML.
- Related links are real `next/link` anchors.
- `robots.ts` must allow `/blog`, `/herramientas`, `/donaciones`.
- Do not touch `/dashboard/donaciones` or its components.
- Do NOT run `next dev` or `next build` (a second process corrupts the user's `.next`). Verify with Jest and `tsc --noEmit` only.
- Run single tests with `pnpm exec jest <path>`. Type-check new files with the filtered `tsc` command given in Task 11.
- Commit only explicit paths (`git add <paths>`). `.claude/settings.json` has unrelated user changes, never stage it. Every commit adds the trailer via a second `-m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"`.
- Jest `testMatch` runs everything inside any `__tests__` folder. Put fixtures in `__fixtures__` folders, never in `__tests__`.

## Review Focus

1. **No tools registered yet.** The sidebar and tools index must omit or replace the empty tools group without an empty heading. Tested in Task 4 (`RelatedSidebar`) and Task 8 (tools index empty state).
2. **Post with only `publishedAt`.** "Actualizado el" shows `publishedAt`, "Publicado el" is not duplicated, and JSON-LD `dateModified` equals `publishedAt`. Tested in Task 3 and Task 4.
3. **FAQ answer or title containing `</script>`, `<`, `&` or quotes.** JSON-LD must not break out of its `<script>` tag and must round-trip. Tested in Task 3.
4. **Typo in `pinnedRelated`, or a slug reused by a post and a tool.** The registry must fail loudly, naming the slug. Tested in Task 1 and Task 7 (guardrail).
5. **Page not yet in the registry.** The shell must still render (sidebar falls back to newest), and the guardrail test must fail pointing at the missing registry line. Tested in Task 4 and Task 7.

---

### Task 1: Types, schema, URLs and date formatting

**Files:**
- Create: `lib/content/types.ts`
- Create: `lib/content/urls.ts`
- Create: `lib/content/format.ts`
- Create: `lib/content/schema.ts`
- Create: `lib/content/__fixtures__/meta.ts`
- Test: `lib/content/__tests__/schema.test.ts`
- Test: `lib/content/__tests__/urls.test.ts`
- Test: `lib/content/__tests__/format.test.ts`

**Interfaces:**
- Produces (`types.ts`): `ContentKind`, `BlogCategory`, `CATEGORY_LABELS`, `ContentMeta`, `SeoSource`, `FaqItem`, `ContentSeo`.
- Produces (`urls.ts`): `SITE_URL`, `Crumb`, `contentPath(meta)`, `contentUrl(meta)`, `sectionCrumbs(kind)`, `breadcrumbsFor(meta)`.
- Produces (`format.ts`): `formatDate(iso: string): string`.
- Produces (`schema.ts`): `metaSchema`, `seoSchema`, `parseMeta(meta): ContentMeta`, `parseSeo(seo): ContentSeo`, `assertValidRegistry(entries): void`.
- Produces (`__fixtures__/meta.ts`): `makeMeta(overrides?)`, `makeTool(overrides?)`.

- [ ] **Step 1: Record the baseline**

Run: `pnpm exec jest 2>&1 | tail -15`
Expected: note any pre-existing failures so they aren't blamed on this work.

- [ ] **Step 2: Write the types and fixtures (no behavior yet)**

`lib/content/types.ts`:

```ts
export type ContentKind = "post" | "tool"
export type BlogCategory = "economia" | "apacheta" | "random"

export const CATEGORY_LABELS: Record<BlogCategory, string> = {
	economia: "Economía",
	apacheta: "Novedades de Apacheta",
	random: "Varios",
}

export interface ContentMeta {
	slug: string
	kind: ContentKind
	/** at most 60 chars */
	title: string
	/** at most 155 chars, also the meta description */
	description: string
	/** ISO date, e.g. "2026-09-30" */
	publishedAt: string
	updatedAt?: string
	/** required when kind === "post", forbidden on tools */
	category?: BlogCategory
	/** drives related-content scoring */
	tags: string[]
	/** optional manual slugs, shown first in the sidebar */
	pinnedRelated?: string[]
	/** path under /public, e.g. "/blog/inflacion.webp" */
	cover?: string
}

export interface SeoSource {
	name: string
	url: string
}

export interface FaqItem {
	question: string
	answer: string
}

export interface ContentSeo {
	/** 2-3 sentences, written to win the featured snippet */
	summary: string
	faq?: FaqItem[]
	/** at least one */
	sources: SeoSource[]
}
```

`lib/content/__fixtures__/meta.ts`:

```ts
import type { ContentMeta } from "../types"

export function makeMeta(overrides: Partial<ContentMeta> = {}): ContentMeta {
	return {
		slug: "ejemplo",
		kind: "post",
		title: "Un título de ejemplo",
		description: "Una descripción de ejemplo para tests.",
		publishedAt: "2026-09-01",
		category: "economia",
		tags: ["inflacion"],
		...overrides,
	}
}

export function makeTool(overrides: Partial<ContentMeta> = {}): ContentMeta {
	return makeMeta({ slug: "calculadora", kind: "tool", category: undefined, ...overrides })
}
```

- [ ] **Step 3: Write the failing tests**

`lib/content/__tests__/urls.test.ts`:

```ts
import { SITE_URL, breadcrumbsFor, contentPath, contentUrl, sectionCrumbs } from "../urls"
import { makeMeta, makeTool } from "../__fixtures__/meta"

describe("content urls", () => {
	test("posts live under /blog and tools under /herramientas", () => {
		expect(contentPath(makeMeta({ slug: "mi-post" }))).toBe("/blog/mi-post")
		expect(contentPath(makeTool({ slug: "mi-tool" }))).toBe("/herramientas/mi-tool")
	})

	test("contentUrl is absolute", () => {
		expect(contentUrl(makeMeta({ slug: "mi-post" }))).toBe(`${SITE_URL}/blog/mi-post`)
	})

	test("breadcrumbs go Inicio > section > title", () => {
		expect(breadcrumbsFor(makeMeta({ slug: "mi-post", title: "Mi post" }))).toEqual([
			{ name: "Inicio", path: "/" },
			{ name: "Blog", path: "/blog" },
			{ name: "Mi post", path: "/blog/mi-post" },
		])
		expect(sectionCrumbs("tool")).toEqual([
			{ name: "Inicio", path: "/" },
			{ name: "Herramientas", path: "/herramientas" },
		])
	})
})
```

`lib/content/__tests__/format.test.ts`:

```ts
import { formatDate } from "../format"

test("formatDate renders long es-AR dates without timezone drift", () => {
	expect(formatDate("2026-09-30")).toBe("30 de septiembre de 2026")
	expect(formatDate("2026-01-01")).toBe("1 de enero de 2026")
})
```

`lib/content/__tests__/schema.test.ts`:

```ts
import { assertValidRegistry, metaSchema, parseMeta, parseSeo, seoSchema } from "../schema"
import { makeMeta, makeTool } from "../__fixtures__/meta"

describe("metaSchema", () => {
	test("accepts a valid post and a valid tool", () => {
		expect(metaSchema.safeParse(makeMeta()).success).toBe(true)
		expect(metaSchema.safeParse(makeTool()).success).toBe(true)
	})

	test("rejects a title over 60 chars", () => {
		expect(metaSchema.safeParse(makeMeta({ title: "x".repeat(61) })).success).toBe(false)
		expect(metaSchema.safeParse(makeMeta({ title: "x".repeat(60) })).success).toBe(true)
	})

	test("rejects a description over 155 chars", () => {
		expect(metaSchema.safeParse(makeMeta({ description: "x".repeat(156) })).success).toBe(false)
		expect(metaSchema.safeParse(makeMeta({ description: "x".repeat(155) })).success).toBe(true)
	})

	test("requires category on posts and forbids it on tools", () => {
		expect(metaSchema.safeParse(makeMeta({ category: undefined })).success).toBe(false)
		expect(metaSchema.safeParse(makeTool({ category: "economia" })).success).toBe(false)
	})

	test("rejects updatedAt before publishedAt", () => {
		const result = metaSchema.safeParse(makeMeta({ publishedAt: "2026-09-10", updatedAt: "2026-09-01" }))
		expect(result.success).toBe(false)
	})

	test("rejects slugs that are not kebab-case", () => {
		expect(metaSchema.safeParse(makeMeta({ slug: "Mi Post" })).success).toBe(false)
		expect(metaSchema.safeParse(makeMeta({ slug: "mi-post-2" })).success).toBe(true)
	})
})

describe("seoSchema", () => {
	const valid = { summary: "Resumen.", sources: [{ name: "INDEC", url: "https://www.indec.gob.ar/" }] }

	test("accepts a valid seo object, with or without faq", () => {
		expect(seoSchema.safeParse(valid).success).toBe(true)
		expect(seoSchema.safeParse({ ...valid, faq: [{ question: "¿Q?", answer: "A." }] }).success).toBe(true)
	})

	test("requires at least one source with a valid url", () => {
		expect(seoSchema.safeParse({ ...valid, sources: [] }).success).toBe(false)
		expect(seoSchema.safeParse({ ...valid, sources: [{ name: "x", url: "not-a-url" }] }).success).toBe(false)
	})
})

describe("parseMeta / parseSeo", () => {
	test("throw an error naming the slug and the failing field", () => {
		expect(() => parseMeta(makeMeta({ slug: "ejemplo", title: "x".repeat(61) }))).toThrow(
			/Invalid content meta for slug "ejemplo": title/,
		)
	})

	test("parseSeo throws on empty sources", () => {
		expect(() => parseSeo({ summary: "Resumen.", sources: [] })).toThrow(/Invalid seo/)
	})
})

describe("assertValidRegistry", () => {
	test("passes for a valid registry", () => {
		expect(() => assertValidRegistry([makeMeta(), makeTool()])).not.toThrow()
	})

	test("fails on a slug shared by a post and a tool", () => {
		expect(() => assertValidRegistry([makeMeta({ slug: "calculadora" }), makeTool({ slug: "calculadora" })])).toThrow(
			/Duplicate slug "calculadora"/,
		)
	})

	test("fails on a pinnedRelated slug that does not exist", () => {
		expect(() => assertValidRegistry([makeMeta({ pinnedRelated: ["no-existe"] })])).toThrow(
			/pinnedRelated "no-existe" on "ejemplo"/,
		)
	})

	test("fails on an entry that breaks the schema, naming its slug", () => {
		expect(() => assertValidRegistry([makeMeta({ title: "" })])).toThrow(/Invalid content meta for slug "ejemplo"/)
	})
})
```

- [ ] **Step 4: Run tests to verify they fail**

Run: `pnpm exec jest lib/content`
Expected: FAIL with "Cannot find module '../urls'" (and `../format`, `../schema`).

- [ ] **Step 5: Implement**

`lib/content/urls.ts`:

```ts
import type { ContentKind, ContentMeta } from "./types"

export const SITE_URL = "https://apacheta.ar"

export interface Crumb {
	name: string
	path: string
}

const SECTIONS: Record<ContentKind, Crumb> = {
	post: { name: "Blog", path: "/blog" },
	tool: { name: "Herramientas", path: "/herramientas" },
}

export function contentPath(meta: Pick<ContentMeta, "kind" | "slug">): string {
	return `${SECTIONS[meta.kind].path}/${meta.slug}`
}

export function contentUrl(meta: Pick<ContentMeta, "kind" | "slug">): string {
	return `${SITE_URL}${contentPath(meta)}`
}

export function sectionCrumbs(kind: ContentKind): Crumb[] {
	return [{ name: "Inicio", path: "/" }, SECTIONS[kind]]
}

export function breadcrumbsFor(meta: ContentMeta): Crumb[] {
	return [...sectionCrumbs(meta.kind), { name: meta.title, path: contentPath(meta) }]
}
```

`lib/content/format.ts`:

```ts
const formatter = new Intl.DateTimeFormat("es-AR", {
	day: "numeric",
	month: "long",
	year: "numeric",
	timeZone: "UTC",
})

/** "2026-09-30" -> "30 de septiembre de 2026". UTC so date-only ISO strings never drift a day. */
export function formatDate(iso: string): string {
	return formatter.format(new Date(iso))
}
```

`lib/content/schema.ts`:

```ts
import { z } from "zod"
import type { ContentMeta, ContentSeo } from "./types"

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}(T[\d:.]+Z?)?$/, "must be an ISO date like 2026-09-30")

export const metaSchema = z
	.object({
		slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "must be kebab-case"),
		kind: z.enum(["post", "tool"]),
		title: z.string().min(1).max(60),
		description: z.string().min(1).max(155),
		publishedAt: isoDate,
		updatedAt: isoDate.optional(),
		category: z.enum(["economia", "apacheta", "random"]).optional(),
		tags: z.array(z.string().min(1)),
		pinnedRelated: z.array(z.string().min(1)).optional(),
		cover: z.string().startsWith("/").optional(),
	})
	.superRefine((meta, ctx) => {
		if (meta.kind === "post" && !meta.category) {
			ctx.addIssue({ code: "custom", path: ["category"], message: "category is required for posts" })
		}
		if (meta.kind === "tool" && meta.category) {
			ctx.addIssue({ code: "custom", path: ["category"], message: "tools have no category" })
		}
		if (meta.updatedAt && Date.parse(meta.updatedAt) < Date.parse(meta.publishedAt)) {
			ctx.addIssue({ code: "custom", path: ["updatedAt"], message: "updatedAt is before publishedAt" })
		}
	})

export const seoSchema = z.object({
	summary: z.string().min(1),
	faq: z.array(z.object({ question: z.string().min(1), answer: z.string().min(1) })).optional(),
	sources: z.array(z.object({ name: z.string().min(1), url: z.string().url() })).min(1, "at least one source is required"),
})

function formatIssues(error: z.ZodError): string {
	return error.issues.map((issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`).join("; ")
}

/** Validates and returns the same object, throws with the slug and failing fields (fails the static build). */
export function parseMeta(meta: ContentMeta): ContentMeta {
	const result = metaSchema.safeParse(meta)
	if (!result.success) {
		throw new Error(`Invalid content meta for slug "${meta.slug}": ${formatIssues(result.error)}`)
	}
	return meta
}

export function parseSeo(seo: ContentSeo): ContentSeo {
	const result = seoSchema.safeParse(seo)
	if (!result.success) {
		throw new Error(`Invalid seo: ${formatIssues(result.error)}`)
	}
	return seo
}

export function assertValidRegistry(entries: ContentMeta[]): void {
	const slugs = new Set<string>()
	for (const entry of entries) {
		parseMeta(entry)
		if (slugs.has(entry.slug)) {
			throw new Error(`Duplicate slug "${entry.slug}" in content registry`)
		}
		slugs.add(entry.slug)
	}
	for (const entry of entries) {
		for (const pinned of entry.pinnedRelated ?? []) {
			if (!slugs.has(pinned)) {
				throw new Error(`pinnedRelated "${pinned}" on "${entry.slug}" is not in the content registry`)
			}
		}
	}
}
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `pnpm exec jest lib/content`
Expected: PASS (all three files).

- [ ] **Step 7: Commit**

```bash
git add lib/content
git commit -m "feat(content): types, zod schema, url and date helpers" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Sort, registry and related-content logic

**Files:**
- Create: `lib/content/sort.ts`
- Create: `lib/content/registry.ts`
- Create: `lib/content/related.ts`
- Test: `lib/content/__tests__/related.test.ts`
- Test: `lib/content/__tests__/registry.test.ts`

**Interfaces:**
- Consumes: `ContentMeta`, `ContentKind` (`types.ts`), `assertValidRegistry` (`schema.ts`), `makeMeta`, `makeTool` (fixtures).
- Produces (`sort.ts`): `byNewest(a, b): number`.
- Produces (`registry.ts`): `entries: ContentMeta[]`, `findEntry(slug): ContentMeta | undefined`, `listByKind(kind): ContentMeta[]` (newest first).
- Produces (`related.ts`): `Related` (`{ tools: ContentMeta[]; posts: ContentMeta[] }`), `getRelated(entries, currentSlug): Related`.

- [ ] **Step 1: Write the failing tests**

`lib/content/__tests__/related.test.ts`:

```ts
import { getRelated } from "../related"
import { makeMeta, makeTool } from "../__fixtures__/meta"

const current = makeMeta({ slug: "actual", tags: ["inflacion", "ahorro"] })

describe("getRelated", () => {
	test("excludes the current entry", () => {
		const { posts } = getRelated([current, makeMeta({ slug: "otro" })], "actual")
		expect(posts.map((p) => p.slug)).toEqual(["otro"])
	})

	test("pinned slugs come first even when less relevant", () => {
		const pinnedCurrent = makeMeta({ slug: "actual", tags: ["inflacion"], pinnedRelated: ["irrelevante"] })
		const relevant = makeMeta({ slug: "relevante", tags: ["inflacion"] })
		const irrelevant = makeMeta({ slug: "irrelevante", tags: ["otro"], publishedAt: "2020-01-01" })
		const { posts } = getRelated([pinnedCurrent, relevant, irrelevant], "actual")
		expect(posts.map((p) => p.slug)).toEqual(["irrelevante", "relevante"])
	})

	test("tag overlap beats recency", () => {
		const oldRelated = makeMeta({ slug: "viejo-relacionado", tags: ["inflacion", "ahorro"], publishedAt: "2026-01-01" })
		const newUnrelated = makeMeta({ slug: "nuevo-sin-relacion", tags: ["otro"], publishedAt: "2026-09-01" })
		const { posts } = getRelated([current, newUnrelated, oldRelated], "actual")
		expect(posts[0].slug).toBe("viejo-relacionado")
	})

	test("same category breaks a tag tie before recency", () => {
		const sameCategory = makeMeta({ slug: "misma-categoria", tags: [], category: "economia", publishedAt: "2026-01-01" })
		const otherCategory = makeMeta({ slug: "otra-categoria", tags: [], category: "random", publishedAt: "2026-09-01" })
		const { posts } = getRelated([current, otherCategory, sameCategory], "actual")
		expect(posts.map((p) => p.slug)).toEqual(["misma-categoria", "otra-categoria"])
	})

	test("falls back to newest first when nothing matches", () => {
		const a = makeMeta({ slug: "a", tags: ["x"], category: "random", publishedAt: "2026-02-01" })
		const b = makeMeta({ slug: "b", tags: ["y"], category: "random", publishedAt: "2026-08-01" })
		const { posts } = getRelated([current, a, b], "actual")
		expect(posts.map((p) => p.slug)).toEqual(["b", "a"])
	})

	test("limits to 3 posts and 2 tools", () => {
		const posts = ["p1", "p2", "p3", "p4", "p5"].map((slug) => makeMeta({ slug }))
		const tools = ["t1", "t2", "t3", "t4"].map((slug) => makeTool({ slug }))
		const related = getRelated([current, ...posts, ...tools], "actual")
		expect(related.posts).toHaveLength(3)
		expect(related.tools).toHaveLength(2)
	})

	test("returns an empty tools group when there are no tools", () => {
		const related = getRelated([current, makeMeta({ slug: "otro" })], "actual")
		expect(related.tools).toEqual([])
	})

	test("an unregistered current slug does not throw and falls back to newest", () => {
		const a = makeMeta({ slug: "a", publishedAt: "2026-02-01" })
		const b = makeMeta({ slug: "b", publishedAt: "2026-08-01" })
		const related = getRelated([a, b], "no-registrada")
		expect(related.posts.map((p) => p.slug)).toEqual(["b", "a"])
	})
})
```

`lib/content/__tests__/registry.test.ts`:

```ts
import { entries, findEntry, listByKind } from "../registry"
import { assertValidRegistry } from "../schema"

describe("registry", () => {
	test("the real registry is valid", () => {
		expect(() => assertValidRegistry(entries)).not.toThrow()
	})

	test("findEntry returns undefined for unknown slugs", () => {
		expect(findEntry("no-existe-seguro")).toBeUndefined()
	})

	test("listByKind returns only that kind, newest first", () => {
		for (const kind of ["post", "tool"] as const) {
			const list = listByKind(kind)
			expect(list.every((e) => e.kind === kind)).toBe(true)
			const dates = list.map((e) => Date.parse(e.publishedAt))
			expect(dates).toEqual([...dates].sort((a, b) => b - a))
		}
	})
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm exec jest lib/content/__tests__/related.test.ts lib/content/__tests__/registry.test.ts`
Expected: FAIL with "Cannot find module '../related'" / "'../registry'".

- [ ] **Step 3: Implement**

`lib/content/sort.ts`:

```ts
import type { ContentMeta } from "./types"

/** Sort comparator: newest publishedAt first, slug as a stable tie-breaker. */
export function byNewest(
	a: Pick<ContentMeta, "publishedAt" | "slug">,
	b: Pick<ContentMeta, "publishedAt" | "slug">,
): number {
	const diff = Date.parse(b.publishedAt) - Date.parse(a.publishedAt)
	return diff !== 0 ? diff : a.slug.localeCompare(b.slug)
}
```

`lib/content/registry.ts`:

```ts
import type { ContentKind, ContentMeta } from "./types"
import { assertValidRegistry } from "./schema"
import { byNewest } from "./sort"
// [registry:imports] one import line per post/tool, appended by the generator

export const entries: ContentMeta[] = [
	// [registry:entries]
]

// Fails the build (and every test importing this) on an invalid or inconsistent registry.
assertValidRegistry(entries)

export function findEntry(slug: string): ContentMeta | undefined {
	return entries.find((entry) => entry.slug === slug)
}

export function listByKind(kind: ContentKind): ContentMeta[] {
	return entries.filter((entry) => entry.kind === kind).sort(byNewest)
}
```

`lib/content/related.ts`:

```ts
import type { ContentKind, ContentMeta } from "./types"
import { byNewest } from "./sort"

export interface Related {
	tools: ContentMeta[]
	posts: ContentMeta[]
}

const LIMIT: Record<ContentKind, number> = { tool: 2, post: 3 }

/**
 * Pinned slugs first, then tag overlap, then same category, then recency.
 * With no matches the ordering degrades to newest-first, so a group is only
 * empty when that kind has no other entries at all.
 */
export function getRelated(entries: ContentMeta[], currentSlug: string): Related {
	const current = entries.find((entry) => entry.slug === currentSlug)
	const others = entries.filter((entry) => entry.slug !== currentSlug)
	const pinned = current?.pinnedRelated ?? []

	const relevance = (entry: ContentMeta) => ({
		overlap: current ? entry.tags.filter((tag) => current.tags.includes(tag)).length : 0,
		sameCategory: current?.category && entry.category === current.category ? 1 : 0,
	})

	const compare = (a: ContentMeta, b: ContentMeta) => {
		const ra = relevance(a)
		const rb = relevance(b)
		return rb.overlap - ra.overlap || rb.sameCategory - ra.sameCategory || byNewest(a, b)
	}

	const pick = (kind: ContentKind): ContentMeta[] => {
		const pool = others.filter((entry) => entry.kind === kind)
		const pins = pinned.flatMap((slug) => pool.filter((entry) => entry.slug === slug))
		const rest = pool.filter((entry) => !pinned.includes(entry.slug)).sort(compare)
		return [...pins, ...rest].slice(0, LIMIT[kind])
	}

	return { tools: pick("tool"), posts: pick("post") }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm exec jest lib/content`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/content
git commit -m "feat(content): registry, newest sort and related-content scoring" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 3: SEO helpers (metadata and JSON-LD)

**Files:**
- Create: `lib/content/seo.ts`
- Test: `lib/content/__tests__/seo.test.ts`

**Interfaces:**
- Consumes: `ContentMeta`, `ContentSeo`, `FaqItem` (`types.ts`); `SITE_URL`, `Crumb`, `breadcrumbsFor`, `contentUrl` (`urls.ts`).
- Produces: `buildMetadata(meta): Metadata`, `JsonLd` type (`Record<string, unknown>`), `articleJsonLd(meta)`, `webApplicationJsonLd(meta)`, `faqJsonLd(faq)`, `breadcrumbJsonLd(crumbs)`, `buildJsonLd(meta, seo): JsonLd[]`, `serializeJsonLd(data): string`.

- [ ] **Step 1: Write the failing tests**

`lib/content/__tests__/seo.test.ts`:

```ts
import {
	articleJsonLd,
	breadcrumbJsonLd,
	buildJsonLd,
	buildMetadata,
	faqJsonLd,
	serializeJsonLd,
	webApplicationJsonLd,
} from "../seo"
import { makeMeta, makeTool } from "../__fixtures__/meta"

const seo = { summary: "Resumen.", sources: [{ name: "INDEC", url: "https://www.indec.gob.ar/" }] }

describe("buildMetadata", () => {
	test("sets canonical, es_AR open graph and twitter card for a post", () => {
		const meta = makeMeta({ slug: "mi-post", publishedAt: "2026-09-01" })
		const metadata = buildMetadata(meta)
		expect(metadata.title).toBe(meta.title)
		expect(metadata.description).toBe(meta.description)
		expect(metadata.alternates?.canonical).toBe("https://apacheta.ar/blog/mi-post")
		expect(metadata.openGraph).toMatchObject({
			type: "article",
			locale: "es_AR",
			url: "https://apacheta.ar/blog/mi-post",
			publishedTime: "2026-09-01",
			modifiedTime: "2026-09-01",
		})
		expect(metadata.twitter).toMatchObject({ card: "summary_large_image" })
	})

	test("uses updatedAt for modifiedTime when present", () => {
		const metadata = buildMetadata(makeMeta({ publishedAt: "2026-09-01", updatedAt: "2026-09-20" }))
		expect(metadata.openGraph).toMatchObject({ modifiedTime: "2026-09-20" })
	})

	test("tools are website og type with no article times, and cover becomes an image", () => {
		const metadata = buildMetadata(makeTool({ slug: "calc", cover: "/herramientas/calc.webp" }))
		expect(metadata.alternates?.canonical).toBe("https://apacheta.ar/herramientas/calc")
		expect(metadata.openGraph).toMatchObject({ type: "website", images: ["/herramientas/calc.webp"] })
		expect(metadata.openGraph).not.toHaveProperty("publishedTime")
	})
})

describe("JSON-LD", () => {
	test("article dateModified falls back to publishedAt", () => {
		const ld = articleJsonLd(makeMeta({ publishedAt: "2026-09-01" }))
		expect(ld["@type"]).toBe("Article")
		expect(ld.datePublished).toBe("2026-09-01")
		expect(ld.dateModified).toBe("2026-09-01")
		expect(ld.inLanguage).toBe("es-AR")
	})

	test("article dateModified uses updatedAt when present", () => {
		const ld = articleJsonLd(makeMeta({ publishedAt: "2026-09-01", updatedAt: "2026-09-20" }))
		expect(ld.dateModified).toBe("2026-09-20")
	})

	test("tools are WebApplication", () => {
		const ld = webApplicationJsonLd(makeTool({ slug: "calc" }))
		expect(ld["@type"]).toBe("WebApplication")
		expect(ld.url).toBe("https://apacheta.ar/herramientas/calc")
	})

	test("faq maps to FAQPage questions", () => {
		const ld = faqJsonLd([{ question: "¿Q?", answer: "A." }])
		expect(ld["@type"]).toBe("FAQPage")
		expect(ld.mainEntity).toEqual([
			{ "@type": "Question", name: "¿Q?", acceptedAnswer: { "@type": "Answer", text: "A." } },
		])
	})

	test("breadcrumbs are positioned and absolute", () => {
		const ld = breadcrumbJsonLd([
			{ name: "Inicio", path: "/" },
			{ name: "Blog", path: "/blog" },
		])
		expect(ld.itemListElement).toEqual([
			{ "@type": "ListItem", position: 1, name: "Inicio", item: "https://apacheta.ar/" },
			{ "@type": "ListItem", position: 2, name: "Blog", item: "https://apacheta.ar/blog" },
		])
	})

	test("buildJsonLd includes FAQPage only when there is a faq", () => {
		const types = (faq?: { question: string; answer: string }[]) =>
			buildJsonLd(makeMeta(), { ...seo, faq }).map((ld) => ld["@type"])
		expect(types()).toEqual(["Article", "BreadcrumbList"])
		expect(types([])).toEqual(["Article", "BreadcrumbList"])
		expect(types([{ question: "¿Q?", answer: "A." }])).toEqual(["Article", "BreadcrumbList", "FAQPage"])
	})

	test("buildJsonLd uses WebApplication for tools", () => {
		expect(buildJsonLd(makeTool(), seo).map((ld) => ld["@type"])).toEqual(["WebApplication", "BreadcrumbList"])
	})

	test("serializeJsonLd cannot break out of a script tag and round-trips", () => {
		const nasty = `</script><script>alert("x")</script> & <b>"q"</b>`
		const output = serializeJsonLd(faqJsonLd([{ question: nasty, answer: nasty }]))
		expect(output).not.toContain("</script>")
		expect(output).not.toContain("<")
		const parsed = JSON.parse(output)
		expect(parsed.mainEntity[0].name).toBe(nasty)
	})
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm exec jest lib/content/__tests__/seo.test.ts`
Expected: FAIL with "Cannot find module '../seo'".

- [ ] **Step 3: Implement**

`lib/content/seo.ts`:

```ts
import type { Metadata } from "next"
import type { ContentMeta, ContentSeo, FaqItem } from "./types"
import { SITE_URL, breadcrumbsFor, contentUrl, type Crumb } from "./urls"

export type JsonLd = Record<string, unknown>

const CONTEXT = "https://schema.org"
const LANGUAGE = "es-AR"
const PUBLISHER = { "@type": "Organization", name: "Apacheta", url: SITE_URL }

/** Use as `generateMetadata` output; the `%s | Apacheta` template lives in the blog/herramientas layouts. */
export function buildMetadata(meta: ContentMeta): Metadata {
	const url = contentUrl(meta)
	const common = {
		url,
		title: meta.title,
		description: meta.description,
		locale: "es_AR",
		siteName: "Apacheta",
		...(meta.cover ? { images: [meta.cover] } : {}),
	}
	return {
		title: meta.title,
		description: meta.description,
		alternates: { canonical: url },
		openGraph:
			meta.kind === "post"
				? {
						type: "article",
						...common,
						publishedTime: meta.publishedAt,
						modifiedTime: meta.updatedAt ?? meta.publishedAt,
					}
				: { type: "website", ...common },
		twitter: { card: "summary_large_image", title: meta.title, description: meta.description },
	}
}

export function articleJsonLd(meta: ContentMeta): JsonLd {
	return {
		"@context": CONTEXT,
		"@type": "Article",
		headline: meta.title,
		description: meta.description,
		datePublished: meta.publishedAt,
		dateModified: meta.updatedAt ?? meta.publishedAt,
		inLanguage: LANGUAGE,
		mainEntityOfPage: contentUrl(meta),
		author: PUBLISHER,
		publisher: PUBLISHER,
		...(meta.cover ? { image: `${SITE_URL}${meta.cover}` } : {}),
	}
}

export function webApplicationJsonLd(meta: ContentMeta): JsonLd {
	return {
		"@context": CONTEXT,
		"@type": "WebApplication",
		name: meta.title,
		description: meta.description,
		url: contentUrl(meta),
		applicationCategory: "FinanceApplication",
		operatingSystem: "Any",
		inLanguage: LANGUAGE,
		offers: { "@type": "Offer", price: "0", priceCurrency: "ARS" },
	}
}

export function faqJsonLd(faq: FaqItem[]): JsonLd {
	return {
		"@context": CONTEXT,
		"@type": "FAQPage",
		mainEntity: faq.map((item) => ({
			"@type": "Question",
			name: item.question,
			acceptedAnswer: { "@type": "Answer", text: item.answer },
		})),
	}
}

export function breadcrumbJsonLd(crumbs: Crumb[]): JsonLd {
	return {
		"@context": CONTEXT,
		"@type": "BreadcrumbList",
		itemListElement: crumbs.map((crumb, index) => ({
			"@type": "ListItem",
			position: index + 1,
			name: crumb.name,
			item: `${SITE_URL}${crumb.path}`,
		})),
	}
}

export function buildJsonLd(meta: ContentMeta, seo: ContentSeo): JsonLd[] {
	return [
		meta.kind === "post" ? articleJsonLd(meta) : webApplicationJsonLd(meta),
		breadcrumbJsonLd(breadcrumbsFor(meta)),
		...(seo.faq && seo.faq.length > 0 ? [faqJsonLd(seo.faq)] : []),
	]
}

/** JSON for an inline <script type="application/ld+json">; `<` is escaped so content can never close the tag. */
export function serializeJsonLd(data: JsonLd): string {
	return JSON.stringify(data).replace(/</g, "\\u003c")
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm exec jest lib/content/__tests__/seo.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/content/seo.ts lib/content/__tests__/seo.test.ts
git commit -m "feat(content): metadata and JSON-LD builders" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 4: ContentShell and its parts

**Files:**
- Create: `components/content/apacheta-blurb.tsx`
- Create: `components/content/breadcrumbs.tsx`
- Create: `components/content/donation-card.tsx`
- Create: `components/content/related-sidebar.tsx`
- Create: `components/content/json-ld.tsx`
- Create: `components/content/content-shell.tsx`
- Test: `components/content/__tests__/content-shell.test.tsx`
- Test: `components/content/__tests__/related-sidebar.test.tsx`

**Interfaces:**
- Consumes: `ContentMeta`, `ContentSeo`, `CATEGORY_LABELS` (`types.ts`); `contentPath`, `breadcrumbsFor`, `Crumb` (`urls.ts`); `formatDate` (`format.ts`); `parseMeta`, `parseSeo` (`schema.ts`); `entries` (`registry.ts`); `getRelated`, `Related` (`related.ts`); `buildJsonLd`, `serializeJsonLd`, `JsonLd` (`seo.ts`).
- Produces: `ApachetaBlurb({ variant: "post" | "tool" | "index" })`, `Breadcrumbs({ crumbs: Crumb[] })`, `DonationCard({ className? })`, `RelatedSidebar({ related: Related })`, `JsonLd({ data: JsonLd[] })` (default export, file `json-ld.tsx`; type alias imported as `JsonLdData`), `ContentShell({ meta, seo, children })` (default exports).

- [ ] **Step 1: Write the failing tests**

`components/content/__tests__/related-sidebar.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react"
import RelatedSidebar from "@/components/content/related-sidebar"
import { makeMeta, makeTool } from "@/lib/content/__fixtures__/meta"

describe("RelatedSidebar", () => {
	test("renders both groups as real links to each entry", () => {
		render(
			<RelatedSidebar
				related={{
					tools: [makeTool({ slug: "calculadora", title: "Calculadora de ejemplo" })],
					posts: [makeMeta({ slug: "otro-post", title: "Otro post" })],
				}}
			/>,
		)
		expect(screen.getByRole("heading", { name: "Herramientas relacionadas" })).toBeInTheDocument()
		expect(screen.getByRole("heading", { name: "Artículos relacionados" })).toBeInTheDocument()
		expect(screen.getByRole("link", { name: /Calculadora de ejemplo/ })).toHaveAttribute("href", "/herramientas/calculadora")
		expect(screen.getByRole("link", { name: /Otro post/ })).toHaveAttribute("href", "/blog/otro-post")
	})

	test("omits a group entirely when it is empty, with no empty heading", () => {
		render(<RelatedSidebar related={{ tools: [], posts: [makeMeta({ slug: "otro-post", title: "Otro post" })] }} />)
		expect(screen.queryByRole("heading", { name: "Herramientas relacionadas" })).not.toBeInTheDocument()
		expect(screen.getByRole("heading", { name: "Artículos relacionados" })).toBeInTheDocument()
	})

	test("renders nothing when both groups are empty", () => {
		const { container } = render(<RelatedSidebar related={{ tools: [], posts: [] }} />)
		expect(container).toBeEmptyDOMElement()
	})
})
```

`components/content/__tests__/content-shell.test.tsx`:

```tsx
import { render, screen, within } from "@testing-library/react"
import ContentShell from "@/components/content/content-shell"
import { makeMeta } from "@/lib/content/__fixtures__/meta"

jest.mock("@/lib/content/registry", () => {
	const { makeMeta, makeTool } = jest.requireActual("@/lib/content/__fixtures__/meta")
	return {
		entries: [
			makeMeta({ slug: "otro-post", title: "Otro post", publishedAt: "2026-08-01" }),
			makeTool({ slug: "calculadora", title: "Calculadora de ejemplo" }),
		],
	}
})

const seo = { summary: "Resumen.", sources: [{ name: "INDEC", url: "https://www.indec.gob.ar/" }] }

function jsonLdTypes(container: HTMLElement) {
	return Array.from(container.querySelectorAll('script[type="application/ld+json"]')).map(
		(script) => JSON.parse(script.textContent ?? "{}")["@type"],
	)
}

describe("ContentShell", () => {
	test("renders the Apacheta blurb and the header donation link outside the article", () => {
		const { container } = render(
			<ContentShell meta={makeMeta()} seo={seo}>
				<p>Cuerpo</p>
			</ContentShell>,
		)
		const article = container.querySelector("article") as HTMLElement
		const blurbLink = screen.getByRole("link", { name: "Apacheta" })
		expect(blurbLink).toHaveAttribute("href", "/")
		expect(article).not.toContainElement(blurbLink)
		const headerLink = screen.getByRole("link", { name: "Apoyá Apacheta" })
		expect(headerLink).toHaveAttribute("href", "/donaciones")
		expect(article).not.toContainElement(headerLink)
		expect(screen.getByText(/Este artículo está publicado en/)).toBeInTheDocument()
	})

	test("uses the tool blurb copy for tools", () => {
		render(<ContentShell meta={makeMeta({ kind: "tool", category: undefined })} seo={seo}>x</ContentShell>)
		expect(screen.getByText(/Esta herramienta está publicada en/)).toBeInTheDocument()
	})

	test("has exactly one h1 (the title) and puts children inside the article", () => {
		const { container } = render(
			<ContentShell meta={makeMeta({ title: "Mi título" })} seo={seo}>
				<p>Cuerpo</p>
			</ContentShell>,
		)
		const h1s = container.querySelectorAll("h1")
		expect(h1s).toHaveLength(1)
		expect(h1s[0]).toHaveTextContent("Mi título")
		expect(within(container.querySelector("article") as HTMLElement).getByText("Cuerpo")).toBeInTheDocument()
	})

	test("renders visible breadcrumbs ending at the current page", () => {
		render(<ContentShell meta={makeMeta({ title: "Mi título" })} seo={seo}>x</ContentShell>)
		const nav = screen.getByRole("navigation", { name: "Breadcrumb" })
		expect(within(nav).getByRole("link", { name: "Inicio" })).toHaveAttribute("href", "/")
		expect(within(nav).getByRole("link", { name: "Blog" })).toHaveAttribute("href", "/blog")
		expect(within(nav).getByText("Mi título")).toHaveAttribute("aria-current", "page")
	})

	test("sidebar aside links related entries and is not inside the article", () => {
		const { container } = render(<ContentShell meta={makeMeta()} seo={seo}>x</ContentShell>)
		const aside = container.querySelector("aside") as HTMLElement
		expect(within(aside).getByRole("link", { name: /Otro post/ })).toHaveAttribute("href", "/blog/otro-post")
		expect(within(aside).getByRole("link", { name: /Calculadora de ejemplo/ })).toHaveAttribute(
			"href",
			"/herramientas/calculadora",
		)
		expect(container.querySelector("article")).not.toContainElement(aside)
	})

	test("has a sidebar donation card and a mobile donation card after the article, both to /donaciones", () => {
		const { container } = render(<ContentShell meta={makeMeta()} seo={seo}>x</ContentShell>)
		const cardLinks = screen.getAllByRole("link", { name: /Doná/ })
		expect(cardLinks).toHaveLength(2)
		cardLinks.forEach((link) => expect(link).toHaveAttribute("href", "/donaciones"))
		const aside = container.querySelector("aside") as HTMLElement
		expect(cardLinks.filter((link) => aside.contains(link))).toHaveLength(1)
	})

	test("shows Actualizado with publishedAt when there is no updatedAt, and no Publicado line", () => {
		const { container } = render(<ContentShell meta={makeMeta({ publishedAt: "2026-09-01" })} seo={seo}>x</ContentShell>)
		expect(screen.getByText(/Actualizado el 1 de septiembre de 2026/)).toBeInTheDocument()
		expect(screen.queryByText(/Publicado el/)).not.toBeInTheDocument()
		const article = JSON.parse(
			container.querySelector('script[type="application/ld+json"]')?.textContent ?? "{}",
		)
		expect(article.dateModified).toBe("2026-09-01")
	})

	test("shows both Publicado and Actualizado when updatedAt is set", () => {
		render(
			<ContentShell meta={makeMeta({ publishedAt: "2026-09-01", updatedAt: "2026-09-20" })} seo={seo}>
				x
			</ContentShell>,
		)
		expect(screen.getByText(/Publicado el 1 de septiembre de 2026/)).toBeInTheDocument()
		expect(screen.getByText(/Actualizado el 20 de septiembre de 2026/)).toBeInTheDocument()
	})

	test("renders sources and the fixed disclaimer in the article footer", () => {
		const { container } = render(<ContentShell meta={makeMeta()} seo={seo}>x</ContentShell>)
		const footer = container.querySelector("article footer") as HTMLElement
		const source = within(footer).getByRole("link", { name: "INDEC" })
		expect(source).toHaveAttribute("href", "https://www.indec.gob.ar/")
		expect(within(footer).getByText(/no constituye asesoramiento financiero/)).toBeInTheDocument()
	})

	test("emits Article + BreadcrumbList JSON-LD, plus FAQPage only with a faq", () => {
		const plain = render(<ContentShell meta={makeMeta()} seo={seo}>x</ContentShell>)
		expect(jsonLdTypes(plain.container)).toEqual(["Article", "BreadcrumbList"])
		plain.unmount()
		const withFaq = render(
			<ContentShell meta={makeMeta()} seo={{ ...seo, faq: [{ question: "¿Q?", answer: "A." }] }}>
				x
			</ContentShell>,
		)
		expect(jsonLdTypes(withFaq.container)).toEqual(["Article", "BreadcrumbList", "FAQPage"])
	})

	test("renders for a page whose meta is not in the registry", () => {
		render(<ContentShell meta={makeMeta({ slug: "no-registrada" })} seo={seo}>x</ContentShell>)
		expect(screen.getByRole("link", { name: /Otro post/ })).toBeInTheDocument()
	})

	test("throws a clear error for invalid meta or seo (fails the static build)", () => {
		expect(() => ContentShell({ meta: makeMeta({ slug: "ejemplo", title: "x".repeat(61) }), seo, children: null })).toThrow(
			/Invalid content meta for slug "ejemplo"/,
		)
		expect(() => ContentShell({ meta: makeMeta(), seo: { ...seo, sources: [] }, children: null })).toThrow(/Invalid seo/)
	})
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm exec jest components/content`
Expected: FAIL with "Cannot find module '@/components/content/related-sidebar'" (and `content-shell`).

- [ ] **Step 3: Implement the parts**

`components/content/apacheta-blurb.tsx`:

```tsx
import Link from "next/link"

const COPY = {
	post: "Este artículo está publicado en",
	tool: "Esta herramienta está publicada en",
	index: "Este sitio es parte de",
} as const

export type BlurbVariant = keyof typeof COPY

/** Fixed, short "hosted by Apacheta" line plus the slim donation link. Lives outside <h1>/<article>. */
export default function ApachetaBlurb({ variant }: { variant: BlurbVariant }) {
	return (
		<div className="border-b border-border bg-muted/40">
			<div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-1 px-5 py-2 text-xs text-muted-foreground sm:px-6">
				<p>
					{COPY[variant]}{" "}
					<Link href="/" className="font-semibold text-foreground underline-offset-2 hover:underline">
						Apacheta
					</Link>
					, la app de finanzas personales para Argentina.
				</p>
				<Link href="/donaciones" className="font-mono tracking-wide text-foreground/80 transition-colors hover:text-foreground">
					Apoyá Apacheta
				</Link>
			</div>
		</div>
	)
}
```

`components/content/breadcrumbs.tsx`:

```tsx
import Link from "next/link"
import type { Crumb } from "@/lib/content/urls"

export default function Breadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
	return (
		<nav aria-label="Breadcrumb" className="font-mono text-xs text-muted-foreground">
			<ol className="flex flex-wrap items-center gap-1.5">
				{crumbs.map((crumb, index) => {
					const isLast = index === crumbs.length - 1
					return (
						<li key={crumb.path} className="inline-flex items-center gap-1.5">
							{isLast ? (
								<span aria-current="page" className="text-foreground/80">
									{crumb.name}
								</span>
							) : (
								<Link href={crumb.path} className="transition-colors hover:text-foreground">
									{crumb.name}
								</Link>
							)}
							{!isLast && <span aria-hidden="true">/</span>}
						</li>
					)
				})}
			</ol>
		</nav>
	)
}
```

`components/content/donation-card.tsx`:

```tsx
import Link from "next/link"
import { cn } from "@/lib/utils"

export default function DonationCard({ className }: { className?: string }) {
	return (
		<div className={cn("rounded-2xl border border-primary/30 bg-primary/10 p-5", className)}>
			<p className="font-bold text-foreground">¿Te sirvió este contenido?</p>
			<p className="mt-1 text-sm text-muted-foreground">
				Apacheta se mantiene con donaciones. Tu aporte cubre el hosting y el tiempo para seguir sumando funciones y contenido.
			</p>
			<Link
				href="/donaciones"
				className="mt-3 inline-flex items-center rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
			>
				Doná a Apacheta
			</Link>
		</div>
	)
}
```

`components/content/related-sidebar.tsx`:

```tsx
import Link from "next/link"
import { CATEGORY_LABELS } from "@/lib/content/types"
import { contentPath } from "@/lib/content/urls"
import type { Related } from "@/lib/content/related"

const GROUPS = [
	{ key: "tools", title: "Herramientas relacionadas" },
	{ key: "posts", title: "Artículos relacionados" },
] as const

/** Empty groups are omitted (no empty headings); renders nothing when both are empty. */
export default function RelatedSidebar({ related }: { related: Related }) {
	return (
		<>
			{GROUPS.map(({ key, title }) => {
				const items = related[key]
				if (items.length === 0) return null
				return (
					<section key={key} aria-labelledby={`related-${key}`}>
						<h2 id={`related-${key}`} className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
							{title}
						</h2>
						<ul className="mt-3 space-y-3">
							{items.map((item) => (
								<li key={item.slug}>
									<Link href={contentPath(item)} className="group block">
										<span className="text-sm font-semibold text-foreground/90 group-hover:text-foreground group-hover:underline">
											{item.title}
										</span>
										{item.category && (
											<span className="block font-mono text-[11px] text-muted-foreground">
												{CATEGORY_LABELS[item.category]}
											</span>
										)}
									</Link>
								</li>
							))}
						</ul>
					</section>
				)
			})}
		</>
	)
}
```

`components/content/json-ld.tsx`:

```tsx
import { serializeJsonLd, type JsonLd as JsonLdData } from "@/lib/content/seo"

export default function JsonLd({ data }: { data: JsonLdData[] }) {
	return (
		<>
			{data.map((item, index) => (
				<script key={index} type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(item) }} />
			))}
		</>
	)
}
```

`components/content/content-shell.tsx`:

```tsx
import type { ReactNode } from "react"
import ApachetaBlurb from "@/components/content/apacheta-blurb"
import Breadcrumbs from "@/components/content/breadcrumbs"
import DonationCard from "@/components/content/donation-card"
import JsonLd from "@/components/content/json-ld"
import RelatedSidebar from "@/components/content/related-sidebar"
import { formatDate } from "@/lib/content/format"
import { entries } from "@/lib/content/registry"
import { getRelated } from "@/lib/content/related"
import { parseMeta, parseSeo } from "@/lib/content/schema"
import { buildJsonLd } from "@/lib/content/seo"
import type { ContentMeta, ContentSeo } from "@/lib/content/types"
import { breadcrumbsFor } from "@/lib/content/urls"

const DISCLAIMER =
	"Este contenido es informativo y no constituye asesoramiento financiero, legal ni impositivo. Las cifras y condiciones cambian: verificá los datos en las fuentes oficiales antes de tomar decisiones."

interface ContentShellProps {
	meta: ContentMeta
	seo: ContentSeo
	children: ReactNode
}

/**
 * Mandatory wrapper for every blog/tool page. Owns the blurb, the only <h1>, the sidebar,
 * the donation CTAs, sources, disclaimer and JSON-LD. The page body (children) is free-form.
 * Invalid meta/seo throws, which fails the static build.
 */
export default function ContentShell({ meta, seo, children }: ContentShellProps) {
	parseMeta(meta)
	parseSeo(seo)
	const related = getRelated(entries, meta.slug)
	const updated = meta.updatedAt ?? meta.publishedAt

	return (
		<div className="min-h-screen bg-background">
			<ApachetaBlurb variant={meta.kind} />
			<div className="mx-auto max-w-5xl gap-10 px-5 py-8 sm:px-6 lg:grid lg:grid-cols-[minmax(0,1fr)_18rem]">
				<main>
					<Breadcrumbs crumbs={breadcrumbsFor(meta)} />
					<article className="mt-6">
						<header>
							<h1 className="text-3xl font-extrabold leading-tight tracking-tight text-foreground sm:text-4xl">
								{meta.title}
							</h1>
							<p className="mt-3 font-mono text-xs text-muted-foreground">
								{meta.updatedAt && (
									<>
										<time dateTime={meta.publishedAt}>Publicado el {formatDate(meta.publishedAt)}</time>
										{" · "}
									</>
								)}
								<time dateTime={updated}>Actualizado el {formatDate(updated)}</time>
							</p>
						</header>
						<div className="mt-8 space-y-8 leading-relaxed text-foreground/90">{children}</div>
						<footer className="mt-12 border-t border-border pt-6">
							<h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Fuentes</h2>
							<ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
								{seo.sources.map((source) => (
									<li key={source.url}>
										<a href={source.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
											{source.name}
										</a>
									</li>
								))}
							</ul>
							<p className="mt-6 text-xs text-muted-foreground">{DISCLAIMER}</p>
						</footer>
					</article>
					<DonationCard className="mt-10 lg:hidden" />
				</main>
				<aside aria-label="Recomendaciones" className="mt-10 space-y-8 lg:sticky lg:top-6 lg:mt-0 lg:self-start">
					<RelatedSidebar related={related} />
					<DonationCard className="hidden lg:block" />
				</aside>
			</div>
			<JsonLd data={buildJsonLd(meta, seo)} />
		</div>
	)
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm exec jest components/content`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add components/content
git commit -m "feat(content): ContentShell with blurb, sidebar, donation CTAs and JSON-LD" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Economics block kit

**Files:**
- Create: `components/content/blocks/section.tsx`, `summary.tsx`, `key-figures.tsx`, `callout.tsx`, `data-table.tsx`, `faq.tsx`, `glossary.tsx`, `toc.tsx`, `inline-tool-callout.tsx`, `index.ts`
- Test: `components/content/blocks/__tests__/blocks.test.tsx`

**Interfaces:**
- Consumes: `FaqItem`, `SeoSource` (`types.ts`); `findEntry` (`registry.ts`); `contentPath` (`urls.ts`).
- Produces (all from `@/components/content/blocks`): `Section({ id, heading, children })`, `Summary({ text })`, `KeyFigures({ figures: KeyFigure[] })` plus the `KeyFigure` type (`{ label, value, asOf, source?: SeoSource }`), `Callout({ tone?: "info" | "warning", title?, children })`, `DataTable({ caption, columns: string[], rows: string[][] })`, `Faq({ items: FaqItem[], heading? })`, `Glossary({ terms: { term, definition }[] })`, `Toc({ items: { id, label }[] })`, `InlineToolCallout({ slug })`.

- [ ] **Step 1: Write the failing tests**

`components/content/blocks/__tests__/blocks.test.tsx`:

```tsx
import { render, screen, within } from "@testing-library/react"
import {
	Callout,
	DataTable,
	Faq,
	Glossary,
	InlineToolCallout,
	KeyFigures,
	Section,
	Summary,
	Toc,
} from "@/components/content/blocks"

jest.mock("@/lib/content/registry", () => {
	const { makeMeta, makeTool } = jest.requireActual("@/lib/content/__fixtures__/meta")
	const entries = [makeMeta({ slug: "un-post", title: "Un post" }), makeTool({ slug: "calculadora", title: "Calculadora de ejemplo" })]
	return { entries, findEntry: (slug: string) => entries.find((entry: { slug: string }) => entry.slug === slug) }
})

describe("Section + Toc", () => {
	test("Section renders an h2 with an anchor id and Toc links to it", () => {
		render(
			<>
				<Toc items={[{ id: "que-es", label: "Qué es" }]} />
				<Section id="que-es" heading="Qué es">
					<p>Texto</p>
				</Section>
			</>,
		)
		expect(screen.getByRole("heading", { level: 2, name: "Qué es" })).toBeInTheDocument()
		expect(screen.getByRole("link", { name: "Qué es" })).toHaveAttribute("href", "#que-es")
		expect(document.getElementById("que-es")).not.toBeNull()
	})
})

describe("Summary", () => {
	test("renders the summary text under an En resumen heading", () => {
		render(<Summary text="La inflación es la suba general de precios." />)
		expect(screen.getByRole("heading", { name: "En resumen" })).toBeInTheDocument()
		expect(screen.getByText("La inflación es la suba general de precios.")).toBeInTheDocument()
	})
})

describe("KeyFigures", () => {
	const figure = { label: "Etiqueta", value: "12%", asOf: "agosto de 2026" }

	test("renders label, value, as-of and an optional source link", () => {
		render(<KeyFigures figures={[{ ...figure, source: { name: "INDEC", url: "https://www.indec.gob.ar/" } }]} />)
		expect(screen.getByText("Etiqueta")).toBeInTheDocument()
		expect(screen.getByText("12%")).toBeInTheDocument()
		expect(screen.getByText(/agosto de 2026/)).toBeInTheDocument()
		expect(screen.getByRole("link", { name: "INDEC" })).toHaveAttribute("href", "https://www.indec.gob.ar/")
	})

	test("renders nothing for an empty list and throws for more than 4", () => {
		const { container } = render(<KeyFigures figures={[]} />)
		expect(container).toBeEmptyDOMElement()
		expect(() => KeyFigures({ figures: Array(5).fill(figure) })).toThrow(/at most 4/)
	})
})

describe("Callout", () => {
	test("renders a note with an optional title", () => {
		render(
			<Callout title="Ojo">
				<p>Detalle</p>
			</Callout>,
		)
		const note = screen.getByRole("note")
		expect(within(note).getByText("Ojo")).toBeInTheDocument()
		expect(within(note).getByText("Detalle")).toBeInTheDocument()
	})
})

describe("DataTable", () => {
	test("renders a captioned table with column headers", () => {
		render(<DataTable caption="Mi tabla" columns={["A", "B"]} rows={[["1", "2"]]} />)
		const table = screen.getByRole("table")
		expect(within(table).getByText("Mi tabla")).toBeInTheDocument()
		expect(within(table).getAllByRole("columnheader").map((th) => th.textContent)).toEqual(["A", "B"])
		expect(within(table).getAllByRole("cell").map((td) => td.textContent)).toEqual(["1", "2"])
	})

	test("throws when a row does not match the column count", () => {
		expect(() => DataTable({ caption: "x", columns: ["A", "B"], rows: [["solo uno"]] })).toThrow(/row 0 has 1 cells, expected 2/)
	})
})

describe("Faq", () => {
	test("renders every answer in the HTML (native details, nothing unmounted)", () => {
		render(<Faq items={[{ question: "¿Una?", answer: "Respuesta uno." }, { question: "¿Dos?", answer: "Respuesta dos." }]} />)
		expect(screen.getByRole("heading", { name: "Preguntas frecuentes" })).toBeInTheDocument()
		expect(screen.getByText("Respuesta uno.")).toBeInTheDocument()
		expect(screen.getByText("Respuesta dos.")).toBeInTheDocument()
		expect(document.querySelectorAll("details")).toHaveLength(2)
	})

	test("renders nothing for an empty list", () => {
		const { container } = render(<Faq items={[]} />)
		expect(container).toBeEmptyDOMElement()
	})
})

describe("Glossary", () => {
	test("renders terms as a definition list", () => {
		render(<Glossary terms={[{ term: "IPC", definition: "Índice de precios al consumidor." }]} />)
		expect(screen.getByRole("heading", { name: "Glosario" })).toBeInTheDocument()
		expect(screen.getByText("IPC").tagName).toBe("DT")
		expect(screen.getByText("Índice de precios al consumidor.").tagName).toBe("DD")
	})
})

describe("InlineToolCallout", () => {
	test("links to a registered tool", () => {
		render(<InlineToolCallout slug="calculadora" />)
		expect(screen.getByRole("link", { name: "Calculadora de ejemplo" })).toHaveAttribute("href", "/herramientas/calculadora")
	})

	test("renders nothing for an unknown slug or a slug that is a post", () => {
		const unknown = render(<InlineToolCallout slug="no-existe" />)
		expect(unknown.container).toBeEmptyDOMElement()
		const post = render(<InlineToolCallout slug="un-post" />)
		expect(post.container).toBeEmptyDOMElement()
	})
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm exec jest components/content/blocks`
Expected: FAIL with "Cannot find module '@/components/content/blocks'".

- [ ] **Step 3: Implement**

`components/content/blocks/section.tsx`:

```tsx
import type { ReactNode } from "react"

/** An <h2> section with an anchor id, pairs with Toc. */
export default function Section({ id, heading, children }: { id: string; heading: string; children: ReactNode }) {
	return (
		<section id={id} aria-labelledby={`${id}-heading`} className="scroll-mt-20">
			<h2 id={`${id}-heading`} className="text-2xl font-bold tracking-tight text-foreground">
				{heading}
			</h2>
			<div className="mt-3 space-y-4">{children}</div>
		</section>
	)
}
```

`components/content/blocks/summary.tsx`:

```tsx
export default function Summary({ text }: { text: string }) {
	return (
		<section aria-labelledby="resumen-heading" className="rounded-2xl border border-primary/30 bg-primary/10 p-5">
			<h2 id="resumen-heading" className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
				En resumen
			</h2>
			<p className="mt-2 text-lg leading-relaxed text-foreground">{text}</p>
		</section>
	)
}
```

`components/content/blocks/key-figures.tsx`:

```tsx
import type { SeoSource } from "@/lib/content/types"

export interface KeyFigure {
	label: string
	value: string
	/** when the figure was measured, e.g. "agosto de 2026" */
	asOf: string
	source?: SeoSource
}

export default function KeyFigures({ figures }: { figures: KeyFigure[] }) {
	if (figures.length === 0) return null
	if (figures.length > 4) {
		throw new Error(`KeyFigures accepts at most 4 figures, got ${figures.length}`)
	}
	return (
		<dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
			{figures.map((figure) => (
				<div key={figure.label} className="rounded-xl border border-border bg-card p-4">
					<dt className="text-xs text-muted-foreground">{figure.label}</dt>
					<dd className="mt-1 text-2xl font-extrabold text-foreground">{figure.value}</dd>
					<dd className="mt-1 text-xs text-muted-foreground">
						Dato a {figure.asOf}
						{figure.source && (
							<>
								{" · "}
								<a href={figure.source.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
									{figure.source.name}
								</a>
							</>
						)}
					</dd>
				</div>
			))}
		</dl>
	)
}
```

`components/content/blocks/callout.tsx`:

```tsx
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

const TONES = {
	info: "border-primary/30 bg-primary/10",
	warning: "border-amber-500/40 bg-amber-500/10",
} as const

export default function Callout({
	tone = "info",
	title,
	children,
}: {
	tone?: keyof typeof TONES
	title?: string
	children: ReactNode
}) {
	return (
		<div role="note" className={cn("rounded-xl border p-4", TONES[tone])}>
			{title && <p className="font-semibold text-foreground">{title}</p>}
			<div className={cn("text-sm text-foreground/90", title && "mt-1")}>{children}</div>
		</div>
	)
}
```

`components/content/blocks/data-table.tsx`:

```tsx
export default function DataTable({
	caption,
	columns,
	rows,
}: {
	caption: string
	columns: string[]
	rows: string[][]
}) {
	rows.forEach((row, index) => {
		if (row.length !== columns.length) {
			throw new Error(`DataTable row ${index} has ${row.length} cells, expected ${columns.length}`)
		}
	})
	return (
		<div className="overflow-x-auto rounded-lg border border-border">
			<table className="w-full text-left text-sm">
				<caption className="p-3 text-left text-xs text-muted-foreground">{caption}</caption>
				<thead className="bg-muted">
					<tr>
						{columns.map((column) => (
							<th key={column} scope="col" className="px-3 py-2 font-semibold text-foreground">
								{column}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{rows.map((row, rowIndex) => (
						<tr key={rowIndex} className="border-t border-border">
							{row.map((cell, cellIndex) => (
								<td key={cellIndex} className="px-3 py-2">
									{cell}
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	)
}
```

`components/content/blocks/faq.tsx`:

```tsx
import type { FaqItem } from "@/lib/content/types"

/** Native <details>: every answer is always in the server-rendered HTML for crawlers. Pass the same `items` as seo.faq. */
export default function Faq({ items, heading = "Preguntas frecuentes" }: { items: FaqItem[]; heading?: string }) {
	if (items.length === 0) return null
	return (
		<section aria-labelledby="faq-heading">
			<h2 id="faq-heading" className="text-2xl font-bold tracking-tight text-foreground">
				{heading}
			</h2>
			<div className="mt-4 divide-y divide-border rounded-lg border border-border">
				{items.map((item) => (
					<details key={item.question} className="p-4">
						<summary className="cursor-pointer font-semibold text-foreground">{item.question}</summary>
						<p className="mt-2 text-sm text-foreground/80">{item.answer}</p>
					</details>
				))}
			</div>
		</section>
	)
}
```

`components/content/blocks/glossary.tsx`:

```tsx
export default function Glossary({ terms }: { terms: { term: string; definition: string }[] }) {
	if (terms.length === 0) return null
	return (
		<section aria-labelledby="glosario-heading">
			<h2 id="glosario-heading" className="text-2xl font-bold tracking-tight text-foreground">
				Glosario
			</h2>
			<dl className="mt-4 space-y-3">
				{terms.map(({ term, definition }) => (
					<div key={term}>
						<dt className="font-semibold text-foreground">{term}</dt>
						<dd className="text-sm text-foreground/80">{definition}</dd>
					</div>
				))}
			</dl>
		</section>
	)
}
```

`components/content/blocks/toc.tsx`:

```tsx
export default function Toc({ items }: { items: { id: string; label: string }[] }) {
	return (
		<nav aria-label="Contenido del artículo" className="rounded-lg border border-border p-4">
			<p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">En este artículo</p>
			<ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
				{items.map((item) => (
					<li key={item.id}>
						<a href={`#${item.id}`} className="text-primary hover:underline">
							{item.label}
						</a>
					</li>
				))}
			</ol>
		</nav>
	)
}
```

`components/content/blocks/inline-tool-callout.tsx`:

```tsx
import Link from "next/link"
import { findEntry } from "@/lib/content/registry"
import { contentPath } from "@/lib/content/urls"

/** Mid-article pointer to a tool. Renders nothing for an unknown slug or a slug that isn't a tool. */
export default function InlineToolCallout({ slug }: { slug: string }) {
	const tool = findEntry(slug)
	if (!tool || tool.kind !== "tool") return null
	return (
		<div className="rounded-2xl border border-border bg-card p-5">
			<p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Probá la herramienta</p>
			<Link href={contentPath(tool)} className="mt-1 block text-lg font-bold text-foreground hover:underline">
				{tool.title}
			</Link>
			<p className="mt-1 text-sm text-muted-foreground">{tool.description}</p>
		</div>
	)
}
```

`components/content/blocks/index.ts`:

```ts
export { default as Callout } from "./callout"
export { default as DataTable } from "./data-table"
export { default as Faq } from "./faq"
export { default as Glossary } from "./glossary"
export { default as InlineToolCallout } from "./inline-tool-callout"
export { default as KeyFigures } from "./key-figures"
export type { KeyFigure } from "./key-figures"
export { default as Section } from "./section"
export { default as Summary } from "./summary"
export { default as Toc } from "./toc"
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm exec jest components/content/blocks`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add components/content/blocks
git commit -m "feat(content): economics block kit" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Public /donaciones page and robots

**Files:**
- Create: `components/donations/public-donations.tsx`
- Create: `app/donaciones/page.tsx`
- Modify: `app/robots.ts` (the `allow` array)
- Test: `components/donations/__tests__/public-donations.test.tsx`
- Test: `__tests__/content-robots.test.ts`

**Interfaces:**
- Produces: `PublicDonations` (default export, client component), `BINANCE_ALIAS` (named export), `DonacionesPage` (default export, server component with `metadata`).
- Consumes: `ApachetaCairn` (`components/apacheta-cairn`, default export taking `className`).

- [ ] **Step 1: Write the failing tests**

`components/donations/__tests__/public-donations.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import PublicDonations, { BINANCE_ALIAS } from "@/components/donations/public-donations"
import DonacionesPage, { metadata } from "@/app/donaciones/page"

describe("PublicDonations", () => {
	test("has an h1, a link back to Apacheta and the cafecito button", () => {
		render(<PublicDonations />)
		expect(screen.getByRole("heading", { level: 1, name: "Apoyá el desarrollo de Apacheta" })).toBeInTheDocument()
		expect(screen.getByRole("link", { name: /Volver a Apacheta/ })).toHaveAttribute("href", "/")
		expect(screen.getByRole("link", { name: /Invitame un café/ })).toHaveAttribute("href", "https://cafecito.app/apacheta")
	})

	test("shows the Binance alias and copies it to the clipboard", async () => {
		const user = userEvent.setup()
		render(<PublicDonations />)
		expect(screen.getByText(new RegExp(BINANCE_ALIAS))).toBeInTheDocument()
		await user.click(screen.getByRole("button", { name: "Copiar alias" }))
		expect(await navigator.clipboard.readText()).toBe(BINANCE_ALIAS)
	})
})

describe("/donaciones route", () => {
	test("renders the public donations view with no auth dependency", () => {
		render(<DonacionesPage />)
		expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument()
	})

	test("has indexable metadata with a canonical url", () => {
		expect(metadata.title).toBe("Donaciones | Apacheta")
		expect(metadata.alternates?.canonical).toBe("https://apacheta.ar/donaciones")
		expect(String(metadata.description).length).toBeLessThanOrEqual(155)
	})
})
```

`__tests__/content-robots.test.ts`:

```ts
import robots from "@/app/robots"

describe("robots", () => {
	test("allows blog, herramientas and donaciones", () => {
		const rules = robots().rules as { allow: string[] }
		for (const path of ["/blog", "/blog/*", "/herramientas", "/herramientas/*", "/donaciones"]) {
			expect(rules.allow).toContain(path)
		}
	})

	test("still blocks the dashboard", () => {
		const rules = robots().rules as { disallow: string[] }
		expect(rules.disallow).toContain("/dashboard")
	})
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm exec jest components/donations __tests__/content-robots.test.ts`
Expected: FAIL (module not found for public-donations; robots allow list lacks `/herramientas`).

- [ ] **Step 3: Implement**

`components/donations/public-donations.tsx`:

```tsx
"use client"

import { useState, type ReactNode } from "react"
import Link from "next/link"
import { ArrowLeft, Check, Copy, QrCode } from "lucide-react"
import ApachetaCairn from "@/components/apacheta-cairn"

export const BINANCE_ALIAS = "User-6fcb1"

function PaymentCard({ title, description, children }: { title: string; description: string; children: ReactNode }) {
	return (
		<div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
			<div>
				<h2 className="font-semibold text-foreground">{title}</h2>
				<p className="mt-1 text-sm text-muted-foreground">{description}</p>
			</div>
			{children}
		</div>
	)
}

function BinanceQr() {
	const [failed, setFailed] = useState(false)
	const [copied, setCopied] = useState(false)

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(BINANCE_ALIAS)
			setCopied(true)
			setTimeout(() => setCopied(false), 1500)
		} catch {
			// clipboard blocked (permissions, non-secure context), nothing to fall back to
		}
	}

	return (
		<div className="flex flex-col items-center gap-2">
			<div className="flex aspect-square w-full max-w-40 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted">
				{failed ? (
					<QrCode className="h-8 w-8 text-muted-foreground" />
				) : (
					<img
						src="/binance-pay-qr.png"
						alt="Binance Pay QR"
						className="h-full w-full object-contain"
						onError={() => setFailed(true)}
					/>
				)}
			</div>
			<div className="flex items-center gap-1.5">
				<p className="text-xs text-muted-foreground">Alias: {BINANCE_ALIAS}</p>
				<button
					type="button"
					onClick={handleCopy}
					aria-label="Copiar alias"
					className="text-muted-foreground transition-colors hover:text-foreground"
				>
					{copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
				</button>
			</div>
		</div>
	)
}

/** Public twin of the dashboard donations page, no auth or dashboard context. */
export default function PublicDonations() {
	return (
		<main className="mx-auto max-w-4xl space-y-8 px-5 py-10 sm:px-6">
			<Link
				href="/"
				className="inline-flex items-center gap-1.5 font-mono text-xs tracking-wide text-muted-foreground transition-colors hover:text-foreground"
			>
				<ArrowLeft className="h-3.5 w-3.5" />
				Volver a Apacheta
			</Link>

			<header className="flex flex-col items-center gap-3 text-center">
				<span className="grid h-16 w-16 place-items-center rounded-full border border-primary/30 bg-primary/15">
					<ApachetaCairn className="h-9 w-9 text-primary" />
				</span>
				<h1 className="text-2xl font-bold text-foreground md:text-3xl">Apoyá el desarrollo de Apacheta</h1>
				<p className="max-w-xl text-balance text-sm text-muted-foreground">
					Apacheta es un proyecto desarrollado con dedicación para ayudarte a alcanzar tus metas financieras. Tu contribución
					cubre el hosting, el dominio y el tiempo que le dedico a seguir agregando funciones nuevas.
				</p>
			</header>

			<div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
				<PaymentCard title="Pesos (ARS)" description="Invitanos un cafecito desde Argentina">
					<a href="https://cafecito.app/apacheta" rel="noopener noreferrer" target="_blank">
						<img
							srcSet="https://cdn.cafecito.app/imgs/buttons/button_1.png 1x, https://cdn.cafecito.app/imgs/buttons/button_1_2x.png 2x, https://cdn.cafecito.app/imgs/buttons/button_1_3.75x.png 3.75x"
							src="https://cdn.cafecito.app/imgs/buttons/button_1.png"
							alt="Invitame un café en cafecito.app"
						/>
					</a>
				</PaymentCard>
				<PaymentCard title="Cripto" description="Escaneá con la app de Binance para enviar">
					<BinanceQr />
				</PaymentCard>
			</div>

			<p className="text-center text-sm text-muted-foreground">
				Gracias por sumarte, cada contribución ayuda, sin importar el monto.
			</p>
		</main>
	)
}
```

`app/donaciones/page.tsx`:

```tsx
import type { Metadata } from "next"
import PublicDonations from "@/components/donations/public-donations"

export const metadata: Metadata = {
	title: "Donaciones | Apacheta",
	description: "Apoyá el desarrollo de Apacheta con una donación en pesos (Cafecito) o en cripto (Binance Pay).",
	alternates: { canonical: "https://apacheta.ar/donaciones" },
	openGraph: {
		type: "website",
		url: "https://apacheta.ar/donaciones",
		title: "Donaciones | Apacheta",
		locale: "es_AR",
		siteName: "Apacheta",
	},
}

export default function DonacionesPage() {
	return <PublicDonations />
}
```

Modify `app/robots.ts`, replace:

```ts
			allow: ['/', '/brunojular', '/brunojular/*', '/blog', '/blog/*'],
```

with:

```ts
			allow: [
				'/',
				'/brunojular',
				'/brunojular/*',
				'/blog',
				'/blog/*',
				'/herramientas',
				'/herramientas/*',
				'/donaciones',
			],
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm exec jest components/donations __tests__/content-robots.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add components/donations/public-donations.tsx components/donations/__tests__ app/donaciones app/robots.ts __tests__/content-robots.test.ts
git commit -m "feat(donaciones): public donations page and robots allow-list" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Economics starter, first post, and page guardrail test

**Files:**
- Create: `components/content/starters/economics-topic.starter.tsx`
- Create: `app/blog/layout.tsx`
- Create: `app/herramientas/layout.tsx`
- Create: `app/blog/que-es-la-inflacion/meta.ts`
- Create: `app/blog/que-es-la-inflacion/page.tsx`
- Modify: `lib/content/registry.ts` (register the post)
- Test: `components/content/__tests__/economics-starter.test.tsx`
- Test: `__tests__/content-pages-guardrail.test.ts`

**Interfaces:**
- Consumes: `ContentShell` (default export), blocks from `@/components/content/blocks`, `buildMetadata` (`seo.ts`), `parseMeta`/`parseSeo` (`schema.ts`), `entries` (`registry.ts`).
- Produces: `starterMeta: ContentMeta`, `starterSeo: ContentSeo`, `EconomicsTopicStarter` (default export) in the starter file; `meta` export in `app/blog/que-es-la-inflacion/meta.ts`; the `// [registry:imports]` / `// [registry:entries]` markers are where the generator appends.

- [ ] **Step 1: Write the failing tests**

`components/content/__tests__/economics-starter.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react"
import EconomicsTopicStarter, { starterMeta, starterSeo } from "@/components/content/starters/economics-topic.starter"
import { parseMeta, parseSeo } from "@/lib/content/schema"

describe("economics-topic starter", () => {
	test("its meta and seo are valid, so the starter never rots", () => {
		expect(() => parseMeta(starterMeta)).not.toThrow()
		expect(() => parseSeo(starterSeo)).not.toThrow()
	})

	test("renders inside ContentShell with one h1 and the mandatory chrome", () => {
		const { container } = render(<EconomicsTopicStarter />)
		expect(container.querySelectorAll("h1")).toHaveLength(1)
		expect(screen.getByText(/no constituye asesoramiento financiero/)).toBeInTheDocument()
		expect(container.querySelector("aside")).not.toBeNull()
	})

	test("composes the kit: summary, toc, sections, faq", () => {
		render(<EconomicsTopicStarter />)
		expect(screen.getByRole("heading", { name: "En resumen" })).toBeInTheDocument()
		expect(screen.getByRole("navigation", { name: "Contenido del artículo" })).toBeInTheDocument()
		expect(screen.getByRole("heading", { name: "Preguntas frecuentes" })).toBeInTheDocument()
	})
})
```

`__tests__/content-pages-guardrail.test.ts`:

```ts
/** @jest-environment node */
import fs from "fs"
import path from "path"
import { entries } from "@/lib/content/registry"
import type { ContentKind } from "@/lib/content/types"

const ROOT = path.resolve(__dirname, "..")
const SECTIONS: { dir: string; kind: ContentKind }[] = [
	{ dir: "app/blog", kind: "post" },
	{ dir: "app/herramientas", kind: "tool" },
]

function pageSlugs(dir: string): string[] {
	const abs = path.join(ROOT, dir)
	if (!fs.existsSync(abs)) return []
	return fs
		.readdirSync(abs, { withFileTypes: true })
		.filter((d) => d.isDirectory() && fs.existsSync(path.join(abs, d.name, "page.tsx")))
		.map((d) => d.name)
}

describe.each(SECTIONS)("content pages in $dir", ({ dir, kind }) => {
	const slugs = pageSlugs(dir)

	test("every page follows the CLAUDE.md rules", () => {
		const violations: string[] = []
		for (const slug of slugs) {
			const source = fs.readFileSync(path.join(ROOT, dir, slug, "page.tsx"), "utf8")
			const where = `${dir}/${slug}`
			if (!source.includes("ContentShell")) violations.push(`${where}: does not use ContentShell`)
			if (/<h1[\s>]/.test(source)) violations.push(`${where}: has a stray <h1> (the shell owns it)`)
			if (!/dynamic\s*=\s*["']force-static["']/.test(source)) violations.push(`${where}: missing force-static`)
			if (!source.includes("generateMetadata") || !source.includes("buildMetadata")) {
				violations.push(`${where}: generateMetadata must use buildMetadata(meta)`)
			}
			if (!fs.existsSync(path.join(ROOT, dir, slug, "meta.ts"))) violations.push(`${where}: missing meta.ts`)
		}
		expect(violations).toEqual([])
	})

	test("every page folder is registered with the right kind", () => {
		const missing = slugs.filter((slug) => !entries.some((e) => e.slug === slug && e.kind === kind))
		expect(missing).toEqual([])
	})

	test("every registry entry of this kind has a page folder", () => {
		const orphans = entries.filter((e) => e.kind === kind && !slugs.includes(e.slug)).map((e) => e.slug)
		expect(orphans).toEqual([])
	})
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm exec jest components/content/__tests__/economics-starter.test.tsx __tests__/content-pages-guardrail.test.ts`
Expected: starter test FAILS (module not found). Guardrail test PASSES vacuously (no pages yet); that's fine, it gets teeth in Step 6.

- [ ] **Step 3: Implement the layouts and the starter**

`app/blog/layout.tsx`:

```tsx
import type { Metadata } from "next"

export const metadata: Metadata = {
	title: { default: "Blog | Apacheta", template: "%s | Apacheta" },
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
	return <>{children}</>
}
```

`app/herramientas/layout.tsx`:

```tsx
import type { Metadata } from "next"

export const metadata: Metadata = {
	title: { default: "Herramientas | Apacheta", template: "%s | Apacheta" },
}

export default function HerramientasLayout({ children }: { children: React.ReactNode }) {
	return <>{children}</>
}
```

`components/content/starters/economics-topic.starter.tsx`:

```tsx
/**
 * Reference composition for a generated economics-topic page. The generator copies this
 * shape into app/blog/<slug>/page.tsx (with meta imported from ./meta) and replaces every
 * EJEMPLO value. It is a starting point, not a constraint: reorder, drop, or add blocks and
 * hand-written JSX freely. The only fixed parts are ContentShell, meta and seo.
 * Body headings use <h2> and below (the shell owns the <h1>).
 */
import ContentShell from "@/components/content/content-shell"
import { Callout, DataTable, Faq, Glossary, InlineToolCallout, KeyFigures, Section, Summary, Toc } from "@/components/content/blocks"
import type { ContentMeta, ContentSeo } from "@/lib/content/types"

export const starterMeta: ContentMeta = {
	slug: "ejemplo-tema-economico",
	kind: "post",
	title: "EJEMPLO: título del tema económico",
	description: "EJEMPLO: una descripción de hasta 155 caracteres que explique el tema y por qué importa.",
	publishedAt: "2026-09-30",
	category: "economia",
	tags: ["ejemplo"],
}

export const starterSeo: ContentSeo = {
	summary: "EJEMPLO: dos o tres oraciones que respondan la pregunta central del tema.",
	faq: [{ question: "EJEMPLO: ¿una pregunta frecuente?", answer: "EJEMPLO: su respuesta." }],
	sources: [{ name: "EJEMPLO: fuente oficial", url: "https://www.indec.gob.ar/" }],
}

const sections = [
	{ id: "que-es", label: "Qué es" },
	{ id: "como-funciona", label: "Cómo funciona" },
]

export default function EconomicsTopicStarter() {
	return (
		<ContentShell meta={starterMeta} seo={starterSeo}>
			<Summary text={starterSeo.summary} />
			<KeyFigures figures={[{ label: "EJEMPLO: dato", value: "0,0%", asOf: "EJEMPLO: mes de 2026" }]} />
			<Toc items={sections} />
			<Section id="que-es" heading="Qué es">
				<p>EJEMPLO: explicá el concepto en lenguaje simple.</p>
				<Callout title="EJEMPLO: aclaración importante">
					<p>EJEMPLO: algo que el lector no debería confundir.</p>
				</Callout>
			</Section>
			<Section id="como-funciona" heading="Cómo funciona">
				<DataTable caption="EJEMPLO: comparación" columns={["A", "B"]} rows={[["EJEMPLO", "EJEMPLO"]]} />
			</Section>
			<InlineToolCallout slug="ejemplo-herramienta" />
			<Glossary terms={[{ term: "EJEMPLO", definition: "EJEMPLO: definición breve." }]} />
			<Faq items={starterSeo.faq ?? []} />
		</ContentShell>
	)
}
```

- [ ] **Step 4: Write the first real post**

`app/blog/que-es-la-inflacion/meta.ts`:

```ts
import type { ContentMeta } from "@/lib/content/types"

export const meta: ContentMeta = {
	slug: "que-es-la-inflacion",
	kind: "post",
	title: "Qué es la inflación y cómo te afecta en Argentina",
	description:
		"Explicamos qué es la inflación, cómo la mide el INDEC y qué podés hacer para cuidar tu plata cuando los precios suben todos los meses.",
	publishedAt: "2026-09-30",
	category: "economia",
	tags: ["inflacion", "indec", "ipc", "precios", "poder-adquisitivo"],
}
```

`app/blog/que-es-la-inflacion/page.tsx`:

```tsx
import Link from "next/link"
import ContentShell from "@/components/content/content-shell"
import { Callout, DataTable, Faq, Glossary, Section, Summary, Toc } from "@/components/content/blocks"
import { buildMetadata } from "@/lib/content/seo"
import type { ContentSeo } from "@/lib/content/types"
import { meta } from "./meta"

export const dynamic = "force-static"

export function generateMetadata() {
	return buildMetadata(meta)
}

const seo: ContentSeo = {
	summary:
		"La inflación es el aumento general y sostenido de los precios: con la misma plata comprás menos cosas que antes. En Argentina la mide el INDEC todos los meses con el índice de precios al consumidor (IPC).",
	faq: [
		{
			question: "¿La inflación es lo mismo que la suba del dólar?",
			answer:
				"No. La inflación mide la suba general de los precios en pesos. El dólar es un precio más de la economía y puede influir en otros precios, pero no es lo mismo.",
		},
		{
			question: "¿Cada cuánto publica el INDEC la inflación?",
			answer: "El INDEC publica el índice de precios al consumidor (IPC) una vez por mes, con los datos del mes anterior.",
		},
		{
			question: "¿Qué significa que la inflación baje?",
			answer:
				"Que los precios siguen subiendo, pero más despacio. Eso se llama desinflación y no es lo mismo que una baja de precios.",
		},
	],
	sources: [{ name: "INDEC: Instituto Nacional de Estadística y Censos", url: "https://www.indec.gob.ar/" }],
}

const sections = [
	{ id: "que-es", label: "Qué es la inflación" },
	{ id: "como-se-mide", label: "Cómo se mide" },
	{ id: "como-te-afecta", label: "Cómo te afecta" },
	{ id: "como-cuidar-tu-plata", label: "Cómo cuidar tu plata" },
]

export default function QueEsLaInflacionPage() {
	return (
		<ContentShell meta={meta} seo={seo}>
			<Summary text={seo.summary} />
			<Toc items={sections} />

			<Section id="que-es" heading="Qué es la inflación">
				<p>
					Hay inflación cuando los precios de los bienes y servicios suben de forma general y sostenida en el tiempo. No
					se trata de que un producto se encarezca: lo que importa es que, en promedio, todo cuesta más. El resultado es que
					tu dinero pierde poder de compra.
				</p>
				<Callout title="No toda suba de precios es inflación">
					<p>
						Que la verdura suba por una helada es una suba puntual. Hablamos de inflación cuando la suba es general y se
						sostiene mes tras mes.
					</p>
				</Callout>
			</Section>

			<Section id="como-se-mide" heading="Cómo se mide">
				<p>
					En Argentina la inflación oficial la calcula el INDEC con el Índice de Precios al Consumidor (IPC). El IPC compara
					el precio de una canasta de bienes y servicios representativa del consumo de los hogares y publica la variación
					porcentual. Se publica todos los meses, y hay dos formas de leerlo.
				</p>
				<DataTable
					caption="Dos formas de leer el IPC"
					columns={["Medida", "Qué compara", "Para qué sirve"]}
					rows={[
						["Mensual", "Un mes contra el mes anterior", "Ver la velocidad actual de los precios"],
						["Interanual", "Un mes contra el mismo mes del año anterior", "Ver el efecto acumulado en un año"],
					]}
				/>
			</Section>

			<Section id="como-te-afecta" heading="Cómo te afecta">
				<p>
					Si tus ingresos o tus ahorros en pesos no suben al menos al ritmo de los precios, cada mes alcanzan para menos. Por
					eso conviene comparar siempre lo que ganás, o lo que rinde tu ahorro, contra la inflación, y no mirar solo el
					monto.
				</p>
			</Section>

			<Section id="como-cuidar-tu-plata" heading="Cómo cuidar tu plata">
				<ul className="list-disc space-y-2 pl-5">
					<li>Anotá tus gastos para saber cuánto te cuesta realmente tu propia canasta.</li>
					<li>Compará lo que rinde tu ahorro contra la inflación.</li>
					<li>Evitá dejar plata quieta mucho tiempo sin rendimiento.</li>
					<li>Revisá tu presupuesto seguido cuando los precios se mueven rápido.</li>
				</ul>
				<p>
					En{" "}
					<Link href="/" className="text-primary hover:underline">
						Apacheta
					</Link>{" "}
					podés registrar tus movimientos y armar un presupuesto para tener ese panorama a mano.
				</p>
			</Section>

			<Glossary
				terms={[
					{ term: "IPC", definition: "Índice de Precios al Consumidor: mide la variación de los precios de una canasta de consumo." },
					{ term: "INDEC", definition: "Instituto Nacional de Estadística y Censos: el organismo que publica la inflación oficial." },
					{ term: "Poder adquisitivo", definition: "La cantidad de bienes y servicios que podés comprar con una suma de dinero." },
					{ term: "Inflación interanual", definition: "La variación de precios de un mes contra el mismo mes del año anterior." },
				]}
			/>
			<Faq items={seo.faq ?? []} />
		</ContentShell>
	)
}
```

Modify `lib/content/registry.ts`: replace the two marker lines so the file contains:

```ts
import { meta as queEsLaInflacion } from "@/app/blog/que-es-la-inflacion/meta"
// [registry:imports] one import line per post/tool, appended by the generator

export const entries: ContentMeta[] = [
	queEsLaInflacion,
	// [registry:entries]
]
```

(Keep the existing type imports and the code below `entries` unchanged. The `// [registry:imports]` comment moves to sit directly after the new import.)

- [ ] **Step 5: Run the new tests**

Run: `pnpm exec jest components/content __tests__/content-pages-guardrail.test.ts lib/content`
Expected: PASS. The guardrail now exercises `app/blog/que-es-la-inflacion` (registered, `ContentShell`, `force-static`, `buildMetadata`, no `<h1`). The real registry validates at import, so a title or description over its limit fails here.

- [ ] **Step 6: Prove the guardrail has teeth, then undo**

Temporarily remove the `queEsLaInflacion,` line from `entries` in `lib/content/registry.ts` and run `pnpm exec jest __tests__/content-pages-guardrail.test.ts`.
Expected: FAIL with `"que-es-la-inflacion"` listed under "every page folder is registered". Restore the line and re-run: PASS.

- [ ] **Step 7: Commit**

```bash
git add components/content/starters components/content/__tests__/economics-starter.test.tsx app/blog app/herramientas lib/content/registry.ts __tests__/content-pages-guardrail.test.ts
git commit -m "feat(content): economics starter, blog/herramientas layouts, first post, guardrail test" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Index pages (/blog and /herramientas)

**Files:**
- Create: `components/content/content-card.tsx`
- Create: `components/content/index-layout.tsx`
- Create: `app/blog/page.tsx`
- Create: `app/herramientas/page.tsx`
- Test: `components/content/__tests__/index-pages.test.tsx`

**Interfaces:**
- Consumes: `ApachetaBlurb`, `Breadcrumbs`, `DonationCard`, `JsonLd` (Task 4); `listByKind` (`registry.ts`); `sectionCrumbs`, `contentPath`, `SITE_URL` (`urls.ts`); `breadcrumbJsonLd` (`seo.ts`); `formatDate`; `CATEGORY_LABELS`.
- Produces: `ContentCard({ meta })`, `ContentIndexLayout({ section: ContentKind, title, intro, children })` (default exports), `BlogIndexPage` and `HerramientasIndexPage` (default exports with `metadata`).

- [ ] **Step 1: Write the failing tests**

`components/content/__tests__/index-pages.test.tsx`:

```tsx
import { render, screen, within } from "@testing-library/react"
import BlogIndexPage, { metadata as blogMetadata } from "@/app/blog/page"
import HerramientasIndexPage, { metadata as toolsMetadata } from "@/app/herramientas/page"
import type { ContentMeta } from "@/lib/content/types"
import { makeMeta, makeTool } from "@/lib/content/__fixtures__/meta"

let mockEntries: ContentMeta[] = []
jest.mock("@/lib/content/registry", () => ({
	listByKind: (kind: string) => mockEntries.filter((entry) => entry.kind === kind),
}))

beforeEach(() => {
	mockEntries = []
})

describe("/blog index", () => {
	test("groups posts under a heading per category, with chip links to each group", () => {
		mockEntries = [
			makeMeta({ slug: "eco-uno", title: "Post de economía", category: "economia" }),
			makeMeta({ slug: "novedad", title: "Post de novedades", category: "apacheta" }),
		]
		render(<BlogIndexPage />)
		expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument()
		const chips = screen.getByRole("navigation", { name: "Categorías" })
		expect(within(chips).getByRole("link", { name: /Economía/ })).toHaveAttribute("href", "#economia")
		expect(within(chips).getByRole("link", { name: /Novedades de Apacheta/ })).toHaveAttribute("href", "#apacheta")
		expect(within(chips).queryByRole("link", { name: /Varios/ })).not.toBeInTheDocument()
		expect(screen.getByRole("heading", { level: 2, name: "Economía" })).toBeInTheDocument()
		expect(screen.getByRole("link", { name: "Post de economía" })).toHaveAttribute("href", "/blog/eco-uno")
		expect(screen.getByRole("link", { name: "Post de novedades" })).toHaveAttribute("href", "/blog/novedad")
	})

	test("shows an empty state when there are no posts", () => {
		render(<BlogIndexPage />)
		expect(screen.getByText(/Pronto vas a encontrar artículos/)).toBeInTheDocument()
		expect(screen.queryByRole("navigation", { name: "Categorías" })).not.toBeInTheDocument()
	})

	test("has the Apacheta blurb, breadcrumbs, a donation card and BreadcrumbList JSON-LD", () => {
		const { container } = render(<BlogIndexPage />)
		expect(screen.getByText(/Este sitio es parte de/)).toBeInTheDocument()
		expect(within(screen.getByRole("navigation", { name: "Breadcrumb" })).getByText("Blog")).toHaveAttribute("aria-current", "page")
		expect(screen.getAllByRole("link", { name: /Doná/ })[0]).toHaveAttribute("href", "/donaciones")
		const types = Array.from(container.querySelectorAll('script[type="application/ld+json"]')).map(
			(script) => JSON.parse(script.textContent ?? "{}")["@type"],
		)
		expect(types).toEqual(["BreadcrumbList"])
	})

	test("has indexable metadata", () => {
		expect(blogMetadata.title).toBe("Blog")
		expect(blogMetadata.alternates?.canonical).toBe("https://apacheta.ar/blog")
		expect(String(blogMetadata.description).length).toBeLessThanOrEqual(155)
	})
})

describe("/herramientas index", () => {
	test("lists tools as links", () => {
		mockEntries = [makeTool({ slug: "calculadora", title: "Calculadora de ejemplo" })]
		render(<HerramientasIndexPage />)
		expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument()
		expect(screen.getByRole("link", { name: "Calculadora de ejemplo" })).toHaveAttribute("href", "/herramientas/calculadora")
	})

	test("shows an empty state when there are no tools yet", () => {
		render(<HerramientasIndexPage />)
		expect(screen.getByText(/Pronto vas a encontrar herramientas/)).toBeInTheDocument()
	})

	test("has indexable metadata", () => {
		expect(toolsMetadata.title).toBe("Herramientas")
		expect(toolsMetadata.alternates?.canonical).toBe("https://apacheta.ar/herramientas")
		expect(String(toolsMetadata.description).length).toBeLessThanOrEqual(155)
	})
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm exec jest components/content/__tests__/index-pages.test.tsx`
Expected: FAIL with "Cannot find module '@/app/blog/page'".

- [ ] **Step 3: Implement**

`components/content/content-card.tsx`:

```tsx
import Link from "next/link"
import { formatDate } from "@/lib/content/format"
import type { ContentMeta } from "@/lib/content/types"
import { contentPath } from "@/lib/content/urls"

export default function ContentCard({ meta }: { meta: ContentMeta }) {
	return (
		<article className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40">
			<h3 className="text-lg font-bold leading-snug text-foreground">
				<Link href={contentPath(meta)} className="hover:underline">
					{meta.title}
				</Link>
			</h3>
			<p className="mt-2 text-sm text-muted-foreground">{meta.description}</p>
			<p className="mt-3 font-mono text-[11px] text-muted-foreground">
				<time dateTime={meta.publishedAt}>{formatDate(meta.publishedAt)}</time>
			</p>
		</article>
	)
}
```

`components/content/index-layout.tsx`:

```tsx
import type { ReactNode } from "react"
import ApachetaBlurb from "@/components/content/apacheta-blurb"
import Breadcrumbs from "@/components/content/breadcrumbs"
import DonationCard from "@/components/content/donation-card"
import JsonLd from "@/components/content/json-ld"
import { breadcrumbJsonLd } from "@/lib/content/seo"
import type { ContentKind } from "@/lib/content/types"
import { sectionCrumbs } from "@/lib/content/urls"

/** Chrome for /blog and /herramientas: blurb, breadcrumbs, donation card. No sidebar (nothing to relate to). */
export default function ContentIndexLayout({
	section,
	title,
	intro,
	children,
}: {
	section: ContentKind
	title: string
	intro: string
	children: ReactNode
}) {
	const crumbs = sectionCrumbs(section)
	return (
		<div className="min-h-screen bg-background">
			<ApachetaBlurb variant="index" />
			<main className="mx-auto max-w-4xl px-5 py-10 sm:px-6">
				<Breadcrumbs crumbs={crumbs} />
				<h1 className="mt-6 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">{title}</h1>
				<p className="mt-3 max-w-2xl text-lg text-foreground/80">{intro}</p>
				<div className="mt-10 space-y-12">{children}</div>
				<DonationCard className="mt-16" />
			</main>
			<JsonLd data={[breadcrumbJsonLd(crumbs)]} />
		</div>
	)
}
```

`app/blog/page.tsx`:

```tsx
import type { Metadata } from "next"
import ContentCard from "@/components/content/content-card"
import ContentIndexLayout from "@/components/content/index-layout"
import { listByKind } from "@/lib/content/registry"
import { CATEGORY_LABELS, type BlogCategory } from "@/lib/content/types"
import { SITE_URL } from "@/lib/content/urls"

export const dynamic = "force-static"

export const metadata: Metadata = {
	title: "Blog",
	description: "Artículos sobre economía, finanzas personales y novedades de Apacheta, pensados para Argentina.",
	alternates: { canonical: `${SITE_URL}/blog` },
	openGraph: {
		type: "website",
		url: `${SITE_URL}/blog`,
		title: "Blog | Apacheta",
		locale: "es_AR",
		siteName: "Apacheta",
	},
}

const CATEGORY_ORDER: BlogCategory[] = ["economia", "apacheta", "random"]

export default function BlogIndexPage() {
	const posts = listByKind("post")
	const groups = CATEGORY_ORDER.map((category) => ({
		category,
		posts: posts.filter((post) => post.category === category),
	})).filter((group) => group.posts.length > 0)

	return (
		<ContentIndexLayout
			section="post"
			title="Blog de Apacheta"
			intro="Economía explicada simple, finanzas personales y novedades de la app, pensado para Argentina."
		>
			{groups.length === 0 ? (
				<p className="text-muted-foreground">Pronto vas a encontrar artículos acá.</p>
			) : (
				<>
					<nav aria-label="Categorías" className="flex flex-wrap gap-2">
						{groups.map((group) => (
							<a
								key={group.category}
								href={`#${group.category}`}
								className="rounded-full bg-muted px-3 py-1 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
							>
								{CATEGORY_LABELS[group.category]} ({group.posts.length})
							</a>
						))}
					</nav>
					{groups.map((group) => (
						<section key={group.category} id={group.category} aria-labelledby={`${group.category}-heading`} className="scroll-mt-20">
							<h2 id={`${group.category}-heading`} className="text-2xl font-bold tracking-tight text-foreground">
								{CATEGORY_LABELS[group.category]}
							</h2>
							<div className="mt-4 grid gap-4 sm:grid-cols-2">
								{group.posts.map((post) => (
									<ContentCard key={post.slug} meta={post} />
								))}
							</div>
						</section>
					))}
				</>
			)}
		</ContentIndexLayout>
	)
}
```

`app/herramientas/page.tsx`:

```tsx
import type { Metadata } from "next"
import ContentCard from "@/components/content/content-card"
import ContentIndexLayout from "@/components/content/index-layout"
import { listByKind } from "@/lib/content/registry"
import { SITE_URL } from "@/lib/content/urls"

export const dynamic = "force-static"

export const metadata: Metadata = {
	title: "Herramientas",
	description: "Calculadoras y herramientas gratuitas de finanzas personales para Argentina: inflación, conversión de dólar y más.",
	alternates: { canonical: `${SITE_URL}/herramientas` },
	openGraph: {
		type: "website",
		url: `${SITE_URL}/herramientas`,
		title: "Herramientas | Apacheta",
		locale: "es_AR",
		siteName: "Apacheta",
	},
}

export default function HerramientasIndexPage() {
	const tools = listByKind("tool")
	return (
		<ContentIndexLayout
			section="tool"
			title="Herramientas de Apacheta"
			intro="Calculadoras y conversores simples para tomar mejores decisiones con tu plata."
		>
			{tools.length === 0 ? (
				<p className="text-muted-foreground">Pronto vas a encontrar herramientas acá.</p>
			) : (
				<div className="grid gap-4 sm:grid-cols-2">
					{tools.map((tool) => (
						<ContentCard key={tool.slug} meta={tool} />
					))}
				</div>
			)}
		</ContentIndexLayout>
	)
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm exec jest components/content`
Expected: PASS (including earlier content tests).

- [ ] **Step 5: Commit**

```bash
git add components/content/content-card.tsx components/content/index-layout.tsx components/content/__tests__/index-pages.test.tsx app/blog/page.tsx app/herramientas/page.tsx
git commit -m "feat(content): blog and herramientas index pages" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 9: Registry-driven sitemap

**Files:**
- Modify: `app/sitemap.ts`
- Test: `__tests__/content-sitemap.test.ts`

**Interfaces:**
- Consumes: `entries` (`registry.ts`), `contentUrl` (`urls.ts`), existing `projects`.

- [ ] **Step 1: Write the failing test**

`__tests__/content-sitemap.test.ts`:

```ts
import sitemap from "@/app/sitemap"

jest.mock("@/lib/content/registry", () => {
	const { makeMeta, makeTool } = jest.requireActual("@/lib/content/__fixtures__/meta")
	return {
		entries: [
			makeMeta({ slug: "un-post", publishedAt: "2026-09-01" }),
			makeMeta({ slug: "post-actualizado", publishedAt: "2026-09-01", updatedAt: "2026-09-20" }),
			makeTool({ slug: "una-tool", publishedAt: "2026-09-05" }),
		],
	}
})

describe("sitemap", () => {
	const items = sitemap()
	const find = (url: string) => items.find((item) => item.url === url)

	test("keeps the existing home and portfolio entries", () => {
		expect(find("https://apacheta.ar")).toBeDefined()
		expect(find("https://apacheta.ar/brunojular")).toBeDefined()
	})

	test("includes both indexes and the public donations page", () => {
		expect(find("https://apacheta.ar/blog")).toBeDefined()
		expect(find("https://apacheta.ar/herramientas")).toBeDefined()
		expect(find("https://apacheta.ar/donaciones")).toBeDefined()
	})

	test("includes every registry entry at its derived url", () => {
		expect(find("https://apacheta.ar/blog/un-post")).toBeDefined()
		expect(find("https://apacheta.ar/herramientas/una-tool")).toBeDefined()
	})

	test("lastModified is updatedAt when present, publishedAt otherwise", () => {
		expect(find("https://apacheta.ar/blog/un-post")?.lastModified).toBe("2026-09-01")
		expect(find("https://apacheta.ar/blog/post-actualizado")?.lastModified).toBe("2026-09-20")
	})
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm exec jest __tests__/content-sitemap.test.ts`
Expected: FAIL (`/blog` entry is undefined).

- [ ] **Step 3: Implement**

Replace `app/sitemap.ts` entirely with:

```ts
import type { MetadataRoute } from 'next'
import { entries } from '@/lib/content/registry'
import { contentUrl } from '@/lib/content/urls'
import { projects } from '@/lib/portfolio/projects'

const siteUrl = 'https://apacheta.ar'

export default function sitemap(): MetadataRoute.Sitemap {
	return [
		{
			url: siteUrl,
			changeFrequency: 'monthly',
			priority: 1,
		},
		{
			url: `${siteUrl}/brunojular`,
			changeFrequency: 'monthly',
			priority: 0.8,
		},
		...projects
			.filter((project) => !project.href)
			.map((project) => ({
				url: `${siteUrl}/brunojular/${project.slug}`,
				changeFrequency: 'yearly' as const,
				priority: 0.5,
			})),
		{
			url: `${siteUrl}/blog`,
			changeFrequency: 'weekly',
			priority: 0.7,
		},
		{
			url: `${siteUrl}/herramientas`,
			changeFrequency: 'weekly',
			priority: 0.7,
		},
		{
			url: `${siteUrl}/donaciones`,
			changeFrequency: 'monthly',
			priority: 0.4,
		},
		...entries.map((entry) => ({
			url: contentUrl(entry),
			lastModified: entry.updatedAt ?? entry.publishedAt,
			changeFrequency: 'monthly' as const,
			priority: entry.kind === 'tool' ? 0.8 : 0.6,
		})),
	]
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm exec jest __tests__/content-sitemap.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/sitemap.ts __tests__/content-sitemap.test.ts
git commit -m "feat(content): derive sitemap from the content registry" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 10: Blog entry points in the landing drawer and dashboard sidebar

Requested mid-planning: add the blog to the landing side nav and the dashboard sidebar. Only **Blog** is linked. `/herramientas` stays unlinked until the first tool ships (its index is an empty state today). The landing link also gives crawlers a path from `/` into the blog.

**Files:**
- Modify: `components/camino/nav.tsx` (drawer links and the stale "future navigation" comment)
- Modify: `components/app-sidebar.tsx` (`secondaryMenuItems` and the lucide import)
- Test: `components/camino/__tests__/nav.test.tsx`
- Test: `components/__tests__/app-sidebar.test.tsx`

**Interfaces:**
- Consumes: the existing `CaminoNav` (default export) and `AppSidebar` (named export). No new exports.

- [ ] **Step 1: Write the failing tests**

`components/camino/__tests__/nav.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react"
import CaminoNav from "../nav"

test("the drawer links to the blog, and the link is in the DOM even while the drawer is closed", () => {
	render(<CaminoNav />)
	expect(screen.getByRole("link", { name: "Blog" })).toHaveAttribute("href", "/blog")
})
```

`components/__tests__/app-sidebar.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"

jest.mock("next/navigation", () => ({ usePathname: () => "/dashboard/inicio" }))
jest.mock("@/lib/hooks/use-logout", () => ({ useLogout: () => jest.fn() }))

beforeAll(() => {
	// jsdom has no matchMedia; SidebarProvider's useIsMobile needs it.
	Object.defineProperty(window, "matchMedia", {
		writable: true,
		value: () => ({ matches: false, addEventListener: jest.fn(), removeEventListener: jest.fn() }),
	})
})

test("the Soporte group links to the public blog", () => {
	render(
		<SidebarProvider>
			<AppSidebar />
		</SidebarProvider>,
	)
	expect(screen.getByRole("link", { name: "Blog" })).toHaveAttribute("href", "/blog")
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm exec jest components/camino/__tests__/nav.test.tsx components/__tests__/app-sidebar.test.tsx`
Expected: both FAIL with "Unable to find an accessible element with the role "link" and name "Blog"".

- [ ] **Step 3: Implement the landing drawer link**

In `components/camino/nav.tsx`, replace the comment line:

```tsx
			{/* side drawer — the place for future navigation (blog, etc.) */}
```

with:

```tsx
			{/* side drawer — site navigation; links stay in the DOM while closed so crawlers see them */}
```

and in the drawer's link list, insert a Blog link as the first child of `<div className="flex flex-1 flex-col gap-0.5 p-3">`, before the "Ingresar" link:

```tsx
						<Link
							href="/blog"
							onClick={() => setOpen(false)}
							className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/80 transition-colors hover:bg-black/5 hover:text-foreground"
						>
							Blog
						</Link>
```

- [ ] **Step 4: Implement the dashboard sidebar link**

In `components/app-sidebar.tsx`, add `BookOpen` to the lucide import:

```tsx
import { Home, Settings, HelpCircle, PiggyBank, Heart, Split, FileSpreadsheet, DollarSign, Map, History, Package, Wallet, LogOut, Bot, BookOpen } from "lucide-react" // Added Map, History, Package
```

and add the item to `secondaryMenuItems`, after "Donaciones":

```tsx
	{
		title: "Blog",
		url: "/blog",
		icon: BookOpen,
	},
```

(The sidebar renders plain `<a href>`, so this is a full navigation out of the dashboard to the public blog, same as its other items.)

- [ ] **Step 5: Run tests to verify they pass**

Run: `pnpm exec jest components/camino components/__tests__/app-sidebar.test.tsx`
Expected: PASS, including the existing `camino-landing.test.tsx`.

- [ ] **Step 6: Commit**

```bash
git add components/camino/nav.tsx components/camino/__tests__/nav.test.tsx components/app-sidebar.tsx components/__tests__/app-sidebar.test.tsx
git commit -m "feat(nav): link the blog from the landing drawer and the dashboard sidebar" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 11: Docs sync and final verification

**Files:**
- Modify: `docs/superpowers/specs/2026-09-30-blog-and-tools-design.md`
- Modify: `CLAUDE.md`

- [ ] **Step 1: Sync the spec with two deliberate deviations**

The index filter is static anchors instead of query params (query params force dynamic rendering, which breaks `force-static` and hides the filter from crawlers), and the kit gains a small `Section` helper. Use the Edit tool on the spec:

Replace `| \`/blog\` | Index of posts, with a category filter (economía, apacheta, random) |` with `| \`/blog\` | Index of posts, grouped by category (economía, apacheta, random) |`.

Replace ``- `/blog` and `/herramientas` list registry entries, newest first. `/blog` has a category filter that works without JS, using query links.`` with:

```
- `/blog` and `/herramientas` list registry entries, newest first. `/blog` groups posts under one `<h2>` per category (anchors `#economia`, `#apacheta`, `#random`) with a chip row linking to them. There's no query-param filter: that would force dynamic rendering, and this way every post is in the static HTML.
- Both indexes carry the blurb, breadcrumbs (with `BreadcrumbList` JSON-LD) and a donation card, but no sidebar.
```

Replace ``used in any order alongside hand-written JSX: `Summary`,`` with ``used in any order alongside hand-written JSX: `Section` (an `<h2>` with an anchor id, pairs with `Toc`), `Summary`,``.

- [ ] **Step 2: Add the "how to add a page" section to CLAUDE.md**

Append to `CLAUDE.md`:

```markdown

## Adding a blog post or tool

1. Create `app/blog/<slug>/` (or `app/herramientas/<slug>/`) with `meta.ts` exporting `meta: ContentMeta` (see `lib/content/types.ts`).
2. Write `page.tsx` from `components/content/starters/economics-topic.starter.tsx`: `export const dynamic = "force-static"`, `generateMetadata() { return buildMetadata(meta) }`, and a body wrapped in `<ContentShell meta={meta} seo={seo}>`. The body layout is free-form. Use `<h2>` and below (the shell owns the `<h1>`), and blocks from `@/components/content/blocks` as needed.
3. Register it in `lib/content/registry.ts`: add the import at `// [registry:imports]` and the entry at `// [registry:entries]`.
4. Run `pnpm exec jest lib/content components/content __tests__/content-pages-guardrail.test.ts`. The registry validates at import, and the guardrail test checks the page rules above.
5. Commit and push. Publishing is a deploy.

Never run `next dev` or `next build` from an agent session here: a second process corrupts the user's `.next`.
```

- [ ] **Step 3: Run the whole test suite**

Run: `pnpm exec jest 2>&1 | tail -20`
Expected: all new tests pass; any failures are identical to the baseline recorded in Task 1, Step 1.

- [ ] **Step 4: Type-check only the new files**

Run:

```bash
pnpm exec tsc --noEmit 2>&1 | grep -E "lib/content|components/content|components/donations/public|app/(blog|herramientas|donaciones)|app/sitemap|app/robots|components/app-sidebar|components/camino/nav|__tests__/content-" || echo "no type errors in new files"
```

Expected: `no type errors in new files`. (The project sets `ignoreBuildErrors`, so `tsc` is the only type gate. Fix anything listed.)

- [ ] **Step 5: Commit**

```bash
git add docs/superpowers/specs/2026-09-30-blog-and-tools-design.md CLAUDE.md
git commit -m "docs: sync blog spec with static index anchors, add how-to-add-a-page to CLAUDE.md" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

- [ ] **Step 6: Hand off the visual check to the user**

Do not start a dev server. Tell the user to open `/blog`, `/blog/que-es-la-inflacion`, `/herramientas` and `/donaciones` on their own running dev server, check mobile width (sidebar below the article, single donation card before the related links), and view-source on the post to confirm the JSON-LD scripts and FAQ answers are present.

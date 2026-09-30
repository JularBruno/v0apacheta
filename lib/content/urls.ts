import type { ContentKind, ContentMeta } from "./types"

export const SITE_URL = "https://apacheta.ar"

export interface Crumb {
	name: string
	path: string
}

// The blog's public name is "Cuadernito"; its URL space stays /blog.
const SECTIONS: Record<ContentKind, Crumb> = {
	post: { name: "Cuadernito", path: "/blog" },
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

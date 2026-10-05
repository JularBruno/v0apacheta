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

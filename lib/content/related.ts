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

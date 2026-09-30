import type { ContentMeta } from "./types"

/** Sort comparator: newest publishedAt first, slug as a stable tie-breaker. */
export function byNewest(
	a: Pick<ContentMeta, "publishedAt" | "slug">,
	b: Pick<ContentMeta, "publishedAt" | "slug">,
): number {
	const diff = Date.parse(b.publishedAt) - Date.parse(a.publishedAt)
	return diff !== 0 ? diff : a.slug.localeCompare(b.slug)
}

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

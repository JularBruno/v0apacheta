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

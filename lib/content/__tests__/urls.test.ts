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

	test("breadcrumbs go Inicio > section > title, the blog section is called Cuadernito", () => {
		expect(breadcrumbsFor(makeMeta({ slug: "mi-post", title: "Mi post" }))).toEqual([
			{ name: "Inicio", path: "/" },
			{ name: "Cuadernito", path: "/blog" },
			{ name: "Mi post", path: "/blog/mi-post" },
		])
		expect(sectionCrumbs("tool")).toEqual([
			{ name: "Inicio", path: "/" },
			{ name: "Herramientas", path: "/herramientas" },
		])
	})
})

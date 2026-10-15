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

	test("breadcrumbs go Inicio > title, and Inicio is the start of the section you are in, never the app's home", () => {
		expect(breadcrumbsFor(makeMeta({ slug: "mi-post", title: "Mi post" }))).toEqual([
			{ name: "Inicio", path: "/blog" },
			{ name: "Mi post", path: "/blog/mi-post" },
		])
		expect(breadcrumbsFor(makeTool({ slug: "mi-tool", title: "Mi tool" }))).toEqual([
			{ name: "Inicio", path: "/herramientas" },
			{ name: "Mi tool", path: "/herramientas/mi-tool" },
		])
		expect(sectionCrumbs("post")).toEqual([{ name: "Inicio", path: "/blog" }])
		expect(sectionCrumbs("tool")).toEqual([{ name: "Inicio", path: "/herramientas" }])
	})
})

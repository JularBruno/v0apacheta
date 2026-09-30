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

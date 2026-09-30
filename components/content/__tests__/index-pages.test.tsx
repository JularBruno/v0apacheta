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

describe("Cuadernito index (/blog)", () => {
	test("groups posts under a heading per category, with chip links to each group", () => {
		mockEntries = [
			makeMeta({ slug: "eco-uno", title: "Post de economía", category: "economia" }),
			makeMeta({ slug: "novedad", title: "Post de novedades", category: "apacheta" }),
		]
		render(<BlogIndexPage />)
		expect(screen.getByRole("heading", { level: 1, name: "Cuadernito de Apacheta" })).toBeInTheDocument()
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
		expect(within(screen.getByRole("navigation", { name: "Breadcrumb" })).getByText("Cuadernito")).toHaveAttribute(
			"aria-current",
			"page",
		)
		expect(screen.getAllByRole("link", { name: /Doná/ })[0]).toHaveAttribute("href", "/donaciones")
		const types = Array.from(container.querySelectorAll('script[type="application/ld+json"]')).map(
			(script) => JSON.parse(script.textContent ?? "{}")["@type"],
		)
		expect(types).toEqual(["BreadcrumbList"])
	})

	test("has indexable metadata", () => {
		expect(blogMetadata.title).toBe("Cuadernito")
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

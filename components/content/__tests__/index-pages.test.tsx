import { render, screen, within } from "@testing-library/react"
import BlogIndexPage, { metadata as blogMetadata } from "@/app/blog/page"
import HerramientasIndexPage, { metadata as toolsMetadata } from "@/app/herramientas/page"
import type { ContentMeta } from "@/lib/content/types"
import { makeMeta, makeTool } from "@/lib/content/__fixtures__/meta"

let mockEntries: ContentMeta[] = []
jest.mock("@/lib/content/registry", () => ({
	listByKind: (kind: string) => mockEntries.filter((entry) => entry.kind === kind),
}))

let mockCommunity: { platform: string; label: string; description: string; href?: string }[] = []
jest.mock("@/lib/content/community", () => ({
	communityLinks: () => mockCommunity,
}))

beforeEach(() => {
	mockEntries = []
	mockCommunity = []
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

	test("shows the community section with social links when they are configured", () => {
		mockCommunity = [
			{ platform: "discord", label: "Discord", description: "Sumate al canal.", href: "https://discord.gg/abc" },
			{ platform: "youtube", label: "YouTube", description: "Mirá los videos.", href: "https://youtube.com/@apacheta" },
		]
		render(<BlogIndexPage />)
		const section = screen.getByRole("region", { name: "Comunidad" })
		expect(within(section).getByRole("link", { name: /Discord/ })).toHaveAttribute("href", "https://discord.gg/abc")
		expect(within(section).getByRole("link", { name: /YouTube/ })).toHaveAttribute("href", "https://youtube.com/@apacheta")
	})

	test("a channel without a url yet shows as Próximamente on the Cuadernito page", () => {
		mockCommunity = [{ platform: "instagram", label: "Instagram", description: "Seguinos." }]
		render(<BlogIndexPage />)
		const section = screen.getByRole("region", { name: "Comunidad" })
		expect(within(section).getByText("Próximamente")).toBeInTheDocument()
		expect(within(section).queryByRole("link")).not.toBeInTheDocument()
	})

	test("shows an empty state when there are no posts", () => {
		render(<BlogIndexPage />)
		expect(screen.getByText(/Pronto vas a encontrar artículos/)).toBeInTheDocument()
		expect(screen.queryByRole("navigation", { name: "Categorías" })).not.toBeInTheDocument()
	})

	test("has the Apacheta trail header, breadcrumbs and BreadcrumbList JSON-LD, with one donation button and no bottom card", () => {
		const { container } = render(<BlogIndexPage />)
		const header = container.querySelector('[data-variant="header"]') as HTMLElement
		expect(within(header).getByText(/Este sitio es parte de/)).toBeInTheDocument()
		expect(within(header).getByRole("link", { name: "Comenzá tu camino" })).toHaveAttribute("href", "/onboarding")
		expect(within(header).getByRole("link", { name: "Doná a Apacheta" })).toHaveAttribute("href", "/donaciones")
		expect(screen.getAllByRole("link", { name: /Doná/ })).toHaveLength(1)
		expect(within(screen.getByRole("navigation", { name: "Breadcrumb" })).getByText("Cuadernito")).toHaveAttribute(
			"aria-current",
			"page",
		)
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

	test("shares with its own twitter text and the site share image, not the homepage's", () => {
		expect(blogMetadata.twitter).toMatchObject({ title: "Cuadernito | Apacheta", images: ["/opengraph-image"] })
		expect(blogMetadata.openGraph).toMatchObject({ title: "Cuadernito | Apacheta", images: ["/opengraph-image"] })
	})
})

describe("/herramientas index", () => {
	test("lists tools as links", () => {
		mockEntries = [makeTool({ slug: "calculadora", title: "Calculadora de ejemplo" })]
		render(<HerramientasIndexPage />)
		expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument()
		expect(screen.getByRole("link", { name: "Calculadora de ejemplo" })).toHaveAttribute("href", "/herramientas/calculadora")
	})

	test("never shows the community section (it lives on the Cuadernito page only)", () => {
		mockCommunity = [{ platform: "discord", label: "Discord", description: "x", href: "https://discord.gg/abc" }]
		render(<HerramientasIndexPage />)
		expect(screen.queryByRole("region", { name: "Comunidad" })).not.toBeInTheDocument()
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

	test("shares with its own twitter text and the site share image, not the homepage's", () => {
		expect(toolsMetadata.twitter).toMatchObject({ title: "Herramientas | Apacheta", images: ["/opengraph-image"] })
		expect(toolsMetadata.openGraph).toMatchObject({ title: "Herramientas | Apacheta", images: ["/opengraph-image"] })
	})
})

import { render, screen, within } from "@testing-library/react"
import ApachetaHeader from "@/components/content/apacheta-header"

// Default to the shipped state: three channels, none with a url yet.
let mockCommunity: { platform: string; label: string; description: string; href?: string }[] = []
jest.mock("@/lib/content/community", () => ({
	communityLinks: () => mockCommunity,
}))

beforeEach(() => {
	mockCommunity = [
		{ platform: "discord", label: "Discord", description: "Sumate al canal." },
		{ platform: "instagram", label: "Instagram", description: "Seguinos." },
		{ platform: "youtube", label: "YouTube", description: "Mirá los videos." },
	]
})

describe("ApachetaHeader (compact landing-style trail header)", () => {
	test("names Apacheta first, in big type but not as a heading (the page's h1 comes later)", () => {
		const { container } = render(<ApachetaHeader variant="post" />)
		const header = container.querySelector('[data-variant="header"]') as HTMLElement
		expect(within(header).getByText("Apacheta", { selector: "p" })).toBeInTheDocument()
		expect(within(header).queryAllByRole("heading")).toHaveLength(0)
		expect(header.querySelectorAll("article")).toHaveLength(0)
	})

	test.each([
		["post", /Este artículo está publicado en/],
		["tool", /Esta herramienta está publicada en/],
		["index", /Este sitio es parte de/],
	] as const)("says where a %s is hosted and links Apacheta to the home page", (variant, copy) => {
		render(<ApachetaHeader variant={variant} />)
		expect(screen.getByText(copy)).toBeInTheDocument()
		expect(screen.getByRole("link", { name: "Apacheta" })).toHaveAttribute("href", "/")
	})

	test("is a landing-style map: one trail with three cairn stations and their cards", () => {
		const { container } = render(<ApachetaHeader variant="post" />)
		expect(container.querySelectorAll("[data-trail]")).toHaveLength(1)
		expect(container.querySelectorAll("[data-station]")).toHaveLength(3)
		expect(container.querySelectorAll("[data-cairn]")).toHaveLength(3)
		expect(container.querySelectorAll("[data-card]")).toHaveLength(3)
		expect(container.querySelectorAll("[data-trail] > svg > path")).toHaveLength(2)
	})

	test("the three stops come in order: Comenzá tu camino, Ver redes, then the donation", () => {
		const { container } = render(<ApachetaHeader variant="post" />)
		const [first, second, third] = Array.from(container.querySelectorAll("[data-station]")) as HTMLElement[]
		expect(within(first).getByRole("link", { name: "Comenzá tu camino" })).toHaveAttribute("href", "/onboarding")
		expect(within(second).getByRole("link", { name: /Ver redes/ })).toHaveAttribute("href", "#comunidad")
		expect(within(third).getByRole("link", { name: "Doná a Apacheta" })).toHaveAttribute("href", "/donaciones")
		expect(within(first).queryByRole("link", { name: /Doná|Ver redes/ })).toBeNull()
		expect(within(second).queryByRole("link", { name: /Doná|Comenzá/ })).toBeNull()
		expect(within(third).queryByRole("link", { name: /Comenzá|Ver redes/ })).toBeNull()
	})

	test("the social stop only redirects to the links at the bottom: no social pills or external links in the header", () => {
		const { container } = render(<ApachetaHeader variant="post" />)
		const header = container.querySelector('[data-variant="header"]') as HTMLElement
		for (const name of ["Discord", "Instagram", "YouTube"]) expect(within(header).queryByText(name)).toBeNull()
		expect(header.querySelectorAll('a[target="_blank"]')).toHaveLength(0)
	})

	test("the cairns sit left, right, left, like the landing trail", () => {
		const { container } = render(<ApachetaHeader variant="post" />)
		const sides = Array.from(container.querySelectorAll("[data-station]")).map((s) =>
			/\bleft\b/.test(s.className) ? "left" : /\bright\b/.test(s.className) ? "right" : "?",
		)
		expect(sides).toEqual(["left", "right", "left"])
	})

	test("the cards are visible from the first render, with no scroll or JS needed to reveal them", () => {
		const { container } = render(<ApachetaHeader variant="post" />)
		const cards = Array.from(container.querySelectorAll("[data-card]"))
		expect(cards).toHaveLength(3)
		for (const card of cards) expect(card.className).toMatch(/\bin\b/)
	})

	test("cards are as small as they can be: a short title and one button, no label, tiny cairns", () => {
		const { container } = render(<ApachetaHeader variant="post" />)
		const stations = Array.from(container.querySelectorAll<HTMLElement>("[data-station]"))
		expect(stations).toHaveLength(3)
		for (const station of stations) expect(station.style.minHeight).toMatch(/^clamp\(/)
		for (const cairn of Array.from(container.querySelectorAll<HTMLElement>("[data-cairn]"))) {
			expect(parseInt(cairn.style.width, 10)).toBeLessThanOrEqual(40)
		}
		for (const card of Array.from(container.querySelectorAll<HTMLElement>("[data-card]"))) {
			expect(parseInt(card.style.width.match(/min\((\d+)px/)?.[1] ?? "999", 10)).toBeLessThanOrEqual(210)
			expect(card.querySelectorAll("a")).toHaveLength(1)
			expect(card.querySelectorAll("p")).toHaveLength(1)
		}
	})

	test("has no milestone art (no figures or images): just the trail, the cairns and the cards", () => {
		const { container } = render(<ApachetaHeader variant="post" />)
		expect(container.querySelectorAll("figure")).toHaveLength(0)
		expect(container.querySelectorAll("img")).toHaveLength(0)
	})

	test("renders without SVG geometry APIs (jsdom), like the landing does", () => {
		expect(() => render(<ApachetaHeader variant="post" />)).not.toThrow()
	})
})

describe("ApachetaHeader when no community channels are configured", () => {
	test("has no dead #comunidad link: the social stop says Próximamente instead", () => {
		mockCommunity = []
		const { container } = render(<ApachetaHeader variant="post" />)
		const second = container.querySelectorAll("[data-station]")[1] as HTMLElement
		expect(within(second).queryAllByRole("link")).toHaveLength(0)
		expect(within(second).getByText("Próximamente")).toBeInTheDocument()
	})
})

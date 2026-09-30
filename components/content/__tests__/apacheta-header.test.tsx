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

const after = (a: Element, b: Element) => Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING)

describe("ApachetaHeader (tall landing-style trail header)", () => {
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

	test("the three stops come in order: Comenzá tu camino, then social links, then the donation", () => {
		const { container } = render(<ApachetaHeader variant="post" />)
		const [first, second, third] = Array.from(container.querySelectorAll("[data-station]")) as HTMLElement[]
		expect(within(first).getByRole("link", { name: "Comenzá tu camino" })).toHaveAttribute("href", "/onboarding")
		expect(within(second).getByText("Discord", { exact: false })).toBeInTheDocument()
		expect(within(second).getByText("Instagram", { exact: false })).toBeInTheDocument()
		expect(within(second).getByText("YouTube", { exact: false })).toBeInTheDocument()
		expect(within(third).getByRole("link", { name: "Doná a Apacheta" })).toHaveAttribute("href", "/donaciones")
		expect(within(first).queryByRole("link", { name: /Doná/ })).toBeNull()
		expect(within(second).queryByRole("link", { name: /Doná|Comenzá/ })).toBeNull()
		expect(within(third).queryByRole("link", { name: /Comenzá/ })).toBeNull()
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

	test("the stations use the landing's own height, so the header is tall (no shrinking override)", () => {
		const { container } = render(<ApachetaHeader variant="post" />)
		const stations = Array.from(container.querySelectorAll<HTMLElement>("[data-station]"))
		expect(stations).toHaveLength(3)
		for (const station of stations) expect(station.style.minHeight).toBe("")
	})

	test("drops two hand-drawn milestones as decorative art: a bridge between stops 1 and 2, an outcrop between 2 and 3", () => {
		const { container } = render(<ApachetaHeader variant="post" />)
		const [first, second, third] = Array.from(container.querySelectorAll("[data-station]"))
		const bridge = container.querySelector('img[src="/scenery/milestones/bridge.webp"]') as HTMLImageElement
		const outcrop = container.querySelector('img[src="/scenery/milestones/outcrop.webp"]') as HTMLImageElement
		expect(bridge).not.toBeNull()
		expect(outcrop).not.toBeNull()
		for (const img of [bridge, outcrop]) expect(img.getAttribute("alt")).toBe("")
		const bridgeFigure = bridge.closest("figure") as HTMLElement
		const outcropFigure = outcrop.closest("figure") as HTMLElement
		expect(after(first, bridgeFigure) && after(bridgeFigure, second)).toBe(true)
		expect(after(second, outcropFigure) && after(outcropFigure, third)).toBe(true)
	})

	test("renders without SVG geometry APIs (jsdom), like the landing does", () => {
		expect(() => render(<ApachetaHeader variant="post" />)).not.toThrow()
	})
})

describe("ApachetaHeader social quick links (second stop)", () => {
	test("a configured channel is an external link that opens safely", () => {
		mockCommunity = [
			{ platform: "discord", label: "Discord", description: "x", href: "https://discord.gg/abc" },
			{ platform: "instagram", label: "Instagram", description: "x", href: "https://instagram.com/apacheta" },
			{ platform: "youtube", label: "YouTube", description: "x", href: "https://youtube.com/@apacheta" },
		]
		const { container } = render(<ApachetaHeader variant="post" />)
		const second = container.querySelectorAll("[data-station]")[1] as HTMLElement
		for (const [label, href] of [
			["Discord", "https://discord.gg/abc"],
			["Instagram", "https://instagram.com/apacheta"],
			["YouTube", "https://youtube.com/@apacheta"],
		]) {
			const link = within(second).getByRole("link", { name: new RegExp(label) })
			expect(link).toHaveAttribute("href", href)
			expect(link).toHaveAttribute("target", "_blank")
			expect(link.getAttribute("rel")).toContain("noopener")
			expect(link.getAttribute("rel")).toContain("noreferrer")
		}
	})

	test("a channel without a url yet is not a link and says it is coming soon", () => {
		const { container } = render(<ApachetaHeader variant="post" />)
		const second = container.querySelectorAll("[data-station]")[1] as HTMLElement
		expect(within(second).queryAllByRole("link")).toHaveLength(0)
		expect(within(second).getAllByText(/próximamente/i).length).toBeGreaterThanOrEqual(3)
	})

	test("mixes configured and pending channels", () => {
		mockCommunity = [
			{ platform: "discord", label: "Discord", description: "x" },
			{ platform: "youtube", label: "YouTube", description: "x", href: "https://youtube.com/@apacheta" },
		]
		const { container } = render(<ApachetaHeader variant="post" />)
		const second = container.querySelectorAll("[data-station]")[1] as HTMLElement
		expect(within(second).getAllByRole("link")).toHaveLength(1)
		expect(within(second).getByRole("link", { name: /YouTube/ })).toBeInTheDocument()
		expect(within(second).getByText(/próximamente/i)).toBeInTheDocument()
	})
})

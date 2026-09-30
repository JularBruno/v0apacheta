import { render, screen, within } from "@testing-library/react"
import ApachetaHeader from "@/components/content/apacheta-header"

describe("ApachetaHeader (landing-style trail header)", () => {
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

	test("then offers Comenzá tu camino, then the donation button", () => {
		render(<ApachetaHeader variant="post" />)
		const start = screen.getByRole("link", { name: "Comenzá tu camino" })
		const donate = screen.getByRole("link", { name: "Doná a Apacheta" })
		expect(start).toHaveAttribute("href", "/onboarding")
		expect(donate).toHaveAttribute("href", "/donaciones")
		expect(start.compareDocumentPosition(donate) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
	})

	test("is a landing-style map: a trail with two cairn stations and their cards", () => {
		const { container } = render(<ApachetaHeader variant="post" />)
		expect(container.querySelectorAll("[data-trail]")).toHaveLength(1)
		expect(container.querySelectorAll("[data-station]")).toHaveLength(2)
		expect(container.querySelectorAll("[data-cairn]")).toHaveLength(2)
		expect(container.querySelectorAll("[data-card]")).toHaveLength(2)
		expect(container.querySelectorAll("[data-trail] > svg > path")).toHaveLength(2)
	})

	test("the cards are visible from the first render, with no scroll or JS needed to reveal them", () => {
		const { container } = render(<ApachetaHeader variant="post" />)
		const cards = Array.from(container.querySelectorAll("[data-card]"))
		expect(cards).toHaveLength(2)
		for (const card of cards) expect(card.className).toMatch(/\bin\b/)
	})

	test("drops the hand-drawn bridge milestone between the two stations, as decorative art", () => {
		const { container } = render(<ApachetaHeader variant="post" />)
		const img = container.querySelector('img[src="/scenery/milestones/bridge.webp"]') as HTMLImageElement
		expect(img).not.toBeNull()
		expect(img.getAttribute("alt")).toBe("")
		const stations = container.querySelectorAll("[data-station]")
		const figure = img.closest("figure") as HTMLElement
		expect(stations[0].compareDocumentPosition(figure) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
		expect(figure.compareDocumentPosition(stations[1]) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
	})

	test("renders without SVG geometry APIs (jsdom), like the landing does", () => {
		expect(() => render(<ApachetaHeader variant="post" />)).not.toThrow()
	})
})

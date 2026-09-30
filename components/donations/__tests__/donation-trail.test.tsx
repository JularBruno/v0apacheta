import { act, render, screen } from "@testing-library/react"
import DonationTrail from "@/components/donations/donation-trail"

const stations = [
	{ title: "Uno", body: <p>cuerpo uno</p> },
	{ title: "Dos", content: <button type="button">ir</button> },
]

type MockIO = { fire: (entries: { isIntersecting: boolean; target: Element }[]) => void }
const observers = () => (globalThis as unknown as { MockIntersectionObserver: { instances: MockIO[] } }).MockIntersectionObserver.instances

describe("DonationTrail, page variant (the default, used by the dashboard)", () => {
	test("titles are h2 headings", () => {
		render(<DonationTrail stations={stations} />)
		expect(screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent)).toEqual(["Uno", "Dos"])
	})

	test("cards stay hidden until their station scrolls into view", () => {
		const { container } = render(<DonationTrail stations={stations} />)
		const els = Array.from(container.querySelectorAll("[data-trail-station]"))
		expect(els.map((el) => el.getAttribute("data-revealed"))).toEqual(["false", "false"])
		act(() => observers()[0].fire([{ isIntersecting: true, target: els[0] }]))
		expect(els.map((el) => el.getAttribute("data-revealed"))).toEqual(["true", "false"])
	})
})

describe("DonationTrail, header variant (public Cuadernito/Herramientas pages)", () => {
	test("titles are plain text, not headings, because the page's h1 comes later", () => {
		const { container } = render(<DonationTrail stations={stations} variant="header" />)
		expect(screen.queryAllByRole("heading")).toHaveLength(0)
		expect(container).toHaveTextContent("Uno")
		expect(container).toHaveTextContent("Dos")
	})

	test("every station is revealed from the first render and no observer is created", () => {
		const { container } = render(<DonationTrail stations={stations} variant="header" />)
		const els = Array.from(container.querySelectorAll("[data-trail-station]"))
		expect(els.map((el) => el.getAttribute("data-revealed"))).toEqual(["true", "true"])
		expect(observers()).toHaveLength(0)
	})

	test("renders each station's body and content", () => {
		render(<DonationTrail stations={stations} variant="header" />)
		expect(screen.getByText("cuerpo uno")).toBeInTheDocument()
		expect(screen.getByRole("button", { name: "ir" })).toBeInTheDocument()
	})

	test("is marked as the header variant for styling", () => {
		const { container } = render(<DonationTrail stations={stations} variant="header" />)
		expect(container.firstElementChild).toHaveAttribute("data-variant", "header")
	})
})

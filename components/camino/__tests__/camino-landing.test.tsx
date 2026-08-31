import { render, screen } from "@testing-library/react"
import CaminoLanding from "../camino-landing"
import { CHAPTERS, HERO } from "@/lib/trail/chapters"

// jsdom implements no SVG geometry; useTrail must bail out cleanly, not throw.
test("renders without SVG geometry APIs", () => {
	expect(() => render(<CaminoLanding />)).not.toThrow()
})

test("shows the hero and its call to action", () => {
	render(<CaminoLanding />)
	expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(HERO.title)
	expect(screen.getAllByRole("link", { name: new RegExp(HERO.cta, "i") }).length).toBeGreaterThan(0)
})

test("renders every chapter as a station", () => {
	render(<CaminoLanding />)
	for (const chapter of CHAPTERS) {
		expect(screen.getByRole("heading", { level: 2, name: chapter.title })).toBeInTheDocument()
	}
	expect(document.querySelectorAll("[data-station]")).toHaveLength(CHAPTERS.length)
	expect(document.querySelectorAll("[data-cairn]")).toHaveLength(CHAPTERS.length)
})

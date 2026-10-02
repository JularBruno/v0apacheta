import { render, screen } from "@testing-library/react"
import Page from "@/app/blog/el-sol-y-la-luna-en-el-cielo/page"

const after = (a: Element, b: Element) => Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING)

describe("the Sol y Luna post", () => {
	test("has a Sun chart in the Sun section and a Moon chart in the Moon section", () => {
		render(<Page />)
		const sunChart = screen.getByRole("region", { name: "Mapa del Sol interactivo" })
		const moonChart = screen.getByRole("region", { name: "Mapa de la Luna interactivo" })
		const sunHeading = screen.getByRole("heading", { level: 2, name: "Probalo: el mapa del Sol" })
		const moonHeading = screen.getByRole("heading", { level: 2, name: "Y la Luna" })
		expect(after(sunHeading, sunChart)).toBe(true)
		expect(after(sunChart, moonHeading)).toBe(true)
		expect(after(moonHeading, moonChart)).toBe(true)
	})

	test("the Moon chart is a real Moon chart: five cycle curves, no Sol/Luna switch", () => {
		const { container } = render(<Page />)
		const moonChart = screen.getByRole("region", { name: "Mapa de la Luna interactivo" })
		expect(moonChart.querySelectorAll("path[data-curve]").length).toBeGreaterThanOrEqual(5)
		expect(moonChart.querySelector('path[data-curve="extremo-sur"]')).not.toBeNull()
		expect(container.querySelector('[role="radiogroup"]')).toBeNull()
	})

	test("starts with what it is good for, right after the hook, summary and contents", () => {
		render(<Page />)
		const headings = screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent)
		expect(headings.indexOf("Para qué sirve")).toBeLessThan(headings.indexOf("Probalo: el mapa del Sol"))
		expect(headings.filter((h) => h === "En resumen" || h === "Para qué sirve")).toEqual(["En resumen", "Para qué sirve"])
		expect(headings.indexOf("Para qué sirve")).toBeLessThan(headings.indexOf("Cómo leer el mapa"))
	})

	test("the skin-protection section is there, with the computed 45° table", () => {
		render(<Page />)
		expect(screen.getByRole("heading", { level: 2, name: /Cuidá tu piel/ })).toBeInTheDocument()
		expect(screen.getByText(/Sombra al mediodía/)).toBeInTheDocument()
	})
})

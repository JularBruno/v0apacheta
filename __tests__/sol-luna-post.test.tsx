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

	test("has an eclipses section with the two eclipses to go outside for, and no skin-protection section", () => {
		render(<Page />)
		const heading = screen.getByRole("heading", { level: 2, name: /Próximos eclipses/ })
		const moonHeading = screen.getByRole("heading", { level: 2, name: "Y la Luna" })
		expect(after(moonHeading, heading)).toBe(true)
		const table = screen.getByRole("table", { name: /Eclipses para salir a mirar/ })
		expect(table).toHaveTextContent(/6 de febrero de 2027/)
		expect(table).toHaveTextContent(/26 de junio de 2029/)
		expect(table).toHaveTextContent(/anular/i)
		expect(table).toHaveTextContent(/total/i)
		expect(screen.getAllByText(/ISO 12312-2/).length).toBeGreaterThan(0)
		expect(screen.queryByRole("heading", { name: /Cuidá tu piel/ })).toBeNull()
		expect(screen.queryByText(/protector solar/i)).toBeNull()
		expect(screen.queryByText(/índice UV/i)).toBeNull()
	})

	describe("the opening and closing GIFs", () => {
		test("the inicio GIF comes right after the title block, before the hook, summary and contents, at full column width", () => {
			const { container } = render(<Page />)
			const article = container.querySelector("article") as HTMLElement
			const h1 = article.querySelector("h1") as HTMLElement
			const first = article.querySelector("figure") as HTMLElement
			const summaryHeading = screen.getByRole("heading", { level: 2, name: "En resumen" })
			expect(after(h1, first)).toBe(true)
			expect(after(first, summaryHeading)).toBe(true)
			// nothing but the figure sits between the title block and the start of the body
			const body = first.parentElement as HTMLElement
			expect(body.firstElementChild).toBe(first)
			const img = first.querySelector("img") as HTMLImageElement
			expect(img.getAttribute("alt")?.trim().length).toBeGreaterThan(10)
			expect(img.className).toMatch(/w-full/)
		})

		test("the inicio GIF is not lazy-loaded (it is the first thing on the page)", () => {
			const { container } = render(<Page />)
			const img = container.querySelector("article figure img") as HTMLImageElement
			// priority = not lazy (next/image also preloads it in the head)
			expect(img.getAttribute("loading")).toBeNull()
		})

		test("the final GIF is the last figure of the content, after the FAQ and before the sources", () => {
			const { container } = render(<Page />)
			const article = container.querySelector("article") as HTMLElement
			const figures = Array.from(article.querySelectorAll("figure"))
			expect(figures.length).toBeGreaterThanOrEqual(2)
			const last = figures[figures.length - 1]
			const faq = screen.getByRole("heading", { level: 2, name: "Preguntas frecuentes" })
			const sources = article.querySelector("footer") as HTMLElement
			expect(after(faq, last)).toBe(true)
			expect(after(last, sources)).toBe(true)
			const img = last.querySelector("img") as HTMLImageElement
			expect(img.getAttribute("alt")?.trim().length).toBeGreaterThan(10)
			expect(img.getAttribute("loading")).toBe("lazy")
		})

		test("two italic lines sit directly above the final GIF, in this order", () => {
			const { container } = render(<Page />)
			const article = container.querySelector("article") as HTMLElement
			const figures = Array.from(article.querySelectorAll("figure"))
			const last = figures[figures.length - 1]
			const wow = screen.getByText(/Wow I gotta hand it to you Sokka/)
			const broke = screen.getByText(/Great you must have broken it/)
			for (const line of [wow, broke]) expect(line.closest("em, .italic")).not.toBeNull()
			expect(after(wow, broke)).toBe(true)
			expect(after(broke, last)).toBe(true)
			// nothing else between the second line and the GIF
			const sibling = (broke.closest("p") as HTMLElement).nextElementSibling
			expect(sibling).toBe(last)
		})
	})
})

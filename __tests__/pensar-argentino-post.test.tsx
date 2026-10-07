import { render, screen } from "@testing-library/react"
import Page from "@/app/blog/el-problema-de-pensar-como-argentino/page"
import { meta } from "@/app/blog/el-problema-de-pensar-como-argentino/meta"
import { entries } from "@/lib/content/registry"
import { CATEGORY_LABELS } from "@/lib/content/types"

describe("the 'El problema de pensar como Argentino' post", () => {
	test("is registered in the new category, with the video's title", () => {
		expect(entries).toContain(meta)
		expect(meta.category).toBe("pensar-argentino")
		expect(CATEGORY_LABELS[meta.category!]).toBe("El problema de pensar como Argentino")
		expect(meta.title).toBe("El problema de pensar como Argentino")
	})

	test("goes title, summary, video, and only then the content", () => {
		const { container } = render(<Page />)
		const after = (x: Element, y: Element) => Boolean(x.compareDocumentPosition(y) & Node.DOCUMENT_POSITION_FOLLOWING)
		const frame = container.querySelector("article iframe") as HTMLIFrameElement
		expect(frame.getAttribute("src")).toBe("https://www.youtube-nocookie.com/embed/cQj2wD4O9-4")
		const h1 = container.querySelector("article h1") as HTMLElement
		const summary = screen.getByRole("heading", { level: 2, name: "En resumen" })
		const idea = screen.getByRole("heading", { level: 2, name: /Pensar en grande, sin humo/ })
		const ideas = screen.getByRole("heading", { level: 2, name: /foso/ })
		const alive = screen.getByRole("heading", { level: 2, name: /sentir vivo/ })
		expect(after(h1, summary)).toBe(true)
		expect(after(summary, frame)).toBe(true)
		expect(after(frame, idea)).toBe(true)
		expect(after(idea, ideas)).toBe(true)
		expect(after(ideas, alive)).toBe(true)
		expect(screen.queryByRole("heading", { name: "La idea en breve" })).toBeNull()
		expect(screen.queryByRole("heading", { name: "Tres ideas para llevarte" })).toBeNull()
		expect(screen.getByRole("link", { name: /Ver en YouTube/ })).toHaveAttribute("href", "https://www.youtube.com/watch?v=cQj2wD4O9-4")
	})

	test("the summary recaps how the video opens: not hype, and we think small because scarcity surrounds us", () => {
		render(<Page />)
		const summary = screen.getByRole("heading", { level: 2, name: "En resumen" }).parentElement as HTMLElement
		expect(summary).toHaveTextContent(/humo/i)
		expect(summary).toHaveTextContent(/escasez|pobreza/i)
		expect(summary).toHaveTextContent(/pensamos en chico/i)
	})

	test("the explanatory text is in the server-rendered HTML, covering the four ideas", () => {
		render(<Page />)
		for (const text of [/foso/i, /ikigai/i, /sentir vivo/i, /escasez|pobreza/i]) {
			expect(screen.getAllByText(text).length).toBeGreaterThan(0)
		}
	})

	test("public copy credits no one by name and carries no figures from the talk", () => {
		const { container } = render(<Page />)
		const text = container.textContent ?? ""
		expect(text).not.toMatch(/Magn[ií]n|Ramsey|inspirad/i)
		expect(text).not.toMatch(/\d+\s?%|US\$|USD|millones? de d[oó]lares/)
	})

	test("the third part carries an ikigai diagram: four circles, their overlaps and the center, as accessible text", () => {
		render(<Page />)
		const diagram = screen.getByRole("img", { name: /ikigai/i })
		for (const label of [/se te da bien/i, /amás hacer/i, /mundo necesita/i, /te pagarían/i, /Pasión/, /Misión/, /Vocación/, /Profesión/]) {
			expect(diagram).toHaveTextContent(label)
		}
		expect(diagram.querySelectorAll("circle")).toHaveLength(4)
		expect(diagram.querySelector("title")?.textContent?.trim().length).toBeGreaterThan(5)
		expect(diagram.querySelector("desc")?.textContent?.trim().length).toBeGreaterThan(40)
		const part = screen.getByRole("heading", { level: 2, name: /sentir vivo/ })
		const faq = screen.getByRole("heading", { level: 2, name: "Preguntas frecuentes" })
		expect(Boolean(part.compareDocumentPosition(diagram) & Node.DOCUMENT_POSITION_FOLLOWING)).toBe(true)
		expect(Boolean(diagram.compareDocumentPosition(faq) & Node.DOCUMENT_POSITION_FOLLOWING)).toBe(true)
	})

	test("the second part shows the castle photo (castle and moat), with alt text, after its text and before the third part", () => {
		const { container } = render(<Page />)
		const img = container.querySelector('article img[src*="bodiam-castle-in-england"]') as HTMLImageElement
		expect(img).not.toBeNull()
		expect(img.getAttribute("alt")?.trim().length).toBeGreaterThan(20)
		expect(img.getAttribute("alt")).toMatch(/foso|agua/i)
		const part2 = screen.getByRole("heading", { level: 2, name: /foso/ })
		const part3 = screen.getByRole("heading", { level: 2, name: /sentir vivo/ })
		expect(Boolean(part2.compareDocumentPosition(img) & Node.DOCUMENT_POSITION_FOLLOWING)).toBe(true)
		expect(Boolean(img.compareDocumentPosition(part3) & Node.DOCUMENT_POSITION_FOLLOWING)).toBe(true)
	})
})

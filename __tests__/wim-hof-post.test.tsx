import { render, screen } from "@testing-library/react"
import Page from "@/app/blog/respiracion-wim-hof-iceman/page"
import { meta } from "@/app/blog/respiracion-wim-hof-iceman/meta"
import { entries } from "@/lib/content/registry"

jest.mock("@/lib/breathing/sounds", () => {
	const actual = jest.requireActual("@/lib/breathing/sounds")
	return { ...actual, createSoundEngine: () => null }
})

const before = (a: Element, b: Element) => Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING)
const h2 = (name: string | RegExp) => screen.getByRole("heading", { level: 2, name })

describe("the Wim Hof post (the tool inside a short, explanatory post)", () => {
	test("is one registered post in Varios, titled with the method, the Iceman and the forge breathing, and no separate tool or explainer", () => {
		expect(entries).toContain(meta)
		expect(meta.kind).toBe("post")
		expect(meta.category).toBe("random")
		expect(meta.title).toBe("Método Wim Hof, el Iceman: respiración de fragua y potencial")
		expect(meta.title.length).toBeLessThanOrEqual(60)
		expect(meta.description.length).toBeLessThanOrEqual(155)
		const slugs = entries.map((entry) => entry.slug)
		expect(slugs).not.toContain("wim-hof-el-iceman-respiracion-frio-y-ciencia")
		expect(entries.filter((entry) => entry.slug.includes("wim-hof") || entry.slug.includes("respiracion"))).toHaveLength(1)
	})

	test("goes summary, tutorial video, the tool with its disclaimer, how it works, then the short explanation", () => {
		render(<Page />)
		const order = [
			h2("En resumen"),
			h2(/Mirá el tutorial/),
			h2(/Respirá con la guía/),
			h2(/Cómo funciona/),
			h2(/Qué es el método/),
		]
		for (let i = 1; i < order.length; i++) expect(before(order[i - 1], order[i])).toBe(true)
		expect(screen.queryByRole("heading", { name: "Preguntas frecuentes" })).toBeNull()
	})

	test("embeds Wim Hof's own tutorial and only that video", () => {
		const { container } = render(<Page />)
		const frames = Array.from(container.querySelectorAll("article iframe")) as HTMLIFrameElement[]
		expect(frames.map((f) => f.getAttribute("src"))).toEqual(["https://www.youtube-nocookie.com/embed/nzCaZQqAs9I"])
		expect(frames[0].getAttribute("title")?.length).toBeGreaterThan(10)
		expect(before(h2(/Mirá el tutorial/), frames[0])).toBe(true)
		expect(before(frames[0], h2(/Respirá con la guía/))).toBe(true)
		expect(container.textContent).not.toMatch(/Yes Theory/)
	})

	test("has the working tool with just the disclaimer, no confirmation step", () => {
		const { container } = render(<Page />)
		const text = container.textContent ?? ""
		expect(text).toMatch(/No te tomes el método y las técnicas a la ligera/)
		expect(text).toMatch(/piscina/)
		expect(text).toMatch(/supervisión adecuada/)
		expect(screen.queryByRole("checkbox")).toBeNull()
		const start = screen.getByRole("button", { name: /empezar/i })
		expect(start).toBeEnabled()
		expect(before(h2(/Respirá con la guía/), start)).toBe(true)
	})

	test("explains the bubble in its own words, without promising Wim's voice", () => {
		const { container } = render(<Page />)
		const text = container.textContent ?? ""
		expect(text).toMatch(/burbuja/i)
		expect(text).toMatch(/guía audiovisual/i)
		expect(text).toMatch(/seguila con tu respiración/i)
		expect(text).toMatch(/sonidos de fondo/i)
		expect(text).not.toMatch(/escucharás a wim|respirar junto a vos|la voz de wim/i)
	})

	test("the explanation is short, honest about the evidence and promise free", () => {
		const { container } = render(<Page />)
		const article = container.querySelector("article") as HTMLElement
		expect((article.textContent ?? "").length).toBeLessThan(7500)
		const section = h2(/Qué es el método/).parentElement as HTMLElement
		expect(section).toHaveTextContent(/fragua/i)
		expect(section).toHaveTextContent(/evidencia/i)
		expect(section).toHaveTextContent(/no está afiliad|independiente/i)
		expect(container.textContent).not.toMatch(/\bcura\b|curar|garantiz|previene enfermedades|fortalece tu sistema inmune/i)
	})

	test("cites the official page, the video and a reference page, over https", () => {
		render(<Page />)
		const hrefs = screen.getAllByRole("link").map((a) => a.getAttribute("href"))
		expect(hrefs).toContain("https://www.wimhofmethod.com/safety-warnings")
		expect(hrefs).toContain("https://www.youtube.com/watch?v=nzCaZQqAs9I")
		expect(hrefs).toContain("https://en.wikipedia.org/wiki/Wim_Hof")
	})
})

import { render, screen } from "@testing-library/react"
import Page from "@/app/blog/que-es-una-pwa-y-como-crear-una-en-nextjs/page"
import { meta } from "@/app/blog/que-es-una-pwa-y-como-crear-una-en-nextjs/meta"

const after = (a: Element, b: Element) => Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING)
const h2 = (name: string | RegExp) => screen.getByRole("heading", { level: 2, name })

describe("the PWA post", () => {
	test("the summary is short: two sentences at most, under 200 characters", () => {
		render(<Page />)
		const summary = h2("En resumen").parentElement as HTMLElement
		const text = summary.querySelector("p")?.textContent ?? ""
		expect(text.length).toBeLessThan(200)
		expect(text.length).toBeGreaterThan(60)
		expect(text.split(/[.!?]\s/).length).toBeLessThanOrEqual(2)
	})

	test("goes summary, what a PWA is, where it comes from, what it is for, how to install, push, and only then how to build it", () => {
		render(<Page />)
		const order = [
			"En resumen",
			"Guía de escalada",
			"Qué es una PWA",
			"De dónde viene",
			"Para qué sirve",
			"Cómo se instala",
			"Notificaciones push",
			"Cómo crearla con Next.js",
			"Cómo probarla",
		].map((name) => h2(name))
		for (let i = 1; i < order.length; i++) expect(after(order[i - 1], order[i])).toBe(true)
	})

	test("what a PWA is stays short: one paragraph, the three-piece table and one note", () => {
		render(<Page />)
		const section = h2("Qué es una PWA").parentElement as HTMLElement
		const paragraphs = Array.from(section.querySelectorAll("p")).filter((p) => !p.closest("[role=note]"))
		expect(paragraphs).toHaveLength(1)
		expect(section.querySelectorAll("[role=note]")).toHaveLength(1)
		expect(section.querySelector("table")).not.toBeNull()
		expect((section.textContent ?? "").length).toBeLessThan(1000)
	})

	test("installing is as simple as a button, but that button is the browser's share action", () => {
		render(<Page />)
		const section = h2("Cómo se instala").parentElement as HTMLElement
		expect(section).toHaveTextContent(/tan simple como/i)
		expect(section).toHaveTextContent(/compartir/i)
		expect(section).toHaveTextContent(/navegador/i)
		expect(section).toHaveTextContent(/Agregar a inicio/)
	})

	test("the guide-de-escalada intro comes right after the summary, before what a PWA is, in first person, linking the friend's app safely", () => {
		render(<Page />)
		const intro = h2("Guía de escalada")
		expect(after(h2("En resumen"), intro)).toBe(true)
		expect(after(intro, h2("Qué es una PWA"))).toBe(true)
		const section = intro.parentElement as HTMLElement
		expect(section).toHaveTextContent(/se instala desde el navegador/i)
		expect(section).toHaveTextContent(/abre en su propia ventana/i)
		expect(section).toHaveTextContent(/una guía de sectores y vías de escalada/i)
		const link = screen.getByRole("link", { name: /Vías de Escalada Córdoba/i })
		expect(link).toHaveAttribute("href", "https://www.viasdeescaladacordoba.com/")
		expect(link).toHaveAttribute("target", "_blank")
		expect(link.getAttribute("rel")).toMatch(/noopener/)
		expect(link.getAttribute("rel")).toMatch(/noreferrer/)
	})

	test("says the friend's app works offline only after an initial download, never an unconditional 100 %", () => {
		render(<Page />)
		const section = h2("Guía de escalada").parentElement as HTMLElement
		expect(section).toHaveTextContent(/sin conexión/i)
		expect(section).toHaveTextContent(/descarga inicial/i)
		expect(section.textContent).not.toMatch(/100\s?%/)
	})

	test("the history covers the iPhone web apps (2007), the App Store (2008) and the PWA name (2015)", () => {
		render(<Page />)
		const section = h2(/De dónde viene/).parentElement as HTMLElement
		for (const text of [/2007/, /2008/, /2015/, /service worker/i, /Alex Russell/]) expect(section).toHaveTextContent(text)
	})

	test("is marked as updated and cites the history sources over https", () => {
		expect(meta.updatedAt).toBe("2026-10-07")
		render(<Page />)
		const sources = screen.getAllByRole("link").map((a) => a.getAttribute("href"))
		expect(sources).toContain("https://infrequently.org/2015/06/progressive-apps-escaping-tabs-without-losing-our-soul/")
		expect(sources).toContain("https://en.wikipedia.org/wiki/Progressive_web_app")
	})
})

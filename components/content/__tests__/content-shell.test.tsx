import { render, screen, within } from "@testing-library/react"
import ContentShell from "@/components/content/content-shell"
import { makeMeta } from "@/lib/content/__fixtures__/meta"

jest.mock("@/lib/content/registry", () => {
	const { makeMeta, makeTool } = jest.requireActual("@/lib/content/__fixtures__/meta")
	return {
		entries: [
			makeMeta({ slug: "otro-post", title: "Otro post", publishedAt: "2026-08-01" }),
			makeTool({ slug: "calculadora", title: "Calculadora de ejemplo" }),
		],
	}
})

const seo = { summary: "Resumen.", sources: [{ name: "INDEC", url: "https://www.indec.gob.ar/" }] }

function jsonLdTypes(container: HTMLElement) {
	return Array.from(container.querySelectorAll('script[type="application/ld+json"]')).map(
		(script) => JSON.parse(script.textContent ?? "{}")["@type"],
	)
}

describe("ContentShell", () => {
	test("renders the Apacheta blurb and the header donation link outside the article", () => {
		const { container } = render(
			<ContentShell meta={makeMeta()} seo={seo}>
				<p>Cuerpo</p>
			</ContentShell>,
		)
		const article = container.querySelector("article") as HTMLElement
		const blurbLink = screen.getByRole("link", { name: "Apacheta" })
		expect(blurbLink).toHaveAttribute("href", "/")
		expect(article).not.toContainElement(blurbLink)
		const headerLink = screen.getByRole("link", { name: "Apoyá Apacheta" })
		expect(headerLink).toHaveAttribute("href", "/donaciones")
		expect(article).not.toContainElement(headerLink)
		expect(screen.getByText(/Este artículo está publicado en/)).toBeInTheDocument()
	})

	test("uses the tool blurb copy for tools", () => {
		render(<ContentShell meta={makeMeta({ kind: "tool", category: undefined })} seo={seo}>x</ContentShell>)
		expect(screen.getByText(/Esta herramienta está publicada en/)).toBeInTheDocument()
	})

	test("has exactly one h1 (the title) and puts children inside the article", () => {
		const { container } = render(
			<ContentShell meta={makeMeta({ title: "Mi título" })} seo={seo}>
				<p>Cuerpo</p>
			</ContentShell>,
		)
		const h1s = container.querySelectorAll("h1")
		expect(h1s).toHaveLength(1)
		expect(h1s[0]).toHaveTextContent("Mi título")
		expect(within(container.querySelector("article") as HTMLElement).getByText("Cuerpo")).toBeInTheDocument()
	})

	test("renders visible breadcrumbs ending at the current page", () => {
		render(<ContentShell meta={makeMeta({ title: "Mi título" })} seo={seo}>x</ContentShell>)
		const nav = screen.getByRole("navigation", { name: "Breadcrumb" })
		expect(within(nav).getByRole("link", { name: "Inicio" })).toHaveAttribute("href", "/")
		expect(within(nav).getByRole("link", { name: "Cuadernito" })).toHaveAttribute("href", "/blog")
		expect(within(nav).getByText("Mi título")).toHaveAttribute("aria-current", "page")
	})

	test("sidebar aside links related entries and is not inside the article", () => {
		const { container } = render(<ContentShell meta={makeMeta()} seo={seo}>x</ContentShell>)
		const aside = container.querySelector("aside") as HTMLElement
		expect(within(aside).getByRole("link", { name: /Otro post/ })).toHaveAttribute("href", "/blog/otro-post")
		expect(within(aside).getByRole("link", { name: /Calculadora de ejemplo/ })).toHaveAttribute(
			"href",
			"/herramientas/calculadora",
		)
		expect(container.querySelector("article")).not.toContainElement(aside)
	})

	test("has a sidebar donation card and a mobile donation card after the article, both to /donaciones", () => {
		const { container } = render(<ContentShell meta={makeMeta()} seo={seo}>x</ContentShell>)
		const cardLinks = screen.getAllByRole("link", { name: /Doná/ })
		expect(cardLinks).toHaveLength(2)
		cardLinks.forEach((link) => expect(link).toHaveAttribute("href", "/donaciones"))
		const aside = container.querySelector("aside") as HTMLElement
		expect(cardLinks.filter((link) => aside.contains(link))).toHaveLength(1)
	})

	test("shows Actualizado with publishedAt when there is no updatedAt, and no Publicado line", () => {
		const { container } = render(<ContentShell meta={makeMeta({ publishedAt: "2026-09-01" })} seo={seo}>x</ContentShell>)
		expect(screen.getByText(/Actualizado el 1 de septiembre de 2026/)).toBeInTheDocument()
		expect(screen.queryByText(/Publicado el/)).not.toBeInTheDocument()
		const article = JSON.parse(
			container.querySelector('script[type="application/ld+json"]')?.textContent ?? "{}",
		)
		expect(article.dateModified).toBe("2026-09-01")
	})

	test("shows both Publicado and Actualizado when updatedAt is set", () => {
		render(
			<ContentShell meta={makeMeta({ publishedAt: "2026-09-01", updatedAt: "2026-09-20" })} seo={seo}>
				x
			</ContentShell>,
		)
		expect(screen.getByText(/Publicado el 1 de septiembre de 2026/)).toBeInTheDocument()
		expect(screen.getByText(/Actualizado el 20 de septiembre de 2026/)).toBeInTheDocument()
	})

	test("renders sources and the fixed disclaimer in the article footer", () => {
		const { container } = render(<ContentShell meta={makeMeta()} seo={seo}>x</ContentShell>)
		const footer = container.querySelector("article footer") as HTMLElement
		const source = within(footer).getByRole("link", { name: "INDEC" })
		expect(source).toHaveAttribute("href", "https://www.indec.gob.ar/")
		expect(within(footer).getByText(/no constituye asesoramiento financiero/)).toBeInTheDocument()
	})

	test("emits Article + BreadcrumbList JSON-LD, plus FAQPage only with a faq", () => {
		const plain = render(<ContentShell meta={makeMeta()} seo={seo}>x</ContentShell>)
		expect(jsonLdTypes(plain.container)).toEqual(["Article", "BreadcrumbList"])
		plain.unmount()
		const withFaq = render(
			<ContentShell meta={makeMeta()} seo={{ ...seo, faq: [{ question: "¿Q?", answer: "A." }] }}>
				x
			</ContentShell>,
		)
		expect(jsonLdTypes(withFaq.container)).toEqual(["Article", "BreadcrumbList", "FAQPage"])
	})

	test("renders for a page whose meta is not in the registry", () => {
		render(<ContentShell meta={makeMeta({ slug: "no-registrada" })} seo={seo}>x</ContentShell>)
		expect(screen.getByRole("link", { name: /Otro post/ })).toBeInTheDocument()
	})

	test("throws a clear error for invalid meta or seo (fails the static build)", () => {
		expect(() => ContentShell({ meta: makeMeta({ slug: "ejemplo", title: "x".repeat(61) }), seo, children: null })).toThrow(
			/Invalid content meta for slug "ejemplo"/,
		)
		expect(() => ContentShell({ meta: makeMeta(), seo: { ...seo, sources: [] }, children: null })).toThrow(/Invalid seo/)
	})
})

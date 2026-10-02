import { render, screen, within } from "@testing-library/react"
import {
	Callout,
	CodeBlock,
	DataTable,
	Faq,
	Figure,
	Glossary,
	InlineToolCallout,
	KeyFigures,
	Section,
	Summary,
	Toc,
} from "@/components/content/blocks"

jest.mock("@/lib/content/registry", () => {
	const { makeMeta, makeTool } = jest.requireActual("@/lib/content/__fixtures__/meta")
	const entries = [makeMeta({ slug: "un-post", title: "Un post" }), makeTool({ slug: "calculadora", title: "Calculadora de ejemplo" })]
	return { entries, findEntry: (slug: string) => entries.find((entry: { slug: string }) => entry.slug === slug) }
})

describe("Section + Toc", () => {
	test("Section renders an h2 with an anchor id and Toc links to it", () => {
		render(
			<>
				<Toc items={[{ id: "que-es", label: "Qué es" }]} />
				<Section id="que-es" heading="Qué es">
					<p>Texto</p>
				</Section>
			</>,
		)
		expect(screen.getByRole("heading", { level: 2, name: "Qué es" })).toBeInTheDocument()
		expect(screen.getByRole("link", { name: "Qué es" })).toHaveAttribute("href", "#que-es")
		expect(document.getElementById("que-es")).not.toBeNull()
	})
})

describe("Summary", () => {
	test("renders the summary text under an En resumen heading", () => {
		render(<Summary text="La inflación es la suba general de precios." />)
		expect(screen.getByRole("heading", { name: "En resumen" })).toBeInTheDocument()
		expect(screen.getByText("La inflación es la suba general de precios.")).toBeInTheDocument()
	})
})

describe("KeyFigures", () => {
	const figure = { label: "Etiqueta", value: "12%", asOf: "agosto de 2026" }

	test("renders label, value, as-of and an optional source link", () => {
		render(<KeyFigures figures={[{ ...figure, source: { name: "INDEC", url: "https://www.indec.gob.ar/" } }]} />)
		expect(screen.getByText("Etiqueta")).toBeInTheDocument()
		expect(screen.getByText("12%")).toBeInTheDocument()
		expect(screen.getByText(/agosto de 2026/)).toBeInTheDocument()
		expect(screen.getByRole("link", { name: "INDEC" })).toHaveAttribute("href", "https://www.indec.gob.ar/")
	})

	test("renders nothing for an empty list and throws for more than 4", () => {
		const { container } = render(<KeyFigures figures={[]} />)
		expect(container).toBeEmptyDOMElement()
		expect(() => KeyFigures({ figures: Array(5).fill(figure) })).toThrow(/at most 4/)
	})
})

describe("Callout", () => {
	test("renders a note with an optional title", () => {
		render(
			<Callout title="Ojo">
				<p>Detalle</p>
			</Callout>,
		)
		const note = screen.getByRole("note")
		expect(within(note).getByText("Ojo")).toBeInTheDocument()
		expect(within(note).getByText("Detalle")).toBeInTheDocument()
	})
})

describe("CodeBlock", () => {
	const code = `export default function Page() {\n\treturn <div className="a">hola</div>\n}`

	test("renders the code verbatim inside pre > code, with language and filename", () => {
		const { container } = render(<CodeBlock code={code} language="tsx" filename="app/page.tsx" />)
		const codeEl = container.querySelector("pre > code") as HTMLElement
		expect(codeEl.textContent).toBe(code)
		expect(codeEl).toHaveClass("language-tsx")
		expect(screen.getByText("app/page.tsx").tagName).toBe("FIGCAPTION")
	})

	test("treats markup in the code as text, never as elements", () => {
		const { container } = render(<CodeBlock code={`<img src=x onerror="alert(1)" />`} />)
		expect(container.querySelector("img")).toBeNull()
		expect(container.querySelector("code")?.textContent).toBe(`<img src=x onerror="alert(1)" />`)
	})

	test("scrolls horizontally instead of overflowing the page, and has no caption without a filename", () => {
		const { container } = render(<CodeBlock code="x" />)
		expect(container.querySelector("pre")).toHaveClass("overflow-x-auto")
		expect(container.querySelector("figcaption")).toBeNull()
	})
})

describe("Figure", () => {
	test("renders the image with its alt text, caption and credit inside a figure", () => {
		const { container } = render(
			<Figure src="/blog/x.webp" alt="Protector solar y sombrero" width={800} height={450} caption="Cómo cuidarte" credit="Ilustración: Bruno" />,
		)
		const img = container.querySelector("figure img") as HTMLImageElement
		expect(img.getAttribute("alt")).toBe("Protector solar y sombrero")
		// Jest does not read next.config (unoptimized images), so next/image gives an optimizer url with the path encoded
		expect(decodeURIComponent(img.getAttribute("src") as string)).toContain("/blog/x.webp")
		expect(container.querySelector("figcaption")).toHaveTextContent("Cómo cuidarte")
		expect(container.querySelector("figcaption")).toHaveTextContent("Ilustración: Bruno")
	})

	test("has no caption element when there is none", () => {
		const { container } = render(<Figure src="/blog/x.webp" alt="Algo" width={10} height={10} />)
		expect(container.querySelector("figcaption")).toBeNull()
	})

	test("requires meaningful alt text (an empty one fails the build)", () => {
		expect(() => Figure({ src: "/blog/x.webp", alt: "  ", width: 10, height: 10 })).toThrow(/alt/i)
	})

	test("only accepts local paths or https urls, never javascript: or data: or http:", () => {
		for (const src of ["javascript:alert(1)", "data:image/png;base64,xx", "http://example.com/a.png", "blog/x.webp"]) {
			expect(() => Figure({ src, alt: "Algo", width: 10, height: 10 })).toThrow(/src/i)
		}
		expect(() => Figure({ src: "https://example.com/a.png", alt: "Algo", width: 10, height: 10 })).not.toThrow()
	})
})

describe("DataTable", () => {
	test("renders a captioned table with column headers", () => {
		render(<DataTable caption="Mi tabla" columns={["A", "B"]} rows={[["1", "2"]]} />)
		const table = screen.getByRole("table")
		expect(within(table).getByText("Mi tabla")).toBeInTheDocument()
		expect(within(table).getAllByRole("columnheader").map((th) => th.textContent)).toEqual(["A", "B"])
		expect(within(table).getAllByRole("cell").map((td) => td.textContent)).toEqual(["1", "2"])
	})

	test("throws when a row does not match the column count", () => {
		expect(() => DataTable({ caption: "x", columns: ["A", "B"], rows: [["solo uno"]] })).toThrow(/row 0 has 1 cells, expected 2/)
	})
})

describe("Faq", () => {
	test("renders every answer in the HTML (native details, nothing unmounted)", () => {
		render(<Faq items={[{ question: "¿Una?", answer: "Respuesta uno." }, { question: "¿Dos?", answer: "Respuesta dos." }]} />)
		expect(screen.getByRole("heading", { name: "Preguntas frecuentes" })).toBeInTheDocument()
		expect(screen.getByText("Respuesta uno.")).toBeInTheDocument()
		expect(screen.getByText("Respuesta dos.")).toBeInTheDocument()
		expect(document.querySelectorAll("details")).toHaveLength(2)
	})

	test("renders nothing for an empty list", () => {
		const { container } = render(<Faq items={[]} />)
		expect(container).toBeEmptyDOMElement()
	})
})

describe("Glossary", () => {
	test("renders terms as a definition list", () => {
		render(<Glossary terms={[{ term: "IPC", definition: "Índice de precios al consumidor." }]} />)
		expect(screen.getByRole("heading", { name: "Glosario" })).toBeInTheDocument()
		expect(screen.getByText("IPC").tagName).toBe("DT")
		expect(screen.getByText("Índice de precios al consumidor.").tagName).toBe("DD")
	})
})

describe("InlineToolCallout", () => {
	test("links to a registered tool", () => {
		render(<InlineToolCallout slug="calculadora" />)
		expect(screen.getByRole("link", { name: "Calculadora de ejemplo" })).toHaveAttribute("href", "/herramientas/calculadora")
	})

	test("renders nothing for an unknown slug or a slug that is a post", () => {
		const unknown = render(<InlineToolCallout slug="no-existe" />)
		expect(unknown.container).toBeEmptyDOMElement()
		const post = render(<InlineToolCallout slug="un-post" />)
		expect(post.container).toBeEmptyDOMElement()
	})
})

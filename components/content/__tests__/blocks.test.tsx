import { render, screen, within } from "@testing-library/react"
import {
	Callout,
	DataTable,
	Faq,
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

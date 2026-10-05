/**
 * Reference composition for a generated economics-topic page. The generator copies this
 * shape into app/blog/<slug>/page.tsx (with meta imported from ./meta) and replaces every
 * EJEMPLO value. It is a starting point, not a constraint: reorder, drop, or add blocks and
 * hand-written JSX freely. The only fixed parts are ContentShell, meta and seo.
 * Body headings use <h2> and below (the shell owns the <h1>).
 */
import ContentShell from "@/components/content/content-shell"
import { Callout, DataTable, Faq, Glossary, InlineToolCallout, KeyFigures, Section, Summary, Toc } from "@/components/content/blocks"
import type { ContentMeta, ContentSeo } from "@/lib/content/types"

export const starterMeta: ContentMeta = {
	slug: "ejemplo-tema-economico",
	kind: "post",
	title: "EJEMPLO: título del tema económico",
	description: "EJEMPLO: una descripción de hasta 155 caracteres que explique el tema y por qué importa.",
	publishedAt: "2026-09-30",
	category: "economia",
	tags: ["ejemplo"],
}

export const starterSeo: ContentSeo = {
	summary: "EJEMPLO: dos o tres oraciones que respondan la pregunta central del tema.",
	faq: [{ question: "EJEMPLO: ¿una pregunta frecuente?", answer: "EJEMPLO: su respuesta." }],
	sources: [{ name: "EJEMPLO: fuente oficial", url: "https://www.indec.gob.ar/" }],
}

const sections = [
	{ id: "que-es", label: "Qué es" },
	{ id: "como-funciona", label: "Cómo funciona" },
]

export default function EconomicsTopicStarter() {
	return (
		<ContentShell meta={starterMeta} seo={starterSeo}>
			<Summary text={starterSeo.summary} />
			<KeyFigures figures={[{ label: "EJEMPLO: dato", value: "0,0%", asOf: "EJEMPLO: mes de 2026" }]} />
			<Toc items={sections} />
			<Section id="que-es" heading="Qué es">
				<p>EJEMPLO: explicá el concepto en lenguaje simple.</p>
				<Callout title="EJEMPLO: aclaración importante">
					<p>EJEMPLO: algo que el lector no debería confundir.</p>
				</Callout>
			</Section>
			<Section id="como-funciona" heading="Cómo funciona">
				<DataTable caption="EJEMPLO: comparación" columns={["A", "B"]} rows={[["EJEMPLO", "EJEMPLO"]]} />
			</Section>
			<InlineToolCallout slug="ejemplo-herramienta" />
			<Glossary terms={[{ term: "EJEMPLO", definition: "EJEMPLO: definición breve." }]} />
			<Faq items={starterSeo.faq ?? []} />
		</ContentShell>
	)
}

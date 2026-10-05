import type { Metadata } from "next"
import ContentCard from "@/components/content/content-card"
import ContentIndexLayout from "@/components/content/index-layout"
import { listByKind } from "@/lib/content/registry"
import { buildPageMetadata } from "@/lib/content/seo"

export const dynamic = "force-static"

export const metadata: Metadata = buildPageMetadata({
	title: "Herramientas",
	socialTitle: "Herramientas | Apacheta",
	description: "Calculadoras y herramientas gratuitas de finanzas personales para Argentina: inflación, conversión de dólar y más.",
	path: "/herramientas",
})

export default function HerramientasIndexPage() {
	const tools = listByKind("tool")
	return (
		<ContentIndexLayout
			section="tool"
			title="Herramientas de Apacheta"
			intro="Calculadoras y conversores simples para tomar mejores decisiones con tu plata."
		>
			{tools.length === 0 ? (
				<p className="text-muted-foreground">Pronto vas a encontrar herramientas acá.</p>
			) : (
				<div className="grid gap-4 sm:grid-cols-2">
					{tools.map((tool) => (
						<ContentCard key={tool.slug} meta={tool} />
					))}
				</div>
			)}
		</ContentIndexLayout>
	)
}

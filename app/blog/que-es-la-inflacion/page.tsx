import Link from "next/link"
import ContentShell from "@/components/content/content-shell"
import { Callout, DataTable, Faq, Glossary, Section, Summary, Toc } from "@/components/content/blocks"
import { buildMetadata } from "@/lib/content/seo"
import type { ContentSeo } from "@/lib/content/types"
import { meta } from "./meta"

export const dynamic = "force-static"

export function generateMetadata() {
	return buildMetadata(meta)
}

const seo: ContentSeo = {
	summary:
		"La inflación es el aumento general y sostenido de los precios: con la misma plata comprás menos cosas que antes. En Argentina la mide el INDEC todos los meses con el índice de precios al consumidor (IPC).",
	faq: [
		{
			question: "¿La inflación es lo mismo que la suba del dólar?",
			answer:
				"No. La inflación mide la suba general de los precios en pesos. El dólar es un precio más de la economía y puede influir en otros precios, pero no es lo mismo.",
		},
		{
			question: "¿Cada cuánto publica el INDEC la inflación?",
			answer: "El INDEC publica el índice de precios al consumidor (IPC) una vez por mes, con los datos del mes anterior.",
		},
		{
			question: "¿Qué significa que la inflación baje?",
			answer:
				"Que los precios siguen subiendo, pero más despacio. Eso se llama desinflación y no es lo mismo que una baja de precios.",
		},
	],
	sources: [{ name: "INDEC: Instituto Nacional de Estadística y Censos", url: "https://www.indec.gob.ar/" }],
}

const sections = [
	{ id: "que-es", label: "Qué es la inflación" },
	{ id: "como-se-mide", label: "Cómo se mide" },
	{ id: "como-te-afecta", label: "Cómo te afecta" },
	{ id: "como-cuidar-tu-plata", label: "Cómo cuidar tu plata" },
]

export default function QueEsLaInflacionPage() {
	return (
		<ContentShell meta={meta} seo={seo}>
			<Summary text={seo.summary} />
			<Toc items={sections} />

			<Section id="que-es" heading="Qué es la inflación">
				<p>
					Hay inflación cuando los precios de los bienes y servicios suben de forma general y sostenida en el tiempo. No
					se trata de que un producto se encarezca: lo que importa es que, en promedio, todo cuesta más. El resultado es que
					tu dinero pierde poder de compra.
				</p>
				<Callout title="No toda suba de precios es inflación">
					<p>
						Que la verdura suba por una helada es una suba puntual. Hablamos de inflación cuando la suba es general y se
						sostiene mes tras mes.
					</p>
				</Callout>
			</Section>

			<Section id="como-se-mide" heading="Cómo se mide">
				<p>
					En Argentina la inflación oficial la calcula el INDEC con el Índice de Precios al Consumidor (IPC). El IPC compara
					el precio de una canasta de bienes y servicios representativa del consumo de los hogares y publica la variación
					porcentual. Se publica todos los meses, y hay dos formas de leerlo.
				</p>
				<DataTable
					caption="Dos formas de leer el IPC"
					columns={["Medida", "Qué compara", "Para qué sirve"]}
					rows={[
						["Mensual", "Un mes contra el mes anterior", "Ver la velocidad actual de los precios"],
						["Interanual", "Un mes contra el mismo mes del año anterior", "Ver el efecto acumulado en un año"],
					]}
				/>
			</Section>

			<Section id="como-te-afecta" heading="Cómo te afecta">
				<p>
					Si tus ingresos o tus ahorros en pesos no suben al menos al ritmo de los precios, cada mes alcanzan para menos. Por
					eso conviene comparar siempre lo que ganás, o lo que rinde tu ahorro, contra la inflación, y no mirar solo el
					monto.
				</p>
			</Section>

			<Section id="como-cuidar-tu-plata" heading="Cómo cuidar tu plata">
				<ul className="list-disc space-y-2 pl-5">
					<li>Anotá tus gastos para saber cuánto te cuesta realmente tu propia canasta.</li>
					<li>Compará lo que rinde tu ahorro contra la inflación.</li>
					<li>Evitá dejar plata quieta mucho tiempo sin rendimiento.</li>
					<li>Revisá tu presupuesto seguido cuando los precios se mueven rápido.</li>
				</ul>
				<p>
					En{" "}
					<Link href="/" className="text-primary hover:underline">
						Apacheta
					</Link>{" "}
					podés registrar tus movimientos y armar un presupuesto para tener ese panorama a mano.
				</p>
			</Section>

			<Glossary
				terms={[
					{ term: "IPC", definition: "Índice de Precios al Consumidor: mide la variación de los precios de una canasta de consumo." },
					{ term: "INDEC", definition: "Instituto Nacional de Estadística y Censos: el organismo que publica la inflación oficial." },
					{ term: "Poder adquisitivo", definition: "La cantidad de bienes y servicios que podés comprar con una suma de dinero." },
					{ term: "Inflación interanual", definition: "La variación de precios de un mes contra el mismo mes del año anterior." },
				]}
			/>
			<Faq items={seo.faq ?? []} />
		</ContentShell>
	)
}

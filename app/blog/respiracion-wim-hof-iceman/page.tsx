import ContentShell from "@/components/content/content-shell"
import BreathingWidget from "@/components/breathing/breathing-widget"
import { Callout, Section, Summary, VideoEmbed } from "@/components/content/blocks"
import { buildMetadata } from "@/lib/content/seo"
import type { ContentSeo } from "@/lib/content/types"
import { meta } from "./meta"

export const dynamic = "force-static"

export function generateMetadata() {
	return buildMetadata(meta)
}

// Pending from the author: photos (Figure block) and, if wanted, more videos (VideoEmbed block).

const seo: ContentSeo = {
	summary:
		"Una herramienta para practicar la respiración Wim Hof, la del Iceman: elegís las rondas y las respiraciones, seguís una burbuja con tu respiración, medís cuánto aguantás sin respirar y ves el tiempo de cada ronda. Abajo, una explicación breve del método.",
	sources: [
		{ name: "Wim Hof Method: advertencias de seguridad (oficial)", url: "https://www.wimhofmethod.com/safety-warnings" },
		{ name: "YouTube: Wim Hof breathing tutorial by Wim Hof", url: "https://www.youtube.com/watch?v=nzCaZQqAs9I" },
		{ name: "Wikipedia: Wim Hof", url: "https://en.wikipedia.org/wiki/Wim_Hof" },
	],
}

export default function RespiracionWimHofPage() {
	return (
		<ContentShell meta={meta} seo={seo}>
			<Summary text={seo.summary} />

			<Section id="tutorial" heading="Mirá el tutorial">
				<p>Así explica el propio Wim Hof la respiración.</p>
				<VideoEmbed
					videoId="nzCaZQqAs9I"
					title="Tutorial de respiración de Wim Hof, explicado por él mismo (video de YouTube)"
					caption="Tutorial de respiración, por Wim Hof"
				/>
			</Section>

			<Section id="herramienta" heading="Respirá con la guía">
				<p>
					Esta burbuja es una guía audiovisual para ayudarte a mantener el ritmo durante tus rondas de respiración. Mirá cómo se
					expande y se contrae, y seguila con tu respiración. Los sonidos de fondo te ayudan a desconectar del entorno para que te
					concentres solo en respirar.
				</p>
				<BreathingWidget />
			</Section>

			<Section id="como-funciona" heading="Cómo funciona">
				<ol className="list-decimal space-y-2 pl-5">
					<li>Elegís las rondas, las respiraciones por ronda y el sonido de fondo.</li>
					<li>
						Respirás profundo siguiendo la burbuja: 1,5 segundos para inhalar mientras crece y 1,5 para soltar mientras se achica. En el
						centro, la herramienta cuenta cada respiración.
					</li>
					<li>Después de soltar el aire de la última, aguantás sin respirar mientras corre el cronómetro.</li>
					<li>
						Cuando necesitás aire, tocás dos veces seguidas la pantalla: se anota el tiempo y empieza una respiración profunda que
						sostenés 15 segundos.
					</li>
					<li>Soltás y sigue la ronda siguiente. Al final ves el tiempo de cada ronda, el mejor y el promedio. No se guarda nada.</li>
				</ol>
			</Section>

			<Section id="que-es" heading="Qué es el método">
				<p>
					Wim Hof, conocido como el Iceman, es un atleta holandés famoso por resistir el frío extremo. Su método combina tres
					cosas: respiración, exposición gradual al frío y concentración. A la parte de respiración se la compara con el fuelle de
					una fragua, que aviva el fuego con aire: respiraciones profundas y rítmicas, una retención sin aire y una respiración de
					recuperación.
				</p>
				<Callout title="Lo que se sabe y lo que no">
					<p>
						Los estudios son chicos y de calidad baja, así que la evidencia es limitada y no se puede afirmar con certeza qué efectos
						tiene en la salud. Esta herramienta no promete ningún resultado.
					</p>
				</Callout>
				<p className="text-sm text-muted-foreground">
					Esta herramienta es independiente: no está afiliada ni respaldada por Wim Hof ni por su empresa.
				</p>
			</Section>
		</ContentShell>
	)
}

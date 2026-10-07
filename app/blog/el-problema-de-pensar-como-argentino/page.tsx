import ContentShell from "@/components/content/content-shell"
import { Callout, Faq, Figure, Section, Summary, VideoEmbed } from "@/components/content/blocks"
import { buildMetadata } from "@/lib/content/seo"
import type { ContentSeo } from "@/lib/content/types"
import IkigaiDiagram from "./ikigai-diagram"
import { meta } from "./meta"

export const dynamic = "force-static"

export function generateMetadata() {
	return buildMetadata(meta)
}

const VIDEO_ID = "cQj2wD4O9-4"

const seo: ContentSeo = {
	summary:
		"El video arranca aclarando que esto no es humo: pensar en grande no es prometer que todo se puede. Lo que plantea es una observación incómoda: en Argentina pensamos en chico porque vivimos rodeados de escasez, y casi ni miramos cómo se maneja un negocio común en otros países. Agradecer lo que tenés está bien, pero no tiene por qué ser tu techo.",
	faq: [
		{
			question: "¿Qué es el ikigai?",
			answer:
				"Es un esquema japonés que cruza cuatro preguntas: qué se te da bien, qué te gusta hacer, qué necesita el mundo y por qué te pagarían. Lo que te conviene hacer está donde las cuatro se juntan.",
		},
		{
			question: "¿Qué significa agrandar el foso en lugar del castillo?",
			answer:
				"Que tu negocio o tu trabajo es el castillo, y tu diferencial es el foso que lo protege. Mejorar el castillo sirve poco si cualquiera puede copiarlo; lo que lo hace difícil de copiar es lo que te distingue.",
		},
		{
			question: "¿Pensar en grande es endeudarse y jugarse todo?",
			answer:
				"No. Pensar en grande es ponerte una meta más alta, pero cuidando de no quedar en la lona: evitar el endeudamiento que te puede borrar todo si una vez sale mal.",
		},
	],
	sources: [{ name: "Video original: El problema de pensar como Argentino (YouTube)", url: "https://www.youtube.com/watch?v=cQj2wD4O9-4" }],
}

export default function ElProblemaDePensarComoArgentinoPage() {
	return (
		<ContentShell meta={meta} seo={seo}>
			<Summary text={seo.summary} />

			<Section id="el-video" heading="Mirá el video">
				<p>Esta es la idea completa; abajo la dividimos en tres partes.</p>
				<VideoEmbed videoId={VIDEO_ID} title="El problema de pensar como Argentino" caption="El video completo" />
			</Section>

			<Section id="pensar-en-grande" heading="1. Pensar en grande, sin humo">
				<p>
					Cuando casi todo lo que te rodea es escasez, es normal que tu techo mental baje. Si al vecino le va bien con su negocio,
					pensás que a vos no te va a pasar; si alguien te habla de una meta ambiciosa, te suena a cuento.
				</p>
				<p>
					La propuesta es mirar con qué vara se mide el resto del mundo y ponerte la tuya ahí. No porque vaya a salir seguro, sino
					porque una meta que no te ponés es una meta que no puede pasar. Además, una meta alta atrae mejor gente y más energía que una
					mediocre, y el contexto ya se va a encargar de recortarla si hace falta.
				</p>
				<p>
					Pensar en grande tampoco es jugártela toda: la idea es que una mala racha no te deje en la lona, y por eso conviene
					evitar el endeudamiento que te puede borrar todo de un golpe.
				</p>
			</Section>

			<Section id="el-foso" heading="2. Agrandá el foso, no solo el castillo">
				<p>
					Tu negocio, o tu trabajo, es el castillo. Lo que lo protege es lo que te distingue de los demás: tu diferencial, el foso.
					Mejorar el castillo sirve poco si cualquiera puede copiarlo; lo que lo hace difícil de copiar es lo que sólo vos ofrecés.
				</p>
				<p>
					Por eso, en vez de pensar solo en hacer crecer lo que ya tenés, dedicale tiempo a cavar ese foso. Es lo que hace que un
					negocio rinda más que el promedio sin quedar a merced de la competencia.
				</p>
				<Figure
					src="/blog/bodiam-castle-in-england.webp"
					width={1080}
					height={606}
					alt="Vista aérea de un castillo de piedra con torres redondas, rodeado por un foso de agua y con un único puente de entrada."
					caption="El castillo es lo que ves; el foso es lo que lo hace difícil de tomar."
				/>
			</Section>

			<Section id="que-te-hace-sentir-vivo" heading="3. Preguntate qué te hace sentir vivo y hacelo">
				<p>
					No hace falta empezar por qué necesita el mundo: lo que necesita es gente que se sienta viva. Para bajarlo a tierra, el
					ikigai cruza cuatro preguntas: qué se te da bien, qué te gusta hacer, qué necesita el mundo y por qué te pagarían.
				</p>
				<p>
					Si hacés algo que te sale bien y te gusta pero nadie te paga, queda en hobby. Lo que te conviene está donde las cuatro se
					juntan, y ahí es donde el foso y la vara alta se sostienen mejor.
				</p>
				<IkigaiDiagram />
				<Callout title="Cómo se conecta con tu plata">
					<p>
						Pensar en grande no reemplaza ordenar tus finanzas: las apoya. Con tus gastos claros y un colchón armado, te animás a
						probar cosas más ambiciosas sin que un mal año te lo lleve puesto.
					</p>
				</Callout>
			</Section>

			<Faq items={seo.faq ?? []} />
		</ContentShell>
	)
}

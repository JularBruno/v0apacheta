import type { ReactNode } from "react"
import ContentShell from "@/components/content/content-shell"
import { Callout, DataTable, Faq, Glossary, Section, Summary, Toc } from "@/components/content/blocks"
import SkyChart from "@/components/sky/sky-chart"
import {
	ARGENTINA_UTC_OFFSET,
	CORDOBA,
	REFERENCE_CURVES,
	compass,
	formatClock,
	formatDuration,
	referenceDeclination,
	sunDay,
} from "@/lib/astro/chart"
import { dayOfYear } from "@/lib/astro/sun"
import { buildMetadata } from "@/lib/content/seo"
import type { ContentSeo } from "@/lib/content/types"
import { meta } from "./meta"

export const dynamic = "force-static"

export function generateMetadata() {
	return buildMetadata(meta)
}

// ---- numbers for the text, computed at build time from the same library the chart uses ----------

// The page is built once, so this is only the chart's starting date; the chart jumps to the visitor's "now" on load.
const buildDate = new Date(Date.now() + ARGENTINA_UTC_OFFSET * 3_600_000)
const YEAR = buildDate.getUTCFullYear()
const BUILD_DATE = buildDate.toISOString().slice(0, 10)

const curve = (id: string) => REFERENCE_CURVES.find((c) => c.id === id)!
const decOf = (id: string) => referenceDeclination(curve(id), YEAR)
const dayAt = (id: string, month: number, day: number) =>
	sunDay(CORDOBA, dayOfYear(YEAR, month, day), ARGENTINA_UTC_OFFSET, decOf(id))

const summer = dayAt("solsticio-diciembre", 12, 21)
const equinox = dayAt("equinoccios", 3, 20)
const winter = dayAt("solsticio-junio", 6, 21)

const whole = (n: number) => String(Math.round(n))
const direction = (az: number | null) => (az === null ? "—" : `${Math.round(az)}° ${compass(az)}`)

// solar noon on the clock, across the whole year
const noons = Array.from({ length: 365 }, (_, i) => sunDay(CORDOBA, i + 1, ARGENTINA_UTC_OFFSET).noon)
const EARLIEST_NOON = formatClock(Math.min(...noons))
const LATEST_NOON = formatClock(Math.max(...noons))

const row = (label: string, day: typeof summer, month: number, d: number) => {
	const noon = sunDay(CORDOBA, dayOfYear(YEAR, month, d), ARGENTINA_UTC_OFFSET).noon
	return [
		label,
		direction(day.riseAz),
		`${whole(day.maxAlt)}°`,
		direction(day.setAz),
		formatDuration(day.dayLength),
		formatClock(noon),
	]
}

const seo: ContentSeo = {
	summary: `El Sol no sale siempre por el este ni pasa siempre a la misma altura: su recorrido cambia durante el año por la inclinación de la Tierra (23,4°). En Córdoba, al mediodía llega a ${whole(summer.maxAlt)}° de altura el 21 de diciembre y a solo ${whole(winter.maxAlt)}° el 21 de junio. Este mapa interactivo lo muestra para cualquier fecha y lugar.`,
	faq: [
		{
			question: "¿Por qué el Sol no sale siempre por el este?",
			answer: `Solo sale exactamente por el este en los equinoccios (alrededor del 20 de marzo y del 23 de septiembre). En Córdoba, en el solsticio de diciembre sale hacia el sudeste (unos ${whole(summer.riseAz as number)}°) y en el de junio hacia el noreste (unos ${whole(winter.riseAz as number)}°).`,
		},
		{
			question: "¿Hacia dónde conviene orientar ventanas y paneles solares en Argentina?",
			answer:
				"Hacia el norte, porque en el hemisferio sur el Sol pasa por el norte al mediodía. Para paneles, una inclinación parecida a tu latitud (en Córdoba, unos 31°) es un buen punto de partida. Un instalador la ajusta según cuándo consumís más energía.",
		},
		{
			question: "¿A qué hora es el mediodía solar en Córdoba?",
			answer: `Según el día del año cae entre las ${EARLIEST_NOON} y las ${LATEST_NOON} de la hora de reloj de Argentina, no a las 12:00. Córdoba está bastante al oeste del meridiano que define el huso horario del país.`,
		},
		{
			question: "¿Sirve para otras ciudades o países?",
			answer:
				"Sí. Escribí la latitud, la longitud y el huso horario (UTC) del lugar y todo se recalcula, incluidos los casos extremos de sol de medianoche y noche polar.",
		},
		{
			question: "¿Qué tan preciso es el mapa?",
			answer:
				"La posición del Sol se calcula con las series de NOAA, con un error de unos 0,05° en la declinación, y los horarios de orto y ocaso son los oficiales. No considera montañas, edificios ni la altura sobre el nivel del mar.",
		},
	],
	sources: [
		{ name: "NOAA: Solar Calculator", url: "https://gml.noaa.gov/grad/solcalc/" },
		{ name: "NOAA: detalles de los cálculos solares", url: "https://gml.noaa.gov/grad/solcalc/calcdetails.html" },
	],
}

const sections = [
	{ id: "para-que-sirve", label: "Para qué sirve" },
	{ id: "mapa", label: "Probalo: el mapa del cielo" },
	{ id: "como-leerlo", label: "Cómo leer el mapa" },
	{ id: "por-que-cambia", label: "Por qué cambia el camino del Sol" },
	{ id: "mediodia-solar", label: "El mediodía solar no es a las 12" },
	{ id: "luna", label: "Y la Luna" },
	{ id: "como-se-calcula", label: "Cómo se calcula" },
]

function C({ children }: { children: ReactNode }) {
	return <code className="rounded bg-muted px-1 py-0.5 font-mono text-[0.9em]">{children}</code>
}

export default function SolYLunaPage() {
	return (
		<ContentShell meta={meta} seo={seo}>
			<p className="text-lg">
				¿Alguna vez te preguntaste por qué en verano el Sol te pasa casi por arriba de la cabeza y en invierno apenas se
				levanta, o por qué no sale siempre por el mismo lugar? Todo eso entra en un solo dibujo: el mapa del cielo.
			</p>
			<Summary text={seo.summary} />
			<Toc items={sections} />

			<Section id="para-que-sirve" heading="Para qué sirve">
				<p>Saber por dónde se mueve el Sol no es solo curiosidad: sirve para decisiones concretas, y varias te ahorran plata.</p>
				<ul className="list-disc space-y-3 pl-5">
					<li>
						<strong>Orientar la casa y las ventanas.</strong> En Argentina el Sol pasa por el norte. En Córdoba, al mediodía
						del 21 de junio llega a unos {whole(winter.maxAlt)}° de altura y entra profundo por una ventana al norte; el 21
						de diciembre llega a unos {whole(summer.maxAlt)}°, casi vertical, y un alero alcanza para frenarlo.
					</li>
					<li>
						<strong>Paneles solares y termotanques solares.</strong> Van mirando al norte, y una inclinación parecida a tu
						latitud (unos 31° en Córdoba) es un buen punto de partida. Un buen ángulo hace que rindan más durante el año, lo
						que se nota en la factura de luz o de gas.
					</li>
					<li>
						<strong>Sombras con intención.</strong> Aleros, pérgolas y árboles de hoja caduca dan sombra en verano y dejan
						pasar el sol en invierno, sin gastar en aire acondicionado de más.
					</li>
					<li>
						<strong>Huerta y plantas.</strong> Te dice cuántas horas de sol directo recibe cada rincón en cada estación.
					</li>
					<li>
						<strong>Fotos y paseos.</strong> Saber dónde sale y dónde se pone el Sol te ayuda a planear la luz de la mañana y
						del atardecer.
					</li>
					<li>
						<strong>Orientarte sin brújula.</strong> En el hemisferio sur, al mediodía solar el Sol está al norte.
					</li>
					<li>
						<strong>Entender el calendario.</strong> Por eso en Córdoba el día dura {formatDuration(summer.dayLength)} en
						diciembre y {formatDuration(winter.dayLength)} en junio.
					</li>
				</ul>
			</Section>

			<Section id="mapa" heading="Probalo: el mapa del cielo">
				<p>
					Elegí una fecha, mové la hora del día o tocá <strong>Reproducir</strong> para ver cómo cruza el Sol. Empieza en
					Córdoba, pero podés escribir las coordenadas de cualquier lugar.
				</p>
				<SkyChart initialDate={BUILD_DATE} />
			</Section>

			<Section id="como-leerlo" heading="Cómo leer el mapa">
				<ul className="list-disc space-y-2 pl-5">
					<li>
						Es el cielo visto <strong>mirando hacia arriba</strong>: el centro es el punto justo sobre tu cabeza (el cénit) y
						el borde es el horizonte. Por eso el este queda a la izquierda y el oeste a la derecha.
					</li>
					<li>
						Cada curva es el camino del Sol en un día. Siempre sale por el borde, sube hacia el centro y vuelve a bajar hasta
						el borde del lado opuesto.
					</li>
					<li>
						Cuanto más cerca del centro pasa la curva, más alto está el Sol. La de diciembre pasa casi por el centro; la de
						junio, apenas se aleja del borde norte.
					</li>
					<li>
						La línea punteada blanca es la fecha que elegiste, y el punto amarillo es el Sol a la hora del control.
					</li>
				</ul>
			</Section>

			<Section id="por-que-cambia" heading="Por qué cambia el camino del Sol">
				<p>
					La Tierra gira inclinada 23,4° respecto de su órbita. Por eso, a lo largo del año, el Sol cambia de &ldquo;altura
					celeste&rdquo;, lo que los astrónomos llaman <strong>declinación</strong>: +23,4° en el solsticio de junio, 0° en los
					equinoccios y −23,4° en el de diciembre. A cada declinación le corresponde una curva del mapa.
				</p>
				<DataTable
					caption={`El Sol en ${CORDOBA.name}: tres fechas clave (hora de reloj de Argentina, UTC−3)`}
					columns={["Día", "Sale", "Altura máx.", "Se pone", "Dura el día", "Mediodía solar"]}
					rows={[
						row("21 de diciembre (solsticio de verano)", summer, 12, 21),
						row("20 de marzo y 23 de septiembre (equinoccios)", equinox, 3, 20),
						row("21 de junio (solsticio de invierno)", winter, 6, 21),
					]}
				/>
				<Callout title="Un detalle que sorprende">
					<p>
						En los equinoccios el día y la noche duran casi lo mismo y el Sol sale casi exactamente por el este. Pero la
						altura al mediodía no es la mitad: depende de tu latitud. En Córdoba, en el equinoccio, el Sol llega a{" "}
						{whole(equinox.maxAlt)}°.
					</p>
				</Callout>
			</Section>

			<Section id="mediodia-solar" heading="El mediodía solar no es a las 12">
				<p>
					El mediodía solar es el momento en que el Sol cruza el punto más alto del día. En Córdoba no coincide con las 12:00 de
					tu reloj: cae entre las <strong>{EARLIEST_NOON}</strong> y las <strong>{LATEST_NOON}</strong> según la época del año.
				</p>
				<p>
					Hay dos motivos. El primero: el huso horario de Argentina (UTC−3) corresponde al meridiano 45° O, pero Córdoba está a{" "}
					64,18° O, unos 19° más al oeste, y cada grado equivale a 4 minutos de retraso. El segundo: la{" "}
					<strong>ecuación del tiempo</strong>, que adelanta o atrasa el mediodía hasta unos 16 minutos durante el año porque la
					órbita de la Tierra no es un círculo perfecto y el eje está inclinado.
				</p>
			</Section>

			<Section id="luna" heading="Y la Luna">
				<Callout title="La Luna se suma pronto">
					<p>
						Estamos terminando la parte de la Luna: su recorrido sobre este mismo mapa, su fase y por qué cambia noche a noche.
						Volvé a pasar por el Cuadernito.
					</p>
				</Callout>
			</Section>

			<Section id="como-se-calcula" heading="Cómo se calcula">
				<p>No es un dibujo: cada punto sale de ecuaciones de geometría solar.</p>
				<ul className="list-disc space-y-2 pl-5">
					<li>
						La <strong>declinación</strong> (δ) y la ecuación del tiempo salen de las series de NOAA a partir del día del año.
					</li>
					<li>
						La <strong>altura</strong> (h) del Sol: <C>sen h = sen φ · sen δ + cos φ · cos δ · cos H</C>, con φ la latitud y H el
						ángulo horario (0° al mediodía solar, 15° por cada hora).
					</li>
					<li>
						La <strong>altura máxima</strong>, al mediodía solar: <C>90° − |φ − δ|</C>.
					</li>
					<li>
						El <strong>acimut</strong> se mide desde el norte en sentido horario: N 0°, E 90°, S 180°, O 270°.
					</li>
					<li>
						El <strong>orto y el ocaso</strong> son los oficiales: cuando el centro del Sol está 0,83° bajo el horizonte, por la
						refracción de la atmósfera.
					</li>
				</ul>
				<Callout tone="warning" title="Límites">
					<p>El mapa no tiene en cuenta montañas, edificios ni árboles que tapen el horizonte de tu casa.</p>
				</Callout>
			</Section>

			<Glossary
				terms={[
					{ term: "Cénit", definition: "El punto del cielo justo encima tuyo." },
					{ term: "Altura", definition: "El ángulo del Sol sobre el horizonte: 0° es el horizonte y 90° es el cénit." },
					{ term: "Acimut", definition: "La dirección del Sol sobre el horizonte, medida desde el norte en sentido horario." },
					{ term: "Declinación", definition: "La latitud celeste del Sol: va de +23,4° a −23,4° durante el año." },
					{ term: "Solsticio", definition: "El día del año en que el Sol llega a su declinación extrema: el día más largo o el más corto." },
					{ term: "Equinoccio", definition: "El día en que el Sol está sobre el ecuador (declinación 0°) y el día y la noche duran casi lo mismo." },
					{ term: "Mediodía solar", definition: "El momento en que el Sol cruza el meridiano y alcanza su punto más alto del día." },
					{ term: "Ecuación del tiempo", definition: "La diferencia, de hasta unos 16 minutos, entre el tiempo solar y el de un reloj que marca siempre la misma duración del día." },
				]}
			/>
			<Faq items={seo.faq ?? []} />
		</ContentShell>
	)
}

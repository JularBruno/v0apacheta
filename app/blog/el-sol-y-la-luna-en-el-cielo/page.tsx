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
	sunAboveWindow,
	sunDay,
} from "@/lib/astro/chart"
import { STANDSTILL, monthlyDeclinationRange } from "@/lib/astro/moon-chart"
import { dayOfYear, maxAltitude } from "@/lib/astro/sun"
import { buildMetadata } from "@/lib/content/seo"
import type { ContentSeo } from "@/lib/content/types"
import { meta } from "./meta"

export const dynamic = "force-static"

export function generateMetadata() {
	return buildMetadata(meta)
}

// Pending from the author (see the project memory): the Avatar planetarium image and the skin-protection
// image. Add them here with the <Figure> block once the files exist under /public/blog.

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
const comma = (n: number, digits = 1) => n.toFixed(digits).replace(".", ",")
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

// skin: the Sun above 45° (your shadow is shorter than you) and the noon shadow of a 1.70 m person
const above45 = (id: string, month: number, day: number) =>
	sunAboveWindow(CORDOBA, dayOfYear(YEAR, month, day), ARGENTINA_UTC_OFFSET, 45, decOf(id))
const windowText = (w: { from: number; to: number } | null) => (w ? `${formatClock(w.from)} a ${formatClock(w.to)}` : "Nunca")
const shadow = (alt: number) => `${comma(1.7 / Math.tan((alt * Math.PI) / 180))} m`
const skinRow = (label: string, day: typeof summer, w: { from: number; to: number } | null) => [
	label,
	windowText(w),
	`${whole(day.maxAlt)}°`,
	shadow(day.maxAlt),
]
const summerWindow = above45("solsticio-diciembre", 12, 21)
const equinoxWindow = above45("equinoccios", 3, 20)
const winterWindow = above45("solsticio-junio", 6, 21)

// the Moon: the 18.6-year cycle at Córdoba's latitude, and how far the monthly extremes reach when the post was published
const moonRow = (label: string, dec: number) => [
	label,
	`±${comma(dec)}°`,
	`${whole(maxAltitude(CORDOBA.lat, -dec))}°`,
	`${whole(maxAltitude(CORDOBA.lat, dec))}°`,
]
const published = Date.parse(`${meta.publishedAt}T12:00:00Z`)
const monthRange = monthlyDeclinationRange(published)
const MOON_NOW = comma((monthRange.max - monthRange.min) / 2)
const moonHighest = whole(maxAltitude(CORDOBA.lat, -STANDSTILL.major))
const moonLowest = whole(maxAltitude(CORDOBA.lat, STANDSTILL.major))

const seo: ContentSeo = {
	summary: `El Sol y la Luna no salen siempre por el mismo lugar ni pasan siempre a la misma altura. En Córdoba el Sol llega a ${whole(summer.maxAlt)}° el 21 de diciembre y a solo ${whole(winter.maxAlt)}° el 21 de junio; la Luna, a lo largo de su ciclo de 18,6 años, sube hasta ${moonHighest}° y baja hasta ${moonLowest}°. Este mapa interactivo lo muestra para cualquier fecha y lugar.`,
	faq: [
		{
			question: "¿Por qué el Sol no sale siempre por el este?",
			answer: `Solo sale exactamente por el este en los equinoccios (alrededor del 20 de marzo y del 23 de septiembre). En Córdoba, en el solsticio de diciembre sale hacia el sudeste (unos ${whole(summer.riseAz as number)}°) y en el de junio hacia el noreste (unos ${whole(winter.riseAz as number)}°).`,
		},
		{
			question: "¿Cuándo es más fuerte el Sol para la piel?",
			answer: `Cuando está alto. En Córdoba, en verano el Sol supera los 45° entre las ${windowText(summerWindow).replace(" a ", " y las ")}; en invierno nunca llega a esa altura. Una regla fácil: si tu sombra es más corta que vos, el Sol está alto y la radiación UV es fuerte.`,
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
			question: "¿Por qué la luna llena de invierno sube tanto en el hemisferio sur?",
			answer:
				"Porque la luna llena está del lado opuesto al Sol. En invierno el Sol pasa bajo por el norte, así que la luna llena recorre un camino alto, como el del Sol de verano. En verano pasa al revés: la luna llena se ve baja.",
		},
		{
			question: "¿A qué hora sale la Luna?",
			answer:
				"Sale unos 50 minutos más tarde cada día, porque su día dura 24 horas y 50 minutos. Con el mapa de la Luna ves la salida y la puesta de cualquier fecha en tu lugar.",
		},
		{
			question: "¿Sirve para otras ciudades o países?",
			answer:
				"Sí. Escribí la latitud, la longitud y el huso horario (UTC) del lugar y todo se recalcula, incluidos los casos extremos de sol de medianoche y noche polar.",
		},
		{
			question: "¿Qué tan preciso es el mapa?",
			answer:
				"El Sol se calcula con las series de NOAA, con un error de unos 0,05° en la declinación. La Luna, con la serie de Jean Meeus, con un error de pocas centésimas de grado y el paralaje incluido. Los horarios de salida y puesta son los oficiales. No considera montañas, edificios ni la altura sobre el nivel del mar.",
		},
	],
	sources: [
		{ name: "NOAA: Solar Calculator", url: "https://gml.noaa.gov/grad/solcalc/" },
		{ name: "NOAA: detalles de los cálculos solares", url: "https://gml.noaa.gov/grad/solcalc/calcdetails.html" },
		{ name: "OMS: radiación ultravioleta", url: "https://www.who.int/news-room/fact-sheets/detail/ultraviolet-radiation" },
		{ name: "Servicio Meteorológico Nacional (índice UV)", url: "https://www.smn.gob.ar/" },
		{ name: "Wikipedia: Lunar standstill", url: "https://en.wikipedia.org/wiki/Lunar_standstill" },
	],
}

const sections = [
	{ id: "para-que-sirve", label: "Para qué sirve" },
	{ id: "mapa", label: "Probalo: el mapa del Sol" },
	{ id: "como-leerlo", label: "Cómo leer el mapa" },
	{ id: "por-que-cambia", label: "Por qué cambia el camino del Sol" },
	{ id: "mediodia-solar", label: "El mediodía solar no es a las 12" },
	{ id: "piel", label: "Cuidá tu piel" },
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
				levanta, o por qué la Luna sale cada día más tarde? Todo eso entra en un solo dibujo: el mapa del cielo.
			</p>
			<Summary text={seo.summary} />
			<Toc items={sections} />

			<Section id="para-que-sirve" heading="Para qué sirve">
				<p>Saber por dónde se mueven el Sol y la Luna no es solo curiosidad: sirve para decisiones concretas, y varias te ahorran plata o te cuidan la salud.</p>
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
						<strong>Cuidar tu piel.</strong> Los rayos UV son más fuertes cuando el Sol está alto. En Córdoba, en verano, supera
						los 45° entre las {windowText(summerWindow).replace(" a ", " y las ")}: ese es el momento de buscar sombra.{" "}
						<a href="#piel" className="text-primary hover:underline">
							Más abajo, cómo protegerte.
						</a>
					</li>
					<li>
						<strong>Sombras con intención.</strong> Aleros, pérgolas y árboles de hoja caduca dan sombra en verano y dejan
						pasar el sol en invierno, sin gastar en aire acondicionado de más.
					</li>
					<li>
						<strong>Huerta y plantas.</strong> Te dice cuántas horas de sol directo recibe cada rincón en cada estación.
					</li>
					<li>
						<strong>Fotos, paseos y cielo de noche.</strong> Saber dónde sale y se pone el Sol, y a qué hora sale la Luna y
						con qué fase, te ayuda a planear la luz de la mañana, del atardecer y una buena noche de observación.
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

			<Section id="mapa" heading="Probalo: el mapa del Sol">
				<p>
					Elegí una fecha, mové la hora del día o tocá <strong>Reproducir</strong> para ver cómo cruza el Sol. Empieza en Córdoba,
					pero podés escribir las coordenadas de cualquier lugar. Más abajo está el mismo mapa para la Luna.
				</p>
				<SkyChart initialDate={BUILD_DATE} fixedBody="sol" />
			</Section>

			<Section id="como-leerlo" heading="Cómo leer el mapa">
				<ul className="list-disc space-y-2 pl-5">
					<li>
						Es el cielo visto <strong>mirando hacia arriba</strong>: el centro es el punto justo sobre tu cabeza (el cénit) y
						el borde es el horizonte. Por eso el este queda a la izquierda y el oeste a la derecha.
					</li>
					<li>
						Cada curva es el camino de un astro en un día. Siempre sale por el borde, sube hacia el centro y vuelve a bajar hasta
						el borde del lado opuesto.
					</li>
					<li>
						Cuanto más cerca del centro pasa la curva, más alto está. La del Sol de diciembre pasa casi por el centro; la de
						junio, apenas se aleja del borde norte.
					</li>
					<li>
						La línea punteada blanca es la fecha que elegiste, y el punto brillante es el astro a la hora del control.
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

			<Section id="piel" heading="Cuidá tu piel: el Sol y los rayos UV">
				<p>
					Los rayos ultravioleta (UV) que queman y dañan la piel dependen sobre todo de qué tan alto está el Sol: cuanto más alto,
					menos atmósfera atraviesan y más fuertes llegan. Por eso el mapa también te dice cuándo cuidarte más.
				</p>
				<Callout title="La regla de la sombra">
					<p>
						Mirá tu sombra: si es <strong>más corta que vos</strong>, el Sol está a más de 45° y la radiación UV es fuerte. Si
						es más larga, es menor, pero no es cero.
					</p>
				</Callout>
				<DataTable
					caption={`${CORDOBA.name}: cuándo el Sol supera los 45° y qué sombra da al mediodía solar una persona de 1,70 m`}
					columns={["Día", "Sol a más de 45°", "Altura máx.", "Sombra al mediodía"]}
					rows={[
						skinRow("21 de diciembre (verano)", summer, summerWindow),
						skinRow("20 de marzo y 23 de septiembre (equinoccios)", equinox, equinoxWindow),
						skinRow("21 de junio (invierno)", winter, winterWindow),
					]}
				/>
				<p>
					En invierno el Sol de Córdoba nunca pasa de {whole(winter.maxAlt)}°, así que la radiación UV baja bastante, pero no
					desaparece. En verano, en cambio, hay unas {formatDuration((summerWindow?.to ?? 0) - (summerWindow?.from ?? 0))} por día
					con el Sol alto.
				</p>
				<h3 className="text-lg font-bold text-foreground">Cómo protegerte mejor</h3>
				<ul className="list-disc space-y-2 pl-5">
					<li>
						<strong>Sombra</strong> en las horas en que el Sol está alto, que en verano en Córdoba van de las{" "}
						{windowText(summerWindow).replace(" a ", " a las ")}.
					</li>
					<li>
						<strong>Ropa que cubra</strong>, sombrero de ala ancha y anteojos con filtro UV.
					</li>
					<li>
						<strong>Protector solar</strong> de amplio espectro con FPS 30 o más, en cantidad generosa y unos 15 a 30 minutos antes
						de salir. Renovalo cada 2 horas y después de nadar o transpirar.
					</li>
					<li>El protector no es una excusa para quedarte más tiempo al sol.</li>
					<li>
						<strong>Las nubes no te protegen del todo</strong>: buena parte de los UV las atraviesa. El agua, la arena y la nieve
						los reflejan, y en altura hay más radiación.
					</li>
					<li>Los bebés menores de 6 meses no deben estar al sol directo.</li>
					<li>Hacete un control dermatológico una vez al año, y consultá si un lunar cambia de forma, color o tamaño.</li>
				</ul>
				<Callout title="Mirá el índice UV del día">
					<p>
						El Servicio Meteorológico Nacional publica el índice UV. A partir de 3 ya conviene protegerse, y de 8 en adelante la
						radiación es muy alta o extrema.
					</p>
				</Callout>
			</Section>

			<Section id="luna" heading="Y la Luna">
				<p>
					La Luna usa el mismo mapa y el mismo tipo de curvas que el Sol, pero se mueve de otra manera: su declinación recorre todo
					su rango en unos 27 días, no en un año. Por eso sus curvas no se repiten cada año: cambian noche a noche. En el mapa de
					abajo ves cinco momentos del mes, del extremo sur al extremo norte, y el arco completo de la fecha que elijas, de
					salida a puesta, con su fase. Podés saltar a la próxima luna nueva o llena.
				</p>
				<SkyChart initialDate={BUILD_DATE} fixedBody="luna" />
				<ul className="list-disc space-y-2 pl-5">
					<li>
						<strong>Sale unos 50 minutos más tarde cada día</strong>, porque el día lunar dura 24 horas y 50 minutos. Un día al
						mes ni siquiera pasa por su punto más alto.
					</li>
					<li>
						<strong>La luna llena está del lado opuesto al Sol.</strong> Por eso en invierno, con el Sol bajo en el norte, la luna
						llena sube alto; en verano pasa baja.
					</li>
					<li>
						<strong>Las fases</strong> dependen del ángulo entre la Luna y el Sol: 0° es luna nueva, 90° cuarto creciente, 180°
						luna llena y 270° cuarto menguante.
					</li>
				</ul>
				<h3 className="text-lg font-bold text-foreground">El ciclo de 18,6 años</h3>
				<p>
					La órbita de la Luna está inclinada unos 5,1° respecto de la del Sol. Esa inclinación se suma o se resta a los 23,4° de
					la Tierra, y va girando: cada 18,6 años la Luna pasa de llegar a ±{comma(STANDSTILL.major)}° de declinación (un{" "}
					<strong>standstill mayor</strong>) a ±{comma(STANDSTILL.minor)}° (uno <strong>menor</strong>), nueve años después.
				</p>
				<DataTable
					caption={`${CORDOBA.name}: hasta dónde llega la Luna en su ciclo de 18,6 años, comparada con el Sol`}
					columns={["Momento", "Declinación extrema", "Altura máx. del extremo sur", "Altura máx. del extremo norte"]}
					rows={[
						moonRow("Standstill mayor (como el de 2025)", STANDSTILL.major),
						moonRow("Standstill menor (hacia 2034)", STANDSTILL.minor),
						moonRow("El Sol, por comparar", STANDSTILL.obliquity),
					]}
				/>
				<Callout title="Estamos justo después de un máximo">
					<p>
						Cuando se publicó este artículo (octubre de 2026), la Luna llegaba a unos ±{MOON_NOW}° en su recorrido mensual: apenas
						pasó el máximo de 2025. Cerca de un standstill mayor, la Luna sube más alto que el Sol de verano ({moonHighest}°
						contra {whole(summer.maxAlt)}° en Córdoba) y baja más que el de invierno ({moonLowest}° contra{" "}
						{whole(winter.maxAlt)}°).
					</p>
				</Callout>
			</Section>

			<Section id="como-se-calcula" heading="Cómo se calcula">
				<p>No es un dibujo: cada punto sale de ecuaciones de geometría astronómica.</p>
				<ul className="list-disc space-y-2 pl-5">
					<li>
						La <strong>declinación</strong> (δ) del Sol y la ecuación del tiempo salen de las series de NOAA a partir del día del
						año.
					</li>
					<li>
						La <strong>altura</strong> (h): <C>sen h = sen φ · sen δ + cos φ · cos δ · cos H</C>, con φ la latitud y H el ángulo
						horario (0° al mediodía solar, 15° por cada hora).
					</li>
					<li>
						La <strong>altura máxima</strong>, al pasar por el meridiano: <C>90° − |φ − δ|</C>.
					</li>
					<li>
						El <strong>acimut</strong> se mide desde el norte en sentido horario: N 0°, E 90°, S 180°, O 270°.
					</li>
					<li>
						La <strong>Luna</strong> se calcula con la serie de Jean Meeus (<em>Astronomical Algorithms</em>, capítulo 47), con
						un error de pocas centésimas de grado, y se corrige por paralaje: como está cerca, desde la superficie se la ve
						hasta 1° más baja que desde el centro de la Tierra.
					</li>
					<li>
						La <strong>salida y la puesta</strong> son las oficiales: cuando el centro del astro está 0,83° bajo el horizonte,
						por la refracción de la atmósfera.
					</li>
				</ul>
				<Callout tone="warning" title="Límites">
					<p>El mapa no tiene en cuenta montañas, edificios ni árboles que tapen el horizonte de tu casa.</p>
				</Callout>
			</Section>

			<Glossary
				terms={[
					{ term: "Cénit", definition: "El punto del cielo justo encima tuyo." },
					{ term: "Altura", definition: "El ángulo de un astro sobre el horizonte: 0° es el horizonte y 90° es el cénit." },
					{ term: "Acimut", definition: "La dirección de un astro sobre el horizonte, medida desde el norte en sentido horario." },
					{ term: "Declinación", definition: "La latitud celeste de un astro: va de +23,4° a −23,4° para el Sol, y hasta ±28,6° para la Luna." },
					{ term: "Solsticio", definition: "El día del año en que el Sol llega a su declinación extrema: el día más largo o el más corto." },
					{ term: "Equinoccio", definition: "El día en que el Sol está sobre el ecuador (declinación 0°) y el día y la noche duran casi lo mismo." },
					{ term: "Mediodía solar", definition: "El momento en que el Sol cruza el meridiano y alcanza su punto más alto del día." },
					{ term: "Ecuación del tiempo", definition: "La diferencia, de hasta unos 16 minutos, entre el tiempo solar y el de un reloj que marca siempre la misma duración del día." },
					{ term: "Fase lunar", definition: "Cuánta parte del disco de la Luna está iluminada vista desde la Tierra; depende del ángulo entre la Luna y el Sol." },
					{ term: "Standstill lunar", definition: "El momento del ciclo de 18,6 años en que la Luna llega a su declinación máxima (mayor) o a la mínima (menor)." },
					{ term: "Índice UV", definition: "Una escala que indica la intensidad de la radiación ultravioleta del día: de 1 (baja) a 11 o más (extrema)." },
				]}
			/>
			<Faq items={seo.faq ?? []} />
		</ContentShell>
	)
}

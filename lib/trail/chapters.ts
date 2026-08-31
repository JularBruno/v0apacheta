/**
 * The five chapters of the Apacheta path, as shown on the /camino landing.
 *
 * Titles and taglines come from `app/dashboard/mapa/map-context.json`
 * (`stages[].chapter` / `stages[].tagline`); descriptions are landing-length
 * summaries of each stage's `principle`. Text is placeholder — refine later.
 *
 * `side` is which side of the trail the cairn sits on; cards float on the
 * opposite side. The trail itself is a curve computed through the cairns at
 * runtime (see `components/camino/use-trail.ts`).
 */

export interface Chapter {
	n: number
	/** "Capítulo 1" … */
	label: string
	title: string
	tagline: string
	desc: string
	side: "left" | "right"
}

export const CHAPTERS: Chapter[] = [
	{
		n: 1,
		label: "Capítulo 1",
		title: "Conocé el camino",
		tagline: "El primer paso es mirar.",
		desc: "Anotás cada peso que entra y sale. En un mes tenés un mapa real de tu plata.",
		side: "left",
	},
	{
		n: 2,
		label: "Capítulo 2",
		title: "Presupuesto",
		tagline: "Dale un nombre a cada peso.",
		desc: "Decidís en papel, antes de que empiece el mes, en qué importa gastar.",
		side: "right",
	},
	{
		n: 3,
		label: "Capítulo 3",
		title: "Protección",
		tagline: "Construí el escudo. Después escalá.",
		desc: "Fondo de emergencia primero. Salir de deudas después.",
		side: "left",
	},
	{
		n: 4,
		label: "Capítulo 4",
		title: "Lo que enseña el camino",
		tagline: "El interés compuesto no perdona.",
		desc: "Plazo fijo UVA, FCI, CEDEARs, dólar MEP. Ahorrás e invertís, mes a mes.",
		side: "right",
	},
	{
		n: 5,
		label: "Capítulo 5",
		title: "La cima",
		tagline: "Libertad: tus activos cubren tu vida.",
		desc: "El trabajo pasa a ser una elección, no una obligación.",
		side: "left",
	},
]

export const HERO = {
	eyebrow: "El camino · Sierras de Córdoba",
	title: "Las apachetas guían.",
	titleAccent: "Vos ponés las piedras.",
	body: "Cada capítulo es una acción real con tu plata. La hacés, dejás una apacheta, y el camino se dibuja atrás tuyo.",
	cta: "Poné tu primera piedra",
	scrollHint: "Bajá para recorrerlo",
}

export const CLOSING = {
	eyebrow: "Kilómetro cero",
	title: "Tu primera piedra te espera.",
	body: "Empezás hoy, desde donde estás. Sin tecnicismos, sin vergüenza.",
	cta: "Comenzá tu camino",
}

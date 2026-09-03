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

/** Hand-drawn landmarks dropped on the trail after a given chapter. */
export interface Milestone {
	src: string
	/** render it after the chapter with this `n` */
	after: number
	/** display width in px (capped to viewport) */
	width: number
	/** nudge off the trail centre */
	shift: "left" | "center" | "right"
}

export const MILESTONES: Milestone[] = [
	{ src: "/scenery/milestones/bridge.webp", after: 2, width: 400, shift: "left" },
	{ src: "/scenery/milestones/outcrop.webp", after: 4, width: 380, shift: "right" },
	{ src: "/scenery/milestones/summit.webp", after: 5, width: 460, shift: "center" },
]

export const HERO = {
	title: "Las apachetas",
	titleAccent: "guiarán tu camino.",
	body: "Seguí el camino para salir de deudas, ahorrar más y construir patrimonio.",
	cta: "Comenzá tu camino",
	scrollHint: "Bajá para recorrerlo",
}

export const CLOSING = {
	title: "Tu primera piedra te espera.",
	body: "Empezás hoy, desde donde estás. Sin tecnicismos, sin vergüenza.",
	cta: "Comenzá tu camino",
}

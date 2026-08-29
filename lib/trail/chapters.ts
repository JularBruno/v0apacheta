/**
 * The five chapters of the Apacheta path, as shown on the landing page.
 *
 * Titles and taglines are drawn from `app/dashboard/mapa/map-context.json`
 * (`stages[].chapter` / `stages[].tagline`). The descriptions are landing-length
 * summaries of each stage's `principle`. Node coordinates are in the trail map's
 * 700×530 viewBox.
 */

import type { TrailNode, TrailSegment } from "@/components/trail-map/types"

export interface Chapter {
	/** "Capítulo 1" … */
	chapter: string
	/** Short map tag; omitted for locked chapters (they sit in the fog). */
	mapLabel?: string
	/** Headline for the scroll stop. `\n` marks an intentional line break. */
	title: string
	tagline: string
	desc: string
	locked: boolean
	node: { x: number; y: number }
}

export const CHAPTERS: Chapter[] = [
	{
		chapter: "Capítulo 1",
		mapLabel: "Conocé el camino",
		title: "Conocé\nel camino.",
		tagline: "El primer paso es mirar.",
		desc: "No podés mejorar lo que no ves. Antes de cualquier plan, hay que saber dónde está tu dinero. Anotar cada movimiento, por chico que sea, cambia cómo decidís.",
		locked: false,
		node: { x: 385, y: 470 },
	},
	{
		chapter: "Capítulo 2",
		mapLabel: "Presupuesto",
		title: "Presupuesto.",
		tagline: "Dale un nombre a cada peso antes de gastarlo.",
		desc: "Un presupuesto no es una restricción. Es un plan para gastar en lo que importa y no gastar en lo que no. Gastá en papel antes de gastar en la realidad.",
		locked: false,
		node: { x: 240, y: 355 },
	},
	{
		chapter: "Capítulo 3",
		mapLabel: "Protección",
		title: "Protección.",
		tagline: "Construí el escudo. Después escalá.",
		desc: "Sin fondo de emergencia, cualquier imprevisto te manda de vuelta a cero. Sin salir de la deuda, el interés te roba el futuro. Primero la base.",
		locked: false,
		node: { x: 430, y: 240 },
	},
	{
		chapter: "Capítulo 4",
		title: "Lo que enseña\nel camino.",
		tagline: "El interés compuesto no perdona.",
		desc: "Plazo fijo UVA, FCI, CEDEARs, dólar MEP. Ahorrar e invertir de forma consistente es lo que separa a los que llegan. Cuando llegues acá, ya vas a saber lo que hacés.",
		locked: true,
		node: { x: 280, y: 138 },
	},
	{
		chapter: "Capítulo 5",
		title: "Libertad.",
		tagline: "La cima.",
		desc: "La libertad financiera no es ser rico. Es que tus activos generen lo suficiente para cubrir tu vida. Desde ahí, el trabajo es una elección. Construí lo que dura.",
		locked: true,
		node: { x: 455, y: 52 },
	},
]

/** Path segments between consecutive chapter nodes (segment i: node i → node i+1). */
export const TRAIL_SEGMENTS: TrailSegment[] = [
	{ d: "M 385,470 C 360,432 252,392 240,355" },
	{ d: "M 240,355 C 228,318 375,278 430,240" },
	{ d: "M 430,240 C 485,202 342,168 280,138", locked: true },
	{ d: "M 280,138 C 218,108 412,74 455,52", locked: true },
]

/** Chapter nodes in the shape the trail map expects. */
export const TRAIL_NODES: TrailNode[] = CHAPTERS.map((c, i) => ({
	id: `chapter-${i + 1}`,
	x: c.node.x,
	y: c.node.y,
	label: c.mapLabel,
	locked: c.locked,
}))

/** y-coordinate below which fog-of-war fades in over the locked chapters. */
export const TRAIL_FOG_HEIGHT = 200

export const HERO = {
	badge: "Hecho para Argentina",
	title: "Las apachetas\nguiarán tu camino.",
	tagline: "Seguí el mapa para salir de deudas, ahorrar más y construir patrimonio. Un paso a la vez.",
	cta: "Comienza tu Camino",
	scrollHint: "Scrolleá para recorrer el camino",
}

export const CLOSING = {
	kicker: "El camino empieza hoy.",
	line: "Un paso a la vez. Sin tecnicismos. Sin vergüenza. Desde donde estás.",
	cta: "Comienza tu Camino",
}

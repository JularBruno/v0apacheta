"use client"

import { useRef, type ReactNode } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import ApachetaCairn from "@/components/apacheta-cairn"
import CommunityQuickLinks from "@/components/content/community-quick-links"
import Scenery from "@/components/camino/scenery"
import { useTrail } from "@/components/camino/use-trail"
import styles from "@/components/camino/camino.module.css"
import { HERO } from "@/lib/trail/chapters"

const COPY = {
	post: "Este artículo está publicado en",
	tool: "Esta herramienta está publicada en",
	index: "Este sitio es parte de",
} as const

export type HeaderVariant = keyof typeof COPY

const PRIMARY_BUTTON =
	"inline-flex items-center rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-md transition-colors hover:bg-primary-500 hover:shadow-lg"
const SECONDARY_BUTTON =
	"inline-flex items-center rounded-xl border border-border bg-background px-5 py-2.5 text-sm font-bold text-foreground shadow-sm transition-colors hover:bg-muted"

/** One stop on the header trail: a cairn on the path with a floating card beside it (landing markup, no headings). */
function HeaderStation({
	index,
	side,
	reached,
	here,
	label,
	children,
}: {
	index: number
	side: "left" | "right"
	reached: boolean
	here: boolean
	label: string
	children: ReactNode
}) {
	return (
		<div
			data-station={index}
			className={cn(styles.station, styles[side], reached && styles.reached, here && styles.here)}
		>
			<div data-cairn className={styles.cairn}>
				<span className={styles.halo} aria-hidden="true" />
				<ApachetaCairn />
			</div>
			{/* visible from the first render (`in`): the links must be in the server HTML and work without JS */}
			<div data-card className={cn(styles.card, styles.in)}>
				<p className="font-mono text-[11px] font-medium uppercase tracking-[0.13em] text-primary/90">{label}</p>
				{children}
			</div>
		</div>
	)
}

/**
 * Top of every Cuadernito/Herramientas page, built from the landing's own pieces (parchment ground,
 * scenery, the trail through the cairns, the milestones): it names Apacheta, then three stops,
 * "Comenzá tu camino", quick links to the social channels, and the donation, and the page continues below. Tall on purpose. It adds no
 * headings and no <article>, so the page's <h1> stays the first heading.
 */
export default function ApachetaHeader({ variant }: { variant: HeaderVariant }) {
	const pageRef = useRef<HTMLDivElement>(null)
	const trailRef = useRef<HTMLDivElement>(null)
	const fullRef = useRef<SVGPathElement>(null)
	const walkedRef = useRef<SVGPathElement>(null)

	const { activeIndex, reachedCount, geometry } = useTrail({ trailRef, fullRef, walkedRef, count: 3 })

	return (
		<header>
			<div
				ref={pageRef}
				data-variant="header"
				className={cn(styles.page, "border-b border-[color:var(--map-parchment-edge)]")}
			>
				<Scenery pageRef={pageRef} geometry={geometry} />

				<div className={styles.content}>
					<div data-clear className={cn("mx-auto max-w-2xl px-5 pb-8 pt-14 sm:px-6", styles.textZone)}>
						<p className="mb-3 text-5xl font-extrabold leading-[1.05] tracking-tight text-foreground sm:text-6xl">Apacheta</p>
						<p className="max-w-[46ch] text-lg leading-relaxed text-muted-foreground">
							{COPY[variant]}{" "}
							<Link href="/" className="font-semibold text-foreground underline-offset-2 hover:underline">
								Apacheta
							</Link>
							, la app de finanzas personales para Argentina.
						</p>
					</div>

					<div ref={trailRef} data-trail className={styles.trail}>
						<svg className={styles.svg} aria-hidden="true">
							<path ref={fullRef} className={styles.full} />
							<path ref={walkedRef} className={styles.walked} />
						</svg>

						<HeaderStation index={0} side="left" reached={reachedCount > 0} here={activeIndex === 0} label="Primer paso">
							<p className="mb-1.5 mt-1.5 text-[1.3rem] font-extrabold leading-[1.14] tracking-tight text-balance">
								Seguí el camino
							</p>
							<p className="mb-3 text-[0.9rem] text-muted-foreground">{HERO.body}</p>
							<Link href="/onboarding" className={PRIMARY_BUTTON}>
								{HERO.cta}
							</Link>
						</HeaderStation>

						<figure data-clear className={cn(styles.milestone, styles.shift_right)} style={{ ["--mw" as string]: "380px" }}>
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img src="/scenery/milestones/bridge.webp" alt="" />
						</figure>

						<HeaderStation index={1} side="right" reached={reachedCount > 1} here={activeIndex === 1} label="Comunidad">
							<p className="mb-1.5 mt-1.5 text-[1.3rem] font-extrabold leading-[1.14] tracking-tight text-balance">
								Sumate al camino
							</p>
							<p className="mb-3 text-[0.9rem] text-muted-foreground">Seguinos y recorrelo con más gente.</p>
							<CommunityQuickLinks />
						</HeaderStation>

						<figure data-clear className={cn(styles.milestone, styles.shift_left)} style={{ ["--mw" as string]: "360px" }}>
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img src="/scenery/milestones/outcrop.webp" alt="" />
						</figure>

						<HeaderStation index={2} side="left" reached={reachedCount > 2} here={activeIndex === 2} label="Apoyá el proyecto">
							<p className="mb-1.5 mt-1.5 text-[1.3rem] font-extrabold leading-[1.14] tracking-tight text-balance">
								¿Te sirve?
							</p>
							<p className="mb-3 text-[0.9rem] text-muted-foreground">
								Apacheta se mantiene con donaciones. Tu aporte cubre el hosting y el tiempo para seguir sumando
								funciones y contenido.
							</p>
							<Link href="/donaciones" className={SECONDARY_BUTTON}>
								Doná a Apacheta
							</Link>
						</HeaderStation>
					</div>
				</div>
			</div>
		</header>
	)
}

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
	"inline-flex items-center rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-md transition-colors hover:bg-primary-500 hover:shadow-lg"
const CARD_TITLE = "mb-2 mt-1 text-[1.05rem] font-extrabold leading-tight tracking-tight text-balance"
const SECONDARY_BUTTON =
	"inline-flex items-center rounded-lg border border-border bg-background px-4 py-2 text-xs font-bold text-foreground shadow-sm transition-colors hover:bg-muted"

// Compact on purpose: the name, the whole trail, the breadcrumbs and the page title should fit one screen.
// Station height stays above the tallest card so cards of neighbouring stations never overlap (phones put
// them on overlapping columns).
const STATION_STYLE = { minHeight: "clamp(112px, 15vh, 132px)" }
const CAIRN_STYLE = { width: "44px", height: "44px" }
const CARD_STYLE = { width: "min(270px, 62vw)", padding: "10px 13px 12px" }

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
			style={STATION_STYLE}
			className={cn(styles.station, styles[side], reached && styles.reached, here && styles.here)}
		>
			<div data-cairn style={CAIRN_STYLE} className={styles.cairn}>
				<span className={styles.halo} aria-hidden="true" />
				<ApachetaCairn />
			</div>
			{/* visible from the first render (`in`): the links must be in the server HTML and work without JS */}
			<div data-card style={CARD_STYLE} className={cn(styles.card, styles.in)}>
				<p className="font-mono text-[10px] font-medium uppercase tracking-[0.13em] text-primary/90">{label}</p>
				{children}
			</div>
		</div>
	)
}

/**
 * Top of every Cuadernito/Herramientas page, built from the landing's own pieces (parchment ground,
 * scenery, the trail through the cairns): it names Apacheta, then three short stops, "Comenzá tu camino",
 * quick links to the social channels, and the donation, and the page continues below. Compact, so it fits
 * one screen together with the page title. It adds no
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
					<div
						data-clear
						className={cn("mx-auto flex max-w-2xl flex-wrap items-baseline gap-x-4 gap-y-1 px-5 pb-2 pt-6 sm:px-6", styles.textZone)}
					>
						<p className="text-4xl font-extrabold leading-none tracking-tight text-foreground sm:text-5xl">Apacheta</p>
						<p className="text-sm leading-snug text-muted-foreground">
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
							<p className={CARD_TITLE}>Seguí el camino</p>
							<Link href="/onboarding" className={PRIMARY_BUTTON}>
								{HERO.cta}
							</Link>
						</HeaderStation>

						<HeaderStation index={1} side="right" reached={reachedCount > 1} here={activeIndex === 1} label="Comunidad">
							<p className={CARD_TITLE}>Sumate al camino</p>
							<CommunityQuickLinks />
						</HeaderStation>

						<HeaderStation index={2} side="left" reached={reachedCount > 2} here={activeIndex === 2} label="Apoyá el proyecto">
							<p className={CARD_TITLE}>¿Te sirve?</p>
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

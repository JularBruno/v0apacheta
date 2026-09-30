"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { cn } from "@/lib/utils"
import ApachetaCairn from "@/components/apacheta-cairn"
import styles from "./donation-trail.module.css"

export interface DonationStation {
	title: string
	/** narrative copy for a "story" station */
	body?: ReactNode
	/** arbitrary content for a "destination" station, e.g. payment methods */
	content?: ReactNode
	/** small closing line rendered under this station's card */
	footnote?: ReactNode
}

/**
 * A compact, two-stop cairn trail for the donaciones page — same visual language
 * as components/camino (cairn + floating card, parchment palette) but purpose-built
 * for a short, fixed number of stations inside the dashboard's own scroll container.
 * See components/camino/use-trail.ts for the full scroll-driven system this
 * deliberately does NOT reuse (window-scroll bound, tuned for a tall full page).
 *
 * `page` (default) is the dashboard donaciones layout: tall stations that reveal as they scroll into view.
 * `header` is the compact banner for public Cuadernito/Herramientas pages: already revealed (so the
 * content is in the server HTML and visible without JS), titles are plain text (the page's <h1> comes
 * later), and from 768px the two stations sit side by side on a horizontal trail.
 */
export default function DonationTrail({
	stations,
	variant = "page",
}: {
	stations: DonationStation[]
	variant?: "page" | "header"
}) {
	const isHeader = variant === "header"
	const Title = isHeader ? "p" : "h2"
	// the page's own <article> must be the only one on a Cuadernito page, so header cards are plain divs
	const Card = isHeader ? "div" : "article"
	const stationRefs = useRef<(HTMLDivElement | null)[]>([])
	const [revealed, setRevealed] = useState<boolean[]>(() => stations.map(() => isHeader))

	useEffect(() => {
		if (isHeader) return
		const observer = new IntersectionObserver(
			(entries) => {
				setRevealed((prev) => {
					let changed = false
					const next = [...prev]
					for (const entry of entries) {
						if (!entry.isIntersecting) continue
						const index = stationRefs.current.indexOf(entry.target as HTMLDivElement)
						if (index !== -1 && !next[index]) {
							next[index] = true
							changed = true
						}
					}
					return changed ? next : prev
				})
			},
			{ threshold: 0.35 },
		)

		for (const el of stationRefs.current) {
			if (el) observer.observe(el)
		}

		return () => observer.disconnect()
	}, [])

	const destinationReached = revealed[revealed.length - 1]

	const stationNodes = stations.map((station, index) => (
		<div
			key={station.title}
			ref={(el) => {
				stationRefs.current[index] = el
			}}
			data-trail-station=""
			data-revealed={String(!!revealed[index])}
			className={cn(styles.station, revealed[index] && styles.revealed)}
		>
			<div className={styles.cairn}>
				<ApachetaCairn />
			</div>

			<Card className={styles.card}>
				<Title className={styles.cardTitle}>{station.title}</Title>
				{station.body}
				{station.content}
				{station.footnote && <div className={styles.footnote}>{station.footnote}</div>}
			</Card>
		</div>
	))

	return (
		<div className={cn(styles.panel, isHeader && styles.headerPanel)} data-variant={variant}>
			<svg className={styles.path} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
				<path className={styles.trailFull} d="M 50 0 C 20 30, 80 70, 50 100" />
				<path
					className={cn(styles.trailWalked, destinationReached && styles.walked)}
					d="M 50 0 C 20 30, 80 70, 50 100"
				/>
			</svg>

			{isHeader ? (
				<div className={styles.headerRow}>
					{/* horizontal trail between the two cairns, from 768px; the vertical one above is used below that */}
					<svg className={styles.pathH} viewBox="0 0 100 20" preserveAspectRatio="none" aria-hidden="true">
						<path className={styles.trailFull} d="M 0 10 C 30 0, 70 20, 100 10" />
						<path className={cn(styles.trailWalked, styles.walked)} d="M 0 10 C 30 0, 70 20, 100 10" />
					</svg>
					{stationNodes}
				</div>
			) : (
				stationNodes
			)}
		</div>
	)
}

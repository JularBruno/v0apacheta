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
 */
export default function DonationTrail({ stations }: { stations: DonationStation[] }) {
	const stationRefs = useRef<(HTMLDivElement | null)[]>([])
	const [revealed, setRevealed] = useState<boolean[]>(() => stations.map(() => false))

	useEffect(() => {
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

	return (
		<div className={styles.panel}>
			<svg className={styles.path} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
				<path className={styles.trailFull} d="M 50 0 C 20 30, 80 70, 50 100" />
				<path
					className={cn(styles.trailWalked, destinationReached && styles.walked)}
					d="M 50 0 C 20 30, 80 70, 50 100"
				/>
			</svg>

			{stations.map((station, index) => (
				<div
					key={station.title}
					ref={(el) => {
						stationRefs.current[index] = el
					}}
					className={cn(styles.station, revealed[index] && styles.revealed)}
				>
					<div className={styles.cairn}>
						<ApachetaCairn />
					</div>

					<article className={styles.card}>
						<h2 className={styles.cardTitle}>{station.title}</h2>
						{station.body}
						{station.content}
						{station.footnote && <div className={styles.footnote}>{station.footnote}</div>}
					</article>
				</div>
			))}
		</div>
	)
}

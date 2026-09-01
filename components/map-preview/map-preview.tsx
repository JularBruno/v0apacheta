"use client"

import { useRef, useState } from "react"
import { cn } from "@/lib/utils"
import ApachetaCairn from "@/components/apacheta-cairn"
import Scenery from "@/components/camino/scenery"
import { CURRENT_INDEX, MAP_NODES, type StepStatus, type StepType } from "@/lib/trail/map-steps"
import { useMapTrail } from "./use-map-trail"
import styles from "./map-preview.module.css"

const SIZE: Record<StepType, string> = {
	minor: styles.minor,
	major: styles.major,
	chapter: styles.chapter,
}
const STATE: Record<StepStatus, string> = {
	completed: styles.completed,
	current: styles.current,
	locked: styles.locked,
}

/**
 * Visual mockup of the dashboard map — the full journey from map-context.json
 * as one scrollable trail. States (completed / current / locked) come from a
 * hardcoded "you are here". Cairns are clickable (selected ring + title chip);
 * no detail card yet.
 */
export default function MapPreview() {
	const pageRef = useRef<HTMLDivElement>(null)
	const trailRef = useRef<HTMLDivElement>(null)
	const fullRef = useRef<SVGPathElement>(null)
	const walkedRef = useRef<SVGPathElement>(null)
	const [selected, setSelected] = useState<string | null>(null)

	const { geometry } = useMapTrail({ trailRef, fullRef, walkedRef, currentIndex: CURRENT_INDEX })

	return (
		<div ref={pageRef} className={styles.page}>
			<Scenery pageRef={pageRef} geometry={geometry} />

			<div className={styles.content}>
				<div ref={trailRef} data-trail className={styles.trail}>
					<svg className={styles.svg} aria-hidden="true">
						<path ref={fullRef} className={styles.full} />
						<path ref={walkedRef} className={styles.walked} />
					</svg>

					{MAP_NODES.map((node, i) => {
						const side = i % 2 === 0 ? styles.left : styles.right
						const showLabel = node.status !== "locked" && (node.status === "current" || selected === node.id)
						return (
							<section
								key={node.id}
								data-station={i}
								className={cn(styles.station, SIZE[node.type], STATE[node.status], side, selected === node.id && styles.isSelected)}
							>
								{node.stageStart && <span className={styles.stageTag}>{node.stageLabel}</span>}

								<button
									data-cairn
									type="button"
									className={styles.cairn}
									disabled={node.status === "locked"}
									aria-label={node.status === "locked" ? "Paso bloqueado" : node.title}
									onClick={() => setSelected((s) => (s === node.id ? null : node.id))}
								>
									<span className={styles.halo} aria-hidden="true" />
									<ApachetaCairn />
								</button>

								{showLabel && <span className={styles.label}>{node.title}</span>}
							</section>
						)
					})}
				</div>
			</div>
		</div>
	)
}

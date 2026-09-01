"use client"

import { useRef, useState } from "react"
import { cn } from "@/lib/utils"
import ApachetaCairn from "@/components/apacheta-cairn"
import Scenery from "@/components/camino/scenery"
import { CURRENT_INDEX, MAP_NODES, type MapNode, type StepStatus, type StepType } from "@/lib/trail/map-steps"
import StepSheet, { type SheetState } from "./step-sheet"
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
 * as one scrollable trail, plus a step detail sheet (bottom sheet on mobile,
 * right panel on desktop). Nothing is wired to anything real.
 */
export default function MapPreview() {
	const pageRef = useRef<HTMLDivElement>(null)
	const trailRef = useRef<HTMLDivElement>(null)
	const fullRef = useRef<SVGPathElement>(null)
	const walkedRef = useRef<SVGPathElement>(null)

	const currentNode = MAP_NODES[CURRENT_INDEX]
	const [sheetNode, setSheetNode] = useState<MapNode>(currentNode)
	const [sheetState, setSheetState] = useState<SheetState>("peek")
	const [selectedId, setSelectedId] = useState<string>(currentNode.id)
	const [toast, setToast] = useState<string | null>(null)
	const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

	const mode = sheetNode.status === "current" ? "current" : "review"

	const { geometry } = useMapTrail({ trailRef, fullRef, walkedRef, currentIndex: CURRENT_INDEX })

	function flashToast(msg: string) {
		setToast(msg)
		clearTimeout(toastTimer.current)
		toastTimer.current = setTimeout(() => setToast(null), 2600)
	}

	function handleCairn(node: MapNode) {
		if (node.status === "locked") {
			flashToast(`Todavía no. Estás en: ${currentNode.title}`)
			return
		}
		setSelectedId(node.id)
		if (node.status === "current") {
			setSheetNode(currentNode)
			setSheetState((s) => (s === "open" ? "peek" : "open"))
		} else {
			setSheetNode(node)
			setSheetState("open")
		}
	}

	function backToCurrent() {
		setSheetNode(currentNode)
		setSelectedId(currentNode.id)
		setSheetState("peek")
	}

	function toggleSheet() {
		if (sheetState !== "open") {
			setSheetState("open")
		} else if (mode === "review") {
			backToCurrent()
		} else {
			setSheetState("peek")
		}
	}

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
						const showLabel = node.status !== "locked" && (node.status === "current" || selectedId === node.id)
						return (
							<section
								key={node.id}
								data-station={i}
								className={cn(
									styles.station,
									SIZE[node.type],
									STATE[node.status],
									side,
									selectedId === node.id && styles.isSelected,
								)}
							>
								{node.stageStart && <span className={styles.stageTag}>{node.stageLabel}</span>}

								<button
									data-cairn
									type="button"
									className={styles.cairn}
									disabled={node.status === "locked"}
									aria-label={node.status === "locked" ? "Paso bloqueado" : node.title}
									onClick={() => handleCairn(node)}
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

			{toast && <div className={styles.toast}>{toast}</div>}

			<StepSheet node={sheetNode} state={sheetState} mode={mode} onToggle={toggleSheet} onBack={backToCurrent} />
		</div>
	)
}

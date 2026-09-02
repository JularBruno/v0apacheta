"use client"

import { useMemo, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import ApachetaCairn from "@/components/apacheta-cairn"
import Scenery from "@/components/camino/scenery"
import { useUpdateMapLevel } from "@/lib/hooks/use-update-map-level"
import StepSheet, { type SheetState, type SheetStep } from "./step-sheet"
import { useMapTrail } from "./use-map-trail"
import styles from "./trail-map.module.css"

export type TrailMapStep = SheetStep

const SIZE: Record<TrailMapStep["type"], string> = {
	minor: styles.minor,
	major: styles.major,
	chapter: styles.chapter,
}
const STATE: Record<TrailMapStep["status"], string> = {
	completed: styles.completed,
	unlocked: styles.current,
	locked: styles.locked,
}

interface Props {
	steps: TrailMapStep[]
}

export default function TrailMap({ steps: initialSteps }: Props) {
	const [steps, setSteps] = useState<TrailMapStep[]>(initialSteps)

	const frameRef = useRef<HTMLDivElement>(null)
	const scrollRef = useRef<HTMLDivElement>(null)
	const contentRef = useRef<HTMLDivElement>(null)
	const trailRef = useRef<HTMLDivElement>(null)
	const fullRef = useRef<SVGPathElement>(null)
	const walkedRef = useRef<SVGPathElement>(null)

	const currentIndex = useMemo(() => {
		const i = steps.findIndex((s) => s.status === "unlocked")
		return i === -1 ? steps.length - 1 : i
	}, [steps])
	const currentStep = steps[currentIndex]

	const [sheetStep, setSheetStep] = useState<TrailMapStep>(currentStep)
	const [sheetState, setSheetState] = useState<SheetState>("peek")
	const [selectedId, setSelectedId] = useState<string>(currentStep.id)
	const [toast, setToast] = useState<string | null>(null)
	const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

	const { mutate: updateMapLevel } = useUpdateMapLevel()
	const { geometry } = useMapTrail({
		trailRef,
		fullRef,
		walkedRef,
		currentIndex,
		count: steps.length,
	})

	const liveSheetStep = steps.find((s) => s.id === sheetStep.id) ?? currentStep
	const mode = liveSheetStep.status === "unlocked" ? "current" : "review"
	const completed = steps.filter((s) => s.status === "completed").length

	function flashToast(msg: string) {
		setToast(msg)
		clearTimeout(toastTimer.current)
		toastTimer.current = setTimeout(() => setToast(null), 2600)
	}

	function backToCurrent() {
		setSheetStep(currentStep)
		setSelectedId(currentStep.id)
		setSheetState("peek")
	}

	function toggleSheet() {
		if (sheetState !== "open") setSheetState("open")
		else if (mode === "review") backToCurrent()
		else setSheetState("peek")
	}

	function handleCairn(step: TrailMapStep) {
		if (step.status === "locked") {
			flashToast(`Todavía no. Estás en: ${currentStep.title}`)
			return
		}
		setSelectedId(step.id)
		if (step.status === "unlocked") {
			setSheetStep(currentStep)
			setSheetState((s) => (s === "open" ? "peek" : "open"))
		} else {
			setSheetStep(step)
			setSheetState("open")
		}
	}

	function handleComplete(stepId: string) {
		const idx = steps.findIndex((s) => s.id === stepId)
		const next = steps[idx + 1]
		if (next) updateMapLevel(next.id)

		setSteps((prev) =>
			prev.map((s, i) => {
				if (s.id === stepId) return { ...s, status: "completed" as const }
				if (i === idx + 1 && s.status === "locked") return { ...s, status: "unlocked" as const }
				return s
			}),
		)
		if (next) {
			setSheetStep(next)
			setSelectedId(next.id)
		}
		setSheetState("peek")
	}

	return (
		<div ref={frameRef} className={styles.frame}>
			<span className={styles.pill}>
				{completed}/{steps.length}
			</span>

			<div ref={scrollRef} className={styles.page}>
				<div ref={contentRef} className={styles.content}>
					<Scenery pageRef={contentRef} scrollHost={scrollRef} geometry={geometry} />

					<div ref={trailRef} data-trail className={styles.trail}>
						<svg className={styles.svg} aria-hidden="true">
							<path ref={fullRef} className={styles.full} />
							<path ref={walkedRef} className={styles.walked} />
						</svg>

						{steps.map((step, i) => {
							const side = i % 2 === 0 ? styles.left : styles.right
							const showLabel =
								step.status !== "locked" && (step.status === "unlocked" || selectedId === step.id)
							return (
								<section
									key={step.id}
									className={cn(
										styles.station,
										SIZE[step.type],
										STATE[step.status],
										side,
										selectedId === step.id && styles.isSelected,
									)}
								>
									<button
										data-cairn
										type="button"
										className={styles.cairn}
										disabled={step.status === "locked"}
										aria-label={step.status === "locked" ? "Paso bloqueado" : step.title}
										onClick={() => handleCairn(step)}
									>
										<span className={styles.halo} aria-hidden="true" />
										<ApachetaCairn />
									</button>

									{showLabel && <span className={styles.label}>{step.title}</span>}
								</section>
							)
						})}
					</div>
				</div>
			</div>

			{toast && <div className={styles.toast}>{toast}</div>}

			<StepSheet
				step={liveSheetStep}
				state={sheetState}
				mode={mode}
				onToggle={toggleSheet}
				onBack={backToCurrent}
				onComplete={handleComplete}
			/>
		</div>
	)
}

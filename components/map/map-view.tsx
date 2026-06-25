"use client"

import type { ComponentType } from "react"
import { useState, useRef, useEffect, useMemo } from "react"
import TrailPath from "@/components/map/trail-path"
import StepNode from "@/components/map/step-node"
import StepCard from "@/components/map/step-card"
import { useUpdateMapLevel } from "@/lib/hooks/use-update-map-level"

const STEP_GAP = 130

export interface MapStepInput {
	id: string
	level: string
	title: string
	description: string
	longDescription: string
	appInstruction?: string
	validationButton?: string
	validationFallback?: string
	customComponent?: "notification-button"
	contentComponent?: string
	status: "completed" | "unlocked" | "locked"
	icon: ComponentType<{ className?: string }>
	type: "chapter" | "major" | "minor"
	stage: number
}

interface StepWithPos extends MapStepInput {
	x: number
	y: number
}

interface MapViewProps {
	steps: MapStepInput[]
}


export default function MapView({ steps: initialSteps }: MapViewProps) {
	const [steps, setSteps] = useState<MapStepInput[]>(initialSteps)
	const [selectedId, setSelectedId] = useState<string | null>(null)
	const [isDesktop, setIsDesktop] = useState(false)
	const scrollRef = useRef<HTMLDivElement>(null)
	const { mutate: updateMapLevel } = useUpdateMapLevel()

	useEffect(() => {
		const mq = window.matchMedia('(min-width: 768px)')
		setIsDesktop(mq.matches)
		const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
		mq.addEventListener('change', handler)
		return () => mq.removeEventListener('change', handler)
	}, [])

	const COUNT = steps.length
	const canvasHeight = COUNT * STEP_GAP

	const stepsWithPos = useMemo<StepWithPos[]>(() =>
		steps.map((step, i) => {
			const t = COUNT > 1 ? i / (COUNT - 1) : 0
			// 1.5 sine periods — starts and ends centered (sin=0), amplitude 18%
			const x = 50 + Math.sin(i * 3 * Math.PI / (COUNT - 1)) * 18
			return {
				...step,
				x,
				y: 95 - t * 90, // bottom 95% → top 5%
			}
		}),
		[steps, COUNT]
	)

	const playerId = useMemo(() => {
		const first = stepsWithPos.find(s => s.status === "unlocked")
		return first?.id ?? stepsWithPos[stepsWithPos.length - 1]?.id
	}, [stepsWithPos])

	const completedCount = useMemo(() =>
		steps.filter(s => s.status === "completed").length,
		[steps]
	)

	const player = stepsWithPos.find(s => s.id === playerId)
	const selected = stepsWithPos.find(s => s.id === selectedId)

	useEffect(() => {
		if (!scrollRef.current || !player) return
		const el = scrollRef.current
		const frame = requestAnimationFrame(() => {
			const scrollTop = (player.y / 100) * canvasHeight - el.clientHeight / 2
			el.scrollTo({ top: Math.max(0, scrollTop), behavior: "smooth" })
		})
		return () => cancelAnimationFrame(frame)
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [playerId, canvasHeight])

	function handleComplete(stepId: string) {
		const idx = steps.findIndex(s => s.id === stepId)
		const next = steps[idx + 1]

		if (next) {
			console.log("[map] completing", stepId, "→ advancing mapLevel to", next.id)
			updateMapLevel(next.id, {
				onSuccess: () => console.log("[map] mapLevel updated to", next.id),
				onError: (err) => console.error("[map] mapLevel update failed", err),
			})
		}

		setSteps(prev => prev.map((s, i) => {
			if (s.id === stepId) return { ...s, status: "completed" as const }
			if (i === idx + 1 && s.status === "locked") return { ...s, status: "unlocked" as const }
			return s
		}))
		setSelectedId(null)
	}

	return (
		<div className="relative flex flex-col overflow-hidden bg-background h-[calc(100dvh-6rem)]">
			{/* HUD */}
			<header className="shrink-0 z-20 border-b bg-card/80 backdrop-blur-sm px-4 py-3 flex items-center justify-between">
				<div>
					<h1 className="text-base font-bold leading-tight text-foreground">El Camino</h1>
					<p className="text-[11px] text-muted-foreground">Tu travesía paso a paso</p>
				</div>
				<span className="rounded-full border bg-secondary px-2.5 py-1 text-xs font-semibold text-foreground">
					{completedCount}/{COUNT}
				</span>
			</header>

			{/* Scrollable trail */}
			<div ref={scrollRef} className="flex-1 overflow-y-auto overflow-x-hidden">
				<div className="relative w-full" style={{ height: canvasHeight }}>

					{/* Background images — full scroll-container width, no max-w-md */}
					<div className="absolute inset-0 pointer-events-none">
						{([1, 2, 3] as const).map((n) => (
							<div
								key={n}
								className="absolute inset-x-0 overflow-hidden"
								style={{ top: ((n - 1) * canvasHeight) / 3, height: canvasHeight / 3 }}
							>
								<img
									key={isDesktop ? `d${n}` : `m${n}`}
									src={isDesktop ? `/mapdesktop${n}.png` : `/mapmobile${n}.png`}
									className="absolute inset-0 w-full h-full object-cover"
									aria-hidden
									alt=""
								/>
							</div>
						))}
					</div>

					{/* Trail + nodes — max-w-md centered column */}
					<div className="relative mx-auto w-full max-w-md h-full">
						<TrailPath steps={stepsWithPos} />
						{stepsWithPos.map(step => (
							<StepNode
								key={step.id}
								step={step}
								position={{ x: step.x, y: step.y }}
								isPlayerHere={step.id === playerId}
								isSelected={step.id === selectedId}
								onSelect={() => setSelectedId(step.id)}
							/>
						))}
					</div>
				</div>
			</div>

			{/* Modal overlay */}
			{selected && (
				<div
					className="absolute inset-0 z-30 flex items-center justify-center bg-foreground/40"
					onClick={() => setSelectedId(null)}
				>
					<StepCard
						step={selected}
						onClose={() => setSelectedId(null)}
						onComplete={handleComplete}
					/>
				</div>
			)}
		</div>
	)
}

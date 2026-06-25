"use client"

import type { ComponentType } from "react"
import {
	Map,
	Wallet,
	PiggyBank,
	CreditCard,
	TrendingUp,
	Mountain,
	DollarSign,
	HandCoins,
	Scale,
	BarChart,
	BookOpen,
	Target,
	Shield,
	CalendarDays,
	Heart,
	Rocket,
	Lightbulb,
} from "lucide-react"
import MapView, { type MapStepInput } from "@/components/map/map-view"
import mapContext from "./map-context.json"
import { useProfile } from "@/lib/hooks/use-profile"
import { resolveMapLevel } from "@/lib/hooks/use-update-map-level"

const ICON_BY_ID: Record<string, ComponentType<{ className?: string }>> = {
	"stage-1": Map,
	"1.0": Map,
	"1.1": BookOpen,
	"1.1.1": DollarSign,
	"1.1.2": TrendingUp,
	"1.1.3": HandCoins,
	"1.1.4": CalendarDays,
	"1.2": Lightbulb,
	"stage-2": Wallet,
	"2.0": Wallet,
	"2.1": Target,
	"2.2": BarChart,
	"2.3": BarChart,
	"2.4": CalendarDays,
	"stage-3": Shield,
	"3.0": Scale,
	"3.1": PiggyBank,
	"3.2": CreditCard,
	"3.3": Shield,
	"3.4": CreditCard,
	"3.5": BookOpen,
	"3.6": PiggyBank,
	"stage-4": TrendingUp,
	"4.0": TrendingUp,
	"4.1": TrendingUp,
	"4.2": CalendarDays,
	"4.3": Heart,
	"stage-5": Mountain,
	"5.0": Scale,
	"5.1": Rocket,
	"5.2": Shield,
	"5.3": Mountain,
}

const EXTRA_BY_ID: Partial<Record<string, {
	validationButton?: string
	validationFallback?: string
	customComponent?: "notification-button"
}>> = {
	"1.0":     { customComponent: "notification-button", validationFallback: "Continuar" },
	"stage-2": { validationButton: "Continuar" },
	"3.2":     { validationFallback: "No tengo deudas, continuar" },
	"3.4":     { validationFallback: "Liquidé todas mis deudas" },
	"5.1":     { validationFallback: "No planeo emprender ahora, continuar" },
}

/**
 * Derive step statuses from the user's current mapLevel.
 * Everything before the unlocked step is "completed", the unlocked step
 * is "unlocked", everything after is "locked". Stage headers follow their steps.
 */
function buildMapSteps(currentMapLevel: string): MapStepInput[] {
	// Build the flat ordered list first (without statuses), to find the unlock index
	type RawStep = { id: string; isStage: boolean; stageNum: number; data: Omit<MapStepInput, "status"> }
	const raw: RawStep[] = []

	mapContext.stages.forEach((stage, stageIdx) => {
		const stageNum = stageIdx + 1

		const stageExtra = EXTRA_BY_ID[stage.id] ?? {}
		raw.push({
			id: stage.id,
			isStage: true,
			stageNum,
			data: {
				id: stage.id,
				level: "—",
				title: stage.chapter.replace(/^Capítulo \d+:\s*/, ""),
				description: stage.tagline,
				longDescription: stage.principle,
				appInstruction: undefined,
				validationButton: stageExtra.validationButton,
				validationFallback: stageExtra.validationFallback,
				icon: ICON_BY_ID[stage.id] ?? Map,
				type: "chapter",
				stage: stageNum,
			},
		})

		stage.steps.forEach(step => {
			const extra = EXTRA_BY_ID[step.stepId] ?? {}
			const v = step.validation as { button?: string } | undefined

			raw.push({
				id: step.stepId,
				isStage: false,
				stageNum,
				data: {
					id: step.stepId,
					level: step.stepId,
					title: step.title,
					description: step.description,
					longDescription: step.longDescription,
					appInstruction: step.appInstruction ?? undefined,
					validationButton: extra.customComponent ? undefined : (v?.button ?? "Continuar"),
					validationFallback: extra.validationFallback,
					customComponent: extra.customComponent,
					contentComponent: (step as { component?: string }).component,
					icon: ICON_BY_ID[step.stepId] ?? BookOpen,
					type: step.type as "chapter" | "major" | "minor",
					stage: stageNum,
				},
			})
		})
	})

	const unlockedIdx = raw.findIndex(r => r.id === currentMapLevel)

	return raw.map((r, i) => {
		let status: MapStepInput["status"]
		if (unlockedIdx === -1) {
			// mapLevel not found — unlock the first step
			status = i === 0 ? "unlocked" : "locked"
		} else if (i < unlockedIdx) {
			status = "completed"
		} else if (i === unlockedIdx) {
			status = "unlocked"
		} else {
			status = "locked"
		}
		return { ...r.data, status }
	})
}

export default function MapaPage() {
	const { data: user, isLoading } = useProfile()

	if (isLoading) {
		return (
			<div className="flex h-[calc(100dvh-6rem)] items-center justify-center text-muted-foreground text-sm">
				Cargando mapa…
			</div>
		)
	}

	const mapLevel = resolveMapLevel(user?.mapLevel)
	return <MapView steps={buildMapSteps(mapLevel)} />
}

"use client"

import TrailMap, { type TrailMapStep } from "@/components/map-camino/trail-map"
import mapContext from "./map-context.json"
import { useProfile } from "@/lib/hooks/use-profile"
import { resolveMapLevel } from "@/lib/hooks/use-update-map-level"

type Status = TrailMapStep["status"]

const EXTRA_BY_ID: Partial<
	Record<
		string,
		{
			validationButton?: string
			validationFallback?: string
			customComponent?: "notification-button"
		}
	>
> = {
	"1.0": { customComponent: "notification-button", validationFallback: "Continuar" },
	"stage-2": { validationButton: "Continuar" },
	"3.2": { validationFallback: "No tengo deudas, continuar" },
	"3.4": { validationFallback: "Liquidé todas mis deudas" },
	"5.1": { validationFallback: "No planeo emprender ahora, continuar" },
}

/**
 * Flatten map-context.json into an ordered node list (stage headers included —
 * they're part of the unlock sequence) and derive each node's status from the
 * user's current mapLevel: before → completed, at → unlocked, after → locked.
 */
function buildMapSteps(currentMapLevel: string): TrailMapStep[] {
	type Raw = { id: string; data: Omit<TrailMapStep, "status"> }
	const raw: Raw[] = []

	mapContext.stages.forEach((stage) => {
		const stageExtra = EXTRA_BY_ID[stage.id] ?? {}
		raw.push({
			id: stage.id,
			data: {
				id: stage.id,
				level: "—",
				title: stage.chapter.replace(/^Capítulo \d+:\s*/, ""),
				description: stage.tagline,
				longDescription: stage.principle,
				teachingConcepts: [],
				validationButton: stageExtra.validationButton,
				validationFallback: stageExtra.validationFallback,
				type: "chapter",
			},
		})

		stage.steps.forEach((step) => {
			const extra = EXTRA_BY_ID[step.stepId] ?? {}
			const v = step.validation as { button?: string } | undefined

			raw.push({
				id: step.stepId,
				data: {
					id: step.stepId,
					level: step.stepId,
					title: step.title,
					description: step.description,
					longDescription: step.longDescription,
					appInstruction: step.appInstruction ?? undefined,
					teachingConcepts: (step as { teachingConcepts?: string[] }).teachingConcepts ?? [],
					validationButton: extra.customComponent ? undefined : (v?.button ?? "Continuar"),
					validationFallback: extra.validationFallback,
					customComponent: extra.customComponent,
					contentComponent: (step as { component?: string }).component,
					type: step.type as TrailMapStep["type"],
				},
			})
		})
	})

	const unlockedIdx = raw.findIndex((r) => r.id === currentMapLevel)

	return raw.map((r, i) => {
		let status: Status
		if (unlockedIdx === -1) status = i === 0 ? "unlocked" : "locked"
		else if (i < unlockedIdx) status = "completed"
		else if (i === unlockedIdx) status = "unlocked"
		else status = "locked"
		return { ...r.data, status }
	})
}

export default function MapaPage() {
	const { data: user, isLoading } = useProfile()

	if (isLoading) {
		return (
			<div className="flex h-[calc(100dvh-6rem)] items-center justify-center text-sm text-muted-foreground">
				Cargando mapa…
			</div>
		)
	}

	const mapLevel = resolveMapLevel(user?.mapLevel)
	return <TrailMap steps={buildMapSteps(mapLevel)} />
}

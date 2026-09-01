/**
 * The full Apacheta journey, flattened from `map-context.json` for the map
 * preview mockup (`/mapa-preview`). Node status is derived from a hardcoded
 * "you are here" — nothing real, just so all three states are visible.
 */

import rawJson from "@/app/dashboard/mapa/map-context.json"

export type StepType = "major" | "minor" | "chapter"
export type StepStatus = "completed" | "current" | "locked"

export interface MapNode {
	/** stepId, e.g. "1.1.2" */
	id: string
	stage: number
	/** "Capítulo 1" (chapter prefix only) */
	stageLabel: string
	/** first node of its stage — used to drop a stage tag on the trail */
	stageStart: boolean
	type: StepType
	title: string
	description: string
	longDescription: string
	appInstruction?: string
	teachingConcepts: string[]
	validation: { type: string; button?: string }
	status: StepStatus
}

interface RawStep {
	stepId: string
	type: string
	title: string
	description: string
	longDescription: string
	appInstruction?: string
	teachingConcepts?: string[]
	validation?: { type?: string; button?: string }
}
interface RawStage {
	id: string
	chapter: string
	steps: RawStep[]
}

/** Mock traveller position — change this to preview other states. */
export const CURRENT_STEP_ID = "2.1"

const stages = (rawJson as unknown as { stages: RawStage[] }).stages

const cleanTitle = (t: string) => t.replace(/^HOLA HICE HASTA ACA ESPERAME\s+/i, "")
const chapterPrefix = (chapter: string) => chapter.split(":")[0].trim()

const flat = stages.flatMap((stage, si) =>
	stage.steps.map((step, idx) => ({
		id: step.stepId,
		stage: si + 1,
		stageLabel: chapterPrefix(stage.chapter),
		stageStart: idx === 0,
		type: (["major", "minor", "chapter"].includes(step.type) ? step.type : "minor") as StepType,
		title: cleanTitle(step.title),
		description: step.description,
		longDescription: step.longDescription,
		appInstruction: step.appInstruction,
		teachingConcepts: step.teachingConcepts ?? [],
		validation: {
			type: step.validation?.type ?? "acknowledged",
			button: step.validation?.button,
		},
	})),
)

export const CURRENT_INDEX = Math.max(
	0,
	flat.findIndex((n) => n.id === CURRENT_STEP_ID),
)

export const MAP_NODES: MapNode[] = flat.map((n, i) => ({
	...n,
	status: i < CURRENT_INDEX ? "completed" : i === CURRENT_INDEX ? "current" : "locked",
}))

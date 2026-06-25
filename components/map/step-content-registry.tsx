"use client"

import type { ComponentType } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface StepContentProps {
	id: string
	description: string
	longDescription: string
	appInstruction?: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function renderBold(text: string) {
	return text.split(/(\*\*[^*]+\*\*)/).map((part, i) =>
		part.startsWith("**")
			? <strong key={i}>{part.slice(2, -2)}</strong>
			: part
	)
}

// ─── Default renderer ─────────────────────────────────────────────────────────

/**
 * Default body for steps without a custom component.
 * Renders description only — longDescription and appInstruction are handled
 * by StepCard so they stay below the "Ver más" toggle.
 */
export function DefaultStepContent({ description }: StepContentProps) {
	return (
		<p className="text-sm leading-relaxed text-foreground/80">{renderBold(description)}</p>
	)
}

// ─── Custom components ────────────────────────────────────────────────────────
// Add entries here as you build them. The key matches the "component" field in map-context.json.

function IncomeWithImportContent({ description, longDescription, appInstruction }: StepContentProps) {
	return (
		<div className="space-y-3">
			<p className="text-sm leading-relaxed text-foreground/80">{renderBold(description)}</p>
			<p className="text-sm leading-relaxed text-foreground/70">{renderBold(longDescription)}</p>
			{appInstruction && (
				<p className="text-xs leading-relaxed text-foreground/60 whitespace-pre-line">
					{renderBold(appInstruction)}
				</p>
			)}
			<Button asChild variant="outline" size="sm" className="w-full gap-2">
				<Link href="/dashboard/importar">
					Importar desde Excel
					<ArrowRight className="h-3.5 w-3.5" />
				</Link>
			</Button>
		</div>
	)
}

export const STEP_CONTENT_REGISTRY: Record<string, ComponentType<StepContentProps>> = {
	"income-with-import": IncomeWithImportContent,
}
"use client"

import { useState } from "react"
import { ChevronDown, MapPin, X, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import SubscriptionButtonNotification from "@/components/notifications/subscription-notification-button"

interface StepCardStep {
	id: string
	level: string
	title: string
	description: string
	longDescription: string
	appInstruction?: string
	validationButton?: string
	validationFallback?: string
	customComponent?: "notification-button"
	status: "completed" | "unlocked" | "locked"
}

interface StepCardProps {
	step: StepCardStep
	onClose: () => void
	onComplete: (stepId: string) => void
}

export default function StepCard({ step, onClose, onComplete }: StepCardProps) {
	const [expanded, setExpanded] = useState(false)
	const isCompleted = step.status === "completed"

	return (
		<div
			role="dialog"
			aria-modal="true"
			aria-label={step.title}
			onClick={e => e.stopPropagation()}
			className="w-[88vw] max-w-sm rounded-2xl border bg-card shadow-xl overflow-hidden"
		>
			{/* Header */}
			<div className="flex items-start justify-between gap-2 border-b bg-secondary/50 px-4 py-3">
				<div>
					<p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
						Paso {step.level !== "—" ? step.level : step.id}
					</p>
					<h2 className="text-base font-bold leading-tight text-foreground">{step.title}</h2>
				</div>
				<button
					onClick={onClose}
					aria-label="Cerrar"
					className="mt-0.5 shrink-0 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
				>
					<X className="h-4 w-4" />
				</button>
			</div>

			{/* Body */}
			<div className="max-h-[42vh] overflow-y-auto px-4 py-3 space-y-3">
				<p className="text-sm leading-relaxed text-foreground/80">{step.description}</p>

				{/* Ver más toggle */}
				<button
					onClick={() => setExpanded(e => !e)}
					className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
				>
					{expanded ? "Ver menos" : "Ver más"}
					<ChevronDown className={cn("h-3 w-3 transition-transform duration-200", expanded && "rotate-180")} />
				</button>

				{expanded && (
					<p className="text-sm leading-relaxed text-foreground/70">{step.longDescription}</p>
				)}

				{/* App instruction */}
				{step.appInstruction && (
					<div className="rounded-lg border bg-muted/40 px-3 py-2.5 flex gap-2">
						<MapPin className="h-4 w-4 mt-0.5 shrink-0 text-accent" />
						<p className="text-xs leading-relaxed text-foreground/70 whitespace-pre-line">
							{step.appInstruction}
						</p>
					</div>
				)}
			</div>

			{/* Footer */}
			<div className="border-t px-4 py-3">
				{isCompleted ? (
					<div className="flex items-center justify-center gap-2 text-primary">
						<CheckCircle2 className="h-4 w-4" />
						<span className="text-sm font-semibold">Completado</span>
					</div>
				) : step.customComponent === "notification-button" ? (
					<div className="space-y-2">
						<SubscriptionButtonNotification />
						{step.validationFallback && (
							<Button
								variant="ghost"
								size="sm"
								className="w-full text-muted-foreground text-xs"
								onClick={() => onComplete(step.id)}
							>
								{step.validationFallback}
							</Button>
						)}
					</div>
				) : !step.validationButton && !step.validationFallback ? (
					<p className="text-center text-xs text-muted-foreground">
						Se completa al avanzar los sub-pasos.
					</p>
				) : (
					<div className="space-y-2">
						{step.validationButton && (
							<Button className="w-full" onClick={() => onComplete(step.id)}>
								{step.validationButton}
							</Button>
						)}
						{step.validationFallback && (
							<Button
								variant="ghost"
								size="sm"
								className="w-full text-muted-foreground text-xs"
								onClick={() => onComplete(step.id)}
							>
								{step.validationFallback}
							</Button>
						)}
					</div>
				)}
			</div>
		</div>
	)
}

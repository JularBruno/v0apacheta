"use client"

import { ArrowRight, Check, X } from "lucide-react"
import { cn } from "@/lib/utils"
import SubscriptionButtonNotification from "@/components/notifications/subscription-notification-button"
import { useStepValidation } from "@/lib/hooks/use-step-validation"
import { STEP_CONTENT_REGISTRY, renderBold } from "@/components/map/step-content-registry"
import styles from "./step-sheet.module.css"

export type SheetState = "closed" | "peek" | "open"

export interface SheetStep {
	id: string
	level: string
	title: string
	description: string
	longDescription: string
	appInstruction?: string
	teachingConcepts: string[]
	validationButton?: string
	validationFallback?: string
	customComponent?: "notification-button"
	contentComponent?: string
	status: "completed" | "unlocked" | "locked"
	type: "chapter" | "major" | "minor"
}

const TYPE_LABEL: Record<SheetStep["type"], string> = {
	chapter: "Capítulo",
	major: "Hito",
	minor: "Paso",
}

interface Props {
	step: SheetStep
	state: SheetState
	/** review = looking back at a completed step */
	mode: "current" | "review"
	onToggle: () => void
	onBack: () => void
	onComplete: (stepId: string) => void
}

function Footer({ step, mode, onBack, onComplete }: Omit<Props, "state" | "onToggle">) {
	const { valid, isLoading: validating } = useStepValidation(step.id)

	if (step.status === "completed") {
		return (
			<>
				<span className={styles.doneRow}>
					<Check size={16} /> Completado
				</span>
				{mode === "review" && (
					<button type="button" className={styles.backBtn} onClick={onBack}>
						← Volver al paso actual
					</button>
				)}
			</>
		)
	}

	if (step.customComponent === "notification-button") {
		return (
			<>
				<SubscriptionButtonNotification />
				{step.validationFallback && (
					<button type="button" className={styles.ghostBtn} onClick={() => onComplete(step.id)}>
						{valid ? "Continuar" : step.validationFallback}
					</button>
				)}
			</>
		)
	}

	if (!step.validationButton && !step.validationFallback) {
		return <p className={styles.subNote}>Se completa al avanzar los sub-pasos.</p>
	}

	return (
		<>
			{step.validationButton && (
				<button
					type="button"
					className={styles.primaryBtn}
					disabled={validating || !valid}
					onClick={() => onComplete(step.id)}
				>
					{validating ? "Verificando…" : step.validationButton}
					{!validating && valid && <ArrowRight size={16} />}
				</button>
			)}
			{step.validationFallback && (
				<button type="button" className={styles.ghostBtn} onClick={() => onComplete(step.id)}>
					{step.validationFallback}
				</button>
			)}
		</>
	)
}

export default function StepSheet({ step, state, mode, onToggle, onBack, onComplete }: Props) {
	const Content = step.contentComponent ? STEP_CONTENT_REGISTRY[step.contentComponent] : undefined

	return (
		<>
			<div className={styles.backdrop} data-show={state === "open"} onClick={onToggle} aria-hidden="true" />

			<aside
				className={styles.sheet}
				data-state={state}
				role="dialog"
				aria-modal={state === "open" ? "true" : undefined}
				aria-label={step.title}
			>
				<button type="button" className={styles.handle} onClick={onToggle} aria-label="Expandir o contraer">
					<span className={styles.grip} />
				</button>

				{mode === "review" && (
					<button type="button" className={styles.close} onClick={onBack} aria-label="Volver al paso actual">
						<X size={18} />
					</button>
				)}

				<div className={styles.head}>
					<div className={styles.meta}>
						<span className={styles.paso}>Paso {step.level !== "—" ? step.level : step.id}</span>
						<span className={cn(styles.chip, styles.chipType)}>{TYPE_LABEL[step.type]}</span>
						<span className={cn(styles.chip, step.status === "completed" ? styles.chipDone : styles.chipCurrent)}>
							{step.status === "completed" ? "✓ Completado" : "En curso"}
						</span>
					</div>

					<h2 className={styles.title}>{step.title}</h2>
					<p className={styles.lead}>{renderBold(step.description)}</p>

					<div className={styles.action}>
						<Footer step={step} mode={mode} onBack={onBack} onComplete={onComplete} />
					</div>
				</div>

				<div className={styles.body}>
					{Content ? (
						<Content
							id={step.id}
							description={step.description}
							longDescription={step.longDescription}
							appInstruction={step.appInstruction}
						/>
					) : (
						<>
							<p className={styles.long}>{renderBold(step.longDescription)}</p>
							{step.appInstruction && (
								<div className={styles.appBox}>
									<p className={styles.appLabel}>En la app</p>
									{step.appInstruction.split(/\n\n+/).map((para, i) => (
										<p key={i} className={styles.appPara}>
											{renderBold(para)}
										</p>
									))}
								</div>
							)}
						</>
					)}

					{step.teachingConcepts.length > 0 && (
						<details className={styles.concepts}>
							<summary>Conceptos ({step.teachingConcepts.length})</summary>
							<ul>
								{step.teachingConcepts.map((c, i) => (
									<li key={i}>{renderBold(c)}</li>
								))}
							</ul>
						</details>
					)}
				</div>
			</aside>
		</>
	)
}

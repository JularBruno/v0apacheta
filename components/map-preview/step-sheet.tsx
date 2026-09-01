"use client"

import { Fragment, type ReactNode } from "react"
import { ArrowRight, X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { MapNode } from "@/lib/trail/map-steps"
import styles from "./step-sheet.module.css"

export type SheetState = "closed" | "peek" | "open"

/** `**bold**` → <strong>. Nothing else. */
function bold(text: string): ReactNode[] {
	return text.split(/(\*\*[^*]+\*\*)/).map((part, i) =>
		part.startsWith("**") ? <strong key={i}>{part.slice(2, -2)}</strong> : <Fragment key={i}>{part}</Fragment>,
	)
}

const TYPE_LABEL: Record<MapNode["type"], string> = {
	chapter: "Capítulo",
	major: "Hito",
	minor: "Paso",
}

function ValidationAction({ node }: { node: MapNode }) {
	const isAck = node.validation.type.includes("acknowledged")
	if (isAck) {
		return (
			<button type="button" className={styles.primaryBtn}>
				{node.validation.button ?? "Entendido, siguiente apacheta"}
				<ArrowRight size={16} />
			</button>
		)
	}
	return (
		<div className={styles.autoNote}>
			<span aria-hidden>◷</span>
			Se marca solo cuando lo hagas en la app.
		</div>
	)
}

interface Props {
	node: MapNode
	state: SheetState
	/** review = looking back at a completed step */
	mode: "current" | "review"
	onToggle: () => void
	onBack: () => void
}

export default function StepSheet({ node, state, mode, onToggle, onBack }: Props) {
	return (
		<>
			<div
				className={styles.backdrop}
				data-show={state === "open"}
				onClick={onToggle}
				aria-hidden="true"
			/>

			<aside
				className={styles.sheet}
				data-state={state}
				role="dialog"
				aria-modal={state === "open" ? "true" : undefined}
				aria-label={node.title}
			>
				<button type="button" className={styles.handle} onClick={onToggle} aria-label="Expandir o contraer">
					<span className={styles.grip} />
				</button>

				{mode === "review" && (
					<button type="button" className={styles.close} onClick={onBack} aria-label="Volver al paso actual">
						<X size={18} />
					</button>
				)}

				<div className={styles.body}>
					<div className={styles.meta}>
						<span className={styles.paso}>Paso {node.id}</span>
						<span className={cn(styles.chip, styles.chipType)}>{TYPE_LABEL[node.type]}</span>
						<span className={cn(styles.chip, mode === "review" ? styles.chipDone : styles.chipCurrent)}>
							{mode === "review" ? "✓ Completado" : "En curso"}
						</span>
					</div>

					<h2 className={styles.title}>{node.title}</h2>
					<p className={styles.lead}>{bold(node.description)}</p>

					<div className={styles.action}>
						{mode === "review" ? (
							<button type="button" className={styles.backBtn} onClick={onBack}>
								← Volver al paso actual
							</button>
						) : (
							<ValidationAction node={node} />
						)}
					</div>

					<div className={styles.divider} />

					<p className={styles.long}>{bold(node.longDescription)}</p>

					{node.appInstruction && (
						<div className={styles.appBox}>
							<p className={styles.appLabel}>En la app</p>
							{node.appInstruction.split(/\n\n+/).map((para, i) => (
								<p key={i} className={styles.appPara}>
									{bold(para)}
								</p>
							))}
						</div>
					)}

					{node.teachingConcepts.length > 0 && (
						<details className={styles.concepts}>
							<summary>Conceptos ({node.teachingConcepts.length})</summary>
							<ul>
								{node.teachingConcepts.map((c, i) => (
									<li key={i}>{bold(c)}</li>
								))}
							</ul>
						</details>
					)}
				</div>
			</aside>
		</>
	)
}

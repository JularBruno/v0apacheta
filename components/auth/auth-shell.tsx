import type { ReactNode } from "react"
import AuthHeader from "@/components/auth-header"
import ApachetaCairn from "@/components/apacheta-cairn"
import styles from "./auth-shell.module.css"

interface Props {
	title: string
	subtitle?: ReactNode
	/** image URL for the medallion; falls back to the cairn mark */
	illustrationSrc?: string
	children: ReactNode
}

/** Parchment shell for the auth pages: header, scattered scenery, one card
 *  with a tinted header band (medallion + title) over the form. */
export default function AuthShell({ title, subtitle, illustrationSrc, children }: Props) {
	return (
		<div className={styles.page}>
			<AuthHeader />

			<div className={styles.scene} aria-hidden="true">
				<img src="/scenery/trees/tree-3.webp" alt="" className={styles.spriteA} />
				<img src="/scenery/rocks/rock-6.webp" alt="" className={styles.spriteB} />
				<img src="/scenery/trees/tree-7.webp" alt="" className={styles.spriteC} />
				<img src="/scenery/rocks/rock-2.webp" alt="" className={styles.spriteD} />
			</div>

			<div className={styles.card}>
				<div className={styles.cardHeader}>
					<span className={styles.illoFrame}>
						{illustrationSrc ? (
							<img src={illustrationSrc} alt="" className={styles.illo} />
						) : (
							<ApachetaCairn className={styles.cairn} />
						)}
					</span>
					<h2 className={styles.title}>{title}</h2>
					{subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
				</div>

				<div className={styles.cardBody}>{children}</div>
			</div>
		</div>
	)
}

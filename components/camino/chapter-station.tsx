import { cn } from "@/lib/utils"
import ApachetaCairn from "@/components/apacheta-cairn"
import type { Chapter } from "@/lib/trail/chapters"
import styles from "./camino.module.css"

interface Props {
	chapter: Chapter
	index: number
	reached: boolean
	here: boolean
	inView: boolean
}

/** One stop on the trail: a cairn on the path with a floating text card beside it. */
export default function ChapterStation({ chapter, index, reached, here, inView }: Props) {
	return (
		<section
			data-station={index}
			className={cn(
				styles.station,
				styles[chapter.side],
				reached && styles.reached,
				here && styles.here,
			)}
		>
			<div data-cairn className={styles.cairn}>
				<span className={styles.halo} aria-hidden="true" />
				<ApachetaCairn />
				<span className={styles.badge}>{String(chapter.n).padStart(2, "0")}</span>
			</div>

			<article className={cn(styles.card, inView && styles.in)}>
				<p className="font-mono text-[11px] font-medium uppercase tracking-[0.13em] text-primary/90">
					{chapter.label}
				</p>
				<h2 className="mb-1.5 mt-1.5 text-[1.3rem] font-extrabold leading-[1.14] tracking-tight text-balance">
					{chapter.title}
				</h2>
				<p className="mb-1 text-[0.95rem] font-bold text-primary">{chapter.tagline}</p>
				<p className="text-[0.88rem] text-muted-foreground">{chapter.desc}</p>
			</article>
		</section>
	)
}

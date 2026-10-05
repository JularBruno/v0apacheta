import type { ReactNode } from "react"

/** An <h2> section with an anchor id, pairs with Toc. */
export default function Section({ id, heading, children }: { id: string; heading: string; children: ReactNode }) {
	return (
		<section id={id} aria-labelledby={`${id}-heading`} className="scroll-mt-20">
			<h2 id={`${id}-heading`} className="text-2xl font-bold tracking-tight text-foreground">
				{heading}
			</h2>
			<div className="mt-3 space-y-4">{children}</div>
		</section>
	)
}

import type { SeoSource } from "@/lib/content/types"

export interface KeyFigure {
	label: string
	value: string
	/** when the figure was measured, e.g. "agosto de 2026" */
	asOf: string
	source?: SeoSource
}

export default function KeyFigures({ figures }: { figures: KeyFigure[] }) {
	if (figures.length === 0) return null
	if (figures.length > 4) {
		throw new Error(`KeyFigures accepts at most 4 figures, got ${figures.length}`)
	}
	return (
		<dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
			{figures.map((figure) => (
				<div key={figure.label} className="rounded-xl border border-border bg-card p-4">
					<dt className="text-xs text-muted-foreground">{figure.label}</dt>
					<dd className="mt-1 text-2xl font-extrabold text-foreground">{figure.value}</dd>
					<dd className="mt-1 text-xs text-muted-foreground">
						Dato a {figure.asOf}
						{figure.source && (
							<>
								{" · "}
								<a href={figure.source.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
									{figure.source.name}
								</a>
							</>
						)}
					</dd>
				</div>
			))}
		</dl>
	)
}

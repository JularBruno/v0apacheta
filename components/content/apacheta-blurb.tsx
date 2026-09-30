import Link from "next/link"

const COPY = {
	post: "Este artículo está publicado en",
	tool: "Esta herramienta está publicada en",
	index: "Este sitio es parte de",
} as const

export type BlurbVariant = keyof typeof COPY

/** Fixed, short "hosted by Apacheta" line plus the slim donation link. Lives outside <h1>/<article>. */
export default function ApachetaBlurb({ variant }: { variant: BlurbVariant }) {
	return (
		<div className="border-b border-border bg-muted/40">
			<div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-1 px-5 py-2 text-xs text-muted-foreground sm:px-6">
				<p>
					{COPY[variant]}{" "}
					<Link href="/" className="font-semibold text-foreground underline-offset-2 hover:underline">
						Apacheta
					</Link>
					, la app de finanzas personales para Argentina.
				</p>
				<Link href="/donaciones" className="font-mono tracking-wide text-foreground/80 transition-colors hover:text-foreground">
					Apoyá Apacheta
				</Link>
			</div>
		</div>
	)
}

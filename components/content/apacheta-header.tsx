import Link from "next/link"
import DonationTrail from "@/components/donations/donation-trail"

const COPY = {
	post: "Este artículo está publicado en",
	tool: "Esta herramienta está publicada en",
	index: "Este sitio es parte de",
} as const

export type HeaderVariant = keyof typeof COPY

const PRIMARY_BUTTON =
	"inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-500"
const SECONDARY_BUTTON =
	"inline-flex items-center rounded-lg border border-border bg-background px-4 py-2 text-sm font-bold text-foreground transition-colors hover:bg-muted"

/**
 * Top of every Cuadernito/Herramientas page: the two-cairn map trail from the donations page, in its
 * compact `header` variant. Station one names Apacheta and offers "Comenzá tu camino"; station two
 * offers the donation. No headings here, so the page's <h1> stays the first heading. The page continues below.
 */
export default function ApachetaHeader({ variant }: { variant: HeaderVariant }) {
	return (
		<header className="mx-auto max-w-5xl px-5 pt-4 sm:px-6">
			<DonationTrail
				variant="header"
				stations={[
					{
						title: "Apacheta",
						body: (
							<p className="text-sm text-muted-foreground">
								{COPY[variant]}{" "}
								<Link href="/" className="font-semibold text-foreground underline-offset-2 hover:underline">
									Apacheta
								</Link>
								, la app de finanzas personales para Argentina.
							</p>
						),
						content: (
							<div className="mt-3">
								<Link href="/onboarding" className={PRIMARY_BUTTON}>
									Comenzá tu camino
								</Link>
							</div>
						),
					},
					{
						title: "¿Te sirve?",
						body: <p className="text-sm text-muted-foreground">Apacheta se mantiene con donaciones.</p>,
						content: (
							<div className="mt-3">
								<Link href="/donaciones" className={SECONDARY_BUTTON}>
									Doná a Apacheta
								</Link>
							</div>
						),
					},
				]}
			/>
		</header>
	)
}

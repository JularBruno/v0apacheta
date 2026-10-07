import { ExternalLink } from "lucide-react"
import { COMMUNITY_ICONS } from "@/components/content/community-icons"
import { communityLinks, type CommunityLink } from "@/lib/content/community"

const CARD = "flex h-full flex-col gap-2 rounded-xl border border-border bg-card p-5"

/**
 * "Comunidad" block for the Cuadernito index. A channel without a URL yet renders as a
 * "Próximamente" card (never a dead or made-up link).
 */
export default function CommunitySection({ links = communityLinks() }: { links?: CommunityLink[] }) {
	if (links.length === 0) return null
	return (
		<section id="comunidad" aria-labelledby="comunidad-heading" className="scroll-mt-6">
			<h2 id="comunidad-heading" className="text-2xl font-bold tracking-tight text-foreground">
				Comunidad
			</h2>
			<p className="mt-2 text-muted-foreground">Sumate y seguí el camino con más gente.</p>
			<ul className="mt-4 grid gap-4 sm:grid-cols-2">
				{links.map((link) => {
					const Icon = COMMUNITY_ICONS[link.platform]
					const heading = (
						<span className="flex items-center gap-2 font-bold text-foreground">
							<Icon className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
							{link.label}
							{link.href ? (
								<ExternalLink className="ml-auto h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
							) : (
								<span className="ml-auto shrink-0 rounded-full bg-muted px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
									Próximamente
								</span>
							)}
						</span>
					)
					return (
						<li key={link.platform}>
							{link.href ? (
								<a
									href={link.href}
									target="_blank"
									rel="noopener noreferrer"
									className={`${CARD} transition-colors hover:border-primary/40`}
								>
									{heading}
									<span className="text-sm text-muted-foreground">{link.description}</span>
								</a>
							) : (
								<div className={`${CARD} opacity-80`}>
									{heading}
									<span className="text-sm text-muted-foreground">{link.description}</span>
								</div>
							)}
						</li>
					)
				})}
			</ul>
		</section>
	)
}

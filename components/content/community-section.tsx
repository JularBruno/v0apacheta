import { ExternalLink, Instagram, MessageCircle, Youtube, type LucideIcon } from "lucide-react"
import { communityLinks, type CommunityLink, type CommunityPlatform } from "@/lib/content/community"

// lucide has no Discord glyph, so a chat bubble stands in for it.
const ICONS: Record<CommunityPlatform, LucideIcon> = {
	discord: MessageCircle,
	instagram: Instagram,
	youtube: Youtube,
}

const CARD = "flex h-full flex-col gap-2 rounded-xl border border-border bg-card p-5"

/**
 * "Comunidad" block for the Cuadernito index. A channel without a URL yet renders as a
 * "Próximamente" card (never a dead or made-up link).
 */
export default function CommunitySection({ links = communityLinks() }: { links?: CommunityLink[] }) {
	if (links.length === 0) return null
	return (
		<section aria-labelledby="comunidad-heading">
			<h2 id="comunidad-heading" className="text-2xl font-bold tracking-tight text-foreground">
				Comunidad
			</h2>
			<p className="mt-2 text-muted-foreground">Sumate y seguí el camino con más gente.</p>
			<ul className="mt-4 grid gap-4 sm:grid-cols-3">
				{links.map((link) => {
					const Icon = ICONS[link.platform]
					const heading = (
						<span className="flex items-center gap-2 font-bold text-foreground">
							<Icon className="h-5 w-5 text-primary" aria-hidden="true" />
							{link.label}
							{link.href ? (
								<ExternalLink className="ml-auto h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
							) : (
								<span className="ml-auto rounded-full bg-muted px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
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

import { ExternalLink, Instagram, MessageCircle, Youtube, type LucideIcon } from "lucide-react"
import { activeCommunityLinks, type ActiveCommunityLink, type CommunityPlatform } from "@/lib/content/community"

// lucide has no Discord glyph, so a chat bubble stands in for it.
const ICONS: Record<CommunityPlatform, LucideIcon> = {
	discord: MessageCircle,
	instagram: Instagram,
	youtube: Youtube,
}

/** "Comunidad" block for the Cuadernito index. Renders nothing until at least one channel has a URL. */
export default function CommunitySection({ links = activeCommunityLinks() }: { links?: ActiveCommunityLink[] }) {
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
					return (
						<li key={link.platform}>
							<a
								href={link.href}
								target="_blank"
								rel="noopener noreferrer"
								className="group flex h-full flex-col gap-2 rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40"
							>
								<span className="flex items-center gap-2 font-bold text-foreground">
									<Icon className="h-5 w-5 text-primary" aria-hidden="true" />
									{link.label}
									<ExternalLink className="ml-auto h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
								</span>
								<span className="text-sm text-muted-foreground">{link.description}</span>
							</a>
						</li>
					)
				})}
			</ul>
		</section>
	)
}

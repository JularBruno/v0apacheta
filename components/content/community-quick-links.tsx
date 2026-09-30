import { COMMUNITY_ICONS } from "@/components/content/community-icons"
import { communityLinks, type CommunityLink } from "@/lib/content/community"

const PILL = "inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground"

/**
 * Compact row of social pills for the header trail. Same config as the Comunidad section: a channel
 * with a url is an external link, one without shows as a disabled "pronto" pill (never a dead link).
 */
export default function CommunityQuickLinks({ links = communityLinks() }: { links?: CommunityLink[] }) {
	if (links.length === 0) return null
	return (
		<ul className="flex flex-wrap gap-2">
			{links.map((link) => {
				const Icon = COMMUNITY_ICONS[link.platform]
				return (
					<li key={link.platform}>
						{link.href ? (
							<a
								href={link.href}
								target="_blank"
								rel="noopener noreferrer"
								className={`${PILL} transition-colors hover:bg-muted`}
							>
								<Icon className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
								{link.label}
							</a>
						) : (
							<span className={`${PILL} opacity-60`} title="Próximamente">
								<Icon className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
								{link.label}
								<span aria-hidden="true" className="font-mono text-[9px] font-medium uppercase tracking-wide text-muted-foreground">
									pronto
								</span>
								<span className="sr-only"> (próximamente)</span>
							</span>
						)}
					</li>
				)
			})}
		</ul>
	)
}

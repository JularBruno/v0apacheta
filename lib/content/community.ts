export type CommunityPlatform = "discord" | "instagram" | "youtube"

export interface CommunityLink {
	platform: CommunityPlatform
	label: string
	description: string
	/** Public https URL. Leave undefined until the channel exists: entries without one are hidden. */
	href?: string
}

/**
 * Social channels shown in the "Comunidad" section of the Cuadernito index.
 * To publish a channel, set its `href` (https only).
 */
export const COMMUNITY_LINKS: CommunityLink[] = [
	{ platform: "discord", label: "Discord", description: "Sumate al canal de la comunidad." },
	{ platform: "instagram", label: "Instagram", description: "Seguinos en Instagram." },
	{ platform: "youtube", label: "YouTube", description: "Mirá los videos en YouTube." },
]

export type ActiveCommunityLink = CommunityLink & { href: string }

/** Links that have an href. A non-https href throws, so a typo fails the build instead of shipping. */
export function activeCommunityLinks(links: CommunityLink[] = COMMUNITY_LINKS): ActiveCommunityLink[] {
	return links.flatMap((link) => {
		if (!link.href) return []
		if (!link.href.startsWith("https://")) {
			throw new Error(`Community link for ${link.platform} must be an https URL, got "${link.href}"`)
		}
		return [{ ...link, href: link.href }]
	})
}

export type CommunityPlatform = "discord" | "youtube" | "linkedin" | "twitter"

export interface CommunityLink {
	platform: CommunityPlatform
	label: string
	description: string
	/** Public https URL. Leave undefined until the channel exists: the card shows as "Próximamente". */
	href?: string
}

/**
 * Social channels shown in the "Comunidad" section of the Cuadernito index.
 * To publish a channel, set its `href` (https only).
 */
export const COMMUNITY_LINKS: CommunityLink[] = [
	{ platform: "discord", label: "Discord", description: "Sumate al canal de la comunidad." },
	{ platform: "youtube", label: "YouTube", description: "Mirá los videos en YouTube." },
	{
		platform: "linkedin",
		label: "LinkedIn",
		description: "Seguí a Bruno en LinkedIn.",
		href: "https://www.linkedin.com/in/brunojular",
	},
	{ platform: "twitter", label: "X (Twitter)", description: "Seguí a Bruno en X.", href: "https://x.com/jular_bruno" },
]

/** All channels, validated. A non-https href throws, so a typo fails the build instead of shipping. */
export function communityLinks(links: CommunityLink[] = COMMUNITY_LINKS): CommunityLink[] {
	for (const link of links) {
		if (link.href !== undefined && !link.href.startsWith("https://")) {
			throw new Error(`Community link for ${link.platform} must be an https URL, got "${link.href}"`)
		}
	}
	return links
}

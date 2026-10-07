import { COMMUNITY_LINKS, communityLinks, type CommunityLink } from "../community"

const link = (overrides: Partial<CommunityLink> = {}): CommunityLink => ({
	platform: "discord",
	label: "Discord",
	description: "Sumate.",
	...overrides,
})

describe("communityLinks", () => {
	test("keeps every channel, and only the configured ones carry an href (nothing fake ships)", () => {
		const result = communityLinks([link(), link({ platform: "youtube", label: "YouTube", href: "https://youtube.com/@x" })])
		expect(result).toHaveLength(2)
		expect(result[0].href).toBeUndefined()
		expect(result[1].href).toBe("https://youtube.com/@x")
	})

	test("throws on a non-https href, naming the platform", () => {
		expect(() => communityLinks([link({ href: "http://discord.gg/x" })])).toThrow(/discord.*https/i)
		expect(() => communityLinks([link({ href: "javascript:alert(1)" })])).toThrow(/discord.*https/i)
	})

	test("the shipped config covers discord, youtube, linkedin and twitter, in that order, with no instagram", () => {
		expect(COMMUNITY_LINKS.map((l) => l.platform)).toEqual(["discord", "youtube", "linkedin", "twitter"])
	})

	test("Bruno's LinkedIn and Twitter profiles are linked, the channels that don't exist yet are not", () => {
		const byPlatform = Object.fromEntries(COMMUNITY_LINKS.map((l) => [l.platform, l.href]))
		expect(byPlatform.linkedin).toBe("https://www.linkedin.com/in/brunojular")
		expect(byPlatform.twitter).toBe("https://x.com/jular_bruno")
		expect(byPlatform.discord).toBeUndefined()
		expect(byPlatform.youtube).toBeUndefined()
	})

	test("the shipped config only contains https hrefs", () => {
		expect(() => communityLinks(COMMUNITY_LINKS)).not.toThrow()
	})
})

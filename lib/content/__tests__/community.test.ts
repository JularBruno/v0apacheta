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

	test("the shipped config covers discord, instagram and youtube, in that order", () => {
		expect(COMMUNITY_LINKS.map((l) => l.platform)).toEqual(["discord", "instagram", "youtube"])
	})

	test("the shipped config only contains https hrefs", () => {
		expect(() => communityLinks(COMMUNITY_LINKS)).not.toThrow()
	})
})

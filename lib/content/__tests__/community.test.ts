import { COMMUNITY_LINKS, activeCommunityLinks, type CommunityLink } from "../community"

const link = (overrides: Partial<CommunityLink> = {}): CommunityLink => ({
	platform: "discord",
	label: "Discord",
	description: "Sumate.",
	...overrides,
})

describe("activeCommunityLinks", () => {
	test("hides entries that have no href yet, so nothing fake ships", () => {
		expect(activeCommunityLinks([link(), link({ platform: "youtube", label: "YouTube", href: "https://youtube.com/@x" })])).toEqual([
			expect.objectContaining({ platform: "youtube", href: "https://youtube.com/@x" }),
		])
	})

	test("throws on a non-https href, naming the platform", () => {
		expect(() => activeCommunityLinks([link({ href: "http://discord.gg/x" })])).toThrow(/discord.*https/i)
		expect(() => activeCommunityLinks([link({ href: "javascript:alert(1)" })])).toThrow(/discord.*https/i)
	})

	test("the shipped config covers discord, instagram and youtube, in that order", () => {
		expect(COMMUNITY_LINKS.map((l) => l.platform)).toEqual(["discord", "instagram", "youtube"])
	})

	test("the shipped config only contains https hrefs", () => {
		expect(() => activeCommunityLinks(COMMUNITY_LINKS)).not.toThrow()
	})
})

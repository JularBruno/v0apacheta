import { render, screen, within } from "@testing-library/react"
import CommunitySection from "@/components/content/community-section"

const links = [
	{ platform: "discord", label: "Discord", description: "Sumate al canal.", href: "https://discord.gg/abc" },
	{ platform: "instagram", label: "Instagram", description: "Seguinos.", href: "https://instagram.com/apacheta" },
	{ platform: "youtube", label: "YouTube", description: "Mirá los videos.", href: "https://youtube.com/@apacheta" },
] as const

describe("CommunitySection", () => {
	test("renders a Comunidad heading and one external link per platform", () => {
		render(<CommunitySection links={[...links]} />)
		const section = screen.getByRole("region", { name: "Comunidad" })
		for (const l of links) {
			const anchor = within(section).getByRole("link", { name: new RegExp(l.label) })
			expect(anchor).toHaveAttribute("href", l.href)
			expect(anchor).toHaveAttribute("target", "_blank")
			expect(anchor.getAttribute("rel")).toContain("noopener")
			expect(anchor.getAttribute("rel")).toContain("noreferrer")
		}
	})

	test("renders nothing when there are no links", () => {
		const { container } = render(<CommunitySection links={[]} />)
		expect(container).toBeEmptyDOMElement()
	})

	test("renders nothing by default while no community urls are configured", () => {
		const { container } = render(<CommunitySection />)
		expect(container).toBeEmptyDOMElement()
	})
})

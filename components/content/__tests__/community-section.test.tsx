import { render, screen, within } from "@testing-library/react"
import CommunitySection from "@/components/content/community-section"

const links = [
	{ platform: "discord", label: "Discord", description: "Sumate al canal.", href: "https://discord.gg/abc" },
	{ platform: "instagram", label: "Instagram", description: "Seguinos.", href: "https://instagram.com/apacheta" },
	{ platform: "youtube", label: "YouTube", description: "Mirá los videos.", href: "https://youtube.com/@apacheta" },
] as const

describe("CommunitySection", () => {
	test("renders a Comunidad heading and one external link per configured platform", () => {
		render(<CommunitySection links={[...links]} />)
		const section = screen.getByRole("region", { name: "Comunidad" })
		for (const l of links) {
			const anchor = within(section).getByRole("link", { name: new RegExp(l.label) })
			expect(anchor).toHaveAttribute("href", l.href)
			expect(anchor).toHaveAttribute("target", "_blank")
			expect(anchor.getAttribute("rel")).toContain("noopener")
			expect(anchor.getAttribute("rel")).toContain("noreferrer")
		}
		expect(within(section).queryByText("Próximamente")).not.toBeInTheDocument()
	})

	test("a channel without a url yet shows as a Próximamente card, not a link", () => {
		render(
			<CommunitySection
				links={[
					{ platform: "discord", label: "Discord", description: "Sumate al canal." },
					{ platform: "youtube", label: "YouTube", description: "Mirá los videos.", href: "https://youtube.com/@apacheta" },
				]}
			/>,
		)
		const section = screen.getByRole("region", { name: "Comunidad" })
		expect(within(section).queryByRole("link", { name: /Discord/ })).not.toBeInTheDocument()
		expect(within(section).getByText("Discord")).toBeInTheDocument()
		expect(within(section).getByText("Próximamente")).toBeInTheDocument()
		expect(within(section).getByRole("link", { name: /YouTube/ })).toHaveAttribute("href", "https://youtube.com/@apacheta")
	})

	test("renders nothing when there are no channels at all", () => {
		const { container } = render(<CommunitySection links={[]} />)
		expect(container).toBeEmptyDOMElement()
	})

	test("by default it shows the three shipped channels", () => {
		render(<CommunitySection />)
		const section = screen.getByRole("region", { name: "Comunidad" })
		for (const label of ["Discord", "Instagram", "YouTube"]) {
			expect(within(section).getByText(label)).toBeInTheDocument()
		}
	})
})

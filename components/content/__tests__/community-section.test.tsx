import { render, screen, within } from "@testing-library/react"
import CommunitySection from "@/components/content/community-section"

const links = [
	{ platform: "discord", label: "Discord", description: "Sumate al canal.", href: "https://discord.gg/abc" },
	{ platform: "youtube", label: "YouTube", description: "Mirá los videos.", href: "https://youtube.com/@apacheta" },
	{ platform: "linkedin", label: "LinkedIn", description: "Seguí a Bruno.", href: "https://www.linkedin.com/in/brunojular" },
	{ platform: "twitter", label: "X (Twitter)", description: "Seguí a Bruno.", href: "https://x.com/jular_bruno" },
] as const

describe("CommunitySection", () => {
	test("renders a Comunidad heading and one external link per configured platform", () => {
		render(<CommunitySection links={[...links]} />)
		const section = screen.getByRole("region", { name: "Comunidad" })
		for (const l of links) {
			const anchor = within(section).getByRole("link", { name: new RegExp(l.label.replace(/[()]/g, "\\$&")) })
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

	test("by default it shows the four shipped channels, linking LinkedIn and Twitter, and no Instagram", () => {
		render(<CommunitySection />)
		const section = screen.getByRole("region", { name: "Comunidad" })
		for (const label of ["Discord", "YouTube", "LinkedIn", "X (Twitter)"]) {
			expect(within(section).getByText(label)).toBeInTheDocument()
		}
		expect(within(section).queryByText("Instagram")).toBeNull()
		expect(within(section).getByRole("link", { name: /LinkedIn/ })).toHaveAttribute("href", "https://www.linkedin.com/in/brunojular")
		expect(within(section).getByRole("link", { name: /Twitter/ })).toHaveAttribute("href", "https://x.com/jular_bruno")
	})

	test("cards stay readable: at most two columns, and the icon and the Próximamente badge never shrink", () => {
		const { container } = render(<CommunitySection />)
		const grid = container.querySelector("ul") as HTMLElement
		expect(grid.className).toMatch(/sm:grid-cols-2/)
		expect(grid.className).not.toMatch(/grid-cols-[3-9]/)
		for (const icon of Array.from(container.querySelectorAll("li svg[aria-hidden]"))) {
			expect(icon.getAttribute("class")).toMatch(/shrink-0/)
		}
		const badge = screen.getAllByText("Próximamente")[0]
		expect(badge.className).toMatch(/shrink-0/)
	})
})

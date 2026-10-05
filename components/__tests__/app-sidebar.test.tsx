import { render, screen, within } from "@testing-library/react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"

jest.mock("next/navigation", () => ({ usePathname: () => "/dashboard/inicio" }))
jest.mock("@/lib/hooks/use-logout", () => ({ useLogout: () => jest.fn() }))

beforeAll(() => {
	// jsdom has no matchMedia; SidebarProvider's useIsMobile needs it.
	Object.defineProperty(window, "matchMedia", {
		writable: true,
		value: () => ({ matches: false, addEventListener: jest.fn(), removeEventListener: jest.fn() }),
	})
})

function renderSidebar() {
	render(
		<SidebarProvider>
			<AppSidebar />
		</SidebarProvider>,
	)
}

test("the Herramientas group links to the public Cuadernito", () => {
	renderSidebar()
	const link = screen.getByRole("link", { name: /^Cuadernito/ })
	expect(link).toHaveAttribute("href", "/blog")
	const group = screen.getByText("Herramientas").closest('[data-sidebar="group"]') as HTMLElement
	expect(group).not.toBeNull()
	expect(within(group).getByRole("link", { name: /^Cuadernito/ })).toBe(link)
})

test("the Cuadernito link shows a redirect icon and tells screen readers it leaves the dashboard", () => {
	renderSidebar()
	const link = screen.getByRole("link", { name: /^Cuadernito/ })
	expect(link.querySelector("svg.lucide-external-link")).not.toBeNull()
	expect(within(link).getByText("(sale del panel)")).toHaveClass("sr-only")
})

test("regular dashboard items do not get the redirect icon", () => {
	renderSidebar()
	const link = screen.getByRole("link", { name: "Dividir Cuenta" })
	expect(link.querySelector("svg.lucide-external-link")).toBeNull()
})

import { render, screen } from "@testing-library/react"
import CaminoNav from "../nav"

test("the drawer links to Cuadernito, and the link is in the DOM even while the drawer is closed", () => {
	render(<CaminoNav />)
	expect(screen.getByRole("link", { name: "Cuadernito" })).toHaveAttribute("href", "/blog")
})

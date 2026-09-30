import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import PublicDonations, { BINANCE_ALIAS } from "@/components/donations/public-donations"
import DonacionesPage, { metadata } from "@/app/donaciones/page"

describe("PublicDonations", () => {
	test("has an h1, a link back to Apacheta and the cafecito button", () => {
		render(<PublicDonations />)
		expect(screen.getByRole("heading", { level: 1, name: "Apoyá el desarrollo de Apacheta" })).toBeInTheDocument()
		expect(screen.getByRole("link", { name: /Volver a Apacheta/ })).toHaveAttribute("href", "/")
		expect(screen.getByRole("link", { name: /Invitame un café/ })).toHaveAttribute("href", "https://cafecito.app/apacheta")
	})

	test("shows the Binance alias and copies it to the clipboard", async () => {
		const user = userEvent.setup()
		render(<PublicDonations />)
		expect(screen.getByText(new RegExp(BINANCE_ALIAS))).toBeInTheDocument()
		await user.click(screen.getByRole("button", { name: "Copiar alias" }))
		expect(await navigator.clipboard.readText()).toBe(BINANCE_ALIAS)
	})
})

describe("/donaciones route", () => {
	test("renders the public donations view with no auth dependency", () => {
		render(<DonacionesPage />)
		expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument()
	})

	test("has indexable metadata with a canonical url", () => {
		expect(metadata.title).toBe("Donaciones | Apacheta")
		expect(metadata.alternates?.canonical).toBe("https://apacheta.ar/donaciones")
		expect(String(metadata.description).length).toBeLessThanOrEqual(155)
	})

	test("shares with its own twitter text and the site share image, not the homepage's", () => {
		expect(metadata.twitter).toMatchObject({ title: "Donaciones | Apacheta", images: ["/opengraph-image"] })
		expect(metadata.openGraph).toMatchObject({ title: "Donaciones | Apacheta", images: ["/opengraph-image"] })
	})
})

import type { Metadata } from "next"
import PublicDonations from "@/components/donations/public-donations"
import { buildPageMetadata } from "@/lib/content/seo"

// No title template on this route (only /blog and /herramientas have one), so the title is literal.
export const metadata: Metadata = buildPageMetadata({
	title: "Donaciones | Apacheta",
	socialTitle: "Donaciones | Apacheta",
	description: "Apoyá el desarrollo de Apacheta con una donación en pesos (Cafecito) o en cripto (Binance Pay).",
	path: "/donaciones",
})

export default function DonacionesPage() {
	return <PublicDonations />
}

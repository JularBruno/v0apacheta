import type { Metadata } from "next"
import PublicDonations from "@/components/donations/public-donations"

export const metadata: Metadata = {
	title: "Donaciones | Apacheta",
	description: "Apoyá el desarrollo de Apacheta con una donación en pesos (Cafecito) o en cripto (Binance Pay).",
	alternates: { canonical: "https://apacheta.ar/donaciones" },
	openGraph: {
		type: "website",
		url: "https://apacheta.ar/donaciones",
		title: "Donaciones | Apacheta",
		locale: "es_AR",
		siteName: "Apacheta",
	},
}

export default function DonacionesPage() {
	return <PublicDonations />
}

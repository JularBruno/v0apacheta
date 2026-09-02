import type { Metadata } from "next"
import CaminoLanding from "@/components/camino/camino-landing"

export const metadata: Metadata = {
	title: "Apacheta — Tu guía financiera personal",
	description:
		"Seguí el camino para salir de deudas, ahorrar más y construir patrimonio. Educación financiera hecha para Argentina.",
}

export default function HomePage() {
	return <CaminoLanding />
}

import type { Metadata } from "next"
import CaminoLanding from "@/components/camino/camino-landing"

export const metadata: Metadata = {
	title: "Apacheta — El camino",
	description:
		"Seguí el mapa para salir de deudas, ahorrar más y construir patrimonio. Educación financiera hecha para Argentina.",
}

export default function CaminoPage() {
	return <CaminoLanding />
}

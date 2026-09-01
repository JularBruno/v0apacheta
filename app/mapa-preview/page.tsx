import type { Metadata } from "next"
import MapPreview from "@/components/map-preview/map-preview"

export const metadata: Metadata = {
	title: "Mapa — vista previa",
	robots: { index: false },
}

/** Throwaway visual mockup of the new dashboard map. Not wired to anything. */
export default function MapaPreviewPage() {
	return <MapPreview />
}

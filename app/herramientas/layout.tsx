import type { Metadata } from "next"

export const metadata: Metadata = {
	title: { default: "Herramientas | Apacheta", template: "%s | Apacheta" },
}

export default function HerramientasLayout({ children }: { children: React.ReactNode }) {
	return <>{children}</>
}

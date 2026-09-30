import type { Metadata } from "next"

export const metadata: Metadata = {
	title: { default: "Cuadernito | Apacheta", template: "%s | Apacheta" },
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
	return <>{children}</>
}

import Link from "next/link"
import { cn } from "@/lib/utils"

export default function DonationCard({ className }: { className?: string }) {
	return (
		<div className={cn("rounded-2xl border border-primary/30 bg-primary/10 p-5", className)}>
			<p className="font-bold text-foreground">¿Te sirvió este contenido?</p>
			<p className="mt-1 text-sm text-muted-foreground">
				Apacheta se mantiene con donaciones. Tu aporte cubre el hosting y el tiempo para seguir sumando funciones y contenido.
			</p>
			<Link
				href="/donaciones"
				className="mt-3 inline-flex items-center rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
			>
				Doná a Apacheta
			</Link>
		</div>
	)
}

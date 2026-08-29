import Link from "next/link"
import CairnIcon from "@/components/trail-map/cairn-icon"

export default function CaminoFooter() {
	return (
		<footer className="border-t border-border py-8">
			<div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 sm:flex-row sm:px-6">
				<div className="flex items-center gap-2">
					<span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary p-1">
						<CairnIcon size={14} color="hsl(var(--primary-foreground))" />
					</span>
					<span className="text-sm font-semibold text-foreground">Apacheta</span>
				</div>
				<p className="text-xs text-muted-foreground">Hecho en Córdoba, Argentina.</p>
				<div className="flex gap-5">
					<Link href="/login" className="text-xs text-muted-foreground transition-colors hover:text-foreground">
						Ingresar
					</Link>
					<Link href="/onboarding" className="text-xs text-muted-foreground transition-colors hover:text-foreground">
						Registrarse
					</Link>
				</div>
			</div>
		</footer>
	)
}

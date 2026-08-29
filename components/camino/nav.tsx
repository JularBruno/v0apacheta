import Link from "next/link"
import CairnIcon from "@/components/trail-map/cairn-icon"

export default function CaminoNav() {
	return (
		<header className="fixed inset-x-0 top-0 z-50 flex h-14 items-center border-b border-border bg-background/90 backdrop-blur-sm">
			<div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 sm:px-6">
				<Link href="/camino" className="flex items-center gap-2.5">
					<span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary p-1.5">
						<CairnIcon size={16} color="hsl(var(--primary-foreground))" />
					</span>
					<span className="text-sm font-bold tracking-tight text-foreground">Apacheta</span>
				</Link>

				<div className="flex items-center gap-4 sm:gap-5">
					<Link
						href="/login"
						className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground sm:block"
					>
						Ingresar
					</Link>
					<Link
						href="/onboarding"
						className="inline-flex items-center rounded-lg bg-foreground px-4 py-2 text-sm font-semibold text-background transition-opacity hover:opacity-90"
					>
						Comienza tu Camino
					</Link>
				</div>
			</div>
		</header>
	)
}

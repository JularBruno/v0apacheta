import Link from "next/link"
import ApachetaCairn from "@/components/apacheta-cairn"

export default function CaminoNav() {
	return (
		<header className="sticky top-0 z-50 flex h-14 items-center border-b border-border bg-background/85 backdrop-blur-sm">
			<div className="mx-auto flex w-full max-w-2xl items-center justify-between px-5 sm:px-6">
				<Link href="/camino" className="flex items-center gap-2.5">
					<ApachetaCairn className="h-6 w-6 text-primary" />
					<span className="text-sm font-extrabold tracking-tight text-foreground">Apacheta</span>
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
						className="inline-flex items-center rounded-lg bg-foreground px-4 py-2 text-sm font-bold text-background transition-opacity hover:opacity-90"
					>
						Comenzá tu camino
					</Link>
				</div>
			</div>
		</header>
	)
}

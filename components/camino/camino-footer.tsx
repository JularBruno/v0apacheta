import Link from "next/link"
import ApachetaCairn from "@/components/apacheta-cairn"

export default function CaminoFooter() {
	return (
		<footer className="mx-auto mt-9 flex max-w-2xl flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-border px-5 pb-10 pt-6 font-mono text-xs tracking-wide text-muted-foreground sm:px-6">
			<span className="flex items-center gap-2">
				<ApachetaCairn className="h-4 w-4 text-primary" />
				Apacheta
			</span>
			<span>Hecho en Córdoba, Argentina</span>
			<span className="flex gap-4">
				<Link href="/login" className="transition-colors hover:text-foreground">
					Ingresar
				</Link>
				<Link href="/onboarding" className="transition-colors hover:text-foreground">
					Registrarse
				</Link>
			</span>
		</footer>
	)
}

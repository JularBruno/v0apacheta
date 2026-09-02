import Link from "next/link"
import ApachetaCairn from "@/components/apacheta-cairn"

export default function AuthHeader() {
	return (
		<header className="absolute left-0 right-0 top-0 z-50 p-4 sm:p-6">
			<Link
				href="/"
				className="inline-flex items-center gap-2.5 transition-opacity hover:opacity-80"
			>
				<ApachetaCairn className="h-8 w-8 text-primary" />
				<span className="text-xl font-bold text-foreground">Apacheta</span>
			</Link>
		</header>
	)
}

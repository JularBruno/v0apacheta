import Link from "next/link"

export default function AuthHeader() {
	return (
		<header className="absolute top-0 left-0 right-0 z-50 p-4 sm:p-6">
			<Link href="/" className="inline-flex items-center space-x-3 hover:opacity-80 transition-opacity">
				<div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center p-1.5">
					<img src="/logo.svg" alt="Apacheta" className="w-full h-full object-contain" />
				</div>
				<span className="text-xl font-bold text-foreground">Apacheta</span>
			</Link>
		</header>
	)
}
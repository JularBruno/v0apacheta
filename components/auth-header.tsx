import Link from "next/link"

export default function AuthHeader() {
	return (
		<header className="absolute top-0 left-0 right-0 z-50 p-4 sm:p-6">
			<Link href="/" className="inline-flex items-center space-x-3 hover:opacity-80 transition-opacity">
				<div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
					<div className="text-white font-bold text-lg">A</div>
				</div>
				<span className="text-xl font-bold text-gray-900">Apacheta</span>
			</Link>
		</header>
	)
}
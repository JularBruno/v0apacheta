"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, RotateCw } from "lucide-react"

export default function DashboardError({
	error,
	reset,
}: {
	error: Error & { digest?: string }
	reset: () => void
}) {
	useEffect(() => {
		console.error(error)
	}, [error])

	return (
		<div className="flex items-center justify-center min-h-screen">
			<div className="text-center">
				<h1 className="text-6xl font-bold text-slate-900 dark:text-white mb-2">500</h1>
				<h2 className="text-2xl font-bold text-slate-700 dark:text-slate-200 mb-4">Algo salió mal</h2>
				<p className="text-slate-600 dark:text-slate-400 mb-8 max-w-sm">
					Ocurrió un error inesperado. Podés intentar de nuevo o volver al mapa.
				</p>
				<div className="flex gap-3 justify-center">
					<Button variant="outline" onClick={reset}>
						<RotateCw className="w-4 h-4 mr-2" />
						Reintentar
					</Button>
					<Button asChild>
						<Link href="/dashboard/mapa">
							<ArrowLeft className="w-4 h-4 mr-2" />
							Volver al mapa
						</Link>
					</Button>
				</div>
			</div>
		</div>
	)
}

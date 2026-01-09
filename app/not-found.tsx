"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { getProfile } from "@/lib/actions/user";
import { useEffect, useState } from "react";

export default function NotFound() {
	// could use another thing instead of get session here
	// THis approach is to redirect based on user state of login to different pages
	const [isLoggedIn, setIsLoggedIn] = useState(false);

	useEffect(() => {
		getProfile().then(profile => setIsLoggedIn(!!profile));
	}, []);

	return (
		<div className="flex items-center justify-center min-h-screen">
			<div className="text-center">
				<h1 className="text-6xl font-bold text-slate-900 dark:text-white mb-2">404</h1>
				<h2 className="text-2xl font-bold text-slate-700 dark:text-slate-200 mb-4">Sección no encontrada</h2>
				<p className="text-slate-600 dark:text-slate-400 mb-8 max-w-sm">
					La sección que buscas no existe.
				</p>
				<div className="flex gap-3 justify-center">
					<Button asChild>
						{isLoggedIn ?
							<Link href="/dashboard/mapa">
								<ArrowLeft className="w-4 h-4 mr-2" />
								Volver al mapa
							</Link> :
							<Link href="/">
								<ArrowLeft className="w-4 h-4 mr-2" />
								Volver al inicio
							</Link>}
					</Button>
				</div>
			</div>
		</div>
	)
}

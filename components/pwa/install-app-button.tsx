"use client"

import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useInstallApp } from "@/lib/hooks/use-install-app"

/**
 * "Instalar la app" where the browser lets a page install itself (Chrome,
 * Edge, Samsung Internet), a short hint where it doesn't (iOS, Firefox), and
 * a confirmation once Apacheta is installed. Never a button that does nothing.
 */
export function InstallAppButton() {
	const { status, install } = useInstallApp()

	switch (status) {
		case "can-install":
			return (
				<Button type="button" className="w-full gap-2" onClick={() => void install()}>
					<Download className="h-4 w-4" />
					Instalar la app
				</Button>
			)
		case "installed":
			return <p className="text-sm font-medium text-emerald-700">Ya tenés la app instalada ✓</p>
		case "ios-safari":
			return (
				<p className="text-sm leading-relaxed text-foreground/80">
					Tocá <strong>Compartir ↑</strong> y después <strong>&quot;Agregar a inicio&quot;</strong>.
				</p>
			)
		case "ios-other-browser":
			return (
				<p className="text-sm leading-relaxed text-foreground/80">
					Abrí Apacheta en <strong>Safari</strong>, tocá <strong>Compartir ↑</strong> y después{" "}
					<strong>&quot;Agregar a inicio&quot;</strong>.
				</p>
			)
		default:
			return (
				<p className="text-sm leading-relaxed text-foreground/80">
					Para instalarla, abrí el menú del navegador y elegí <strong>&quot;Instalar app&quot;</strong> o{" "}
					<strong>&quot;Agregar a pantalla de inicio&quot;</strong>.
				</p>
			)
	}
}

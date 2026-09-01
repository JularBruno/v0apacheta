"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import ApachetaCairn from "@/components/apacheta-cairn"

const CTA = "Comenzá tu camino"

function Brand() {
	return (
		<span className="flex items-center gap-2">
			<ApachetaCairn className="h-6 w-6 text-primary" />
			<span className="text-sm font-extrabold tracking-tight text-foreground">Apacheta</span>
		</span>
	)
}

export default function CaminoNav() {
	const [open, setOpen] = useState(false)

	useEffect(() => {
		if (!open) return
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") setOpen(false)
		}
		window.addEventListener("keydown", onKey)
		return () => window.removeEventListener("keydown", onKey)
	}, [open])

	return (
		<>
			<header className="sticky top-0 z-50 flex h-14 items-center border-b border-[color:var(--map-parchment-edge)] bg-[color:var(--map-parchment-light)]/80 backdrop-blur-sm">
				<div className="mx-auto flex w-full max-w-2xl items-center justify-between px-4 sm:px-6">
					<div className="flex items-center gap-2">
						<button
							type="button"
							onClick={() => setOpen(true)}
							aria-label="Abrir menú"
							aria-expanded={open}
							className="-ml-1.5 rounded-md p-1.5 text-foreground/75 transition-colors hover:bg-black/5 hover:text-foreground"
						>
							<Menu className="h-5 w-5" />
						</button>
						<Link href="/camino">
							<Brand />
						</Link>
					</div>

					<Link
						href="/onboarding"
						className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-500"
					>
						{CTA}
					</Link>
				</div>
			</header>

			{/* side drawer — the place for future navigation (blog, etc.) */}
			<div
				className={`fixed inset-0 z-[60] transition-opacity duration-200 ${
					open ? "opacity-100" : "pointer-events-none opacity-0"
				}`}
			>
				<button
					type="button"
					aria-label="Cerrar menú"
					tabIndex={open ? 0 : -1}
					onClick={() => setOpen(false)}
					className="absolute inset-0 bg-foreground/40 backdrop-blur-[2px]"
				/>
				<nav
					aria-label="Navegación"
					className={`absolute inset-y-0 left-0 flex w-72 max-w-[82vw] flex-col bg-[color:var(--map-parchment-light)] shadow-2xl transition-transform duration-300 ease-out ${
						open ? "translate-x-0" : "-translate-x-full"
					}`}
				>
					<div className="flex h-14 items-center justify-between border-b border-[color:var(--map-parchment-edge)] px-4">
						<Brand />
						<button
							type="button"
							onClick={() => setOpen(false)}
							aria-label="Cerrar"
							className="rounded-md p-1.5 text-foreground/70 transition-colors hover:bg-black/5 hover:text-foreground"
						>
							<X className="h-5 w-5" />
						</button>
					</div>

					<div className="flex flex-1 flex-col gap-0.5 p-3">
						<Link
							href="/login"
							onClick={() => setOpen(false)}
							className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/80 transition-colors hover:bg-black/5 hover:text-foreground"
						>
							Ingresar
						</Link>
						<Link
							href="/onboarding"
							onClick={() => setOpen(false)}
							className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/80 transition-colors hover:bg-black/5 hover:text-foreground"
						>
							Registrarse
						</Link>
					</div>

					<div className="border-t border-[color:var(--map-parchment-edge)] p-3">
						<Link
							href="/onboarding"
							onClick={() => setOpen(false)}
							className="flex w-full items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-500"
						>
							{CTA}
						</Link>
					</div>
				</nav>
			</div>
		</>
	)
}

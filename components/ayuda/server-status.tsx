"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

type Status = "checking" | "online" | "offline"

const LABELS: Record<Status, string> = {
	checking: "Servidor: comprobando…",
	online: "Servidor: en línea",
	offline: "Servidor: sin conexión",
}

// Longer than the route's own 3s backend timeout, so that one answers first.
const TIMEOUT_MS = 5000

export function ServerStatus() {
	const [status, setStatus] = useState<Status>("checking")

	useEffect(() => {
		const controller = new AbortController()
		const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
		let active = true

		fetch("/api/health", { cache: "no-store", signal: controller.signal })
			.then((response) => (response.ok ? response.json() : { online: false }))
			.then((body) => active && setStatus(body?.online === true ? "online" : "offline"))
			.catch(() => active && setStatus("offline"))
			.finally(() => clearTimeout(timer))

		return () => {
			active = false
			clearTimeout(timer)
			controller.abort()
		}
	}, [])

	return (
		<p className="flex items-center justify-center gap-2 text-xs text-muted-foreground" role="status">
			<span
				aria-hidden
				className={cn(
					"inline-block h-2 w-2 rounded-full",
					status === "online" && "bg-emerald-500",
					status === "offline" && "bg-destructive",
					status === "checking" && "bg-muted-foreground/40",
				)}
			/>
			{LABELS[status]}
		</p>
	)
}

"use client"

import { useState } from "react"
import { Check, Mail } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * "Email" button that copies the address instead of opening a mail client
 * (mailto: does nothing useful for visitors without a configured mail app).
 * If the clipboard API is blocked, falls back to showing the address itself
 * so it can be copied by hand.
 */
export default function CopyEmailButton({
	email,
	variant = "pill",
}: {
	email: string
	variant?: "pill" | "text"
}) {
	const [state, setState] = useState<"idle" | "copied" | "failed">("idle")

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(email)
			setState("copied")
			setTimeout(() => setState("idle"), 1800)
		} catch {
			setState("failed")
		}
	}

	const label = state === "copied" ? "Copied" : state === "failed" ? email : "Email"

	if (variant === "text") {
		return (
			<button
				type="button"
				onClick={handleCopy}
				title={`Copy ${email}`}
				className="transition-colors hover:text-foreground"
			>
				{label}
			</button>
		)
	}

	return (
		<button
			type="button"
			onClick={handleCopy}
			title={`Copy ${email}`}
			className={cn(
				"inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
				state === "copied"
					? "border-primary text-foreground"
					: "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground",
			)}
		>
			{state === "copied" ? <Check className="h-4 w-4 text-primary" /> : <Mail className="h-4 w-4" />}
			{label}
		</button>
	)
}

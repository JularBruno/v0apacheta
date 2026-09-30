import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

const TONES = {
	info: "border-primary/30 bg-primary/10",
	warning: "border-amber-500/40 bg-amber-500/10",
} as const

export default function Callout({
	tone = "info",
	title,
	children,
}: {
	tone?: keyof typeof TONES
	title?: string
	children: ReactNode
}) {
	return (
		<div role="note" className={cn("rounded-xl border p-4", TONES[tone])}>
			{title && <p className="font-semibold text-foreground">{title}</p>}
			<div className={cn("text-sm text-foreground/90", title && "mt-1")}>{children}</div>
		</div>
	)
}

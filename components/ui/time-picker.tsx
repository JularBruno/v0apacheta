"use client"

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

export interface TimePickerProps {
	/** Selected time as "HH:mm" — matches <input type="time">'s value format, same shape TimePicker/DayCalendar share. */
	value?: string
	onSelect: (value: string) => void
	/** Minute step for the minutes column (default 5). */
	minuteStep?: number
	className?: string
}

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"))

/**
 * Custom hour/minute picker, companion to DayCalendar — same reasoning applies:
 * native <input type="time"> is rendered by the browser using the OS/browser locale
 * (12h vs 24h, AM/PM placement, separators), which we can't reliably control from the
 * page. This draws its own two scrollable columns so the format is always ours.
 *
 * Only reads/writes "HH:mm", the same shape <input type="time"> uses.
 *
 * Each column scrolls its currently selected value into view on open, so a 24-hour
 * or 12-entry-minute list doesn't force a manual scroll just to see what's picked.
 */
export function TimePicker({ value, onSelect, minuteStep = 5, className }: TimePickerProps) {
	const minutes = Array.from({ length: 60 / minuteStep }, (_, i) => String(i * minuteStep).padStart(2, "0"))
	const [selectedHour, selectedMinute] = value ? value.split(":") : [undefined, undefined]

	return (
		<div className={cn("w-full rounded-lg border border-border bg-background p-3", className)}>
			<p className="text-sm font-semibold mb-2 text-center">Hora</p>
			<div className="flex gap-2">
				<TimeColumn
					label="Hs"
					options={HOURS}
					selected={selectedHour}
					onSelect={(h) => onSelect(`${h}:${selectedMinute ?? "00"}`)}
				/>
				<TimeColumn
					label="Min"
					options={minutes}
					selected={selectedMinute}
					onSelect={(m) => onSelect(`${selectedHour ?? "00"}:${m}`)}
				/>
			</div>
		</div>
	)
}

function TimeColumn({
	label,
	options,
	selected,
	onSelect,
}: {
	label: string
	options: string[]
	selected?: string
	onSelect: (value: string) => void
}) {
	const selectedRef = useRef<HTMLButtonElement>(null)

	// Runs on mount — TimePicker is only ever rendered while its picker is open (see
	// DateTimeRow), so a fresh mount is exactly "just opened". Re-centers on every
	// value change too, so picking the hour re-centers the minutes column on the
	// minute that was already selected (or "00" the first time).
	useEffect(() => {
		selectedRef.current?.scrollIntoView({ block: "center" })
	}, [selected])

	return (
		<div className="flex-1 min-w-0">
			<p className="text-center text-[11px] font-medium text-muted-foreground mb-1">{label}</p>
			<div className="h-40 overflow-y-auto rounded-md border border-border/60 [scrollbar-width:thin]">
				{options.map((opt) => (
					<button
						key={opt}
						ref={opt === selected ? selectedRef : undefined}
						type="button"
						onClick={() => onSelect(opt)}
						className={cn(
							"w-full py-1.5 text-center text-sm transition-colors hover:bg-muted",
							opt === selected && "bg-primary text-primary-foreground font-semibold hover:bg-primary",
						)}
					>
						{opt}
					</button>
				))}
			</div>
		</div>
	)
}

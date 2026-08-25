"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { formatDateInputLocal } from "@/lib/dateUtils"
import { Button } from "@/components/ui/button"

// TODO: point this at the shared APP_LOCALE constant once one exists (see discussion
// in quick-spend-ui-pieces.tsx) instead of hardcoding Spanish here independently.
const WEEKDAYS = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"]
const MONTH_NAMES = [
	"Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
	"Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
]

export interface DayCalendarProps {
	/** Selected date as "YYYY-MM-DD" — matches <input type="date">'s value format, so this can drop in wherever that's used. */
	value?: string
	onSelect: (value: string) => void
	/** "YYYY-MM-DD" bounds, both inclusive. */
	minDate?: string
	maxDate?: string
	className?: string
}

/**
 * Fully custom, locale-independent day picker.
 *
 * Why this exists: <input type="date">'s native calendar and its closed-field text
 * are drawn by the browser itself using the OS/browser's regional format — Chrome
 * and Safari ignore the page's `lang` for this and can render mm/dd/yyyy for an
 * Argentine user regardless of what the app is set to. There's no CSS/JS lever on
 * the native control that fixes this reliably across browsers.
 *
 * This component draws every pixel itself, so the format is always what we choose —
 * currently Spanish month names and a Monday-first grid, matching the rest of the app.
 * It only reads/writes "YYYY-MM-DD" strings, the same shape <input type="date"> uses,
 * so it can replace one directly without touching any surrounding state shape.
 *
 * Not wired up anywhere yet — built standalone so DateTimeRow (or anything else that
 * currently uses a native date input) can adopt it later.
 */
export function DayCalendar({ value, onSelect, minDate, maxDate, className }: DayCalendarProps) {
	const selectedDate = value ? parseDateInput(value) : undefined
	const [viewDate, setViewDate] = useState(() => selectedDate ?? new Date())

	const year = viewDate.getFullYear()
	const month = viewDate.getMonth()

	const goToPrevMonth = () => setViewDate(new Date(year, month - 1, 1))
	const goToNextMonth = () => setViewDate(new Date(year, month + 1, 1))

	const weeks = getMonthMatrix(year, month)
	const todayValue = formatDateInputLocal(new Date())

	const isDisabled = (d: Date) => {
		const v = formatDateInputLocal(d)
		if (minDate && v < minDate) return true
		if (maxDate && v > maxDate) return true
		return false
	}

	return (
		<div className={cn("w-full rounded-lg border border-border bg-background p-3", className)}>
			<div className="flex items-center justify-between mb-2">
				<Button
					type="button"
					variant="ghost"
					size="icon"
					className="h-7 w-7"
					onClick={goToPrevMonth}
					aria-label="Mes anterior"
				>
					<ChevronLeft className="w-4 h-4" />
				</Button>
				<span className="text-sm font-semibold">
					{MONTH_NAMES[month]} {year}
				</span>
				<Button
					type="button"
					variant="ghost"
					size="icon"
					className="h-7 w-7"
					onClick={goToNextMonth}
					aria-label="Mes siguiente"
				>
					<ChevronRight className="w-4 h-4" />
				</Button>
			</div>

			<div className="grid grid-cols-7 gap-1 mb-1">
				{WEEKDAYS.map((w) => (
					<div key={w} className="text-center text-[11px] font-medium text-muted-foreground">
						{w}
					</div>
				))}
			</div>

			<div className="grid grid-cols-7 gap-1">
				{weeks.flat().map((d, i) => {
					const inMonth = d.getMonth() === month
					const dValue = formatDateInputLocal(d)
					const isSelected = dValue === value
					const isToday = dValue === todayValue
					const disabled = isDisabled(d)

					return (
						<button
							key={i}
							type="button"
							disabled={disabled}
							onClick={() => onSelect(dValue)}
							className={cn(
								"h-8 w-full rounded-md text-xs transition-colors",
								!inMonth && "text-muted-foreground/40",
								inMonth && !isSelected && "text-foreground hover:bg-muted",
								isSelected && "bg-primary text-primary-foreground font-semibold hover:bg-primary",
								isToday && !isSelected && "ring-1 ring-primary/50",
								disabled && "opacity-30 pointer-events-none",
							)}
						>
							{d.getDate()}
						</button>
					)
				})}
			</div>
		</div>
	)
}

/**
 * Parses "YYYY-MM-DD" as a LOCAL date. `new Date("YYYY-MM-DD")` parses that shape as
 * UTC midnight, which lands on the previous calendar day in any timezone behind UTC
 * (Argentina included) — the same class of bug fixed in dateUtils' formatDateInputLocal.
 */
function parseDateInput(value: string): Date {
	const [y, m, d] = value.split("-").map(Number)
	return new Date(y, m - 1, d)
}

/** Builds a Monday-first 6-week grid of Dates covering the given month, including the leading/trailing days from adjacent months. */
function getMonthMatrix(year: number, month: number): Date[][] {
	const firstOfMonth = new Date(year, month, 1)
	// getDay(): 0=Sun..6=Sat; shift to Monday-first (0=Mon..6=Sun)
	const leadingOffset = (firstOfMonth.getDay() + 6) % 7
	const gridStart = new Date(year, month, 1 - leadingOffset)

	const weeks: Date[][] = []
	let cursor = gridStart
	for (let w = 0; w < 6; w++) {
		const week: Date[] = []
		for (let d = 0; d < 7; d++) {
			week.push(cursor)
			cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() + 1)
		}
		weeks.push(week)
	}
	return weeks
}

"use client"

import { useState, type RefObject } from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

/**
 * Same live thousands/decimal formatting as BalanceInput (dots for thousands,
 * comma for decimals — es-AR style) but driven by a plain `onChange(number)`
 * instead of react-hook-form's `control` — for forms with simple useState
 * instead of a full react-hook-form setup.
 *
 * Owns its own display text internally (like BalanceInput) rather than
 * re-deriving it from a `value` prop on every change — reformatting from a
 * prop on each keystroke fights the user mid-type (e.g. a trailing "," gets
 * stripped right after typing it, since parseValue("12,") is a clean 12).
 * To reset/seed it from outside (switching to edit an existing amount,
 * clearing after submit), remount it with a changing `key` instead.
 */
export function FormattedAmountInput({
	initialValue = 0,
	onChange,
	id,
	placeholder = "0,00",
	className,
	inputRef,
}: {
	initialValue?: number
	onChange: (value: number) => void
	id?: string
	placeholder?: string
	className?: string
	inputRef?: RefObject<HTMLInputElement | null>
}) {
	const formatForDisplay = (value: number): string => {
		if (!value && value !== 0) return ""
		return value.toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 2 })
	}

	const parseValue = (displayStr: string): number => {
		if (!displayStr) return 0
		const cleaned = displayStr.replace(/\./g, "").replace(",", ".")
		return parseFloat(cleaned) || 0
	}

	const [displayValue, setDisplayValue] = useState(() => formatForDisplay(initialValue))

	const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
		const input = e.currentTarget
		const cursorPosition = input.selectionStart
		const oldValue = input.value

		// Keep only digits and comma
		let value = input.value.replace(/[^\d,]/g, "")
		const parts = value.split(",")

		// Format integer part with dots
		if (parts[0]) parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".")
		// Limit decimals to 2
		if (parts[1]) parts[1] = parts[1].slice(0, 2)

		const formatted = parts.length > 1 ? `${parts[0]},${parts[1]}` : parts[0]

		setDisplayValue(formatted)
		onChange(parseValue(formatted))

		// Restore cursor position after the reformat
		setTimeout(() => {
			const lengthDiff = formatted.length - oldValue.length
			const newPosition = (cursorPosition ?? 0) + lengthDiff
			input.setSelectionRange(newPosition, newPosition)
		}, 0)
	}

	return (
		<div className="relative">
			<span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
			<Input
				type="text"
				id={id}
				inputMode="decimal"
				enterKeyHint="done"
				value={displayValue}
				onChange={handleInput}
				onWheel={(e) => e.currentTarget.blur()}
				placeholder={placeholder}
				className={cn("pl-8", className)}
				ref={inputRef}
			/>
		</div>
	)
}

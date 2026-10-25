import type { BudgetTone, OverLevel } from "@/lib/budget/progress-tone"

/** Bar (Progress indicator) and percentage-text classes per budget tone. */
export const TONE_CLASSES: Record<BudgetTone, { bar: string; text: string }> = {
	good: { bar: "[&>div]:bg-emerald-500", text: "text-emerald-600" },
	near: { bar: "[&>div]:bg-lime-500", text: "text-lime-700" },
	over: { bar: "[&>div]:bg-red-600", text: "text-red-600" },
	reached: { bar: "[&>div]:bg-emerald-500", text: "text-emerald-600" },
	neutral: { bar: "[&>div]:bg-gray-400", text: "text-gray-500" },
}

/**
 * Over budget, by how far: a soft red when just over, the full red when far
 * over. `amount` is the "excedido" text, `tag` the "+N%" pill.
 */
export const OVER_CLASSES: Record<Exclude<OverLevel, 0>, { bar: string; text: string; amount: string; tag: string }> = {
	1: { bar: "[&>div]:bg-red-300", text: "text-red-500", amount: "text-red-500", tag: "bg-red-100 text-red-700" },
	2: { bar: "[&>div]:bg-red-400", text: "text-red-500", amount: "text-red-500", tag: "bg-red-200 text-red-800" },
	3: { bar: "[&>div]:bg-red-500", text: "text-red-600", amount: "text-red-600", tag: "bg-red-500 text-white" },
	4: { bar: "[&>div]:bg-red-600", text: "text-red-700", amount: "text-red-700", tag: "bg-red-600 text-white" },
}

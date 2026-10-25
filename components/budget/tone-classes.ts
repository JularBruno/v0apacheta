import type { BudgetTone } from "@/lib/budget/progress-tone"

/** Bar (Progress indicator) and percentage-text classes per budget tone. */
export const TONE_CLASSES: Record<BudgetTone, { bar: string; text: string }> = {
	good: { bar: "[&>div]:bg-emerald-500", text: "text-emerald-600" },
	near: { bar: "[&>div]:bg-lime-500", text: "text-lime-700" },
	over: { bar: "[&>div]:bg-red-600", text: "text-red-600" },
	reached: { bar: "[&>div]:bg-emerald-500", text: "text-emerald-600" },
	neutral: { bar: "[&>div]:bg-gray-400", text: "text-gray-500" },
}

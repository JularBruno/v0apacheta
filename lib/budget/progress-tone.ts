/**
 * Color of a category's budget bar and percentage. Spending the whole budget
 * is fine ("near", green-yellow); only spending more than it is red, and the
 * red deepens the further over it goes (overLevel 1–4). For
 * income, reaching or passing the expected amount is good news, never red.
 */

export type BudgetKind = "expense" | "income"
export type BudgetTone = "good" | "near" | "over" | "reached" | "neutral"
/** 0 when not over; 1 up to +10%, 2 up to +25%, 3 up to +50%, 4 beyond */
export type OverLevel = 0 | 1 | 2 | 3 | 4

// The Tailwind classes for each tone live in components/budget/tone-classes.ts:
// tailwind.config.ts doesn't scan lib/, so class names written here never get CSS.

/** Expenses up to this share of the budget are plainly "good". */
const NEAR_FROM = 75

export function budgetTone(kind: BudgetKind, spent: number, budget: number) {
	const percent = budget > 0 ? (spent / budget) * 100 : 0
	let tone: BudgetTone
	if (budget <= 0) tone = "neutral"
	else if (kind === "income") tone = spent >= budget ? "reached" : "neutral"
	// compare amounts, not the rounded percentage: 100.4% shows as "100%" but is over
	else if (spent > budget) tone = "over"
	else if (percent > NEAR_FROM) tone = "near"
	else tone = "good"

	// at least 1, so a few cents over never reads "+0%"
	const overPercent = tone === "over" ? Math.max(1, Math.round(percent - 100)) : 0
	// to 2 decimals: 1100/1000*100 is 110.00000000000001, which must still be "+10%"
	const over = Math.round((percent - 100) * 100) / 100
	const overLevel: OverLevel = tone !== "over" ? 0 : over <= 10 ? 1 : over <= 25 ? 2 : over <= 50 ? 3 : 4
	return { tone, percent, overPercent, overLevel }
}

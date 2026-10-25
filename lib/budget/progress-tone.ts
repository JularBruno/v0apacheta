/**
 * Color of a category's budget bar and percentage. Spending the whole budget
 * is fine ("near", green-yellow); only spending more than it is red. For
 * income, reaching or passing the expected amount is good news, never red.
 */

export type BudgetKind = "expense" | "income"
export type BudgetTone = "good" | "near" | "over" | "reached" | "neutral"

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
	return { tone, percent, overPercent }
}

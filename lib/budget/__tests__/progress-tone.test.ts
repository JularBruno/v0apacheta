import { budgetTone } from "@/lib/budget/progress-tone"
import { OVER_CLASSES, TONE_CLASSES } from "@/components/budget/tone-classes"

// spent / budget as a percentage of a 1000 budget
const expense = (pct: number) => budgetTone("expense", (pct / 100) * 1000, 1000).tone
const income = (pct: number) => budgetTone("income", (pct / 100) * 1000, 1000).tone

describe("budgetTone", () => {
	it.each([
		[0, "good"],
		[75, "good"],
		[75.1, "near"],
		[100, "near"],
		[100.01, "over"],
		[180, "over"],
	])("expense at %s%% is %s", (pct, tone) => {
		expect(expense(pct)).toBe(tone)
	})

	it("an expense is over only when it really spent more, not when the percentage rounds to 100", () => {
		expect(budgetTone("expense", 1000, 1000).tone).toBe("near")
		expect(budgetTone("expense", 1000.01, 1000).tone).toBe("over")
	})

	it.each([
		[50, "neutral"],
		[100, "reached"],
		[150, "reached"],
	])("income at %s%% is %s, never over", (pct, tone) => {
		expect(income(pct)).toBe(tone)
	})

	it("no budget is neutral", () => {
		expect(budgetTone("expense", 500, 0).tone).toBe("neutral")
		expect(budgetTone("income", 500, 0).tone).toBe("neutral")
	})

	it("each over level is a deeper red than the one before", () => {
		const shade = (level: 1 | 2 | 3 | 4) => Number(OVER_CLASSES[level].bar.match(/red-(\d+)/)![1])
		expect(shade(1)).toBeLessThan(shade(2))
		expect(shade(2)).toBeLessThan(shade(3))
		expect(shade(3)).toBeLessThan(shade(4))
	})

	it("only 'over' is red", () => {
		for (const [tone, c] of Object.entries(TONE_CLASSES)) {
			if (tone === "over") expect(c.bar + c.text).toMatch(/red/)
			else expect(c.bar + c.text).not.toMatch(/red/)
		}
	})

	it.each([
		[100.01, 1],
		[110, 1],
		[110.5, 2],
		[125, 2],
		[130, 3],
		[150, 3],
		[151, 4],
		[300, 4],
	])("an expense at %s%% is over level %s (softer red when just over)", (pct, level) => {
		expect(budgetTone("expense", (pct / 100) * 1000, 1000).overLevel).toBe(level)
	})

	it("has no over level when not over", () => {
		expect(budgetTone("expense", 1000, 1000).overLevel).toBe(0)
		expect(budgetTone("income", 3000, 1000).overLevel).toBe(0)
	})

	it("reports how far over the budget an expense went", () => {
		expect(budgetTone("expense", 1800, 1000).overPercent).toBe(80)
		expect(budgetTone("expense", 900, 1000).overPercent).toBe(0)
		expect(budgetTone("expense", 1000.4, 1000).overPercent).toBe(1)
	})
})

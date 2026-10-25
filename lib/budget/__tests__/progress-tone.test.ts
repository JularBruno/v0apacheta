import { budgetTone } from "@/lib/budget/progress-tone"
import { TONE_CLASSES } from "@/components/budget/tone-classes"

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

	it("only 'over' is red", () => {
		for (const [tone, c] of Object.entries(TONE_CLASSES)) {
			if (tone === "over") expect(c.bar + c.text).toMatch(/red/)
			else expect(c.bar + c.text).not.toMatch(/red/)
		}
	})

	it("reports how far over the budget an expense went", () => {
		expect(budgetTone("expense", 1800, 1000).overPercent).toBe(80)
		expect(budgetTone("expense", 900, 1000).overPercent).toBe(0)
		expect(budgetTone("expense", 1000.4, 1000).overPercent).toBe(1)
	})
})

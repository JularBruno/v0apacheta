import { movementsByCategory, UNCATEGORIZED_ID } from "@/lib/financial-elements/movements-by-category"
import { TxType } from "@/lib/schemas/definitions"

const cat = (id: string, name: string, type: TxType, color = "bg-orange-500") => ({
	id, name, type, color, icon: "Home", userId: "u1", budget: 5000,
	createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z",
})
const CATS = [cat("c-sueldo", "Sueldo", TxType.INCOME, "bg-green-500"), cat("c-comida", "Comida", TxType.EXPENSE)]
const mv = (amount: number, type: TxType, categoryId?: string) => ({ id: `${amount}`, amount, type, categoryId, createdAt: "2026-10-01T12:00:00.000Z" })

describe("movementsByCategory", () => {
	it("sums the amounts per category, with the category's name and color", () => {
		const out = movementsByCategory([mv(100, TxType.EXPENSE, "c-comida"), mv(50, TxType.EXPENSE, "c-comida")], CATS)
		expect(out).toEqual([expect.objectContaining({ id: "c-comida", name: "Comida", color: "bg-orange-500", type: TxType.EXPENSE, totalExpenses: 150 })])
	})

	it("keeps income and expenses apart", () => {
		const out = movementsByCategory([mv(1000, TxType.INCOME, "c-sueldo"), mv(100, TxType.EXPENSE, "c-comida")], CATS)
		expect(out.find((c) => c.type === TxType.INCOME)?.totalExpenses).toBe(1000)
		expect(out.find((c) => c.type === TxType.EXPENSE)?.totalExpenses).toBe(100)
	})

	it("an element has no budgets: budget is always 0", () => {
		const out = movementsByCategory([mv(100, TxType.EXPENSE, "c-comida")], CATS)
		expect(out[0].budget).toBe(0)
	})

	it("groups movements without a (known) category as 'Sin categoría', one per type", () => {
		const out = movementsByCategory([mv(10, TxType.EXPENSE), mv(20, TxType.EXPENSE, "c-deleted"), mv(5, TxType.INCOME)], CATS)
		const none = out.filter((c) => c.name === "Sin categoría")
		expect(none).toHaveLength(2)
		expect(none.find((c) => c.type === TxType.EXPENSE)).toMatchObject({ id: `${UNCATEGORIZED_ID}-${TxType.EXPENSE}`, totalExpenses: 30 })
		expect(none.find((c) => c.type === TxType.INCOME)?.totalExpenses).toBe(5)
	})

	it("returns nothing for no movements", () => {
		expect(movementsByCategory([], CATS)).toEqual([])
	})
})

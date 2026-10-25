import type { Category, CategoryBudget } from "@/lib/schemas/category"
import { TxType } from "@/lib/schemas/definitions"

export const UNCATEGORIZED_ID = "sin-categoria"

type MovementLike = { amount: number; type: TxType; categoryId?: string | null }

/**
 * An element's movements summed per category and type, in the shape
 * CategoryDonutChart reads (it shows Gastos / Ingresos from `type`). Elements
 * have no budgets, so `budget` is 0. Movements whose category is missing or
 * unknown (deleted) go under one "Sin categoría" per type.
 */
export function movementsByCategory(movements: MovementLike[], cats: Category[]): CategoryBudget[] {
	const byKey = new Map<string, CategoryBudget>()
	for (const m of movements) {
		const cat = m.categoryId ? cats.find((c) => c.id === m.categoryId) : undefined
		// a category normally has one type; key by both so a stray mismatch can't merge them
		const id = cat ? (cat.type === m.type ? cat.id : `${cat.id}-${m.type}`) : `${UNCATEGORIZED_ID}-${m.type}`
		let row = byKey.get(id)
		if (!row) {
			row = {
				...(cat ?? { name: "Sin categoría", icon: "Tag", color: "bg-gray-500", userId: "" }),
				id,
				type: m.type,
				budget: 0,
				totalExpenses: 0,
				createdAt: (cat as { createdAt?: string } | undefined)?.createdAt ?? "",
			} as CategoryBudget
			byKey.set(id, row)
		}
		row.totalExpenses += Number(m.amount) || 0
	}
	return [...byKey.values()]
}

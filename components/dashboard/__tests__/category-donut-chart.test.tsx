import { render, screen } from "@testing-library/react"
import CategoryDonutChart from "@/components/dashboard/category-donut-chart"
import { TxType } from "@/lib/schemas/definitions"

const row = (id: string, name: string, totalExpenses: number) => ({
	id, name, totalExpenses, type: TxType.EXPENSE, color: "bg-orange-500", icon: "Home", userId: "u1", budget: 0,
	createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z",
})
const DATA = [row("a", "Comida", 1500), row("b", "Transporte", 500)]

describe("CategoryDonutChart currency", () => {
	it("without a currency formats as before (Historial)", () => {
		render(<CategoryDonutChart budgetedCategories={DATA as never} />)
		expect(screen.getAllByText(/^\$\s?2\.000$/).length).toBeGreaterThan(0)
	})

	it("with a currency formats every amount in it (a patrimony element)", () => {
		render(<CategoryDonutChart budgetedCategories={DATA as never} currency="USD" />)
		expect(screen.getAllByText(/US\$\s?2\.000/).length).toBeGreaterThan(0)
		expect(screen.getAllByText(/US\$\s?1\.500/).length).toBeGreaterThan(0)
	})
})

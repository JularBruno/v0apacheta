import { render, screen } from "@testing-library/react"
import CategoryCard from "@/components/budget/category-card"

jest.mock("@/components/balance-input/balance-input-mock", () => ({
	BalanceInput: () => <input aria-label="presupuesto" />,
}))

const card = (totalExpenses: number, budget = 1000, kind: "expense" | "income" = "expense") =>
	render(
		<CategoryCard
			category={{ id: "c1", name: "Comida", icon: "utensils", color: "bg-orange-500", budget, totalExpenses }}
			kind={kind}
			updateCategoryBudget={jest.fn()}
		/>,
	)

describe("CategoryCard", () => {
	it("exactly 100% spent shows no red anywhere", () => {
		const { container } = card(1000)
		expect(screen.getByText("100% usado")).toBeInTheDocument()
		expect(container.innerHTML).not.toMatch(/red-/)
	})

	it("over budget shows a red bar, red 'excedido' and how far over it went", () => {
		const { container } = card(1500)
		expect(screen.getByText(/excedido/)).toHaveClass("text-red-600")
		expect(screen.getByText("+50%")).toBeInTheDocument()
		expect(container.querySelector("[class*='bg-red-']")).not.toBeNull()
	})

	it("just over budget is a soft red, not the hard red of overspending a lot", () => {
		const { container } = card(1050)
		expect(container.querySelector("[class*='bg-red-300']")).not.toBeNull()
		expect(container.innerHTML).not.toMatch(/red-600/)
		expect(screen.getByText("+5%")).toBeInTheDocument()
	})

	it("far over budget is the full red", () => {
		const { container } = card(2000)
		expect(container.querySelector("[class*='bg-red-600']")).not.toBeNull()
	})

	it("an income category past its goal is not red", () => {
		const { container } = card(1500, 1000, "income")
		expect(container.innerHTML).not.toMatch(/red-/)
		expect(screen.getByText(/sobre lo esperado/)).toHaveTextContent("+$500.00 sobre lo esperado")
		expect(screen.queryByText(/restante|excedido/)).not.toBeInTheDocument()
	})

	it("no budget but money spent keeps the neutral 'excedido', never a negative 'restante'", () => {
		card(500, 0)
		expect(screen.getByText("Presupuesto no definido")).toBeInTheDocument()
		expect(screen.getByText("-$500.00 excedido")).toHaveClass("text-gray-400")
		expect(screen.queryByText(/restante/)).not.toBeInTheDocument()
	})
})

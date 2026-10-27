// @jest-environment jsdom
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import QuickSpendCard from "@/components/movements/quick-spend-card"
import { DashboardUserContext } from "@/app/dashboard/dashboardContext"
import { TxType } from "@/lib/schemas/definitions"

jest.mock("@/lib/actions/movements", () => ({ postMovement: jest.fn() }))
jest.mock("@/lib/actions/tags", () => ({ getTagsByUser: jest.fn().mockResolvedValue([]) }))
jest.mock("next/cache", () => ({ revalidateTag: jest.fn() }))
// server actions pull in next-auth (ESM), which jest can't parse
jest.mock("@/auth", () => ({ auth: jest.fn() }))

// jsdom has no scrollIntoView; the card scrolls each form step into view
Element.prototype.scrollIntoView = jest.fn()

const cat = (id: string, name: string) => ({
	id,
	name,
	userId: "u1",
	icon: "Home",
	color: "bg-purple-500",
	budget: 0,
	type: TxType.EXPENSE,
	createdAt: "2026-01-01T00:00:00.000Z",
	updatedAt: "2026-01-01T00:00:00.000Z",
})

const context = {
	user: { id: "u1", name: "n", email: "e", password: "p", balance: 0, totalBudget: 0 },
	userBalance: 0,
	loadingUser: false,
	error: null,
	setUserBalance: jest.fn(),
	cats: [cat("c-hogar", "Hogar"), cat("c-comida", "Comida")],
	setCats: jest.fn(),
	loadingCats: false,
	allTags: [
		{ id: "t1", name: "Supermercado", categoryId: "c-hogar", amount: 100, createdAt: "", updatedAt: "" },
	],
	setAllTags: jest.fn(),
	loadingTags: false,
	budgetedCats: [],
	setBudgetedCats: jest.fn(),
	loadingBudgetedCats: false,
}

function renderCard(initialValues?: { amount?: number }) {
	return render(
		<QueryClientProvider client={new QueryClient()}>
			<DashboardUserContext.Provider value={context as never}>
				<QuickSpendCard onAdd={jest.fn()} initialValues={initialValues} />
			</DashboardUserContext.Provider>
		</QueryClientProvider>,
	)
}

async function pickTagThenChangeCategory() {
	const user = userEvent.setup()
	await user.click(screen.getAllByRole("option", { name: /^Supermercado/ })[0])
	await user.click(screen.getByRole("button", { name: "Comida" }))
}

describe("QuickSpendCard amount on category change", () => {
	it("keeps the bulk-load amount when the category changes after picking a tag", async () => {
		renderCard({ amount: 4500 })
		await pickTagThenChangeCategory()
		expect(screen.getByTestId("amount-input")).toHaveValue("4.500")
	})

	it("still resets the amount outside bulk-load", async () => {
		renderCard()
		await pickTagThenChangeCategory()
		expect(screen.getByTestId("amount-input")).not.toHaveValue("100")
	})
})

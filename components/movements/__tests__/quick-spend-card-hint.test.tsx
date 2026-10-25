// @jest-environment jsdom
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import QuickSpendCard from "@/components/movements/quick-spend-card"
import { DashboardUserContext } from "@/app/dashboard/dashboardContext"
import { TxType } from "@/lib/schemas/definitions"

jest.mock("@/lib/actions/movements", () => ({ postMovement: jest.fn() }))
import { postMovement } from "@/lib/actions/movements"
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

const hint = () => screen.queryByTestId("submit-hint")
const grid = () => screen.getByTestId("category-section")
const submit = () => screen.getByTestId("submit-button")

describe("QuickSpendCard: what's missing before saving", () => {
	beforeEach(() => jest.clearAllMocks())

	it("an empty form names both things, without flagging the categories yet", () => {
		renderCard()
		expect(hint()).toHaveTextContent("Elegí una categoría e ingresá un monto")
		expect(grid()).not.toHaveAttribute("data-attention")
		expect(submit()).toHaveAttribute("aria-disabled", "true")
	})

	it("with an amount but no category, asks for the category and highlights the grid", async () => {
		const user = userEvent.setup()
		renderCard()
		await user.type(screen.getByTestId("amount-input"), "500")
		expect(hint()).toHaveTextContent(/^Elegí una categoría$/)
		expect(grid()).toHaveAttribute("data-attention", "true")
	})

	it("with a category but no amount, asks for the amount", async () => {
		const user = userEvent.setup()
		renderCard()
		await user.click(screen.getByRole("button", { name: "Comida" }))
		expect(hint()).toHaveTextContent(/^Ingresá un monto$/)
		expect(grid()).not.toHaveAttribute("data-attention")
	})

	it("with both, no hint and the button works", async () => {
		const user = userEvent.setup()
		renderCard()
		await user.click(screen.getByRole("button", { name: "Comida" }))
		await user.type(screen.getByTestId("amount-input"), "500")
		expect(hint()).not.toBeInTheDocument()
		expect(submit()).not.toHaveAttribute("aria-disabled", "true")
	})

	it("clicking the button without a category points to the categories instead of doing nothing", async () => {
		const user = userEvent.setup()
		renderCard()
		await user.type(screen.getByTestId("amount-input"), "500")
		;(Element.prototype.scrollIntoView as jest.Mock).mockClear()
		await user.click(submit())
		expect(Element.prototype.scrollIntoView).toHaveBeenCalled()
		expect((Element.prototype.scrollIntoView as jest.Mock).mock.contexts.at(-1)).toBe(grid())
		expect(screen.getByRole("button", { name: "Hogar" })).toHaveFocus()
		expect(postMovement).not.toHaveBeenCalled()
	})

	it("clicking it on an empty form also flags the categories", async () => {
		const user = userEvent.setup()
		renderCard()
		await user.click(submit())
		expect(grid()).toHaveAttribute("data-attention", "true")
		expect(postMovement).not.toHaveBeenCalled()
	})

	it("switching between Gasto and Ingreso clears the 'tried to save' highlight", async () => {
		const user = userEvent.setup()
		renderCard()
		await user.click(submit())
		expect(grid()).toHaveAttribute("data-attention", "true")
		await user.click(screen.getByRole("tab", { name: /Ingreso/ }))
		await user.click(screen.getByRole("tab", { name: /Gasto/ }))
		expect(grid()).not.toHaveAttribute("data-attention")
	})
})

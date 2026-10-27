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
const submit = () => screen.getByTestId("submit-button")
const section = (name: "category" | "description" | "amount") => screen.getByTestId(`${name}-section`)

async function fill(user: ReturnType<typeof userEvent.setup>, { category = false, description = false, amount = false }) {
	if (category) await user.click(screen.getByRole("button", { name: "Comida" }))
	if (description) await user.type(screen.getByTestId("description-input"), "Super")
	if (amount) await user.type(screen.getByTestId("amount-input"), "500")
}

describe("QuickSpendCard: what's missing before saving", () => {
	beforeEach(() => jest.clearAllMocks())

	it("an empty form lists everything that's missing, in one quiet line", () => {
		renderCard()
		expect(hint()).toHaveTextContent("Falta la categoría, la descripción y el monto")
		expect(submit()).toHaveAttribute("aria-disabled", "true")
	})

	it("category and amount but no description: the button is NOT ready (the bug)", async () => {
		const user = userEvent.setup()
		renderCard()
		await fill(user, { category: true, amount: true })
		expect(submit()).toHaveAttribute("aria-disabled", "true")
		expect(hint()).toHaveTextContent(/^Falta la descripción$/)
	})

	it.each([
		[{ description: true, amount: true }, "Falta la categoría"],
		[{ category: true, description: true }, "Falta el monto"],
		[{ description: true }, "Falta la categoría y el monto"],
	])("with %o filled, says %s", async (filled, text) => {
		const user = userEvent.setup()
		renderCard()
		await fill(user, filled)
		expect(hint()).toHaveTextContent(new RegExp(`^${text}$`))
	})

	it("with everything filled: no hint and the button is ready", async () => {
		const user = userEvent.setup()
		renderCard()
		await fill(user, { category: true, description: true, amount: true })
		expect(hint()).not.toBeInTheDocument()
		expect(submit()).not.toHaveAttribute("aria-disabled")
	})

	it("doesn't wrap the categories in a highlight box (no layout jump)", async () => {
		const user = userEvent.setup()
		renderCard()
		await fill(user, { amount: true })
		expect(section("category").className).not.toMatch(/ring-2|bg-primary-50/)
	})

	it("clicking while something is missing goes to the first missing field, flashes it, and saves nothing", async () => {
		const user = userEvent.setup()
		renderCard()
		await fill(user, { category: true, amount: true })
		;(Element.prototype.scrollIntoView as jest.Mock).mockClear()
		await user.click(submit())
		expect((Element.prototype.scrollIntoView as jest.Mock).mock.contexts.at(-1)).toBe(section("description"))
		expect(screen.getByTestId("description-input")).toHaveFocus()
		expect(section("description")).toHaveAttribute("data-flash", "true")
		expect(postMovement).not.toHaveBeenCalled()
	})

	it("with no category, the click focuses the first category", async () => {
		const user = userEvent.setup()
		renderCard()
		await user.click(submit())
		expect(screen.getByRole("button", { name: "Hogar" })).toHaveFocus()
		expect(section("category")).toHaveAttribute("data-flash", "true")
	})
})

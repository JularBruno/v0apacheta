import { act, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import AssetsPage from "@/app/dashboard/patrimonio/page"
import { toast } from "@/hooks/use-toast"

const mutateAsync = jest.fn()
let profile = { preferredCurrency: "ARS" }

jest.mock("@/lib/hooks/use-financial-elements", () => ({
	useFinancialElements: () => ({ data: { elements: [], totalAssets: 1000, totalLiabilities: 200 }, isLoading: false, isError: false, refetch: jest.fn() }),
}))
jest.mock("@/lib/hooks/use-currencies", () => ({
	useCurrencies: () => ({
		data: [
			{ currency: "USD", symbol: "US$", label: "USD" },
			{ currency: "ARS", symbol: "$", label: "ARS" },
		],
	}),
}))
jest.mock("@/lib/hooks/use-profile", () => ({ useProfile: () => ({ data: profile }) }))
jest.mock("@/lib/hooks/use-update-user", () => ({ useUpdateUser: () => ({ mutateAsync, isPending: false }) }))
jest.mock("@/hooks/use-toast", () => ({ toast: jest.fn() }))
jest.mock("@/components/assets/asset-form-modal", () => () => null)

// Radix Select needs these; jsdom doesn't have them
Element.prototype.scrollIntoView = jest.fn()
Element.prototype.hasPointerCapture = jest.fn(() => false)
Element.prototype.releasePointerCapture = jest.fn()

function renderPage() {
	const queryClient = new QueryClient()
	const invalidate = jest.spyOn(queryClient, "invalidateQueries")
	render(
		<QueryClientProvider client={queryClient}>
			<AssetsPage />
		</QueryClientProvider>,
	)
	return { invalidate }
}

const card = () => screen.getByTestId("main-currency-card")
const picker = () => within(card()).getByRole("combobox")

async function pick(name: RegExp) {
	const user = userEvent.setup()
	await user.click(picker())
	await user.click(await screen.findByRole("option", { name }))
}

describe("Patrimonio: main currency card", () => {
	beforeEach(() => {
		jest.clearAllMocks()
		profile = { preferredCurrency: "ARS" }
	})

	it("is its own card, not in the page header, and names each currency", async () => {
		renderPage()
		expect(within(card()).getByText("Moneda principal")).toBeInTheDocument()
		expect(within(screen.getByTestId("patrimonio-header")).queryByRole("combobox")).not.toBeInTheDocument()
		const user = userEvent.setup()
		await user.click(picker())
		expect(await screen.findByRole("option", { name: /USD · Dólar estadounidense/ })).toBeInTheDocument()
		expect(screen.getByRole("option", { name: /ARS · Peso argentino/ })).toBeInTheDocument()
	})

	it("picking another currency saves it once and reloads the totals", async () => {
		mutateAsync.mockResolvedValue({})
		const { invalidate } = renderPage()
		await pick(/USD/)
		expect(mutateAsync).toHaveBeenCalledTimes(1)
		expect(mutateAsync).toHaveBeenCalledWith({ preferredCurrency: "USD" })
		expect(invalidate).toHaveBeenCalledWith({ queryKey: ["financial-elements-patrimony"] })
	})

	it("picking the currency already saved does nothing", async () => {
		renderPage()
		await pick(/ARS/)
		expect(mutateAsync).not.toHaveBeenCalled()
	})

	it("while saving, the picker is disabled and the totals show loading", async () => {
		let finish!: () => void
		mutateAsync.mockReturnValue(new Promise<void>((resolve) => (finish = resolve)))
		renderPage()
		await pick(/USD/)
		expect(picker()).toBeDisabled()
		expect(screen.getAllByTestId("total-loading")).toHaveLength(3)
		await act(async () => finish())
		expect(picker()).not.toBeDisabled()
		expect(screen.queryByTestId("total-loading")).not.toBeInTheDocument()
	})

	it("a failed save shows an error toast and keeps the saved currency", async () => {
		mutateAsync.mockRejectedValue(new Error("500"))
		renderPage()
		await pick(/USD/)
		expect(toast).toHaveBeenCalledWith(expect.objectContaining({ variant: "destructive" }))
		expect(picker()).toHaveTextContent("ARS")
		expect(picker()).not.toBeDisabled()
	})
})

// @jest-environment jsdom
import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import HistorialPage from "@/app/dashboard/historial/page"
import { getMovementsByUserAndFilter, deleteMovement } from "@/lib/actions/movements"
import { getRangeForPeriod } from "@/lib/period-filter"
import { TxType } from "@/lib/schemas/definitions"

const HOGAR = { id: "c-hogar", name: "Hogar", color: "bg-purple-500", icon: "Home", type: TxType.EXPENSE }
const COMIDA = { id: "c-comida", name: "Comida", color: "bg-orange-500", icon: "Utensils", type: TxType.EXPENSE }
const TRABAJO = { id: "c-trabajo", name: "Trabajo", color: "bg-gray-500", icon: "Briefcase", type: TxType.INCOME }

const movement = (id: string, cat: typeof HOGAR, tag: string, amount: number, day: number) => ({
	id,
	type: cat.type,
	amount,
	categoryId: cat.id,
	category: cat,
	tag: { name: tag },
	description: "",
	createdAt: new Date(2026, 9, day, 12).toISOString(),
})

// a tiny in-memory backend, so a refetch after a delete sees the row gone
let db: ReturnType<typeof movement>[] = []

jest.mock("@/lib/actions/movements", () => ({
	getMovementsByUserAndFilter: jest.fn(() => Promise.resolve(db)),
	deleteMovement: jest.fn((id: string) => {
		db = db.filter((m) => m.id !== id)
		return Promise.resolve()
	}),
}))
jest.mock("@/lib/actions/categories", () => ({ getBudgetByUserAndPeriod: jest.fn(() => Promise.resolve([])) }))
jest.mock("@/app/dashboard/dashboardContext", () => ({ useDashboard: () => ({ cats: [HOGAR, COMIDA, TRABAJO] }) }))
// charts aren't under test here (and recharts needs a real layout)
jest.mock("@/components/history/category-budget-list", () => () => null)
jest.mock("@/components/dashboard/category-donut-chart", () => () => null)

// Radix Select / DropdownMenu need these, jsdom doesn't have them
Element.prototype.scrollIntoView = jest.fn()
Element.prototype.hasPointerCapture = jest.fn(() => false)
Element.prototype.releasePointerCapture = jest.fn()

const fetchMovements = getMovementsByUserAndFilter as jest.Mock

function renderPage() {
	const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
	queryClient.setQueryData(["user-profile"], { id: "u1", balance: 10000 })
	render(
		<QueryClientProvider client={queryClient}>
			<HistorialPage />
		</QueryClientProvider>,
	)
	return { queryClient }
}

/** tag names of the movement cards, in display order */
const listed = () =>
	screen.queryAllByText(/^(Alquiler|Super|Verdulería|Sueldo)$/).map((el) => el.textContent)

/** the day headers' text, in display order (only the day sections' headings) */
const dayHeaders = () => Array.from(document.querySelectorAll("section[aria-label] h3")).map((h) => h.textContent)

/**
 * The day labels depend on "today" (Hoy, Ayer, the year): pin the clock to
 * 25 Oct 2026 so the fixtures (1-9 Oct 2026) always read the same. Only Date
 * is faked; real timers keep react-query and user-event working.
 */
function pinToday() {
	jest.useFakeTimers({
		now: new Date(2026, 9, 25, 12),
		doNotFake: ["setTimeout", "clearTimeout", "setInterval", "clearInterval", "setImmediate", "clearImmediate", "queueMicrotask", "nextTick", "requestAnimationFrame", "cancelAnimationFrame", "requestIdleCallback", "cancelIdleCallback", "hrtime", "performance"],
	})
}

afterEach(() => jest.useRealTimers())

async function pick(user: ReturnType<typeof userEvent.setup>, comboIndex: number, option: string) {
	await user.click(screen.getAllByRole("combobox")[comboIndex])
	await user.click(await screen.findByRole("option", { name: option }))
}

beforeEach(() => {
	db = [
		movement("m1", HOGAR, "Alquiler", 150000, 1),
		movement("m2", COMIDA, "Super", 30000, 5),
		movement("m3", COMIDA, "Verdulería", 8000, 9),
		movement("m4", TRABAJO, "Sueldo", 900000, 2),
	]
	jest.clearAllMocks()
	window.confirm = jest.fn(() => true)
})

describe("Historial", () => {
	it("lists the period's movements, newest first", async () => {
		renderPage()
		await waitFor(() => expect(listed()).toEqual(["Verdulería", "Super", "Sueldo", "Alquiler"]))
		expect(screen.getByText("4 movimientos")).toBeInTheDocument()
	})

	it("puts a day header above each day's movements", async () => {
		pinToday()
		renderPage()
		await waitFor(() => expect(listed()).toHaveLength(4))
		expect(dayHeaders()).toEqual(["viernes 9 de octubre", "lunes 5 de octubre", "viernes 2 de octubre", "jueves 1 de octubre"])
		// each header comes right before its day's movement
		const verduleria = screen.getByText("Verdulería")
		const lunes = screen.getByText("lunes 5 de octubre")
		expect(lunes.compareDocumentPosition(verduleria) & Node.DOCUMENT_POSITION_PRECEDING).toBeTruthy()
		expect(lunes.compareDocumentPosition(screen.getByText("Super")) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
	})

	it("headers cover only the movements a filter leaves", async () => {
		pinToday()
		const user = userEvent.setup()
		renderPage()
		await waitFor(() => expect(listed()).toHaveLength(4))
		await user.type(screen.getByPlaceholderText(/buscar/i), "super")
		await waitFor(() => expect(listed()).toEqual(["Super"]))
		expect(dayHeaders()).toEqual(["lunes 5 de octubre"])
	})

	it("asks the backend for the current month by default", async () => {
		renderPage()
		await waitFor(() => expect(fetchMovements).toHaveBeenCalled())
		const now = new Date()
		expect(fetchMovements).toHaveBeenLastCalledWith(getRangeForPeriod(`month-${now.getMonth()}-${now.getFullYear()}`))
	})

	it("search narrows by tag name, case-insensitive, and its chip clears it", async () => {
		const user = userEvent.setup()
		renderPage()
		await waitFor(() => expect(listed()).toHaveLength(4))

		await user.type(screen.getByPlaceholderText("Buscar transacciones..."), "VERD")
		expect(listed()).toEqual(["Verdulería"])
		expect(screen.getByText("1 movimiento")).toBeInTheDocument()

		await user.click(screen.getByRole("button", { name: "Quitar filtro Búsqueda: VERD" }))
		expect(listed()).toHaveLength(4)
	})

	it("type filter keeps only expenses or only incomes", async () => {
		const user = userEvent.setup()
		renderPage()
		await waitFor(() => expect(listed()).toHaveLength(4))
		await user.click(screen.getByRole("button", { name: /Filtros/ }))

		await pick(user, 1, "Ingresos")
		expect(listed()).toEqual(["Sueldo"])

		await pick(user, 1, "Gastos")
		expect(listed()).toEqual(["Verdulería", "Super", "Alquiler"])
	})

	it("category filter keeps that category, totals it, and resets the type filter", async () => {
		const user = userEvent.setup()
		renderPage()
		await waitFor(() => expect(listed()).toHaveLength(4))
		await user.click(screen.getByRole("button", { name: /Filtros/ }))

		await pick(user, 1, "Ingresos")
		await pick(user, 0, "Comida")

		expect(listed()).toEqual(["Verdulería", "Super"])
		const chips = screen.getByLabelText("Filtros aplicados")
		expect(within(chips).getByText("Comida")).toBeInTheDocument()
		expect(within(chips).queryByText("Ingresos")).toBeNull()
		// total and average of just the filtered expenses (30.000 + 8.000)
		expect(screen.getByText("Total gastos").nextSibling?.textContent).toMatch(/38\.000/)
		expect(screen.getByText("Promedio").nextSibling?.textContent).toMatch(/19\.000/)
	})

	it("Limpiar clears search, category and type at once", async () => {
		const user = userEvent.setup()
		renderPage()
		await waitFor(() => expect(listed()).toHaveLength(4))
		await user.click(screen.getByRole("button", { name: /Filtros/ }))

		await pick(user, 0, "Comida")
		await user.type(screen.getByPlaceholderText("Buscar transacciones..."), "super")
		expect(listed()).toEqual(["Super"])

		await user.click(screen.getByRole("button", { name: "Limpiar" }))
		expect(listed()).toHaveLength(4)
		expect(screen.getByPlaceholderText("Buscar transacciones...")).toHaveValue("")
	})

	it("changing the period refetches with that period's range", async () => {
		const user = userEvent.setup()
		renderPage()
		await waitFor(() => expect(listed()).toHaveLength(4))
		await user.click(screen.getByRole("button", { name: /Filtros/ }))

		await user.click(screen.getByRole("button", { name: "Últimos 3 meses" }))

		await waitFor(() => expect(fetchMovements).toHaveBeenCalledTimes(2))
		const { startDate, endDate } = fetchMovements.mock.calls[1][0]
		const expected = getRangeForPeriod("3months")
		// same day: the range is built from "now" on each side, milliseconds apart
		expect(startDate.slice(0, 10)).toBe(expected.startDate?.slice(0, 10))
		expect(endDate.slice(0, 10)).toBe(expected.endDate?.slice(0, 10))
	})

	it("deleting a movement removes it from the list and gives the money back", async () => {
		const user = userEvent.setup()
		const { queryClient } = renderPage()
		await waitFor(() => expect(listed()).toHaveLength(4))

		const superCard = screen.getByText("Super").closest(".p-3") as HTMLElement
		await user.click(within(superCard).getByRole("button"))
		await user.click(await screen.findByRole("menuitem", { name: /Borrar/ }))

		expect(window.confirm).toHaveBeenCalled()
		await waitFor(() => expect(listed()).toEqual(["Verdulería", "Sueldo", "Alquiler"]))
		expect(deleteMovement).toHaveBeenCalledWith("m2")
		expect((queryClient.getQueryData(["user-profile"]) as { balance: number }).balance).toBe(40000)
	})

	it("cancelling the confirm keeps the movement", async () => {
		window.confirm = jest.fn(() => false)
		const user = userEvent.setup()
		renderPage()
		await waitFor(() => expect(listed()).toHaveLength(4))

		const superCard = screen.getByText("Super").closest(".p-3") as HTMLElement
		await user.click(within(superCard).getByRole("button"))
		await user.click(await screen.findByRole("menuitem", { name: /Borrar/ }))

		expect(deleteMovement).not.toHaveBeenCalled()
		expect(listed()).toHaveLength(4)
	})
})

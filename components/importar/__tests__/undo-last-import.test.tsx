// @jest-environment jsdom
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import UndoLastImport from "@/components/importar/undo-last-import"
import { getLastMovementImport, undoMovementImport } from "@/lib/actions/movements"

jest.mock("@/lib/actions/movements", () => ({
	getLastMovementImport: jest.fn(),
	undoMovementImport: jest.fn(),
}))
const mockToast = jest.fn()
jest.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: mockToast }) }))

const getLast = getLastMovementImport as jest.Mock
const undo = undoMovementImport as jest.Mock

const LAST = { importId: "imp-2", importedAt: "2026-10-19T15:30:00.000Z", movements: 412 }

function renderCard() {
	const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
	const invalidate = jest.spyOn(queryClient, "invalidateQueries")
	render(
		<QueryClientProvider client={queryClient}>
			<UndoLastImport />
		</QueryClientProvider>,
	)
	return { invalidate }
}

beforeEach(() => jest.clearAllMocks())

describe("UndoLastImport", () => {
	it("renders nothing when there is no import to undo", async () => {
		getLast.mockResolvedValue(null)
		const { container } = render(
			<QueryClientProvider client={new QueryClient()}>
				<UndoLastImport />
			</QueryClientProvider>,
		)
		await waitFor(() => expect(getLast).toHaveBeenCalled())
		expect(container).toBeEmptyDOMElement()
	})

	it("shows the last import and only deletes after confirming", async () => {
		getLast.mockResolvedValue(LAST)
		undo.mockResolvedValue({
			importId: "imp-2",
			deleted: 412,
			balance: { previous: 50000, current: 20000 },
			removed: { categories: [], tags: [] },
		})
		const user = userEvent.setup()
		const { invalidate } = renderCard()

		expect(await screen.findByText("Última migración: 412 movimientos")).toBeInTheDocument()

		await user.click(screen.getByRole("button", { name: /Deshacer migración/ }))
		expect(undo).not.toHaveBeenCalled()

		await user.click(screen.getByRole("button", { name: "Borrar 412 movimientos" }))

		await waitFor(() => expect(undo).toHaveBeenCalledWith("imp-2"))
		await waitFor(() => expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ title: "Migración deshecha" })))
		const keys = invalidate.mock.calls.map(([f]) => f?.queryKey?.[0])
		expect(keys).toEqual(
			expect.arrayContaining(["user-movements", "user-profile", "budgeted-categories", "last-movement-import"]),
		)
	})

	it("cancel leaves everything as it was", async () => {
		getLast.mockResolvedValue(LAST)
		const user = userEvent.setup()
		renderCard()

		await user.click(await screen.findByRole("button", { name: /Deshacer migración/ }))
		await user.click(screen.getByRole("button", { name: "Cancelar" }))

		expect(undo).not.toHaveBeenCalled()
		expect(screen.queryByRole("alertdialog")).toBeNull()
	})

	it("reports a failed undo and keeps the dialog open", async () => {
		getLast.mockResolvedValue(LAST)
		undo.mockRejectedValue(new Error("La migración ya fue deshecha."))
		const user = userEvent.setup()
		renderCard()

		await user.click(await screen.findByRole("button", { name: /Deshacer migración/ }))
		await user.click(screen.getByRole("button", { name: "Borrar 412 movimientos" }))

		await waitFor(() =>
			expect(mockToast).toHaveBeenCalledWith(
				expect.objectContaining({ variant: "destructive", description: "La migración ya fue deshecha." }),
			),
		)
		expect(screen.getByRole("alertdialog")).toBeInTheDocument()
	})
})

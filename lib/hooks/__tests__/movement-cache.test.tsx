// @jest-environment jsdom
import type { ReactNode } from "react"
import { act, renderHook, waitFor } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useCreateMovement } from "@/lib/hooks/use-create-movements"
import { useDeleteMovement } from "@/lib/hooks/use-delete-movement"
import { TxType } from "@/lib/schemas/definitions"

const HOGAR = { id: "c-hogar", name: "Hogar", color: "bg-purple-500", icon: "Home", type: TxType.EXPENSE }

jest.mock("@/lib/actions/movements", () => ({
	postMovement: jest.fn((data) => Promise.resolve({ ...data, id: "new", createdAt: "2026-10-19T12:00:00.000Z" })),
	deleteMovement: jest.fn(() => Promise.resolve()),
}))
// useCreateMovement only reads cats, to attach the category to the cached movement
jest.mock("@/app/dashboard/dashboardContext", () => ({ useDashboard: () => ({ cats: [HOGAR] }) }))

const movement = (id: string, amount: number, type = TxType.EXPENSE) => ({
	id,
	amount,
	type,
	categoryId: HOGAR.id,
	description: id,
	createdAt: "2026-10-10T12:00:00.000Z",
})

// the same movements cached under the keys each screen uses: historial's period
// filter and Inicio's recent-movements filter both live under ['user-movements', …]
const HISTORIAL_KEY = ["user-movements", { startDate: "2026-10-01", endDate: "2026-10-31" }]
const RECENT_KEY = ["user-movements", { startDate: "2026-07-01" }]

function setup() {
	const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
	queryClient.setQueryData(HISTORIAL_KEY, [movement("a", 500), movement("b", 1200)])
	queryClient.setQueryData(RECENT_KEY, [movement("a", 500), movement("b", 1200)])
	queryClient.setQueryData(["user-profile"], { id: "u1", balance: 10000 })
	const invalidate = jest.spyOn(queryClient, "invalidateQueries").mockResolvedValue()
	const wrapper = ({ children }: { children: ReactNode }) => (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	)
	const ids = (key: unknown[]) => (queryClient.getQueryData(key) as Array<{ id: string }>).map((m) => m.id)
	const balance = () => (queryClient.getQueryData(["user-profile"]) as { balance: number }).balance
	return { queryClient, invalidate, wrapper, ids, balance }
}

describe("movement cache", () => {
	it("a new movement shows up first in historial and recent movements, and moves the balance", async () => {
		const { wrapper, ids, balance, queryClient } = setup()
		const { result } = renderHook(() => useCreateMovement(), { wrapper })

		await act(() =>
			result.current.mutateAsync({ type: TxType.EXPENSE, categoryId: HOGAR.id, tagName: "Super", amount: 3000, description: "" }),
		)

		expect(ids(HISTORIAL_KEY)).toEqual(["new", "a", "b"])
		expect(ids(RECENT_KEY)).toEqual(["new", "a", "b"])
		expect(balance()).toBe(7000)
		// the cached copy carries its category, so the list can paint the badge/icon
		expect((queryClient.getQueryData(RECENT_KEY) as Array<{ category?: { name: string } }>)[0].category?.name).toBe("Hogar")
	})

	it("an income adds to the balance", async () => {
		const { wrapper, balance } = setup()
		const { result } = renderHook(() => useCreateMovement(), { wrapper })

		await act(() =>
			result.current.mutateAsync({ type: TxType.INCOME, categoryId: HOGAR.id, tagName: "Sueldo", amount: 5000, description: "" }),
		)

		expect(balance()).toBe(15000)
	})

	it("a deleted movement leaves every list, gives the money back, and refreshes budgets", async () => {
		const { wrapper, ids, balance, invalidate } = setup()
		const { result } = renderHook(() => useDeleteMovement(), { wrapper })

		await act(() => result.current.mutateAsync({ id: "a", type: TxType.EXPENSE, amount: 500 }))

		expect(ids(HISTORIAL_KEY)).toEqual(["b"])
		expect(ids(RECENT_KEY)).toEqual(["b"])
		expect(balance()).toBe(10500)
		const invalidated = invalidate.mock.calls.map(([f]) => f?.queryKey?.[0])
		expect(invalidated).toEqual(expect.arrayContaining(["user-movements", "user-profile", "budgeted-categories"]))
	})

	it("deleting an income takes it off the balance", async () => {
		const { wrapper, balance } = setup()
		const { result } = renderHook(() => useDeleteMovement(), { wrapper })

		await act(() => result.current.mutateAsync({ id: "b", type: TxType.INCOME, amount: 1200 }))

		await waitFor(() => expect(balance()).toBe(8800))
	})

	it("deleting a movement tied to an asset also refreshes that asset", async () => {
		const { wrapper, invalidate } = setup()
		const { result } = renderHook(() => useDeleteMovement(), { wrapper })

		await act(() => result.current.mutateAsync({ id: "a", type: TxType.EXPENSE, amount: 500, financialElementId: "fe1" }))

		const keys = invalidate.mock.calls.map(([f]) => f?.queryKey)
		expect(keys).toEqual(expect.arrayContaining([["financial-elements-patrimony"], ["financial-element", "fe1"]]))
	})
})

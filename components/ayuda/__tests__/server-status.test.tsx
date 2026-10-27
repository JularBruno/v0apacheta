import { render, screen, act } from "@testing-library/react"
import { ServerStatus } from "@/components/ayuda/server-status"

const answer = (online: boolean) => ({ ok: true, json: async () => ({ online }) })

describe("ServerStatus", () => {
	const originalFetch = global.fetch

	afterEach(() => {
		global.fetch = originalFetch
		jest.useRealTimers()
	})

	it("says 'en línea' when the API is up", async () => {
		global.fetch = jest.fn(async () => answer(true)) as unknown as typeof fetch
		render(<ServerStatus />)
		expect(await screen.findByText("Servidor: en línea")).toBeInTheDocument()
		expect(global.fetch).toHaveBeenCalledWith("/api/health", expect.objectContaining({ cache: "no-store" }))
	})

	it("says 'sin conexión' when the API is down", async () => {
		global.fetch = jest.fn(async () => answer(false)) as unknown as typeof fetch
		render(<ServerStatus />)
		expect(await screen.findByText("Servidor: sin conexión")).toBeInTheDocument()
	})

	it("says 'sin conexión' when the app's own route fails", async () => {
		global.fetch = jest.fn(async () => {
			throw new TypeError("Failed to fetch")
		}) as unknown as typeof fetch
		render(<ServerStatus />)
		expect(await screen.findByText("Servidor: sin conexión")).toBeInTheDocument()
	})

	it("says 'sin conexión' after the timeout instead of waiting forever", async () => {
		jest.useFakeTimers()
		global.fetch = jest.fn(
			(_url: string, init?: RequestInit) =>
				new Promise((_, reject) => init?.signal?.addEventListener("abort", () => reject(new Error("aborted")))),
		) as unknown as typeof fetch
		render(<ServerStatus />)
		expect(screen.getByText("Servidor: comprobando…")).toBeInTheDocument()
		await act(async () => {
			jest.advanceTimersByTime(5000)
		})
		expect(screen.getByText("Servidor: sin conexión")).toBeInTheDocument()
	})
})

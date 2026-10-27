import { checkApiHealth } from "@/lib/http/health"

const okResponse = (body: unknown, ok = true) => ({ ok, json: async () => body }) as unknown as Response

describe("checkApiHealth", () => {
	afterEach(() => jest.useRealTimers())

	it("is online when the API answers { status: 'ok' }", async () => {
		const fetchImpl = jest.fn(async () => okResponse({ status: "ok" }))
		await expect(checkApiHealth("http://api/v1", fetchImpl)).resolves.toBe(true)
		expect(fetchImpl).toHaveBeenCalledWith("http://api/v1/health", expect.objectContaining({ cache: "no-store" }))
	})

	it("is offline when the API is unreachable", async () => {
		const fetchImpl = jest.fn(async () => {
			throw new TypeError("fetch failed")
		})
		await expect(checkApiHealth("http://api/v1", fetchImpl)).resolves.toBe(false)
	})

	it("is offline on a non-2xx answer or an unexpected body", async () => {
		await expect(checkApiHealth("http://api/v1", async () => okResponse({ status: "ok" }, false))).resolves.toBe(false)
		await expect(checkApiHealth("http://api/v1", async () => okResponse({ status: "down" }))).resolves.toBe(false)
	})

	it("is offline when API_URL is not set", async () => {
		const fetchImpl = jest.fn()
		await expect(checkApiHealth(undefined, fetchImpl)).resolves.toBe(false)
		expect(fetchImpl).not.toHaveBeenCalled()
	})

	it("gives up after the timeout instead of hanging", async () => {
		jest.useFakeTimers()
		const fetchImpl = jest.fn(
			(_url: string, init?: RequestInit) =>
				new Promise<Response>((_, reject) => init?.signal?.addEventListener("abort", () => reject(new Error("aborted")))),
		) as unknown as typeof fetch
		const result = checkApiHealth("http://api/v1", fetchImpl, 3000)
		jest.advanceTimersByTime(3000)
		await expect(result).resolves.toBe(false)
	})
})

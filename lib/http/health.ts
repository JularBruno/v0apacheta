/**
 * Asks the backend's public GET /health whether it is up. Server-side only:
 * API_URL is not exposed to the browser, so the client goes through
 * app/api/health/route.ts. Never throws; anything but a timely
 * `{ status: "ok" }` counts as offline.
 */
export async function checkApiHealth(
	apiUrl: string | undefined,
	fetchImpl: typeof fetch = fetch,
	timeoutMs = 3000,
): Promise<boolean> {
	if (!apiUrl) return false

	const controller = new AbortController()
	const timer = setTimeout(() => controller.abort(), timeoutMs)
	try {
		const response = await fetchImpl(`${apiUrl}/health`, { cache: "no-store", signal: controller.signal })
		if (!response.ok) return false
		const body = await response.json()
		return body?.status === "ok"
	} catch {
		return false
	} finally {
		clearTimeout(timer)
	}
}

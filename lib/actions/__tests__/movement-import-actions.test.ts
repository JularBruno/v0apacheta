import { getLastMovementImport, undoMovementImport } from "@/lib/actions/movements"
import { getMethod, deleteMethod } from "@/lib/actions/utils"

jest.mock("@/lib/actions/utils", () => ({
	getSession: jest.fn(),
	getMethod: jest.fn(),
	postMethod: jest.fn(),
	deleteMethod: jest.fn(),
}))

const get = getMethod as jest.Mock
const del = deleteMethod as jest.Mock

beforeEach(() => jest.clearAllMocks())

describe("getLastMovementImport", () => {
	it("asks the backend for the last import", async () => {
		const last = { importId: "imp-1", importedAt: "2026-10-19T15:30:00.000Z", movements: 3 }
		get.mockResolvedValue(last)
		await expect(getLastMovementImport()).resolves.toEqual(last)
		expect(get).toHaveBeenCalledWith("movement/upload/last")
	})

	it("treats a 404 as 'nothing to undo'", async () => {
		get.mockRejectedValue(new Error("HTTP error! status: 404"))
		await expect(getLastMovementImport()).resolves.toBeNull()
	})

	it("lets every other failure through", async () => {
		get.mockRejectedValue(new Error("HTTP error! status: 500"))
		await expect(getLastMovementImport()).rejects.toThrow("status: 500")
	})
})

describe("undoMovementImport", () => {
	it("deletes that import by id", async () => {
		const result = { importId: "imp-1", deleted: 3, balance: { previous: 10, current: 5 }, removed: { categories: [], tags: [] } }
		del.mockResolvedValue(result)
		await expect(undoMovementImport("imp-1")).resolves.toEqual(result)
		expect(del).toHaveBeenCalledWith("movement/upload", "imp-1")
	})

	it("turns an error body into a thrown error", async () => {
		del.mockResolvedValue({ statusCode: 409, message: "La migración ya fue deshecha." })
		await expect(undoMovementImport("imp-1")).rejects.toThrow("La migración ya fue deshecha.")
	})

	it("hides the backend's generic English message on a 5xx", async () => {
		del.mockResolvedValue({ statusCode: 500, message: "Internal server error" })
		await expect(undoMovementImport("imp-1")).rejects.toThrow("No se pudo deshacer la migración. Probá de nuevo en un rato.")
	})
})

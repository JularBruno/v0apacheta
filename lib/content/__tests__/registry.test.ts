import { entries, findEntry, listByKind } from "../registry"
import { assertValidRegistry } from "../schema"

describe("registry", () => {
	test("the real registry is valid", () => {
		expect(() => assertValidRegistry(entries)).not.toThrow()
	})

	test("findEntry returns undefined for unknown slugs", () => {
		expect(findEntry("no-existe-seguro")).toBeUndefined()
	})

	test("listByKind returns only that kind, newest first", () => {
		for (const kind of ["post", "tool"] as const) {
			const list = listByKind(kind)
			expect(list.every((e) => e.kind === kind)).toBe(true)
			const dates = list.map((e) => Date.parse(e.publishedAt))
			expect(dates).toEqual([...dates].sort((a, b) => b - a))
		}
	})
})

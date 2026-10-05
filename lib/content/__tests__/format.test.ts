import { formatDate } from "../format"

test("formatDate renders long es-AR dates without timezone drift", () => {
	expect(formatDate("2026-09-30")).toBe("30 de septiembre de 2026")
	expect(formatDate("2026-01-01")).toBe("1 de enero de 2026")
})

import { filterMovements, getRangeForPeriod, currentMonthPeriodId, ALL_FILTER_ID } from "@/lib/period-filter";
import { TxType } from "@/lib/schemas/definitions";

const mv = (over: Record<string, unknown>) =>
	({ id: "1", description: "Alquiler", categoryId: "c1", type: TxType.EXPENSE, createdAt: "2026-10-05T12:00:00.000Z", ...over }) as any;

const noFilters = { searchTerm: "", categoryId: ALL_FILTER_ID, type: ALL_FILTER_ID, range: {} };

describe("getRangeForPeriod", () => {
	it("returns the whole month in UTC for month ids", () => {
		expect(getRangeForPeriod("month-9-2026")).toEqual({
			startDate: "2026-10-01T00:00:00.000Z",
			endDate: "2026-10-31T23:59:59.999Z",
		});
	});

	it("returns no bounds for the 'ever' quick filter and unknown ids", () => {
		expect(getRangeForPeriod("ever")).toEqual({});
		expect(getRangeForPeriod("nonsense")).toEqual({});
	});

	it("returns a bounded range for quick filters", () => {
		const { startDate, endDate } = getRangeForPeriod("week");
		expect(new Date(endDate!).getTime() - new Date(startDate!).getTime()).toBe(7 * 24 * 60 * 60 * 1000);
	});

	it("builds the current month id", () => {
		expect(currentMonthPeriodId(new Date(2026, 9, 6))).toBe("month-9-2026");
	});
});

describe("filterMovements", () => {
	const list = [
		mv({ id: "a" }),
		mv({ id: "b", description: "Sueldo", type: TxType.INCOME, categoryId: "c2" }),
		mv({ id: "c", createdAt: "2026-08-01T12:00:00.000Z" }),
	];
	const ids = (r: any[]) => r.map((m) => m.id);

	it("keeps everything with no filters", () => {
		expect(ids(filterMovements(list, noFilters))).toEqual(["a", "b", "c"]);
	});

	it("filters by type, category and search independently", () => {
		expect(ids(filterMovements(list, { ...noFilters, type: TxType.INCOME }))).toEqual(["b"]);
		expect(ids(filterMovements(list, { ...noFilters, categoryId: "c1" }))).toEqual(["a", "c"]);
		expect(ids(filterMovements(list, { ...noFilters, searchTerm: "sueld" }))).toEqual(["b"]);
	});

	it("combines type and category (AND)", () => {
		expect(ids(filterMovements(list, { ...noFilters, categoryId: "c1", type: TxType.INCOME }))).toEqual([]);
	});

	it("filters by period range", () => {
		const range = getRangeForPeriod("month-9-2026");
		expect(ids(filterMovements(list, { ...noFilters, range }))).toEqual(["a", "b"]);
	});
});

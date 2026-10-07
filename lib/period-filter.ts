import { quickFilters } from "@/lib/quick-spend-constants";
import { getDateStringsForFilter, getLastNDays, getLastNMonths, getMonthRange } from "@/lib/dateUtils";
import { TxType } from "@/lib/schemas/definitions";
import { Movements } from "@/lib/schemas/movement";

export const ALL_FILTER_ID = "all";

export type PeriodRange = { startDate?: string; endDate?: string };

/** Id of the current calendar month, as PeriodSelector emits it ("month-<0-11>-<year>"). */
export const currentMonthPeriodId = (now = new Date()) => `month-${now.getMonth()}-${now.getFullYear()}`;

/** Translates a PeriodSelector id into an ISO date range. Missing bounds mean "no limit". */
export function getRangeForPeriod(periodId: string): PeriodRange {
	const quickRanges: Record<string, () => { start: Date; end: Date }> = {
		[quickFilters[0].id]: () => getLastNDays(1),
		[quickFilters[1].id]: () => getLastNDays(7),
		[quickFilters[2].id]: () => getLastNMonths(1),
		[quickFilters[3].id]: () => getLastNMonths(3),
		[quickFilters[4].id]: () => getLastNMonths(6),
	};

	const quick = quickRanges[periodId];
	if (quick) {
		const { start, end } = quick();
		return getDateStringsForFilter(start, end);
	}

	if (periodId.startsWith("month-")) {
		const [, monthStr, yearStr] = periodId.split("-");
		const { start, end } = getMonthRange(parseInt(monthStr, 10), parseInt(yearStr, 10));
		return getDateStringsForFilter(start, end);
	}

	return {};
}

export type MovementFilters = {
	searchTerm: string;
	categoryId: string;
	type: string;
	range: PeriodRange;
};

/** Client-side filtering for lists that already hold every movement (e.g. an asset's history). */
export function filterMovements(movements: Movements[], { searchTerm, categoryId, type, range }: MovementFilters) {
	const term = searchTerm.trim().toLowerCase();
	const start = range.startDate ? new Date(range.startDate).getTime() : undefined;
	const end = range.endDate ? new Date(range.endDate).getTime() : undefined;

	return movements.filter((m) => {
		if (categoryId !== ALL_FILTER_ID && m.categoryId !== categoryId) return false;
		if (type !== ALL_FILTER_ID && m.type !== (type as TxType)) return false;
		const createdAt = new Date(m.createdAt).getTime();
		if (start !== undefined && createdAt < start) return false;
		if (end !== undefined && createdAt > end) return false;
		if (term && !(m.tag?.name ?? m.description ?? "").toLowerCase().includes(term)) return false;
		return true;
	});
}

/**
 * Centralized date handling - uses user's system locale/timezone
 */

/**
 * Get current date
 */
export const getNow = () => new Date();

/**
 * Get current date info for HTML inputs (date and time fields)
 * Used in quickspend card for setting input values
 */
export const getCurrentDateTimeInfo = () => {
	const d = new Date();
	return {
		dateInput: d.toISOString().split('T')[0], // "2026-01-08"
		timeInput: d.toTimeString().slice(0, 5), // "14:30"
	};
};

/**
 * Get month name (e.g., "enero", "febrero")
 */
export const getMonthName = (date = new Date()) => {
	return new Intl.DateTimeFormat(undefined, { month: 'long' }).format(date);
};

/**
 * Format date for display (uses system locale/timezone)
 */
export const formatDate = (isoString: string) => {
	const date = new Date(isoString);
	return new Intl.DateTimeFormat(undefined, { // undefined = use system locale
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
		// No timeZone specified = uses system timezone
	}).format(date);
};

export function formatDateNoYear(isoString: string) {
	const date = new Date(isoString);
	return new Intl.DateTimeFormat(undefined, {
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	}).format(date);
}

/**
 * Get date range for last N days
 */
export const getLastNDays = (days: number) => {
	const end = getNow();
	const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);
	return { start, end };
};

/**
 * Get date range for last N months
 */
export const getLastNMonths = (months: number) => {
	const end = getNow();
	const start = new Date(end);
	start.setMonth(start.getMonth() - months);
	return { start, end };
};

/**
 * Get date range for specific month
 */
export const getMonthRange = (month: number, year: number) => {
	const start = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
	const end = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));
	return { start, end };
};

/**
 * Convert date to ISO string for API calls (always UTC)
 */
export const toISOString = (date: Date) => date.toISOString();

export const getDateStringsForFilter = (start: Date, end: Date) => {
	return {
		startDate: toISOString(start),
		endDate: toISOString(end),
	};
};
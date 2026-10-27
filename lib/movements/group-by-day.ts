/**
 * Splits a movement list into calendar days for the Historial day headers.
 * Days are the user's local days (pass `timeZone` to pin one; default is the
 * browser's), so a movement at 22:30 in Argentina isn't moved to the next day
 * by its UTC timestamp.
 */

export interface DayGroup<T> {
	/** YYYY-MM-DD in the chosen time zone */
	key: string
	/** "Hoy", "Ayer", "martes 21 de octubre", or "... de 2025" for another year */
	label: string
	movements: T[]
}

function dayKey(date: Date, timeZone?: string) {
	// en-CA formats as YYYY-MM-DD
	return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(date)
}

/** The calendar day before a YYYY-MM-DD key (not now − 24h, which DST days break). */
function previousDay(key: string) {
	const [y, m, d] = key.split("-").map(Number)
	return new Date(Date.UTC(y, m - 1, d - 1)).toISOString().slice(0, 10)
}

function dayLabel(date: Date, key: string, now: Date, timeZone?: string) {
	const today = dayKey(now, timeZone)
	if (key === today) return "Hoy"
	if (key === previousDay(today)) return "Ayer"
	const sameYear = key.slice(0, 4) === today.slice(0, 4)
	const parts = new Intl.DateTimeFormat("es-AR", {
		timeZone,
		weekday: "long",
		day: "numeric",
		month: "long",
		...(sameYear ? {} : { year: "numeric" }),
	}).formatToParts(date)
	const part = (type: string) => parts.find((p) => p.type === type)?.value ?? ""
	return `${part("weekday")} ${part("day")} de ${part("month")}${sameYear ? "" : ` de ${part("year")}`}`
}

export function groupByDay<T extends { createdAt: string }>(movements: T[], now = new Date(), timeZone?: string): DayGroup<T>[] {
	const byKey = new Map<string, DayGroup<T>>()
	for (const movement of movements) {
		const date = new Date(movement.createdAt)
		const key = dayKey(date, timeZone)
		let group = byKey.get(key)
		if (!group) {
			group = { key, label: dayLabel(date, key, now, timeZone), movements: [] }
			byKey.set(key, group)
		}
		group.movements.push(movement)
	}
	return [...byKey.values()].sort((a, b) => (a.key < b.key ? 1 : a.key > b.key ? -1 : 0))
}

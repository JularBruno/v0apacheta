const formatter = new Intl.DateTimeFormat("es-AR", {
	day: "numeric",
	month: "long",
	year: "numeric",
	timeZone: "UTC",
})

/** "2026-09-30" -> "30 de septiembre de 2026". UTC so date-only ISO strings never drift a day. */
export function formatDate(iso: string): string {
	return formatter.format(new Date(iso))
}

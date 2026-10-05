/**
 * Quick-pick places for the sky chart. The Sun's position only needs latitude, longitude and the date; the
 * time zone is only for turning that into clock time, and it is a legal thing (Argentina is UTC-3 although
 * Córdoba is geographically near UTC-4; Norway switches between +1 and +2), not something coordinates can
 * give. So each place carries its IANA zone and the chart asks `zoneUtcOffset` for the offset on the chosen
 * date, which follows daylight saving.
 */
import { CORDOBA } from "./chart"

export interface Place {
	id: string
	/** the button text */
	label: string
	/** the full name shown in the place card */
	name: string
	lat: number
	lon: number
	/** IANA time zone, used to work out the clock offset for any date */
	timeZone: string
	/** the standard offset, only used if the browser cannot work it out from the zone */
	utcOffset: number
	/** one line on why the place is interesting (the button's tooltip) */
	blurb: string
}

export const PLACES: Place[] = [
	{
		id: "cordoba",
		label: "Córdoba",
		name: CORDOBA.name,
		lat: CORDOBA.lat,
		lon: CORDOBA.lon,
		timeZone: "America/Argentina/Cordoba",
		utcOffset: -3,
		blurb: "Donde empieza el mapa: el Sol pasa por el norte y llega a 82° de altura en diciembre.",
	},
	{
		id: "noruega",
		label: "Noruega",
		name: "Tromsø, Noruega",
		lat: 69.65,
		lon: 18.96,
		timeZone: "Europe/Oslo",
		utcOffset: 1,
		blurb: "Sobre el círculo polar ártico: sol de medianoche en verano y noche polar en invierno.",
	},
	{
		id: "antartida",
		label: "Antártida",
		name: "Base Belgrano II, Antártida",
		lat: -77.87,
		lon: -34.63,
		timeZone: "America/Argentina/Buenos_Aires",
		utcOffset: -3,
		blurb: "Base argentina dentro del círculo polar antártico: meses de sol continuo en verano y de noche en invierno.",
	},
]

/** The quick-pick place with exactly these coordinates, if any. */
export function findPlace(lat: number, lon: number): Place | undefined {
	return PLACES.find((place) => place.lat === lat && place.lon === lon)
}

/**
 * The clock offset from UTC, in hours, of an IANA time zone on a calendar date (taken at noon UTC), or null if the
 * zone is unknown or the browser cannot say. Follows daylight saving, so Norway is 1 in January and 2 in July.
 */
export function zoneUtcOffset(timeZone: string, year: number, month: number, day: number): number | null {
	if (!timeZone) return null
	try {
		const parts = new Intl.DateTimeFormat("en-US", { timeZone, timeZoneName: "longOffset" }).formatToParts(
			new Date(Date.UTC(year, month - 1, day, 12)),
		)
		const name = parts.find((part) => part.type === "timeZoneName")?.value ?? ""
		if (name === "GMT" || name === "UTC") return 0
		const match = /^GMT([+-])(\d{1,2})(?::(\d{2}))?$/.exec(name)
		if (!match) return null
		const hours = Number(match[2]) + Number(match[3] ?? 0) / 60
		return match[1] === "-" ? -hours : hours
	} catch {
		return null
	}
}

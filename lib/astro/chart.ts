/**
 * Everything the sky chart needs between the physics (`sun.ts`) and the drawing: projection, text
 * formatting, parsing what people type, the reference curves and the per-day summary.
 * Latitude is positive north, longitude positive east; azimuth is from north, clockwise.
 */
import {
	dayOfYear,
	equationOfTime,
	maxAltitude,
	solarDeclination,
	solarNoonClock,
	sunAltAz,
	sunriseHourAngle,
	type DayKind,
} from "./sun"

export interface Location {
	lat: number
	lon: number
}

export const CORDOBA: Location & { name: string } = { name: "Córdoba, Argentina", lat: -31.42, lon: -64.18 }

/** Argentina uses UTC-3 all year. */
export const ARGENTINA_UTC_OFFSET = -3

// ---- projection and text ---------------------------------------------------------------------

/** Polar sky chart: zenith in the centre, the horizon at `radius`, north up, east on the left (as seen looking up). */
export function project(alt: number, az: number, radius = 430, cx = 500, cy = 500): { x: number; y: number } {
	const r = (radius * (90 - alt)) / 90
	const a = (az * Math.PI) / 180
	return { x: cx - r * Math.sin(a), y: cy - r * Math.cos(a) }
}

const POINTS = ["N", "NE", "E", "SE", "S", "SO", "O", "NO"]

/** 8-point compass name for an azimuth (Spanish: SO and O for south-west and west). */
export function compass(az: number): string {
	return POINTS[Math.round((((az % 360) + 360) % 360) / 45) % 8]
}

const pad2 = (n: number) => String(n).padStart(2, "0")

/** Hours (any real number) as "HH:MM", wrapping around midnight. */
export function formatClock(hours: number): string {
	const minutes = Math.round((((hours % 24) + 24) % 24) * 60) % 1440
	return `${pad2(Math.floor(minutes / 60))}:${pad2(minutes % 60)}`
}

/** A length of time in hours as "14 h 12 min". */
export function formatDuration(hours: number): string {
	const minutes = Math.round(hours * 60)
	return `${Math.floor(minutes / 60)} h ${pad2(minutes % 60)} min`
}

// ---- parsing what people type ------------------------------------------------------------------

const DECIMAL = /^[+-]?(\d+([.,]\d*)?|[.,]\d+)$/

function parseDecimal(text: string): number | null {
	const t = text.trim()
	if (!DECIMAL.test(t)) return null
	const value = Number(t.replace(",", "."))
	return Number.isFinite(value) ? value : null
}

/** A latitude (limit 90) or longitude (limit 180) typed with a dot or comma, or null if it isn't one. */
export function parseCoordinate(text: string, limit: number): number | null {
	const value = parseDecimal(text)
	return value !== null && Math.abs(value) <= limit ? value : null
}

/** A UTC offset in hours, from -12 to +14 (half hours allowed), or null. */
export function parseUtcOffset(text: string): number | null {
	const value = parseDecimal(text)
	return value !== null && value >= -12 && value <= 14 ? value : null
}

// ---- reference curves --------------------------------------------------------------------------

export interface ReferenceCurve {
	id: string
	label: string
	color: string
	/** calendar dates (month, day) whose declinations are averaged; null means exactly 0° (equinox) */
	dates: [number, number][] | null
	emphasize?: boolean
}

// Colours from the original chart; the June solstice blue is lighter so it reads on the dark panel.
export const REFERENCE_CURVES: ReferenceCurve[] = [
	{ id: "solsticio-diciembre", label: "21 de diciembre", color: "#e0343c", dates: [[12, 21]] },
	{ id: "nov-ene", label: "21 nov / 21 ene", color: "#f2811d", dates: [[11, 21], [1, 21]] },
	{ id: "oct-feb", label: "21 oct / 21 feb", color: "#f0b429", dates: [[10, 21], [2, 21]] },
	{ id: "equinoccios", label: "≈ 20 mar / 23 sep", color: "#2ea043", dates: null, emphasize: true },
	{ id: "ago-abr", label: "21 ago / 21 abr", color: "#4fb8e8", dates: [[8, 21], [4, 21]] },
	{ id: "jul-may", label: "21 jul / 21 may", color: "#2f6fce", dates: [[7, 21], [5, 21]] },
	{ id: "solsticio-junio", label: "21 de junio", color: "#7c9cff", dates: [[6, 21]] },
]

/** Declination of a reference curve: the average over its dates, or exactly 0 for the equinoxes. */
export function referenceDeclination(curve: ReferenceCurve, year: number): number {
	if (!curve.dates) return 0
	const decs = curve.dates.map(([m, d]) => solarDeclination(dayOfYear(year, m, d)))
	return decs.reduce((a, b) => a + b, 0) / decs.length
}

/** "Solsticio de verano/invierno" (it flips with the hemisphere), "Equinoccios", or null. */
export function curveSubtitle(curve: ReferenceCurve, lat: number): string | null {
	if (curve.id === "equinoccios") return "Equinoccios"
	if (curve.id === "solsticio-diciembre") return lat < 0 ? "Solsticio de verano" : "Solsticio de invierno"
	if (curve.id === "solsticio-junio") return lat < 0 ? "Solsticio de invierno" : "Solsticio de verano"
	return null
}

// ---- one day -----------------------------------------------------------------------------------

export interface SunDay {
	/** declination in degrees */
	dec: number
	/** equation of time in minutes */
	eot: number
	kind: DayKind
	/** clock time of solar noon, hours */
	noon: number
	/** clock times of sunrise and sunset, hours; null when the Sun does not rise or set */
	sunrise: number | null
	sunset: number | null
	riseAz: number | null
	setAz: number | null
	/** altitude at solar noon, degrees (negative: the Sun stays below the horizon) */
	maxAlt: number
	/** hours of Sun above the horizon (0 in polar night, 24 in polar day) */
	dayLength: number
}

const wrap24 = (h: number) => ((h % 24) + 24) % 24

/** The Sun's day at a location: times (on the clock of `utcOffset`), directions and height. */
export function sunDay(loc: Location, doy: number, utcOffset: number, decOverride?: number): SunDay {
	const dec = decOverride ?? solarDeclination(doy)
	const eot = equationOfTime(doy)
	const noon = solarNoonClock(loc.lon, eot, utcOffset)
	const { kind, hourAngle } = sunriseHourAngle(loc.lat, dec)
	const normal = kind === "normal"
	return {
		dec,
		eot,
		kind,
		noon,
		sunrise: normal ? wrap24(noon - hourAngle / 15) : null,
		sunset: normal ? wrap24(noon + hourAngle / 15) : null,
		riseAz: normal ? sunAltAz(loc.lat, dec, -hourAngle).az : null,
		setAz: normal ? sunAltAz(loc.lat, dec, hourAngle).az : null,
		maxAlt: maxAltitude(loc.lat, dec),
		dayLength: kind === "polarDay" ? 24 : kind === "polarNight" ? 0 : (2 * hourAngle) / 15,
	}
}

export interface CurvePoint {
	alt: number
	az: number
	/** hour angle in degrees */
	H: number
}

/** The Sun's path for a declination: horizon to horizon, or a full loop in polar day, or nothing in polar night. */
export function curvePoints(loc: Location, dec: number, stepDeg = 0.75): CurvePoint[] {
	const { kind, hourAngle } = sunriseHourAngle(loc.lat, dec)
	if (kind === "polarNight") return []
	const span = kind === "polarDay" ? 180 : hourAngle
	const n = Math.max(2, Math.ceil((2 * span) / stepDeg))
	const points: CurvePoint[] = []
	for (let i = 0; i <= n; i++) {
		const H = -span + (i * 2 * span) / n
		const { alt, az } = sunAltAz(loc.lat, dec, H)
		points.push({ alt, az, H })
	}
	return points
}

export interface HourMarker {
	/** solar hour of the day (12 = solar noon) */
	solarHour: number
	alt: number
	az: number
}

/** A dot for each whole solar hour the Sun is up. */
export function hourMarkers(loc: Location, dec: number): HourMarker[] {
	const { kind, hourAngle } = sunriseHourAngle(loc.lat, dec)
	if (kind === "polarNight") return []
	const first = kind === "polarDay" ? 0 : Math.ceil(12 - hourAngle / 15)
	const last = kind === "polarDay" ? 23 : Math.floor(12 + hourAngle / 15)
	const markers: HourMarker[] = []
	for (let h = first; h <= last; h++) {
		const { alt, az } = sunAltAz(loc.lat, dec, (h - 12) * 15)
		markers.push({ solarHour: h, alt, az })
	}
	return markers
}

/** Where the Sun is at a clock time (hours on the clock of `utcOffset`) on a day of the year. */
export function sunAtClock(
	loc: Location,
	doy: number,
	utcOffset: number,
	clockHours: number,
	decOverride?: number,
): CurvePoint {
	const timeCorrection = 4 * (loc.lon - 15 * utcOffset) + equationOfTime(doy)
	const solarTime = clockHours + timeCorrection / 60
	const H = ((((solarTime - 12) * 15 + 180) % 360) + 360) % 360 - 180
	const { alt, az } = sunAltAz(loc.lat, decOverride ?? solarDeclination(doy), H)
	return { alt, az, H }
}

/**
 * When the Sun is at least `minAlt` degrees high on a day, as clock hours (0-24), or null if it never gets that high.
 * Used for UV and shadow advice: UV is strongest when the Sun is high, and above 45° your shadow is shorter than you.
 */
export function sunAboveWindow(
	loc: Location,
	doy: number,
	utcOffset: number,
	minAlt: number,
	decOverride?: number,
): { from: number; to: number } | null {
	let first = -1
	let last = -1
	for (let minute = 0; minute < 1440; minute++) {
		if (sunAtClock(loc, doy, utcOffset, minute / 60, decOverride).alt >= minAlt) {
			if (first < 0) first = minute
			last = minute
		}
	}
	return first < 0 ? null : { from: first / 60, to: (last + 1) / 60 }
}

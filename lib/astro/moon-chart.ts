/**
 * What the sky chart needs from the Moon beyond its position: a whole rise-to-set arc around each
 * culmination (never an arc cut at midnight), the five reference curves of the monthly declination
 * cycle (always ordered south to north), and the 18.6-year standstill cycle.
 */
import { moonAltAz, moonRaDec } from "./moon"
import { SUNRISE_ALTITUDE } from "./sun"

const MIN = 60_000
const HOUR = 3_600_000
const DAY = 24 * HOUR

type Loc = { lat: number; lon: number }

export interface MoonPoint {
	t: number
	alt: number
	az: number
}

export interface MoonPass {
	/** instant of the culmination (highest point), ms */
	transit: number
	maxAlt: number
	maxAz: number
	/** moonrise and moonset in ms, null when the Moon stays up the whole pass (circumpolar) */
	rise: number | null
	set: number | null
	riseAz: number | null
	setAz: number | null
	circumpolar: boolean
	/** the arc, every few minutes, from rise to set (a full revolution when circumpolar) */
	points: MoonPoint[]
}

const altOf = (loc: Loc, t: number) => moonAltAz(loc, t).alt

/** Culminations (local maxima of the altitude) in [from, to], refined with a parabola through three samples. */
function culminations(loc: Loc, from: number, to: number): number[] {
	const STEP = 5 * MIN
	const ts: number[] = []
	const alts: number[] = []
	for (let t = from - STEP; t <= to + STEP; t += STEP) {
		ts.push(t)
		alts.push(altOf(loc, t))
	}
	const found: number[] = []
	for (let i = 1; i < ts.length - 1; i++) {
		if (alts[i] > alts[i - 1] && alts[i] >= alts[i + 1]) {
			const a = alts[i - 1]
			const b = alts[i]
			const c = alts[i + 1]
			const denom = a - 2 * b + c
			const t = ts[i] + (denom !== 0 ? (0.5 * (a - c)) / denom : 0) * STEP
			if (t >= from && t <= to) found.push(t)
		}
	}
	return found
}

/** The whole visible arc around a culmination, or null when that culmination is below the horizon. */
function buildPass(loc: Loc, transit: number): MoonPass | null {
	const top = moonAltAz(loc, transit)
	if (top.alt < SUNRISE_ALTITUDE) return null

	const crossing = (dir: 1 | -1): number | null => {
		const STEP = 2 * MIN
		let prevT = transit
		let prevAlt = top.alt
		for (let dt = STEP; dt <= 14 * HOUR; dt += STEP) {
			const t = transit + dir * dt
			const alt = altOf(loc, t)
			if (alt < SUNRISE_ALTITUDE) {
				const fraction = (prevAlt - SUNRISE_ALTITUDE) / (prevAlt - alt)
				return prevT + dir * fraction * STEP
			}
			prevT = t
			prevAlt = alt
		}
		return null
	}

	const rise = crossing(-1)
	const set = crossing(1)
	const circumpolar = rise === null || set === null
	const from = circumpolar ? transit - 12.42 * HOUR : (rise as number)
	const to = circumpolar ? transit + 12.42 * HOUR : (set as number)
	const n = Math.max(2, Math.ceil((to - from) / (4 * MIN)))
	const points: MoonPoint[] = []
	for (let i = 0; i <= n; i++) {
		const t = from + (i * (to - from)) / n
		const { alt, az } = moonAltAz(loc, t)
		points.push({ t, alt, az })
	}
	return {
		transit,
		maxAlt: top.alt,
		maxAz: top.az,
		rise: circumpolar ? null : rise,
		set: circumpolar ? null : set,
		riseAz: circumpolar ? null : moonAltAz(loc, rise as number).az,
		setAz: circumpolar ? null : moonAltAz(loc, set as number).az,
		circumpolar,
		points,
	}
}

/** The pass of the culmination nearest to an instant. Null when that culmination is below the horizon (high latitudes). */
export function moonPassNear(loc: Loc, ms: number): MoonPass | null {
	const candidates = culminations(loc, ms - 13 * HOUR, ms + 13 * HOUR)
	if (candidates.length === 0) return null
	const nearest = candidates.reduce((best, t) => (Math.abs(t - ms) < Math.abs(best - ms) ? t : best))
	return buildPass(loc, nearest)
}

/**
 * The pass that culminates on a local calendar day (clock of `utcOffset`). About one day a month the
 * Moon does not culminate (its day is 24 h 50 min): then the next pass is returned with `outsideDay` set.
 */
export function moonPassOnDay(
	loc: Loc,
	utcOffset: number,
	year: number,
	month: number,
	day: number,
): { pass: MoonPass | null; outsideDay: boolean } {
	const start = Date.UTC(year, month - 1, day) - utcOffset * HOUR
	const candidates = culminations(loc, start, start + DAY + 2 * HOUR)
	if (candidates.length === 0) return { pass: null, outsideDay: false }
	const transit = candidates[0]
	return { pass: buildPass(loc, transit), outsideDay: transit >= start + DAY }
}

// ---- the monthly declination cycle ---------------------------------------------------------------

export const MOON_REFERENCE_IDS = ["extremo-sur", "cuarto-sur", "nodo", "cuarto-norte", "extremo-norte"] as const
export type MoonReferenceId = (typeof MOON_REFERENCE_IDS)[number]

export interface MoonReference {
	id: MoonReferenceId
	label: string
	color: string
	/** instant, ms */
	t: number
	/** declination in degrees */
	dec: number
}

const REFERENCE_STYLE: { label: string; color: string }[] = [
	{ label: "Extremo sur del mes", color: "#e0343c" },
	{ label: "Cuarto sur", color: "#f2811d" },
	{ label: "Cruce del ecuador", color: "#2ea043" },
	{ label: "Cuarto norte", color: "#4fb8e8" },
	{ label: "Extremo norte del mes", color: "#7c9cff" },
]

const decAt = (t: number) => moonRaDec(t).dec

/** The turning points of the declination within 16 days either side of an instant. */
function declinationExtrema(ms: number): { t: number; dec: number }[] {
	const ts: number[] = []
	const decs: number[] = []
	for (let t = ms - 16 * DAY; t <= ms + 16 * DAY; t += HOUR) {
		ts.push(t)
		decs.push(decAt(t))
	}
	const found: { t: number; dec: number }[] = []
	for (let i = 1; i < ts.length - 1; i++) {
		const a = decs[i - 1]
		const b = decs[i]
		const c = decs[i + 1]
		if ((b > a && b >= c) || (b < a && b <= c)) {
			const denom = a - 2 * b + c
			const t = ts[i] + (denom !== 0 ? (0.5 * (a - c)) / denom : 0) * HOUR
			found.push({ t, dec: decAt(t) })
		}
	}
	return found
}

/** Bisection for f(t) = 0 between two instants where f has opposite signs. */
function root(f: (t: number) => number, a: number, b: number): number {
	let lo = a
	let hi = b
	const fLo = f(lo)
	for (let i = 0; i < 40; i++) {
		const mid = (lo + hi) / 2
		if (f(mid) * fLo > 0) lo = mid
		else hi = mid
	}
	return (lo + hi) / 2
}

/**
 * The five moments of the half cycle that contains `ms`, between the two surrounding declination extremes:
 * the extreme itself, the point halfway to the equator, the equator crossing (the Moon's "equinox"),
 * and the same on the other side. Always returned ordered by declination, south to north, whichever
 * extreme came first in time.
 */
export function moonCycleReferences(ms: number): MoonReference[] {
	const extrema = declinationExtrema(ms)
	const prev = [...extrema].reverse().find((e) => e.t <= ms)
	const next = extrema.find((e) => e.t > ms)
	if (!prev || !next) throw new Error("moonCycleReferences: no declination extremes around the date")
	const node = root(decAt, prev.t, next.t)
	const quarterA = root((t) => decAt(t) - prev.dec / 2, prev.t, node)
	const quarterB = root((t) => decAt(t) - next.dec / 2, node, next.t)
	return [prev.t, quarterA, node, quarterB, next.t]
		.map((t) => ({ t, dec: decAt(t) }))
		.sort((x, y) => x.dec - y.dec)
		.map((event, i) => ({ id: MOON_REFERENCE_IDS[i], ...REFERENCE_STYLE[i], ...event }))
}

// ---- the 18.6-year standstill cycle -------------------------------------------------------------

const OBLIQUITY = 23.44
const INCLINATION = 5.145

/** The Moon's orbit is tilted ~5.1° to the ecliptic, so its extreme declination swings between obliquity ± inclination. */
export const STANDSTILL = {
	obliquity: OBLIQUITY,
	inclination: INCLINATION,
	/** major standstill: the ascending node at the vernal equinox, the Moon reaches ±28.6° */
	major: OBLIQUITY + INCLINATION,
	/** minor standstill: half a cycle (9.3 years) later, only ±18.3° */
	minor: OBLIQUITY - INCLINATION,
}

/** Longitude of the Moon's mean ascending node, degrees 0-360 (Meeus). */
export function lunarNodeLongitude(ms: number): number {
	const T = (ms / 86_400_000 + 2440587.5 - 2451545.0) / 36525
	return (((125.0445479 - 1934.1362891 * T + 0.0020754 * T * T) % 360) + 360) % 360
}

/** The monthly maximum declination predicted by the node's position: obliquity + inclination * cos(node). */
export function expectedMonthlyMaxDeclination(ms: number): number {
	return OBLIQUITY + INCLINATION * Math.cos((lunarNodeLongitude(ms) * Math.PI) / 180)
}

/** The lowest and highest declination the Moon actually reaches in the 28 days from an instant. */
export function monthlyDeclinationRange(ms: number): { min: number; max: number } {
	let min = Infinity
	let max = -Infinity
	for (let t = ms; t <= ms + 28 * DAY; t += HOUR) {
		const dec = decAt(t)
		min = Math.min(min, dec)
		max = Math.max(max, dec)
	}
	return { min, max }
}

/**
 * Solar geometry for the sky chart. Pure functions, degrees in and out (hour angle in degrees too),
 * latitude positive north and longitude positive east. Declination and equation of time use the
 * NOAA / Spencer (1971) Fourier series: about 0.05° and 30 s, a lot better than the Cooper
 * sine approximation (about 0.5°). Azimuth is measured from north, clockwise (N 0°, E 90°, S 180°, O 270°).
 */

const RAD = Math.PI / 180
const DEG = 180 / Math.PI

/** Standard sunrise/sunset altitude: the Sun's semi-diameter plus atmospheric refraction. */
export const SUNRISE_ALTITUDE = -0.833

/** Day of the year, 1-366, from a calendar date. UTC arithmetic: independent of the machine's timezone. */
export function dayOfYear(year: number, month: number, day: number): number {
	return Math.round((Date.UTC(year, month - 1, day) - Date.UTC(year, 0, 1)) / 86_400_000) + 1
}

/** Fractional year in radians (NOAA). `hour` is the hour of the day, 0-24. */
function fractionalYear(doy: number, hour: number): number {
	return ((2 * Math.PI) / 365) * (doy - 1 + (hour - 12) / 24)
}

/** Solar declination in degrees. */
export function solarDeclination(doy: number, hour = 12): number {
	const g = fractionalYear(doy, hour)
	const rad =
		0.006918 -
		0.399912 * Math.cos(g) +
		0.070257 * Math.sin(g) -
		0.006758 * Math.cos(2 * g) +
		0.000907 * Math.sin(2 * g) -
		0.002697 * Math.cos(3 * g) +
		0.00148 * Math.sin(3 * g)
	return rad * DEG
}

/** Equation of time in minutes (apparent solar time minus mean solar time). */
export function equationOfTime(doy: number, hour = 12): number {
	const g = fractionalYear(doy, hour)
	return (
		229.18 *
		(0.000075 +
			0.001868 * Math.cos(g) -
			0.032077 * Math.sin(g) -
			0.014615 * Math.cos(2 * g) -
			0.040849 * Math.sin(2 * g))
	)
}

/** Altitude above the horizon and azimuth of the Sun for a latitude, declination and hour angle (0 = solar noon, negative = morning). */
export function sunAltAz(latDeg: number, decDeg: number, hourAngleDeg: number): { alt: number; az: number } {
	const lat = latDeg * RAD
	const dec = decDeg * RAD
	const h = hourAngleDeg * RAD
	const sinAlt = Math.sin(lat) * Math.sin(dec) + Math.cos(lat) * Math.cos(dec) * Math.cos(h)
	const alt = Math.asin(Math.max(-1, Math.min(1, sinAlt)))
	const denom = Math.cos(alt) * Math.cos(lat)
	// at the zenith or at a pole the azimuth is undefined: report north
	let az = 0
	if (Math.abs(denom) > 1e-12) {
		const cosAz = Math.max(-1, Math.min(1, (Math.sin(dec) - Math.sin(alt) * Math.sin(lat)) / denom))
		az = Math.acos(cosAz) * DEG
		if (hourAngleDeg > 0) az = 360 - az
	}
	return { alt: alt * DEG, az }
}

export type DayKind = "normal" | "polarDay" | "polarNight"

/**
 * Hour angle (degrees, 0-180) at which the Sun crosses `altDeg` going up. `polarDay`: it never sets
 * (hourAngle 180). `polarNight`: it never rises (hourAngle 0).
 */
export function sunriseHourAngle(
	latDeg: number,
	decDeg: number,
	altDeg = SUNRISE_ALTITUDE,
): { kind: DayKind; hourAngle: number } {
	const lat = latDeg * RAD
	const dec = decDeg * RAD
	const num = Math.sin(altDeg * RAD) - Math.sin(lat) * Math.sin(dec)
	const denom = Math.cos(lat) * Math.cos(dec)
	if (Math.abs(denom) < 1e-12) {
		return num < 0 ? { kind: "polarDay", hourAngle: 180 } : { kind: "polarNight", hourAngle: 0 }
	}
	const c = num / denom
	if (c <= -1) return { kind: "polarDay", hourAngle: 180 }
	if (c >= 1) return { kind: "polarNight", hourAngle: 0 }
	return { kind: "normal", hourAngle: Math.acos(c) * DEG }
}

/** Highest altitude the Sun reaches (at solar noon): 90 - |latitude - declination|. */
export function maxAltitude(latDeg: number, decDeg: number): number {
	return 90 - Math.abs(latDeg - decDeg)
}

/** Azimuth of sunrise, or null when there is no sunrise that day. */
export function sunriseAzimuth(latDeg: number, decDeg: number): number | null {
	const { kind, hourAngle } = sunriseHourAngle(latDeg, decDeg)
	if (kind !== "normal") return null
	return sunAltAz(latDeg, decDeg, -hourAngle).az
}

/**
 * Clock time of solar noon, in hours (0-24). `utcOffset` is the clock's offset from UTC in hours
 * (Argentina: -3), longitude positive east.
 */
export function solarNoonClock(lonDeg: number, eotMinutes: number, utcOffset: number): number {
	const timeCorrection = 4 * (lonDeg - 15 * utcOffset) + eotMinutes
	const hours = 12 - timeCorrection / 60
	return ((hours % 24) + 24) % 24
}

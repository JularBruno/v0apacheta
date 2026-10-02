/**
 * The Moon's position and phase. Uses the main periodic terms of Jean Meeus, "Astronomical Algorithms"
 * (chapter 47): good to a few hundredths of a degree, against about 1.7° for the usual one-line
 * approximations. Altitude is topocentric (the Moon is close enough that parallax, up to ~1°, matters).
 * Degrees everywhere; longitude positive east; azimuth from north, clockwise.
 */
import { sunAltAz } from "./sun"

const RAD = Math.PI / 180
const DEG = 180 / Math.PI
const norm360 = (x: number) => ((x % 360) + 360) % 360
const norm180 = (x: number) => ((((x + 180) % 360) + 360) % 360) - 180
const EARTH_RADIUS_KM = 6378.14

export const julianDay = (ms: number) => ms / 86_400_000 + 2440587.5
const centuries = (jd: number) => (jd - 2451545.0) / 36525

// Table 47.A: multiples of [D, M, M', F], then the sine coefficient of the longitude (1e-6 deg)
// and the cosine coefficient of the distance (1e-3 km).
const LON_DIST_TERMS: [number, number, number, number, number, number][] = [
	[0, 0, 1, 0, 6288774, -20905355],
	[2, 0, -1, 0, 1274027, -3699111],
	[2, 0, 0, 0, 658314, -2955968],
	[0, 0, 2, 0, 213618, -569925],
	[0, 1, 0, 0, -185116, 48888],
	[0, 0, 0, 2, -114332, -3149],
	[2, 0, -2, 0, 58793, 246158],
	[2, -1, -1, 0, 57066, -152138],
	[2, 0, 1, 0, 53322, -170733],
	[2, -1, 0, 0, 45758, -204586],
	[0, 1, -1, 0, -40923, -129620],
	[1, 0, 0, 0, -34720, 108743],
	[0, 1, 1, 0, -30383, 104755],
	[2, 0, 0, -2, 15327, 10321],
	[0, 0, 1, 2, -12528, 0],
	[0, 0, 1, -2, 10980, 79661],
	[4, 0, -1, 0, 10675, -34782],
	[0, 0, 3, 0, 10034, -23210],
	[4, 0, -2, 0, 8548, -21636],
	[2, 1, -1, 0, -7888, 24208],
	[2, 1, 0, 0, -6766, 30824],
	[1, 0, -1, 0, -5163, -8379],
	[1, 1, 0, 0, 4987, -16675],
	[2, -1, 1, 0, 4036, -12831],
	[2, 0, 2, 0, 3994, -10445],
	[4, 0, 0, 0, 3861, -11650],
	[2, 0, -3, 0, 3665, 14403],
	[0, 1, -2, 0, -2689, -7003],
	[2, 0, -1, 2, -2602, 0],
	[2, -1, -2, 0, 2390, 10056],
	[1, 0, 1, 0, -2348, 6322],
	[2, -2, 0, 0, 2236, -9884],
]

// Table 47.B: multiples of [D, M, M', F], then the sine coefficient of the latitude (1e-6 deg).
const LAT_TERMS: [number, number, number, number, number][] = [
	[0, 0, 0, 1, 5128122],
	[0, 0, 1, 1, 280602],
	[0, 0, 1, -1, 277693],
	[2, 0, 0, -1, 173237],
	[2, 0, -1, 1, 55413],
	[2, 0, -1, -1, 46271],
	[2, 0, 0, 1, 32573],
	[0, 0, 2, 1, 17198],
	[2, 0, 1, -1, 9266],
	[0, 0, 2, -1, 8822],
	[2, -1, 0, -1, 8216],
	[2, 0, -2, -1, 4324],
	[2, 0, 1, 1, 4200],
	[2, 1, 0, -1, -3359],
	[2, -1, -1, 1, 2463],
	[2, -1, 0, 1, 2211],
	[2, -1, -1, -1, 2065],
	[0, 1, -1, -1, -1870],
	[4, 0, -1, -1, 1828],
	[0, 1, 0, 1, -1794],
	[0, 0, 0, 3, -1749],
	[0, 1, -1, 1, -1565],
	[1, 0, 0, 1, -1491],
	[0, 1, 1, 1, -1475],
	[0, 1, 1, -1, -1410],
	[0, 1, 0, -1, -1344],
	[1, 0, 0, -1, -1335],
	[0, 0, 3, 1, 1107],
	[4, 0, 0, -1, 1021],
	[4, 0, -1, 1, 833],
]

export interface MoonEcliptic {
	/** geocentric ecliptic longitude, degrees 0-360 (mean equinox of date, no nutation) */
	lon: number
	/** ecliptic latitude, degrees */
	lat: number
	/** distance from the Earth's centre, km */
	distance: number
}

/** Ecliptic longitude, latitude and distance of the Moon at a UTC instant (milliseconds). */
export function moonEcliptic(ms: number): MoonEcliptic {
	const T = centuries(julianDay(ms))
	const T2 = T * T
	const T3 = T2 * T
	const T4 = T3 * T
	const Lp = norm360(218.3164477 + 481267.88123421 * T - 0.0015786 * T2 + T3 / 538841 - T4 / 65194000)
	const D = norm360(297.8501921 + 445267.1114034 * T - 0.0018819 * T2 + T3 / 545868 - T4 / 113065000)
	const M = norm360(357.5291092 + 35999.0502909 * T - 0.0001536 * T2 + T3 / 24490000)
	const Mp = norm360(134.9633964 + 477198.8675055 * T + 0.0087414 * T2 + T3 / 69699 - T4 / 14712000)
	const F = norm360(93.272095 + 483202.0175233 * T - 0.0036539 * T2 - T3 / 3526000 + T4 / 863310000)
	const A1 = norm360(119.75 + 131.849 * T)
	const A2 = norm360(53.09 + 479264.29 * T)
	const A3 = norm360(313.45 + 481266.484 * T)
	// the Earth's orbital eccentricity scales the terms that involve the Sun's anomaly M
	const E = 1 - 0.002516 * T - 0.0000074 * T2
	const eFactor = (m: number) => (Math.abs(m) === 1 ? E : Math.abs(m) === 2 ? E * E : 1)

	let sumL = 0
	let sumR = 0
	for (const [d, m, mp, f, l, r] of LON_DIST_TERMS) {
		const arg = (d * D + m * M + mp * Mp + f * F) * RAD
		const e = eFactor(m)
		sumL += l * e * Math.sin(arg)
		sumR += r * e * Math.cos(arg)
	}
	let sumB = 0
	for (const [d, m, mp, f, b] of LAT_TERMS) {
		const arg = (d * D + m * M + mp * Mp + f * F) * RAD
		sumB += b * eFactor(m) * Math.sin(arg)
	}

	// additive terms: Venus, Jupiter and the flattening of the Earth
	sumL += 3958 * Math.sin(A1 * RAD) + 1962 * Math.sin((Lp - F) * RAD) + 318 * Math.sin(A2 * RAD)
	sumB +=
		-2235 * Math.sin(Lp * RAD) +
		382 * Math.sin(A3 * RAD) +
		175 * Math.sin((A1 - F) * RAD) +
		175 * Math.sin((A1 + F) * RAD) +
		127 * Math.sin((Lp - Mp) * RAD) -
		115 * Math.sin((Lp + Mp) * RAD)

	return {
		lon: norm360(Lp + sumL / 1e6),
		lat: sumB / 1e6,
		distance: 385000.56 + sumR / 1000,
	}
}

/** Right ascension and declination (degrees) of the Moon, plus its distance in km. */
export function moonRaDec(ms: number): { ra: number; dec: number; distance: number } {
	const { lon, lat, distance } = moonEcliptic(ms)
	const T = centuries(julianDay(ms))
	const eps = (23.439291 - 0.0130042 * T) * RAD
	const l = lon * RAD
	const b = lat * RAD
	const ra = Math.atan2(Math.sin(l) * Math.cos(eps) - Math.tan(b) * Math.sin(eps), Math.cos(l)) * DEG
	const dec = Math.asin(Math.sin(b) * Math.cos(eps) + Math.cos(b) * Math.sin(eps) * Math.sin(l)) * DEG
	return { ra: norm360(ra), dec, distance }
}

/** The Sun's ecliptic longitude in degrees (Meeus chapter 25, low accuracy, ~0.01°). */
function sunLongitude(ms: number): number {
	const T = centuries(julianDay(ms))
	const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T
	const M = (357.52911 + 35999.05029 * T - 0.0001537 * T * T) * RAD
	const C =
		(1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M) +
		(0.019993 - 0.000101 * T) * Math.sin(2 * M) +
		0.000289 * Math.sin(3 * M)
	return norm360(L0 + C - 0.00569)
}

/** Moon longitude minus Sun longitude, 0-360: 0 new, 90 first quarter, 180 full, 270 last quarter. */
export function moonElongation(ms: number): number {
	return norm360(moonEcliptic(ms).lon - sunLongitude(ms))
}

/** Fraction of the disc that is lit, 0-1. */
export function moonIllumination(ms: number): number {
	return (1 - Math.cos(moonElongation(ms) * RAD)) / 2
}

const PHASES = [
	"Luna nueva",
	"Creciente",
	"Cuarto creciente",
	"Gibosa creciente",
	"Luna llena",
	"Gibosa menguante",
	"Cuarto menguante",
	"Menguante",
]

/** One of the 8 classic phases for an elongation, each ±22.5° wide. */
export function phaseName(elongation: number): string {
	return PHASES[Math.round(norm360(elongation) / 45) % 8]
}

/** The first instant after `ms` when the elongation reaches `target` degrees (0 new, 90, 180 full, 270). */
export function nextPhase(ms: number, target: number): number {
	const HOUR = 3_600_000
	const off = (t: number) => norm180(moonElongation(t) - target)
	let lo = ms
	let prev = off(lo)
	for (let i = 1; i <= 24 * 32; i++) {
		const hi = ms + i * HOUR
		const cur = off(hi)
		// a crossing goes from negative to non-negative; the +/-180 wrap jumps the other way and is ignored
		if (prev < 0 && cur >= 0 && cur < 90) {
			let a = lo
			let b = hi
			for (let k = 0; k < 40; k++) {
				const mid = (a + b) / 2
				if (off(mid) < 0) a = mid
				else b = mid
			}
			return (a + b) / 2
		}
		lo = hi
		prev = cur
	}
	throw new Error("nextPhase: no phase found within 32 days")
}

/** Greenwich mean sidereal time in degrees (Meeus 12.4). */
function gmst(ms: number): number {
	const jd = julianDay(ms)
	const T = centuries(jd)
	return norm360(280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T - (T * T * T) / 38710000)
}

/** Topocentric altitude (parallax removed, refraction not included) and azimuth of the Moon's centre. */
export function moonAltAz(loc: { lat: number; lon: number }, ms: number): { alt: number; az: number } {
	const { ra, dec, distance } = moonRaDec(ms)
	const hourAngle = norm180(gmst(ms) + loc.lon - ra)
	const { alt, az } = sunAltAz(loc.lat, dec, hourAngle)
	const parallax = Math.asin(EARTH_RADIUS_KM / distance) * DEG
	return { alt: alt - parallax * Math.cos(alt * RAD), az }
}

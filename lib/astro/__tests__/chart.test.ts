import {
	ARGENTINA_UTC_OFFSET,
	CORDOBA,
	REFERENCE_CURVES,
	compass,
	curvePoints,
	curveSubtitle,
	formatClock,
	formatDuration,
	hourMarkers,
	parseCoordinate,
	parseUtcOffset,
	project,
	referenceDeclination,
	sunAtClock,
	sunDay,
} from "../chart"
import { dayOfYear, solarNoonClock, equationOfTime } from "../sun"

const doy = (m: number, d: number) => dayOfYear(2026, m, d)
const clockToHours = (s: string) => {
	const [h, m] = s.split(":").map(Number)
	return h + m / 60
}

describe("project (polar sky chart: zenith in the centre, north up, east on the left)", () => {
	test("the zenith is the centre and the horizon is the outer circle", () => {
		expect(project(90, 123)).toEqual({ x: 500, y: 500 })
		const north = project(0, 0)
		expect(north.x).toBeCloseTo(500, 6)
		expect(north.y).toBeCloseTo(70, 6)
	})

	test("east is on the left, south at the bottom and west on the right", () => {
		const east = project(0, 90)
		const south = project(0, 180)
		const west = project(0, 270)
		expect(east.x).toBeCloseTo(70, 6)
		expect(east.y).toBeCloseTo(500, 6)
		expect(south.y).toBeCloseTo(930, 6)
		expect(west.x).toBeCloseTo(930, 6)
	})
})

describe("compass", () => {
	test("names the 8 points and wraps around", () => {
		expect(
			[0, 45, 90, 135, 180, 225, 270, 315, 359, -10].map(compass),
		).toEqual(["N", "NE", "E", "SE", "S", "SO", "O", "NO", "N", "N"])
	})
})

describe("formatClock / formatDuration", () => {
	test("formats hours as HH:MM and wraps at midnight", () => {
		expect(formatClock(13.25)).toBe("13:15")
		expect(formatClock(0.5)).toBe("00:30")
		expect(formatClock(24)).toBe("00:00")
		expect(formatClock(23.999)).toBe("00:00")
		expect(formatClock(-0.5)).toBe("23:30")
	})

	test("formats a day length", () => {
		expect(formatDuration(14.2)).toBe("14 h 12 min")
		expect(formatDuration(12)).toBe("12 h 00 min")
		expect(formatDuration(0)).toBe("0 h 00 min")
	})
})

describe("parseCoordinate / parseUtcOffset (what people type in the inputs)", () => {
	test("accepts dot or comma decimals and surrounding spaces", () => {
		expect(parseCoordinate("-31.42", 90)).toBe(-31.42)
		expect(parseCoordinate("-31,42", 90)).toBe(-31.42)
		expect(parseCoordinate("  40 ", 90)).toBe(40)
		expect(parseCoordinate("+0,5", 90)).toBe(0.5)
	})

	test("rejects empty, text, hex, exponents and out-of-range values", () => {
		for (const bad of ["", "  ", "abc", "0x10", "1e1", "31.4.2", "91", "-90.5", "--3"]) {
			expect(parseCoordinate(bad, 90)).toBeNull()
		}
		expect(parseCoordinate("181", 180)).toBeNull()
		expect(parseCoordinate("180", 180)).toBe(180)
	})

	test("UTC offsets go from -12 to +14, half hours allowed", () => {
		expect(parseUtcOffset("-3")).toBe(-3)
		expect(parseUtcOffset("5,5")).toBe(5.5)
		expect(parseUtcOffset("14")).toBe(14)
		expect(parseUtcOffset("15")).toBeNull()
		expect(parseUtcOffset("-13")).toBeNull()
		expect(parseUtcOffset("x")).toBeNull()
	})
})

describe("reference curves", () => {
	test("are the 7 groups of the original chart, in order from the December solstice to the June one", () => {
		expect(REFERENCE_CURVES.map((c) => c.id)).toEqual([
			"solsticio-diciembre",
			"nov-ene",
			"oct-feb",
			"equinoccios",
			"ago-abr",
			"jul-may",
			"solsticio-junio",
		])
	})

	test("declinations: solstices at +-23.4°, the equinox curve at exactly 0°, pairs in between", () => {
		const dec = (id: string) => referenceDeclination(REFERENCE_CURVES.find((c) => c.id === id)!, 2026)
		expect(dec("solsticio-diciembre")).toBeCloseTo(-23.44, 1)
		expect(dec("solsticio-junio")).toBeCloseTo(23.44, 1)
		expect(dec("equinoccios")).toBe(0)
		expect(dec("nov-ene")).toBeGreaterThan(-20.6)
		expect(dec("nov-ene")).toBeLessThan(-19.2)
		expect(dec("oct-feb")).toBeGreaterThan(-12.5)
		expect(dec("oct-feb")).toBeLessThan(-10.5)
		expect(dec("ago-abr")).toBeGreaterThan(10.5)
		expect(dec("jul-may")).toBeGreaterThan(19.2)
	})

	test("the subtitle follows the hemisphere: December is summer in the south and winter in the north", () => {
		const dec = REFERENCE_CURVES[0]
		const jun = REFERENCE_CURVES[6]
		expect(curveSubtitle(dec, -31.42)).toBe("Solsticio de verano")
		expect(curveSubtitle(jun, -31.42)).toBe("Solsticio de invierno")
		expect(curveSubtitle(dec, 40)).toBe("Solsticio de invierno")
		expect(curveSubtitle(jun, 40)).toBe("Solsticio de verano")
		expect(curveSubtitle(REFERENCE_CURVES[3], 10)).toBe("Equinoccios")
		expect(curveSubtitle(REFERENCE_CURVES[1], 10)).toBeNull()
	})
})

describe("sunDay for Córdoba (the default location)", () => {
	test("December solstice: sunrise SE, 82° at noon, a 14 h 12 min day, sunrise ~06:09 and sunset ~20:21 ART", () => {
		const day = sunDay(CORDOBA, doy(12, 21), ARGENTINA_UTC_OFFSET)
		expect(day.kind).toBe("normal")
		expect(day.riseAz).toBeCloseTo(118.4, 0)
		expect(day.setAz).toBeCloseTo(360 - 118.4, 0)
		expect(day.maxAlt).toBeCloseTo(82.0, 0)
		expect(day.dayLength).toBeCloseTo(14.2, 1)
		expect(Math.abs((day.sunrise as number) - clockToHours("06:09"))).toBeLessThan(0.15)
		expect(Math.abs((day.sunset as number) - clockToHours("20:21"))).toBeLessThan(0.15)
	})

	test("June solstice: sunrise NE, 35° at noon, a ~10 h day", () => {
		const day = sunDay(CORDOBA, doy(6, 21), ARGENTINA_UTC_OFFSET)
		expect(day.riseAz).toBeCloseTo(62.8, 0)
		expect(day.maxAlt).toBeCloseTo(35.1, 0)
		expect(day.dayLength).toBeCloseTo(10.0, 0)
	})

	test("solar noon matches solarNoonClock and the declination can be overridden for the reference curves", () => {
		const day = sunDay(CORDOBA, doy(3, 21), ARGENTINA_UTC_OFFSET, 0)
		expect(day.dec).toBe(0)
		expect(day.maxAlt).toBeCloseTo(58.58, 1)
		expect(day.noon).toBeCloseTo(solarNoonClock(CORDOBA.lon, equationOfTime(doy(3, 21)), ARGENTINA_UTC_OFFSET), 6)
	})
})

describe("sunDay at extreme coordinates", () => {
	test("polar day: no sunrise or sunset, a 24 h day", () => {
		const day = sunDay({ lat: 80, lon: 0 }, doy(6, 21), 0)
		expect(day.kind).toBe("polarDay")
		expect(day.sunrise).toBeNull()
		expect(day.sunset).toBeNull()
		expect(day.riseAz).toBeNull()
		expect(day.dayLength).toBe(24)
	})

	test("polar night: no sunrise, a 0 h day", () => {
		const day = sunDay({ lat: 80, lon: 0 }, doy(12, 21), 0)
		expect(day.kind).toBe("polarNight")
		expect(day.sunrise).toBeNull()
		expect(day.dayLength).toBe(0)
	})

	test("the poles never produce NaN", () => {
		for (const lat of [90, -90]) {
			const day = sunDay({ lat, lon: 0 }, doy(3, 21), 0)
			for (const value of [day.dec, day.noon, day.maxAlt, day.dayLength]) expect(Number.isNaN(value)).toBe(false)
		}
	})
})

describe("curvePoints / hourMarkers", () => {
	test("Córdoba in December: from the SE horizon up to ~82° and down to the SO horizon", () => {
		const dec = referenceDeclination(REFERENCE_CURVES[0], 2026)
		const pts = curvePoints(CORDOBA, dec)
		expect(pts.length).toBeGreaterThan(250)
		expect(pts[0].az).toBeCloseTo(118.4, 0)
		expect(pts[pts.length - 1].az).toBeCloseTo(360 - 118.4, 0)
		expect(Math.max(...pts.map((p) => p.alt))).toBeCloseTo(82.0, 0)
		expect(pts[0].alt).toBeCloseTo(-0.833, 2)
	})

	test("polar day draws a closed loop and polar night draws nothing", () => {
		const loop = curvePoints({ lat: 80, lon: 0 }, 23.4)
		expect(loop.length).toBeGreaterThan(400)
		expect(Math.min(...loop.map((p) => p.alt))).toBeGreaterThan(0)
		expect(curvePoints({ lat: 80, lon: 0 }, -23.4)).toEqual([])
	})

	test("hour markers are the whole solar hours between sunrise and sunset", () => {
		const dec = referenceDeclination(REFERENCE_CURVES[0], 2026)
		const markers = hourMarkers(CORDOBA, dec)
		expect(markers[0].solarHour).toBe(5)
		expect(markers[markers.length - 1].solarHour).toBe(19)
		expect(markers).toHaveLength(15)
		for (const m of markers) expect(m.alt).toBeGreaterThanOrEqual(-0.833 - 1e-6)
	})
})

describe("sunAtClock", () => {
	const day = doy(12, 21)

	test("at the clock time of solar noon the Sun is north of Córdoba at its maximum altitude", () => {
		const noon = solarNoonClock(CORDOBA.lon, equationOfTime(day), ARGENTINA_UTC_OFFSET)
		const sun = sunAtClock(CORDOBA, day, ARGENTINA_UTC_OFFSET, noon)
		expect(sun.alt).toBeCloseTo(82.0, 0)
		expect(Math.min(sun.az, 360 - sun.az)).toBeLessThan(1)
	})

	test("it is below the horizon at 03:00 and in the east/south-east at 07:00", () => {
		expect(sunAtClock(CORDOBA, day, ARGENTINA_UTC_OFFSET, 3).alt).toBeLessThan(0)
		const morning = sunAtClock(CORDOBA, day, ARGENTINA_UTC_OFFSET, 7)
		expect(morning.alt).toBeGreaterThan(0)
		expect(morning.az).toBeGreaterThan(60)
		expect(morning.az).toBeLessThan(150)
	})

	test("works for any hour value, including 24", () => {
		const a = sunAtClock(CORDOBA, day, ARGENTINA_UTC_OFFSET, 0)
		const b = sunAtClock(CORDOBA, day, ARGENTINA_UTC_OFFSET, 24)
		expect(a.alt).toBeCloseTo(b.alt, 6)
	})
})

import {
	dayOfYear,
	equationOfTime,
	maxAltitude,
	solarDeclination,
	solarNoonClock,
	sunAltAz,
	sunriseAzimuth,
	sunriseHourAngle,
} from "../sun"

const CORDOBA = { lat: -31.42, lon: -64.18 }
const ART = -3

// Declination at local noon of a calendar date (year 2026).
const decOn = (m: number, d: number) => solarDeclination(dayOfYear(2026, m, d))

describe("dayOfYear", () => {
	test("counts from 1 on January 1 and does not depend on the machine's timezone", () => {
		expect(dayOfYear(2026, 1, 1)).toBe(1)
		expect(dayOfYear(2026, 12, 31)).toBe(365)
		expect(dayOfYear(2028, 12, 31)).toBe(366)
		expect(dayOfYear(2026, 3, 1)).toBe(60)
	})
})

describe("solarDeclination (NOAA series)", () => {
	test("is about +23.44° at the June solstice and -23.44° at the December one", () => {
		expect(decOn(6, 21)).toBeCloseTo(23.44, 1)
		expect(decOn(12, 21)).toBeCloseTo(-23.44, 1)
	})

	test("is within about a day of change (0.4°/day) of zero at the equinoxes", () => {
		// the series is a mean-year model, so a fixed calendar date can be up to ~1 day off the true equinox
		expect(Math.abs(decOn(3, 20))).toBeLessThan(0.5)
		expect(Math.abs(decOn(9, 23))).toBeLessThan(0.5)
	})

	test("changes smoothly through the day: the later hour is a little further along", () => {
		const doy = dayOfYear(2026, 3, 1)
		expect(solarDeclination(doy, 18)).toBeGreaterThan(solarDeclination(doy, 6))
	})
})

describe("equationOfTime", () => {
	test("peaks at about -14.2 min in mid February and +16.4 min in early November", () => {
		expect(equationOfTime(dayOfYear(2026, 2, 11))).toBeCloseTo(-14.2, 0)
		expect(equationOfTime(dayOfYear(2026, 11, 3))).toBeCloseTo(16.4, 0)
	})

	test("is near zero around April 15 and September 1", () => {
		expect(Math.abs(equationOfTime(dayOfYear(2026, 4, 15)))).toBeLessThan(1)
		expect(Math.abs(equationOfTime(dayOfYear(2026, 9, 1)))).toBeLessThan(1)
	})
})

describe("maxAltitude (textbook: 90 - |latitude - declination|)", () => {
	test("Córdoba: 82.0° at the summer solstice, 58.6° at the equinox, 35.1° at the winter solstice", () => {
		expect(maxAltitude(CORDOBA.lat, -23.44)).toBeCloseTo(82.02, 1)
		expect(maxAltitude(CORDOBA.lat, 0)).toBeCloseTo(58.58, 1)
		expect(maxAltitude(CORDOBA.lat, 23.44)).toBeCloseTo(35.14, 1)
	})
})

describe("sunAltAz", () => {
	test("at solar noon in the southern hemisphere the Sun is due north, at the maximum altitude", () => {
		const { alt, az } = sunAltAz(CORDOBA.lat, 0, 0)
		expect(alt).toBeCloseTo(58.58, 1)
		expect(Math.min(az, 360 - az)).toBeLessThan(0.01)
	})

	test("the morning Sun is on the east side (az < 180) and the afternoon Sun on the west side (az > 180)", () => {
		expect(sunAltAz(CORDOBA.lat, 0, -45).az).toBeLessThan(180)
		expect(sunAltAz(CORDOBA.lat, 0, 45).az).toBeGreaterThan(180)
	})

	test("at the equator on an equinox the noon Sun is at the zenith", () => {
		expect(sunAltAz(0, 0, 0).alt).toBeCloseTo(90, 5)
	})

	test("in the northern hemisphere the noon Sun is due south", () => {
		expect(sunAltAz(40, 0, 0).az).toBeCloseTo(180, 3)
	})
})

describe("sunriseHourAngle and sunriseAzimuth", () => {
	// Sunrise is the official one (Sun's center at -0.833°, refraction included), which sits ~0.6° of azimuth
	// further along the horizon than the geometric 117.8° / 62.2°.
	test("Córdoba at the December solstice: sunrise in the south-east, a ~14 h 20 min day", () => {
		const { kind, hourAngle } = sunriseHourAngle(CORDOBA.lat, -23.44)
		expect(kind).toBe("normal")
		expect((2 * hourAngle) / 15).toBeCloseTo(14.2, 0)
		expect(sunriseAzimuth(CORDOBA.lat, -23.44)).toBeCloseTo(118.4, 0)
	})

	test("Córdoba at the June solstice: sunrise in the north-east, a ~10 h day", () => {
		const { hourAngle } = sunriseHourAngle(CORDOBA.lat, 23.44)
		expect((2 * hourAngle) / 15).toBeCloseTo(10.0, 0)
		expect(sunriseAzimuth(CORDOBA.lat, 23.44)).toBeCloseTo(62.8, 0)
	})

	test("on an equinox the Sun rises within 1° of due east and the day lasts about 12 h", () => {
		const { hourAngle } = sunriseHourAngle(CORDOBA.lat, 0)
		expect((2 * hourAngle) / 15).toBeGreaterThan(12)
		expect((2 * hourAngle) / 15).toBeLessThan(12.3)
		expect(Math.abs((sunriseAzimuth(CORDOBA.lat, 0) as number) - 90)).toBeLessThan(1)
	})

	test("polar day, polar night and the poles are reported, never NaN", () => {
		expect(sunriseHourAngle(80, 20).kind).toBe("polarDay")
		expect(sunriseHourAngle(-80, 20).kind).toBe("polarNight")
		expect(sunriseHourAngle(90, 10).kind).toBe("polarDay")
		expect(sunriseHourAngle(90, -10).kind).toBe("polarNight")
		expect(sunriseAzimuth(80, 20)).toBeNull()
		expect(sunriseAzimuth(90, 10)).toBeNull()
		expect(Number.isNaN(sunriseHourAngle(-90, 0).hourAngle)).toBe(false)
	})
})

describe("solarNoonClock (clock time of solar noon, hours)", () => {
	const noon = (m: number, d: number) =>
		solarNoonClock(CORDOBA.lon, equationOfTime(dayOfYear(2026, m, d)), ART)

	test("Córdoba is far west of its time zone's meridian, so solar noon falls between 13:00 and 13:35 ART", () => {
		for (const [m, d] of [[2, 11], [3, 21], [6, 21], [9, 23], [11, 3], [12, 21]]) {
			expect(noon(m, d)).toBeGreaterThan(13)
			expect(noon(m, d)).toBeLessThan(13.6)
		}
	})

	test("is latest in mid February (~13:31) and earliest in early November (~13:00)", () => {
		expect(noon(2, 11)).toBeCloseTo(13 + 31 / 60, 1)
		expect(noon(11, 3)).toBeCloseTo(13.0, 1)
	})

	test("stays inside 0..24 whatever the offset", () => {
		const t = solarNoonClock(170, 0, -12)
		expect(t).toBeGreaterThanOrEqual(0)
		expect(t).toBeLessThan(24)
	})
})

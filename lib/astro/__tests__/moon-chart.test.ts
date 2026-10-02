import { moonAltAz, moonRaDec } from "../moon"
import {
	MOON_REFERENCE_IDS,
	STANDSTILL,
	expectedMonthlyMaxDeclination,
	moonCycleReferences,
	moonPassNear,
	moonPassOnDay,
	monthlyDeclinationRange,
} from "../moon-chart"

const CORDOBA = { lat: -31.42, lon: -64.18 }
const ART = -3
const HOUR = 3_600_000
const utc = (iso: string) => Date.parse(iso)
const dayOf = (offsetDays: number) => {
	const d = new Date(Date.UTC(2026, 9, 2 + offsetDays))
	return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, d: d.getUTCDate() }
}
const midnightArt = (y: number, m: number, d: number) => Date.UTC(y, m - 1, d) - ART * HOUR

describe("moonPassNear: a complete arc from moonrise to moonset", () => {
	const noon = utc("2026-10-02T15:00:00Z")

	test("rises, culminates and sets in that order, with ~-0.83° at the horizon crossings", () => {
		for (let day = 0; day < 30; day++) {
			const pass = moonPassNear(CORDOBA, noon + day * 24 * HOUR)
			expect(pass).not.toBeNull()
			if (!pass || pass.circumpolar) continue
			expect(pass.rise as number).toBeLessThan(pass.transit)
			expect(pass.transit).toBeLessThan(pass.set as number)
			expect(Math.abs(moonAltAz(CORDOBA, pass.rise as number).alt - -0.833)).toBeLessThan(0.15)
			expect(Math.abs(moonAltAz(CORDOBA, pass.set as number).alt - -0.833)).toBeLessThan(0.15)
		}
	})

	test("the points run from the rise to the set and peak at the culmination", () => {
		const pass = moonPassNear(CORDOBA, noon)!
		expect(pass.points[0].t).toBeCloseTo(pass.rise as number, -4)
		expect(pass.points[pass.points.length - 1].t).toBeCloseTo(pass.set as number, -4)
		expect(Math.max(...pass.points.map((p) => p.alt))).toBeCloseTo(pass.maxAlt, 0)
		for (const p of pass.points) expect(p.alt).toBeGreaterThan(-1)
	})

	test("is visible 8 to 16 hours from Córdoba and culminates in the north (the Moon never gets as far south as the zenith there)", () => {
		for (let day = 0; day < 30; day++) {
			const pass = moonPassNear(CORDOBA, noon + day * 24 * HOUR)!
			const hours = ((pass.set as number) - (pass.rise as number)) / HOUR
			expect(hours).toBeGreaterThan(8)
			expect(hours).toBeLessThan(16)
			expect(Math.min(pass.maxAz, 360 - pass.maxAz)).toBeLessThan(40)
		}
	})

	test("moonrise comes about 50 minutes later each day on average", () => {
		const rises: number[] = []
		for (let day = 0; day < 20; day++) rises.push(moonPassNear(CORDOBA, noon + day * 24 * HOUR)!.rise as number)
		const gaps = rises.slice(1).map((r, i) => (r - rises[i]) / 60_000 - 24 * 60)
		const mean = gaps.reduce((a, b) => a + b, 0) / gaps.length
		expect(mean).toBeGreaterThan(35)
		expect(mean).toBeLessThan(65)
	})

	test("at 80° N the Moon is sometimes up all day (circumpolar) and sometimes never rises (null), and never NaN", () => {
		const loc = { lat: 80, lon: 0 }
		const results = Array.from({ length: 30 }, (_, day) => moonPassNear(loc, noon + day * 24 * HOUR))
		expect(results.some((r) => r === null)).toBe(true)
		const circumpolar = results.filter((r) => r && r.circumpolar)
		expect(circumpolar.length).toBeGreaterThan(0)
		for (const r of circumpolar) {
			expect(r!.rise).toBeNull()
			expect(r!.points.length).toBeGreaterThan(100)
			for (const p of r!.points) expect(Number.isNaN(p.alt)).toBe(false)
		}
	})
})

describe("moonPassOnDay (the arc that culminates on a local calendar day)", () => {
	test("the culmination is inside the local day, except on the one day a month with no culmination", () => {
		let outside = 0
		for (let day = 0; day < 60; day++) {
			const { y, m, d } = dayOf(day)
			const { pass, outsideDay } = moonPassOnDay(CORDOBA, ART, y, m, d)
			expect(pass).not.toBeNull()
			const start = midnightArt(y, m, d)
			if (outsideDay) {
				outside++
				expect((pass as { transit: number }).transit).toBeGreaterThanOrEqual(start + 24 * HOUR)
			} else {
				expect((pass as { transit: number }).transit).toBeGreaterThanOrEqual(start)
				expect((pass as { transit: number }).transit).toBeLessThan(start + 24 * HOUR)
			}
		}
		// the lunar day is 24 h 50 min, so about one day in 29.5 has no culmination: 60 days hold 1 to 3
		expect(outside).toBeGreaterThanOrEqual(1)
		expect(outside).toBeLessThanOrEqual(3)
	})

	test("works on today's date (2 Oct 2026), the day the original file collapsed", () => {
		const { pass } = moonPassOnDay(CORDOBA, ART, 2026, 10, 2)
		expect(pass).not.toBeNull()
		expect((pass as { maxAlt: number }).maxAlt).toBeGreaterThan(20)
	})
})

describe("moonCycleReferences (the five reference curves of the monthly declination cycle)", () => {
	test("are always ordered from the southern extreme to the northern one, with no label swapped", () => {
		for (let day = 0; day < 120; day++) {
			const refs = moonCycleReferences(utc("2026-10-02T15:00:00Z") + day * 24 * HOUR)
			expect(refs.map((r) => r.id)).toEqual([...MOON_REFERENCE_IDS])
			for (let i = 1; i < refs.length; i++) expect(refs[i].dec).toBeGreaterThan(refs[i - 1].dec)
			expect(refs[0].dec).toBeLessThan(-17)
			expect(refs[4].dec).toBeGreaterThan(17)
			expect(Math.abs(refs[2].dec)).toBeLessThan(1)
			expect(refs[1].dec).toBeLessThan(0)
			expect(refs[3].dec).toBeGreaterThan(0)
		}
	})

	test("do not collapse onto a single curve when the Moon is at a declination extreme (2 Oct 2026)", () => {
		const refs = moonCycleReferences(utc("2026-10-02T15:00:00Z"))
		expect(refs[0].dec).toBeLessThan(-25)
		expect(refs[4].dec).toBeGreaterThan(25)
		expect(new Set(refs.map((r) => Math.round(r.dec))).size).toBe(5)
	})

	test("the extremes are real turning points of the declination", () => {
		const refs = moonCycleReferences(utc("2026-10-02T15:00:00Z"))
		for (const extreme of [refs[0], refs[4]]) {
			const before = Math.abs(moonRaDec(extreme.t - 4 * HOUR).dec)
			const after = Math.abs(moonRaDec(extreme.t + 4 * HOUR).dec)
			expect(Math.abs(extreme.dec)).toBeGreaterThanOrEqual(before - 1e-6)
			expect(Math.abs(extreme.dec)).toBeGreaterThanOrEqual(after - 1e-6)
		}
	})

	test("the half cycle contains the chosen date and spans about two weeks", () => {
		const ms = utc("2026-10-20T15:00:00Z")
		const refs = moonCycleReferences(ms)
		const times = refs.map((r) => r.t)
		expect(Math.min(...times)).toBeLessThanOrEqual(ms)
		expect(Math.max(...times)).toBeGreaterThan(ms)
		const spanDays = (Math.max(...times) - Math.min(...times)) / (24 * HOUR)
		expect(spanDays).toBeGreaterThan(12)
		expect(spanDays).toBeLessThan(15)
	})
})

describe("the 18.6-year standstill cycle", () => {
	test("the extreme declinations are the obliquity plus or minus the orbit's 5.1° inclination", () => {
		expect(STANDSTILL.major).toBeCloseTo(28.585, 2)
		expect(STANDSTILL.minor).toBeCloseTo(18.295, 2)
	})

	test("the formula follows the real monthly maximum: ~28.6° at the 2025 peak, ~23° in 2030, ~18.3° at the 2034 minimum", () => {
		for (const [iso, tolerance] of [
			["2025-02-01", 0.3],
			["2026-10-02", 0.3],
			["2030-01-01", 0.8],
			["2034-05-15", 0.3],
		] as const) {
			const ms = utc(`${iso}T12:00:00Z`)
			expect(Math.abs(expectedMonthlyMaxDeclination(ms) - monthlyDeclinationRange(ms).max)).toBeLessThan(tolerance)
		}
	})

	test("monthlyDeclinationRange is symmetric-ish: min is about minus max", () => {
		const range = monthlyDeclinationRange(utc("2026-10-02T12:00:00Z"))
		expect(range.max).toBeGreaterThan(27)
		expect(range.min).toBeLessThan(-27)
	})
})

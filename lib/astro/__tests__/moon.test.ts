import {
	julianDay,
	moonAltAz,
	moonEcliptic,
	moonRaDec,
	moonElongation,
	moonIllumination,
	nextPhase,
	phaseName,
} from "../moon"

const CORDOBA = { lat: -31.42, lon: -64.18 }
const utc = (iso: string) => Date.parse(iso)
const wrap180 = (x: number) => ((((x + 180) % 360) + 360) % 360) - 180

describe("julianDay", () => {
	test("matches the reference epochs", () => {
		expect(julianDay(utc("2000-01-01T12:00:00Z"))).toBeCloseTo(2451545.0, 6)
		expect(julianDay(utc("1992-04-12T00:00:00Z"))).toBeCloseTo(2448724.5, 6)
	})
})

// Jean Meeus, Astronomical Algorithms, example 47.a: the Moon on 1992 April 12 at 0h TD.
// Published: longitude 133.162655° (apparent), latitude -3.229126°, distance 368409.7 km,
// right ascension 134.688470°, declination +13.768368°.
describe("moon position against Meeus's worked example 47.a", () => {
	const t = utc("1992-04-12T00:00:00Z")

	test("ecliptic longitude, latitude and distance", () => {
		const m = moonEcliptic(t)
		expect(Math.abs(wrap180(m.lon - 133.162655))).toBeLessThan(0.03)
		expect(Math.abs(m.lat - -3.229126)).toBeLessThan(0.02)
		expect(Math.abs(m.distance - 368409.7)).toBeLessThan(400)
	})

	test("right ascension and declination", () => {
		const m = moonRaDec(t)
		expect(Math.abs(wrap180(m.ra - 134.68847))).toBeLessThan(0.04)
		expect(Math.abs(m.dec - 13.768368)).toBeLessThan(0.03)
	})
})

describe("phases against the real 2026 eclipses (UTC)", () => {
	// A solar eclipse happens at new moon and a lunar eclipse at full moon, so the elongation
	// (Moon longitude minus Sun longitude) must be near 0° and near 180° at those moments.
	// The greatest-eclipse time can be a few tens of minutes from the exact conjunction (0.55°/h), so allow 0.4°.
	test("new moon at the total solar eclipse of 12 Aug 2026 (17:46)", () => {
		expect(Math.abs(wrap180(moonElongation(utc("2026-08-12T17:46:00Z"))))).toBeLessThan(0.4)
	})

	test("full moon at the total lunar eclipse of 3 Mar 2026 (11:33)", () => {
		expect(Math.abs(wrap180(moonElongation(utc("2026-03-03T11:33:00Z")) - 180))).toBeLessThan(0.4)
	})

	test("full moon at the partial lunar eclipse of 28 Aug 2026 (04:13)", () => {
		expect(Math.abs(wrap180(moonElongation(utc("2026-08-28T04:13:00Z")) - 180))).toBeLessThan(0.4)
	})
})

describe("moonIllumination", () => {
	test("is ~0 at new moon, ~1 at full moon and 0.5 at the quarters", () => {
		expect(moonIllumination(utc("2026-08-12T17:46:00Z"))).toBeLessThan(0.001)
		expect(moonIllumination(utc("2026-03-03T11:33:00Z"))).toBeGreaterThan(0.999)
		const quarter = nextPhase(utc("2026-08-01T00:00:00Z"), 90)
		expect(moonIllumination(quarter)).toBeCloseTo(0.5, 2)
	})
})

describe("phaseName (the 8 classic phases, 45° each)", () => {
	test("names every phase", () => {
		expect([0, 45, 90, 135, 180, 225, 270, 315].map(phaseName)).toEqual([
			"Luna nueva",
			"Creciente",
			"Cuarto creciente",
			"Gibosa creciente",
			"Luna llena",
			"Gibosa menguante",
			"Cuarto menguante",
			"Menguante",
		])
	})

	test("the windows are ±22.5° wide and wrap around 360°", () => {
		expect(phaseName(22.4)).toBe("Luna nueva")
		expect(phaseName(22.6)).toBe("Creciente")
		expect(phaseName(359)).toBe("Luna nueva")
		expect(phaseName(-10)).toBe("Luna nueva")
	})
})

describe("nextPhase", () => {
	test("finds the August 2026 new moon (published 17:37 UTC) and the March 2026 full moon (~11:38 UTC)", () => {
		const newMoon = nextPhase(utc("2026-08-01T00:00:00Z"), 0)
		expect(Math.abs(newMoon - utc("2026-08-12T17:37:00Z"))).toBeLessThan(30 * 60_000)
		const fullMoon = nextPhase(utc("2026-02-20T00:00:00Z"), 180)
		expect(Math.abs(fullMoon - utc("2026-03-03T11:38:00Z"))).toBeLessThan(30 * 60_000)
	})

	test("is always after the start, and consecutive new moons are 29.2 to 29.9 days apart", () => {
		let t = utc("2026-01-01T00:00:00Z")
		for (let i = 0; i < 12; i++) {
			const next = nextPhase(t, 0)
			expect(next).toBeGreaterThan(t)
			if (i > 0) {
				const gapDays = (next - t) / 86_400_000
				expect(gapDays).toBeGreaterThan(29.2)
				expect(gapDays).toBeLessThan(29.9)
			}
			t = next + 60_000
		}
	})

	test("the elongation really is the target at the returned time", () => {
		for (const target of [0, 90, 180, 270]) {
			const t = nextPhase(utc("2026-10-02T12:00:00Z"), target)
			expect(Math.abs(wrap180(moonElongation(t) - target))).toBeLessThan(0.01)
		}
	})
})

describe("moonAltAz (topocentric, from Córdoba)", () => {
	test("at its daily highest point the Moon is north of Córdoba and no higher than 90° - |lat - dec| (parallax lowers it)", () => {
		const day = utc("2026-10-03T00:00:00Z")
		let best = { alt: -99, az: 0, t: 0 }
		for (let m = 0; m < 1440; m += 5) {
			const t = day + m * 60_000
			const { alt, az } = moonAltAz(CORDOBA, t)
			if (alt > best.alt) best = { alt, az, t }
		}
		const { dec } = moonRaDec(best.t)
		const ceiling = 90 - Math.abs(CORDOBA.lat - dec)
		expect(best.alt).toBeLessThanOrEqual(ceiling + 0.2)
		expect(best.alt).toBeGreaterThan(ceiling - 1.3)
		expect(Math.min(best.az, 360 - best.az)).toBeLessThan(25)
	})

	test("the azimuth is between 0 and 360", () => {
		for (let h = 0; h < 48; h++) {
			const { az } = moonAltAz(CORDOBA, utc("2026-10-02T00:00:00Z") + h * 3_600_000)
			expect(az).toBeGreaterThanOrEqual(0)
			expect(az).toBeLessThan(360)
		}
	})
})

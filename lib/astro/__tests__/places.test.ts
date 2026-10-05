import { CORDOBA, parseCoordinate } from "../chart"
import { PLACES, findPlace, zoneUtcOffset } from "../places"

describe("PLACES (the quick-pick buttons above the chart)", () => {
	test("start with Córdoba, then Noruega and Antártida", () => {
		expect(PLACES.map((p) => p.label)).toEqual(["Córdoba", "Noruega", "Antártida"])
		expect(PLACES.map((p) => p.id)).toEqual(["cordoba", "noruega", "antartida"])
	})

	test("Córdoba is the same place the chart uses by default", () => {
		expect(PLACES[0].lat).toBe(CORDOBA.lat)
		expect(PLACES[0].lon).toBe(CORDOBA.lon)
		expect(PLACES[0].name).toBe(CORDOBA.name)
	})

	test("every place has valid coordinates, a real IANA time zone and a fallback offset", () => {
		for (const place of PLACES) {
			expect(parseCoordinate(String(place.lat), 90)).toBe(place.lat)
			expect(parseCoordinate(String(place.lon), 180)).toBe(place.lon)
			expect(zoneUtcOffset(place.timeZone, 2026, 6, 21)).not.toBeNull()
			expect(place.utcOffset).toBeGreaterThanOrEqual(-12)
			expect(place.utcOffset).toBeLessThanOrEqual(14)
			expect(place.blurb.length).toBeGreaterThan(10)
		}
	})

	test("Noruega is above the Arctic Circle and Antártida inside the Antarctic one, so both have polar day and night", () => {
		const norway = PLACES.find((p) => p.id === "noruega")!
		const antarctica = PLACES.find((p) => p.id === "antartida")!
		expect(norway.lat).toBeGreaterThan(66.56)
		expect(antarctica.lat).toBeLessThan(-66.56)
	})

	test("ids and labels are unique", () => {
		expect(new Set(PLACES.map((p) => p.id)).size).toBe(PLACES.length)
		expect(new Set(PLACES.map((p) => p.label)).size).toBe(PLACES.length)
	})
})

describe("zoneUtcOffset (the clock offset of a time zone on a given date)", () => {
	test("Argentina is UTC-3 all year, with no daylight saving", () => {
		for (const [m, d] of [[1, 15], [6, 21], [12, 21]]) {
			expect(zoneUtcOffset("America/Argentina/Cordoba", 2026, m, d)).toBe(-3)
		}
	})

	test("Norway is UTC+1 in winter and UTC+2 in summer, switching on the last Sunday of March and October", () => {
		expect(zoneUtcOffset("Europe/Oslo", 2026, 1, 15)).toBe(1)
		expect(zoneUtcOffset("Europe/Oslo", 2026, 7, 15)).toBe(2)
		expect(zoneUtcOffset("Europe/Oslo", 2026, 3, 28)).toBe(1)
		expect(zoneUtcOffset("Europe/Oslo", 2026, 3, 30)).toBe(2)
		expect(zoneUtcOffset("Europe/Oslo", 2026, 10, 24)).toBe(2)
		expect(zoneUtcOffset("Europe/Oslo", 2026, 10, 26)).toBe(1)
	})

	test("fractional offsets come through (India is UTC+5:30)", () => {
		expect(zoneUtcOffset("Asia/Kolkata", 2026, 6, 1)).toBe(5.5)
	})

	test("UTC itself is 0, not -0 or NaN", () => {
		const offset = zoneUtcOffset("UTC", 2026, 6, 1)
		expect(Object.is(offset, 0)).toBe(true)
	})

	test("an unknown zone gives null, never a throw", () => {
		expect(zoneUtcOffset("Mars/Olympus_Mons", 2026, 6, 1)).toBeNull()
		expect(zoneUtcOffset("", 2026, 6, 1)).toBeNull()
	})
})

describe("findPlace", () => {
	test("finds a place by its exact coordinates, and nothing for custom ones", () => {
		expect(findPlace(PLACES[1].lat, PLACES[1].lon)?.id).toBe("noruega")
		expect(findPlace(CORDOBA.lat, CORDOBA.lon)?.id).toBe("cordoba")
		expect(findPlace(10, 20)).toBeUndefined()
	})
})

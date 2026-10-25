import { groupByDay } from "@/lib/movements/group-by-day"

const TZ = "America/Argentina/Cordoba"
// "now" for every test: Sunday 25 Oct 2026, 11:00 in Córdoba (14:00 UTC)
const NOW = new Date("2026-10-25T14:00:00Z")
const m = (id: string, createdAt: string) => ({ id, createdAt })

describe("groupByDay", () => {
	it("groups by day, newest day first, keeping the order inside each day", () => {
		const groups = groupByDay(
			[m("a", "2026-10-21T20:00:00Z"), m("b", "2026-10-25T13:00:00Z"), m("c", "2026-10-21T15:00:00Z"), m("d", "2026-10-25T12:00:00Z")],
			NOW,
			TZ,
		)
		expect(groups.map((g) => g.movements.map((x) => x.id))).toEqual([["b", "d"], ["a", "c"]])
	})

	it("uses the local day, not UTC: 22:30 in Argentina stays on its own day", () => {
		// 2026-10-22 22:30 ART is 2026-10-23 01:30 UTC
		const [group] = groupByDay([m("late", "2026-10-23T01:30:00Z")], NOW, TZ)
		expect(group.key).toBe("2026-10-22")
		expect(group.label).toBe("jueves 22 de octubre")
	})

	it("says Hoy and Ayer for those two days", () => {
		const groups = groupByDay([m("t", "2026-10-25T13:00:00Z"), m("y", "2026-10-24T13:00:00Z")], NOW, TZ)
		expect(groups.map((g) => g.label)).toEqual(["Hoy", "Ayer"])
	})

	it("finds Ayer by calendar day, also across a daylight-saving change", () => {
		// Berlin moved its clocks forward on 29 Mar 2026: that day had 23 hours.
		// 00:30 on the 30th minus 24h lands on the 28th; Ayer must still be the 29th.
		const now = new Date("2026-03-29T22:30:00Z") // 30 Mar 00:30 in Berlin
		const groups = groupByDay([m("y", "2026-03-29T10:00:00Z"), m("before", "2026-03-28T10:00:00Z")], now, "Europe/Berlin")
		expect(groups.map((g) => g.label)).toEqual(["Ayer", "sábado 28 de marzo"])
	})

	it("adds the year only for another year", () => {
		const groups = groupByDay([m("this", "2026-03-10T15:00:00Z"), m("last", "2025-12-31T15:00:00Z")], NOW, TZ)
		expect(groups.map((g) => g.label)).toEqual(["martes 10 de marzo", "miércoles 31 de diciembre de 2025"])
	})

	it("returns nothing for no movements", () => {
		expect(groupByDay([], NOW, TZ)).toEqual([])
	})
})

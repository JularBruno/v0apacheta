import { trailPoints } from "@/components/map-camino/use-map-trail"

const cairns = [
	{ x: 100, y: 300 },
	{ x: 400, y: 600 },
]

describe("trailPoints", () => {
	it("starts at the river when there is one, not at the top edge", () => {
		const pts = trailPoints(cairns, 1000, { x: 250, y: 120 })
		expect(pts[0]).toEqual({ x: 250, y: 120 })
		expect(pts[1]).toEqual(cairns[0])
	})

	it("without a start landmark, leads in from the top edge above the first cairn", () => {
		const pts = trailPoints(cairns, 1000)
		expect(pts[0]).toEqual({ x: 100, y: 0 })
		expect(pts[1]).toEqual(cairns[0])
	})

	it("always runs off the bottom edge below the last cairn", () => {
		expect(trailPoints(cairns, 1000).at(-1)).toEqual({ x: 400, y: 1000 })
		expect(trailPoints(cairns, 1000, { x: 250, y: 120 }).at(-1)).toEqual({ x: 400, y: 1000 })
	})
})

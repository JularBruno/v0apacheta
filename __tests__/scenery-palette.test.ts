import { readdirSync } from "node:fs"
import path from "node:path"
import sharp from "sharp"

// Trees and rocks set the map's ink. Bushes and the river were generated
// golden brown and recolored onto that ink (scripts/recolor-scenery.mjs); this
// keeps a re-sliced or regenerated sprite from bringing the gold back.
const SCENERY = path.join(__dirname, "..", "public", "scenery")
const files = (dir: string) => readdirSync(path.join(SCENERY, dir)).map((f) => `${dir}/${f}`)

/** Mean red-minus-blue of the opaque pixels: how warm (golden) a sprite reads. */
async function warmth(rel: string) {
	const { data } = await sharp(path.join(SCENERY, rel)).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
	let sum = 0
	let n = 0
	for (let i = 0; i < data.length; i += 4) {
		if (data[i + 3] <= 220) continue
		sum += data[i] - data[i + 2]
		n++
	}
	return sum / n
}

describe("map scenery palette", () => {
	let low = Infinity
	let high = -Infinity

	beforeAll(async () => {
		for (const rel of [...files("trees"), ...files("rocks")]) {
			const w = await warmth(rel)
			low = Math.min(low, w)
			high = Math.max(high, w)
		}
	})

	it.each([...files("bushes"), "milestones/river.webp"])("%s is as warm as the trees and rocks, not golden", async (rel) => {
		const w = await warmth(rel)
		expect(w).toBeGreaterThanOrEqual(low - 3)
		expect(w).toBeLessThanOrEqual(high + 3)
	})
})

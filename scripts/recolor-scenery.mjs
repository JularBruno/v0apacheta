#!/usr/bin/env node
/**
 * Recolor scenery sprites onto the trees' and rocks' ink, so every ground
 * feature on the map reads as one hand-drawn set.
 *
 * The bushes and the river milestone came out of generation golden brown;
 * trees and rocks are dark sepia ink on a greyer fill. For each sprite pixel
 * this keeps its own lightness and swaps its color for the average color the
 * trees and rocks have at that same lightness (a 256-step lookup table built
 * from public/scenery/trees and rocks). Alpha and size stay as they are.
 *
 * Reads the untouched originals from docs/design/scenery-originals/ (so a
 * rerun gives the same files) and writes public/scenery/.
 *
 * Usage: node scripts/recolor-scenery.mjs
 */
import sharp from "sharp"
import { readdirSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..")
const SCENERY = path.join(ROOT, "public", "scenery")
const ORIGINALS = path.join(ROOT, "docs", "design", "scenery-originals")
const TARGETS = [
	...readdirSync(path.join(ORIGINALS, "bushes")).map((f) => `bushes/${f}`),
	"milestones/river.webp",
]

const lum = (r, g, b) => Math.round(0.299 * r + 0.587 * g + 0.114 * b)

async function pixels(file) {
	const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
	return { data, info }
}

/** Average RGB of the reference sprites at each lightness 0..255. */
async function referenceTable() {
	const sum = Array.from({ length: 256 }, () => [0, 0, 0, 0])
	for (const dir of ["trees", "rocks"]) {
		for (const f of readdirSync(path.join(SCENERY, dir))) {
			const { data } = await pixels(path.join(SCENERY, dir, f))
			for (let i = 0; i < data.length; i += 4) {
				if (data[i + 3] <= 200) continue
				const s = sum[lum(data[i], data[i + 1], data[i + 2])]
				s[0] += data[i]
				s[1] += data[i + 1]
				s[2] += data[i + 2]
				s[3]++
			}
		}
	}
	const table = sum.map((s) => (s[3] > 20 ? s.slice(0, 3).map((v) => Math.round(v / s[3])) : null))
	// lightness steps the references never use take the nearest one that they do
	const known = table.flatMap((t, i) => (t ? [i] : []))
	return table.map((t, i) => t ?? table[known.reduce((a, b) => (Math.abs(b - i) < Math.abs(a - i) ? b : a))])
}

const table = await referenceTable()
for (const rel of TARGETS) {
	const { data, info } = await pixels(path.join(ORIGINALS, rel))
	for (let i = 0; i < data.length; i += 4) {
		const [r, g, b] = table[lum(data[i], data[i + 1], data[i + 2])]
		data[i] = r
		data[i + 1] = g
		data[i + 2] = b
	}
	await sharp(data, { raw: info }).webp({ quality: 90, alphaQuality: 100 }).toFile(path.join(SCENERY, rel))
	console.log("recolored", rel)
}

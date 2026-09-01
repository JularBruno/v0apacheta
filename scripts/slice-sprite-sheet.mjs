#!/usr/bin/env node
/**
 * Slice a grid sprite sheet (trees, rocks, ...) into individual transparent
 * WebP sprites. Keys out a near-uniform background color, decontaminates
 * fringe pixels, then tight-crops each grid cell to its content.
 *
 * Usage: node scripts/slice-sprite-sheet.mjs <input.png> <outDir> <cols> <rows> <prefix>
 */
import sharp from "sharp"
import { mkdirSync } from "node:fs"
import path from "node:path"

const [, , input, outDir, colsArg, rowsArg, prefix] = process.argv
if (!input || !outDir || !colsArg || !rowsArg || !prefix) {
	console.error("usage: slice-sprite-sheet.mjs <input.png> <outDir> <cols> <rows> <prefix>")
	process.exit(1)
}
const cols = Number(colsArg)
const rows = Number(rowsArg)

const LOW = 10 // distance below this: fully transparent
const HIGH = 34 // distance above this: fully opaque
const PAD = 14 // px padding kept around each trimmed sprite

mkdirSync(outDir, { recursive: true })

const { data, info } = await sharp(input).raw().toBuffer({ resolveWithObject: true })
const { width, height, channels } = info
if (channels !== 3 && channels !== 4) throw new Error(`unexpected channel count ${channels}`)

// sample the background color from the four corners
const at = (x, y) => {
	const i = (y * width + x) * channels
	return [data[i], data[i + 1], data[i + 2]]
}
const corners = [at(2, 2), at(width - 3, 2), at(2, height - 3), at(width - 3, height - 3)]
const bg = corners[0].map((_, c) => Math.round(corners.reduce((s, p) => s + p[c], 0) / corners.length))
console.log("background ~", bg)

const out = Buffer.alloc(width * height * 4)
for (let y = 0; y < height; y++) {
	for (let x = 0; x < width; x++) {
		const i = (y * width + x) * channels
		const o = (y * width + x) * 4
		const r = data[i], g = data[i + 1], b = data[i + 2]
		const dist = Math.sqrt((r - bg[0]) ** 2 + (g - bg[1]) ** 2 + (b - bg[2]) ** 2)
		let a = 0
		if (dist >= HIGH) a = 255
		else if (dist > LOW) a = Math.round(((dist - LOW) / (HIGH - LOW)) * 255)
		// decontaminate: push partially-transparent pixels' color away from bg
		let rr = r, gg = g, bb = b
		if (a > 0 && a < 255) {
			const f = 255 / a
			rr = Math.max(0, Math.min(255, Math.round(bg[0] + (r - bg[0]) * f)))
			gg = Math.max(0, Math.min(255, Math.round(bg[1] + (g - bg[1]) * f)))
			bb = Math.max(0, Math.min(255, Math.round(bg[2] + (b - bg[2]) * f)))
		}
		out[o] = rr
		out[o + 1] = gg
		out[o + 2] = bb
		out[o + 3] = a
	}
}

const keyed = sharp(out, { raw: { width, height, channels: 4 } })
const cellW = Math.floor(width / cols)
const cellH = Math.floor(height / rows)

let n = 0
for (let row = 0; row < rows; row++) {
	for (let col = 0; col < cols; col++) {
		n++
		const cx = col * cellW
		const cy = row * cellH
		// find tight bbox of non-transparent pixels within this cell
		let minX = cellW, minY = cellH, maxX = 0, maxY = 0, found = false
		for (let y = 0; y < cellH; y++) {
			for (let x = 0; x < cellW; x++) {
				const o = ((cy + y) * width + (cx + x)) * 4 + 3
				if (out[o] > 20) {
					found = true
					if (x < minX) minX = x
					if (x > maxX) maxX = x
					if (y < minY) minY = y
					if (y > maxY) maxY = y
				}
			}
		}
		if (!found) {
			console.log(`cell ${n}: empty, skipped`)
			continue
		}
		const left = Math.max(0, cx + minX - PAD)
		const top = Math.max(0, cy + minY - PAD)
		const w = Math.min(width - left, maxX - minX + 1 + PAD * 2)
		const h = Math.min(height - top, maxY - minY + 1 + PAD * 2)

		const outPath = path.join(outDir, `${prefix}-${n}.webp`)
		await sharp(out, { raw: { width, height, channels: 4 } })
			.extract({ left, top, width: w, height: h })
			.webp({ quality: 92, alphaQuality: 95 })
			.toFile(outPath)
		console.log(`cell ${n}: ${w}x${h} -> ${outPath}`)
	}
}

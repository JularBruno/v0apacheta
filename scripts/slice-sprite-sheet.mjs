#!/usr/bin/env node
/**
 * Slice a grid sprite sheet (trees, rocks, ...) into individual transparent
 * WebP sprites.
 *
 *  1. keys out the near-uniform background color (soft alpha ramp)
 *  2. decontaminates fringe pixels (un-mixes background bleed)
 *  3. per grid cell: keeps only the largest connected blob (drops stray
 *     leaf/rock fragments that bled in from neighbouring cells)
 *  4. tight-crops to that blob + padding, downscales for crisp small display
 *
 * Usage: node scripts/slice-sprite-sheet.mjs <input.png> <outDir> <cols> <rows> <prefix> [maxDim]
 */
import sharp from "sharp"
import { mkdirSync } from "node:fs"
import path from "node:path"

const [, , input, outDir, colsArg, rowsArg, prefix, maxDimArg] = process.argv
if (!input || !outDir || !colsArg || !rowsArg || !prefix) {
	console.error("usage: slice-sprite-sheet.mjs <input.png> <outDir> <cols> <rows> <prefix> [maxDim]")
	process.exit(1)
}
const cols = Number(colsArg)
const rows = Number(rowsArg)
const maxDim = Number(maxDimArg) || 220

const LOW = 10 // colour distance below this: fully transparent
const HIGH = 34 // above this: fully opaque
const PAD = 12 // px kept around the trimmed blob
const SOLID = 24 // alpha considered "part of a blob" for connectivity
const MIN_FRACTION = 0.04 // ignore blobs smaller than this share of the biggest

mkdirSync(outDir, { recursive: true })

const { data, info } = await sharp(input).raw().toBuffer({ resolveWithObject: true })
const { width, height, channels } = info
if (channels !== 3 && channels !== 4) throw new Error(`unexpected channel count ${channels}`)

const at = (x, y) => {
	const i = (y * width + x) * channels
	return [data[i], data[i + 1], data[i + 2]]
}
const corners = [at(2, 2), at(width - 3, 2), at(2, height - 3), at(width - 3, height - 3)]
const bg = corners[0].map((_, c) => Math.round(corners.reduce((s, p) => s + p[c], 0) / corners.length))
console.log("background ~", bg)

// full keyed RGBA
const rgba = Buffer.alloc(width * height * 4)
for (let p = 0; p < width * height; p++) {
	const s = p * channels
	const o = p * 4
	const r = data[s], g = data[s + 1], b = data[s + 2]
	const dist = Math.sqrt((r - bg[0]) ** 2 + (g - bg[1]) ** 2 + (b - bg[2]) ** 2)
	let a = dist >= HIGH ? 255 : dist <= LOW ? 0 : Math.round(((dist - LOW) / (HIGH - LOW)) * 255)
	let rr = r, gg = g, bb = b
	if (a > 0 && a < 255) {
		const f = 255 / a
		rr = Math.max(0, Math.min(255, Math.round(bg[0] + (r - bg[0]) * f)))
		gg = Math.max(0, Math.min(255, Math.round(bg[1] + (g - bg[1]) * f)))
		bb = Math.max(0, Math.min(255, Math.round(bg[2] + (b - bg[2]) * f)))
	}
	rgba[o] = rr
	rgba[o + 1] = gg
	rgba[o + 2] = bb
	rgba[o + 3] = a
}

const cellW = Math.floor(width / cols)
const cellH = Math.floor(height / rows)

/** Flood-fill connected components within a cell; return the largest one's pixel set + bbox. */
function largestBlob(cx, cy) {
	const seen = new Uint8Array(cellW * cellH)
	const solid = (lx, ly) => rgba[((cy + ly) * width + (cx + lx)) * 4 + 3] >= SOLID
	let best = null
	for (let sy = 0; sy < cellH; sy++) {
		for (let sx = 0; sx < cellW; sx++) {
			const idx = sy * cellW + sx
			if (seen[idx] || !solid(sx, sy)) continue
			// BFS
			const stack = [idx]
			seen[idx] = 1
			const pixels = []
			let minX = sx, minY = sy, maxX = sx, maxY = sy
			while (stack.length) {
				const cur = stack.pop()
				const px = cur % cellW
				const py = (cur - px) / cellW
				pixels.push(cur)
				if (px < minX) minX = px
				if (px > maxX) maxX = px
				if (py < minY) minY = py
				if (py > maxY) maxY = py
				for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
					const nx = px + dx
					const ny = py + dy
					if (nx < 0 || ny < 0 || nx >= cellW || ny >= cellH) continue
					const nidx = ny * cellW + nx
					if (seen[nidx] || !solid(nx, ny)) continue
					seen[nidx] = 1
					stack.push(nidx)
				}
			}
			if (!best || pixels.length > best.pixels.length) best = { pixels, minX, minY, maxX, maxY }
		}
	}
	return best
}

let n = 0
for (let row = 0; row < rows; row++) {
	for (let col = 0; col < cols; col++) {
		n++
		const cx = col * cellW
		const cy = row * cellH
		const blob = largestBlob(cx, cy)
		if (!blob) {
			console.log(`cell ${n}: empty, skipped`)
			continue
		}

		// build this cell's RGBA with everything outside the largest blob erased
		const keep = new Set(blob.pixels)
		const cellBuf = Buffer.alloc(cellW * cellH * 4)
		for (let ly = 0; ly < cellH; ly++) {
			for (let lx = 0; lx < cellW; lx++) {
				const src = ((cy + ly) * width + (cx + lx)) * 4
				const dst = (ly * cellW + lx) * 4
				const inBlob = keep.has(ly * cellW + lx)
				// keep soft edges immediately around the blob too (alpha < SOLID)
				const a = rgba[src + 3]
				const nearBlob =
					inBlob ||
					(a > 0 &&
						a < SOLID &&
						[[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => {
							const nx = lx + dx, ny = ly + dy
							return nx >= 0 && ny >= 0 && nx < cellW && ny < cellH && keep.has(ny * cellW + nx)
						}))
				cellBuf[dst] = rgba[src]
				cellBuf[dst + 1] = rgba[src + 1]
				cellBuf[dst + 2] = rgba[src + 2]
				cellBuf[dst + 3] = nearBlob ? a : 0
			}
		}

		const left = Math.max(0, blob.minX - PAD)
		const top = Math.max(0, blob.minY - PAD)
		const w = Math.min(cellW - left, blob.maxX - blob.minX + 1 + PAD * 2)
		const h = Math.min(cellH - top, blob.maxY - blob.minY + 1 + PAD * 2)

		const outPath = path.join(outDir, `${prefix}-${n}.webp`)
		await sharp(cellBuf, { raw: { width: cellW, height: cellH, channels: 4 } })
			.extract({ left, top, width: w, height: h })
			.resize({ width: Math.min(w, maxDim), height: Math.min(h, maxDim), fit: "inside", withoutEnlargement: true, kernel: "lanczos3" })
			.webp({ quality: 90, alphaQuality: 100 })
			.toFile(outPath)
		const meta = await sharp(outPath).metadata()
		console.log(`cell ${n}: ${meta.width}x${meta.height} -> ${outPath}`)
	}
}

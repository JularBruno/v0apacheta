#!/usr/bin/env node
/**
 * Rebuild the PWA launcher icons from the transparent cairn
 * (public/icon-512x512.png), all on the app's light background, so the
 * Android splash screen and the home-screen icons show no lighter or greyer
 * square around the cairn.
 *
 *  - iconwbg-512x512.png / iconwbg-192x192.png: manifest "any" icons, cairn
 *    where the source has it
 *  - iconwbg-maskable-512x512.png: manifest "maskable" icon, cairn shrunk into
 *    the center safe zone (Android crops it to a circle or squircle)
 *  - apple-touch-icon.png: 180x180 for iOS, whole cairn centered with margin
 *
 * BACKGROUND must match --background (178 15% 97%) in app/globals.css and
 * background_color in app/manifest.ts.
 *
 * Usage: node scripts/gen-pwa-icons.mjs
 */
import sharp from "sharp"
import path from "node:path"
import { fileURLToPath } from "node:url"

const BACKGROUND = "#f6f8f8"
const PUBLIC = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public")
const SOURCE = path.join(PUBLIC, "icon-512x512.png")
const out = (name) => path.join(PUBLIC, name)

/** The cairn cropped to its own bounds (transparent around it). */
async function cairn() {
	const { info } = await sharp(SOURCE).trim({ threshold: 1 }).toBuffer({ resolveWithObject: true })
	const buffer = await sharp(SOURCE).trim({ threshold: 1 }).png().toBuffer()
	return { buffer, width: info.width, height: info.height }
}

/** Cairn scaled to fit `box` px, centered on a size×size background. */
async function centered(size, box) {
	const c = await cairn()
	const scale = Math.min(box / c.width, box / c.height)
	const w = Math.round(c.width * scale)
	const h = Math.round(c.height * scale)
	const resized = await sharp(c.buffer).resize(w, h).png().toBuffer()
	return sharp({ create: { width: size, height: size, channels: 4, background: BACKGROUND } })
		.composite([{ input: resized, left: Math.round((size - w) / 2), top: Math.round((size - h) / 2) }])
		.flatten({ background: BACKGROUND })
}

const any512 = await sharp(SOURCE).flatten({ background: BACKGROUND }).png().toBuffer()
await sharp(any512).toFile(out("iconwbg-512x512.png"))
await sharp(any512).resize(192, 192).toFile(out("iconwbg-192x192.png"))

// Maskable safe zone: a circle of radius 40% of the icon. The cairn is a
// triangle with empty corners, so a 0.62×size box keeps every stroke inside
// (__tests__/pwa-manifest.test.ts checks it).
await (await centered(512, Math.round(512 * 0.62))).png().toFile(out("iconwbg-maskable-512x512.png"))

await (await centered(180, 144)).png().toFile(out("apple-touch-icon.png"))

console.log("PWA icons written to", PUBLIC)

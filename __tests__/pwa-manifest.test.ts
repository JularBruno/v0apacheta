import { existsSync } from "node:fs"
import path from "node:path"
import sharp from "sharp"
import manifest from "@/app/manifest"

// The app's light --background (178 15% 97%). The splash screen and every
// launcher icon sit on it, so no lighter or greyer square shows around the cairn.
const APP_BACKGROUND = "#f6f8f8"
const PUBLIC = path.join(__dirname, "..", "public")

async function grey(file: string) {
	return sharp(path.join(PUBLIC, file)).greyscale().raw().toBuffer({ resolveWithObject: true })
}

async function cornerHex(file: string) {
	const { data } = await sharp(path.join(PUBLIC, file)).ensureAlpha().extract({ left: 0, top: 0, width: 1, height: 1 }).raw().toBuffer({ resolveWithObject: true })
	expect(data[3]).toBe(255)
	return "#" + [data[0], data[1], data[2]].map((v) => v.toString(16).padStart(2, "0")).join("")
}

describe("PWA manifest and launcher icons", () => {
	const m = manifest()

	it("starts on the app's own background color", () => {
		expect(m.background_color).toBe(APP_BACKGROUND)
	})

	it("lists only icon files that exist", () => {
		for (const icon of m.icons ?? []) expect(existsSync(path.join(PUBLIC, icon.src))).toBe(true)
	})

	it("has a maskable icon besides the regular ones", () => {
		const purposes = (m.icons ?? []).map((i) => i.purpose)
		expect(purposes).toContain("maskable")
		expect(purposes).toContain("any")
	})

	it.each(["iconwbg-192x192.png", "iconwbg-512x512.png", "iconwbg-maskable-512x512.png", "apple-touch-icon.png"])(
		"%s sits on the app background",
		async (file) => {
			expect(await cornerHex(file)).toBe(APP_BACKGROUND)
		},
	)

	it("keeps the whole cairn inside apple-touch-icon.png (not cropped)", async () => {
		const { data, info } = await grey("apple-touch-icon.png")
		const dark = (x: number, y: number) => data[y * info.width + x] < 128
		for (let i = 0; i < info.width; i++) {
			for (const [x, y] of [[i, 0], [i, info.height - 1], [0, i], [info.width - 1, i]]) expect(dark(x, y)).toBe(false)
		}
	})

	it("keeps the cairn inside the maskable safe zone (center circle, 40% radius)", async () => {
		const { data, info } = await grey("iconwbg-maskable-512x512.png")
		const c = info.width / 2
		let outside = 0
		for (let y = 0; y < info.height; y++)
			for (let x = 0; x < info.width; x++)
				if (data[y * info.width + x] < 128 && Math.hypot(x - c, y - c) > info.width * 0.4) outside++
		expect(outside).toBe(0)
	})
})

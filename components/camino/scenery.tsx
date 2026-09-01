"use client"

import { useEffect, useMemo, useRef, useState, type RefObject } from "react"
import type { TrailGeometry } from "./use-trail"
import styles from "./camino.module.css"

/**
 * Procedural scenery layered over the ground texture — hand-drawn espinillo
 * tree and granite-boulder sprites, scattered along the trail and through every
 * empty margin (behind the hero and the summit too). Seeded so it stays put;
 * two parallax layers behind all content. Placement clears the hero, the
 * summit, every cairn and every card.
 *
 * Small ground detail (pebbles, grass, contour lines) lives in the tiling
 * ground texture, not here.
 */

const SEED = 20260613

type Sprite = { x: number; y: number; s: number; r: number }
type Rect = { x: number; y: number; w: number; h: number }
type Point = { x: number; y: number }

interface Layout {
	width: number
	height: number
	trail: Point[]
	cairns: Point[]
	clears: Rect[]
}

function mulberry32(seed: number) {
	let a = seed >>> 0
	return () => {
		a = (a + 0x6d2b79f5) | 0
		let t = Math.imul(a ^ (a >>> 15), 1 | a)
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296
	}
}

interface Scene {
	trees: Sprite[]
	rocks: Sprite[]
}

function generate({ width: W, height: H, trail: TP, cairns, clears }: Layout): Scene {
	const rnd = mulberry32(SEED)
	const rand = (a: number, b: number) => a + rnd() * (b - a)

	const blocked = (x: number, y: number, pad: number) => {
		for (const c of cairns) if (Math.hypot(c.x - x, c.y - y) < pad + 34) return true
		for (const r of clears) {
			if (x > r.x - pad && x < r.x + r.w + pad && y > r.y - pad && y < r.y + r.h + pad) return true
		}
		return false
	}

	function alongTrail(count: number, near: number, far: number, pad: number): Sprite[] {
		const out: Sprite[] = []
		for (let tries = 0; out.length < count && tries < count * 12; tries++) {
			const i = 1 + Math.floor(rnd() * (TP.length - 2))
			const p = TP[i]
			const a = TP[i - 1]
			const b = TP[i + 1]
			let nx = -(b.y - a.y)
			let ny = b.x - a.x
			const nl = Math.hypot(nx, ny) || 1
			nx /= nl
			ny /= nl
			const off = rand(near, far) * (rnd() < 0.5 ? 1 : -1)
			const x = p.x + nx * off + rand(-14, 14)
			const y = p.y + ny * off + rand(-14, 14)
			if (x < 12 || x > W - 12 || y < 24 || y > H - 24) continue
			if (blocked(x, y, pad)) continue
			out.push({ x, y, s: rand(0.7, 1.3), r: rnd() })
		}
		return out
	}

	function fill(count: number, pad: number): Sprite[] {
		const out: Sprite[] = []
		for (let tries = 0; out.length < count && tries < count * 14; tries++) {
			const x = rand(10, W - 10)
			const y = rand(24, H - 24)
			if (blocked(x, y, pad)) continue
			out.push({ x, y, s: rand(0.75, 1.4), r: rnd() })
		}
		return out
	}

	const d = Math.min(3, Math.max(1, H / 1400)) // density scales with page height
	return {
		trees: [...alongTrail(Math.round(7 * d), 58, 158, 46), ...fill(Math.round(6 * d), 42)],
		rocks: [...alongTrail(Math.round(5 * d), 40, 140, 34), ...fill(Math.round(5 * d), 32)],
	}
}

// Hand-drawn espinillo/algarrobo sprites, sliced from a generated sheet — see
// scripts/slice-sprite-sheet.mjs. Sizes are each sprite's trimmed pixel bbox,
// used to keep its aspect ratio when scaled.
const TREE_SPRITES = [
	{ src: "/scenery/trees/tree-1.webp", w: 240, h: 178 },
	{ src: "/scenery/trees/tree-2.webp", w: 240, h: 232 },
	{ src: "/scenery/trees/tree-3.webp", w: 240, h: 209 },
	{ src: "/scenery/trees/tree-4.webp", w: 195, h: 240 },
	{ src: "/scenery/trees/tree-5.webp", w: 240, h: 190 },
	{ src: "/scenery/trees/tree-6.webp", w: 217, h: 240 },
	{ src: "/scenery/trees/tree-7.webp", w: 240, h: 204 },
	{ src: "/scenery/trees/tree-8.webp", w: 240, h: 199 },
]

const ROCK_SPRITES = [
	{ src: "/scenery/rocks/rock-1.webp", w: 240, h: 160 },
	{ src: "/scenery/rocks/rock-2.webp", w: 240, h: 146 },
	{ src: "/scenery/rocks/rock-3.webp", w: 240, h: 156 },
	{ src: "/scenery/rocks/rock-4.webp", w: 240, h: 152 },
	{ src: "/scenery/rocks/rock-5.webp", w: 240, h: 131 },
	{ src: "/scenery/rocks/rock-6.webp", w: 240, h: 181 },
	{ src: "/scenery/rocks/rock-7.webp", w: 240, h: 155 },
	{ src: "/scenery/rocks/rock-8.webp", w: 240, h: 156 },
]

/** A hand-drawn sprite, bottom-centre anchored on its placement point. */
function Sprite2D({ set, base, x, y, s, r }: { set: typeof TREE_SPRITES; base: number } & Sprite) {
	const sprite = set[Math.min(set.length - 1, Math.floor(r * set.length))]
	const h = base * s
	const w = h * (sprite.w / sprite.h)
	return (
		<image
			href={sprite.src}
			x={(x - w / 2).toFixed(1)}
			y={(y - h).toFixed(1)}
			width={w.toFixed(1)}
			height={h.toFixed(1)}
			preserveAspectRatio="xMidYMax meet"
		/>
	)
}

// trees read a step bigger than the ~62px cairns; rock clusters sit low and wide
const Tree = (p: Sprite) => <Sprite2D set={TREE_SPRITES} base={92} {...p} />
const Rock = (p: Sprite) => <Sprite2D set={ROCK_SPRITES} base={58} {...p} />

export default function Scenery({
	pageRef,
	geometry,
}: {
	pageRef: RefObject<HTMLDivElement | null>
	geometry: TrailGeometry | null
}) {
	const backRef = useRef<SVGSVGElement>(null)
	const frontRef = useRef<SVGSVGElement>(null)
	const [layout, setLayout] = useState<Layout | null>(null)

	// measure the whole page once the trail geometry is known
	useEffect(() => {
		const page = pageRef.current
		if (!page || !geometry) return

		const measure = () => {
			const pr = page.getBoundingClientRect()
			const toLocal = (el: Element): Rect => {
				const r = el.getBoundingClientRect()
				return { x: r.left - pr.left, y: r.top - pr.top, w: r.width, h: r.height }
			}
			const trailEl = page.querySelector("[data-trail]")
			const trailTop = trailEl ? trailEl.getBoundingClientRect().top - pr.top : 0

			setLayout({
				width: page.clientWidth,
				height: page.offsetHeight,
				trail: geometry.trailPoints.map((p) => ({ x: p.x, y: p.y + trailTop })),
				cairns: geometry.cairns.map((c) => ({ x: c.x, y: c.y + trailTop })),
				clears: Array.from(page.querySelectorAll("[data-clear],[data-card]")).map(toLocal),
			})
		}

		measure()
		// cards fade/settle after mount — re-measure once more
		const t = window.setTimeout(measure, 400)
		return () => window.clearTimeout(t)
	}, [pageRef, geometry])

	const scene = useMemo(() => (layout ? generate(layout) : null), [layout])

	// parallax
	useEffect(() => {
		const back = backRef.current
		const front = frontRef.current
		const host = back?.parentElement
		if (!back || !front || !host) return
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

		let raf = 0
		const apply = () => {
			raf = 0
			const p = -host.getBoundingClientRect().top
			back.style.transform = `translate3d(0, ${(p * 0.05).toFixed(1)}px, 0)`
			front.style.transform = `translate3d(0, ${(p * 0.12).toFixed(1)}px, 0)`
		}
		const onScroll = () => {
			if (!raf) raf = requestAnimationFrame(apply)
		}
		apply()
		window.addEventListener("scroll", onScroll, { passive: true })
		return () => {
			window.removeEventListener("scroll", onScroll)
			if (raf) cancelAnimationFrame(raf)
		}
	}, [scene])

	if (!layout || !scene) return null
	const vb = `0 0 ${layout.width} ${layout.height}`

	// smaller trees sit further back (less parallax); bigger ones nearer (more).
	// rock clusters are ground features — all in the back layer.
	const sorted = [...scene.trees].sort((a, b) => a.s - b.s)
	const mid = Math.ceil(sorted.length / 2)

	return (
		<>
			<svg ref={backRef} className={styles.sceneryBack} viewBox={vb} aria-hidden="true">
				{scene.rocks.map((rk, i) => (
					<Rock key={`rk${i}`} {...rk} />
				))}
				{sorted.slice(0, mid).map((t, i) => (
					<Tree key={`tb${i}`} {...t} />
				))}
			</svg>

			<svg ref={frontRef} className={styles.sceneryFront} viewBox={vb} aria-hidden="true">
				{sorted.slice(mid).map((t, i) => (
					<Tree key={`tf${i}`} {...t} />
				))}
			</svg>
		</>
	)
}

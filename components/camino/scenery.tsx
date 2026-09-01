"use client"

import { useEffect, useMemo, useRef, useState, type RefObject } from "react"
import type { TrailGeometry } from "./use-trail"
import styles from "./camino.module.css"

/**
 * Procedural hand-drawn scenery for the whole page — rocks, espinillo trees,
 * scrub and the Río Suquía, scattered along the trail and through every empty
 * margin (behind the hero and the summit too). Seeded so it stays put; two
 * parallax layers behind all content. Placement clears the hero, the summit,
 * every cairn and every card.
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
	river: string
	trees: Sprite[]
	rocks: Sprite[]
	scrub: Sprite[]
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

	// Río Suquía — a soft wobble down the left edge, full page height
	const rx = W * 0.05
	let river = `M ${rx.toFixed(0)} -14`
	const segs = Math.max(6, Math.round(H / 320))
	for (let i = 1; i <= segs; i++) {
		const y = -14 + ((H + 28) * i) / segs
		const cx = rx + Math.sin(i * 1.4 + rnd()) * W * 0.035
		const ex = rx + Math.sin(i * 1.9) * W * 0.024
		river += ` S ${cx.toFixed(0)} ${(y - (H + 28) / segs / 2).toFixed(0)}, ${ex.toFixed(0)} ${y.toFixed(0)}`
	}

	const d = Math.min(3, Math.max(1, H / 1400)) // density scales with page height
	return {
		river,
		trees: [...alongTrail(Math.round(7 * d), 58, 150, 44), ...fill(Math.round(6 * d), 40)],
		rocks: [...alongTrail(Math.round(9 * d), 30, 128, 28), ...fill(Math.round(7 * d), 30)],
		scrub: [...alongTrail(Math.round(12 * d), 22, 118, 16), ...fill(Math.round(10 * d), 20)],
	}
}

function Rock({ x, y, s, r }: Sprite) {
	return (
		<g
			transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${(s * (0.85 + r * 0.5)).toFixed(2)})`}
			fill="none"
			stroke="var(--map-rock)"
			strokeWidth="1.2"
			strokeLinejoin="round"
		>
			<path d="M -18,7 C -16,-3 -6,-9 4,-5 C 13,-1 15,7 10,13 C 4,20 -15,17 -18,9 Z" />
			<path d="M -3,-6 C -1,-15 9,-18 17,-15 C 25,-11 25,-3 19,1 C 13,6 -3,3 -3,-3 Z" />
			<line x1="-9" y1="6" x2="-7" y2="11" strokeWidth="0.7" stroke="var(--map-rock-highlight)" />
		</g>
	)
}

// Hand-drawn espinillo/algarrobo sprites, sliced from a generated sheet — see
// scripts/slice-sprite-sheet.mjs. Sizes are each sprite's trimmed pixel bbox,
// used to keep its aspect ratio when scaled.
const TREE_SPRITES = [
	{ src: "/scenery/trees/tree-1.webp", w: 390, h: 286 },
	{ src: "/scenery/trees/tree-2.webp", w: 412, h: 272 },
	{ src: "/scenery/trees/tree-3.webp", w: 412, h: 338 },
	{ src: "/scenery/trees/tree-4.webp", w: 379, h: 354 },
	{ src: "/scenery/trees/tree-5.webp", w: 347, h: 273 },
	{ src: "/scenery/trees/tree-6.webp", w: 412, h: 299 },
	{ src: "/scenery/trees/tree-7.webp", w: 377, h: 322 },
	{ src: "/scenery/trees/tree-8.webp", w: 343, h: 288 },
]

function Tree({ x, y, s, r }: Sprite) {
	const sprite = TREE_SPRITES[Math.min(TREE_SPRITES.length - 1, Math.floor(r * TREE_SPRITES.length))]
	const h = 54 * s
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

function Scrub({ x, y, s }: Sprite) {
	return (
		<g
			transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${s.toFixed(2)})`}
			stroke="var(--map-scrub)"
			strokeWidth="1.1"
			fill="none"
			strokeLinecap="round"
		>
			<path d="M 0,0 C -2,-8 -4,-13 -3,-18" />
			<path d="M 4,0 C 5,-9 3,-14 4,-19" />
			<path d="M 9,-1 C 11,-8 10,-12 12,-16" />
			<path d="M -5,-1 C -8,-7 -7,-11 -9,-15" />
		</g>
	)
}

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
			back.style.transform = `translate3d(0, ${(p * 0.08).toFixed(1)}px, 0)`
			front.style.transform = `translate3d(0, ${(p * 0.15).toFixed(1)}px, 0)`
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

	return (
		<>
			<svg ref={backRef} className={styles.sceneryBack} viewBox={vb} aria-hidden="true">
				<path d={scene.river} fill="none" stroke="var(--map-river)" strokeWidth="5" strokeLinecap="round" opacity="0.4" />
				<path
					d={scene.river}
					fill="none"
					stroke="var(--map-river-light)"
					strokeWidth="1.6"
					strokeLinecap="round"
					opacity="0.35"
				/>
				{scene.rocks.map((r, i) => (
					<Rock key={`r${i}`} {...r} />
				))}
				{scene.trees.map((t, i) => (
					<Tree key={`t${i}`} {...t} />
				))}
			</svg>

			<svg ref={frontRef} className={styles.sceneryFront} viewBox={vb} aria-hidden="true">
				{scene.scrub.map((sp, i) => (
					<Scrub key={`s${i}`} {...sp} />
				))}
			</svg>
		</>
	)
}

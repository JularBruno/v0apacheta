"use client"

import { useEffect, useMemo, useRef } from "react"
import type { TrailGeometry } from "./use-trail"
import styles from "./camino.module.css"

/**
 * Procedural hand-drawn scenery for the trail — rocks, espinillo trees, scrub
 * and the Río Suquía, scattered along the path and through the empty margins.
 * Seeded so it stays put across renders; two parallax layers (behind and in
 * front of the trail line). Placement clears the cairns and their cards.
 */

const SEED = 20260613

type Sprite = { x: number; y: number; s: number; r: number }

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
	ridge: string
	trees: Sprite[]
	rocks: Sprite[]
	scrub: Sprite[]
}

function generate(g: TrailGeometry): Scene {
	const { width: W, height: H, trailPoints: TP, cairns } = g
	const rnd = mulberry32(SEED)
	const rand = (a: number, b: number) => a + rnd() * (b - a)

	// keep clear of each cairn and the card that floats beside it
	const blocked = (x: number, y: number, pad: number) =>
		cairns.some((c) => {
			if (Math.hypot(c.x - x, c.y - y) < pad + 30) return true
			if (Math.abs(y - c.y) > 130) return false
			return c.side === "left" ? x > c.x - 24 && x < c.x + 360 : x < c.x + 24 && x > c.x - 360
		})

	// scatter near the trail: pick a sampled point, step perpendicular to it
	function alongTrail(count: number, near: number, far: number, pad: number): Sprite[] {
		const out: Sprite[] = []
		for (let tries = 0; out.length < count && tries < count * 10; tries++) {
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
			if (x < 10 || x > W - 10 || y < -40 || y > H + 40) continue
			if (blocked(x, y, pad)) continue
			out.push({ x, y, s: rand(0.7, 1.3), r: rnd() })
		}
		return out
	}

	// fill the outer gutters
	function margins(count: number, pad: number): Sprite[] {
		const out: Sprite[] = []
		for (let tries = 0; out.length < count && tries < count * 10; tries++) {
			const left = rnd() < 0.5
			const x = left ? rand(6, W * 0.16) : rand(W * 0.84, W - 6)
			const y = rand(20, H - 20)
			if (blocked(x, y, pad)) continue
			out.push({ x, y, s: rand(0.75, 1.35), r: rnd() })
		}
		return out
	}

	// Río Suquía — a soft wobble down the left edge
	const rx = W * 0.055
	let river = `M ${rx.toFixed(0)} -12`
	const segs = 8
	for (let i = 1; i <= segs; i++) {
		const y = -12 + ((H + 24) * i) / segs
		const cx = rx + Math.sin(i * 1.4 + rnd()) * W * 0.03
		const ex = rx + Math.sin(i * 1.9) * W * 0.02
		river += ` S ${cx.toFixed(0)} ${(y - (H + 24) / segs / 2).toFixed(0)}, ${ex.toFixed(0)} ${y.toFixed(0)}`
	}

	// ridge silhouette near the top
	let ridge = `M -10 74`
	for (let x = 0; x <= W + 20; x += W / 9) {
		ridge += ` L ${x.toFixed(0)} ${(38 + rnd() * 34).toFixed(0)}`
	}
	ridge += ` L ${W + 20} 0 L -10 0 Z`

	return {
		river,
		ridge,
		trees: [...alongTrail(9, 58, 150, 44), ...margins(5, 30)],
		rocks: [...alongTrail(11, 30, 122, 28), ...margins(6, 24)],
		scrub: [...alongTrail(15, 24, 110, 16), ...margins(8, 14)],
	}
}

function Rock({ x, y, s, r }: Sprite) {
	return (
		<g
			transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${(s * (0.85 + r * 0.4)).toFixed(2)})`}
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

function Tree({ x, y, s, r }: Sprite) {
	return (
		<g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${(s * (0.9 + r * 0.3)).toFixed(2)})`}>
			<line x1="0" y1="0" x2={(r * 3 - 1.5).toFixed(1)} y2="-15" stroke="var(--map-rock)" strokeWidth="1.7" strokeLinecap="round" />
			<path
				d="M -17,-15 C -15,-24 15,-24 17,-15 C 22,-14 22,-9 13,-9 L -13,-9 C -22,-9 -22,-14 -17,-15 Z"
				fill="none"
				stroke="var(--map-foliage)"
				strokeWidth="1.5"
				strokeLinejoin="round"
			/>
			<path d="M -11,-14 C -6,-18 6,-18 11,-14" fill="none" stroke="var(--map-foliage)" strokeWidth="1" opacity="0.65" />
		</g>
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

export default function Scenery({ geometry }: { geometry: TrailGeometry | null }) {
	const backRef = useRef<SVGSVGElement>(null)
	const frontRef = useRef<SVGSVGElement>(null)

	const scene = useMemo(() => (geometry ? generate(geometry) : null), [geometry])

	useEffect(() => {
		const back = backRef.current
		const front = frontRef.current
		if (!back || !front) return
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

		const host = back.parentElement
		if (!host) return

		let raf = 0
		const apply = () => {
			raf = 0
			const p = -host.getBoundingClientRect().top
			back.style.transform = `translate3d(0, ${(p * 0.08).toFixed(1)}px, 0)`
			front.style.transform = `translate3d(0, ${(-p * 0.05).toFixed(1)}px, 0)`
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

	if (!geometry || !scene) return null
	const vb = `0 0 ${geometry.width} ${geometry.height}`

	return (
		<>
			<svg ref={backRef} className={styles.sceneryBack} viewBox={vb} aria-hidden="true">
				<path d={scene.ridge} fill="var(--map-ridge)" opacity="0.2" />
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
				{scene.scrub.map((s, i) => (
					<Scrub key={`s${i}`} {...s} />
				))}
			</svg>
		</>
	)
}
